"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DocumentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const prisma_service_1 = require("../database/prisma.service");
const storage_service_1 = require("../storage/storage.service");
const ingestion_service_1 = require("../ingestion/ingestion.service");
const client_1 = require("@prisma/client");
const crypto = __importStar(require("crypto"));
const llm_service_1 = require("../ai/llm.service");
let DocumentsService = DocumentsService_1 = class DocumentsService {
    constructor(prisma, storageService, ingestionService, llmService, pdfQueue) {
        this.prisma = prisma;
        this.storageService = storageService;
        this.ingestionService = ingestionService;
        this.llmService = llmService;
        this.pdfQueue = pdfQueue;
        this.logger = new common_1.Logger(DocumentsService_1.name);
    }
    async uploadDocument(file, organizationId) {
        if (!file) {
            throw new common_1.BadRequestException('No PDF file provided');
        }
        if (file.mimetype !== 'application/pdf' && !file.originalname.endsWith('.pdf')) {
            throw new common_1.BadRequestException('Only PDF files are supported');
        }
        const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');
        const existingDoc = await this.prisma.document.findFirst({
            where: { organizationId, checksum },
        });
        if (existingDoc) {
            this.logger.log(`Duplicate PDF checksum detected (${checksum}) for Org ${organizationId}. Returning existing document.`);
            return existingDoc;
        }
        const storageKey = await this.storageService.uploadFile(file.originalname, file.buffer, organizationId);
        const document = await this.prisma.document.create({
            data: {
                organizationId,
                name: file.originalname.replace(/\.pdf$/i, ''),
                filename: file.originalname,
                mimeType: 'application/pdf',
                fileSize: file.size,
                storageKey,
                checksum,
                status: client_1.DocumentStatus.UPLOADING,
            },
        });
        try {
            await this.pdfQueue.add('process-pdf', { documentId: document.id });
        }
        catch {
            setImmediate(() => {
                this.ingestionService.processDocument(document.id).catch((err) => {
                    this.logger.error(`Fallback background ingestion failed: ${err.message}`);
                });
            });
        }
        return document;
    }
    async getDocuments(organizationId, search, status) {
        const where = { organizationId };
        if (status) {
            where.status = status;
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
    async getDocumentById(documentId, organizationId) {
        const doc = await this.prisma.document.findFirst({
            where: { id: documentId, organizationId },
            include: {
                sections: { orderBy: { sectionIndex: 'asc' } },
                ingestionJobs: { orderBy: { createdAt: 'desc' }, take: 1 },
            },
        });
        if (!doc) {
            throw new common_1.NotFoundException(`Document with ID ${documentId} not found`);
        }
        return doc;
    }
    async getDocumentChunks(documentId, organizationId) {
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
    async reprocessDocument(documentId, organizationId) {
        const doc = await this.getDocumentById(documentId, organizationId);
        await this.prisma.document.update({
            where: { id: doc.id },
            data: { status: client_1.DocumentStatus.PROCESSING, errorMessage: null },
        });
        try {
            await this.pdfQueue.add('process-pdf', { documentId: doc.id });
        }
        catch {
            setImmediate(() => {
                this.ingestionService.processDocument(doc.id).catch((err) => {
                    this.logger.error(`Reprocess background ingestion failed: ${err.message}`);
                });
            });
        }
        return { message: 'Reprocessing triggered successfully' };
    }
    async deleteDocument(documentId, organizationId) {
        const doc = await this.getDocumentById(documentId, organizationId);
        await this.storageService.deleteFile(doc.storageKey);
        await this.prisma.document.delete({ where: { id: doc.id } });
        return { message: 'Document deleted successfully' };
    }
    async getDocumentFileBuffer(documentId, organizationId) {
        const doc = await this.getDocumentById(documentId, organizationId);
        return this.storageService.getFileBuffer(doc.storageKey);
    }
    async getSectionInsights(documentId, sectionId, organizationId) {
        const doc = await this.getDocumentById(documentId, organizationId);
        const section = await this.prisma.documentSection.findFirst({
            where: { id: sectionId, documentId: doc.id },
        });
        if (!section) {
            throw new common_1.NotFoundException(`Section with ID ${sectionId} not found`);
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
        }
        catch (e) {
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
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = DocumentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, bullmq_1.InjectQueue)('pdf-ingestion')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService,
        ingestion_service_1.IngestionService,
        llm_service_1.LLMService,
        bullmq_2.Queue])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map