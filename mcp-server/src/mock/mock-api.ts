import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

import type { Appointment } from '../types.js';
import { mockAppointments, mockDoses, mockMedications } from './data.js';

const doses = structuredClone(mockDoses);
const appointments = structuredClone(mockAppointments);

const send = (res: ServerResponse, status: number, body: unknown) => {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
};

const readBody = async (req: IncomingMessage): Promise<Record<string, unknown> | null> => {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    try {
        return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    } catch {
        return null;
    }
};

createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const path = url.pathname;

    if (req.method === 'GET' && path === '/api/doses') return send(res, 200, doses);

    if (req.method === 'GET' && path === '/api/doses/due')
        return send(
            res,
            200,
            doses.filter((d) => d.status === 'pending'),
        );

    const doseMatch = path.match(/^\/api\/doses\/([^/]+)\/confirm$/);
    if (req.method === 'POST' && doseMatch) {
        const body = await readBody(req);
        const via = typeof body?.via === 'string' ? body.via : '';
        if (via !== 'alexa' && via !== 'dashboard')
            return send(res, 400, {
                error: { code: 'VALIDATION_ERROR', message: 'Some fields are invalid.' },
            });

        const dose = doses.find((d) => d.id === decodeURIComponent(doseMatch[1]!));
        if (!dose)
            return send(res, 404, { error: { code: 'NOT_FOUND', message: 'Dose not found.' } });

        dose.status = 'taken';
        dose.confirmedAt = new Date().toISOString().slice(0, 19);
        dose.confirmedVia = via;
        return send(res, 200, dose);
    }

    if (req.method === 'GET' && path === '/api/appointments') return send(res, 200, appointments);

    if (req.method === 'GET' && path === '/api/appointments/next') {
        const sorted = [...appointments].sort((a, b) => a.dateTime.localeCompare(b.dateTime));
        return send(res, 200, sorted[0] ?? null);
    }

    if (req.method === 'POST' && path === '/api/appointments') {
        const body = await readBody(req);
        const title = typeof body?.title === 'string' ? body.title : undefined;
        const dateTime = typeof body?.dateTime === 'string' ? body.dateTime : undefined;
        if (!title || !dateTime)
            return send(res, 400, {
                error: { code: 'VALIDATION_ERROR', message: 'Some fields are invalid.' },
            });

        const appt: Appointment = {
            id: `appt_${Date.now()}`,
            title,
            dateTime,
            doctor: typeof body?.doctor === 'string' ? body.doctor : '',
            location: typeof body?.location === 'string' ? body.location : '',
            notes: typeof body?.notes === 'string' ? body.notes : '',
        };
        appointments.push(appt);
        return send(res, 200, appt);
    }

    if (req.method === 'GET' && path === '/api/medications') return send(res, 200, mockMedications);

    send(res, 404, { error: { code: 'NOT_FOUND', message: 'Route not found.' } });
}).listen(3000, () => console.log('Mock API running on http://localhost:3000'));
