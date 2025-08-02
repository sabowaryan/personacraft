import { CulturalInsightEngine } from '../cultural-insight-engine';
import { Persona } from '@/types';
import { CulturalInsightItem } from '@/types/cultural-insights';

describe('CulturalInsightEngine - Analytics Generation', () => {
  let engine: CulturalInsightEngine;
  let mockPersona: Partial<Persona>;
  let mockItems: CulturalInsightItem[];

  beforeEach(() => {
    engine = new CulturalInsightEngine();

    mockPersona = {
      age: 28,
      occupation: 'Software Developer',
      location: 'San Francisco, CA',
      psychographics: {
        interests: ['technology', 'sustainability', 'music', 'travel'],
        values: ['innovation', 'environmental responsibility', 'work-life balance'],
        lifestyle: 'Urban professional',
        personality: ['Creative', 'Analytical', 'Tech-savvy', 'Environmentally conscious']
      },
      demographics: {
        income: 'High',
        education: 'Master\'s degree',
        familyStatus: 'Single'
      },
      culturalData: {
        music: ['Indie Electronic', 'Ambient', 'Tech House'],
        brand: ['Apple', 'Patagonia', 'Tesla'],
        socialMedia: ['Instagram', 'LinkedIn', 'Twitter'],
        movie: ['Inception', 'The Matrix', 'Blade Runner'],
        tv: ['Black Mirror', 'Silicon Valley', 'Mr. Robot'],
        book: ['The Pragmatic Programmer', 'Clean Code', 'Design Patterns'],
        restaurant: ['Farm-to-table', 'Sushi', 'Craft Beer Bars'],
        travel: ['Japan', 'Iceland', 'New Zealand'],
        fashion: ['Minimalist', 'Sustainable Fashion', 'Tech Wear'],
        beauty: ['Natural Products', 'Skincare', 'Eco-friendly'],
        food: ['Organic', 'Plant-based', 'Artisanal Coffee']
      }
    };

    mockItems = [
      {
        name: 'Indie Electronic',
        relevanceScore: 85,
        confidence: 0.8,
        source: 'qloo',
        attributes: { genre: 'Electronic', popularity: 'high' },
        relationships: ['Ambient', 'Tech House']
      },
      {
        name: 'Ambient',
        relevanceScore: 75,
        confidence: 0.7,
        source: 'qloo',
        attributes: { genre: 'Electronic', popularity: 'medium' },
        relationships: ['Indie Electronic']
      },
      {
        name: 'Tech House',
        relevanceScore: 65,
        confidence: 0.6,
        source: 'fallback',
        attributes: { genre: 'Electronic', popularity: 'medium' },
        relationships: ['Indie Electronic']
      },
      {
        name: 'Lo-fi Hip Hop',
        relevanceScore: 55,
        confidence: 0.5,
        source: 'fallback',
        attributes: { genre: 'Hip Hop', popularity: 'emerging' },
        relationships: []
      }
    ];
  });

  describe('analyzePreferences', () => {
    it('should correctly identify primary preferences', () => {
      const result = (engine as any).analyzePreferences(mockItems, mockPersona);

      expect(result.primaryPreferences).toContain('Indie Electronic');
      expect(result.primaryPreferences).toContain('Ambient');
      expect(result.primaryPreferences.length).toBeLessThanOrEqual(3);
    });

    it('should calculate preference strength accurately', () => {
      const result = (engine as any).analyzePreferences(mockItems, mockPersona);

      expect(result.preferenceStrength).toBeGreaterThan(0);
      expect(result.preferenceStrength).toBeLessThanOrEqual(100);
      expect(typeof result.preferenceStrength).toBe('number');
    });

    it('should identify emerging interests', () => {
      const result = (engine as any).analyzePreferences(mockItems, mockPersona);

      expect(Array.isArray(result.emergingInterests)).toBe(true);
      expect(result.emergingInterests.length).toBeLessThanOrEqual(3);
    });

    it('should handle empty items array', () => {
      const result = (engine as any).analyzePreferences([], mockPersona);

      expect(result.primaryPreferences).toEqual([]);
      expect(result.secondaryPreferences).toEqual([]);
      expect(result.emergingInterests).toEqual([]);
      expect(result.preferenceStrength).toBe(0);
    });

    it('should categorize preferences by strength correctly', () => {
      const result = (engine as any).analyzePreferences(mockItems, mockPersona);

      // Primary preferences should not overlap with secondary
      const overlap = result.primaryPreferences.filter((pref: string) =>
        result.secondaryPreferences.includes(pref)
      );
      expect(overlap.length).toBe(0);
    });
  });

  describe('analyzeBehavioralInfluence', () => {
    it('should calculate purchase influence for different categories', () => {
      const musicResult = (engine as any).analyzeBehavioralInfluence(mockItems, mockPersona, 'music');
      const brandResult = (engine as any).analyzeBehavioralInfluence(mockItems, mockPersona, 'brand');

      expect(musicResult.purchaseInfluence).toBeGreaterThanOrEqual(0);
      expect(musicResult.purchaseInfluence).toBeLessThanOrEqual(100);
      expect(brandResult.purchaseInfluence).toBeGreaterThan(musicResult.purchaseInfluence);
    });

    it('should calculate social influence based on age', () => {
      const youngPersona = { ...mockPersona, age: 22 };
      const oldPersona = { ...mockPersona, age: 60 };

      const youngResult = (engine as any).analyzeBehavioralInfluence(mockItems, youngPersona, 'socialMedia');
      const oldResult = (engine as any).analyzeBehavioralInfluence(mockItems, oldPersona, 'socialMedia');

      expect(youngResult.socialInfluence).toBeGreaterThan(oldResult.socialInfluence);
    });

    it('should calculate lifestyle alignment based on psychographics', () => {
      const result = (engine as any).analyzeBehavioralInfluence(mockItems, mockPersona, 'music');

      expect(result.lifestyleAlignment).toBeGreaterThanOrEqual(0);
      expect(result.lifestyleAlignment).toBeLessThanOrEqual(100);
      expect(typeof result.lifestyleAlignment).toBe('number');
    });

    it('should calculate emotional connection for different categories', () => {
      const musicResult = (engine as any).analyzeBehavioralInfluence(mockItems, mockPersona, 'music');
      const brandResult = (engine as any).analyzeBehavioralInfluence(mockItems, mockPersona, 'brand');

      expect(musicResult.emotionalConnection).toBeGreaterThan(brandResult.emotionalConnection);
    });

    it('should handle empty items array', () => {
      const result = (engine as any).analyzeBehavioralInfluence([], mockPersona, 'music');

      expect(result.purchaseInfluence).toBe(0);
      expect(result.socialInfluence).toBe(0);
      expect(result.lifestyleAlignment).toBe(0);
      expect(result.emotionalConnection).toBe(0);
    });

    it('should adjust for luxury items and income', () => {
      const luxuryItems = [
        {
          name: 'Premium Brand',
          relevanceScore: 80,
          confidence: 0.8,
          source: 'qloo' as const,
          attributes: { priceRange: 'high', category: 'luxury' },
          relationships: []
        }
      ];

      const highIncomePersona = { ...mockPersona, demographics: { ...mockPersona.demographics, income: 'High' } };
      const lowIncomePersona = { ...mockPersona, demographics: { ...mockPersona.demographics, income: 'Low' } };

      const highIncomeResult = (engine as any).analyzeBehavioralInfluence(luxuryItems, highIncomePersona, 'brand');
      const lowIncomeResult = (engine as any).analyzeBehavioralInfluence(luxuryItems, lowIncomePersona, 'brand');

      expect(highIncomeResult.purchaseInfluence).toBeGreaterThan(lowIncomeResult.purchaseInfluence);
    });
  });

  describe('analyzeDemographicAlignment', () => {
    it('should calculate age group alignment correctly', () => {
      const genZPersona = { ...mockPersona, age: 22 };
      const millennialPersona = { ...mockPersona, age: 30 };
      const genXPersona = { ...mockPersona, age: 45 };

      const genZItems = [
        { name: 'TikTok Music', relevanceScore: 80, confidence: 0.8, source: 'qloo' as const, attributes: {}, relationships: [] },
        { name: 'Gaming Soundtrack', relevanceScore: 75, confidence: 0.7, source: 'qloo' as const, attributes: {}, relationships: [] }
      ];

      const genZResult = (engine as any).analyzeDemographicAlignment(genZItems, genZPersona);
      const millennialResult = (engine as any).analyzeDemographicAlignment(genZItems, millennialPersona);
      const genXResult = (engine as any).analyzeDemographicAlignment(genZItems, genXPersona);

      expect(genZResult.ageGroupAlignment).toBeGreaterThan(millennialResult.ageGroupAlignment);
      expect(genZResult.ageGroupAlignment).toBeGreaterThan(genXResult.ageGroupAlignment);
    });

    it('should calculate location alignment for urban vs rural', () => {
      const urbanPersona = { ...mockPersona, location: 'New York City, NY' };
      const ruralPersona = { ...mockPersona, location: 'Rural Montana' };

      const urbanItems = [
        { name: 'Urban Contemporary', relevanceScore: 80, confidence: 0.8, source: 'qloo' as const, attributes: {}, relationships: [] },
        { name: 'Modern Jazz', relevanceScore: 75, confidence: 0.7, source: 'qloo' as const, attributes: {}, relationships: [] }
      ];

      const traditionalItems = [
        { name: 'Traditional Folk', relevanceScore: 80, confidence: 0.8, source: 'qloo' as const, attributes: {}, relationships: [] },
        { name: 'Local Artisan', relevanceScore: 75, confidence: 0.7, source: 'qloo' as const, attributes: {}, relationships: [] }
      ];

      const urbanWithUrbanItems = (engine as any).analyzeDemographicAlignment(urbanItems, urbanPersona);
      const ruralWithTraditionalItems = (engine as any).analyzeDemographicAlignment(traditionalItems, ruralPersona);
      const urbanWithTraditionalItems = (engine as any).analyzeDemographicAlignment(traditionalItems, urbanPersona);

      expect(urbanWithUrbanItems.locationAlignment).toBeGreaterThan(urbanWithTraditionalItems.locationAlignment);
      expect(ruralWithTraditionalItems.locationAlignment).toBeGreaterThan(urbanWithTraditionalItems.locationAlignment);
    });

    it('should calculate occupation alignment', () => {
      const techPersona = { ...mockPersona, occupation: 'Software Engineer' };
      const creativePersona = { ...mockPersona, occupation: 'Graphic Designer' };

      const techItems = [
        { name: 'Tech Podcast', relevanceScore: 80, confidence: 0.8, source: 'qloo' as const, attributes: {}, relationships: [] },
        { name: 'Digital Innovation', relevanceScore: 75, confidence: 0.7, source: 'qloo' as const, attributes: {}, relationships: [] }
      ];

      const creativeItems = [
        { name: 'Art Gallery', relevanceScore: 80, confidence: 0.8, source: 'qloo' as const, attributes: {}, relationships: [] },
        { name: 'Creative Workshop', relevanceScore: 75, confidence: 0.7, source: 'qloo' as const, attributes: {}, relationships: [] }
      ];

      const techWithTechItems = (engine as any).analyzeDemographicAlignment(techItems, techPersona);
      const creativeWithCreativeItems = (engine as any).analyzeDemographicAlignment(creativeItems, creativePersona);
      const techWithCreativeItems = (engine as any).analyzeDemographicAlignment(creativeItems, techPersona);

      expect(techWithTechItems.occupationAlignment).toBeGreaterThan(techWithCreativeItems.occupationAlignment);
      expect(creativeWithCreativeItems.occupationAlignment).toBeGreaterThan(techWithCreativeItems.occupationAlignment);
    });

    it('should calculate overall fit as average of alignments', () => {
      const result = (engine as any).analyzeDemographicAlignment(mockItems, mockPersona);

      const expectedOverallFit = Math.round(
        (result.ageGroupAlignment + result.locationAlignment + result.occupationAlignment) / 3
      );

      expect(result.overallFit).toBe(expectedOverallFit);
    });

    it('should handle missing demographic data gracefully', () => {
      const incompletePersona = { age: 25 };
      const result = (engine as any).analyzeDemographicAlignment(mockItems, incompletePersona);

      expect(result.ageGroupAlignment).toBeGreaterThan(0);
      expect(result.locationAlignment).toBe(60); // Default value
      expect(result.occupationAlignment).toBe(55); // Default value
      expect(result.overallFit).toBeGreaterThan(0);
    });
  });

  describe('analyzeTrends', () => {
    it('should identify current trends from high-relevance items', () => {
      const result = (engine as any).analyzeTrends(mockItems, 'music');

      expect(Array.isArray(result.currentTrends)).toBe(true);
      expect(result.currentTrends.length).toBeLessThanOrEqual(4);
      expect(result.currentTrends).toContain('Indie Electronic');
    });

    it('should identify emerging trends', () => {
      const emergingItems = [
        { name: 'New Wave Electronic', relevanceScore: 60, confidence: 0.7, source: 'qloo' as const, attributes: {}, relationships: [] },
        { name: 'Innovative Soundscape', relevanceScore: 55, confidence: 0.6, source: 'qloo' as const, attributes: {}, relationships: [] }
      ];

      const result = (engine as any).analyzeTrends(emergingItems, 'music');

      expect(Array.isArray(result.emergingTrends)).toBe(true);
      expect(result.emergingTrends.length).toBeLessThanOrEqual(3);
    });

    it('should calculate trend alignment score', () => {
      const result = (engine as any).analyzeTrends(mockItems, 'music');

      expect(result.trendAlignment).toBeGreaterThanOrEqual(0);
      expect(result.trendAlignment).toBeLessThanOrEqual(100);
      expect(typeof result.trendAlignment).toBe('number');
    });

    it('should calculate innovator score', () => {
      const innovativeItems = [
        { name: 'Cutting-edge Electronic', relevanceScore: 70, confidence: 0.8, source: 'qloo' as const, attributes: {}, relationships: [] },
        { name: 'Experimental Music', relevanceScore: 65, confidence: 0.7, source: 'qloo' as const, attributes: {}, relationships: [] }
      ];

      const result = (engine as any).analyzeTrends(innovativeItems, 'music');

      expect(result.innovatorScore).toBeGreaterThan(40); // Should be higher than base score
      expect(result.innovatorScore).toBeLessThanOrEqual(100);
    });

    it('should handle category-specific trends', () => {
      const fashionItems = [
        { name: 'Sustainable Fashion', relevanceScore: 80, confidence: 0.8, source: 'qloo' as const, attributes: {}, relationships: [] },
        { name: 'Vintage Style', relevanceScore: 75, confidence: 0.7, source: 'qloo' as const, attributes: {}, relationships: [] }
      ];

      const result = (engine as any).analyzeTrends(fashionItems, 'fashion');

      expect(result.currentTrends.length).toBeGreaterThan(0);
      expect(result.trendAlignment).toBeGreaterThan(30);
    });

    it('should return low scores for empty items', () => {
      const result = (engine as any).analyzeTrends([], 'music');

      expect(result.currentTrends).toEqual([]);
      expect(result.emergingTrends).toEqual([]);
      expect(result.trendAlignment).toBe(0);
      expect(result.innovatorScore).toBe(0);
    });
  });

  describe('Integration Tests', () => {
    it('should generate complete analytics for a category', async () => {
      const insight = await engine.enrichCategory('music', mockPersona);

      expect(insight.analytics).toBeDefined();
      expect(insight.analytics.preferences).toBeDefined();
      expect(insight.analytics.behavioralInfluence).toBeDefined();
      expect(insight.analytics.demographicAlignment).toBeDefined();
      expect(insight.analytics.trends).toBeDefined();

      // Verify all analytics have valid ranges
      expect(insight.analytics.preferences.preferenceStrength).toBeGreaterThanOrEqual(0);
      expect(insight.analytics.preferences.preferenceStrength).toBeLessThanOrEqual(100);

      expect(insight.analytics.behavioralInfluence.purchaseInfluence).toBeGreaterThanOrEqual(0);
      expect(insight.analytics.behavioralInfluence.purchaseInfluence).toBeLessThanOrEqual(100);

      expect(insight.analytics.demographicAlignment.overallFit).toBeGreaterThanOrEqual(0);
      expect(insight.analytics.demographicAlignment.overallFit).toBeLessThanOrEqual(100);

      expect(insight.analytics.trends.trendAlignment).toBeGreaterThanOrEqual(0);
      expect(insight.analytics.trends.trendAlignment).toBeLessThanOrEqual(100);
    });

    it('should generate consistent analytics across multiple calls', async () => {
      const insight1 = await engine.enrichCategory('music', mockPersona);
      const insight2 = await engine.enrichCategory('music', mockPersona);

      // Analytics should be consistent for the same input
      expect(insight1.analytics.preferences.preferenceStrength)
        .toBe(insight2.analytics.preferences.preferenceStrength);
      expect(insight1.analytics.behavioralInfluence.purchaseInfluence)
        .toBe(insight2.analytics.behavioralInfluence.purchaseInfluence);
    });

    it('should handle different categories with appropriate analytics', async () => {
      const musicInsight = await engine.enrichCategory('music', mockPersona);
      const brandInsight = await engine.enrichCategory('brand', mockPersona);
      const socialMediaInsight = await engine.enrichCategory('socialMedia', mockPersona);

      // Brand should have higher purchase influence than music
      expect(brandInsight.analytics.behavioralInfluence.purchaseInfluence)
        .toBeGreaterThan(musicInsight.analytics.behavioralInfluence.purchaseInfluence);

      // Social media should have higher social influence for young users
      expect(socialMediaInsight.analytics.behavioralInfluence.socialInfluence)
        .toBeGreaterThan(brandInsight.analytics.behavioralInfluence.socialInfluence);

      // Music should have higher emotional connection
      expect(musicInsight.analytics.behavioralInfluence.emotionalConnection)
        .toBeGreaterThan(brandInsight.analytics.behavioralInfluence.emotionalConnection);
    });

    it('should generate complete insights for all categories', async () => {
      const insights = await engine.generateInsights(mockPersona);

      const categories = ['music', 'brand', 'movie', 'tv', 'book', 'restaurant', 'travel', 'fashion', 'beauty', 'food', 'socialMedia'];

      for (const category of categories) {
        const categoryInsight = insights[category as keyof typeof insights];
        expect(categoryInsight.analytics).toBeDefined();
        expect(categoryInsight.analytics.preferences).toBeDefined();
        expect(categoryInsight.analytics.behavioralInfluence).toBeDefined();
        expect(categoryInsight.analytics.demographicAlignment).toBeDefined();
        expect(categoryInsight.analytics.trends).toBeDefined();
      }
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null persona gracefully', async () => {
      const insight = await engine.enrichCategory('music', null);

      expect(insight.analytics).toBeDefined();
      expect(insight.analytics.preferences.preferenceStrength).toBeGreaterThanOrEqual(0);
      expect(insight.analytics.preferences.preferenceStrength).toBeLessThanOrEqual(100);
      expect(insight.analytics.behavioralInfluence.purchaseInfluence).toBeGreaterThanOrEqual(0);
    });

    it('should handle persona with missing fields', async () => {
      const incompletePersona = { age: 25 };
      const insight = await engine.enrichCategory('music', incompletePersona);

      expect(insight.analytics).toBeDefined();
      expect(insight.analytics.demographicAlignment.ageGroupAlignment).toBeGreaterThan(0);
      expect(insight.analytics.demographicAlignment.locationAlignment).toBe(60); // Default
    });

    it('should handle invalid age values', async () => {
      const invalidPersona = { ...mockPersona, age: 'invalid' as any };
      const insight = await engine.enrichCategory('music', invalidPersona);

      expect(insight.analytics.demographicAlignment.ageGroupAlignment).toBe(50); // Default
    });

    it('should handle empty cultural data', async () => {
      const emptyPersona = { ...mockPersona, culturalData: {
        music: [],
        movie: [],
        tv: [],
        book: [],
        brand: [],
        restaurant: [],
        travel: [],
        fashion: [],
        beauty: [],
        food: [],
        socialMedia: []
      } };
      const insight = await engine.enrichCategory('music', emptyPersona);

      expect(insight.analytics).toBeDefined();
      expect(insight.items.length).toBeGreaterThan(0); // Should use fallback data
    });
  });
});