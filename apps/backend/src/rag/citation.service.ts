import { Injectable } from '@nestjs/common';
import { SearchCandidate } from '../retrieval/vector-search.service';
import { CitationDto } from '@okf-rag/shared-types';

@Injectable()
export class CitationService {
  buildCitations(candidates: SearchCandidate[]): CitationDto[] {
    return candidates.map((cand) => ({
      documentId: cand.documentId,
      documentName: cand.documentName,
      pageNumber: cand.pageNumber,
      chunkId: cand.chunkId,
      snippet: cand.content.slice(0, 180) + '...',
      relevanceScore: Math.round(cand.score * 100) / 100,
    }));
  }
}
