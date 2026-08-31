import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../database/prisma.service';
import { StorageService } from '../storage/storage.service';
import { IngestionService } from '../ingestion/ingestion.service';
import { DocumentStatus } from '@prisma/client';
import * as crypto from 'crypto';
import { LLMService } from '../ai/llm.service';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly ingestionService: IngestionService,
    private readonly llmService: LLMService,
    @InjectQueue('pdf-ingestion') private readonly pdfQueue: Queue,
  ) {}

  async uploadDocument(
    file: Express.Multer.File,
    organizationId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No PDF file provided');
    }

    if (file.mimetype !== 'application/pdf' && !file.originalname.endsWith('.pdf')) {
      throw new BadRequestException('Only PDF files are supported');
    }

    const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');

    // Deduplication Check (Section 36)
    const existingDoc = await this.prisma.document.findFirst({
      where: { organizationId, checksum },
    });

    if (existingDoc) {
      this.logger.log(`Duplicate PDF checksum detected (${checksum}) for Org ${organizationId}. Returning existing document.`);
      return existingDoc;
    }

    // Store PDF file
    const storageKey = await this.storageService.uploadFile(
      file.originalname,
      file.buffer,
      organizationId,
    );

    // Create DB Document Record
    const document = await this.prisma.document.create({
      data: {
        organizationId,
        name: file.originalname.replace(/\.pdf$/i, ''),
        filename: file.originalname,
        mimeType: 'application/pdf',
        fileSize: file.size,
        storageKey,
        checksum,
        status: DocumentStatus.UPLOADING,
      },
    });

    // Queue Async BullMQ Ingestion Job
    try {
      await this.pdfQueue.add('process-pdf', { documentId: document.id });
    } catch {
      // Fallback: If Redis is offline in dev, process in background promise
      setImmediate(() => {
        this.ingestionService.processDocument(document.id).catch((err) => {
          this.logger.error(`Fallback background ingestion failed: ${err.message}`);
        });
      });
    }

    return document;
  }

  async getDocuments(organizationId: string, search?: string, status?: string) {
    const where: any = { organizationId };

    if (status) {
      where.status = status as DocumentStatus;
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    return this.prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { sections: true, chunks: true },
        },
      },
    });
  }

  async getDocumentById(documentId: string, organizationId: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id: documentId, organizationId },
      include: {
        sections: { orderBy: { sectionIndex: 'asc' } },
        ingestionJobs: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!doc) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    return doc;
  }

  async getDocumentChunks(documentId: string, organizationId: string) {
    await this.getDocumentById(documentId, organizationId);

    return this.prisma.documentChunk.findMany({
      where: { documentId },
      orderBy: { chunkIndex: 'asc' },
      select: {
        id: true,
        documentId: true,
        sectionId: true,
        content: true,
        pageNumber: true,
        chunkIndex: true,
        tokenCount: true,
        metadata: true,
      },
    });
  }

  async reprocessDocument(documentId: string, organizationId: string) {
    const doc = await this.getDocumentById(documentId, organizationId);

    await this.prisma.document.update({
      where: { id: doc.id },
      data: { status: DocumentStatus.PROCESSING, errorMessage: null },
    });

    try {
      await this.pdfQueue.add('process-pdf', { documentId: doc.id });
    } catch {
      setImmediate(() => {
        this.ingestionService.processDocument(doc.id).catch((err) => {
          this.logger.error(`Reprocess background ingestion failed: ${err.message}`);
        });
      });
    }

    return { message: 'Reprocessing triggered successfully' };
  }

  async deleteDocument(documentId: string, organizationId: string) {
    const doc = await this.getDocumentById(documentId, organizationId);

    await this.storageService.deleteFile(doc.storageKey);
    await this.prisma.document.delete({ where: { id: doc.id } });

    return { message: 'Document deleted successfully' };
  }

  async getDocumentFileBuffer(documentId: string, organizationId: string): Promise<Buffer> {
    const doc = await this.getDocumentById(documentId, organizationId);
    return this.storageService.getFileBuffer(doc.storageKey);
  }

  async getSectionInsights(documentId: string, sectionId: string, organizationId: string) {
    const doc = await this.getDocumentById(documentId, organizationId);

    const section = await this.prisma.documentSection.findFirst({
      where: { id: sectionId, documentId: doc.id },
    });

    if (!section) {
      throw new NotFoundException(`Section with ID ${sectionId} not found`);
    }

    const systemPrompt = `You are an expert document intelligence assistant. Given a document section, your goal is to extract key insights.
Respond ONLY with a valid JSON object matching this schema:
{
  "summary": "a concise one-sentence summary of the section's core content",
  "questions": [
    "question 1 that can be fully and specifically answered by this section",
    "question 2 that can be fully and specifically answered by this section",
    "question 3 that can be fully and specifically answered by this section"
  ]
}
Do not include any other text, formatting, or markdown backticks outside of the raw JSON object. Ensure the JSON is valid and parsable.`;

    const userPrompt = `Document Title: ${doc.name}\nSection Title: ${section.title}\nContent:\n${section.content}`;

    const response = await this.llmService.generateAnswer(systemPrompt, userPrompt);
    try {
      let content = response.content.trim();
      if (content.startsWith('```')) {
        content = content.replace(/^```(json)?/, '').replace(/```$/, '').trim();
      }
      return JSON.parse(content);
    } catch (e) {
      this.logger.warn(`Failed to parse LLM JSON for section insights: ${response.content}. Using fallback.`);
      return {
        summary: `This section covers details regarding ${section.title} in the ${doc.name} document.`,
        questions: [
          `Summarize the key aspects of ${section.title}`,
          `What are the main requirements of ${section.title}?`,
          `Are there any specifications highlighted in ${section.title}?`
        ]
      };
    }
  }
}
