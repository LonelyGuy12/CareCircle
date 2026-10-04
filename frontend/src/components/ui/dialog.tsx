import { type ReactNode, useEffect, useId, useRef } from 'react';

import { cn } from '../../lib/cn';
import { Button } from './button';

interface DialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    labelledBySuffix?: string;
}

export function Dialog({ open, onClose, title, description, children }: DialogProps) {
    const titleId = useId();
    const descId = useId();
    const panelRef = useRef<HTMLDivElement>(null);
    const previousFocus = useRef<Element | null>(null);

    useEffect(() => {
        if (!open) return;
        previousFocus.current = document.activeElement;
        panelRef.current?.focus();

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('keydown', onKey);
            if (previousFocus.current instanceof HTMLElement) previousFocus.current.focus();
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
            role="presentation"
        >
            <button
                type="button"
                aria-label="Close dialog"
                onClick={onClose}
                className="absolute inset-0 cursor-default bg-slate-950/50"
            />
            <div
                ref={panelRef}
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={description ? descId : undefined}
                className={cn(
                    'relative w-full max-w-lg rounded-2xl border bg-white p-6 shadow-xl',
                    'border-slate-200 dark:border-slate-700 dark:bg-slate-900',
                )}
            >
                <h2 id={titleId} className="text-xl font-bold">
                    {title}
                </h2>
                {description && (
                    <p id={descId} className="mt-1 text-base text-slate-600 dark:text-slate-400">
                        {description}
                    </p>
                )}
                <div className="mt-4">{children}</div>
                <div className="mt-6 flex justify-end">
                    <Button variant="secondary" size="sm" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}
