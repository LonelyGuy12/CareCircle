import { DatabaseService } from '@platform/database';
import { Summary } from '@shared/types';

import { CreateSummaryInput } from './summary.validator';

const TABLE_NAME = 'summaries';

const DEFAULT_SUMMARIES: Summary[] = [
    {
        id: 'sum_2026-09-23',
        date: '2026-09-23',
        headline: 'Good day: all 5 doses taken.',
        text: 'Margaret took all her medications on time, confirming each through Alexa. Her cardiology check-up is on Friday at 10:30am, so please bring her recent BP readings.',
        flags: [],
        createdAt: '2026-09-23T23:59:00.000Z',
    },
    {
        id: 'sum_2026-09-22',
        date: '2026-09-22',
        headline: '1 missed dose (Vitamin D3).',
        text: 'Margaret took 4 of 5 doses. The 1pm Vitamin D3 was not confirmed. A package was delivered at 3:12pm.',
        flags: ['missed_dose'],
        createdAt: '2026-09-22T23:59:00.000Z',
    },
];

export class SummaryRepository {
    private inMemoryStore: Map<string, Summary> = new Map();

    constructor(private readonly db: DatabaseService) {
        DEFAULT_SUMMARIES.forEach((s) => {
            this.inMemoryStore.set(s.date, { ...s });
        });
    }

    async findAll(): Promise<Summary[]> {
        try {
            const items = await this.db.scan<Summary>(TABLE_NAME);
            if (items && items.length > 0) {
                items.forEach((item) => this.inMemoryStore.set(item.date, item));
                return items;
            }
        } catch {
            // In-memory fallback
        }
        return Array.from(this.inMemoryStore.values());
    }

    async findByDate(date: string): Promise<Summary | null> {
        try {
            const item = await this.db.getItem<Summary>(TABLE_NAME, { date });
            if (item) {
                this.inMemoryStore.set(item.date, item);
                return item;
            }
        } catch {
            // In-memory fallback
        }
        return this.inMemoryStore.get(date) || null;
    }

    async create(data: CreateSummaryInput): Promise<Summary> {
        const id = `sum_${data.date}`;
        const newSummary: Summary = {
            id,
            date: data.date,
            headline: data.headline,
            text: data.text,
            flags: data.flags || [],
            createdAt: new Date().toISOString(),
        };

        this.inMemoryStore.set(data.date, newSummary);
        try {
            await this.db.putItem(TABLE_NAME, newSummary);
        } catch {
            // In-memory fallback
        }

        return newSummary;
    }
}
