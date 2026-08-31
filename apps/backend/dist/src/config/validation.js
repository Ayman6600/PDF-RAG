"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envSchema = void 0;
exports.validateEnv = validateEnv;
const zod_1 = require("zod");
exports.envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().default(3000),
    DATABASE_URL: zod_1.z.string().url(),
    REDIS_URL: zod_1.z.string().default('redis://localhost:6379'),
    JWT_SECRET: zod_1.z.string().min(16),
    JWT_REFRESH_SECRET: zod_1.z.string().min(16),
    JWT_EXPIRATION: zod_1.z.string().default('1h'),
    JWT_REFRESH_EXPIRATION: zod_1.z.string().default('7d'),
    STORAGE_PROVIDER: zod_1.z.enum(['local', 's3']).default('local'),
    S3_ENDPOINT: zod_1.z.string().optional(),
    S3_BUCKET: zod_1.z.string().default('okf-documents'),
    S3_ACCESS_KEY: zod_1.z.string().optional(),
    S3_SECRET_KEY: zod_1.z.string().optional(),
    STORAGE_LOCAL_PATH: zod_1.z.string().default('./uploads'),
    LLM_PROVIDER: zod_1.z.enum(['openai', 'groq', 'anthropic', 'google', 'local']).default('groq'),
    LLM_API_KEY: zod_1.z.string().default('mock-key'),
    LLM_MODEL: zod_1.z.string().default('gpt-4o-mini'),
    EMBEDDING_PROVIDER: zod_1.z.enum(['openai', 'google', 'local']).default('openai'),
    EMBEDDING_MODEL: zod_1.z.string().default('text-embedding-3-small'),
    EMBEDDING_DIMENSION: zod_1.z.coerce.number().default(1536),
    OKF_BINARY_PATH: zod_1.z.string().default('okf'),
    OKF_OUTPUT_DIR: zod_1.z.string().default('./knowledge/okf'),
    CORS_ORIGIN: zod_1.z.string().default('*'),
    RATE_LIMIT_TTL: zod_1.z.coerce.number().default(60),
    RATE_LIMIT_LIMIT: zod_1.z.coerce.number().default(100),
    CLERK_SECRET_KEY: zod_1.z.string().optional(),
    CLERK_PUBLISHABLE_KEY: zod_1.z.string().optional(),
});
function validateEnv(config) {
    const result = exports.envSchema.safeParse(config);
    if (!result.success) {
        console.error('❌ Invalid environment variable configuration:');
        console.error(result.error.format());
        throw new Error('Environment variable validation failed');
    }
    return result.data;
}
//# sourceMappingURL=validation.js.map