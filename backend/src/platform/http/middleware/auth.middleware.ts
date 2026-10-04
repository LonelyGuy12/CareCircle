import { AuthService } from '@modules/auth/auth.service';
import { ConfigService } from '@platform/config';
import { AuthenticatedRequest } from '@platform/http/types';
import { LoggerService } from '@platform/logger/logger.service';
import { AuthenticationError } from '@shared/json';
import { NextFunction, Response } from 'express';

export class AuthMiddleware {
    constructor(
        private readonly config: ConfigService,
        private readonly logger: LoggerService,
        private readonly authService: AuthService,
    ) {}

    validateUserSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;
        const accessToken = req.cookies?.access_token;

        let token: string | undefined;

        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (accessToken) {
            token = accessToken;
        }

        if (!token) {
            return next(new AuthenticationError('Authentication required'));
        }

        try {
            const payload = this.authService.verifyAccessToken(token);
            req.user = payload;
            next();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error('Session validation failed', { error: message });
            return next(new AuthenticationError('Invalid or expired session'));
        }
    };

    optionalUserSession = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;
        const accessToken = req.cookies?.access_token;

        let token: string | undefined;

        if (authHeader?.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (accessToken) {
            token = accessToken;
        }

        if (token) {
            try {
                const payload = this.authService.verifyAccessToken(token);
                req.user = payload;
            } catch {
                this.logger.warn(
                    'Optional session validation failed, continuing without user context',
                );
            }
        }

        next();
    };
}
