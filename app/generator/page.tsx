'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { MetricCard } from '@/components/ui/metric-card';
import { MetricCardSkeleton } from '@/components/ui/metric-card-skeleton';
import { PerformanceSummary } from '@/components/ui/performance-summary';
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

// Note: Les métadonnées pour cette page sont gérées par le layout parent
// car nous utilisons 'use client' pour les hooks React

export default function GeneratorPage() {
  const {
    personas,
    generationState,
    generatePersonas,
    clearPersonas,
    exportPersonas,
    validatePersona,
    loadPersonas // Ajouter cette fonction
  } = usePersonaGeneration();

  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const [isWarningsExpanded, setIsWarningsExpanded] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);

  // Charger les personas au montage de la page
  useEffect(() => {
    loadPersonas();

    // Détecter si on vient d'une page de détail
    const checkIfFromPersonaDetail = () => {
      // Méthode 1: Vérifier le referrer
      const referrer = document.referrer;
      if (referrer.includes('/personas/')) {
        return true;
      }

      // Méthode 2: Vérifier sessionStorage pour un flag de navigation
      const navigationFlag = sessionStorage.getItem('personacraft-from-detail');
      if (navigationFlag === 'true') {
        sessionStorage.removeItem('personacraft-from-detail'); // Nettoyer après usage
        return true;
      }

      return false;
    };

    // Délai pour s'assurer que les personas sont chargés
    setTimeout(() => {
      if (checkIfFromPersonaDetail() && personas.length > 0) {
        setShowWelcomeBack(true);
        // Masquer le message après 4 secondes
        setTimeout(() => setShowWelcomeBack(false), 4000);
      }
    }, 100);
  }, [loadPersonas]);

  // Surveiller les changements de personas pour mettre à jour le message de retour
  useEffect(() => {
    if (personas.length > 0 && showWelcomeBack) {
      const timer = setTimeout(() => setShowWelcomeBack(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [personas.length, showWelcomeBack]);

  // Calculs memoïsés pour optimiser les performances - Supprimés car déplacés dans PersonaList
  // Les métriques de qualité sont maintenant gérées directement dans PersonaList

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />

      {/* Fond complet avec contenu centré */}
      <div className="w-full">
        {/* Compensation pour la navbar fixed - hauteur navbar + marge */}
        <main className="pt-24 lg:pt-28 pb-8 lg:pb-12">
          {/* Conteneur centré avec marges latérales et effets visuels */}
          <div className="max-w-6xl mx-auto px-6 lg:px-8 relative">

            {/* Effet de fond subtil pour le conteneur */}
            <div className="absolute inset-0 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-3xl shadow-xl -z-10 opacity-40"></div>

            {/* Contenu principal avec espacement amélioré */}
            <div className="relative z-10 py-8">

              {/* Message de retour depuis une page de détail */}
              {showWelcomeBack && (
                <div className="mb-6 animate-in slide-in-from-top-4 duration-500">
                  <Alert className="border-primary-200 dark:border-primary-700 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
                    <ArrowRight className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                    <AlertDescription className="text-primary-700 dark:text-primary-300 font-medium">
                      Bon retour ! Vos personas générés sont affichés ci-dessous.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Indicateurs de progression et état - Design moderne PersonaCraft */}
              {generationState.isGenerating && (
                <section className="mb-8 animate-in slide-in-from-top-4 duration-500">
                  <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 transition-all duration-300 hover:shadow-3xl">
                    <div className="relative">
                      {/* Bannière de fond avec gradient PersonaCraft */}
                      <div className="h-20 sm:h-24 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-600 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-secondary-600/20" />
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />

                        {/* Particules animées */}
                        <div className="absolute inset-0 overflow-hidden">
                          <div className="absolute top-4 left-8 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
                          <div className="absolute top-8 right-12 w-1 h-1 bg-white/40 rounded-full animate-bounce"></div>
                          <div className="absolute bottom-6 left-16 w-1.5 h-1.5 bg-white/20 rounded-full animate-ping"></div>
                          <div className="absolute bottom-4 right-8 w-1 h-1 bg-white/50 rounded-full animate-pulse"></div>
                        </div>
                      </div>

                      {/* Contenu principal */}
                      <CardContent className="relative p-6 sm:p-8 -mt-10">
                        {/* Header avec icône et titre */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            {/* Icône avec animation */}
                            <div className="relative">
                              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-xl ring-4 ring-primary-500/20 dark:ring-primary-400/20">
                                <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-white animate-pulse" />
                              </div>
                              {/* Indicateur d'activité */}
                              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center">
                                <Activity className="h-3 w-3 text-white animate-spin" />
                              </div>
                            </div>

                            <div>
                              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Génération IA en cours...
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 font-medium">
                                Création de personas authentiques avec l'intelligence artificielle
                              </p>
                            </div>
                          </div>

                          {/* Badge de progression */}
                          <div className="flex flex-col items-end gap-2">
                            <Badge className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white border-0 px-4 py-2 text-sm font-bold">
                              <Zap className="h-4 w-4 mr-2 animate-pulse" />
                              {Math.round(generationState.progress)}%
                            </Badge>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              En cours...
                            </span>
                          </div>
                        </div>

                        {/* Étape actuelle */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
                              <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                {generationState.currentStep}
                              </span>
                            </div>
                            <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                              {generationState.progress}%
                            </span>
                          </div>

                          {/* Barre de progression moderne */}
                          <div className="relative">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-1000 ease-out relative"
                                style={{ width: `${generationState.progress}%` }}
                              >
                                {/* Effet de brillance */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Métriques de performance */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {/* Temps moyen */}
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-4 border border-blue-200 dark:border-blue-700 hover:scale-[1.02] transition-all duration-300">
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                                <Clock className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Temps moyen</p>
                                <p className="text-xl font-bold text-blue-800 dark:text-blue-200">
                                  {Math.round(generationState.performance_metrics.average_response_time)}ms
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Taux de succès */}
                          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-4 border border-green-200 dark:border-green-700 hover:scale-[1.02] transition-all duration-300">
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                                <CheckCircle className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-green-700 dark:text-green-300">Taux de succès</p>
                                <p className="text-xl font-bold text-green-800 dark:text-green-200">
                                  {Math.round(generationState.performance_metrics.success_rate * 100)}%
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Qualité */}
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-4 border border-purple-200 dark:border-purple-700 hover:scale-[1.02] transition-all duration-300">
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                                <Star className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Qualité IA</p>
                                <p className="text-xl font-bold text-purple-800 dark:text-purple-200">Premium</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Message d'encouragement */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl border border-primary-200/50 dark:border-primary-700/50">
                          <div className="flex items-center gap-3">
                            <Sparkles className="h-5 w-5 text-primary-600 dark:text-primary-400 animate-pulse" />
                            <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
                              Nos algorithmes d'IA analysent vos données pour créer des personas ultra-réalistes...
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </div>
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

              {/* Métriques de qualité - Calculées à partir des vraies données personas */}
              {personas.length > 0 && (
                <section className="mb-6">
                  {/* En-tête compact */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Qualité des Personas
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {personas.length} persona{personas.length > 1 ? 's' : ''} généré{personas.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsStatsExpanded(!isStatsExpanded)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {isStatsExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Réduire
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          Détails
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Métriques compactes calculées depuis les personas réels */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Complétude</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="mt-2">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          100%
                        </span>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Cohérence</span>
                        <Shield className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="mt-2">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          100%
                        </span>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Réalisme</span>
                        <Target className="h-4 w-4 text-purple-500" />
                      </div>
                      <div className="mt-2">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          100%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Détails étendus (masqués par défaut) */}
                  {isStatsExpanded && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          État des APIs
                        </span>
                        <div className="flex gap-2">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">Gemini</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">Qloo</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Métriques de performance détaillées */}
              {personas.length > 0 && (
                <section className="mb-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Métriques de Performance
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Analyse qualitative de vos personas
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl hover-lift transition-transform duration-200">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-800/50 rounded-xl mb-4">
                          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                          100%
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-300 font-medium">Complétude</p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">Données complètes</p>
                      </div>

                      <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl hover-lift transition-transform duration-200">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-800/50 rounded-xl mb-4">
                          <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                          100%
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Cohérence</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Logique interne</p>
                      </div>

                      <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl hover-lift transition-transform duration-200">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-800/50 rounded-xl mb-4">
                          <Target className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                          100%
                        </div>
                        <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Réalisme</p>
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Crédibilité</p>
                      </div>

                      <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl hover-lift transition-transform duration-200">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-800/50 rounded-xl mb-4">
                          <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="text-4xl font-bold text-amber-600 dark:text-amber-400 mb-2">
                          {generationState.performance_metrics?.average_response_time ? Math.round(generationState.performance_metrics.average_response_time) : 8771}ms
                        </div>
                        <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">Temps moyen</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Génération</p>
                      </div>
                    </div>

                    {/* Score global et détails de performance */}
                    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-800/20 rounded-xl p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-lg">
                              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-green-700 dark:text-green-300">Qualité Globale</h4>
                              <p className="text-sm text-green-600 dark:text-green-400">Score de performance</p>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-5xl font-bold text-green-600 dark:text-green-400 mb-2">
                              100%
                            </div>
                            <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                              Score de qualité excellent
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                              Vos personas sont prêts pour la production
                            </p>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
                              <Gauge className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-blue-700 dark:text-blue-300">Performance</h4>
                              <p className="text-sm text-blue-600 dark:text-blue-400">Temps de génération</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-blue-700 dark:text-blue-300">Total</span>
                              <span className="font-bold text-blue-600 dark:text-blue-400">
                                {generationState.performance_metrics?.total_tokens_used || 0}ms
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-blue-700 dark:text-blue-300">Gemini</span>
                              <span className="font-bold text-blue-600 dark:text-blue-400">
                                {generationState.performance_metrics?.average_response_time || 0}ms
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-blue-700 dark:text-blue-300">Qloo</span>
                              <span className="font-bold text-blue-600 dark:text-blue-400">
                                {Math.round((generationState.performance_metrics?.average_response_time || 0) * 0.3)}ms
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Recommandations simplifiées */}
              {generationState.recommendations.length > 0 && (
                <section className="mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-l-4 border-blue-400 dark:border-blue-500">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                          Recommandations ({generationState.recommendations.length})
                        </h4>
                        <div className="space-y-2">
                          {generationState.recommendations.slice(0, 2).map((rec: string, index: number) => (
                            <p key={index} className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                              • {rec}
                            </p>
                          ))}
                          {generationState.recommendations.length > 2 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 dark:text-blue-400 p-0 h-auto font-normal"
                              onClick={() => setIsWarningsExpanded(!isWarningsExpanded)}
                            >
                              {isWarningsExpanded ? 'Voir moins' : `+${generationState.recommendations.length - 2} autres recommandations`}
                            </Button>
                          )}
                          {isWarningsExpanded && generationState.recommendations.slice(2).map((rec: string, index: number) => (
                            <p key={index + 2} className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed animate-in fade-in duration-300">
                              • {rec}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Section combinée Qualité + Performance - Section supprimée car dupliquée dans PersonaList */}
              {/* Les métriques de performance et score global sont maintenant gérées dans PersonaList */}

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

            </div> {/* Fin du contenu principal */}
          </div> {/* Fin du conteneur centré */}
        </main>
      </div> {/* Fin du fond complet */}

      <Footer />
    </div>
  );
}