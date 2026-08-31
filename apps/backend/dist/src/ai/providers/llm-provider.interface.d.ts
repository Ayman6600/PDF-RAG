export interface LLMResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}
export interface LLMStreamChunk {
    text: string;
    isComplete: boolean;
}
export interface LLMProvider {
    generate(systemPrompt: string, userMessage: string): Promise<LLMResponse>;
    stream(systemPrompt: string, userMessage: string): AsyncIterable<LLMStreamChunk>;
}
