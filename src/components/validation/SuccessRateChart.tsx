/**
 * SuccessRateChart - Displays success rates by template in a bar chart
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ValidationMetricsAggregated } from '@/types/validation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SuccessRateChartProps {
    templateMetrics: Record<string, ValidationMetricsAggregated>;
    period: string;
}

export function SuccessRateChart({ templateMetrics, period }: SuccessRateChartProps) {
    // Transform data for the chart
    const chartData = Object.entries(templateMetrics).map(([templateId, metrics]) => ({
        template: templateId.replace('-template', '').replace('-', ' '),
        successRate: Math.round(metrics.successRate * 100),
        totalValidations: metrics.totalValidations,
        fallbackRate: Math.round(metrics.fallbackUsageRate * 100)
    }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border rounded-lg shadow-lg">
                    <p className="font-medium">{label}</p>
                    <p className="text-green-600">
                        Success Rate: {data.successRate}%
                    </p>
                    <p className="text-blue-600">
                        Total Validations: {data.totalValidations}
                    </p>
                    <p className="text-orange-600">
                        Fallback Rate: {data.fallbackRate}%
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Success Rate by Template</CardTitle>
                <CardDescription>
                    Validation success rates for the {period} period
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                                label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar 
                                dataKey="successRate" 
                                fill="#22c55e" 
                                name="Success Rate"
                                radius={[4, 4, 0, 0]}
                            />
                            <Bar 
                                dataKey="fallbackRate" 
                                fill="#f97316" 
                                name="Fallback Rate"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}