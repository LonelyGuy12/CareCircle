/**
 * CareCircle design tokens — calm, trustworthy healthcare palette.
 * Presentation only. Values mirror the CSS variables in `src/index.css`.
 * Keep in sync when tokens change. Light + dark included.
 */

export const palette = {
    brand: {
        50: '#f0fdfa',
        100: '#ccfbf1',
        600: '#0d9488',
        700: '#0f766e',
        800: '#115e59',
        900: '#134e4a',
    },
    ink: {
        backgroundLight: '#f8fafc',
        surfaceLight: '#ffffff',
        borderLight: '#e2e8f0',
        textLight: '#0f172a',
        mutedLight: '#475569',
        backgroundDark: '#020617',
        surfaceDark: '#0f172a',
        borderDark: '#1e293b',
        textDark: '#f1f5f9',
        mutedDark: '#94a3b8',
    },
} as const;

export const statusPalette = {
    taken: { bg: '#dcfce7', fg: '#166534', border: '#86efac' },
    due: { bg: '#fef3c7', fg: '#92400e', border: '#fcd34d' },
    missed: { bg: '#fee2e2', fg: '#991b1b', border: '#fca5a5' },
    alert: { bg: '#fee2e2', fg: '#991b1b', border: '#fca5a5' },
    info: { bg: '#f0fdfa', fg: '#115e59', border: '#99f6e4' },
} as const;

export type DoseStatus = 'taken' | 'due' | 'missed';
export type AlertStatus = 'alert' | 'info';

export const typeScale = {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1.0625rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
} as const;

export const radii = {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.25rem',
    full: '9999px',
} as const;

export const minTouchTarget = '2.75rem';

export const statusMeta = {
    taken: { label: 'Taken', icon: 'check' },
    due: { label: 'Due', icon: 'clock' },
    missed: { label: 'Missed', icon: 'alert' },
    alert: { label: 'Alert', icon: 'alert' },
    info: { label: 'Info', icon: 'info' },
} as const;

export type StatusKey = keyof typeof statusMeta;
