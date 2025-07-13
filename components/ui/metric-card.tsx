'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
  color: 'green' | 'blue' | 'purple' | 'amber' | 'red';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showProgress?: boolean;
  maxValue?: number;
}

const colorClasses = {
  green: {
    background: 'from-green-50/80 to-green-100/80 dark:from-green-900/20 dark:to-green-800/20',
    iconBg: 'bg-green-100 dark:bg-green-900/50',
    iconColor: 'text-green-600 dark:text-green-400',
    textColor: 'text-green-600 dark:text-green-400',
    progressColor: 'bg-green-500 dark:bg-green-400'
  },
  blue: {
    background: 'from-blue-50/80 to-blue-100/80 dark:from-blue-900/20 dark:to-blue-800/20',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    textColor: 'text-blue-600 dark:text-blue-400',
    progressColor: 'bg-blue-500 dark:bg-blue-400'
  },
  purple: {
    background: 'from-purple-50/80 to-purple-100/80 dark:from-purple-900/20 dark:to-purple-800/20',
    iconBg: 'bg-purple-100 dark:bg-purple-900/50',
    iconColor: 'text-purple-600 dark:text-purple-400',
    textColor: 'text-purple-600 dark:text-purple-400',
    progressColor: 'bg-purple-500 dark:bg-purple-400'
  },
  amber: {
    background: 'from-amber-50/80 to-amber-100/80 dark:from-amber-900/20 dark:to-amber-800/20',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
    textColor: 'text-amber-600 dark:text-amber-400',
    progressColor: 'bg-amber-500 dark:bg-amber-400'
  },
  red: {
    background: 'from-red-50/80 to-red-100/80 dark:from-red-900/20 dark:to-red-800/20',
    iconBg: 'bg-red-100 dark:bg-red-900/50',
    iconColor: 'text-red-600 dark:text-red-400',
    textColor: 'text-red-600 dark:text-red-400',
    progressColor: 'bg-red-500 dark:bg-red-400'
  }
};

const sizeClasses = {
  sm: {
    container: 'p-3',
    icon: 'w-8 h-8',
    iconSize: 'h-4 w-4',
    value: 'text-xl',
    label: 'text-xs',
    description: 'text-xs'
  },
  md: {
    container: 'p-3 sm:p-4 lg:p-6',
    icon: 'w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16',
    iconSize: 'h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8',
    value: 'text-2xl sm:text-3xl lg:text-4xl',
    label: 'text-xs sm:text-sm',
    description: 'text-xs'
  },
  lg: {
    container: 'p-4 sm:p-6 lg:p-8',
    icon: 'w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20',
    iconSize: 'h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10',
    value: 'text-3xl sm:text-4xl lg:text-5xl',
    label: 'text-sm sm:text-base',
    description: 'text-sm'
  }
};

export function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  color,
  size = 'md',
  className,
  showProgress = false,
  maxValue = 100
}: MetricCardProps) {
  const colors = colorClasses[color];
  const sizes = sizeClasses[size];
  const progressPercentage = showProgress ? Math.max(Math.min((value / maxValue) * 100, 100), 5) : 0;

  return (
    <div className={cn(
      "text-center rounded-xl hover-scale interactive transition-all duration-300",
      `bg-gradient-to-br ${colors.background}`,
      sizes.container,
      className
    )}>
      {/* Icône */}
      <div className={cn(
        "inline-flex items-center justify-center rounded-xl mb-2 sm:mb-3 lg:mb-4",
        colors.iconBg,
        sizes.icon
      )}>
        <Icon className={cn(colors.iconColor, sizes.iconSize)} />
      </div>

      {/* Valeur */}
      <div className={cn(
        "font-bold mb-1 sm:mb-2",
        colors.textColor,
        sizes.value
      )}>
        {typeof value === 'number' ? `${Math.round(value)}%` : value}
      </div>

      {/* Label */}
      <p className={cn(
        "text-gray-600 dark:text-gray-400 font-medium",
        sizes.label
      )}>
        {label}
      </p>

      {/* Description */}
      <p className={cn(
        "text-gray-500 dark:text-gray-500 mt-1",
        sizes.description
      )}>
        {description}
      </p>

      {/* Barre de progression optionnelle */}
      {showProgress && (
        <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-500",
              colors.progressColor
            )}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}
    </div>
  );
} 