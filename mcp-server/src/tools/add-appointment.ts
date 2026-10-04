import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { addAppointment } from '../api/appointments.js';
import { asError, asText } from '../utils/result.js';

export function registerAddAppointment(server: McpServer) {
    server.registerTool(
        'add_appointment',
        {
            title: 'Add appointment',
            description: 'Save a new appointment, such as a doctor visit.',
            inputSchema: {
                title: z.string().describe("Appointment title, e.g. 'Doctor visit'"),
                dateTime: z
                    .string()
                    .describe('Date and time in ISO format, e.g. 2026-10-10T15:00:00'),
                doctor: z.string().optional().describe("Doctor's name"),
                location: z.string().optional().describe('Where the appointment is'),
                notes: z.string().optional().describe('Any extra notes'),
            },
        },
        async ({ title, dateTime, doctor, location, notes }) => {
            try {
                return asText(await addAppointment({ title, dateTime, doctor, location, notes }));
            } catch (err) {
                return asError(err);
            }
        },
    );
}
