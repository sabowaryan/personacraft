'use client';

import { useEffect, useCallback, useRef, useState } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  disabled?: boolean;
}

export interface FocusableElement {
  element: HTMLElement;
  priority: number;
  group?: string;
}

export interface KeyboardNavigationOptions {
  enableShortcuts?: boolean;
  enableFocusManagement?: boolean;
  enableSkipLinks?: boolean;
  trapFocus?: boolean;
  restoreFocus?: boolean;
}

export function useKeyboardNavigation(
  shortcuts: KeyboardShortcut[] = [],
  options: KeyboardNavigationOptions = {}
) {
  const {
    enableShortcuts = true,
    enableFocusManagement = true,
    enableSkipLinks = true,
    trapFocus = false,
    restoreFocus = true
  } = options;

  const containerRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [focusableElements, setFocusableElements] = useState<FocusableElement[]>([]);
  const [currentFocusIndex, setCurrentFocusIndex] = useState(-1);

  // Focus management utilities
  const getFocusableElements = useCallback((container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="tab"]',
      '[role="option"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors))
      .filter((element) => {
        const el = element as HTMLElement;
        return el.offsetParent !== null && // Element is visible
               !el.hasAttribute('aria-hidden') &&
               el.getAttribute('aria-disabled') !== 'true';
      }) as HTMLElement[];
  }, []);

  // Update focusable elements when container changes
  const updateFocusableElements = useCallback(() => {
    if (!containerRef.current || !enableFocusManagement) return;

    const elements = getFocusableElements(containerRef.current);
    const focusableWithPriority = elements.map((element, index) => ({
      element,
      priority: parseInt(element.getAttribute('data-focus-priority') || '0', 10),
      group: element.getAttribute('data-focus-group') || undefined
    }));

    // Sort by priority (higher priority first)
    focusableWithPriority.sort((a, b) => b.priority - a.priority);
    setFocusableElements(focusableWithPriority);
  }, [enableFocusManagement, getFocusableElements]);

  // Focus management functions
  const focusFirst = useCallback(() => {
    if (focusableElements.length > 0) {
      focusableElements[0].element.focus();
      setCurrentFocusIndex(0);
    }
  }, [focusableElements]);

  const focusLast = useCallback(() => {
    if (focusableElements.length > 0) {
      const lastIndex = focusableElements.length - 1;
      focusableElements[lastIndex].element.focus();
      setCurrentFocusIndex(lastIndex);
    }
  }, [focusableElements]);

  const focusNext = useCallback(() => {
    if (focusableElements.length === 0) return;
    
    const nextIndex = (currentFocusIndex + 1) % focusableElements.length;
    focusableElements[nextIndex].element.focus();
    setCurrentFocusIndex(nextIndex);
  }, [focusableElements, currentFocusIndex]);

  const focusPrevious = useCallback(() => {
    if (focusableElements.length === 0) return;
    
    const prevIndex = currentFocusIndex <= 0 
      ? focusableElements.length - 1 
      : currentFocusIndex - 1;
    focusableElements[prevIndex].element.focus();
    setCurrentFocusIndex(prevIndex);
  }, [focusableElements, currentFocusIndex]);

  const focusByGroup = useCallback((group: string) => {
    const groupElements = focusableElements.filter(el => el.group === group);
    if (groupElements.length > 0) {
      groupElements[0].element.focus();
      setCurrentFocusIndex(focusableElements.indexOf(groupElements[0]));
    }
  }, [focusableElements]);

  // Skip link functionality
  const createSkipLink = useCallback((targetId: string, label: string) => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = label;
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg';
    skipLink.setAttribute('data-skip-link', 'true');
    
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    return skipLink;
  }, []);

  // Keyboard shortcut handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enableShortcuts) return;

    // Handle focus trapping
    if (trapFocus && containerRef.current?.contains(event.target as Node)) {
      if (event.key === 'Tab') {
        if (focusableElements.length === 0) {
          event.preventDefault();
          return;
        }

        if (event.shiftKey) {
          if (currentFocusIndex <= 0) {
            event.preventDefault();
            focusLast();
          }
        } else {
          if (currentFocusIndex >= focusableElements.length - 1) {
            event.preventDefault();
            focusFirst();
          }
        }
      }
    }

    // Handle custom shortcuts
    for (const shortcut of shortcuts) {
      if (shortcut.disabled) continue;

      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = !!event.ctrlKey === !!shortcut.ctrlKey;
      const altMatches = !!event.altKey === !!shortcut.altKey;
      const shiftMatches = !!event.shiftKey === !!shortcut.shiftKey;
      const metaMatches = !!event.metaKey === !!shortcut.metaKey;

      if (keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }

    // Handle arrow key navigation for custom components
    if (event.target && (event.target as HTMLElement).getAttribute('role') === 'tablist') {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        focusNext();
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        focusPrevious();
      } else if (event.key === 'Home') {
        event.preventDefault();
        focusFirst();
      } else if (event.key === 'End') {
        event.preventDefault();
        focusLast();
      }
    }
  }, [
    enableShortcuts,
    trapFocus,
    shortcuts,
    focusableElements,
    currentFocusIndex,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious
  ]);

  // Store previous focus when component mounts
  useEffect(() => {
    if (restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    return () => {
      // Restore focus when component unmounts
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [restoreFocus]);

  // Set up keyboard event listeners
  useEffect(() => {
    if (!enableShortcuts) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableShortcuts, handleKeyDown]);

  // Update focusable elements when container or options change
  useEffect(() => {
    updateFocusableElements();
    
    // Set up mutation observer to watch for DOM changes
    if (!containerRef.current) return;

    const observer = new MutationObserver(updateFocusableElements);
    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['disabled', 'aria-hidden', 'tabindex']
    });

    return () => observer.disconnect();
  }, [updateFocusableElements]);

  // Track current focus
  useEffect(() => {
    const handleFocusChange = () => {
      const activeElement = document.activeElement as HTMLElement;
      const index = focusableElements.findIndex(el => el.element === activeElement);
      setCurrentFocusIndex(index);
    };

    document.addEventListener('focusin', handleFocusChange);
    return () => document.removeEventListener('focusin', handleFocusChange);
  }, [focusableElements]);

  return {
    containerRef,
    focusableElements,
    currentFocusIndex,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    focusByGroup,
    createSkipLink,
    updateFocusableElements
  };
}

// Hook for managing ARIA live regions
export function useAriaLiveRegion() {
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!liveRegionRef.current) return;

    liveRegionRef.current.setAttribute('aria-live', priority);
    liveRegionRef.current.textContent = message;

    // Clear the message after a short delay to allow for re-announcements
    setTimeout(() => {
      if (liveRegionRef.current) {
        liveRegionRef.current.textContent = '';
      }
    }, 1000);
  }, []);

  const createLiveRegion = useCallback(() => {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'aria-live-region';
    
    return liveRegion;
  }, []);

  useEffect(() => {
    // Create live region if it doesn't exist
    let existingRegion = document.getElementById('aria-live-region');
    if (!existingRegion) {
      existingRegion = createLiveRegion();
      document.body.appendChild(existingRegion);
    }
    
    liveRegionRef.current = existingRegion as HTMLDivElement;

    return () => {
      // Clean up on unmount
      if (liveRegionRef.current && liveRegionRef.current.parentNode) {
        liveRegionRef.current.parentNode.removeChild(liveRegionRef.current);
      }
    };
  }, [createLiveRegion]);

  return { announce, liveRegionRef };
}