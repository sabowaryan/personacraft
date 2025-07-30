'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ErrorTrend {
    timestamp: string;
    errorType: string;
    count: number;
    percentage: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ErrorSummary {
    errorType: string;
    totalCount: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
    trendValue: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    affectedTemplates: string[];
}

interface ErrorTrendsChartProps {
    data: {
        trends: ErrorTrend[];
        summary: ErrorSummary[];
        period: string;
        totalErrors: number;
        criticalAlerts: number;
    };
    templateId?: string;
}

export function ErrorTrendsChart({ data, templateId }: ErrorTrendsChartProps) {
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'high':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="h-4 w-4 text-red-500" />;
            case 'down':
                return <TrendingDown className="h-4 w-4 text-green-500" />;
            default:
                return <Minus className="h-4 w-4 text-gray-500" />;
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical':
            case 'high':
                return <AlertTriangle className="h-4 w-4" />;
            default:
                return <AlertTriangle className="h-4 w-4" />;
        }
    };

    // Group trends by hour for visualization
    const hourlyTrends = data.trends.reduce((acc, trend) => {
        const hour = new Date(trend.timestamp).getHours();
        const key = `${hour}:00`;
        
        if (!acc[key]) {
            acc[key] = { hour: key, total: 0, byType: {} };
        }
        
        acc[key].total += trend.count;
        acc[key].byType[trend.errorType] = (acc[key].byType[trend.errorType] || 0) + trend.count;
        
        return acc;
    }, {} as Record<string, { hour: string; total: number; byType: Record<string, number> }>);

    const sortedHours = Object.values(hourlyTrends).sort((a, b) => 
        parseInt(a.hour) - parseInt(b.hour)
    );

    return (
        <div className="space-y-6">
            {/* Critical Alerts */}
            {data.criticalAlerts > 0 && (
                <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                        <strong>{data.criticalAlerts} critical alerts</strong> detected in the last {data.period}.
                        Immediate attention required.
                    </AlertDescription>
                </Alert>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{data.totalErrors}</div>
                            <div className="text-sm text-muted-foreground">Total Errors</div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold">
                                {data.summary.filter(s => s.severity === 'critical' || s.severity === 'high').length}
                            </div>
                            <div className="text-sm text-muted-foreground">High Priority Issues</div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold">
                                {data.summary.filter(s => s.trend === 'up').length}
                            </div>
                            <div className="text-sm text-muted-foreground">Increasing Trends</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Error Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Error Summary</CardTitle>
                    <CardDescription>
                        Most common validation errors {templateId && templateId !== 'all' ? `for ${templateId}` : 'across all templates'} 
                        over the {data.period}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data.summary.map((error, index) => (
                            <div key={index} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        {getSeverityIcon(error.severity)}
                                        <h4 className="font-medium">{error.errorType}</h4>
                                        <Badge className={getSeverityColor(error.severity)}>
                                            {error.severity.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getTrendIcon(error.trend)}
                                        <span className={`text-sm ${
                                            error.trend === 'up' ? 'text-red-600' : 
                                            error.trend === 'down' ? 'text-green-600' : 'text-gray-600'
                                        }`}>
                                            {error.trendValue > 0 ? '+' : ''}{error.trendValue.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                                
                                <p className="text-sm text-muted-foreground mb-3">
                                    {error.description}
                                </p>
                                
                                <div className="flex items-center justify-between text-sm">
                                    <div>
                                        <span className="font-medium">{error.totalCount}</span> occurrences 
                                        ({error.percentage.toFixed(1)}% of all errors)
                                    </div>
                                    
                                    {error.affectedTemplates.length > 0 && (
                                        <div className="flex gap-1">
                                            {error.affectedTemplates.slice(0, 3).map((template, i) => (
                                                <Badge key={i} variant="outline" className="text-xs">
                                                    {template}
                                                </Badge>
                                            ))}
                                            {error.affectedTemplates.length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{error.affectedTemplates.length - 3} more
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Hourly Trends */}
            <Card>
                <CardHeader>
                    <CardTitle>Hourly Error Distribution</CardTitle>
                    <CardDescription>
                        Error patterns throughout the day
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {sortedHours.map((hourData, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className="w-16 text-sm font-mono">
                                    {hourData.hour}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-red-500 h-2 rounded-full transition-all"
                                                style={{ 
                                                    width: `${Math.min((hourData.total / Math.max(...sortedHours.map(h => h.total))) * 100, 100)}%` 
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium w-12 text-right">
                                            {hourData.total}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}