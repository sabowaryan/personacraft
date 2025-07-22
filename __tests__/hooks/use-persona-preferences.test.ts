/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { usePersonaPreferences } from '@/hooks/use-persona-preferences';

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

// Mock document.documentElement
const mockDocumentElement = {
  setAttribute: jest.fn(),
  style: {
    setProperty: jest.fn(),
  },
  classList: {
    add: jest.fn(),
    remove: jest.fn(),
  },
};

Object.defineProperty(document, 'documentElement', {
  value: mockDocumentElement,
  writable: true,
});

describe('usePersonaPreferences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockMatchMedia.mockImplementation(() => ({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
  });

  describe('initialization', () => {
    it('should initialize with default preferences', () => {
      const { result } = renderHook(() => usePersonaPreferences());

      expect(result.current.preferences).toEqual({
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
      });
    });

    it('should load saved preferences from localStorage', () => {
      const savedPreferences = {
        defaultView: 'compact',
        displayMode: 'list',
        theme: 'dark',
        animations: false,
        fontSize: 'large',
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(savedPreferences));

      const { result } = renderHook(() => usePersonaPreferences());

      expect(result.current.originalPreferences.defaultView).toBe('compact');
      expect(result.current.originalPreferences.displayMode).toBe('list');
      expect(result.current.originalPreferences.theme).toBe('dark');
    });
  });

  describe('system preferences detection', () => {
    it('should detect reduced motion preference', () => {
      mockMatchMedia.mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      const { result } = renderHook(() => usePersonaPreferences());

      expect(result.current.systemPreferences.reducedMotion).toBe(true);
      expect(result.current.preferences.reducedMotion).toBe(true);
    });

    it('should detect high contrast preference', () => {
      mockMatchMedia.mockImplementation(query => ({
        matches: query === '(prefers-contrast: high)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      const { result } = renderHook(() => usePersonaPreferences());

      expect(result.current.systemPreferences.highContrast).toBe(true);
      expect(result.current.preferences.highContrast).toBe(true);
    });

    it('should detect dark mode preference', () => {
      mockMatchMedia.mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      const { result } = renderHook(() => usePersonaPreferences());

      expect(result.current.systemPreferences.darkMode).toBe(true);
    });

    it('should apply auto theme based on system preference', () => {
      mockMatchMedia.mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      const { result } = renderHook(() => usePersonaPreferences());

      // When theme is 'auto' and system prefers dark
      expect(result.current.preferences.theme).toBe('dark');
    });
  });

  describe('preference updates', () => {
    it('should update preferences correctly', () => {
      const { result } = renderHook(() => usePersonaPreferences());

      act(() => {
        result.current.updatePreferences({
          defaultView: 'compact',
          animations: false,
        });
      });

      expect(result.current.preferences.defaultView).toBe('compact');
      expect(result.current.preferences.animations).toBe(false);
      expect(result.current.preferences.displayMode).toBe('cards'); // Should preserve other values
    });

    it('should save preferences to localStorage when updated', () => {
      const { result } = renderHook(() => usePersonaPreferences());

      act(() => {
        result.current.updatePreferences({ theme: 'dark' });
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'persona-preferences',
        expect.stringContaining('"theme":"dark"')
      );
    });

    it('should reset preferences to defaults', () => {
      const { result } = renderHook(() => usePersonaPreferences());

      // Make some changes first
      act(() => {
        result.current.updatePreferences({
          theme: 'dark',
          animations: false,
          fontSize: 'large',
        });
      });

      // Reset to defaults
      act(() => {
        result.current.resetPreferences();
      });

      expect(result.current.preferences.theme).toBe('auto');
      expect(result.current.preferences.animations).toBe(true);
      expect(result.current.preferences.fontSize).toBe('medium');
    });
  });

  describe('toggle functions', () => {
    it('should toggle animations', () => {
      const { result } = renderHook(() => usePersonaPreferences());

      expect(result.current.preferences.animations).toBe(true);

      act(() => {
        result.current.toggleAnimations();
      });

      expect(result.current.preferences.animations).toBe(false);

      act(() => {
        result.current.toggleAnimations();
      });

      expect(result.current.preferences.animations).toBe(true);
    });

    it('should toggle tooltips', () => {
      const { result } = renderHook(() => usePersonaPreferences());

      expect(result.current.preferences.showTooltips).toBe(true);

      act(() => {
        result.current.toggleTooltips();
      });

      expect(result.current.preferences.showTooltips).toBe(false);
    });

    it('should toggle auto save', () => {
      const { result } = renderHook(() => usePersonaPreferences());

      expect(result.current.preferences.autoSave).toBe(true);

      act(() => {
        result.current.toggleAutoSave();
      });

      expect(result.current.preferences.autoSave).toBe(false);
    });

    it('should toggle sidebar', () => {
      const { result } = renderHook(() => usePersonaPreferences());

      expect(result.current.preferences.sidebarOpen).toBe(false);

      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.preferences.sidebarOpen).toBe(true);
    });

    it('should toggle reduced motion', () => {
      const { result } = renderHook(() => usePersonaPreferences());

      act(() => {
        result.current.toggleReducedMotion();
      });

      expect(result.current.preferences.reducedMotion).toBe(true);
    });

    it('should toggle high contrast', () => {
      const { result } = renderHook(() => usePersonaPreferences());

      act(() => {
        result.current.toggleHighContrast();
      });

      expect(result.current.preferences.highContrast).toBe(true);
    });

    it('should toggle sound effects', () => {
      const { result } = renderHook(() => usePersonaPreferences());

      expect(result.current.preferences.soundEffects).toBe(false);

      act(() => {
        result.current.toggleSoundEffects();
      });

      expect(result.current.preferences.soundEffects).toBe(true);
    });

    it('should toggle compact header', () => {
      const { result } = renderHook(() => usePersonaPreferences());

      expect(result.current.preferences.compactHeader).toBe(false);

      act(() => {
        result.current.toggleCompactHeader();
      });

      expect(result.current.preferences.compactHeader).toBe(true);
    });
  });

  describe('setter functions', () => {
    it('should set theme', async () => {
      const { result } = renderHook(() => usePersonaPreferences());

      await act(async () => {
        await result.current.setTheme('dark');
      });

      expect(result.current.preferences.theme).toBe('dark');
    });

    it('should set theme with transition when animations enabled', async () => {
      const { result } = renderHook(() => usePersonaPreferences());

      // Enable animations first
      act(() => {
        result.current.updatePreferences({ animations: true });
      });

      await act(async () => {
        await result.current.setTheme('dark');
      });

      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('theme-transitioning');
      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('theme-transitioning');
    });

    it('should set view mode', () => {
      const { result } = renderHook(() => usePersonaPreferences());

      act(() => {
        result.current.setViewMode('compact');
      });

      expect(result.current.preferences.defaultView).toBe('compact');
    });

    it('should set display mode', () => {
      const { result } = renderHook(() => usePersonaPreferences());

      act(() => {
        result.current.setDisplayMode('list');
      });

      expect(result.current.preferences.displayMode).toBe('list');
    });

    it('should set font size', () => {
      const { result } = renderHook(() => usePersonaPreferences());

      act(() => {
        result.current.setFontSize('large');
      });

      expect(result.current.preferences.fontSize).toBe('large');
    });

    it('should update export defaults', () => {
      const { result } = renderHook(() => usePersonaPreferences());

      act(() => {
        result.current.updateExportDefaults({
          format: 'csv',
          includeImages: false,
        });
      });

      expect(result.current.preferences.exportDefaults.format).toBe('csv');
      expect(result.current.preferences.exportDefaults.includeImages).toBe(false);
      expect(result.current.preferences.exportDefaults.includeMetrics).toBe(true); // Should preserve other values
    });
  });

  describe('CSS custom properties application', () => {
    it('should apply theme attribute to document element', () => {
      const { result } = renderHook(() => usePersonaPreferences());

      act(() => {
        result.current.setTheme('dark');
      });

      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });

    it('should apply font size attribute', () => {
      const { result } = renderHook(() => usePersonaPreferences());

      act(() => {
        result.current.setFontSize('large');
      });

      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith('data-font-size', 'large');
    });

    it('should apply accessibility attributes', () => {
      const { result } = renderHook(() => usePersonaPreferences());

      act(() => {
        result.current.toggleReducedMotion();
        result.current.toggleHighContrast();
      });

      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith('data-reduced-motion', 'true');
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith('data-high-contrast', 'true');
    });

    it('should set CSS custom properties for animations', () => {
      const { result } = renderHook(() => usePersonaPreferences());

      act(() => {
        result.current.toggleReducedMotion();
      });

      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--animation-duration', '0ms');
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--animation-duration-fast', '0ms');
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--animation-duration-slow', '0ms');
    });

    it('should set font size scale CSS property', () => {
      const { result } = renderHook(() => usePersonaPreferences());

      act(() => {
        result.current.setFontSize('large');
      });

      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith('--font-size-scale', '1.125');
    });
  });

  describe('preference validation', () => {
    it('should validate and correct invalid preferences', () => {
      const { result } = renderHook(() => usePersonaPreferences());

      const invalidPrefs = {
        theme: 'invalid-theme',
        fontSize: 'invalid-size',
        defaultView: 'invalid-view',
        displayMode: 'invalid-mode',
      };

      const validatedPrefs = result.current.validatePreferences(invalidPrefs);

      expect(validatedPrefs.theme).toBe('auto');
      expect(validatedPrefs.fontSize).toBe('medium');
      expect(validatedPrefs.defaultView).toBe('detailed');
      expect(validatedPrefs.displayMode).toBe('cards');
    });

    it('should preserve valid preferences during validation', () => {
      const { result } = renderHook(() => usePersonaPreferences());

      const validPrefs = {
        theme: 'dark',
        fontSize: 'large',
        defaultView: 'compact',
        displayMode: 'list',
        animations: false,
      };

      const validatedPrefs = result.current.validatePreferences(validPrefs);

      expect(validatedPrefs.theme).toBe('dark');
      expect(validatedPrefs.fontSize).toBe('large');
      expect(validatedPrefs.defaultView).toBe('compact');
      expect(validatedPrefs.displayMode).toBe('list');
      expect(validatedPrefs.animations).toBe(false);
    });
  });

  describe('transition state management', () => {
    it('should manage transition state during theme changes', async () => {
      const { result } = renderHook(() => usePersonaPreferences());

      expect(result.current.isTransitioning).toBe(false);

      const themeChangePromise = act(async () => {
        await result.current.setTheme('dark');
      });

      await themeChangePromise;

      expect(result.current.isTransitioning).toBe(false);
    });

    it('should skip transition when reduced motion is enabled', async () => {
      const { result } = renderHook(() => usePersonaPreferences());

      act(() => {
        result.current.toggleReducedMotion();
      });

      await act(async () => {
        await result.current.setTheme('dark');
      });

      expect(mockDocumentElement.classList.add).not.toHaveBeenCalledWith('theme-transitioning');
    });
  });

  describe('cleanup', () => {
    it('should remove event listeners on unmount', () => {
      const mockMediaQuery = {
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };

      mockMatchMedia.mockReturnValue(mockMediaQuery);

      const { unmount } = renderHook(() => usePersonaPreferences());

      unmount();

      expect(mockMediaQuery.removeEventListener).toHaveBeenCalled();
    });
  });
});