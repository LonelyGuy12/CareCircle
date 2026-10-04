import { validate } from '@shared/utils';
import { Router } from 'express';

import { MedicationController } from './medication.controller';
import {
    createMedicationSchema,
    medicationIdParamSchema,
    updateMedicationSchema,
} from './medication.validator';

export function createMedicationRoutes(controller: MedicationController): Router {
    const router = Router();

    router.get('/', controller.list);
    router.post('/', validate('json', createMedicationSchema), controller.create);
    router.get('/:id', validate('param', medicationIdParamSchema), controller.getById);
    router.patch(
        '/:id',
        validate('param', medicationIdParamSchema),
        validate('json', updateMedicationSchema),
        controller.update,
    );
    router.delete('/:id', validate('param', medicationIdParamSchema), controller.remove);

    return router;
}
