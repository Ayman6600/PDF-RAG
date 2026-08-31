import { Response } from 'express';
import { DocumentsService } from './documents.service';
import { RequestUser } from '../common/decorators/current-user.decorator';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    uploadDocument(file: Express.Multer.File, user: RequestUser): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        pageCount: number;
        filename: string;
        mimeType: string;
        fileSize: number;
        storageKey: string;
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
        name: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        pageCount: number;
        filename: string;
        mimeType: string;
        fileSize: number;
        storageKey: string;
        checksum: string;
        errorMessage: string | null;
    })[]>;
    getDocumentById(id: string, user: RequestUser): Promise<{
        sections: {
            id: string;
            createdAt: Date;
            content: string;
            title: string;
            pageStart: number;
            pageEnd: number;
            documentId: string;
            sectionIndex: number;
            yamlMetadata: string | null;
        }[];
        ingestionJobs: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            errorMessage: string | null;
            stage: import(".prisma/client").$Enums.IngestionStage;
            progress: number;
            logs: import("@prisma/client/runtime/library").JsonValue | null;
            documentId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        organizationId: string;
        status: import(".prisma/client").$Enums.DocumentStatus;
        pageCount: number;
        filename: string;
        mimeType: string;
        fileSize: number;
        storageKey: string;
        checksum: string;
        errorMessage: string | null;
    }>;
    getDocumentChunks(id: string, user: RequestUser): Promise<{
        id: string;
        content: string;
        documentId: string;
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
