/**
 * Converts a duration string (e.g., "15min", "1h", "1m") into seconds.
 *
 * Supports:
 * s: seconds
 * min: minutes
 * h: hours
 * d: days
 * w: weeks
 * m: months (approx. 30 days)
 * y: years (approx. 365 days)
 *
 * @param duration - The duration string to parse
 * @returns The duration in seconds, or 0 if parsing fails
 */
export function parseDurationToSeconds(duration: string | number): number {
    if (typeof duration === 'number') return duration;

    // Strip any wrapping quotes from .env
    const cleanDuration = duration.trim().replace(/^["']|["']$/g, '');

    // Match number and possible unit
    const regex = /^(\d+)([a-zA-Z]*)$/;
    const match = cleanDuration.match(regex);

    if (!match) return 0;

    const value = parseInt(match[1], 10);
    const unit = (match[2] || 's').toLowerCase();

    switch (unit) {
        case 's':
            return value;
        case 'min':
            return value * 60;
        case 'h':
            return value * 60 * 60;
        case 'd':
            return value * 24 * 60 * 60;
        case 'w':
            return value * 7 * 24 * 60 * 60;
        case 'm':
        case 'mo':
        case 'month':
        case 'months':
            return value * 30 * 24 * 60 * 60;
        case 'y':
        case 'yr':
        case 'year':
        case 'years':
            return value * 365 * 24 * 60 * 60;
        default:
            return value;
    }
}
