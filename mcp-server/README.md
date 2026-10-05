# CareCircle MCP Server

MCP server exposing CareCircle's medication and appointment tools to an AI agent (e.g. Alexa+ via Bedrock).

Part of the CareCircle pnpm monorepo — run `pnpm install` from the repo root, not inside this folder.

## Setup

pnpm install
cp .env.example .env # set API_BASE_URL if not localhost:3000

## Run

pnpm run dev # watch mode
pnpm run inspect # test tools in MCP Inspector
pnpm run typecheck # type-check only

## Mock API (for local testing without the real backend)

pnpm exec tsx src/mock/mock-api.ts

## Tools

| Tool                 | Description                                                                           |
| -------------------- | ------------------------------------------------------------------------------------- |
| get_todays_meds      | List today's doses and their status                                                   |
| get_due_doses        | List pending doses due now                                                            |
| confirm_dose         | Find a medication by name or alias, match a pending or missed dose, and mark it taken |
| add_appointment      | Save a new appointment                                                                |
| get_next_appointment | Return the next upcoming appointment, or none if there isn't one                      |
| get_daily_summary    | Get the caregiver summary for a date (stub, pending Bedrock integration)              |

## Agent (Bedrock tool-calling)

A minimal agent loop that turns natural speech into MCP tool calls, built in-process (no network hop between agent and tools):

- `src/agent/bedrock-client.ts` — calls Bedrock and returns which tool(s) to call. **Currently mocked** with keyword matching (e.g. "took" → `confirm_dose`), pending shared Bedrock access/credentials from the team.
- `src/agent/tool-runner.ts` — connects an MCP client to the server in-memory (via `InMemoryTransport`) and actually executes the chosen tool, returning its text result plus whether it needs a follow-up answer from the person.
- `src/agent/agent.ts` — `runAgent(text)`: ties the above together and returns `{ text, needsFollowUp }`.

Tools can now signal "this needs a follow-up" via `asFollowUp()` in `utils/result.ts` (used by `confirm_dose` when multiple doses match). `get_due_doses` also returns a friendly "No doses are due right now" message instead of an empty array.

Test the full loop:

pnpm exec tsx src/mock/mock-api.ts # terminal 1
pnpm exec tsx src/scripts/try-agent.ts # terminal 2

## Structure

src/
server.ts entry point
tools/ one file per tool + index.ts registering them all
api/ fetch client + per-resource API calls (doses, appointments, medications)
mock/ local fake data + fake HTTP API for offline testing
utils/ shared helpers (result wrapping, error wrapping, name/time matching)
types.ts shared types (mirrors the team's shared/types.ts)

## Known pending work

- API client currently expects raw JSON responses. Needs updating once the team confirms the `{ success, message, data }` response envelope shape used by the backend.
