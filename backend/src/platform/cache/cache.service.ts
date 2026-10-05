import { ConfigService } from '@platform/config';
import { LoggerService } from '@platform/logger/logger.service';
import { Redis as UpstashRedis } from '@upstash/redis';
import { createClient, type RedisClientOptions } from 'redis';

export class CacheService {
    private static instance: CacheService | null = null;
    private client: ReturnType<typeof createClient> | UpstashRedis;
    private readonly keyPrefix: string;
    private ready: boolean = false;
    private isUpstash: boolean = false;

    private constructor(
        private config: ConfigService,
        private logger: LoggerService,
    ) {
        this.keyPrefix = 'zerra';

        if (config.upstash_redis_rest_url && config.upstash_redis_rest_token) {
            this.isUpstash = true;
            this.client = new UpstashRedis({
                url: config.upstash_redis_rest_url,
                token: config.upstash_redis_rest_token,
            });
            this.ready = true;
            this.logger.info('Upstash Redis initialized via REST');
            return;
        }

        // NOTE: RESP/clientSideCache are not node-redis v4 options and were
        // silently ignored; they are dropped here with zero runtime change.
        const redisOptions: RedisClientOptions = {
            password: config.redis_password,
        };

        if (config.redis_url) {
            redisOptions.url = config.redis_url;
        } else {
            redisOptions.socket = {
                host: config.redis_host,
                port: config.redis_port,
                reconnectStrategy: (retries: number) => {
                    if (retries > 3) {
                        return new Error('Too many retries.');
                    }
                    return Math.min(retries * 100, 300);
                },
            };
        }

        this.client = createClient(redisOptions) as ReturnType<typeof createClient>;

        this.client.on('connect', () => {
            this.ready = true;
            this.logger.info('Redis connected');
        });

        (this.client as ReturnType<typeof createClient>).on('error', (err: unknown) => {
            this.ready = false;
            this.logger.error('Redis error', err);
        });

        (this.client as ReturnType<typeof createClient>).on('close', () => {
            this.ready = false;
            this.logger.debug('Redis connection closed');
        });
    }

    static getInstance(config: ConfigService, logger: LoggerService): CacheService {
        if (!CacheService.instance) {
            CacheService.instance = new CacheService(config, logger);
        }
        return CacheService.instance;
    }

    static resetInstance(): void {
        CacheService.instance = null;
    }

    private prefixKey(key: string): string {
        return `${this.keyPrefix}${key}`;
    }

    get isReady(): boolean {
        return this.ready;
    }

    async connect(): Promise<void> {
        if (!this.ready && !this.isUpstash) {
            await (this.client as ReturnType<typeof createClient>).connect();
            this.ready = true;
        }
        return;
    }

    async disconnect(): Promise<void> {
        if (this.ready && !this.isUpstash) {
            await (this.client as ReturnType<typeof createClient>).quit();
            this.ready = false;
        }
        return;
    }

    async get<T>(key: string): Promise<T | null> {
        if (!this.ready) return null;
        try {
            let data;
            if (this.isUpstash) {
                const res = await (this.client as UpstashRedis).get(this.prefixKey(key));
                // Upstash Redis automatically parses JSON if it is a JSON string/object
                data = typeof res === 'string' ? res : JSON.stringify(res);
            } else {
                data = await (this.client as ReturnType<typeof createClient>).get(
                    this.prefixKey(key),
                );
            }
            return (data && typeof data === 'string' ? JSON.parse(data) : data) as T | null;
        } catch (error) {
            this.logger.warn('Cache get error', { key, error });
            return null;
        }
    }

    async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
        if (!this.ready) return false;
        try {
            if (this.isUpstash) {
                if (ttl) {
                    await (this.client as UpstashRedis).set(this.prefixKey(key), value, {
                        ex: ttl,
                    });
                } else {
                    await (this.client as UpstashRedis).set(this.prefixKey(key), value);
                }
            } else {
                await (this.client as ReturnType<typeof createClient>).set(
                    this.prefixKey(key),
                    JSON.stringify(value),
                    {
                        EX: ttl,
                    },
                );
            }
            return true;
        } catch (error) {
            this.logger.warn('Cache set error', { key, error });
            return false;
        }
    }

    async delete(key: string): Promise<boolean> {
        if (!this.ready) return false;
        try {
            await this.client.del(this.prefixKey(key));
            return true;
        } catch (error) {
            this.logger.warn('Cache delete error', { key, error });
            return false;
        }
    }

    async healthCheck(): Promise<{ status: 'up' | 'down'; delayMs?: number; error?: string }> {
        const start = Date.now();
        try {
            if (this.isUpstash) {
                await (this.client as UpstashRedis).ping();
            } else {
                await (this.client as ReturnType<typeof createClient>).ping();
            }
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
}
