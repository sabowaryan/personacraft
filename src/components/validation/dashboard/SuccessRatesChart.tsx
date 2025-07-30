'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, Target, CheckCircle, AlertTriangle } from 'lucide-react';

interface SuccessRateData {
    templateId: string;
    templateName: string;
    currentRate: number;
    previousRate: number;
    trend: 'up' | 'down' | 'stable';
    trendValue: number;
    target: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
    hourlyRates: Array<{
        hour: string;
        rate: number;
        validations: number;
    }>;
}

interface SuccessRatesChartProps {
    data: {
        templates: SuccessRateData[];
        overall: {
            currentRate: number;
            previousRate: number;
            trend: 'up' | 'down' | 'stable';
            trendValue: number;
            target: number;
        };
        period: string;
        slaTarget: number;
    };
}

export function SuccessRatesChart({ data }: SuccessRatesChartProps) {
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'excellent':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'good':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'critical':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'excellent':
            case 'good':
                return <CheckCircle className="h-4 w-4" />;
            case 'warning':
            case 'critical':
                return <AlertTriangle className="h-4 w-4" />;
            default:
                return <Target className="h-4 w-4" />;
        }
    };

    const getProgressColor = (rate: number, target: number) => {
        if (rate >= target) return 'bg-green-500';
        if (rate >= target * 0.9) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="space-y-6">
            {/* Overall Success Rate */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Overall Success Rate
                    </CardTitle>
                    <CardDescription>
                        System-wide validation success rate over the {data.period}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-3xl font-bold">
                                    {data.overall.currentRate.toFixed(1)}%
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    {getTrendIcon(data.overall.trend)}
                                    <span className={
                                        data.overall.trend === 'up' ? 'text-green-600' : 
                                        data.overall.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                                    }>
                                        {data.overall.trendValue > 0 ? '+' : ''}{data.overall.trendValue.toFixed(1)}% 
                                        from previous period
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-muted-foreground">SLA Target</div>
                                <div className="text-xl font-semibold">{data.slaTarget}%</div>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Progress to SLA Target</span>
                                <span>{data.overall.currentRate >= data.slaTarget ? 'Target Met' : 'Below Target'}</span>
                            </div>
                            <div className="relative">
                                <Progress value={Math.min(data.overall.currentRate, 100)} className="h-3" />
                                <div 
                                    className="absolute top-0 w-0.5 h-3 bg-gray-400"
                                    style={{ left: `${data.slaTarget}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Template Success Rates */}
            <Card>
                <CardHeader>
                    <CardTitle>Success Rates by Template</CardTitle>
                    <CardDescription>
                        Individual template performance against targets
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data.templates.map((template) => (
                            <div key={template.templateId} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <h4 className="font-medium">{template.templateName}</h4>
                                        <Badge className={getStatusColor(template.status)}>
                                            {getStatusIcon(template.status)}
                                            <span className="ml-1">{template.status.toUpperCase()}</span>
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getTrendIcon(template.trend)}
                                        <span className={`text-sm ${
                                            template.trend === 'up' ? 'text-green-600' : 
                                            template.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                                        }`}>
                                            {template.trendValue > 0 ? '+' : ''}{template.trendValue.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <div className="text-sm text-muted-foreground">Current Rate</div>
                                        <div className="text-xl font-bold">
                                            {template.currentRate.toFixed(1)}%
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Previous Rate</div>
                                        <div className="text-xl font-bold text-muted-foreground">
                                            {template.previousRate.toFixed(1)}%
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Target</div>
                                        <div className="text-xl font-bold">
                                            {template.target.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Progress to Target</span>
                                        <span>
                                            {template.currentRate >= template.target ? 
                                                `+${(template.currentRate - template.target).toFixed(1)}% above target` :
                                                `${(template.target - template.currentRate).toFixed(1)}% below target`
                                            }
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full transition-all ${getProgressColor(template.currentRate, template.target)}`}
                                                style={{ width: `${Math.min(template.currentRate, 100)}%` }}
                                            />
                                        </div>
                                        <div 
                                            className="absolute top-0 w-0.5 h-2 bg-gray-600"
                                            style={{ left: `${template.target}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Hourly Trend Mini Chart */}
                                <div className="mt-4">
                                    <div className="text-sm font-medium mb-2">24-Hour Trend</div>
                                    <div className="flex items-end gap-1 h-12">
                                        {template.hourlyRates.slice(-24).map((hour, index) => (
                                            <div
                                                key={index}
                                                className="flex-1 bg-blue-200 rounded-t"
                                                style={{ 
                                                    height: `${(hour.rate / 100) * 100}%`,
                                                    minHeight: '2px'
                                                }}
                                                title={`${hour.hour}: ${hour.rate.toFixed(1)}% (${hour.validations} validations)`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* SLA Compliance Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>SLA Compliance Summary</CardTitle>
                    <CardDescription>
                        Templates meeting service level agreement targets
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {data.templates.filter(t => t.status === 'excellent').length}
                            </div>
                            <div className="text-sm text-muted-foreground">Excellent</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {data.templates.filter(t => t.status === 'good').length}
                            </div>
                            <div className="text-sm text-muted-foreground">Good</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">
                                {data.templates.filter(t => t.status === 'warning').length}
                            </div>
                            <div className="text-sm text-muted-foreground">Warning</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                                {data.templates.filter(t => t.status === 'critical').length}
                            </div>
                            <div className="text-sm text-muted-foreground">Critical</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}