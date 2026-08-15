import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { StorageService } from '../storage/storage.service';
import { PDFExtractorService } from './parsers/pdf-extractor.service';
import { OKFService } from '../okf/okf.service';
import { OKFValidator } from '../okf/okf.validator';
import { ChunkerService } from './processors/chunker.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { DocumentStatus, IngestionStage } from '@prisma/client';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly pdfExtractor: PDFExtractorService,
    private readonly okfService: OKFService,
    private readonly okfValidator: OKFValidator,
    private readonly chunkerService: ChunkerService,
    private readonly embeddingsService: EmbeddingsService,
  ) {}

  async processDocument(documentId: string): Promise<void> {
    this.logger.log(`Starting ingestion pipeline for Document ID: ${documentId}`);

    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      throw new Error(`Document ${documentId} not found`);
    }

    const job = await this.prisma.ingestionJob.create({
      data: {
        documentId,
        stage: IngestionStage.EXTRACTING,
        progress: 10,
      },
    });

    try {
      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: DocumentStatus.PROCESSING, errorMessage: null },
      });

      // 1. Fetch file from storage
      const pdfBuffer = await this.storageService.getFileBuffer(doc.storageKey);

      // 2. Extract PDF text, pages, headings
      const pdfData = await this.pdfExtractor.extractPDF(pdfBuffer);

      await this.prisma.document.update({
        where: { id: documentId },
        data: { pageCount: pdfData.pageCount },
      });

      await this.updateJob(job.id, IngestionStage.OKF_TRANSFORMING, 30);

      // 3. Create OKF Knowledge Bundle & Validate
      const okfBundle = await this.okfService.createBundleFromSections(
        doc.id,
        doc.name,
        pdfData.sections,
      );

      await this.updateJob(job.id, IngestionStage.OKF_VALIDATING, 45);
      const validation = this.okfValidator.validate(okfBundle);
      if (!validation.valid) {
        throw new Error(`OKF Validation failed: ${validation.errors.join('; ')}`);
      }

      // 4. Save DB Sections
      await this.prisma.documentSection.deleteMany({ where: { documentId } });

      const sectionIdMap: Record<string, string> = {};
      for (let idx = 0; idx < pdfData.sections.length; idx++) {
        const sec = pdfData.sections[idx];
        const createdSec = await this.prisma.documentSection.create({
          data: {
            documentId,
            title: sec.title,
            sectionIndex: idx,
            pageStart: sec.pageStart,
            pageEnd: sec.pageEnd,
            content: sec.content,
          },
        });
        sectionIdMap[sec.title] = createdSec.id;
      }

      await this.updateJob(job.id, IngestionStage.CHUNKING, 60);

      // 5. Chunking & Embeddings
      const chunks = this.chunkerService.createChunks(
        documentId,
        pdfData.pages,
        pdfData.sections,
        sectionIdMap,
      );

      await this.updateJob(job.id, IngestionStage.EMBEDDING, 75);
      const chunkTexts = chunks.map((c) => c.content);
      const embeddings = await this.embeddingsService.generateBatchEmbeddings(chunkTexts);

      await this.updateJob(job.id, IngestionStage.INDEXING, 90);

      // 6. Delete old chunks and store vector chunks
      await this.prisma.documentChunk.deleteMany({ where: { documentId } });

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const vector = embeddings[i];
        const vectorSql = `[${vector.join(',')}]`;

        await this.prisma.$executeRawUnsafe(
          `INSERT INTO "DocumentChunk" (
            "id", "documentId", "sectionId", "content", "pageNumber", "chunkIndex", "tokenCount", "embedding", "metadata", "createdAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7::vector, $8::jsonb, NOW()
          )`,
          chunk.documentId,
          chunk.sectionId || null,
          chunk.content,
          chunk.pageNumber,
          chunk.chunkIndex,
          chunk.tokenCount,
          vectorSql,
          JSON.stringify({ sourceType: 'pdf', sectionTitle: chunk.sectionTitle }),
        );
      }

      // Mark Document READY
      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: DocumentStatus.READY, errorMessage: null },
      });

      await this.updateJob(job.id, IngestionStage.COMPLETED, 100);
      this.logger.log(`Document ${documentId} successfully processed and indexed!`);
    } catch (err: any) {
      this.logger.error(`Document processing failed for ${documentId}: ${err.message}`, err.stack);

      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: DocumentStatus.FAILED, errorMessage: err.message },
      });

      await this.prisma.ingestionJob.update({
        where: { id: job.id },
        data: { stage: IngestionStage.FAILED, progress: 0, errorMessage: err.message },
      });

      throw err;
    }
  }

  private async updateJob(jobId: string, stage: IngestionStage, progress: number) {
    await this.prisma.ingestionJob.update({
      where: { id: jobId },
      data: { stage, progress },
    });
  }
}
