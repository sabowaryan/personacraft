'use client';

import React, { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { useBreakpoints } from '@/hooks/use-media-query';
import { JSX } from 'react/jsx-runtime';

interface ResponsiveTextProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption' | 'overline';
  as?: keyof JSX.IntrinsicElements;
  responsive?: boolean;
  className?: string;
}

// Responsive typography scale
const typographyScale = {
  h1: {
    mobile: 'text-2xl font-bold leading-tight',
    tablet: 'text-3xl font-bold leading-tight',
    desktop: 'text-4xl font-bold leading-tight',
  },
  h2: {
    mobile: 'text-xl font-semibold leading-tight',
    tablet: 'text-2xl font-semibold leading-tight',
    desktop: 'text-3xl font-semibold leading-tight',
  },
  h3: {
    mobile: 'text-lg font-semibold leading-snug',
    tablet: 'text-xl font-semibold leading-snug',
    desktop: 'text-2xl font-semibold leading-snug',
  },
  h4: {
    mobile: 'text-base font-semibold leading-snug',
    tablet: 'text-lg font-semibold leading-snug',
    desktop: 'text-xl font-semibold leading-snug',
  },
  h5: {
    mobile: 'text-sm font-semibold leading-normal',
    tablet: 'text-base font-semibold leading-normal',
    desktop: 'text-lg font-semibold leading-normal',
  },
  h6: {
    mobile: 'text-xs font-semibold leading-normal',
    tablet: 'text-sm font-semibold leading-normal',
    desktop: 'text-base font-semibold leading-normal',
  },
  body: {
    mobile: 'text-sm leading-relaxed',
    tablet: 'text-base leading-relaxed',
    desktop: 'text-base leading-relaxed',
  },
  caption: {
    mobile: 'text-xs leading-normal text-muted-foreground',
    tablet: 'text-sm leading-normal text-muted-foreground',
    desktop: 'text-sm leading-normal text-muted-foreground',
  },
  overline: {
    mobile: 'text-xs font-medium uppercase tracking-wider text-muted-foreground',
    tablet: 'text-xs font-medium uppercase tracking-wider text-muted-foreground',
    desktop: 'text-sm font-medium uppercase tracking-wider text-muted-foreground',
  },
};

export function ResponsiveText({
  children,
  variant = 'body',
  as,
  responsive = true,
  className,
  ...props
}: ResponsiveTextProps) {
  const { isMobile, isTablet } = useBreakpoints();

  // Determine the component to render
  const Component = (as || (variant.startsWith('h') ? variant : 'p')) as React.ElementType;

  // Get responsive classes
  const getResponsiveClasses = () => {
    if (!responsive) {
      return typographyScale[variant].desktop;
    }

    const scale = typographyScale[variant];
    return cn(
      scale.mobile,
      `md:${scale.tablet.replace(scale.mobile, '').trim()}`,
      `lg:${scale.desktop.replace(scale.tablet, '').trim()}`
    );
  };

  return (
    <Component
      className={cn(getResponsiveClasses(), className)}
      {...props}
    >
      {children}
    </Component>
  );
}

// Responsive spacing component
interface ResponsiveSpacingProps {
  children: ReactNode;
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  direction?: 'vertical' | 'horizontal' | 'all';
  className?: string;
}

const spacingScale = {
  xs: {
    mobile: 'gap-2',
    tablet: 'gap-3',
    desktop: 'gap-4',
  },
  sm: {
    mobile: 'gap-3',
    tablet: 'gap-4',
    desktop: 'gap-5',
  },
  md: {
    mobile: 'gap-4',
    tablet: 'gap-6',
    desktop: 'gap-8',
  },
  lg: {
    mobile: 'gap-6',
    tablet: 'gap-8',
    desktop: 'gap-10',
  },
  xl: {
    mobile: 'gap-8',
    tablet: 'gap-10',
    desktop: 'gap-12',
  },
  '2xl': {
    mobile: 'gap-10',
    tablet: 'gap-12',
    desktop: 'gap-16',
  },
};

export function ResponsiveSpacing({
  children,
  spacing = 'md',
  direction = 'vertical',
  className
}: ResponsiveSpacingProps) {
  const scale = spacingScale[spacing];

  const directionClasses = {
    vertical: 'flex flex-col',
    horizontal: 'flex flex-row',
    all: 'grid',
  };

  return (
    <div
      className={cn(
        directionClasses[direction],
        scale.mobile,
        `md:${scale.tablet}`,
        `lg:${scale.desktop}`,
        className
      )}
    >
      {children}
    </div>
  );
}

// Responsive grid component
interface ResponsiveGridProps {
  children: ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function ResponsiveGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className
}: ResponsiveGridProps) {
  const gapClasses = {
    xs: 'gap-2 md:gap-3 lg:gap-4',
    sm: 'gap-3 md:gap-4 lg:gap-5',
    md: 'gap-4 md:gap-6 lg:gap-8',
    lg: 'gap-6 md:gap-8 lg:gap-10',
    xl: 'gap-8 md:gap-10 lg:gap-12',
  };

  const columnClasses = cn(
    'grid',
    `grid-cols-${columns.mobile || 1}`,
    columns.tablet && `md:grid-cols-${columns.tablet}`,
    columns.desktop && `lg:grid-cols-${columns.desktop}`,
    gapClasses[gap]
  );

  return (
    <div className={cn(columnClasses, className)}>
      {children}
    </div>
  );
}

// Responsive container component
interface ResponsiveContainerProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function ResponsiveContainer({
  children,
  maxWidth = 'lg',
  padding = 'md',
  className
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4 md:px-6',
    md: 'px-4 md:px-6 lg:px-8',
    lg: 'px-6 md:px-8 lg:px-12',
  };

  return (
    <div
      className={cn(
        'mx-auto w-full',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

// Touch-friendly card component
interface TouchCardProps {
  children: ReactNode;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export function TouchCard({
  children,
  interactive = false,
  onClick,
  className,
  padding = 'md'
}: TouchCardProps) {
  const { isTouchDevice } = useBreakpoints();

  const paddingClasses = {
    sm: 'p-3 md:p-4',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8',
  };

  const baseClasses = cn(
    'bg-card text-card-foreground',
    'border border-border rounded-lg',
    'shadow-sm',
    paddingClasses[padding],
    // Touch-friendly interactions
    interactive && [
      'cursor-pointer',
      'transition-all duration-200',
      isTouchDevice ? [
        'active:scale-[0.98]',
        'active:shadow-md',
      ] : [
        'hover:shadow-md',
        'hover:-translate-y-1',
      ],
      // Ensure minimum touch target size
      'min-h-[44px]',
    ],
    className
  );

  if (interactive && onClick) {
    return (
      <button
        className={baseClasses}
        onClick={onClick}
        type="button"
      >
        {children}
      </button>
    );
  }

  return (
    <div className={baseClasses}>
      {children}
    </div>
  );
}

// Responsive image component
interface ResponsiveImageProps {
  src: string;
  alt: string;
  sizes?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
  className?: string;
}

export function ResponsiveImage({
  src,
  alt,
  sizes,
  aspectRatio = 'square',
  className
}: ResponsiveImageProps) {
  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg',
        aspectRatioClasses[aspectRatio],
        className
      )}
    >
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
        sizes={sizes ? `(max-width: 768px) ${sizes.mobile || '100vw'}, (max-width: 1024px) ${sizes.tablet || '50vw'}, ${sizes.desktop || '33vw'}` : undefined}
        loading="lazy"
      />
    </div>
  );
}