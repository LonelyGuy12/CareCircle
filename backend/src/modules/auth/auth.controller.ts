import { CacheService } from '@platform/cache';
import { ConfigService } from '@platform/config';
import { AuthenticatedRequest } from '@platform/http/types';
import { LoggerService } from '@platform/logger/logger.service';
import { HTTP_STATUS } from '@shared/constants/httpStatus';
import { ApiResponse, AuthenticationError } from '@shared/json';
import { NextFunction, Request, Response } from 'express';

import { AuthService } from './auth.service';

export class AuthController {
    constructor(
        private readonly config: ConfigService,
        private readonly authService: AuthService,
        private readonly cache: CacheService,
        private readonly logger: LoggerService,
    ) {}

    register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const body = req.body;
            const { accessToken, refreshToken } = await this.authService.createUser(body);

            res.cookie('access_token', accessToken, {
                httpOnly: this.config.httpOnly_cookies,
                secure: this.config.secure_cookies,
                sameSite: 'strict',
                path: '/',
                maxAge: this.config.access_token_expiry_seconds * 1000,
            });

            res.cookie('refresh_token', refreshToken, {
                httpOnly: this.config.httpOnly_cookies,
                secure: this.config.secure_cookies,
                sameSite: 'strict',
                path: '/',
                maxAge: this.config.refresh_token_expiry_seconds * 1000,
            });

            res.status(HTTP_STATUS.CREATED).json(
                ApiResponse.success({ accessToken, refreshToken }, 'User registered successfully'),
            );
        } catch (err) {
            next(err);
        }
    };

    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const body = req.body;
            const { twoFactorEnabled, authTokens } = await this.authService.login(body);

            if (twoFactorEnabled) {
                return res.redirect('/otp-verify');
            }

            res.cookie('access_token', authTokens.accessToken, {
                httpOnly: this.config.httpOnly_cookies,
                secure: this.config.secure_cookies,
                sameSite: 'strict',
                path: '/',
                maxAge: this.config.access_token_expiry_seconds * 1000,
            });

            res.cookie('refresh_token', authTokens.refreshToken, {
                httpOnly: this.config.httpOnly_cookies,
                secure: this.config.secure_cookies,
                sameSite: 'strict',
                path: '/',
                maxAge: this.config.refresh_token_expiry_seconds * 1000,
            });

            res.status(HTTP_STATUS.OK).json(
                ApiResponse.success(
                    {
                        accessToken: authTokens.accessToken,
                        refreshToken: authTokens.refreshToken,
                        twoFactorEnabled,
                    },
                    'User logged in successfully',
                ),
            );
        } catch (err) {
            next(err);
        }
    };

    logout = async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const user = req.user;
            if (!user) {
                throw new AuthenticationError('Not authenticated');
            }

            const { message } = await this.authService.logout(user.id);

            res.clearCookie('access_token', { path: '/' });
            res.clearCookie('refresh_token', { path: '/' });

            this.logger.info('Logout successful', { userId: user.id });
            res.status(HTTP_STATUS.OK).json(ApiResponse.success(null, message));
        } catch (err) {
            next(err);
        }
    };

    forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { email } = req.body;
            const { uuid, message } = await this.authService.forgotPassword(email);
            res.status(HTTP_STATUS.OK).json(ApiResponse.success({ uuid }, message));
        } catch (err) {
            next(err);
        }
    };

    resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { uuid, otp, password } = req.body;
            const authTokens = await this.authService.resetPassword(uuid, otp, password);

            res.cookie('access_token', authTokens.accessToken, {
                httpOnly: this.config.httpOnly_cookies,
                secure: this.config.secure_cookies,
                sameSite: 'strict',
                path: '/',
                maxAge: this.config.access_token_expiry_seconds * 1000,
            });

            res.cookie('refresh_token', authTokens.refreshToken, {
                httpOnly: this.config.httpOnly_cookies,
                secure: this.config.secure_cookies,
                sameSite: 'strict',
                path: '/',
                maxAge: this.config.refresh_token_expiry_seconds * 1000,
            });

            res.status(HTTP_STATUS.OK).json(
                ApiResponse.success(
                    {
                        accessToken: authTokens.accessToken,
                        refreshToken: authTokens.refreshToken,
                    },
                    'Password reset successful',
                ),
            );
        } catch (err) {
            next(err);
        }
    };

    rotateTokens = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const refreshTokenCookie = req.cookies?.refresh_token;
            const refreshToken =
                refreshTokenCookie || req.body?.refreshToken || req.headers['x-refresh-token'];

            if (!refreshToken || typeof refreshToken !== 'string') {
                throw new AuthenticationError('Refresh token required');
            }

            const { accessToken, refreshToken: newRefreshToken } =
                await this.authService.rotateTokens(refreshToken);

            res.cookie('access_token', accessToken, {
                httpOnly: this.config.httpOnly_cookies,
                secure: this.config.secure_cookies,
                sameSite: 'strict',
                path: '/',
                maxAge: this.config.access_token_expiry_seconds * 1000,
            });

            res.cookie('refresh_token', newRefreshToken, {
                httpOnly: this.config.httpOnly_cookies,
                secure: this.config.secure_cookies,
                sameSite: 'strict',
                path: '/',
                maxAge: this.config.refresh_token_expiry_seconds * 1000,
            });

            this.logger.info('Token rotation successful');

            res.status(HTTP_STATUS.OK).json(
                ApiResponse.success(
                    {
                        accessToken,
                        refreshToken: newRefreshToken,
                    },
                    'Token rotation successful',
                ),
            );
        } catch (err) {
            next(err);
        }
    };

    verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { email } = req.body;
            this.logger.info('Email verification requested', { email });
            res.status(HTTP_STATUS.OK).json(
                ApiResponse.success(null, 'Email verified successfully'),
            );
        } catch (err) {
            next(err);
        }
    };
}
