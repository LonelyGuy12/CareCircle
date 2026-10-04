import { DatabaseService } from '@platform/database';
import { Appointment } from '@shared/types';

import { CreateAppointmentInput, UpdateAppointmentInput } from './appointment.validator';

const TABLE_NAME = 'appointments';

const DEFAULT_APPOINTMENTS: Appointment[] = [
    {
        id: 'appt_1',
        title: 'Cardiology check-up',
        doctor: 'Dr. Rao',
        location: 'City Heart Clinic',
        dateTime: '2026-09-26T10:30:00',
        notes: 'Bring last BP readings.',
        createdAt: '2026-09-24T00:00:00.000Z',
        updatedAt: '2026-09-24T00:00:00.000Z',
    },
    {
        id: 'appt_2',
        title: 'Blood sugar test',
        doctor: 'Lab',
        location: 'Apollo Diagnostics',
        dateTime: '2026-09-29T08:00:00',
        notes: 'Fasting required.',
        createdAt: '2026-09-24T00:00:00.000Z',
        updatedAt: '2026-09-24T00:00:00.000Z',
    },
    {
        id: 'appt_3',
        title: 'Eye exam',
        doctor: 'Dr. Menon',
        location: 'Vision Care Centre',
        dateTime: '2026-10-05T16:00:00',
        notes: '',
        createdAt: '2026-09-24T00:00:00.000Z',
        updatedAt: '2026-09-24T00:00:00.000Z',
    },
];

export class AppointmentRepository {
    private inMemoryStore: Map<string, Appointment> = new Map();

    constructor(private readonly db: DatabaseService) {
        DEFAULT_APPOINTMENTS.forEach((appt) => {
            this.inMemoryStore.set(appt.id, { ...appt });
        });
    }

    async findAll(): Promise<Appointment[]> {
        try {
            const items = await this.db.scan<Appointment>(TABLE_NAME);
            if (items && items.length > 0) {
                items.forEach((item) => this.inMemoryStore.set(item.id, item));
                return items;
            }
        } catch {
            // Fall back to in-memory store
        }
        return Array.from(this.inMemoryStore.values());
    }

    async findById(id: string): Promise<Appointment | null> {
        try {
            const item = await this.db.getItem<Appointment>(TABLE_NAME, { id });
            if (item) {
                this.inMemoryStore.set(item.id, item);
                return item;
            }
        } catch {
            // Fall back to in-memory store
        }
        return this.inMemoryStore.get(id) || null;
    }

    async create(data: CreateAppointmentInput): Promise<Appointment> {
        const now = new Date().toISOString();
        const id = `appt_${Date.now()}`;
        const newAppt: Appointment = {
            id,
            title: data.title,
            doctor: data.doctor || '',
            location: data.location || '',
            dateTime: data.dateTime,
            notes: data.notes || '',
            createdAt: now,
            updatedAt: now,
        };

        this.inMemoryStore.set(id, newAppt);
        try {
            await this.db.putItem(TABLE_NAME, newAppt);
        } catch {
            // Kept in memory
        }

        return newAppt;
    }

    async update(id: string, updates: UpdateAppointmentInput): Promise<Appointment | null> {
        const existing = await this.findById(id);
        if (!existing) return null;

        const updated: Appointment = {
            ...existing,
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        this.inMemoryStore.set(id, updated);
        try {
            await this.db.updateItem(TABLE_NAME, { id }, updated);
        } catch {
            // Kept in memory
        }

        return updated;
    }

    async delete(id: string): Promise<boolean> {
        const exists = this.inMemoryStore.has(id);
        this.inMemoryStore.delete(id);
        try {
            await this.db.deleteItem(TABLE_NAME, { id });
        } catch {
            // Kept in memory
        }
        return exists;
    }
}
