/**
 * Integration Tests for Persona Result Redesign
 * 
 * This test suite covers end-to-end user workflows, responsive behavior,
 * export functionality, and accessibility features for the redesigned
 * persona result interface.
 * 
 * Requirements covered: 6.1, 4.2, 3.5, 8.1
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';

// Mock components and hooks
import { PersonaResultLayout } from '@/components/persona-result/PersonaResultLayout';
import { PersonaHeroSection } from '@/components/persona-result/PersonaHeroSection';
import { QualityMetricsGrid } from '@/components/persona-result/QualityMetricsGrid';
import { PersonaTabNavigation } from '@/components/persona-result/PersonaTabNavigation';

// Test utilities and mocks
import { mockPersonaData, mockUserPreferences } from '../__mocks__/persona-data';
import { createMockIntersectionObserver } from '../__mocks__/intersection-observer';
import { createMockResizeObserver } from '../__mocks__/resize-observer';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Setup mocks
beforeAll(() => {
  // Mock observers
  global.IntersectionObserver = createMockIntersectionObserver();
  global.ResizeObserver = createMockResizeObserver();
  
  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });

  // Mock clipboard API
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: jest.fn().mockResolvedValue(undefined),
      readText: jest.fn().mockResolvedValue(''),
    },
    writable: true,
  });

  // Mock print functionality
  window.print = jest.fn();
});

describe('Persona Result Integration Tests', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
  });

  describe('End-to-End User Workflows', () => {
    test('complete persona viewing workflow', async () => {
      render(
        <PersonaResultLayout 
          persona={mockPersonaData}
          viewMode="detailed"
          onViewModeChange={jest.fn()}
        >
          <PersonaHeroSection persona={mockPersonaData} />
          <QualityMetricsGrid metrics={mockPersonaData.metrics} />
          <PersonaTabNavigation 
            activeTab="profile"
            onTabChange={jest.fn()}
            tabs={[
              { id: 'profile', label: 'Profile', icon: () => <div>Icon</div> },
              { id: 'interests', label: 'Interests', icon: () => <div>Icon</div> },
              { id: 'communication', label: 'Communication', icon: () => <div>Icon</div> }
            ]}
          />
        </PersonaResultLayout>
      );

      // Verify initial load
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByText(mockPersonaData.name)).toBeInTheDocument();
      
      // Verify hero section displays
      expect(screen.getByRole('img', { name: /avatar/i })).toBeInTheDocument();
      
      // Verify metrics are displayed
      expect(screen.getByText(/quality score/i)).toBeInTheDocument();
      
      // Verify tab navigation
      const tabList = screen.getByRole('tablist');
      expect(tabList).toBeInTheDocument();
      
      const profileTab = screen.getByRole('tab', { name: /profile/i });
      const interestsTab = screen.getByRole('tab', { name: /interests/i });
      
      expect(profileTab).toBeInTheDocument();
      expect(interestsTab).toBeInTheDocument();
      
      // Test tab switching
      await user.click(interestsTab);
      expect(interestsTab).toHaveAttribute('aria-selected', 'true');
    });

    test('persona data loading and error states', async () => {
      const mockOnError = jest.fn();
      
      // Test loading state
      render(
        <PersonaResultLayout 
          persona={null}
          viewMode="detailed"
          onViewModeChange={jest.fn()}
          loading={true}
        >
          <div>Loading content...</div>
        </PersonaResultLayout>
      );

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
      
      // Test error state
      const { rerender } = render(
        <PersonaResultLayout 
          persona={null}
          viewMode="detailed"
          onViewModeChange={jest.fn()}
          error="Failed to load persona"
          onError={mockOnError}
        >
          <div>Error content</div>
        </PersonaResultLayout>
      );

      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });

    test('view mode switching workflow', async () => {
      const mockOnViewModeChange = jest.fn();
      
      render(
        <PersonaResultLayout 
          persona={mockPersonaData}
          viewMode="detailed"
          onViewModeChange={mockOnViewModeChange}
        >
          <PersonaHeroSection persona={mockPersonaData} />
        </PersonaResultLayout>
      );

      // Find and click view mode toggle
      const viewModeButton = screen.getByRole('button', { name: /compact view/i });
      await user.click(viewModeButton);
      
      expect(mockOnViewModeChange).toHaveBeenCalledWith('compact');
    });
  });

  describe('Responsive Behavior Testing', () => {
    const breakpoints = {
      mobile: { width: 375, height: 667 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1024, height: 768 },
      large: { width: 1440, height: 900 }
    };

    Object.entries(breakpoints).forEach(([device, dimensions]) => {
      test(`responsive layout at ${device} breakpoint`, async () => {
        // Mock viewport dimensions
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: dimensions.width,
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          configurable: true,
          value: dimensions.height,
        });

        // Mock matchMedia for responsive queries
        window.matchMedia = jest.fn().mockImplementation(query => ({
          matches: query.includes(`${dimensions.width}px`),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }));

        render(
          <PersonaResultLayout 
            persona={mockPersonaData}
            viewMode="detailed"
            onViewModeChange={jest.fn()}
          >
            <PersonaHeroSection persona={mockPersonaData} />
            <QualityMetricsGrid metrics={mockPersonaData.metrics} />
          </PersonaResultLayout>
        );

        const layout = screen.getByRole('main');
        expect(layout).toBeInTheDocument();

        // Verify responsive classes are applied
        if (dimensions.width < 768) {
          // Mobile-specific tests
          expect(layout).toHaveClass(/mobile/);
        } else if (dimensions.width < 1024) {
          // Tablet-specific tests
          expect(layout).toHaveClass(/tablet/);
        } else {
          // Desktop-specific tests
          expect(layout).toHaveClass(/desktop/);
        }

        // Fire resize event
        fireEvent(window, new Event('resize'));
        
        await waitFor(() => {
          expect(layout).toBeInTheDocument();
        });
      });
    });

    test('touch interactions on mobile devices', async () => {
      // Mock touch device
      Object.defineProperty(window, 'ontouchstart', {
        value: {},
        writable: true
      });

      render(
        <PersonaTabNavigation 
          activeTab="profile"
          onTabChange={jest.fn()}
          tabs={[
            { id: 'profile', label: 'Profile', icon: () => <div>Icon</div> },
            { id: 'interests', label: 'Interests', icon: () => <div>Icon</div> }
          ]}
        />
      );

      const tabList = screen.getByRole('tablist');
      
      // Simulate touch events
      fireEvent.touchStart(tabList, {
        touches: [{ clientX: 100, clientY: 100 }]
      });
      
      fireEvent.touchMove(tabList, {
        touches: [{ clientX: 200, clientY: 100 }]
      });
      
      fireEvent.touchEnd(tabList);

      expect(tabList).toBeInTheDocument();
    });
  });

  describe('Export and Sharing Functionality', () => {
    test('PDF export workflow', async () => {
      const mockExportToPDF = jest.fn().mockResolvedValue(new Blob());
      
      render(
        <PersonaResultLayout 
          persona={mockPersonaData}
          viewMode="detailed"
          onViewModeChange={jest.fn()}
          onExportPDF={mockExportToPDF}
        >
          <PersonaHeroSection persona={mockPersonaData} />
        </PersonaResultLayout>
      );

      const exportButton = screen.getByRole('button', { name: /export pdf/i });
      await user.click(exportButton);

      expect(mockExportToPDF).toHaveBeenCalledWith(mockPersonaData);
    });

    test('CSV export workflow', async () => {
      const mockExportToCSV = jest.fn().mockResolvedValue('csv,data');
      
      render(
        <PersonaResultLayout 
          persona={mockPersonaData}
          viewMode="detailed"
          onViewModeChange={jest.fn()}
          onExportCSV={mockExportToCSV}
        >
          <PersonaHeroSection persona={mockPersonaData} />
        </PersonaResultLayout>
      );

      const exportButton = screen.getByRole('button', { name: /export csv/i });
      await user.click(exportButton);

      expect(mockExportToCSV).toHaveBeenCalledWith(mockPersonaData);
    });

    test('JSON export workflow', async () => {
      const mockExportToJSON = jest.fn().mockResolvedValue('{}');
      
      render(
        <PersonaResultLayout 
          persona={mockPersonaData}
          viewMode="detailed"
          onViewModeChange={jest.fn()}
          onExportJSON={mockExportToJSON}
        >
          <PersonaHeroSection persona={mockPersonaData} />
        </PersonaResultLayout>
      );

      const exportButton = screen.getByRole('button', { name: /export json/i });
      await user.click(exportButton);

      expect(mockExportToJSON).toHaveBeenCalledWith(mockPersonaData);
    });

    test('sharing functionality', async () => {
      const mockGenerateShareLink = jest.fn().mockResolvedValue('https://example.com/share/123');
      
      render(
        <PersonaResultLayout 
          persona={mockPersonaData}
          viewMode="detailed"
          onViewModeChange={jest.fn()}
          onGenerateShareLink={mockGenerateShareLink}
        >
          <PersonaHeroSection persona={mockPersonaData} />
        </PersonaResultLayout>
      );

      const shareButton = screen.getByRole('button', { name: /share/i });
      await user.click(shareButton);

      expect(mockGenerateShareLink).toHaveBeenCalledWith(mockPersonaData.id);
      
      // Test clipboard copy
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/share/123');
      });
    });

    test('print functionality', async () => {
      render(
        <PersonaResultLayout 
          persona={mockPersonaData}
          viewMode="detailed"
          onViewModeChange={jest.fn()}
        >
          <PersonaHeroSection persona={mockPersonaData} />
        </PersonaResultLayout>
      );

      const printButton = screen.getByRole('button', { name: /print/i });
      await user.click(printButton);

      expect(window.print).toHaveBeenCalled();
    });
  });

  describe('Keyboard Navigation and Accessibility', () => {
    test('keyboard navigation through interface', async () => {
      render(
        <PersonaResultLayout 
          persona={mockPersonaData}
          viewMode="detailed"
          onViewModeChange={jest.fn()}
        >
          <PersonaHeroSection persona={mockPersonaData} />
          <PersonaTabNavigation 
            activeTab="profile"
            onTabChange={jest.fn()}
            tabs={[
              { id: 'profile', label: 'Profile', icon: () => <div>Icon</div> },
              { id: 'interests', label: 'Interests', icon: () => <div>Icon</div> },
              { id: 'communication', label: 'Communication', icon: () => <div>Icon</div> }
            ]}
          />
        </PersonaResultLayout>
      );

      // Test tab navigation
      await user.tab();
      expect(document.activeElement).toHaveAttribute('role', 'tab');
      
      // Test arrow key navigation
      await user.keyboard('{ArrowRight}');
      expect(document.activeElement).toHaveAttribute('aria-selected', 'true');
      
      await user.keyboard('{ArrowLeft}');
      expect(document.activeElement).toHaveAttribute('role', 'tab');
      
      // Test Enter key activation
      await user.keyboard('{Enter}');
      expect(document.activeElement).toHaveAttribute('aria-selected', 'true');
      
      // Test Space key activation
      await user.keyboard(' ');
      expect(document.activeElement).toHaveAttribute('aria-selected', 'true');
    });

    test('skip links functionality', async () => {
      render(
        <PersonaResultLayout 
          persona={mockPersonaData}
          viewMode="detailed"
          onViewModeChange={jest.fn()}
        >
          <PersonaHeroSection persona={mockPersonaData} />
          <QualityMetricsGrid metrics={mockPersonaData.metrics} />
        </PersonaResultLayout>
      );

      // Test skip to main content
      const skipLink = screen.getByRole('link', { name: /skip to main content/i });
      await user.click(skipLink);
      
      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveFocus();
    });

    test('ARIA labels and descriptions', async () => {
      render(
        <PersonaResultLayout 
          persona={mockPersonaData}
          viewMode="detailed"
          onViewModeChange={jest.fn()}
        >
          <PersonaHeroSection persona={mockPersonaData} />
          <QualityMetricsGrid metrics={mockPersonaData.metrics} />
        </PersonaResultLayout>
      );

      // Test ARIA labels
      expect(screen.getByRole('main')).toHaveAttribute('aria-label');
      expect(screen.getByRole('img', { name: /avatar/i })).toHaveAttribute('alt');
      
      // Test ARIA descriptions
      const metricsGrid = screen.getByRole('grid');
      expect(metricsGrid).toHaveAttribute('aria-describedby');
    });

    test('focus management', async () => {
      const mockOnTabChange = jest.fn();
      
      render(
        <PersonaTabNavigation 
          activeTab="profile"
          onTabChange={mockOnTabChange}
          tabs={[
            { id: 'profile', label: 'Profile', icon: () => <div>Icon</div> },
            { id: 'interests', label: 'Interests', icon: () => <div>Icon</div> }
          ]}
        />
      );

      const profileTab = screen.getByRole('tab', { name: /profile/i });
      const interestsTab = screen.getByRole('tab', { name: /interests/i });
      
      // Test initial focus
      profileTab.focus();
      expect(profileTab).toHaveFocus();
      
      // Test focus trap within tab group
      await user.tab();
      expect(interestsTab).toHaveFocus();
      
      await user.tab();
      expect(profileTab).toHaveFocus();
    });

    test('WCAG 2.1 AA compliance', async () => {
      const { container } = render(
        <PersonaResultLayout 
          persona={mockPersonaData}
          viewMode="detailed"
          onViewModeChange={jest.fn()}
        >
          <PersonaHeroSection persona={mockPersonaData} />
          <QualityMetricsGrid metrics={mockPersonaData.metrics} />
        </PersonaResultLayout>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('screen reader announcements', async () => {
      render(
        <PersonaResultLayout 
          persona={mockPersonaData}
          viewMode="detailed"
          onViewModeChange={jest.fn()}
        >
          <PersonaHeroSection persona={mockPersonaData} />
        </PersonaResultLayout>
      );

      // Test live regions
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      
      // Test announcements for dynamic content
      const alertRegion = screen.getByRole('alert');
      expect(alertRegion).toHaveAttribute('aria-live', 'assertive');
    });

    test('reduced motion preferences', async () => {
      // Mock prefers-reduced-motion
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      render(
        <PersonaResultLayout 
          persona={mockPersonaData}
          viewMode="detailed"
          onViewModeChange={jest.fn()}
        >
          <PersonaHeroSection persona={mockPersonaData} />
        </PersonaResultLayout>
      );

      const animatedElements = screen.getAllByTestId(/animated/);
      animatedElements.forEach(element => {
        expect(element).toHaveStyle('animation-duration: 0ms');
      });
    });
  });

  describe('Performance and Loading States', () => {
    test('lazy loading behavior', async () => {
      const mockIntersectionObserver = jest.fn();
      mockIntersectionObserver.mockReturnValue({
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      });
      
      window.IntersectionObserver = mockIntersectionObserver;

      render(
        <PersonaResultLayout 
          persona={mockPersonaData}
          viewMode="detailed"
          onViewModeChange={jest.fn()}
        >
          <PersonaHeroSection persona={mockPersonaData} />
          <QualityMetricsGrid metrics={mockPersonaData.metrics} />
        </PersonaResultLayout>
      );

      expect(mockIntersectionObserver).toHaveBeenCalled();
    });

    test('progressive loading states', async () => {
      const { rerender } = render(
        <PersonaResultLayout 
          persona={null}
          viewMode="detailed"
          onViewModeChange={jest.fn()}
          loading={true}
        >
          <div>Loading skeleton...</div>
        </PersonaResultLayout>
      );

      expect(screen.getByText(/loading skeleton/i)).toBeInTheDocument();

      // Simulate data loading
      rerender(
        <PersonaResultLayout 
          persona={mockPersonaData}
          viewMode="detailed"
          onViewModeChange={jest.fn()}
          loading={false}
        >
          <PersonaHeroSection persona={mockPersonaData} />
        </PersonaResultLayout>
      );

      await waitFor(() => {
        expect(screen.getByText(mockPersonaData.name)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    test('error boundary functionality', async () => {
      const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
        if (shouldThrow) {
          throw new Error('Test error');
        }
        return <div>No error</div>;
      };

      const { rerender } = render(
        <PersonaResultLayout 
          persona={mockPersonaData}
          viewMode="detailed"
          onViewModeChange={jest.fn()}
        >
          <ThrowError shouldThrow={false} />
        </PersonaResultLayout>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();

      // Trigger error
      rerender(
        <PersonaResultLayout 
          persona={mockPersonaData}
          viewMode="detailed"
          onViewModeChange={jest.fn()}
        >
          <ThrowError shouldThrow={true} />
        </PersonaResultLayout>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    test('retry functionality', async () => {
      const mockRetry = jest.fn();
      
      render(
        <PersonaResultLayout 
          persona={null}
          viewMode="detailed"
          onViewModeChange={jest.fn()}
          error="Network error"
          onRetry={mockRetry}
        >
          <div>Error state</div>
        </PersonaResultLayout>
      );

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      expect(mockRetry).toHaveBeenCalled();
    });
  });
});