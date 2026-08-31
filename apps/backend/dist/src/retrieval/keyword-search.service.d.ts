import { PrismaService } from '../database/prisma.service';
import { SearchCandidate } from './vector-search.service';
export declare class KeywordSearchService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    search(query: string, organizationId: string, documentIds?: string[], topK?: number): Promise<SearchCandidate[]>;
}
