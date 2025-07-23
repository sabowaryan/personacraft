'use client';

import * as React from 'react';
import { Persona, EnhancedPersona } from '@/lib/types/persona';
import { QualityMetricsGrid } from './quality-metrics-grid';
import { MemoizedMetricsGrid, MemoizedQualityScore } from './memoized-metrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePersonaMetrics } from '@/hooks/use-persona-metrics';
import { TestTube, Sparkles, BarChart3, Target } from 'lucide-react';

// Sample persona data for testing
const samplePersona: Persona = {
  id: 'demo-persona-1',
  name: 'Marie Dubois',
  age: 32,
  location: 'Paris, France',
  bio: 'Professionnelle du marketing digital passionnée par les nouvelles technologies et l\'innovation. Mère de deux enfants, elle jongle entre sa carrière et sa vie de famille tout en restant active sur les réseaux sociaux.',
  quote: 'L\'innovation n\'est pas seulement une question de technologie, c\'est une façon de penser différemment.',
  values: ['Innovation', 'Équilibre vie-travail', 'Authenticité', 'Durabilité', 'Créativité'],
  interests: {
    music: ['Pop française', 'Jazz', 'Musique électronique'],
    brands: ['Apple', 'Patagonia', 'Sephora', 'Netflix'],
    movies: ['Films d\'auteur', 'Documentaires', 'Comédies françaises'],
    food: ['Cuisine bio', 'Restaurants végétariens', 'Pâtisserie artisanale'],
    books: ['Développement personnel', 'Romans contemporains', 'Essais sur l\'innovation'],
    lifestyle: ['Yoga', 'Voyages éco-responsables', 'Photographie', 'Jardinage urbain'],
  },
  communication: {
    preferredChannels: ['Instagram', 'LinkedIn', 'Email', 'WhatsApp'],
    tone: 'Professionnel mais accessible',
    contentTypes: ['Articles de blog', 'Infographies', 'Vidéos courtes', 'Podcasts'],
    frequency: 'Quotidienne pour les réseaux sociaux, hebdomadaire pour l\'email',
  },
  marketing: {
    painPoints: [
      'Manque de temps pour se tenir informée des dernières tendances',
      'Difficulté à concilier vie professionnelle et personnelle',
      'Surcharge d\'informations marketing',
      'Besoin de solutions authentiques et durables',
    ],
    motivations: [
      'Réussir professionnellement tout en gardant ses valeurs',
      'Offrir le meilleur à sa famille',
      'Contribuer à un monde plus durable',
      'Rester à la pointe de l\'innovation',
    ],
    buyingBehavior: 'Recherche approfondie avant achat, influence par les avis et recommandations',
    influences: ['Collègues de travail', 'Influenceurs LinkedIn', 'Amis proches', 'Experts du secteur'],
  },
  generatedAt: new Date(),
  sources: ['Gemini AI', 'Qloo Cultural Intelligence'],
  avatar: undefined,
};

// Enhanced persona with validation metrics
const enhancedPersona: EnhancedPersona = {
  ...samplePersona,
  validation_metrics: {
    completeness_score: 92,
    consistency_score: 88,
    realism_score: 85,
    quality_indicators: ['Données culturelles authentiques', 'Profil cohérent', 'Motivations réalistes'],
  },
  generation_metadata: {
    gemini_response_time: 1250,
    qloo_response_time: 850,
    total_processing_time: 2100,
    confidence_level: 'high',
    data_sources: ['Gemini Pro', 'Qloo Taste API'],
  },
  cultural_data: {
    music_preferences: ['Pop française', 'Jazz', 'Musique électronique'],
    brand_affinities: ['Apple', 'Patagonia', 'Sephora', 'Netflix'],
    lifestyle_indicators: ['Yoga', 'Voyages éco-responsables', 'Photographie', 'Jardinage urbain'],
  },
};

interface MetricsDemoProps {
  className?: string;
}

/**
 * Composant de démonstration pour tester le système de métriques
 */
export function MetricsDemo({ className }: MetricsDemoProps) {
  const [selectedPersona, setSelectedPersona] = React.useState<'basic' | 'enhanced'>('enhanced');
  const [showTrends, setShowTrends] = React.useState(true);
  const [compactMode, setCompactMode] = React.useState(false);

  const currentPersona = selectedPersona === 'enhanced' ? enhancedPersona : samplePersona;
  const metrics = usePersonaMetrics(currentPersona);

  return (
    <div className={className}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-primary" />
            Démonstration du Système de Métriques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Type de persona:</span>
              <div className="flex gap-1">
                <Button
                  variant={selectedPersona === 'basic' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPersona('basic')}
                >
                  Standard
                </Button>
                <Button
                  variant={selectedPersona === 'enhanced' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPersona('enhanced')}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Enrichi
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Options:</span>
              <Button
                variant={showTrends ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowTrends(!showTrends)}
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                Tendances
              </Button>
              <Button
                variant={compactMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCompactMode(!compactMode)}
              >
                Mode compact
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {metrics.qualityScore}%
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Score Global</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {metrics.completionScore}%
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Complétude</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
              <Badge variant={metrics.engagementLevel === 'high' ? 'default' : 'secondary'}>
                {metrics.engagementLevel === 'high' ? 'Élevé' :
                  metrics.engagementLevel === 'medium' ? 'Moyen' : 'Faible'}
              </Badge>
              <div className="text-sm text-purple-700 dark:text-purple-300 mt-1">Engagement</div>
            </div>
          </div>

          <Badge variant="outline" className="mb-4">
            <Target className="h-3 w-3 mr-1" />
            Persona: {currentPersona.name} ({selectedPersona === 'enhanced' ? 'Enrichi' : 'Standard'})
          </Badge>
        </CardContent>
      </Card>

      <Tabs defaultValue="quality-grid" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="quality-grid">Grille de Qualité</TabsTrigger>
          <TabsTrigger value="memoized-grid">Grille Mémorisée</TabsTrigger>
          <TabsTrigger value="quality-score">Score de Qualité</TabsTrigger>
        </TabsList>

        <TabsContent value="quality-grid" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>QualityMetricsGrid Component</CardTitle>
            </CardHeader>
            <CardContent>
              <QualityMetricsGrid
                persona={currentPersona}
                showTrends={showTrends}
                compact={compactMode}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memoized-grid" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>MemoizedMetricsGrid Component</CardTitle>
            </CardHeader>
            <CardContent>
              <MemoizedMetricsGrid
                persona={currentPersona}
                showDetails={!compactMode}
                compact={compactMode}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality-score" className="space-y-4">
          <MemoizedQualityScore persona={currentPersona} />
        </TabsContent>
      </Tabs>

      {/* Debug Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">Informations de Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs space-y-2 font-mono">
            <div>Type: {selectedPersona}</div>
            <div>Métriques calculées: {JSON.stringify({
              qualityScore: metrics.qualityScore,
              completionScore: metrics.completionScore,
              engagementLevel: metrics.engagementLevel,
              dataRichness: metrics.dataRichness,
              culturalAccuracy: metrics.culturalAccuracy,
              marketingRelevance: metrics.marketingRelevance,
            }, null, 2)}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}