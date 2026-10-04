# CareCircle Backend Status & Architecture

A concise summary of everything implemented in the backend, current capabilities, and remaining work.

---

## 1. What Has Been Completed

### Core Architecture & Platform Layer

- **HTTP Server**: Express server with centralized JSON error handling (`AppError`, `ApiResponse`), CORS, CSRF, and cookie support.
- **Dependency Injection**: Singleton `Application` orchestrator and service `Container`.
- **Database Layer**: DynamoDB provider via AWS SDK Document Client with an in-memory fallback store for offline/local development without DynamoDB credentials.
- **Cache Layer**: Redis and Upstash Redis REST support with type-safe client initialization.
- **Logger**: Structured logging with Pino and fallback transport.
- **Input Validation**: Strict runtime request validation using Zod (`validate('json' | 'param' | 'query')`).

---

### Authentication & User Management

- **Auth Module** (`/auth`):
    - Register with password hashing (`argon2`).
    - Login with JWT access & refresh token rotation.
    - Token verification and session handling via `AuthMiddleware`.
- **User Module** (`/users`):
    - `GET /users/me` & `GET /users/profile/:id`: User profile lookup.
    - `PATCH /users/me`: Update profile details.
    - `PATCH /users/me/change-password`: Password rotation.
    - `PATCH /users/me/change-email`: Email update with validation.
    - `PATCH /users/me/two-factor-authentication`: 2FA toggle.
    - `DELETE /users/me`: Account deletion with password confirmation.

---

### Core Healthcare Modules (Implemented & Tested)

All endpoints are available under both `/api/<module>` and `/<module>`:

#### 1. Medications (`/api/medications`)

- `GET /api/medications`: List all medications.
- `GET /api/medications/:id`: Get a specific medication by ID.
- `POST /api/medications`: Create new medication schedule with 24-hour time arrays (e.g. `['09:00', '20:00']`).
- `PATCH /api/medications/:id`: Update existing medication.
- `DELETE /api/medications/:id`: Remove medication.

#### 2. Appointments (`/api/appointments`)

- `GET /api/appointments`: List appointments sorted chronologically by `dateTime`.
- `GET /api/appointments/next`: Retrieve the next upcoming appointment.
- `GET /api/appointments/:id`: Retrieve single appointment.
- `POST /api/appointments`: Schedule appointment (`title`, `doctor`, `location`, `dateTime`, `notes`).
- `PATCH /api/appointments/:id`: Update appointment details.
- `DELETE /api/appointments/:id`: Cancel/delete appointment.

#### 3. Doses (`/api/doses`)

- `GET /api/doses`: List all dose logs with medication details enriched.
- `GET /api/doses/today`: List today's doses.
- `GET /api/doses/due`: List pending doses requiring confirmation.
- `POST /api/doses/:id/confirm`: Confirm dose intake (`via: 'dashboard' | 'alexa' | 'caregiver'`).
- `POST /api/doses`: Create scheduled dose entry.

#### 4. Summaries (`/api/summaries`)

- `GET /api/summaries`: List daily caregiver summaries sorted by date.
- `GET /api/summaries/:date`: Get summary report for a specific date (`YYYY-MM-DD`).
- `POST /api/summaries`: Record daily summary with risk flags.

---

### Shared Type System

- Created [healthcare.ts](file:///run/media/musa/Games/Coding/CareCircle/backend/src/shared/types/healthcare.ts) in backend shared types, synchronized with frontend [mock.ts](file:///run/media/musa/Games/Coding/CareCircle/frontend/src/types/mock.ts):
    - `Medication`, `Appointment`, `DoseLog` / `Dose`, `Summary`, `Alert`, `CareRecipient`, `Caregiver`, `EmergencyContact`.
- Workspace configured in [pnpm-workspace.yaml](file:///run/media/musa/Games/Coding/CareCircle/pnpm-workspace.yaml) linking backend, frontend, and mcp-server.
- **TypeScript strict type checking passes with 0 errors across all workspace packages.**

---

## 2. What Is Left (Pending Work)

### Backend Tasks Left

1. **Avatar & Banner Media Uploads**:
    - `POST /users/me/avatar` and `POST /users/me/banner` currently return success stubs.
    - Requires wiring an S3/R2/Supabase bucket client to stream binary image uploads.
2. **Automated Unit & Integration Test Suite**:
    - Add a Jest/Vitest runner in `backend/` for automated regression testing in CI.
3. **Weekly Adherence Analytics Endpoint** (Optional/Convenience):
    - A dedicated aggregation endpoint `GET /api/doses/adherence` to compute weekly percentages dynamically from dose logs (frontend currently computes or uses mock stats).

---

### Full-Stack / Frontend Integration Tasks Left

1. **Frontend API Client**:
    - Replace local `seed = data as MockData` in `frontend/src/state/care-circle.tsx` with `fetch` calls to `http://localhost:3000/api/*`.
2. **End-to-End Integration Testing**:
    - Verify frontend mutations (marking doses taken, adding appointments/medications) persist directly into the backend store.
