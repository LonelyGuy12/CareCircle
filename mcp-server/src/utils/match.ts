import type { Dose } from "../types.js";

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();

// "9 AM" -> 9, "8 pm" -> 20, "14:00" -> 14, anything else -> null
export function parseHour(time: string): number | null {
  const m = time.trim().toLowerCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!m) return null;
  let hour = Number(m[1]);
  const meridiem = m[3];
  if (meridiem === "pm" && hour < 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;
  return hour <= 23 ? hour : null;
}

export function findMatchingDoses(doses: Dose[], medicationName: string, time?: string): Dose[] {
  const query = normalize(medicationName);
  if (!query) return [];

  let matches = doses.filter((d) => {
    const name = normalize(d.medicationName);
    return name.includes(query) || query.includes(name);
  });

  if (time) {
    const hour = parseHour(time);
    if (hour !== null) {
      matches = matches.filter((d) => Number(d.scheduledAt.slice(11, 13)) === hour);
    }
  }
  return matches;
}