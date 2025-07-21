'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'button';
  lines?: number;
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

/**
 * Reusable loading skeleton component
 * Provides visual feedback during content loading
 */
export const LoadingSkeleton = memo(function LoadingSkeleton({
  className,
  variant = 'default',
  lines = 1,
  width,
  height,
  animate = true,
}: LoadingSkeletonProps) {
  const baseClasses = cn(
    'bg-muted rounded',
    animate && 'animate-pulse',
    className
  );

  const getVariantClasses = () => {
    switch (variant) {
      case 'card':
        return 'h-32 w-full';
      case 'text':
        return 'h-4 w-full';
      case 'avatar':
        return 'h-12 w-12 rounded-full';
      case 'button':
        return 'h-10 w-24 rounded-md';
      default:
        return 'h-4 w-full';
    }
  };

  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(baseClasses, getVariantClasses())}
            style={index === lines - 1 ? { ...style, width: '75%' } : style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, getVariantClasses())}
      style={style}
    />
  );
});

/**
 * Skeleton for persona card components
 */
export const PersonaCardSkeleton = memo(function PersonaCardSkeleton() {
  return (
    <div className="persona-result-card p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <LoadingSkeleton variant="avatar" />
        <div className="space-y-2 flex-1">
          <LoadingSkeleton variant="text" width="60%" />
          <LoadingSkeleton variant="text" width="40%" />
        </div>
      </div>
      <div className="space-y-2">
        <LoadingSkeleton variant="text" lines={3} />
      </div>
      <div className="flex space-x-2">
        <LoadingSkeleton variant="button" />
        <LoadingSkeleton variant="button" />
      </div>
    </div>
  );
});

/**
 * Skeleton for metrics grid
 */
export const MetricsGridSkeleton = memo(function MetricsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="persona-result-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <LoadingSkeleton width="60%" height="16px" />
            <LoadingSkeleton variant="avatar" width="24px" height="24px" />
          </div>
          <LoadingSkeleton height="32px" width="80%" />
          <LoadingSkeleton height="8px" width="100%" />
        </div>
      ))}
    </div>
  );
});

/**
 * Skeleton for tab content
 */
export const TabContentSkeleton = memo(function TabContentSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="persona-result-card p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <LoadingSkeleton width="24px" height="24px" />
            <LoadingSkeleton width="120px" height="20px" />
          </div>
          <LoadingSkeleton lines={4} />
        </div>
        <div className="persona-result-card p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <LoadingSkeleton width="24px" height="24px" />
            <LoadingSkeleton width="100px" height="20px" />
          </div>
          <LoadingSkeleton lines={3} />
        </div>
      </div>
      <div className="persona-result-card p-6 space-y-4">
        <LoadingSkeleton width="150px" height="24px" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <LoadingSkeleton width="80%" height="16px" />
              <LoadingSkeleton height="40px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

/**
 * Skeleton for interests cloud
 */
export const InterestsCloudSkeleton = memo(function InterestsCloudSkeleton() {
  return (
    <div className="space-y-4">
      <LoadingSkeleton width="200px" height="24px" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 12 }).map((_, index) => (
          <LoadingSkeleton
            key={index}
            height="32px"
            width={`${Math.random() * 60 + 60}px`}
            className="rounded-full"
          />
        ))}
      </div>
    </div>
  );
});

/**
 * Skeleton for communication radar
 */
export const CommunicationRadarSkeleton = memo(function CommunicationRadarSkeleton() {
  return (
    <div className="persona-result-card p-6 space-y-4">
      <LoadingSkeleton width="180px" height="24px" />
      <div className="flex justify-center">
        <LoadingSkeleton
          width="200px"
          height="200px"
          className="rounded-full"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-2">
            <LoadingSkeleton width="12px" height="12px" className="rounded-full" />
            <LoadingSkeleton width="80px" height="16px" />
          </div>
        ))}
      </div>
    </div>
  );
});