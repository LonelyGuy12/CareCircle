import type { HTMLAttributes } from 'react';

import { cn } from '../../lib/cn';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            aria-hidden="true"
            className={cn(
                'animate-pulse rounded-xl bg-slate-200 motion-reduce:animate-none dark:bg-slate-800',
                className,
            )}
            {...props}
        />
    );
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
    return (
        <div aria-hidden="true" className="flex flex-col gap-3">
            <Skeleton className="h-6 w-1/3" />
            {Array.from({ length: lines }, (_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
            ))}
        </div>
    );
}

export function PageSkeleton() {
    return (
        <div role="status" aria-label="Loading" className="flex flex-col gap-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-40 w-full" />
            <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        </div>
    );
}
