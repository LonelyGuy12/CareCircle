import type { Dose } from '../types.js';
import { api } from './client.js';

export const getDoses = () => api.get<Dose[]>('/api/doses');

export const getDueDoses = () => api.get<Dose[]>('/api/doses/due');

export const confirmDose = (id: string, via: 'alexa' | 'dashboard' = 'alexa') =>
    api.post<Dose>(`/api/doses/${encodeURIComponent(id)}/confirm`, { via });
