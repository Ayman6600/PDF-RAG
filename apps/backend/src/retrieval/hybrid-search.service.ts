import { Injectable, Logger } from '@nestjs/common';
import { VectorSearchService, SearchCandidate } from './vector-search.service';
import { KeywordSearchService } from './keyword-search.service';
import { RerankerService } from './reranker.service';

@Injectable()
export class HybridSearchService {
  private readonly logger = new Logger(HybridSearchService.name);

  constructor(
    private readonly vectorSearch: VectorSearchService,
    private readonly keywordSearch: KeywordSearchService,
    private readonly reranker: RerankerService,
  ) {}

  async search(
    query: string,
    organizationId: string,
    documentIds?: string[],
    options?: { vectorTopK?: number; keywordTopK?: number; finalTopK?: number },
  ): Promise<SearchCandidate[]> {
    const vectorTopK = options?.vectorTopK || 30;
    const keywordTopK = options?.keywordTopK || 30;
    const finalTopK = options?.finalTopK || 8;

    const [vectorResults, keywordResults] = await Promise.all([
      this.vectorSearch.search(query, organizationId, documentIds, vectorTopK),
      this.keywordSearch.search(query, organizationId, documentIds, keywordTopK),
    ]);

    // Reciprocal Rank Fusion (RRF) algorithm (k = 60)
    const k = 60;
    const scoreMap = new Map<string, { candidate: SearchCandidate; rrfScore: number }>();

    vectorResults.forEach((cand, rank) => {
      const rrfScore = 1.0 / (k + (rank + 1));
      scoreMap.set(cand.chunkId, { candidate: cand, rrfScore });
    });

    keywordResults.forEach((cand, rank) => {
      const rrfScore = 1.0 / (k + (rank + 1));
      const existing = scoreMap.get(cand.chunkId);

      if (existing) {
        existing.rrfScore += rrfScore;
      } else {
        scoreMap.set(cand.chunkId, { candidate: cand, rrfScore });
      }
    });

    const fusedCandidates: SearchCandidate[] = Array.from(scoreMap.values()).map(
      (item) => ({
        ...item.candidate,
        score: item.rrfScore,
      }),
    );

    fusedCandidates.sort((a, b) => b.score - a.score);

    // Apply Reranker
    return this.reranker.rerank(query, fusedCandidates, finalTopK);
  }
}
