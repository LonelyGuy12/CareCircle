import type { SVGProps } from 'react';

import { type StatusKey, statusMeta } from '../../theme/tokens';
import { Badge } from './badge';

function CheckIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 16 16"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
            {...props}
        >
            <path d="M3 8.5 6.5 12 13 4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function ClockIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 16 16"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
            {...props}
        >
            <circle cx="8" cy="8" r="6" />
            <path d="M8 4.5V8l2.5 1.5" strokeLinecap="round" />
        </svg>
    );
}

function AlertIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 16 16"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
            {...props}
        >
            <path d="M8 2 14.5 13.5h-13L8 2Z" strokeLinejoin="round" />
            <path d="M8 6.5v3" strokeLinecap="round" />
            <circle cx="8" cy="11.5" r="0.6" fill="currentColor" />
        </svg>
    );
}

function InfoIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 16 16"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
            {...props}
        >
            <circle cx="8" cy="8" r="6" />
            <path d="M8 7.2v3.3" strokeLinecap="round" />
            <circle cx="8" cy="5" r="0.7" fill="currentColor" />
        </svg>
    );
}

const icons = {
    check: CheckIcon,
    clock: ClockIcon,
    alert: AlertIcon,
    info: InfoIcon,
} as const;

const toneForStatus: Record<StatusKey, 'success' | 'warning' | 'danger' | 'brand'> = {
    taken: 'success',
    due: 'warning',
    missed: 'danger',
    alert: 'danger',
    info: 'brand',
};

interface StatusBadgeProps {
    status: StatusKey;
    className?: string;
}

/**
 * Status is never color alone: every badge pairs icon + text label.
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
    const meta = statusMeta[status];
    const Icon = icons[meta.icon];
    return (
        <Badge tone={toneForStatus[status]} className={className}>
            <Icon />
            {meta.label}
        </Badge>
    );
}
