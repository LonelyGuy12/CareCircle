# CareCircle MCP Server

MCP server exposing CareCircle's medication and appointment tools to an AI agent (e.g. Alexa+ via Bedrock).

## Setup

npm install
cp .env.example .env   # set API_BASE_URL if not localhost:3000

## Run

pnpm run dev        # watch mode
pnpm run inspect     # test tools in MCP Inspector
pnpm run typecheck   # type-check only

## Mock API (for local testing without the real backend)

pnpm tsx src/mock/mock-api.ts

## Tools

| Tool | Description |
|---|---|
| get_todays_meds | List today's doses and their status |
| get_due_doses | List pending doses due now |
| confirm_dose | Find a pending dose by name/time and mark it taken |
| add_appointment | Save a new appointment |
| get_next_appointment | Return the next upcoming appointment |
| get_daily_summary | Get the caregiver summary for a date (stub, pending Bedrock integration) |

## Structure

src/
  server.ts        entry point
  tools/           one file per tool + index.ts registering them all
  api/             fetch client + per-resource API calls
  mock/            local fake data + fake HTTP API for offline testing
  utils/           shared helpers (result wrapping, error wrapping, name/time matching)
  types.ts         shared types (mirrors the team's shared/types.ts)