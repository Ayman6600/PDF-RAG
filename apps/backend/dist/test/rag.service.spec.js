"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const rag_service_1 = require("../src/rag/rag.service");
const hybrid_search_service_1 = require("../src/retrieval/hybrid-search.service");
const prompt_builder_service_1 = require("../src/rag/prompt-builder.service");
const citation_service_1 = require("../src/rag/citation.service");
const llm_service_1 = require("../src/ai/llm.service");
describe('RAGService', () => {
    let ragService;
    let hybridSearch;
    beforeEach(async () => {
        const hybridSearchMock = {
            search: jest.fn(),
        };
        const llmServiceMock = {
            generateAnswer: jest.fn().mockResolvedValue({
                content: 'PostgreSQL with pgvector is used. [architecture.pdf — Page 12]',
            }),
        };
        const module = await testing_1.Test.createTestingModule({
            providers: [
                rag_service_1.RAGService,
                prompt_builder_service_1.PromptBuilderService,
                citation_service_1.CitationService,
                { provide: hybrid_search_service_1.HybridSearchService, useValue: hybridSearchMock },
                { provide: llm_service_1.LLMService, useValue: llmServiceMock },
                {
                    provide: config_1.ConfigService,
                    useValue: {
                        get: (key) => (key === 'MIN_RELEVANCE_SCORE' ? 0.1 : null),
                    },
                },
            ],
        }).compile();
        ragService = module.get(rag_service_1.RAGService);
        hybridSearch = module.get(hybrid_search_service_1.HybridSearchService);
    });
    it('should generate grounded answer with citations when context is retrieved', async () => {
        hybridSearch.search.mockResolvedValue([
            {
                chunkId: 'chunk-1',
                documentId: 'doc-1',
                documentName: 'architecture.pdf',
                content: 'PostgreSQL with pgvector stores vector embeddings.',
                pageNumber: 12,
                score: 0.92,
            },
        ]);
        const result = await ragService.generateAnswer('What database is used?', 'org-123');
        expect(result.answer).toContain('PostgreSQL');
        expect(result.citations.length).toBe(1);
        expect(result.citations[0].documentName).toBe('architecture.pdf');
        expect(result.citations[0].pageNumber).toBe(12);
    });
    it('should return fallback message when no relevant context is found', async () => {
        hybridSearch.search.mockResolvedValue([]);
        const result = await ragService.generateAnswer('What is the secret recipe?', 'org-123');
        expect(result.answer).toContain("couldn't find enough relevant information");
        expect(result.citations.length).toBe(0);
    });
});
//# sourceMappingURL=rag.service.spec.js.map