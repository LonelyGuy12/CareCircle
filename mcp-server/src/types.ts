export type DoseStatus = 'pending' | 'taken' | 'missed';

export interface Dose {
    id: string;
    medicationId: string;
    medicationName: string;
    dosage: string;
    scheduledAt: string;
    status: DoseStatus;
    confirmedAt: string | null;
    confirmedVia: 'alexa' | 'dashboard' | null;
}

export interface Appointment {
    id: string;
    title: string;
    dateTime: string;
    doctor: string;
    location: string;
    notes: string;
}

export interface AppointmentInput {
    title: string;
    dateTime: string;
    doctor?: string;
    location?: string;
    notes?: string;
}

export interface Medication {
    id: string;
    name: string;
    dosage: string;
    times: string[];
    instructions: string;
    aliases: string[];
}
