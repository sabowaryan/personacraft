/**
 * Enhanced image optimization utilities for progressive enhancement
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  devicePixelRatio?: number;
  isSlowConnection?: boolean;
  saveData?: boolean;
  orientation?: 'portrait' | 'landscape';
  isHighDensity?: boolean;
  supportsWebP?: boolean;
  supportsAvif?: boolean;
}

export interface AdaptiveImageConfig {
  baseUrl: string;
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  densities: number[];
  formats: string[];
  qualitySettings: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface ResponsiveImageSizes {
  mobile: string;
  tablet: string;
  desktop: string;
}

/**
 * Generate optimized image URL based on device capabilities and network conditions
 */
export function getOptimizedImageUrl(
  baseUrl: string,
  options: ImageOptimizationOptions = {}
): string {
  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    devicePixelRatio = 1,
    isSlowConnection = false,
    saveData = false
  } = options;

  // For slow connections or data saver mode, reduce quality and size
  const adjustedQuality = isSlowConnection || saveData ? Math.min(quality, 60) : quality;
  const adjustedDPR = isSlowConnection || saveData ? Math.min(devicePixelRatio, 1.5) : devicePixelRatio;

  const params = new URLSearchParams();
  
  if (width) params.set('w', Math.round(width * adjustedDPR).toString());
  if (height) params.set('h', Math.round(height * adjustedDPR).toString());
  params.set('q', adjustedQuality.toString());
  params.set('f', format);

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate responsive image sizes string for different breakpoints
 */
export function generateResponsiveSizes(sizes: ResponsiveImageSizes): string {
  return `(max-width: 768px) ${sizes.mobile}, (max-width: 1024px) ${sizes.tablet}, ${sizes.desktop}`;
}

/**
 * Generate srcSet for responsive images with multiple densities
 */
export function generateSrcSet(
  baseUrl: string,
  width: number,
  options: Omit<ImageOptimizationOptions, 'width'> = {}
): string {
  const densities = options.isSlowConnection || options.saveData ? [1] : [1, 1.5, 2];
  
  return densities
    .map(density => {
      const optimizedUrl = getOptimizedImageUrl(baseUrl, {
        ...options,
        width,
        devicePixelRatio: density
      });
      return `${optimizedUrl} ${density}x`;
    })
    .join(', ');
}

/**
 * Get optimal image dimensions based on container size and device
 */
export function getOptimalImageDimensions(
  containerWidth: number,
  containerHeight: number,
  isMobile: boolean = false,
  isHighDensity: boolean = false,
  isSlowConnection: boolean = false
): { width: number; height: number } {
  // Scale down for mobile devices
  const mobileScale = isMobile ? 0.8 : 1;
  
  // Adjust for high density displays, but not on slow connections
  const densityScale = isHighDensity && !isSlowConnection ? 2 : 1;
  
  // Apply conservative scaling for slow connections
  const connectionScale = isSlowConnection ? 0.7 : 1;

  const width = Math.round(containerWidth * mobileScale * densityScale * connectionScale);
  const height = Math.round(containerHeight * mobileScale * densityScale * connectionScale);

  return { width, height };
}

/**
 * Generate blur placeholder data URL
 */
export function generateBlurPlaceholder(
  width: number = 40,
  height: number = 40,
  color: string = '#f3f4f6'
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Create gradient for more realistic blur effect
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, adjustColorBrightness(color, -10));
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.1);
}

/**
 * Adjust color brightness for gradient effects
 */
function adjustColorBrightness(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Detect image format support
 */
export function detectImageFormatSupport(): {
  webp: boolean;
  avif: boolean;
  jpeg2000: boolean;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return {
    webp: canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0,
    avif: 'createImageBitmap' in window, // Simplified AVIF detection
    jpeg2000: canvas.toDataURL('image/jp2').indexOf('data:image/jp2') === 0,
  };
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, priority: 'high' | 'low' = 'low'): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    
    if (priority === 'high') {
      link.setAttribute('fetchpriority', 'high');
    }
    
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    
    document.head.appendChild(link);
  });
}

/**
 * Lazy load images with intersection observer
 */
export function createImageLazyLoader(
  threshold: number = 0.1,
  rootMargin: string = '50px'
) {
  const imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          const srcset = img.dataset.srcset;
          
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
          }
          
          if (srcset) {
            img.srcset = srcset;
            img.removeAttribute('data-srcset');
          }
          
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    },
    {
      threshold,
      rootMargin,
    }
  );

  return {
    observe: (img: HTMLImageElement) => imageObserver.observe(img),
    disconnect: () => imageObserver.disconnect(),
  };
}

/**
 * Calculate image loading priority based on viewport position
 */
export function calculateImagePriority(
  element: HTMLElement,
  viewportHeight: number = window.innerHeight
): 'high' | 'medium' | 'low' {
  const rect = element.getBoundingClientRect();
  const distanceFromTop = rect.top;
  
  // Images in viewport or just below get high priority
  if (distanceFromTop < viewportHeight) {
    return 'high';
  }
  
  // Images within 2 viewport heights get medium priority
  if (distanceFromTop < viewportHeight * 2) {
    return 'medium';
  }
  
  // Everything else gets low priority
  return 'low';
}

/**
 * Adaptive image quality based on network conditions
 */
export function getAdaptiveImageQuality(
  baseQuality: number = 80,
  networkType: string = '4g',
  saveData: boolean = false
): number {
  if (saveData) return Math.min(baseQuality, 50);
  
  switch (networkType) {
    case 'slow-2g':
    case '2g':
      return Math.min(baseQuality, 40);
    case '3g':
      return Math.min(baseQuality, 60);
    case '4g':
    default:
      return baseQuality;
  }
}

/**
 * Generate adaptive image configuration based on device and network conditions
 */
export function generateAdaptiveImageConfig(
  baseUrl: string,
  options: ImageOptimizationOptions = {}
): AdaptiveImageConfig {
  const {
    isSlowConnection = false,
    saveData = false,
    isHighDensity = false,
    supportsWebP = true,
    supportsAvif = false,
  } = options;

  // Determine optimal formats based on support and connection
  const formats = [];
  if (supportsAvif && !isSlowConnection && !saveData) {
    formats.push('avif');
  }
  if (supportsWebP) {
    formats.push('webp');
  }
  formats.push('jpeg');

  // Determine density multipliers based on connection and device
  const densities = [];
  if (isSlowConnection || saveData) {
    densities.push(1);
  } else {
    densities.push(1);
    if (isHighDensity) {
      densities.push(1.5, 2);
    }
  }

  // Determine quality settings based on connection
  const qualitySettings = {
    high: saveData ? 50 : isSlowConnection ? 60 : 85,
    medium: saveData ? 40 : isSlowConnection ? 50 : 75,
    low: saveData ? 30 : isSlowConnection ? 40 : 65,
  };

  return {
    baseUrl,
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1200,
    },
    densities,
    formats,
    qualitySettings,
  };
}

/**
 * Generate complete srcSet for multiple formats and densities
 */
export function generateCompleteSrcSet(
  config: AdaptiveImageConfig,
  width: number,
  quality: 'high' | 'medium' | 'low' = 'medium'
): { [format: string]: string } {
  const srcSets: { [format: string]: string } = {};
  
  config.formats.forEach(format => {
    const sources = config.densities.map(density => {
      const params = new URLSearchParams();
      params.set('w', Math.round(width * density).toString());
      params.set('q', config.qualitySettings[quality].toString());
      params.set('f', format);
      
      const url = `${config.baseUrl}?${params.toString()}`;
      return `${url} ${density}x`;
    });
    
    srcSets[format] = sources.join(', ');
  });
  
  return srcSets;
}

/**
 * Generate orientation-specific image dimensions
 */
export function getOrientationOptimizedDimensions(
  baseWidth: number,
  baseHeight: number,
  orientation: 'portrait' | 'landscape',
  deviceType: 'mobile' | 'tablet' | 'desktop'
): { width: number; height: number } {
  let width = baseWidth;
  let height = baseHeight;

  // Adjust for orientation
  if (orientation === 'landscape' && deviceType === 'mobile') {
    // In landscape mode on mobile, prioritize width
    width = Math.min(baseWidth * 1.2, window.screen.width);
    height = Math.round(height * (width / baseWidth));
  } else if (orientation === 'portrait' && deviceType !== 'mobile') {
    // In portrait mode on larger screens, optimize for vertical space
    height = Math.min(baseHeight * 1.1, window.screen.height * 0.8);
    width = Math.round(width * (height / baseHeight));
  }

  return { width, height };
}

/**
 * Create adaptive loading strategy based on connection and device
 */
export function createAdaptiveLoadingStrategy(options: ImageOptimizationOptions = {}) {
  const {
    isSlowConnection = false,
    saveData = false,
    orientation = 'portrait',
  } = options;

  return {
    // Preload strategy
    shouldPreload: !isSlowConnection && !saveData,
    preloadCount: isSlowConnection ? 1 : saveData ? 2 : 5,
    
    // Lazy loading thresholds
    lazyThreshold: isSlowConnection ? 0.05 : 0.1,
    rootMargin: isSlowConnection ? '25px' : '100px',
    
    // Quality progression
    initialQuality: saveData ? 30 : isSlowConnection ? 40 : 60,
    finalQuality: saveData ? 50 : isSlowConnection ? 60 : 80,
    
    // Loading delays
    loadDelay: isSlowConnection ? 500 : 0,
    retryDelay: isSlowConnection ? 2000 : 1000,
    
    // Orientation-specific settings
    orientationOptimized: orientation === 'landscape' ? {
      prioritizeWidth: true,
      aspectRatioTolerance: 0.2,
    } : {
      prioritizeHeight: true,
      aspectRatioTolerance: 0.1,
    },
  };
}

/**
 * Monitor image loading performance
 */
export function createImagePerformanceMonitor() {
  const metrics = {
    totalImages: 0,
    loadedImages: 0,
    failedImages: 0,
    averageLoadTime: 0,
    totalLoadTime: 0,
  };

  const loadTimes: number[] = [];

  return {
    trackImageLoad: (startTime: number) => {
      const loadTime = performance.now() - startTime;
      loadTimes.push(loadTime);
      
      metrics.totalImages++;
      metrics.loadedImages++;
      metrics.totalLoadTime += loadTime;
      metrics.averageLoadTime = metrics.totalLoadTime / metrics.loadedImages;
    },

    trackImageError: () => {
      metrics.totalImages++;
      metrics.failedImages++;
    },

    getMetrics: () => ({ ...metrics }),
    
    getPercentiles: () => {
      if (loadTimes.length === 0) return { p50: 0, p90: 0, p95: 0 };
      
      const sorted = [...loadTimes].sort((a, b) => a - b);
      return {
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p90: sorted[Math.floor(sorted.length * 0.9)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
      };
    },

    reset: () => {
      metrics.totalImages = 0;
      metrics.loadedImages = 0;
      metrics.failedImages = 0;
      metrics.averageLoadTime = 0;
      metrics.totalLoadTime = 0;
      loadTimes.length = 0;
    },
  };
}

/**
 * Generate responsive image configuration for common use cases
 */
export const imageConfigs = {
  avatar: {
    sizes: {
      mobile: '80px',
      tablet: '96px',
      desktop: '128px',
    },
    quality: 85,
    format: 'webp' as const,
  },
  
  hero: {
    sizes: {
      mobile: '100vw',
      tablet: '100vw',
      desktop: '1200px',
    },
    quality: 80,
    format: 'webp' as const,
  },
  
  thumbnail: {
    sizes: {
      mobile: '150px',
      tablet: '200px',
      desktop: '250px',
    },
    quality: 75,
    format: 'webp' as const,
  },
  
  gallery: {
    sizes: {
      mobile: '50vw',
      tablet: '33vw',
      desktop: '25vw',
    },
    quality: 80,
    format: 'webp' as const,
  },

  // New progressive enhancement configs
  adaptive: {
    sizes: {
      mobile: '100vw',
      tablet: '50vw',
      desktop: '33vw',
    },
    quality: 'adaptive' as const,
    format: 'adaptive' as const,
  },

  orientationAware: {
    portrait: {
      mobile: '100vw',
      tablet: '60vw',
      desktop: '40vw',
    },
    landscape: {
      mobile: '100vh',
      tablet: '80vh',
      desktop: '60vh',
    },
    quality: 80,
    format: 'webp' as const,
  },
} as const;