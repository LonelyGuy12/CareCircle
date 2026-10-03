import { test } from 'node:test';

/**
 * BLOCKED on the backend task "Doses endpoints: today's doses, due doses,
 * confirm" (plan due Oct 3–4). The doses module does not exist in the repo
 * yet, so these are TODO placeholders: they report as TODO, never as
 * failures. Paths are provisional and must match the API contract once the
 * backend owner lands it.
 */

const BLOCKED = 'blocked: doses endpoints not in repo yet (backend, due Oct 3)';

test('GET /api/doses/today lists today\u2019s doses', { todo: BLOCKED }, () => {});
test('GET /api/doses/due lists doses due now', { todo: BLOCKED }, () => {});
test('POST /api/doses/confirm marks a dose taken', { todo: BLOCKED }, () => {});
test(
    'POST /api/doses/confirm rejects unknown dose ids with the standard error format',
    { todo: BLOCKED },
    () => {},
);
