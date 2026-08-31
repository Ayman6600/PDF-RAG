import { ConfigService } from '@nestjs/config';
import { HybridSearchService } from '../retrieval/hybrid-search.service';
import { PromptBuilderService } from './prompt-builder.service';
import { CitationService } from './citation.service';
import { LLMService } from '../ai/llm.service';
import { SearchCandidate } from '../retrieval/vector-search.service';
import { CitationDto } from '@okf-rag/shared-types';
export interface GroundedRAGResponse {
    answer: string;
    citations: CitationDto[];
    retrievedChunks: SearchCandidate[];
}
export declare class RAGService {
    private readonly hybridSearch;
    private readonly promptBuilder;
    private readonly citationService;
    private readonly llmService;
    private readonly configService;
    private readonly logger;
    private readonly minScoreThreshold;
    constructor(hybridSearch: HybridSearchService, promptBuilder: PromptBuilderService, citationService: CitationService, llmService: LLMService, configService: ConfigService);
    generateAnswer(query: string, organizationId: string, documentIds?: string[]): Promise<GroundedRAGResponse>;
    streamAnswer(query: string, organizationId: string, documentIds?: string[]): AsyncIterable<{
        type: 'retrieval' | 'token' | 'citation' | 'complete';
        data: any;
    }>;
}
