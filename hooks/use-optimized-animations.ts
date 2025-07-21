'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePersonaPreferences } from './use-persona-preferences';

interface AnimationOptions {
  duration?: number;
  easing?: string;
  delay?: number;
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

interface UseOptimizedAnimationsReturn {
  // Animation controls
  animate: (element: HTMLElement, keyframes: Keyframe[], options?: AnimationOptions) => Promise<void>;
  cancelAnimation: (element: HTMLElement) => void;
  
  // Performance utilities
  requestAnimationFrame: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame: (id: number) => void;
  
  // Intersection observer for performance
  observeElement: (element: HTMLElement, callback: (isVisible: boolean) => void) => () => void;
  
  // Optimized event handlers
  createOptimizedHandler: <T extends Event>(handler: (event: T) => void, delay?: number) => (event: T) => void;
  
  // Animation state
  isAnimating: boolean;
  performanceMode: boolean;
}

/**
 * Hook for optimized animations and interactions
 * Provides 60fps animations with reduced motion support
 */
export function useOptimizedAnimations(): UseOptimizedAnimationsReturn {
  const { preferences } = usePersonaPreferences();
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRefs = useRef<Map<HTMLElement, Animation>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const rafRef = useRef<number | null>(null);

  // Performance mode detection
  const performanceMode = preferences.reducedMotion || !preferences.animations;

  // Optimized animation function
  const animate = useCallback(async (
    element: HTMLElement,
    keyframes: Keyframe[],
    options: AnimationOptions = {}
  ): Promise<void> => {
    if (performanceMode) {
      // Skip animation in performance mode
      return Promise.resolve();
    }

    const {
      duration = 300,
      easing = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      delay = 0,
      fillMode = 'both'
    } = options;

    // Cancel existing animation on this element
    const existingAnimation = animationRefs.current.get(element);
    if (existingAnimation) {
      existingAnimation.cancel();
    }

    setIsAnimating(true);

    return new Promise((resolve) => {
      const animation = element.animate(keyframes, {
        duration,
        easing,
        delay,
        fill: fillMode,
      });

      animationRefs.current.set(element, animation);

      animation.addEventListener('finish', () => {
        animationRefs.current.delete(element);
        setIsAnimating(false);
        resolve();
      });

      animation.addEventListener('cancel', () => {
        animationRefs.current.delete(element);
        setIsAnimating(false);
        resolve();
      });
    });
  }, [performanceMode]);

  // Cancel animation
  const cancelAnimation = useCallback((element: HTMLElement) => {
    const animation = animationRefs.current.get(element);
    if (animation) {
      animation.cancel();
      animationRefs.current.delete(element);
    }
  }, []);

  // Optimized RAF
  const requestAnimationFrame = useCallback((callback: FrameRequestCallback): number => {
    if (performanceMode) {
      // Execute immediately in performance mode
      callback(performance.now());
      return 0;
    }
    return window.requestAnimationFrame(callback);
  }, [performanceMode]);

  const cancelAnimationFrame = useCallback((id: number) => {
    if (id !== 0) {
      window.cancelAnimationFrame(id);
    }
  }, []);

  // Intersection observer for lazy animations
  const observeElement = useCallback((
    element: HTMLElement,
    callback: (isVisible: boolean) => void
  ): (() => void) => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            callback(entry.isIntersecting);
          });
        },
        {
          rootMargin: '50px',
          threshold: 0.1,
        }
      );
    }

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.unobserve(element);
      }
    };
  }, []);

  // Optimized event handler with debouncing
  const createOptimizedHandler = useCallback(<T extends Event>(
    handler: (event: T) => void,
    delay: number = 16 // ~60fps
  ) => {
    let timeoutId: NodeJS.Timeout;
    
    return (event: T) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => handler(event), delay);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel all animations
      animationRefs.current.forEach((animation) => {
        animation.cancel();
      });
      animationRefs.current.clear();

      // Disconnect observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      // Cancel RAF
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
    animate,
    cancelAnimation,
    requestAnimationFrame,
    cancelAnimationFrame,
    observeElement,
    createOptimizedHandler,
    isAnimating,
    performanceMode,
  };
}

/**
 * Hook for optimized hover effects
 */
export function useOptimizedHover(element: HTMLElement | null) {
  const { animate, performanceMode } = useOptimizedAnimations();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!element || performanceMode) return;

    const handleMouseEnter = () => {
      setIsHovered(true);
      animate(element, [
        { transform: 'translateY(0) scale(1)' },
        { transform: 'translateY(-2px) scale(1.02)' }
      ], { duration: 150 });
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      animate(element, [
        { transform: 'translateY(-2px) scale(1.02)' },
        { transform: 'translateY(0) scale(1)' }
      ], { duration: 150 });
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [element, animate, performanceMode]);

  return isHovered;
}

/**
 * Hook for scroll-triggered animations
 */
export function useScrollAnimation(threshold: number = 0.1) {
  const { observeElement, animate, performanceMode } = useOptimizedAnimations();
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const elementRef = useCallback((element: HTMLElement | null) => {
    setRef(element);
  }, []);

  useEffect(() => {
    if (!ref || performanceMode) return;

    const unobserve = observeElement(ref, (visible) => {
      setIsVisible(visible);
      if (visible) {
        animate(ref, [
          { opacity: 0, transform: 'translateY(20px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 600 });
      }
    });

    return unobserve;
  }, [ref, observeElement, animate, performanceMode]);

  return { ref: elementRef, isVisible };
}

/**
 * Hook for staggered animations
 */
export function useStaggeredAnimation(items: any[], delay: number = 100) {
  const { animate, performanceMode } = useOptimizedAnimations();
  const [refs, setRefs] = useState<(HTMLElement | null)[]>([]);

  const setRef = useCallback((index: number) => (element: HTMLElement | null) => {
    setRefs(prev => {
      const newRefs = [...prev];
      newRefs[index] = element;
      return newRefs;
    });
  }, []);

  const triggerStagger = useCallback(() => {
    if (performanceMode) return;

    refs.forEach((element, index) => {
      if (element) {
        setTimeout(() => {
          animate(element, [
            { opacity: 0, transform: 'translateY(20px) scale(0.95)' },
            { opacity: 1, transform: 'translateY(0) scale(1)' }
          ], { duration: 400 });
        }, index * delay);
      }
    });
  }, [refs, animate, delay, performanceMode]);

  return { setRef, triggerStagger };
}