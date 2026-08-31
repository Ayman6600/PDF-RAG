import { ConfigService } from '@nestjs/config';
export declare class EmbeddingsService {
    private readonly configService;
    private readonly logger;
    private openai;
    private readonly model;
    private readonly dimension;
    constructor(configService: ConfigService);
    generateEmbedding(text: string): Promise<number[]>;
    generateBatchEmbeddings(texts: string[]): Promise<number[][]>;
    private generateMockVector;
}
