import type { LoggerService } from '@platform/logger/logger.service';
import { NextFunction, Request, Response } from 'express';

export function createRequestLogger(logger: LoggerService) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const start = Date.now();
        const requestId = crypto.randomUUID().slice(0, 8);

        (req as any).requestId = requestId;
        res.setHeader('X-Request-ID', requestId);

        res.on('finish', () => {
            const duration = Date.now() - start;

            if (req.path === '/health' && res.statusCode === 200) {
                return;
            }

            logger.logRequest(req.method, req.path, res.statusCode, duration, {
                requestId,
                userAgent: req.headers['user-agent'],
                userId: (req as any).user?.id,
                ip:
                    (req.headers['x-forwarded-for'] as string) ||
                    req.socket.remoteAddress ||
                    'unknown',
            });
        });

        next();
    };
}
