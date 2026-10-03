# CareCircle setup guide

Repo truth as of Oct 3, 2026. Items marked 🔲 are **not yet in the repo** —
do not assume they work; see `docs/status.md`.

## Prerequisites

- Node 24 (see `.nvmrc`, which pins `v24`).
- pnpm (the repo blocks npm/yarn/bun via `scripts/check-env.js` and `.npmrc`).

```bash
npm install -g pnpm
pnpm install
```

## Environment files

Copy each example and fill in values locally. Never commit real secrets —
`.env` files are gitignored.

| Package      | Example                   | Notes                                                                                                                                     |
| ------------ | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `backend`    | `backend/.env.example`    | `PORT` (default `5500` in code), `AWS_REGION`, DynamoDB keys, auth + SMTP secrets (required by `ConfigService`, the app exits if missing) |
| `mcp-server` | `mcp-server/.env.example` | `API_BASE_URL`, plus `AWS_REGION` / `BEDROCK_MODEL_ID` placeholders (🔲 unused — the Bedrock client is still mocked)                      |

## DynamoDB Local — 🔲 not yet in the repo

The backend `DynamoDBService` already honors `DYNAMODB_ENDPOINT`,
`AWS_REGION`, and `DYNAMODB_TABLE_PREFIX`, so pointing it at DynamoDB Local
later is a config change, not a code change. What is still missing:

- 🔲 Docker/run instructions for DynamoDB Local.
- 🔲 Table-creation and key-design script.
- 🔲 Seed script with demo data.

## Seed script — 🔲 not yet in the repo

No seed script exists. The frontend runs on `frontend/src/data/mock.json`
until the backend endpoints land.

## Running each part

```bash
# frontend (mock data, http://localhost:5173)
pnpm --dir frontend dev

# backend (needs .env — see above; currently auth/health/user only)
pnpm --dir backend dev

# mcp-server (tools + mocked agent loop)
pnpm --dir mcp-server dev
# offline end-to-end of the agent loop (two terminals):
pnpm --dir mcp-server exec tsx src/mock/mock-api.ts
pnpm --dir mcp-server exec tsx src/scripts/try-agent.ts
```

- Alexa+/voice simulator: 🔲 not yet in the repo.
- Useful scripts: `pnpm lint`, `pnpm format`, `pnpm typecheck` (root runs the
  backend check only). Husky runs `lint-staged` on commit and enforces
  Conventional Commits — never commit with `--no-verify`.

## Branch and PR rules

```
feature branch  →  test  →  main
```

- Work on your own branch (`docs-tests`, `docs-tests/<topic>` for follow-ups).
- Open PRs into `test`. Never push to `main` — only the lead merges
  `test → main` at milestones.
- Keep PRs small and focused, one per task group.
- TypeScript only (`.ts`/`.tsx`, strict, no `any`).
