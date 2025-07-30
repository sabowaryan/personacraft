'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle } from 'lucide-react';

import { OverviewMetrics } from './OverviewMetrics';
import { TemplatePerformanceChart } from './TemplatePerformanceChart';
import { ErrorTrendsChart } from './ErrorTrendsChart';
import { SuccessRatesChart } from './SuccessRatesChart';
import { PerformanceMetricsChart } from './PerformanceMetricsChart';
import { RealTimeMonitor } from './RealTimeMonitor';

interface DashboardData {
    overview?: any;
    templatePerformance?: any;
    errorTrends?: any;
    successRates?: any;
    performanceMetrics?: any;
    realTime?: any;
}

interface ValidationDashboardProps {
    className?: string;
}

export function ValidationDashboard({ className }: ValidationDashboardProps) {
    const [data, setData] = useState<DashboardData>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState('24h');
    const [selectedTemplate, setSelectedTemplate] = useState<string>('all');
    const [activeTab, setActiveTab] = useState('overview');

    // Fetch dashboard data
    const fetchData = async (endpoint: string, params: Record<string, string> = {}) => {
        try {
            const searchParams = new URLSearchParams({
                endpoint,
                period,
                ...params
            });

            const response = await fetch(`/api/validation/dashboard?${searchParams}`);
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch data');
            }

            return result.data;
        } catch (err) {
            console.error(`Error fetching ${endpoint} data:`, err);
            throw err;
        }
    };

    // Load all dashboard data
    const loadDashboardData = async () => {
        setLoading(true);
        setError(null);

        try {
            const [
                overview,
                templatePerformance,
                errorTrends,
                successRates,
                performanceMetrics,
                realTime
            ] = await Promise.all([
                fetchData('overview'),
                fetchData('template-performance'),
                fetchData('error-trends', selectedTemplate !== 'all' ? { templateId: selectedTemplate } : {}),
                fetchData('success-rates'),
                fetchData('performance-metrics', selectedTemplate !== 'all' ? { templateId: selectedTemplate } : {}),
                fetchData('real-time')
            ]);

            setData({
                overview,
                templatePerformance,
                errorTrends,
                successRates,
                performanceMetrics,
                realTime
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    // Load data on mount and when period/template changes
    useEffect(() => {
        loadDashboardData();
    }, [period, selectedTemplate]);

    // Auto-refresh real-time data
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const realTimeData = await fetchData('real-time');
                setData(prev => ({ ...prev, realTime: realTimeData }));
            } catch (err) {
                console.error('Error refreshing real-time data:', err);
            }
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className={`flex items-center justify-center h-64 ${className}`}>
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading dashboard...</span>
            </div>
        );
    }

    if (error) {
        return (
            <Alert className={`${className}`}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    Error loading dashboard: {error}
                    <button
                        onClick={loadDashboardData}
                        className="ml-2 underline hover:no-underline"
                    >
                        Retry
                    </button>
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Validation Dashboard</h1>
                    <p className="text-muted-foreground">
                        Monitor LLM response validation performance and metrics
                    </p>
                </div>

                <div className="flex gap-2">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1h">Last Hour</SelectItem>
                            <SelectItem value="24h">Last 24h</SelectItem>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                        <SelectTrigger className="w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Templates</SelectItem>
                            <SelectItem value="standard-persona-v1">Standard Persona</SelectItem>
                            <SelectItem value="b2b-persona-v1">B2B Persona</SelectItem>
                            <SelectItem value="simple-persona-v1">Simple Persona</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Real-time Status */}
            {data.realTime && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Real-time Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RealTimeMonitor data={data.realTime} />
                    </CardContent>
                </Card>
            )}

            {/* Main Dashboard Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="errors">Error Trends</TabsTrigger>
                    <TabsTrigger value="success">Success Rates</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {data.overview && <OverviewMetrics data={data.overview} />}
                </TabsContent>

                <TabsContent value="templates" className="space-y-6">
                    {data.templatePerformance && (
                        <TemplatePerformanceChart data={data.templatePerformance} />
                    )}
                </TabsContent>

                <TabsContent value="errors" className="space-y-6">
                    {data.errorTrends && (
                        <ErrorTrendsChart
                            data={data.errorTrends}
                            templateId={selectedTemplate}
                        />
                    )}
                </TabsContent>

                <TabsContent value="success" className="space-y-6">
                    {data.successRates && (
                        <SuccessRatesChart data={data.successRates} />
                    )}
                </TabsContent>

                <TabsContent value="performance" className="space-y-6">
                    {data.performanceMetrics && (
                        <PerformanceMetricsChart
                            data={data.performanceMetrics}
                            templateId={selectedTemplate}
                        />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}