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
var HybridSearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HybridSearchService = void 0;
const common_1 = require("@nestjs/common");
const vector_search_service_1 = require("./vector-search.service");
const keyword_search_service_1 = require("./keyword-search.service");
const reranker_service_1 = require("./reranker.service");
let HybridSearchService = HybridSearchService_1 = class HybridSearchService {
    constructor(vectorSearch, keywordSearch, reranker) {
        this.vectorSearch = vectorSearch;
        this.keywordSearch = keywordSearch;
        this.reranker = reranker;
        this.logger = new common_1.Logger(HybridSearchService_1.name);
    }
    async search(query, organizationId, documentIds, options) {
        const vectorTopK = options?.vectorTopK || 30;
        const keywordTopK = options?.keywordTopK || 30;
        const finalTopK = options?.finalTopK || 8;
        const [vectorResults, keywordResults] = await Promise.all([
            this.vectorSearch.search(query, organizationId, documentIds, vectorTopK),
            this.keywordSearch.search(query, organizationId, documentIds, keywordTopK),
        ]);
        const k = 60;
        const scoreMap = new Map();
        vectorResults.forEach((cand, rank) => {
            const rrfScore = 1.0 / (k + (rank + 1));
            scoreMap.set(cand.chunkId, { candidate: cand, rrfScore });
        });
        keywordResults.forEach((cand, rank) => {
            const rrfScore = 1.0 / (k + (rank + 1));
            const existing = scoreMap.get(cand.chunkId);
            if (existing) {
                existing.rrfScore += rrfScore;
            }
            else {
                scoreMap.set(cand.chunkId, { candidate: cand, rrfScore });
            }
        });
        const fusedCandidates = Array.from(scoreMap.values()).map((item) => ({
            ...item.candidate,
            score: item.rrfScore,
        }));
        fusedCandidates.sort((a, b) => b.score - a.score);
        return this.reranker.rerank(query, fusedCandidates, finalTopK);
    }
};
exports.HybridSearchService = HybridSearchService;
exports.HybridSearchService = HybridSearchService = HybridSearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [vector_search_service_1.VectorSearchService,
        keyword_search_service_1.KeywordSearchService,
        reranker_service_1.RerankerService])
], HybridSearchService);
//# sourceMappingURL=hybrid-search.service.js.map