'use client';

import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from './use-local-storage';

export interface PersonaPreferences {
  // Display preferences
  defaultView: 'detailed' | 'compact';
  displayMode: 'grid' | 'list' | 'cards';

  // Theme preferences
  theme: 'light' | 'dark' | 'auto';

  // Animation preferences
  animations: boolean;
  reducedMotion: boolean;

  // Accessibility preferences
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';

  // Notification preferences
  showTooltips: boolean;
  soundEffects: boolean;

  // Export preferences
  autoSave: boolean;
  exportDefaults: {
    format: 'pdf' | 'csv' | 'json';
    includeImages: boolean;
    includeMetrics: boolean;
  };

  // Layout preferences
  sidebarOpen: boolean;
  compactHeader: boolean;
}

const defaultPreferences: PersonaPreferences = {
  defaultView: 'detailed',
  displayMode: 'cards',
  theme: 'auto',
  animations: true,
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium',
  showTooltips: true,
  soundEffects: false,
  autoSave: true,
  exportDefaults: {
    format: 'pdf',
    includeImages: true,
    includeMetrics: true,
  },
  sidebarOpen: false,
  compactHeader: false,
};

export function usePersonaPreferences() {
  const { value: preferences, setValue: setPreferences } = useLocalStorage<PersonaPreferences>(
    'persona-preferences',
    defaultPreferences
  );

  // Theme transition state
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Detect system preferences
  const [systemPreferences, setSystemPreferences] = useState({
    reducedMotion: false,
    highContrast: false,
    darkMode: false,
  });

  // Update system preferences on mount and when they change
  useEffect(() => {
    const updateSystemPreferences = () => {
      setSystemPreferences({
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        highContrast: window.matchMedia('(prefers-contrast: high)').matches,
        darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      });
    };

    updateSystemPreferences();

    const mediaQueries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-contrast: high)'),
      window.matchMedia('(prefers-color-scheme: dark)'),
    ];

    mediaQueries.forEach(mq => mq.addEventListener('change', updateSystemPreferences));

    return () => {
      mediaQueries.forEach(mq => mq.removeEventListener('change', updateSystemPreferences));
    };
  }, []);

  // Apply system preferences when theme is auto
  const effectivePreferences = {
    ...preferences,
    reducedMotion: preferences.reducedMotion || systemPreferences.reducedMotion,
    highContrast: preferences.highContrast || systemPreferences.highContrast,
    theme: preferences.theme === 'auto'
      ? (systemPreferences.darkMode ? 'dark' : 'light')
      : preferences.theme,
  };

  // Update preferences
  const updatePreferences = useCallback((updates: Partial<PersonaPreferences>) => {
    setPreferences((prev: PersonaPreferences) => ({ ...prev, ...updates }));
  }, [setPreferences]);

  // Reset to defaults
  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
  }, [setPreferences]);

  // Toggle specific preferences
  const toggleAnimations = useCallback(() => {
    updatePreferences({ animations: !preferences.animations });
  }, [preferences.animations, updatePreferences]);

  const toggleTooltips = useCallback(() => {
    updatePreferences({ showTooltips: !preferences.showTooltips });
  }, [preferences.showTooltips, updatePreferences]);

  const toggleAutoSave = useCallback(() => {
    updatePreferences({ autoSave: !preferences.autoSave });
  }, [preferences.autoSave, updatePreferences]);

  const toggleSidebar = useCallback(() => {
    updatePreferences({ sidebarOpen: !preferences.sidebarOpen });
  }, [preferences.sidebarOpen, updatePreferences]);

  // Set theme with smooth transition
  const setTheme = useCallback(async (theme: PersonaPreferences['theme']) => {
    if (effectivePreferences.animations && !effectivePreferences.reducedMotion) {
      setIsTransitioning(true);
      
      // Add transition class to document
      document.documentElement.classList.add('theme-transitioning');
      
      // Update theme
      updatePreferences({ theme });
      
      // Wait for transition to complete
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Remove transition class
      document.documentElement.classList.remove('theme-transitioning');
      setIsTransitioning(false);
    } else {
      updatePreferences({ theme });
    }
  }, [updatePreferences, effectivePreferences.animations, effectivePreferences.reducedMotion]);

  // Set view mode
  const setViewMode = useCallback((defaultView: PersonaPreferences['defaultView']) => {
    updatePreferences({ defaultView });
  }, [updatePreferences]);

  // Set display mode
  const setDisplayMode = useCallback((displayMode: PersonaPreferences['displayMode']) => {
    updatePreferences({ displayMode });
  }, [updatePreferences]);

  // Set font size
  const setFontSize = useCallback((fontSize: PersonaPreferences['fontSize']) => {
    updatePreferences({ fontSize });
  }, [updatePreferences]);

  // Update export defaults
  const updateExportDefaults = useCallback((exportDefaults: Partial<PersonaPreferences['exportDefaults']>) => {
    updatePreferences({
      exportDefaults: { ...preferences.exportDefaults, ...exportDefaults }
    });
  }, [preferences.exportDefaults, updatePreferences]);

  // Accessibility preference controls
  const toggleReducedMotion = useCallback(() => {
    updatePreferences({ reducedMotion: !preferences.reducedMotion });
  }, [preferences.reducedMotion, updatePreferences]);

  const toggleHighContrast = useCallback(() => {
    updatePreferences({ highContrast: !preferences.highContrast });
  }, [preferences.highContrast, updatePreferences]);

  const toggleSoundEffects = useCallback(() => {
    updatePreferences({ soundEffects: !preferences.soundEffects });
  }, [preferences.soundEffects, updatePreferences]);

  const toggleCompactHeader = useCallback(() => {
    updatePreferences({ compactHeader: !preferences.compactHeader });
  }, [preferences.compactHeader, updatePreferences]);

  // Apply CSS custom properties for theme and accessibility
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme
    root.setAttribute('data-theme', effectivePreferences.theme);
    
    // Apply font size
    root.setAttribute('data-font-size', effectivePreferences.fontSize);
    
    // Apply accessibility preferences
    root.setAttribute('data-reduced-motion', effectivePreferences.reducedMotion.toString());
    root.setAttribute('data-high-contrast', effectivePreferences.highContrast.toString());
    root.setAttribute('data-animations', effectivePreferences.animations.toString());
    
    // Apply CSS custom properties
    root.style.setProperty('--animation-duration', effectivePreferences.reducedMotion ? '0ms' : '300ms');
    root.style.setProperty('--animation-duration-fast', effectivePreferences.reducedMotion ? '0ms' : '150ms');
    root.style.setProperty('--animation-duration-slow', effectivePreferences.reducedMotion ? '0ms' : '500ms');
    
    // Font size scaling
    const fontSizeScale = {
      small: '0.875',
      medium: '1',
      large: '1.125'
    };
    root.style.setProperty('--font-size-scale', fontSizeScale[effectivePreferences.fontSize]);
    
  }, [effectivePreferences]);

  // Preference validation and migration
  const validatePreferences = useCallback((prefs: Partial<PersonaPreferences>): PersonaPreferences => {
    return {
      ...defaultPreferences,
      ...prefs,
      // Ensure valid values
      theme: ['light', 'dark', 'auto'].includes(prefs.theme || '') ? prefs.theme! : 'auto',
      fontSize: ['small', 'medium', 'large'].includes(prefs.fontSize || '') ? prefs.fontSize! : 'medium',
      defaultView: ['detailed', 'compact'].includes(prefs.defaultView || '') ? prefs.defaultView! : 'detailed',
      displayMode: ['grid', 'list', 'cards'].includes(prefs.displayMode || '') ? prefs.displayMode! : 'cards',
    };
  }, []);

  return {
    preferences: effectivePreferences,
    originalPreferences: preferences, // Original preferences without system overrides
    systemPreferences,
    isTransitioning,
    updatePreferences,
    resetPreferences,
    validatePreferences,
    // Theme controls
    setTheme,
    // Display controls
    setViewMode,
    setDisplayMode,
    setFontSize,
    // Toggle controls
    toggleAnimations,
    toggleTooltips,
    toggleAutoSave,
    toggleSidebar,
    toggleReducedMotion,
    toggleHighContrast,
    toggleSoundEffects,
    toggleCompactHeader,
    // Export controls
    updateExportDefaults,
  };
}