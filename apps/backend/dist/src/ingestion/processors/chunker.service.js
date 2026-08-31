"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChunkerService = void 0;
const common_1 = require("@nestjs/common");
let ChunkerService = class ChunkerService {
    constructor() {
        this.chunkSize = 500;
        this.chunkOverlap = 50;
    }
    createChunks(documentId, pages, sections, sectionIdMap) {
        const chunks = [];
        let globalChunkIndex = 0;
        sections.forEach((sec) => {
            const dbSectionId = sectionIdMap[sec.title];
            const words = sec.content.split(/\s+/).filter((w) => w.length > 0);
            for (let i = 0; i < words.length; i += this.chunkSize - this.chunkOverlap) {
                const chunkWords = words.slice(i, i + this.chunkSize);
                if (chunkWords.length === 0)
                    continue;
                const content = chunkWords.join(' ');
                const pageNumber = this.estimatePageForChunk(sec, i, words.length, pages);
                chunks.push({
                    documentId,
                    sectionId: dbSectionId,
                    sectionTitle: sec.title,
                    pageNumber,
                    chunkIndex: globalChunkIndex++,
                    content,
                    tokenCount: chunkWords.length,
                    sourceType: 'pdf',
                });
            }
        });
        if (chunks.length === 0 && pages.length > 0) {
            pages.forEach((p, idx) => {
                chunks.push({
                    documentId,
                    pageNumber: p.pageNumber,
                    chunkIndex: idx,
                    content: p.text || 'Empty page content',
                    tokenCount: p.text.split(/\s+/).length,
                    sourceType: 'pdf',
                });
            });
        }
        return chunks;
    }
    estimatePageForChunk(sec, wordIndex, totalWords, pages) {
        if (sec.pageStart === sec.pageEnd) {
            return sec.pageStart;
        }
        const ratio = wordIndex / Math.max(1, totalWords);
        const estimatedPage = Math.floor(sec.pageStart + ratio * (sec.pageEnd - sec.pageStart));
        return Math.min(Math.max(estimatedPage, sec.pageStart), Math.min(sec.pageEnd, pages.length || 1));
    }
};
exports.ChunkerService = ChunkerService;
exports.ChunkerService = ChunkerService = __decorate([
    (0, common_1.Injectable)()
], ChunkerService);
//# sourceMappingURL=chunker.service.js.map