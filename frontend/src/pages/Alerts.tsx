import { Badge, Button, Card, CardContent, EmptyState, useToast } from '../components/ui';
import { cn } from '../lib/cn';
import { useCareCircle } from '../state/care-circle';
import { formatTime } from '../utils';

export default function Alerts() {
    const { alerts, markAlertRead, markAllAlertsRead } = useCareCircle();
    const { push } = useToast();
    const unread = alerts.filter((a) => !a.read);

    const onMarkRead = (id: string) => {
        markAlertRead(id);
        push('Alert marked as read', 'success');
    };

    const onMarkAll = () => {
        markAllAlertsRead();
        push('All alerts marked as read', 'success');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold">
                    Alerts{' '}
                    {unread.length > 0 && (
                        <span className="text-lg font-semibold text-slate-500">
                            ({unread.length} unread)
                        </span>
                    )}
                </h1>
                {unread.length > 0 && (
                    <Button variant="secondary" size="sm" onClick={onMarkAll}>
                        Mark all read
                    </Button>
                )}
            </div>

            {alerts.length === 0 ? (
                <EmptyState title="No alerts" description="You are all caught up." />
            ) : (
                <Card>
                    <CardContent>
                        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                            {alerts.map((a) => (
                                <li
                                    key={a.id}
                                    className="flex flex-wrap items-center justify-between gap-3 py-4"
                                >
                                    <div className="flex min-w-0 items-start gap-3">
                                        <span
                                            aria-hidden="true"
                                            className={cn(
                                                'mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full',
                                                a.read
                                                    ? 'bg-slate-300 dark:bg-slate-700'
                                                    : 'bg-red-600 dark:bg-red-400',
                                            )}
                                        />
                                        <div className="min-w-0">
                                            <p
                                                className={
                                                    a.read
                                                        ? 'text-slate-600 dark:text-slate-400'
                                                        : 'font-semibold'
                                                }
                                            >
                                                <span className="sr-only">
                                                    {a.read ? 'Read: ' : 'Unread: '}
                                                </span>
                                                {a.message}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {formatTime(a.createdAt)}
                                                {a.type === 'missed_dose'
                                                    ? ' · Missed dose'
                                                    : ' · Delivery'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {a.read ? (
                                            <Badge tone="neutral">Read</Badge>
                                        ) : (
                                            <>
                                                <Badge tone="danger">
                                                    <span aria-hidden="true">⚠</span> New
                                                </Badge>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => onMarkRead(a.id)}
                                                >
                                                    Mark read
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
