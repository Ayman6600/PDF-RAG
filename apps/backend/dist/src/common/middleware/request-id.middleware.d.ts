import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export type RequestWithTrace = Request & {
    id?: string;
    startTime?: [number, number];
};
export declare class RequestIdMiddleware implements NestMiddleware {
    use(req: RequestWithTrace, res: Response, next: NextFunction): void;
}
