// Test file to verify database schema and types are working correctly

import { describe, it, expect } from 'vitest';
import {
  normalizePersona,
  calculateCulturalRichness,
  hasEnhancedMetadata,
  isQlooFirstPersona,
  isLegacyPersona,
  getValidationScoreDisplay
} from '@/types/persona-metadata';
import type { EnrichedPersona, GenerationMetadata, ValidationMetadata } from '@/types/persona-metadata';

describe('Persona Metadata Types and Utilities', () => {
  const mockPersona: Partial<EnrichedPersona> = {
    id: 'test-id',
    name: 'Test Persona',
    age: 30,
    occupation: 'Developer',
    location: 'Paris',
    bio: 'Test bio',
    quote: 'Test quote',
    demographics: {
      income: '50000',
      education: 'Bachelor\'s Degree',
      familyStatus: 'Single'
    },
    psychographics: {
      personality: ['Creative', 'Analytical'],
      values: ['Innovation', 'Quality'],
      interests: ['Technology', 'Music'],
      lifestyle: 'Urban Professional'
    },
    culturalData: {
      music: ['Rock', 'Jazz'],
      movies: ['Action', 'Comedy'],
      tv: ['Drama', 'Documentary'],
      books: ['Fiction', 'Biography'],
      brands: ['Nike', 'Apple'],
      restaurants: ['Italian', 'Sushi'],
      travel: ['Europe', 'Asia'],
      fashion: ['Casual', 'Business'],
      beauty: ['Skincare', 'Makeup'],
      food: ['Organic', 'Local'],
      socialMedia: ['Instagram', 'LinkedIn']
    },
    painPoints: [],
    goals: [],
    marketingInsights: {
      preferredChannels: ['Social Media', 'Email'],
      messagingTone: 'Professional',
      buyingBehavior: 'Research-driven'
    },
    qualityScore: 85,
    createdAt: '2025-01-01T00:00:00Z'
  };

  const mockGenerationMetadata: GenerationMetadata = {
    source: 'qloo-first',
    method: 'enhanced-generation',
    culturalConstraintsUsed: ['music', 'brands'],
    processingTime: 1500,
    qlooDataUsed: true,
    templateUsed: 'simple-persona-template',
    generatedAt: '2025-01-01T00:00:00Z',
    cacheHitRate: 0.8
  };

  const mockValidationMetadata: ValidationMetadata = {
    templateName: 'simple-persona-template',
    validationScore: 92,
    validationDetails: [
      {
        rule: 'name-format',
        passed: true,
        score: 100,
        message: 'Name format is valid',
        category: 'format'
      }
    ],
    failedRules: [],
    passedRules: ['name-format', 'age-range'],
    validationTime: 250,
    validatedAt: '2025-01-01T00:00:00Z'
  };

  describe('normalizePersona', () => {
    it('should add default metadata to persona without metadata', () => {
      const normalized = normalizePersona(mockPersona);

      expect(normalized.generationMetadata).toBeDefined();
      expect(normalized.generationMetadata?.source).toBe('legacy-fallback');
      expect(normalized.validationMetadata).toBeDefined();
      expect(normalized.validationMetadata?.templateName).toBe('legacy');
    });

    it('should preserve existing metadata', () => {
      const personaWithMetadata = {
        ...mockPersona,
        generationMetadata: mockGenerationMetadata,
        validationMetadata: mockValidationMetadata
      };

      const normalized = normalizePersona(personaWithMetadata);

      expect(normalized.generationMetadata?.source).toBe('qloo-first');
      expect(normalized.validationMetadata?.validationScore).toBe(92);
    });
  });

  describe('calculateCulturalRichness', () => {
    it('should return "high" for rich cultural data', () => {
      const richCulturalData = {
        music: Array(20).fill('item'),
        movies: Array(20).fill('item'),
        brands: Array(15).fill('item')
      };

      expect(calculateCulturalRichness(richCulturalData)).toBe('high');
    });

    it('should return "medium" for moderate cultural data', () => {
      const moderateCulturalData = {
        music: Array(10).fill('item'),
        movies: Array(8).fill('item'),
        brands: Array(7).fill('item')
      };

      expect(calculateCulturalRichness(moderateCulturalData)).toBe('medium');
    });

    it('should return "low" for sparse cultural data', () => {
      const sparseCulturalData = {
        music: ['item1', 'item2'],
        movies: ['item1']
      };

      expect(calculateCulturalRichness(sparseCulturalData)).toBe('low');
    });

    it('should return "low" for null/undefined cultural data', () => {
      expect(calculateCulturalRichness(null)).toBe('low');
      expect(calculateCulturalRichness(undefined)).toBe('low');
    });
  });

  describe('Type Guards', () => {
    it('hasEnhancedMetadata should detect personas with metadata', () => {
      const personaWithMetadata = {
        ...mockPersona,
        generationMetadata: mockGenerationMetadata
      };

      expect(hasEnhancedMetadata(personaWithMetadata)).toBe(true);
      expect(hasEnhancedMetadata(mockPersona)).toBe(false);
    });

    it('isQlooFirstPersona should detect qloo-first personas', () => {
      const qlooPersona = normalizePersona({
        ...mockPersona,
        generationMetadata: mockGenerationMetadata
      });

      const legacyPersona = normalizePersona(mockPersona);

      expect(isQlooFirstPersona(qlooPersona)).toBe(true);
      expect(isQlooFirstPersona(legacyPersona)).toBe(false);
    });

    it('isLegacyPersona should detect legacy personas', () => {
      const qlooPersona = normalizePersona({
        ...mockPersona,
        generationMetadata: mockGenerationMetadata
      });

      const legacyPersona = normalizePersona(mockPersona);

      expect(isLegacyPersona(qlooPersona)).toBe(false);
      expect(isLegacyPersona(legacyPersona)).toBe(true);
    });
  });

  describe('getValidationScoreDisplay', () => {
    it('should return correct display config for excellent scores', () => {
      const display = getValidationScoreDisplay(95);
      expect(display.level).toBe('excellent');
      expect(display.color).toBe('text-green-600');
    });

    it('should return correct display config for good scores', () => {
      const display = getValidationScoreDisplay(80);
      expect(display.level).toBe('good');
      expect(display.color).toBe('text-blue-600');
    });

    it('should return correct display config for fair scores', () => {
      const display = getValidationScoreDisplay(65);
      expect(display.level).toBe('fair');
      expect(display.color).toBe('text-yellow-600');
    });

    it('should return correct display config for poor scores', () => {
      const display = getValidationScoreDisplay(45);
      expect(display.level).toBe('poor');
      expect(display.color).toBe('text-red-600');
    });
  });
});