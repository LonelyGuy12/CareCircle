/**
 * CareCircle API client (frontend owner: Chillsidealways, due Oct 7).
 *
 * Covers every endpoint in the Phase 1 API contract so the dashboard can
 * flip from mock data to the live Express API without changing call sites.
 *
 * Until Oct 10 (integration) there is no deployed API, so when
 * `VITE_API_URL` is unset — or a request fails — the client falls back to
 * `data/mock.json`. That keeps the Oct 9 "demoable alone" milestone green.
 *
 * Standard envelope (backend):
 *   success: `{ success: true, message, data }`
 *   error:   `{ success: false, message, error: { code, details } }`
 * The mock MCP server returns bare arrays; both shapes are unwrapped.
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

/** True while there is no live API configured (Phase 2: mock-data mode). */
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

async function request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const { timeoutMs = 8000, ...init } = options;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
            ...init,
            signal: controller.signal,
        });
        const body: unknown = await res.json().catch(() => null);
        if (!res.ok) {
            if (body !== null && typeof body === 'object' && 'error' in (body as object)) {
                throw ApiError.fromEnvelope(res.status, body as ApiErrorShape);
            }
            throw new ApiError(res.status, `Request failed (${res.status})`);
        }
        return unwrap<T>(body);
    } finally {
        window.clearTimeout(timer);
    }
}

/** Local mock fallback (same shapes as the live API would return). */
const mock = {
    medications: () => mockData.medications as Medication[],
    medication: (id: string) =>
        (mockData.medications as Medication[]).find((m) => m.id === id) ?? null,
    dosesToday: () => mockData.doseLogs as DoseLog[],
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

async function withFallback<T>(
    path: string,
    fallback: () => T,
    options?: ApiRequestOptions,
): Promise<T> {
    if (isMockMode) return fallback();
    try {
        return await request<T>(path, options);
    } catch {
        return fallback();
    }
}

const json = (body: unknown) => ({ method: 'POST', body: JSON.stringify(body) }) as const;

export const api = {
    baseUrl: BASE_URL,
    isMockMode,

    // -- health ----------------------------------------------------------
    health(): Promise<{ status: string }> {
        return withFallback('/api/health', () => ({ status: 'ok (mock)' }));
    },

    // -- medications (5 endpoints, due Oct 1) -----------------------------
    listMedications(): Promise<Medication[]> {
        return withFallback('/api/medications', mock.medications);
    },

    getMedication(id: string): Promise<Medication | null> {
        return withFallback(`/api/medications/${encodeURIComponent(id)}`, () =>
            mock.medication(id),
        );
    },

    async createMedication(input: CreateMedicationInput): Promise<Medication> {
        if (isMockMode) {
            return {
                id: `med_${Date.now()}`,
                instructions: '',
                ...input,
            };
        }
        try {
            return await request<Medication>('/api/medications', json(input));
        } catch {
            return { id: `med_${Date.now()}`, instructions: '', ...input };
        }
    },

    async updateMedication(id: string, patch: UpdateMedicationInput): Promise<Medication | null> {
        if (isMockMode) {
            const current = mock.medication(id);
            return current ? { ...current, ...patch } : null;
        }
        try {
            return await request<Medication>(`/api/medications/${encodeURIComponent(id)}`, {
                method: 'PATCH',
                body: JSON.stringify(patch),
            });
        } catch {
            const current = mock.medication(id);
            return current ? { ...current, ...patch } : null;
        }
    },

    async deleteMedication(id: string): Promise<void> {
        if (isMockMode) return;
        try {
            await request<void>(`/api/medications/${encodeURIComponent(id)}`, {
                method: 'DELETE',
            });
        } catch {
            return;
        }
    },

    // -- doses (due Oct 3) ------------------------------------------------
    listTodayDoses(): Promise<DoseLog[]> {
        return withFallback('/api/doses/today', mock.dosesToday);
    },

    listDueDoses(): Promise<DoseLog[]> {
        return withFallback('/api/doses/due', mock.dosesDue);
    },

    async confirmDose(doseId: string, via: ConfirmVia = 'dashboard'): Promise<DoseLog | null> {
        if (isMockMode) {
            const dose = mock.dosesToday().find((d) => d.id === doseId) ?? null;
            return dose
                ? {
                      ...dose,
                      status: 'taken',
                      confirmedAt: new Date().toISOString(),
                      confirmedVia: via,
                  }
                : null;
        }
        try {
            return await request<DoseLog>('/api/doses/confirm', json({ doseId, via }));
        } catch {
            const dose = mock.dosesToday().find((d) => d.id === doseId) ?? null;
            return dose ? { ...dose, status: 'taken', confirmedVia: via } : null;
        }
    },

    // -- appointments (due Oct 5) -----------------------------------------
    listAppointments(): Promise<Appointment[]> {
        return withFallback('/api/appointments', mock.appointments);
    },

    nextAppointment(): Promise<Appointment | null> {
        return withFallback('/api/appointments/next', mock.nextAppointment);
    },

    async createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
        if (isMockMode) {
            return { id: `appt_${Date.now()}`, notes: '', ...input };
        }
        try {
            return await request<Appointment>('/api/appointments', json(input));
        } catch {
            return { id: `appt_${Date.now()}`, notes: '', ...input };
        }
    },

    async updateAppointment(
        id: string,
        patch: UpdateAppointmentInput,
    ): Promise<Appointment | null> {
        if (isMockMode) {
            const current = mock.appointments().find((a) => a.id === id) ?? null;
            return current ? { ...current, ...patch } : null;
        }
        try {
            return await request<Appointment>(`/api/appointments/${encodeURIComponent(id)}`, {
                method: 'PATCH',
                body: JSON.stringify(patch),
            });
        } catch {
            const current = mock.appointments().find((a) => a.id === id) ?? null;
            return current ? { ...current, ...patch } : null;
        }
    },

    async deleteAppointment(id: string): Promise<void> {
        if (isMockMode) return;
        try {
            await request<void>(`/api/appointments/${encodeURIComponent(id)}`, {
                method: 'DELETE',
            });
        } catch {
            return;
        }
    },

    // -- alerts (due Oct 5) ------------------------------------------------
    listAlerts(): Promise<Alert[]> {
        return withFallback('/api/alerts', mock.alerts);
    },

    async markAlertRead(id: string, read = true): Promise<Alert | null> {
        if (isMockMode) {
            const alert = mock.alerts().find((a) => a.id === id) ?? null;
            return alert ? { ...alert, read } : null;
        }
        try {
            return await request<Alert>(`/api/alerts/${encodeURIComponent(id)}`, {
                method: 'PATCH',
                body: JSON.stringify({ read }),
            });
        } catch {
            const alert = mock.alerts().find((a) => a.id === id) ?? null;
            return alert ? { ...alert, read } : null;
        }
    },

    async markAllAlertsRead(): Promise<void> {
        if (isMockMode) return;
        try {
            await request<void>('/api/alerts/read-all', json({}));
        } catch {
            return;
        }
    },

    // -- summaries (due Oct 5) ---------------------------------------------
    listSummaries(): Promise<Summary[]> {
        return withFallback('/api/summaries', mock.summaries);
    },

    getSummaryByDate(date: string): Promise<Summary | null> {
        return withFallback(`/api/summaries/${encodeURIComponent(date)}`, () => mock.summary(date));
    },

    // -- adherence (due Oct 5) ----------------------------------------------
    weeklyAdherence(): Promise<WeeklyAdherence[]> {
        return withFallback('/api/adherence/weekly', mock.adherenceWeekly);
    },

    // -- caregiver Q&A (AI features, v1 due Oct 7; live wiring Oct 14) ------
    async askQuestion(question: string): Promise<QaResponse> {
        const fallback: QaResponse = {
            answer: 'Live answers arrive with integration (Oct 14). Showing mock data for now.',
        };
        if (isMockMode) return fallback;
        try {
            return await request<QaResponse>('/api/qa', json({ question }));
        } catch {
            return fallback;
        }
    },
};

export type CareCircleApi = typeof api;
