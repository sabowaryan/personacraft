'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useKeyboardNavigation, useAriaLiveRegion, KeyboardShortcut } from './use-keyboard-navigation';

export interface AccessibilityOptions {
  enableKeyboardNavigation?: boolean;
  enableScreenReaderSupport?: boolean;
  enableFocusManagement?: boolean;
  enableSkipLinks?: boolean;
  trapFocus?: boolean;
  restoreFocus?: boolean;
  announceChanges?: boolean;
}

export interface SkipLinkConfig {
  targetId: string;
  label: string;
  position?: 'top' | 'bottom';
}

export function useAccessibility(
  shortcuts: KeyboardShortcut[] = [],
  skipLinks: SkipLinkConfig[] = [],
  options: AccessibilityOptions = {}
) {
  const {
    enableKeyboardNavigation = true,
    enableScreenReaderSupport = true,
    enableFocusManagement = true,
    enableSkipLinks = true,
    trapFocus = false,
    restoreFocus = true,
    announceChanges = true
  } = options;

  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const skipLinksContainerRef = useRef<HTMLDivElement>(null);

  // Initialize keyboard navigation
  const keyboardNavigation = useKeyboardNavigation(shortcuts, {
    enableShortcuts: enableKeyboardNavigation,
    enableFocusManagement,
    enableSkipLinks,
    trapFocus,
    restoreFocus
  });

  // Initialize ARIA live region
  const { announce } = useAriaLiveRegion();

  // Detect user preferences
  useEffect(() => {
    const checkReducedMotion = () => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);
    };

    const checkHighContrast = () => {
      const mediaQuery = window.matchMedia('(prefers-contrast: high)');
      setHighContrast(mediaQuery.matches);
    };

    checkReducedMotion();
    checkHighContrast();

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

    reducedMotionQuery.addEventListener('change', checkReducedMotion);
    highContrastQuery.addEventListener('change', checkHighContrast);

    return () => {
      reducedMotionQuery.removeEventListener('change', checkReducedMotion);
      highContrastQuery.removeEventListener('change', checkHighContrast);
    };
  }, []);

  // Create skip links
  useEffect(() => {
    if (!enableSkipLinks || skipLinks.length === 0) return;

    const container = document.createElement('div');
    container.className = 'skip-links-container';
    container.setAttribute('aria-label', 'Skip navigation links');
    
    skipLinks.forEach((skipLink) => {
      const link = keyboardNavigation.createSkipLink(skipLink.targetId, skipLink.label);
      container.appendChild(link);
    });

    // Insert skip links at the beginning of the body
    document.body.insertBefore(container, document.body.firstChild);
    skipLinksContainerRef.current = container;

    return () => {
      if (skipLinksContainerRef.current && skipLinksContainerRef.current.parentNode) {
        skipLinksContainerRef.current.parentNode.removeChild(skipLinksContainerRef.current);
      }
    };
  }, [enableSkipLinks, skipLinks, keyboardNavigation]);

  // Announce important changes
  const announceChange = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announceChanges && enableScreenReaderSupport) {
      announce(message, priority);
    }
  }, [announce, announceChanges, enableScreenReaderSupport]);

  // Focus management utilities
  const setFocusToElement = useCallback((elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }, [reducedMotion]);

  const setFocusToFirstError = useCallback(() => {
    const firstError = document.querySelector('[aria-invalid="true"], .error, [data-error="true"]') as HTMLElement;
    if (firstError) {
      firstError.focus();
      firstError.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
    }
  }, [reducedMotion]);

  // Screen reader utilities
  const addScreenReaderText = useCallback((text: string) => {
    const srText = document.createElement('span');
    srText.className = 'sr-only';
    srText.textContent = text;
    return srText;
  }, []);

  const updateAriaLabel = useCallback((elementId: string, label: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.setAttribute('aria-label', label);
    }
  }, []);

  const updateAriaDescription = useCallback((elementId: string, description: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      // Create or update description element
      let descElement = document.getElementById(`${elementId}-description`);
      if (!descElement) {
        descElement = document.createElement('div');
        descElement.id = `${elementId}-description`;
        descElement.className = 'sr-only';
        element.parentNode?.appendChild(descElement);
      }
      descElement.textContent = description;
      element.setAttribute('aria-describedby', `${elementId}-description`);
    }
  }, []);

  // Validation and error handling
  const setFieldError = useCallback((fieldId: string, errorMessage: string) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.setAttribute('aria-invalid', 'true');
      
      // Create or update error message
      let errorElement = document.getElementById(`${fieldId}-error`);
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = `${fieldId}-error`;
        errorElement.className = 'text-sm text-destructive mt-1';
        errorElement.setAttribute('role', 'alert');
        field.parentNode?.appendChild(errorElement);
      }
      
      errorElement.textContent = errorMessage;
      field.setAttribute('aria-describedby', `${fieldId}-error`);
      
      announceChange(`Error in ${field.getAttribute('aria-label') || fieldId}: ${errorMessage}`, 'assertive');
    }
  }, [announceChange]);

  const clearFieldError = useCallback((fieldId: string) => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
      
      const errorElement = document.getElementById(`${fieldId}-error`);
      if (errorElement && errorElement.parentNode) {
        errorElement.parentNode.removeChild(errorElement);
      }
    }
  }, []);

  // Progress and status updates
  const updateProgress = useCallback((current: number, total: number, label?: string) => {
    const percentage = Math.round((current / total) * 100);
    const message = label 
      ? `${label}: ${percentage}% complete, ${current} of ${total}`
      : `Progress: ${percentage}% complete, ${current} of ${total}`;
    
    announceChange(message, 'polite');
  }, [announceChange]);

  const announceStatus = useCallback((status: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const priority = type === 'error' ? 'assertive' : 'polite';
    announceChange(`${type.charAt(0).toUpperCase() + type.slice(1)}: ${status}`, priority);
  }, [announceChange]);

  // Modal and dialog management
  const openModal = useCallback((modalId: string) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.setAttribute('aria-hidden', 'false');
      
      // Find first focusable element in modal
      const firstFocusable = modal.querySelector(
        'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      
      if (firstFocusable) {
        firstFocusable.focus();
      }
      
      announceChange('Dialog opened', 'polite');
    }
  }, [announceChange]);

  const closeModal = useCallback((modalId: string) => {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.setAttribute('aria-hidden', 'true');
      announceChange('Dialog closed', 'polite');
    }
  }, [announceChange]);

  return {
    // Keyboard navigation
    ...keyboardNavigation,
    
    // Accessibility state
    reducedMotion,
    highContrast,
    
    // Announcement utilities
    announceChange,
    announceStatus,
    updateProgress,
    
    // Focus management
    setFocusToElement,
    setFocusToFirstError,
    
    // Screen reader utilities
    addScreenReaderText,
    updateAriaLabel,
    updateAriaDescription,
    
    // Error handling
    setFieldError,
    clearFieldError,
    
    // Modal management
    openModal,
    closeModal
  };
}