import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name);
  private openai: OpenAI | null = null;
  private readonly model: string;
  private readonly dimension: number;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('LLM_API_KEY');
    this.model = this.configService.get<string>('EMBEDDING_MODEL') || 'text-embedding-3-small';
    this.dimension = this.configService.get<number>('EMBEDDING_DIMENSION') || 1536;

    if (apiKey && apiKey !== 'mock-key') {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const embeddings = await this.generateBatchEmbeddings([text]);
    return embeddings[0];
  }

  async generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];

    if (!this.openai) {
      return texts.map((t) => this.generateMockVector(t));
    }

    try {
      const response = await this.openai.embeddings.create({
        model: this.model,
        input: texts,
      });

      return response.data.map((item) => item.embedding);
    } catch (err: any) {
      this.logger.warn(`OpenAI Embeddings API error (${err.message}). Using deterministic fallback embedding vectors.`);
      return texts.map((t) => this.generateMockVector(t));
    }
  }

  private generateMockVector(text: string): number[] {
    const vector = new Array(this.dimension).fill(0);
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }

    for (let i = 0; i < this.dimension; i++) {
      const seed = hash + i * 17;
      vector[i] = Math.sin(seed) * 0.1;
    }

    // Normalize vector length to 1 for cosine similarity correctness
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map((v) => (magnitude > 0 ? v / magnitude : 0));
  }
}
