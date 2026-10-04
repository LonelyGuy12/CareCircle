import { z } from 'zod';

export const dateParamSchema = z.object({
    date: z.string().min(1, 'Date is required'),
});

export const createSummarySchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in format YYYY-MM-DD'),
    headline: z.string().min(1, 'Headline is required').max(200),
    text: z.string().min(1, 'Summary text is required'),
    flags: z.array(z.string()).optional().default([]),
});

export type DateParam = z.infer<typeof dateParamSchema>;
export type CreateSummaryInput = z.infer<typeof createSummarySchema>;
