import { validate } from '@shared/utils';
import { Router } from 'express';

import { SummaryController } from './summary.controller';
import { createSummarySchema, dateParamSchema } from './summary.validator';

export function createSummaryRoutes(controller: SummaryController): Router {
    const router = Router();

    router.get('/', controller.list);
    router.post('/', validate('json', createSummarySchema), controller.create);
    router.get('/:date', validate('param', dateParamSchema), controller.getByDate);

    return router;
}
