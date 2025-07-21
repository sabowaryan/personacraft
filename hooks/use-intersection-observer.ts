'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
  initialIsIntersecting?: boolean;
}

/**
 * Hook for observing element intersection with viewport
 * Useful for lazy loading and progressive content display
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0%',
    freezeOnceVisible = false,
    initialIsIntersecting = false,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(initialIsIntersecting);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const elementRef = useRef<Element | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setElement = useCallback((element: Element | null) => {
    elementRef.current = element;
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    
    if (!element) return;

    // If we should freeze once visible and it has been visible, don't observe
    if (freezeOnceVisible && hasBeenVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        
        setIsIntersecting(isElementIntersecting);
        
        if (isElementIntersecting && !hasBeenVisible) {
          setHasBeenVisible(true);
        }
        
        // If freezeOnceVisible and element is visible, disconnect observer
        if (freezeOnceVisible && isElementIntersecting) {
          observer.disconnect();
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [threshold, root, rootMargin, freezeOnceVisible, hasBeenVisible]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    ref: setElement,
    isIntersecting,
    hasBeenVisible,
    observer: observerRef.current,
  };
}

/**
 * Hook for lazy loading components when they come into view
 */
export function useLazyLoad(options: UseIntersectionObserverOptions = {}) {
  const { ref, isIntersecting, hasBeenVisible } = useIntersectionObserver({
    rootMargin: '100px', // Start loading 100px before element is visible
    freezeOnceVisible: true,
    ...options,
  });

  const shouldLoad = isIntersecting || hasBeenVisible;

  return {
    ref,
    shouldLoad,
    isVisible: isIntersecting,
    hasBeenVisible,
  };
}

/**
 * Hook for progressive loading with priority levels
 */
export function useProgressiveLoad(priority: 'high' | 'medium' | 'low' = 'medium') {
  const rootMarginMap = {
    high: '200px',
    medium: '100px',
    low: '50px',
  };

  const { ref, shouldLoad, isVisible } = useLazyLoad({
    rootMargin: rootMarginMap[priority],
  });

  return {
    ref,
    shouldLoad,
    isVisible,
    priority,
  };
}