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
  Gauge
} from 'lucide-react';

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
  const [currentSection, setCurrentSection] = useState<'form' | 'results'>('form');

  // Animation automatique vers la section résultats
  useEffect(() => {
    if (personas.length > 0) {
      setCurrentSection('results');
    } else {
      setCurrentSection('form');
    }
  }, [personas.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <Header />
      
      <main className="container mx-auto px-4 py-6 lg:py-12">
        <div className="max-w-7xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent mb-4">
              <Sparkles className="h-6 w-6 text-indigo-500" />
              <span className="text-sm font-semibold tracking-wider uppercase">IA Avancée</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              Générateur de 
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Personas</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Créez des personas marketing authentiques et détaillés avec notre IA avancée. 
              Validé par des métriques de qualité et enrichi culturellement.
            </p>
          </div>

          {/* État de génération amélioré */}
          {generationState.isGenerating && (
            <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-indigo-700">
                    <div className="relative">
                      <Zap className="h-6 w-6 animate-pulse" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-400 rounded-full animate-ping" />
                    </div>
                    <span className="text-lg">Génération en cours...</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gray-700">{generationState.currentStep}</span>
                      <span className="text-sm font-bold text-indigo-600">{generationState.progress}%</span>
                    </div>
                    <Progress value={generationState.progress} className="h-3 bg-gray-100" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Temps moyen</p>
                        <p className="text-lg font-bold text-blue-600">
                          {Math.round(generationState.performance_metrics.average_response_time)}ms
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-green-50/50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Taux de succès</p>
                        <p className="text-lg font-bold text-green-600">
                          {Math.round(generationState.performance_metrics.success_rate * 100)}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-purple-50/50 rounded-lg">
                      <Gauge className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Qualité</p>
                        <p className="text-lg font-bold text-purple-600">Optimale</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Gestion des erreurs améliorée */}
          {generationState.error && (
            <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <Alert variant="destructive" className="border-red-200 bg-red-50/50 backdrop-blur-sm">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription className="space-y-3">
                  <p className="font-medium">{generationState.error}</p>
                  {generationState.recommendations.length > 0 && (
                    <div className="mt-3 p-3 bg-white/50 rounded-lg">
                      <p className="font-medium text-sm mb-2">💡 Recommandations :</p>
                      <ul className="text-sm space-y-1">
                        {generationState.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <ArrowRight className="h-3 w-3 mt-0.5 text-red-500 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Warnings avec design amélioré */}
          {generationState.warnings.length > 0 && (
            <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <Alert className="border-amber-200 bg-amber-50/50 backdrop-blur-sm">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <AlertDescription>
                  <div className="space-y-2">
                    {generationState.warnings.map((warning: string, index: number) => (
                      <p key={index} className="text-sm flex items-start gap-2">
                        <span className="inline-block w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0" />
                        {warning}
                      </p>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Métriques de qualité redesignées */}
          {personas.length > 0 && (
            <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm overflow-hidden">
                <CardHeader 
                  className="bg-gradient-to-r from-green-50 to-emerald-50 cursor-pointer hover:from-green-100 hover:to-emerald-100 transition-colors"
                  onClick={() => setIsStatsExpanded(!isStatsExpanded)}
                >
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <span className="text-green-700 text-lg">Métriques de Qualité</span>
                        <p className="text-sm text-green-600 font-normal">
                          {personas.length} persona{personas.length > 1 ? 's' : ''} généré{personas.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    {isStatsExpanded ? 
                      <ChevronUp className="h-5 w-5 text-green-600" /> : 
                      <ChevronDown className="h-5 w-5 text-green-600" />
                    }
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center p-4 bg-gradient-to-b from-green-50 to-green-100/50 rounded-xl">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {Math.round(generationState.quality_trends.average_completeness * 100)}%
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Complétude</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-b from-blue-50 to-blue-100/50 rounded-xl">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-3">
                        <Shield className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {Math.round(generationState.quality_trends.average_consistency * 100)}%
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Cohérence</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-b from-purple-50 to-purple-100/50 rounded-xl">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-3">
                        <Target className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="text-3xl font-bold text-purple-600 mb-1">
                        {Math.round(generationState.quality_trends.average_realism * 100)}%
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Réalisme</p>
                    </div>
                  </div>

                  {isStatsExpanded && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">État des APIs :</span>
                          </div>
                          <div className="flex gap-2">
                            <Badge 
                              variant={generationState.performance_metrics.api_health.gemini === 'healthy' ? 'default' : 'destructive'}
                              className="flex items-center gap-1"
                            >
                              <Brain className="h-3 w-3" />
                              Gemini: {generationState.performance_metrics.api_health.gemini}
                            </Badge>
                            <Badge 
                              variant={generationState.performance_metrics.api_health.qloo === 'healthy' ? 'default' : 
                                      generationState.performance_metrics.api_health.qloo === 'degraded' ? 'secondary' : 'destructive'}
                              className="flex items-center gap-1"
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
            </div>
          )}

          {/* Recommandations améliorées */}
          {generationState.recommendations.length > 0 && (
            <div className="mb-8 animate-in fade-in slide-in-from-left-4 duration-500">
              <Alert className="border-blue-200 bg-blue-50/50 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  <span className="font-medium text-blue-700">Recommandations pour optimiser vos personas</span>
                </div>
                <AlertDescription className="mt-3">
                  <div className="grid gap-2">
                    {generationState.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                        <Rocket className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Interface principale avec navigation fluide */}
          <div className="space-y-8">
            {currentSection === 'form' && (
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader className="text-center pb-6">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Users className="h-6 w-6 text-indigo-500" />
                      <CardTitle className="text-2xl text-gray-900">
                        Créer votre brief
                      </CardTitle>
                    </div>
                    <p className="text-gray-600">
                      Décrivez votre audience cible et laissez notre IA créer des personas détaillés
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <BriefForm 
                      onSubmit={generatePersonas} 
                      isLoading={generationState.isGenerating} 
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {currentSection === 'results' && personas.length > 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Vos Personas Générés
                      </h2>
                      <p className="text-gray-600">
                        {personas.length} persona{personas.length > 1 ? 's' : ''} créé{personas.length > 1 ? 's' : ''} avec succès
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={clearPersonas}
                    variant="outline"
                    className="hover:bg-gray-100 transition-colors"
                  >
                    Créer de nouveaux personas
                  </Button>
                </div>
                
                <PersonaList 
                  personas={personas} 
                  onClear={clearPersonas}
                  onExportEnhanced={(format) => exportPersonas(format, true)}
                  onValidatePersona={validatePersona}
                  showMetrics={true}
                />
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}