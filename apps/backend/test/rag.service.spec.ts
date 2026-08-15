import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RAGService } from '../src/rag/rag.service';
import { HybridSearchService } from '../src/retrieval/hybrid-search.service';
import { PromptBuilderService } from '../src/rag/prompt-builder.service';
import { CitationService } from '../src/rag/citation.service';
import { LLMService } from '../src/ai/llm.service';

describe('RAGService', () => {
  let ragService: RAGService;
  let hybridSearch: jest.Mocked<HybridSearchService>;

  beforeEach(async () => {
    const hybridSearchMock = {
      search: jest.fn(),
    };

    const llmServiceMock = {
      generateAnswer: jest.fn().mockResolvedValue({
        content: 'PostgreSQL with pgvector is used. [architecture.pdf — Page 12]',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RAGService,
        PromptBuilderService,
        CitationService,
        { provide: HybridSearchService, useValue: hybridSearchMock },
        { provide: LLMService, useValue: llmServiceMock },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => (key === 'MIN_RELEVANCE_SCORE' ? 0.1 : null),
          },
        },
      ],
    }).compile();

    ragService = module.get<RAGService>(RAGService);
    hybridSearch = module.get(HybridSearchService);
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
