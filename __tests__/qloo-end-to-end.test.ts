// End-to-end tests validating complete Qloo specification compliance
// Tests full integration flows and data consistency

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { QlooApiClient } from '@/lib/api/qloo';
import { QlooIntegrationService } from '@/lib/api/qloo-integration';
import { QlooCacheManager } from '@/lib/api/qloo-cache-manager';
import { QlooErrorHandler } from '@/lib/api/qloo-error-handler';
import { QlooMonitoringLogger } from '@/lib/api/qloo-monitoring-logger';
import type { EntityUrn, InsightsParams, QlooCompliantError } from '@/lib/types/qloo-compliant';
import type { BriefFormData } from '@/lib/types/persona';
import { QlooErrorType } from '@/lib/types/qloo-compliant';

// Mock fetch globally
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'test-uuid-e2e-123')
  }
});

describe('Qloo End-to-End Specification Compliance', () => {
  let apiClient: QlooApiClient;
  let integrationService: QlooIntegrationService;
  let cacheManager: QlooCacheManager;
  let errorHandler: QlooErrorHandler;
  let logger: QlooMonitoringLogger;
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
  const mockApiKey = 'test-e2e-api-key';

  beforeEach(() => {
    // Set up comprehensive test environment
    process.env.QLOO_API_KEY = mockApiKey;
    
    cacheManager = new QlooCacheManager({
      defaultTtl: 5000,
      maxSize: 50,
      strategy: 'lru'
    });
    
    errorHandler = new QlooErrorHandler();
    
    logger = new QlooMonitoringLogger({
      logLevel: 'error', // Only log errors in tests
      enableConsoleOutput: false
    });
    
    apiClient = new QlooApiClient({
      cacheManager,
      errorHandler,
      logger,
      timeout: 10000
    });
    
    integrationService = new QlooIntegrationService(mockApiKey, {
      enableCache: true,
      fallbackEnabled: true,
      confidenceThreshold: 0.6
    });

    mockFetch.mockClear();
  });

  afterEach(() => {
    delete process.env.QLOO_API_KEY;
    logger.stop();
  });

  describe('Complete Persona Enrichment Flow', () => {
    it('should execute full persona enrichment with all Qloo services', async () => {
      const mockBrief: BriefFormData = {
        description: 'Creative professional in the fashion industry who loves art and sustainable living',
        ageRange: '28-40',
        location: 'New York City',
        interests: ['fashion', 'art', 'sustainability', 'design'],
        values: ['creativity', 'authenticity', 'environmental responsibility'],
        generateMultiple: false
      };

      // Mock comprehensive API responses for full flow
      const mockResponses = {
        searchFashion: {
          entities: [
            { id: 'brand-gucci', name: 'Gucci', type: 'urn:entity:brand', confidence: 0.92 },
            { id: 'brand-stella', name: 'Stella McCartney', type: 'urn:entity:brand', confidence: 0.88 }
          ]
        },
        searchArt: {
          entities: [
            { id: 'artist-banksy', name: 'Banksy', type: 'urn:entity:artist', confidence: 0.85 },
            { id: 'museum-moma', name: 'MoMA', type: 'urn:entity:location', confidence: 0.80 }
          ]
        },
        tags: {
          tags: [
            { id: 'tag-fashion', name: 'Fashion', category: 'interests', weight: 0.9 },
            { id: 'tag-sustainable', name: 'Sustainable Fashion', category: 'lifestyle', weight: 0.85 },
            { id: 'tag-contemporary-art', name: 'Contemporary Art', category: 'interests', weight: 0.82 }
          ]
        },
        audiences: {
          audiences: [
            {
              id: 'audience-creative-prof',
              name: 'Creative Professionals',
              demographics: {
                age_range: { min: 25, max: 45 },
                location: { country: 'US', region: 'New York' },
                income_level: 'high',
                education_level: 'bachelor'
              },
              interests: ['fashion', 'art', 'design'],
              size: 180000
            }
          ]
        },
        insights: {
          entities: [
            { id: 'insight-prada', name: 'Prada', type: 'urn:entity:brand', confidence: 0.87 },
            { id: 'insight-vogue', name: 'Vogue', type: 'urn:entity:product', confidence: 0.83 },
            { id: 'insight-basquiat', name: 'Jean-Michel Basquiat', type: 'urn:entity:artist', confidence: 0.79 }
          ],
          tags: [
            { id: 'insight-tag-luxury', name: 'Luxury Fashion', category: 'lifestyle', weight: 0.88 },
            { id: 'insight-tag-eco', name: 'Eco-Conscious', category: 'values', weight: 0.86 }
          ],
          audiences: [
            { id: 'insight-audience-influencers', name: 'Fashion Influencers', size: 95000 }
          ],
          confidence: 0.84
        }
      };

      // Set up mock responses for different API calls
      mockFetch.mockImplementation((url) => {
        const urlStr = url as string;
        
        if (urlStr.includes('/search') && urlStr.includes('fashion')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => mockResponses.searchFashion,
            headers: new Headers()
          } as Response);
        } else if (urlStr.includes('/search') && urlStr.includes('art')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => mockResponses.searchArt,
            headers: new Headers()
          } as Response);
        } else if (urlStr.includes('/v2/tags')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => mockResponses.tags,
            headers: new Headers()
          } as Response);
        } else if (urlStr.includes('/v2/audiences')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => mockResponses.audiences,
            headers: new Headers()
          } as Response);
        } else if (urlStr.includes('/v2/insights')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => mockResponses.insights,
            headers: new Headers()
          } as Response);
        }
        
        return Promise.reject(new Error(`Unexpected URL: ${urlStr}`));
      });

      const result = await integrationService.enrichPersona(mockBrief);

      // Verify complete compliance with expected structure
      expect(result).toMatchObject({
        culturalInsights: {
          brands: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              name: expect.any(String),
              type: 'urn:entity:brand',
              confidence: expect.any(Number)
            })
          ]),
          music: expect.any(Array),
          movies: expect.any(Array),
          tvShows: expect.any(Array),
          books: expect.any(Array)
        },
        interests: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            category: expect.any(String),
            weight: expect.any(Number)
          })
        ]),
        demographics: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            demographics: expect.objectContaining({
              age_range: expect.objectContaining({
                min: expect.any(Number),
                max: expect.any(Number)
              }),
              location: expect.objectContaining({
                country: expect.any(String),
                region: expect.any(String)
              })
            }),
            size: expect.any(Number)
          })
        ]),
        confidence: expect.any(Number),
        sources: {
          qloo: true,
          fallback: false,
          cached: expect.any(Boolean)
        },
        metadata: expect.objectContaining({
          requestId: expect.any(String),
          processingTime: expect.any(Number),
          dataFlow: expect.arrayContaining([
            'entity_search',
            'tags_discovery',
            'audience_identification',
            'insights_generation'
          ]),
          errors: [],
          warnings: expect.any(Array)
        })
      });

      // Verify data quality requirements
      expect(result.confidence).toBeGreaterThan(0.6);
      expect(result.sources.qloo).toBe(true);
      expect(result.metadata.errors).toHaveLength(0);
      
      // Verify cultural insights categorization
      const totalBrands = result.culturalInsights.brands.length;
      expect(totalBrands).toBeGreaterThan(0);
      
      // Verify all brands have correct URN type
      result.culturalInsights.brands.forEach(brand => {
        expect(brand.type).toBe('urn:entity:brand');
        expect(brand.confidence).toBeGreaterThan(0.5);
      });

      // Verify interests are properly structured
      result.interests.forEach(interest => {
        expect(interest.id).toBeDefined();
        expect(interest.name).toBeDefined();
        expect(interest.category).toBeDefined();
        expect(typeof interest.weight).toBe('number');
        expect(interest.weight).toBeGreaterThan(0);
        expect(interest.weight).toBeLessThanOrEqual(1);
      });

      // Verify demographics compliance
      result.demographics.forEach(demographic => {
        expect(demographic.demographics?.age_range?.min).toBeGreaterThan(0);
        expect(demographic.demographics?.age_range?.max).toBeGreaterThan(demographic.demographics?.age_range?.min);
        expect(demographic.size).toBeGreaterThan(0);
      });
    });

    it('should handle complex error scenarios with proper recovery', async () => {
      const mockBrief: BriefFormData = {
        description: 'Music lover and tech enthusiast',
        ageRange: '22-32',
        location: 'Austin, Texas',
        interests: ['music', 'technology'],
        values: ['innovation'],
        generateMultiple: false
      };

      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        
        // First few calls fail with different error types
        if (callCount === 1) {
          return Promise.resolve({
            ok: false,
            status: 429,
            statusText: 'Too Many Requests',
            headers: new Headers({ 'Retry-After': '1' })
          } as Response);
        } else if (callCount === 2) {
          return Promise.resolve({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error'
          } as Response);
        } else if (callCount === 3) {
          // Network timeout
          const error = new Error('Request timeout');
          error.name = 'AbortError';
          return Promise.reject(error);
        } else {
          // Eventually succeed with minimal data
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({
              entities: [{ id: 'fallback-entity', name: 'Fallback Brand', type: 'urn:entity:brand' }],
              tags: [],
              audiences: []
            }),
            headers: new Headers()
          } as Response);
        }
      });

      const result = await integrationService.enrichPersona(mockBrief);

      // Should still provide a result using fallback mechanisms
      expect(result).toBeDefined();
      expect(result.sources.fallback).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.4); // Lower but acceptable
      expect(result.metadata.errors.length).toBeGreaterThan(0);
      expect(result.metadata.warnings).toContain('Using fallback data due to API error');
      
      // Should still have meaningful data
      expect(result.interests.length).toBeGreaterThan(0);
      expect(result.demographics.length).toBeGreaterThan(0);
      
      const totalCulturalItems = Object.values(result.culturalInsights)
        .reduce((sum, items) => sum + items.length, 0);
      expect(totalCulturalItems).toBeGreaterThan(0);
    });

    it('should demonstrate caching effectiveness across requests', async () => {
      const mockBrief: BriefFormData = {
        description: 'Fitness enthusiast and healthy living advocate',
        ageRange: '25-35',
        location: 'Los Angeles',
        interests: ['fitness', 'health', 'nutrition'],
        values: ['wellness'],
        generateMultiple: false
      };

      const mockResponse = {
        entities: [{ id: 'fitness-brand', name: 'Nike', type: 'urn:entity:brand' }],
        tags: [{ id: 'fitness-tag', name: 'Fitness', category: 'lifestyle' }],
        audiences: [{ id: 'fitness-audience', name: 'Fitness Enthusiasts', size: 500000 }],
        confidence: 0.8
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers()
      } as Response);

      // First request - should hit API
      const result1 = await integrationService.enrichPersona(mockBrief);
      const apiCallsAfterFirst = mockFetch.mock.calls.length;

      // Second identical request - should use cache
      const result2 = await integrationService.enrichPersona(mockBrief);
      const apiCallsAfterSecond = mockFetch.mock.calls.length;

      // Verify caching worked
      expect(apiCallsAfterSecond).toBe(apiCallsAfterFirst); // No additional API calls
      expect(result2.sources.cached).toBe(true);
      expect(result1.confidence).toBe(result2.confidence);
      
      // Verify cache statistics
      const cacheStats = cacheManager.getStats();
      expect(cacheStats.hits).toBeGreaterThan(0);
      expect(cacheStats.hitRate).toBeGreaterThan(0);
    });
  });

  describe('API Specification Compliance Validation', () => {
    it('should validate all required headers are sent', async () => {
      const mockResponse = { entities: [], tags: [], audiences: [] };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers()
      } as Response);

      await apiClient.searchEntities('test', 'urn:entity:brand');
      await apiClient.getTagsByCategory({ category: 'music' });
      await apiClient.getAudiences();
      await apiClient.getInsights({ 'filter.type': 'urn:entity:brand' });

      // Verify all calls include required headers
      mockFetch.mock.calls.forEach(call => {
        const options = call[1] as RequestInit;
        const headers = options.headers as Record<string, string>;
        
        expect(headers['X-API-Key']).toBe(mockApiKey);
        expect(headers['User-Agent']).toBe('PersonaCraft/1.0');
        expect(headers['Accept']).toBe('application/json');
        expect(headers['Content-Type']).toBe('application/json');
      });
    });

    it('should validate URL encoding compliance', async () => {
      const mockResponse = { entities: [] };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers()
      } as Response);

      // Test special characters and spaces
      await apiClient.searchEntities('Nike & Adidas', 'urn:entity:brand');
      
      const insightsParams: InsightsParams = {
        'filter.type': 'urn:entity:brand',
        'signal.interests.entities': ['brand with spaces', 'brand&special'],
        'signal.interests.tags': ['tag/with/slashes', 'tag with spaces']
      };
      await apiClient.getInsights(insightsParams);

      // Verify proper URL encoding
      const calls = mockFetch.mock.calls.map(call => call[0] as string);
      
      expect(calls.some(url => url.includes('Nike%20%26%20Adidas'))).toBe(true);
      expect(calls.some(url => url.includes('brand%20with%20spaces'))).toBe(true);
      expect(calls.some(url => url.includes('brand%26special'))).toBe(true);
      expect(calls.some(url => url.includes('tag%2Fwith%2Fslashes'))).toBe(true);
    });

    it('should validate response parsing compliance', async () => {
      // Test with various response formats that should be handled gracefully
      const testCases = [
        {
          name: 'complete response',
          response: {
            entities: [{ id: '1', name: 'Complete', type: 'urn:entity:brand', confidence: 0.9 }],
            tags: [{ id: '1', name: 'Tag', category: 'test', weight: 0.8 }],
            audiences: [{ id: '1', name: 'Audience', size: 1000 }]
          }
        },
        {
          name: 'minimal response',
          response: {
            entities: [{ id: '1', name: 'Minimal', type: 'urn:entity:brand' }]
          }
        },
        {
          name: 'empty arrays response',
          response: {
            entities: [],
            tags: [],
            audiences: []
          }
        }
      ];

      for (const testCase of testCases) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => testCase.response,
          headers: new Headers()
        } as Response);

        const result = await apiClient.getInsights({ 'filter.type': 'urn:entity:brand' });
        
        expect(result).toBeDefined();
        expect(result.entities).toBeInstanceOf(Array);
        expect(result.tags).toBeInstanceOf(Array);
        expect(result.audiences).toBeInstanceOf(Array);
        expect(typeof result.confidence).toBe('number');
        expect(result.metadata).toBeDefined();
        expect(result.status.success).toBe(true);
      }
    });

    it('should validate error response compliance', async () => {
      const errorTestCases = [
        { status: 400, expectedType: QlooErrorType.NETWORK_ERROR },
        { status: 401, expectedType: QlooErrorType.AUTHENTICATION },
        { status: 403, expectedType: QlooErrorType.AUTHORIZATION },
        { status: 404, expectedType: QlooErrorType.NOT_FOUND },
        { status: 422, expectedType: QlooErrorType.VALIDATION },
        { status: 429, expectedType: QlooErrorType.RATE_LIMIT },
        { status: 500, expectedType: QlooErrorType.SERVER_ERROR },
        { status: 503, expectedType: QlooErrorType.SERVER_ERROR }
      ];

      for (const testCase of errorTestCases) {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: testCase.status,
          statusText: `HTTP ${testCase.status}`,
          json: async () => ({ error: `Error ${testCase.status}` }),
          headers: new Headers()
        } as Response);

        try {
          await apiClient.searchEntities('test', 'urn:entity:brand');
          fail(`Expected error for status ${testCase.status}`);
        } catch (error) {
          const qlooError = error as QlooCompliantError;
          expect(qlooError.type).toBe(testCase.expectedType);
          expect(qlooError.code).toBeDefined();
          expect(qlooError.message).toBeDefined();
          expect(qlooError.request_id).toBeDefined();
          expect(qlooError.timestamp).toBeDefined();
        }
      }
    });
  });

  describe('Data Quality and Consistency Validation', () => {
    it('should maintain data consistency across service boundaries', async () => {
      const entityId = 'consistent-entity-123';
      const entityName = 'Consistent Brand';
      
      // Mock responses that should maintain consistency
      const searchResponse = {
        entities: [{ id: entityId, name: entityName, type: 'urn:entity:brand', confidence: 0.9 }]
      };
      
      const insightsResponse = {
        entities: [{ id: entityId, name: entityName, type: 'urn:entity:brand', confidence: 0.85 }],
        tags: [],
        audiences: [],
        confidence: 0.8
      };

      mockFetch.mockImplementation((url) => {
        const urlStr = url as string;
        if (urlStr.includes('/search')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => searchResponse,
            headers: new Headers()
          } as Response);
        } else if (urlStr.includes('/v2/insights')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => insightsResponse,
            headers: new Headers()
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ tags: [], audiences: [] }),
          headers: new Headers()
        } as Response);
      });

      // Search for entity
      const searchResult = await apiClient.searchEntities('Consistent Brand', 'urn:entity:brand');
      
      // Use entity in insights
      const insightsResult = await apiClient.getInsights({
        'filter.type': 'urn:entity:brand',
        'signal.interests.entities': [entityId]
      });

      // Verify consistency
      expect(searchResult.entities[0].id).toBe(entityId);
      expect(searchResult.entities[0].name).toBe(entityName);
      expect(insightsResult.entities[0].id).toBe(entityId);
      expect(insightsResult.entities[0].name).toBe(entityName);
    });

    it('should validate confidence score consistency', async () => {
      const mockResponse = {
        entities: [
          { id: '1', name: 'High Confidence', type: 'urn:entity:brand', confidence: 0.95 },
          { id: '2', name: 'Medium Confidence', type: 'urn:entity:brand', confidence: 0.75 },
          { id: '3', name: 'Low Confidence', type: 'urn:entity:brand', confidence: 0.45 }
        ],
        tags: [
          { id: '1', name: 'High Weight Tag', category: 'test', weight: 0.9 },
          { id: '2', name: 'Low Weight Tag', category: 'test', weight: 0.3 }
        ],
        audiences: [
          { id: '1', name: 'Large Audience', size: 1000000 },
          { id: '2', name: 'Small Audience', size: 10000 }
        ],
        confidence: 0.78
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers()
      } as Response);

      const result = await apiClient.getInsights({ 'filter.type': 'urn:entity:brand' });

      // Verify confidence scores are within valid ranges
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
      
      result.entities.forEach(entity => {
        expect(entity.confidence).toBeGreaterThan(0);
        expect(entity.confidence).toBeLessThanOrEqual(1);
      });
      
      result.tags.forEach(tag => {
        expect(tag.weight).toBeGreaterThan(0);
        expect(tag.weight).toBeLessThanOrEqual(1);
      });
      
      result.audiences.forEach(audience => {
        expect(audience.size).toBeGreaterThan(0);
      });
    });

    it('should validate entity URN format compliance', async () => {
      const validUrns: EntityUrn[] = [
        'urn:entity:brand',
        'urn:entity:artist',
        'urn:entity:movie',
        'urn:entity:tv_show',
        'urn:entity:book',
        'urn:entity:song',
        'urn:entity:album',
        'urn:entity:restaurant',
        'urn:entity:product',
        'urn:entity:location'
      ];

      for (const urn of validUrns) {
        const mockResponse = {
          entities: [{ id: 'test', name: 'Test Entity', type: urn, confidence: 0.8 }]
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse,
          headers: new Headers()
        } as Response);

        const result = await apiClient.searchEntities('test', urn);
        
        expect(result.entities[0].type).toBe(urn);
        expect(result.entities[0].type).toMatch(/^urn:entity:(brand|artist|movie|tv_show|book|song|album|restaurant|product|location)$/);
      }
    });
  });

  describe('Performance and Scalability Validation', () => {
    it('should handle concurrent requests efficiently', async () => {
      const mockResponse = { entities: [{ id: 'concurrent', name: 'Test', type: 'urn:entity:brand' }] };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers()
      } as Response);

      const concurrentRequests = 10;
      const promises: Promise<any>[] = [];

      const startTime = Date.now();

      // Make concurrent requests
      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(apiClient.searchEntities(`query${i}`, 'urn:entity:brand'));
      }

      const results = await Promise.all(promises);
      const endTime = Date.now();

      // All requests should succeed
      expect(results).toHaveLength(concurrentRequests);
      results.forEach(result => {
        expect(result.entities).toHaveLength(1);
        expect(result.status.success).toBe(true);
      });

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(5000);
    });

    it('should demonstrate memory efficiency with large datasets', async () => {
      // Create large mock response
      const largeResponse = {
        entities: Array.from({ length: 100 }, (_, i) => ({
          id: `entity-${i}`,
          name: `Entity ${i}`,
          type: 'urn:entity:brand' as EntityUrn,
          confidence: 0.8,
          metadata: { category: 'test', description: 'x'.repeat(1000) } // Large metadata
        })),
        tags: Array.from({ length: 50 }, (_, i) => ({
          id: `tag-${i}`,
          name: `Tag ${i}`,
          category: 'test',
          weight: 0.7
        })),
        audiences: Array.from({ length: 25 }, (_, i) => ({
          id: `audience-${i}`,
          name: `Audience ${i}`,
          size: 100000 + i * 1000
        }))
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => largeResponse,
        headers: new Headers()
      } as Response);

      const result = await apiClient.getInsights({ 'filter.type': 'urn:entity:brand' });

      // Should handle large response without issues
      expect(result.entities).toHaveLength(100);
      expect(result.tags).toHaveLength(50);
      expect(result.audiences).toHaveLength(25);
      
      // Verify all data is properly structured
      result.entities.forEach(entity => {
        expect(entity.id).toBeDefined();
        expect(entity.name).toBeDefined();
        expect(entity.type).toBe('urn:entity:brand');
      });
    });
  });
});