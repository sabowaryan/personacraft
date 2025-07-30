/**
 * ValidationMonitoringDashboard - React component for monitoring validation metrics
 * 
 * This component provides:
 * - Real-time metrics visualization
 * - Success/failure rate charts
 * - Performance metrics by template and LLM
 * - Active alerts display
 * - System health overview
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    ValidationMetrics, 
    ValidationMetricsAggregated, 
    ValidationErrorType, 
    PersonaType 
} from '@/types/validation';
import { Alert as ValidationAlert } from '@/lib/validation/alert-system';

interface MetricsSummary {
    totalValidations: number;
    successRate: number;
    averageScore: number;
    averageValidationTime: number;
    errorBreakdown: Record<ValidationErrorType, number>;
    fallbackUsageRate: number;
    topFailingRules: Array<{ ruleId: string; failureCount: number }>;
}

interface HealthData {
    score: number;
    status: 'healthy' | 'warning' | 'critical';
    metrics: {
        totalValidations: number;
        successRate: number;
        averageScore: number;
        averageValidationTime: number;
        fallbackUsageRate: number;
    };
    alerts: {
        active: number;
        rules: number;
    };
    uptime: number;
    timestamp: number;
}

interface AlertsData {
    active: ValidationAlert[];
    history: ValidationAlert[];
}

export function ValidationMonitoringDashboard() {
    const [summary, setSummary] = useState<MetricsSummary | null>(null);
    const [health, setHealth] = useState<HealthData | null>(null);
    const [alerts, setAlerts] = useState<AlertsData | null>(null);
    const [templateMetrics, setTemplateMetrics] = useState<Record<string, ValidationMetricsAggregated> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            setError(null);
            
            // Fetch all data in parallel
            const [summaryRes, healthRes, alertsRes, templatesRes] = await Promise.all([
                fetch('/api/validation/metrics?endpoint=summary'),
                fetch('/api/validation/metrics?endpoint=health'),
                fetch('/api/validation/metrics?endpoint=alerts'),
                fetch('/api/validation/metrics?endpoint=templates')
            ]);

            if (!summaryRes.ok || !healthRes.ok || !alertsRes.ok || !templatesRes.ok) {
                throw new Error('Failed to fetch metrics data');
            }

            const [summaryData, healthData, alertsData, templatesData] = await Promise.all([
                summaryRes.json(),
                healthRes.json(),
                alertsRes.json(),
                templatesRes.json()
            ]);

            setSummary(summaryData.data);
            setHealth(healthData.data);
            setAlerts(alertsData.data);
            setTemplateMetrics(templatesData.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    const resolveAlert = async (alertId: string) => {
        try {
            const response = await fetch('/api/validation/metrics?action=resolve-alert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ alertId })
            });

            if (response.ok) {
                // Refresh alerts data
                fetchData();
            }
        } catch (err) {
            console.error('Failed to resolve alert:', err);
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [autoRefresh, fetchData]);

    const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
    const formatDuration = (ms: number) => `${ms.toFixed(0)}ms`;
    const formatUptime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    const getHealthBadgeVariant = (status: string) => {
        switch (status) {
            case 'healthy': return 'default';
            case 'warning': return 'secondary';
            case 'critical': return 'destructive';
            default: return 'outline';
        }
    };

    const getAlertSeverityBadgeVariant = (severity: string) => {
        switch (severity) {
            case 'low': return 'outline';
            case 'medium': return 'secondary';
            case 'high': return 'default';
            case 'critical': return 'destructive';
            default: return 'outline';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading validation metrics...</div>
            </div>
        );
    }

    if (error) {
        return (
            <Alert className="m-4">
                <AlertDescription>
                    Error loading metrics: {error}
                    <Button onClick={fetchData} className="ml-2" size="sm">
                        Retry
                    </Button>
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Validation Monitoring Dashboard</h1>
                <div className="flex items-center space-x-2">
                    <Button
                        variant={autoRefresh ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                    >
                        {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
                    </Button>
                    <Button onClick={fetchData} size="sm">
                        Refresh Now
                    </Button>
                </div>
            </div>

            {/* System Health Overview */}
            {health && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            System Health
                            <Badge variant={getHealthBadgeVariant(health.status)}>
                                {health.status.toUpperCase()} ({health.score}/100)
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <div className="text-sm text-gray-600">Success Rate</div>
                                <div className="text-2xl font-bold">{formatPercentage(health.metrics.successRate)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Avg Response Time</div>
                                <div className="text-2xl font-bold">{formatDuration(health.metrics.averageValidationTime)}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Active Alerts</div>
                                <div className="text-2xl font-bold text-red-600">{health.alerts.active}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Uptime</div>
                                <div className="text-2xl font-bold">{formatUptime(health.uptime)}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="alerts">Alerts</TabsTrigger>
                    <TabsTrigger value="errors">Error Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    {summary && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Total Validations</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{summary.totalValidations.toLocaleString()}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Success Rate</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-600">
                                        {formatPercentage(summary.successRate)}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Average Score</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">
                                        {(summary.averageScore * 100).toFixed(1)}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Avg Validation Time</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">
                                        {formatDuration(summary.averageValidationTime)}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Fallback Usage</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-orange-600">
                                        {formatPercentage(summary.fallbackUsageRate)}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="templates" className="space-y-4">
                    {templateMetrics && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {Object.entries(templateMetrics).map(([templateId, metrics]) => (
                                <Card key={templateId}>
                                    <CardHeader>
                                        <CardTitle>{templateId}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span>Validations:</span>
                                                <span className="font-bold">{metrics.totalValidations}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Success Rate:</span>
                                                <span className="font-bold text-green-600">
                                                    {formatPercentage(metrics.successRate)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Avg Score:</span>
                                                <span className="font-bold">
                                                    {(metrics.averageScore * 100).toFixed(1)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Avg Time:</span>
                                                <span className="font-bold">
                                                    {formatDuration(metrics.averageValidationTime)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Fallback Rate:</span>
                                                <span className="font-bold text-orange-600">
                                                    {formatPercentage(metrics.fallbackUsageRate)}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="alerts" className="space-y-4">
                    {alerts && (
                        <>
                            {/* Active Alerts */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Active Alerts ({alerts.active.length})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {alerts.active.length === 0 ? (
                                        <div className="text-gray-500">No active alerts</div>
                                    ) : (
                                        <div className="space-y-3">
                                            {alerts.active.map((alert) => (
                                                <div key={alert.id} className="flex items-center justify-between p-3 border rounded">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2">
                                                            <Badge variant={getAlertSeverityBadgeVariant(alert.severity)}>
                                                                {alert.severity}
                                                            </Badge>
                                                            <span className="font-semibold">{alert.title}</span>
                                                        </div>
                                                        <div className="text-sm text-gray-600 mt-1">{alert.message}</div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {new Date(alert.timestamp).toLocaleString()}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => resolveAlert(alert.id)}
                                                    >
                                                        Resolve
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Recent Alert History */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Alert History</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {alerts.history.length === 0 ? (
                                        <div className="text-gray-500">No recent alerts</div>
                                    ) : (
                                        <div className="space-y-2">
                                            {alerts.history.slice(0, 10).map((alert) => (
                                                <div key={alert.id} className="flex items-center justify-between p-2 border rounded">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2">
                                                            <Badge variant={getAlertSeverityBadgeVariant(alert.severity)}>
                                                                {alert.severity}
                                                            </Badge>
                                                            <span className="text-sm">{alert.title}</span>
                                                            {alert.isResolved && (
                                                                <Badge variant="outline">Resolved</Badge>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {new Date(alert.timestamp).toLocaleString()}
                                                            {alert.resolvedAt && (
                                                                <span> → Resolved: {new Date(alert.resolvedAt).toLocaleString()}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    )}
                </TabsContent>

                <TabsContent value="errors" className="space-y-4">
                    {summary && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Error Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {Object.entries(summary.errorBreakdown).map(([errorType, count]) => (
                                        <div key={errorType} className="flex items-center justify-between">
                                            <span className="text-sm">{errorType.replace(/_/g, ' ')}</span>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-bold">{count}</span>
                                                <span className="text-sm text-gray-500">
                                                    ({formatPercentage(count / summary.totalValidations)})
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {summary.topFailingRules.length > 0 && (
                                    <div className="mt-6">
                                        <h4 className="font-semibold mb-3">Top Failing Rules</h4>
                                        <div className="space-y-2">
                                            {summary.topFailingRules.slice(0, 5).map((rule) => (
                                                <div key={rule.ruleId} className="flex items-center justify-between">
                                                    <span className="text-sm">{rule.ruleId}</span>
                                                    <span className="font-bold text-red-600">{rule.failureCount}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}