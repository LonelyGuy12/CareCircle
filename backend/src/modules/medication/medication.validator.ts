import { z } from 'zod';

export const medicationIdParamSchema = z.object({
    id: z.string().min(1, 'Medication ID is required'),
});

export const createMedicationSchema = z.object({
    name: z.string().min(1, 'Medication name is required').max(100),
    dosage: z.string().min(1, 'Dosage is required (e.g. 5 mg)').max(50),
    times: z
        .array(
            z
                .string()
                .regex(
                    /^([01]\d|2[0-3]):[0-5]\d$/,
                    'Time must be in 24-hour format HH:MM (e.g. 09:00)',
                ),
        )
        .min(1, 'At least one scheduled time is required'),
    instructions: z.string().max(500).default(''),
    aliases: z.array(z.string()).optional().default([]),
});

export const updateMedicationSchema = z
    .object({
        name: z.string().min(1).max(100).optional(),
        dosage: z.string().min(1).max(50).optional(),
        times: z
            .array(
                z
                    .string()
                    .regex(
                        /^([01]\d|2[0-3]):[0-5]\d$/,
                        'Time must be in 24-hour format HH:MM (e.g. 09:00)',
                    ),
            )
            .min(1)
            .optional(),
        instructions: z.string().max(500).optional(),
        aliases: z.array(z.string()).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field must be provided to update',
    });

export type MedicationIdParam = z.infer<typeof medicationIdParamSchema>;
export type CreateMedicationInput = z.infer<typeof createMedicationSchema>;
export type UpdateMedicationInput = z.infer<typeof updateMedicationSchema>;
