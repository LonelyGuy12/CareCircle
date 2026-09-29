import { ConfigService } from '@platform/config';
import { LoggerService } from '@platform/logger/logger.service';

import { IDatabaseProvider } from './database.interface';
import { DynamoDBService } from './dynamo.service';

export class DatabaseService implements IDatabaseProvider {
    private static instance: DatabaseService | null = null;
    private provider: IDatabaseProvider;

    private constructor(
        private readonly config: ConfigService,
        private readonly logger: LoggerService,
    ) {
        // Active DB Strategy selection (Default: DynamoDB)
        this.provider = DynamoDBService.getInstance(config, logger);
    }

    static getInstance(logger: LoggerService, config?: ConfigService): DatabaseService {
        if (!DatabaseService.instance) {
            const cfg = config || ConfigService.getInstance();
            DatabaseService.instance = new DatabaseService(cfg, logger);
        }
        return DatabaseService.instance;
    }

    resetInstance(): void {
        DatabaseService.instance = null;
    }

    // Delegated IDatabaseProvider implementation

    async connect(): Promise<void> {
        await this.provider.connect();
    }

    async disconnect(): Promise<void> {
        await this.provider.disconnect();
    }

    async healthCheck(): Promise<{ status: 'up' | 'down'; delayMs?: number; error?: string }> {
        return this.provider.healthCheck();
    }

    async getItem<T = any>(table: string, key: Record<string, any>): Promise<T | null> {
        return this.provider.getItem<T>(table, key);
    }

    async putItem<T = any>(table: string, item: T): Promise<T> {
        return this.provider.putItem<T>(table, item);
    }

    async updateItem(
        table: string,
        key: Record<string, any>,
        updateData: Record<string, any>,
    ): Promise<any> {
        return this.provider.updateItem(table, key, updateData);
    }

    async deleteItem(table: string, key: Record<string, any>): Promise<boolean> {
        return this.provider.deleteItem(table, key);
    }

    async query<T = any>(table: string, params?: Record<string, any>): Promise<T[]> {
        return this.provider.query<T>(table, params);
    }
}
