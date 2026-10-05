import { validate } from '@shared/utils';
import { Router } from 'express';

import { DoseController } from './dose.controller';
import { confirmDoseSchema, createDoseSchema, doseIdParamSchema } from './dose.validator';

export function createDoseRoutes(controller: DoseController): Router {
    const router = Router();

    router.get('/', controller.list);
    router.get('/today', controller.getToday);
    router.get('/due', controller.getDue);
    router.post('/', validate('json', createDoseSchema), controller.create);
    router.post(
        '/:id/confirm',
        validate('param', doseIdParamSchema),
        validate('json', confirmDoseSchema),
        controller.confirm,
    );
    router.post('/confirm', validate('json', createDoseSchema), controller.create);

    return router;
}
