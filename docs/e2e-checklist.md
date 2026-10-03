# CareCircle end-to-end checklist

Target flow (plan, Oct 15–16): a natural sentence spoken to the simulator
changes DynamoDB, shows on the dashboard within 15 seconds, and appears in
that night's summary. Repo truth as of Oct 3, 2026 — most links are 🔲.

## Preconditions

- 🔲 Simulator speaks into agent → MCP wiring (DevOps, Oct 11).
- 🔲 Medications + doses endpoints live on deployed DynamoDB (Backend).
- 🔲 Dashboard on live API with 15s polling (Frontend, Oct 10).
  Frontend-only polling over mock data ✅ exists today.
- 🔲 Nightly EventBridge 9 PM IST → summary Lambda (AI-features, Oct 13).

## The run

1. 🔲 Say "Mom took her morning metformin" to the simulator.
2. 🔲 Agent calls `confirm_dose` (follow-up if the name is ambiguous).
3. 🔲 DynamoDB dose row flips to taken (verify with a table read).
4. 🔲 Dashboard timeline shows Taken within 15 seconds of the voice input.
5. 🔲 That night's summary mentions the confirmed dose.
6. 🔲 No step emits medical advice (Guardrails, Oct 12).

## Sign-off

- [ ] All six steps pass on `test` (Oct 15 task, with Quality).
- [ ] Failures logged with `.github/ISSUE_TEMPLATE/bug.md`.
- [ ] Merge `test → main` only at the milestone (lead only).
