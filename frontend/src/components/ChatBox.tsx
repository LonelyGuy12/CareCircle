import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useCareCircle } from '../state/care-circle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { formatDate, formatTime } from '../utils';
import { cn } from '../lib/cn';

interface ChatMessage {
    id: number;
    from: 'caregiver' | 'assistant';
    text: string;
}

const SUGGESTED = [
    'Did Margaret take her morning doses?',
    'When is the next appointment?',
    'What was missed this week?',
] as const;

let nextMessageId = 1;

function answerFor(question: string, ctx: ReturnType<typeof useCareCircle>): string {
    const q = question.toLowerCase();
    const medById = Object.fromEntries(ctx.medications.map((m) => [m.id, m]));
    if (q.includes('morning')) {
        const morning = ctx.doseLogs.filter((d) => {
            const hour = new Date(d.scheduledAt).getHours();
            return hour < 12;
        });
        const taken = morning.filter((d) => d.status === 'taken').length;
        return `This morning ${taken} of ${morning.length} doses were confirmed: ${morning
            .map((d) => `${medById[d.medicationId]?.name ?? 'Dose'} (${d.status})`)
            .join(', ')}.`;
    }
    if (q.includes('appointment')) {
        const next = [...ctx.appointments].sort((a, b) => a.dateTime.localeCompare(b.dateTime))[0];
        if (!next) return 'There are no upcoming appointments.';
        return `Next up is ${next.title} with ${next.doctor} at ${next.location} on ${formatDate(next.dateTime)} at ${formatTime(next.dateTime)}.`;
    }
    if (q.includes('miss')) {
        const missed = ctx.doseLogs.filter((d) => d.status === 'missed');
        if (missed.length === 0) return 'Nothing missed — all scheduled doses were confirmed.';
        return `${missed.length} dose(s) missed: ${missed
            .map(
                (d) => `${medById[d.medicationId]?.name ?? 'Dose'} at ${formatTime(d.scheduledAt)}`,
            )
            .join(', ')}.`;
    }
    const taken = ctx.doseLogs.filter((d) => d.status === 'taken').length;
    return `${ctx.careRecipient.name} has ${taken} of ${ctx.doseLogs.length} doses confirmed today, and ${ctx.unreadAlerts} unread alert(s). Ask me about morning doses, appointments, or missed doses.`;
}

export function ChatBox() {
    const ctx = useCareCircle();
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: nextMessageId++,
            from: 'assistant',
            text: `Hi ${ctx.caregiver.name.split(' ')[0] ?? 'there'}! Ask me about ${ctx.careRecipient.name.split(' ')[0]}'s doses, appointments, or missed doses.`,
        },
    ]);
    const [draft, setDraft] = useState('');
    const [typing, setTyping] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [messages, typing]);

    const send = (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || typing) return;
        setMessages((prev) => [...prev, { id: nextMessageId++, from: 'caregiver', text: trimmed }]);
        setDraft('');
        setTyping(true);
        const reply = answerFor(trimmed, ctx);
        window.setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                { id: nextMessageId++, from: 'assistant', text: reply },
            ]);
            setTyping(false);
        }, 800);
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        send(draft);
    };

    return (
        <Card>
            <CardHeader>
                <div>
                    <CardTitle>Ask about care</CardTitle>
                    <CardDescription>
                        Answers from today&apos;s mock data · demo only
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <div
                    aria-live="polite"
                    aria-label="Care questions and answers"
                    className="flex max-h-80 flex-col gap-2 overflow-y-auto"
                >
                    {messages.map((m) => (
                        <div
                            key={m.id}
                            className={cn(
                                'max-w-[85%] rounded-2xl px-4 py-2 text-[1.0625rem]',
                                m.from === 'caregiver'
                                    ? 'self-end bg-teal-700 text-white dark:bg-teal-400 dark:text-teal-950'
                                    : 'self-start bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100',
                            )}
                        >
                            {m.text}
                        </div>
                    ))}
                    {typing && (
                        <div
                            className="self-start rounded-2xl bg-slate-100 px-4 py-2 dark:bg-slate-800"
                            aria-label="Assistant is typing"
                        >
                            <span className="animate-pulse">…</span>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2" aria-label="Suggested questions">
                    {SUGGESTED.map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => send(s)}
                            className="min-h-[2.75rem] rounded-full border border-teal-700 px-3 py-1.5 text-sm font-semibold text-teal-800 dark:border-teal-300 dark:text-teal-200"
                        >
                            {s}
                        </button>
                    ))}
                </div>
                <form onSubmit={onSubmit} className="mt-3 flex gap-2">
                    <label htmlFor="chat-input" className="sr-only">
                        Type your care question
                    </label>
                    <input
                        id="chat-input"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Type a question…"
                        autoComplete="off"
                        className="min-h-[2.75rem] flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-[1.0625rem] dark:border-slate-700 dark:bg-slate-900"
                    />
                    <Button type="submit" disabled={draft.trim().length === 0 || typing}>
                        Send
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
