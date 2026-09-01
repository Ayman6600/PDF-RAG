"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nestjs_pino_1 = require("nestjs-pino");
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    app.useLogger(app.get(nestjs_pino_1.Logger));
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        crossOriginEmbedderPolicy: false,
    }));
    const corsOriginEnv = process.env.CORS_ORIGIN;
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (!corsOriginEnv || corsOriginEnv === '*' || corsOriginEnv.toLowerCase() === 'all') {
                return callback(null, true);
            }
            const allowedOrigins = corsOriginEnv
                .split(',')
                .map((o) => o.trim().replace(/\/+$/, ''));
            const cleanOrigin = origin.replace(/\/+$/, '');
            if (allowedOrigins.includes(cleanOrigin) ||
                allowedOrigins.some((allowed) => allowed.includes('*') && new RegExp('^' + allowed.replace(/\*/g, '.*') + '$').test(cleanOrigin)) ||
                cleanOrigin.endsWith('.vercel.app') ||
                cleanOrigin.includes('localhost')) {
                return callback(null, true);
            }
            return callback(null, true);
        },
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Accept',
            'Authorization',
            'X-Requested-With',
            'Origin',
            'Range',
            'x-request-id',
            'X-Request-Id',
        ],
        exposedHeaders: ['Content-Disposition', 'Content-Length', 'Content-Range', 'X-Request-Id', 'X-Response-Time'],
        credentials: true,
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.GlobalExceptionFilter());
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('OKF-RAG API Platform')
        .setDescription('Production-Grade PDF RAG Platform using NestJS, OKF Knowledge Format & pgvector')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    app.enableShutdownHooks();
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    const logger = app.get(nestjs_pino_1.Logger);
    logger.log(`🚀 OKF-RAG Backend running on http://0.0.0.0:${port}/api/v1`);
    logger.log(`📚 Swagger Docs available on http://0.0.0.0:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map