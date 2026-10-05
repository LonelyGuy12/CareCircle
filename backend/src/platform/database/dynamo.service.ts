import {
    DynamoDBClient,
    type DynamoDBClientConfig,
    ListTablesCommand,
} from '@aws-sdk/client-dynamodb';
import {
    DeleteCommand,
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    QueryCommand,
    ScanCommand,
    UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { ConfigService } from '@platform/config';
import { LoggerService } from '@platform/logger/logger.service';

import { IDatabaseProvider } from './database.interface';

export class DynamoDBService implements IDatabaseProvider {
    private static instance: DynamoDBService | null = null;
    private client: DynamoDBClient;
    private docClient: DynamoDBDocumentClient;
    private connected: boolean = false;
    private tablePrefix: string;

    private constructor(
        private readonly config: ConfigService,
        private readonly logger: LoggerService,
    ) {
        this.tablePrefix = config.dynamodb_table_prefix || 'carecircle_';

        const clientConfig: DynamoDBClientConfig = {
            region: config.aws_region || 'us-east-1',
        };

        const accessKeyId = config.aws_access_key_id;
        const secretAccessKey = config.aws_secret_access_key;
        if (accessKeyId && secretAccessKey) {
            clientConfig.credentials = {
                accessKeyId,
                secretAccessKey,
            };
        }

        const endpoint = config.dynamodb_endpoint;
        if (endpoint) {
            clientConfig.endpoint = endpoint;
        }

        this.client = new DynamoDBClient(clientConfig);
        this.docClient = DynamoDBDocumentClient.from(this.client, {
            marshallOptions: {
                removeUndefinedValues: true,
                convertClassInstanceToMap: true,
            },
        });
    }

    static getInstance(config: ConfigService, logger: LoggerService): DynamoDBService {
        if (!DynamoDBService.instance) {
            DynamoDBService.instance = new DynamoDBService(config, logger);
        }
        return DynamoDBService.instance;
    }

    resetInstance(): void {
        DynamoDBService.instance = null;
    }

    get getDocClient(): DynamoDBDocumentClient {
        return this.docClient;
    }

    get getRawClient(): DynamoDBClient {
        return this.client;
    }

    get FullTableName(): (name: string) => string {
        return (name: string) => `${this.tablePrefix}${name}`;
    }

    async connect(): Promise<void> {
        this.connected = true;
        this.logger.info('AWS DynamoDB Client initialized.', {
            region: this.config.aws_region || 'us-east-1',
            prefix: this.tablePrefix,
        });
    }

    async disconnect(): Promise<void> {
        this.client.destroy();
        this.connected = false;
        this.logger.info('AWS DynamoDB Client disconnected.');
    }

    async healthCheck(): Promise<{ status: 'up' | 'down'; delayMs?: number; error?: string }> {
        const start = Date.now();
        try {
            await this.client.send(new ListTablesCommand({ Limit: 1 }));
            return {
                status: 'up',
                delayMs: Date.now() - start,
            };
        } catch (error) {
            return {
                status: 'down',
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }

    // CRUD Methods implementing IDatabaseProvider

    async getItem<T = unknown>(tableName: string, key: Record<string, unknown>): Promise<T | null> {
        const fullTableName = this.FullTableName(tableName);
        const command = new GetCommand({
            TableName: fullTableName,
            Key: key,
        });
        const result = await this.docClient.send(command);
        return (result.Item as T) || null;
    }

    async putItem<T = unknown>(tableName: string, item: T): Promise<T> {
        const fullTableName = this.FullTableName(tableName);
        const command = new PutCommand({
            TableName: fullTableName,
            Item: item as Record<string, unknown>,
        });
        await this.docClient.send(command);
        return item;
    }

    async updateItem<T = Record<string, unknown>>(
        tableName: string,
        key: Record<string, unknown>,
        updateData: Record<string, unknown> | object,
    ): Promise<T | null> {
        const fullTableName = this.FullTableName(tableName);
        const data = updateData as Record<string, unknown>;
        const updateKeys = Object.keys(data);
        if (updateKeys.length === 0) return this.getItem<T>(tableName, key);

        const updateExpression = `SET ${updateKeys.map((k, i) => `#k${i} = :v${i}`).join(', ')}`;
        const expressionAttributeNames: Record<string, string> = {};
        const expressionAttributeValues: Record<string, unknown> = {};

        updateKeys.forEach((k, i) => {
            expressionAttributeNames[`#k${i}`] = k;
            expressionAttributeValues[`:v${i}`] = data[k];
        });

        const command = new UpdateCommand({
            TableName: fullTableName,
            Key: key,
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'ALL_NEW',
        });
        const result = await this.docClient.send(command);
        return (result.Attributes as T) || null;
    }

    async deleteItem(tableName: string, key: Record<string, unknown>): Promise<boolean> {
        const fullTableName = this.FullTableName(tableName);
        const command = new DeleteCommand({
            TableName: fullTableName,
            Key: key,
        });
        await this.docClient.send(command);
        return true;
    }

    async query<T = unknown>(tableName: string, params?: Record<string, unknown>): Promise<T[]> {
        const fullTableName = this.FullTableName(tableName);
        const command = new QueryCommand({
            TableName: fullTableName,
            ...(params || {}),
        });
        const result = await this.docClient.send(command);
        return (result.Items as T[]) || [];
    }

    async scan<T = unknown>(tableName: string, params?: Record<string, unknown>): Promise<T[]> {
        const fullTableName = this.FullTableName(tableName);
        const command = new ScanCommand({
            TableName: fullTableName,
            ...(params || {}),
        });
        const result = await this.docClient.send(command);
        return (result.Items as T[]) || [];
    }
}
