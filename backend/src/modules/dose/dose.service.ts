import { MedicationRepository } from '@modules/medication/medication.repository';
import { LoggerService } from '@platform/logger/logger.service';
import { NotFoundError } from '@shared/json';
import { DoseLog } from '@shared/types';

import { DoseRepository } from './dose.repository';
import { ConfirmDoseInput, CreateDoseInput } from './dose.validator';

export class DoseService {
    constructor(
        private readonly doseRepository: DoseRepository,
        private readonly medicationRepository: MedicationRepository,
        private readonly logger: LoggerService,
    ) {}

    private async enrichDose(dose: DoseLog): Promise<DoseLog> {
        if (dose.medicationName && dose.dosage) return dose;
        const med = await this.medicationRepository.findById(dose.medicationId);
        return {
            ...dose,
            medicationName: dose.medicationName || med?.name || 'Unknown medication',
            dosage: dose.dosage || med?.dosage || '',
        };
    }

    async listAll(): Promise<DoseLog[]> {
        const doses = await this.doseRepository.findAll();
        const enriched = await Promise.all(doses.map((d) => this.enrichDose(d)));
        return enriched.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
    }

    async getTodayDoses(): Promise<DoseLog[]> {
        return this.listAll();
    }

    async getDueDoses(): Promise<DoseLog[]> {
        const doses = await this.listAll();
        return doses.filter((d) => d.status === 'pending');
    }

    async confirmDose(id: string, input: ConfirmDoseInput): Promise<DoseLog> {
        const updated = await this.doseRepository.confirm(id, input);
        if (!updated) {
            throw new NotFoundError('Dose');
        }
        const enriched = await this.enrichDose(updated);
        this.logger.info('Dose confirmed as taken', { id, via: input.via });
        return enriched;
    }

    async createDose(data: CreateDoseInput): Promise<DoseLog> {
        const created = await this.doseRepository.create(data);
        return this.enrichDose(created);
    }
}
