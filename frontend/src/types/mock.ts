// Mock data types for frontend

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

export interface Medication {
    id: string;
    name: string;
    dosage: string;
    times: string[];
    instructions: string;
}

export interface DoseLog {
    id: string;
    medicationId: string;
    scheduledAt: string;
    status: 'taken' | 'missed' | 'pending';
    confirmedAt?: string | null;
    confirmedVia?: string | null;
}

export interface WeeklyAdherence {
    day: string;
    percent: number;
}

export interface Appointment {
    id: string;
    title: string;
    doctor: string;
    location: string;
    dateTime: string;
    notes?: string;
}

export interface Summary {
    id: string;
    date: string;
    headline: string;
    text: string;
    flags: string[];
}

export interface Alert {
    id: string;
    type: 'missed_dose' | 'ring_delivery';
    message: string;
    createdAt: string;
    read: boolean;
}

export interface MockData {
    careRecipient: CareRecipient;
    caregiver: {
        id: string;
        name: string;
    };
    medications: Medication[];
    doseLogs: DoseLog[];
    weeklyAdherence: WeeklyAdherence[];
    appointments: Appointment[];
    summaries: Summary[];
    alerts: Alert[];
}
