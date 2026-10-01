import { useCareCircle } from '../state/care-circle';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '../components/ui';

export default function Profile() {
    const { careRecipient, caregiver } = useCareCircle();
    const p = careRecipient;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <span
                    aria-hidden="true"
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-700 text-2xl font-bold text-white dark:bg-teal-400 dark:text-teal-950"
                >
                    {p.name.charAt(0)}
                </span>
                <div>
                    <h1 className="text-2xl font-bold">{p.name}</h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Age {p.age} · Cared for by {caregiver.name}
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <dl className="space-y-3">
                        <div>
                            <dt className="text-sm font-semibold text-slate-500">Age</dt>
                            <dd>{p.age}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-semibold text-slate-500">Conditions</dt>
                            <dd className="flex flex-wrap gap-2">
                                {p.conditions.map((c) => (
                                    <Badge key={c} tone="brand">
                                        {c}
                                    </Badge>
                                ))}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-semibold text-slate-500">Care notes</dt>
                            <dd className="text-slate-600 dark:text-slate-400">{p.notes}</dd>
                        </div>
                    </dl>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Emergency contacts</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {p.emergencyContacts.map((c) => (
                            <li
                                key={c.phone}
                                className="flex flex-wrap items-center justify-between gap-2"
                            >
                                <div>
                                    <p className="font-semibold">
                                        {c.name}{' '}
                                        <span className="font-normal text-slate-500">
                                            ({c.relation})
                                        </span>
                                    </p>
                                    <p className="text-slate-600 dark:text-slate-400">{c.phone}</p>
                                </div>
                                <a
                                    href={`tel:${c.phone.replace(/\s/g, '')}`}
                                    className="inline-flex min-h-[2.75rem] items-center rounded-xl border border-slate-300 px-4 py-2 font-semibold text-teal-800 dark:border-slate-700 dark:text-teal-200"
                                >
                                    Call
                                </a>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
