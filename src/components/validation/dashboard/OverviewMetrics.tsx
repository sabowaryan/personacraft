'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    TrendingUp, 
    TrendingDown, 
    CheckCircle, 
    AlertTriangle, 
    Clock, 
    Target,
    RefreshCw,
    FileText
} from 'lucide-react';

interface OverviewMetricsProps {
    data: {
        overview: {
            totalValidations: number;
            successRate: number;
            averageScore: number;
            averageValidationTime: number;
            fallbackUsageRate: number;
            activeTemplates: number;
            trends: {
                successRate: number;
                validationTime: number;
            };
        };
        topFailingRules: Array<{ ruleId: string; failureCount: number }>;
        errorBreakdown: Record<string, number>;
    };
}

export function OverviewMetrics({ data }: OverviewMetricsProps) {
    const { overview, topFailingRules, errorBreakdown } = data;

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const formatPercentage = (num: number): string => {
        return `${(num * 100).toFixed(1)}%`;
    };

    const formatTime = (ms: number): string => {
        if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
        return `${ms.toFixed(0)}ms`;
    };

    const getTrendIcon = (trend: number) => {
        if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
        if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
        return null;
    };

    const getTrendColor = (trend: number) => {
        if (trend > 0) return 'text-green-500';
        if (trend < 0) return 'text-red-500';
        return 'text-gray-500';
    };

    const getSuccessRateColor = (rate: number) => {
        if (rate >= 0.95) return 'text-green-500';
        if (rate >= 0.85) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getScoreColor = (score: number) => {
        if (score >= 0.9) return 'text-green-500';
        if (score >= 0.7) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Validations</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(overview.totalValidations)}</div>
                        <p className="text-xs text-muted-foreground">
                            Across {overview.activeTemplates} active templates
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${getSuccessRateColor(overview.successRate)}`}>
                            {formatPercentage(overview.successRate)}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                            {getTrendIcon(overview.trends.successRate)}
                            <span className={`ml-1 ${getTrendColor(overview.trends.successRate)}`}>
                                {overview.trends.successRate > 0 ? '+' : ''}{formatPercentage(overview.trends.successRate)}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${getScoreColor(overview.averageScore)}`}>
                            {overview.averageScore.toFixed(2)}
                        </div>
                        <Progress value={overview.averageScore * 100} className="mt-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Validation Time</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatTime(overview.averageValidationTime)}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                            {getTrendIcon(-overview.trends.validationTime)} {/* Negative because lower is better */}
                            <span className={`ml-1 ${getTrendColor(-overview.trends.validationTime)}`}>
                                {overview.trends.validationTime > 0 ? '+' : ''}{formatTime(overview.trends.validationTime)}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <RefreshCw className="h-5 w-5" />
                            Fallback Usage
                        </CardTitle>
                        <CardDescription>
                            Rate of fallback template usage when validation fails
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold mb-2">
                            {formatPercentage(overview.fallbackUsageRate)}
                        </div>
                        <Progress value={overview.fallbackUsageRate * 100} className="mb-2" />
                        <p className="text-sm text-muted-foreground">
                            {overview.fallbackUsageRate < 0.1 ? 'Low' : 
                             overview.fallbackUsageRate < 0.3 ? 'Moderate' : 'High'} fallback usage
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Active Templates
                        </CardTitle>
                        <CardDescription>
                            Number of validation templates currently in use
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold mb-2">
                            {overview.activeTemplates}
                        </div>
                        <div className="flex gap-2">
                            <Badge variant="outline">Standard</Badge>
                            <Badge variant="outline">B2B</Badge>
                            <Badge variant="outline">Simple</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Error Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Top Failing Rules
                        </CardTitle>
                        <CardDescription>
                            Rules that fail most frequently
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {topFailingRules.map((rule, index) => (
                                <div key={rule.ruleId} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                            #{index + 1}
                                        </Badge>
                                        <span className="text-sm font-medium truncate">
                                            {rule.ruleId}
                                        </span>
                                    </div>
                                    <Badge variant="destructive">
                                        {formatNumber(rule.failureCount)}
                                    </Badge>
                                </div>
                            ))}
                            {topFailingRules.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No failing rules in this period
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Error Breakdown
                        </CardTitle>
                        <CardDescription>
                            Distribution of error types
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Object.entries(errorBreakdown)
                                .sort(([,a], [,b]) => b - a)
                                .map(([errorType, count]) => (
                                    <div key={errorType} className="flex items-center justify-between">
                                        <span className="text-sm font-medium">
                                            {errorType.replace(/_/g, ' ').toLowerCase()}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-red-500 h-2 rounded-full"
                                                    style={{ 
                                                        width: `${(count / Math.max(...Object.values(errorBreakdown))) * 100}%` 
                                                    }}
                                                />
                                            </div>
                                            <Badge variant="destructive">
                                                {formatNumber(count)}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            {Object.keys(errorBreakdown).length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No errors in this period
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}