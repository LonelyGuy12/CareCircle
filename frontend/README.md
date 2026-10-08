# CareCircle dashboard (frontend)

Owner: Chillsidealways

```bash
npm install
npm run dev   # http://localhost:5173
```

Runs on `src/data/mock.json` until the backend is live.

Set `VITE_API_URL` (see `.env.example`, e.g. `http://localhost:5500`) to
point the dashboard at the live Express API: medications, doses,
appointments and summaries load live with 15-second polling, loading and
error states. Alerts, adherence, profile identity and caregiver Q&A stay
on-device until their backend endpoints land.
