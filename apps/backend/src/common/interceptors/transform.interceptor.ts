import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { ApiResponse } from '@okf-rag/shared-types';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request & { id?: string }>();

    const requestId = (req?.headers?.['x-request-id'] as string) || req?.id || `req_${Date.now()}`;
    const timestamp = new Date().toISOString();
    const path = req?.url;

    return next.handle().pipe(
      map((data) => {
        // Pass raw Stream / Buffer through without modification
        if (data && (typeof data === 'string' || Buffer.isBuffer(data))) {
          return data as any;
        }

        // If data is already formatted with success property (e.g. custom controller response)
        if (data && typeof data === 'object' && 'success' in data) {
          return {
            requestId,
            timestamp,
            path,
            ...data,
          };
        }

        // Standardized success response envelope for DevTools Network tab
        return {
          success: true,
          data,
          requestId,
          timestamp,
          path,
        };
      }),
    );
  }
}
