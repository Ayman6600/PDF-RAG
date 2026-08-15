import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class RAGService {
  private readonly logger = new Logger(RAGService.name);
  private readonly minScoreThreshold: number;

  constructor(
    private readonly hybridSearch: HybridSearchService,
    private readonly promptBuilder: PromptBuilderService,
    private readonly citationService: CitationService,
    private readonly llmService: LLMService,
    private readonly configService: ConfigService,
  ) {
    this.minScoreThreshold = this.configService.get<number>('MIN_RELEVANCE_SCORE') || 0.05;
  }

  async generateAnswer(
    query: string,
    organizationId: string,
    documentIds?: string[],
  ): Promise<GroundedRAGResponse> {
    this.logger.log(`Executing Grounded RAG for query: "${query}" (Org: ${organizationId})`);

    const chunks = await this.hybridSearch.search(query, organizationId, documentIds);
    const validChunks = chunks.filter((c) => c.score >= this.minScoreThreshold);

    if (validChunks.length === 0) {
      return {
        answer: "I couldn't find enough relevant information in the uploaded documents to reliably answer this question.",
        citations: [],
        retrievedChunks: [],
      };
    }

    const systemPrompt = this.promptBuilder.buildSystemPrompt();
    const userMessage = this.promptBuilder.buildUserMessage(query, validChunks);

    const llmResponse = await this.llmService.generateAnswer(systemPrompt, userMessage);
    const citations = this.citationService.buildCitations(validChunks);

    return {
      answer: llmResponse.content,
      citations,
      retrievedChunks: validChunks,
    };
  }

  async *streamAnswer(
    query: string,
    organizationId: string,
    documentIds?: string[],
  ): AsyncIterable<{ type: 'retrieval' | 'token' | 'citation' | 'complete'; data: any }> {
    yield { type: 'retrieval', data: { status: 'started' } };

    const chunks = await this.hybridSearch.search(query, organizationId, documentIds);
    const validChunks = chunks.filter((c) => c.score >= this.minScoreThreshold);
    const citations = this.citationService.buildCitations(validChunks);

    yield {
      type: 'retrieval',
      data: { status: 'completed', count: validChunks.length, citations },
    };

    if (validChunks.length === 0) {
      yield {
        type: 'token',
        data: { text: "I couldn't find enough relevant information in the uploaded documents to reliably answer this question." },
      };
      yield { type: 'complete', data: { citations: [] } };
      return;
    }

    const systemPrompt = this.promptBuilder.buildSystemPrompt();
    const userMessage = this.promptBuilder.buildUserMessage(query, validChunks);

    for await (const chunk of this.llmService.streamAnswer(systemPrompt, userMessage)) {
      if (chunk.text) {
        yield { type: 'token', data: { text: chunk.text } };
      }
    }

    yield { type: 'citation', data: { citations } };
    yield { type: 'complete', data: { citations } };
  }
}
