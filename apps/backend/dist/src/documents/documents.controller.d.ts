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
    getDocuments(user: RequestUser, search?: string, status?: string): Promise<({
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
    getDocumentById(id: string, user: RequestUser): Promise<{
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
    getDocumentChunks(id: string, user: RequestUser): Promise<{
        id: string;
        documentId: string;
        content: string;
        sectionId: string | null;
        pageNumber: number;
        chunkIndex: number;
        tokenCount: number;
        metadata: import("@prisma/client/runtime/library").JsonValue;
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
