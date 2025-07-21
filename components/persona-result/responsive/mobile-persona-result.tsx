'use client';

import { useState, memo, useMemo, useCallback } from 'react';
import { Persona } from '@/lib/types/persona';
import { ArrowLeft, Download, Share2, Star, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ModernBadge } from '@/components/ui/modern-elements';
import { PersonaScoreCard } from '../persona-score-card';
import { PersonaStatGrid } from '../persona-stat-grid';
import {
  MemoizedProfileTab,
  MemoizedInterestsTab,
  MemoizedCommunicationTab,
  MemoizedMarketingTab
} from '../ui/lazy-tab-content';
import { usePersonaMetrics } from '../metrics/memoized-metrics';
import { usePersonaPreferences } from '@/hooks/use-persona-preferences';
import { usePersonaAnnouncements } from '../accessibility';

// Responsive components
import { MobileLayout, SwipeableTabs, TouchButton } from './mobile-layout';
import {
  ResponsiveText,
  ResponsiveSpacing,
  ResponsiveGrid,
  ResponsiveContainer,
  TouchCard,
  ResponsiveImage
} from './responsive-typography';
import {
  AdaptiveLoading,
  ProgressiveImage,
  DeviceOptimized,
  OrientationLayout,
  ConnectionAware,
  useNetworkStatus,
  useDeviceCapabilities
} from './progressive-enhancement';
import {
  Show,
  Hide,
  Adaptive,
  useDynamicStyles,
  useResponsiveSpacing,
  useTouchInteractions
} from './breakpoint-utils';

import { useBreakpoints } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

interface MobilePersonaResultProps {
  persona: Persona;
  onBack?: () => void;
}

// Mobile-optimized hero section
const MobileHeroSection = memo(function MobileHeroSection({ persona }: { persona: Persona }) {
  const { isMobile, isTablet } = useBreakpoints();
  const { getTouchClasses } = useTouchInteractions();
  const metrics = usePersonaMetrics(persona);
  const networkInfo = useNetworkStatus();
  const deviceInfo = useDeviceCapabilities();

  return (
    <ResponsiveContainer maxWidth="full" padding="md">
      <ResponsiveSpacing spacing="md" direction="vertical">
        {/* Avatar and Basic Info - Mobile First */}
        <TouchCard className="relative overflow-hidden">
          <div className={cn(
            'flex items-center gap-4',
            isMobile ? 'flex-col text-center' : 'flex-row'
          )}>
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <DeviceOptimized
                touchBehavior="minimal"
                mouseBehavior="enhanced"
                className={cn(
                  'rounded-full overflow-hidden border-4 border-primary/20 bg-muted flex items-center justify-center',
                  isMobile ? 'h-24 w-24' : 'h-32 w-32'
                )}
              >
                {persona.avatar ? (
                  <ConnectionAware
                    slowConnectionFallback={
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <ResponsiveText variant="h2" className="text-primary/60">
                          {persona.name.charAt(0)}
                        </ResponsiveText>
                      </div>
                    }
                  >
                    <ProgressiveImage
                      src={persona.avatar}
                      alt={`Avatar de ${persona.name}`}
                      width={isMobile ? 96 : 128}
                      height={isMobile ? 96 : 128}
                      className="w-full h-full object-cover"
                      priority={true}
                      placeholder="blur"
                    />
                  </ConnectionAware>
                ) : (
                  <ResponsiveText
                    variant="h2"
                    className="text-primary/40"
                    aria-hidden="true"
                  >
                    {persona.name.charAt(0)}
                  </ResponsiveText>
                )}
              </DeviceOptimized>
              
              {/* Status Badge */}
              <div className="absolute -bottom-2 -right-2">
                <ModernBadge
                  variant="success"
                  size={isMobile ? 'sm' : 'lg'}
                  pulse
                >
                  <Star className="h-3 w-3 mr-1" />
                  Généré
                </ModernBadge>
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 min-w-0">
              <ResponsiveText variant="h1" className="mb-2">
                {persona.name}
              </ResponsiveText>
              
              <ResponsiveText variant="body" className="text-muted-foreground mb-4">
                {persona.age} ans • {persona.location}
              </ResponsiveText>

              {/* Values Badges */}
              <div className={cn(
                'flex flex-wrap gap-2',
                isMobile ? 'justify-center' : 'justify-start'
              )}>
                <Badge variant="outline" className={getTouchClasses(false)}>
                  {persona.age} ans
                </Badge>
                <Badge variant="outline" className={getTouchClasses(false)}>
                  {persona.location}
                </Badge>
                {persona.values.slice(0, isMobile ? 1 : 2).map((value, index) => (
                  <Badge
                    key={index}
                    className={cn(
                      'bg-primary/10 text-primary hover:bg-primary/20',
                      getTouchClasses(false)
                    )}
                  >
                    {value}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Quote - Full Width */}
          {persona.quote && (
            <div className="mt-6">
              <blockquote className="relative p-4 text-muted-foreground bg-muted/50 rounded-lg border border-border">
                <ResponsiveText variant="body" className="italic">
                  "{persona.quote}"
                </ResponsiveText>
              </blockquote>
            </div>
          )}
        </TouchCard>

        {/* Quality Scores - Mobile Optimized */}
        <Show on="mobile">
          <TouchCard>
            <ResponsiveText variant="h3" className="mb-4 text-center">
              Score du Persona
            </ResponsiveText>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {metrics.qualityScore}%
                </div>
                <ResponsiveText variant="caption">Qualité</ResponsiveText>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {metrics.completionScore}%
                </div>
                <ResponsiveText variant="caption">Complétude</ResponsiveText>
              </div>
            </div>
          </TouchCard>
        </Show>

        {/* Desktop Score Card */}
        <Hide on="mobile">
          <PersonaScoreCard
            qualityScore={metrics.qualityScore}
            completionScore={metrics.completionScore}
          />
        </Hide>
      </ResponsiveSpacing>
    </ResponsiveContainer>
  );
});

// Mobile-optimized action bar
const MobileActionBar = memo(function MobileActionBar({
  onBack,
  onExport,
  onShare
}: {
  onBack?: () => void;
  onExport: () => void;
  onShare: () => void;
}) {
  const { isMobile } = useBreakpoints();
  const { getButtonClasses } = useTouchInteractions();

  return (
    <div className={cn(
      'flex items-center gap-2 p-4',
      'bg-background/95 backdrop-blur-sm',
      'border-b border-border',
      'sticky top-0 z-40'
    )}>
      {onBack && (
        <TouchButton
          variant="ghost"
          size={isMobile ? 'md' : 'sm'}
          onClick={onBack}
          aria-label="Retour"
          className="flex-shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
          {!isMobile && <span className="ml-2">Retour</span>}
        </TouchButton>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <TouchButton
          variant="outline"
          size={isMobile ? 'sm' : 'md'}
          onClick={onExport}
          aria-label="Exporter"
        >
          <Download className="h-4 w-4" />
          {!isMobile && <span className="ml-2">Exporter</span>}
        </TouchButton>

        <TouchButton
          variant="outline"
          size={isMobile ? 'sm' : 'md'}
          onClick={onShare}
          aria-label="Partager"
        >
          <Share2 className="h-4 w-4" />
          {!isMobile && <span className="ml-2">Partager</span>}
        </TouchButton>
      </div>
    </div>
  );
});

// Mobile-optimized stats grid
const MobileStatsGrid = memo(function MobileStatsGrid({ persona }: { persona: Persona }) {
  const { isMobile } = useBreakpoints();

  // Simplified stats for mobile
  const mobileStats = [
    { label: 'Âge', value: `${persona.age} ans` },
    { label: 'Lieu', value: persona.location },
    { label: 'Valeurs', value: persona.values.length },
    { label: 'Généré', value: new Date(persona.generatedAt).toLocaleDateString() },
  ];

  return (
    <ResponsiveContainer maxWidth="full" padding="md">
      <Show on="mobile">
        <ResponsiveGrid columns={{ mobile: 2 }} gap="sm">
          {mobileStats.map((stat, index) => (
            <TouchCard key={index} className="text-center">
              <ResponsiveText variant="caption" className="mb-1">
                {stat.label}
              </ResponsiveText>
              <ResponsiveText variant="body" className="font-semibold">
                {stat.value}
              </ResponsiveText>
            </TouchCard>
          ))}
        </ResponsiveGrid>
      </Show>

      <Hide on="mobile">
        <PersonaStatGrid persona={persona} />
      </Hide>
    </ResponsiveContainer>
  );
});

// Main mobile persona result component
export const MobilePersonaResult = memo(function MobilePersonaResult({
  persona,
  onBack
}: MobilePersonaResultProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const { preferences } = usePersonaPreferences();
  const { announceTabChange, announceExportStart, announceShareStart } = usePersonaAnnouncements();
  const { styles, classes } = useDynamicStyles();
  const { isMobile, isTablet } = useBreakpoints();

  // Memoized handlers
  const handleExport = useCallback(() => {
    announceExportStart('PDF');
    console.log('Exporting persona:', persona.id);
  }, [persona.id, announceExportStart]);

  const handleShare = useCallback(() => {
    announceShareStart();
    console.log('Sharing persona:', persona.id);
  }, [persona.id, announceShareStart]);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    announceTabChange(tab);
  }, [announceTabChange]);

  // Tab configuration with responsive content
  const tabs = useMemo(() => [
    {
      id: 'profile',
      label: 'Profil',
      content: (
        <Adaptive>
          {({ isMobile }) => (
            <div className={isMobile ? 'space-y-4' : 'space-y-6'}>
              <MemoizedProfileTab persona={persona} isActive={activeTab === 'profile'} />
            </div>
          )}
        </Adaptive>
      ),
    },
    {
      id: 'interests',
      label: 'Intérêts',
      content: (
        <Adaptive>
          {({ isMobile }) => (
            <div className={isMobile ? 'space-y-4' : 'space-y-6'}>
              <MemoizedInterestsTab persona={persona} isActive={activeTab === 'interests'} />
            </div>
          )}
        </Adaptive>
      ),
    },
    {
      id: 'communication',
      label: 'Communication',
      content: (
        <Adaptive>
          {({ isMobile }) => (
            <div className={isMobile ? 'space-y-4' : 'space-y-6'}>
              <MemoizedCommunicationTab persona={persona} isActive={activeTab === 'communication'} />
            </div>
          )}
        </Adaptive>
      ),
    },
    {
      id: 'marketing',
      label: 'Marketing',
      content: (
        <Adaptive>
          {({ isMobile }) => (
            <div className={isMobile ? 'space-y-4' : 'space-y-6'}>
              <MemoizedMarketingTab persona={persona} isActive={activeTab === 'marketing'} />
            </div>
          )}
        </Adaptive>
      ),
    },
  ], [persona, activeTab]);

  return (
    <div className={cn('min-h-screen bg-background', classes)} style={styles}>
      <MobileLayout
        header={
          <MobileActionBar
            onBack={onBack}
            onExport={handleExport}
            onShare={handleShare}
          />
        }
      >
        <ResponsiveSpacing spacing="lg" direction="vertical">
          {/* Hero Section */}
          <MobileHeroSection persona={persona} />

          {/* Stats Grid */}
          <MobileStatsGrid persona={persona} />

          {/* Tabbed Content with Swipe Support */}
          <ResponsiveContainer maxWidth="full" padding="md">
            <OrientationLayout
              portraitLayout={
                <AdaptiveLoading priority="high">
                  <SwipeableTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                  />
                </AdaptiveLoading>
              }
              landscapeLayout={
                <AdaptiveLoading 
                  priority="medium"
                  fallback={
                    <div className="grid grid-cols-2 gap-4">
                      {tabs.slice(0, 2).map((tab) => (
                        <TouchCard key={tab.id} className="p-4">
                          <ResponsiveText variant="h4" className="mb-2">
                            {tab.label}
                          </ResponsiveText>
                          <div className="h-32 bg-muted animate-pulse rounded" />
                        </TouchCard>
                      ))}
                    </div>
                  }
                >
                  <SwipeableTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                  />
                </AdaptiveLoading>
              }
            >
              <AdaptiveLoading priority="high">
                <SwipeableTabs
                  tabs={tabs}
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                />
              </AdaptiveLoading>
            </OrientationLayout>
          </ResponsiveContainer>

          {/* Footer */}
          <ResponsiveContainer maxWidth="full" padding="md">
            <div className="text-center py-8 border-t border-border">
              <ResponsiveText variant="caption">
                Persona généré le {new Date(persona.generatedAt).toLocaleDateString()}
              </ResponsiveText>
              {persona.sources && persona.sources.length > 0 && (
                <ResponsiveText variant="caption" className="mt-1">
                  Basé sur {persona.sources.length} source(s)
                </ResponsiveText>
              )}
            </div>
          </ResponsiveContainer>
        </ResponsiveSpacing>
      </MobileLayout>
    </div>
  );
});