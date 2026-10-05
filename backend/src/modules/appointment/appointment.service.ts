import { LoggerService } from '@platform/logger/logger.service';
import { NotFoundError } from '@shared/json';
import { Appointment } from '@shared/types';

import { AppointmentRepository } from './appointment.repository';
import { CreateAppointmentInput, UpdateAppointmentInput } from './appointment.validator';

export class AppointmentService {
    constructor(
        private readonly appointmentRepository: AppointmentRepository,
        private readonly logger: LoggerService,
    ) {}

    async listAppointments(): Promise<Appointment[]> {
        const appointments = await this.appointmentRepository.findAll();
        return appointments.sort((a, b) => a.dateTime.localeCompare(b.dateTime));
    }

    async getNextAppointment(): Promise<Appointment | null> {
        const appointments = await this.listAppointments();
        const now = new Date().toISOString();
        const upcoming = appointments.filter((a) => a.dateTime >= now);
        return upcoming.length > 0 ? upcoming[0]! : appointments[0] || null;
    }

    async getAppointmentById(id: string): Promise<Appointment> {
        const appointment = await this.appointmentRepository.findById(id);
        if (!appointment) {
            throw new NotFoundError('Appointment');
        }
        return appointment;
    }

    async createAppointment(data: CreateAppointmentInput): Promise<Appointment> {
        const created = await this.appointmentRepository.create(data);
        this.logger.info('Appointment created successfully', {
            id: created.id,
            title: created.title,
        });
        return created;
    }

    async updateAppointment(id: string, updates: UpdateAppointmentInput): Promise<Appointment> {
        const updated = await this.appointmentRepository.update(id, updates);
        if (!updated) {
            throw new NotFoundError('Appointment');
        }
        this.logger.info('Appointment updated successfully', { id: updated.id });
        return updated;
    }

    async deleteAppointment(id: string): Promise<void> {
        const deleted = await this.appointmentRepository.delete(id);
        if (!deleted) {
            throw new NotFoundError('Appointment');
        }
        this.logger.info('Appointment deleted successfully', { id });
    }
}
