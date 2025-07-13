'use client';

import { cn } from '@/lib/utils';

interface MetricCardSkeletonProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showProgress?: boolean;
}

const sizeClasses = {
  sm: {
    container: 'p-3',
    icon: 'w-8 h-8',
    value: 'h-6',
    label: 'h-3',
    description: 'h-3'
  },
  md: {
    container: 'p-3 sm:p-4 lg:p-6',
    icon: 'w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16',
    value: 'h-8 sm:h-10 lg:h-12',
    label: 'h-3 sm:h-4',
    description: 'h-3'
  },
  lg: {
    container: 'p-4 sm:p-6 lg:p-8',
    icon: 'w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20',
    value: 'h-10 sm:h-12 lg:h-14',
    label: 'h-4 sm:h-5',
    description: 'h-4'
  }
};

export function MetricCardSkeleton({
  size = 'md',
  className,
  showProgress = false
}: MetricCardSkeletonProps) {
  const sizes = sizeClasses[size];

  return (
    <div className={cn(
      "text-center rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse",
      sizes.container,
      className
    )}>
      {/* Icône skeleton */}
      <div className={cn(
        "inline-flex items-center justify-center rounded-xl mb-2 sm:mb-3 lg:mb-4 bg-gray-200 dark:bg-gray-700",
        sizes.icon
      )} />

      {/* Valeur skeleton */}
      <div className={cn(
        "bg-gray-200 dark:bg-gray-700 rounded mb-1 sm:mb-2 mx-auto w-16",
        sizes.value
      )} />

      {/* Label skeleton */}
      <div className={cn(
        "bg-gray-200 dark:bg-gray-700 rounded mx-auto w-12 mb-1",
        sizes.label
      )} />

      {/* Description skeleton */}
      <div className={cn(
        "bg-gray-200 dark:bg-gray-700 rounded mx-auto w-20",
        sizes.description
      )} />

      {/* Barre de progression skeleton */}
      {showProgress && (
        <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="h-full bg-gray-300 dark:bg-gray-600 rounded-full w-3/4" />
        </div>
      )}
    </div>
  );
} 