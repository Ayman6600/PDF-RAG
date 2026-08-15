import { Global, Module } from '@nestjs/common';
import { VectorSearchService } from './vector-search.service';
import { KeywordSearchService } from './keyword-search.service';
import { RerankerService } from './reranker.service';
import { HybridSearchService } from './hybrid-search.service';

@Global()
@Module({
  providers: [
    VectorSearchService,
    KeywordSearchService,
    RerankerService,
    HybridSearchService,
  ],
  exports: [HybridSearchService, VectorSearchService, KeywordSearchService, RerankerService],
})
export class RetrievalModule {}
