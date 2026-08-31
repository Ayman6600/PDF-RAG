import { SearchCandidate } from '../retrieval/vector-search.service';
import { CitationDto } from '@okf-rag/shared-types';
export declare class CitationService {
    buildCitations(candidates: SearchCandidate[]): CitationDto[];
}
