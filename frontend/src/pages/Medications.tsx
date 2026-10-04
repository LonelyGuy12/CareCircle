import { type FormEvent, useState } from 'react';

import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Dialog,
    EmptyState,
    Input,
    useToast,
} from '../components/ui';
import { useCareCircle } from '../state/care-circle';
import type { Medication } from '../types/mock';

interface MedFormState {
    name: string;
    dosage: string;
    times: string;
    instructions: string;
}

const EMPTY: MedFormState = { name: '', dosage: '', times: '', instructions: '' };

function toForm(med: Medication | null): MedFormState {
    if (!med) return EMPTY;
    return {
        name: med.name,
        dosage: med.dosage,
        times: med.times.join(', '),
        instructions: med.instructions,
    };
}

function validate(form: MedFormState): Partial<Record<keyof MedFormState, string>> {
    const errors: Partial<Record<keyof MedFormState, string>> = {};
    if (form.name.trim().length === 0) errors.name = 'Medication name is required.';
    if (form.dosage.trim().length === 0) errors.dosage = 'Dosage is required (e.g. 5 mg).';
    const times = form.times
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    if (times.length === 0) {
        errors.times = 'Add at least one daily time (e.g. 09:00, 20:00).';
    } else if (!times.every((t) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t))) {
        errors.times = 'Times must look like 09:00 (24-hour, comma-separated).';
    }
    return errors;
}

export default function Medications() {
    const { medications, addMedication, updateMedication } = useCareCircle();
    const { push } = useToast();
    const [editing, setEditing] = useState<Medication | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState<MedFormState>(EMPTY);
    const [errors, setErrors] = useState<Partial<Record<keyof MedFormState, string>>>({});

    const openAdd = () => {
        setEditing(null);
        setForm(EMPTY);
        setErrors({});
        setDialogOpen(true);
    };

    const openEdit = (med: Medication) => {
        setEditing(med);
        setForm(toForm(med));
        setErrors({});
        setDialogOpen(true);
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        const found = validate(form);
        setErrors(found);
        if (Object.keys(found).length > 0) return;
        const times = form.times
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t.length > 0);
        if (editing) {
            updateMedication({
                ...editing,
                name: form.name.trim(),
                dosage: form.dosage.trim(),
                times,
                instructions: form.instructions.trim(),
            });
            push(`${form.name.trim()} updated`, 'success');
        } else {
            addMedication({
                id: `med_${Date.now()}`,
                name: form.name.trim(),
                dosage: form.dosage.trim(),
                times,
                instructions: form.instructions.trim(),
            });
            push(`${form.name.trim()} added`, 'success');
        }
        setDialogOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold">Medications</h1>
                <Button onClick={openAdd}>Add medication</Button>
            </div>

            {medications.length === 0 ? (
                <EmptyState
                    title="No medications yet"
                    description="Add the first medication to start tracking doses."
                    action={<Button onClick={openAdd}>Add medication</Button>}
                />
            ) : (
                <Card>
                    <CardContent>
                        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                            {medications.map((m) => (
                                <li
                                    key={m.id}
                                    className="flex flex-wrap items-center justify-between gap-3 py-4"
                                >
                                    <div className="min-w-0">
                                        <p className="font-semibold">
                                            {m.name}{' '}
                                            <span className="font-normal text-slate-500">
                                                {m.dosage}
                                            </span>
                                        </p>
                                        <p className="text-slate-600 dark:text-slate-400">
                                            {m.times.join(', ')}
                                            {m.instructions ? ` · ${m.instructions}` : ''}
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEdit(m)}
                                        aria-label={`Edit ${m.name}`}
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
                title={editing ? `Edit ${editing.name}` : 'Add medication'}
                description="Changes stay in this demo session."
            >
                <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
                    <Input
                        label="Name"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        error={errors.name}
                        autoComplete="off"
                    />
                    <Input
                        label="Dosage"
                        hint="e.g. 5 mg"
                        value={form.dosage}
                        onChange={(e) => setForm((f) => ({ ...f, dosage: e.target.value }))}
                        error={errors.dosage}
                        autoComplete="off"
                    />
                    <Input
                        label="Daily times"
                        hint="24-hour times, comma-separated"
                        placeholder="09:00, 20:00"
                        value={form.times}
                        onChange={(e) => setForm((f) => ({ ...f, times: e.target.value }))}
                        error={errors.times}
                        autoComplete="off"
                    />
                    <Input
                        label="Instructions (optional)"
                        value={form.instructions}
                        onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
                        autoComplete="off"
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">{editing ? 'Save changes' : 'Add medication'}</Button>
                    </div>
                </form>
            </Dialog>

            <Card>
                <CardHeader>
                    <CardTitle>Good to know</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-600 dark:text-slate-400">
                        Doses for today appear on the Today timeline. Marking a dose taken updates
                        the timeline and the weekly chart immediately.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
