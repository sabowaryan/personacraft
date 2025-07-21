'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAriaLiveRegion } from '@/hooks/use-keyboard-navigation';

interface AriaLiveRegionsProps {
  children: React.ReactNode;
}

export function AriaLiveRegions({ children }: AriaLiveRegionsProps) {
  const { announce } = useAriaLiveRegion();
  const statusRegionRef = useRef<HTMLDivElement>(null);
  const alertRegionRef = useRef<HTMLDivElement>(null);

  // Create global announcement function
  const globalAnnounce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announce(message, priority);
  }, [announce]);

  // Attach global announcement function to window for use by other components
  useEffect(() => {
    (window as any).announceToScreenReader = globalAnnounce;
    
    return () => {
      delete (window as any).announceToScreenReader;
    };
  }, [globalAnnounce]);

  return (
    <>
      {/* Main content */}
      {children}
      
      {/* Status updates (polite) */}
      <div
        ref={statusRegionRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="status-region"
        role="status"
      />
      
      {/* Important alerts (assertive) */}
      <div
        ref={alertRegionRef}
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        id="alert-region"
        role="alert"
      />
      
      {/* Loading announcements */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="sr-only"
        id="loading-region"
        role="status"
      />
      
      {/* Progress announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        id="progress-region"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </>
  );
}

// Hook for components to easily announce changes
export function usePersonaAnnouncements() {
  const { announce } = useAriaLiveRegion();

  const announceTabChange = useCallback((tabName: string) => {
    announce(`Switched to ${tabName} tab`, 'polite');
  }, [announce]);

  const announceDataLoaded = useCallback((dataType: string) => {
    announce(`${dataType} data loaded successfully`, 'polite');
  }, [announce]);

  const announceError = useCallback((error: string) => {
    announce(`Error: ${error}`, 'assertive');
  }, [announce]);

  const announceSuccess = useCallback((message: string) => {
    announce(`Success: ${message}`, 'polite');
  }, [announce]);

  const announceProgress = useCallback((current: number, total: number, task: string) => {
    const percentage = Math.round((current / total) * 100);
    announce(`${task}: ${percentage}% complete, ${current} of ${total}`, 'polite');
  }, [announce]);

  const announceExportStart = useCallback((format: string) => {
    announce(`Starting export to ${format} format`, 'polite');
  }, [announce]);

  const announceExportComplete = useCallback((format: string) => {
    announce(`Export to ${format} completed successfully`, 'polite');
  }, [announce]);

  const announceShareStart = useCallback(() => {
    announce('Preparing persona for sharing', 'polite');
  }, [announce]);

  const announceShareComplete = useCallback(() => {
    announce('Share link generated successfully', 'polite');
  }, [announce]);

  const announceMetricsUpdate = useCallback((qualityScore: number, completionScore: number) => {
    announce(
      `Quality metrics updated: Quality score ${qualityScore}%, Completion score ${completionScore}%`,
      'polite'
    );
  }, [announce]);

  const announceFilterChange = useCallback((filterType: string, filterValue: string) => {
    announce(`Filter applied: ${filterType} set to ${filterValue}`, 'polite');
  }, [announce]);

  const announceSearchResults = useCallback((resultCount: number, searchTerm: string) => {
    const message = resultCount === 0 
      ? `No results found for "${searchTerm}"`
      : `${resultCount} result${resultCount === 1 ? '' : 's'} found for "${searchTerm}"`;
    announce(message, 'polite');
  }, [announce]);

  return {
    announceTabChange,
    announceDataLoaded,
    announceError,
    announceSuccess,
    announceProgress,
    announceExportStart,
    announceExportComplete,
    announceShareStart,
    announceShareComplete,
    announceMetricsUpdate,
    announceFilterChange,
    announceSearchResults
  };
}

// Component for announcing loading states
export function LoadingAnnouncement({ 
  isLoading, 
  loadingMessage = 'Loading...', 
  completedMessage = 'Loading complete' 
}: {
  isLoading: boolean;
  loadingMessage?: string;
  completedMessage?: string;
}) {
  const { announce } = useAriaLiveRegion();

  useEffect(() => {
    if (isLoading) {
      announce(loadingMessage, 'polite');
    } else {
      announce(completedMessage, 'polite');
    }
  }, [isLoading, loadingMessage, completedMessage, announce]);

  return null;
}

// Component for announcing form validation errors
export function ValidationAnnouncement({ 
  errors, 
  fieldLabels = {} 
}: {
  errors: Record<string, string>;
  fieldLabels?: Record<string, string>;
}) {
  const { announce } = useAriaLiveRegion();

  useEffect(() => {
    const errorMessages = Object.entries(errors).map(([field, message]) => {
      const label = fieldLabels[field] || field;
      return `${label}: ${message}`;
    });

    if (errorMessages.length > 0) {
      const fullMessage = `Form validation errors: ${errorMessages.join(', ')}`;
      announce(fullMessage, 'assertive');
    }
  }, [errors, fieldLabels, announce]);

  return null;
}

// Component for announcing dynamic content changes
export function ContentChangeAnnouncement({ 
  content, 
  contentType = 'content' 
}: {
  content: any;
  contentType?: string;
}) {
  const { announce } = useAriaLiveRegion();
  const previousContentRef = useRef(content);

  useEffect(() => {
    if (content !== previousContentRef.current) {
      announce(`${contentType} updated`, 'polite');
      previousContentRef.current = content;
    }
  }, [content, contentType, announce]);

  return null;
}