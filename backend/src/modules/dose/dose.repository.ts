import { DatabaseService } from '@platform/database';
import { DoseLog } from '@shared/types';

import { ConfirmDoseInput, CreateDoseInput } from './dose.validator';

const TABLE_NAME = 'doses';

const DEFAULT_DOSES: DoseLog[] = [
    {
        id: 'dose_1',
        medicationId: 'med_1',
        medicationName: 'Amlodipine',
        dosage: '5 mg',
        scheduledAt: '2026-09-24T09:00:00',
        status: 'taken',
        confirmedAt: '2026-09-24T09:04:00',
        confirmedVia: 'alexa',
    },
    {
        id: 'dose_2',
        medicationId: 'med_2',
        medicationName: 'Metformin',
        dosage: '500 mg',
        scheduledAt: '2026-09-24T09:00:00',
        status: 'taken',
        confirmedAt: '2026-09-24T09:05:00',
        confirmedVia: 'alexa',
    },
    {
        id: 'dose_3',
        medicationId: 'med_4',
        medicationName: 'Vitamin D3',
        dosage: '1000 IU',
        scheduledAt: '2026-09-24T13:00:00',
        status: 'missed',
        confirmedAt: null,
        confirmedVia: null,
    },
    {
        id: 'dose_4',
        medicationId: 'med_2',
        medicationName: 'Metformin',
        dosage: '500 mg',
        scheduledAt: '2026-09-24T20:00:00',
        status: 'pending',
        confirmedAt: null,
        confirmedVia: null,
    },
    {
        id: 'dose_5',
        medicationId: 'med_3',
        medicationName: 'Atorvastatin',
        dosage: '10 mg',
        scheduledAt: '2026-09-24T21:00:00',
        status: 'pending',
        confirmedAt: null,
        confirmedVia: null,
    },
];

export class DoseRepository {
    private inMemoryStore: Map<string, DoseLog> = new Map();

    constructor(private readonly db: DatabaseService) {
        DEFAULT_DOSES.forEach((dose) => {
            this.inMemoryStore.set(dose.id, { ...dose });
        });
    }

    async findAll(): Promise<DoseLog[]> {
        try {
            const items = await this.db.scan<DoseLog>(TABLE_NAME);
            if (items && items.length > 0) {
                items.forEach((item) => this.inMemoryStore.set(item.id, item));
                return items;
            }
        } catch {
            // In-memory fallback
        }
        return Array.from(this.inMemoryStore.values());
    }

    async findById(id: string): Promise<DoseLog | null> {
        try {
            const item = await this.db.getItem<DoseLog>(TABLE_NAME, { id });
            if (item) {
                this.inMemoryStore.set(item.id, item);
                return item;
            }
        } catch {
            // In-memory fallback
        }
        return this.inMemoryStore.get(id) || null;
    }

    async create(data: CreateDoseInput): Promise<DoseLog> {
        const id = `dose_${Date.now()}`;
        const newDose: DoseLog = {
            id,
            medicationId: data.medicationId,
            scheduledAt: data.scheduledAt,
            status: data.status || 'pending',
            confirmedAt: data.confirmedAt ?? null,
            confirmedVia: data.confirmedVia ?? null,
        };

        this.inMemoryStore.set(id, newDose);
        try {
            await this.db.putItem(TABLE_NAME, newDose);
        } catch {
            // In-memory fallback
        }
        return newDose;
    }

    async confirm(id: string, input: ConfirmDoseInput): Promise<DoseLog | null> {
        const existing = await this.findById(id);
        if (!existing) return null;

        const updated: DoseLog = {
            ...existing,
            status: 'taken',
            confirmedAt: new Date().toISOString(),
            confirmedVia: input.via || 'dashboard',
        };

        this.inMemoryStore.set(id, updated);
        try {
            await this.db.updateItem(TABLE_NAME, { id }, updated);
        } catch {
            // In-memory fallback
        }
        return updated;
    }
}
