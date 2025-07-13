'use client';

import { useState, useCallback, useEffect } from 'react';
import { Persona, BriefFormData, EnhancedPersona } from '@/lib/types/persona';
import { 
  GeminiPersonaResponse,
  GeminiValidationResults,
  GeminiMetrics 
} from '@/lib/types/gemini';
import { 
  QlooResponse,
  QlooInsights 
} from '@/lib/types/qloo';
import { usePersonasStorage, useUsageStats, useBriefHistory } from './use-local-storage';

export interface EnhancedGenerationState {
  isGenerating: boolean;
  progress: number;
  currentStep: string;
  error: string | null;
  
  // Nouvelles métriques
  performance_metrics: {
    average_response_time: number;
    success_rate: number;
    total_tokens_used: number;
    api_health: {
      gemini: 'healthy' | 'degraded' | 'offline';
      qloo: 'healthy' | 'degraded' | 'offline';
    };
  };
  
  // Validation et qualité
  last_validation_results?: GeminiValidationResults;
  quality_trends: {
    average_completeness: number;
    average_consistency: number;
    average_realism: number;
  };
  
  // Insights culturels
  cultural_insights?: QlooInsights;
  
  // Warnings et recommandations
  warnings: string[];
  recommendations: string[];
}

export interface UsePersonaGenerationReturn {
  personas: (Persona | EnhancedPersona)[];
  generationState: EnhancedGenerationState;
  generatePersonas: (brief: BriefFormData) => Promise<void>;
  regeneratePersona: (personaId: string, brief: BriefFormData) => Promise<void>;
  validatePersona: (persona: EnhancedPersona) => Promise<GeminiValidationResults>;
  exportPersonas: (format: 'pdf' | 'csv' | 'json', includeMetrics?: boolean) => Promise<void>;
  clearPersonas: () => void;
  getQualityInsights: () => Promise<QlooInsights | null>;
  
  // Fonctions avancées
  batchGenerate: (briefs: BriefFormData[]) => Promise<void>;
  optimizeBrief: (brief: BriefFormData) => Promise<BriefFormData>;
  comparePersonas: (personaIds: string[]) => PersonaComparison;
  
  // Fonctions CRUD basiques
  addPersona: (persona: Persona | EnhancedPersona) => void;
  removePersona: (personaId: string) => void;
  updatePersona: (personaId: string, updates: Partial<Persona | EnhancedPersona>) => void;
  getPersonaById: (personaId: string) => Persona | EnhancedPersona | undefined;
  savePersonas: () => void;
  loadPersonas: () => void;
  
  // Propriétés de compatibilité
  isGenerating: boolean;
  error: string | null;
}

interface PersonaComparison {
  similarities: string[];
  differences: string[];
  recommendations: string[];
  quality_comparison: {
    [personaId: string]: {
      completeness: number;
      consistency: number;
      realism: number;
    };
  };
}

export function usePersonaGeneration(): UsePersonaGenerationReturn {
  const [personas, setPersonas] = useState<(Persona | EnhancedPersona)[]>([]);
  const [generationState, setGenerationState] = useState<EnhancedGenerationState>({
    isGenerating: false,
    progress: 0,
    currentStep: '',
    error: null,
    performance_metrics: {
      average_response_time: 0,
      success_rate: 1,
      total_tokens_used: 0,
      api_health: {
        gemini: 'healthy',
        qloo: 'healthy'
      }
    },
    quality_trends: {
      average_completeness: 0,
      average_consistency: 0,
      average_realism: 0
    },
    warnings: [],
    recommendations: []
  });

  // Hooks pour la persistance et les statistiques
  const { value: storedPersonas, setValue: setStoredPersonas } = usePersonasStorage();
  const { incrementPersonasGenerated, updateFavoriteAgeRange, addFavoriteInterest } = useUsageStats();
  const { addBrief } = useBriefHistory();

  // Charger les personas depuis le localStorage au montage
  useEffect(() => {
    if (storedPersonas && storedPersonas.length > 0) {
      setPersonas(storedPersonas);
    }
  }, [storedPersonas]);

  // Synchroniser avec sessionStorage pour la persistance entre onglets
  useEffect(() => {
    if (personas.length > 0) {
      try {
        // Sauvegarder dans sessionStorage pour les personas récemment générés
        sessionStorage.setItem('personacraft-session-personas', JSON.stringify(personas));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde dans sessionStorage:', error);
      }
    }
  }, [personas]);

  // Écouter les changements de localStorage pour la synchronisation entre onglets
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'personacraft-personas' && e.newValue) {
        try {
          const newPersonas = JSON.parse(e.newValue);
          setPersonas(newPersonas);
        } catch (error) {
          console.error('Erreur lors de la synchronisation localStorage:', error);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
      }
    };
  }, []);

  // Fonction principale de génération enrichie
  const generatePersonas = useCallback(async (brief: BriefFormData) => {
    try {
      // Initialiser l'état de génération
      updateGenerationState({
        isGenerating: true,
        progress: 0,
        currentStep: 'Validation du brief...',
        error: null,
        warnings: [],
        recommendations: []
      });

      // Étape 1: Validation et optimisation du brief
      updateGenerationState({
        progress: 10,
        currentStep: 'Optimisation du brief...'
      });

      const optimizedBrief = await optimizeBrief(brief);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Étape 2: Appel aux APIs externes avec monitoring
      updateGenerationState({
        progress: 30,
        currentStep: 'Récupération des données culturelles...'
      });

      const response = await fetch('/api/generate-persona', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(optimizedBrief)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la génération');
      }

      // Étape 3: Traitement de la réponse enrichie
      updateGenerationState({
        progress: 80,
        currentStep: 'Traitement des résultats...'
      });

      const data = await response.json();
      
      // Convertir les personas avec les nouvelles métriques
      const enhancedPersonas: EnhancedPersona[] = data.personas.map((p: any) => ({
        ...p,
        generatedAt: p.generatedAt ? new Date(p.generatedAt) : new Date()
      }));

      // Étape 4: Mise à jour des métriques et insights
      updateGenerationState({
        progress: 95,
        currentStep: 'Finalisation...'
      });

      // Mettre à jour les métriques de performance
      const newMetrics = {
        average_response_time: data.metadata.performance_metrics.average_generation_time,
        success_rate: data.metadata.performance_metrics.success_rate,
        total_tokens_used: data.metadata.performance_metrics.total_tokens_used,
        api_health: {
          gemini: data.metadata.api_status.gemini === 'active' ? 'healthy' as const : 'offline' as const,
          qloo: data.metadata.api_status.qloo === 'active' ? 'healthy' as const : 
                data.metadata.api_status.qloo === 'simulated' ? 'degraded' as const : 'offline' as const
        }
      };

      // Calculer les tendances de qualité
      const qualityTrends = calculateQualityTrends(enhancedPersonas);

      // Ajouter les nouveaux personas
      setPersonas(prev => [...prev, ...enhancedPersonas]);

      // Finaliser avec succès
      updateGenerationState({
        progress: 100,
        currentStep: 'Terminé',
        isGenerating: false,
        performance_metrics: newMetrics,
        quality_trends: qualityTrends,
        warnings: data.warnings || [],
        recommendations: generateRecommendations(enhancedPersonas, data.metadata)
      });

    } catch (error: any) {
      console.error('Erreur lors de la génération:', error);
      updateGenerationState({
        isGenerating: false,
        error: error.message || 'Erreur inconnue lors de la génération',
        progress: 0,
        currentStep: 'Erreur'
      });
    }
  }, []);

  // Fonction de régénération d'un persona spécifique
  const regeneratePersona = useCallback(async (personaId: string, brief: BriefFormData) => {
    try {
      updateGenerationState({
        isGenerating: true,
        currentStep: 'Régénération en cours...',
        progress: 50
      });

      // Supprimer l'ancien persona
      setPersonas(prev => prev.filter(p => p.id !== personaId));

      // Générer le nouveau
      await generatePersonas(brief);

    } catch (error: any) {
      updateGenerationState({
        isGenerating: false,
        error: error.message,
        progress: 0
      });
    }
  }, [generatePersonas]);

  // Validation d'un persona
  const validatePersona = useCallback(async (persona: EnhancedPersona): Promise<GeminiValidationResults> => {
    try {
      const response = await fetch('/api/validate-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona })
      });

      const validation = await response.json();
      
      updateGenerationState(prev => ({
        ...prev,
        last_validation_results: validation
      }));

      return validation;
    } catch (error) {
      console.error('Erreur validation:', error);
      throw error;
    }
  }, []);

  // Export enrichi avec métriques
  const exportPersonas = useCallback(async (
    format: 'pdf' | 'csv' | 'json', 
    includeMetrics: boolean = false
  ) => {
    try {
      const response = await fetch(`/api/export/${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          personas, 
          includeMetrics,
          performance_metrics: generationState.performance_metrics,
          quality_trends: generationState.quality_trends
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'export');
      }

      // Télécharger le fichier
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `personas-enhanced.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error: any) {
      updateGenerationState(prev => ({
        ...prev,
        error: error.message
      }));
    }
  }, [personas, generationState]);

  // Génération en lot
  const batchGenerate = useCallback(async (briefs: BriefFormData[]) => {
    try {
      updateGenerationState({
        isGenerating: true,
        currentStep: `Génération de ${briefs.length} personas...`,
        progress: 0
      });

      const response = await fetch('/api/batch/generate-personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ briefs })
      });

      // Traiter la réponse batch...
      const batchResult = await response.json();
      
      // Mettre à jour les personas et métriques
      setPersonas(prev => [...prev, ...batchResult.personas]);

    } catch (error: any) {
      updateGenerationState(prev => ({
        ...prev,
        error: error.message,
        isGenerating: false
      }));
    }
  }, []);

  // Optimisation du brief
  const optimizeBrief = useCallback(async (brief: BriefFormData): Promise<BriefFormData> => {
    // Logique d'optimisation basée sur les métriques historiques
    const optimized = { ...brief };
    
    // Suggestions d'amélioration basées sur les tendances
    if (brief.interests.length < 3) {
      updateGenerationState(prev => ({
        ...prev,
        recommendations: [...prev.recommendations, 'Ajouter plus d\'intérêts pour une meilleure personnalisation']
      }));
    }

    return optimized;
  }, []);

  // Comparaison de personas
  const comparePersonas = useCallback((personaIds: string[]): PersonaComparison => {
    const selectedPersonas = personas.filter(p => personaIds.includes(p.id));
    
    // Analyser les similitudes et différences
    const similarities: string[] = [];
    const differences: string[] = [];
    const recommendations: string[] = [];
    
    // Logique de comparaison...
    
    return {
      similarities,
      differences,
      recommendations,
      quality_comparison: selectedPersonas.reduce((acc, persona) => ({
        ...acc,
        [persona.id]: {
          completeness: 'validation_metrics' in persona ? persona.validation_metrics.completeness_score : 0,
          consistency: 'validation_metrics' in persona ? persona.validation_metrics.consistency_score : 0,
          realism: 'validation_metrics' in persona ? persona.validation_metrics.realism_score : 0
        }
      }), {})
    };
  }, [personas]);

  // Insights culturels
  const getQualityInsights = useCallback(async (): Promise<QlooInsights | null> => {
    try {
      const response = await fetch('/api/insights/quality');
      return await response.json();
    } catch (error) {
      console.error('Erreur insights:', error);
      return null;
    }
  }, []);

  const clearPersonas = useCallback(() => {
    setPersonas([]);
    setGenerationState(prev => ({
      ...prev,
      quality_trends: {
        average_completeness: 0,
        average_consistency: 0,
        average_realism: 0
      },
      warnings: [],
      recommendations: []
    }));
  }, []);

  // Helpers
  const updateGenerationState = (updates: Partial<EnhancedGenerationState> | ((prev: EnhancedGenerationState) => Partial<EnhancedGenerationState>)) => {
    if (typeof updates === 'function') {
      setGenerationState(prev => ({ ...prev, ...updates(prev) }));
    } else {
      setGenerationState(prev => ({ ...prev, ...updates }));
    }
  };

  // Fonctions CRUD basiques
  const addPersona = useCallback((persona: Persona | EnhancedPersona) => {
    setPersonas(prev => [...prev, persona]);
    setStoredPersonas(prev => [...prev, persona]);
  }, [setStoredPersonas]);

  const removePersona = useCallback((personaId: string) => {
    setPersonas(prev => prev.filter(p => p.id !== personaId));
    setStoredPersonas(prev => prev.filter(p => p.id !== personaId));
  }, [setStoredPersonas]);

  const updatePersona = useCallback((personaId: string, updates: Partial<Persona | EnhancedPersona>) => {
    const updateFn = (personas: (Persona | EnhancedPersona)[]) => 
      personas.map(p => p.id === personaId ? { ...p, ...updates } : p);
    
    setPersonas(updateFn);
    setStoredPersonas(updateFn);
  }, [setStoredPersonas]);

  const getPersonaById = useCallback((personaId: string) => {
    return personas.find(p => p.id === personaId);
  }, [personas]);

  const savePersonas = useCallback(() => {
    setStoredPersonas(personas);
  }, [personas, setStoredPersonas]);

  const loadPersonas = useCallback(() => {
    try {
      // 1. Essayer de charger depuis le hook d'abord (storedPersonas)
      if (storedPersonas && storedPersonas.length > 0) {
        setPersonas(storedPersonas);
        return;
      }

      // 2. Essayer de charger depuis sessionStorage (personas récemment générés)
      if (typeof window !== 'undefined') {
        const sessionPersonas = sessionStorage.getItem('personacraft-session-personas');
        if (sessionPersonas) {
          const parsedSessionPersonas = JSON.parse(sessionPersonas);
          if (parsedSessionPersonas.length > 0) {
            setPersonas(parsedSessionPersonas);
            return;
          }
        }

        // 3. En dernier recours, charger depuis localStorage directement
        const localPersonas = localStorage.getItem('personacraft-personas');
        if (localPersonas) {
          const parsedLocalPersonas = JSON.parse(localPersonas).map((p: any) => ({
            ...p,
            generatedAt: p.generatedAt ? new Date(p.generatedAt) : new Date()
          }));
          if (parsedLocalPersonas.length > 0) {
            setPersonas(parsedLocalPersonas);
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des personas:', error);
    }
  }, [storedPersonas]);

  // Fonction pour calculer les métriques de qualité (seulement pour les personas enrichis)
  const calculateQualityTrends = (personas: (Persona | EnhancedPersona)[]) => {
    const enhancedPersonas = personas.filter(p => 'validation_metrics' in p) as EnhancedPersona[];
    
    if (enhancedPersonas.length === 0) {
      return {
        average_completeness: 0,
        average_consistency: 0,
        average_realism: 0
      };
    }

    return {
      average_completeness: enhancedPersonas.reduce((sum, p) => sum + p.validation_metrics.completeness_score, 0) / enhancedPersonas.length,
      average_consistency: enhancedPersonas.reduce((sum, p) => sum + p.validation_metrics.consistency_score, 0) / enhancedPersonas.length,
      average_realism: enhancedPersonas.reduce((sum, p) => sum + p.validation_metrics.realism_score, 0) / enhancedPersonas.length
    };
  };

  const generateRecommendations = (personas: EnhancedPersona[], metadata: any): string[] => {
    const recommendations: string[] = [];
    
    // Analyser les métriques pour générer des recommandations
    const avgCompleteness = personas.reduce((sum, p) => sum + p.validation_metrics.completeness_score, 0) / personas.length;
    
    if (avgCompleteness < 0.8) {
      recommendations.push('Considérez ajouter plus de détails dans votre description pour améliorer la complétude');
    }

    if (metadata.api_status.qloo === 'simulated') {
      recommendations.push('Configurez une clé API Qloo pour des données culturelles authentiques');
    }

    return recommendations;
  };

  return {
    personas,
    generationState,
    generatePersonas,
    regeneratePersona,
    validatePersona,
    exportPersonas,
    clearPersonas,
    getQualityInsights,
    batchGenerate,
    optimizeBrief,
    comparePersonas,
    addPersona,
    removePersona,
    updatePersona,
    getPersonaById,
    savePersonas,
    loadPersonas,
    isGenerating: generationState.isGenerating,
    error: generationState.error
  };
} 