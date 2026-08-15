import { Injectable, Logger } from '@nestjs/common';
import { SearchCandidate } from './vector-search.service';

@Injectable()
export class RerankerService {
  private readonly logger = new Logger(RerankerService.name);

  async rerank(
    query: string,
    candidates: SearchCandidate[],
    topK = 8,
  ): Promise<SearchCandidate[]> {
    if (candidates.length === 0) return [];

    const queryTokens = new Set(query.toLowerCase().split(/\W+/).filter((t) => t.length > 2));

    const scoredCandidates = candidates.map((cand) => {
      const contentLower = cand.content.toLowerCase();
      const contentTokens = contentLower.split(/\W+/);
      const contentTokenSet = new Set(contentTokens);

      let exactTermMatches = 0;
      queryTokens.forEach((t) => {
        if (contentTokenSet.has(t)) {
          exactTermMatches += 1;
        }
      });

      const termMatchRatio = queryTokens.size > 0 ? exactTermMatches / queryTokens.size : 0;
      const combinedScore = 0.6 * cand.score + 0.4 * termMatchRatio;

      return {
        ...cand,
        score: combinedScore,
      };
    });

    scoredCandidates.sort((a, b) => b.score - a.score);

    this.logger.log(`Reranked ${candidates.length} candidates down to top ${Math.min(topK, scoredCandidates.length)}`);
    return scoredCandidates.slice(0, topK);
  }
}
