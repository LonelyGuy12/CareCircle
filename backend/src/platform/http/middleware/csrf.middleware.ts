import { ConfigService } from '@platform/config';
import { NextFunction, Request, Response } from 'express';

export const createCsrfMiddleware = (config: ConfigService) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
            return next();
        }

        const origin = req.headers.origin || req.headers.referer;

        if (config.isDevelopment && !origin) return next();

        const userAgent = req.headers['user-agent'];
        if (config.isDevelopment && userAgent?.includes('Postman')) return next();

        const allowedOrigins = [
            'https://zerra-nine.vercel.app',
            config.appUrl,
            ...config.corsOrigin.split(',').map((o) => o.trim()),
        ];

        if (config.isDevelopment) {
            allowedOrigins.push(
                'http://localhost:3000',
                'http://127.0.0.1:3000',
                'http://localhost:5173',
                'http://localhost:9000',
            );
        }

        if (origin && allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
            return next();
        }

        if (config.isDevelopment) {
            return next();
        }

        return res.status(403).json({ success: false, message: 'Invalid CSRF origin' });
    };
};
