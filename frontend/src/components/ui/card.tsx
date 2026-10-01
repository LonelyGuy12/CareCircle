import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLElement>) {
    return (
        <section
            className={cn(
                'rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06)]',
                'dark:border-slate-800 dark:bg-slate-900',
                className,
            )}
            {...props}
        />
    );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('mb-3 flex flex-wrap items-start justify-between gap-2', className)}
            {...props}
        />
    );
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
    children: ReactNode;
}

export function CardTitle({ className, children, ...props }: CardTitleProps) {
    return (
        <h2 className={cn('text-xl font-bold tracking-tight', className)} {...props}>
            {children}
        </h2>
    );
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p className={cn('text-base text-slate-600 dark:text-slate-400', className)} {...props} />
    );
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('text-[1.0625rem] leading-relaxed', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('mt-4 flex flex-wrap items-center gap-2', className)} {...props} />;
}
