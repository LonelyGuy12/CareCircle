import { ApiResponse } from '@shared/json';
import { NextFunction, Request, Response } from 'express';

import { DoseService } from './dose.service';
import { ConfirmDoseInput, CreateDoseInput } from './dose.validator';

export class DoseController {
    constructor(private readonly doseService: DoseService) {}

    list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const doses = await this.doseService.listAll();
            res.status(200).json(ApiResponse.success(doses, 'Doses retrieved'));
        } catch (err) {
            next(err);
        }
    };

    getToday = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const doses = await this.doseService.getTodayDoses();
            res.status(200).json(ApiResponse.success(doses, "Today's doses retrieved"));
        } catch (err) {
            next(err);
        }
    };

    getDue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const dueDoses = await this.doseService.getDueDoses();
            res.status(200).json(ApiResponse.success(dueDoses, 'Due doses retrieved'));
        } catch (err) {
            next(err);
        }
    };

    confirm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const body = req.body as ConfirmDoseInput;
            const updated = await this.doseService.confirmDose(id as string, body);
            res.status(200).json(ApiResponse.success(updated, 'Dose confirmed'));
        } catch (err) {
            next(err);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const body = req.body as CreateDoseInput;
            const created = await this.doseService.createDose(body);
            res.status(201).json(ApiResponse.success(created, 'Dose created', 201));
        } catch (err) {
            next(err);
        }
    };
}
