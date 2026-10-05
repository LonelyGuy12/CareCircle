import { ApiResponse } from '@shared/json';
import { NextFunction, Request, Response } from 'express';

import { SummaryService } from './summary.service';
import { CreateSummaryInput } from './summary.validator';

export class SummaryController {
    constructor(private readonly summaryService: SummaryService) {}

    list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const summaries = await this.summaryService.listSummaries();
            res.status(200).json(ApiResponse.success(summaries, 'Summaries retrieved'));
        } catch (err) {
            next(err);
        }
    };

    getByDate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { date } = req.params;
            const summary = await this.summaryService.getSummaryByDate(date as string);
            res.status(200).json(ApiResponse.success(summary, 'Summary retrieved'));
        } catch (err) {
            next(err);
        }
    };

    create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const body = req.body as CreateSummaryInput;
            const created = await this.summaryService.createSummary(body);
            res.status(201).json(ApiResponse.success(created, 'Summary created', 201));
        } catch (err) {
            next(err);
        }
    };
}
