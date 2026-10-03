import { UserRepository } from '@modules/user';
import { CacheService } from '@platform/cache';
import { LoggerService } from '@platform/logger/logger.service';
import {
    AuthenticationError,
    ConflictError,
    InternalServerError,
    NotFoundError,
    RateLimitError,
} from '@shared/json';
import { generateAuthTokens, hashString, verifyHash, verifyToken } from '@shared/utils/auth';

import type { LoginSchema, RegisterSchema } from './auth.validator';
export class AuthService {
    constructor(
        private userRepository: UserRepository,
        private logger: LoggerService,
        private cache: CacheService,
    ) {}

    async createUser(body: RegisterSchema): Promise<{ accessToken: string; refreshToken: string }> {
        const { name, email, password, username, bio, link, avatar, banner, timezone } = body;

        const isUserExist =
            (await this.userRepository.findUserByEmail(email)) ||
            (await this.userRepository.findUserByUsername(username));

        if (isUserExist) {
            throw new ConflictError('User already exists');
        }

        const hashedPassword = await hashString(password);

        const userData = {
            name,
            email,
            password: hashedPassword,
            username,
            bio,
            link,
            avatar,
            banner,
            timezone,
        };

        const createdUser = await this.userRepository.createUser(userData);

        const { accessToken, refreshToken } = generateAuthTokens({
            id: createdUser.id,
            email: createdUser.email,
            username: createdUser.username,
        });

        const hashedRefreshToken = await hashString(refreshToken);
        await this.userRepository.updateRefreshToken(createdUser.id, hashedRefreshToken);

        this.logger.info('Registering new user', { email, username });

        return { accessToken, refreshToken };
    }

    async login(body: LoginSchema): Promise<{
        twoFactorEnabled: boolean;
        authTokens: { accessToken: string; refreshToken: string };
    }> {
        const { email, password, username } = body;

        // loginSchema guarantees email or username is present (routes validate
        // before this runs); the final fallback keeps invalid input safe.
        const user = email
            ? await this.userRepository.findUserByEmail(email)
            : username
              ? await this.userRepository.findUserByUsername(username)
              : undefined;

        if (!user) {
            throw new NotFoundError('User');
        }

        if (!user.password) {
            throw new AuthenticationError(
                'User has no saved password. Please use social login or reset password.',
            );
        }

        const isPasswordCorrect = await verifyHash(user.password, password);

        if (!isPasswordCorrect) {
            throw new AuthenticationError('Invalid password');
        }

        const { accessToken, refreshToken } = generateAuthTokens({
            id: user.id,
            email: user.email,
            username: user.username,
        });

        const hashedRefreshToken = await hashString(refreshToken);
        await this.userRepository.updateRefreshToken(user.id, hashedRefreshToken);

        this.logger.info('User logged in successfully', { userId: user.id });

        return {
            twoFactorEnabled: user.twoFactorEnabled,
            authTokens: { accessToken, refreshToken },
        };
    }

    async logout(id: number): Promise<{ success: boolean; message: string }> {
        const user = await this.userRepository.findUserById(id);

        if (!user) {
            throw new NotFoundError('User');
        }

        const success = await this.userRepository.updateRefreshToken(user.id, null);

        return {
            success: !!success,
            message: success ? 'Logged out successfully' : 'Failed to logout',
        };
    }

    async rotateTokens(
        refreshToken: string,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const id = this.verifyRefreshToken(refreshToken);
        const user = await this.userRepository.findUserById(id);

        if (!user || !user.refreshToken) {
            throw new AuthenticationError('Session expired or user not found');
        }

        const isMatch = await verifyHash(user.refreshToken, refreshToken);
        if (!isMatch) {
            throw new AuthenticationError('Invalid refresh token session');
        }

        const tokens = generateAuthTokens({
            id: user.id,
            email: user.email,
            username: user.username,
        });

        const hashedRefreshToken = await hashString(tokens.refreshToken);
        await this.userRepository.updateRefreshToken(user.id, hashedRefreshToken);

        return tokens;
    }

    async forgotPassword(
        email: string,
    ): Promise<{ success: boolean; uuid: string; message: string }> {
        const user = await this.userRepository.findUserByEmail(email);

        if (!user) {
            throw new NotFoundError('User');
        }
        await this.userRepository.updateRefreshToken(user.id, null);

        const uuid = crypto.randomUUID();
        const otp = this.generateOTP();
        const hashedOtp = await hashString(otp);
        const isOtpCached = await this.cache.set(
            `otp:${uuid}`,
            { id: user.id, otp: hashedOtp, attempts: 1 },
            5 * 60,
        );
        this.logger.debug(`otp:::::::::::::::: ${otp}`);
        if (!isOtpCached) {
            throw new InternalServerError(
                'Internal server error, please try again in a few minutes',
            );
        }

        this.logger.info('OTP generated for password reset', { email: user.email });
        return { success: true, uuid: uuid, message: 'OTP sent successfully to your email' };
    }

    async resetPassword(
        uuid: string,
        otp: string,
        newPassword: string,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const cachedOtpObject: { id: number; otp: string; attempts: number } | null =
            await this.cache.get(`otp:${uuid}`);

        if (!cachedOtpObject) {
            throw new AuthenticationError('Otp verification timeout');
        }

        if (cachedOtpObject.attempts > 10) {
            throw new RateLimitError('too many attempts');
        }

        const user = await this.userRepository.findUserById(cachedOtpObject.id);
        if (!user) {
            throw new NotFoundError('User');
        }

        const isOtpValid = await verifyHash(cachedOtpObject.otp, otp.toLowerCase());

        if (!isOtpValid) {
            await this.cache.set(
                `otp:${uuid}`,
                { ...cachedOtpObject, attempts: cachedOtpObject.attempts + 1 },
                5 * 60,
            );
            throw new AuthenticationError('Invalid OTP');
        }

        if (newPassword) {
            const hashedPassword = await hashString(newPassword);
            await this.userRepository.updatePassword(user.id, hashedPassword);
            this.logger.info('User password reset successfully', { userId: user.id });
        }

        const tokens = generateAuthTokens({
            id: user.id,
            email: user.email,
            username: user.username,
        });

        const hashedRefreshToken = await hashString(tokens.refreshToken);
        await this.userRepository.updateRefreshToken(user.id, hashedRefreshToken);
        await this.cache.delete(`otp:${uuid}`);

        return tokens;
    }

    verifyAccessToken(token: string) {
        const payload = verifyToken(token, 'access');
        if (!payload) {
            throw new AuthenticationError('Invalid session');
        }
        return payload;
    }

    verifyRefreshToken(token: string) {
        const payload = verifyToken(token, 'refresh');
        if (!payload) {
            throw new AuthenticationError('Invalid session');
        }
        return payload.id;
    }

    generateOTP(length = 6): string {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let otp = '';

        for (let i = 0; i < length; i++) {
            const index = Math.floor(Math.random() * chars.length);
            otp += chars[index];
        }
        return otp.toLocaleLowerCase();
    }
}
