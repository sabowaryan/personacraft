'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface RealTimeData {
    timestamp: number;
    recentValidations: number;
    currentSuccessRate: number;
    currentAverageTime: number;
    activeTemplates: number;
    recentErrors: number;
}

interface RealTimeMonitorProps {
    data: RealTimeData;
}

export function RealTimeMonitor({ data }: RealTimeMonitorProps) {
    const {
        timestamp,
        recentValidations,
        currentSuccessRate,
        currentAverageTime,
        activeTemplates,
        recentErrors
    } = data;

    const lastUpdated = new Date(timestamp).toLocaleTimeString();
    const successRatePercent = Math.round(currentSuccessRate * 100);
    const averageTimeMs = Math.round(currentAverageTime);

    // Determine status based on success rate and error count
    const getStatus = () => {
        if (currentSuccessRate >= 0.95 && recentErrors === 0) {
            return { label: 'Excellent', color: 'bg-green-500', icon: CheckCircle };
        } else if (currentSuccessRate >= 0.85) {
            return { label: 'Good', color: 'bg-blue-500', icon: TrendingUp };
        } else if (currentSuccessRate >= 0.70) {
            return { label: 'Warning', color: 'bg-yellow-500', icon: AlertTriangle };
        } else {
            return { label: 'Critical', color: 'bg-red-500', icon: TrendingDown };
        }
    };

    const status = getStatus();
    const StatusIcon = status.icon;

    return (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {/* System Status */}
            <div className="col-span-2 md:col-span-1">
                <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${status.color} animate-pulse`} />
                    <div>
                        <p className="text-sm font-medium">{status.label}</p>
                        <p className="text-xs text-muted-foreground">System Status</p>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <div>
                    <p className="text-sm font-medium">{recentValidations}</p>
                    <p className="text-xs text-muted-foreground">Recent (5min)</p>
                </div>
            </div>

            {/* Success Rate */}
            <div className="flex items-center space-x-2">
                <StatusIcon className={`h-4 w-4 ${
                    currentSuccessRate >= 0.85 ? 'text-green-500' : 
                    currentSuccessRate >= 0.70 ? 'text-yellow-500' : 'text-red-500'
                }`} />
                <div>
                    <p className="text-sm font-medium">{successRatePercent}%</p>
                    <p className="text-xs text-muted-foreground">Success Rate</p>
                </div>
            </div>

            {/* Average Time */}
            <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-purple-500" />
                <div>
                    <p className="text-sm font-medium">{averageTimeMs}ms</p>
                    <p className="text-xs text-muted-foreground">Avg Time</p>
                </div>
            </div>

            {/* Active Templates */}
            <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-indigo-500 rounded-sm" />
                <div>
                    <p className="text-sm font-medium">{activeTemplates}</p>
                    <p className="text-xs text-muted-foreground">Templates</p>
                </div>
            </div>

            {/* Recent Errors */}
            <div className="flex items-center space-x-2">
                <AlertTriangle className={`h-4 w-4 ${
                    recentErrors === 0 ? 'text-green-500' : 
                    recentErrors <= 2 ? 'text-yellow-500' : 'text-red-500'
                }`} />
                <div>
                    <p className="text-sm font-medium">{recentErrors}</p>
                    <p className="text-xs text-muted-foreground">Errors</p>
                </div>
            </div>

            {/* Last Updated */}
            <div className="col-span-2 md:col-span-6 flex justify-end">
                <p className="text-xs text-muted-foreground">
                    Last updated: {lastUpdated}
                </p>
            </div>
        </div>
    );
}