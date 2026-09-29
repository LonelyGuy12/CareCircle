import { Router } from 'express';

import { HealthController } from './health.controller';

export function createHealthRoutes(controller: HealthController): Router {
    const router = Router();

    router.get('/', controller.health);
    router.get('/live', controller.liveness);
    router.get('/ready', controller.readiness);

    return router;
}
