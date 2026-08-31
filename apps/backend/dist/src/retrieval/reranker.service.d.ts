import { SearchCandidate } from './vector-search.service';
export declare class RerankerService {
    private readonly logger;
    rerank(query: string, candidates: SearchCandidate[], topK?: number): Promise<SearchCandidate[]>;
}
