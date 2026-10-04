import { DatabaseService } from '@platform/database';
import { Medication } from '@shared/types';

import { CreateMedicationInput, UpdateMedicationInput } from './medication.validator';

const TABLE_NAME = 'medications';

const DEFAULT_MEDICATIONS: Medication[] = [
    {
        id: 'med_1',
        name: 'Amlodipine',
        dosage: '5 mg',
        times: ['09:00'],
        instructions: 'Blood pressure. Take with water.',
        aliases: ['blood pressure pill', 'BP pill', 'BP medicine'],
        createdAt: '2026-09-24T00:00:00.000Z',
        updatedAt: '2026-09-24T00:00:00.000Z',
    },
    {
        id: 'med_2',
        name: 'Metformin',
        dosage: '500 mg',
        times: ['09:00', '20:00'],
        instructions: 'Take with meals.',
        aliases: ['sugar pill', 'diabetes medicine'],
        createdAt: '2026-09-24T00:00:00.000Z',
        updatedAt: '2026-09-24T00:00:00.000Z',
    },
    {
        id: 'med_3',
        name: 'Atorvastatin',
        dosage: '10 mg',
        times: ['21:00'],
        instructions: 'Take at bedtime.',
        aliases: ['cholesterol pill'],
        createdAt: '2026-09-24T00:00:00.000Z',
        updatedAt: '2026-09-24T00:00:00.000Z',
    },
    {
        id: 'med_4',
        name: 'Vitamin D3',
        dosage: '1000 IU',
        times: ['13:00'],
        instructions: 'Take after lunch.',
        aliases: ['vitamin d', 'sunshine vitamin'],
        createdAt: '2026-09-24T00:00:00.000Z',
        updatedAt: '2026-09-24T00:00:00.000Z',
    },
];

export class MedicationRepository {
    private inMemoryStore: Map<string, Medication> = new Map();

    constructor(private readonly db: DatabaseService) {
        DEFAULT_MEDICATIONS.forEach((med) => {
            this.inMemoryStore.set(med.id, { ...med });
        });
    }

    async findAll(): Promise<Medication[]> {
        try {
            const items = await this.db.scan<Medication>(TABLE_NAME);
            if (items && items.length > 0) {
                items.forEach((item) => this.inMemoryStore.set(item.id, item));
                return items;
            }
        } catch {
            // Fall back to in-memory store
        }
        return Array.from(this.inMemoryStore.values());
    }

    async findById(id: string): Promise<Medication | null> {
        try {
            const item = await this.db.getItem<Medication>(TABLE_NAME, { id });
            if (item) {
                this.inMemoryStore.set(item.id, item);
                return item;
            }
        } catch {
            // Fall back to in-memory store
        }
        return this.inMemoryStore.get(id) || null;
    }

    async create(data: CreateMedicationInput): Promise<Medication> {
        const now = new Date().toISOString();
        const id = `med_${Date.now()}`;
        const newMed: Medication = {
            id,
            name: data.name,
            dosage: data.dosage,
            times: data.times,
            instructions: data.instructions || '',
            aliases: data.aliases || [],
            createdAt: now,
            updatedAt: now,
        };

        this.inMemoryStore.set(id, newMed);
        try {
            await this.db.putItem(TABLE_NAME, newMed);
        } catch {
            // Store kept in memory
        }

        return newMed;
    }

    async update(id: string, updates: UpdateMedicationInput): Promise<Medication | null> {
        const existing = await this.findById(id);
        if (!existing) return null;

        const updated: Medication = {
            ...existing,
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        this.inMemoryStore.set(id, updated);
        try {
            await this.db.updateItem(TABLE_NAME, { id }, updated);
        } catch {
            // Store kept in memory
        }

        return updated;
    }

    async delete(id: string): Promise<boolean> {
        const exists = this.inMemoryStore.has(id);
        this.inMemoryStore.delete(id);
        try {
            await this.db.deleteItem(TABLE_NAME, { id });
        } catch {
            // Store deleted from memory
        }
        return exists;
    }
}
