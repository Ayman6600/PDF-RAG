import { Injectable, Logger } from '@nestjs/common';
import { OpenAIProvider } from './providers/openai.provider';
import { LLMProvider, LLMResponse, LLMStreamChunk } from './providers/llm-provider.interface';

@Injectable()
export class LLMService {
  private readonly logger = new Logger(LLMService.name);
  private provider: LLMProvider;

  constructor(openAIProvider: OpenAIProvider) {
    this.provider = openAIProvider;
  }

  async generateAnswer(systemPrompt: string, userMessage: string): Promise<LLMResponse> {
    return this.provider.generate(systemPrompt, userMessage);
  }

  streamAnswer(systemPrompt: string, userMessage: string): AsyncIterable<LLMStreamChunk> {
    return this.provider.stream(systemPrompt, userMessage);
  }
}
