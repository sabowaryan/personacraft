'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PersonaInsights } from '@/components/charts/persona-insights';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Download, 
  RefreshCw, 
  TrendingUp, 
  Activity,
  Clock,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useEnhancedPersonaGeneration } from '@/hooks/use-enhanced-persona-generation';
import Link from 'next/link';

export default function AnalyticsPage() {
  const { personas, generationState, getQualityInsights } = useEnhancedPersonaGeneration();

  // Calculer les métriques avancées
  const getAdvancedMetrics = () => {
    if (personas.length === 0) return null;

    const enhancedPersonas = personas.filter(p => 'validation_metrics' in p);
    const totalPersonas = personas.length;
    const enhancedCount = enhancedPersonas.length;

    // Métriques de qualité
    const qualityMetrics = enhancedPersonas.reduce((acc, persona: any) => {
      if (persona.validation_metrics) {
        acc.completeness += persona.validation_metrics.completeness_score;
        acc.consistency += persona.validation_metrics.consistency_score;
        acc.realism += persona.validation_metrics.realism_score;
      }
      return acc;
    }, { completeness: 0, consistency: 0, realism: 0 });

    // Métriques de performance
    const performanceMetrics = enhancedPersonas.reduce((acc, persona: any) => {
      if (persona.generation_metadata) {
        acc.totalTime += persona.generation_metadata.total_processing_time;
        acc.geminiTime += persona.generation_metadata.gemini_response_time;
        acc.qlooTime += persona.generation_metadata.qloo_response_time;
      }
      return acc;
    }, { totalTime: 0, geminiTime: 0, qlooTime: 0 });

    // Niveaux de confiance
    const confidenceLevels = enhancedPersonas.reduce((acc, persona: any) => {
      const level = persona.generation_metadata?.confidence_level || 'unknown';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPersonas,
      enhancedCount,
      qualityMetrics: {
        avgCompleteness: enhancedCount > 0 ? qualityMetrics.completeness / enhancedCount : 0,
        avgConsistency: enhancedCount > 0 ? qualityMetrics.consistency / enhancedCount : 0,
        avgRealism: enhancedCount > 0 ? qualityMetrics.realism / enhancedCount : 0
      },
      performanceMetrics: {
        avgTotalTime: enhancedCount > 0 ? performanceMetrics.totalTime / enhancedCount : 0,
        avgGeminiTime: enhancedCount > 0 ? performanceMetrics.geminiTime / enhancedCount : 0,
        avgQlooTime: enhancedCount > 0 ? performanceMetrics.qlooTime / enhancedCount : 0
      },
      confidenceLevels
    };
  };

  const metrics = getAdvancedMetrics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* En-tête Enhanced */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-indigo-600" />
                <span>Analytics Enhanced</span>
                {personas.length > 0 && (
                  <Badge variant="secondary">
                    {personas.length} persona{personas.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </h1>
              <p className="text-gray-600 mt-2">
                Analysez les métriques de qualité, performance et tendances de vos personas
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => getQualityInsights()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser insights
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Rapport complet
              </Button>
            </div>
          </div>

          {personas.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h2 className="text-2xl font-semibold mb-4">Aucune donnée à analyser</h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Commencez par générer des personas pour voir apparaître des métriques avancées,
                  des analyses de qualité et des insights de performance.
                </p>
                <Link href="/generator">
                  <Button className="bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700">
                    <Zap className="h-4 w-4 mr-2" />
                    Générer des personas
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                <TabsTrigger value="quality">Qualité</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              {/* Vue d'ensemble */}
              <TabsContent value="overview" className="space-y-6">
                {metrics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total personas */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Personas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-indigo-600">{metrics.totalPersonas}</div>
                        <p className="text-sm text-gray-500">
                          {metrics.enhancedCount} avec métriques avancées
                        </p>
                      </CardContent>
                    </Card>

                    {/* Score de qualité global */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Qualité globale</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-green-600">
                          {Math.round((metrics.qualityMetrics.avgCompleteness + 
                                     metrics.qualityMetrics.avgConsistency + 
                                     metrics.qualityMetrics.avgRealism) / 3 * 100)}%
                        </div>
                        <p className="text-sm text-gray-500">Score moyen de qualité</p>
                      </CardContent>
                    </Card>

                    {/* Temps de génération moyen */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-blue-600">
                          {Math.round(metrics.performanceMetrics.avgTotalTime)}ms
                        </div>
                        <p className="text-sm text-gray-500">Temps moyen de génération</p>
                      </CardContent>
                    </Card>

                    {/* Niveau de confiance dominant */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">Confiance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-purple-600">
                          {Object.entries(metrics.confidenceLevels)
                            .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
                        </div>
                        <p className="text-sm text-gray-500">Niveau dominant</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* État du système */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-green-500" />
                      <span>État du Système</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">API Gemini</span>
                        <Badge variant={generationState.performance_metrics.api_health.gemini === 'healthy' ? 'default' : 'destructive'}>
                          {generationState.performance_metrics.api_health.gemini}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">API Qloo</span>
                        <Badge variant={
                          generationState.performance_metrics.api_health.qloo === 'healthy' ? 'default' : 
                          generationState.performance_metrics.api_health.qloo === 'degraded' ? 'secondary' : 'destructive'
                        }>
                          {generationState.performance_metrics.api_health.qloo}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Taux de succès</span>
                        <Badge variant="default">
                          {Math.round(generationState.performance_metrics.success_rate * 100)}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Graphiques existants */}
                <PersonaInsights personas={personas} />
              </TabsContent>

              {/* Onglet Qualité */}
              <TabsContent value="quality" className="space-y-6">
                {metrics && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2 text-green-600">
                            <CheckCircle className="h-5 w-5" />
                            <span>Complétude</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="text-4xl font-bold text-green-600">
                              {Math.round(metrics.qualityMetrics.avgCompleteness * 100)}%
                            </div>
                            <Progress value={metrics.qualityMetrics.avgCompleteness * 100} className="h-3" />
                            <p className="text-sm text-gray-600">
                              Moyenne de complétude des champs requis
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2 text-blue-600">
                            <Target className="h-5 w-5" />
                            <span>Cohérence</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="text-4xl font-bold text-blue-600">
                              {Math.round(metrics.qualityMetrics.avgConsistency * 100)}%
                            </div>
                            <Progress value={metrics.qualityMetrics.avgConsistency * 100} className="h-3" />
                            <p className="text-sm text-gray-600">
                              Cohérence interne des données
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2 text-purple-600">
                            <TrendingUp className="h-5 w-5" />
                            <span>Réalisme</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="text-4xl font-bold text-purple-600">
                              {Math.round(metrics.qualityMetrics.avgRealism * 100)}%
                            </div>
                            <Progress value={metrics.qualityMetrics.avgRealism * 100} className="h-3" />
                            <p className="text-sm text-gray-600">
                              Crédibilité et réalisme des personas
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recommandations d'amélioration */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          <span>Recommandations d'amélioration</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {metrics.qualityMetrics.avgCompleteness < 0.8 && (
                            <div className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg">
                              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                              <div>
                                <p className="font-medium text-yellow-800">Améliorer la complétude</p>
                                <p className="text-sm text-yellow-700">
                                  Certains champs semblent incomplets. Enrichissez vos briefs initiaux.
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {metrics.qualityMetrics.avgConsistency < 0.7 && (
                            <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                              <Target className="h-5 w-5 text-blue-500 mt-0.5" />
                              <div>
                                <p className="font-medium text-blue-800">Améliorer la cohérence</p>
                                <p className="text-sm text-blue-700">
                                  Les données semblent parfois incohérentes. Vérifiez l'alignement des valeurs et intérêts.
                                </p>
                              </div>
                            </div>
                          )}

                          {Object.keys(metrics.confidenceLevels).length > 0 && 
                           metrics.confidenceLevels.low > (metrics.enhancedCount * 0.3) && (
                            <div className="flex items-start space-x-2 p-3 bg-purple-50 rounded-lg">
                              <TrendingUp className="h-5 w-5 text-purple-500 mt-0.5" />
                              <div>
                                <p className="font-medium text-purple-800">Augmenter la confiance</p>
                                <p className="text-sm text-purple-700">
                                  Plusieurs personas ont un niveau de confiance faible. Ajoutez plus de contexte.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              {/* Onglet Performance */}
              <TabsContent value="performance" className="space-y-6">
                {metrics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Clock className="h-5 w-5 text-blue-500" />
                          <span>Temps de réponse</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Gemini API</span>
                            <span>{Math.round(metrics.performanceMetrics.avgGeminiTime)}ms</span>
                          </div>
                          <Progress 
                            value={Math.min((metrics.performanceMetrics.avgGeminiTime / 5000) * 100, 100)} 
                            className="h-2" 
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Qloo API</span>
                            <span>{Math.round(metrics.performanceMetrics.avgQlooTime)}ms</span>
                          </div>
                          <Progress 
                            value={Math.min((metrics.performanceMetrics.avgQlooTime / 3000) * 100, 100)} 
                            className="h-2" 
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Total</span>
                            <span>{Math.round(metrics.performanceMetrics.avgTotalTime)}ms</span>
                          </div>
                          <Progress 
                            value={Math.min((metrics.performanceMetrics.avgTotalTime / 8000) * 100, 100)} 
                            className="h-2" 
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Activity className="h-5 w-5 text-green-500" />
                          <span>Niveaux de confiance</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(metrics.confidenceLevels).map(([level, count]) => (
                            <div key={level} className="flex items-center justify-between">
                              <span className="capitalize font-medium">{level}</span>
                              <div className="flex items-center space-x-2">
                                <Badge variant={
                                  level === 'high' ? 'default' : 
                                  level === 'medium' ? 'secondary' : 'destructive'
                                }>
                                  {count}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  ({Math.round((count / metrics.enhancedCount) * 100)}%)
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              {/* Onglet Insights */}
              <TabsContent value="insights" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Insights culturels et comportementaux</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Les insights avancés seront disponibles avec plus de données de génération.
                      Continuez à créer des personas pour enrichir cette section.
                    </p>
                    
                    {generationState.cultural_insights && (
                      <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                        <h4 className="font-semibold text-indigo-900 mb-2">Données culturelles</h4>
                        <p className="text-sm text-indigo-700">
                          Insights basés sur {personas.length} personas générés avec données Qloo.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}