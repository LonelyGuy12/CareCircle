# CareCircle test plan (outline)

Repo truth as of Oct 3, 2026. Runner: `node --test` with TypeScript via the
repo's existing `tsx` (`"test": "tsx --test <files>"` in `backend/`,
`"test": "pnpm --filter backend run test"` at the root).

## Commands

```bash
pnpm test                 # root: runs the backend suite
pnpm --dir backend test   # backend suite directly
```

## What is covered today

| File                                                  | Tests                                                                                             | Needs                                                                   |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `backend/src/modules/health/health.test.ts`           | 1 real: `GET /health/live` returns 200 + `{ success, message, data }` envelope                    | Nothing (pure handler, stubbed deps)                                    |
| `backend/src/modules/medications/medications.test.ts` | 6 placeholders with `{ todo: true }` (list, get, create, update, delete, validation-error format) | 🔲 Blocked on the backend "medications endpoints" task (plan due Oct 1) |

Rules for new tests: no AWS credentials, no network — stub services at the
controller level (as `health.test.ts` does) or test pure helpers directly.
DynamoDB-backed tests wait for the DynamoDB Local + seed task (🔲 missing).

## Next suites (plan order)

- Oct 8: doses, appointments, summaries endpoint tests — blocked on those
  backend modules, which do not exist yet.
- Oct 8: `docs/manual-test-plan.md` — 10 cases (voice confirm, missed dose,
  wrong pill name, no appointments, empty states, polling ≤ 15s, Guardrails
  refusal, etc.).
- Oct 14–15: end-to-end checklist (voice → API → dashboard ≤ 15s → nightly
  summary) plus `.github/ISSUE_TEMPLATE/bug.md` (🔲 no `.github/` in repo).
