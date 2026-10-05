import { Link } from 'react-router-dom';

import { AdherenceChart } from '../components/AdherenceChart';
import { ChatBox } from '../components/ChatBox';
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    StatusBadge,
    useToast,
} from '../components/ui';
import { useCareCircle } from '../state/care-circle';
import type { Medication } from '../types/mock';
import { formatDate, formatTime } from '../utils';

function statusFor(doseStatus: 'taken' | 'missed' | 'pending'): 'taken' | 'due' | 'missed' {
    if (doseStatus === 'taken') return 'taken';
    if (doseStatus === 'missed') return 'missed';
    return 'due';
}

export default function Today() {
    const ctx = useCareCircle();
    const { push } = useToast();
    const { doseLogs, medications, appointments, summaries, alerts, weeklyAdherence, lastUpdated } =
        ctx;

    const medById: Record<string, Medication> = Object.fromEntries(
        medications.map((m) => [m.id, m]),
    );
    const sortedDoses = [...doseLogs].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
    const takenCount = doseLogs.filter((d) => d.status === 'taken').length;
    const nextAppt = [...appointments].sort((a, b) => a.dateTime.localeCompare(b.dateTime))[0];
    const latestSummary = summaries[0];
    const unread = alerts.filter((a) => !a.read);

    const onMarkTaken = (doseId: string, medName: string) => {
        ctx.markTaken(doseId);
        push(`${medName} marked as taken`, 'success');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
                <h1 className="text-2xl font-bold">Today</h1>
                <p aria-live="polite" className="text-sm text-slate-500 dark:text-slate-400">
                    Updated{' '}
                    {new Date(lastUpdated).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                        second: '2-digit',
                    })}
                </p>
            </div>

            {/* At-a-glance cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardDescription>Today&apos;s doses</CardDescription>
                        <CardTitle>
                            {takenCount} of {doseLogs.length} taken
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Link
                            to="/"
                            aria-label="View dose timeline"
                            className="font-semibold text-teal-800 underline dark:text-teal-200"
                        >
                            View timeline
                        </Link>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Next appointment</CardDescription>
                        <CardTitle>{nextAppt ? nextAppt.title : 'None scheduled'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {nextAppt && (
                            <p className="text-slate-600 dark:text-slate-400">
                                {formatDate(nextAppt.dateTime)}, {formatTime(nextAppt.dateTime)}
                            </p>
                        )}
                        <Link
                            to="/appointments"
                            className="mt-1 inline-block font-semibold text-teal-800 underline dark:text-teal-200"
                        >
                            All appointments
                        </Link>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardDescription>Unread alerts</CardDescription>
                        <CardTitle>{unread.length} unread</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Link
                            to="/alerts"
                            className="font-semibold text-teal-800 underline dark:text-teal-200"
                        >
                            Review alerts
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Dose timeline */}
            <Card>
                <CardHeader>
                    <div>
                        <CardTitle>Today&apos;s dose timeline</CardTitle>
                        <CardDescription>Confirm each dose as it is taken</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <ol className="relative space-y-1 border-l-2 border-slate-200 pl-5 dark:border-slate-700">
                        {sortedDoses.map((d) => {
                            const med = medById[d.medicationId];
                            if (!med) return null;
                            const due = d.status === 'pending';
                            return (
                                <li
                                    key={d.id}
                                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                                >
                                    <div className="min-w-0">
                                        <p className="font-semibold">
                                            {med.name}{' '}
                                            <span className="font-normal text-slate-500">
                                                {med.dosage}
                                            </span>
                                        </p>
                                        <p className="text-slate-600 dark:text-slate-400">
                                            {formatTime(d.scheduledAt)}
                                            {d.confirmedAt && d.status === 'taken' && (
                                                <> · confirmed {formatTime(d.confirmedAt)}</>
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={statusFor(d.status)} />
                                        {due && (
                                            <Button
                                                size="sm"
                                                onClick={() => onMarkTaken(d.id, med.name)}
                                            >
                                                Mark taken
                                            </Button>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </CardContent>
            </Card>

            <AdherenceChart data={weeklyAdherence} />

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Latest AI summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {latestSummary && (
                            <>
                                <p className="font-semibold">{latestSummary.headline}</p>
                                <p className="mt-1 text-slate-600 dark:text-slate-400">
                                    {latestSummary.text}
                                </p>
                            </>
                        )}
                        <Link
                            to="/summaries"
                            className="mt-3 inline-block min-h-[2.75rem] font-semibold text-teal-800 underline dark:text-teal-200"
                        >
                            All summaries
                        </Link>
                    </CardContent>
                </Card>
                <ChatBox />
            </div>
        </div>
    );
}
