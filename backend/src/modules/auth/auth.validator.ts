import { z } from 'zod';

export const registerSchema = z
    .object({
        name: z
            .string()
            .min(3, 'Name must be at least 3 characters long')
            .max(50, 'Name must be at most 50 characters long'),
        email: z.string().email('Invalid email address'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters long')
            .max(24, 'Password must be at most 24 characters long'),
        confirmPassword: z
            .string()
            .min(8, 'Confirm Password must be at least 8 characters long')
            .max(24, 'Confirm Password must be at most 24 characters long'),
        username: z
            .string()
            .regex(
                /^[a-z0-9_]{5,16}$/i,
                'Username must be 5-16 characters long and contain only letters, numbers, and underscores',
            ),
        bio: z.string().max(150, 'Bio must be at most 150 characters long').optional(),
        link: z.string().url('Invalid website URL').optional(),
        avatar: z.string().url('Avatar URL is invalid').optional(),
        banner: z.string().url('Banner URL is invalid').optional(),
        timezone: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })
    .refine((data) => data.username === data.username.toLowerCase(), {
        message: 'Username must be in lowercase',
        path: ['username'],
    })
    .transform(({ confirmPassword, email, username, ...rest }) => {
        return {
            ...rest,
            email: email.toLowerCase(),
            username: username.toLowerCase(),
        };
    });

export const loginSchema = z
    .object({
        email: z.string().email('Invalid email address').optional().or(z.literal('')),
        username: z
            .string()
            .regex(
                /^[a-z0-9_]{5,16}$/i,
                'Username must be 5-16 characters long and contain only letters, numbers, and underscores',
            )
            .optional()
            .or(z.literal('')),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters long')
            .max(24, 'Password must be at most 24 characters long'),
    })
    .refine(
        (data) => (data.email && data.email !== '') || (data.username && data.username !== ''),
        {
            message: 'Email or Username is required',
            path: ['email', 'username'],
        },
    )
    .transform(({ email, username, ...rest }) => {
        return {
            email: email?.toLowerCase(),
            username: username?.toLowerCase(),
            ...rest,
        };
    });

export const forgotPasswordSchema = z
    .object({
        email: z.string().email('Invalid email address'),
    })
    .transform(({ email }) => email.toLowerCase());

export const resetPasswordSchema = z
    .object({
        uuid: z.string().uuid('Invalid reset session'),
        otp: z
            .string()
            .min(6, 'Code must be 6 characters')
            .max(6, 'Code must be 6 characters')
            .regex(/^[a-z0-9]{6}$/i, 'Code must be 6 alphanumeric characters'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters long')
            .max(24, 'Password must be at most 24 characters long'),
        confirmPassword: z
            .string()
            .min(8, 'Confirm Password must be at least 8 characters long')
            .max(24, 'Confirm Password must be at most 24 characters long'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })
    .transform(({ confirmPassword, ...data }) => {
        return { ...data, otp: data.otp.toLowerCase() };
    });

export const verifyEmailSchema = z.object({
    email: z.string().email('Invalid email address'),
    token: z.string().uuid('Invalid token'),
    code: z
        .string()
        .min(6, 'Code must be at least 6 characters')
        .max(6, 'Code must be at most 6 characters')
        .regex(/^[a-z0-9]{6}$/i, 'Code must be 6 alphanumeric characters'),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>;
