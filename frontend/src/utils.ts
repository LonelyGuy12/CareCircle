export const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });

export const statusStyle = {
    taken: { label: 'Taken', className: 'bg-green-100 text-green-800' } as const,
    missed: { label: 'Missed', className: 'bg-red-100 text-red-800' } as const,
    pending: { label: 'Upcoming', className: 'bg-amber-100 text-amber-800' } as const,
} as const;

type StatusStyle = typeof statusStyle;

export type { StatusStyle };
