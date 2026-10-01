import { Button } from './button';

interface ErrorBannerProps {
    message: string;
    onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
    return (
        <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100"
        >
            <p className="text-[1.0625rem] font-medium">{message}</p>
            {onRetry && (
                <Button variant="outline" size="sm" onClick={onRetry}>
                    Retry
                </Button>
            )}
        </div>
    );
}
