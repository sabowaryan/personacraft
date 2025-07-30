/**
 * AlertsPanel - Displays validation alerts and warnings
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ValidationMetricsAggregated, MetricsSummary } from '@/types/validation';
import { AlertTriangle, XCircle, Clock, TrendingDown, Info } from 'lucide-react';

interface AlertsPanelProps {
    summary: MetricsSummary;
    templateMetrics: Record<string, ValidationMetricsAggregated>;
}

interface AlertItem {
    id: string;
    type: 'error' | 'warning' | 'info';
    title: string;
    description: string;
    templateId?: string;
    metric?: string;
    value?: string | number;
    threshold?: string | number;
}

export function AlertsPanel({ summary, templateMetrics }: AlertsPanelProps) {
    const generateAlerts = (): AlertItem[] => {
        const alerts: AlertItem[] = [];

        // Check overall success rate
        if (summary.successRate < 0.5) {
            alerts.push({
                id: 'low-success-rate',
                type: 'error',
                title: 'Critical: Low Overall Success Rate',
                description: `System-wide success rate is ${(summary.successRate * 100).toFixed(1)}%, which is below the critical threshold of 50%.`,
                metric: 'successRate',
                value: `${(summary.successRate * 100).toFixed(1)}%`,
                threshold: '50%'
            });
        } else if (summary.successRate < 0.8) {
            alerts.push({
                id: 'moderate-success-rate',
                type: 'warning',
                title: 'Warning: Moderate Success Rate',
                description: `System-wide success rate is ${(summary.successRate * 100).toFixed(1)}%, which is below the recommended threshold of 80%.`,
                metric: 'successRate',
                value: `${(summary.successRate * 100).toFixed(1)}%`,
                threshold: '80%'
            });
        }

        // Check average validation time
        if (summary.averageValidationTime > 1000) {
            alerts.push({
                id: 'slow-validation',
                type: 'error',
                title: 'Critical: Slow Validation Performance',
                description: `Average validation time is ${summary.averageValidationTime.toFixed(0)}ms, which exceeds the critical threshold of 1000ms.`,
                metric: 'validationTime',
                value: `${summary.averageValidationTime.toFixed(0)}ms`,
                threshold: '1000ms'
            });
        } else if (summary.averageValidationTime > 500) {
            alerts.push({
                id: 'moderate-validation-time',
                type: 'warning',
                title: 'Warning: Elevated Validation Time',
                description: `Average validation time is ${summary.averageValidationTime.toFixed(0)}ms, which is above the recommended threshold of 500ms.`,
                metric: 'validationTime',
                value: `${summary.averageValidationTime.toFixed(0)}ms`,
                threshold: '500ms'
            });
        }

        // Check fallback usage rate
        if (summary.fallbackUsageRate > 0.2) {
            alerts.push({
                id: 'high-fallback-rate',
                type: 'error',
                title: 'Critical: High Fallback Usage',
                description: `Fallback usage rate is ${(summary.fallbackUsageRate * 100).toFixed(1)}%, indicating frequent validation failures.`,
                metric: 'fallbackRate',
                value: `${(summary.fallbackUsageRate * 100).toFixed(1)}%`,
                threshold: '20%'
            });
        } else if (summary.fallbackUsageRate > 0.1) {
            alerts.push({
                id: 'moderate-fallback-rate',
                type: 'warning',
                title: 'Warning: Elevated Fallback Usage',
                description: `Fallback usage rate is ${(summary.fallbackUsageRate * 100).toFixed(1)}%, which is above the recommended threshold of 10%.`,
                metric: 'fallbackRate',
                value: `${(summary.fallbackUsageRate * 100).toFixed(1)}%`,
                threshold: '10%'
            });
        }

        // Check individual template performance
        Object.entries(templateMetrics).forEach(([templateId, metrics]) => {
            if (metrics.successRate < 0.6) {
                alerts.push({
                    id: `template-${templateId}-low-success`,
                    type: 'error',
                    title: `Template Alert: ${templateId}`,
                    description: `Template "${templateId}" has a success rate of ${(metrics.successRate * 100).toFixed(1)}%, which is critically low.`,
                    templateId,
                    metric: 'successRate',
                    value: `${(metrics.successRate * 100).toFixed(1)}%`,
                    threshold: '60%'
                });
            }

            if (metrics.averageValidationTime > 800) {
                alerts.push({
                    id: `template-${templateId}-slow`,
                    type: 'warning',
                    title: `Performance Alert: ${templateId}`,
                    description: `Template "${templateId}" has an average validation time of ${metrics.averageValidationTime.toFixed(0)}ms, which is slow.`,
                    templateId,
                    metric: 'validationTime',
                    value: `${metrics.averageValidationTime.toFixed(0)}ms`,
                    threshold: '800ms'
                });
            }

            if (metrics.fallbackUsageRate > 0.15) {
                alerts.push({
                    id: `template-${templateId}-fallback`,
                    type: 'warning',
                    title: `Fallback Alert: ${templateId}`,
                    description: `Template "${templateId}" has a fallback usage rate of ${(metrics.fallbackUsageRate * 100).toFixed(1)}%, indicating frequent validation issues.`,
                    templateId,
                    metric: 'fallbackRate',
                    value: `${(metrics.fallbackUsageRate * 100).toFixed(1)}%`,
                    threshold: '15%'
                });
            }
        });

        // Check for top failing rules
        if (summary.topFailingRules.length > 0) {
            const topRule = summary.topFailingRules[0];
            if (topRule.failureCount > 10) {
                alerts.push({
                    id: 'top-failing-rule',
                    type: 'info',
                    title: 'Info: Frequent Rule Failures',
                    description: `Rule "${topRule.ruleId}" has failed ${topRule.failureCount} times, making it the most frequently failing rule.`,
                    metric: 'ruleFailures',
                    value: topRule.failureCount,
                    threshold: '10'
                });
            }
        }

        // Sort alerts by severity
        return alerts.sort((a, b) => {
            const severityOrder = { error: 0, warning: 1, info: 2 };
            return severityOrder[a.type] - severityOrder[b.type];
        });
    };

    const alerts = generateAlerts();

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'error':
                return <XCircle className="h-4 w-4" />;
            case 'warning':
                return <AlertTriangle className="h-4 w-4" />;
            default:
                return <Info className="h-4 w-4" />;
        }
    };

    const getAlertVariant = (type: string) => {
        switch (type) {
            case 'error':
                return 'destructive';
            case 'warning':
                return 'default';
            default:
                return 'default';
        }
    };

    if (alerts.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>System Alerts</CardTitle>
                    <CardDescription>
                        Current validation system alerts and warnings
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <div className="flex items-center justify-center mb-4">
                            <div className="rounded-full bg-green-100 p-3">
                                <XCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <h3 className="text-lg font-medium text-green-600 mb-2">
                            All Systems Operational
                        </h3>
                        <p className="text-muted-foreground">
                            No alerts or warnings detected. All validation metrics are within normal ranges.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    System Alerts
                    <Badge variant="secondary">{alerts.length}</Badge>
                </CardTitle>
                <CardDescription>
                    Current validation system alerts and warnings
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {alerts.map((alert) => (
                    <Alert key={alert.id} variant={getAlertVariant(alert.type)}>
                        <div className="flex items-start gap-3">
                            {getAlertIcon(alert.type)}
                            <div className="flex-1">
                                <AlertTitle className="flex items-center gap-2">
                                    {alert.title}
                                    <Badge 
                                        variant={alert.type === 'error' ? 'destructive' : 'secondary'}
                                        className="text-xs"
                                    >
                                        {alert.type.toUpperCase()}
                                    </Badge>
                                </AlertTitle>
                                <AlertDescription className="mt-2">
                                    {alert.description}
                                </AlertDescription>
                                {alert.metric && (
                                    <div className="mt-3 flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">Current:</span>
                                            <Badge variant="outline">{alert.value}</Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground">Threshold:</span>
                                            <Badge variant="outline">{alert.threshold}</Badge>
                                        </div>
                                        {alert.templateId && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground">Template:</span>
                                                <Badge variant="outline">{alert.templateId}</Badge>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Alert>
                ))}
            </CardContent>
        </Card>
    );
}