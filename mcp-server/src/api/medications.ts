import type { Medication } from '../types.js';
import { api } from './client.js';

export const getMedications = () => api.get<Medication[]>('/api/medications');
