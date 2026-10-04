import {
    AppointmentController,
    AppointmentRepository,
    AppointmentService,
    createAppointmentRoutes,
} from '@modules/appointment';
import { AuthController } from '@modules/auth/auth.controller';
import { createAuthRoutes } from '@modules/auth/auth.routes';
import { AuthService } from '@modules/auth/auth.service';
import { createDoseRoutes, DoseController, DoseRepository, DoseService } from '@modules/dose';
import { createHealthRoutes, HealthController } from '@modules/health';
import {
    createMedicationRoutes,
    MedicationController,
    MedicationRepository,
    MedicationService,
} from '@modules/medication';
import {
    createSummaryRoutes,
    SummaryController,
    SummaryRepository,
    SummaryService,
} from '@modules/summary';
import { createUserRoutes, UserController, UserService } from '@modules/user';
import { UserRepository } from '@modules/user/user.repository';
import { CacheService } from '@platform/cache';
import { ConfigService } from '@platform/config';
import { DatabaseService } from '@platform/database';
import { HttpServer } from '@platform/http/http.server';
import { AuthMiddleware } from '@platform/http/middleware';
import { createRequestLogger } from '@platform/http/middleware/request-logger';
import { LoggerService } from '@platform/logger/logger.service';
import { Router } from 'express';

import { container, ServiceKeys } from './container';

export class Application {
    private static instance: Application | null = null;
    private initialized: boolean = false;

    private config!: ConfigService;
    private logger!: LoggerService;
    private database!: DatabaseService;
    private cache!: CacheService;
    private httpServer!: HttpServer;

    static getInstance(): Application {
        if (!Application.instance) {
            Application.instance = new Application();
        }
        return Application.instance;
    }

    static resetInstance(): void {
        Application.instance = null;
    }

    async bootstrap(): Promise<void> {
        if (this.initialized) {
            throw new Error('Application initialisation failed.\nApplication Initialised Already!');
        }
        try {
            // 1-4: Setup Infrastructure
            await this.initializeConfig();
            await this.initializeLogger();
            await this.initializeDatabase();
            await this.initializeCache();

            // 5: Setup HTTP Server
            await this.initializeHttpServer();

            // 6: Assemble Modules
            await this.registerModules();

            // 7: Start Server
            await this.httpServer.start();

            this.initialized = true;
            this.logger.info('Application Started Successfully.');
        } catch (error) {
            console.error('Failed to bootstrap application:', error);
            throw error;
        }
        return;
    }

    private async initializeConfig(): Promise<void> {
        this.config = ConfigService.getInstance();
        container.register(ServiceKeys.CONFIG, this.config);
    }

    private async initializeLogger(): Promise<void> {
        this.logger = LoggerService.getInstance(this.config);
        container.register(ServiceKeys.LOGGER, this.logger);
    }

    private async initializeDatabase(): Promise<void> {
        this.database = DatabaseService.getInstance(this.logger);
        await this.database.connect();
        container.register(ServiceKeys.DATABASE, this.database);
        const health = await this.database.healthCheck();

        if (health.status === 'down') {
            this.logger.error('Database health check failed', { error: health.error });
        }

        this.logger.info('Database initialized', { status: health.status });
    }

    private async initializeCache(): Promise<void> {
        this.cache = CacheService.getInstance(this.config, this.logger);
        await this.cache.connect();
        container.register(ServiceKeys.CACHE, this.cache);
        const health = await this.cache.healthCheck();
        this.logger.info('Redis cache initialized', { status: health.status });
    }

    private async initializeHttpServer(): Promise<void> {
        this.httpServer = HttpServer.getInstance(this.config, this.logger);
        this.httpServer.use(createRequestLogger(this.logger));
        container.register(ServiceKeys.HTTP_SERVER, this.httpServer);
    }

    private registerModules() {
        const mainRouter = Router();
        const healthController = new HealthController(this.database, this.cache, this.config);

        const userRepository = new UserRepository(this.database);
        const authService = new AuthService(userRepository, this.logger, this.cache);
        const authController = new AuthController(
            this.config,
            authService,
            this.cache,
            this.logger,
        );

        const userService = new UserService(userRepository, this.logger);
        const userController = new UserController(userService, this.cache);

        const authMiddleware = new AuthMiddleware(this.config, this.logger, authService);

        // Core Healthcare Modules
        const medicationRepository = new MedicationRepository(this.database);
        const medicationService = new MedicationService(medicationRepository, this.logger);
        const medicationController = new MedicationController(medicationService);

        const appointmentRepository = new AppointmentRepository(this.database);
        const appointmentService = new AppointmentService(appointmentRepository, this.logger);
        const appointmentController = new AppointmentController(appointmentService);

        const doseRepository = new DoseRepository(this.database);
        const doseService = new DoseService(doseRepository, medicationRepository, this.logger);
        const doseController = new DoseController(doseService);

        const summaryRepository = new SummaryRepository(this.database);
        const summaryService = new SummaryService(summaryRepository, this.logger);
        const summaryController = new SummaryController(summaryService);

        // Base routes
        mainRouter.use('/health', createHealthRoutes(healthController));
        mainRouter.use('/auth', createAuthRoutes(authController, authMiddleware));
        mainRouter.use('/users', createUserRoutes(userController, authMiddleware));

        // Healthcare routes (both /api/medications and /medications for full compatibility)
        const medRoutes = createMedicationRoutes(medicationController);
        mainRouter.use('/medications', medRoutes);
        mainRouter.use('/api/medications', medRoutes);

        const apptRoutes = createAppointmentRoutes(appointmentController);
        mainRouter.use('/appointments', apptRoutes);
        mainRouter.use('/api/appointments', apptRoutes);

        const doseRoutes = createDoseRoutes(doseController);
        mainRouter.use('/doses', doseRoutes);
        mainRouter.use('/api/doses', doseRoutes);

        const summaryRoutes = createSummaryRoutes(summaryController);
        mainRouter.use('/summaries', summaryRoutes);
        mainRouter.use('/api/summaries', summaryRoutes);

        this.httpServer.registerRoutes('/', mainRouter);
        this.logger.info('All routes configured.');
    }
}
