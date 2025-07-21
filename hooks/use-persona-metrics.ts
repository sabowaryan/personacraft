'use client';

import { useMemo } from 'react';
import { Persona, EnhancedPersona } from '@/lib/types/persona';
import { PersonaMetrics, PersonaValidationMetrics, MetricDetail } from '@/lib/types/persona-metrics';

/**
 * Hook pour calculer les métriques de qualité d'un persona
 * Supporte à la fois les personas standard et enrichis
 */
export function usePersonaMetrics(persona: Persona | EnhancedPersona): PersonaMetrics {
  return useMemo(() => {
    // Si c'est un persona enrichi, utiliser les métriques existantes
    if ('validation_metrics' in persona) {
      return calculateEnhancedMetrics(persona);
    }
    
    // Sinon, calculer les métriques de base
    return calculateBasicMetrics(persona);
  }, [persona]);
}

/**
 * Calcule les métriques pour un persona enrichi
 */
function calculateEnhancedMetrics(persona: EnhancedPersona): PersonaMetrics {
  const validation = persona.validation_metrics;
  const metadata = persona.generation_metadata;
  
  const qualityScore = Math.round(
    (validation.completeness_score + validation.consistency_score + validation.realism_score) / 3
  );
  
  const completionScore = Math.round(validation.completeness_score);
  
  const engagementLevel = getEngagementLevel(qualityScore);
  
  const validationMetrics: PersonaValidationMetrics = {
    completeness: createMetricDetail(validation.completeness_score, 'Complétude des données'),
    consistency: createMetricDetail(validation.consistency_score, 'Cohérence interne'),
    realism: createMetricDetail(validation.realism_score, 'Réalisme culturel'),
    culturalAuthenticity: createMetricDetail(validation.realism_score, 'Authenticité culturelle'),
    marketingUtility: createMetricDetail(qualityScore, 'Utilité marketing'),
    dataQuality: createMetricDetail(
      Math.round((validation.completeness_score + validation.consistency_score) / 2),
      'Qualité des données'
    ),
  };
  
  return {
    qualityScore,
    completionScore,
    engagementLevel,
    dataRichness: Math.round(validation.completeness_score),
    culturalAccuracy: Math.round(validation.realism_score),
    marketingRelevance: qualityScore,
    validationMetrics,
    performanceMetrics: {
      generationTime: metadata.total_processing_time,
      dataProcessingTime: metadata.gemini_response_time + metadata.qloo_response_time,
      culturalDataFetch: metadata.qloo_response_time,
      validationTime: 0,
      totalProcessingTime: metadata.total_processing_time,
      apiCalls: {
        gemini: {
          calls: 1,
          averageLatency: metadata.gemini_response_time,
          successRate: 100,
          errors: [],
        },
        qloo: {
          calls: 1,
          averageLatency: metadata.qloo_response_time,
          successRate: 100,
          errors: [],
        },
        total: 2,
        failed: 0,
        retries: 0,
      },
      cacheHitRate: 0,
      errorRate: 0,
    },
    trends: [],
  };
}

/**
 * Calcule les métriques de base pour un persona standard
 */
function calculateBasicMetrics(persona: Persona): PersonaMetrics {
  // Calcul de la complétude
  const completenessFactors = [
    { check: !!persona.bio && persona.bio.length > 50, weight: 0.2 },
    { check: !!persona.quote, weight: 0.1 },
    { check: persona.values.length >= 3, weight: 0.2 },
    { check: Object.values(persona.interests).flat().length >= 10, weight: 0.2 },
    { check: persona.communication.preferredChannels.length >= 2, weight: 0.15 },
    { check: persona.marketing.painPoints.length >= 2, weight: 0.15 },
  ];
  
  const completionScore = Math.round(
    completenessFactors.reduce((sum, factor) => sum + (factor.check ? factor.weight : 0), 0) * 100
  );
  
  // Calcul de la cohérence
  const consistencyFactors = [
    { check: persona.values.length >= 3 && persona.values.length <= 7, weight: 0.3 },
    { check: persona.communication.preferredChannels.length >= 2, weight: 0.2 },
    { check: persona.marketing.painPoints.length >= 2, weight: 0.2 },
    { check: persona.marketing.motivations.length >= 2, weight: 0.2 },
    { check: !!persona.communication.tone, weight: 0.1 },
  ];
  
  const consistencyScore = Math.round(
    consistencyFactors.reduce((sum, factor) => sum + (factor.check ? factor.weight : 0), 0) * 100
  );
  
  // Calcul du réalisme
  const interestsCount = Object.values(persona.interests).flat().length;
  const realismFactors = [
    { check: interestsCount >= 10 && interestsCount <= 30, weight: 0.4 },
    { check: persona.marketing.influences.length >= 2, weight: 0.3 },
    { check: !!persona.quote && persona.quote.length > 20, weight: 0.2 },
    { check: !!persona.marketing.buyingBehavior, weight: 0.1 },
  ];
  
  const realismScore = Math.round(
    realismFactors.reduce((sum, factor) => sum + (factor.check ? factor.weight : 0), 0) * 100
  );
  
  const qualityScore = Math.round((completionScore + consistencyScore + realismScore) / 3);
  const engagementLevel = getEngagementLevel(qualityScore);
  
  const validationMetrics: PersonaValidationMetrics = {
    completeness: createMetricDetail(completionScore, 'Complétude des données'),
    consistency: createMetricDetail(consistencyScore, 'Cohérence interne'),
    realism: createMetricDetail(realismScore, 'Réalisme culturel'),
    culturalAuthenticity: createMetricDetail(realismScore, 'Authenticité culturelle'),
    marketingUtility: createMetricDetail(qualityScore, 'Utilité marketing'),
    dataQuality: createMetricDetail(
      Math.round((completionScore + consistencyScore) / 2),
      'Qualité des données'
    ),
  };
  
  return {
    qualityScore,
    completionScore,
    engagementLevel,
    dataRichness: completionScore,
    culturalAccuracy: realismScore,
    marketingRelevance: qualityScore,
    validationMetrics,
    performanceMetrics: {
      generationTime: 0,
      dataProcessingTime: 0,
      culturalDataFetch: 0,
      validationTime: 0,
      totalProcessingTime: 0,
      apiCalls: {
        gemini: { calls: 0, averageLatency: 0, successRate: 100, errors: [] },
        qloo: { calls: 0, averageLatency: 0, successRate: 100, errors: [] },
        total: 0,
        failed: 0,
        retries: 0,
      },
      cacheHitRate: 0,
      errorRate: 0,
    },
    trends: [],
  };
}

/**
 * Détermine le niveau d'engagement basé sur le score de qualité
 */
function getEngagementLevel(score: number): 'low' | 'medium' | 'high' {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  return 'low';
}

/**
 * Crée un objet MetricDetail standardisé
 */
function createMetricDetail(score: number, description: string): MetricDetail {
  const status = score >= 90 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'average' : 'poor';
  const trend = 'stable'; // Par défaut, pourrait être calculé avec l'historique
  
  return {
    score,
    status,
    trend,
    details: {
      components: [],
      weightedScore: score,
      missingElements: [],
      strengths: [],
      weaknesses: [],
    },
    recommendations: generateRecommendations(score, description),
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Génère des recommandations basées sur le score
 */
function generateRecommendations(score: number, metricType: string): string[] {
  if (score >= 90) {
    return [`Excellent ${metricType.toLowerCase()} ! Continuez sur cette voie.`];
  }
  
  if (score >= 70) {
    return [
      `Bon ${metricType.toLowerCase()}, quelques améliorations possibles.`,
      'Considérez ajouter plus de détails pour enrichir le profil.',
    ];
  }
  
  if (score >= 50) {
    return [
      `${metricType} moyenne, des améliorations sont recommandées.`,
      'Ajoutez plus d\'informations détaillées.',
      'Vérifiez la cohérence des données.',
    ];
  }
  
  return [
    `${metricType} faible, des améliorations importantes sont nécessaires.`,
    'Complétez les informations manquantes.',
    'Vérifiez la cohérence et le réalisme des données.',
    'Considérez régénérer le persona avec plus de contexte.',
  ];
}

/**
 * Hook pour comparer les métriques de plusieurs personas
 */
export function usePersonaComparison(personas: (Persona | EnhancedPersona)[]) {
  return useMemo(() => {
    const metrics = personas.map(persona => usePersonaMetrics(persona));
    
    const averageQuality = Math.round(
      metrics.reduce((sum, metric) => sum + metric.qualityScore, 0) / metrics.length
    );
    
    const bestPerformer = personas[
      metrics.findIndex(m => m.qualityScore === Math.max(...metrics.map(m => m.qualityScore)))
    ];
    
    const worstPerformer = personas[
      metrics.findIndex(m => m.qualityScore === Math.min(...metrics.map(m => m.qualityScore)))
    ];
    
    return {
      metrics,
      averageQuality,
      bestPerformer,
      worstPerformer,
      totalPersonas: personas.length,
    };
  }, [personas]);
}