"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RAGService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RAGService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const hybrid_search_service_1 = require("../retrieval/hybrid-search.service");
const prompt_builder_service_1 = require("./prompt-builder.service");
const citation_service_1 = require("./citation.service");
const llm_service_1 = require("../ai/llm.service");
let RAGService = RAGService_1 = class RAGService {
    constructor(hybridSearch, promptBuilder, citationService, llmService, configService) {
        this.hybridSearch = hybridSearch;
        this.promptBuilder = promptBuilder;
        this.citationService = citationService;
        this.llmService = llmService;
        this.configService = configService;
        this.logger = new common_1.Logger(RAGService_1.name);
        this.minScoreThreshold = this.configService.get('MIN_RELEVANCE_SCORE') || 0.05;
    }
    async generateAnswer(query, organizationId, documentIds) {
        this.logger.log(`[RAGPipeline] Executing Grounded RAG for query: "${query}" (Org: ${organizationId}, DocFilterCount: ${documentIds?.length || 'ALL'})`);
        const chunks = await this.hybridSearch.search(query, organizationId, documentIds);
        const validChunks = chunks.filter((c) => c.score >= this.minScoreThreshold);
        this.logger.log(`[RAGPipeline] Hybrid search retrieved ${chunks.length} candidate chunks, ${validChunks.length} above min threshold (${this.minScoreThreshold})`);
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
        this.logger.log(`[RAGPipeline] RAG Generation completed successfully (${llmResponse.content.length} chars, ${citations.length} citations)`);
        return {
            answer: llmResponse.content,
            citations,
            retrievedChunks: validChunks,
        };
    }
    async *streamAnswer(query, organizationId, documentIds) {
        this.logger.log(`[RAGStreamPipeline] Starting RAG answer stream for query: "${query}"`);
        yield { type: 'retrieval', data: { status: 'started' } };
        const chunks = await this.hybridSearch.search(query, organizationId, documentIds);
        const validChunks = chunks.filter((c) => c.score >= this.minScoreThreshold);
        const citations = this.citationService.buildCitations(validChunks);
        this.logger.log(`[RAGStreamPipeline] Retrieval step finished. Found ${validChunks.length} valid chunks and ${citations.length} citations.`);
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
};
exports.RAGService = RAGService;
exports.RAGService = RAGService = RAGService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hybrid_search_service_1.HybridSearchService,
        prompt_builder_service_1.PromptBuilderService,
        citation_service_1.CitationService,
        llm_service_1.LLMService,
        config_1.ConfigService])
], RAGService);
//# sourceMappingURL=rag.service.js.map