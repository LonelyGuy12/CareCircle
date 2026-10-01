import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

export interface ToastItem {
    id: number;
    message: string;
    tone: 'success' | 'info' | 'error';
}

interface ToastContextValue {
    toasts: ToastItem[];
    push: (message: string, tone?: ToastItem['tone']) => void;
    dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const dismiss = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const push = useCallback((message: string, tone: ToastItem['tone'] = 'info') => {
        const id = nextId++;
        setToasts((prev) => [...prev, { id, message, tone }]);
        window.setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const value = useMemo(() => ({ toasts, push, dismiss }), [toasts, push, dismiss]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div
                aria-live="polite"
                aria-atomic="false"
                className="pointer-events-none fixed bottom-4 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 flex-col gap-2 px-4"
            >
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        role="status"
                        className={cn(
                            'pointer-events-auto flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-[1.0625rem] font-medium shadow-lg',
                            t.tone === 'success' &&
                                'border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-100',
                            t.tone === 'info' &&
                                'border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
                            t.tone === 'error' &&
                                'border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100',
                        )}
                    >
                        <span>{t.message}</span>
                        <button
                            type="button"
                            onClick={() => dismiss(t.id)}
                            aria-label="Dismiss notification"
                            className="min-h-[2.75rem] min-w-[2.75rem] rounded-lg px-2 font-bold"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside ToastProvider');
    return ctx;
}
