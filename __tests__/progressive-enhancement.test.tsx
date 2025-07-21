import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom';

// Mock the hooks and utilities
jest.mock('@/hooks/use-media-query', () => ({
  useBreakpoints: () => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouchDevice: false,
    prefersReducedMotion: false,
  }),
}));

jest.mock('@/hooks/use-responsive-optimization', () => ({
  useResponsiveOptimization: () => ({
    networkInfo: {
      effectiveType: '4g',
      downlink: 10,
      rtt: 100,
      saveData: false,
      isSlowConnection: false,
    },
    deviceCapabilities: {
      hasHover: true,
      hasPointer: true,
      screenDensity: 2,
      orientation: 'landscape',
      isHighDensity: true,
      supportsWebP: true,
      supportsAvif: true,
      hasReducedMotion: false,
      hasHighContrast: false,
      interactionMode: 'mouse',
    },
    optimizations: {
      imageQuality: 80,
      imageDensity: 2,
      shouldLazyLoad: true,
      preferredImageFormat: 'webp',
      animationDuration: 300,
      shouldAnimate: true,
      layoutDensity: 'spacious',
      touchTargetSize: 40,
      shouldPreload: true,
      contentPriority: 'low',
      shouldVirtualize: false,
      batchSize: 20,
    },
  }),
}));

import {
  AdaptiveContentLoader,
  InteractionPattern,
  DensityAware,
  AdvancedResponsiveImage,
  ConnectionSpeedIndicator,
  OrientationLayout,
  ConnectionAware,
  AdaptiveGrid,
} from '@/components/persona-result/responsive/progressive-enhancement';

import { useProgressiveEnhancement } from '@/hooks/use-progressive-enhancement';

describe('Progressive Enhancement Components', () => {
  beforeEach(() => {
    // Mock IntersectionObserver
    global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));

    // Mock performance API
    global.performance = {
      ...global.performance,
      now: jest.fn(() => Date.now()),
    };

    // Mock navigator.connection
    Object.defineProperty(navigator, 'connection', {
      writable: true,
      value: {
        effectiveType: '4g',
        downlink: 10,
        rtt: 100,
        saveData: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      },
    });
  });

  describe('AdaptiveContentLoader', () => {
    it('renders children immediately for critical priority', () => {
      render(
        <AdaptiveContentLoader priority="critical">
          <div data-testid="content">Critical Content</div>
        </AdaptiveContentLoader>
      );

      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('shows loading fallback for low priority content', async () => {
      render(
        <AdaptiveContentLoader
          priority="low"
          loadingFallback={<div data-testid="loading">Loading...</div>}
        >
          <div data-testid="content">Low Priority Content</div>
        </AdaptiveContentLoader>
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('handles error states gracefully', async () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      render(
        <AdaptiveContentLoader
          priority="high"
          errorFallback={<div data-testid="error">Error occurred</div>}
        >
          <ThrowError />
        </AdaptiveContentLoader>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });
    });
  });

  describe('InteractionPattern', () => {
    it('applies correct hover behavior for mouse interactions', () => {
      render(
        <InteractionPattern hoverBehavior="scale" touchBehavior="opacity">
          <div data-testid="interactive">Interactive Element</div>
        </InteractionPattern>
      );

      const element = screen.getByTestId('interactive').parentElement;
      expect(element).toHaveClass('hover:scale-105');
    });

    it('handles touch interactions correctly', () => {
      render(
        <InteractionPattern touchBehavior="ripple">
          <div data-testid="interactive">Touch Element</div>
        </InteractionPattern>
      );

      const element = screen.getByTestId('interactive').parentElement;
      fireEvent.touchStart(element!, {
        touches: [{ clientX: 50, clientY: 50 }],
      });

      expect(element).toHaveClass('overflow-hidden');
    });

    it('applies focus behavior correctly', () => {
      render(
        <InteractionPattern focusBehavior="ring">
          <div data-testid="interactive">Focusable Element</div>
        </InteractionPattern>
      );

      const element = screen.getByTestId('interactive').parentElement;
      expect(element).toHaveClass('focus-visible:ring-2');
    });
  });

  describe('DensityAware', () => {
    it('renders high density content when available and supported', () => {
      render(
        <DensityAware
          highDensityContent={<div data-testid="high-density">High Density</div>}
        >
          <div data-testid="standard">Standard Content</div>
        </DensityAware>
      );

      expect(screen.getByTestId('high-density')).toBeInTheDocument();
      expect(screen.queryByTestId('standard')).not.toBeInTheDocument();
    });

    it('falls back to standard content when high density not available', () => {
      // Mock low density device
      jest.mocked(require('@/hooks/use-responsive-optimization').useResponsiveOptimization).mockReturnValue({
        deviceCapabilities: {
          isHighDensity: false,
          screenDensity: 1,
        },
      });

      render(
        <DensityAware
          highDensityContent={<div data-testid="high-density">High Density</div>}
        >
          <div data-testid="standard">Standard Content</div>
        </DensityAware>
      );

      expect(screen.getByTestId('standard')).toBeInTheDocument();
      expect(screen.queryByTestId('high-density')).not.toBeInTheDocument();
    });
  });

  describe('AdvancedResponsiveImage', () => {
    it('renders image with correct attributes', () => {
      render(
        <AdvancedResponsiveImage
          src="/test-image.jpg"
          alt="Test image"
          width={300}
          height={200}
          priority
        />
      );

      const img = screen.getByAltText('Test image');
      expect(img).toHaveAttribute('src', '/test-image.jpg');
      expect(img).toHaveAttribute('loading', 'eager');
      expect(img).toHaveAttribute('decoding', 'async');
    });

    it('shows error fallback when image fails to load', async () => {
      render(
        <AdvancedResponsiveImage
          src="/nonexistent-image.jpg"
          alt="Test image"
          width={300}
          height={200}
        />
      );

      const img = screen.getByAltText('Test image');
      fireEvent.error(img);

      await waitFor(() => {
        expect(screen.getByText('Image failed to load')).toBeInTheDocument();
      });
    });

    it('applies lazy loading for non-priority images', () => {
      render(
        <AdvancedResponsiveImage
          src="/test-image.jpg"
          alt="Test image"
          width={300}
          height={200}
          priority={false}
        />
      );

      const img = screen.getByAltText('Test image');
      expect(img).toHaveAttribute('loading', 'lazy');
    });
  });

  describe('ConnectionSpeedIndicator', () => {
    it('displays correct connection speed', () => {
      render(<ConnectionSpeedIndicator />);
      expect(screen.getByText('4G')).toBeInTheDocument();
    });

    it('shows data saver mode when active', () => {
      // Mock data saver mode
      Object.defineProperty(navigator, 'connection', {
        writable: true,
        value: {
          ...navigator.connection,
          saveData: true,
        },
      });

      render(<ConnectionSpeedIndicator />);
      expect(screen.getByText('Data Saver')).toBeInTheDocument();
    });
  });

  describe('OrientationLayout', () => {
    it('renders landscape layout in landscape orientation', () => {
      render(
        <OrientationLayout
          portraitLayout={<div data-testid="portrait">Portrait</div>}
          landscapeLayout={<div data-testid="landscape">Landscape</div>}
        >
          <div data-testid="default">Default</div>
        </OrientationLayout>
      );

      expect(screen.getByTestId('landscape')).toBeInTheDocument();
      expect(screen.queryByTestId('portrait')).not.toBeInTheDocument();
      expect(screen.queryByTestId('default')).not.toBeInTheDocument();
    });

    it('falls back to default content when no orientation-specific content', () => {
      render(
        <OrientationLayout>
          <div data-testid="default">Default Content</div>
        </OrientationLayout>
      );

      expect(screen.getByTestId('default')).toBeInTheDocument();
    });
  });

  describe('ConnectionAware', () => {
    it('renders normal content for good connections', () => {
      render(
        <ConnectionAware
          slowConnectionFallback={<div data-testid="slow">Slow Connection</div>}
        >
          <div data-testid="normal">Normal Content</div>
        </ConnectionAware>
      );

      expect(screen.getByTestId('normal')).toBeInTheDocument();
      expect(screen.queryByTestId('slow')).not.toBeInTheDocument();
    });

    it('shows fallback for slow connections', () => {
      // Mock slow connection
      jest.mocked(require('@/hooks/use-responsive-optimization').useResponsiveOptimization).mockReturnValue({
        networkInfo: {
          isSlowConnection: true,
          saveData: false,
        },
      });

      render(
        <ConnectionAware
          slowConnectionFallback={<div data-testid="slow">Slow Connection</div>}
        >
          <div data-testid="normal">Normal Content</div>
        </ConnectionAware>
      );

      expect(screen.getByTestId('slow')).toBeInTheDocument();
      expect(screen.queryByTestId('normal')).not.toBeInTheDocument();
    });
  });

  describe('AdaptiveGrid', () => {
    it('renders children in grid layout', () => {
      render(
        <AdaptiveGrid minItemWidth={200} gap={16}>
          <div data-testid="item-1">Item 1</div>
          <div data-testid="item-2">Item 2</div>
          <div data-testid="item-3">Item 3</div>
        </AdaptiveGrid>
      );

      expect(screen.getByTestId('item-1')).toBeInTheDocument();
      expect(screen.getByTestId('item-2')).toBeInTheDocument();
      expect(screen.getByTestId('item-3')).toBeInTheDocument();
    });

    it('applies correct grid styles', () => {
      const { container } = render(
        <AdaptiveGrid minItemWidth={200} gap={16}>
          <div>Item</div>
        </AdaptiveGrid>
      );

      const gridElement = container.firstChild as HTMLElement;
      expect(gridElement).toHaveClass('grid');
      expect(gridElement).toHaveStyle({ gap: '16px' });
    });
  });
});

describe('useProgressiveEnhancement Hook', () => {
  it('returns correct device and network information', () => {
    const TestComponent = () => {
      const {
        connectionSpeed,
        isSlowConnection,
        deviceType,
        orientation,
        supportsWebP,
        supportsAvif,
      } = useProgressiveEnhancement();

      return (
        <div>
          <div data-testid="connection-speed">{connectionSpeed}</div>
          <div data-testid="is-slow">{isSlowConnection.toString()}</div>
          <div data-testid="device-type">{deviceType}</div>
          <div data-testid="orientation">{orientation}</div>
          <div data-testid="supports-webp">{supportsWebP.toString()}</div>
          <div data-testid="supports-avif">{supportsAvif.toString()}</div>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByTestId('connection-speed')).toHaveTextContent('4g');
    expect(screen.getByTestId('is-slow')).toHaveTextContent('false');
    expect(screen.getByTestId('device-type')).toHaveTextContent('desktop');
    expect(screen.getByTestId('orientation')).toHaveTextContent('landscape');
    expect(screen.getByTestId('supports-webp')).toHaveTextContent('true');
    expect(screen.getByTestId('supports-avif')).toHaveTextContent('true');
  });

  it('provides correct content loading decisions', () => {
    const TestComponent = () => {
      const { shouldLoadContent } = useProgressiveEnhancement();

      return (
        <div>
          <div data-testid="critical">{shouldLoadContent('critical').toString()}</div>
          <div data-testid="high">{shouldLoadContent('high').toString()}</div>
          <div data-testid="medium">{shouldLoadContent('medium').toString()}</div>
          <div data-testid="low">{shouldLoadContent('low').toString()}</div>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByTestId('critical')).toHaveTextContent('true');
    expect(screen.getByTestId('high')).toHaveTextContent('true');
    expect(screen.getByTestId('medium')).toHaveTextContent('true');
    expect(screen.getByTestId('low')).toHaveTextContent('true');
  });

  it('generates optimized image props correctly', () => {
    const TestComponent = () => {
      const { getOptimizedImageProps } = useProgressiveEnhancement();
      const props = getOptimizedImageProps('/test.jpg', 300, 200);

      return (
        <div>
          <div data-testid="src">{props.src}</div>
          <div data-testid="width">{props.width}</div>
          <div data-testid="height">{props.height}</div>
          <div data-testid="loading">{props.loading}</div>
          <div data-testid="quality">{props.quality}</div>
        </div>
      );
    };

    render(<TestComponent />);

    expect(screen.getByTestId('src')).toHaveTextContent('/test.jpg');
    expect(screen.getByTestId('width')).toHaveTextContent('300');
    expect(screen.getByTestId('height')).toHaveTextContent('200');
    expect(screen.getByTestId('loading')).toHaveTextContent('eager');
    expect(screen.getByTestId('quality')).toHaveTextContent('medium');
  });

  it('generates correct interaction classes', () => {
    const TestComponent = () => {
      const { getInteractionClasses } = useProgressiveEnhancement();

      return (
        <div>
          <div data-testid="button-classes">{getInteractionClasses('button')}</div>
          <div data-testid="card-classes">{getInteractionClasses('card')}</div>
          <div data-testid="link-classes">{getInteractionClasses('link')}</div>
        </div>
      );
    };

    render(<TestComponent />);

    const buttonClasses = screen.getByTestId('button-classes').textContent;
    const cardClasses = screen.getByTestId('card-classes').textContent;
    const linkClasses = screen.getByTestId('link-classes').textContent;

    expect(buttonClasses).toContain('min-h-[40px]');
    expect(buttonClasses).toContain('rounded-lg');
    expect(buttonClasses).toContain('font-medium');

    expect(cardClasses).toContain('rounded-xl');
    expect(cardClasses).toContain('border');
    expect(cardClasses).toContain('bg-card');

    expect(linkClasses).toContain('underline-offset-4');
    expect(linkClasses).toContain('hover:underline');
  });
});