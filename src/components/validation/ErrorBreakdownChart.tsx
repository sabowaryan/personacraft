/**
 * ErrorBreakdownChart - Displays error types breakdown in a pie chart
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ValidationErrorType } from '@/types/validation';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ErrorBreakdownChartProps {
    errorBreakdown: Record<ValidationErrorType, number>;
}

const ERROR_COLORS = {
    [ValidationErrorType.STRUCTURE_INVALID]: '#ef4444',
    [ValidationErrorType.REQUIRED_FIELD_MISSING]: '#f97316',
    [ValidationErrorType.TYPE_MISMATCH]: '#eab308',
    [ValidationErrorType.VALUE_OUT_OF_RANGE]: '#22c55e',
    [ValidationErrorType.FORMAT_INVALID]: '#3b82f6',
    [ValidationErrorType.CULTURAL_DATA_INCONSISTENT]: '#8b5cf6',
    [ValidationErrorType.BUSINESS_RULE_VIOLATION]: '#ec4899',
    [ValidationErrorType.TEMPLATE_NOT_FOUND]: '#6b7280',
    [ValidationErrorType.VALIDATION_TIMEOUT]: '#dc2626'
};

const ERROR_LABELS = {
    [ValidationErrorType.STRUCTURE_INVALID]: 'Structure Invalid',
    [ValidationErrorType.REQUIRED_FIELD_MISSING]: 'Missing Fields',
    [ValidationErrorType.TYPE_MISMATCH]: 'Type Mismatch',
    [ValidationErrorType.VALUE_OUT_OF_RANGE]: 'Value Out of Range',
    [ValidationErrorType.FORMAT_INVALID]: 'Format Invalid',
    [ValidationErrorType.CULTURAL_DATA_INCONSISTENT]: 'Cultural Data Issues',
    [ValidationErrorType.BUSINESS_RULE_VIOLATION]: 'Business Rule Violation',
    [ValidationErrorType.TEMPLATE_NOT_FOUND]: 'Template Not Found',
    [ValidationErrorType.VALIDATION_TIMEOUT]: 'Validation Timeout'
};

export function ErrorBreakdownChart({ errorBreakdown }: ErrorBreakdownChartProps) {
    // Transform data for the chart
    const chartData = Object.entries(errorBreakdown)
        .filter(([_, count]) => count > 0)
        .map(([errorType, count]) => ({
            name: ERROR_LABELS[errorType as ValidationErrorType] || errorType,
            value: count,
            color: ERROR_COLORS[errorType as ValidationErrorType] || '#6b7280'
        }));

    const totalErrors = chartData.reduce((sum, item) => sum + item.value, 0);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            const percentage = ((data.value / totalErrors) * 100).toFixed(1);
            return (
                <div className="bg-white p-3 border rounded-lg shadow-lg">
                    <p className="font-medium">{data.name}</p>
                    <p className="text-blue-600">
                        Count: {data.value}
                    </p>
                    <p className="text-gray-600">
                        Percentage: {percentage}%
                    </p>
                </div>
            );
        }
        return null;
    };

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        if (percent < 0.05) return null; // Don't show labels for slices < 5%
        
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text 
                x={x} 
                y={y} 
                fill="white" 
                textAnchor={x > cx ? 'start' : 'end'} 
                dominantBaseline="central"
                fontSize={12}
                fontWeight="bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    if (chartData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Error Breakdown</CardTitle>
                    <CardDescription>
                        Distribution of validation error types
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-80 flex items-center justify-center text-muted-foreground">
                        No errors recorded in this period
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Error Breakdown</CardTitle>
                <CardDescription>
                    Distribution of validation error types ({totalErrors} total errors)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomLabel}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend 
                                verticalAlign="bottom" 
                                height={36}
                                formatter={(value, entry) => (
                                    <span style={{ color: entry.color }}>{value}</span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}