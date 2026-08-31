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
var VectorSearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorSearchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const embeddings_service_1 = require("../embeddings/embeddings.service");
let VectorSearchService = VectorSearchService_1 = class VectorSearchService {
    constructor(prisma, embeddingsService) {
        this.prisma = prisma;
        this.embeddingsService = embeddingsService;
        this.logger = new common_1.Logger(VectorSearchService_1.name);
    }
    async search(query, organizationId, documentIds, topK = 30) {
        const queryEmbedding = await this.embeddingsService.generateEmbedding(query);
        const vectorSql = `[${queryEmbedding.join(',')}]`;
        let docFilter = '';
        if (documentIds && documentIds.length > 0) {
            const quotedIds = documentIds.map((id) => `'${id}'`).join(',');
            docFilter = `AND c."documentId" IN (${quotedIds})`;
        }
        const rawResults = await this.prisma.$queryRawUnsafe(`SELECT 
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
      LIMIT $3`, vectorSql, organizationId, topK);
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
};
exports.VectorSearchService = VectorSearchService;
exports.VectorSearchService = VectorSearchService = VectorSearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        embeddings_service_1.EmbeddingsService])
], VectorSearchService);
//# sourceMappingURL=vector-search.service.js.map