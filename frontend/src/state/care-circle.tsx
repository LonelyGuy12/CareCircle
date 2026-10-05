import {
    createContext,
    type ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

import data from '../data/mock.json';
import type { Alert, Appointment, DoseLog, Medication, MockData } from '../types/mock';

const seed = data as MockData;

/** Polling interval for the dashboard refresh (15 seconds). */
export const POLL_INTERVAL_MS = 15000;

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
    markTaken: (doseId: string) => void;
    markAlertRead: (alertId: string) => void;
    markAllAlertsRead: () => void;
    addMedication: (med: Medication) => void;
    updateMedication: (med: Medication) => void;
    addAppointment: (appt: Appointment) => void;
    updateAppointment: (appt: Appointment) => void;
    refresh: () => void;
}

const CareCircleContext = createContext<CareCircleState | null>(null);

export function CareCircleProvider({ children }: { children: ReactNode }) {
    const [medications, setMedications] = useState<Medication[]>(seed.medications);
    const [doseLogs, setDoseLogs] = useState<DoseLog[]>(seed.doseLogs);
    const [appointments, setAppointments] = useState<Appointment[]>(seed.appointments);
    const [alerts, setAlerts] = useState<Alert[]>(seed.alerts);
    const [lastUpdated, setLastUpdated] = useState<number>(() => Date.now());

    const refresh = useCallback(() => {
        setLastUpdated(Date.now());
    }, []);

    useEffect(() => {
        const timer = window.setInterval(refresh, POLL_INTERVAL_MS);
        return () => window.clearInterval(timer);
    }, [refresh]);

    const markTaken = useCallback((doseId: string) => {
        setDoseLogs((prev) =>
            prev.map((d) =>
                d.id === doseId
                    ? {
                          ...d,
                          status: 'taken',
                          confirmedAt: new Date().toISOString(),
                          confirmedVia: 'caregiver',
                      }
                    : d,
            ),
        );
    }, []);

    const markAlertRead = useCallback((alertId: string) => {
        setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, read: true } : a)));
    }, []);

    const markAllAlertsRead = useCallback(() => {
        setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    }, []);

    const addMedication = useCallback((med: Medication) => {
        setMedications((prev) => [...prev, med]);
    }, []);

    const updateMedication = useCallback((med: Medication) => {
        setMedications((prev) => prev.map((m) => (m.id === med.id ? med : m)));
    }, []);

    const addAppointment = useCallback((appt: Appointment) => {
        setAppointments((prev) => [...prev, appt]);
    }, []);

    const updateAppointment = useCallback((appt: Appointment) => {
        setAppointments((prev) => prev.map((a) => (a.id === appt.id ? appt : a)));
    }, []);

    const value = useMemo<CareCircleState>(() => {
        return {
            careRecipient: seed.careRecipient,
            caregiver: seed.caregiver,
            medications,
            doseLogs,
            weeklyAdherence: seed.weeklyAdherence,
            appointments,
            summaries: seed.summaries,
            alerts,
            unreadAlerts: alerts.filter((a) => !a.read).length,
            lastUpdated,
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
        alerts,
        lastUpdated,
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
