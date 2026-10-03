import { test } from 'node:test';

/**
 * BLOCKED on the backend task "Appointments, alerts, summaries, adherence
 * endpoints" (plan due Oct 5) and the "Daily summary job + Lambda handler"
 * task (AI-features owner, plan due Oct 5). The summaries module does not
 * exist in the repo yet, so these are TODO placeholders: they report as
 * TODO, never as failures. Paths are provisional and must match the API
 * contract once the owners land it.
 */

const BLOCKED = 'blocked: summaries endpoints not in repo yet (backend, due Oct 5)';

test('GET /api/summaries lists daily summaries', { todo: BLOCKED }, () => {});
test('GET /api/summaries/:date returns one daily summary', { todo: BLOCKED }, () => {});
