'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BriefForm } from '@/components/forms/brief-form';
import { PersonaList } from '@/components/personas/persona-list';
import { usePersonaGeneration } from '@/hooks/use-persona-generation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Zap, 
  TrendingUp,
  AlertTriangle,
  Info,
  Sparkles,
  ArrowRight,
  Target,
  Brain,
  Palette,
  BarChart3,
  Users,
  ChevronDown,
  ChevronUp,
  Rocket,
  Shield,
  Gauge,
  Star,
  Lightbulb,
  Activity,
  Layers,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GeneratorPage() {
  const { 
    personas, 
    generationState, 
    generatePersonas, 
    clearPersonas,
    exportPersonas,
    validatePersona 
  } = usePersonaGeneration();

  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const [isWarningsExpanded, setIsWarningsExpanded] = useState(false);

  return (
    <>
      {/* Métadonnées SEO */}
      <head>
        <title>Générateur de Personas Marketing | PersonaCraft - IA Avancée</title>
        <meta name="description" content="Créez des personas marketing authentiques et détaillés avec notre IA avancée. Génération instantanée, métriques de qualité et export professionnel." />
        <meta name="keywords" content="personas marketing, génération IA, audience cible, marketing digital, intelligence artificielle" />
        <meta property="og:title" content="Générateur de Personas Marketing | PersonaCraft" />
        <meta property="og:description" content="Créez des personas marketing authentiques et détaillés avec notre IA avancée" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/generator" />
      </head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
        {/* Compensation pour la navbar fixed - hauteur navbar + marge */}
        <main className="container mx-auto px-4 pt-20 lg:pt-24 pb-8 lg:pb-12">
        <div className="max-w-7xl mx-auto">
          
            {/* Indicateurs de progression et état */}
          {generationState.isGenerating && (
              <section className="mb-8 animate-in slide-in-from-top-4 duration-500">
                <Card className="border-0 shadow-xl glass-card hover-lift bg-white/90 dark:bg-gray-800/90">
                  <CardHeader className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/30 dark:to-indigo-900/30">
                    <CardTitle className="flex items-center gap-3 text-indigo-700 dark:text-indigo-300">
                    <div className="relative">
                      <Zap className="h-6 w-6 animate-pulse" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-400 rounded-full pulse-ring" />
                    </div>
                      <span className="text-xl font-bold">Génération en cours...</span>
                      <Badge variant="outline" className="ml-auto border-indigo-300 dark:border-indigo-600">
                        <Clock className="h-3 w-3 mr-1" />
                        {Math.round(generationState.progress)}%
                      </Badge>
                  </CardTitle>
                </CardHeader>
                  <CardContent className="p-6 space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {generationState.currentStep}
                        </span>
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          {generationState.progress}%
                        </span>
                      </div>
                      <Progress value={generationState.progress} className="h-3 bg-gray-100 dark:bg-gray-700" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="glass-card p-4 rounded-lg hover-scale bg-white/60 dark:bg-gray-700/60">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                            <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                      <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Temps moyen</p>
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {Math.round(generationState.performance_metrics.average_response_time)}ms
                        </p>
                      </div>
                    </div>
                      </div>
                      <div className="glass-card p-4 rounded-lg hover-scale bg-white/60 dark:bg-gray-700/60">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                      <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Taux de succès</p>
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {Math.round(generationState.performance_metrics.success_rate * 100)}%
                        </p>
                      </div>
                    </div>
                      </div>
                      <div className="glass-card p-4 rounded-lg hover-scale bg-white/60 dark:bg-gray-700/60">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                            <Gauge className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                      <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Qualité</p>
                            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">Optimale</p>
                          </div>
                        </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </section>
          )}

          {/* Gestion des erreurs améliorée */}
          {generationState.error && (
              <section className="mb-8 animate-in slide-in-from-top-4 duration-500">
                <Alert variant="destructive" className="glass-card border-red-200 dark:border-red-700 bg-red-50/90 dark:bg-red-900/20">
                <AlertCircle className="h-5 w-5" />
                  <AlertDescription className="space-y-4">
                    <div>
                      <p className="font-medium text-lg mb-2 text-red-800 dark:text-red-200">{generationState.error}</p>
                  {generationState.recommendations.length > 0 && (
                        <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                          <p className="font-medium text-sm mb-3 flex items-center gap-2 text-red-700 dark:text-red-300">
                            <Lightbulb className="h-4 w-4" />
                            Recommandations pour résoudre le problème :
                          </p>
                          <ul className="space-y-2">
                        {generationState.recommendations.map((rec: string, index: number) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <ArrowRight className="h-3 w-3 mt-0.5 text-red-500 dark:text-red-400 flex-shrink-0" />
                                <span className="text-red-700 dark:text-red-300">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                    </div>
                </AlertDescription>
              </Alert>
              </section>
          )}

            {/* Warnings avec design moderne et responsive - Système de dévoilement */}
          {generationState.warnings.length > 0 && (
              <section className="mb-6 animate-in slide-in-from-top-4 duration-500">
                <div className="bg-gradient-to-r from-red-50/95 to-orange-50/95 dark:from-red-900/30 dark:to-orange-900/30 border-2 border-red-200/60 dark:border-red-700/60 rounded-xl shadow-lg backdrop-blur-sm">
                  {/* En-tête avec bouton de dévoilement */}
                  <button 
                    onClick={() => setIsWarningsExpanded(!isWarningsExpanded)}
                    className="w-full flex items-center justify-between gap-3 p-4 border-b border-red-200/50 dark:border-red-700/50 hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 dark:bg-red-800/60 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <h3 className="text-sm font-bold text-red-800 dark:text-red-200 truncate">
                          ⚠️ Points d'attention détectés
                        </h3>
                        <p className="text-xs text-red-600 dark:text-red-300">
                          {generationState.warnings.length} point{generationState.warnings.length > 1 ? 's' : ''} critique{generationState.warnings.length > 1 ? 's' : ''} à examiner
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-1 bg-red-100 dark:bg-red-800/50 rounded-full">
                        <span className="text-xs font-bold text-red-700 dark:text-red-300">
                          {generationState.warnings.length}
                        </span>
                      </div>
                      <ChevronDown className={cn(
                        "h-4 w-4 text-red-600 dark:text-red-400 transition-transform duration-300",
                        isWarningsExpanded && "rotate-180"
                      )} />
                    </div>
                  </button>
                  
                  {/* Contenu dévoilable */}
                  {isWarningsExpanded && (
                    <div className="animate-in slide-in-from-top-2 duration-300">
                      {/* Liste des warnings */}
                      <div className="p-4 space-y-3">
                        {generationState.warnings.map((warning: string, index: number) => (
                          <div 
                            key={index} 
                            className="group flex items-start gap-3 p-3 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-red-200/50 dark:border-red-700/50 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 animate-in slide-in-from-left-4"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full group-hover:scale-125 transition-transform duration-200" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-800/50 px-2 py-0.5 rounded-full">
                                  CRITIQUE #{index + 1}
                                </span>
                              </div>
                              <p className="text-sm text-red-800 dark:text-red-200 leading-relaxed font-medium">
                                {warning}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Actions recommandées compactes */}
                      <div className="px-4 pb-4">
                        <div className="flex items-start gap-2 p-3 bg-red-100/50 dark:bg-red-800/30 rounded-lg border border-red-200/30 dark:border-red-700/30">
                          <Info className="h-3 w-3 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-red-700 dark:text-red-300 mb-1">
                              Actions recommandées :
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <span className="text-xs text-red-600 dark:text-red-400 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded-full border border-red-200/50 dark:border-red-700/50 font-medium">
                                ⚡ Vérifiez immédiatement
                              </span>
                              <span className="text-xs text-red-600 dark:text-red-400 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded-full border border-red-200/50 dark:border-red-700/50 font-medium">
                                📝 Ajoutez plus de détails
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
          )}

          {/* Métriques de qualité redesignées */}
          {personas.length > 0 && (
              <section className="mb-8 animate-in slide-in-from-bottom-4 duration-700">
                <Card className="border-0 shadow-xl glass-card overflow-hidden hover-lift bg-white/90 dark:bg-gray-800/90">
                <CardHeader 
                    className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/30 dark:to-emerald-900/30 cursor-pointer transition-all duration-300 hover:from-green-100/80 hover:to-emerald-100/80 dark:hover:from-green-900/50 dark:hover:to-emerald-900/50"
                  onClick={() => setIsStatsExpanded(!isStatsExpanded)}
                >
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg hover-scale">
                          <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                          <span className="text-green-700 dark:text-green-300 text-xl font-bold">
                            Métriques de Qualité
                          </span>
                          <p className="text-sm text-green-600 dark:text-green-400 font-normal">
                          {personas.length} persona{personas.length > 1 ? 's' : ''} généré{personas.length > 1 ? 's' : ''}
                            avec succès
                        </p>
                      </div>
                    </div>
                      <ChevronDown className={`h-5 w-5 text-green-600 dark:text-green-400 transition-transform duration-300 ${isStatsExpanded ? 'rotate-180' : ''}`} />
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="text-center p-6 bg-gradient-to-br from-green-50/80 to-green-100/80 dark:from-green-900/20 dark:to-green-800/20 rounded-xl hover-scale interactive">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-xl mb-4">
                          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                        <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                        {Math.round(generationState.quality_trends.average_completeness * 100)}%
                      </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Complétude</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Données complètes</p>
                      </div>
                      <div className="text-center p-6 bg-gradient-to-br from-blue-50/80 to-blue-100/80 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl hover-scale interactive">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-xl mb-4">
                          <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        {Math.round(generationState.quality_trends.average_consistency * 100)}%
                      </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Cohérence</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Logique interne</p>
                      </div>
                      <div className="text-center p-6 bg-gradient-to-br from-purple-50/80 to-purple-100/80 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl hover-scale interactive">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-xl mb-4">
                          <Target className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                        {Math.round(generationState.quality_trends.average_realism * 100)}%
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Réalisme</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Crédibilité</p>
                    </div>
                  </div>

                  {isStatsExpanded && (
                      <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                État des APIs :
                              </span>
                          </div>
                            <div className="flex gap-3">
                            <Badge 
                              variant={generationState.performance_metrics.api_health.gemini === 'healthy' ? 'default' : 'destructive'}
                                className="flex items-center gap-2 px-3 py-1 border-gray-300 dark:border-gray-600"
                            >
                              <Brain className="h-3 w-3" />
                              Gemini: {generationState.performance_metrics.api_health.gemini}
                            </Badge>
                            <Badge 
                              variant={generationState.performance_metrics.api_health.qloo === 'healthy' ? 'default' : 
                                      generationState.performance_metrics.api_health.qloo === 'degraded' ? 'secondary' : 'destructive'}
                                className="flex items-center gap-2 px-3 py-1 border-gray-300 dark:border-gray-600"
                            >
                              <Palette className="h-3 w-3" />
                              Qloo: {generationState.performance_metrics.api_health.qloo}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              </section>
          )}

          {/* Recommandations améliorées */}
          {generationState.recommendations.length > 0 && (
              <section className="mb-8 animate-in slide-in-from-left-4 duration-500">
                <Alert className="glass-card border-blue-200 dark:border-blue-600 bg-blue-50/90 dark:bg-blue-900/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="font-medium text-blue-700 dark:text-blue-300 text-lg">
                      Recommandations d'optimisation
                    </span>
                </div>
                  <AlertDescription className="mt-4">
                    <div className="grid gap-3">
                    {generationState.recommendations.map((rec: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-blue-50/50 dark:bg-blue-900/30 rounded-lg hover-scale">
                          <div className="p-1 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                            <Rocket className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">{rec}</span>
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
              </section>
            )}

            {/* Interface principale */}
            <section className="space-y-8">
              {personas.length === 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                <BriefForm 
                  onSubmit={generatePersonas} 
                  isLoading={generationState.isGenerating} 
                />
              </div>
            )}

              {personas.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl">
                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Vos Personas Générés
                      </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {personas.length} persona{personas.length > 1 ? 's' : ''} de qualité premium
                      </p>
                    </div>
                  </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={clearPersonas}
                    variant="outline"
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover-lift border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Layers className="h-4 w-4 mr-2" />
                        Nouveau brief
                      </Button>
                      <Button 
                        className="button-gradient text-white hover-glow"
                        onClick={() => exportPersonas('pdf', true)}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Exporter tout
                  </Button>
                    </div>
                </div>
                
                <PersonaList 
                  personas={personas} 
                  onClear={clearPersonas}
                  onExportEnhanced={(format) => exportPersonas(format, true)}
                  onValidatePersona={validatePersona}
                  showMetrics={true}
                    showPerformance={true}
                />
              </div>
            )}
            </section>
        </div>
      </main>
      
      <Footer />
    </div>
    </>
  );
}