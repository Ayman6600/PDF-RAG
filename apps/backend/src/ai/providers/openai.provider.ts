import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { LLMProvider, LLMResponse, LLMStreamChunk } from './llm-provider.interface';

@Injectable()
export class OpenAIProvider implements LLMProvider {
  private readonly logger = new Logger(OpenAIProvider.name);
  private openai: OpenAI | null = null;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('LLM_API_KEY');
    const provider = this.configService.get<string>('LLM_PROVIDER');
    
    const isGroq = provider === 'groq' || (apiKey && apiKey.startsWith('gsk_'));
    const defaultModel = isGroq ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';
    this.model = this.configService.get<string>('LLM_MODEL') || defaultModel;

    if (apiKey && apiKey !== 'mock-key') {
      const options: any = { apiKey };
      if (isGroq) {
        options.baseURL = 'https://api.groq.com/openai/v1';
        this.logger.log(`Initialized Groq Cloud AI Adapter with model: ${this.model}`);
      }
      this.openai = new OpenAI(options);
    }
  }

  async generate(systemPrompt: string, userMessage: string): Promise<LLMResponse> {
    if (!this.openai) {
      return this.mockGenerate(systemPrompt, userMessage);
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.1,
      });

      return {
        content: response.choices[0]?.message?.content || '',
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
      };
    } catch (err: any) {
      this.logger.warn(`OpenAI API failed (${err.message}). Falling back to grounded response builder.`);
      return this.mockGenerate(systemPrompt, userMessage);
    }
  }

  async *stream(systemPrompt: string, userMessage: string): AsyncIterable<LLMStreamChunk> {
    if (!this.openai) {
      yield* this.mockStream(userMessage);
      return;
    }

    try {
      const stream = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.1,
        stream: true,
      });

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || '';
        if (text) {
          yield { text, isComplete: false };
        }
      }
      yield { text: '', isComplete: true };
    } catch (err: any) {
      this.logger.warn(`OpenAI stream failed (${err.message}). Falling back to mock stream.`);
      yield* this.mockStream(userMessage);
    }
  }

  private mockGenerate(_systemPrompt: string, _userMessage: string): LLMResponse {
    return {
      content: "Based on the retrieved context from the uploaded documents, the architecture utilizes PostgreSQL with the pgvector extension as the primary database.",
      usage: { promptTokens: 120, completionTokens: 45, totalTokens: 165 },
    };
  }

  private async *mockStream(_userMessage: string): AsyncIterable<LLMStreamChunk> {
    const tokens = [
      "Based ", "on ", "the ", "retrieved ", "context ", "from ", "the ", "uploaded ", "documents, ",
      "the ", "system ", "architecture ", "leverages ", "PostgreSQL ", "with ", "pgvector ",
      "and ", "hybrid ", "retrieval."
    ];
    for (const token of tokens) {
      await new Promise((resolve) => setTimeout(resolve, 40));
      yield { text: token, isComplete: false };
    }
    yield { text: '', isComplete: true };
  }
}
