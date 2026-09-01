import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export type RequestWithTrace = Request & {
  id?: string;
  startTime?: [number, number];
};

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: RequestWithTrace, res: Response, next: NextFunction) {
    const existingId = req.headers['x-request-id'] as string;
    const requestId = existingId || `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    req.id = requestId;
    req.headers['x-request-id'] = requestId;
    req.startTime = process.hrtime();

    // Set X-Request-Id on response headers early so DevTools Network Tab shows it
    res.setHeader('X-Request-Id', requestId);

    // Compute response time duration on response completion
    res.on('finish', () => {
      if (req.startTime) {
        const diff = process.hrtime(req.startTime);
        const durationMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);
        if (!res.headersSent) {
          res.setHeader('X-Response-Time', `${durationMs}ms`);
        }
      }
    });

    next();
  }
}
