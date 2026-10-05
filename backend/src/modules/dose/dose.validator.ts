import { z } from 'zod';

export const doseIdParamSchema = z.object({
    id: z.string().min(1, 'Dose ID is required'),
});

export const confirmDoseSchema = z.object({
    via: z.enum(['alexa', 'dashboard', 'caregiver']).optional().default('dashboard'),
});

export const createDoseSchema = z.object({
    medicationId: z.string().min(1, 'Medication ID is required'),
    scheduledAt: z.string().min(1, 'Scheduled time is required'),
    status: z.enum(['pending', 'taken', 'missed']).optional().default('pending'),
    confirmedAt: z.string().nullable().optional(),
    confirmedVia: z.enum(['alexa', 'dashboard', 'caregiver']).nullable().optional(),
});

export type DoseIdParam = z.infer<typeof doseIdParamSchema>;
export type ConfirmDoseInput = z.infer<typeof confirmDoseSchema>;
export type CreateDoseInput = z.infer<typeof createDoseSchema>;
