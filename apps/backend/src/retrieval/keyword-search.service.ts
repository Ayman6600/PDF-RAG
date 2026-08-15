import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SearchCandidate } from './vector-search.service';

@Injectable()
export class KeywordSearchService {
  private readonly logger = new Logger(KeywordSearchService.name);

  constructor(private readonly prisma: PrismaService) {}

  async search(
    query: string,
    organizationId: string,
    documentIds?: string[],
    topK = 30,
  ): Promise<SearchCandidate[]> {
    const formattedQuery = query
      .trim()
      .split(/\s+/)
      .map((term) => `${term}:*`)
      .join(' & ');

    let docFilter = '';
    if (documentIds && documentIds.length > 0) {
      const quotedIds = documentIds.map((id) => `'${id}'`).join(',');
      docFilter = `AND c."documentId" IN (${quotedIds})`;
    }

    try {
      const rawResults: any[] = await this.prisma.$queryRawUnsafe(
        `SELECT 
          c."id" as "chunkId",
          c."documentId",
          d."name" as "documentName",
          c."sectionId",
          c."content",
          c."pageNumber",
          ts_rank_cd(to_tsvector('english', c."content"), to_tsquery('english', $1)) as "score"
        FROM "DocumentChunk" c
        JOIN "Document" d ON c."documentId" = d."id"
        WHERE d."organizationId" = $2
          AND d."status" = 'READY'
          ${docFilter}
          AND to_tsvector('english', c."content") @@ to_tsquery('english', $1)
        ORDER BY "score" DESC
        LIMIT $3`,
        formattedQuery || 'a:*',
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
    } catch {
      // Fallback ILIKE search if query string has special tsquery syntax characters
      const ilikeResults: any[] = await this.prisma.$queryRawUnsafe(
        `SELECT 
          c."id" as "chunkId",
          c."documentId",
          d."name" as "documentName",
          c."sectionId",
          c."content",
          c."pageNumber",
          0.5 as "score"
        FROM "DocumentChunk" c
        JOIN "Document" d ON c."documentId" = d."id"
        WHERE d."organizationId" = $1
          AND d."status" = 'READY'
          AND c."content" ILIKE $2
        LIMIT $3`,
        organizationId,
        `%${query}%`,
        topK,
      );

      return ilikeResults.map((r) => ({
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
}
