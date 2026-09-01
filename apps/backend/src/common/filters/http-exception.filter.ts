import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '@okf-rag/shared-types';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { id?: string }>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const requestId = (request.headers['x-request-id'] as string) || request.id || `req_${Date.now()}`;
    const timestamp = new Date().toISOString();
    const path = request.url;

    // Ensure X-Request-Id header is present on error responses in Network Tab
    response.setHeader('X-Request-Id', requestId);

    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const obj = res as Record<string, unknown>;
        message = (obj.message as string) || exception.message;
        code = (obj.error as string) || exception.name || HttpStatus[status];
        details = Array.isArray(obj.message) ? obj.message : (obj.message !== message ? obj.message : undefined);
      }
      this.logger.warn(
        `[${requestId}] ${request.method} ${path} -> HTTP ${status}: ${Array.isArray(message) ? message.join(', ') : message}`,
      );
    } else if (exception instanceof Error) {
      message = process.env.NODE_ENV === 'production' ? 'Internal server error' : exception.message;
      this.logger.error(
        `[${requestId}] ${request.method} ${path} -> Unhandled Error: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error(`[${requestId}] ${request.method} ${path} -> Unknown Exception:`, exception);
    }

    const payload: ApiResponse = {
      success: false,
      requestId,
      timestamp,
      path,
      error: {
        code,
        message: Array.isArray(message) ? message.join(', ') : message,
        requestId,
        details,
        timestamp,
        path,
      },
    };

    response.status(status).json(payload);
  }
}
