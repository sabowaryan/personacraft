/**
 * PerformanceChart - Displays validation performance metrics over time
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ValidationMetricsAggregated } from '@/types/validation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';

interface PerformanceChartProps {
    templateMetrics: Record<string, ValidationMetricsAggregated>;
    period: string;
}

export function PerformanceChart({ templateMetrics, period }: PerformanceChartProps) {
    // Transform data for the chart
    const chartData = Object.entries(templateMetrics).map(([templateId, metrics]) => ({
        template: templateId.replace('-template', '').replace('-', ' '),
        avgValidationTime: Math.round(metrics.averageValidationTime),
        avgScore: Math.round(metrics.averageScore * 100),
        totalValidations: metrics.totalValidations
    }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border rounded-lg shadow-lg">
                    <p className="font-medium">{label}</p>
                    <p className="text-blue-600">
                        Avg Validation Time: {data.avgValidationTime}ms
                    </p>
                    <p className="text-green-600">
                        Avg Score: {data.avgScore}%
                    </p>
                    <p className="text-gray-600">
                        Total Validations: {data.totalValidations}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Validation Time Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Validation Performance</CardTitle>
                    <CardDescription>
                        Average validation time by template ({period})
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="template" 
                                    tick={{ fontSize: 12 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis 
                                    tick={{ fontSize: 12 }}
                                    label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft' }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area 
                                    type="monotone" 
                                    dataKey="avgValidationTime" 
                                    stroke="#3b82f6" 
                                    fill="#3b82f6" 
                                    fillOpacity={0.3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Score Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Validation Quality</CardTitle>
                    <CardDescription>
                        Average validation scores by template ({period})
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="template" 
                                    tick={{ fontSize: 12 }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                />
                                <YAxis 
                                    domain={[0, 100]}
                                    tick={{ fontSize: 12 }}
                                    label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="avgScore" 
                                    stroke="#22c55e" 
                                    strokeWidth={3}
                                    dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                                    name="Average Score"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}