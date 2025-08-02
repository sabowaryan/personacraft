// Unit tests for Cultural Insights System types
// Tests type validation, structure integrity, and interface compliance

import { describe, it, expect } from 'vitest';
import type {
  CulturalInsight,
  CulturalInsightItem,
  InsightMetadata,
  InsightAnalytics,
  PreferenceAnalysis,
  BehavioralInfluence,
  DemographicAlignment,
  TrendAnalysis,
  CulturalInsights,
  EnhancedPersonaWithInsights,
  InsightError,
  InsightValidationResult,
  MigrationStatus,
  InsightGenerationConfig,
  InsightVisualizationConfig,
  CulturalCategoryMetadata
} from '../cultural-insights';

describe('Cultural Insights Types', () => {
  
  describe('CulturalInsightItem', () => {
    it('should validate basic structure', () => {
      const item: CulturalInsightItem = {
        name: 'Test Artist',
        relevanceScore: 85,
        confidence: 0.9,
        source: 'qloo'
      };

      expect(item.name).toBe('Test Artist');
      expect(item.relevanceScore).toBeGreaterThanOrEqual(0);
      expect(item.relevanceScore).toBeLessThanOrEqual(100);
      expect(item.confidence).toBeGreaterThanOrEqual(0);
      expect(item.confidence).toBeLessThanOrEqual(1);
      expect(['qloo', 'fallback', 'user']).toContain(item.source);
    });

    it('should support optional attributes and relationships', () => {
      const item: CulturalInsightItem = {
        name: 'Test Brand',
        relevanceScore: 75,
        confidence: 0.8,
        source: 'qloo',
        attributes: {
          category: 'fashion',
          priceRange: 'premium'
        },
        relationships: ['related-brand-1', 'related-brand-2']
      };

      expect(item.attributes).toBeDefined();
      expect(item.attributes?.category).toBe('fashion');
      expect(item.relationships).toHaveLength(2);
    });

    it('should validate relevance score bounds', () => {
      const validItem: CulturalInsightItem = {
        name: 'Valid Item',
        relevanceScore: 50,
        confidence: 0.5,
        source: 'qloo'
      };

      expect(validItem.relevanceScore).toBeGreaterThanOrEqual(0);
      expect(validItem.relevanceScore).toBeLessThanOrEqual(100);
    });

    it('should validate confidence bounds', () => {
      const validItem: CulturalInsightItem = {
        name: 'Valid Item',
        relevanceScore: 50,
        confidence: 0.5,
        source: 'qloo'
      };

      expect(validItem.confidence).toBeGreaterThanOrEqual(0);
      expect(validItem.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('InsightMetadata', () => {
    it('should validate metadata structure', () => {
      const metadata: InsightMetadata = {
        generatedAt: '2025-01-01T00:00:00Z',
        source: 'qloo',
        dataQuality: 'high',
        enrichmentLevel: 85
      };

      expect(metadata.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
      expect(['qloo', 'fallback', 'hybrid']).toContain(metadata.source);
      expect(['high', 'medium', 'low']).toContain(metadata.dataQuality);
      expect(metadata.enrichmentLevel).toBeGreaterThanOrEqual(0);
      expect(metadata.enrichmentLevel).toBeLessThanOrEqual(100);
    });
  });

  describe('PreferenceAnalysis', () => {
    it('should validate preference analysis structure', () => {
      const preferences: PreferenceAnalysis = {
        primaryPreferences: ['Rock Music', 'Italian Food', 'Nike'],
        secondaryPreferences: ['Jazz', 'French Cuisine'],
        emergingInterests: ['Electronic Music', 'Vegan Food'],
        preferenceStrength: 78
      };

      expect(preferences.primaryPreferences).toHaveLength(3);
      expect(preferences.secondaryPreferences).toHaveLength(2);
      expect(preferences.emergingInterests).toHaveLength(2);
      expect(preferences.preferenceStrength).toBeGreaterThanOrEqual(0);
      expect(preferences.preferenceStrength).toBeLessThanOrEqual(100);
    });

    it('should handle empty preference arrays', () => {
      const preferences: PreferenceAnalysis = {
        primaryPreferences: [],
        secondaryPreferences: [],
        emergingInterests: [],
        preferenceStrength: 0
      };

      expect(preferences.primaryPreferences).toHaveLength(0);
      expect(preferences.preferenceStrength).toBe(0);
    });
  });

  describe('BehavioralInfluence', () => {
    it('should validate behavioral influence scores', () => {
      const influence: BehavioralInfluence = {
        purchaseInfluence: 85,
        socialInfluence: 70,
        lifestyleAlignment: 90,
        emotionalConnection: 75
      };

      // All scores should be between 0-100
      expect(influence.purchaseInfluence).toBeGreaterThanOrEqual(0);
      expect(influence.purchaseInfluence).toBeLessThanOrEqual(100);
      expect(influence.socialInfluence).toBeGreaterThanOrEqual(0);
      expect(influence.socialInfluence).toBeLessThanOrEqual(100);
      expect(influence.lifestyleAlignment).toBeGreaterThanOrEqual(0);
      expect(influence.lifestyleAlignment).toBeLessThanOrEqual(100);
      expect(influence.emotionalConnection).toBeGreaterThanOrEqual(0);
      expect(influence.emotionalConnection).toBeLessThanOrEqual(100);
    });
  });

  describe('DemographicAlignment', () => {
    it('should validate demographic alignment scores', () => {
      const alignment: DemographicAlignment = {
        ageGroupAlignment: 88,
        locationAlignment: 92,
        occupationAlignment: 75,
        overallFit: 85
      };

      // All scores should be between 0-100
      expect(alignment.ageGroupAlignment).toBeGreaterThanOrEqual(0);
      expect(alignment.ageGroupAlignment).toBeLessThanOrEqual(100);
      expect(alignment.locationAlignment).toBeGreaterThanOrEqual(0);
      expect(alignment.locationAlignment).toBeLessThanOrEqual(100);
      expect(alignment.occupationAlignment).toBeGreaterThanOrEqual(0);
      expect(alignment.occupationAlignment).toBeLessThanOrEqual(100);
      expect(alignment.overallFit).toBeGreaterThanOrEqual(0);
      expect(alignment.overallFit).toBeLessThanOrEqual(100);
    });
  });

  describe('TrendAnalysis', () => {
    it('should validate trend analysis structure', () => {
      const trends: TrendAnalysis = {
        currentTrends: ['Sustainable Fashion', 'Plant-based Food'],
        emergingTrends: ['AI Music', 'Virtual Travel'],
        trendAlignment: 82,
        innovatorScore: 65
      };

      expect(trends.currentTrends).toHaveLength(2);
      expect(trends.emergingTrends).toHaveLength(2);
      expect(trends.trendAlignment).toBeGreaterThanOrEqual(0);
      expect(trends.trendAlignment).toBeLessThanOrEqual(100);
      expect(trends.innovatorScore).toBeGreaterThanOrEqual(0);
      expect(trends.innovatorScore).toBeLessThanOrEqual(100);
    });
  });

  describe('InsightAnalytics', () => {
    it('should validate complete analytics structure', () => {
      const analytics: InsightAnalytics = {
        preferences: {
          primaryPreferences: ['Rock', 'Nike', 'Italian'],
          secondaryPreferences: ['Jazz', 'Adidas'],
          emergingInterests: ['Electronic'],
          preferenceStrength: 80
        },
        behavioralInfluence: {
          purchaseInfluence: 85,
          socialInfluence: 70,
          lifestyleAlignment: 90,
          emotionalConnection: 75
        },
        demographicAlignment: {
          ageGroupAlignment: 88,
          locationAlignment: 92,
          occupationAlignment: 75,
          overallFit: 85
        },
        trends: {
          currentTrends: ['Sustainable Fashion'],
          emergingTrends: ['AI Music'],
          trendAlignment: 82,
          innovatorScore: 65
        }
      };

      expect(analytics.preferences).toBeDefined();
      expect(analytics.behavioralInfluence).toBeDefined();
      expect(analytics.demographicAlignment).toBeDefined();
      expect(analytics.trends).toBeDefined();
    });
  });

  describe('CulturalInsight', () => {
    it('should validate complete cultural insight structure', () => {
      const insight: CulturalInsight = {
        category: 'music',
        items: [
          {
            name: 'The Beatles',
            relevanceScore: 95,
            confidence: 0.9,
            source: 'qloo'
          },
          {
            name: 'Led Zeppelin',
            relevanceScore: 88,
            confidence: 0.85,
            source: 'qloo'
          }
        ],
        metadata: {
          generatedAt: '2025-01-01T00:00:00Z',
          source: 'qloo',
          dataQuality: 'high',
          enrichmentLevel: 90
        },
        analytics: {
          preferences: {
            primaryPreferences: ['Rock', 'Classic Rock'],
            secondaryPreferences: ['Blues'],
            emergingInterests: [],
            preferenceStrength: 85
          },
          behavioralInfluence: {
            purchaseInfluence: 70,
            socialInfluence: 80,
            lifestyleAlignment: 85,
            emotionalConnection: 90
          },
          demographicAlignment: {
            ageGroupAlignment: 75,
            locationAlignment: 80,
            occupationAlignment: 70,
            overallFit: 75
          },
          trends: {
            currentTrends: ['Vinyl Revival'],
            emergingTrends: ['AI-Generated Music'],
            trendAlignment: 70,
            innovatorScore: 60
          }
        }
      };

      expect(insight.category).toBe('music');
      expect(insight.items).toHaveLength(2);
      expect(insight.metadata.dataQuality).toBe('high');
      expect(insight.analytics.preferences.primaryPreferences).toContain('Rock');
    });
  });

  describe('CulturalInsights', () => {
    it('should validate complete cultural insights structure', () => {
      const createMockInsight = (category: string): CulturalInsight => ({
        category,
        items: [
          {
            name: `${category} item`,
            relevanceScore: 80,
            confidence: 0.8,
            source: 'qloo'
          }
        ],
        metadata: {
          generatedAt: '2025-01-01T00:00:00Z',
          source: 'qloo',
          dataQuality: 'high',
          enrichmentLevel: 80
        },
        analytics: {
          preferences: {
            primaryPreferences: [`${category} preference`],
            secondaryPreferences: [],
            emergingInterests: [],
            preferenceStrength: 80
          },
          behavioralInfluence: {
            purchaseInfluence: 80,
            socialInfluence: 70,
            lifestyleAlignment: 85,
            emotionalConnection: 75
          },
          demographicAlignment: {
            ageGroupAlignment: 80,
            locationAlignment: 85,
            occupationAlignment: 75,
            overallFit: 80
          },
          trends: {
            currentTrends: [`${category} trend`],
            emergingTrends: [],
            trendAlignment: 75,
            innovatorScore: 70
          }
        }
      });

      const insights: CulturalInsights = {
        music: createMockInsight('music'),
        brand: createMockInsight('brand'),
        movie: createMockInsight('movie'),
        tv: createMockInsight('tv'),
        book: createMockInsight('book'),
        restaurant: createMockInsight('restaurant'),
        travel: createMockInsight('travel'),
        fashion: createMockInsight('fashion'),
        beauty: createMockInsight('beauty'),
        food: createMockInsight('food'),
        socialMedia: createMockInsight('socialMedia')
      };

      // Verify all required categories are present
      expect(insights.music).toBeDefined();
      expect(insights.brand).toBeDefined();
      expect(insights.movie).toBeDefined();
      expect(insights.tv).toBeDefined();
      expect(insights.book).toBeDefined();
      expect(insights.restaurant).toBeDefined();
      expect(insights.travel).toBeDefined();
      expect(insights.fashion).toBeDefined();
      expect(insights.beauty).toBeDefined();
      expect(insights.food).toBeDefined();
      expect(insights.socialMedia).toBeDefined();

      // Verify structure consistency
      Object.values(insights).forEach(insight => {
        expect(insight.category).toBeDefined();
        expect(insight.items).toBeDefined();
        expect(insight.metadata).toBeDefined();
        expect(insight.analytics).toBeDefined();
      });
    });
  });

  describe('InsightError', () => {
    it('should validate error structure', () => {
      const error: InsightError = {
        category: 'music',
        errorType: 'enrichment',
        message: 'Failed to enrich music data',
        recoveryAction: 'Use fallback data'
      };

      expect(error.category).toBe('music');
      expect(['enrichment', 'validation', 'migration']).toContain(error.errorType);
      expect(error.message).toBeDefined();
      expect(error.recoveryAction).toBeDefined();
    });
  });

  describe('InsightValidationResult', () => {
    it('should validate validation result structure', () => {
      const result: InsightValidationResult = {
        isValid: true,
        errors: [],
        warnings: ['Low confidence in some items'],
        score: 85
      };

      expect(typeof result.isValid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe('MigrationStatus', () => {
    it('should validate migration status structure', () => {
      const status: MigrationStatus = {
        personaId: 'persona-123',
        status: 'completed',
        startedAt: '2025-01-01T00:00:00Z',
        completedAt: '2025-01-01T00:05:00Z',
        preservedDataIntegrity: true
      };

      expect(status.personaId).toBe('persona-123');
      expect(['pending', 'in_progress', 'completed', 'failed']).toContain(status.status);
      expect(status.startedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
      expect(typeof status.preservedDataIntegrity).toBe('boolean');
    });
  });

  describe('InsightGenerationConfig', () => {
    it('should validate generation config structure', () => {
      const config: InsightGenerationConfig = {
        enableQlooEnrichment: true,
        fallbackToSimpleData: true,
        minimumConfidenceThreshold: 0.7,
        maxItemsPerCategory: 20,
        enableTrendAnalysis: true,
        enableBehavioralAnalysis: true
      };

      expect(typeof config.enableQlooEnrichment).toBe('boolean');
      expect(typeof config.fallbackToSimpleData).toBe('boolean');
      expect(config.minimumConfidenceThreshold).toBeGreaterThanOrEqual(0);
      expect(config.minimumConfidenceThreshold).toBeLessThanOrEqual(1);
      expect(config.maxItemsPerCategory).toBeGreaterThan(0);
      expect(typeof config.enableTrendAnalysis).toBe('boolean');
      expect(typeof config.enableBehavioralAnalysis).toBe('boolean');
    });
  });

  describe('InsightVisualizationConfig', () => {
    it('should validate visualization config structure', () => {
      const config: InsightVisualizationConfig = {
        category: 'music',
        displayType: 'chart',
        showAnalytics: true,
        showTrends: true,
        maxDisplayItems: 10,
        colorScheme: 'blue'
      };

      expect(config.category).toBe('music');
      expect(['list', 'chart', 'graph', 'cards']).toContain(config.displayType);
      expect(typeof config.showAnalytics).toBe('boolean');
      expect(typeof config.showTrends).toBe('boolean');
      expect(config.maxDisplayItems).toBeGreaterThan(0);
      expect(config.colorScheme).toBeDefined();
    });
  });

  describe('CulturalCategoryMetadata', () => {
    it('should validate category metadata structure', () => {
      const metadata: CulturalCategoryMetadata = {
        name: 'music',
        displayName: 'Music',
        description: 'Musical preferences and artists',
        icon: 'music-note',
        color: '#3B82F6',
        priority: 1,
        analyticsEnabled: true,
        trendsEnabled: true,
        qlooSupported: true
      };

      expect(metadata.name).toBe('music');
      expect(metadata.displayName).toBe('Music');
      expect(metadata.description).toBeDefined();
      expect(metadata.icon).toBeDefined();
      expect(metadata.color).toMatch(/^#[0-9A-F]{6}$/i);
      expect(metadata.priority).toBeGreaterThan(0);
      expect(typeof metadata.analyticsEnabled).toBe('boolean');
      expect(typeof metadata.trendsEnabled).toBe('boolean');
      expect(typeof metadata.qlooSupported).toBe('boolean');
    });
  });

  describe('Type Integration', () => {
    it('should validate EnhancedPersonaWithInsights structure', () => {
      const createMockInsight = (category: string): CulturalInsight => ({
        category,
        items: [],
        metadata: {
          generatedAt: '2025-01-01T00:00:00Z',
          source: 'qloo',
          dataQuality: 'high',
          enrichmentLevel: 80
        },
        analytics: {
          preferences: {
            primaryPreferences: [],
            secondaryPreferences: [],
            emergingInterests: [],
            preferenceStrength: 80
          },
          behavioralInfluence: {
            purchaseInfluence: 80,
            socialInfluence: 70,
            lifestyleAlignment: 85,
            emotionalConnection: 75
          },
          demographicAlignment: {
            ageGroupAlignment: 80,
            locationAlignment: 85,
            occupationAlignment: 75,
            overallFit: 80
          },
          trends: {
            currentTrends: [],
            emergingTrends: [],
            trendAlignment: 75,
            innovatorScore: 70
          }
        }
      });

      const enhancedPersona: EnhancedPersonaWithInsights = {
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
          personality: ['Creative'],
          values: ['Innovation'],
          interests: ['Technology'],
          lifestyle: 'Urban Professional'
        },
        painPoints: [],
        goals: [],
        marketingInsights: {
          preferredChannels: ['Social Media'],
          messagingTone: 'Professional',
          buyingBehavior: 'Research-driven'
        },
        qualityScore: 85,
        createdAt: '2025-01-01T00:00:00Z',
        culturalInsights: {
          music: createMockInsight('music'),
          brand: createMockInsight('brand'),
          movie: createMockInsight('movie'),
          tv: createMockInsight('tv'),
          book: createMockInsight('book'),
          restaurant: createMockInsight('restaurant'),
          travel: createMockInsight('travel'),
          fashion: createMockInsight('fashion'),
          beauty: createMockInsight('beauty'),
          food: createMockInsight('food'),
          socialMedia: createMockInsight('socialMedia')
        },
        insightMetadata: {
          generationTimestamp: '2025-01-01T00:00:00Z',
          enrichmentLevel: 85,
          dataQuality: 'high',
          qlooDataUsed: true
        }
      };

      expect(enhancedPersona.culturalInsights).toBeDefined();
      expect(enhancedPersona.insightMetadata).toBeDefined();
      expect(enhancedPersona.insightMetadata.dataQuality).toBe('high');
      expect(enhancedPersona.culturalInsights.music.category).toBe('music');
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain compatibility with existing Persona interface', () => {
      // This test ensures that the new types don't break existing code
      const legacyPersona = {
        id: 'legacy-id',
        name: 'Legacy Persona',
        age: 25,
        occupation: 'Designer',
        location: 'London',
        bio: 'Legacy bio',
        quote: 'Legacy quote',
        demographics: {
          income: '40000',
          education: 'Master\'s Degree',
          familyStatus: 'Married'
        },
        psychographics: {
          personality: ['Creative'],
          values: ['Quality'],
          interests: ['Design'],
          lifestyle: 'Creative Professional'
        },
        culturalData: {
          music: ['Pop', 'Rock'],
          movie: ['Drama', 'Comedy'],
          tv: ['Series', 'Documentary'],
          book: ['Fiction', 'Design'],
          brand: ['Apple', 'Nike'],
          restaurant: ['Italian', 'Asian'],
          travel: ['Europe', 'America'],
          fashion: ['Casual', 'Trendy'],
          beauty: ['Skincare', 'Makeup'],
          food: ['Organic', 'International'],
          socialMedia: ['Instagram', 'Pinterest']
        },
        painPoints: ['Time management'],
        goals: ['Career growth'],
        marketingInsights: {
          preferredChannels: ['Social Media'],
          messagingTone: 'Creative',
          buyingBehavior: 'Impulse'
        },
        qualityScore: 75,
        createdAt: '2025-01-01T00:00:00Z'
      };

      // Should be able to use legacy persona without cultural insights
      expect(legacyPersona.id).toBe('legacy-id');
      expect(legacyPersona.culturalData.music).toContain('Pop');
      expect(legacyPersona.qualityScore).toBe(75);
    });
  });
});