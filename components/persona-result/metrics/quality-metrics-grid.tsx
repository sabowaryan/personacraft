'use client';

import * as React from 'react';
import { Persona, EnhancedPersona } from '@/lib/types/persona';
import { cn } from '@/lib/utils';
import { ScoreCard } from './score-card';
import { PerformanceIndicator } from './performance-indicator';
import { MetricsTooltip } from './metrics-tooltip';
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from '../ui/animated-card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Target, Award, CheckCircle, Shield, Zap } from 'lucide-react';
import { usePersonaMetrics } from '@/hooks/use-persona-metrics';

interface QualityMetricsGridProps {
  persona: Persona | EnhancedPersona;
  showTrends?: boolean;
  compact?: boolean;
  className?: string;
}

export function QualityMetricsGrid({
  persona,
  showTrends = true,
  compact = false,
  className,
}: QualityMetricsGridProps) {
  // Use the new metrics hook for consistent calculation
  const personaMetrics = usePersonaMetrics(persona);
  
  // Extract key metrics for display
  const metrics = {
    completeness: personaMetrics.validationMetrics.completeness.score,
    consistency: personaMetrics.validationMetrics.consistency.score,
    realism: personaMetrics.validationMetrics.realism.score,
    overall: personaMetrics.qualityScore,
    qualityIndicators: 'validation_metrics' in persona ? persona.validation_metrics.quality_indicators : [],
  };
  
  // Generate performance trends (mock data for demo)
  const generateTrends = () => {
    return {
      completeness: { value: 5, direction: 'up' as const },
      consistency: { value: -2, direction: 'down' as const },
      realism: { value: 0, direction: 'stable' as const },
      overall: { value: 3, direction: 'up' as const },
    };
  };

  const trends = showTrends ? generateTrends() : null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'warning';
    return 'danger';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <Award className="h-4 w-4" />;
    if (score >= 70) return <Target className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  if (compact) {
    return (
      <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-3', className)}>
        <ScoreCard
          title="Global"
          score={metrics.overall}
          variant={getScoreColor(metrics.overall)}
          icon={getScoreIcon(metrics.overall)}
          trend={trends?.overall}
          compact
        />
        <ScoreCard
          title="Complétude"
          score={metrics.completeness}
          variant={getScoreColor(metrics.completeness)}
          trend={trends?.completeness}
          compact
        />
        <ScoreCard
          title="Cohérence"
          score={metrics.consistency}
          variant={getScoreColor(metrics.consistency)}
          trend={trends?.consistency}
          compact
        />
        <ScoreCard
          title="Réalisme"
          score={metrics.realism}
          variant={getScoreColor(metrics.realism)}
          trend={trends?.realism}
          compact
        />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overall Quality Score */}
      <AnimatedCard variant="gradient" animation="glow">
        <AnimatedCardHeader>
          <AnimatedCardTitle className="flex items-center gap-2 text-white">
            {getScoreIcon(metrics.overall)}
            Score de Qualité Global
            {trends?.overall && (
              <Badge variant="secondary" className="ml-auto bg-white/20 text-white">
                {getTrendIcon(trends.overall.direction)}
                {trends.overall.value > 0 ? '+' : ''}{trends.overall.value}%
              </Badge>
            )}
          </AnimatedCardTitle>
        </AnimatedCardHeader>
        <AnimatedCardContent>
          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold text-white">
              {metrics.overall}%
            </div>
            <div className="text-right text-white/80">
              <div className="text-sm">Excellent</div>
              <div className="text-xs">Prêt pour utilisation</div>
            </div>
          </div>
        </AnimatedCardContent>
      </AnimatedCard>

      {/* Detailed Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ScoreCard
          title="Complétude"
          description="Richesse des informations"
          score={metrics.completeness}
          variant={getScoreColor(metrics.completeness)}
          trend={trends?.completeness}
          tooltip={
            <MetricsTooltip
              title="Score de Complétude"
              description="Mesure la richesse et l'exhaustivité des informations du persona"
              factors={[
                'Présence de biographie détaillée',
                'Citation personnelle authentique',
                'Valeurs et motivations définies',
                'Intérêts diversifiés',
                'Profil de communication complet',
                'Points de douleur identifiés'
              ]}
              score={metrics.completeness}
              trend={trends?.completeness ? { ...trends.completeness, timeframe: '7 derniers jours' } : undefined}
              benchmark={85}
              recommendations={personaMetrics.validationMetrics.completeness.recommendations}
            />
          }
        />
        
        <ScoreCard
          title="Cohérence"
          description="Alignement des données"
          score={metrics.consistency}
          variant={getScoreColor(metrics.consistency)}
          trend={trends?.consistency}
          tooltip={
            <MetricsTooltip
              title="Score de Cohérence"
              description="Évalue la cohérence interne entre les différents éléments du persona"
              factors={[
                'Alignement valeurs-comportements',
                'Cohérence démographique',
                'Compatibilité des intérêts',
                'Logique des canaux de communication',
                'Pertinence des influences'
              ]}
              score={metrics.consistency}
              trend={trends?.consistency ? { ...trends.consistency, timeframe: '7 derniers jours' } : undefined}
              benchmark={80}
              recommendations={personaMetrics.validationMetrics.consistency.recommendations}
            />
          }
        />
        
        <ScoreCard
          title="Réalisme"
          description="Authenticité culturelle"
          score={metrics.realism}
          variant={getScoreColor(metrics.realism)}
          trend={trends?.realism}
          tooltip={
            <MetricsTooltip
              title="Score de Réalisme"
              description="Mesure l'authenticité et la crédibilité du persona basée sur des données culturelles réelles"
              factors={[
                'Données culturelles Qloo™',
                'Préférences musicales authentiques',
                'Marques et produits cohérents',
                'Comportements d\'achat réalistes',
                'Influences sociales pertinentes'
              ]}
              score={metrics.realism}
              trend={trends?.realism ? { ...trends.realism, timeframe: '7 derniers jours' } : undefined}
              benchmark={75}
              recommendations={personaMetrics.validationMetrics.realism.recommendations}
            />
          }
        />
      </div>

      {/* Performance Indicators */}
      {showTrends && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PerformanceIndicator
            title="Évolution Qualité"
            description="Tendances des métriques principales"
            data={[
              { label: 'Complétude', value: metrics.completeness, trend: trends?.completeness },
              { label: 'Cohérence', value: metrics.consistency, trend: trends?.consistency },
              { label: 'Réalisme', value: metrics.realism, trend: trends?.realism },
            ]}
            type="percentage"
            showTrends={true}
          />
          
          <PerformanceIndicator
            title="Richesse des Données"
            description="Volume d'informations disponibles"
            data={[
              { label: 'Intérêts', value: Object.values(persona.interests).flat().length },
              { label: 'Canaux', value: persona.communication.preferredChannels.length },
              { label: 'Valeurs', value: persona.values.length },
              { label: 'Pain Points', value: persona.marketing.painPoints.length },
            ]}
            type="count"
            showTrends={false}
          />
        </div>
      )}

      {/* Advanced Metrics */}
      {showTrends && personaMetrics.performanceMetrics.totalProcessingTime > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AnimatedCard variant="outline" animation="hover">
            <AnimatedCardHeader>
              <AnimatedCardTitle className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-blue-500" />
                Performance IA
              </AnimatedCardTitle>
            </AnimatedCardHeader>
            <AnimatedCardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Temps total</span>
                  <span className="font-medium">{personaMetrics.performanceMetrics.totalProcessingTime}ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Gemini API</span>
                  <span className="font-medium">{personaMetrics.performanceMetrics.apiCalls.gemini.averageLatency}ms</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Qloo API</span>
                  <span className="font-medium">{personaMetrics.performanceMetrics.apiCalls.qloo.averageLatency}ms</span>
                </div>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>

          <AnimatedCard variant="outline" animation="hover">
            <AnimatedCardHeader>
              <AnimatedCardTitle className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-green-500" />
                Fiabilité
              </AnimatedCardTitle>
            </AnimatedCardHeader>
            <AnimatedCardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Taux de succès</span>
                  <span className="font-medium text-green-600">
                    {Math.round(personaMetrics.performanceMetrics.apiCalls.gemini.successRate)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Niveau engagement</span>
                  <Badge variant={personaMetrics.engagementLevel === 'high' ? 'default' : 'secondary'} className="text-xs">
                    {personaMetrics.engagementLevel === 'high' ? 'Élevé' : 
                     personaMetrics.engagementLevel === 'medium' ? 'Moyen' : 'Faible'}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Erreurs</span>
                  <span className="font-medium text-gray-500">
                    {personaMetrics.performanceMetrics.apiCalls.failed}
                  </span>
                </div>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>

          <AnimatedCard variant="outline" animation="hover">
            <AnimatedCardHeader>
              <AnimatedCardTitle className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-purple-500" />
                Utilité Marketing
              </AnimatedCardTitle>
            </AnimatedCardHeader>
            <AnimatedCardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Score global</span>
                  <span className="font-medium text-purple-600">{personaMetrics.marketingRelevance}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Précision culturelle</span>
                  <span className="font-medium">{personaMetrics.culturalAccuracy}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Richesse données</span>
                  <span className="font-medium">{personaMetrics.dataRichness}%</span>
                </div>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </div>
      )}

      {/* Quality Indicators */}
      {metrics.qualityIndicators.length > 0 && (
        <AnimatedCard variant="outline">
          <AnimatedCardHeader>
            <AnimatedCardTitle>Indicateurs de Qualité</AnimatedCardTitle>
          </AnimatedCardHeader>
          <AnimatedCardContent>
            <div className="flex flex-wrap gap-2">
              {metrics.qualityIndicators.map((indicator, index) => (
                <Badge key={index} variant="secondary">
                  {indicator}
                </Badge>
              ))}
            </div>
          </AnimatedCardContent>
        </AnimatedCard>
      )}
    </div>
  );
}