import { type FormEvent, useState } from 'react';

import { appointmentInputSchema, toFieldErrors } from '../../../shared/schemas';
import { Button, Card, CardContent, Dialog, EmptyState, Input, useToast } from '../components/ui';
import { useCareCircle } from '../state/care-circle';
import type { Appointment } from '../types/mock';
import { formatDate, formatTime } from '../utils';

interface ApptFormState {
    title: string;
    doctor: string;
    location: string;
    dateTime: string;
    notes: string;
}

const EMPTY: ApptFormState = { title: '', doctor: '', location: '', dateTime: '', notes: '' };

function toLocalInput(iso: string): string {
    return iso.length >= 16 ? iso.slice(0, 16) : iso;
}

function toForm(appt: Appointment | null): ApptFormState {
    if (!appt) return EMPTY;
    return {
        title: appt.title,
        doctor: appt.doctor,
        location: appt.location,
        dateTime: toLocalInput(appt.dateTime),
        notes: appt.notes ?? '',
    };
}

function validate(form: ApptFormState): Partial<Record<keyof ApptFormState, string>> {
    const result = appointmentInputSchema.safeParse(form);
    if (result.success) return {};
    return toFieldErrors(result.error.issues) as Partial<Record<keyof ApptFormState, string>>;
}

export default function Appointments() {
    const { appointments, addAppointment, updateAppointment } = useCareCircle();
    const { push } = useToast();
    const [editing, setEditing] = useState<Appointment | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState<ApptFormState>(EMPTY);
    const [errors, setErrors] = useState<Partial<Record<keyof ApptFormState, string>>>({});

    const sorted = [...appointments].sort((a, b) => a.dateTime.localeCompare(b.dateTime));

    const openAdd = () => {
        setEditing(null);
        setForm(EMPTY);
        setErrors({});
        setDialogOpen(true);
    };

    const openEdit = (appt: Appointment) => {
        setEditing(appt);
        setForm(toForm(appt));
        setErrors({});
        setDialogOpen(true);
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        const found = validate(form);
        setErrors(found);
        if (Object.keys(found).length > 0) return;
        if (editing) {
            updateAppointment({
                ...editing,
                title: form.title.trim(),
                doctor: form.doctor.trim(),
                location: form.location.trim(),
                dateTime: new Date(form.dateTime).toISOString(),
                notes: form.notes.trim(),
            });
            push(`${form.title.trim()} updated`, 'success');
        } else {
            addAppointment({
                id: `appt_${Date.now()}`,
                title: form.title.trim(),
                doctor: form.doctor.trim(),
                location: form.location.trim(),
                dateTime: new Date(form.dateTime).toISOString(),
                notes: form.notes.trim(),
            });
            push(`${form.title.trim()} added`, 'success');
        }
        setDialogOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold">Appointments</h1>
                <Button onClick={openAdd}>Add appointment</Button>
            </div>

            {sorted.length === 0 ? (
                <EmptyState
                    title="No appointments scheduled"
                    description="Add the next visit so it shows up on the Today page."
                    action={<Button onClick={openAdd}>Add appointment</Button>}
                />
            ) : (
                <Card>
                    <CardContent>
                        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                            {sorted.map((a) => (
                                <li
                                    key={a.id}
                                    className="flex flex-wrap items-center justify-between gap-3 py-4"
                                >
                                    <div className="min-w-0">
                                        <p className="font-semibold">{a.title}</p>
                                        <p className="text-slate-600 dark:text-slate-400">
                                            {formatDate(a.dateTime)}, {formatTime(a.dateTime)} ·{' '}
                                            {a.doctor} · {a.location}
                                        </p>
                                        {a.notes && (
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {a.notes}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEdit(a)}
                                        aria-label={`Edit ${a.title}`}
                                    >
                                        Edit
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                title={editing ? `Edit ${editing.title}` : 'Add appointment'}
                description="Changes stay in this demo session."
            >
                <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
                    <Input
                        label="Title"
                        value={form.title}
                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                        error={errors.title}
                        autoComplete="off"
                    />
                    <Input
                        label="Doctor or clinic"
                        value={form.doctor}
                        onChange={(e) => setForm((f) => ({ ...f, doctor: e.target.value }))}
                        error={errors.doctor}
                        autoComplete="off"
                    />
                    <Input
                        label="Location"
                        value={form.location}
                        onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                        error={errors.location}
                        autoComplete="off"
                    />
                    <Input
                        label="Date and time"
                        type="datetime-local"
                        value={form.dateTime}
                        onChange={(e) => setForm((f) => ({ ...f, dateTime: e.target.value }))}
                        error={errors.dateTime}
                    />
                    <Input
                        label="Notes (optional)"
                        value={form.notes}
                        onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                        autoComplete="off"
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {editing ? 'Save changes' : 'Add appointment'}
                        </Button>
                    </div>
                </form>
            </Dialog>
        </div>
    );
}
