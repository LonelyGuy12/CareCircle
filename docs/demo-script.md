# CareCircle 3-minute demo script + backup plan

Only features that exist in the repo. Anything else is marked 🔲 and must
not be shown as working.

## Script (3:00)

**0:00–0:30 — Problem.** Family caregivers juggle pills, visits, and worry.
CareCircle gives them one calm dashboard; the older relative confirms doses
by voice.

**0:30–1:20 — Dashboard (frontend, mock data).** Open Today: glance cards,
dose timeline, press "Mark taken" on a Due dose (badge flips, toast fires).
Show the weekly adherence chart (open "View data as a list" for the
accessible fallback). Open Medications → Add medication with a bad time
(`25:99`) to show inline validation, then save correctly. Toggle dark mode.

**1:20–2:10 — Voice path (MCP mock).** Terminal 1:
`pnpm --dir mcp-server exec tsx src/mock/mock-api.ts`. Terminal 2:
`pnpm --dir mcp-server exec tsx src/scripts/try-agent.ts`. Type "mom took
her metformin" → show the `confirm_dose` tool call and result. Say clearly:
🔲 Bedrock is still mocked; the live model + Guardrails are pending.

**2:10–2:50 — Summaries + alerts.** Show Daily Summaries (All-good vs Needs
attention badges) and Alerts → "Mark all read" (badge count drops). Note:
🔲 nightly Bedrock summaries are pending; current content is mock.

**2:50–3:00 — Close.** Stack: React + Vite, Express 5, DynamoDB, Bedrock,
MCP. Repo, tests (`pnpm test`), and docs are linked below the video.

## Backup plan

- If the live demo breaks: play the pre-recorded run (record Oct 21) and
  narrate over it — same script, same timestamps.
- If the MCP terminals fail: fall back to the dashboard half only (0:30–1:20
    - 2:10–3:00); the mock-API transcript in `mcp-server/README.md` covers
      the voice path verbally.
- Never improvise unbuilt features on camera (live API, Guardrails, nightly
  job, Ring events are all 🔲).
