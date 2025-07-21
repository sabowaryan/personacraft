import { renderHook, act } from '@testing-library/react';
import { usePersonaPreferences } from '@/hooks/use-persona-preferences';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('usePersonaPreferences', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  it('should initialize with default preferences', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => usePersonaPreferences());
    
    expect(result.current.preferences.theme).toBe('light'); // Effective theme
    expect(result.current.originalPreferences.theme).toBe('auto'); // Original preference
    expect(result.current.preferences.animations).toBe(true);
    expect(result.current.preferences.fontSize).toBe('medium');
  });

  it('should update theme preference', async () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => usePersonaPreferences());
    
    await act(async () => {
      await result.current.setTheme('dark');
    });
    
    expect(result.current.originalPreferences.theme).toBe('dark');
    expect(result.current.preferences.theme).toBe('dark');
  });

  it('should toggle animations', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => usePersonaPreferences());
    
    act(() => {
      result.current.toggleAnimations();
    });
    
    expect(result.current.preferences.animations).toBe(false);
  });

  it('should update font size', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => usePersonaPreferences());
    
    act(() => {
      result.current.setFontSize('large');
    });
    
    expect(result.current.preferences.fontSize).toBe('large');
  });

  it('should toggle accessibility preferences', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => usePersonaPreferences());
    
    act(() => {
      result.current.toggleReducedMotion();
    });
    
    expect(result.current.preferences.reducedMotion).toBe(true);
    
    act(() => {
      result.current.toggleHighContrast();
    });
    
    expect(result.current.preferences.highContrast).toBe(true);
  });

  it('should update export defaults', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => usePersonaPreferences());
    
    act(() => {
      result.current.updateExportDefaults({ format: 'csv', includeImages: false });
    });
    
    expect(result.current.preferences.exportDefaults.format).toBe('csv');
    expect(result.current.preferences.exportDefaults.includeImages).toBe(false);
  });

  it('should reset preferences to defaults', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify({
      theme: 'dark',
      animations: false,
      fontSize: 'large'
    }));
    
    const { result } = renderHook(() => usePersonaPreferences());
    
    act(() => {
      result.current.resetPreferences();
    });
    
    expect(result.current.originalPreferences.theme).toBe('auto');
    expect(result.current.preferences.animations).toBe(true);
    expect(result.current.preferences.fontSize).toBe('medium');
  });

  it('should validate preferences correctly', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => usePersonaPreferences());
    
    const invalidPrefs = {
      theme: 'invalid' as any,
      fontSize: 'huge' as any,
      displayMode: 'unknown' as any,
    };
    
    const validated = result.current.validatePreferences(invalidPrefs);
    
    expect(validated.theme).toBe('auto');
    expect(validated.fontSize).toBe('medium');
    expect(validated.displayMode).toBe('cards');
  });
});