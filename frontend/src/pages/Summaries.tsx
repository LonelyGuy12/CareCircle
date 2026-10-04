import { Link } from 'react-router-dom';

import {
    Badge,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    EmptyState,
} from '../components/ui';
import { useCareCircle } from '../state/care-circle';

export default function Summaries() {
    const { summaries } = useCareCircle();

    if (summaries.length === 0) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold">Daily Summaries</h1>
                <EmptyState
                    title="No summaries yet"
                    description="Daily AI summaries will appear here once generated."
                    action={
                        <Link
                            to="/"
                            className="font-semibold text-teal-800 underline dark:text-teal-200"
                        >
                            Back to Today
                        </Link>
                    }
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Daily Summaries</h1>
            {summaries.map((s) => (
                <Card key={s.id}>
                    <CardHeader>
                        <div>
                            <CardDescription>{s.date}</CardDescription>
                            <CardTitle className="text-lg">{s.headline}</CardTitle>
                        </div>
                        {s.flags.length > 0 ? (
                            <Badge tone="danger">
                                <span aria-hidden="true">⚠</span> Needs attention
                            </Badge>
                        ) : (
                            <Badge tone="success">
                                <span aria-hidden="true">✓</span> All good
                            </Badge>
                        )}
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-600 dark:text-slate-400">{s.text}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
