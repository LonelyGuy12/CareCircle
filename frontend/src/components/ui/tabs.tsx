import { useState, type ReactNode } from 'react';
import type { KeyboardEvent } from 'react';
import { cn } from '../../lib/cn';

export interface TabItem {
    id: string;
    label: string;
    content: ReactNode;
}

export function Tabs({ items, defaultId }: { items: TabItem[]; defaultId?: string }) {
    const [active, setActive] = useState<string>(defaultId ?? items[0]?.id ?? '');

    const onKeyDown = (e: KeyboardEvent, index: number) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const next =
            e.key === 'ArrowRight'
                ? (index + 1) % items.length
                : (index - 1 + items.length) % items.length;
        const nextItem = items[next];
        if (nextItem) {
            setActive(nextItem.id);
            document.getElementById(`tab-${nextItem.id}`)?.focus();
        }
    };

    const current = items.find((t) => t.id === active) ?? items[0];

    return (
        <div>
            <div
                role="tablist"
                aria-label="Sections"
                className="flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800"
            >
                {items.map((item, i) => {
                    const selected = item.id === active;
                    return (
                        <button
                            key={item.id}
                            id={`tab-${item.id}`}
                            role="tab"
                            aria-selected={selected}
                            aria-controls={`panel-${item.id}`}
                            tabIndex={selected ? 0 : -1}
                            onClick={() => setActive(item.id)}
                            onKeyDown={(e) => onKeyDown(e, i)}
                            className={cn(
                                'min-h-[2.75rem] whitespace-nowrap px-4 py-2 text-[1.0625rem] font-semibold',
                                selected
                                    ? 'border-b-2 border-teal-700 text-teal-800 dark:border-teal-300 dark:text-teal-200'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
                            )}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </div>
            {current && (
                <div
                    key={current.id}
                    id={`panel-${current.id}`}
                    role="tabpanel"
                    aria-labelledby={`tab-${current.id}`}
                    className="pt-4"
                >
                    {current.content}
                </div>
            )}
        </div>
    );
}
