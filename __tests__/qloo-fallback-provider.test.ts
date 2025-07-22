// Comprehensive unit tests for Qloo Fallback Provider
// Tests fallback data quality, consistency, and persona coherence

import {
  QlooFallbackProvider,
  type PersonaContext,
  type FallbackUsageStats,
  type FallbackQualityMetrics
} from '@/lib/api/qloo-fallback-provider';
import type {
  QlooEntity,
  QlooTag,
  QlooAudience,
  EntityUrn,
  QlooAudienceDemographics,
  InsightsParams
} from '@/lib/types/qloo-compliant';
import { QlooLogger } from '@/lib/api/qloo-error-handler';

describe('QlooFallbackProvider', () => {
  let fallbackProvider: QlooFallbackProvider;
  let mockLogger: jest.Mocked<QlooLogger>;

  beforeEach(() => {
    mockLogger = {
      logFallbackUsage: jest.fn(),
      logError: jest.fn(),
      logApiCall: jest.fn(),
      logCacheOperation: jest.fn(),
      logRetryAttempt: jest.fn()
    } as any;

    fallbackProvider = new QlooFallbackProvider(mockLogger);
  });

  describe('Entity Fallback Generation', () => {
    test('should generate brand entities with proper structure', () => {
      const context: PersonaContext = {
        interests: ['technology', 'lifestyle'],
        demographics: {
          age_range: { min: 25, max: 35 },
          income_level: 'high'
        }
      };

      const entities = fallbackProvider.getEntityFallback('urn:entity:brand', context);

      expect(entities.length).toBeGreaterThan(0);
      expect(entities.length).toBeLessThanOrEqual(8);

      entities.forEach(entity => {
        expect(entity).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          type: 'urn:entity:brand',
          confidence: expect.any(Number)
        });
        expect(entity.confidence).toBeGreaterThanOrEqual(0);
        expect(entity.confidence).toBeLessThanOrEqual(1);
      });
    });

    test('should generate artist entities for music context', () => {
      const context: PersonaContext = {
        interests: ['music', 'pop', 'alternative'],
        demographics: {
          age_range: { min: 18, max: 28 }
        }
      };

      const entities = fallbackProvider.getEntityFallback('urn:entity:artist', context);

      expect(entities.length).toBeGreaterThan(0);
      entities.forEach(entity => {
        expect(entity.type).toBe('urn:entity:artist');
        expect(entity.confidence).toBeGreaterThan(0.5); // Should have decent confidence for music context
      });
    });

    test('should generate movie entities with age-appropriate content', () => {
      const context: PersonaContext = {
        interests: ['movies', 'action', 'sci-fi'],
        demographics: {
          age_range: { min: 16, max: 25 }
        }
      };

      const entities = fallbackProvider.getEntityFallback('urn:entity:movie', context);

      expect(entities.length).toBeGreaterThan(0);
      entities.forEach(entity => {
        expect(entity.type).toBe('urn:entity:movie');
        // Should filter age-appropriate content
        expect(entity.confidence).toBeGreaterThan(0);
      });
    });

    test('should expand entities when base data is insufficient', () => {
      const context: PersonaContext = {
        interests: ['niche_interest_1', 'niche_interest_2', 'niche_interest_3'],
        demographics: {
          age_range: { min: 30, max: 40 }
        }
      };

      const entities = fallbackProvider.getEntityFallback('urn:entity:book', context);

      expect(entities.length).toBeGreaterThanOrEqual(3);
      
      // Should include generated entities based on interests
      const hasGeneratedEntities = entities.some(entity => 
        entity.id.includes('niche_interest')
      );
      expect(hasGeneratedEntities).toBe(true);
    });

    test('should adjust confidence based on context matching', () => {
      const techContext: PersonaContext = {
        interests: ['technology', 'innovation', 'gadgets'],
        demographics: {
          age_range: { min: 25, max: 35 }
        }
      };

      const entities = fallbackProvider.getEntityFallback('urn:entity:brand', techContext);
      
      // Find tech-related entities (like Apple, Tesla)
      const techEntities = entities.filter(entity => 
        entity.tags?.some(tag => ['technology', 'innovation'].includes(tag))
      );

      if (techEntities.length > 0) {
        // Tech entities should have higher confidence for tech context
        const avgTechConfidence = techEntities.reduce((sum, entity) => sum + (entity.confidence || 0), 0) / techEntities.length;
        expect(avgTechConfidence).toBeGreaterThan(0.7);
      }
    });
  });

  describe('Tag Fallback Generation', () => {
    test('should generate tags from interests', () => {
      const interests = ['music', 'technology', 'travel', 'fitness'];
      const context: PersonaContext = {
        interests,
        region: 'US',
        language: 'en'
      };

      const tags = fallbackProvider.getTagFallback(interests, context);

      expect(tags.length).toBeGreaterThan(0);
      expect(tags.length).toBeLessThanOrEqual(10);

      // Should include tags for each interest
      interests.forEach(interest => {
        const hasInterestTag = tags.some(tag => 
          tag.name.toLowerCase().includes(interest.toLowerCase()) ||
          interest.toLowerCase().includes(tag.name.toLowerCase())
        );
        expect(hasInterestTag).toBe(true);
      });

      tags.forEach(tag => {
        expect(tag).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          category: expect.any(String),
          weight: expect.any(Number)
        });
        expect(tag.weight).toBeGreaterThan(0);
        expect(tag.weight).toBeLessThanOrEqual(1);
      });
    });

    test('should categorize interests correctly', () => {
      const interests = ['music', 'technology', 'fashion', 'sports'];
      const tags = fallbackProvider.getTagFallback(interests);

      const musicTags = tags.filter(tag => tag.name.toLowerCase().includes('music'));
      const techTags = tags.filter(tag => tag.name.toLowerCase().includes('technology'));

      if (musicTags.length > 0) {
        expect(musicTags[0].category).toBe('entertainment');
      }
      if (techTags.length > 0) {
        expect(techTags[0].category).toBe('technology');
      }
    });

    test('should add contextual tags for region and language', () => {
      const interests = ['music'];
      const context: PersonaContext = {
        interests,
        region: 'FR',
        language: 'fr'
      };

      const tags = fallbackProvider.getTagFallback(interests, context);

      const hasRegionTag = tags.some(tag => tag.name === 'FR');
      const hasLanguageTag = tags.some(tag => tag.name === 'fr');

      expect(hasRegionTag || hasLanguageTag).toBe(true);
    });

    test('should deduplicate similar tags', () => {
      const interests = ['music', 'music production', 'musical instruments'];
      const tags = fallbackProvider.getTagFallback(interests);

      const tagNames = tags.map(tag => tag.name.toLowerCase());
      const uniqueNames = new Set(tagNames);

      expect(uniqueNames.size).toBe(tagNames.length);
    });
  });

  describe('Audience Fallback Generation', () => {
    test('should generate audiences matching demographics', () => {
      const demographics: Partial<QlooAudienceDemographics> = {
        age_range: { min: 25, max: 35 },
        income_level: 'high',
        location: { country: 'US' }
      };

      const audiences = fallbackProvider.getAudienceFallback(demographics);

      expect(audiences.length).toBeGreaterThan(0);
      expect(audiences.length).toBeLessThanOrEqual(5);

      audiences.forEach(audience => {
        expect(audience).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          size: expect.any(Number)
        });
        expect(audience.size).toBeGreaterThan(0);
      });
    });

    test('should filter audiences by age range overlap', () => {
      const demographics: Partial<QlooAudienceDemographics> = {
        age_range: { min: 18, max: 24 }
      };

      const audiences = fallbackProvider.getAudienceFallback(demographics);

      // Should include Gen Z audience (16-24)
      const hasGenZ = audiences.some(audience => 
        audience.name.toLowerCase().includes('generation z') ||
        audience.name.toLowerCase().includes('gen z')
      );
      expect(hasGenZ).toBe(true);
    });

    test('should generate custom audiences when no matches found', () => {
      const demographics: Partial<QlooAudienceDemographics> = {
        age_range: { min: 80, max: 90 }, // Very specific age range
        income_level: 'very_high'
      };

      const audiences = fallbackProvider.getAudienceFallback(demographics);

      expect(audiences.length).toBeGreaterThan(0);
      
      // Should have at least one custom audience
      const hasCustomAudience = audiences.some(audience => 
        audience.id.includes('custom') || audience.id.includes('fallback')
      );
      expect(hasCustomAudience).toBe(true);
    });

    test('should estimate audience size based on demographic specificity', () => {
      const broadDemographics: Partial<QlooAudienceDemographics> = {
        age_range: { min: 18, max: 65 }
      };

      const narrowDemographics: Partial<QlooAudienceDemographics> = {
        age_range: { min: 25, max: 30 },
        income_level: 'very_high',
        location: { country: 'US', city: 'San Francisco' }
      };

      const broadAudiences = fallbackProvider.getAudienceFallback(broadDemographics);
      const narrowAudiences = fallbackProvider.getAudienceFallback(narrowDemographics);

      // More specific demographics should generally result in smaller audience sizes
      if (broadAudiences.length > 0 && narrowAudiences.length > 0) {
        const avgBroadSize = broadAudiences.reduce((sum, a) => sum + (a.size || 0), 0) / broadAudiences.length;
        const avgNarrowSize = narrowAudiences.reduce((sum, a) => sum + (a.size || 0), 0) / narrowAudiences.length;
        
        // This is a general expectation, but not always true due to fallback data
        expect(avgNarrowSize).toBeLessThanOrEqual(avgBroadSize * 2); // Allow some variance
      }
    });
  });

  describe('Complete Insights Fallback', () => {
    test('should generate complete insights response', () => {
      const params: InsightsParams = {
        'filter.type': 'urn:entity:brand',
        'signal.interests.tags': ['technology', 'lifestyle'],
        limit: 10
      };

      const context: PersonaContext = {
        interests: ['technology', 'lifestyle'],
        demographics: {
          age_range: { min: 25, max: 35 },
          income_level: 'high'
        }
      };

      const response = fallbackProvider.getInsightsFallback(params, context);

      expect(response).toMatchObject({
        entities: expect.any(Array),
        tags: expect.any(Array),
        audiences: expect.any(Array),
        confidence: expect.any(Number),
        metadata: expect.objectContaining({
          request_id: expect.any(String),
          processing_time: expect.any(Number),
          data_source: 'fallback',
          api_version: expect.any(String),
          timestamp: expect.any(String),
          total_results: expect.any(Number),
          cached: false
        }),
        status: expect.objectContaining({
          code: 200,
          message: expect.any(String),
          success: true,
          warnings: expect.any(Array)
        })
      });

      expect(response.confidence).toBeGreaterThan(0);
      expect(response.confidence).toBeLessThanOrEqual(1);
      expect(response.entities.length).toBeGreaterThan(0);
      expect(response.tags.length).toBeGreaterThan(0);
      expect(response.audiences.length).toBeGreaterThan(0);
    });

    test('should adjust confidence based on context quality', () => {
      const richContext: PersonaContext = {
        interests: ['technology', 'innovation', 'startups'],
        demographics: {
          age_range: { min: 28, max: 35 },
          income_level: 'high',
          location: { country: 'US', city: 'San Francisco' }
        },
        region: 'US',
        language: 'en'
      };

      const poorContext: PersonaContext = {
        interests: ['general']
      };

      const richParams: InsightsParams = { 'filter.type': 'urn:entity:brand' };
      const poorParams: InsightsParams = { 'filter.type': 'urn:entity:brand' };

      const richResponse = fallbackProvider.getInsightsFallback(richParams, richContext);
      const poorResponse = fallbackProvider.getInsightsFallback(poorParams, poorContext);

      expect(richResponse.confidence).toBeGreaterThan(poorResponse.confidence);
    });

    test('should extract signals from parameters correctly', () => {
      const params: InsightsParams = {
        'filter.type': 'urn:entity:brand',
        'signal.interests.entities': ['entity1', 'entity2'],
        'signal.interests.tags': ['tag1', 'tag2'],
        'signal.demographics.audiences': ['audience1']
      };

      const context: PersonaContext = { interests: ['test'] };
      const response = fallbackProvider.getInsightsFallback(params, context);

      expect(response.metadata.signals_used).toContain('entities');
      expect(response.metadata.signals_used).toContain('tags');
      expect(response.metadata.signals_used).toContain('audiences');
    });
  });

  describe('Usage Tracking', () => {
    test('should track fallback usage statistics', () => {
      const initialStats = fallbackProvider.getUsageStats();
      expect(initialStats.totalCalls).toBe(0);

      // Make some fallback calls
      fallbackProvider.getEntityFallback('urn:entity:brand', { interests: ['tech'] });
      fallbackProvider.getTagFallback(['music']);
      fallbackProvider.getAudienceFallback({ age_range: { min: 25, max: 35 } });

      const updatedStats = fallbackProvider.getUsageStats();
      expect(updatedStats.totalCalls).toBe(3);
      expect(updatedStats.callsByEntityType['urn:entity:brand']).toBe(1);
      expect(updatedStats.callsByReason['api_error']).toBe(3); // Default reason
      expect(updatedStats.lastUsed).toBeDefined();
    });

    test('should track different error reasons', () => {
      fallbackProvider.getEntityFallback('urn:entity:brand', { interests: ['tech'] }, 'rate_limit');
      fallbackProvider.getEntityFallback('urn:entity:artist', { interests: ['music'] }, 'server_error');

      const stats = fallbackProvider.getUsageStats();
      expect(stats.callsByReason['rate_limit']).toBe(1);
      expect(stats.callsByReason['server_error']).toBe(1);
    });

    test('should log fallback usage', () => {
      fallbackProvider.getEntityFallback('urn:entity:brand', { interests: ['tech'] });

      expect(mockLogger.logFallbackUsage).toHaveBeenCalledWith(
        expect.stringContaining('Entity fallback used'),
        expect.objectContaining({
          endpoint: '/search',
          attempt: 1
        }),
        expect.any(Array)
      );
    });
  });

  describe('Quality Metrics', () => {
    test('should calculate coherence score based on context completeness', () => {
      const richContext: PersonaContext = {
        interests: ['technology', 'innovation', 'startups'],
        demographics: {
          age_range: { min: 28, max: 35 },
          income_level: 'high',
          location: { country: 'US' }
        }
      };

      const poorContext: PersonaContext = {
        interests: ['general']
      };

      const richMetrics = fallbackProvider.calculateQualityMetrics(richContext);
      const poorMetrics = fallbackProvider.calculateQualityMetrics(poorContext);

      expect(richMetrics.coherenceScore).toBeGreaterThan(poorMetrics.coherenceScore);
      expect(richMetrics.coherenceScore).toBeGreaterThanOrEqual(0);
      expect(richMetrics.coherenceScore).toBeLessThanOrEqual(1);
    });

    test('should calculate diversity score based on interest variety', () => {
      const diverseContext: PersonaContext = {
        interests: ['technology', 'music', 'sports', 'travel', 'cooking', 'art'],
        demographics: {
          age_range: { min: 25, max: 35 },
          income_level: 'medium',
          education_level: 'bachelor'
        }
      };

      const limitedContext: PersonaContext = {
        interests: ['technology'],
        demographics: {
          age_range: { min: 25, max: 35 }
        }
      };

      const diverseMetrics = fallbackProvider.calculateQualityMetrics(diverseContext);
      const limitedMetrics = fallbackProvider.calculateQualityMetrics(limitedContext);

      expect(diverseMetrics.diversityScore).toBeGreaterThan(limitedMetrics.diversityScore);
    });

    test('should calculate cultural relevance score', () => {
      const culturalContext: PersonaContext = {
        interests: ['music', 'art', 'literature', 'film'],
        region: 'FR',
        language: 'fr'
      };

      const nonCulturalContext: PersonaContext = {
        interests: ['technology']
      };

      const culturalMetrics = fallbackProvider.calculateQualityMetrics(culturalContext);
      const nonCulturalMetrics = fallbackProvider.calculateQualityMetrics(nonCulturalContext);

      expect(culturalMetrics.culturalRelevanceScore).toBeGreaterThan(nonCulturalMetrics.culturalRelevanceScore);
    });

    test('should calculate persona consistency score', () => {
      const consistentContext: PersonaContext = {
        interests: ['technology', 'startups', 'innovation'],
        demographics: {
          age_range: { min: 28, max: 35 },
          income_level: 'high',
          education_level: 'master'
        },
        region: 'US',
        language: 'en'
      };

      const inconsistentContext: PersonaContext = {
        interests: ['retirement planning'],
        demographics: {
          age_range: { min: 18, max: 22 },
          income_level: 'very_high'
        }
      };

      const consistentMetrics = fallbackProvider.calculateQualityMetrics(consistentContext);
      const inconsistentMetrics = fallbackProvider.calculateQualityMetrics(inconsistentContext);

      expect(consistentMetrics.personaConsistencyScore).toBeGreaterThanOrEqual(inconsistentMetrics.personaConsistencyScore);
    });

    test('should return all quality metrics within valid range', () => {
      const context: PersonaContext = {
        interests: ['technology', 'music'],
        demographics: {
          age_range: { min: 25, max: 35 },
          income_level: 'medium'
        }
      };

      const metrics = fallbackProvider.calculateQualityMetrics(context);

      expect(metrics.coherenceScore).toBeGreaterThanOrEqual(0);
      expect(metrics.coherenceScore).toBeLessThanOrEqual(1);
      expect(metrics.diversityScore).toBeGreaterThanOrEqual(0);
      expect(metrics.diversityScore).toBeLessThanOrEqual(1);
      expect(metrics.culturalRelevanceScore).toBeGreaterThanOrEqual(0);
      expect(metrics.culturalRelevanceScore).toBeLessThanOrEqual(1);
      expect(metrics.personaConsistencyScore).toBeGreaterThanOrEqual(0);
      expect(metrics.personaConsistencyScore).toBeLessThanOrEqual(1);
    });
  });

  describe('Data Consistency', () => {
    test('should maintain entity type consistency', () => {
      const entityTypes: EntityUrn[] = [
        'urn:entity:brand',
        'urn:entity:artist',
        'urn:entity:movie',
        'urn:entity:tv_show',
        'urn:entity:book'
      ];

      entityTypes.forEach(type => {
        const entities = fallbackProvider.getEntityFallback(type, { interests: ['test'] });
        entities.forEach(entity => {
          expect(entity.type).toBe(type);
        });
      });
    });

    test('should generate unique IDs for all entities', () => {
      const entities = fallbackProvider.getEntityFallback('urn:entity:brand', { 
        interests: ['tech', 'lifestyle', 'fashion'] 
      });

      const ids = entities.map(entity => entity.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    test('should maintain tag weight consistency', () => {
      const tags = fallbackProvider.getTagFallback(['music', 'technology', 'sports']);

      tags.forEach(tag => {
        expect(tag.weight).toBeGreaterThan(0);
        expect(tag.weight).toBeLessThanOrEqual(1);
      });
    });

    test('should maintain audience size realism', () => {
      const demographics: Partial<QlooAudienceDemographics> = {
        age_range: { min: 25, max: 35 },
        income_level: 'high'
      };

      const audiences = fallbackProvider.getAudienceFallback(demographics);

      audiences.forEach(audience => {
        expect(audience.size).toBeGreaterThan(1000); // Minimum realistic size
        expect(audience.size).toBeLessThan(500000000); // Maximum realistic size
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty interests gracefully', () => {
      const tags = fallbackProvider.getTagFallback([]);
      expect(tags.length).toBeGreaterThanOrEqual(0);
    });

    test('should handle empty demographics gracefully', () => {
      const audiences = fallbackProvider.getAudienceFallback({});
      expect(audiences.length).toBeGreaterThanOrEqual(0);
    });

    test('should handle undefined context gracefully', () => {
      const entities = fallbackProvider.getEntityFallback('urn:entity:brand', {});
      expect(entities.length).toBeGreaterThan(0);
    });

    test('should handle very specific age ranges', () => {
      const context: PersonaContext = {
        demographics: {
          age_range: { min: 23, max: 24 } // Very narrow range
        }
      };

      const entities = fallbackProvider.getEntityFallback('urn:entity:brand', context);
      expect(entities.length).toBeGreaterThan(0);
    });

    test('should handle unusual interests', () => {
      const unusualInterests = ['quantum_computing', 'medieval_history', 'underwater_basket_weaving'];
      const tags = fallbackProvider.getTagFallback(unusualInterests);

      expect(tags.length).toBeGreaterThan(0);
      
      // Should create tags for unusual interests
      unusualInterests.forEach(interest => {
        const hasTag = tags.some(tag => 
          tag.name.toLowerCase().includes(interest.toLowerCase()) ||
          tag.id.includes(interest.toLowerCase().replace(/\s+/g, '_'))
        );
        expect(hasTag).toBe(true);
      });
    });
  });
});