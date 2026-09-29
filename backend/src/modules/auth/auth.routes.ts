import { AuthMiddleware } from '@platform/http/middleware';
import { validate } from '@shared/utils';
import { Router } from 'express';

import { AuthController } from './auth.controller';
import {
    forgotPasswordSchema,
    loginSchema,
    registerSchema,
    resetPasswordSchema,
    verifyEmailSchema,
} from './auth.validator';

export function createAuthRoutes(
    controller: AuthController,
    authMiddleware: AuthMiddleware,
): Router {
    const router = Router();
    const middleware = authMiddleware.validateUserSession;

    router.post('/register', validate('json', registerSchema), controller.register);
    router.post('/login', validate('json', loginSchema), controller.login);
    router.post('/logout', middleware, controller.logout);

    router.post(
        '/forgot-password',
        validate('json', forgotPasswordSchema),
        controller.forgotPassword,
    );
    router.post('/reset-password', validate('json', resetPasswordSchema), controller.resetPassword);
    router.post('/refresh-token', controller.rotateTokens);
    router.post('/verify-email', validate('json', verifyEmailSchema), controller.verifyEmail);

    return router;
}
