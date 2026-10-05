// Common domain and healthcare entity types for CareCircle

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
    times: string[];
    instructions: string;
    aliases?: string[];
    createdAt?: string;
    updatedAt?: string;
}

export type DoseStatus = 'pending' | 'taken' | 'missed';

export interface DoseLog {
    id: string;
    medicationId: string;
    medicationName?: string;
    dosage?: string;
    scheduledAt: string;
    status: DoseStatus;
    confirmedAt?: string | null;
    confirmedVia?: 'alexa' | 'dashboard' | 'caregiver' | string | null;
}

export type Dose = DoseLog;

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
    createdAt?: string;
    updatedAt?: string;
}

export interface Summary {
    id: string;
    date: string;
    headline: string;
    text: string;
    flags: string[];
    createdAt?: string;
    updatedAt?: string;
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
    caregiver: Caregiver;
    medications: Medication[];
    doseLogs: DoseLog[];
    weeklyAdherence: WeeklyAdherence[];
    appointments: Appointment[];
    summaries: Summary[];
    alerts: Alert[];
}
