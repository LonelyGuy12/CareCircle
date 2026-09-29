import { config } from '@platform/config';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

/**
 * Interface representing the payload structure for JWT tokens.
 */
export interface TokenPayload {
    id: number;
    email?: string;
    username?: string;
}

/**
 * Generates a short-lived JWT access token.
 * Contains user identification and basic info (email, username).
 *
 * @param user - Object matching TokenPayload interface containing user id and optional info.
 * @returns A JWT access token string signed with the ACCESS_TOKEN_SECRET.
 */
export function generateAccessToken(user: TokenPayload): string {
    const payload = {
        id: user.id,
        email: user.email,
        username: user.username,
    };

    return jwt.sign(payload, config.access_token_secret, {
        expiresIn: config.access_token_expiry as jwt.SignOptions['expiresIn'],
    });
}

/**
 * Generates a long-lived JWT refresh token.
 * Typically stored in a secure cookie or database to issue new access tokens.
 * Only contains the user id to keep the payload minimal.
 *
 * @param user - Object matching TokenPayload interface containing user id.
 * @returns A JWT refresh token string signed with the REFRESH_TOKEN_SECRET.
 */
export function generateRefreshToken(user: TokenPayload): string {
    const payload = {
        id: user.id,
    };

    return jwt.sign(payload, config.refresh_token_secret, {
        expiresIn: config.refresh_token_expiry as jwt.SignOptions['expiresIn'],
    });
}

/**
 * Generates both access and refresh tokens at once for a given user.
 *
 * @param user - Object matching TokenPayload interface.
 * @returns An object containing both accessToken and refreshToken.
 */
export function generateAuthTokens(user: TokenPayload): {
    accessToken: string;
    refreshToken: string;
} {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    return { accessToken, refreshToken };
}

/**
 * Verifies the validity of a JWT token based on the specified type.
 *
 * @param token - The JWT string to verify.
 * @param tokenType - Either 'access' or 'refresh' to determine which secret to use for verification.
 * @returns The decoded TokenPayload if verification is successful.
 * @throws An error if the token is invalid or expired.
 */
export function verifyToken(token: string, tokenType: 'access' | 'refresh'): TokenPayload {
    return jwt.verify(
        token,
        tokenType === 'access' ? config.access_token_secret : config.refresh_token_secret,
    ) as TokenPayload;
}

/**
 * Hashes a string using Argon2id.
 * Argon2id is a hybrid of Argon2i and Argon2d, resistant to GPU/ASIC cracking
 * and side-channel attacks.
 *
 * @param string - The raw string to be hashed.
 * @returns A Promise that resolves to the hashed string.
 */
export async function hashString(string: string): Promise<string> {
    return argon2.hash(string, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
    });
}

/**
 * Verifies if a plain-text string matches a previously generated Argon2 hash.
 *
 * @param hash - The hashed string stored in the database.
 * @param string - The plain-text string provided by the user (e.g., during login).
 * @returns A Promise that resolves to true if the string matches the hash, false otherwise.
 */
export async function verifyHash(hash: string, string: string): Promise<boolean> {
    try {
        return await argon2.verify(hash, string);
    } catch {
        return false;
    }
}
