import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  app.use(helmet());
  const corsOrigin = process.env.CORS_ORIGIN;
  app.enableCors({
    origin: !corsOrigin || corsOrigin === '*' ? true : corsOrigin.includes(',') ? corsOrigin.split(',').map(s => s.trim()) : corsOrigin,
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger API Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('OKF-RAG API Platform')
    .setDescription('Production-Grade PDF RAG Platform using NestJS, OKF Knowledge Format & pgvector')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Enable graceful shutdown hooks for SIGTERM / SIGINT handling on Render/Cloud
  app.enableShutdownHooks();

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 OKF-RAG Backend running on http://0.0.0.0:${port}/api/v1`);
  console.log(`📚 Swagger Docs available on http://0.0.0.0:${port}/api/docs`);
}

bootstrap();
