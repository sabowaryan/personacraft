/**
 * Custom hook for managing persona display state and interactions
 * Handles view modes, animations, and responsive behavior
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalStorage } from './use-local-storage';
import type { 
  PersonaDisplayConfig, 
  EnhancedPersona, 
  LayoutState, 
  TabConfig,
  AnimationConfig,
  InteractionState 
} from '@/lib/types/persona-display';

interface UsePersonaDisplayOptions {
  personaId?: string;
  initialTab?: string;
  enableAnimations?: boolean;
  responsive?: boolean;
}

interface UsePersonaDisplayReturn {
  // Display state
  displayConfig: PersonaDisplayConfig;
  layoutState: LayoutState;
  activeTab: string;
  viewMode: 'compact' | 'detailed';
  
  // Actions
  setActiveTab: (tab: string) => void;
  setViewMode: (mode: 'compact' | 'detailed') => void;
  toggleSidebar: () => void;
  updateDisplayConfig: (config: Partial<PersonaDisplayConfig>) => void;
  
  // Animation helpers
  getAnimationConfig: (type: string) => AnimationConfig;
  shouldAnimate: boolean;
  
  // Responsive helpers
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  
  // Interaction state
  interactionState: InteractionState;
  setInteractionState: (state: Partial<InteractionState>) => void;
  
  // Utility functions
  resetToDefaults: () => void;
  exportDisplayState: () => object;
  importDisplayState: (state: object) => void;
}

const DEFAULT_DISPLAY_CONFIG: PersonaDisplayConfig = {
  theme: 'auto',
  layout: 'detailed',
  animations: true,
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium',
  },
};

const DEFAULT_LAYOUT_STATE: LayoutState = {
  activeTab: 'overview',
  sidebarOpen: false,
  preferences: {
    displayMode: 'cards',
    defaultView: 'detailed',
    autoSave: true,
    notifications: {
      showTooltips: true,
      animateTransitions: true,
      soundEffects: false,
      showSuccessMessages: true,
    },
    exportDefaults: {
      defaultFormat: 'pdf',
      includeMetrics: true,
      includeCharts: true,
      paperSize: 'a4',
      orientation: 'portrait',
    },
    accessibility: {
      reducedMotion: false,
      highContrast: false,
      fontSize: 'medium',
      screenReader: false,
      keyboardNavigation: true,
    },
  },
  loading: false,
};

const ANIMATION_CONFIGS: Record<string, AnimationConfig> = {
  fadeIn: { duration: 300, easing: 'ease-out' },
  slideUp: { duration: 400, easing: 'ease-out' },
  scaleIn: { duration: 300, easing: 'ease-out' },
  bounce: { duration: 500, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' },
  stagger: { duration: 300, easing: 'ease-out', stagger: 100 },
};

export function usePersonaDisplay(options: UsePersonaDisplayOptions = {}): UsePersonaDisplayReturn {
  const {
    personaId,
    initialTab = 'overview',
    enableAnimations = true,
    responsive = true,
  } = options;

  // Persistent storage for display configuration
  const { value: displayConfig, setValue: setDisplayConfig } = useLocalStorage<PersonaDisplayConfig>(
    `persona-display-config-${personaId || 'global'}`,
    DEFAULT_DISPLAY_CONFIG
  );

  // Layout state management
  const [layoutState, setLayoutState] = useState<LayoutState>({
    ...DEFAULT_LAYOUT_STATE,
    activeTab: initialTab,
  });

  // Interaction state for hover, focus, etc.
  const [interactionState, setInteractionState] = useState<InteractionState>({
    isHovered: false,
    isFocused: false,
    isPressed: false,
    isLoading: false,
  });

  // Responsive breakpoint detection
  const [screenSize, setScreenSize] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  // Media query detection for accessibility preferences
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  // Initialize screen size and media queries
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateScreenSize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    const checkReducedMotion = () => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);
    };

    const checkHighContrast = () => {
      const mediaQuery = window.matchMedia('(prefers-contrast: high)');
      setHighContrast(mediaQuery.matches);
    };

    // Initial checks
    updateScreenSize();
    checkReducedMotion();
    checkHighContrast();

    // Event listeners
    window.addEventListener('resize', updateScreenSize);
    
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    
    reducedMotionQuery.addEventListener('change', checkReducedMotion);
    highContrastQuery.addEventListener('change', checkHighContrast);

    return () => {
      window.removeEventListener('resize', updateScreenSize);
      reducedMotionQuery.removeEventListener('change', checkReducedMotion);
      highContrastQuery.removeEventListener('change', checkHighContrast);
    };
  }, []);

  // Update display config based on system preferences
  useEffect(() => {
    setDisplayConfig(prev => ({
      ...prev,
      accessibility: {
        ...prev.accessibility,
        reducedMotion: reducedMotion || prev.accessibility.reducedMotion,
        highContrast: highContrast || prev.accessibility.highContrast,
      },
    }));
  }, [reducedMotion, highContrast, setDisplayConfig]);

  // Responsive breakpoint calculations
  const isMobile = useMemo(() => screenSize.width < 768, [screenSize.width]);
  const isTablet = useMemo(() => screenSize.width >= 768 && screenSize.width < 1024, [screenSize.width]);
  const isDesktop = useMemo(() => screenSize.width >= 1024, [screenSize.width]);

  // Animation control
  const shouldAnimate = useMemo(() => {
    return enableAnimations && 
           displayConfig.animations && 
           !displayConfig.accessibility.reducedMotion;
  }, [enableAnimations, displayConfig.animations, displayConfig.accessibility.reducedMotion]);

  // Action handlers
  const setActiveTab = useCallback((tab: string) => {
    setLayoutState(prev => ({
      ...prev,
      activeTab: tab,
    }));
  }, []);

  const setViewMode = useCallback((mode: 'compact' | 'detailed') => {
    setDisplayConfig(prev => ({
      ...prev,
      layout: mode,
    }));
  }, [setDisplayConfig]);

  const toggleSidebar = useCallback(() => {
    setLayoutState(prev => ({
      ...prev,
      sidebarOpen: !prev.sidebarOpen,
    }));
  }, []);

  const updateDisplayConfig = useCallback((config: Partial<PersonaDisplayConfig>) => {
    setDisplayConfig(prev => ({
      ...prev,
      ...config,
    }));
  }, [setDisplayConfig]);

  const getAnimationConfig = useCallback((type: string): AnimationConfig => {
    const config = ANIMATION_CONFIGS[type] || ANIMATION_CONFIGS.fadeIn;
    
    if (!shouldAnimate) {
      return { ...config, duration: 0 };
    }
    
    return config;
  }, [shouldAnimate]);

  const resetToDefaults = useCallback(() => {
    setDisplayConfig(DEFAULT_DISPLAY_CONFIG);
    setLayoutState(DEFAULT_LAYOUT_STATE);
    setInteractionState({
      isHovered: false,
      isFocused: false,
      isPressed: false,
      isLoading: false,
    });
  }, [setDisplayConfig]);

  const exportDisplayState = useCallback(() => {
    return {
      displayConfig,
      layoutState,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }, [displayConfig, layoutState]);

  const importDisplayState = useCallback((state: any) => {
    try {
      if (state.displayConfig) {
        setDisplayConfig(state.displayConfig);
      }
      if (state.layoutState) {
        setLayoutState(state.layoutState);
      }
    } catch (error) {
      console.error('Failed to import display state:', error);
    }
  }, [setDisplayConfig]);

  const updateInteractionState = useCallback((state: Partial<InteractionState>) => {
    setInteractionState(prev => ({
      ...prev,
      ...state,
    }));
  }, []);

  // Auto-close sidebar on mobile when tab changes
  useEffect(() => {
    if (isMobile && layoutState.sidebarOpen) {
      setLayoutState(prev => ({
        ...prev,
        sidebarOpen: false,
      }));
    }
  }, [layoutState.activeTab, isMobile]);

  return {
    // Display state
    displayConfig,
    layoutState,
    activeTab: layoutState.activeTab,
    viewMode: displayConfig.layout,
    
    // Actions
    setActiveTab,
    setViewMode,
    toggleSidebar,
    updateDisplayConfig,
    
    // Animation helpers
    getAnimationConfig,
    shouldAnimate,
    
    // Responsive helpers
    isMobile,
    isTablet,
    isDesktop,
    
    // Interaction state
    interactionState,
    setInteractionState: updateInteractionState,
    
    // Utility functions
    resetToDefaults,
    exportDisplayState,
    importDisplayState,
  };
}