import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { EmbeddingsService } from '../embeddings/embeddings.service';

export interface SearchCandidate {
  chunkId: string;
  documentId: string;
  documentName: string;
  sectionId?: string;
  content: string;
  pageNumber: number;
  score: number;
}

@Injectable()
export class VectorSearchService {
  private readonly logger = new Logger(VectorSearchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingsService: EmbeddingsService,
  ) {}

  async search(
    query: string,
    organizationId: string,
    documentIds?: string[],
    topK = 30,
  ): Promise<SearchCandidate[]> {
    const queryEmbedding = await this.embeddingsService.generateEmbedding(query);
    const vectorSql = `[${queryEmbedding.join(',')}]`;

    let docFilter = '';
    if (documentIds && documentIds.length > 0) {
      const quotedIds = documentIds.map((id) => `'${id}'`).join(',');
      docFilter = `AND c."documentId" IN (${quotedIds})`;
    }

    const rawResults: any[] = await this.prisma.$queryRawUnsafe(
      `SELECT 
        c."id" as "chunkId",
        c."documentId",
        d."name" as "documentName",
        c."sectionId",
        c."content",
        c."pageNumber",
        1 - (c."embedding" <=> $1::vector) as "score"
      FROM "DocumentChunk" c
      JOIN "Document" d ON c."documentId" = d."id"
      WHERE d."organizationId" = $2
        AND d."status"::text = 'READY'
        ${docFilter}
      ORDER BY c."embedding" <=> $1::vector ASC
      LIMIT $3`,
      vectorSql,
      organizationId,
      topK,
    );

    return rawResults.map((r) => ({
      chunkId: r.chunkId,
      documentId: r.documentId,
      documentName: r.documentName,
      sectionId: r.sectionId || undefined,
      content: r.content,
      pageNumber: r.pageNumber,
      score: Number(r.score),
    }));
  }
}
