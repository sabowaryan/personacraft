'use client';

import { memo } from 'react';
import { Persona, EnhancedPersona } from '@/lib/types/persona';
import { CircularScore, ModernStatCard } from '@/components/ui/modern-elements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePersonaMetrics } from '@/hooks/use-persona-metrics';
import {
  Target,
  Users,
  Heart,
  Star,
  BarChart3,
  CheckCircle
} from 'lucide-react';

interface MemoizedMetricsProps {
  persona: Persona | EnhancedPersona;
  showDetails?: boolean;
  compact?: boolean;
}

/**
 * Memoized metrics grid component
 */
export const MemoizedMetricsGrid = memo(function MemoizedMetricsGrid({
  persona,
  showDetails = false,
  compact = false,
}: MemoizedMetricsProps) {
  const metrics = usePersonaMetrics(persona);

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      case 'low': return 'destructive';
      default: return 'default';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'destructive';
  };

  if (compact) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="text-center">
          <CircularScore
            score={metrics.qualityScore}
            size="sm"
            color={getScoreColor(metrics.qualityScore) as any}
          />
          <p className="text-xs text-muted-foreground mt-1">Qualité</p>
        </div>
        <div className="text-center">
          <CircularScore
            score={metrics.completionScore}
            size="sm"
            color={getScoreColor(metrics.completionScore) as any}
          />
          <p className="text-xs text-muted-foreground mt-1">Complétude</p>
        </div>
        <div className="text-center">
          <Badge variant={getEngagementColor(metrics.engagementLevel) as any} className="text-xs">
            {metrics.engagementLevel}
          </Badge>
          <p className="text-xs text-muted-foreground mt-1">Engagement</p>
        </div>
        <div className="text-center">
          <span className="text-lg font-bold">{metrics.dataRichness}</span>
          <p className="text-xs text-muted-foreground mt-1">Richesse</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <ModernStatCard
        title="Score de Qualité"
        value={`${metrics.qualityScore}%`}
        description="Évaluation globale du persona"
        icon={<Star className="h-4 w-4" />}
        trend={metrics.qualityScore >= 70 ? 'up' : 'down'}
        color={getScoreColor(metrics.qualityScore) as any}
      />

      <ModernStatCard
        title="Complétude"
        value={`${metrics.completionScore}%`}
        description="Pourcentage de données renseignées"
        icon={<CheckCircle className="h-4 w-4" />}
        trend={metrics.completionScore >= 80 ? 'up' : 'down'}
        color={getScoreColor(metrics.completionScore) as any}
      />

      <ModernStatCard
        title="Richesse des Données"
        value={metrics.dataRichness.toString()}
        description="Quantité d'informations disponibles"
        icon={<BarChart3 className="h-4 w-4" />}
        color="primary"
      />

      {showDetails && (
        <>
          <ModernStatCard
            title="Précision Culturelle"
            value={`${metrics.culturalAccuracy}%`}
            description="Authenticité des données culturelles"
            icon={<Users className="h-4 w-4" />}
            color={getScoreColor(metrics.culturalAccuracy) as any}
          />

          <ModernStatCard
            title="Pertinence Marketing"
            value={`${metrics.marketingRelevance}%`}
            description="Utilité pour les campagnes"
            icon={<Target className="h-4 w-4" />}
            color={getScoreColor(metrics.marketingRelevance) as any}
          />

          <ModernStatCard
            title="Niveau d'Engagement"
            value={metrics.engagementLevel}
            description="Potentiel d'interaction"
            icon={<Heart className="h-4 w-4" />}
            color={getEngagementColor(metrics.engagementLevel) as any}
          />
        </>
      )}
    </div>
  );
});

/**
 * Memoized quality score card
 */
export const MemoizedQualityScore = memo(function MemoizedQualityScore({
  persona,
}: { persona: Persona | EnhancedPersona }) {
  const metrics = usePersonaMetrics(persona);

  return (
    <Card className="persona-result-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Scores de Qualité
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <div className="text-center">
            <CircularScore
              score={metrics.qualityScore}
              size="lg"
              color={metrics.qualityScore >= 80 ? 'success' : metrics.qualityScore >= 60 ? 'warning' : 'danger'}
            />
            <p className="text-sm text-muted-foreground mt-2 font-medium">Qualité Globale</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <CircularScore
              score={metrics.completionScore}
              size="md"
              color={metrics.completionScore >= 80 ? 'success' : 'warning'}
            />
            <p className="text-sm text-muted-foreground mt-2">Complétude</p>
          </div>
          <div className="text-center">
            <CircularScore
              score={metrics.culturalAccuracy}
              size="md"
              color={metrics.culturalAccuracy >= 80 ? 'success' : 'warning'}
            />
            <p className="text-sm text-muted-foreground mt-2">Précision</p>
          </div>
        </div>

        <div className="flex justify-center">
          <Badge
            variant={
              metrics.engagementLevel === 'high' ? 'default' :
                metrics.engagementLevel === 'medium' ? 'secondary' :
                  'outline'
            }
            className="px-3 py-1"
          >
            Engagement {metrics.engagementLevel === 'high' ? 'Élevé' : 
                       metrics.engagementLevel === 'medium' ? 'Moyen' : 'Faible'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
});


export { usePersonaMetrics };
// Hook is already exported from the main index file