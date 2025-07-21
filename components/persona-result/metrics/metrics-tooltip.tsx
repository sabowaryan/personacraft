'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from '../ui/animated-card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, XCircle, Info, HelpCircle, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';

interface TrendData {
    value: number;
    direction: 'up' | 'down' | 'stable';
    timeframe?: string;
}

interface MetricsTooltipProps {
    title: string;
    description: string;
    score: number;
    factors: string[];
    recommendations?: string[];
    trend?: TrendData;
    benchmark?: number;
    maxWidth?: number;
    className?: string;
}

export function MetricsTooltip({
    title,
    description,
    score,
    factors,
    recommendations = [],
    trend,
    benchmark,
    maxWidth = 320,
    className,
}: MetricsTooltipProps) {
    const getScoreIcon = () => {
        if (score >= 90) return <CheckCircle className="h-4 w-4 text-green-500" />;
        if (score >= 70) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
        return <XCircle className="h-4 w-4 text-red-500" />;
    };

    const getScoreColor = () => {
        if (score >= 90) return 'text-green-600 dark:text-green-400';
        if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getScoreLabel = () => {
        if (score >= 90) return 'Excellent';
        if (score >= 70) return 'Bon';
        return 'À améliorer';
    };

    const getProgressColor = () => {
        if (score >= 90) return 'bg-green-500';
        if (score >= 70) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
        switch (direction) {
            case 'up':
                return <TrendingUp className="h-3 w-3 text-green-500" />;
            case 'down':
                return <TrendingDown className="h-3 w-3 text-red-500" />;
            default:
                return <Minus className="h-3 w-3 text-gray-500" />;
        }
    };

    const getTrendColor = (direction: 'up' | 'down' | 'stable') => {
        switch (direction) {
            case 'up':
                return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
            case 'down':
                return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
            default:
                return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
        }
    };

    return (
        <AnimatedCard
            variant="glass"
            size="sm"
            animation="none"
            className={cn(
                'shadow-xl border-white/20 dark:border-gray-700/50 backdrop-blur-md',
                className
            )}
            style={{ maxWidth: `${maxWidth}px` }}
        >
            <AnimatedCardHeader className="pb-3">
                <div className="flex items-start gap-2">
                    {getScoreIcon()}
                    <div className="flex-1 min-w-0">
                        <AnimatedCardTitle className="text-sm font-semibold leading-tight">
                            {title}
                        </AnimatedCardTitle>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                            {description}
                        </p>
                    </div>
                </div>
            </AnimatedCardHeader>

            <AnimatedCardContent className="space-y-4">
                {/* Score Display */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className={cn('text-lg font-bold tabular-nums', getScoreColor())}>
                            {score}%
                        </span>
                        <Badge variant="secondary" className={cn('text-xs', getScoreColor())}>
                            {getScoreLabel()}
                        </Badge>
                    </div>

                    <div className="flex-1 ml-3">
                        <Progress
                            value={score}
                            className="h-1.5"
                            style={{
                                '--progress-background': getProgressColor(),
                            } as React.CSSProperties}
                        />
                    </div>
                </div>

                {/* Factors */}
                <div>
                    <div className="flex items-center gap-1 mb-2">
                        <Info className="h-3 w-3 text-gray-500" />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            Facteurs évalués
                        </span>
                    </div>

                    <div className="space-y-1">
                        {factors.map((factor, index) => (
                            <div key={index} className="flex items-start gap-2 text-xs">
                                <div className="w-1 h-1 rounded-full bg-persona-primary mt-1.5 flex-shrink-0" />
                                <span className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {factor}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trend Analysis */}
                {trend && (
                    <div>
                        <div className="flex items-center gap-1 mb-2">
                            {getTrendIcon(trend.direction)}
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                Tendance {trend.timeframe && `(${trend.timeframe})`}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <Badge variant="secondary" className={cn('text-xs', getTrendColor(trend.direction))}>
                                {getTrendIcon(trend.direction)}
                                <span className="ml-1">
                                    {trend.value > 0 ? '+' : ''}{trend.value}%
                                </span>
                            </Badge>
                            <span className="text-xs text-gray-500">
                                {trend.direction === 'up' ? 'En amélioration' : 
                                 trend.direction === 'down' ? 'En baisse' : 'Stable'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Benchmark Comparison */}
                {benchmark && (
                    <div>
                        <div className="flex items-center gap-1 mb-2">
                            <BarChart3 className="h-3 w-3 text-gray-500" />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                Comparaison industrie
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                    Moyenne: {benchmark}%
                                </span>
                                <Badge variant={score >= benchmark ? 'default' : 'secondary'} className="text-xs">
                                    {score >= benchmark ? 'Au-dessus' : 'En-dessous'}
                                </Badge>
                            </div>
                            <span className={cn('text-xs font-medium', 
                                score >= benchmark ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            )}>
                                {score >= benchmark ? '+' : ''}{score - benchmark}%
                            </span>
                        </div>
                    </div>
                )}

                {/* Recommendations */}
                {recommendations.length > 0 && (
                    <div>
                        <div className="flex items-center gap-1 mb-2">
                            <HelpCircle className="h-3 w-3 text-persona-primary" />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                Recommandations
                            </span>
                        </div>

                        <div className="space-y-1">
                            {recommendations.map((recommendation, index) => (
                                <div key={index} className="flex items-start gap-2 text-xs">
                                    <div className="w-1 h-1 rounded-full bg-persona-secondary mt-1.5 flex-shrink-0" />
                                    <span className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {recommendation}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Score Breakdown */}
                <div className="pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                            <div className="text-xs font-medium text-green-600 dark:text-green-400">
                                {Math.max(0, Math.min(100, score + 10))}%
                            </div>
                            <div className="text-xs text-gray-500">Optimal</div>
                        </div>

                        <div>
                            <div className={cn('text-xs font-medium', getScoreColor())}>
                                {score}%
                            </div>
                            <div className="text-xs text-gray-500">Actuel</div>
                        </div>

                        <div>
                            <div className="text-xs font-medium text-gray-400">
                                {Math.max(0, score - 20)}%
                            </div>
                            <div className="text-xs text-gray-500">Minimum</div>
                        </div>
                    </div>
                </div>
            </AnimatedCardContent>

            {/* Tooltip Arrow */}
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                <div className="w-2 h-2 bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rotate-45" />
            </div>
        </AnimatedCard>
    );
}

// Simplified version for inline tooltips
export function InlineMetricsTooltip({
    score,
    label,
    className,
}: {
    score: number;
    label: string;
    className?: string;
}) {
    const getScoreColor = () => {
        if (score >= 90) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
        if (score >= 70) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
    };

    return (
        <div className={cn(
            'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border',
            getScoreColor(),
            className
        )}>
            <span className="tabular-nums">{score}%</span>
            <span>{label}</span>
        </div>
    );
}