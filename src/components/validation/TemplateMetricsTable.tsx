/**
 * TemplateMetricsTable - Displays detailed metrics for each validation template
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ValidationMetricsAggregated } from '@/types/validation';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface TemplateMetricsTableProps {
    templateMetrics: Record<string, ValidationMetricsAggregated>;
    isLoading: boolean;
}

export function TemplateMetricsTable({ templateMetrics, isLoading }: TemplateMetricsTableProps) {
    const getSuccessRateBadge = (successRate: number) => {
        if (successRate >= 0.9) {
            return <Badge variant="default" className="bg-green-500">Excellent</Badge>;
        } else if (successRate >= 0.7) {
            return <Badge variant="secondary">Good</Badge>;
        } else if (successRate >= 0.5) {
            return <Badge variant="outline" className="border-orange-500 text-orange-500">Fair</Badge>;
        } else {
            return <Badge variant="destructive">Poor</Badge>;
        }
    };

    const getPerformanceBadge = (avgTime: number) => {
        if (avgTime < 100) {
            return <Badge variant="default" className="bg-green-500">Fast</Badge>;
        } else if (avgTime < 500) {
            return <Badge variant="secondary">Normal</Badge>;
        } else {
            return <Badge variant="destructive">Slow</Badge>;
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Template Metrics</CardTitle>
                    <CardDescription>
                        Detailed performance metrics for each validation template
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const templates = Object.entries(templateMetrics);

    if (templates.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Template Metrics</CardTitle>
                    <CardDescription>
                        Detailed performance metrics for each validation template
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-8">
                        No template metrics available for this period
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Template Metrics</CardTitle>
                <CardDescription>
                    Detailed performance metrics for each validation template
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-4 font-medium">Template</th>
                                <th className="text-left p-4 font-medium">Validations</th>
                                <th className="text-left p-4 font-medium">Success Rate</th>
                                <th className="text-left p-4 font-medium">Avg Score</th>
                                <th className="text-left p-4 font-medium">Avg Time</th>
                                <th className="text-left p-4 font-medium">Fallback Rate</th>
                                <th className="text-left p-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {templates.map(([templateId, metrics]) => (
                                <tr key={templateId} className="border-b hover:bg-muted/50">
                                    <td className="p-4">
                                        <div className="font-medium">
                                            {templateId.replace('-template', '').replace('-', ' ')}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {templateId}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-blue-500" />
                                            {metrics.totalValidations}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {getSuccessRateBadge(metrics.successRate)}
                                            <span className="text-sm">
                                                {(metrics.successRate * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-blue-500 h-2 rounded-full" 
                                                    style={{ width: `${metrics.averageScore * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm">
                                                {(metrics.averageScore * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm">
                                                {metrics.averageValidationTime.toFixed(0)}ms
                                            </span>
                                            {getPerformanceBadge(metrics.averageValidationTime)}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {metrics.fallbackUsageRate > 0.1 ? (
                                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                                            ) : (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                            )}
                                            <span className="text-sm">
                                                {(metrics.fallbackUsageRate * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {metrics.successRate >= 0.9 && metrics.averageValidationTime < 500 ? (
                                            <Badge variant="default" className="bg-green-500">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Healthy
                                            </Badge>
                                        ) : metrics.successRate >= 0.7 ? (
                                            <Badge variant="secondary">
                                                <AlertTriangle className="h-3 w-3 mr-1" />
                                                Warning
                                            </Badge>
                                        ) : (
                                            <Badge variant="destructive">
                                                <XCircle className="h-3 w-3 mr-1" />
                                                Critical
                                            </Badge>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}