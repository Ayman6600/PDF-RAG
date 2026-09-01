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
    this.logger.log(
      `[RAGPipeline] Executing Grounded RAG for query: "${query}" (Org: ${organizationId}, DocFilterCount: ${documentIds?.length || 'ALL'})`,
    );

    const chunks = await this.hybridSearch.search(query, organizationId, documentIds);
    const validChunks = chunks.filter((c) => c.score >= this.minScoreThreshold);

    this.logger.log(
      `[RAGPipeline] Hybrid search retrieved ${chunks.length} candidate chunks, ${validChunks.length} above min threshold (${this.minScoreThreshold})`,
    );

    if (validChunks.length === 0) {
      this.logger.warn(`[RAGPipeline] No relevant chunks found for query: "${query}"`);
      return {
        answer: "I couldn't find enough relevant information in the uploaded documents to reliably answer this question.",
        citations: [],
        retrievedChunks: [],
      };
    }

    const systemPrompt = this.promptBuilder.buildSystemPrompt();
    const userMessage = this.promptBuilder.buildUserMessage(query, validChunks);

    this.logger.log(`[RAGPipeline] Sending augmented prompt to LLM provider for synthesis...`);
    const llmResponse = await this.llmService.generateAnswer(systemPrompt, userMessage);
    const citations = this.citationService.buildCitations(validChunks);

    this.logger.log(
      `[RAGPipeline] RAG Generation completed successfully (${llmResponse.content.length} chars, ${citations.length} citations)`,
    );

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
    this.logger.log(`[RAGStreamPipeline] Starting RAG answer stream for query: "${query}"`);
    yield { type: 'retrieval', data: { status: 'started' } };

    const chunks = await this.hybridSearch.search(query, organizationId, documentIds);
    const validChunks = chunks.filter((c) => c.score >= this.minScoreThreshold);
    const citations = this.citationService.buildCitations(validChunks);

    this.logger.log(
      `[RAGStreamPipeline] Retrieval step finished. Found ${validChunks.length} valid chunks and ${citations.length} citations.`,
    );

    yield {
      type: 'retrieval',
      data: { status: 'completed', count: validChunks.length, citations },
    };

    if (validChunks.length === 0) {
      this.logger.warn(`[RAGStreamPipeline] Zero valid chunks retrieved for query: "${query}". Returning fallback response.`);
      yield {
        type: 'token',
        data: { text: "I couldn't find enough relevant information in the uploaded documents to reliably answer this question." },
      };
      yield { type: 'complete', data: { citations: [] } };
      return;
    }

    const systemPrompt = this.promptBuilder.buildSystemPrompt();
    const userMessage = this.promptBuilder.buildUserMessage(query, validChunks);

    this.logger.log(`[RAGStreamPipeline] Initiating token streaming from LLM...`);
    for await (const chunk of this.llmService.streamAnswer(systemPrompt, userMessage)) {
      if (chunk.text) {
        yield { type: 'token', data: { text: chunk.text } };
      }
    }

    this.logger.log(`[RAGStreamPipeline] Token streaming completed.`);
    yield { type: 'citation', data: { citations } };
    yield { type: 'complete', data: { citations } };
  }
}
