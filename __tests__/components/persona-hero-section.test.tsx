/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { PersonaHeroSection } from '@/components/persona-result/hero/persona-hero-section';
import { Persona, EnhancedPersona } from '@/lib/types/persona';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock child components
jest.mock('@/components/persona-result/hero/persona-avatar', () => ({
  PersonaAvatar: ({ persona, size, showStatus, animated }: any) => (
    <div
      data-testid="persona-avatar"
      data-size={size}
      data-show-status={showStatus}
      data-animated={animated}
    >
      Avatar for {persona.name}
    </div>
  ),
}));

jest.mock('@/components/persona-result/hero/persona-quick-actions', () => ({
  PersonaQuickActions: ({ persona, onExport, onShare, onBack, compact }: any) => (
    <div data-testid="persona-quick-actions" data-compact={compact}>
      <button onClick={onExport} data-testid="export-action">Export</button>
      <button onClick={onShare} data-testid="share-action">Share</button>
      {onBack && <button onClick={onBack} data-testid="back-action">Back</button>}
    </div>
  ),
}));

jest.mock('@/components/persona-result/ui/animated-card', () => ({
  AnimatedCard: ({ children, variant, size, animation, className }: any) => (
    <div
      data-testid="animated-card"
      data-variant={variant}
      data-size={size}
      data-animation={animation}
      className={className}
    >
      {children}
    </div>
  ),
  AnimatedCardContent: ({ children }: any) => (
    <div data-testid="animated-card-content">{children}</div>
  ),
}));

// Mock persona data
const mockBasicPersona: Persona = {
  id: 'test-persona-1',
  name: 'Marie Dubois',
  age: 32,
  location: 'Paris, France',
  avatar: 'https://example.com/avatar.jpg',
  bio: 'Marketing manager passionnée par les nouvelles technologies.',
  quote: 'L\'innovation naît de la curiosité et de la persévérance.',
  values: ['Innovation', 'Durabilité', 'Authenticité', 'Collaboration', 'Excellence'],
  interests: {
    music: ['Jazz', 'Électronique'],
    brands: ['Apple', 'Tesla'],
    movies: ['Documentaires', 'Science-fiction'],
    food: ['Cuisine bio', 'Restaurants végétariens'],
    books: ['Business', 'Développement personnel'],
    lifestyle: ['Yoga', 'Course à pied']
  },
  communication: {
    preferredChannels: ['Email', 'LinkedIn', 'WhatsApp'],
    tone: 'Professionnel mais chaleureux',
    contentTypes: ['Articles', 'Infographies', 'Vidéos'],
    frequency: 'Régulière'
  },
  marketing: {
    painPoints: ['Manque de temps', 'Information overload'],
    motivations: ['Efficacité', 'Innovation'],
    influences: ['Experts secteur', 'Collègues'],
    buyingBehavior: 'Recherche approfondie avant achat'
  },
  generatedAt: new Date().toISOString(),
  sources: ['Brief marketing']
};

const mockEnhancedPersona: EnhancedPersona = {
  ...mockBasicPersona,
  id: 'enhanced-persona-1',
  validation_metrics: {
    completeness_score: 85,
    consistency_score: 78,
    realism_score: 92,
    quality_indicators: ['High cultural accuracy']
  },
  generation_metadata: {
    total_processing_time: 2500,
    gemini_response_time: 1200,
    qloo_response_time: 800,
    confidence_level: 'high' as const,
    data_sources: ['Gemini API', 'Qloo API']
  },
  cultural_data: {
    music_preferences: [],
    brand_affinities: [],
    lifestyle_indicators: []
  }
};

describe('PersonaHeroSection', () => {
  const user = userEvent.setup();

  describe('basic rendering', () => {
    it('should render persona basic information', () => {
      render(<PersonaHeroSection persona={mockBasicPersona} />);

      expect(screen.getByText('Marie Dubois')).toBeInTheDocument();
      expect(screen.getByText('32 ans • Paris, France')).toBeInTheDocument();
    });

    it('should render persona avatar', () => {
      render(<PersonaHeroSection persona={mockBasicPersona} />);

      const avatar = screen.getByTestId('persona-avatar');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('data-size', 'lg');
      expect(avatar).toHaveAttribute('data-show-status', 'true');
      expect(avatar).toHaveAttribute('data-animated', 'true');
    });

    it('should render persona values as badges', () => {
      render(<PersonaHeroSection persona={mockBasicPersona} />);

      expect(screen.getByText('Innovation')).toBeInTheDocument();
      expect(screen.getByText('Durabilité')).toBeInTheDocument();
      expect(screen.getByText('Authenticité')).toBeInTheDocument();
    });

    it('should limit displayed values and show overflow indicator', () => {
      render(<PersonaHeroSection persona={mockBasicPersona} />);

      // Should show first 3 values
      expect(screen.getByText('Innovation')).toBeInTheDocument();
      expect(screen.getByText('Durabilité')).toBeInTheDocument();
      expect(screen.getByText('Authenticité')).toBeInTheDocument();

      // Should show overflow indicator for remaining values
      expect(screen.getByText('+2 autres')).toBeInTheDocument();
    });

    it('should render quote in non-compact mode', () => {
      render(<PersonaHeroSection persona={mockBasicPersona} compact={false} />);

      expect(screen.getByText('L\'innovation naît de la curiosité et de la persévérance.')).toBeInTheDocument();
    });

    it('should not render quote in compact mode', () => {
      render(<PersonaHeroSection persona={mockBasicPersona} compact={true} />);

      expect(screen.queryByText('L\'innovation naît de la curiosité et de la persévérance.')).not.toBeInTheDocument();
    });
  });

  describe('compact mode', () => {
    it('should apply compact styling', () => {
      render(<PersonaHeroSection persona={mockBasicPersona} compact={true} />);

      const avatar = screen.getByTestId('persona-avatar');
      expect(avatar).toHaveAttribute('data-size', 'md');

      const section = screen.getByRole('region');
      expect(section).toHaveClass('py-6'); // Compact padding
    });

    it('should limit values in compact mode', () => {
      render(<PersonaHeroSection persona={mockBasicPersona} compact={true} />);

      // Should show only first 2 values in compact mode
      expect(screen.getByText('Innovation')).toBeInTheDocument();
      expect(screen.getByText('Durabilité')).toBeInTheDocument();
      expect(screen.getByText('+3 autres')).toBeInTheDocument();
    });

    it('should use smaller heading in compact mode', () => {
      render(<PersonaHeroSection persona={mockBasicPersona} compact={true} />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-xl', 'md:text-2xl');
    });
  });

  describe('detailed mode', () => {
    it('should apply detailed styling', () => {
      render(<PersonaHeroSection persona={mockBasicPersona} compact={false} />);

      const section = screen.getByRole('region');
      expect(section).toHaveClass('py-8', 'md:py-12'); // Full padding

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-2xl', 'md:text-3xl', 'lg:text-4xl');
    });

    it('should render floating info cards', () => {
      render(<PersonaHeroSection persona={mockBasicPersona} compact={false} />);

      // Should show statistics cards
      expect(screen.getByText('8')).toBeInTheDocument(); // Total interests count
      expect(screen.getByText('Intérêts identifiés')).toBeInTheDocument();

      expect(screen.getByText('3')).toBeInTheDocument(); // Preferred channels count
      expect(screen.getByText('Canaux préférés')).toBeInTheDocument();

      expect(screen.getByText('2')).toBeInTheDocument(); // Pain points count
      expect(screen.getByText('Points de douleur')).toBeInTheDocument();
    });

    it('should calculate statistics correctly', () => {
      render(<PersonaHeroSection persona={mockBasicPersona} compact={false} />);

      // Total interests: 2 + 2 + 2 + 1 + 1 = 8
      const interestsCount = Object.values(mockBasicPersona.interests).flat().length;
      expect(screen.getByText(interestsCount.toString())).toBeInTheDocument();

      // Preferred channels: 3
      expect(screen.getByText(mockBasicPersona.communication.preferredChannels.length.toString())).toBeInTheDocument();

      // Pain points: 2
      expect(screen.getByText(mockBasicPersona.marketing.painPoints.length.toString())).toBeInTheDocument();
    });
  });

  describe('actions', () => {
    it('should render quick actions when showActions is true', () => {
      render(<PersonaHeroSection persona={mockBasicPersona} showActions={true} />);

      expect(screen.getByTestId('persona-quick-actions')).toBeInTheDocument();
    });

    it('should not render quick actions when showActions is false', () => {
      render(<PersonaHeroSection persona={mockBasicPersona} showActions={false} />);

      expect(screen.queryByTestId('persona-quick-actions')).not.toBeInTheDocument();
    });

    it('should pass action handlers to quick actions component', () => {
      const onExport = jest.fn();
      const onShare = jest.fn();
      const onBack = jest.fn();

      render(
        <PersonaHeroSection
          persona={mockBasicPersona}
          onExport={onExport}
          onShare={onShare}
          onBack={onBack}
        />
      );

      const exportButton = screen.getByTestId('export-action');
      const shareButton = screen.getByTestId('share-action');
      const backButton = screen.getByTestId('back-action');

      fireEvent.click(exportButton);
      fireEvent.click(shareButton);
      fireEvent.click(backButton);

      expect(onExport).toHaveBeenCalledTimes(1);
      expect(onShare).toHaveBeenCalledTimes(1);
      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('should pass compact prop to quick actions', () => {
      render(<PersonaHeroSection persona={mockBasicPersona} compact={true} />);

      const quickActions = screen.getByTestId('persona-quick-actions');
      expect(quickActions).toHaveAttribute('data-compact', 'true');
    });
  });

  describe('enhanced persona support', () => {
    it('should render enhanced persona correctly', () => {
      render(<PersonaHeroSection persona={mockEnhancedPersona} />);

      expect(screen.getByText('Marie Dubois')).toBeInTheDocument();
      expect(screen.getByText('32 ans • Paris, France')).toBeInTheDocument();
    });

    it('should handle both basic and enhanced persona types', () => {
      const { rerender } = render(<PersonaHeroSection persona={mockBasicPersona} />);
      expect(screen.getByText('Marie Dubois')).toBeInTheDocument();

      rerender(<PersonaHeroSection persona={mockEnhancedPersona} />);
      expect(screen.getByText('Marie Dubois')).toBeInTheDocument();
    });
  });

  describe('responsive behavior', () => {
    it('should apply responsive classes', () => {
      render(<PersonaHeroSection persona={mockBasicPersona} />);

      const mainContainer = screen.getByTestId('animated-card-content').firstChild;
      expect(mainContainer).toHaveClass('flex-col', 'md:flex-row');
    });

    it('should center content on mobile, left-align on desktop', () => {
      render(<PersonaHeroSection persona={mockBasicPersona} />);

      const infoSection = screen.getByText('Marie Dubois').closest('div');
      expect(infoSection).toHaveClass('text-center', 'md:text-left');
    });

    it('should adapt badge alignment responsively', () => {
      render(<PersonaHeroSection persona={mockBasicPersona} />);

      const badgeContainer = screen.getByText('Innovation').closest('div');
      expect(badgeContainer).toHaveClass('justify-center', 'md:justify-start');
    });
  });

  describe('styling and theming', () => {
    it('should apply glass effect styling', () => {
      render(<PersonaHeroSection persona={mockBasicPersona} />);

      const mainCard = screen.getByTestId('animated-card');
      expect(mainCard).toHaveAttribute('data-variant', 'glass');
      expect(mainCard).toHaveClass('backdrop-blur-md', 'border-white/20', 'dark:border-gray-700/30');
    });

    it('should apply gradient background', () => {
      render(<PersonaHeroSection persona={mockBasicPersona} />);

      const section = screen.getByRole('region');
      const gradientDiv = section.querySelector('.bg-gradient-to-br');
      expect(gradientDiv).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<PersonaHeroSection persona={mockBasicPersona} className="custom-class" />);

      const section = screen.getByRole('region');
      expect(section).toHaveClass('custom-class');
    });
  });

  describe('accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<PersonaHeroSection persona={mockBasicPersona} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper heading structure', () => {
      render(<PersonaHeroSection persona={mockBasicPersona} />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Marie Dubois');
    });

    it('should have proper semantic structure', () => {
      render(<PersonaHeroSection persona={mockBasicPersona} />);

      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('should provide meaningful text for screen readers', () => {
      render(<PersonaHeroSection persona={mockBasicPersona} />);

      // Values should be accessible as individual items
      const innovationBadge = screen.getByText('Innovation');
      expect(innovationBadge.closest('[role="listitem"]')).toBeInTheDocument();
    });
  });

  describe('quote handling', () => {
    it('should render quote with proper styling', () => {
      render(<PersonaHeroSection persona={mockBasicPersona} compact={false} />);

      const quote = screen.getByText('L\'innovation naît de la curiosité et de la persévérance.');
      const blockquote = quote.closest('blockquote');
      expect(blockquote).toBeInTheDocument();
    });

    it('should handle missing quote gracefully', () => {
      const personaWithoutQuote = { ...mockBasicPersona, quote: '' };
      render(<PersonaHeroSection persona={personaWithoutQuote} compact={false} />);

      expect(screen.queryByRole('blockquote')).not.toBeInTheDocument();
    });

    it('should handle undefined quote gracefully', () => {
      const personaWithoutQuote = { ...mockBasicPersona, quote: undefined as any };
      render(<PersonaHeroSection persona={personaWithoutQuote} compact={false} />);

      expect(screen.queryByRole('blockquote')).not.toBeInTheDocument();
    });
  });

  describe('animation and interactions', () => {
    it('should apply animation classes', () => {
      render(<PersonaHeroSection persona={mockBasicPersona} />);

      const section = screen.getByRole('region');
      expect(section).toHaveClass('persona-animate-in');
    });

    it('should configure animated cards correctly', () => {
      render(<PersonaHeroSection persona={mockBasicPersona} compact={false} />);

      const animatedCards = screen.getAllByTestId('animated-card');

      // Main card should have glow animation
      expect(animatedCards[0]).toHaveAttribute('data-animation', 'glow');

      // Quote card should have no animation
      expect(animatedCards[1]).toHaveAttribute('data-animation', 'none');

      // Floating cards should have hover animation
      const floatingCards = animatedCards.slice(2);
      floatingCards.forEach(card => {
        expect(card).toHaveAttribute('data-animation', 'hover');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty values array', () => {
      const personaWithoutValues = { ...mockBasicPersona, values: [] };
      render(<PersonaHeroSection persona={personaWithoutValues} />);

      expect(screen.queryByText('Innovation')).not.toBeInTheDocument();
      expect(screen.queryByText('+0 autres')).not.toBeInTheDocument();
    });

    it('should handle single value', () => {
      const personaWithOneValue = { ...mockBasicPersona, values: ['Innovation'] };
      render(<PersonaHeroSection persona={personaWithOneValue} />);

      expect(screen.getByText('Innovation')).toBeInTheDocument();
      expect(screen.queryByText('+0 autres')).not.toBeInTheDocument();
    });

    it('should handle exactly 3 values (no overflow)', () => {
      const personaWithThreeValues = { ...mockBasicPersona, values: ['Innovation', 'Durabilité', 'Authenticité'] };
      render(<PersonaHeroSection persona={personaWithThreeValues} />);

      expect(screen.getByText('Innovation')).toBeInTheDocument();
      expect(screen.getByText('Durabilité')).toBeInTheDocument();
      expect(screen.getByText('Authenticité')).toBeInTheDocument();
      expect(screen.queryByText(/\+\d+ autres/)).not.toBeInTheDocument();
    });

    it('should handle missing interests gracefully', () => {
      const personaWithoutInterests = {
        ...mockBasicPersona,
        interests: {
          music: [],
          brands: [],
          movies: [],
          food: [],
          books: [],
          lifestyle: []
        }
      };
      render(<PersonaHeroSection persona={personaWithoutInterests} compact={false} />);

      expect(screen.getByText('0')).toBeInTheDocument(); // Should show 0 interests
    });

    it('should handle missing communication channels', () => {
      const personaWithoutChannels = {
        ...mockBasicPersona,
        communication: { ...mockBasicPersona.communication, preferredChannels: [] }
      };
      render(<PersonaHeroSection persona={personaWithoutChannels} compact={false} />);

      expect(screen.getByText('0')).toBeInTheDocument(); // Should show 0 channels
    });
  });
});