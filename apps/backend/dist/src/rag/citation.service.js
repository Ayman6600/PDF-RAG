"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CitationService = void 0;
const common_1 = require("@nestjs/common");
let CitationService = class CitationService {
    buildCitations(candidates) {
        return candidates.map((cand) => ({
            documentId: cand.documentId,
            documentName: cand.documentName,
            pageNumber: cand.pageNumber,
            chunkId: cand.chunkId,
            snippet: cand.content.slice(0, 180) + '...',
            relevanceScore: Math.round(cand.score * 100) / 100,
        }));
    }
};
exports.CitationService = CitationService;
exports.CitationService = CitationService = __decorate([
    (0, common_1.Injectable)()
], CitationService);
//# sourceMappingURL=citation.service.js.map