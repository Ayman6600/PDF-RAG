import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OKFService } from '../src/okf/okf.service';
import { OKFValidator } from '../src/okf/okf.validator';

describe('OKFService', () => {
  let okfService: OKFService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OKFService,
        OKFValidator,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'OKF_OUTPUT_DIR') return './test-knowledge/okf';
              return null;
            },
          },
        },
      ],
    }).compile();

    okfService = module.get<OKFService>(OKFService);
  });

  it('should create and validate a structured OKF bundle from extracted sections', async () => {
    const documentId = 'test-doc-123';
    const title = 'System Architecture Specification';
    const sections = [
      {
        title: '1. Introduction',
        pageStart: 1,
        pageEnd: 2,
        content: 'This document defines the core architecture for OKF-RAG.',
      },
      {
        title: '2. Database Architecture',
        pageStart: 3,
        pageEnd: 5,
        content: 'PostgreSQL 16 with pgvector extension is used for hybrid search.',
      },
    ];

    const bundle = await okfService.createBundleFromSections(documentId, title, sections);

    expect(bundle).toBeDefined();
    expect(bundle.documentId).toBe(documentId);
    expect(bundle.sections.length).toBe(2);
    expect(bundle.sections[0].frontmatter.type).toBe('DocumentSection');
    expect(bundle.sections[0].frontmatter.page_start).toBe(1);
    expect(bundle.indexMarkdown).toContain('System Architecture Specification');
  });
});
