import { LoggerService } from '@platform/logger/logger.service';
import { NotFoundError } from '@shared/json';
import { Summary } from '@shared/types';

import { SummaryRepository } from './summary.repository';
import { CreateSummaryInput } from './summary.validator';

export class SummaryService {
    constructor(
        private readonly summaryRepository: SummaryRepository,
        private readonly logger: LoggerService,
    ) {}

    async listSummaries(): Promise<Summary[]> {
        const summaries = await this.summaryRepository.findAll();
        return summaries.sort((a, b) => b.date.localeCompare(a.date));
    }

    async getSummaryByDate(date: string): Promise<Summary> {
        const summary = await this.summaryRepository.findByDate(date);
        if (!summary) {
            throw new NotFoundError(`Summary for date ${date}`);
        }
        return summary;
    }

    async createSummary(data: CreateSummaryInput): Promise<Summary> {
        const created = await this.summaryRepository.create(data);
        this.logger.info('Daily summary recorded', { date: created.date });
        return created;
    }
}
