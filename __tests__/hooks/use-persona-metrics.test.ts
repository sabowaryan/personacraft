/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import { usePersonaMetrics, usePersonaComparison } from '@/hooks/use-persona-metrics';
import { Persona, EnhancedPersona } from '@/lib/types/persona';

// Mock persona data
const mockBasicPersona: Persona = {
  id: 'test-persona-1',
  name: 'Marie Dubois',
  age: 32,
  location: 'Paris, France',
  avatar: 'https://example.com/avatar.jpg',
  bio: 'Marketing manager passionnée par les nouvelles technologies et le développement durable. Toujours à la recherche de solutions innovantes pour améliorer l\'expérience client.',
  quote: 'L\'innovation naît de la curiosité et de la persévérance.',
  values: ['Innovation', 'Durabilité', 'Authenticité', 'Collaboration'],
  interests: {
    technology: ['Intelligence artificielle', 'Applications mobiles', 'Blockchain'],
    lifestyle: ['Yoga', 'Cuisine bio', 'Voyages responsables'],
    entertainment: ['Documentaires', 'Podcasts business', 'Concerts jazz'],
    sports: ['Course à pied', 'Natation'],
    culture: ['Musées', 'Théâtre', 'Littérature contemporaine']
  },
  communication: {
    preferredChannels: ['Email', 'LinkedIn', 'WhatsApp'],
    tone: 'Professionnel mais chaleureux',
    frequency: 'Régulière',
    bestTimes: ['9h-11h', '14h-16h']
  },
  marketing: {
    painPoints: ['Manque de temps', 'Information overload', 'Solutions complexes'],
    motivations: ['Efficacité', 'Innovation', 'Impact positif'],
    influences: ['Experts secteur', 'Collègues', 'Études de cas'],
    buyingBehavior: 'Recherche approfondie avant achat',
    budget: 'Moyen-élevé',
    decisionFactors: ['Qualité', 'ROI', 'Support client']
  },
  generatedAt: new Date().toISOString(),
  sources: ['Brief marketing', 'Données démographiques']
};

const mockEnhancedPersona: EnhancedPersona = {
  ...mockBasicPersona,
  id: 'test-enhanced-persona-1',
  validation_metrics: {
    completeness_score: 85,
    consistency_score: 78,
    realism_score: 92,
    quality_indicators: ['High cultural accuracy', 'Rich interest profile', 'Consistent demographics']
  },
  generation_metadata: {
    total_processing_time: 2500,
    gemini_response_time: 1200,
    qloo_response_time: 800,
    validation_time: 500,
    model_version: 'gemini-1.5-pro',
    qloo_api_version: 'v2.1',
    processing_steps: ['Brief analysis', 'Persona generation', 'Cultural enrichment', 'Validation']
  },
  cultural_data: {
    music_preferences: [
      { artist: 'Daft Punk', genre: 'Electronic', confidence: 0.85 },
      { artist: 'Norah Jones', genre: 'Jazz', confidence: 0.72 }
    ],
    brand_affinities: [
      { brand: 'Apple', category: 'Technology', confidence: 0.88 },
      { brand: 'Patagonia', category: 'Outdoor', confidence: 0.76 }
    ],
    lifestyle_indicators: [
      { category: 'Sustainability', items: ['Organic food', 'Eco-friendly products'], confidence: 0.82 },
      { category: 'Wellness', items: ['Yoga', 'Meditation'], confidence: 0.79 }
    ]
  }
};

const mockIncompletePersona: Persona = {
  id: 'incomplete-persona',
  name: 'John Doe',
  age: 25,
  location: 'Unknown',
  bio: 'Short bio',
  quote: '',
  values: ['Value1'],
  interests: {
    technology: ['Tech1']
  },
  communication: {
    preferredChannels: ['Email'],
    tone: 'Casual',
    frequency: 'Rare',
    bestTimes: []
  },
  marketing: {
    painPoints: ['Pain1'],
    motivations: ['Motivation1'],
    influences: [],
    buyingBehavior: 'Impulsive',
    budget: 'Low',
    decisionFactors: []
  },
  generatedAt: new Date().toISOString(),
  sources: []
};

describe('usePersonaMetrics', () => {
  describe('basic persona metrics calculation', () => {
    it('should calculate metrics for a complete basic persona', () => {
      const { result } = renderHook(() => usePersonaMetrics(mockBasicPersona));

      expect(result.current.qualityScore).toBeGreaterThan(70);
      expect(result.current.completionScore).toBeGreaterThan(70);
      expect(result.current.engagementLevel).toBe('high');
      expect(result.current.validationMetrics).toBeDefined();
      expect(result.current.validationMetrics.completeness.score).toBeGreaterThan(0);
      expect(result.current.validationMetrics.consistency.score).toBeGreaterThan(0);
      expect(result.current.validationMetrics.realism.score).toBeGreaterThan(0);
    });

    it('should calculate lower scores for incomplete persona', () => {
      const { result } = renderHook(() => usePersonaMetrics(mockIncompletePersona));

      expect(result.current.qualityScore).toBeLessThan(70);
      expect(result.current.completionScore).toBeLessThan(70);
      expect(result.current.engagementLevel).toBe('low');
    });

    it('should provide detailed metric breakdowns', () => {
      const { result } = renderHook(() => usePersonaMetrics(mockBasicPersona));

      const { validationMetrics } = result.current;

      // Check that all metrics have proper structure
      expect(validationMetrics.completeness).toHaveProperty('score');
      expect(validationMetrics.completeness).toHaveProperty('status');
      expect(validationMetrics.completeness).toHaveProperty('trend');
      expect(validationMetrics.completeness).toHaveProperty('recommendations');
      expect(validationMetrics.completeness).toHaveProperty('lastUpdated');

      expect(validationMetrics.consistency).toHaveProperty('score');
      expect(validationMetrics.realism).toHaveProperty('score');
      expect(validationMetrics.culturalAuthenticity).toHaveProperty('score');
      expect(validationMetrics.marketingUtility).toHaveProperty('score');
      expect(validationMetrics.dataQuality).toHaveProperty('score');
    });

    it('should generate appropriate recommendations based on scores', () => {
      const { result } = renderHook(() => usePersonaMetrics(mockIncompletePersona));

      const { validationMetrics } = result.current;

      expect(validationMetrics.completeness.recommendations).toContain(
        expect.stringMatching(/améliorations/i)
      );
      expect(validationMetrics.completeness.recommendations.length).toBeGreaterThan(0);
    });

    it('should calculate engagement level correctly', () => {
      const highQualityPersona = { ...mockBasicPersona };
      const { result: highResult } = renderHook(() => usePersonaMetrics(highQualityPersona));
      expect(highResult.current.engagementLevel).toBe('high');

      const { result: lowResult } = renderHook(() => usePersonaMetrics(mockIncompletePersona));
      expect(lowResult.current.engagementLevel).toBe('low');
    });
  });

  describe('enhanced persona metrics calculation', () => {
    it('should use existing validation metrics for enhanced persona', () => {
      const { result } = renderHook(() => usePersonaMetrics(mockEnhancedPersona));

      expect(result.current.qualityScore).toBe(85); // Average of validation scores
      expect(result.current.completionScore).toBe(85);
      expect(result.current.culturalAccuracy).toBe(92);
      expect(result.current.engagementLevel).toBe('high');
    });

    it('should include performance metrics for enhanced persona', () => {
      const { result } = renderHook(() => usePersonaMetrics(mockEnhancedPersona));

      const { performanceMetrics } = result.current;

      expect(performanceMetrics.totalProcessingTime).toBe(2500);
      expect(performanceMetrics.apiCalls.gemini.averageLatency).toBe(1200);
      expect(performanceMetrics.apiCalls.qloo.averageLatency).toBe(800);
      expect(performanceMetrics.apiCalls.total).toBe(2);
      expect(performanceMetrics.apiCalls.gemini.successRate).toBe(100);
      expect(performanceMetrics.apiCalls.qloo.successRate).toBe(100);
    });

    it('should handle enhanced persona with missing metadata gracefully', () => {
      const partialEnhanced = {
        ...mockEnhancedPersona,
        generation_metadata: {
          ...mockEnhancedPersona.generation_metadata,
          total_processing_time: 0,
          gemini_response_time: 0,
          qloo_response_time: 0,
        }
      };

      const { result } = renderHook(() => usePersonaMetrics(partialEnhanced));

      expect(result.current.performanceMetrics.totalProcessingTime).toBe(0);
      expect(result.current.qualityScore).toBeGreaterThan(0);
    });
  });

  describe('metric status calculation', () => {
    it('should assign correct status based on score ranges', () => {
      // Test excellent score (90+)
      const excellentPersona = {
        ...mockEnhancedPersona,
        validation_metrics: {
          ...mockEnhancedPersona.validation_metrics,
          completeness_score: 95,
          consistency_score: 92,
          realism_score: 94
        }
      };

      const { result: excellentResult } = renderHook(() => usePersonaMetrics(excellentPersona));
      expect(excellentResult.current.validationMetrics.completeness.status).toBe('excellent');

      // Test good score (70-89)
      const goodPersona = {
        ...mockEnhancedPersona,
        validation_metrics: {
          ...mockEnhancedPersona.validation_metrics,
          completeness_score: 75,
          consistency_score: 78,
          realism_score: 80
        }
      };

      const { result: goodResult } = renderHook(() => usePersonaMetrics(goodPersona));
      expect(goodResult.current.validationMetrics.completeness.status).toBe('good');

      // Test average score (50-69)
      const averagePersona = {
        ...mockEnhancedPersona,
        validation_metrics: {
          ...mockEnhancedPersona.validation_metrics,
          completeness_score: 55,
          consistency_score: 60,
          realism_score: 65
        }
      };

      const { result: averageResult } = renderHook(() => usePersonaMetrics(averagePersona));
      expect(averageResult.current.validationMetrics.completeness.status).toBe('average');

      // Test poor score (<50)
      const poorPersona = {
        ...mockEnhancedPersona,
        validation_metrics: {
          ...mockEnhancedPersona.validation_metrics,
          completeness_score: 30,
          consistency_score: 25,
          realism_score: 35
        }
      };

      const { result: poorResult } = renderHook(() => usePersonaMetrics(poorPersona));
      expect(poorResult.current.validationMetrics.completeness.status).toBe('poor');
    });
  });

  describe('memoization and performance', () => {
    it('should memoize results and not recalculate on same input', () => {
      const { result, rerender } = renderHook(
        ({ persona }) => usePersonaMetrics(persona),
        { initialProps: { persona: mockBasicPersona } }
      );

      const firstResult = result.current;

      // Rerender with same persona
      rerender({ persona: mockBasicPersona });

      const secondResult = result.current;

      // Results should be the same object (memoized)
      expect(firstResult).toBe(secondResult);
    });

    it('should recalculate when persona changes', () => {
      const { result, rerender } = renderHook(
        ({ persona }) => usePersonaMetrics(persona),
        { initialProps: { persona: mockBasicPersona } }
      );

      const firstResult = result.current;

      // Rerender with different persona
      rerender({ persona: mockIncompletePersona });

      const secondResult = result.current;

      // Results should be different
      expect(firstResult).not.toBe(secondResult);
      expect(firstResult.qualityScore).not.toBe(secondResult.qualityScore);
    });
  });
});

describe('usePersonaComparison', () => {
  const personas = [mockBasicPersona, mockEnhancedPersona, mockIncompletePersona];

  it('should compare multiple personas correctly', () => {
    const { result } = renderHook(() => usePersonaComparison(personas));

    expect(result.current.totalPersonas).toBe(3);
    expect(result.current.metrics).toHaveLength(3);
    expect(result.current.averageQuality).toBeGreaterThan(0);
    expect(result.current.bestPerformer).toBeDefined();
    expect(result.current.worstPerformer).toBeDefined();
  });

  it('should identify best and worst performers correctly', () => {
    const { result } = renderHook(() => usePersonaComparison(personas));

    // Enhanced persona should typically be the best performer
    expect(result.current.bestPerformer.id).toBe(mockEnhancedPersona.id);
    
    // Incomplete persona should be the worst performer
    expect(result.current.worstPerformer.id).toBe(mockIncompletePersona.id);
  });

  it('should calculate average quality correctly', () => {
    const { result } = renderHook(() => usePersonaComparison(personas));

    const manualAverage = Math.round(
      result.current.metrics.reduce((sum, metric) => sum + metric.qualityScore, 0) / 
      result.current.metrics.length
    );

    expect(result.current.averageQuality).toBe(manualAverage);
  });

  it('should handle single persona comparison', () => {
    const { result } = renderHook(() => usePersonaComparison([mockBasicPersona]));

    expect(result.current.totalPersonas).toBe(1);
    expect(result.current.bestPerformer).toBe(mockBasicPersona);
    expect(result.current.worstPerformer).toBe(mockBasicPersona);
    expect(result.current.averageQuality).toBe(result.current.metrics[0].qualityScore);
  });

  it('should handle empty persona array', () => {
    const { result } = renderHook(() => usePersonaComparison([]));

    expect(result.current.totalPersonas).toBe(0);
    expect(result.current.metrics).toHaveLength(0);
    expect(result.current.averageQuality).toBeNaN();
  });

  it('should memoize comparison results', () => {
    const { result, rerender } = renderHook(
      ({ personas }) => usePersonaComparison(personas),
      { initialProps: { personas } }
    );

    const firstResult = result.current;

    // Rerender with same personas
    rerender({ personas });

    const secondResult = result.current;

    // Results should be the same object (memoized)
    expect(firstResult).toBe(secondResult);
  });
});