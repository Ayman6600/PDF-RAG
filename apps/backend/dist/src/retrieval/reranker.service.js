"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RerankerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RerankerService = void 0;
const common_1 = require("@nestjs/common");
let RerankerService = RerankerService_1 = class RerankerService {
    constructor() {
        this.logger = new common_1.Logger(RerankerService_1.name);
    }
    async rerank(query, candidates, topK = 8) {
        if (candidates.length === 0)
            return [];
        const queryTokens = new Set(query.toLowerCase().split(/\W+/).filter((t) => t.length > 2));
        const scoredCandidates = candidates.map((cand) => {
            const contentLower = cand.content.toLowerCase();
            const contentTokens = contentLower.split(/\W+/);
            const contentTokenSet = new Set(contentTokens);
            let exactTermMatches = 0;
            queryTokens.forEach((t) => {
                if (contentTokenSet.has(t)) {
                    exactTermMatches += 1;
                }
            });
            const termMatchRatio = queryTokens.size > 0 ? exactTermMatches / queryTokens.size : 0;
            const combinedScore = 0.6 * cand.score + 0.4 * termMatchRatio;
            return {
                ...cand,
                score: combinedScore,
            };
        });
        scoredCandidates.sort((a, b) => b.score - a.score);
        this.logger.log(`Reranked ${candidates.length} candidates down to top ${Math.min(topK, scoredCandidates.length)}`);
        return scoredCandidates.slice(0, topK);
    }
};
exports.RerankerService = RerankerService;
exports.RerankerService = RerankerService = RerankerService_1 = __decorate([
    (0, common_1.Injectable)()
], RerankerService);
//# sourceMappingURL=reranker.service.js.map