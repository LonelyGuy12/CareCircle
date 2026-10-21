import { test } from 'node:test';

/**
 * BLOCKED on the backend task "Medications endpoints (5) with zod validation
 * and the standard error format" (plan due Oct 1). The medications module does
 * not exist in the repo yet, so these are TODO placeholders: they report as
 * TODO, never as failures. Paths below are provisional and must match the
 * API contract once the backend owner lands it.
 */

const BLOCKED = 'blocked: medications endpoints not in repo yet (backend, due Oct 1)';

test('GET /api/medications lists medications', { todo: BLOCKED }, () => {});
test('GET /api/medications/:id returns one medication', { todo: BLOCKED }, () => {});
test('POST /api/medications creates a medication (zod validation)', { todo: BLOCKED }, () => {});
test('PATCH /api/medications/:id updates a medication', { todo: BLOCKED }, () => {});
test('DELETE /api/medications/:id removes a medication', { todo: BLOCKED }, () => {});
test(
    'POST /api/medications rejects invalid bodies with the standard error format',
    { todo: BLOCKED },
    () => {},
);
