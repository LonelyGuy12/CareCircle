# CareCircle accessibility guidelines

Audience includes older caregivers: large text, large targets, and
screen-reader support are requirements, not extras. Status is repo truth as
of Oct 3, 2026 — "Done" means verified in `frontend/src`.

## 1. Keyboard use

- Every interactive element is a real `<button>`, `<a>`, or `<input>` —
  reachable by Tab in a logical order. Done (buttons, links, nav, dialogs).
- A "Skip to main content" link sits first in the layout and appears on
  focus. Done (`Layout.tsx`).
- Dialogs close on Escape, move focus into the dialog on open, and return
  focus to the trigger on close. Done (`ui/dialog.tsx`).
- Tabs support Left/Right arrow keys with `tablist`/`tab`/`tabpanel`
  semantics. Done (`ui/tabs.tsx`).
- TODO: add a keyboard walkthrough to the manual test plan (Oct 8 task).

## 2. Contrast (WCAG AA)

- Text pairs: teal-800 `#115e59` on white, slate-900 on slate-50,
  red-700 on red-50, amber-900 on amber-100 — all ≥ 4.5:1. Done via design
  tokens (`theme/tokens.ts`, `index.css`).
- Status is never color alone: every dose/alert badge pairs an icon with a
  text label (Taken ✓, Due, Missed ⚠, New ⚠). Done (`ui/status-badge.tsx`).
- Dark mode (`.dark` class + `prefers-color-scheme` default, persisted toggle)
  keeps the same contrast policy. Done (`hooks/use-theme.ts`).
- TODO: run a contrast-meter pass over the final palette (Oct 19 task).

## 3. Screen-reader labels

- Nav landmarks (`aria-label="Primary"`, `"Care sections"`), unread counts
  announced (`"3 unread alerts"`), read/unread prefixed (`"Unread: …"`).
  Done (`Layout.tsx`, `Alerts.tsx`).
- Polling updates use `aria-live="polite"` ("Updated HH:MM:SS"), never
  assertive. Chat messages, typing indicator, and toasts are polite live
  regions. Done (`Today.tsx`, `ChatBox.tsx`, `ui/toast.tsx`).
- Chart has `role="img"` + text summary and a "View data as a list"
  fallback. Done (`AdherenceChart.tsx`).
- TODO: full screen-reader sweep with a real reader (Oct 19 task).

## 4. Large text and targets

- Base font is 17px; body copy stays at 1.0625rem. Done (`index.css`).
- Every button, link, tab, and input is at least 44px tall
  (`min-h-[2.75rem]`). Mobile bottom nav targets are 56px. Done
  (design-system-wide).

## 5. Error messages

- Form errors appear inline under the field, linked with
  `aria-describedby`, fields flagged `aria-invalid`, summary errors use
  `role="alert"`. Done (`ui/input.tsx`).
- Banners with Retry use `role="alert"`. Component ready
  (`ui/error-banner.tsx`); not yet wired to a live API failure path —
  that wiring belongs to the Oct 10 live-API task.
