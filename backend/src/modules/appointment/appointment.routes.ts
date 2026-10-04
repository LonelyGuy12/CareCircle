import { validate } from '@shared/utils';
import { Router } from 'express';

import { AppointmentController } from './appointment.controller';
import {
    appointmentIdParamSchema,
    createAppointmentSchema,
    updateAppointmentSchema,
} from './appointment.validator';

export function createAppointmentRoutes(controller: AppointmentController): Router {
    const router = Router();

    router.get('/', controller.list);
    router.get('/next', controller.getNext);
    router.post('/', validate('json', createAppointmentSchema), controller.create);
    router.get('/:id', validate('param', appointmentIdParamSchema), controller.getById);
    router.patch(
        '/:id',
        validate('param', appointmentIdParamSchema),
        validate('json', updateAppointmentSchema),
        controller.update,
    );
    router.delete('/:id', validate('param', appointmentIdParamSchema), controller.remove);

    return router;
}
