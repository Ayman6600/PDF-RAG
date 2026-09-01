"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const bullmq_1 = require("@nestjs/bullmq");
const nestjs_pino_1 = require("nestjs-pino");
const validation_1 = require("./config/validation");
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./auth/auth.module");
const storage_module_1 = require("./storage/storage.module");
const ai_module_1 = require("./ai/ai.module");
const embeddings_module_1 = require("./embeddings/embeddings.module");
const okf_module_1 = require("./okf/okf.module");
const ingestion_module_1 = require("./ingestion/ingestion.module");
const documents_module_1 = require("./documents/documents.module");
const retrieval_module_1 = require("./retrieval/retrieval.module");
const rag_module_1 = require("./rag/rag.module");
const chat_module_1 = require("./chat/chat.module");
const health_module_1 = require("./health/health.module");
const drafts_module_1 = require("./drafts/drafts.module");
const request_id_middleware_1 = require("./common/middleware/request-id.middleware");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(request_id_middleware_1.RequestIdMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                validate: validation_1.validateEnv,
            }),
            nestjs_pino_1.LoggerModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    const isDev = config.get('NODE_ENV') !== 'production';
                    return {
                        pinoHttp: {
                            genReqId: (req) => req.headers['x-request-id'] || req.id || `req_${Date.now()}`,
                            customProps: (req) => ({
                                requestId: req.headers['x-request-id'] || req.id,
                                userId: req.user?.id || req.user?.sub || undefined,
                            }),
                            customSuccessMessage: (req, res, responseTime) => {
                                return `HTTP ${req.method} ${req.url} status ${res.statusCode} - ${responseTime}ms`;
                            },
                            customErrorMessage: (req, res, err) => {
                                return `HTTP ${req.method} ${req.url} status ${res.statusCode} failed - ${err.message}`;
                            },
                            transport: isDev
                                ? {
                                    target: 'pino-pretty',
                                    options: {
                                        colorize: true,
                                        singleLine: true,
                                        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
                                        ignore: 'pid,hostname',
                                    },
                                }
                                : undefined,
                            redact: {
                                paths: ['req.headers.authorization', 'req.headers.cookie', 'req.body.password', 'req.body.token'],
                                censor: '[REDACTED]',
                            },
                        },
                    };
                },
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => [
                    {
                        ttl: (config.get('RATE_LIMIT_TTL') || 60) * 1000,
                        limit: config.get('RATE_LIMIT_LIMIT') || 100,
                    },
                ],
            }),
            bullmq_1.BullModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    const redisUrl = config.get('REDIS_URL') || 'redis://localhost:6379';
                    try {
                        const url = new URL(redisUrl);
                        const isTls = url.protocol === 'rediss:';
                        return {
                            connection: {
                                host: url.hostname || 'localhost',
                                port: parseInt(url.port || '6379', 10),
                                username: url.username || undefined,
                                password: url.password || undefined,
                                tls: isTls ? { rejectUnauthorized: false } : undefined,
                                maxRetriesPerRequest: null,
                                enableReadyCheck: false,
                                connectTimeout: 5000,
                            },
                        };
                    }
                    catch {
                        return {
                            connection: {
                                host: 'localhost',
                                port: 6379,
                                maxRetriesPerRequest: null,
                            },
                        };
                    }
                },
            }),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            storage_module_1.StorageModule,
            ai_module_1.AIModule,
            embeddings_module_1.EmbeddingsModule,
            okf_module_1.OKFModule,
            ingestion_module_1.IngestionModule,
            documents_module_1.DocumentsModule,
            retrieval_module_1.RetrievalModule,
            rag_module_1.RAGModule,
            chat_module_1.ChatModule,
            health_module_1.HealthModule,
            drafts_module_1.DraftsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map