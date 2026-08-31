import { Queue } from 'bullmq';
import { PrismaService } from '../database/prisma.service';
import { StorageService } from '../storage/storage.service';
import { IngestionService } from '../ingestion/ingestion.service';
import { LLMService } from '../ai/llm.service';
export declare class DocumentsService {
    private readonly prisma;
    private readonly storageService;
    private readonly ingestionService;
    private readonly llmService;
    private readonly pdfQueue;
    private readonly logger;
    constructor(prisma: PrismaService, storageService: StorageService, ingestionService: IngestionService, llmService: LLMService, pdfQueue: Queue);
    uploadDocument(file: Express.Multer.File, organizationId: string): Promise<{
        id: string;
        organizationId: string;
        name: string;
        filename: string;
        mimeType: string;
        fileSize: number;
        storageKey: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        pageCount: number;
        checksum: string;
        errorMessage: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getDocuments(organizationId: string, search?: string, status?: string): Promise<({
        _count: {
            sections: number;
            chunks: number;
        };
    } & {
        id: string;
        organizationId: string;
        name: string;
        filename: string;
        mimeType: string;
        fileSize: number;
        storageKey: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        pageCount: number;
        checksum: string;
        errorMessage: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getDocumentById(documentId: string, organizationId: string): Promise<{
        sections: {
            id: string;
            createdAt: Date;
            sectionIndex: number;
            documentId: string;
            title: string;
            pageStart: number;
            pageEnd: number;
            content: string;
            yamlMetadata: string | null;
        }[];
        ingestionJobs: {
            id: string;
            errorMessage: string | null;
            createdAt: Date;
            updatedAt: Date;
            documentId: string;
            stage: import(".prisma/client").$Enums.IngestionStage;
            progress: number;
            logs: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    } & {
        id: string;
        organizationId: string;
        name: string;
        filename: string;
        mimeType: string;
        fileSize: number;
        storageKey: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        pageCount: number;
        checksum: string;
        errorMessage: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getDocumentChunks(documentId: string, organizationId: string): Promise<{
        id: string;
        documentId: string;
        content: string;
        sectionId: string | null;
        pageNumber: number;
        chunkIndex: number;
        tokenCount: number;
        metadata: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    reprocessDocument(documentId: string, organizationId: string): Promise<{
        message: string;
    }>;
    deleteDocument(documentId: string, organizationId: string): Promise<{
        message: string;
    }>;
    getDocumentFileBuffer(documentId: string, organizationId: string): Promise<Buffer>;
    getSectionInsights(documentId: string, sectionId: string, organizationId: string): Promise<any>;
}
