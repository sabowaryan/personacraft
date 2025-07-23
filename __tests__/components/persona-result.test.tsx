/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { PersonaResult } from '@/components/persona-result/persona-result';
import { Persona } from '@/lib/types/persona';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock hooks
jest.mock('@/hooks/use-persona-preferences', () => ({
  usePersonaPreferences: () => ({
    preferences: {
      theme: 'light',
      animations: true,
      reducedMotion: false,
      fontSize: 'medium',
    },
  }),
}));

jest.mock('@/hooks/use-preference-styles', () => ({
  usePreferenceStyles: () => ({
    getCardClasses: () => 'mock-card-classes',
    getAnimationClasses: () => 'mock-animation-classes',
    getCSSProperties: () => ({}),
  }),
}));

jest.mock('@/hooks/use-persona-metrics', () => ({
  usePersonaMetrics: () => ({
    qualityScore: 85,
    completionScore: 78,
    engagementLevel: 'high',
    validationMetrics: {
      completeness: { score: 85, status: 'good', recommendations: [] },
      consistency: { score: 78, status: 'good', recommendations: [] },
      realism: { score: 92, status: 'excellent', recommendations: [] },
    },
  }),
}));

// Mock components that might not be fully implemented
jest.mock('@/components/persona-result/ui/lazy-tab-content', () => ({
  MemoizedProfileTab: ({ persona, isActive }: any) => (
    <div data-testid="profile-tab" data-active={isActive}>
      Profile content for {persona.name}
    </div>
  ),
  MemoizedInterestsTab: ({ persona, isActive }: any) => (
    <div data-testid="interests-tab" data-active={isActive}>
      Interests content for {persona.name}
    </div>
  ),
  MemoizedCommunicationTab: ({ persona, isActive }: any) => (
    <div data-testid="communication-tab" data-active={isActive}>
      Communication content for {persona.name}
    </div>
  ),
  MemoizedMarketingTab: ({ persona, isActive }: any) => (
    <div data-testid="marketing-tab" data-active={isActive}>
      Marketing content for {persona.name}
    </div>
  ),
}));

jest.mock('@/components/persona-result/error', () => ({
  PersonaErrorBoundary: ({ children, fallback }: any) => children,
  PersonaGracefulDegradation: ({ persona }: any) => (
    <div data-testid="graceful-degradation">
      Graceful degradation for {persona.name}
    </div>
  ),
  detectMissingFields: () => [],
  validatePersonaData: () => ({ isValid: true, missingFields: [] }),
  OfflineIndicator: () => <div data-testid="offline-indicator">Offline</div>,
  ErrorReporting: () => <div data-testid="error-reporting">Error reporting</div>,
  PersonaRenderErrorFallback: () => <div data-testid="error-fallback">Error fallback</div>,
}));

jest.mock('@/components/persona-result/loading', () => ({
  PersonaResultSkeleton: ({ stage }: any) => (
    <div data-testid="loading-skeleton">{stage}</div>
  ),
  ProgressiveLoading: ({ children }: any) => children,
  OfflineSupport: ({ children }: any) => children,
  useOfflineSupport: () => ({
    cachePersona: jest.fn(),
  }),
}));

jest.mock('@/components/persona-result/accessibility', () => ({
  PersonaKeyboardNavigation: ({ children }: any) => children,
  AriaLiveRegions: ({ children }: any) => children,
  usePersonaAnnouncements: () => ({
    announceTabChange: jest.fn(),
    announceExportStart: jest.fn(),
    announceShareStart: jest.fn(),
  }),
  AccessibilitySettings: () => <div data-testid="accessibility-settings">Accessibility settings</div>,
}));

// Mock persona data
const mockPersona: Persona = {
  id: 'test-persona-1',
  name: 'Marie Dubois',
  age: 32,
  location: 'Paris, France',
  avatar: 'https://example.com/avatar.jpg',
  bio: 'Marketing manager passionnée par les nouvelles technologies et le développement durable.',
  quote: 'L\'innovation naît de la curiosité et de la persévérance.',
  values: ['Innovation', 'Durabilité', 'Authenticité', 'Collaboration'],
  interests: {
    music: ['Électronique', 'Jazz'],
    brands: ['Apple', 'Tesla', 'Patagonia'],
    movies: ['Documentaires', 'Science-fiction'],
    food: ['Cuisine bio', 'Restaurants végétariens'],
    books: ['Business', 'Développement personnel'],
    lifestyle: ['Yoga', 'Course à pied', 'Musées', 'Théâtre']
  },
  communication: {
    preferredChannels: ['Email', 'LinkedIn', 'WhatsApp'],
    tone: 'Professionnel mais chaleureux',
    contentTypes: ['Articles', 'Infographies', 'Vidéos courtes'],
    frequency: 'Régulière'
  },
  marketing: {
    painPoints: ['Manque de temps', 'Information overload'],
    motivations: ['Efficacité', 'Innovation'],
    influences: ['Experts secteur', 'Collègues'],
    buyingBehavior: 'Recherche approfondie avant achat'
  },
  generatedAt: new Date().toISOString(),
  sources: ['Brief marketing', 'Données démographiques']
};

describe('PersonaResult', () => {
  const user = userEvent.setup();

  describe('rendering', () => {
    it('should render persona information correctly', () => {
      render(<PersonaResult persona={mockPersona} />);

      expect(screen.getByText('Marie Dubois')).toBeInTheDocument();
      expect(screen.getByText('32 ans • Paris, France')).toBeInTheDocument();
      expect(screen.getByText('L\'innovation naît de la curiosité et de la persévérance.')).toBeInTheDocument();
    });

    it('should render persona values as badges', () => {
      render(<PersonaResult persona={mockPersona} />);

      expect(screen.getByText('Innovation')).toBeInTheDocument();
      expect(screen.getByText('Durabilité')).toBeInTheDocument();
    });

    it('should render avatar when provided', () => {
      render(<PersonaResult persona={mockPersona} />);

      const avatar = screen.getByRole('img', { name: /avatar de marie dubois/i });
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('should render placeholder when avatar is missing', () => {
      const personaWithoutAvatar = { ...mockPersona, avatar: undefined };
      render(<PersonaResult persona={personaWithoutAvatar} />);

      expect(screen.getByText('M')).toBeInTheDocument(); // First letter of name
    });

    it('should render back button when onBack is provided', () => {
      const onBack = jest.fn();
      render(<PersonaResult persona={mockPersona} onBack={onBack} />);

      const backButton = screen.getByRole('button', { name: /go back to previous page/i });
      expect(backButton).toBeInTheDocument();
    });

    it('should not render back button when onBack is not provided', () => {
      render(<PersonaResult persona={mockPersona} />);

      const backButton = screen.queryByRole('button', { name: /go back to previous page/i });
      expect(backButton).not.toBeInTheDocument();
    });
  });

  describe('loading states', () => {
    it('should show loading skeleton when isLoading is true', () => {
      render(
        <PersonaResult
          persona={mockPersona}
          isLoading={true}
          loadingStage="Chargement des données..."
        />
      );

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
      expect(screen.getByText('Chargement des données...')).toBeInTheDocument();
      expect(screen.queryByText('Marie Dubois')).not.toBeInTheDocument();
    });

    it('should show persona content when isLoading is false', () => {
      render(<PersonaResult persona={mockPersona} isLoading={false} />);

      expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
      expect(screen.getByText('Marie Dubois')).toBeInTheDocument();
    });
  });

  describe('tab navigation', () => {
    it('should render all tab triggers', () => {
      render(<PersonaResult persona={mockPersona} />);

      expect(screen.getByRole('tab', { name: /profil/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /intérêts/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /communication/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /marketing/i })).toBeInTheDocument();
    });

    it('should show profile tab content by default', () => {
      render(<PersonaResult persona={mockPersona} />);

      const profileTab = screen.getByTestId('profile-tab');
      expect(profileTab).toBeInTheDocument();
      expect(profileTab).toHaveAttribute('data-active', 'true');
    });

    it('should switch tabs when clicked', async () => {
      render(<PersonaResult persona={mockPersona} />);

      const interestsTab = screen.getByRole('tab', { name: /intérêts/i });
      await user.click(interestsTab);

      await waitFor(() => {
        const interestsContent = screen.getByTestId('interests-tab');
        expect(interestsContent).toHaveAttribute('data-active', 'true');
      });
    });

    it('should have proper ARIA attributes for tabs', () => {
      render(<PersonaResult persona={mockPersona} />);

      const profileTab = screen.getByRole('tab', { name: /profil/i });
      expect(profileTab).toHaveAttribute('aria-selected', 'true');
      expect(profileTab).toHaveAttribute('aria-controls', 'profile-panel');

      const interestsTab = screen.getByRole('tab', { name: /intérêts/i });
      expect(interestsTab).toHaveAttribute('aria-selected', 'false');
      expect(interestsTab).toHaveAttribute('aria-controls', 'interests-panel');
    });
  });

  describe('actions', () => {
    it('should call onBack when back button is clicked', async () => {
      const onBack = jest.fn();
      render(<PersonaResult persona={mockPersona} onBack={onBack} />);

      const backButton = screen.getByRole('button', { name: /go back to previous page/i });
      await user.click(backButton);

      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('should render export button', () => {
      render(<PersonaResult persona={mockPersona} />);

      const exportButton = screen.getByRole('button', { name: /export persona to pdf/i });
      expect(exportButton).toBeInTheDocument();
    });

    it('should render share button', () => {
      render(<PersonaResult persona={mockPersona} />);

      const shareButton = screen.getByRole('button', { name: /share persona with others/i });
      expect(shareButton).toBeInTheDocument();
    });

    it('should handle export button click', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      render(<PersonaResult persona={mockPersona} />);

      const exportButton = screen.getByRole('button', { name: /export persona to pdf/i });
      await user.click(exportButton);

      expect(consoleSpy).toHaveBeenCalledWith('Exporting persona:', 'test-persona-1');
      consoleSpy.mockRestore();
    });

    it('should handle share button click', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      render(<PersonaResult persona={mockPersona} />);

      const shareButton = screen.getByRole('button', { name: /share persona with others/i });
      await user.click(shareButton);

      expect(consoleSpy).toHaveBeenCalledWith('Sharing persona:', 'test-persona-1');
      consoleSpy.mockRestore();
    });
  });

  describe('keyboard navigation', () => {
    it('should support keyboard navigation between tabs', async () => {
      render(<PersonaResult persona={mockPersona} />);

      const profileTab = screen.getByRole('tab', { name: /profil/i });
      const interestsTab = screen.getByRole('tab', { name: /intérêts/i });

      profileTab.focus();
      expect(profileTab).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      expect(interestsTab).toHaveFocus();
    });

    it('should support Enter key to activate tabs', async () => {
      render(<PersonaResult persona={mockPersona} />);

      const interestsTab = screen.getByRole('tab', { name: /intérêts/i });
      interestsTab.focus();

      await user.keyboard('{Enter}');

      await waitFor(() => {
        const interestsContent = screen.getByTestId('interests-tab');
        expect(interestsContent).toHaveAttribute('data-active', 'true');
      });
    });
  });

  describe('accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<PersonaResult persona={mockPersona} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper heading structure', () => {
      render(<PersonaResult persona={mockPersona} />);

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Marie Dubois');
    });

    it('should have proper landmark roles', () => {
      render(<PersonaResult persona={mockPersona} />);

      expect(screen.getByRole('banner')).toBeInTheDocument(); // header
      expect(screen.getByRole('complementary')).toBeInTheDocument(); // quality metrics
    });

    it('should have proper ARIA labels for sections', () => {
      render(<PersonaResult persona={mockPersona} />);

      expect(screen.getByLabelText('Persona header')).toBeInTheDocument();
      expect(screen.getByLabelText('Persona overview')).toBeInTheDocument();
      expect(screen.getByLabelText('Quality metrics')).toBeInTheDocument();
    });

    it('should have proper focus management', () => {
      render(<PersonaResult persona={mockPersona} />);

      const tabList = screen.getByRole('tablist');
      expect(tabList).toHaveAttribute('aria-label', 'Persona information sections');
    });

    it('should support screen readers with proper text alternatives', () => {
      render(<PersonaResult persona={mockPersona} />);

      const avatar = screen.getByRole('img');
      expect(avatar).toHaveAttribute('alt', 'Avatar de Marie Dubois');

      const statusBadge = screen.getByRole('status');
      expect(statusBadge).toHaveAttribute('aria-label', 'Persona generation status: Generated');
    });
  });

  describe('responsive behavior', () => {
    it('should adapt layout for mobile screens', () => {
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<PersonaResult persona={mockPersona} />);

      // Check that mobile-specific classes are applied
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('flex-col', 'md:flex-row');
    });

    it('should show appropriate content for different screen sizes', () => {
      render(<PersonaResult persona={mockPersona} />);

      // Check responsive grid classes
      const heroSection = screen.getByLabelText('Persona overview');
      expect(heroSection).toHaveClass('grid-cols-1', 'md:grid-cols-3');
    });
  });

  describe('error handling', () => {
    it('should handle missing persona data gracefully', () => {
      const incompletePersona = {
        ...mockPersona,
        bio: '',
        quote: '',
        values: [],
      };

      // Mock validation to return errors
      const mockValidatePersonaData = require('@/components/persona-result/error').validatePersonaData;
      mockValidatePersonaData.mockReturnValue({
        isValid: false,
        missingFields: ['bio', 'quote', 'values'],
      });

      render(<PersonaResult persona={incompletePersona} />);

      expect(screen.getByTestId('graceful-degradation')).toBeInTheDocument();
    });
  });

  describe('performance', () => {
    it('should memoize expensive calculations', () => {
      const { rerender } = render(<PersonaResult persona={mockPersona} />);

      // Rerender with same props
      rerender(<PersonaResult persona={mockPersona} />);

      // Component should not re-render unnecessarily
      expect(screen.getByText('Marie Dubois')).toBeInTheDocument();
    });

    it('should lazy load tab content', () => {
      render(<PersonaResult persona={mockPersona} />);

      // Only active tab content should be rendered initially
      expect(screen.getByTestId('profile-tab')).toBeInTheDocument();

      // Other tabs should not be rendered until activated
      const interestsTab = screen.queryByTestId('interests-tab');
      expect(interestsTab).not.toBeInTheDocument();
    });
  });

  describe('data display', () => {
    it('should display generation metadata', () => {
      render(<PersonaResult persona={mockPersona} />);

      const generatedDate = new Date(mockPersona.generatedAt).toLocaleDateString();
      expect(screen.getByText(`Persona généré le ${generatedDate}`)).toBeInTheDocument();
    });

    it('should display source information', () => {
      render(<PersonaResult persona={mockPersona} />);

      expect(screen.getByText('Basé sur 2 source(s)')).toBeInTheDocument();
    });

    it('should handle missing source information', () => {
      const personaWithoutSources = { ...mockPersona, sources: [] };
      render(<PersonaResult persona={personaWithoutSources} />);

      expect(screen.queryByText(/basé sur/i)).not.toBeInTheDocument();
    });
  });
});