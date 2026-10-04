import type { ReactNode } from 'react';

import { cn } from '../lib/cn';
import { Card as UICard, CardContent, CardHeader, CardTitle } from './ui/card';

interface CardProps {
    title?: string;
    children: ReactNode;
    className?: string;
}

/**
 * Legacy Card API kept for existing pages.
 * Now renders on design-system tokens (light/dark) with identical layout.
 */
export default function Card({ title, children, className }: CardProps) {
    return (
        <UICard className={cn('p-5', className)}>
            {title && (
                <CardHeader className="mb-3">
                    <CardTitle className="text-lg">{title}</CardTitle>
                </CardHeader>
            )}
            <CardContent className="p-0">{children}</CardContent>
        </UICard>
    );
}
