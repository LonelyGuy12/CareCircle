import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { WeeklyAdherence } from '../types/mock';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function AdherenceChart({ data }: { data: WeeklyAdherence[] }) {
    const average = Math.round(
        data.reduce((sum, d) => sum + d.percent, 0) / Math.max(data.length, 1),
    );

    return (
        <Card>
            <CardHeader>
                <div>
                    <CardTitle>Weekly adherence</CardTitle>
                    <CardDescription>
                        Share of scheduled doses confirmed each day · {average}% average
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <div
                    role="img"
                    aria-label={`Bar chart of daily adherence, averaging ${average} percent for the week`}
                >
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="var(--border)"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="day"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 14 }}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 14 }}
                                tickFormatter={(v: number) => `${v}%`}
                            />
                            <Tooltip formatter={(value) => [`${String(value)}%`, 'Taken']} />
                            <Bar
                                dataKey="percent"
                                name="Taken"
                                fill="#0f766e"
                                radius={[8, 8, 4, 4]}
                                maxBarSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <details className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    <summary className="min-h-[2.75rem] cursor-pointer font-semibold">
                        View data as a list
                    </summary>
                    <ul className="mt-1 space-y-1">
                        {data.map((d) => (
                            <li key={d.day}>
                                {d.day}: {d.percent}% of doses taken
                            </li>
                        ))}
                    </ul>
                </details>
            </CardContent>
        </Card>
    );
}
