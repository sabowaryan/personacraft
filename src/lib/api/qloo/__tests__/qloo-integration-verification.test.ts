import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PersonaEnrichment } from '../enrichment';
import { RequestHandler } from '../request-handler';
import { Persona } from '@/types';

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
  getFallbackEnrichment: vi.fn((personas: any[]) => personas)
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

describe('Qloo Integration Verification', () => {
  let enrichment: PersonaEnrichment;
  let mockRequestHandler: RequestHandler;

  const mockPersona: Partial<Persona> = {
    id: 'test-1',
    name: 'Test Persona',
    age: 28,
    occupation: 'Software Developer',
    location: 'San Francisco, CA'
  };

  beforeEach(() => {
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

  describe('Qloo Fetch Function Integration', () => {
    it('should integrate fetchData method with CulturalInsightEngine', async () => {
      // Mock successful Qloo API response
      mockRequestHandler.makeRequestWithRetry = vi.fn()
        .mockResolvedValue(['Spotify', 'Apple Music', 'SoundCloud']);
      mockRequestHandler.getCachedData = vi.fn().mockReturnValue(null);

      // Test direct fetchData call
      const directResult = await enrichment.fetchData('music', 28, 'Developer', 'San Francisco', 3);
      expect(directResult).toEqual(['Spotify', 'Apple Music', 'SoundCloud']);

      // Test that the insight engine can use the same function
      const insight = await enrichment.fetchCulturalInsight('music', mockPersona);
      
      expect(insight.category).toBe('music');
      expect(insight.items.length).toBeGreaterThan(0);
      
      // Should have items from Qloo
      const qlooItems = insight.items.filter(item => item.source === 'qloo');
      expect(qlooItems.length).toBeGreaterThan(0);
      expect(qlooItems[0].name).toBe('Spotify');
    });

    it('should handle Qloo API integration in full persona enrichment', async () => {
      // Mock successful responses for different categories
      mockRequestHandler.makeRequestWithRetry = vi.fn()
        .mockResolvedValue(['Spotify', 'Apple Music', 'SoundCloud']); // Return same data for all calls

      mockRequestHandler.getCachedData = vi.fn().mockReturnValue(null);

      const result = await enrichment.enrichPersonas([mockPersona]);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('culturalInsights');
      
      const insights = result[0].culturalInsights!;
      
      // Verify that insights are generated with proper structure
      expect(insights.music).toHaveProperty('category', 'music');
      expect(insights.music).toHaveProperty('items');
      expect(insights.music).toHaveProperty('metadata');
      expect(insights.music).toHaveProperty('analytics');
      
      // Verify that items exist (either from Qloo or fallback)
      expect(insights.music.items.length).toBeGreaterThan(0);
      expect(insights.brand.items.length).toBeGreaterThan(0);
      
      // Verify that the metadata source is appropriate (qloo, fallback, or hybrid)
      expect(['qloo', 'fallback', 'hybrid']).toContain(insights.music.metadata.source);
      expect(['qloo', 'fallback', 'hybrid']).toContain(insights.brand.metadata.source);
    });

    it('should maintain backward compatibility with existing culturalData', async () => {
      const personaWithData: Partial<Persona> = {
        ...mockPersona,
        culturalData: {
          music: ['Existing Artist'],
          brand: [],
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

      // Mock Qloo response
      mockRequestHandler.makeRequestWithRetry = vi.fn()
        .mockResolvedValue(['New Qloo Artist']);
      mockRequestHandler.getCachedData = vi.fn().mockReturnValue(null);

      const result = await enrichment.enrichPersonas([personaWithData]);
      const insights = result[0].culturalInsights!;

      // Should preserve existing data in the culturalData field
      expect(result[0].culturalData?.music).toContain('Existing Artist');
      
      // Should include existing data in insights (source may be 'user' or 'hybrid')
      expect(insights.music.items.some(item => 
        item.name === 'Existing Artist'
      )).toBe(true);
      
      // Verify the source is appropriate for existing data
      const existingItem = insights.music.items.find(item => item.name === 'Existing Artist');
      expect(['user', 'hybrid', 'fallback']).toContain(existingItem?.source);
    });

    it('should handle API failures gracefully and use fallback', async () => {
      // Mock API failure
      mockRequestHandler.makeRequestWithRetry = vi.fn()
        .mockRejectedValue(new Error('API Error'));
      mockRequestHandler.getCachedData = vi.fn().mockReturnValue(null);

      const result = await enrichment.enrichPersonas([mockPersona]);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('culturalInsights');
      
      const insights = result[0].culturalInsights!;
      
      // Should still have insights with fallback data
      expect(insights.music.items.length).toBeGreaterThan(0);
      expect(['fallback', 'user', 'hybrid']).toContain(insights.music.metadata.source);
    });

    it('should properly set Qloo fetch function in constructor', () => {
      // Verify that the insight engine has the Qloo fetch function set
      const insightEngine = enrichment['insightEngine'];
      expect(insightEngine['qlooFetchFunction']).toBeDefined();
      expect(typeof insightEngine['qlooFetchFunction']).toBe('function');
    });

    it('should not set Qloo fetch function when no API key provided', () => {
      const enrichmentWithoutKey = new PersonaEnrichment(
        '', // No API key
        'https://api.qloo.com',
        mockRequestHandler
      );

      const insightEngine = enrichmentWithoutKey['insightEngine'];
      expect(insightEngine['qlooFetchFunction']).toBeUndefined();
    });
  });

  describe('Error Handling in Integration', () => {
    it('should handle Qloo fetch function errors in insight generation', async () => {
      // Mock the fetch function to throw an error
      mockRequestHandler.makeRequestWithRetry = vi.fn()
        .mockRejectedValue(new Error('Qloo API Error'));
      mockRequestHandler.getCachedData = vi.fn().mockReturnValue(null);

      const insight = await enrichment.fetchCulturalInsight('music', mockPersona);

      expect(insight.category).toBe('music');
      expect(insight.items.length).toBeGreaterThan(0);
      
      // Should fallback to default data when Qloo fails
      expect(['fallback', 'user', 'hybrid']).toContain(insight.metadata.source);
    });

    it('should handle null persona in Qloo integration', async () => {
      const insight = await enrichment.fetchCulturalInsight('music', null);

      expect(insight.category).toBe('music');
      expect(insight.metadata.source).toBe('fallback');
      expect(insight.metadata.dataQuality).toBe('low');
    });
  });
});