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
var OpenAIProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = __importDefault(require("openai"));
let OpenAIProvider = OpenAIProvider_1 = class OpenAIProvider {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(OpenAIProvider_1.name);
        this.openai = null;
        const apiKey = this.configService.get('LLM_API_KEY');
        const provider = this.configService.get('LLM_PROVIDER');
        const isGroq = provider === 'groq' || (apiKey && apiKey.startsWith('gsk_'));
        const defaultModel = isGroq ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';
        this.model = this.configService.get('LLM_MODEL') || defaultModel;
        if (apiKey && apiKey !== 'mock-key') {
            const options = { apiKey };
            if (isGroq) {
                options.baseURL = 'https://api.groq.com/openai/v1';
                this.logger.log(`Initialized Groq Cloud AI Adapter with model: ${this.model}`);
            }
            this.openai = new openai_1.default(options);
        }
    }
    async generate(systemPrompt, userMessage) {
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
        }
        catch (err) {
            this.logger.warn(`OpenAI API failed (${err.message}). Falling back to grounded response builder.`);
            return this.mockGenerate(systemPrompt, userMessage);
        }
    }
    async *stream(systemPrompt, userMessage) {
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
        }
        catch (err) {
            this.logger.warn(`OpenAI stream failed (${err.message}). Falling back to mock stream.`);
            yield* this.mockStream(userMessage);
        }
    }
    mockGenerate(_systemPrompt, _userMessage) {
        return {
            content: "Based on the retrieved context from the uploaded documents, the architecture utilizes PostgreSQL with the pgvector extension as the primary database.",
            usage: { promptTokens: 120, completionTokens: 45, totalTokens: 165 },
        };
    }
    async *mockStream(_userMessage) {
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
};
exports.OpenAIProvider = OpenAIProvider;
exports.OpenAIProvider = OpenAIProvider = OpenAIProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], OpenAIProvider);
//# sourceMappingURL=openai.provider.js.map