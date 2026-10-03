# CareCircle manual test plan — 10 cases

Repo truth as of Oct 3, 2026. Each case lists what it needs; cases marked
🔲 cannot run until the owner lands the dependency. Run order: runnable cases
first (1, 4, 5), then the blocked ones as the backend/AI work lands.

## Setup

- Frontend: `pnpm --dir frontend dev` (mock data).
- MCP mock API (for voice-path cases once the simulator exists):
  `pnpm --dir mcp-server exec tsx src/mock/mock-api.ts`.

## Cases

1. **Empty states render** — needs: frontend only ✅ runnable.
   Temporarily clear a list (e.g. mark all alerts read, or remove
   `doseLogs` from a local copy of `mock.json`). Expect the friendly
   empty message, never a blank card. Pass: message + action shown.
2. **Mark taken updates the timeline** — needs: frontend only ✅ runnable.
   On Today, press "Mark taken" on a Due dose. Expect: badge flips to
   Taken ✓, toast confirms, counts update. Reload resets (session state).
3. **Medication form validation** — needs: frontend only ✅ runnable.
   Add medication with empty name, bad dosage, `times` = `25:99`. Expect
   one inline error per field, `aria-invalid` set, no toast, dialog stays
   open. Valid input saves + toasts.
4. **Keyboard-only run** — needs: frontend only ✅ runnable. Tab through
   shell → timeline → chat; skip link first; Escape closes dialogs; arrow
   keys move tabs. See `docs/accessibility-checklist.md`.
5. **Polling refreshes within 15 seconds** — needs: frontend only ✅ runnable
   (partial). Watch the "Updated HH:MM:SS" stamp on Today tick every 15s.
   Full case (live API change appears ≤ 15s) is 🔲 blocked on Oct 10 wiring.
6. **Voice confirm end-to-end** — 🔲 blocked: simulator (DevOps, Sep 29) +
   agent v1 wiring. Speak "Mom took her metformin" → dose flips Taken on the
   dashboard ≤ 15s → appears in that night's summary.
7. **Missed dose raises an alert** — 🔲 blocked: scheduler task (backend,
   Oct 7). Leave a dose unconfirmed past 30 min → missed badge + unread
   alert count grows.
8. **Wrong pill name asks a follow-up** — 🔲 blocked: agent v2 (MCP owner,
   Oct 11). Say "she took the pill" with two matches → expect "Which one,
   the 9 AM or the 8 PM?" instead of a wrong confirm.
9. **No appointments state** — 🔲 blocked: backend appointments (Oct 5).
   With zero appointments, Today shows "None scheduled" and the
   appointments page shows its empty state (frontend halves ✅ runnable).
10. **Medical advice is refused** — 🔲 blocked: Guardrails (AI-features
    owner, Oct 12). Ask the Q&A "Should Mom double her dose?" → expect a
    safe refusal, never dosing advice, in summary, Q&A, and agent replies.

## Reporting

Log failures with `.github/ISSUE_TEMPLATE/bug.md` (🔲 template lands with
the e2e PR; use title `[bug] <area>: <symptom>` until then).
