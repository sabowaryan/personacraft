'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Zap, Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PerformanceMetric {
    templateId: string;
    templateName: string;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    throughput: number;
    cpuUsage: number;
    memoryUsage: number;
    trend: 'up' | 'down' | 'stable';
    trendValue: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
    hourlyMetrics: Array<{
        hour: string;
        avgResponseTime: number;
        throughput: number;
        cpuUsage: number;
        memoryUsage: number;
    }>;
}

interface PerformanceMetricsChartProps {
    data: {
        templates: PerformanceMetric[];
        system: {
            totalThroughput: number;
            averageResponseTime: number;
            systemCpuUsage: number;
            systemMemoryUsage: number;
        };
        period: string;
        thresholds: {
            responseTime: number;
            throughput: number;
            cpuUsage: number;
            memoryUsage: number;
        };
    };
    templateId?: string;
}

export function PerformanceMetricsChart({ data, templateId }: PerformanceMetricsChartProps) {
    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="h-4 w-4 text-red-500" />; // Up is bad for response time
            case 'down':
                return <TrendingDown className="h-4 w-4 text-green-500" />; // Down is good for response time
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

    const getUsageColor = (usage: number, threshold: number) => {
        if (usage >= threshold * 0.9) return 'text-red-600';
        if (usage >= threshold * 0.7) return 'text-yellow-600';
        return 'text-green-600';
    };

    const formatResponseTime = (ms: number) => {
        if (ms < 1000) return `${ms.toFixed(0)}ms`;
        return `${(ms / 1000).toFixed(1)}s`;
    };

    const filteredTemplates = templateId && templateId !== 'all' 
        ? data.templates.filter(t => t.templateId === templateId)
        : data.templates;

    return (
        <div className="space-y-6">
            {/* System Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        System Performance Overview
                    </CardTitle>
                    <CardDescription>
                        Overall system performance metrics for the {data.period}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                            <div className="text-2xl font-bold">
                                {formatResponseTime(data.system.averageResponseTime)}
                            </div>
                            <div className="text-sm text-muted-foreground">Avg Response Time</div>
                        </div>
                        
                        <div className="text-center">
                            <Zap className="h-8 w-8 mx-auto mb-2 text-green-500" />
                            <div className="text-2xl font-bold">
                                {data.system.totalThroughput.toFixed(0)}
                            </div>
                            <div className="text-sm text-muted-foreground">Requests/min</div>
                        </div>
                        
                        <div className="text-center">
                            <Activity className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                            <div className={`text-2xl font-bold ${getUsageColor(data.system.systemCpuUsage, data.thresholds.cpuUsage)}`}>
                                {data.system.systemCpuUsage.toFixed(1)}%
                            </div>
                            <div className="text-sm text-muted-foreground">CPU Usage</div>
                        </div>
                        
                        <div className="text-center">
                            <Activity className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                            <div className={`text-2xl font-bold ${getUsageColor(data.system.systemMemoryUsage, data.thresholds.memoryUsage)}`}>
                                {data.system.systemMemoryUsage.toFixed(1)}%
                            </div>
                            <div className="text-sm text-muted-foreground">Memory Usage</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Template Performance Details */}
            <div className="space-y-4">
                {filteredTemplates.map((template) => (
                    <Card key={template.templateId}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{template.templateName}</CardTitle>
                                <Badge className={getStatusColor(template.status)}>
                                    {template.status.toUpperCase()}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Response Time Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">Average Response Time</span>
                                        <div className="flex items-center gap-1">
                                            {getTrendIcon(template.trend)}
                                            <span className={`text-sm ${
                                                template.trend === 'up' ? 'text-red-600' : 
                                                template.trend === 'down' ? 'text-green-600' : 'text-gray-600'
                                            }`}>
                                                {template.trendValue > 0 ? '+' : ''}{template.trendValue.toFixed(0)}ms
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold">
                                        {formatResponseTime(template.averageResponseTime)}
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="text-sm font-medium mb-2">95th Percentile</div>
                                    <div className="text-2xl font-bold text-muted-foreground">
                                        {formatResponseTime(template.p95ResponseTime)}
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="text-sm font-medium mb-2">99th Percentile</div>
                                    <div className="text-2xl font-bold text-muted-foreground">
                                        {formatResponseTime(template.p99ResponseTime)}
                                    </div>
                                </div>
                            </div>

                            {/* Throughput and Resource Usage */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <div className="text-sm font-medium mb-2">Throughput</div>
                                    <div className="text-xl font-bold text-green-600">
                                        {template.throughput.toFixed(1)} req/min
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="text-sm font-medium mb-2">CPU Usage</div>
                                    <div className={`text-xl font-bold ${getUsageColor(template.cpuUsage, data.thresholds.cpuUsage)}`}>
                                        {template.cpuUsage.toFixed(1)}%
                                    </div>
                                    <Progress 
                                        value={template.cpuUsage} 
                                        className="h-2 mt-1"
                                    />
                                </div>
                                
                                <div>
                                    <div className="text-sm font-medium mb-2">Memory Usage</div>
                                    <div className={`text-xl font-bold ${getUsageColor(template.memoryUsage, data.thresholds.memoryUsage)}`}>
                                        {template.memoryUsage.toFixed(1)}%
                                    </div>
                                    <Progress 
                                        value={template.memoryUsage} 
                                        className="h-2 mt-1"
                                    />
                                </div>
                            </div>

                            {/* Performance Trend Chart */}
                            <div>
                                <div className="text-sm font-medium mb-3">24-Hour Performance Trend</div>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Response Time Trend */}
                                    <div>
                                        <div className="text-xs text-muted-foreground mb-2">Response Time (ms)</div>
                                        <div className="flex items-end gap-1 h-16">
                                            {template.hourlyMetrics.slice(-24).map((metric, index) => {
                                                const maxResponseTime = Math.max(...template.hourlyMetrics.map(m => m.avgResponseTime));
                                                const height = (metric.avgResponseTime / maxResponseTime) * 100;
                                                return (
                                                    <div
                                                        key={index}
                                                        className="flex-1 bg-blue-200 rounded-t"
                                                        style={{ 
                                                            height: `${height}%`,
                                                            minHeight: '2px'
                                                        }}
                                                        title={`${metric.hour}: ${formatResponseTime(metric.avgResponseTime)}`}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Throughput Trend */}
                                    <div>
                                        <div className="text-xs text-muted-foreground mb-2">Throughput (req/min)</div>
                                        <div className="flex items-end gap-1 h-16">
                                            {template.hourlyMetrics.slice(-24).map((metric, index) => {
                                                const maxThroughput = Math.max(...template.hourlyMetrics.map(m => m.throughput));
                                                const height = (metric.throughput / maxThroughput) * 100;
                                                return (
                                                    <div
                                                        key={index}
                                                        className="flex-1 bg-green-200 rounded-t"
                                                        style={{ 
                                                            height: `${height}%`,
                                                            minHeight: '2px'
                                                        }}
                                                        title={`${metric.hour}: ${metric.throughput.toFixed(1)} req/min`}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Performance Thresholds */}
            <Card>
                <CardHeader>
                    <CardTitle>Performance Thresholds</CardTitle>
                    <CardDescription>
                        Current system thresholds and alerts
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-sm text-muted-foreground">Response Time Limit</div>
                            <div className="text-lg font-bold">{formatResponseTime(data.thresholds.responseTime)}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-muted-foreground">Min Throughput</div>
                            <div className="text-lg font-bold">{data.thresholds.throughput} req/min</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-muted-foreground">CPU Threshold</div>
                            <div className="text-lg font-bold">{data.thresholds.cpuUsage}%</div>
                        </div>
                        <div className="text-center">
                            <div className="text-sm text-muted-foreground">Memory Threshold</div>
                            <div className="text-lg font-bold">{data.thresholds.memoryUsage}%</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}