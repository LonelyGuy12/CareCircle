import { z } from 'zod';

export const appointmentIdParamSchema = z.object({
    id: z.string().min(1, 'Appointment ID is required'),
});

export const createAppointmentSchema = z.object({
    title: z.string().min(1, 'Appointment title is required').max(150),
    doctor: z.string().default(''),
    location: z.string().default(''),
    dateTime: z.string().min(1, 'Date and time are required'),
    notes: z.string().max(1000).optional().default(''),
});

export const updateAppointmentSchema = z
    .object({
        title: z.string().min(1).max(150).optional(),
        doctor: z.string().optional(),
        location: z.string().optional(),
        dateTime: z.string().min(1).optional(),
        notes: z.string().max(1000).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field must be provided to update',
    });

export type AppointmentIdParam = z.infer<typeof appointmentIdParamSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
