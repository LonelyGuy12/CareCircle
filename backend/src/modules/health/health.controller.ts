import { CacheService } from '@platform/cache';
import { ConfigService } from '@platform/config';
import { DatabaseService } from '@platform/database';
import { HTTP_STATUS } from '@shared/constants/httpStatus';
import { ApiResponse } from '@shared/json';
import { Request, Response } from 'express';

export class HealthController {
    constructor(
        private readonly db: DatabaseService,
        private readonly cache: CacheService,
        private readonly config: ConfigService,
    ) {}

    liveness = (req: Request, res: Response): void => {
        const response = new ApiResponse(
            HTTP_STATUS.OK,
            {
                status: 'alive',
                pid: process.pid,
                node_version: process.version,
                timestamp: Date.now(),
            },
            'Liveness check passed',
        );

        res.status(HTTP_STATUS.OK).json(response.toJSON());
    };

    readiness = async (req: Request, res: Response): Promise<void> => {
        type DepStatus = { status: 'up' | 'down'; latency_ms?: number; error?: string };

        const dependencies: Record<string, DepStatus> = {
            database: { status: 'down' },
            cache: { status: 'down' },
        };

        try {
            const result = await this.db.healthCheck();
            dependencies.database = {
                status: result.status,
                ...(result.status === 'up' && result.delayMs !== undefined
                    ? { latency_ms: Number(result.delayMs) }
                    : { error: String(result.error ?? 'Unknown error') }),
            };
        } catch (err) {
            dependencies.database = {
                status: 'down',
                error: err instanceof Error ? err.message : 'Unknown error',
            };
        }

        try {
            const result = await this.cache.healthCheck();
            dependencies.cache = { status: result.status, latency_ms: result.delayMs };
        } catch (err) {
            dependencies.cache = {
                status: 'down',
                error: err instanceof Error ? err.message : 'Unknown error',
            };
        }

        const isReady = Object.values(dependencies).every((d) => d.status === 'up');
        const statusCode = isReady ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE;

        const response = new ApiResponse(
            statusCode,
            {
                status: isReady ? 'ready' : 'unavailable',
                dependencies,
                timestamp: Date.now(),
            },
            isReady ? 'Service ready' : 'Service unavailable — one or more dependencies are down',
        );

        res.status(statusCode).json(response.toJSON());
    };

    health = async (req: Request, res: Response): Promise<void> => {
        const uptimeSeconds = Math.floor(process.uptime());
        const mem = process.memoryUsage();

        let dbHealth: { status: 'up' | 'down'; latency_ms?: number; error?: string } = {
            status: 'down',
        };
        try {
            const result = await this.db.healthCheck();
            dbHealth = {
                status: result.status,
                ...(result.status === 'up' && result.delayMs !== undefined
                    ? { latency_ms: Number(result.delayMs) }
                    : { error: String(result.error ?? 'Unknown error') }),
            };
        } catch (err) {
            dbHealth = {
                status: 'down',
                error: err instanceof Error ? err.message : 'Unknown error',
            };
        }

        let cacheHealth: { status: 'up' | 'down'; latency_ms?: number; error?: string } = {
            status: 'down',
        };
        try {
            const result = await this.cache.healthCheck();
            cacheHealth = {
                status: result.status,
                ...(result.status === 'up' && result.delayMs !== undefined
                    ? { latency_ms: Number(result.delayMs) }
                    : { error: String(result.error ?? 'Unknown error') }),
            };
        } catch (err) {
            cacheHealth = {
                status: 'down',
                error: err instanceof Error ? err.message : 'Unknown error',
            };
        }

        const response = new ApiResponse(
            HTTP_STATUS.OK,
            {
                status: 'healthy',
                service: 'api',
                version: this.config.npm_package_version,
                environment: this.config.nodeEnv,
                process: {
                    pid: process.pid,
                    node_version: process.version,
                    platform: process.platform,
                    arch: process.arch,
                    uptime_sec: uptimeSeconds,
                    uptime_human: formatUptime(uptimeSeconds),
                },
                memory: {
                    heap_used_mb: toMB(mem.heapUsed),
                    heap_total_mb: toMB(mem.heapTotal),
                    rss_mb: toMB(mem.rss),
                    external_mb: toMB(mem.external),
                },
                dependencies: {
                    database: dbHealth,
                    cache: cacheHealth,
                },
                timestamp: Date.now(),
            },
            'Health check passed',
        );

        res.status(HTTP_STATUS.OK).json(response.toJSON());
    };
}

function formatUptime(sec: number): string {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${h}h ${m}m ${s}s`;
}

function toMB(bytes: number): number {
    return Math.round((bytes / 1024 / 1024) * 100) / 100;
}
