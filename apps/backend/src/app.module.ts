import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { LoggerModule } from 'nestjs-pino';
import { validateEnv } from './config/validation';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './storage/storage.module';
import { AIModule } from './ai/ai.module';
import { EmbeddingsModule } from './embeddings/embeddings.module';
import { OKFModule } from './okf/okf.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { DocumentsModule } from './documents/documents.module';
import { RetrievalModule } from './retrieval/retrieval.module';
import { RAGModule } from './rag/rag.module';
import { ChatModule } from './chat/chat.module';
import { HealthModule } from './health/health.module';
import { DraftsModule } from './drafts/drafts.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isDev = config.get<string>('NODE_ENV') !== 'production';
        return {
          pinoHttp: {
            genReqId: (req: any) => (req.headers['x-request-id'] as string) || req.id || `req_${Date.now()}`,
            customProps: (req: any) => ({
              requestId: (req.headers['x-request-id'] as string) || req.id,
              userId: req.user?.id || req.user?.sub || undefined,
            }),
            customSuccessMessage: (req: any, res: any, responseTime: number) => {
              return `HTTP ${req.method} ${req.url} status ${res.statusCode} - ${responseTime}ms`;
            },
            customErrorMessage: (req: any, res: any, err: Error) => {
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
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: (config.get<number>('RATE_LIMIT_TTL') || 60) * 1000,
          limit: config.get<number>('RATE_LIMIT_LIMIT') || 100,
        },
      ],
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get<string>('REDIS_URL') || 'redis://localhost:6379';
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
        } catch {
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
    DatabaseModule,
    AuthModule,
    StorageModule,
    AIModule,
    EmbeddingsModule,
    OKFModule,
    IngestionModule,
    DocumentsModule,
    RetrievalModule,
    RAGModule,
    ChatModule,
    HealthModule,
    DraftsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
