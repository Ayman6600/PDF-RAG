import { Global, Module } from '@nestjs/common';
import { OpenAIProvider } from './providers/openai.provider';
import { LLMService } from './llm.service';

@Global()
@Module({
  providers: [OpenAIProvider, LLMService],
  exports: [LLMService],
})
export class AIModule {}
