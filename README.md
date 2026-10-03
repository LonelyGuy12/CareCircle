# CareCircle

CareCircle helps family caregivers keep track of an older relative's medications and appointments. Caregivers get a dashboard with today's doses, adherence, alerts and AI-written daily summaries. The person being cared for can confirm doses by voice, and an AI agent turns natural speech into actions.

## Features

- **Caregiver dashboard:** dose timeline with "Mark taken", weekly adherence chart, next appointment and unread alerts
- **Medications and appointments:** add and edit with validated forms
- **Alerts:** missed-dose alerts with read tracking
- **Daily summaries:** AI-generated nightly summary of the day
- **Caregiver Q&A:** ask questions such as "How was Mom's week?"
- **Voice flow:** speech is routed to an AI agent that calls MCP tools to confirm doses and update records
- **Guardrails:** Amazon Bedrock Guardrails block medical advice in summaries, Q&A and agent replies

## Tech stack

| Area       | Technology                                        |
| ---------- | ------------------------------------------------- |
| Language   | TypeScript, Node 24                               |
| Frontend   | React, Vite, Tailwind CSS, React Router, Recharts |
| Backend    | Express 5, Zod                                    |
| Database   | Amazon DynamoDB                                   |
| AI         | Amazon Bedrock (Converse API, Guardrails), MCP    |
| Deployment | AWS Lambda, API Gateway, Amplify, EventBridge     |
| Tooling    | pnpm workspace, ESLint, Prettier, Husky           |

## Repository layout

```
backend/              Express API, DynamoDB, scheduler
frontend/             React + Vite caregiver dashboard
mcp-server/           MCP tools and Bedrock agent loop
scripts/              Repository tooling
tsconfig.base.json    Shared TypeScript configuration
```

## Getting started

**Prerequisites:** Node 24 (see `.nvmrc`) and pnpm. This repository requires pnpm; npm, yarn and bun are blocked.

```bash
npm install -g pnpm
pnpm install
pnpm --dir frontend dev   # dashboard on mock data (http://localhost:5173)
pnpm --dir backend dev    # API (needs backend/.env — see docs/setup.md)
pnpm --dir mcp-server dev # MCP tools + agent loop
```

The frontend currently runs on mock data and will move to the live API once the endpoints are ready.

Full environment, DynamoDB and per-package instructions:
see [docs/setup.md](docs/setup.md). Design docs live in
[docs/wireframes.md](docs/wireframes.md) and
[docs/accessibility.md](docs/accessibility.md).

## Scripts

| Command          | Description                         |
| ---------------- | ----------------------------------- |
| `pnpm lint`      | Run ESLint                          |
| `pnpm format`    | Format with Prettier                |
| `pnpm typecheck` | Type check                          |
| `pnpm test`      | Run backend test suite              |
| `pnpm build`     | Production build (inside a package) |

## Contributing

```
feature branch → test → main
```

- Work on your own branch, open PRs into `test`, never push to `main`.
- TypeScript only (`.ts`/`.tsx`, strict, no `any`). Husky enforces
  Conventional Commits and runs lint-staged — do not use `--no-verify`.
