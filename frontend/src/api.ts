/**
 * CareCircle API client (frontend owner: Chillsidealways).
 *
 * Phase 3 (integration, Oct 10–16): the dashboard talks to the live Express
 * API when `VITE_API_URL` is set (e.g. `http://localhost:5500`). With no
 * `VITE_API_URL` it runs on `data/mock.json` so every module stays demoable
 * alone and the demo never goes blank.
 *
 * Live endpoints (Musha/backend, mounted under `/` and `/api`):
 *   medications: GET / POST / · GET / PATCH / DELETE /:id
 *   doses:       GET /today · GET /due · POST /:id/confirm { via }
 *   appointments: GET / POST / · GET /next · GET /:id · PATCH / DELETE /:id
 *   summaries:   GET / · GET /:date (YYYY-MM-DD) · POST /
 *
 * No backend endpoints yet (stay local): alerts, weekly adherence,
 * care recipient/profile, caregiver Q&A (`/api/qa` is attempted first and
 * falls back to on-device answers until lonely/ai lands it).
 *
 * Standard envelope (backend):
 *   success: `{ success: true, message, data }`
 *   error:   `{ success: false, message, error: { code, details } }`
 */
import type {
    Alert,
    ApiErrorShape,
    Appointment,
    ConfirmVia,
    CreateAppointmentInput,
    CreateMedicationInput,
    DoseLog,
    Medication,
    QaResponse,
    Summary,
    UpdateAppointmentInput,
    UpdateMedicationInput,
    WeeklyAdherence,
} from '../../shared/types';
import mockData from './data/mock.json';

export interface ApiRequestOptions extends RequestInit {
    timeoutMs?: number;
}

export class ApiError extends Error {
    readonly status: number;
    readonly code: string;
    readonly details?: unknown;

    constructor(status: number, message: string, code = 'REQUEST_FAILED', details?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.details = details;
    }

    static fromEnvelope(status: number, envelope: ApiErrorShape): ApiError {
        return new ApiError(status, envelope.message, envelope.error.code, envelope.error.details);
    }
}

const BASE_URL = (import.meta.env?.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

/** True while there is no live API configured (mock-data mode). */
export const isMockMode = BASE_URL.length === 0;

function isEnvelope(value: unknown): value is { success: boolean; message: string; data: unknown } {
    return (
        typeof value === 'object' &&
        value !== null &&
        'success' in value &&
        'data' in value &&
        'message' in value
    );
}

function unwrap<T>(payload: unknown): T {
    if (isEnvelope(payload)) {
        if (!payload.success) {
            throw ApiError.fromEnvelope(400, payload as unknown as ApiErrorShape);
        }
        return payload.data as T;
    }
    return payload as T;
}

/** Live request. Throws ApiError on HTTP failures — no silent mock fallback. */
async function request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const { timeoutMs = 8000, ...init } = options;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    let res: Response;
    try {
        res = await fetch(`${BASE_URL}${path}`, {
            headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
            ...init,
            signal: controller.signal,
        });
    } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
            throw new ApiError(0, 'The request timed out. Check the API URL and retry.', 'TIMEOUT');
        }
        throw new ApiError(
            0,
            'Cannot reach the API. Is the backend running at VITE_API_URL?',
            'NETWORK_ERROR',
        );
    } finally {
        window.clearTimeout(timer);
    }
    const body: unknown = await res.json().catch(() => null);
    if (!res.ok) {
        if (body !== null && typeof body === 'object' && 'error' in (body as object)) {
            throw ApiError.fromEnvelope(res.status, body as ApiErrorShape);
        }
        // Some failures (e.g. CSRF 403) carry only { success, message }.
        let message = `Request failed (${res.status})`;
        if (body !== null && typeof body === 'object' && 'message' in body) {
            const maybe = (body as { message?: unknown }).message;
            if (typeof maybe === 'string' && maybe.length > 0) message = maybe;
        }
        throw new ApiError(res.status, message);
    }
    return unwrap<T>(body);
}

/** Local mock data (same shapes as the live API returns). */
const mock = {
    medications: () => mockData.medications as Medication[],
    medication: (id: string) =>
        (mockData.medications as Medication[]).find((m) => m.id === id) ?? null,
    dosesToday: () =>
        [...(mockData.doseLogs as DoseLog[])].sort((a, b) =>
            a.scheduledAt.localeCompare(b.scheduledAt),
        ),
    dosesDue: () => (mockData.doseLogs as DoseLog[]).filter((d) => d.status === 'pending'),
    appointments: () =>
        [...(mockData.appointments as Appointment[])].sort((a, b) =>
            a.dateTime.localeCompare(b.dateTime),
        ),
    nextAppointment: () =>
        [...(mockData.appointments as Appointment[])].sort((a, b) =>
            a.dateTime.localeCompare(b.dateTime),
        )[0] ?? null,
    alerts: () => mockData.alerts as Alert[],
    summaries: () => mockData.summaries as Summary[],
    summary: (date: string) =>
        (mockData.summaries as Summary[]).find((s) => s.date === date) ?? null,
    adherenceWeekly: () => mockData.weeklyAdherence as WeeklyAdherence[],
};

const json = (body: unknown) => ({ method: 'POST', body: JSON.stringify(body) }) as const;

export interface QaAnswer extends QaResponse {
    /** False when the answer came from on-device mock data (no /api/qa yet). */
    live: boolean;
}

export const api = {
    baseUrl: BASE_URL,
    isMockMode,

    // -- health ----------------------------------------------------------
    health(): Promise<{ status: string }> {
        if (isMockMode) return Promise.resolve({ status: 'ok (mock)' });
        return request<{ status: string }>('/api/health');
    },

    // -- medications ------------------------------------------------------
    listMedications(): Promise<Medication[]> {
        if (isMockMode) return Promise.resolve(mock.medications());
        return request<Medication[]>('/api/medications');
    },

    getMedication(id: string): Promise<Medication | null> {
        if (isMockMode) return Promise.resolve(mock.medication(id));
        return request<Medication>(`/api/medications/${encodeURIComponent(id)}`);
    },

    createMedication(input: CreateMedicationInput): Promise<Medication> {
        if (isMockMode) {
            return Promise.resolve({ id: `med_${Date.now()}`, instructions: '', ...input });
        }
        return request<Medication>('/api/medications', json(input));
    },

    updateMedication(id: string, patch: UpdateMedicationInput): Promise<Medication> {
        if (isMockMode) {
            const current = mock.medication(id);
            if (!current) throw new ApiError(404, 'Medication not found.', 'NOT_FOUND');
            return Promise.resolve({ ...current, ...patch });
        }
        return request<Medication>(`/api/medications/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            body: JSON.stringify(patch),
        });
    },

    deleteMedication(id: string): Promise<void> {
        if (isMockMode) return Promise.resolve();
        return request<void>(`/api/medications/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        }).then(() => undefined);
    },

    // -- doses -------------------------------------------------------------
    listTodayDoses(): Promise<DoseLog[]> {
        if (isMockMode) return Promise.resolve(mock.dosesToday());
        return request<DoseLog[]>('/api/doses/today');
    },

    listDueDoses(): Promise<DoseLog[]> {
        if (isMockMode) return Promise.resolve(mock.dosesDue());
        return request<DoseLog[]>('/api/doses/due');
    },

    /**
     * Live: POST /api/doses/:id/confirm { via }. `via` follows the backend
     * enum ('alexa' | 'dashboard' | 'caregiver'); anything else is sent as
     * 'dashboard' so validation never rejects the confirm.
     */
    confirmDose(doseId: string, via: ConfirmVia = 'dashboard'): Promise<DoseLog> {
        const safeVia = via === 'alexa' || via === 'caregiver' ? via : 'dashboard';
        if (isMockMode) {
            const dose = mock.dosesToday().find((d) => d.id === doseId);
            if (!dose) throw new ApiError(404, 'Dose not found.', 'NOT_FOUND');
            return Promise.resolve({
                ...dose,
                status: 'taken',
                confirmedAt: new Date().toISOString(),
                confirmedVia: safeVia,
            });
        }
        return request<DoseLog>(`/api/doses/${encodeURIComponent(doseId)}/confirm`, {
            method: 'POST',
            body: JSON.stringify({ via: safeVia }),
        });
    },

    // -- appointments -------------------------------------------------------
    listAppointments(): Promise<Appointment[]> {
        if (isMockMode) return Promise.resolve(mock.appointments());
        return request<Appointment[]>('/api/appointments');
    },

    nextAppointment(): Promise<Appointment | null> {
        if (isMockMode) return Promise.resolve(mock.nextAppointment());
        return request<Appointment | null>('/api/appointments/next');
    },

    createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
        if (isMockMode) {
            return Promise.resolve({ id: `appt_${Date.now()}`, notes: '', ...input });
        }
        return request<Appointment>('/api/appointments', json(input));
    },

    updateAppointment(id: string, patch: UpdateAppointmentInput): Promise<Appointment> {
        if (isMockMode) {
            const current = mock.appointments().find((a) => a.id === id);
            if (!current) throw new ApiError(404, 'Appointment not found.', 'NOT_FOUND');
            return Promise.resolve({ ...current, ...patch });
        }
        return request<Appointment>(`/api/appointments/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            body: JSON.stringify(patch),
        });
    },

    deleteAppointment(id: string): Promise<void> {
        if (isMockMode) return Promise.resolve();
        return request<void>(`/api/appointments/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        }).then(() => undefined);
    },

    // -- alerts: local-only (no backend endpoints yet) -----------------------
    listAlerts(): Promise<Alert[]> {
        return Promise.resolve(mock.alerts());
    },

    markAlertRead(id: string, read = true): Promise<Alert | null> {
        const alert = mock.alerts().find((a) => a.id === id) ?? null;
        return Promise.resolve(alert ? { ...alert, read } : null);
    },

    markAllAlertsRead(): Promise<void> {
        return Promise.resolve();
    },

    // -- summaries ------------------------------------------------------------
    listSummaries(): Promise<Summary[]> {
        if (isMockMode) return Promise.resolve(mock.summaries());
        return request<Summary[]>('/api/summaries');
    },

    getSummaryByDate(date: string): Promise<Summary | null> {
        if (isMockMode) return Promise.resolve(mock.summary(date));
        return request<Summary | null>(`/api/summaries/${encodeURIComponent(date)}`);
    },

    // -- adherence: local-only (no backend endpoint yet) -----------------------
    weeklyAdherence(): Promise<WeeklyAdherence[]> {
        return Promise.resolve(mock.adherenceWeekly());
    },

    // -- caregiver Q&A (Oct 14: try live /api/qa, fall back to device) ---------
    async askQuestion(question: string): Promise<QaAnswer> {
        if (!isMockMode) {
            try {
                const live = await request<QaResponse>('/api/qa', json({ question }));
                return { ...live, live: true };
            } catch {
                // No /api/qa on the backend yet — answer on-device below.
            }
        }
        return {
            answer: 'Live answers arrive with integration. Showing on-device answers for now.',
            live: false,
        };
    },
};

export type CareCircleApi = typeof api;
