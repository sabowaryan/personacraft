'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BriefForm } from '@/components/forms/brief-form';
import { PersonaList } from '@/components/personas/persona-list';
import { useEnhancedPersonaGeneration } from '@/hooks/use-enhanced-persona-generation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Zap, 
  TrendingUp,
  AlertTriangle,
  Info
} from 'lucide-react';

export default function GeneratorPage() {
  const { 
    personas, 
    generationState, 
    generatePersonas, 
    clearPersonas,
    exportPersonas,
    validatePersona 
  } = useEnhancedPersonaGeneration();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Générateur de Personas Enhanced</h1>
            <p className="text-gray-600">
              Créez des personas marketing avec validation avancée et métriques de qualité
            </p>
          </div>

          {/* État de génération enrichi */}
          {generationState.isGenerating && (
            <Card className="border-indigo-200 bg-indigo-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-indigo-700">
                  <Zap className="h-5 w-5 animate-pulse" />
                  <span>Génération en cours...</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{generationState.currentStep}</span>
                    <span>{generationState.progress}%</span>
                  </div>
                  <Progress value={generationState.progress} className="h-2" />
                </div>
                
                {/* Métriques temps réel */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>Temps moyen: {Math.round(generationState.performance_metrics.average_response_time)}ms</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span>Succès: {Math.round(generationState.performance_metrics.success_rate * 100)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Erreurs enrichies */}
          {generationState.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <p>{generationState.error}</p>
                {generationState.recommendations.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Recommandations :</p>
                    <ul className="text-sm list-disc list-inside">
                      {generationState.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Warnings et recommandations */}
          {generationState.warnings.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {generationState.warnings.map((warning, index) => (
                    <p key={index} className="text-sm">{warning}</p>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Métriques de qualité globales */}
          {personas.length > 0 && (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span>Métriques de Qualité</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(generationState.quality_trends.average_completeness * 100)}%
                    </div>
                    <p className="text-sm text-gray-600">Complétude moyenne</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(generationState.quality_trends.average_consistency * 100)}%
                    </div>
                    <p className="text-sm text-gray-600">Cohérence moyenne</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(generationState.quality_trends.average_realism * 100)}%
                    </div>
                    <p className="text-sm text-gray-600">Réalisme moyen</p>
                  </div>
                </div>

                {/* État des APIs */}
                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <span className="text-sm text-gray-600">État des APIs :</span>
                  <div className="flex space-x-2">
                    <Badge 
                      variant={generationState.performance_metrics.api_health.gemini === 'healthy' ? 'default' : 'destructive'}
                    >
                      Gemini: {generationState.performance_metrics.api_health.gemini}
                    </Badge>
                    <Badge 
                      variant={generationState.performance_metrics.api_health.qloo === 'healthy' ? 'default' : 
                              generationState.performance_metrics.api_health.qloo === 'degraded' ? 'secondary' : 'destructive'}
                    >
                      Qloo: {generationState.performance_metrics.api_health.qloo}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommandations générales */}
          {generationState.recommendations.length > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Recommandations pour améliorer vos personas :</p>
                  {generationState.recommendations.map((rec, index) => (
                    <p key={index} className="text-sm">• {rec}</p>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Interface principale */}
          {personas.length === 0 ? (
            <BriefForm onSubmit={generatePersonas} isGenerating={generationState.isGenerating} />
          ) : (
            <PersonaList 
              personas={personas} 
              onClear={clearPersonas}
              // Nouvelles props pour les fonctionnalités avancées
              onExportEnhanced={(format) => exportPersonas(format, true)}
              onValidatePersona={validatePersona}
              showMetrics={true}
            />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}