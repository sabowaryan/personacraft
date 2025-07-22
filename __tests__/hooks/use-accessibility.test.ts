/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useAccessibility } from '@/hooks/use-accessibility';

// Mock the keyboard navigation hook
jest.mock('@/hooks/use-keyboard-navigation', () => ({
  useKeyboardNavigation: jest.fn(() => ({
    focusedElement: null,
    setFocusedElement: jest.fn(),
    handleKeyDown: jest.fn(),
    createSkipLink: jest.fn((targetId, label) => {
      const link = document.createElement('a');
      link.href = `#${targetId}`;
      link.textContent = label;
      link.className = 'skip-link';
      return link;
    }),
    trapFocus: jest.fn(),
    restoreFocus: jest.fn(),
  })),
  useAriaLiveRegion: jest.fn(() => ({
    announce: jest.fn(),
  })),
}));

// Mock matchMedia
const mockMatchMedia = jest.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

describe('useAccessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
    mockMatchMedia.mockImplementation(() => ({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
  });

  describe('initialization', () => {
    it('should initialize with default options', () => {
      const { result } = renderHook(() => useAccessibility());

      expect(result.current.reducedMotion).toBe(false);
      expect(result.current.highContrast).toBe(false);
    });

    it('should detect reduced motion preference', () => {
      mockMatchMedia.mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      const { result } = renderHook(() => useAccessibility());

      expect(result.current.reducedMotion).toBe(true);
    });

    it('should detect high contrast preference', () => {
      mockMatchMedia.mockImplementation(query => ({
        matches: query === '(prefers-contrast: high)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      const { result } = renderHook(() => useAccessibility());

      expect(result.current.highContrast).toBe(true);
    });
  });

  describe('skip links creation', () => {
    it('should create skip links when enabled', () => {
      const skipLinks = [
        { targetId: 'main-content', label: 'Skip to main content' },
        { targetId: 'navigation', label: 'Skip to navigation' },
      ];

      renderHook(() => useAccessibility([], skipLinks, { enableSkipLinks: true }));

      const skipLinksContainer = document.querySelector('.skip-links-container');
      expect(skipLinksContainer).toBeInTheDocument();

      const skipLinkElements = document.querySelectorAll('.skip-link');
      expect(skipLinkElements).toHaveLength(2);
      expect(skipLinkElements[0]).toHaveAttribute('href', '#main-content');
      expect(skipLinkElements[0]).toHaveTextContent('Skip to main content');
    });

    it('should not create skip links when disabled', () => {
      const skipLinks = [
        { targetId: 'main-content', label: 'Skip to main content' },
      ];

      renderHook(() => useAccessibility([], skipLinks, { enableSkipLinks: false }));

      const skipLinksContainer = document.querySelector('.skip-links-container');
      expect(skipLinksContainer).not.toBeInTheDocument();
    });

    it('should clean up skip links on unmount', () => {
      const skipLinks = [
        { targetId: 'main-content', label: 'Skip to main content' },
      ];

      const { unmount } = renderHook(() => 
        useAccessibility([], skipLinks, { enableSkipLinks: true })
      );

      expect(document.querySelector('.skip-links-container')).toBeInTheDocument();

      unmount();

      expect(document.querySelector('.skip-links-container')).not.toBeInTheDocument();
    });
  });

  describe('announcements', () => {
    it('should announce changes when enabled', () => {
      const { useAriaLiveRegion } = require('@/hooks/use-keyboard-navigation');
      const mockAnnounce = jest.fn();
      useAriaLiveRegion.mockReturnValue({ announce: mockAnnounce });

      const { result } = renderHook(() => 
        useAccessibility([], [], { announceChanges: true })
      );

      act(() => {
        result.current.announceChange('Test message');
      });

      expect(mockAnnounce).toHaveBeenCalledWith('Test message', 'polite');
    });

    it('should not announce changes when disabled', () => {
      const { useAriaLiveRegion } = require('@/hooks/use-keyboard-navigation');
      const mockAnnounce = jest.fn();
      useAriaLiveRegion.mockReturnValue({ announce: mockAnnounce });

      const { result } = renderHook(() => 
        useAccessibility([], [], { announceChanges: false })
      );

      act(() => {
        result.current.announceChange('Test message');
      });

      expect(mockAnnounce).not.toHaveBeenCalled();
    });

    it('should announce with different priorities', () => {
      const { useAriaLiveRegion } = require('@/hooks/use-keyboard-navigation');
      const mockAnnounce = jest.fn();
      useAriaLiveRegion.mockReturnValue({ announce: mockAnnounce });

      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.announceChange('Polite message', 'polite');
        result.current.announceChange('Assertive message', 'assertive');
      });

      expect(mockAnnounce).toHaveBeenCalledWith('Polite message', 'polite');
      expect(mockAnnounce).toHaveBeenCalledWith('Assertive message', 'assertive');
    });

    it('should announce status with appropriate priority', () => {
      const { useAriaLiveRegion } = require('@/hooks/use-keyboard-navigation');
      const mockAnnounce = jest.fn();
      useAriaLiveRegion.mockReturnValue({ announce: mockAnnounce });

      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.announceStatus('Success message', 'success');
        result.current.announceStatus('Error message', 'error');
        result.current.announceStatus('Info message', 'info');
      });

      expect(mockAnnounce).toHaveBeenCalledWith('Success: Success message', 'polite');
      expect(mockAnnounce).toHaveBeenCalledWith('Error: Error message', 'assertive');
      expect(mockAnnounce).toHaveBeenCalledWith('Info: Info message', 'polite');
    });
  });

  describe('focus management', () => {
    it('should set focus to element by ID', () => {
      const testElement = document.createElement('button');
      testElement.id = 'test-button';
      testElement.focus = jest.fn();
      testElement.scrollIntoView = jest.fn();
      document.body.appendChild(testElement);

      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.setFocusToElement('test-button');
      });

      expect(testElement.focus).toHaveBeenCalled();
      expect(testElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      });
    });

    it('should use auto scroll behavior when reduced motion is enabled', () => {
      mockMatchMedia.mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }));

      const testElement = document.createElement('button');
      testElement.id = 'test-button';
      testElement.focus = jest.fn();
      testElement.scrollIntoView = jest.fn();
      document.body.appendChild(testElement);

      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.setFocusToElement('test-button');
      });

      expect(testElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'auto',
        block: 'start',
      });
    });

    it('should set focus to first error element', () => {
      const errorElement = document.createElement('input');
      errorElement.setAttribute('aria-invalid', 'true');
      errorElement.focus = jest.fn();
      errorElement.scrollIntoView = jest.fn();
      document.body.appendChild(errorElement);

      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.setFocusToFirstError();
      });

      expect(errorElement.focus).toHaveBeenCalled();
      expect(errorElement.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
      });
    });
  });

  describe('screen reader utilities', () => {
    it('should create screen reader only text', () => {
      const { result } = renderHook(() => useAccessibility());

      const srText = result.current.addScreenReaderText('Screen reader only text');

      expect(srText.className).toBe('sr-only');
      expect(srText.textContent).toBe('Screen reader only text');
    });

    it('should update aria label', () => {
      const testElement = document.createElement('button');
      testElement.id = 'test-button';
      document.body.appendChild(testElement);

      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.updateAriaLabel('test-button', 'New aria label');
      });

      expect(testElement.getAttribute('aria-label')).toBe('New aria label');
    });

    it('should update aria description', () => {
      const testElement = document.createElement('button');
      testElement.id = 'test-button';
      document.body.appendChild(testElement);

      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.updateAriaDescription('test-button', 'Description text');
      });

      const descriptionElement = document.getElementById('test-button-description');
      expect(descriptionElement).toBeInTheDocument();
      expect(descriptionElement?.textContent).toBe('Description text');
      expect(testElement.getAttribute('aria-describedby')).toBe('test-button-description');
    });
  });

  describe('error handling', () => {
    it('should set field error with proper ARIA attributes', () => {
      const { useAriaLiveRegion } = require('@/hooks/use-keyboard-navigation');
      const mockAnnounce = jest.fn();
      useAriaLiveRegion.mockReturnValue({ announce: mockAnnounce });

      const fieldElement = document.createElement('input');
      fieldElement.id = 'test-field';
      fieldElement.setAttribute('aria-label', 'Test Field');
      document.body.appendChild(fieldElement);

      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.setFieldError('test-field', 'This field is required');
      });

      expect(fieldElement.getAttribute('aria-invalid')).toBe('true');
      expect(fieldElement.getAttribute('aria-describedby')).toBe('test-field-error');

      const errorElement = document.getElementById('test-field-error');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement?.textContent).toBe('This field is required');
      expect(errorElement?.getAttribute('role')).toBe('alert');

      expect(mockAnnounce).toHaveBeenCalledWith(
        'Error in Test Field: This field is required',
        'assertive'
      );
    });

    it('should clear field error', () => {
      const fieldElement = document.createElement('input');
      fieldElement.id = 'test-field';
      fieldElement.setAttribute('aria-invalid', 'true');
      fieldElement.setAttribute('aria-describedby', 'test-field-error');
      document.body.appendChild(fieldElement);

      const errorElement = document.createElement('div');
      errorElement.id = 'test-field-error';
      document.body.appendChild(errorElement);

      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.clearFieldError('test-field');
      });

      expect(fieldElement.hasAttribute('aria-invalid')).toBe(false);
      expect(fieldElement.hasAttribute('aria-describedby')).toBe(false);
      expect(document.getElementById('test-field-error')).not.toBeInTheDocument();
    });
  });

  describe('progress updates', () => {
    it('should update progress with percentage calculation', () => {
      const { useAriaLiveRegion } = require('@/hooks/use-keyboard-navigation');
      const mockAnnounce = jest.fn();
      useAriaLiveRegion.mockReturnValue({ announce: mockAnnounce });

      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.updateProgress(3, 10, 'Loading');
      });

      expect(mockAnnounce).toHaveBeenCalledWith(
        'Loading: 30% complete, 3 of 10',
        'polite'
      );
    });

    it('should update progress without label', () => {
      const { useAriaLiveRegion } = require('@/hooks/use-keyboard-navigation');
      const mockAnnounce = jest.fn();
      useAriaLiveRegion.mockReturnValue({ announce: mockAnnounce });

      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.updateProgress(5, 8);
      });

      expect(mockAnnounce).toHaveBeenCalledWith(
        'Progress: 63% complete, 5 of 8',
        'polite'
      );
    });
  });

  describe('modal management', () => {
    it('should open modal with proper ARIA attributes and focus', () => {
      const { useAriaLiveRegion } = require('@/hooks/use-keyboard-navigation');
      const mockAnnounce = jest.fn();
      useAriaLiveRegion.mockReturnValue({ announce: mockAnnounce });

      const modalElement = document.createElement('div');
      modalElement.id = 'test-modal';
      modalElement.setAttribute('aria-hidden', 'true');

      const focusableElement = document.createElement('button');
      focusableElement.focus = jest.fn();
      modalElement.appendChild(focusableElement);

      document.body.appendChild(modalElement);

      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.openModal('test-modal');
      });

      expect(modalElement.getAttribute('aria-hidden')).toBe('false');
      expect(focusableElement.focus).toHaveBeenCalled();
      expect(mockAnnounce).toHaveBeenCalledWith('Dialog opened', 'polite');
    });

    it('should close modal with proper ARIA attributes', () => {
      const { useAriaLiveRegion } = require('@/hooks/use-keyboard-navigation');
      const mockAnnounce = jest.fn();
      useAriaLiveRegion.mockReturnValue({ announce: mockAnnounce });

      const modalElement = document.createElement('div');
      modalElement.id = 'test-modal';
      modalElement.setAttribute('aria-hidden', 'false');
      document.body.appendChild(modalElement);

      const { result } = renderHook(() => useAccessibility());

      act(() => {
        result.current.closeModal('test-modal');
      });

      expect(modalElement.getAttribute('aria-hidden')).toBe('true');
      expect(mockAnnounce).toHaveBeenCalledWith('Dialog closed', 'polite');
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

      const { unmount } = renderHook(() => useAccessibility());

      unmount();

      expect(mockMediaQuery.removeEventListener).toHaveBeenCalled();
    });
  });
});