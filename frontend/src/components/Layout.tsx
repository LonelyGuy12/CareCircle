import type { SVGProps } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { cn } from '../lib/cn';
import { useCareCircle } from '../state/care-circle';
import { ThemeToggle } from './ui/theme-toggle';

function TodayIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 20 20"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
            {...props}
        >
            <rect x="3" y="4.5" width="14" height="12" rx="2" />
            <path d="M3 8.5h14M7 3v3M13 3v3" strokeLinecap="round" />
        </svg>
    );
}

function PillIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 20 20"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
            {...props}
        >
            <rect x="3" y="6.5" width="14" height="7" rx="3.5" transform="rotate(-30 10 10)" />
            <path d="M7.5 12.5 12.5 7.5" strokeLinecap="round" />
        </svg>
    );
}

function CalendarIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 20 20"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
            {...props}
        >
            <rect x="3" y="4.5" width="14" height="12.5" rx="2" />
            <path d="M7 3v3.5M13 3v3.5M6.5 10.5h3M6.5 13.5h5" strokeLinecap="round" />
        </svg>
    );
}

function DocIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 20 20"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
            {...props}
        >
            <path d="M5 3h6l4 4v10H5V3Z" strokeLinejoin="round" />
            <path d="M11 3v4h4M8 11.5h4M8 14h4" strokeLinecap="round" />
        </svg>
    );
}

function BellIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 20 20"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
            {...props}
        >
            <path
                d="M10 3a5 5 0 0 1 5 5v3l1.5 2.5h-13L5 11V8a5 5 0 0 1 5-5Z"
                strokeLinejoin="round"
            />
            <path d="M8.5 16a1.7 1.7 0 0 0 3 0" strokeLinecap="round" />
        </svg>
    );
}

function UserIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 20 20"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
            {...props}
        >
            <circle cx="10" cy="7" r="3.2" />
            <path d="M4 17c1-3 3.2-4.5 6-4.5s5 1.5 6 4.5" strokeLinecap="round" />
        </svg>
    );
}

const links = [
    { to: '/', label: 'Today', Icon: TodayIcon },
    { to: '/medications', label: 'Medications', Icon: PillIcon },
    { to: '/appointments', label: 'Appointments', Icon: CalendarIcon },
    { to: '/summaries', label: 'Summaries', Icon: DocIcon },
    { to: '/alerts', label: 'Alerts', Icon: BellIcon },
    { to: '/profile', label: 'Profile', Icon: UserIcon },
] as const;

function UnreadDot({ count, label }: { count: number; label: string }) {
    if (count === 0) return null;
    return (
        <span
            aria-label={`${count} ${label}`}
            className="ml-auto inline-flex min-h-[1.5rem] min-w-[1.5rem] items-center justify-center rounded-full bg-red-700 px-1.5 text-xs font-bold text-white dark:bg-red-400 dark:text-red-950"
        >
            {count}
        </span>
    );
}

export default function Layout() {
    const { careRecipient, caregiver, unreadAlerts } = useCareCircle();

    return (
        <div className="min-h-screen md:flex">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold"
            >
                Skip to main content
            </a>

            {/* Desktop sidebar */}
            <aside
                aria-label="Primary"
                className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex md:min-h-screen dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="p-5">
                    <p className="text-xl font-bold text-teal-800 dark:text-teal-200">CareCircle</p>
                    <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                        Caring for {careRecipient.name}
                    </p>
                </div>
                <nav aria-label="Care sections" className="flex flex-col gap-1 px-3">
                    {links.map(({ to, label, Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className={({ isActive }) =>
                                cn(
                                    'flex min-h-[2.75rem] items-center gap-3 rounded-xl px-3 py-2 text-[1.0625rem] font-medium',
                                    isActive
                                        ? 'bg-teal-50 text-teal-900 dark:bg-teal-950 dark:text-teal-100'
                                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                                )
                            }
                        >
                            <Icon />
                            {label}
                            {to === '/alerts' && (
                                <UnreadDot count={unreadAlerts} label="unread alerts" />
                            )}
                        </NavLink>
                    ))}
                </nav>
                <div className="mt-auto p-5 text-sm text-slate-500 dark:text-slate-400">
                    Signed in as {caregiver.name}
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                {/* Top bar */}
                <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
                    <div className="mx-auto flex min-h-[3.5rem] w-full max-w-5xl items-center justify-between gap-3 px-5 md:px-8">
                        <div className="flex items-center gap-2 md:hidden">
                            <p className="text-lg font-bold text-teal-800 dark:text-teal-200">
                                CareCircle
                            </p>
                        </div>
                        <p className="hidden text-sm text-slate-600 md:block dark:text-slate-400">
                            Caring for{' '}
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                                {careRecipient.name}
                            </span>
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="hidden text-sm text-slate-500 sm:inline dark:text-slate-400">
                                {caregiver.name}
                            </span>
                            <ThemeToggle />
                        </div>
                    </div>
                </header>

                <main
                    id="main-content"
                    tabIndex={-1}
                    className="mx-auto w-full max-w-5xl flex-1 p-5 pb-24 md:p-8 md:pb-8"
                >
                    <Outlet />
                </main>
            </div>

            {/* Mobile bottom nav */}
            <nav
                aria-label="Care sections"
                className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-900/95"
            >
                <ul className="grid grid-cols-6">
                    {links.map(({ to, label, Icon }) => (
                        <li key={to}>
                            <NavLink
                                to={to}
                                end={to === '/'}
                                aria-label={
                                    to === '/alerts' && unreadAlerts > 0
                                        ? `${label}, ${unreadAlerts} unread`
                                        : label
                                }
                                className={({ isActive }) =>
                                    cn(
                                        'relative flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 px-1 py-1 text-xs font-semibold',
                                        isActive
                                            ? 'text-teal-800 dark:text-teal-200'
                                            : 'text-slate-500 dark:text-slate-400',
                                    )
                                }
                            >
                                <Icon />
                                <span className="leading-tight">{label}</span>
                                {to === '/alerts' && unreadAlerts > 0 && (
                                    <span
                                        aria-hidden="true"
                                        className="absolute right-2 top-1 inline-flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded-full bg-red-700 px-1 text-[0.6875rem] font-bold text-white dark:bg-red-400 dark:text-red-950"
                                    >
                                        {unreadAlerts}
                                    </span>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
}
