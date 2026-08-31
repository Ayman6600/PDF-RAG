"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetrievalModule = void 0;
const common_1 = require("@nestjs/common");
const vector_search_service_1 = require("./vector-search.service");
const keyword_search_service_1 = require("./keyword-search.service");
const reranker_service_1 = require("./reranker.service");
const hybrid_search_service_1 = require("./hybrid-search.service");
let RetrievalModule = class RetrievalModule {
};
exports.RetrievalModule = RetrievalModule;
exports.RetrievalModule = RetrievalModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            vector_search_service_1.VectorSearchService,
            keyword_search_service_1.KeywordSearchService,
            reranker_service_1.RerankerService,
            hybrid_search_service_1.HybridSearchService,
        ],
        exports: [hybrid_search_service_1.HybridSearchService, vector_search_service_1.VectorSearchService, keyword_search_service_1.KeywordSearchService, reranker_service_1.RerankerService],
    })
], RetrievalModule);
//# sourceMappingURL=retrieval.module.js.map