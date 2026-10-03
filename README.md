# CareCircle

CareCircle helps family caregivers keep track of an older relative's
medications and appointments. Caregivers get a dashboard with today's doses,
adherence, alerts and daily summaries. The person being cared for can confirm
doses by voice, and an AI agent turns natural speech into actions.

## What works today

- **Caregiver dashboard** (`frontend/`, mock data): dose timeline with
  "Mark taken", weekly adherence chart, next appointment, unread alerts,
  caregiver Q&A chat box, validated medication/appointment forms, light/dark
  mode.
- **Backend** (`backend/`): auth, health and user modules (Express 5 +
  TypeScript, DynamoDB service, zod validation).
- **MCP server** (`mcp-server/`): 6 tools (today's meds, due doses,
  confirm dose, add appointment, next appointment, daily summary stub) plus a
  tool-calling agent loop (Bedrock client still mocked).

## Getting started

Prerequisites: Node 24 (see `.nvmrc`) and pnpm.

```bash
npm install -g pnpm
pnpm install
pnpm --dir frontend dev   # dashboard on mock data (http://localhost:5173)
pnpm --dir backend dev    # API (needs backend/.env — see docs/setup.md)
pnpm --dir mcp-server dev # MCP tools + agent loop
```

Full environment, DynamoDB and per-package instructions:
[docs/setup.md](docs/setup.md). Design docs:
[docs/wireframes.md](docs/wireframes.md),
[docs/accessibility.md](docs/accessibility.md).

## Contributing

```
feature branch → test → main
```

- Work on your own branch, open PRs into `test`, never push to `main`.
- TypeScript only (`.ts`/`.tsx`, strict, no `any`). Husky enforces
  Conventional Commits and runs lint-staged — do not use `--no-verify`.
