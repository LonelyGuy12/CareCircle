import { LoggerService } from '@platform/logger/logger.service';
import { NotFoundError } from '@shared/json';
import { Medication } from '@shared/types';

import { MedicationRepository } from './medication.repository';
import { CreateMedicationInput, UpdateMedicationInput } from './medication.validator';

export class MedicationService {
    constructor(
        private readonly medicationRepository: MedicationRepository,
        private readonly logger: LoggerService,
    ) {}

    async listMedications(): Promise<Medication[]> {
        return this.medicationRepository.findAll();
    }

    async getMedicationById(id: string): Promise<Medication> {
        const med = await this.medicationRepository.findById(id);
        if (!med) {
            throw new NotFoundError('Medication');
        }
        return med;
    }

    async createMedication(data: CreateMedicationInput): Promise<Medication> {
        const created = await this.medicationRepository.create(data);
        this.logger.info('Medication created successfully', { id: created.id, name: created.name });
        return created;
    }

    async updateMedication(id: string, updates: UpdateMedicationInput): Promise<Medication> {
        const updated = await this.medicationRepository.update(id, updates);
        if (!updated) {
            throw new NotFoundError('Medication');
        }
        this.logger.info('Medication updated successfully', { id: updated.id });
        return updated;
    }

    async deleteMedication(id: string): Promise<void> {
        const deleted = await this.medicationRepository.delete(id);
        if (!deleted) {
            throw new NotFoundError('Medication');
        }
        this.logger.info('Medication deleted successfully', { id });
    }
}
