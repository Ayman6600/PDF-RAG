"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var EmbeddingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = __importDefault(require("openai"));
let EmbeddingsService = EmbeddingsService_1 = class EmbeddingsService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EmbeddingsService_1.name);
        this.openai = null;
        const apiKey = this.configService.get('LLM_API_KEY');
        this.model = this.configService.get('EMBEDDING_MODEL') || 'text-embedding-3-small';
        this.dimension = this.configService.get('EMBEDDING_DIMENSION') || 1536;
        if (apiKey && apiKey !== 'mock-key') {
            this.openai = new openai_1.default({ apiKey });
        }
    }
    async generateEmbedding(text) {
        const embeddings = await this.generateBatchEmbeddings([text]);
        return embeddings[0];
    }
    async generateBatchEmbeddings(texts) {
        if (texts.length === 0)
            return [];
        if (!this.openai) {
            return texts.map((t) => this.generateMockVector(t));
        }
        try {
            const response = await this.openai.embeddings.create({
                model: this.model,
                input: texts,
            });
            return response.data.map((item) => item.embedding);
        }
        catch (err) {
            this.logger.warn(`OpenAI Embeddings API error (${err.message}). Using deterministic fallback embedding vectors.`);
            return texts.map((t) => this.generateMockVector(t));
        }
    }
    generateMockVector(text) {
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
        const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
        return vector.map((v) => (magnitude > 0 ? v / magnitude : 0));
    }
};
exports.EmbeddingsService = EmbeddingsService;
exports.EmbeddingsService = EmbeddingsService = EmbeddingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmbeddingsService);
//# sourceMappingURL=embeddings.service.js.map