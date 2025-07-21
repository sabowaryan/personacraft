'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design using media queries
 * @param query - CSS media query string
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Create event listener
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * Predefined breakpoint hooks for common responsive patterns
 */
export const useBreakpoints = () => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const isLargeDesktop = useMediaQuery('(min-width: 1280px)');
  
  // Touch device detection
  const isTouchDevice = useMediaQuery('(hover: none) and (pointer: coarse)');
  
  // Reduced motion preference
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  
  // High contrast preference
  const prefersHighContrast = useMediaQuery('(prefers-contrast: high)');
  
  // Dark mode preference
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isTouchDevice,
    prefersReducedMotion,
    prefersHighContrast,
    prefersDarkMode,
    // Convenience combinations
    isMobileOrTablet: isMobile || isTablet,
    isTabletOrDesktop: isTablet || isDesktop,
  };
};

/**
 * Hook for device-specific optimizations
 */
export const useDeviceOptimizations = () => {
  const {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    prefersReducedMotion,
    prefersHighContrast
  } = useBreakpoints();

  // Determine optimal touch target size
  const touchTargetSize = isMobile ? 44 : isTablet ? 48 : 40;
  
  // Determine optimal font scaling
  const fontScale = isMobile ? 0.9 : isTablet ? 0.95 : 1;
  
  // Determine animation preferences
  const shouldAnimate = !prefersReducedMotion;
  
  // Determine interaction patterns
  const interactionMode = isTouchDevice ? 'touch' : 'mouse';
  
  // Determine layout density
  const layoutDensity = isMobile ? 'compact' : isTablet ? 'comfortable' : 'spacious';

  return {
    touchTargetSize,
    fontScale,
    shouldAnimate,
    interactionMode,
    layoutDensity,
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    prefersHighContrast,
    // CSS custom properties for dynamic styling
    cssVars: {
      '--touch-target-size': `${touchTargetSize}px`,
      '--font-scale': fontScale.toString(),
      '--animation-duration': shouldAnimate ? '300ms' : '0ms',
    }
  };
};