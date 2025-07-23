'use client';

import { useBreakpoints, useDeviceOptimizations } from '@/hooks/use-media-query';
import { ReactNode, CSSProperties } from 'react';
import { cn } from '@/lib/utils';

// Breakpoint-specific component rendering
interface BreakpointProps {
  mobile?: ReactNode;
  tablet?: ReactNode;
  desktop?: ReactNode;
  fallback?: ReactNode;
}

export function Breakpoint({ mobile, tablet, desktop, fallback }: BreakpointProps) {
  const { isMobile, isTablet, isDesktop } = useBreakpoints();

  if (isMobile && mobile) return <>{mobile}</>;
  if (isTablet && tablet) return <>{tablet}</>;
  if (isDesktop && desktop) return <>{desktop}</>;
  if (fallback) return <>{fallback}</>;

  return null;
}

// Show/hide components based on breakpoints
interface ShowProps {
  children: ReactNode;
  on?: 'mobile' | 'tablet' | 'desktop' | 'mobile-tablet' | 'tablet-desktop';
  className?: string;
}

export function Show({ children, on = 'desktop', className }: ShowProps) {
  const showClasses = {
    mobile: 'block md:hidden',
    tablet: 'hidden md:block lg:hidden',
    desktop: 'hidden lg:block',
    'mobile-tablet': 'block lg:hidden',
    'tablet-desktop': 'hidden md:block',
  };

  return (
    <div className={cn(showClasses[on], className)}>
      {children}
    </div>
  );
}

interface HideProps {
  children: ReactNode;
  on?: 'mobile' | 'tablet' | 'desktop' | 'mobile-tablet' | 'tablet-desktop';
  className?: string;
}

export function Hide({ children, on = 'mobile', className }: HideProps) {
  const hideClasses = {
    mobile: 'hidden md:block',
    tablet: 'block md:hidden lg:block',
    desktop: 'block lg:hidden',
    'mobile-tablet': 'hidden lg:block',
    'tablet-desktop': 'block md:hidden',
  };

  return (
    <div className={cn(hideClasses[on], className)}>
      {children}
    </div>
  );
}

// Adaptive component that changes behavior based on device
interface AdaptiveProps {
  children: (props: {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isTouchDevice: boolean;
    touchTargetSize: number;
    layoutDensity: string;
    interactionMode: string;
  }) => ReactNode;
}

export function Adaptive({ children }: AdaptiveProps) {
  const { isMobile, isTablet, isDesktop, isTouchDevice } = useBreakpoints();
  const { touchTargetSize, layoutDensity, interactionMode } = useDeviceOptimizations();

  return (
    <>
      {children({
        isMobile,
        isTablet,
        isDesktop,
        isTouchDevice,
        touchTargetSize,
        layoutDensity,
        interactionMode,
      })}
    </>
  );
}

// Dynamic CSS properties based on device
export function useDynamicStyles() {
  const { cssVars, touchTargetSize, fontScale, shouldAnimate } = useDeviceOptimizations();
  const { isMobile, isTablet, isTouchDevice } = useBreakpoints();

  const dynamicStyles: CSSProperties & Record<string, string | number> = {
    ...cssVars,
    '--min-touch-target': `${touchTargetSize}px`,
    '--font-scale': fontScale,
    '--animation-duration': shouldAnimate ? '300ms' : '0ms',
    '--layout-density': isMobile ? '0.8' : isTablet ? '0.9' : '1',
    '--interaction-mode': isTouchDevice ? 'touch' : 'mouse',
  };

  return {
    styles: dynamicStyles,
    classes: cn(
      // Base responsive classes
      'transition-all duration-300',
      // Touch-specific classes
      isTouchDevice && 'touch-manipulation',
      // Animation preferences
      !shouldAnimate && 'motion-reduce:transition-none motion-reduce:animate-none',
    ),
  };
}

// Responsive spacing hook
export function useResponsiveSpacing() {
  const { isMobile, isTablet } = useBreakpoints();

  const spacing = {
    xs: isMobile ? 'space-y-2' : isTablet ? 'space-y-3' : 'space-y-4',
    sm: isMobile ? 'space-y-3' : isTablet ? 'space-y-4' : 'space-y-5',
    md: isMobile ? 'space-y-4' : isTablet ? 'space-y-6' : 'space-y-8',
    lg: isMobile ? 'space-y-6' : isTablet ? 'space-y-8' : 'space-y-10',
    xl: isMobile ? 'space-y-8' : isTablet ? 'space-y-10' : 'space-y-12',
  };

  const padding = {
    xs: isMobile ? 'p-2' : isTablet ? 'p-3' : 'p-4',
    sm: isMobile ? 'p-3' : isTablet ? 'p-4' : 'p-5',
    md: isMobile ? 'p-4' : isTablet ? 'p-6' : 'p-8',
    lg: isMobile ? 'p-6' : isTablet ? 'p-8' : 'p-10',
    xl: isMobile ? 'p-8' : isTablet ? 'p-10' : 'p-12',
  };

  const margin = {
    xs: isMobile ? 'm-2' : isTablet ? 'm-3' : 'm-4',
    sm: isMobile ? 'm-3' : isTablet ? 'm-4' : 'm-5',
    md: isMobile ? 'm-4' : isTablet ? 'm-6' : 'm-8',
    lg: isMobile ? 'm-6' : isTablet ? 'm-8' : 'm-10',
    xl: isMobile ? 'm-8' : isTablet ? 'm-10' : 'm-12',
  };

  return { spacing, padding, margin };
}

// Responsive grid utilities
export function useResponsiveGrid() {
  const { isMobile, isTablet } = useBreakpoints();

  const getGridCols = (mobile: number, tablet?: number, desktop?: number) => {
    return cn(
      `grid-cols-${mobile}`,
      tablet && `md:grid-cols-${tablet}`,
      desktop && `lg:grid-cols-${desktop}`
    );
  };

  const getGridGap = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md') => {
    const gaps = {
      xs: 'gap-2 md:gap-3 lg:gap-4',
      sm: 'gap-3 md:gap-4 lg:gap-5',
      md: 'gap-4 md:gap-6 lg:gap-8',
      lg: 'gap-6 md:gap-8 lg:gap-10',
      xl: 'gap-8 md:gap-10 lg:gap-12',
    };
    return gaps[size];
  };

  const getAutoFitGrid = (minWidth: string = '280px') => {
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, 1fr))`,
      gap: isMobile ? '1rem' : isTablet ? '1.5rem' : '2rem',
    };
  };

  return {
    getGridCols,
    getGridGap,
    getAutoFitGrid,
  };
}

// Touch-friendly interaction utilities
export function useTouchInteractions() {
  const { isTouchDevice } = useBreakpoints();
  const { touchTargetSize } = useDeviceOptimizations();

  const getTouchClasses = (interactive: boolean = true) => {
    if (!interactive) return '';

    return cn(
      // Minimum touch target size
      `min-h-[${touchTargetSize}px]`,
      `min-w-[${touchTargetSize}px]`,
      // Touch-specific interactions
      isTouchDevice && [
        'touch-manipulation',
        'active:scale-95',
        'active:opacity-80',
      ],
      // Mouse-specific interactions
      !isTouchDevice && [
        'hover:scale-105',
        'hover:shadow-lg',
      ],
      // Common interaction styles
      'transition-all duration-200',
      'cursor-pointer',
      'select-none',
    );
  };

  const getButtonClasses = (size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizes = {
      sm: isTouchDevice ? 'px-4 py-3 text-sm' : 'px-3 py-2 text-sm',
      md: isTouchDevice ? 'px-6 py-4 text-base' : 'px-4 py-2 text-base',
      lg: isTouchDevice ? 'px-8 py-5 text-lg' : 'px-6 py-3 text-lg',
    };

    return cn(
      sizes[size],
      getTouchClasses(),
      'rounded-lg font-medium',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
    );
  };

  return {
    getTouchClasses,
    getButtonClasses,
    touchTargetSize,
    isTouchDevice,
  };
}

// Responsive font scaling
export function useResponsiveFonts() {
  const { isMobile, isTablet } = useBreakpoints();

  const getFontSize = (base: string) => {
    const scales = {
      'text-xs': isMobile ? 'text-xs' : isTablet ? 'text-sm' : 'text-sm',
      'text-sm': isMobile ? 'text-sm' : isTablet ? 'text-base' : 'text-base',
      'text-base': isMobile ? 'text-base' : isTablet ? 'text-lg' : 'text-lg',
      'text-lg': isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-xl',
      'text-xl': isMobile ? 'text-xl' : isTablet ? 'text-2xl' : 'text-2xl',
      'text-2xl': isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-3xl',
      'text-3xl': isMobile ? 'text-3xl' : isTablet ? 'text-4xl' : 'text-4xl',
    };

    return scales[base as keyof typeof scales] || base;
  };

  const getLineHeight = (tight: boolean = false) => {
    if (tight) {
      return isMobile ? 'leading-tight' : 'leading-snug';
    }
    return isMobile ? 'leading-normal' : 'leading-relaxed';
  };

  return {
    getFontSize,
    getLineHeight,
  };
}