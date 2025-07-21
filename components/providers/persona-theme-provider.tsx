'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { usePersonaPreferences } from '@/hooks/use-persona-preferences';

interface PersonaThemeContextType {
  preferences: ReturnType<typeof usePersonaPreferences>['preferences'];
  isTransitioning: boolean;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
}

const PersonaThemeContext = createContext<PersonaThemeContextType | undefined>(undefined);

export function usePersonaTheme() {
  const context = useContext(PersonaThemeContext);
  if (!context) {
    throw new Error('usePersonaTheme must be used within a PersonaThemeProvider');
  }
  return context;
}

interface PersonaThemeProviderProps {
  children: React.ReactNode;
}

export function PersonaThemeProvider({ children }: PersonaThemeProviderProps) {
  const { preferences, originalPreferences, isTransitioning, setTheme } = usePersonaPreferences();

  // Apply theme to next-themes
  useEffect(() => {
    const resolvedTheme = originalPreferences.theme === 'auto' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : originalPreferences.theme;
    
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [originalPreferences.theme]);

  // Apply accessibility and preference attributes
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply all preference attributes
    root.setAttribute('data-font-size', preferences.fontSize);
    root.setAttribute('data-reduced-motion', preferences.reducedMotion.toString());
    root.setAttribute('data-high-contrast', preferences.highContrast.toString());
    root.setAttribute('data-animations', preferences.animations.toString());
    root.setAttribute('data-display-mode', preferences.displayMode);
    root.setAttribute('data-view-mode', preferences.defaultView);
    root.setAttribute('data-compact-header', preferences.compactHeader.toString());
    
    // Apply CSS custom properties for dynamic styling
    root.style.setProperty('--animation-duration', preferences.reducedMotion ? '0ms' : '300ms');
    root.style.setProperty('--animation-duration-fast', preferences.reducedMotion ? '0ms' : '150ms');
    root.style.setProperty('--animation-duration-slow', preferences.reducedMotion ? '0ms' : '500ms');
    
    // Font size scaling
    const fontSizeScale = {
      small: '0.875',
      medium: '1',
      large: '1.125'
    };
    root.style.setProperty('--font-size-scale', fontSizeScale[preferences.fontSize]);
    
    // High contrast adjustments
    if (preferences.highContrast) {
      root.style.setProperty('--contrast-multiplier', '1.5');
    } else {
      root.style.removeProperty('--contrast-multiplier');
    }
    
  }, [preferences]);

  const contextValue: PersonaThemeContextType = {
    preferences,
    isTransitioning,
    setTheme,
  };

  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme={originalPreferences.theme}
      enableSystem={originalPreferences.theme === 'auto'}
      disableTransitionOnChange={!preferences.animations || preferences.reducedMotion}
    >
      <PersonaThemeContext.Provider value={contextValue}>
        {children}
      </PersonaThemeContext.Provider>
    </NextThemeProvider>
  );
}

// Hook for components that need to respond to theme changes
export function useThemeTransition() {
  const { isTransitioning, preferences } = usePersonaTheme();
  
  return {
    isTransitioning,
    shouldAnimate: preferences.animations && !preferences.reducedMotion,
    transitionClass: isTransitioning ? 'theme-transitioning' : '',
  };
}

// Hook for accessibility-aware animations
export function useAccessibleAnimation() {
  const { preferences } = usePersonaTheme();
  
  const getAnimationProps = (duration: number = 300) => ({
    duration: preferences.reducedMotion ? 0 : duration,
    easing: 'ease-in-out',
  });
  
  const shouldAnimate = preferences.animations && !preferences.reducedMotion;
  
  return {
    shouldAnimate,
    getAnimationProps,
    animationClass: shouldAnimate ? 'animate-in' : '',
    transitionClass: shouldAnimate ? 'transition-all' : '',
  };
}