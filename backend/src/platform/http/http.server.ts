import { ConfigService } from '@platform/config';
import { LoggerService } from '@platform/logger/logger.service';
import { AppError } from '@shared/json';
import cookieParser from 'cookie-parser';
import express, { Express, NextFunction, Request, RequestHandler, Response } from 'express';
import http from 'http';

import { bodyLimit, createCorsMiddleware, createCsrfMiddleware } from './middleware';

export class HttpServer {
    private static instance: HttpServer | null = null;
    private app: Express;
    private server: http.Server | null = null;

    private constructor(
        private readonly config: ConfigService,
        private readonly logger: LoggerService,
    ) {
        this.app = express();
        this.setBaseMiddlewares();
    }

    static getInstance(config: ConfigService, logger: LoggerService): HttpServer {
        if (!HttpServer.instance) {
            HttpServer.instance = new HttpServer(config, logger);
        }
        return HttpServer.instance;
    }

    resetInstance(): void {
        HttpServer.instance = null;
    }

    setBaseMiddlewares() {
        this.app.use(cookieParser());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(createCorsMiddleware(this.config));
        this.app.use(createCsrfMiddleware(this.config));
        this.app.use(bodyLimit());

        this.app.use(
            '/uploads',
            (req, res, next) => {
                res.setHeader('X-Zerra-Media', 'true');
                res.setHeader('Cache-Control', 'public, max-age=31536000');
                next();
            },
            express.static('./uploads'),
        );
    }

    use(middleware: RequestHandler): this {
        this.app.use(middleware);
        return this;
    }

    useAll(middlewares: RequestHandler[]): this {
        for (const middleware of middlewares) {
            this.use(middleware);
        }
        return this;
    }

    registerRoutes(prefix: string, router: express.Router): this {
        this.app.use(prefix, router);
        return this;
    }

    async start(): Promise<void> {
        this.setupErrorHandler();

        return new Promise((resolve, reject) => {
            this.server = http.createServer(this.app);
            this.server.listen(this.config.port, '0.0.0.0', () => {
                this.logger.info(`Server is running on http://0.0.0.0:${this.config.port}`);
                resolve();
            });

            this.server.on('error', (err: Error) => {
                this.logger.error('Server error', { error: err });
                reject(err);
            });
        });
    }

    async stop(): Promise<void> {
        if (!this.server) return;

        return new Promise((resolve, reject) => {
            this.server?.close((err) => {
                if (err) {
                    this.logger.error('Server stop error', err);
                    reject(err);
                } else {
                    this.logger.info('HTTP server stopped successfully.');
                    resolve();
                }
            });
        });
    }

    getApp(): Express {
        return this.app;
    }

    private setupErrorHandler(): void {
        this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
            if (err instanceof AppError) {
                this.logger.warn(`${err.name}: ${err.message}`, {
                    path: req.path,
                    method: req.method,
                    statusCode: err.statusCode,
                    code: err.code,
                    details: err.details,
                });
                return res.status(err.statusCode).json(err.toJSON());
            }

            this.logger.error(`Critical Error: ${err.message || err}`, {
                path: req.path,
                method: req.method,
                error: err,
            });

            return res.status(500).json({
                success: false,
                message: this.config.isProduction
                    ? 'An unexpected error occurred'
                    : err.message || 'Internal Server Error',
                error: {
                    code: 'INTERNAL_SERVER_ERROR',
                    details: this.config.isProduction ? undefined : { stack: err.stack },
                },
            });
        });
    }
}
