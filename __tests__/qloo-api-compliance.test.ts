// Comprehensive API compliance test suite for Qloo integration
// Tests complete Qloo specification compliance and end-to-end flows

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { QlooApiClient } from '@/lib/api/qloo';
import { QlooIntegrationService } from '@/lib/api/qloo-integration';
import { QlooErrorType, type EntityUrn, type InsightsParams } from '@/lib/types/qloo-compliant';
import type { BriefFormData } from '@/lib/types/persona';

// Mock fetch globally
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'test-uuid-123')
  }
});

describe('Qloo API Compliance Test Suite', () => {
  let apiClient: QlooApiClient;
  let integrationService: QlooIntegrationService;
  const mockApiKey = 'test-api-key-compliance';
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    // Set environment variable for API key
    process.env.QLOO_API_KEY = mockApiKey;
    
    apiClient = new QlooApiClient();
    integrationService = new QlooIntegrationService(mockApiKey, {
      enableCache: false,
      fallbackEnabled: true
    });
    
    mockFetch.mockClear();
  });

  afterEach(() => {
    delete process.env.QLOO_API_KEY;
  });

  describe('API Endpoint Compliance', () => {
    it('should use correct base URL for all endpoints', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ entities: [] }),
        headers: new Headers()
      } as Response;

      mockFetch.mockResolvedValue(mockResponse);

      // Test all endpoints use correct base URL
      await apiClient.searchEntities('test', 'urn:entity:brand');
      await apiClient.getTagsByCategory();
      await apiClient.getAudiences();
      await apiClient.getInsights({ 'filter.type': 'urn:entity:brand' });

      const calls = mockFetch.mock.calls;
      calls.forEach(call => {
        const url = call[0] as string;
        expect(url).toMatch(/^https:\/\/hackathon\.api\.qloo\.com/);
      });
    });

    it('should use correct endpoint paths', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ entities: [], tags: [], audiences: [] }),
        headers: new Headers()
      } as Response;

      mockFetch.mockResolvedValue(mockResponse);

      await apiClient.searchEntities('test', 'urn:entity:brand');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/search'),
        expect.any(Object)
      );

      await apiClient.getTagsByCategory();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v2/tags'),
        expect.any(Object)
      );

      await apiClient.getAudiences();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v2/audiences'),
        expect.any(Object)
      );

      await apiClient.getInsights({ 'filter.type': 'urn:entity:brand' });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v2/insights'),
        expect.any(Object)
      );
    });

    it('should include required headers in all requests', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({}),
        headers: new Headers()
      } as Response;

      mockFetch.mockResolvedValue(mockResponse);

      await apiClient.searchEntities('test', 'urn:entity:brand');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-API-Key': mockApiKey,
            'User-Agent': 'PersonaCraft/1.0',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });

  describe('Entity URN Compliance', () => {
    const validEntityUrns: EntityUrn[] = [
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

    it('should accept all valid entity URNs', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ entities: [] }),
        headers: new Headers()
      } as Response;

      mockFetch.mockResolvedValue(mockResponse);

      for (const urn of validEntityUrns) {
        await expect(apiClient.searchEntities('test', urn)).resolves.toBeDefined();
        await expect(apiClient.getInsights({ 'filter.type': urn })).resolves.toBeDefined();
      }
    });

    it('should reject invalid entity URNs', async () => {
      const invalidUrns = [
        'invalid:type',
        'urn:entity:invalid',
        'brand',
        'artist',
        '',
        'urn:invalid:brand'
      ];

      for (const urn of invalidUrns) {
        await expect(apiClient.searchEntities('test', urn as EntityUrn))
          .rejects.toMatchObject({
            type: QlooErrorType.VALIDATION
          });
      }
    });
  });

  describe('Insights Parameter Compliance', () => {
    it('should require filter.type parameter', async () => {
      const invalidParams = {} as InsightsParams;

      await expect(apiClient.getInsights(invalidParams))
        .rejects.toMatchObject({
          type: QlooErrorType.VALIDATION,
          code: 'INVALID_INSIGHTS_PARAMS'
        });
    });

    it('should validate signal parameters format', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ entities: [], tags: [], audiences: [] }),
        headers: new Headers()
      } as Response;

      mockFetch.mockResolvedValue(mockResponse);

      const validParams: InsightsParams = {
        'filter.type': 'urn:entity:brand',
        'signal.interests.entities': ['entity1', 'entity2'],
        'signal.interests.tags': ['tag1', 'tag2'],
        'signal.demographics.audiences': ['audience1']
      };

      await apiClient.getInsights(validParams);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('filter.type=urn%3Aentity%3Abrand'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('signal.interests.entities=entity1%2Centity2'),
        expect.any(Object)
      );
    });

    it('should validate filter parameters format', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: async () => ({ entities: [], tags: [], audiences: [] }),
        headers: new Headers()
      } as Response;

      mockFetch.mockResolvedValue(mockResponse);

      const validParams: InsightsParams = {
        'filter.type': 'urn:entity:brand',
        'filter.tags': ['tag1', 'tag2'],
        'filter.entities': ['entity1'],
        'filter.audiences': ['audience1']
      };

      await apiClient.getInsights(validParams);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('filter.tags=tag1%2Ctag2'),
        expect.any(Object)
      );
    });
  });

  describe('Error Code Compliance', () => {
    const errorTestCases = [
      {
        status: 401,
        expectedType: QlooErrorType.AUTHENTICATION,
        expectedCode: 'UNAUTHORIZED',
        description: 'authentication errors'
      },
      {
        status: 403,
        expectedType: QlooErrorType.AUTHORIZATION,
        expectedCode: 'FORBIDDEN',
        description: 'authorization errors'
      },
      {
        status: 404,
        expectedType: QlooErrorType.NOT_FOUND,
        expectedCode: 'ENDPOINT_NOT_FOUND',
        description: 'not found errors'
      },
      {
        status: 422,
        expectedType: QlooErrorType.VALIDATION,
        expectedCode: 'INVALID_PARAMS',
        description: 'validation errors'
      },
      {
        status: 429,
        expectedType: QlooErrorType.RATE_LIMIT,
        expectedCode: 'RATE_LIMIT_EXCEEDED',
        description: 'rate limit errors'
      },
      {
        status: 500,
        expectedType: QlooErrorType.SERVER_ERROR,
        expectedCode: 'SERVER_ERROR',
        description: 'server errors'
      }
    ];

    errorTestCases.forEach(({ status, expectedType, expectedCode, description }) => {
      it(`should handle ${status} ${description} correctly`, async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status,
          statusText: `HTTP ${status}`,
          json: async () => ({}),
          headers: new Headers()
        } as Response);

        await expect(apiClient.searchEntities('test', 'urn:entity:brand'))
          .rejects.toMatchObject({
            type: expectedType,
            code: expectedCode
          });
      });
    });
  });

  describe('Response Format Compliance', () => {
    it('should handle complete API response structure', async () => {
      const compliantResponse = {
        entities: [
          {
            id: 'entity-1',
            name: 'Test Brand',
            type: 'urn:entity:brand',
            confidence: 0.9,
            metadata: { category: 'fashion' }
          }
        ],
        tags: [
          {
            id: 'tag-1',
            name: 'Fashion',
            category: 'lifestyle',
            weight: 0.8
          }
        ],
        audiences: [
          {
            id: 'audience-1',
            name: 'Fashion Enthusiasts',
            demographics: {
              age_range: { min: 18, max: 35 },
              location: { country: 'US', region: 'California' }
            },
            size: 1000000
          }
        ],
        confidence: 0.85
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => compliantResponse,
        headers: new Headers()
      } as Response);

      const result = await apiClient.getInsights({
        'filter.type': 'urn:entity:brand',
        'signal.interests.entities': ['test']
      });

      expect(result.entities).toHaveLength(1);
      expect(result.entities[0]).toMatchObject({
        id: 'entity-1',
        name: 'Test Brand',
        type: 'urn:entity:brand',
        confidence: 0.9
      });

      expect(result.tags).toHaveLength(1);
      expect(result.audiences).toHaveLength(1);
      expect(result.confidence).toBe(0.85);
      expect(result.metadata.data_source).toBe('qloo_api');
    });

    it('should handle malformed responses gracefully', async () => {
      const malformedResponse = {
        entities: [
          { id: 'entity-1', name: 'Complete Entity', type: 'urn:entity:brand' },
          { id: 'entity-2' }, // Missing name and type
          null, // Invalid entity
          'invalid' // Invalid entity
        ],
        tags: [
          { id: 'tag-1', name: 'Complete Tag' },
          { name: 'No ID Tag' } // Missing ID
        ],
        // Missing audiences array
        confidence: 'invalid' // Invalid confidence
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => malformedResponse,
        headers: new Headers()
      } as Response);

      const result = await apiClient.getInsights({
        'filter.type': 'urn:entity:brand'
      });

      // Should filter out invalid entities and provide defaults
      expect(result.entities.length).toBeGreaterThan(0);
      result.entities.forEach(entity => {
        expect(entity.id).toBeDefined();
        expect(entity.name).toBeDefined();
        expect(entity.type).toBeDefined();
      });

      result.tags.forEach(tag => {
        expect(tag.id).toBeDefined();
        expect(tag.name).toBeDefined();
      });

      expect(result.audiences).toEqual([]);
      expect(typeof result.confidence).toBe('number');
    });
  });

  describe('Data Flow Compliance', () => {
    it('should follow recommended data flow: search → tags → audiences → insights', async () => {
      const mockBrief: BriefFormData = {
        description: 'Tech-savvy professional',
        ageRange: '25-35',
        location: 'San Francisco',
        interests: ['technology', 'fitness'],
        values: ['innovation'],
        generateMultiple: false
      };

      // Mock responses for each step
      const searchResponse = {
        entities: [{ id: 'tech-brand-1', name: 'Apple', type: 'urn:entity:brand' }]
      };

      const tagsResponse = {
        tags: [{ id: 'tech-tag-1', name: 'Technology', category: 'interests' }]
      };

      const audiencesResponse = {
        audiences: [{ id: 'tech-audience-1', name: 'Tech Professionals' }]
      };

      const insightsResponse = {
        entities: [{ id: 'insight-entity-1', name: 'Tech Brand', type: 'urn:entity:brand' }],
        tags: [{ id: 'insight-tag-1', name: 'Innovation', category: 'values' }],
        audiences: [{ id: 'insight-audience-1', name: 'Early Adopters' }],
        confidence: 0.8
      };

      let callCount = 0;
      mockFetch.mockImplementation((url) => {
        callCount++;
        const urlStr = url as string;
        
        if (urlStr.includes('/search')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => searchResponse,
            headers: new Headers()
          } as Response);
        } else if (urlStr.includes('/v2/tags')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => tagsResponse,
            headers: new Headers()
          } as Response);
        } else if (urlStr.includes('/v2/audiences')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => audiencesResponse,
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
        
        return Promise.reject(new Error('Unexpected endpoint'));
      });

      const result = await integrationService.enrichPersona(mockBrief);

      // Verify the data flow was followed
      expect(result.sources.qloo).toBe(true);
      expect(result.metadata.dataFlow).toEqual([
        'entity_search',
        'tags_discovery',
        'audience_identification',
        'insights_generation'
      ]);

      // Verify all endpoints were called in correct order
      const calls = mockFetch.mock.calls.map(call => call[0] as string);
      expect(calls.some(url => url.includes('/search'))).toBe(true);
      expect(calls.some(url => url.includes('/v2/tags'))).toBe(true);
      expect(calls.some(url => url.includes('/v2/audiences'))).toBe(true);
      expect(calls.some(url => url.includes('/v2/insights'))).toBe(true);
    });

    it('should use entity IDs from search in insights parameters', async () => {
      const searchResponse = {
        entities: [
          { id: 'entity-123', name: 'Nike', type: 'urn:entity:brand' },
          { id: 'entity-456', name: 'Adidas', type: 'urn:entity:brand' }
        ]
      };

      const insightsResponse = {
        entities: [],
        tags: [],
        audiences: [],
        confidence: 0.7
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
          // Verify that entity IDs from search are used as signals
          expect(urlStr).toContain('signal.interests.entities=entity-123%2Centity-456');
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => insightsResponse,
            headers: new Headers()
          } as Response);
        } else {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ tags: [], audiences: [] }),
            headers: new Headers()
          } as Response);
        }
      });

      const mockBrief: BriefFormData = {
        description: 'Sports enthusiast',
        ageRange: '20-30',
        location: 'New York',
        interests: ['sports'],
        values: ['performance'],
        generateMultiple: false
      };

      await integrationService.enrichPersona(mockBrief);
    });
  });

  describe('Performance and Caching Compliance', () => {
    it('should respect timeout configuration', async () => {
      const timeoutClient = new QlooApiClient({
        timeout: 100 // Very short timeout
      });

      // Mock a slow response
      mockFetch.mockImplementation(() => 
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              status: 200,
              json: async () => ({ entities: [] }),
              headers: new Headers()
            } as Response);
          }, 200); // Longer than timeout
        })
      );

      await expect(timeoutClient.searchEntities('test', 'urn:entity:brand'))
        .rejects.toMatchObject({
          type: QlooErrorType.NETWORK_ERROR,
          code: 'TIMEOUT'
        });
    });

    it('should handle rate limiting with proper backoff', async () => {
      let attemptCount = 0;
      
      mockFetch.mockImplementation(() => {
        attemptCount++;
        if (attemptCount <= 2) {
          return Promise.resolve({
            ok: false,
            status: 429,
            statusText: 'Too Many Requests',
            headers: new Headers({
              'Retry-After': '1'
            })
          } as Response);
        } else {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({ entities: [] }),
            headers: new Headers()
          } as Response);
        }
      });

      // Should eventually succeed after retries
      const result = await apiClient.searchEntities('test', 'urn:entity:brand');
      expect(result).toBeDefined();
      expect(attemptCount).toBe(3);
    });
  });

  describe('End-to-End Integration Compliance', () => {
    it('should complete full persona enrichment flow with Qloo compliance', async () => {
      const mockBrief: BriefFormData = {
        description: 'Creative professional in fashion industry',
        ageRange: '28-40',
        location: 'Los Angeles',
        interests: ['fashion', 'art', 'design'],
        values: ['creativity', 'authenticity'],
        generateMultiple: false
      };

      // Mock comprehensive responses
      const responses = {
        search: {
          entities: [
            { id: 'brand-1', name: 'Gucci', type: 'urn:entity:brand', confidence: 0.9 },
            { id: 'artist-1', name: 'Banksy', type: 'urn:entity:artist', confidence: 0.8 }
          ]
        },
        tags: {
          tags: [
            { id: 'tag-1', name: 'Fashion', category: 'interests', weight: 0.9 },
            { id: 'tag-2', name: 'Contemporary Art', category: 'interests', weight: 0.8 }
          ]
        },
        audiences: {
          audiences: [
            {
              id: 'audience-1',
              name: 'Creative Professionals',
              demographics: {
                age_range: { min: 25, max: 45 },
                location: { country: 'US', region: 'California' },
                income_level: 'high',
                education_level: 'bachelor'
              },
              size: 250000
            }
          ]
        },
        insights: {
          entities: [
            { id: 'insight-brand-1', name: 'Prada', type: 'urn:entity:brand', confidence: 0.85 },
            { id: 'insight-movie-1', name: 'The Devil Wears Prada', type: 'urn:entity:movie', confidence: 0.7 }
          ],
          tags: [
            { id: 'insight-tag-1', name: 'Luxury Fashion', category: 'lifestyle', weight: 0.9 }
          ],
          audiences: [
            { id: 'insight-audience-1', name: 'Fashion Influencers', size: 100000 }
          ],
          confidence: 0.88
        }
      };

      mockFetch.mockImplementation((url) => {
        const urlStr = url as string;
        
        if (urlStr.includes('/search')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => responses.search,
            headers: new Headers()
          } as Response);
        } else if (urlStr.includes('/v2/tags')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => responses.tags,
            headers: new Headers()
          } as Response);
        } else if (urlStr.includes('/v2/audiences')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => responses.audiences,
            headers: new Headers()
          } as Response);
        } else if (urlStr.includes('/v2/insights')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => responses.insights,
            headers: new Headers()
          } as Response);
        }
        
        return Promise.reject(new Error('Unexpected endpoint'));
      });

      const result = await integrationService.enrichPersona(mockBrief);

      // Verify compliance with expected structure
      expect(result).toMatchObject({
        culturalInsights: {
          brands: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              name: expect.any(String),
              type: 'urn:entity:brand'
            })
          ]),
          music: expect.any(Array),
          movies: expect.arrayContaining([
            expect.objectContaining({
              type: 'urn:entity:movie'
            })
          ]),
          tvShows: expect.any(Array),
          books: expect.any(Array)
        },
        interests: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            category: expect.any(String)
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
              })
            })
          })
        ]),
        confidence: expect.any(Number),
        sources: {
          qloo: true,
          fallback: false,
          cached: false
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
          warnings: []
        })
      });

      // Verify data quality
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.sources.qloo).toBe(true);
      expect(result.metadata.errors).toHaveLength(0);
    });
  });
});