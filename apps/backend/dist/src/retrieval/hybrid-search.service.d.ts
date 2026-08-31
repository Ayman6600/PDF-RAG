import { VectorSearchService, SearchCandidate } from './vector-search.service';
import { KeywordSearchService } from './keyword-search.service';
import { RerankerService } from './reranker.service';
export declare class HybridSearchService {
    private readonly vectorSearch;
    private readonly keywordSearch;
    private readonly reranker;
    private readonly logger;
    constructor(vectorSearch: VectorSearchService, keywordSearch: KeywordSearchService, reranker: RerankerService);
    search(query: string, organizationId: string, documentIds?: string[], options?: {
        vectorTopK?: number;
        keywordTopK?: number;
        finalTopK?: number;
    }): Promise<SearchCandidate[]>;
}
