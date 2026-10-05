import { ConfigService } from '@platform/config';
import pino, { type Logger } from 'pino';

interface LogMeta {
    [key: string]: unknown;
}

export class LoggerService {
    private static instance: LoggerService | null = null;
    private logger: Logger;
    private readonly serviceName: string = 'backend';

    constructor(private readonly config: ConfigService) {
        this.logger = this.createLogger();
    }

    static getInstance(config: ConfigService): LoggerService {
        if (!this.instance) {
            this.instance = new LoggerService(config);
        }
        return this.instance;
    }

    resetInstance(): void {
        LoggerService.instance = null;
    }

    private createLogger(): Logger {
        const isProduction = this.config.isProduction;

        const baseOptions = {
            level: this.config.logLevel || 'debug',
            base: {
                service: this.serviceName,
            },
            timestamp: pino.stdTimeFunctions.isoTime,
            serializers: {
                err: pino.stdSerializers.err,
                error: pino.stdSerializers.err,
            },
        };

        if (isProduction) {
            return pino(baseOptions);
        }

        try {
            return pino({
                ...baseOptions,
                transport: {
                    target: 'pino-pretty',
                    options: {
                        colorize: true,
                        translateTime: 'HH:MM:ss',
                        ignore: 'pid,hostname,service',
                        errorLikeObjectKeys: ['err', 'error'],
                        levelFirst: false,
                        singleLine: true,
                        colorizeObjects: true,
                        customColors:
                            'trace:gray,debug:blue,info:green,warn:yellow,error:red,fatal:bgRed',
                        messageFormat: '{msg}',
                    },
                },
            });
        } catch {
            return pino(baseOptions);
        }
    }

    /**
     * Robust argument formatter to ensure Errors always have stack traces in terminal.
     */
    private formatArgs(
        msgOrObj: unknown,
        obj?: unknown,
    ): [Record<string, unknown>, string?] | [string] | [unknown] {
        // If first arg is an Error
        if (msgOrObj instanceof Error) {
            const errorObj: Record<string, unknown> = { err: msgOrObj, error: msgOrObj };
            return obj && typeof obj === 'object'
                ? [{ ...errorObj, meta: obj }, msgOrObj.message]
                : [errorObj, msgOrObj.message];
        }

        // If second arg is an Error
        if (obj instanceof Error) {
            return [
                { err: obj, error: obj },
                typeof msgOrObj === 'string' ? msgOrObj : String(msgOrObj),
            ];
        }

        // If second arg is an object that might contain an Error
        if (obj && typeof obj === 'object') {
            const potentialErr =
                (obj as Record<string, unknown>).err ||
                (obj as Record<string, unknown>).error ||
                (obj as Record<string, unknown>).exception;
            if (potentialErr instanceof Error) {
                return [
                    { ...(obj as Record<string, unknown>), err: potentialErr, error: potentialErr },
                    typeof msgOrObj === 'string' ? msgOrObj : String(msgOrObj),
                ];
            }
            return [
                obj as Record<string, unknown>,
                typeof msgOrObj === 'string' ? msgOrObj : String(msgOrObj),
            ];
        }

        // Generic case
        if (obj !== undefined) {
            return [{ meta: obj }, typeof msgOrObj === 'string' ? msgOrObj : String(msgOrObj)];
        }

        if (typeof msgOrObj === 'string') {
            return [msgOrObj];
        }

        return [msgOrObj];
    }

    info(message: unknown, obj?: unknown) {
        const args = this.formatArgs(message, obj);
        // @ts-expect-error -- dynamic pino method call
        this.logger.info(...args);
    }

    trace(message: unknown, obj?: unknown) {
        const args = this.formatArgs(message, obj);
        // @ts-expect-error -- dynamic pino method call
        this.logger.trace(...args);
    }

    warn(message: unknown, obj?: unknown) {
        const args = this.formatArgs(message, obj);
        // @ts-expect-error -- dynamic pino method call
        this.logger.warn(...args);
    }

    debug(message: unknown, obj?: unknown) {
        const args = this.formatArgs(message, obj);
        // @ts-expect-error -- dynamic pino method call
        this.logger.debug(...args);
    }

    error(message: unknown, obj?: unknown) {
        const args = this.formatArgs(message, obj);
        // @ts-expect-error -- dynamic pino method call
        this.logger.error(...args);
    }

    fatal(message: unknown, obj?: unknown) {
        const args = this.formatArgs(message, obj);
        // @ts-expect-error -- dynamic pino method call
        this.logger.fatal(...args);
    }

    logRequest(
        method: string,
        url: string,
        statusCode: number,
        durationMs: number,
        meta?: LogMeta,
    ): void {
        const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

        const logData = {
            ...meta,
            http: {
                method,
                url,
                statusCode,
                durationMs,
            },
        };

        this.logger[level](logData, `${method} ${url} ${statusCode}`);
    }

    getPinoLogger(): Logger {
        return this.logger;
    }
}
