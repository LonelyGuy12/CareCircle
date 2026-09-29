import { ConfigService } from '@platform/config';
import cors from 'cors';

export const createCorsMiddleware = (config: ConfigService) => {
    return cors({
        origin: (origin, callback) => {
            const allowedOrigins = [
                'https://zerra-nine.vercel.app',
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

            if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
                callback(null, true);
            } else {
                callback(null, false);
            }
        },
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Custom-Header',
            'Upgrade-Insecure-Requests',
            'Accept',
            'Origin',
            'X-Refresh-Token',
        ],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'OPTIONS', 'DELETE'],
        exposedHeaders: ['Content-Length', 'X-Kuma-Revision'],
        maxAge: 600,
        credentials: true,
    });
};
