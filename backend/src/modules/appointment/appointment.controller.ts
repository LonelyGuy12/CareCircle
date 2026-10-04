import { ApiResponse } from '@shared/json';
import { NextFunction, Request, Response } from 'express';

import { AppointmentService } from './appointment.service';
import { CreateAppointmentInput, UpdateAppointmentInput } from './appointment.validator';

export class AppointmentController {
    constructor(private readonly appointmentService: AppointmentService) {}

    list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const appointments = await this.appointmentService.listAppointments();
            res.status(200).json(ApiResponse.success(appointments, 'Appointments retrieved'));
        } catch (err) {
            next(err);
        }
    };

    getNext = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const appointment = await this.appointmentService.getNextAppointment();
            res.status(200).json(ApiResponse.success(appointment, 'Next appointment retrieved'));
        } catch (err) {
            next(err);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const appointment = await this.appointmentService.getAppointmentById(id as string);
            res.status(200).json(ApiResponse.success(appointment, 'Appointment retrieved'));
        } catch (err) {
            next(err);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const body = req.body as CreateAppointmentInput;
            const created = await this.appointmentService.createAppointment(body);
            res.status(201).json(ApiResponse.success(created, 'Appointment created', 201));
        } catch (err) {
            next(err);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const body = req.body as UpdateAppointmentInput;
            const updated = await this.appointmentService.updateAppointment(id as string, body);
            res.status(200).json(ApiResponse.success(updated, 'Appointment updated'));
        } catch (err) {
            next(err);
        }
    };

    remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            await this.appointmentService.deleteAppointment(id as string);
            res.status(200).json(ApiResponse.success({ id }, 'Appointment deleted'));
        } catch (err) {
            next(err);
        }
    };
}
