import type { Appointment, Dose, Medication } from '../types.js';

export const mockDoses: Dose[] = [
    {
        id: 'dose_2026-10-01_0900_med_01',
        medicationId: 'med_01',
        medicationName: 'Amlodipine',
        dosage: '5 mg',
        scheduledAt: '2026-10-01T09:00:00',
        status: 'taken',
        confirmedAt: '2026-10-01T09:04:12',
        confirmedVia: 'alexa',
    },
    {
        id: 'dose_2026-10-01_2000_med_02',
        medicationId: 'med_02',
        medicationName: 'Metformin',
        dosage: '500 mg',
        scheduledAt: '2026-10-01T20:00:00',
        status: 'pending',
        confirmedAt: null,
        confirmedVia: null,
    },
    {
        id: 'dose_2026-10-01_1400_med_01',
        medicationId: 'med_01',
        medicationName: 'Amlodipine',
        dosage: '5 mg',
        scheduledAt: '2026-10-01T14:00:00',
        status: 'missed',
        confirmedAt: null,
        confirmedVia: null,
    },
];

export const mockAppointments: Appointment[] = [
    {
        id: 'appt_01',
        title: 'Cardiologist visit',
        dateTime: '2026-10-05T11:00:00',
        doctor: 'Dr. Khan',
        location: 'City Hospital',
        notes: '',
    },
];

export const mockMedications: Medication[] = [
    {
        id: 'med_01',
        name: 'Amlodipine',
        dosage: '5 mg',
        times: ['09:00'],
        instructions: 'Take with water.',
        aliases: ['blood pressure pill', 'BP pill', 'BP medicine'],
    },
    {
        id: 'med_02',
        name: 'Metformin',
        dosage: '500 mg',
        times: ['20:00'],
        instructions: 'Take after dinner.',
        aliases: ['sugar pill', 'diabetes medicine'],
    },
];
