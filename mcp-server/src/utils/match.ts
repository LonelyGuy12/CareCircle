import type { Dose, Medication } from '../types.js';

const normalize = (s: string) =>
    s
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .trim();

// "9 AM" -> 9, "8 pm" -> 20, "14:00" -> 14, anything else -> null
export function parseHour(time: string): number | null {
    const m = time
        .trim()
        .toLowerCase()
        .match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
    if (!m) return null;
    let hour = Number(m[1]);
    const meridiem = m[3];
    if (meridiem === 'pm' && hour < 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;
    return hour <= 23 ? hour : null;
}

// Matches spoken text against a medication's name OR any of its aliases
export function findMatchingMedications(
    medications: Medication[],
    spokenName: string,
): Medication[] {
    const query = normalize(spokenName);
    if (!query) return [];

    return medications.filter((med) => {
        const candidates = [med.name, ...med.aliases].map(normalize);
        return candidates.some((c) => c.includes(query) || query.includes(c));
    });
}

// Matches doses by medicationId, optionally narrowed by scheduled time
export function findMatchingDoses(doses: Dose[], medicationIds: string[], time?: string): Dose[] {
    let matches = doses.filter((d) => medicationIds.includes(d.medicationId));

    if (time) {
        const hour = parseHour(time);
        if (hour !== null) {
            matches = matches.filter((d) => Number(d.scheduledAt.slice(11, 13)) === hour);
        }
    }
    return matches;
}
