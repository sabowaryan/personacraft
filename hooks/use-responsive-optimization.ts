'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useBreakpoints } from './use-media-query';

interface NetworkInfo {
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
  downlink: number;
  rtt: number;
  saveData: boolean;
  isSlowConnection: boolean;
}

interface DeviceCapabilities {
  hasHover: boolean;
  hasPointer: boolean;
  screenDensity: number;
  orientation: 'portrait' | 'landscape';
  isHighDensity: boolean;
  supportsWebP: boolean;
  supportsAvif: boolean;
  hasReducedMotion: boolean;
  hasHighContrast: boolean;
  viewportWidth: number;
  viewportHeight: number;
}

interface ResponsiveOptimizations {
  // Image optimizations
  imageQuality: number;
  imageDensity: number;
  shouldLazyLoad: boolean;
  preferredImageFormat: 'webp' | 'avif' | 'jpeg';
  
  // Animation optimizations
  animationDuration: number;
  shouldAnimate: boolean;
  
  // Layout optimizations
  layoutDensity: 'compact' | 'comfortable' | 'spacious';
  touchTargetSize: number;
  
  // Content optimizations
  shouldPreload: boolean;
  contentPriority: 'high' | 'medium' | 'low';
  
  // Performance optimizations
  shouldVirtualize: boolean;
  batchSize: number;
}

/**
 * Comprehensive hook for responsive optimizations based on device capabilities and network conditions
 */
export function useResponsiveOptimization(): {
  networkInfo: NetworkInfo;
  deviceCapabilities: DeviceCapabilities;
  optimizations: ResponsiveOptimizations;
  breakpoints: ReturnType<typeof useBreakpoints>;
} {
  const breakpoints = useBreakpoints();
  
  // Network information state
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    effectiveType: '4g',
    downlink: 10,
    rtt: 100,
    saveData: false,
    isSlowConnection: false,
  });

  // Device capabilities state
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities>({
    hasHover: false,
    hasPointer: false,
    screenDensity: 1,
    orientation: 'portrait',
    isHighDensity: false,
    supportsWebP: false,
    supportsAvif: false,
    hasReducedMotion: false,
    hasHighContrast: false,
    viewportWidth: 0,
    viewportHeight: 0,
  });

  // Update network information
  useEffect(() => {
    const updateNetworkInfo = () => {
      const nav = navigator as any;
      const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

      if (connection) {
        const isSlowConnection = 
          connection.effectiveType === 'slow-2g' || 
          connection.effectiveType === '2g' || 
          connection.downlink < 1.5 ||
          connection.saveData;

        setNetworkInfo({
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
          isSlowConnection,
        });
      }
    };

    updateNetworkInfo();
    
    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
      return () => connection.removeEventListener('change', updateNetworkInfo);
    }
  }, []);

  // Update device capabilities
  useEffect(() => {
    const updateDeviceCapabilities = () => {
      const hasHover = window.matchMedia('(hover: hover)').matches;
      const hasPointer = window.matchMedia('(pointer: fine)').matches;
      const screenDensity = window.devicePixelRatio || 1;
      const isHighDensity = screenDensity > 1.5;
      const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const hasHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      const orientation = window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
      
      // Test image format support
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      const supportsAvif = 'createImageBitmap' in window;

      setDeviceCapabilities({
        hasHover,
        hasPointer,
        screenDensity,
        orientation,
        isHighDensity,
        supportsWebP,
        supportsAvif,
        hasReducedMotion,
        hasHighContrast,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      });
    };

    updateDeviceCapabilities();

    const handleResize = () => {
      updateDeviceCapabilities();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Calculate optimizations based on current conditions
  const optimizations = useMemo<ResponsiveOptimizations>(() => {
    // Image optimizations
    const getImageQuality = () => {
      if (networkInfo.saveData) return 50;
      switch (networkInfo.effectiveType) {
        case 'slow-2g':
        case '2g': return 40;
        case '3g': return 60;
        case '4g':
        default: return 80;
      }
    };

    const getImageDensity = () => {
      if (networkInfo.isSlowConnection || networkInfo.saveData) return 1;
      return Math.min(deviceCapabilities.screenDensity, 2);
    };

    const getPreferredImageFormat = (): 'webp' | 'avif' | 'jpeg' => {
      if (networkInfo.saveData) return 'jpeg';
      if (deviceCapabilities.supportsAvif && !networkInfo.isSlowConnection) return 'avif';
      if (deviceCapabilities.supportsWebP) return 'webp';
      return 'jpeg';
    };

    // Animation optimizations
    const getAnimationDuration = () => {
      if (deviceCapabilities.hasReducedMotion) return 0;
      if (networkInfo.isSlowConnection) return 150;
      return 300;
    };

    // Layout optimizations
    const getLayoutDensity = (): 'compact' | 'comfortable' | 'spacious' => {
      if (breakpoints.isMobile) return 'compact';
      if (breakpoints.isTablet) return 'comfortable';
      return 'spacious';
    };

    const getTouchTargetSize = () => {
      if (breakpoints.isTouchDevice) {
        return breakpoints.isMobile ? 44 : 48;
      }
      return 40;
    };

    // Content optimizations
    const getContentPriority = (): 'high' | 'medium' | 'low' => {
      if (networkInfo.isSlowConnection || networkInfo.saveData) return 'high';
      if (breakpoints.isMobile) return 'medium';
      return 'low';
    };

    // Performance optimizations
    const shouldVirtualize = deviceCapabilities.viewportHeight < 800 || networkInfo.isSlowConnection;
    const getBatchSize = () => {
      if (networkInfo.isSlowConnection) return 5;
      if (breakpoints.isMobile) return 10;
      return 20;
    };

    return {
      imageQuality: getImageQuality(),
      imageDensity: getImageDensity(),
      shouldLazyLoad: !networkInfo.saveData,
      preferredImageFormat: getPreferredImageFormat(),
      
      animationDuration: getAnimationDuration(),
      shouldAnimate: !deviceCapabilities.hasReducedMotion,
      
      layoutDensity: getLayoutDensity(),
      touchTargetSize: getTouchTargetSize(),
      
      shouldPreload: !networkInfo.isSlowConnection && !networkInfo.saveData,
      contentPriority: getContentPriority(),
      
      shouldVirtualize,
      batchSize: getBatchSize(),
    };
  }, [networkInfo, deviceCapabilities, breakpoints]);

  return {
    networkInfo,
    deviceCapabilities,
    optimizations,
    breakpoints,
  };
}

/**
 * Hook for adaptive content loading based on viewport position and network conditions
 */
export function useAdaptiveContentLoading(threshold: number = 0.1) {
  const { networkInfo, optimizations } = useResponsiveOptimization();
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());

  const observeElement = useCallback((element: HTMLElement, id: string) => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleElements(prev => new Set(prev).add(id));
          } else {
            setVisibleElements(prev => {
              const newSet = new Set(prev);
              newSet.delete(id);
              return newSet;
            });
          }
        });
      },
      {
        threshold,
        rootMargin: networkInfo.isSlowConnection ? '50px' : '100px',
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, networkInfo.isSlowConnection]);

  const isVisible = useCallback((id: string) => visibleElements.has(id), [visibleElements]);

  const shouldLoadContent = useCallback((id: string, priority: 'high' | 'medium' | 'low' = 'medium') => {
    // Always load high priority content
    if (priority === 'high') return true;
    
    // For slow connections, only load visible content
    if (networkInfo.isSlowConnection) return isVisible(id);
    
    // For data saver mode, be conservative
    if (networkInfo.saveData && priority === 'low') return isVisible(id);
    
    // Default: load if visible or high priority
    return isVisible(id) || priority === 'high';
  }, [networkInfo, isVisible]);

  return {
    observeElement,
    isVisible,
    shouldLoadContent,
    optimizations,
  };
}

/**
 * Hook for responsive image optimization
 */
export function useResponsiveImage(baseUrl: string, width?: number, height?: number) {
  const { optimizations, deviceCapabilities } = useResponsiveOptimization();

  const getOptimizedImageUrl = useCallback((customWidth?: number, customHeight?: number) => {
    const targetWidth = customWidth || width;
    const targetHeight = customHeight || height;
    
    if (!targetWidth || !targetHeight) return baseUrl;

    const params = new URLSearchParams();
    params.set('w', Math.round(targetWidth * optimizations.imageDensity).toString());
    params.set('h', Math.round(targetHeight * optimizations.imageDensity).toString());
    params.set('q', optimizations.imageQuality.toString());
    params.set('f', optimizations.preferredImageFormat);

    return `${baseUrl}?${params.toString()}`;
  }, [baseUrl, width, height, optimizations]);

  const getSrcSet = useCallback((targetWidth: number) => {
    const densities = optimizations.imageDensity > 1 ? [1, optimizations.imageDensity] : [1];
    
    return densities
      .map(density => {
        const params = new URLSearchParams();
        params.set('w', Math.round(targetWidth * density).toString());
        params.set('q', optimizations.imageQuality.toString());
        params.set('f', optimizations.preferredImageFormat);
        return `${baseUrl}?${params.toString()} ${density}x`;
      })
      .join(', ');
  }, [baseUrl, optimizations]);

  const getSizes = useCallback((mobileSize: string, tabletSize: string, desktopSize: string) => {
    return `(max-width: 768px) ${mobileSize}, (max-width: 1024px) ${tabletSize}, ${desktopSize}`;
  }, []);

  return {
    getOptimizedImageUrl,
    getSrcSet,
    getSizes,
    shouldLazyLoad: optimizations.shouldLazyLoad,
    preferredFormat: optimizations.preferredImageFormat,
  };
}

/**
 * Hook for adaptive animations based on device capabilities
 */
export function useAdaptiveAnimations() {
  const { optimizations, deviceCapabilities } = useResponsiveOptimization();

  const getAnimationProps = useCallback((baseProps: any = {}) => {
    if (!optimizations.shouldAnimate) {
      return {
        ...baseProps,
        animate: false,
        transition: { duration: 0 },
      };
    }

    return {
      ...baseProps,
      transition: {
        duration: optimizations.animationDuration / 1000,
        ease: 'easeOut',
        ...baseProps.transition,
      },
    };
  }, [optimizations]);

  const getTransitionClasses = useCallback((baseClasses: string = '') => {
    if (!optimizations.shouldAnimate) {
      return baseClasses.replace(/transition-\w+/g, '');
    }

    const durationClass = optimizations.animationDuration <= 150 ? 'duration-150' : 'duration-300';
    return `${baseClasses} transition-all ${durationClass} ease-out`;
  }, [optimizations]);

  return {
    shouldAnimate: optimizations.shouldAnimate,
    animationDuration: optimizations.animationDuration,
    getAnimationProps,
    getTransitionClasses,
  };
}