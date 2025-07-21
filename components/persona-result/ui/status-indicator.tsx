'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  Clock, 
  Loader2,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  type LucideIcon
} from 'lucide-react';

const statusIndicatorVariants = cva(
  'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200',
  {
    variants: {
      variant: {
        success: 'bg-quality-excellent/10 text-quality-excellent border border-quality-excellent/20',
        error: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
        warning: 'bg-quality-good/10 text-quality-good border border-quality-good/20',
        info: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
        pending: 'bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
        loading: 'bg-persona-primary/10 text-persona-primary border border-persona-primary/20',
        excellent: 'bg-quality-excellent/10 text-quality-excellent border border-quality-excellent/20',
        good: 'bg-quality-good/10 text-quality-good border border-quality-good/20',
        average: 'bg-quality-average/10 text-quality-average border border-quality-average/20',
        poor: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-3 py-1 text-xs',
        lg: 'px-4 py-2 text-sm',
      },
      animation: {
        none: '',
        pulse: 'animate-pulse',
        bounce: 'animate-bounce',
        spin: '',
        glow: 'animate-[glow_2s_ease-in-out_infinite_alternate]',
      },
    },
    defaultVariants: {
      variant: 'info',
      size: 'default',
      animation: 'none',
    },
  }
);

const iconMap: Record<string, LucideIcon> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
  pending: Clock,
  loading: Loader2,
  excellent: CheckCircle,
  good: TrendingUp,
  average: Minus,
  poor: TrendingDown,
};

export interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusIndicatorVariants> {
  icon?: LucideIcon | React.ReactNode;
  showIcon?: boolean;
  pulse?: boolean;
  trend?: 'up' | 'down' | 'stable';
  value?: string | number;
  label?: string;
}

const StatusIndicator = React.forwardRef<HTMLDivElement, StatusIndicatorProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation, 
    icon, 
    showIcon = true, 
    pulse = false,
    trend,
    value,
    label,
    children,
    ...props 
  }, ref) => {
    const IconComponent = React.useMemo(() => {
      if (icon) {
        return typeof icon === 'function' ? icon : () => icon;
      }
      return variant ? iconMap[variant] : Info;
    }, [icon, variant]);

    const shouldAnimate = animation === 'spin' || (variant === 'loading' && animation !== 'none');
    const finalAnimation = shouldAnimate ? 'spin' : animation;

    return (
      <div
        ref={ref}
        className={cn(
          statusIndicatorVariants({ variant, size, animation: finalAnimation }),
          {
            'animate-pulse': pulse,
          },
          className
        )}
        {...props}
      >
        {showIcon && IconComponent && (
          <IconComponent 
            className={cn(
              'h-3.5 w-3.5 flex-shrink-0',
              {
                'animate-spin': shouldAnimate,
              }
            )} 
          />
        )}
        
        {trend && (
          <span className="flex items-center">
            {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
            {trend === 'stable' && <Minus className="h-3 w-3 text-gray-500" />}
          </span>
        )}
        
        <span className="flex items-center gap-1">
          {value && (
            <span className="font-semibold">{value}</span>
          )}
          {label && (
            <span>{label}</span>
          )}
          {children}
        </span>
      </div>
    );
  }
);

StatusIndicator.displayName = 'StatusIndicator';

// Pre-built status indicators for common use cases
const QualityIndicator = React.forwardRef<
  HTMLDivElement,
  Omit<StatusIndicatorProps, 'variant'> & {
    score: number;
    showScore?: boolean;
  }
>(({ score, showScore = true, ...props }, ref) => {
  const getVariant = (score: number) => {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'average';
    return 'poor';
  };

  const getLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Bon';
    if (score >= 60) return 'Moyen';
    return 'Faible';
  };

  return (
    <StatusIndicator
      ref={ref}
      variant={getVariant(score)}
      value={showScore ? `${score}%` : undefined}
      label={getLabel(score)}
      {...props}
    />
  );
});
QualityIndicator.displayName = 'QualityIndicator';

const LoadingIndicator = React.forwardRef<
  HTMLDivElement,
  Omit<StatusIndicatorProps, 'variant' | 'animation'> & {
    message?: string;
  }
>(({ message = 'Chargement...', ...props }, ref) => (
  <StatusIndicator
    ref={ref}
    variant="loading"
    animation="spin"
    label={message}
    {...props}
  />
));
LoadingIndicator.displayName = 'LoadingIndicator';

const SuccessIndicator = React.forwardRef<
  HTMLDivElement,
  Omit<StatusIndicatorProps, 'variant'>
>(({ children = 'Terminé', ...props }, ref) => (
  <StatusIndicator
    ref={ref}
    variant="success"
    {...props}
  >
    {children}
  </StatusIndicator>
));
SuccessIndicator.displayName = 'SuccessIndicator';

const ErrorIndicator = React.forwardRef<
  HTMLDivElement,
  Omit<StatusIndicatorProps, 'variant'>
>(({ children = 'Erreur', ...props }, ref) => (
  <StatusIndicator
    ref={ref}
    variant="error"
    {...props}
  >
    {children}
  </StatusIndicator>
));
ErrorIndicator.displayName = 'ErrorIndicator';

const TrendIndicator = React.forwardRef<
  HTMLDivElement,
  Omit<StatusIndicatorProps, 'variant'> & {
    trend: 'up' | 'down' | 'stable';
    value?: string | number;
    change?: string | number;
  }
>(({ trend, value, change, ...props }, ref) => {
  const getVariant = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'success';
      case 'down': return 'error';
      case 'stable': return 'info';
    }
  };

  return (
    <StatusIndicator
      ref={ref}
      variant={getVariant(trend)}
      trend={trend}
      value={value}
      {...props}
    >
      {change && (
        <span className="text-xs opacity-75">
          ({change})
        </span>
      )}
    </StatusIndicator>
  );
});
TrendIndicator.displayName = 'TrendIndicator';

// Status indicator group for multiple statuses
const StatusIndicatorGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: 'horizontal' | 'vertical';
    spacing?: 'sm' | 'md' | 'lg';
  }
>(({ className, orientation = 'horizontal', spacing = 'md', ...props }, ref) => {
  const spacingClasses = {
    sm: orientation === 'horizontal' ? 'space-x-1' : 'space-y-1',
    md: orientation === 'horizontal' ? 'space-x-2' : 'space-y-2',
    lg: orientation === 'horizontal' ? 'space-x-3' : 'space-y-3',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'flex',
        {
          'flex-row items-center': orientation === 'horizontal',
          'flex-col items-start': orientation === 'vertical',
        },
        spacingClasses[spacing],
        className
      )}
      {...props}
    />
  );
});
StatusIndicatorGroup.displayName = 'StatusIndicatorGroup';

export {
  StatusIndicator,
  QualityIndicator,
  LoadingIndicator,
  SuccessIndicator,
  ErrorIndicator,
  TrendIndicator,
  StatusIndicatorGroup,
  statusIndicatorVariants,
};