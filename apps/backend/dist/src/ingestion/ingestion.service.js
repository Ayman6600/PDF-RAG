"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var IngestionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const storage_service_1 = require("../storage/storage.service");
const pdf_extractor_service_1 = require("./parsers/pdf-extractor.service");
const okf_service_1 = require("../okf/okf.service");
const okf_validator_1 = require("../okf/okf.validator");
const chunker_service_1 = require("./processors/chunker.service");
const embeddings_service_1 = require("../embeddings/embeddings.service");
const client_1 = require("@prisma/client");
let IngestionService = IngestionService_1 = class IngestionService {
    constructor(prisma, storageService, pdfExtractor, okfService, okfValidator, chunkerService, embeddingsService) {
        this.prisma = prisma;
        this.storageService = storageService;
        this.pdfExtractor = pdfExtractor;
        this.okfService = okfService;
        this.okfValidator = okfValidator;
        this.chunkerService = chunkerService;
        this.embeddingsService = embeddingsService;
        this.logger = new common_1.Logger(IngestionService_1.name);
    }
    async processDocument(documentId) {
        this.logger.log(`[IngestionPipeline] Starting pipeline processing for Document ID: ${documentId}`);
        const doc = await this.prisma.document.findUnique({
            where: { id: documentId },
        });
        if (!doc) {
            this.logger.error(`[IngestionPipeline] Document ID ${documentId} not found in database`);
            throw new Error(`Document ${documentId} not found`);
        }
        const job = await this.prisma.ingestionJob.create({
            data: {
                documentId,
                stage: client_1.IngestionStage.EXTRACTING,
                progress: 10,
            },
        });
        try {
            await this.prisma.document.update({
                where: { id: documentId },
                data: { status: client_1.DocumentStatus.PROCESSING, errorMessage: null },
            });
            this.logger.log(`[IngestionPipeline] Step 1/6: Fetching PDF file from storage (key: ${doc.storageKey})...`);
            const pdfBuffer = await this.storageService.getFileBuffer(doc.storageKey);
            this.logger.log(`[IngestionPipeline] Step 2/6: Extracting text, layout, and sections from PDF...`);
            const pdfData = await this.pdfExtractor.extractPDF(pdfBuffer);
            this.logger.log(`[IngestionPipeline] Step 2/6 Complete: Extracted ${pdfData.pageCount} pages and ${pdfData.sections.length} sections.`);
            await this.prisma.document.update({
                where: { id: documentId },
                data: { pageCount: pdfData.pageCount },
            });
            await this.updateJob(job.id, client_1.IngestionStage.OKF_TRANSFORMING, 30);
            this.logger.log(`[IngestionPipeline] Step 3/6: Transforming document to OKF Knowledge Bundle format...`);
            const okfBundle = await this.okfService.createBundleFromSections(doc.id, doc.name, pdfData.sections);
            await this.updateJob(job.id, client_1.IngestionStage.OKF_VALIDATING, 45);
            const validation = this.okfValidator.validate(okfBundle);
            if (!validation.valid) {
                throw new Error(`OKF Validation failed: ${validation.errors.join('; ')}`);
            }
            this.logger.log(`[IngestionPipeline] Step 3/6 Complete: OKF Knowledge Bundle validated successfully.`);
            this.logger.log(`[IngestionPipeline] Step 4/6: Saving ${pdfData.sections.length} structured document sections to database...`);
            await this.prisma.documentSection.deleteMany({ where: { documentId } });
            const sectionIdMap = {};
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
            await this.updateJob(job.id, client_1.IngestionStage.CHUNKING, 60);
            this.logger.log(`[IngestionPipeline] Step 5/6: Chunking document sections for semantic vector search...`);
            const chunks = this.chunkerService.createChunks(documentId, pdfData.pages, pdfData.sections, sectionIdMap);
            this.logger.log(`[IngestionPipeline] Step 5/6: Generated ${chunks.length} text chunks. Requesting embeddings...`);
            await this.updateJob(job.id, client_1.IngestionStage.EMBEDDING, 75);
            const chunkTexts = chunks.map((c) => c.content);
            const embeddings = await this.embeddingsService.generateBatchEmbeddings(chunkTexts);
            this.logger.log(`[IngestionPipeline] Step 5/6 Complete: ${embeddings.length} vector embeddings generated.`);
            await this.updateJob(job.id, client_1.IngestionStage.INDEXING, 90);
            this.logger.log(`[IngestionPipeline] Step 6/6: Storing ${chunks.length} chunks into pgvector database index...`);
            await this.prisma.documentChunk.deleteMany({ where: { documentId } });
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                const vector = embeddings[i];
                const vectorSql = `[${vector.join(',')}]`;
                await this.prisma.$executeRawUnsafe(`INSERT INTO "DocumentChunk" (
            "id", "documentId", "sectionId", "content", "pageNumber", "chunkIndex", "tokenCount", "embedding", "metadata", "createdAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7::vector, $8::jsonb, NOW()
          )`, chunk.documentId, chunk.sectionId || null, chunk.content, chunk.pageNumber, chunk.chunkIndex, chunk.tokenCount, vectorSql, JSON.stringify({ sourceType: 'pdf', sectionTitle: chunk.sectionTitle }));
            }
            await this.prisma.document.update({
                where: { id: documentId },
                data: { status: client_1.DocumentStatus.READY, errorMessage: null },
            });
            await this.updateJob(job.id, client_1.IngestionStage.COMPLETED, 100);
            this.logger.log(`[IngestionPipeline] 🎉 Document ${documentId} ("${doc.name}") successfully processed and indexed!`);
        }
        catch (err) {
            this.logger.error(`[IngestionPipeline] ❌ Document processing failed for ${documentId}: ${err.message}`, err.stack);
            await this.prisma.document.update({
                where: { id: documentId },
                data: { status: client_1.DocumentStatus.FAILED, errorMessage: err.message },
            });
            await this.prisma.ingestionJob.update({
                where: { id: job.id },
                data: { stage: client_1.IngestionStage.FAILED, progress: 0, errorMessage: err.message },
            });
            throw err;
        }
    }
    async updateJob(jobId, stage, progress) {
        this.logger.log(`[IngestionPipeline] Stage update -> Stage: ${stage}, Progress: ${progress}%`);
        await this.prisma.ingestionJob.update({
            where: { id: jobId },
            data: { stage, progress },
        });
    }
};
exports.IngestionService = IngestionService;
exports.IngestionService = IngestionService = IngestionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService,
        pdf_extractor_service_1.PDFExtractorService,
        okf_service_1.OKFService,
        okf_validator_1.OKFValidator,
        chunker_service_1.ChunkerService,
        embeddings_service_1.EmbeddingsService])
], IngestionService);
//# sourceMappingURL=ingestion.service.js.map