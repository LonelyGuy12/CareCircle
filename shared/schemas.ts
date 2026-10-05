/**
 * CareCircle shared zod schemas.
 *
 * Validates the same shapes as `shared/types.ts`. Used by the Express API
 * (backend) and by the React forms (frontend) so both sides reject the same
 * bad payloads with the standard error format:
 *   `{ success: false, message, error: { code: "VALIDATION_ERROR", details } }`
 */
import { z } from 'zod';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export const timeStringSchema = z
    .string()
    .regex(TIME_RE, 'Times must look like 09:00 (24-hour, comma-separated).');

export const medicationInputSchema = z.object({
    name: z.string().trim().min(1, 'Medication name is required.').max(120),
    dosage: z.string().trim().min(1, 'Dosage is required (e.g. 5 mg).').max(60),
    times: z
        .array(timeStringSchema)
        .min(1, 'Add at least one daily time (e.g. 09:00, 20:00).')
        .max(12),
    instructions: z.string().trim().max(500).optional().default(''),
});

/** Full medication object as stored (has an id). */
export const medicationSchema = medicationInputSchema.extend({
    id: z.string().min(1),
});

export const medicationUpdateSchema = medicationInputSchema.partial();

/** Accepts the form's comma-separated `"09:00, 20:00"` string plus the array form. */
export const medicationFormSchema = z.object({
    name: z.string().trim().min(1, 'Medication name is required.').max(120),
    dosage: z.string().trim().min(1, 'Dosage is required (e.g. 5 mg).').max(60),
    times: z
        .string()
        .trim()
        .min(1, 'Add at least one daily time (e.g. 09:00, 20:00).')
        .refine((raw) => {
            const parts = raw
                .split(',')
                .map((t) => t.trim())
                .filter((t) => t.length > 0);
            return parts.length > 0 && parts.every((t) => TIME_RE.test(t));
        }, 'Times must look like 09:00 (24-hour, comma-separated).'),
    instructions: z.string().max(500).optional().default(''),
});

export type MedicationFormInput = z.infer<typeof medicationFormSchema>;

/** Parses `"09:00, 20:00"` into `["09:00", "20:00"]`. */
export function parseTimesString(raw: string): string[] {
    return raw
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
}

export const appointmentInputSchema = z.object({
    title: z.string().trim().min(1, 'Appointment title is required.').max(160),
    doctor: z.string().trim().min(1, 'Doctor or clinic is required.').max(160),
    location: z.string().trim().min(1, 'Location is required.').max(200),
    dateTime: z
        .string()
        .trim()
        .min(1, 'Date and time are required.')
        .refine((v) => !Number.isNaN(new Date(v).getTime()), 'Enter a valid date and time.'),
    notes: z.string().trim().max(1000).optional().default(''),
});

export const appointmentSchema = appointmentInputSchema.extend({
    id: z.string().min(1),
});

export const appointmentUpdateSchema = appointmentInputSchema.partial();

export type AppointmentFormInput = z.infer<typeof appointmentInputSchema>;

export const confirmDoseSchema = z.object({
    doseId: z.string().trim().min(1, 'doseId is required.'),
    via: z.enum(['alexa', 'dashboard', 'caregiver', 'agent']).optional().default('dashboard'),
});

export type ConfirmDoseInput = z.infer<typeof confirmDoseSchema>;

export const markAlertReadSchema = z.object({
    read: z.boolean(),
});

export const qaInputSchema = z.object({
    question: z.string().trim().min(1, 'Question is required.').max(1000),
});

/** Maps zod issues to the form's `{ field: message }` shape. */
export function toFieldErrors(
    issues: { path: (string | number)[]; message: string }[],
): Record<string, string> {
    const out: Record<string, string> = {};
    for (const issue of issues) {
        const key = String(issue.path[0] ?? 'form');
        if (!(key in out)) out[key] = issue.message;
    }
    return out;
}
