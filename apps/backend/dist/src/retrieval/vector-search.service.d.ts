import { PrismaService } from '../database/prisma.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';
export interface SearchCandidate {
    chunkId: string;
    documentId: string;
    documentName: string;
    sectionId?: string;
    content: string;
    pageNumber: number;
    score: number;
}
export declare class VectorSearchService {
    private readonly prisma;
    private readonly embeddingsService;
    private readonly logger;
    constructor(prisma: PrismaService, embeddingsService: EmbeddingsService);
    search(query: string, organizationId: string, documentIds?: string[], topK?: number): Promise<SearchCandidate[]>;
}
