/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { usePersonaDisplay } from '@/hooks/use-persona-display';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock matchMedia
const mockMatchMedia = jest.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

describe('usePersonaDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => usePersonaDisplay());

      expect(result.current.displayConfig).toEqual({
        theme: 'auto',
        layout: 'detailed',
        animations: true,
        accessibility: {
          reducedMotion: false,
          highContrast: false,
          fontSize: 'medium',
        },
      });

      expect(result.current.layoutState.activeTab).toBe('overview');
      expect(result.current.layoutState.sidebarOpen).toBe(false);
    });

    it('should initialize with custom options', () => {
      const { result } = renderHook(() => 
        usePersonaDisplay({
          personaId: 'test-persona',
          initialTab: 'profile',
          enableAnimations: false,
        })
      );

      expect(result.current.activeTab).toBe('profile');
      expect(result.current.displayConfig.animations).toBe(true); // Still true from default config
    });

    it('should load saved configuration from localStorage', () => {
      const savedConfig = {
        theme: 'dark',
        layout: 'compact',
        animations: false,
        accessibility: {
          reducedMotion: true,
          highContrast: false,
          fontSize: 'large',
        },
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedConfig));

      const { result } = renderHook(() => usePersonaDisplay({ personaId: 'test' }));

      expect(result.current.displayConfig).toEqual(savedConfig);
    });
  });

  describe('responsive behavior', () => {
    it('should detect mobile breakpoint', () => {
      Object.defineProperty(window, 'innerWidth', { value: 600 });
      
      const { result } = renderHook(() => usePersonaDisplay());

      // Trigger resize event
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
    });

    it('should detect tablet breakpoint', () => {
      Object.defineProperty(window, 'innerWidth', { value: 800 });
      
      const { result } = renderHook(() => usePersonaDisplay());

      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isDesktop).toBe(false);
    });

    it('should detect desktop breakpoint', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1200 });
      
      const { result } = renderHook(() => usePersonaDisplay());

      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(true);
    });

    it('should auto-close sidebar on mobile when tab changes', () => {
      Object.defineProperty(window, 'innerWidth', { value: 600 });
      
      const { result } = renderHook(() => usePersonaDisplay());

      // Open sidebar first
      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.layoutState.sidebarOpen).toBe(true);

      // Trigger resize to mobile
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      // Change tab
      act(() => {
        result.current.setActiveTab('profile');
      });

      expect(result.current.layoutState.sidebarOpen).toBe(false);
    });
  });

  describe('accessibility preferences', () => {
    it('should detect reduced motion preference', () => {
      mockMatchMedia.mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      const { result } = renderHook(() => usePersonaDisplay());

      expect(result.current.displayConfig.accessibility.reducedMotion).toBe(true);
    });

    it('should detect high contrast preference', () => {
      mockMatchMedia.mockImplementation(query => ({
        matches: query === '(prefers-contrast: high)',
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      const { result } = renderHook(() => usePersonaDisplay());

      expect(result.current.displayConfig.accessibility.highContrast).toBe(true);
    });

    it('should disable animations when reduced motion is preferred', () => {
      mockMatchMedia.mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      const { result } = renderHook(() => usePersonaDisplay());

      expect(result.current.shouldAnimate).toBe(false);
    });
  });

  describe('actions', () => {
    it('should update active tab', () => {
      const { result } = renderHook(() => usePersonaDisplay());

      act(() => {
        result.current.setActiveTab('interests');
      });

      expect(result.current.activeTab).toBe('interests');
    });

    it('should toggle sidebar', () => {
      const { result } = renderHook(() => usePersonaDisplay());

      expect(result.current.layoutState.sidebarOpen).toBe(false);

      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.layoutState.sidebarOpen).toBe(true);

      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.layoutState.sidebarOpen).toBe(false);
    });

    it('should update view mode', () => {
      const { result } = renderHook(() => usePersonaDisplay());

      expect(result.current.viewMode).toBe('detailed');

      act(() => {
        result.current.setViewMode('compact');
      });

      expect(result.current.viewMode).toBe('compact');
    });

    it('should update display configuration', () => {
      const { result } = renderHook(() => usePersonaDisplay());

      act(() => {
        result.current.updateDisplayConfig({
          theme: 'dark',
          animations: false,
        });
      });

      expect(result.current.displayConfig.theme).toBe('dark');
      expect(result.current.displayConfig.animations).toBe(false);
      expect(result.current.displayConfig.layout).toBe('detailed'); // Should preserve other values
    });

    it('should update interaction state', () => {
      const { result } = renderHook(() => usePersonaDisplay());

      act(() => {
        result.current.setInteractionState({
          isHovered: true,
          isFocused: true,
        });
      });

      expect(result.current.interactionState.isHovered).toBe(true);
      expect(result.current.interactionState.isFocused).toBe(true);
      expect(result.current.interactionState.isPressed).toBe(false); // Should preserve other values
    });
  });

  describe('animation configuration', () => {
    it('should return animation config with duration when animations enabled', () => {
      const { result } = renderHook(() => usePersonaDisplay());

      const config = result.current.getAnimationConfig('fadeIn');

      expect(config).toEqual({
        duration: 300,
        easing: 'ease-out',
      });
    });

    it('should return zero duration when animations disabled', () => {
      const { result } = renderHook(() => 
        usePersonaDisplay({ enableAnimations: false })
      );

      // First update the config to disable animations
      act(() => {
        result.current.updateDisplayConfig({ animations: false });
      });

      const config = result.current.getAnimationConfig('fadeIn');

      expect(config.duration).toBe(0);
    });

    it('should return zero duration when reduced motion is preferred', () => {
      mockMatchMedia.mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      const { result } = renderHook(() => usePersonaDisplay());

      const config = result.current.getAnimationConfig('fadeIn');

      expect(config.duration).toBe(0);
    });

    it('should return default config for unknown animation type', () => {
      const { result } = renderHook(() => usePersonaDisplay());

      const config = result.current.getAnimationConfig('unknownAnimation');

      expect(config).toEqual({
        duration: 300,
        easing: 'ease-out',
      });
    });
  });

  describe('utility functions', () => {
    it('should reset to defaults', () => {
      const { result } = renderHook(() => usePersonaDisplay());

      // Make some changes first
      act(() => {
        result.current.setActiveTab('profile');
        result.current.toggleSidebar();
        result.current.updateDisplayConfig({ theme: 'dark' });
      });

      // Reset to defaults
      act(() => {
        result.current.resetToDefaults();
      });

      expect(result.current.activeTab).toBe('overview');
      expect(result.current.layoutState.sidebarOpen).toBe(false);
      expect(result.current.displayConfig.theme).toBe('auto');
    });

    it('should export display state', () => {
      const { result } = renderHook(() => usePersonaDisplay());

      const exportedState = result.current.exportDisplayState();

      expect(exportedState).toHaveProperty('displayConfig');
      expect(exportedState).toHaveProperty('layoutState');
      expect(exportedState).toHaveProperty('timestamp');
      expect(exportedState).toHaveProperty('version');
    });

    it('should import display state', () => {
      const { result } = renderHook(() => usePersonaDisplay());

      const stateToImport = {
        displayConfig: {
          theme: 'dark',
          layout: 'compact',
          animations: false,
          accessibility: {
            reducedMotion: true,
            highContrast: false,
            fontSize: 'large',
          },
        },
        layoutState: {
          activeTab: 'interests',
          sidebarOpen: true,
          preferences: expect.any(Object),
          loading: false,
        },
      };

      act(() => {
        result.current.importDisplayState(stateToImport);
      });

      expect(result.current.displayConfig.theme).toBe('dark');
      expect(result.current.activeTab).toBe('interests');
    });

    it('should handle invalid import state gracefully', () => {
      const { result } = renderHook(() => usePersonaDisplay());
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      act(() => {
        result.current.importDisplayState(null);
      });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to import display state:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('persistence', () => {
    it('should save configuration to localStorage when updated', () => {
      const { result } = renderHook(() => 
        usePersonaDisplay({ personaId: 'test-persona' })
      );

      act(() => {
        result.current.updateDisplayConfig({ theme: 'dark' });
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'persona-display-config-test-persona',
        expect.stringContaining('"theme":"dark"')
      );
    });

    it('should use global key when no personaId provided', () => {
      const { result } = renderHook(() => usePersonaDisplay());

      act(() => {
        result.current.updateDisplayConfig({ theme: 'light' });
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'persona-display-config-global',
        expect.stringContaining('"theme":"light"')
      );
    });
  });

  describe('cleanup', () => {
    it('should remove event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      const mockMediaQuery = {
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };

      mockMatchMedia.mockReturnValue(mockMediaQuery);

      const { unmount } = renderHook(() => usePersonaDisplay());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(mockMediaQuery.removeEventListener).toHaveBeenCalled();

      removeEventListenerSpy.mockRestore();
    });
  });
});