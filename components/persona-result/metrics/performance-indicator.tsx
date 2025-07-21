'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from '../ui/animated-card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, BarChart3, Activity } from 'lucide-react';

interface TrendData {
  value: number;
  direction: 'up' | 'down' | 'stable';
}

interface PerformanceDataPoint {
  label: string;
  value: number;
  trend?: TrendData;
  target?: number;
}

interface PerformanceIndicatorProps {
  title: string;
  description?: string;
  data: PerformanceDataPoint[];
  type?: 'percentage' | 'count' | 'score';
  showTrends?: boolean;
  showTargets?: boolean;
  animated?: boolean;
  className?: string;
}

export function PerformanceIndicator({
  title,
  description,
  data,
  type = 'percentage',
  showTrends = true,
  showTargets = false,
  animated = true,
  className,
}: PerformanceIndicatorProps) {
  const [animatedValues, setAnimatedValues] = React.useState<number[]>(
    new Array(data.length).fill(0)
  );

  // Animate values on mount
  React.useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedValues(data.map(item => item.value));
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setAnimatedValues(data.map(item => item.value));
    }
  }, [data, animated]);

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  const getTrendColor = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'down':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  const getValueColor = (value: number, target?: number) => {
    if (type === 'percentage') {
      if (value >= 90) return 'text-green-600 dark:text-green-400';
      if (value >= 70) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-red-600 dark:text-red-400';
    }
    
    if (target && type === 'score') {
      const percentage = (value / target) * 100;
      if (percentage >= 90) return 'text-green-600 dark:text-green-400';
      if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
      return 'text-red-600 dark:text-red-400';
    }
    
    return 'text-blue-600 dark:text-blue-400';
  };

  const getProgressColor = (value: number, target?: number) => {
    if (type === 'percentage') {
      if (value >= 90) return 'bg-green-500';
      if (value >= 70) return 'bg-yellow-500';
      return 'bg-red-500';
    }
    
    if (target && type === 'score') {
      const percentage = (value / target) * 100;
      if (percentage >= 90) return 'bg-green-500';
      if (percentage >= 70) return 'bg-yellow-500';
      return 'bg-red-500';
    }
    
    return 'bg-blue-500';
  };

  const formatValue = (value: number) => {
    switch (type) {
      case 'percentage':
        return `${Math.round(value)}%`;
      case 'count':
        return value.toString();
      case 'score':
        return Math.round(value).toString();
      default:
        return value.toString();
    }
  };

  const getMaxValue = () => {
    if (type === 'percentage') return 100;
    if (type === 'count') return Math.max(...data.map(item => item.value)) * 1.2;
    return Math.max(...data.map(item => item.target || item.value)) * 1.1;
  };

  const maxValue = getMaxValue();

  return (
    <AnimatedCard variant="elevated" animation="hover" className={cn('', className)}>
      <AnimatedCardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-persona-primary/10">
            {type === 'count' ? (
              <BarChart3 className="h-4 w-4 text-persona-primary" />
            ) : (
              <Activity className="h-4 w-4 text-persona-primary" />
            )}
          </div>
          <div>
            <AnimatedCardTitle className="text-base font-semibold">
              {title}
            </AnimatedCardTitle>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
      </AnimatedCardHeader>
      
      <AnimatedCardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {item.label}
                  </span>
                  {showTrends && item.trend && (
                    <Badge variant="secondary" className={cn('text-xs', getTrendColor(item.trend.direction))}>
                      {getTrendIcon(item.trend.direction)}
                      <span className="ml-1">
                        {item.trend.value > 0 ? '+' : ''}{item.trend.value}
                        {type === 'percentage' ? '%' : ''}
                      </span>
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={cn('text-lg font-bold tabular-nums', getValueColor(item.value, item.target))}>
                    {formatValue(animatedValues[index] || 0)}
                  </span>
                  {showTargets && item.target && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      / {formatValue(item.target)}
                    </span>
                  )}
                </div>
              </div>
              
              {type !== 'count' && (
                <div className="relative">
                  <Progress 
                    value={animatedValues[index] || 0}
                    max={item.target || maxValue}
                    className="h-2"
                    style={{
                      '--progress-background': getProgressColor(item.value, item.target),
                    } as React.CSSProperties}
                  />
                  
                  {showTargets && item.target && type === 'score' && (
                    <div 
                      className="absolute top-0 h-2 w-0.5 bg-gray-400 dark:bg-gray-600"
                      style={{ left: `${(item.target / maxValue) * 100}%` }}
                    />
                  )}
                </div>
              )}
              
              {type === 'count' && (
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(item.value, 10))].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-2 w-2 rounded-full transition-all duration-300',
                        i < (animatedValues[index] || 0) 
                          ? 'bg-persona-primary' 
                          : 'bg-gray-200 dark:bg-gray-700'
                      )}
                      style={{
                        animationDelay: `${i * 50}ms`,
                      }}
                    />
                  ))}
                  {item.value > 10 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      +{item.value - 10} autres
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Summary Stats */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-persona-primary">
                {type === 'percentage' 
                  ? `${Math.round(data.reduce((acc, item) => acc + item.value, 0) / data.length)}%`
                  : data.reduce((acc, item) => acc + item.value, 0)
                }
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {type === 'percentage' ? 'Moyenne' : 'Total'}
              </div>
            </div>
            
            <div>
              <div className="text-lg font-bold text-persona-secondary">
                {data.filter(item => item.trend?.direction === 'up').length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                En progression
              </div>
            </div>
          </div>
        </div>
      </AnimatedCardContent>
    </AnimatedCard>
  );
}