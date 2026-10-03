# CareCircle wireframes

Text wireframes for the 6 planned pages. Status is repo truth as of Oct 3, 2026
(branch `docs-tests`, frontend on mock data in `frontend/src/data/mock.json`).

Legend: ✅ exists in the frontend today · 🔲 planned, not yet built.

## 1. Dashboard (`/`, `Today.tsx`) — ✅ exists

```
+--------------------------------------------------+
| Top bar: CareCircle | Caring for <name> | user   |
|          [Dark] theme toggle                     |
+--------+---------------------------+-------------+
| Side   | TODAY                     |             |
| bar    | Updated HH:MM:SS (live)   |             |
| Today  | [2 of 5 taken][Next appt] |             |
| Meds   | [1 unread]                |             |
| Appts  | DOSE TIMELINE             |             |
| Summ.  | 09:00 Amlodipine  [Taken]  |             |
| Alerts | 13:00 Vitamin D3  [Missed]  |             |
| Profile| 20:00 Metformin [Due][Mark  |             |
|        |  taken]                     |             |
|        | WEEKLY ADHERENCE (bar chart |             |
|        |  + "View data as a list")   |             |
|        | [Latest AI summary][Care Q&A |             |
|        |  chat: bubbles, suggested    |             |
|        |  questions, typing state]    |             |
+--------+---------------------------+-------------+
| Mobile: bottom nav (6 icons), content above      |
+--------------------------------------------------+
```

Notes: at-a-glance cards, dose timeline with Mark taken, recharts bar chart,
caregiver Q&A chat box (mock answers), 15-second polling updates the
"Updated" stamp via `CareCircleProvider`. Live-API wiring is 🔲 (Oct 10 plan).

## 2. Medications (`/medications`) — ✅ exists

```
MEDICATIONS                        [+ Add medication]
[List: name, dosage, times, instructions]  [Edit] each
[Dialog modal: Name*, Dosage*, Daily times*, Instructions]
  inline validation errors, Cancel / Save
[Good-to-know card]
```

## 3. Appointments (`/appointments`) — ✅ exists

```
APPOINTMENTS                       [+ Add appointment]
[List sorted by date: title, date/time, doctor, location, notes]  [Edit]
[Dialog modal: Title*, Doctor*, Location*, Date/time*, Notes]
```

## 4. Daily Summaries (`/summaries`) — ✅ exists

```
DAILY SUMMARIES
[Card per day: date, headline, [All good ✓ | Needs attention ⚠], text]
```

AI-generated nightly summaries are 🔲 (backend + Bedrock job, Oct 13 plan).

## 5. Alerts (`/alerts`) — ✅ exists

```
ALERTS (N unread)                  [Mark all read]
[● Unread: message, time, source]  [New ⚠][Mark read]
[○ Read: message, time]
```

## 6. Profile (`/profile`) — ✅ exists

```
[Avatar initial] <Name> — Age N · Cared for by <caregiver>
[Details card: age, condition badges, care notes]
[Emergency contacts card: name (relation), phone, Call tel: link]
```

## Page inventory

| Planned page | Route           | File               | Status | Data today              |
| ------------ | --------------- | ------------------ | ------ | ----------------------- |
| Dashboard    | `/`             | `Today.tsx`        | ✅     | mock                    |
| Medications  | `/medications`  | `Medications.tsx`  | ✅     | mock + local edits      |
| Appointments | `/appointments` | `Appointments.tsx` | ✅     | mock + local edits      |
| Summaries    | `/summaries`    | `Summaries.tsx`    | ✅     | mock                    |
| Alerts       | `/alerts`       | `Alerts.tsx`       | ✅     | mock + local read state |
| Profile      | `/profile`      | `Profile.tsx`      | ✅     | mock                    |

Beyond the plan, the frontend already has: design-system primitives
(`components/ui/`), light/dark theme, toast notifications, loading skeletons,
empty states. The `frontend/src/api.ts` client is 🔲 (Oct 7 plan).
