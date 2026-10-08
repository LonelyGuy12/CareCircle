import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import type {
    CreateAppointmentInput,
    CreateMedicationInput,
    UpdateAppointmentInput,
    UpdateMedicationInput,
} from '../../../shared/types';
import { api, ApiError, isMockMode } from '../api';
import data from '../data/mock.json';
import type { Alert, Appointment, DoseLog, Medication, MockData } from '../types/mock';

const seed = data as MockData;

/** Polling interval for the dashboard refresh (15 seconds). */
export const POLL_INTERVAL_MS = 15000;

/** Where the dashboard data is coming from right now. */
export type DataStatus =
    /** First fetch in flight, nothing to show yet. */
    | 'loading'
    /** Fresh data from the live Express API. */
    | 'live'
    /** Demo data from `data/mock.json` (no API configured or API unreachable). */
    | 'mock'
    /** Had live data, refresh just failed — stale data with an error banner. */
    | 'error';

interface CareCircleState {
    careRecipient: MockData['careRecipient'];
    caregiver: MockData['caregiver'];
    medications: Medication[];
    doseLogs: DoseLog[];
    weeklyAdherence: MockData['weeklyAdherence'];
    appointments: Appointment[];
    summaries: MockData['summaries'];
    alerts: Alert[];
    unreadAlerts: number;
    /** Last time the dashboard data refreshed (epoch ms). Bumped every poll. */
    lastUpdated: number;
    /** Current data status (loading / live / mock / error). */
    status: DataStatus;
    /** Last fetch failure message, if any. Cleared on the next success. */
    error: string | null;
    /** Human readable source label for the UI ("live API" or "mock data"). */
    dataSource: string;
    /** Confirm a dose on the live API (throws ApiError on failure). */
    markTaken: (doseId: string) => Promise<void>;
    /** Local-only until the backend adds alert endpoints. */
    markAlertRead: (alertId: string) => void;
    /** Local-only until the backend adds alert endpoints. */
    markAllAlertsRead: () => void;
    addMedication: (input: CreateMedicationInput) => Promise<Medication>;
    updateMedication: (id: string, patch: UpdateMedicationInput) => Promise<Medication>;
    addAppointment: (input: CreateAppointmentInput) => Promise<Appointment>;
    updateAppointment: (id: string, patch: UpdateAppointmentInput) => Promise<Appointment>;
    /** Re-fetch live collections (or bump the timestamp in mock mode). */
    refresh: () => Promise<void>;
}

const CareCircleContext = createContext<CareCircleState | null>(null);

function toMessage(err: unknown): string {
    if (err instanceof ApiError) return err.message;
    if (err instanceof Error) return err.message;
    return 'Cannot reach the API.';
}

export function CareCircleProvider({ children }: { children: ReactNode }) {
    const [medications, setMedications] = useState<Medication[]>([]);
    const [doseLogs, setDoseLogs] = useState<DoseLog[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [summaries, setSummaries] = useState<MockData['summaries']>([]);
    const [alerts, setAlerts] = useState<Alert[]>(seed.alerts);
    const [status, setStatus] = useState<DataStatus>('loading');
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<number>(() => Date.now());
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    const applyMockSeed = useCallback((message: string | null) => {
        setMedications(seed.medications);
        setDoseLogs(seed.doseLogs);
        setAppointments(seed.appointments);
        setSummaries(seed.summaries);
        setStatus('mock');
        setError(message);
        setLastUpdated(Date.now());
    }, []);

    const refresh = useCallback(async () => {
        if (isMockMode) {
            if (mounted.current) {
                applyMockSeed(null);
            }
            return;
        }
        try {
            const [meds, doses, appts, sums] = await Promise.all([
                api.listMedications(),
                api.listTodayDoses(),
                api.listAppointments(),
                api.listSummaries(),
            ]);
            if (!mounted.current) return;
            setMedications(meds);
            setDoseLogs(doses);
            setAppointments(appts);
            setSummaries(sums);
            setStatus('live');
            setError(null);
            setLastUpdated(Date.now());
        } catch (err) {
            if (!mounted.current) return;
            const message = toMessage(err);
            // Never blank the dashboard: fall back to demo data on first
            // load, keep stale live data on later polls.
            setStatus((prev) => (prev === 'live' || prev === 'error' ? 'error' : 'mock'));
            setError(message);
            setMedications((prev) => (prev.length > 0 ? prev : seed.medications));
            setDoseLogs((prev) => (prev.length > 0 ? prev : seed.doseLogs));
            setAppointments((prev) => (prev.length > 0 ? prev : seed.appointments));
            setSummaries((prev) => (prev.length > 0 ? prev : seed.summaries));
            setLastUpdated(Date.now());
        }
    }, [applyMockSeed]);

    useEffect(() => {
        void refresh();
        const timer = window.setInterval(() => {
            void refresh();
        }, POLL_INTERVAL_MS);
        return () => window.clearInterval(timer);
    }, [refresh]);

    const markTaken = useCallback(async (doseId: string) => {
        const updated = await api.confirmDose(doseId, 'dashboard');
        setDoseLogs((prev) =>
            prev.some((d) => d.id === updated.id)
                ? prev.map((d) => (d.id === updated.id ? updated : d))
                : [...prev, updated],
        );
        setLastUpdated(Date.now());
    }, []);

    const markAlertRead = useCallback((alertId: string) => {
        setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, read: true } : a)));
    }, []);

    const markAllAlertsRead = useCallback(() => {
        setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    }, []);

    const addMedication = useCallback(async (input: CreateMedicationInput) => {
        const created = await api.createMedication(input);
        setMedications((prev) => [...prev, created]);
        return created;
    }, []);

    const updateMedication = useCallback(async (id: string, patch: UpdateMedicationInput) => {
        const updated = await api.updateMedication(id, patch);
        setMedications((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
        return updated;
    }, []);

    const addAppointment = useCallback(async (input: CreateAppointmentInput) => {
        const created = await api.createAppointment(input);
        setAppointments((prev) => [...prev, created]);
        return created;
    }, []);

    const updateAppointment = useCallback(async (id: string, patch: UpdateAppointmentInput) => {
        const updated = await api.updateAppointment(id, patch);
        setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        return updated;
    }, []);

    const value = useMemo<CareCircleState>(() => {
        return {
            // No profile endpoints yet — identity, alerts and adherence stay local.
            careRecipient: seed.careRecipient,
            caregiver: seed.caregiver,
            medications,
            doseLogs,
            weeklyAdherence: seed.weeklyAdherence,
            appointments,
            summaries,
            alerts,
            unreadAlerts: alerts.filter((a) => !a.read).length,
            lastUpdated,
            status,
            error,
            dataSource: status === 'live' && !isMockMode ? 'live API' : 'mock data',
            markTaken,
            markAlertRead,
            markAllAlertsRead,
            addMedication,
            updateMedication,
            addAppointment,
            updateAppointment,
            refresh,
        };
    }, [
        medications,
        doseLogs,
        appointments,
        summaries,
        alerts,
        lastUpdated,
        status,
        error,
        markTaken,
        markAlertRead,
        markAllAlertsRead,
        addMedication,
        updateMedication,
        addAppointment,
        updateAppointment,
        refresh,
    ]);

    return <CareCircleContext.Provider value={value}>{children}</CareCircleContext.Provider>;
}

export function useCareCircle(): CareCircleState {
    const ctx = useContext(CareCircleContext);
    if (!ctx) throw new Error('useCareCircle must be used inside CareCircleProvider');
    return ctx;
}
