import { test } from 'node:test';

/**
 * BLOCKED on the backend task "Appointments, alerts, summaries, adherence
 * endpoints" (plan due Oct 5). The appointments module does not exist in the
 * repo yet, so these are TODO placeholders: they report as TODO, never as
 * failures. Paths are provisional and must match the API contract once the
 * backend owner lands it.
 */

const BLOCKED = 'blocked: appointments endpoints not in repo yet (backend, due Oct 5)';

test('GET /api/appointments lists appointments', { todo: BLOCKED }, () => {});
test('POST /api/appointments creates an appointment (zod validation)', { todo: BLOCKED }, () => {});
test('PATCH /api/appointments/:id updates an appointment', { todo: BLOCKED }, () => {});
test('DELETE /api/appointments/:id removes an appointment', { todo: BLOCKED }, () => {});
