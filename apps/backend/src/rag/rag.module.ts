import { Global, Module } from '@nestjs/common';
import { RAGService } from './rag.service';
import { PromptBuilderService } from './prompt-builder.service';
import { CitationService } from './citation.service';

@Global()
@Module({
  providers: [RAGService, PromptBuilderService, CitationService],
  exports: [RAGService, PromptBuilderService, CitationService],
})
export class RAGModule {}
