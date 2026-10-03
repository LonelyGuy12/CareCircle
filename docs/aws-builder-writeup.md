# CareCircle — AWS Builder write-up (draft)

## Problem

Family caregivers of older relatives juggle medication schedules,
appointments, and constant worry. A missed afternoon pill is invisible until
the next crisis. CareCircle gives the caregiver one calm dashboard and lets
the older relative confirm doses by voice.

## Architecture (as built)

- **Frontend** (`frontend/`): React 19 + Vite + Tailwind + React Router +
  Recharts. Six pages (Today, Medications, Appointments, Summaries, Alerts,
  Profile) on mock data, with a design system (tokens, dark mode, 44px
  targets, icon+label status badges, aria-live polling stamp).
- **Backend** (`backend/`): Express 5 + TypeScript + zod, with `auth`,
  `health`, and `user` modules. Care modules (medications, doses,
  appointments, alerts, summaries, adherence) are TODO — tracked in
  `docs/status.md`.
- **MCP** (`mcp-server/`): 6 tools over a mock HTTP API, plus an in-process
  Bedrock tool-calling agent loop (`runAgent`).
- **Database**: DynamoDB via `DynamoDBService` (`carecircle_` prefix,
  optional `DYNAMODB_ENDPOINT` for Local). TODO: table/key doc, Local guide,
  seed script.

## Bedrock and Guardrails

- TODO (plan Oct 2–12): real Converse-API summary generator with JSON
  output, nightly EventBridge job, caregiver Q&A endpoint, and Guardrails
  refusing medical advice. Today `bedrock-client.ts` is keyword-mocked and
  the dashboard Q&A answers from mock data labeled "demo only".

## MCP

The server exposes `get_todays_meds`, `get_due_doses`, `confirm_dose`
(name/alias matching, follow-up on ambiguity), `add_appointment`,
`get_next_appointment`, and `get_daily_summary` (stub). The agent maps
natural sentences to tool calls and executes them over an in-memory
transport — demoable offline against the mock API.

## DynamoDB key design

TODO: no key-design doc exists yet. What the code fixes: one prefixed table
namespace per resource (`FullTableName`), document-client CRUD in
`DynamoDBService`. Per-key choices belong to the backend owner (due Sep 28).

## Lessons learned

1. Contract first: building UI/MCP against mock data while the
   `shared/types.ts` contract slipped made integration the critical path.
2. TODO-visible beats done-pretended: `{ todo: true }` placeholders and
   🔲-marked docs kept the Oct 3 review honest.
3. Gates cut both ways: the pre-push typecheck gate currently blocks even
   docs pushes while 7 backend errors stand — fix fast or scope the gate.
