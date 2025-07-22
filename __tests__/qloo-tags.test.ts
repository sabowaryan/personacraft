// Tests unitaires pour le service de gestion des tags Qloo
// Couvre toutes les méthodes et scénarios d'erreur

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { QlooTagsService, type TagsByCategoryParams } from '@/lib/api/qloo-tags';
import type { TagSearchParams } from '@/lib/types/qloo-compliant';
import { QlooErrorType } from '@/lib/types/qloo-compliant';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'test-uuid-123')
  }
});

describe('QlooTagsService', () => {
  let tagsService: QlooTagsService;
  const mockApiKey = 'test-api-key';
  const mockBaseUrl = 'https://hackathon.api.qloo.com';

  beforeEach(() => {
    tagsService = new QlooTagsService(mockApiKey, mockBaseUrl, 5000);
    mockFetch.mockClear();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getTagsByCategory', () => {
    const mockTagsResponse = {
      tags: [
        {
          id: 'tag_1',
          name: 'Electronic Music',
          category: 'music',
          weight: 0.8,
          description: 'Electronic music genre',
          parent_tags: [],
          child_tags: ['tag_2', 'tag_3']
        },
        {
          id: 'tag_2',
          name: 'House Music',
          category: 'music',
          weight: 0.7,
          description: 'House music subgenre',
          parent_tags: ['tag_1'],
          child_tags: []
        }
      ]
    };

    it('should successfully retrieve tags by category', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTagsResponse,
        headers: new Headers()
      } as Response);

      const params: TagsByCategoryParams = {
        category: 'music',
        limit: 10,
        language: 'en'
      };

      const result = await tagsService.getTagsByCategory(params);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://hackathon.api.qloo.com/v2/tags?category=music&limit=10&language=en',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'X-API-Key': mockApiKey,
            'User-Agent': 'PersonaCraft/1.0',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          })
        })
      );

      expect(result).toEqual({
        tags: [
          {
            id: 'tag_1',
            name: 'Electronic Music',
            category: 'music',
            weight: 0.8,
            description: 'Electronic music genre',
            parent_tags: [],
            child_tags: ['tag_2', 'tag_3']
          },
          {
            id: 'tag_2',
            name: 'House Music',
            category: 'music',
            weight: 0.7,
            description: 'House music subgenre',
            parent_tags: ['tag_1'],
            child_tags: []
          }
        ],
        metadata: {
          category: 'music',
          total_results: 2,
          processing_time: expect.any(Number),
          request_id: 'test-uuid-123'
        },
        status: {
          code: 200,
          message: 'Tags retrieved successfully',
          success: true
        }
      });
    });

    it('should work with empty parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTagsResponse,
        headers: new Headers()
      } as Response);

      const result = await tagsService.getTagsByCategory();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://hackathon.api.qloo.com/v2/tags',
        expect.any(Object)
      );

      expect(result.tags).toHaveLength(2);
      expect(result.status.success).toBe(true);
    });

    it('should handle empty response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tags: [] }),
        headers: new Headers()
      } as Response);

      const result = await tagsService.getTagsByCategory({ category: 'nonexistent' });

      expect(result.tags).toEqual([]);
      expect(result.metadata.total_results).toBe(0);
      expect(result.status.success).toBe(true);
    });

    it('should handle 401 authentication error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({})
      } as Response);

      await expect(tagsService.getTagsByCategory()).rejects.toMatchObject({
        type: QlooErrorType.AUTHENTICATION,
        code: 'UNAUTHORIZED',
        message: 'Invalid API key for tags endpoint'
      });
    });

    it('should handle 403 authorization error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({})
      } as Response);

      await expect(tagsService.getTagsByCategory()).rejects.toMatchObject({
        type: QlooErrorType.AUTHORIZATION,
        code: 'FORBIDDEN',
        message: 'API key does not have permission to access tags'
      });
    });

    it('should handle 429 rate limit error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        json: async () => ({})
      } as Response);

      await expect(tagsService.getTagsByCategory()).rejects.toMatchObject({
        type: QlooErrorType.RATE_LIMIT,
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Rate limit exceeded for tags endpoint',
        retryable: true
      });
    });

    it('should handle timeout error', async () => {
      // Mock fetch to simulate a timeout by rejecting with AbortError
      mockFetch.mockRejectedValueOnce(new DOMException('AbortError', 'AbortError'));

      await expect(tagsService.getTagsByCategory()).rejects.toMatchObject({
        type: QlooErrorType.NETWORK_ERROR,
        code: 'TIMEOUT',
        message: 'Request timeout after 5000ms'
      });
    });
  });

  describe('searchTags', () => {
    const mockSearchResponse = {
      tags: [
        {
          id: 'search_tag_1',
          name: 'Jazz Music',
          category: 'music',
          weight: 0.9
        }
      ]
    };

    it('should successfully search tags', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResponse,
        headers: new Headers()
      } as Response);

      const params: TagSearchParams = {
        query: 'jazz',
        category: 'music',
        limit: 5,
        language: 'en'
      };

      const result = await tagsService.searchTags(params);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://hackathon.api.qloo.com/v2/tags?q=jazz&category=music&limit=5&language=en',
        expect.any(Object)
      );

      expect(result.tags).toHaveLength(1);
      expect(result.tags[0].name).toBe('Jazz Music');
      expect(result.metadata.query).toBe('jazz');
      expect(result.metadata.category).toBe('music');
    });

    it('should handle search without query parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResponse,
        headers: new Headers()
      } as Response);

      const params: TagSearchParams = {
        category: 'music',
        limit: 10
      };

      const result = await tagsService.searchTags(params);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://hackathon.api.qloo.com/v2/tags?category=music&limit=10',
        expect.any(Object)
      );

      expect(result.metadata.query).toBeUndefined();
      expect(result.metadata.category).toBe('music');
    });

    it('should handle malformed tag data', async () => {
      const malformedResponse = {
        tags: [
          {
            id: 'tag_1',
            // Missing name
            category: 'music'
          },
          {
            // Missing id
            name: 'Some Tag',
            category: 'music'
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => malformedResponse,
        headers: new Headers()
      } as Response);

      const result = await tagsService.searchTags({ query: 'test' });

      expect(result.tags).toHaveLength(2);
      expect(result.tags[0].name).toBe('Unknown Tag');
      expect(result.tags[1].id).toBe('test-uuid-123'); // Mocked UUID
    });
  });

  describe('validateTagIds', () => {
    it('should validate tag IDs successfully', async () => {
      const mockValidationResponse = {
        tags: [
          { id: 'valid_tag_1', name: 'Valid Tag 1', category: 'music' },
          { id: 'valid_tag_2', name: 'Valid Tag 2', category: 'movies' }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockValidationResponse,
        headers: new Headers()
      } as Response);

      const tagIds = ['valid_tag_1', 'valid_tag_2', 'invalid_tag_1'];
      const result = await tagsService.validateTagIds(tagIds);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://hackathon.api.qloo.com/v2/tags?ids=valid_tag_1%2Cvalid_tag_2%2Cinvalid_tag_1',
        expect.any(Object)
      );

      expect(result).toEqual({
        valid_ids: ['valid_tag_1', 'valid_tag_2'],
        invalid_ids: ['invalid_tag_1'],
        found_tags: [
          { id: 'valid_tag_1', name: 'Valid Tag 1', category: 'music' },
          { id: 'valid_tag_2', name: 'Valid Tag 2', category: 'movies' }
        ],
        metadata: {
          total_checked: 3,
          valid_count: 2,
          invalid_count: 1,
          processing_time: expect.any(Number),
          request_id: 'test-uuid-123'
        },
        status: {
          code: 200,
          message: 'Validated 3 tag IDs',
          success: true,
          warnings: ['1 invalid tag IDs found']
        }
      });
    });

    it('should handle empty tag IDs array', async () => {
      const result = await tagsService.validateTagIds([]);

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toEqual({
        valid_ids: [],
        invalid_ids: [],
        found_tags: [],
        metadata: {
          total_checked: 0,
          valid_count: 0,
          invalid_count: 0,
          processing_time: expect.any(Number),
          request_id: 'test-uuid-123'
        },
        status: {
          code: 200,
          message: 'No tag IDs provided for validation',
          success: true,
          warnings: ['Empty tag IDs array provided']
        }
      });
    });

    it('should handle large batch of tag IDs', async () => {
      // Create 75 tag IDs to test batching (batch size is 50)
      const tagIds = Array.from({ length: 75 }, (_, i) => `tag_${i}`);
      
      // Mock first batch response (50 tags)
      const firstBatchResponse = {
        tags: Array.from({ length: 25 }, (_, i) => ({
          id: `tag_${i}`,
          name: `Tag ${i}`,
          category: 'test'
        }))
      };

      // Mock second batch response (25 tags)
      const secondBatchResponse = {
        tags: Array.from({ length: 10 }, (_, i) => ({
          id: `tag_${i + 50}`,
          name: `Tag ${i + 50}`,
          category: 'test'
        }))
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => firstBatchResponse,
          headers: new Headers()
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => secondBatchResponse,
          headers: new Headers()
        } as Response);

      const result = await tagsService.validateTagIds(tagIds);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.metadata.total_checked).toBe(75);
      expect(result.valid_ids).toHaveLength(35); // 25 + 10
      expect(result.invalid_ids).toHaveLength(40); // 75 - 35
    });

    it('should handle validation error gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await tagsService.validateTagIds(['tag_1', 'tag_2']);

      expect(result.valid_ids).toEqual([]);
      expect(result.invalid_ids).toEqual(['tag_1', 'tag_2']);
      expect(result.found_tags).toEqual([]);
      expect(result.metadata.valid_count).toBe(0);
      expect(result.metadata.invalid_count).toBe(2);
    });

    it('should handle all valid tag IDs', async () => {
      const mockResponse = {
        tags: [
          { id: 'tag_1', name: 'Tag 1', category: 'music' },
          { id: 'tag_2', name: 'Tag 2', category: 'movies' }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers()
      } as Response);

      const result = await tagsService.validateTagIds(['tag_1', 'tag_2']);

      expect(result.valid_ids).toEqual(['tag_1', 'tag_2']);
      expect(result.invalid_ids).toEqual([]);
      expect(result.status.warnings).toBeUndefined();
    });
  });

  describe('getSupportedCategories', () => {
    it('should return list of supported categories', () => {
      const categories = tagsService.getSupportedCategories();

      expect(categories).toContain('music');
      expect(categories).toContain('movies');
      expect(categories).toContain('books');
      expect(categories).toContain('brands');
      expect(categories).toContain('lifestyle');
      expect(categories).toContain('food');
      expect(categories).toContain('travel');
      expect(categories).toContain('technology');
      expect(categories).toContain('sports');
      expect(categories).toContain('fashion');
      expect(categories).toContain('art');
      expect(categories).toContain('culture');
      expect(categories).toContain('entertainment');
      expect(categories).toContain('business');
      expect(categories).toContain('health');
      expect(categories).toContain('education');
    });
  });

  describe('validateCategory', () => {
    it('should validate supported categories', () => {
      expect(tagsService.validateCategory('music')).toBe(true);
      expect(tagsService.validateCategory('MUSIC')).toBe(true); // Case insensitive
      expect(tagsService.validateCategory('movies')).toBe(true);
      expect(tagsService.validateCategory('books')).toBe(true);
    });

    it('should reject unsupported categories', () => {
      expect(tagsService.validateCategory('invalid_category')).toBe(false);
      expect(tagsService.validateCategory('random')).toBe(false);
      expect(tagsService.validateCategory('')).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 not found error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({})
      } as Response);

      await expect(tagsService.getTagsByCategory()).rejects.toMatchObject({
        type: QlooErrorType.NOT_FOUND,
        code: 'ENDPOINT_NOT_FOUND',
        message: 'Tags endpoint not found'
      });
    });

    it('should handle 422 validation error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: async () => ({})
      } as Response);

      await expect(tagsService.searchTags({ query: 'test' })).rejects.toMatchObject({
        type: QlooErrorType.VALIDATION,
        code: 'INVALID_PARAMS',
        message: 'Invalid parameters for tags request'
      });
    });

    it('should handle 500 server error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({})
      } as Response);

      await expect(tagsService.getTagsByCategory()).rejects.toMatchObject({
        type: QlooErrorType.SERVER_ERROR,
        code: 'SERVER_ERROR',
        message: 'Server error on tags endpoint: 500 Internal Server Error',
        retryable: true
      });
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network connection failed'));

      await expect(tagsService.getTagsByCategory()).rejects.toMatchObject({
        type: QlooErrorType.SERVER_ERROR,
        code: 'TAGS_OPERATION_FAILED',
        message: "Tags operation 'getTagsByCategory' failed: Network connection failed"
      });
    });

    it('should handle malformed JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); },
        headers: new Headers()
      } as Response);

      await expect(tagsService.searchTags({ query: 'test' })).rejects.toMatchObject({
        type: QlooErrorType.SERVER_ERROR,
        code: 'TAGS_OPERATION_FAILED',
        message: "Tags operation 'searchTags' failed: Invalid JSON"
      });
    });
  });

  describe('Request Headers and Authentication', () => {
    it('should include correct headers in requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tags: [] }),
        headers: new Headers()
      } as Response);

      await tagsService.getTagsByCategory();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'GET',
          headers: {
            'X-API-Key': mockApiKey,
            'User-Agent': 'PersonaCraft/1.0',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
      );
    });

    it('should use correct base URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tags: [] }),
        headers: new Headers()
      } as Response);

      await tagsService.getTagsByCategory();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('https://hackathon.api.qloo.com/v2/tags'),
        expect.any(Object)
      );
    });
  });
});