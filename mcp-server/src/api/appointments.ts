import { api } from "./client.js";
import type { Appointment, AppointmentInput } from "../types.js";

export const getAppointments = () => api.get<Appointment[]>("/api/appointments");

export const getNextAppointment = () => api.get<Appointment | null>("/api/appointments/next");

export const addAppointment = (input: AppointmentInput) =>
  api.post<Appointment>("/api/appointments", input);