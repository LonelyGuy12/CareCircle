# CareCircle accessibility checklist (Oct 19 pass)

Verify each item against `frontend/src` on the branch under test. "Done"
items below were verified in code on Oct 3; re-check them after the Oct 10
live-API rewrite and the Oct 17 mobile/a11y fixes.

## Keyboard

- [x] All actions are real buttons/links/inputs in logical tab order.
- [x] Skip-to-content link first in layout, visible on focus (`Layout.tsx`).
- [x] Dialogs: Escape closes, focus moves in/out (`ui/dialog.tsx`).
- [x] Tabs: arrow-key navigation, `tablist` semantics (`ui/tabs.tsx`).
- [ ] Keyboard-only walkthrough of every page recorded (use
      `docs/manual-test-plan.md` case 4).

## Contrast (WCAG AA, 4.5:1 text)

- [x] Palette pairs meet AA by token (teal-800/white, slate-900/slate-50,
      red-700/red-50, amber-900/amber-100), dark mode included.
- [x] Status never color-alone (icon + label badges).
- [ ] Meter-measured pass over light + dark themes (not yet run).

## Screen-reader labels

- [x] Landmarks, unread counts, read/unread prefixes, polite live regions
      for polling/chat/toasts, chart text fallback.
- [ ] Full sweep with a real screen reader (not yet done).

## Text and targets

- [x] 17px base, 44px minimum targets (56px mobile nav).

## Errors

- [x] Inline field errors with `aria-describedby`/`aria-invalid`/`role=alert`;
      `role=alert` banner component ready (awaits live-API wiring Oct 10).

## Frontend fixes needed (from code read, Oct 3)

1. Suggested-questions wrapper in `ChatBox.tsx` carries `aria-label` on a
   plain `div` — give it `role="group"` so the label is exposed.
2. No automated accessibility tests exist — add keyboard/axe-style checks
   when the frontend test setup lands.
3. Re-run this whole checklist after the Oct 10 live-API change; dynamic
   error/loading states are the highest regression risk.
