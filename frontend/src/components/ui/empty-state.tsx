import type { ReactNode } from 'react';

import { Card, CardDescription, CardTitle } from './card';

export function EmptyState({
    title,
    description,
    action,
}: {
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <Card>
            <div className="flex flex-col items-center gap-2 py-8 text-center">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
                {action && <div className="mt-3">{action}</div>}
            </div>
        </Card>
    );
}
