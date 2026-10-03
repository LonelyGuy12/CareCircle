# CareCircle status — missing items

Repo truth as of Oct 3, 2026. Roles only, no names. "Due" = the plan's date.

## Missing (blocks others)

| Item                                                               | Owner (role)       | Due              | Notes                                                                                      |
| ------------------------------------------------------------------ | ------------------ | ---------------- | ------------------------------------------------------------------------------------------ |
| Medications endpoints (5) + zod validation + standard error format | Backend            | Oct 1 (overdue)  | Only `auth`/`health`/`user` modules exist; API tests are TODO placeholders                 |
| Doses endpoints (today, due, confirm)                              | Backend            | Oct 3 (today)    | Not in repo                                                                                |
| `shared/types.ts` contract + zod schemas                           | Backend + Frontend | Sep 28 (overdue) | `backend/src/shared/types/` holds a generic user-profile schema, not the CareCircle domain |
| Seed script + demo data                                            | Backend            | Sep 28 (overdue) | None; frontend runs on `mock.json`                                                         |
| DynamoDB table/key design + Local running                          | Backend            | Sep 28 (overdue) | Service code honors `DYNAMODB_ENDPOINT`; no Local guide or tables                          |
| CI workflow (typecheck, no-JS rule), PR template                   | Lead / DevOps      | Phase 1          | No `.github/` directory at all                                                             |
| Alexa+/voice simulator skeleton                                    | Lead / DevOps      | Sep 29 (overdue) | No simulator files found                                                                   |

## Partially done

| Item                                            | Owner (role)      | Due            | Notes                                                                          |
| ----------------------------------------------- | ----------------- | -------------- | ------------------------------------------------------------------------------ |
| README + setup guide + test plan                | Quality           | Sep 29 / Oct 3 | Done on `docs-tests` (this work): README, `docs/setup.md`, `docs/test-plan.md` |
| API test harness (`pnpm test`)                  | Quality           | Oct 3          | Done: 1 real health test, 6 TODO placeholders; needs endpoint suites           |
| Wireframes + accessibility guidelines           | Quality           | Sep 27         | Done: `docs/wireframes.md`, `docs/accessibility.md`                            |
| Real Bedrock client (shared client, model pick) | MCP + AI features | Sep 28–29      | Agent loop exists; `bedrock-client.ts` is keyword-mocked, reads no env         |
| 7 backend type errors                           | Backend           | —              | `auth.service`, `user.service`, cache + dynamo config; `pnpm typecheck` fails  |

## Upcoming (not due, not missing yet)

| Item                                                 | Owner (role)      | Due       |
| ---------------------------------------------------- | ----------------- | --------- |
| `frontend/src/api.ts` client                         | Frontend          | Oct 7     |
| Appointments, alerts, summaries, adherence endpoints | Backend           | Oct 5     |
| Summary generator + daily job                        | AI features       | Oct 2–5   |
| Agent follow-ups, Guardrails, Ring tool              | MCP / AI features | Oct 11–13 |
| Dashboard on live API + 15s polling                  | Frontend          | Oct 10    |
