'use client';

import { useMemo } from 'react';
import { usePersonaPreferences } from './use-persona-preferences';
import { cn } from '@/lib/utils';

/**
 * Hook for generating CSS classes based on user preferences
 * Provides utility functions for creating preference-aware styles
 */
export function usePreferenceStyles() {
  const { preferences } = usePersonaPreferences();

  // Generate base classes based on preferences
  const baseClasses = useMemo(() => {
    return cn(
      // Animation classes
      preferences.animations && !preferences.reducedMotion && 'transition-all duration-300',
      preferences.reducedMotion && 'motion-reduce:transition-none',
      
      // Font size classes
      preferences.fontSize === 'small' && 'text-sm',
      preferences.fontSize === 'large' && 'text-lg',
      
      // High contrast classes
      preferences.highContrast && 'contrast-more',
    );
  }, [preferences]);

  // Card styles based on preferences
  const getCardClasses = (additionalClasses?: string) => {
    return cn(
      'persona-result-card',
      baseClasses,
      preferences.animations && !preferences.reducedMotion && 'hover:shadow-lg hover:-translate-y-1',
      preferences.highContrast && 'border-2 border-current',
      additionalClasses
    );
  };

  // Button styles based on preferences
  const getButtonClasses = (variant: 'default' | 'outline' | 'ghost' = 'default', additionalClasses?: string) => {
    return cn(
      baseClasses,
      preferences.animations && !preferences.reducedMotion && 'hover:scale-105 active:scale-95',
      preferences.highContrast && variant === 'outline' && 'border-2',
      additionalClasses
    );
  };

  // Animation classes
  const getAnimationClasses = (animationType: 'fade' | 'slide' | 'scale' = 'fade') => {
    if (!preferences.animations || preferences.reducedMotion) {
      return '';
    }

    const animations = {
      fade: 'persona-animate-in',
      slide: 'persona-animate-in persona-slide-in',
      scale: 'persona-animate-scale',
    };

    return animations[animationType];
  };

  // Layout classes based on display mode
  const getLayoutClasses = () => {
    const layoutClasses = {
      grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
      list: 'flex flex-col space-y-4',
      cards: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
    };

    return cn(
      layoutClasses[preferences.displayMode],
      preferences.compactHeader && 'pt-2'
    );
  };

  // Text classes based on preferences
  const getTextClasses = (size: 'sm' | 'base' | 'lg' | 'xl' = 'base') => {
    const sizeMap = {
      sm: preferences.fontSize === 'large' ? 'text-base' : preferences.fontSize === 'small' ? 'text-xs' : 'text-sm',
      base: preferences.fontSize === 'large' ? 'text-lg' : preferences.fontSize === 'small' ? 'text-sm' : 'text-base',
      lg: preferences.fontSize === 'large' ? 'text-xl' : preferences.fontSize === 'small' ? 'text-base' : 'text-lg',
      xl: preferences.fontSize === 'large' ? 'text-2xl' : preferences.fontSize === 'small' ? 'text-lg' : 'text-xl',
    };

    return cn(
      sizeMap[size],
      preferences.highContrast && 'font-semibold'
    );
  };

  // Spacing classes based on compact mode
  const getSpacingClasses = (size: 'sm' | 'md' | 'lg' = 'md') => {
    const spacingMap = {
      sm: preferences.compactHeader ? 'p-2' : 'p-3',
      md: preferences.compactHeader ? 'p-3' : 'p-4',
      lg: preferences.compactHeader ? 'p-4' : 'p-6',
    };

    return spacingMap[size];
  };

  // Generate CSS custom properties for dynamic styling
  const getCSSProperties = () => {
    return {
      '--animation-duration': preferences.reducedMotion ? '0ms' : '300ms',
      '--animation-duration-fast': preferences.reducedMotion ? '0ms' : '150ms',
      '--animation-duration-slow': preferences.reducedMotion ? '0ms' : '500ms',
      '--font-size-scale': {
        small: '0.875',
        medium: '1',
        large: '1.125'
      }[preferences.fontSize],
      '--contrast-multiplier': preferences.highContrast ? '1.5' : '1',
    } as React.CSSProperties;
  };

  // Tooltip configuration based on preferences
  const getTooltipConfig = () => ({
    disabled: !preferences.showTooltips,
    delayDuration: preferences.reducedMotion ? 0 : 500,
    skipDelayDuration: preferences.reducedMotion ? 0 : 300,
  });

  // Sound effect helper
  const playSound = (soundType: 'click' | 'success' | 'error' = 'click') => {
    if (!preferences.soundEffects) return;

    // Simple sound implementation - in a real app, you'd use actual audio files
    const frequencies = {
      click: 800,
      success: 1000,
      error: 400,
    };

    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequencies[soundType];
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      } catch (error) {
        // Silently fail if audio context is not available
        console.debug('Audio context not available:', error);
      }
    }
  };

  return {
    preferences,
    baseClasses,
    getCardClasses,
    getButtonClasses,
    getAnimationClasses,
    getLayoutClasses,
    getTextClasses,
    getSpacingClasses,
    getCSSProperties,
    getTooltipConfig,
    playSound,
  };
}