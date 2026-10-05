import type { HTMLAttributes } from 'react';

import { cn } from '../../lib/cn';

type BadgeTone = 'default' | 'brand' | 'success' | 'warning' | 'danger' | 'neutral';

const toneClasses: Record<BadgeTone, string> = {
    default: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    brand: 'bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
    warning: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
    danger: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
    neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    tone?: BadgeTone;
}

export function Badge({ tone = 'default', className, ...props }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex min-h-[1.75rem] items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold',
                toneClasses[tone],
                className,
            )}
            {...props}
        />
    );
}
