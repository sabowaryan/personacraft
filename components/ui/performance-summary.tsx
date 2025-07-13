'use client';

import { Clock, Zap, TrendingUp, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerformanceSummaryProps {
  totalTime?: number;
  geminiTime?: number;
  qlooTime?: number;
  successRate?: number;
  className?: string;
}

export function PerformanceSummary({
  totalTime = 0,
  geminiTime = 0,
  qlooTime = 0,
  successRate = 100,
  className
}: PerformanceSummaryProps) {
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getPerformanceColor = (time: number) => {
    if (time < 2000) return 'text-green-600 dark:text-green-400';
    if (time < 5000) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4",
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Activity className="h-4 w-4 text-gray-500" />
          Performance
        </h4>
        <div className="flex items-center gap-1">
          <div className={cn(
            "w-2 h-2 rounded-full",
            successRate >= 95 ? "bg-green-500" : 
            successRate >= 80 ? "bg-yellow-500" : "bg-red-500"
          )}></div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {successRate}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className={cn("text-lg font-bold", getPerformanceColor(totalTime))}>
            {formatTime(totalTime)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
            <Clock className="h-3 w-3" />
            Total
          </div>
        </div>

        <div className="text-center">
          <div className={cn("text-lg font-bold", getPerformanceColor(geminiTime))}>
            {formatTime(geminiTime)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
            <Zap className="h-3 w-3" />
            Gemini
          </div>
        </div>

        <div className="text-center">
          <div className={cn("text-lg font-bold", getPerformanceColor(qlooTime))}>
            {formatTime(qlooTime)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Qloo
          </div>
        </div>
      </div>
    </div>
  );
} 