import { OpenAIProvider } from './providers/openai.provider';
import { LLMResponse, LLMStreamChunk } from './providers/llm-provider.interface';
export declare class LLMService {
    private readonly logger;
    private provider;
    constructor(openAIProvider: OpenAIProvider);
    generateAnswer(systemPrompt: string, userMessage: string): Promise<LLMResponse>;
    streamAnswer(systemPrompt: string, userMessage: string): AsyncIterable<LLMStreamChunk>;
}
