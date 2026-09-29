import { AuthMiddleware } from '@platform/http/middleware';
import { validate } from '@shared/utils';
import { Router } from 'express';

import { UserController } from './user.controller';
import {
    avatarUpdateSchema,
    bannerUpdateSchema,
    changeEmailSchema,
    changePasswordSchema,
    changeTwoFactorSchema,
    deleteUserSchema,
    paginationQuerySchema,
    userIdParamSchema,
    userUpdateSchema,
} from './user.validator';

export function createUserRoutes(
    controller: UserController,
    authMiddleware: AuthMiddleware,
): Router {
    const router = Router();
    const middleware = authMiddleware.validateUserSession;
    router.get('/profile/:id', controller.getUser);

    router.get('/me', middleware, controller.getUser);
    router.patch('/me', middleware, validate('form', userUpdateSchema), controller.updateUser);
    router.delete('/me', middleware, validate('json', deleteUserSchema), controller.deleteUser);

    router.patch(
        '/me/change-password',
        middleware,
        validate('json', changePasswordSchema),
        controller.changePassword,
    );
    router.patch(
        '/me/change-email',
        middleware,
        validate('json', changeEmailSchema),
        controller.changeEmail,
    );
    router.patch(
        '/me/two-factor-authentication',
        middleware,
        validate('json', changeTwoFactorSchema),
        controller.changeTwoFactorAuthentication,
    );

    router.post(
        '/me/avatar',
        middleware,
        validate('form', avatarUpdateSchema),
        controller.updateAvatar,
    );
    router.post(
        '/me/banner',
        middleware,
        validate('form', bannerUpdateSchema),
        controller.updateBanner,
    );

    return router;
}
