/**
 * MetricsSummaryCard - Displays key validation metrics in a card format
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricsSummaryCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend: 'up' | 'down' | 'neutral';
    subtitle?: string;
    className?: string;
}

export function MetricsSummaryCard({
    title,
    value,
    icon,
    trend,
    subtitle,
    className = ''
}: MetricsSummaryCardProps) {
    const getTrendIcon = () => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="h-4 w-4 text-green-500" />;
            case 'down':
                return <TrendingDown className="h-4 w-4 text-red-500" />;
            default:
                return <Minus className="h-4 w-4 text-gray-500" />;
        }
    };

    const getTrendColor = () => {
        switch (trend) {
            case 'up':
                return 'text-green-500';
            case 'down':
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };

    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className="flex items-center gap-2">
                    {icon}
                    {getTrendIcon()}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {subtitle && (
                    <p className={`text-xs ${getTrendColor()}`}>
                        {subtitle}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}