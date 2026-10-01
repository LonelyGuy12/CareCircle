import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
    { label, error, hint, id, className, ...props },
    ref,
) {
    const generated = useId();
    const inputId = id ?? `input-${generated}`;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    const describedBy =
        [error ? errorId : null, hint ? hintId : null]
            .filter((v): v is string => v !== null)
            .join(' ') || undefined;

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={inputId} className="text-base font-semibold">
                {label}
            </label>
            <input
                ref={ref}
                id={inputId}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy}
                className={cn(
                    'min-h-[2.75rem] w-full rounded-xl border bg-white px-4 py-2 text-[1.0625rem]',
                    'border-slate-300 text-slate-900 placeholder:text-slate-400',
                    'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
                    error && 'border-red-600 dark:border-red-400',
                    className,
                )}
                {...props}
            />
            {hint && !error && (
                <p id={hintId} className="text-sm text-slate-600 dark:text-slate-400">
                    {hint}
                </p>
            )}
            {error && (
                <p
                    id={errorId}
                    role="alert"
                    className="text-sm font-semibold text-red-700 dark:text-red-300"
                >
                    {error}
                </p>
            )}
        </div>
    );
});
