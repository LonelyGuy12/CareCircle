/**
 * CareCircle shared domain types.
 *
 * Single contract for frontend (`chillside/frontend`), backend
 * (`musha/backend`), MCP (`hamza/mcp`) and AI features (`lonely/ai`).
 * Phase 1 milestone (Sep 30): API contract, shared types and wireframes signed off.
 *
 * Frontend imports this file via a relative path until the monorepo
 * workspace is set up, e.g.:
 *   import type { Medication } from '../../../shared/types';
 *
 * All timestamps are ISO-8601 strings. All ids are strings (`med_…`,
 * `dose_…`, `appt_…`, `sum_…`, `alert_…`).
 */

export type DoseStatus = 'taken' | 'missed' | 'pending';

export type ConfirmVia = 'alexa' | 'dashboard' | 'caregiver' | 'agent';

export type AlertType = 'missed_dose' | 'ring_delivery';

export interface EmergencyContact {
    name: string;
    relation: string;
    phone: string;
}

export interface CareRecipient {
    id: string;
    name: string;
    age: number;
    conditions: string[];
    notes: string;
    emergencyContacts: EmergencyContact[];
}

export interface Caregiver {
    id: string;
    name: string;
}

export interface Medication {
    id: string;
    name: string;
    dosage: string;
    /** Daily dose times in 24-hour `HH:MM` format, e.g. `["09:00", "20:00"]`. */
    times: string[];
    instructions: string;
    /** Extra backend fields (DynamoDB). Optional so mock data stays valid. */
    aliases?: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface DoseLog {
    id: string;
    medicationId: string;
    /** When the dose was scheduled (ISO-8601). */
    scheduledAt: string;
    status: DoseStatus;
    confirmedAt?: string | null;
    confirmedVia?: string | null;
    /** Enriched by the backend from the linked medication. */
    medicationName?: string;
    dosage?: string;
}

export interface WeeklyAdherence {
    /** Short day label, e.g. `"Mon"`. */
    day: string;
    /** Share of scheduled doses confirmed, 0–100. */
    percent: number;
}

export interface Appointment {
    id: string;
    title: string;
    doctor: string;
    location: string;
    /** ISO-8601 date-time. */
    dateTime: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Summary {
    id: string;
    /** `YYYY-MM-DD`. */
    date: string;
    headline: string;
    text: string;
    flags: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface Alert {
    id: string;
    type: AlertType;
    message: string;
    createdAt: string;
    read: boolean;
}

/** Full dashboard payload (mirrors `frontend/src/data/mock.json`). */
export interface DashboardData {
    careRecipient: CareRecipient;
    caregiver: Caregiver;
    medications: Medication[];
    doseLogs: DoseLog[];
    weeklyAdherence: WeeklyAdherence[];
    appointments: Appointment[];
    summaries: Summary[];
    alerts: Alert[];
}

// ---------------------------------------------------------------------------
// API envelope (matches `backend/src/shared/json/*`)
// ---------------------------------------------------------------------------

export interface ApiSuccess<T> {
    success: true;
    message: string;
    data: T;
}

export interface ApiErrorShape {
    success: false;
    message: string;
    error: {
        code: string;
        details?: unknown;
    };
}

export type ApiResult<T> = ApiSuccess<T> | ApiErrorShape;

// ---------------------------------------------------------------------------
// Request / response inputs
// ---------------------------------------------------------------------------

export interface CreateMedicationInput {
    name: string;
    dosage: string;
    times: string[];
    instructions?: string;
}

export type UpdateMedicationInput = Partial<CreateMedicationInput>;

export interface CreateAppointmentInput {
    title: string;
    doctor: string;
    location: string;
    dateTime: string;
    notes?: string;
}

export type UpdateAppointmentInput = Partial<CreateAppointmentInput>;

export interface ConfirmDoseInput {
    doseId: string;
    via?: ConfirmVia;
}

export interface MarkAlertReadInput {
    read: boolean;
}

export interface QaInput {
    question: string;
}

export interface QaResponse {
    answer: string;
}

export interface AdherenceSummary {
    average: number;
    days: WeeklyAdherence[];
}
