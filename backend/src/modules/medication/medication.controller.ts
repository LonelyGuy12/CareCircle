import { ApiResponse } from '@shared/json';
import { NextFunction, Request, Response } from 'express';

import { MedicationService } from './medication.service';
import { CreateMedicationInput, UpdateMedicationInput } from './medication.validator';

export class MedicationController {
    constructor(private readonly medicationService: MedicationService) {}

    list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const medications = await this.medicationService.listMedications();
            res.status(200).json(ApiResponse.success(medications, 'Medications retrieved'));
        } catch (err) {
            next(err);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const medication = await this.medicationService.getMedicationById(id as string);
            res.status(200).json(ApiResponse.success(medication, 'Medication retrieved'));
        } catch (err) {
            next(err);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const body = req.body as CreateMedicationInput;
            const created = await this.medicationService.createMedication(body);
            res.status(201).json(ApiResponse.success(created, 'Medication created', 201));
        } catch (err) {
            next(err);
        }
    };

    update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const body = req.body as UpdateMedicationInput;
            const updated = await this.medicationService.updateMedication(id as string, body);
            res.status(200).json(ApiResponse.success(updated, 'Medication updated'));
        } catch (err) {
            next(err);
        }
    };

    remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            await this.medicationService.deleteMedication(id as string);
            res.status(200).json(ApiResponse.success({ id }, 'Medication deleted'));
        } catch (err) {
            next(err);
        }
    };
}
