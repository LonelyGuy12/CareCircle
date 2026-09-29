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
    }

    /**
     * Robust argument formatter to ensure Errors always have stack traces in terminal.
     */
    private formatArgs(msgOrObj: any, obj?: any): [any, string?] | [string] {
        // If first arg is an Error
        if (msgOrObj instanceof Error) {
            const errorObj = { err: msgOrObj, error: msgOrObj };
            return obj
                ? [{ ...errorObj, meta: obj }, msgOrObj.message]
                : [errorObj, msgOrObj.message];
        }

        // If second arg is an Error
        if (obj instanceof Error) {
            return [{ err: obj, error: obj }, msgOrObj];
        }

        // If second arg is an object that might contain an Error
        if (obj && typeof obj === 'object') {
            const potentialErr = obj.err || obj.error || obj.exception;
            if (potentialErr instanceof Error) {
                return [{ ...obj, err: potentialErr, error: potentialErr }, msgOrObj];
            }
            return [obj, msgOrObj];
        }

        // Generic case
        if (obj !== undefined) {
            return [{ meta: obj }, msgOrObj];
        }

        return [msgOrObj];
    }

    info(message: any, obj?: any) {
        const args = this.formatArgs(message, obj);
        // @ts-expect-error -- dynamic pino method call
        this.logger.info(...args);
    }

    trace(message: any, obj?: any) {
        const args = this.formatArgs(message, obj);
        // @ts-expect-error -- dynamic pino method call
        this.logger.trace(...args);
    }

    warn(message: any, obj?: any) {
        const args = this.formatArgs(message, obj);
        // @ts-expect-error -- dynamic pino method call
        this.logger.warn(...args);
    }

    debug(message: any, obj?: any) {
        const args = this.formatArgs(message, obj);
        // @ts-expect-error -- dynamic pino method call
        this.logger.debug(...args);
    }

    error(message: any, obj?: any) {
        const args = this.formatArgs(message, obj);
        // @ts-expect-error -- dynamic pino method call
        this.logger.error(...args);
    }

    fatal(message: any, obj?: any) {
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
