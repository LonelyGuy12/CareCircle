// Frontend domain types — re-exported from the single shared contract.
// Canonical source: `shared/types.ts` (Phase 1 milestone, Sep 30).
// Import shared types directly in new code:
//   import type { Medication } from '../../../shared/types';

export type {
    Alert,
    AlertType,
    Appointment,
    Caregiver,
    CareRecipient,
    ConfirmVia,
    DoseLog,
    DoseStatus,
    EmergencyContact,
    Medication,
    DashboardData as MockData,
    Summary,
    WeeklyAdherence,
} from '../../../shared/types';
