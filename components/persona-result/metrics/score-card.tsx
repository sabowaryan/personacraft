'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from '../ui/animated-card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const scoreCardVariants = cva(
  'relative overflow-hidden',
  {
    variants: {
      variant: {
        success: 'border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950',
        warning: 'border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950',
        danger: 'border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950',
        default: 'border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900 dark:to-slate-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface TrendData {
  value: number;
  direction: 'up' | 'down' | 'stable';
}

interface ScoreCardProps extends VariantProps<typeof scoreCardVariants> {
  title: string;
  description?: string;
  score: number;
  maxScore?: number;
  trend?: TrendData;
  icon?: React.ReactNode;
  compact?: boolean;
  animated?: boolean;
  tooltip?: React.ReactNode;
  className?: string;
}

export function ScoreCard({
  title,
  description,
  score,
  maxScore = 100,
  trend,
  icon,
  variant = 'default',
  compact = false,
  animated = true,
  tooltip,
  className,
}: ScoreCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [animatedScore, setAnimatedScore] = React.useState(0);
  
  // Animate score on mount
  React.useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedScore(score);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedScore(score);
    }
  }, [score, animated]);

  const getScoreColor = () => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getProgressColor = () => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';
    
    switch (trend.direction) {
      case 'up':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'down':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  if (compact) {
    return (
      <div className="relative group">
        <AnimatedCard
          variant="elevated"
          size="sm"
          animation="hover"
          className={cn(scoreCardVariants({ variant }), className)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <AnimatedCardContent className="text-center">
            <div className="flex items-center justify-between mb-2">
              {icon && (
                <div className={cn('flex-shrink-0', getScoreColor())}>
                  {icon}
                </div>
              )}
              {trend && (
                <Badge variant="secondary" className={cn('text-xs', getTrendColor())}>
                  {getTrendIcon()}
                  {trend.value > 0 ? '+' : ''}{trend.value}%
                </Badge>
              )}
            </div>
            
            <div className={cn('text-2xl font-bold mb-1', getScoreColor())}>
              {animated ? (
                <span className="tabular-nums">
                  {Math.round(animatedScore)}%
                </span>
              ) : (
                `${score}%`
              )}
            </div>
            
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              {title}
            </div>
            
            <Progress 
              value={animatedScore} 
              className="h-1 mt-2"
              style={{
                '--progress-background': getProgressColor(),
              } as React.CSSProperties}
            />
          </AnimatedCardContent>
        </AnimatedCard>
        
        {tooltip && isHovered && (
          <div className="absolute z-50 top-full left-1/2 transform -translate-x-1/2 mt-2">
            {tooltip}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative group">
      <AnimatedCard
        variant="elevated"
        animation="hover"
        className={cn(scoreCardVariants({ variant }), className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatedCardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon && (
                <div className={cn('flex-shrink-0', getScoreColor())}>
                  {icon}
                </div>
              )}
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
            
            {trend && (
              <Badge variant="secondary" className={cn('text-xs', getTrendColor())}>
                {getTrendIcon()}
                <span className="ml-1">
                  {trend.value > 0 ? '+' : ''}{trend.value}%
                </span>
              </Badge>
            )}
          </div>
        </AnimatedCardHeader>
        
        <AnimatedCardContent>
          <div className="flex items-end justify-between mb-4">
            <div className={cn('text-4xl font-bold tabular-nums', getScoreColor())}>
              {animated ? (
                <span>
                  {Math.round(animatedScore)}
                </span>
              ) : (
                score
              )}
              <span className="text-lg text-gray-500 dark:text-gray-400 ml-1">
                /{maxScore}
              </span>
            </div>
            
            <div className="text-right">
              <div className={cn('text-sm font-medium', getScoreColor())}>
                {score >= 90 ? 'Excellent' : score >= 70 ? 'Bon' : 'À améliorer'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {Math.round((score / maxScore) * 100)}% du maximum
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progression</span>
              <span className={cn('font-medium', getScoreColor())}>
                {Math.round((score / maxScore) * 100)}%
              </span>
            </div>
            
            <Progress 
              value={animatedScore} 
              max={maxScore}
              className="h-2"
              style={{
                '--progress-background': getProgressColor(),
              } as React.CSSProperties}
            />
          </div>
        </AnimatedCardContent>
        
        {/* Glow effect on hover */}
        {isHovered && (
          <div className={cn(
            'absolute inset-0 rounded-xl opacity-20 blur-xl transition-opacity duration-300',
            variant === 'success' && 'bg-green-400',
            variant === 'warning' && 'bg-yellow-400',
            variant === 'danger' && 'bg-red-400',
            variant === 'default' && 'bg-blue-400'
          )} />
        )}
      </AnimatedCard>
      
      {tooltip && isHovered && (
        <div className="absolute z-50 top-full left-1/2 transform -translate-x-1/2 mt-2">
          {tooltip}
        </div>
      )}
    </div>
  );
}