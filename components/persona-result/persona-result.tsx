'use client';

import { useState, memo, useMemo, useCallback, useEffect } from 'react';
import { Persona } from '@/lib/types/persona';
import { ArrowLeft, Download, Share2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CircularScore, ModernBadge, ModernStatCard, AnimatedProgress } from '@/components/ui/modern-elements';
import { PersonaScoreCard } from './persona-score-card';
import { PersonaStatGrid } from './persona-stat-grid';
import {
  MemoizedProfileTab,
  MemoizedInterestsTab,
  MemoizedCommunicationTab,
  MemoizedMarketingTab
} from './ui/lazy-tab-content';
import { MemoizedMetricsGrid, usePersonaMetrics } from './metrics/memoized-metrics';
import { usePersonaPreferences } from '@/hooks/use-persona-preferences';
import { usePreferenceStyles } from '@/hooks/use-preference-styles';
import {
  PersonaErrorBoundary,
  PersonaGracefulDegradation,
  detectMissingFields,
  validatePersonaData,
  OfflineIndicator,
  ErrorReporting,
  PersonaRenderErrorFallback
} from './error';
import {
  PersonaResultSkeleton,
  ProgressiveLoading,
  OfflineSupport,
  useOfflineSupport,
} from './loading';
import {
  PersonaKeyboardNavigation,
  AriaLiveRegions,
  usePersonaAnnouncements,
  AccessibilitySettings
} from './accessibility';

interface PersonaResultProps {
  persona: Persona;
  onBack?: () => void;
  isLoading?: boolean;
  loadingStage?: string;
  estimatedLoadTime?: number;
}

// Internal component without error boundary
const PersonaResultInternal = memo(function PersonaResultInternal({ persona, onBack }: PersonaResultProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const { preferences } = usePersonaPreferences();
  const { getCardClasses, getAnimationClasses, getCSSProperties } = usePreferenceStyles();
  const { announceTabChange, announceExportStart, announceShareStart } = usePersonaAnnouncements();

  // Validate persona data and detect missing fields
  const validation = useMemo(() => {
    const missingFields = detectMissingFields(persona);
    const dataValidation = validatePersonaData(persona);
    return { missingFields, ...dataValidation };
  }, [persona]);

  // Use memoized metrics calculation
  const metrics = usePersonaMetrics(persona);

  // Memoize expensive calculations
  const personaData = useMemo(() => ({
    id: persona.id,
    name: persona.name,
    age: persona.age,
    location: persona.location,
    avatar: persona.avatar,
    quote: persona.quote,
    values: persona.values,
    generatedAt: persona.generatedAt,
    sources: persona.sources,
  }), [persona]);

  const handleExport = useMemo(() => () => {
    announceExportStart('PDF');
    // Logique d'export à implémenter
    console.log('Exporting persona:', personaData.id);
  }, [personaData.id, announceExportStart]);

  const handleShare = useMemo(() => () => {
    announceShareStart();
    // Logique de partage à implémenter
    console.log('Sharing persona:', personaData.id);
  }, [personaData.id, announceShareStart]);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    announceTabChange(tab);
  }, [announceTabChange]);

  const handleRegenerateRequest = useCallback(() => {
    // This would trigger a regeneration of the persona
    console.log('Regeneration requested for persona:', persona.id);
  }, [persona.id]);

  // If there are validation errors or critical missing data, show graceful degradation
  if (!validation.isValid || validation.missingFields.length > 0) {
    return (
      <div className="flex flex-col w-full max-w-7xl mx-auto">
        <OfflineIndicator />
        <PersonaGracefulDegradation
          persona={persona}
          missingFields={validation.missingFields}
          onRegenerateRequest={handleRegenerateRequest}
        />
      </div>
    );
  }

  return (
    <AriaLiveRegions>
      <PersonaKeyboardNavigation
        onExport={handleExport}
        onShare={handleShare}
        onBack={onBack}
        onTabChange={handleTabChange}
        currentTab={activeTab}
      >
        <div className="flex flex-col w-full max-w-7xl mx-auto persona-animate-in">
          {/* En-tête */}
          <header
            id="persona-header"
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 p-4 persona-animate-in persona-delay-1"
            role="banner"
            aria-label="Persona header"
          >
            <div className="flex items-center gap-3">
              {onBack && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="h-9 w-9"
                  aria-label="Go back to previous page"
                  data-focus-priority="10"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{persona.name}</h1>
                <p className="text-muted-foreground">
                  {persona.age} ans • {persona.location}
                </p>
              </div>
            </div>
            <div
              id="persona-actions"
              className="flex items-center gap-2 self-end md:self-auto"
              role="group"
              aria-label="Persona actions"
              data-focus-group="actions"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                aria-label="Export persona to PDF"
                data-focus-priority="8"
              >
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                aria-label="Share persona with others"
                data-focus-priority="7"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Partager
              </Button>
            </div>
          </header>

          {/* Section héroïque */}
          <section
            id="persona-hero"
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 px-4 persona-animate-in persona-delay-2"
            aria-label="Persona overview"
          >
            <Card className="md:col-span-2 persona-result-card" role="region" aria-labelledby="persona-overview-title">
              <CardContent className="p-6">
                <h2 id="persona-overview-title" className="sr-only">Persona Overview</h2>
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                  <div className="relative">
                    <div
                      className="h-32 w-32 rounded-full overflow-hidden border-4 border-primary/20 bg-muted flex items-center justify-center"
                      role="img"
                      aria-label={persona.avatar ? `Avatar image of ${persona.name}` : `Placeholder avatar for ${persona.name}`}
                    >
                      {persona.avatar ? (
                        <img
                          src={persona.avatar}
                          alt={`Avatar de ${persona.name}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span
                          className="text-4xl font-bold text-primary/40"
                          aria-hidden="true"
                        >
                          {persona.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2">
                      <ModernBadge
                        variant="success"
                        size="lg"
                        pulse
                      >
                        <Star className="h-3.5 w-3.5 mr-1" aria-hidden="true" />
                        Généré
                      </ModernBadge>
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <div
                      className="flex flex-wrap gap-2 justify-center md:justify-start mb-4"
                      role="list"
                      aria-label="Persona basic information"
                    >
                      <Badge
                        variant="outline"
                        className="text-xs font-medium"
                        role="listitem"
                        aria-label={`Age: ${persona.age} years old`}
                      >
                        {persona.age} ans
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs font-medium"
                        role="listitem"
                        aria-label={`Location: ${persona.location}`}
                      >
                        {persona.location}
                      </Badge>
                      {persona.values.slice(0, 2).map((value, index) => (
                        <Badge
                          key={index}
                          className="text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20"
                          role="listitem"
                          aria-label={`Core value: ${value}`}
                        >
                          {value}
                        </Badge>
                      ))}
                    </div>

                    {persona.quote && (
                      <blockquote
                        className="relative mt-4 p-4 text-muted-foreground bg-muted/50 rounded-lg border border-border persona-quote"
                        aria-label={`Quote from ${persona.name}`}
                      >
                        <p className="relative z-10">{persona.quote}</p>
                      </blockquote>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4" role="complementary" aria-label="Quality metrics">
              <PersonaScoreCard
                qualityScore={metrics.qualityScore}
                completionScore={metrics.completionScore}
              />
            </div>
          </section>

          {/* Statistiques rapides */}
          <section
            id="persona-metrics"
            className="mb-8 px-4 persona-animate-in persona-delay-3"
            aria-label="Quick statistics"
          >
            <PersonaStatGrid persona={persona} />
          </section>

          {/* Onglets de contenu */}
          <section
            id="persona-tabs"
            className="px-4 persona-animate-in persona-delay-4"
            aria-label="Detailed persona information"
          >
            <Tabs
              defaultValue="profile"
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList
                className="grid grid-cols-4 mb-8"
                role="tablist"
                aria-label="Persona information sections"
                data-focus-group="tabs"
              >
                <TabsTrigger
                  value="profile"
                  role="tab"
                  aria-selected={activeTab === 'profile'}
                  aria-controls="profile-panel"
                  data-focus-priority="6"
                >
                  Profil
                </TabsTrigger>
                <TabsTrigger
                  value="interests"
                  role="tab"
                  aria-selected={activeTab === 'interests'}
                  aria-controls="interests-panel"
                  data-focus-priority="5"
                >
                  Intérêts
                </TabsTrigger>
                <TabsTrigger
                  value="communication"
                  role="tab"
                  aria-selected={activeTab === 'communication'}
                  aria-controls="communication-panel"
                  data-focus-priority="4"
                >
                  Communication
                </TabsTrigger>
                <TabsTrigger
                  value="marketing"
                  role="tab"
                  aria-selected={activeTab === 'marketing'}
                  aria-controls="marketing-panel"
                  data-focus-priority="3"
                >
                  Marketing
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="profile"
                className={getAnimationClasses('fade')}
                role="tabpanel"
                id="profile-panel"
                aria-labelledby="profile-tab"
                tabIndex={0}
              >
                <MemoizedProfileTab persona={persona} isActive={activeTab === 'profile'} />
              </TabsContent>

              <TabsContent
                value="interests"
                className={getAnimationClasses('fade')}
                role="tabpanel"
                id="interests-panel"
                aria-labelledby="interests-tab"
                tabIndex={0}
              >
                <MemoizedInterestsTab persona={persona} isActive={activeTab === 'interests'} />
              </TabsContent>

              <TabsContent
                value="communication"
                className={getAnimationClasses('fade')}
                role="tabpanel"
                id="communication-panel"
                aria-labelledby="communication-tab"
                tabIndex={0}
              >
                <MemoizedCommunicationTab persona={persona} isActive={activeTab === 'communication'} />
              </TabsContent>

              <TabsContent
                value="marketing"
                className={getAnimationClasses('fade')}
                role="tabpanel"
                id="marketing-panel"
                aria-labelledby="marketing-tab"
                tabIndex={0}
              >
                <MemoizedMarketingTab persona={persona} isActive={activeTab === 'marketing'} />
              </TabsContent>
            </Tabs>
          </section>

          {/* Pied de page */}
          <footer className="mt-12 p-4 text-center text-sm text-muted-foreground persona-animate-in persona-delay-5">
            <p>Persona généré le {new Date(persona.generatedAt).toLocaleDateString()}</p>
            {persona.sources && persona.sources.length > 0 && (
              <p className="mt-1">Basé sur {persona.sources.length} source(s)</p>
            )}
          </footer>
        </div>
      </PersonaKeyboardNavigation>
    </AriaLiveRegions>
  );
});

// Main exported component with error boundary, loading states, and offline support
export const PersonaResult = memo(function PersonaResult({
  persona,
  onBack,
  isLoading = false,
  loadingStage = 'Chargement du persona...',
  estimatedLoadTime = 3000
}: PersonaResultProps) {
  const { cachePersona } = useOfflineSupport(persona.id);

  const handleError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    // Log error for monitoring
    console.error('PersonaResult Error:', error, errorInfo);

    // In production, you would send this to your error reporting service
    if (process.env.NODE_ENV === 'production') {
      // sendErrorToService({ error, errorInfo, context: 'PersonaResult' });
    }
  }, []);

  // Cache persona data when successfully loaded
  useEffect(() => {
    if (!isLoading && persona) {
      cachePersona(persona);
    }
  }, [isLoading, persona, cachePersona]);

  // Show loading skeleton while loading
  if (isLoading) {
    return (
      <PersonaResultSkeleton
        showProgress={true}
        estimatedTime={estimatedLoadTime}
        stage={loadingStage}
      />
    );
  }

  return (
    <PersonaErrorBoundary
      onError={handleError}
      resetKeys={[persona.id]}
      resetOnPropsChange={true}
      fallback={({ error, resetError, errorId }) => (
        <div className="flex flex-col w-full max-w-7xl mx-auto p-6">
          <OfflineIndicator />
          <div className="flex items-center justify-between mb-4">
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="flex-1" />
            <ErrorReporting
              error={error!}
              errorId={errorId}
              onReportSent={(reportId) => {
                console.log('Error report sent:', reportId);
              }}
            />
          </div>
          <PersonaRenderErrorFallback
            error={error}
            errorInfo={null}
            resetError={resetError}
            retryCount={0}
            errorId={errorId}
          />
        </div>
      )}
    >
      <OfflineSupport
        personaId={persona.id}
        fallbackComponent={({ cachedData }) => (
          <PersonaResultInternal
            persona={cachedData!.persona}
            onBack={onBack}
          />
        )}
      >
        <ProgressiveLoading
          isLoading={false}
          skeleton={PersonaResultSkeleton}
          priority="high"
        >
          <PersonaResultInternal persona={persona} onBack={onBack} />
        </ProgressiveLoading>
      </OfflineSupport>
      <AccessibilitySettings />
    </PersonaErrorBoundary>
  );
});