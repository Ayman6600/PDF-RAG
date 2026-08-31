import { ConfigService } from '@nestjs/config';
import { LLMProvider, LLMResponse, LLMStreamChunk } from './llm-provider.interface';
export declare class OpenAIProvider implements LLMProvider {
    private readonly configService;
    private readonly logger;
    private openai;
    private readonly model;
    constructor(configService: ConfigService);
    generate(systemPrompt: string, userMessage: string): Promise<LLMResponse>;
    stream(systemPrompt: string, userMessage: string): AsyncIterable<LLMStreamChunk>;
    private mockGenerate;
    private mockStream;
}
