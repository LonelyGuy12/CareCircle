import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        'bg-teal-700 text-white hover:bg-teal-800 dark:bg-teal-400 dark:text-teal-950 dark:hover:bg-teal-300',
    secondary:
        'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
    outline:
        'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-transparent dark:text-slate-100 dark:hover:bg-slate-800',
    ghost: 'text-teal-800 hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-slate-800',
    destructive:
        'bg-red-700 text-white hover:bg-red-800 dark:bg-red-500 dark:text-red-950 dark:hover:bg-red-400',
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'min-h-[2.75rem] px-3 py-1.5 text-sm',
    md: 'min-h-[2.75rem] px-4 py-2 text-[1.0625rem]',
    lg: 'min-h-[3rem] px-6 py-3 text-lg',
};

export function Button({
    variant = 'primary',
    size = 'md',
    className,
    type = 'button',
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            className={cn(
                'inline-flex items-center justify-center gap-2 rounded-xl font-semibold',
                'transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                'focus-visible:outline-3 focus-visible:outline-offset-2',
                variantClasses[variant],
                sizeClasses[size],
                className,
            )}
            {...props}
        />
    );
}
