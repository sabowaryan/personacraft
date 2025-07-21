'use client';

import { useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';
import { useBreakpoints } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

// Network information types
interface NetworkInformation extends EventTarget {
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
  downlink: number;
  rtt: number;
  saveData: boolean;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}

// Hook for detecting network conditions
export function useNetworkStatus() {
  const [networkInfo, setNetworkInfo] = useState<{
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
    isSlowConnection: boolean;
  }>({
    effectiveType: '4g',
    downlink: 10,
    rtt: 100,
    saveData: false,
    isSlowConnection: false,
  });

  useEffect(() => {
    const nav = navigator as NavigatorWithConnection;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

    if (connection) {
      const updateNetworkInfo = () => {
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
      };

      updateNetworkInfo();
      connection.addEventListener('change', updateNetworkInfo);

      return () => {
        connection.removeEventListener('change', updateNetworkInfo);
      };
    }
  }, []);

  return networkInfo;
}

// Hook for device capabilities detection
export function useDeviceCapabilities() {
  const { isMobile, isTablet, isTouchDevice } = useBreakpoints();
  const [deviceInfo, setDeviceInfo] = useState({
    hasHover: false,
    hasPointer: false,
    screenDensity: 1,
    orientation: 'portrait' as 'portrait' | 'landscape',
    isHighDensity: false,
    supportsWebP: false,
    supportsAvif: false,
    hasReducedMotion: false,
    hasHighContrast: false,
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const hasHover = window.matchMedia('(hover: hover)').matches;
      const hasPointer = window.matchMedia('(pointer: fine)').matches;
      const screenDensity = window.devicePixelRatio || 1;
      const isHighDensity = screenDensity > 1.5;
      const hasReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const hasHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      
      // Detect orientation
      const orientation = window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';

      // Test WebP support
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;

      // Test AVIF support (simplified check)
      const supportsAvif = 'createImageBitmap' in window;

      setDeviceInfo({
        hasHover,
        hasPointer,
        screenDensity,
        orientation,
        isHighDensity,
        supportsWebP,
        supportsAvif,
        hasReducedMotion,
        hasHighContrast,
      });
    };

    updateDeviceInfo();

    // Listen for orientation changes
    const handleOrientationChange = () => {
      setTimeout(updateDeviceInfo, 100); // Small delay to ensure accurate readings
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  return {
    ...deviceInfo,
    isMobile,
    isTablet,
    isTouchDevice,
    interactionMode: hasHover && hasPointer ? 'mouse' : 'touch',
  };
}

// Adaptive loading component based on connection speed
interface AdaptiveLoadingProps {
  children: ReactNode;
  fallback?: ReactNode;
  priority?: 'high' | 'medium' | 'low';
  className?: string;
}

export function AdaptiveLoading({
  children,
  fallback,
  priority = 'medium',
  className
}: AdaptiveLoadingProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const networkInfo = useNetworkStatus();
  const { isMobile } = useBreakpoints();

  useEffect(() => {
    const loadContent = () => {
      // Always load high priority content
      if (priority === 'high') {
        setShouldLoad(true);
        return;
      }

      // For slow connections or data saver mode, be more conservative
      if (networkInfo.isSlowConnection || networkInfo.saveData) {
        if (priority === 'low') {
          setShouldLoad(false);
          return;
        }
        // Delay medium priority content on slow connections
        setTimeout(() => setShouldLoad(true), 1000);
        return;
      }

      // For mobile devices, prioritize differently
      if (isMobile && priority === 'low') {
        setTimeout(() => setShouldLoad(true), 500);
        return;
      }

      // Default: load immediately
      setShouldLoad(true);
    };

    loadContent();
  }, [networkInfo, priority, isMobile]);

  if (!shouldLoad && fallback) {
    return <div className={className}>{fallback}</div>;
  }

  if (!shouldLoad) {
    return null;
  }

  return <div className={className}>{children}</div>;
}

// Progressive image component with format detection
interface ProgressiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export function ProgressiveImage({
  src,
  alt,
  width,
  height,
  className,
  sizes,
  priority = false,
  placeholder = 'empty',
  blurDataURL
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const deviceInfo = useDeviceCapabilities();
  const networkInfo = useNetworkStatus();

  // Generate responsive image sources
  const imageSources = useMemo(() => {
    const baseUrl = src.split('.').slice(0, -1).join('.');
    const extension = src.split('.').pop();
    
    const sources = [];

    // Add AVIF source if supported
    if (deviceInfo.supportsAvif && !networkInfo.saveData) {
      sources.push({
        srcSet: `${baseUrl}.avif`,
        type: 'image/avif'
      });
    }

    // Add WebP source if supported
    if (deviceInfo.supportsWebP) {
      sources.push({
        srcSet: `${baseUrl}.webp`,
        type: 'image/webp'
      });
    }

    // Fallback to original format
    sources.push({
      srcSet: src,
      type: `image/${extension}`
    });

    return sources;
  }, [src, deviceInfo.supportsAvif, deviceInfo.supportsWebP, networkInfo.saveData]);

  // Determine optimal image size based on device
  const getOptimalSize = useCallback(() => {
    if (!width || !height) return { width: undefined, height: undefined };

    const density = deviceInfo.isHighDensity && !networkInfo.isSlowConnection ? 2 : 1;
    const scaleFactor = deviceInfo.isMobile ? 0.8 : 1;

    return {
      width: Math.round(width * scaleFactor * density),
      height: Math.round(height * scaleFactor * density),
    };
  }, [width, height, deviceInfo.isHighDensity, deviceInfo.isMobile, networkInfo.isSlowConnection]);

  const optimalSize = getOptimalSize();

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          'border border-border rounded-md',
          className
        )}
        style={{ width: optimalSize.width, height: optimalSize.height }}
      >
        <span className="text-sm">Image failed to load</span>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Placeholder */}
      {!isLoaded && (
        <div
          className={cn(
            'absolute inset-0 bg-muted animate-pulse',
            placeholder === 'blur' && blurDataURL && 'bg-cover bg-center'
          )}
          style={
            placeholder === 'blur' && blurDataURL
              ? { backgroundImage: `url(${blurDataURL})` }
              : undefined
          }
        />
      )}

      {/* Progressive image */}
      <picture>
        {imageSources.map((source, index) => (
          <source
            key={index}
            srcSet={source.srcSet}
            type={source.type}
            sizes={sizes}
          />
        ))}
        <img
          src={src}
          alt={alt}
          width={optimalSize.width}
          height={optimalSize.height}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            'w-full h-full object-cover'
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      </picture>
    </div>
  );
}

// Device-specific interaction wrapper
interface DeviceOptimizedProps {
  children: ReactNode;
  touchBehavior?: 'default' | 'enhanced' | 'minimal';
  mouseBehavior?: 'default' | 'enhanced' | 'minimal';
  className?: string;
}

export function DeviceOptimized({
  children,
  touchBehavior = 'default',
  mouseBehavior = 'default',
  className
}: DeviceOptimizedProps) {
  const deviceInfo = useDeviceCapabilities();

  const getInteractionClasses = () => {
    const isTouchPrimary = deviceInfo.interactionMode === 'touch';
    const behavior = isTouchPrimary ? touchBehavior : mouseBehavior;

    const baseClasses = 'transition-all duration-200';
    
    switch (behavior) {
      case 'enhanced':
        return cn(
          baseClasses,
          isTouchPrimary ? [
            'active:scale-95',
            'active:opacity-80',
            'touch-manipulation',
          ] : [
            'hover:scale-105',
            'hover:shadow-lg',
            'hover:-translate-y-1',
          ]
        );
      
      case 'minimal':
        return cn(
          baseClasses,
          isTouchPrimary ? 'active:opacity-70' : 'hover:opacity-80'
        );
      
      default:
        return cn(
          baseClasses,
          isTouchPrimary ? 'active:scale-98' : 'hover:scale-102'
        );
    }
  };

  return (
    <div className={cn(getInteractionClasses(), className)}>
      {children}
    </div>
  );
}

// Orientation-aware layout component
interface OrientationLayoutProps {
  children: ReactNode;
  portraitLayout?: ReactNode;
  landscapeLayout?: ReactNode;
  className?: string;
}

export function OrientationLayout({
  children,
  portraitLayout,
  landscapeLayout,
  className
}: OrientationLayoutProps) {
  const deviceInfo = useDeviceCapabilities();

  if (deviceInfo.orientation === 'portrait' && portraitLayout) {
    return <div className={className}>{portraitLayout}</div>;
  }

  if (deviceInfo.orientation === 'landscape' && landscapeLayout) {
    return <div className={className}>{landscapeLayout}</div>;
  }

  return <div className={className}>{children}</div>;
}

// Connection-aware content loading
interface ConnectionAwareProps {
  children: ReactNode;
  slowConnectionFallback?: ReactNode;
  dataSaverFallback?: ReactNode;
  className?: string;
}

export function ConnectionAware({
  children,
  slowConnectionFallback,
  dataSaverFallback,
  className
}: ConnectionAwareProps) {
  const networkInfo = useNetworkStatus();

  if (networkInfo.saveData && dataSaverFallback) {
    return <div className={className}>{dataSaverFallback}</div>;
  }

  if (networkInfo.isSlowConnection && slowConnectionFallback) {
    return <div className={className}>{slowConnectionFallback}</div>;
  }

  return <div className={className}>{children}</div>;
}

// Adaptive grid that changes based on screen size and content
interface AdaptiveGridProps {
  children: ReactNode[];
  minItemWidth?: number;
  gap?: number;
  className?: string;
}

export function AdaptiveGrid({
  children,
  minItemWidth = 280,
  gap = 16,
  className
}: AdaptiveGridProps) {
  const [columns, setColumns] = useState(1);
  const { isMobile, isTablet } = useBreakpoints();

  useEffect(() => {
    const calculateColumns = () => {
      const containerWidth = window.innerWidth - (isMobile ? 32 : isTablet ? 48 : 64);
      const availableWidth = containerWidth - gap;
      const itemsPerRow = Math.floor(availableWidth / (minItemWidth + gap));
      setColumns(Math.max(1, itemsPerRow));
    };

    calculateColumns();
    window.addEventListener('resize', calculateColumns);
    return () => window.removeEventListener('resize', calculateColumns);
  }, [minItemWidth, gap, isMobile, isTablet]);

  return (
    <div
      className={cn('grid', className)}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`,
      }}
    >
      {children}
    </div>
  );
}

// Adaptive content loader based on connection speed and viewport
interface AdaptiveContentLoaderProps {
  children: ReactNode;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  loadingFallback?: ReactNode;
  errorFallback?: ReactNode;
  threshold?: number;
  className?: string;
}

export function AdaptiveContentLoader({
  children,
  priority = 'medium',
  loadingFallback,
  errorFallback,
  threshold = 0.1,
  className
}: AdaptiveContentLoaderProps) {
  const [shouldLoad, setShouldLoad] = useState(priority === 'critical');
  const [isVisible, setIsVisible] = useState(false);
  const [hasError, setHasError] = useState(false);
  const networkInfo = useNetworkStatus();
  const deviceInfo = useDeviceCapabilities();
  const elementRef = useRef<HTMLDivElement>(null);

  // Intersection observer for visibility detection
  useEffect(() => {
    if (!elementRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold,
        rootMargin: networkInfo.isSlowConnection ? '50px' : '200px',
      }
    );

    observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [threshold, networkInfo.isSlowConnection]);

  // Adaptive loading logic
  useEffect(() => {
    if (priority === 'critical') {
      setShouldLoad(true);
      return;
    }

    const loadContent = () => {
      // For slow connections, be more conservative
      if (networkInfo.isSlowConnection || networkInfo.saveData) {
        if (priority === 'low') {
          setShouldLoad(isVisible);
          return;
        }
        if (priority === 'medium') {
          setTimeout(() => setShouldLoad(isVisible), 1000);
          return;
        }
      }

      // For mobile devices with limited resources
      if (deviceInfo.isMobile && priority === 'low') {
        setTimeout(() => setShouldLoad(isVisible), 500);
        return;
      }

      // Default: load when visible or after short delay
      if (isVisible || priority === 'high') {
        setShouldLoad(true);
      }
    };

    loadContent();
  }, [isVisible, networkInfo, deviceInfo.isMobile, priority]);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  if (hasError && errorFallback) {
    return <div className={className}>{errorFallback}</div>;
  }

  return (
    <div ref={elementRef} className={className}>
      {shouldLoad ? (
        <ErrorBoundary fallback={errorFallback} onError={handleError}>
          {children}
        </ErrorBoundary>
      ) : (
        loadingFallback || <div className="animate-pulse bg-muted h-20 rounded-md" />
      )}
    </div>
  );
}

// Enhanced device-specific interaction patterns
interface InteractionPatternProps {
  children: ReactNode;
  hoverBehavior?: 'scale' | 'shadow' | 'opacity' | 'none';
  touchBehavior?: 'scale' | 'opacity' | 'ripple' | 'none';
  focusBehavior?: 'ring' | 'outline' | 'glow' | 'none';
  className?: string;
}

export function InteractionPattern({
  children,
  hoverBehavior = 'scale',
  touchBehavior = 'scale',
  focusBehavior = 'ring',
  className
}: InteractionPatternProps) {
  const deviceInfo = useDeviceCapabilities();
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const getInteractionClasses = () => {
    const baseClasses = 'relative transition-all duration-200 cursor-pointer select-none';
    const isTouchPrimary = deviceInfo.interactionMode === 'touch';
    
    let hoverClasses = '';
    let touchClasses = '';
    let focusClasses = '';

    // Hover behavior (mouse/trackpad)
    if (!isTouchPrimary && hoverBehavior !== 'none') {
      switch (hoverBehavior) {
        case 'scale':
          hoverClasses = 'hover:scale-105';
          break;
        case 'shadow':
          hoverClasses = 'hover:shadow-lg hover:-translate-y-1';
          break;
        case 'opacity':
          hoverClasses = 'hover:opacity-80';
          break;
      }
    }

    // Touch behavior
    if (isTouchPrimary && touchBehavior !== 'none') {
      switch (touchBehavior) {
        case 'scale':
          touchClasses = 'active:scale-95';
          break;
        case 'opacity':
          touchClasses = 'active:opacity-70';
          break;
        case 'ripple':
          touchClasses = 'overflow-hidden';
          break;
      }
    }

    // Focus behavior
    if (focusBehavior !== 'none') {
      switch (focusBehavior) {
        case 'ring':
          focusClasses = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2';
          break;
        case 'outline':
          focusClasses = 'focus-visible:outline-2 focus-visible:outline-primary';
          break;
        case 'glow':
          focusClasses = 'focus-visible:shadow-[0_0_0_3px_rgba(59,130,246,0.5)]';
          break;
      }
    }

    return cn(baseClasses, hoverClasses, touchClasses, focusClasses);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsPressed(true);
    
    if (touchBehavior === 'ripple') {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;
      
      const newRipple = { id: Date.now(), x, y };
      setRipples(prev => [...prev, newRipple]);
      
      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 600);
    }
  }, [touchBehavior]);

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
  }, []);

  return (
    <div
      className={cn(getInteractionClasses(), className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
    >
      {children}
      
      {/* Ripple effect for touch interactions */}
      {touchBehavior === 'ripple' && ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute pointer-events-none animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            opacity: 0.3,
          }}
        />
      ))}
    </div>
  );
}

// Screen density and orientation aware component
interface DensityAwareProps {
  children: ReactNode;
  highDensityContent?: ReactNode;
  portraitContent?: ReactNode;
  landscapeContent?: ReactNode;
  className?: string;
}

export function DensityAware({
  children,
  highDensityContent,
  portraitContent,
  landscapeContent,
  className
}: DensityAwareProps) {
  const deviceInfo = useDeviceCapabilities();

  // Use high density content if available and device supports it
  if (deviceInfo.isHighDensity && highDensityContent) {
    return <div className={className}>{highDensityContent}</div>;
  }

  // Use orientation-specific content if available
  if (deviceInfo.orientation === 'portrait' && portraitContent) {
    return <div className={className}>{portraitContent}</div>;
  }

  if (deviceInfo.orientation === 'landscape' && landscapeContent) {
    return <div className={className}>{landscapeContent}</div>;
  }

  return <div className={className}>{children}</div>;
}

// Advanced responsive image with multiple optimizations
interface AdvancedResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty' | 'skeleton';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  adaptiveQuality?: boolean;
  lazyLoad?: boolean;
}

export function AdvancedResponsiveImage({
  src,
  alt,
  width,
  height,
  className,
  sizes,
  priority = false,
  placeholder = 'skeleton',
  blurDataURL,
  onLoad,
  onError,
  adaptiveQuality = true,
  lazyLoad = true
}: AdvancedResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const deviceInfo = useDeviceCapabilities();
  const networkInfo = useNetworkStatus();
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate optimized image sources
  const imageSources = useMemo(() => {
    const baseUrl = src.split('.').slice(0, -1).join('.');
    const extension = src.split('.').pop();
    
    const sources = [];
    const quality = adaptiveQuality ? getAdaptiveQuality() : 80;
    const density = getDensityMultiplier();

    // Add AVIF source if supported and not on slow connection
    if (deviceInfo.supportsAvif && !networkInfo.saveData && !networkInfo.isSlowConnection) {
      sources.push({
        srcSet: generateSrcSet(baseUrl, 'avif', quality, density),
        type: 'image/avif'
      });
    }

    // Add WebP source if supported
    if (deviceInfo.supportsWebP) {
      sources.push({
        srcSet: generateSrcSet(baseUrl, 'webp', quality, density),
        type: 'image/webp'
      });
    }

    // Fallback to original format
    sources.push({
      srcSet: generateSrcSet(baseUrl, extension || 'jpg', quality, density),
      type: `image/${extension || 'jpeg'}`
    });

    return sources;
  }, [src, deviceInfo, networkInfo, adaptiveQuality]);

  const getAdaptiveQuality = () => {
    if (networkInfo.saveData) return 50;
    if (networkInfo.isSlowConnection) return 60;
    if (deviceInfo.isHighDensity && !networkInfo.isSlowConnection) return 85;
    return 80;
  };

  const getDensityMultiplier = () => {
    if (networkInfo.isSlowConnection || networkInfo.saveData) return 1;
    return Math.min(deviceInfo.screenDensity, 2);
  };

  const generateSrcSet = (baseUrl: string, format: string, quality: number, density: number) => {
    if (!width || !height) return `${baseUrl}.${format}`;
    
    const densities = density > 1 ? [1, density] : [1];
    return densities
      .map(d => {
        const w = Math.round(width * d);
        const h = Math.round(height * d);
        return `${baseUrl}_${w}x${h}_q${quality}.${format} ${d}x`;
      })
      .join(', ');
  };

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  // Intersection observer for lazy loading
  useEffect(() => {
    if (!lazyLoad || priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCurrentSrc(src);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: networkInfo.isSlowConnection ? '50px' : '200px',
      }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [lazyLoad, priority, src, networkInfo.isSlowConnection]);

  // Set src immediately if not lazy loading or high priority
  useEffect(() => {
    if (!lazyLoad || priority) {
      setCurrentSrc(src);
    }
  }, [lazyLoad, priority, src]);

  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          'border border-border rounded-md',
          className
        )}
        style={{ width, height }}
      >
        <span className="text-sm">Image failed to load</span>
      </div>
    );
  }

  const renderPlaceholder = () => {
    switch (placeholder) {
      case 'blur':
        return blurDataURL ? (
          <div
            className="absolute inset-0 bg-cover bg-center filter blur-sm"
            style={{ backgroundImage: `url(${blurDataURL})` }}
          />
        ) : null;
      
      case 'skeleton':
        return (
          <div className="absolute inset-0 bg-muted animate-pulse rounded-md" />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Placeholder */}
      {!isLoaded && renderPlaceholder()}

      {/* Progressive image */}
      <picture>
        {imageSources.map((source, index) => (
          <source
            key={index}
            srcSet={source.srcSet}
            type={source.type}
            sizes={sizes}
          />
        ))}
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            'w-full h-full object-cover'
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          style={{
            aspectRatio: width && height ? `${width}/${height}` : undefined,
          }}
        />
      </picture>
    </div>
  );
}

// Connection speed indicator component
export function ConnectionSpeedIndicator() {
  const networkInfo = useNetworkStatus();
  
  const getSpeedColor = () => {
    switch (networkInfo.effectiveType) {
      case 'slow-2g':
      case '2g':
        return 'text-red-500';
      case '3g':
        return 'text-yellow-500';
      case '4g':
      default:
        return 'text-green-500';
    }
  };

  const getSpeedText = () => {
    if (networkInfo.saveData) return 'Data Saver';
    return networkInfo.effectiveType.toUpperCase();
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={cn('w-2 h-2 rounded-full', getSpeedColor())} />
      <span className="text-muted-foreground">{getSpeedText()}</span>
      {networkInfo.isSlowConnection && (
        <span className="text-xs text-orange-500">(Optimized)</span>
      )}
    </div>
  );
}

// Error boundary component
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

function ErrorBoundary({ children, fallback, onError }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      setHasError(true);
      onError?.(new Error(error.message));
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, [onError]);

  if (hasError) {
    return fallback || (
      <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-700">
        <p className="text-sm">Something went wrong. Please try again.</p>
      </div>
    );
  }

  return <>{children}</>;
}

// Performance monitoring hook
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    interactionTime: 0,
    memoryUsage: 0,
    connectionType: '4g',
  });

  useEffect(() => {
    // Measure page load time
    const loadTime = performance.now();
    
    // Measure render time
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'measure') {
          setMetrics(prev => ({
            ...prev,
            renderTime: entry.duration,
          }));
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });

    // Measure interaction time
    const handleInteraction = () => {
      const interactionTime = performance.now() - loadTime;
      setMetrics(prev => ({
        ...prev,
        interactionTime,
      }));
    };

    // Monitor memory usage if available
    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / 1024 / 1024, // MB
        }));
      }
    };

    // Monitor connection type
    const updateConnectionType = () => {
      const nav = navigator as any;
      const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
      if (connection) {
        setMetrics(prev => ({
          ...prev,
          connectionType: connection.effectiveType,
        }));
      }
    };

    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });
    
    updateMemoryUsage();
    updateConnectionType();
    
    const memoryInterval = setInterval(updateMemoryUsage, 5000);

    return () => {
      observer.disconnect();
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      clearInterval(memoryInterval);
    };
  }, []);

  return metrics;
}