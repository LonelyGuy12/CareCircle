import type { Appointment, AppointmentInput } from '../types.js';
import { api } from './client.js';
import { ApiError } from './client.js';

export const getAppointments = () => api.get<Appointment[]>('/api/appointments');

export const getNextAppointment = async (): Promise<Appointment | null> => {
    try {
        return await api.get<Appointment>('/api/appointments/next');
    } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
    }
};

export const addAppointment = (input: AppointmentInput) =>
    api.post<Appointment>('/api/appointments', input);
