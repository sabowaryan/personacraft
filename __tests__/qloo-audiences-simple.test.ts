// Tests unitaires simplifiés pour le service Audiences Qloo
// Focus sur les fonctionnalités core sans mocking complexe

import { QlooAudiencesService } from '@/lib/api/qloo-audiences';
import type { 
  QlooAudience, 
  QlooAudienceDemographics 
} from '@/lib/types/qloo-compliant';

describe('QlooAudiencesService - Core Functionality', () => {
  let service: QlooAudiencesService;
  const mockApiKey = 'test-api-key';
  const mockBaseUrl = 'https://hackathon.api.qloo.com';

  beforeEach(() => {
    service = new QlooAudiencesService(mockApiKey, mockBaseUrl, 5000);
  });

  describe('extractAudienceMetadata', () => {
    it('should extract comprehensive metadata from audience', () => {
      const audience: QlooAudience = {
        id: 'aud_test',
        name: 'Test Audience',
        demographics: {
          age_range: { min: 25, max: 40 },
          location: { country: 'France', region: 'Île-de-France' },
          income_level: 'high'
        },
        size: 5000000,
        interests: ['technology', 'innovation', 'startups', 'design', 'entrepreneurship'],
        behaviors: ['early_adopter', 'tech_savvy']
      };

      const metadata = service.extractAudienceMetadata(audience);

      expect(metadata.demographic_summary).toBe('Ages 25-40 in France');
      expect(metadata.key_interests).toEqual(['technology', 'innovation', 'startups', 'design', 'entrepreneurship']);
      expect(metadata.estimated_reach).toBe('Large (1M-10M)');
      expect(metadata.targeting_potential).toBe('high');
    });

    it('should handle audience with minimal data', () => {
      const audience: QlooAudience = {
        id: 'aud_minimal',
        name: 'Minimal Audience',
        size: 50000,
        interests: ['lifestyle']
      };

      const metadata = service.extractAudienceMetadata(audience);

      expect(metadata.demographic_summary).toBe('General audience');
      expect(metadata.key_interests).toEqual(['lifestyle']);
      expect(metadata.estimated_reach).toBe('Small (<100K)');
      expect(metadata.targeting_potential).toBe('low');
    });

    it('should handle audience with no size data', () => {
      const audience: QlooAudience = {
        id: 'aud_no_size',
        name: 'No Size Audience'
      };

      const metadata = service.extractAudienceMetadata(audience);

      expect(metadata.estimated_reach).toBe('Unknown');
      expect(metadata.targeting_potential).toBe('low');
    });

    it('should handle very large audiences', () => {
      const audience: QlooAudience = {
        id: 'aud_large',
        name: 'Large Audience',
        size: 15000000,
        interests: ['tech', 'innovation', 'gadgets', 'startups']
      };

      const metadata = service.extractAudienceMetadata(audience);

      expect(metadata.estimated_reach).toBe('Very Large (10M+)');
      expect(metadata.targeting_potential).toBe('high');
    });

    it('should handle medium audiences', () => {
      const audience: QlooAudience = {
        id: 'aud_medium',
        name: 'Medium Audience',
        size: 500000,
        interests: ['lifestyle', 'fashion']
      };

      const metadata = service.extractAudienceMetadata(audience);

      expect(metadata.estimated_reach).toBe('Medium (100K-1M)');
      expect(metadata.targeting_potential).toBe('medium');
    });
  });

  describe('validation methods', () => {
    it('should validate supported audience categories', () => {
      const categories = service.getSupportedAudienceCategories();
      
      expect(categories).toContain('millennials');
      expect(categories).toContain('gen_z');
      expect(categories).toContain('tech_enthusiasts');
      expect(categories).toContain('urban_professionals');
      expect(categories).toContain('young_parents');
      expect(categories).toContain('fitness_enthusiasts');
      
      expect(service.validateAudienceCategory('millennials')).toBe(true);
      expect(service.validateAudienceCategory('tech_enthusiasts')).toBe(true);
      expect(service.validateAudienceCategory('invalid_category')).toBe(false);
      expect(service.validateAudienceCategory('MILLENNIALS')).toBe(true); // Case insensitive due to toLowerCase()
    });

    it('should validate demographics correctly', () => {
      const validDemographics: Partial<QlooAudienceDemographics> = {
        age_range: { min: 25, max: 40 },
        gender_distribution: { male: 0.6, female: 0.4 },
        income_level: 'high',
        education_level: 'bachelor'
      };

      const result = service.validateDemographics(validDemographics);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid age ranges', () => {
      const invalidDemographics: Partial<QlooAudienceDemographics> = {
        age_range: { min: 50, max: 30 } // min > max
      };

      const result = service.validateDemographics(invalidDemographics);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Age minimum must be less than age maximum');
    });

    it('should detect invalid age values', () => {
      const invalidDemographics1: Partial<QlooAudienceDemographics> = {
        age_range: { min: -5, max: 30 }
      };

      const result1 = service.validateDemographics(invalidDemographics1);
      expect(result1.valid).toBe(false);
      expect(result1.errors).toContain('Age minimum must be between 0 and 120');

      const invalidDemographics2: Partial<QlooAudienceDemographics> = {
        age_range: { min: 25, max: 150 }
      };

      const result2 = service.validateDemographics(invalidDemographics2);
      expect(result2.valid).toBe(false);
      expect(result2.errors).toContain('Age maximum must be between 0 and 120');
    });

    it('should detect invalid income levels', () => {
      const invalidDemographics: Partial<QlooAudienceDemographics> = {
        income_level: 'invalid_level' as any
      };

      const result = service.validateDemographics(invalidDemographics);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid income level: invalid_level');
    });

    it('should detect invalid education levels', () => {
      const invalidDemographics: Partial<QlooAudienceDemographics> = {
        education_level: 'invalid_education' as any
      };

      const result = service.validateDemographics(invalidDemographics);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid education level: invalid_education');
    });

    it('should warn about gender distribution over 100%', () => {
      const demographics: Partial<QlooAudienceDemographics> = {
        gender_distribution: { male: 0.7, female: 0.6 } // Total = 1.3 > 1.0
      };

      const result = service.validateDemographics(demographics);
      
      expect(result.warnings).toContain('Gender distribution percentages sum to more than 100%');
    });

    it('should handle valid gender distribution at exactly 100%', () => {
      const demographics: Partial<QlooAudienceDemographics> = {
        gender_distribution: { male: 0.5, female: 0.5 } // Total = 1.0
      };

      const result = service.validateDemographics(demographics);
      
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle empty demographics', () => {
      const result = service.validateDemographics({});
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('utility methods', () => {
    it('should return supported income levels', () => {
      const levels = service.getSupportedIncomeLevels();
      expect(levels).toEqual(['low', 'medium', 'high', 'very_high']);
      expect(levels).toHaveLength(4);
    });

    it('should return supported education levels', () => {
      const levels = service.getSupportedEducationLevels();
      expect(levels).toEqual(['high_school', 'bachelor', 'master', 'phd', 'other']);
      expect(levels).toHaveLength(5);
    });

    it('should validate income levels correctly', () => {
      const supportedLevels = service.getSupportedIncomeLevels();
      
      supportedLevels.forEach(level => {
        const demographics: Partial<QlooAudienceDemographics> = {
          income_level: level
        };
        const result = service.validateDemographics(demographics);
        expect(result.valid).toBe(true);
      });
    });

    it('should validate education levels correctly', () => {
      const supportedLevels = service.getSupportedEducationLevels();
      
      supportedLevels.forEach(level => {
        const demographics: Partial<QlooAudienceDemographics> = {
          education_level: level
        };
        const result = service.validateDemographics(demographics);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('demographic summary generation', () => {
    it('should generate summary with age and location', () => {
      const audience: QlooAudience = {
        id: 'test',
        name: 'Test',
        demographics: {
          age_range: { min: 18, max: 25 },
          location: { country: 'Canada', region: 'Ontario' }
        }
      };

      const metadata = service.extractAudienceMetadata(audience);
      expect(metadata.demographic_summary).toBe('Ages 18-25 in Canada');
    });

    it('should generate summary with only age', () => {
      const audience: QlooAudience = {
        id: 'test',
        name: 'Test',
        demographics: {
          age_range: { min: 30, max: 45 }
        }
      };

      const metadata = service.extractAudienceMetadata(audience);
      expect(metadata.demographic_summary).toBe('Ages 30-45');
    });

    it('should generate summary with only location', () => {
      const audience: QlooAudience = {
        id: 'test',
        name: 'Test',
        demographics: {
          location: { country: 'Germany' }
        }
      };

      const metadata = service.extractAudienceMetadata(audience);
      expect(metadata.demographic_summary).toBe('General audience in Germany');
    });

    it('should handle no demographics', () => {
      const audience: QlooAudience = {
        id: 'test',
        name: 'Test'
      };

      const metadata = service.extractAudienceMetadata(audience);
      expect(metadata.demographic_summary).toBe('General audience');
    });
  });

  describe('targeting potential calculation', () => {
    it('should calculate high targeting potential', () => {
      const audience: QlooAudience = {
        id: 'test',
        name: 'Test',
        size: 2000000,
        interests: ['tech', 'innovation', 'startups', 'gadgets']
      };

      const metadata = service.extractAudienceMetadata(audience);
      expect(metadata.targeting_potential).toBe('high');
    });

    it('should calculate low targeting potential for small size', () => {
      const audience: QlooAudience = {
        id: 'test',
        name: 'Test',
        size: 50000,
        interests: ['tech', 'innovation', 'startups', 'gadgets']
      };

      const metadata = service.extractAudienceMetadata(audience);
      expect(metadata.targeting_potential).toBe('low');
    });

    it('should calculate low targeting potential for few interests', () => {
      const audience: QlooAudience = {
        id: 'test',
        name: 'Test',
        size: 2000000,
        interests: ['lifestyle']
      };

      const metadata = service.extractAudienceMetadata(audience);
      expect(metadata.targeting_potential).toBe('low');
    });

    it('should calculate medium targeting potential', () => {
      const audience: QlooAudience = {
        id: 'test',
        name: 'Test',
        size: 500000,
        interests: ['lifestyle', 'fashion', 'travel']
      };

      const metadata = service.extractAudienceMetadata(audience);
      expect(metadata.targeting_potential).toBe('medium');
    });
  });
});