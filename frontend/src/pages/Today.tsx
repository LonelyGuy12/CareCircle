import { Link } from 'react-router-dom';
import data from '../data/mock.json';
import Card from '../components/Card';
import { formatTime, formatDate, statusStyle } from '../utils';
import type { Medication, MockData } from '../types/mock';

const typedData = data as MockData;

export default function Today() {
    const medById: Record<string, Medication> = Object.fromEntries(
        typedData.medications.map((m) => [m.id, m]),
    );
    const nextAppt = [...typedData.appointments].sort((a, b) =>
        a.dateTime.localeCompare(b.dateTime),
    )[0];
    const latestSummary = typedData.summaries[0];
    if (!nextAppt || !latestSummary) return null;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Today</h1>
            <Card title="Today's doses">
                <ul className="divide-y divide-slate-100">
                    {typedData.doseLogs.map((d) => {
                        const med = medById[d.medicationId];
                        if (!med) return null;
                        const s = statusStyle[d.status];
                        return (
                            <li key={d.id} className="flex items-center justify-between py-3">
                                <div>
                                    <p className="font-medium">
                                        {med.name}{' '}
                                        <span className="text-slate-500">{med.dosage}</span>
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {formatTime(d.scheduledAt)}
                                    </p>
                                </div>
                                <span
                                    className={`rounded-full px-3 py-1 text-sm font-medium ${s.className}`}
                                >
                                    {s.label}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </Card>
            <div className="grid gap-6 md:grid-cols-2">
                <Card title="Next appointment">
                    <p className="font-medium">{nextAppt.title}</p>
                    <p className="text-slate-600">
                        {formatDate(nextAppt.dateTime)}, {formatTime(nextAppt.dateTime)}
                    </p>
                    <p className="text-slate-600">
                        {nextAppt.doctor} · {nextAppt.location}
                    </p>
                </Card>
                <Card title="Latest AI summary">
                    <p className="font-medium">{latestSummary.headline}</p>
                    <p className="text-slate-600 mt-1">{latestSummary.text}</p>
                    <Link to="/summaries" className="inline-block mt-3 text-teal-700 font-medium">
                        All summaries →
                    </Link>
                </Card>
            </div>
        </div>
    );
}
