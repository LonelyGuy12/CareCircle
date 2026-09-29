export interface IDatabaseProvider {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    healthCheck(): Promise<{ status: 'up' | 'down'; delayMs?: number; error?: string }>;
    getItem<T = any>(table: string, key: Record<string, any>): Promise<T | null>;
    putItem<T = any>(table: string, item: T): Promise<T>;
    updateItem(
        table: string,
        key: Record<string, any>,
        updateData: Record<string, any>,
    ): Promise<any>;
    deleteItem(table: string, key: Record<string, any>): Promise<boolean>;
    query<T = any>(table: string, params?: Record<string, any>): Promise<T[]>;
}
