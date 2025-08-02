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

  describe('Task 2.3 Integration Verification', () => {
    it('should successfully integrate PersonaEnrichment with CulturalInsightEngine', async () => {
      // Mock successful Qloo API responses
      mockRequestHandler.makeRequestWithRetry = vi.fn()
        .mockResolvedValue(['Spotify', 'Apple Music', 'Netflix']);
      mockRequestHandler.getCachedData = vi.fn().mockReturnValue(null);

      // Verify integration status
      const status = enrichment.getIntegrationStatus();
      expect(status.hasApiKey).toBe(true);
      expect(status.hasQlooFetchFunction).toBe(true);
      expect(status.insightEngineConfig).toBeDefined();
      expect(status.insightEngineConfig.enableQlooEnrichment).toBe(true);

      // Verify integration validation
      const validation = await enrichment.validateQlooIntegration();
      expect(validation.isValid).toBe(true);
      expect(validation.error).toBeUndefined();

      // Verify that fetchData method works (backward compatibility)
      const fetchResult = await enrichment.fetchData('music', 28, 'Developer', 'San Francisco', 3);
      expect(fetchResult).toEqual(['Spotify', 'Apple Music', 'Netflix']);

      // Verify that fetchDataAsInsight method works (new functionality)
      const insightResult = await enrichment.fetchDataAsInsight('music', 28, 'Developer', 'San Francisco', 3);
      expect(insightResult).toHaveProperty('category', 'music');
      expect(insightResult).toHaveProperty('items');
      expect(insightResult).toHaveProperty('metadata');
      expect(insightResult).toHaveProperty('analytics');

      // Verify that full persona enrichment works
      const enrichedPersonas = await enrichment.enrichPersonas([mockPersona]);
      expect(enrichedPersonas).toHaveLength(1);
      expect(enrichedPersonas[0]).toHaveProperty('culturalData'); // Backward compatibility
      expect(enrichedPersonas[0]).toHaveProperty('culturalInsights'); // New system

      console.log('✅ Task 2.3 Integration Verification: All checks passed!');
    });

    it('should handle integration without API key gracefully', () => {
      const enrichmentWithoutKey = new PersonaEnrichment(
        '', // No API key
        'https://api.qloo.com',
        mockRequestHandler
      );

      const status = enrichmentWithoutKey.getIntegrationStatus();
      expect(status.hasApiKey).toBe(false);
      expect(status.hasQlooFetchFunction).toBe(false);

      console.log('✅ Task 2.3 Integration Verification: No API key handling works correctly!');
    });

    it('should maintain backward compatibility with existing Qloo API calls', async () => {
      // Mock successful API response
      mockRequestHandler.makeRequestWithRetry = vi.fn()
        .mockResolvedValue(['Test Item 1', 'Test Item 2']);
      mockRequestHandler.getCachedData = vi.fn().mockReturnValue(null);

      // Test that existing fetchData method still works as expected
      const result = await enrichment.fetchData('music', 30, 'Engineer', 'New York', 5);
      
      expect(result).toBeInstanceOf(Array);
      expect(result).toEqual(['Test Item 1', 'Test Item 2']);
      expect(mockRequestHandler.makeRequestWithRetry).toHaveBeenCalledTimes(1);

      console.log('✅ Task 2.3 Integration Verification: Backward compatibility maintained!');
    });

    it('should generate cultural insights using the integrated system', async () => {
      // Mock successful API responses
      mockRequestHandler.makeRequestWithRetry = vi.fn()
        .mockResolvedValue(['Integrated Item 1', 'Integrated Item 2']);
      mockRequestHandler.getCachedData = vi.fn().mockReturnValue(null);

      // Test cultural insight generation
      const insight = await enrichment.fetchCulturalInsight('music', mockPersona);

      expect(insight.category).toBe('music');
      expect(insight.items.length).toBeGreaterThan(0);
      expect(insight.metadata.source).toBe('qloo');
      expect(insight.analytics).toHaveProperty('preferences');
      expect(insight.analytics).toHaveProperty('behavioralInfluence');
      expect(insight.analytics).toHaveProperty('demographicAlignment');
      expect(insight.analytics).toHaveProperty('trends');

      console.log('✅ Task 2.3 Integration Verification: Cultural insights generation works!');
    });
  });
});