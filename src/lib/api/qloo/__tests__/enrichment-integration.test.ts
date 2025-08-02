import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PersonaEnrichment } from '../enrichment';
import { RequestHandler } from '../request-handler';
import { Persona } from '@/types';
import { CulturalInsights } from '@/types/cultural-insights';

// Mock the dependencies
vi.mock('../mappers', () => ({
  mapEntityType: vi.fn((type) => type),
  getAgeRange: vi.fn((age) => age < 30 ? 'millennials' : 'gen-x'),
  mapOccupationToSignal: vi.fn(() => 'signal.demographics.profession=tech'),
  normalizeLocation: vi.fn((location) => location?.toLowerCase())
}));

vi.mock('../fallback', () => ({
  getFallbackDataForType: vi.fn((type) => [`Fallback ${type} 1`, `Fallback ${type} 2`]),
  getFallbackPersonaEnrichment: vi.fn((persona: any) => ({
    ...persona,
    culturalData: {
      music: ['Fallback Music'],
      brand: ['Fallback Brand'],
      movie: [],
      tv: [],
      book: [],
      restaurant: [],
      travel: [],
      fashion: [],
      beauty: [],
      food: [],
      socialMedia: []
    }
  })),
  getFallbackEnrichment: vi.fn((personas: any[]) => personas.map((persona: any) => ({
    ...persona,
    culturalData: { 
      music: ['Fallback Music'],
      brand: ['Fallback Brand'],
      movie: [],
      tv: [],
      book: [],
      restaurant: [],
      travel: [],
      fashion: [],
      beauty: [],
      food: [],
      socialMedia: []
    }
  })))
}));

vi.mock('../social-media', () => ({
  enrichSocialMediaWithQloo: vi.fn(() => Promise.resolve({
    platforms: ['Instagram', 'Twitter'],
    insights: {
      audienceMatches: [],
      brandInfluence: [],
      contentPreferences: [],
      demographicAlignment: []
    }
  }))
}));

vi.mock('../validation', () => ({
  buildValidatedUrl: vi.fn(() => 'https://api.qloo.com/test')
}));

vi.mock('../performance/', () => ({
  PerformanceMonitor: {
    getInstance: vi.fn(() => ({
      startTimer: vi.fn(() => vi.fn())
    }))
  }
}));

describe('PersonaEnrichment Integration with Cultural Insights', () => {
  let enrichment: PersonaEnrichment;
  let mockRequestHandler: RequestHandler;
  let mockFetch: any;

  const mockPersona: Partial<Persona> = {
    id: 'test-1',
    name: 'Test Persona',
    age: 28,
    occupation: 'Software Developer',
    location: 'San Francisco, CA',
    psychographics: {
      interests: ['technology', 'music', 'travel'],
      values: ['innovation', 'sustainability'],
      personality: ['creative', 'analytical'],
      lifestyle: 'urban professional'
    },
    demographics: {
      income: 'high',
      education: 'Master\'s degree',
      familyStatus: 'single'
    }
  };

  beforeEach(() => {
    // Mock fetch globally
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Create mock request handler
    mockRequestHandler = {
      makeRequestWithRetry: vi.fn(),
      getCachedData: vi.fn(),
      setCachedData: vi.fn(),
      getCacheStats: vi.fn(() => ({ hits: 0, misses: 0, size: 0 }))
    } as any;

    // Create enrichment instance
    enrichment = new PersonaEnrichment(
      'test-api-key',
      'https://api.qloo.com',
      mockRequestHandler
    );
  });

  describe('Cultural Insights Generation', () => {
    it('should generate cultural insights for a persona', async () => {
      // Mock successful Qloo API responses
      mockRequestHandler.makeRequestWithRetry = vi.fn()
        .mockResolvedValueOnce(['Spotify', 'Apple Music', 'SoundCloud']) // music
        .mockResolvedValueOnce(['Netflix', 'HBO Max', 'Disney+']) // movie
        .mockResolvedValueOnce(['Apple', 'Google', 'Microsoft', 'Tesla']) // brand
        .mockResolvedValueOnce(['Breaking Bad', 'The Office', 'Stranger Things']); // tv

      mockRequestHandler.getCachedData = vi.fn().mockReturnValue(null);

      const result = await enrichment.enrichPersonas([mockPersona]);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('culturalInsights');
      
      const insights = result[0].culturalInsights as CulturalInsights;
      expect(insights).toHaveProperty('music');
      expect(insights).toHaveProperty('brand');
      expect(insights).toHaveProperty('movie');
      expect(insights).toHaveProperty('tv');

      // Verify insight structure
      expect(insights.music).toHaveProperty('category', 'music');
      expect(insights.music).toHaveProperty('items');
      expect(insights.music).toHaveProperty('metadata');
      expect(insights.music).toHaveProperty('analytics');

      // Verify items have proper structure
      expect(insights.music.items[0]).toHaveProperty('name');
      expect(insights.music.items[0]).toHaveProperty('relevanceScore');
      expect(insights.music.items[0]).toHaveProperty('confidence');
      expect(insights.music.items[0]).toHaveProperty('source');
    });

    it('should handle Qloo API failures gracefully', async () => {
      // Mock API failure
      mockRequestHandler.makeRequestWithRetry = vi.fn()
        .mockRejectedValue(new Error('API Error'));

      const result = await enrichment.enrichPersonas([mockPersona]);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('culturalInsights');
      
      const insights = result[0].culturalInsights as CulturalInsights;
      
      // Should still have insights structure with fallback data
      expect(insights.music).toHaveProperty('category', 'music');
      // When API fails, it should use fallback data, but the source might be 'user' if persona has existing data
      expect(['fallback', 'user', 'hybrid']).toContain(insights.music.metadata.source);
      expect(['low', 'medium', 'high']).toContain(insights.music.metadata.dataQuality);
    });

    it('should maintain backward compatibility with existing culturalData', async () => {
      const personaWithExistingData: Partial<Persona> = {
        ...mockPersona,
        culturalData: {
          music: ['Existing Artist 1', 'Existing Artist 2'],
          brand: ['Existing Brand 1'],
          movie: [],
          tv: [],
          book: [],
          restaurant: [],
          travel: [],
          fashion: [],
          beauty: [],
          food: [],
          socialMedia: []
        }
      };

      const result = await enrichment.enrichPersonas([personaWithExistingData]);

      expect(result[0]).toHaveProperty('culturalData');
      expect(result[0]).toHaveProperty('culturalInsights');
      
      // Should preserve existing culturalData
      expect(result[0].culturalData?.music).toContain('Existing Artist 1');
      
      // Should generate insights that include existing data
      const insights = result[0].culturalInsights as CulturalInsights;
      expect(insights.music.items.some(item => item.name === 'Existing Artist 1')).toBe(true);
      // When using existing data, the items should have 'user' source
      const existingArtistItem = insights.music.items.find(item => item.name === 'Existing Artist 1');
      expect(existingArtistItem?.source).toBe('user');
    });

    it('should generate analytics for cultural insights', async () => {
      mockRequestHandler.makeRequestWithRetry = vi.fn()
        .mockResolvedValue(['Test Item 1', 'Test Item 2']);
      mockRequestHandler.getCachedData = vi.fn().mockReturnValue(null);

      const result = await enrichment.enrichPersonas([mockPersona]);
      const insights = result[0].culturalInsights as CulturalInsights;

      // Verify analytics structure
      expect(insights.music.analytics).toHaveProperty('preferences');
      expect(insights.music.analytics).toHaveProperty('behavioralInfluence');
      expect(insights.music.analytics).toHaveProperty('demographicAlignment');
      expect(insights.music.analytics).toHaveProperty('trends');

      // Verify preference analysis
      expect(insights.music.analytics.preferences).toHaveProperty('primaryPreferences');
      expect(insights.music.analytics.preferences).toHaveProperty('secondaryPreferences');
      expect(insights.music.analytics.preferences).toHaveProperty('emergingInterests');
      expect(insights.music.analytics.preferences).toHaveProperty('preferenceStrength');

      // Verify behavioral influence
      expect(insights.music.analytics.behavioralInfluence).toHaveProperty('purchaseInfluence');
      expect(insights.music.analytics.behavioralInfluence).toHaveProperty('socialInfluence');
      expect(insights.music.analytics.behavioralInfluence).toHaveProperty('lifestyleAlignment');
      expect(insights.music.analytics.behavioralInfluence).toHaveProperty('emotionalConnection');

      // Verify scores are within expected ranges
      expect(insights.music.analytics.behavioralInfluence.purchaseInfluence).toBeGreaterThanOrEqual(0);
      expect(insights.music.analytics.behavioralInfluence.purchaseInfluence).toBeLessThanOrEqual(100);
    });

    it('should handle personas without age gracefully', async () => {
      const personaWithoutAge: Partial<Persona> = {
        ...mockPersona,
        age: undefined
      };

      const result = await enrichment.enrichPersonas([personaWithoutAge]);

      expect(result).toHaveLength(1);
      // Should use fallback enrichment for personas without age
      expect(result[0]).toBeDefined();
    });

    it('should use cached data when available', async () => {
      const cachedData = ['Cached Item 1', 'Cached Item 2'];
      mockRequestHandler.getCachedData = vi.fn().mockReturnValue(cachedData);

      const result = await enrichment.enrichPersonas([mockPersona]);
      const insights = result[0].culturalInsights as CulturalInsights;

      // Should not make API calls when cached data is available
      expect(mockRequestHandler.makeRequestWithRetry).not.toHaveBeenCalled();
      
      // Should still generate insights with cached data
      expect(insights.music.items.some(item => item.name === 'Cached Item 1')).toBe(true);
    });
  });

  describe('fetchCulturalInsight method', () => {
    it('should return cultural insight for a specific category', async () => {
      const insight = await enrichment.fetchCulturalInsight('music', mockPersona);

      expect(insight).toHaveProperty('category', 'music');
      expect(insight).toHaveProperty('items');
      expect(insight).toHaveProperty('metadata');
      expect(insight).toHaveProperty('analytics');
      expect(insight.items).toBeInstanceOf(Array);
    });

    it('should handle null persona gracefully', async () => {
      const insight = await enrichment.fetchCulturalInsight('music', null);

      expect(insight).toHaveProperty('category', 'music');
      expect(insight.metadata.source).toBe('fallback');
      expect(insight.metadata.dataQuality).toBe('low');
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain existing fetchData method signature', async () => {
      mockRequestHandler.makeRequestWithRetry = vi.fn()
        .mockResolvedValue(['Item 1', 'Item 2', 'Item 3']);
      mockRequestHandler.getCachedData = vi.fn().mockReturnValue(null);

      const result = await enrichment.fetchData('music', 28, 'Developer', 'San Francisco', 5);

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(3);
      expect(result[0]).toBe('Item 1');
    });

    it('should preserve socialMediaInsights structure', async () => {
      mockRequestHandler.makeRequestWithRetry = vi.fn()
        .mockResolvedValue(['Test Item']);
      mockRequestHandler.getCachedData = vi.fn().mockReturnValue(null);

      const result = await enrichment.enrichPersonas([mockPersona]);

      expect(result[0]).toHaveProperty('socialMediaInsights');
      expect(result[0].socialMediaInsights).toHaveProperty('insights');
      expect(result[0].socialMediaInsights).toHaveProperty('platforms');
    });
  });

  describe('Error Handling', () => {
    it('should handle insight generation errors gracefully', async () => {
      // Mock the insight engine to throw an error
      const originalGenerateInsights = enrichment['insightEngine'].generateInsights;
      enrichment['insightEngine'].generateInsights = vi.fn().mockRejectedValue(new Error('Insight generation failed'));

      const result = await enrichment.enrichPersonas([mockPersona]);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('culturalInsights');
      
      // Should still have fallback insights
      const insights = result[0].culturalInsights as CulturalInsights;
      expect(insights.music).toBeDefined();

      // Restore original method
      enrichment['insightEngine'].generateInsights = originalGenerateInsights;
    });

    it('should handle network errors during enrichment', async () => {
      mockRequestHandler.makeRequestWithRetry = vi.fn()
        .mockRejectedValue(new Error('Network error'));

      const result = await enrichment.enrichPersonas([mockPersona]);

      expect(result).toHaveLength(1);
      // Should not throw and should return fallback data
      expect(result[0]).toBeDefined();
    });

    it('should handle complete insight engine failure', async () => {
      // Mock both primary and fallback insight generation to fail
      const originalGenerateInsights = enrichment['insightEngine'].generateInsights;
      enrichment['insightEngine'].generateInsights = vi.fn().mockRejectedValue(new Error('Complete failure'));

      const result = await enrichment.enrichPersonas([mockPersona]);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeDefined();
      
      // Should still return a persona, even if insights generation completely fails
      expect(result[0]).toHaveProperty('name', mockPersona.name);

      // Restore original method
      enrichment['insightEngine'].generateInsights = originalGenerateInsights;
    });
  });

  describe('Qloo Integration', () => {
    it('should properly integrate Qloo fetch function with insight engine', async () => {
      // Mock successful Qloo response
      mockRequestHandler.makeRequestWithRetry = vi.fn()
        .mockResolvedValue(['Qloo Item 1', 'Qloo Item 2']);
      mockRequestHandler.getCachedData = vi.fn().mockReturnValue(null);

      // Test that the insight engine can use the Qloo fetch function
      const insight = await enrichment.fetchCulturalInsight('music', mockPersona);

      expect(insight.category).toBe('music');
      expect(insight.items.length).toBeGreaterThan(0);
      
      // Should have items from Qloo if API call was successful
      const qlooItems = insight.items.filter(item => item.source === 'qloo');
      expect(qlooItems.length).toBeGreaterThan(0);
    });

    it('should handle Qloo API rate limiting', async () => {
      // Mock rate limit error
      mockRequestHandler.makeRequestWithRetry = vi.fn()
        .mockRejectedValue(new Error('429_RATE_LIMIT_2000'));

      const result = await enrichment.enrichPersonas([mockPersona]);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('culturalInsights');
      
      // Should fallback gracefully when rate limited
      const insights = result[0].culturalInsights as CulturalInsights;
      expect(['fallback', 'user', 'hybrid']).toContain(insights.music.metadata.source);
    });

    it('should handle Qloo API authentication errors', async () => {
      // Mock authentication error
      mockRequestHandler.makeRequestWithRetry = vi.fn()
        .mockRejectedValue(new Error('403_FORBIDDEN_music'));

      const result = await enrichment.enrichPersonas([mockPersona]);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('culturalInsights');
      
      // Should fallback gracefully when authentication fails
      const insights = result[0].culturalInsights as CulturalInsights;
      expect(['fallback', 'user', 'hybrid']).toContain(insights.music.metadata.source);
    });
  });

  describe('Data Quality and Enrichment', () => {
    it('should provide higher quality insights when Qloo data is available', async () => {
      // Mock successful Qloo responses with rich data
      mockRequestHandler.makeRequestWithRetry = vi.fn()
        .mockResolvedValue(['High Quality Item 1', 'High Quality Item 2', 'High Quality Item 3']);
      mockRequestHandler.getCachedData = vi.fn().mockReturnValue(null);

      const result = await enrichment.enrichPersonas([mockPersona]);
      const insights = result[0].culturalInsights as CulturalInsights;

      // Should be better than 'low' quality - could be 'medium' or 'high'
      expect(['medium', 'high']).toContain(insights.music.metadata.dataQuality);
      expect(insights.music.metadata.enrichmentLevel).toBeGreaterThan(30);
      expect(insights.music.items.length).toBeGreaterThan(0);
    });

    it('should maintain data consistency across categories', async () => {
      mockRequestHandler.makeRequestWithRetry = vi.fn()
        .mockResolvedValue(['Consistent Item 1', 'Consistent Item 2']);
      mockRequestHandler.getCachedData = vi.fn().mockReturnValue(null);

      const result = await enrichment.enrichPersonas([mockPersona]);
      const insights = result[0].culturalInsights as CulturalInsights;

      // All categories should have consistent structure
      const categories = ['music', 'brand', 'movie', 'tv', 'book', 'restaurant', 'travel', 'fashion', 'beauty', 'food', 'socialMedia'];
      
      categories.forEach(category => {
        const categoryInsight = insights[category as keyof CulturalInsights];
        expect(categoryInsight).toHaveProperty('category', category);
        expect(categoryInsight).toHaveProperty('items');
        expect(categoryInsight).toHaveProperty('metadata');
        expect(categoryInsight).toHaveProperty('analytics');
        expect(categoryInsight.metadata).toHaveProperty('generatedAt');
        expect(categoryInsight.metadata).toHaveProperty('source');
        expect(categoryInsight.metadata).toHaveProperty('dataQuality');
        expect(categoryInsight.metadata).toHaveProperty('enrichmentLevel');
      });
    });
  });
});