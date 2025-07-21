'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useBreakpoints } from './use-media-query';
import { useResponsiveOptimization } from './use-responsive-optimization';
import {
  generateAdaptiveImageConfig,
  createAdaptiveLoadingStrategy,
  createImagePerformanceMonitor,
  getOrientationOptimizedDimensions,
  type ImageOptimizationOptions,
} from '@/lib/utils/image-optimization';

interface ProgressiveEnhancementConfig {
  // Connection-based optimizations
  adaptiveLoading: boolean;
  connectionAwareContent: boolean;
  
  // Device-specific optimizations
  touchOptimizations: boolean;
  orientationAware: boolean;
  densityOptimizations: boolean;
  
  // Image optimizations
  responsiveImages: boolean;
  adaptiveQuality: boolean;
  formatOptimization: boolean;
  
  // Performance monitoring
  performanceTracking: boolean;
  loadingMetrics: boolean;
}

interface ProgressiveEnhancementState {
  // Network state
  connectionSpeed: string;
  isSlowConnection: boolean;
  saveDataMode: boolean;
  
  // Device state
  deviceType: 'mobile' | 'tablet' | 'desktop';
  interactionMode: 'touch' | 'mouse';
  orientation: 'portrait' | 'landscape';
  screenDensity: number;
  
  // Capabilities
  supportsWebP: boolean;
  supportsAvif: boolean;
  hasHover: boolean;
  hasPointer: boolean;
  
  // Performance
  loadingStrategy: ReturnType<typeof createAdaptiveLoadingStrategy>;
  imageConfig: ReturnType<typeof generateAdaptiveImageConfig>;
  performanceMonitor: ReturnType<typeof createImagePerformanceMonitor>;
}

/**
 * Comprehensive hook for progressive enhancement features
 */
export function useProgressiveEnhancement(
  config: Partial<ProgressiveEnhancementConfig> = {}
): ProgressiveEnhancementState & {
  // Utility functions
  shouldLoadContent: (priority: 'critical' | 'high' | 'medium' | 'low') => boolean;
  getOptimizedImageProps: (src: string, width?: number, height?: number) => any;
  getInteractionClasses: (type: 'button' | 'card' | 'link') => string;
  getOrientationClasses: () => string;
  trackImageLoad: (src: string, startTime: number) => void;
  trackImageError: (src: string) => void;
  getPerformanceMetrics: () => any;
} {
  const breakpoints = useBreakpoints();
  const { networkInfo, deviceCapabilities, optimizations } = useResponsiveOptimization();
  
  const defaultConfig: ProgressiveEnhancementConfig = {
    adaptiveLoading: true,
    connectionAwareContent: true,
    touchOptimizations: true,
    orientationAware: true,
    densityOptimizations: true,
    responsiveImages: true,
    adaptiveQuality: true,
    formatOptimization: true,
    performanceTracking: true,
    loadingMetrics: true,
    ...config,
  };

  // Initialize performance monitor
  const performanceMonitor = useMemo(() => {
    return defaultConfig.performanceTracking ? createImagePerformanceMonitor() : null;
  }, [defaultConfig.performanceTracking]);

  // Generate adaptive image configuration
  const imageConfig = useMemo(() => {
    if (!defaultConfig.responsiveImages) return null;

    const options: ImageOptimizationOptions = {
      isSlowConnection: networkInfo.isSlowConnection,
      saveData: networkInfo.saveData,
      isHighDensity: deviceCapabilities.isHighDensity,
      supportsWebP: deviceCapabilities.supportsWebP,
      supportsAvif: deviceCapabilities.supportsAvif,
      orientation: deviceCapabilities.orientation,
    };

    return generateAdaptiveImageConfig('', options);
  }, [
    defaultConfig.responsiveImages,
    networkInfo.isSlowConnection,
    networkInfo.saveData,
    deviceCapabilities.isHighDensity,
    deviceCapabilities.supportsWebP,
    deviceCapabilities.supportsAvif,
    deviceCapabilities.orientation,
  ]);

  // Generate loading strategy
  const loadingStrategy = useMemo(() => {
    if (!defaultConfig.adaptiveLoading) return null;

    const options: ImageOptimizationOptions = {
      isSlowConnection: networkInfo.isSlowConnection,
      saveData: networkInfo.saveData,
      orientation: deviceCapabilities.orientation,
    };

    return createAdaptiveLoadingStrategy(options);
  }, [
    defaultConfig.adaptiveLoading,
    networkInfo.isSlowConnection,
    networkInfo.saveData,
    deviceCapabilities.orientation,
  ]);

  // Determine device type
  const deviceType = useMemo(() => {
    if (breakpoints.isMobile) return 'mobile';
    if (breakpoints.isTablet) return 'tablet';
    return 'desktop';
  }, [breakpoints.isMobile, breakpoints.isTablet]);

  // Content loading decision function
  const shouldLoadContent = useCallback((priority: 'critical' | 'high' | 'medium' | 'low') => {
    if (!defaultConfig.adaptiveLoading) return true;
    if (priority === 'critical') return true;

    // For slow connections, be more conservative
    if (networkInfo.isSlowConnection || networkInfo.saveData) {
      if (priority === 'low') return false;
      if (priority === 'medium') return !networkInfo.saveData;
    }

    // For mobile devices with limited resources
    if (breakpoints.isMobile && priority === 'low') {
      return !networkInfo.isSlowConnection;
    }

    return true;
  }, [
    defaultConfig.adaptiveLoading,
    networkInfo.isSlowConnection,
    networkInfo.saveData,
    breakpoints.isMobile,
  ]);

  // Optimized image props generator
  const getOptimizedImageProps = useCallback((
    src: string,
    width?: number,
    height?: number
  ) => {
    if (!defaultConfig.responsiveImages || !imageConfig) {
      return { src, width, height };
    }

    const optimizedDimensions = width && height && defaultConfig.orientationAware
      ? getOrientationOptimizedDimensions(
          width,
          height,
          deviceCapabilities.orientation,
          deviceType
        )
      : { width, height };

    const quality = defaultConfig.adaptiveQuality
      ? networkInfo.isSlowConnection || networkInfo.saveData ? 'low' : 'medium'
      : 'medium';

    return {
      src,
      width: optimizedDimensions.width,
      height: optimizedDimensions.height,
      loading: loadingStrategy?.shouldPreload ? 'eager' : 'lazy',
      decoding: 'async',
      sizes: `(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw`,
      quality: quality as 'high' | 'medium' | 'low',
    };
  }, [
    defaultConfig.responsiveImages,
    defaultConfig.orientationAware,
    defaultConfig.adaptiveQuality,
    imageConfig,
    deviceCapabilities.orientation,
    deviceType,
    networkInfo.isSlowConnection,
    networkInfo.saveData,
    loadingStrategy?.shouldPreload,
  ]);

  // Interaction classes generator
  const getInteractionClasses = useCallback((type: 'button' | 'card' | 'link') => {
    if (!defaultConfig.touchOptimizations) return '';

    const baseClasses = 'transition-all duration-200 cursor-pointer select-none';
    const isTouchPrimary = deviceCapabilities.interactionMode === 'touch';
    
    let typeClasses = '';
    let interactionClasses = '';

    // Type-specific classes
    switch (type) {
      case 'button':
        typeClasses = `min-h-[${optimizations.touchTargetSize}px] min-w-[${optimizations.touchTargetSize}px] rounded-lg font-medium`;
        break;
      case 'card':
        typeClasses = 'rounded-xl border border-border bg-card';
        break;
      case 'link':
        typeClasses = 'underline-offset-4 hover:underline';
        break;
    }

    // Interaction-specific classes
    if (isTouchPrimary) {
      interactionClasses = 'active:scale-95 active:opacity-80 touch-manipulation';
    } else {
      interactionClasses = 'hover:scale-105 hover:shadow-lg hover:-translate-y-1';
    }

    // Focus classes
    const focusClasses = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';

    return `${baseClasses} ${typeClasses} ${interactionClasses} ${focusClasses}`.trim();
  }, [
    defaultConfig.touchOptimizations,
    deviceCapabilities.interactionMode,
    optimizations.touchTargetSize,
  ]);

  // Orientation classes generator
  const getOrientationClasses = useCallback(() => {
    if (!defaultConfig.orientationAware) return '';

    const orientation = deviceCapabilities.orientation;
    const device = deviceType;

    if (orientation === 'landscape' && device === 'mobile') {
      return 'landscape:flex-row landscape:h-screen landscape:overflow-x-auto';
    }

    if (orientation === 'portrait' && device !== 'mobile') {
      return 'portrait:flex-col portrait:max-h-screen portrait:overflow-y-auto';
    }

    return '';
  }, [
    defaultConfig.orientationAware,
    deviceCapabilities.orientation,
    deviceType,
  ]);

  // Performance tracking functions
  const trackImageLoad = useCallback((src: string, startTime: number) => {
    if (defaultConfig.performanceTracking && performanceMonitor) {
      performanceMonitor.trackImageLoad(startTime);
    }
  }, [defaultConfig.performanceTracking, performanceMonitor]);

  const trackImageError = useCallback((src: string) => {
    if (defaultConfig.performanceTracking && performanceMonitor) {
      performanceMonitor.trackImageError();
    }
  }, [defaultConfig.performanceTracking, performanceMonitor]);

  const getPerformanceMetrics = useCallback(() => {
    if (!defaultConfig.loadingMetrics || !performanceMonitor) {
      return null;
    }

    return {
      ...performanceMonitor.getMetrics(),
      percentiles: performanceMonitor.getPercentiles(),
      networkInfo: {
        effectiveType: networkInfo.effectiveType,
        downlink: networkInfo.downlink,
        rtt: networkInfo.rtt,
        saveData: networkInfo.saveData,
      },
      deviceInfo: {
        screenDensity: deviceCapabilities.screenDensity,
        orientation: deviceCapabilities.orientation,
        interactionMode: deviceCapabilities.interactionMode,
      },
    };
  }, [
    defaultConfig.loadingMetrics,
    performanceMonitor,
    networkInfo,
    deviceCapabilities,
  ]);

  return {
    // State
    connectionSpeed: networkInfo.effectiveType,
    isSlowConnection: networkInfo.isSlowConnection,
    saveDataMode: networkInfo.saveData,
    deviceType,
    interactionMode: deviceCapabilities.interactionMode as 'touch' | 'mouse',
    orientation: deviceCapabilities.orientation,
    screenDensity: deviceCapabilities.screenDensity,
    supportsWebP: deviceCapabilities.supportsWebP,
    supportsAvif: deviceCapabilities.supportsAvif,
    hasHover: deviceCapabilities.hasHover,
    hasPointer: deviceCapabilities.hasPointer,
    loadingStrategy: loadingStrategy!,
    imageConfig: imageConfig!,
    performanceMonitor: performanceMonitor!,

    // Utility functions
    shouldLoadContent,
    getOptimizedImageProps,
    getInteractionClasses,
    getOrientationClasses,
    trackImageLoad,
    trackImageError,
    getPerformanceMetrics,
  };
}

/**
 * Hook for adaptive content loading with intersection observer
 */
export function useAdaptiveContentLoading(
  threshold: number = 0.1,
  priority: 'critical' | 'high' | 'medium' | 'low' = 'medium'
) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority === 'critical');
  const { shouldLoadContent, loadingStrategy } = useProgressiveEnhancement();

  const observeElement = useCallback((element: HTMLElement | null) => {
    if (!element || priority === 'critical') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold,
        rootMargin: loadingStrategy?.rootMargin || '100px',
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, priority, loadingStrategy?.rootMargin]);

  useEffect(() => {
    if (priority === 'critical') {
      setShouldLoad(true);
      return;
    }

    const delay = loadingStrategy?.loadDelay || 0;
    
    if (isVisible && shouldLoadContent(priority)) {
      if (delay > 0) {
        const timer = setTimeout(() => setShouldLoad(true), delay);
        return () => clearTimeout(timer);
      } else {
        setShouldLoad(true);
      }
    }
  }, [isVisible, priority, shouldLoadContent, loadingStrategy?.loadDelay]);

  return {
    isVisible,
    shouldLoad,
    observeElement,
  };
}

/**
 * Hook for device-specific interaction patterns
 */
export function useDeviceInteractions() {
  const { interactionMode, getInteractionClasses } = useProgressiveEnhancement();
  const [isPressed, setIsPressed] = useState(false);

  const handleInteractionStart = useCallback(() => {
    setIsPressed(true);
  }, []);

  const handleInteractionEnd = useCallback(() => {
    setIsPressed(false);
  }, []);

  const getInteractionProps = useCallback((type: 'button' | 'card' | 'link' = 'button') => {
    const classes = getInteractionClasses(type);
    
    if (interactionMode === 'touch') {
      return {
        className: classes,
        onTouchStart: handleInteractionStart,
        onTouchEnd: handleInteractionEnd,
        style: {
          WebkitTapHighlightColor: 'transparent',
        },
      };
    }

    return {
      className: classes,
      onMouseDown: handleInteractionStart,
      onMouseUp: handleInteractionEnd,
      onMouseLeave: handleInteractionEnd,
    };
  }, [interactionMode, getInteractionClasses, handleInteractionStart, handleInteractionEnd]);

  return {
    interactionMode,
    isPressed,
    getInteractionProps,
  };
}