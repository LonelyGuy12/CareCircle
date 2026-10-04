export interface IDatabaseProvider {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    healthCheck(): Promise<{ status: 'up' | 'down'; delayMs?: number; error?: string }>;
    getItem<T = unknown>(table: string, key: Record<string, unknown>): Promise<T | null>;
    putItem<T = unknown>(table: string, item: T): Promise<T>;
    updateItem<T = Record<string, unknown>>(
        table: string,
        key: Record<string, unknown>,
        updateData: Record<string, unknown> | object,
    ): Promise<T | null>;
    deleteItem(table: string, key: Record<string, unknown>): Promise<boolean>;
    query<T = unknown>(table: string, params?: Record<string, unknown>): Promise<T[]>;
    scan<T = unknown>(table: string, params?: Record<string, unknown>): Promise<T[]>;
}
