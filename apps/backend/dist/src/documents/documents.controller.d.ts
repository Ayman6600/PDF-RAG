import { Response } from 'express';
import { DocumentsService } from './documents.service';
import { RequestUser } from '../common/decorators/current-user.decorator';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    uploadDocument(file: Express.Multer.File, user: RequestUser): Promise<{
        id: string;
        organizationId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        filename: string;
        mimeType: string;
        fileSize: number;
        storageKey: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        pageCount: number;
        checksum: string;
        errorMessage: string | null;
    }>;
    getDocuments(user: RequestUser, search?: string, status?: string): Promise<({
        _count: {
            sections: number;
            chunks: number;
        };
    } & {
        id: string;
        organizationId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        filename: string;
        mimeType: string;
        fileSize: number;
        storageKey: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        pageCount: number;
        checksum: string;
        errorMessage: string | null;
    })[]>;
    getDocumentById(id: string, user: RequestUser): Promise<{
        sections: {
            id: string;
            createdAt: Date;
            sectionIndex: number;
            documentId: string;
            content: string;
            title: string;
            pageStart: number;
            pageEnd: number;
            yamlMetadata: string | null;
        }[];
        ingestionJobs: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            errorMessage: string | null;
            documentId: string;
            stage: import(".prisma/client").$Enums.IngestionStage;
            progress: number;
            logs: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    } & {
        id: string;
        organizationId: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        filename: string;
        mimeType: string;
        fileSize: number;
        storageKey: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        pageCount: number;
        checksum: string;
        errorMessage: string | null;
    }>;
    getDocumentChunks(id: string, user: RequestUser): Promise<{
        id: string;
        metadata: import("@prisma/client/runtime/library").JsonValue;
        documentId: string;
        sectionId: string | null;
        content: string;
        pageNumber: number;
        chunkIndex: number;
        tokenCount: number;
    }[]>;
    getDocumentFile(id: string, user: RequestUser, res: Response): Promise<void>;
    reprocessDocument(id: string, user: RequestUser): Promise<{
        message: string;
    }>;
    getSectionInsights(id: string, sectionId: string, user: RequestUser): Promise<any>;
    deleteDocument(id: string, user: RequestUser): Promise<{
        message: string;
    }>;
}
