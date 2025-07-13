'use client';

import { ReactNode, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Star, 
  TrendingUp, 
  Award, 
  CheckCircle, 
  Clock,
  Zap,
  Target,
  Heart,
  Users,
  Brain,
  Shield,
  Activity,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  Info,
  AlertCircle,
  Lightbulb,
  Gauge,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Composant de stat moderne avec animations
interface ModernStatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function ModernStatCard({
  title,
  value,
  description,
  icon,
  trend,
  trendValue,
  color = 'primary',
  className
}: ModernStatCardProps) {
  const colorClasses = {
    primary: 'from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 text-primary-700 dark:text-primary-300',
    secondary: 'from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20 text-secondary-700 dark:text-secondary-300',
    success: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 text-green-700 dark:text-green-300',
    warning: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 text-yellow-700 dark:text-yellow-300',
    danger: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 text-red-700 dark:text-red-300'
  };

  const iconColorClasses = {
    primary: 'text-primary-600 dark:text-primary-400',
    secondary: 'text-secondary-600 dark:text-secondary-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    danger: 'text-red-600 dark:text-red-400'
  };

  return (
    <Card className={cn(
      "hover-lift transition-all duration-300 border-0 shadow-lg",
      `bg-gradient-to-br ${colorClasses[color]}`,
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {icon && (
                <div className={cn(
                  "p-2 bg-white/80 dark:bg-gray-800/80 rounded-lg",
                  iconColorClasses[color]
                )}>
                  {icon}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {title}
                </p>
                {description && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {description}
                  </p>
                )}
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {value}
            </div>
            {trend && trendValue && (
              <div className="flex items-center gap-1">
                <TrendingUp className={cn(
                  "h-4 w-4",
                  trend === 'up' ? 'text-green-600' : 
                  trend === 'down' ? 'text-red-600' : 'text-gray-600'
                )} />
                <span className={cn(
                  "text-sm font-medium",
                  trend === 'up' ? 'text-green-600' : 
                  trend === 'down' ? 'text-red-600' : 'text-gray-600'
                )}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Composant de progression avec animation
interface AnimatedProgressProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AnimatedProgress({
  value,
  max = 100,
  label,
  showPercentage = true,
  color = 'primary',
  size = 'md',
  className
}: AnimatedProgressProps) {
  const percentage = Math.round((value / max) * 100);
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const colorClasses = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
  };

  return (
    <div className={cn("space-y-2", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div className={cn(
        "w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden",
        sizeClasses[size]
      )}>
        <div
          className={cn(
            "h-full transition-all duration-1000 ease-out rounded-full",
            colorClasses[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Badge moderne avec icône et animation
interface ModernBadgeProps {
  children: ReactNode;
  icon?: ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
}

export function ModernBadge({
  children,
  icon,
  variant = 'default',
  size = 'md',
  pulse = false,
  className
}: ModernBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  // Mapper les variantes personnalisées vers les variantes supportées
  const mapVariant = (v: string) => {
    switch (v) {
      case 'success': return 'default';
      case 'warning': return 'secondary';
      case 'danger': return 'destructive';
      default: return v as 'default' | 'destructive' | 'outline' | 'secondary';
    }
  };

  return (
    <Badge 
      variant={mapVariant(variant)} 
      className={cn(
        "flex items-center gap-1.5 transition-all duration-300 hover-scale",
        sizeClasses[size],
        pulse && "animate-pulse",
        // Ajouter des classes de couleur personnalisées
        variant === 'success' && "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
        variant === 'warning' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
        className
      )}
    >
      {icon}
      {children}
    </Badge>
  );
}

// Carte de fonctionnalité moderne
interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: string;
  className?: string;
}

export function FeatureCard({
  title,
  description,
  icon,
  href,
  onClick,
  badge,
  className
}: FeatureCardProps) {
  const isClickable = href || onClick;
  
  const handleClick = () => {
    if (onClick) onClick();
    if (href) window.open(href, '_blank');
  };

  return (
    <Card className={cn(
      "group transition-all duration-300 hover-lift border-0 shadow-lg glass-card",
      isClickable && "cursor-pointer",
      className
    )} onClick={handleClick}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/50 dark:to-secondary-900/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {title}
              </CardTitle>
              {badge && (
                <ModernBadge variant="secondary" size="sm" className="mt-1">
                  {badge}
                </ModernBadge>
              )}
            </div>
          </div>
          {isClickable && (
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-all duration-300 group-hover:translate-x-1" />
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {description}
        </p>
        {isClickable && (
          <div className="flex items-center gap-2 mt-4 text-primary-600 dark:text-primary-400 text-sm font-medium">
            <span>En savoir plus</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Composant de notification moderne
interface ModernNotificationProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
  className?: string;
}

export function ModernNotification({
  type,
  title,
  message,
  action,
  onClose,
  className
}: ModernNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const typeConfig = {
    info: {
      icon: <Info className="h-5 w-5" />,
      bgColor: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      textColor: 'text-blue-700 dark:text-blue-300',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    success: {
      icon: <CheckCircle className="h-5 w-5" />,
      bgColor: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
      textColor: 'text-green-700 dark:text-green-300',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    warning: {
      icon: <AlertCircle className="h-5 w-5" />,
      bgColor: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      iconColor: 'text-yellow-600 dark:text-yellow-400'
    },
    error: {
      icon: <AlertCircle className="h-5 w-5" />,
      bgColor: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
      textColor: 'text-red-700 dark:text-red-300',
      iconColor: 'text-red-600 dark:text-red-400'
    }
  };

  const config = typeConfig[type];

  if (!isVisible) return null;

  return (
    <Card className={cn(
      "border-0 shadow-lg transition-all duration-300 animate-in slide-in-from-top-4",
      `bg-gradient-to-r ${config.bgColor}`,
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("p-1 rounded-full", config.iconColor)}>
            {config.icon}
          </div>
          <div className="flex-1">
            <h4 className={cn("font-semibold mb-1", config.textColor)}>
              {title}
            </h4>
            <p className={cn("text-sm", config.textColor)}>
              {message}
            </p>
            {action && (
              <Button
                variant="ghost"
                size="sm"
                onClick={action.onClick}
                className={cn("mt-2 p-0 h-auto font-medium", config.textColor)}
              >
                {action.label}
              </Button>
            )}
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className={cn("p-1 h-auto", config.textColor)}
            >
              ×
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Composant de loading moderne
interface ModernLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function ModernLoading({
  size = 'md',
  text,
  className
}: ModernLoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn("flex items-center justify-center gap-3", className)}>
      <div className={cn(
        "border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin",
        sizeClasses[size]
      )} />
      {text && (
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {text}
        </span>
      )}
    </div>
  );
}

// Composant de score avec animation circulaire
interface CircularScoreProps {
  score: number;
  maxScore?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function CircularScore({
  score,
  maxScore = 100,
  label,
  size = 'md',
  color = 'primary',
  className
}: CircularScoreProps) {
  const percentage = Math.round((score / maxScore) * 100);
  const circumference = 2 * Math.PI * 16;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const colorClasses = {
    primary: 'stroke-primary-500',
    secondary: 'stroke-secondary-500',
    success: 'stroke-green-500',
    warning: 'stroke-yellow-500',
    danger: 'stroke-red-500'
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            strokeWidth="2"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={cn("transition-all duration-1000 ease-out", colorClasses[color])}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold text-gray-900 dark:text-white", textSizeClasses[size])}>
            {percentage}%
          </span>
        </div>
      </div>
      {label && (
        <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
          {label}
        </span>
      )}
    </div>
  );
} 