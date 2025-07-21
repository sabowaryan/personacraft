'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const loadingSkeletonVariants = cva(
  'animate-pulse rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800',
  {
    variants: {
      variant: {
        default: 'bg-gray-200 dark:bg-gray-800',
        shimmer: 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 bg-[length:200%_100%] animate-[shimmer_2s_infinite]',
        pulse: 'bg-gray-200 dark:bg-gray-800 animate-pulse',
        wave: 'bg-gray-200 dark:bg-gray-800 animate-[wave_1.5s_ease-in-out_infinite]',
      },
      size: {
        xs: 'h-3',
        sm: 'h-4',
        default: 'h-5',
        lg: 'h-6',
        xl: 'h-8',
      },
      shape: {
        rectangle: 'rounded-md',
        circle: 'rounded-full aspect-square',
        pill: 'rounded-full',
        square: 'rounded-md aspect-square',
      },
    },
    defaultVariants: {
      variant: 'shimmer',
      size: 'default',
      shape: 'rectangle',
    },
  }
);

export interface LoadingSkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingSkeletonVariants> {
  width?: string | number;
  height?: string | number;
  lines?: number;
  spacing?: string;
}

const LoadingSkeleton = React.forwardRef<HTMLDivElement, LoadingSkeletonProps>(
  ({ 
    className, 
    variant, 
    size, 
    shape, 
    width, 
    height, 
    lines = 1, 
    spacing = 'space-y-2',
    style,
    ...props 
  }, ref) => {
    const skeletonStyle = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      ...style,
    };

    if (lines === 1) {
      return (
        <div
          ref={ref}
          className={cn(loadingSkeletonVariants({ variant, size, shape }), className)}
          style={skeletonStyle}
          {...props}
        />
      );
    }

    return (
      <div ref={ref} className={cn('flex flex-col', spacing)} {...props}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              loadingSkeletonVariants({ variant, size, shape }),
              {
                'w-full': index < lines - 1,
                'w-3/4': index === lines - 1 && lines > 1, // Last line is shorter
              },
              className
            )}
            style={index === 0 ? skeletonStyle : undefined}
          />
        ))}
      </div>
    );
  }
);

LoadingSkeleton.displayName = 'LoadingSkeleton';

// Pre-built skeleton components for common use cases
const SkeletonCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    showAvatar?: boolean;
    showHeader?: boolean;
    lines?: number;
  }
>(({ className, showAvatar = false, showHeader = true, lines = 3, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-6 border rounded-xl bg-white dark:bg-gray-800', className)}
    {...props}
  >
    {showHeader && (
      <div className="flex items-center space-x-4 mb-4">
        {showAvatar && (
          <LoadingSkeleton variant="shimmer" shape="circle" className="h-12 w-12" />
        )}
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="shimmer" className="h-4 w-3/4" />
          <LoadingSkeleton variant="shimmer" className="h-3 w-1/2" />
        </div>
      </div>
    )}
    <div className="space-y-2">
      <LoadingSkeleton variant="shimmer" lines={lines} />
    </div>
  </div>
));
SkeletonCard.displayName = 'SkeletonCard';

const SkeletonAvatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    size?: 'sm' | 'md' | 'lg' | 'xl';
  }
>(({ className, size = 'md', ...props }, ref) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };

  return (
    <LoadingSkeleton
      ref={ref}
      variant="shimmer"
      shape="circle"
      className={cn(sizeClasses[size], className)}
      {...props}
    />
  );
});
SkeletonAvatar.displayName = 'SkeletonAvatar';

const SkeletonButton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    size?: 'sm' | 'default' | 'lg';
  }
>(({ className, size = 'default', ...props }, ref) => {
  const sizeClasses = {
    sm: 'h-8 w-20',
    default: 'h-10 w-24',
    lg: 'h-12 w-28',
  };

  return (
    <LoadingSkeleton
      ref={ref}
      variant="shimmer"
      shape="pill"
      className={cn(sizeClasses[size], className)}
      {...props}
    />
  );
});
SkeletonButton.displayName = 'SkeletonButton';

const SkeletonText = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    lines?: number;
    className?: string;
  }
>(({ className, lines = 3, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-2', className)} {...props}>
    {Array.from({ length: lines }).map((_, index) => (
      <LoadingSkeleton
        key={index}
        variant="shimmer"
        className={cn('h-4', {
          'w-full': index < lines - 1,
          'w-3/4': index === lines - 1,
        })}
      />
    ))}
  </div>
));
SkeletonText.displayName = 'SkeletonText';

const SkeletonTable = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    rows?: number;
    columns?: number;
  }
>(({ className, rows = 5, columns = 4, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-3', className)} {...props}>
    {/* Header */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, index) => (
        <LoadingSkeleton key={`header-${index}`} variant="shimmer" className="h-4" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div
        key={`row-${rowIndex}`}
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, colIndex) => (
          <LoadingSkeleton
            key={`cell-${rowIndex}-${colIndex}`}
            variant="shimmer"
            className="h-4"
          />
        ))}
      </div>
    ))}
  </div>
));
SkeletonTable.displayName = 'SkeletonTable';

// Custom keyframes for animations (to be added to globals.css)
const skeletonKeyframes = `
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@keyframes wave {
  0%, 60%, 100% {
    transform: initial;
  }
  30% {
    transform: translateY(-4px);
  }
}
`;

export {
  LoadingSkeleton,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonText,
  SkeletonTable,
  loadingSkeletonVariants,
  skeletonKeyframes,
};