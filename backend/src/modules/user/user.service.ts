import { LoggerService } from '@platform/logger/logger.service';
import { AuthenticationError, ConflictError, NotFoundError } from '@shared/json';
import { IUpdateUserProfile, IUser } from '@shared/types';
import { hashString, verifyHash } from '@shared/utils/auth';

import { UserRepository } from './user.repository';

interface MediaService {
    upload: (file: unknown, folder: string) => Promise<string>;
    remove: (path: string) => Promise<void>;
}

export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly logger: LoggerService,
        private readonly mediaService?: MediaService,
    ) {}

    private stripSensitiveData(user: Record<string, unknown>) {
        const { password: _password, _count, ...safeUser } = user;
        const flattenedUser: Record<string, unknown> = { ...safeUser };
        if (_count && typeof _count === 'object') {
            const countObj = _count as Record<string, unknown>;
            flattenedUser.followersCount = countObj.followers;
            flattenedUser.followingCount = countObj.following;
            flattenedUser.likesCount = countObj.likes;
            flattenedUser.postsCount = countObj.posts;
            flattenedUser.articlesCount = countObj.articles;
        }
        return flattenedUser;
    }

    async getUserById(id: number): Promise<IUser> {
        const user = await this.userRepository.findUserById(id);
        if (!user) {
            throw new NotFoundError('User');
        }
        return this.stripSensitiveData(user) as unknown as IUser;
    }

    async getProfile(id: number, viewerId?: number): Promise<Record<string, unknown>> {
        const user = await this.userRepository.findUserById(id);
        if (!user) {
            throw new NotFoundError('User');
        }

        let isFollowing = false;
        if (viewerId && viewerId !== id) {
            isFollowing = await this.userRepository.isFollowing(viewerId, id);
        }

        const safeUser = this.stripSensitiveData(user);
        return { ...safeUser, isFollowing };
    }

    async updateProfile(
        id: number,
        profile: IUpdateUserProfile,
        files?: { avatar?: File; banner?: File },
    ) {
        const user = await this.userRepository.findUserById(id);
        if (!user) {
            throw new NotFoundError('User');
        }

        const updates = { ...profile };

        // 1. Handle Avatar upload if provided
        if (files?.avatar && this.mediaService) {
            updates.avatar = await this.mediaService.upload(files.avatar, 'avatar');
            // Cleanup old avatar
            if (user.avatar && typeof user.avatar === 'string' && !user.avatar.startsWith('http')) {
                await this.mediaService.remove(user.avatar);
            }
        }

        // 2. Handle Banner upload if provided
        if (files?.banner && this.mediaService) {
            updates.banner = await this.mediaService.upload(files.banner, 'banner');
            // Cleanup old banner
            if (user.banner && typeof user.banner === 'string' && !user.banner.startsWith('http')) {
                await this.mediaService.remove(user.banner);
            }
        }

        const updatedUser = await this.userRepository.updateUserProfile(id, updates);
        this.logger.info('Profile updated successfully', { userId: id });
        return this.stripSensitiveData(updatedUser);
    }

    async updateAvatar(userId: number, file: File) {
        const user = await this.userRepository.findUserById(userId);
        if (!user) throw new NotFoundError('User');

        let avatarUrl: string | undefined;
        if (this.mediaService) {
            avatarUrl = await this.mediaService.upload(file, 'avatar');

            // Optionally delete old avatar if it exists and is local
            if (user.avatar && typeof user.avatar === 'string' && !user.avatar.startsWith('http')) {
                await this.mediaService.remove(user.avatar);
            }
        }

        const updatedUser = await this.userRepository.updateUserProfile(userId, {
            avatar: avatarUrl,
        });
        this.logger.info('Avatar updated successfully', { userId });
        return this.stripSensitiveData(updatedUser);
    }

    async updatePassword(id: number, oldPassword: string, newPassword: string) {
        const user = await this.userRepository.findUserById(id);
        if (!user) {
            throw new NotFoundError('User');
        }
        const isPasswordValid = await verifyHash(user.password ?? '', oldPassword);
        if (!isPasswordValid) {
            throw new AuthenticationError('Invalid password');
        }
        const hashedNewPassword = await hashString(newPassword);
        const updatedUser = await this.userRepository.updatePassword(id, hashedNewPassword);
        this.logger.info('Password updated successfully', { userId: id });
        return updatedUser ? this.stripSensitiveData(updatedUser) : null;
    }

    async updateEmail(id: number, email: string, password: string) {
        const user = await this.userRepository.findUserById(id);
        if (!user) {
            throw new NotFoundError('User');
        }
        if (email === user.email) {
            throw new ConflictError('Email is already set');
        }
        const isEmailExist = await this.userRepository.findUserByEmail(email);
        if (isEmailExist) {
            throw new ConflictError('Email already exists');
        }
        const isPasswordValid = await verifyHash(user.password ?? '', password);
        if (!isPasswordValid) {
            throw new AuthenticationError('Invalid password');
        }
        const updatedUser = await this.userRepository.updateUserEmail(id, email);
        this.logger.info('Email updated successfully', { userId: id, email });
        return updatedUser ? this.stripSensitiveData(updatedUser) : null;
    }

    /// @TODO: for 2fa user needs to pass password
    ///      and we will provide ways - 1. email, 2. authenticator app, 3. recovery codes
    async updateTwoFactorEnabled(id: number, password: string, twoFactorEnabled: boolean) {
        const user = await this.userRepository.findUserById(id);
        if (!user) {
            throw new NotFoundError('User');
        }
        const isPasswordValid = await verifyHash(user.password ?? '', password);
        if (!isPasswordValid) {
            throw new AuthenticationError('Invalid password');
        }
        const updatedUser = await this.userRepository.updateTwoFactorEnabled(id, twoFactorEnabled);
        this.logger.info('Two factor enabled updated successfully', {
            userId: id,
            twoFactorEnabled,
        });
        return updatedUser ? this.stripSensitiveData(updatedUser) : null;
    }

    async deleteUser(id: number, password: string) {
        const user = await this.userRepository.findUserById(id);
        if (!user) {
            throw new NotFoundError('User');
        }
        const isPasswordValid = await verifyHash(user.password ?? '', password);
        if (!isPasswordValid) {
            throw new AuthenticationError('Invalid password');
        }
        const deletedUser = await this.userRepository.deleteUser(id);
        this.logger.info('User deleted successfully', { userId: id });
        return deletedUser ? this.stripSensitiveData(deletedUser) : null;
    }
}
