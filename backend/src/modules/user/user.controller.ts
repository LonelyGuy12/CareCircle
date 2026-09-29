import { CacheService } from '@platform/cache';
import { AuthenticatedRequest } from '@platform/http/types';
import { ApiResponse, MediaError } from '@shared/json';
import { NextFunction, Request, Response } from 'express';

import { UserService } from './user.service';

export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly cache: CacheService,
    ) {}

    getUser = async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const user = req.user;
            const { id: userIdParam } = req.params;
            const profile = await this.userService.getProfile(
                userIdParam ? parseInt(userIdParam) : user!.id,
                user?.id,
            );
            res.status(200).json(ApiResponse.success(profile));
        } catch (err) {
            next(err);
        }
    };

    updateUser = async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const user = req.user!;
            const data = req.body || {};

            const updateData = { ...data };
            delete updateData.avatar;
            delete updateData.banner;

            const filteredBody = Object.fromEntries(
                Object.entries(updateData).filter(([_, v]) => v !== undefined),
            );

            const updatedUser = await this.userService.updateProfile(user.id, filteredBody);
            res.status(200).json(ApiResponse.success(updatedUser, 'Profile updated successfully'));
        } catch (err) {
            next(err);
        }
    };

    deleteUser = async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const user = req.user!;
            const { password } = req.body;
            const result = await this.userService.deleteUser(user.id, password);
            res.status(200).json(ApiResponse.success(result, 'User deleted successfully'));
        } catch (err) {
            next(err);
        }
    };

    changePassword = async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const user = req.user!;
            const { oldPassword, newPassword } = req.body;
            const updatedUser = await this.userService.updatePassword(
                user.id,
                oldPassword,
                newPassword,
            );
            res.status(200).json(ApiResponse.success(updatedUser, 'Password updated successfully'));
        } catch (err) {
            next(err);
        }
    };

    changeEmail = async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const user = req.user!;
            const { email, password } = req.body;
            const updatedUser = await this.userService.updateEmail(user.id, email, password);
            res.status(200).json(ApiResponse.success(updatedUser, 'Email updated successfully'));
        } catch (err) {
            next(err);
        }
    };

    changeTwoFactorAuthentication = async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            const user = req.user!;
            const { password, twoFactorEnabled } = req.body;
            const updatedUser = await this.userService.updateTwoFactorEnabled(
                user.id,
                password,
                twoFactorEnabled,
            );
            res.status(200).json(
                ApiResponse.success(updatedUser, 'Two-factor authentication status updated'),
            );
        } catch (err) {
            next(err);
        }
    };

    updateAvatar = async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            res.status(200).json(ApiResponse.success(null, 'Avatar update feature'));
        } catch (err) {
            next(err);
        }
    };

    updateBanner = async (
        req: AuthenticatedRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        try {
            res.status(200).json(ApiResponse.success(null, 'Banner update feature'));
        } catch (err) {
            next(err);
        }
    };
}
