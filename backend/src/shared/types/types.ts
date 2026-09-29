import { RegisterSchema } from '@modules/auth/auth.validator';

/// USER SCHEMA
export interface IUser {
    id: number;
    name: string;
    email: string;
    username: string;
    bio?: string | null;
    link?: string | null;
    avatar?: string | null;
    banner?: string | null;
    isVerified: boolean;
    isUserBanned: boolean;
    followersCount: number;
    followingCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export type IUpdateUserProfile = Partial<Omit<IUser, 'id' | 'email' | 'createdAt' | 'updatedAt'>>;

export enum OllamaModels {
    LFM2_5_THINKING = 'lfm2.5-thinking:1.2b',
    QWEN3 = 'qwen3:1.7b',
    QWEN3_EMBEDDING = 'qwen3-embedding:0.6b',
    QWEN3_0_6B = 'qwen3:0.6b',
    FUNCTIONGEMMA = 'functiongemma:270m',
}

export enum GeminiModels {
    GEMINI_1_5_FLASH = 'gemini-1.5-flash',
    GEMINI_1_5_PRO = 'gemini-1.5-pro',
    GEMINI_2_0_FLASH = 'gemini-2.0-flash',
    GEMINI_2_5_FLASH = 'gemini-2.5-flash',
}
