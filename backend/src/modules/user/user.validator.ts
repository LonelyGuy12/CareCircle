import * as z from 'zod';

export const userUpdateSchema = z
    .object({
        name: z
            .string()
            .min(3, 'Name must be at least 3 characters long')
            .max(50, 'Name must be at most 50 characters long'),
        bio: z.string().max(150, 'Bio must be at most 150 characters long'),
        link: z.string().optional(),
        avatar: z.any(),
        timezone: z.string(),
    })
    .partial();

export type UserUpdateSchema = z.infer<typeof userUpdateSchema>;

export const deleteUserSchema = z.object({
    password: z.string().min(1, 'Password is required'),
});

export type DeleteUserSchema = z.infer<typeof deleteUserSchema>;

export const changePasswordSchema = z.object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;

export const changeEmailSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export type ChangeEmailSchema = z.infer<typeof changeEmailSchema>;

export const changeTwoFactorSchema = z.object({
    password: z.string().min(1, 'Password is required'),
    twoFactorEnabled: z.boolean(),
});

export type ChangeTwoFactorSchema = z.infer<typeof changeTwoFactorSchema>;

export const userIdParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export type UserIdParamSchema = z.infer<typeof userIdParamSchema>;

export const avatarUpdateSchema = z.object({
    avatar: z.any(),
});
export type AvatarUpdateSchema = z.infer<typeof avatarUpdateSchema>;

export const bannerUpdateSchema = z.object({
    banner: z.any(),
});
export type BannerUpdateSchema = z.infer<typeof bannerUpdateSchema>;

export const paginationQuerySchema = z.object({
    limit: z.coerce.number().int().positive().default(10),
    cursor: z.coerce.number().int().positive().optional(),
    offset: z.coerce.number().int().nonnegative().optional(),
});

export type PaginationQuerySchema = z.infer<typeof paginationQuerySchema>;
