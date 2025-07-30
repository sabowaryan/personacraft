'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle } from 'lucide-react';

interface TemplateMetrics {
    templateId: string;
    templateName: string;
    totalValidations: number;
    successRate: number;
    averageResponseTime: number;
    errorRate: number;
    trend: 'up' | 'down' | 'stable';
    trendValue: number;
    commonErrors: Array<{
        type: string;
        count: number;
        percentage: number;
    }>;
    performanceByHour: Array<{
        hour: string;
        successRate: number;
        responseTime: number;
        validations: number;
    }>;
}

interface TemplatePerformanceChartProps {
    data: {
        templates: TemplateMetrics[];
        period: string;
        totalValidations: number;
    };
}

export function TemplatePerformanceChart({ data }: TemplatePerformanceChartProps) {
    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="h-4 w-4 text-green-500" />;
            case 'down':
                return <TrendingDown className="h-4 w-4 text-red-500" />;
            default:
                return <Minus className="h-4 w-4 text-gray-500" />;
        }
    };

    const getSuccessRateColor = (rate: number) => {
        if (rate >= 95) return 'text-green-600';
        if (rate >= 85) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getSuccessRateBadgeColor = (rate: number) => {
        if (rate >= 95) return 'bg-green-100 text-green-800';
        if (rate >= 85) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    return (
        <div className="space-y-6">
            {/* Summary Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Template Performance Overview</CardTitle>
                    <CardDescription>
                        Performance metrics for all validation templates over the {data.period}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold">{data.templates.length}</div>
                            <div className="text-sm text-muted-foreground">Active Templates</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{data.totalValidations.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">Total Validations</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">
                                {(data.templates.reduce((sum, t) => sum + t.successRate, 0) / data.templates.length).toFixed(1)}%
                            </div>
                            <div className="text-sm text-muted-foreground">Average Success Rate</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Template Performance Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {data.templates.map((template) => (
                    <Card key={template.templateId}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{template.templateName}</CardTitle>
                                <Badge className={getSuccessRateBadgeColor(template.successRate)}>
                                    {template.successRate.toFixed(1)}% Success
                                </Badge>
                            </div>
                            <CardDescription>
                                {template.totalValidations.toLocaleString()} validations
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Success Rate Progress */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium">Success Rate</span>
                                    <div className="flex items-center gap-1">
                                        {getTrendIcon(template.trend)}
                                        <span className={`text-sm ${
                                            template.trend === 'up' ? 'text-green-600' : 
                                            template.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                                        }`}>
                                            {template.trendValue > 0 ? '+' : ''}{template.trendValue.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                                <Progress value={template.successRate} className="h-2" />
                            </div>

                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="text-muted-foreground">Avg Response Time</div>
                                    <div className="font-medium">{template.averageResponseTime}ms</div>
                                </div>
                                <div>
                                    <div className="text-muted-foreground">Error Rate</div>
                                    <div className="font-medium text-red-600">{template.errorRate.toFixed(1)}%</div>
                                </div>
                            </div>

                            {/* Common Errors */}
                            {template.commonErrors.length > 0 && (
                                <div>
                                    <div className="text-sm font-medium mb-2">Common Errors</div>
                                    <div className="space-y-1">
                                        {template.commonErrors.slice(0, 3).map((error, index) => (
                                            <div key={index} className="flex justify-between items-center text-xs">
                                                <span className="text-muted-foreground">{error.type}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {error.count} ({error.percentage.toFixed(1)}%)
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Performance Indicator */}
                            <div className="flex items-center gap-2 pt-2 border-t">
                                {template.successRate >= 95 ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span className="text-sm text-green-600">Excellent Performance</span>
                                    </>
                                ) : template.successRate >= 85 ? (
                                    <>
                                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                        <span className="text-sm text-yellow-600">Good Performance</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle className="h-4 w-4 text-red-500" />
                                        <span className="text-sm text-red-600">Needs Attention</span>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}