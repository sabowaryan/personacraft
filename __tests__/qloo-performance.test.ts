// Performance tests for Qloo API integration
// Tests caching, rate limiting, and performance optimizations

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { QlooApiClient } from '@/lib/api/qloo';
import { QlooCacheManager } from '@/lib/api/qloo-cache-manager';
import { QlooRateLimiter } from '@/lib/api/qloo-rate-limiter';
import { QlooRequestOptimizer } from '@/lib/api/qloo-request-optimizer';
import type { EntityUrn, InsightsParams } from '@/lib/types/qloo-compliant';

// Mock fetch globally
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Mock performance.now for consistent timing
const mockPerformanceNow = jest.fn();
Object.defineProperty(global, 'performance', {
  value: { now: mockPerformanceNow }
});

describe('Qloo Performance Test Suite', () => {
  let apiClient: QlooApiClient;
  let cacheManager: QlooCacheManager;
  let rateLimiter: QlooRateLimiter;
  let requestOptimizer: QlooRequestOptimizer;
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    // Set up fresh instances for each test
    process.env.QLOO_API_KEY = 'test-performance-key';
    
    cacheManager = new QlooCacheManager({
      defaultTtl: 1000, // 1 second for fast tests
      maxSize: 100,
      strategy: 'lru'
    });
    
    rateLimiter = new QlooRateLimiter({
      requestsPerSecond: 10,
      burstLimit: 20,
      windowSizeMs: 1000
    });
    
    requestOptimizer = new QlooRequestOptimizer({
      batchSize: 5,
      batchDelayMs: 100,
      enableDeduplication: true
    });
    
    apiClient = new QlooApiClient({
      cacheManager,
      rateLimiter,
      requestOptimizer
    });

    mockFetch.mockClear();
    mockPerformanceNow.mockClear();
    
    // Mock performance.now to return predictable values
    let timeCounter = 0;
    mockPerformanceNow.mockImplementation(() => {
      timeCounter += 100; // Each call advances by 100ms
      return timeCounter;
    });
  });

  afterEach(() => {
    delete process.env.QLOO_API_KEY;
  });

  describe('Cache Performance', () => {
    it('should cache API responses and improve subsequent request times', async () => {
      const mockResponse = {
        entities: [{ id: 'entity-1', name: 'Test Entity', type: 'urn:entity:brand' }]
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers()
      } as Response);

      // First request - should hit API
      const start1 = Date.now();
      const result1 = await apiClient.searchEntities('test query', 'urn:entity:brand');
      const end1 = Date.now();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result1.entities).toHaveLength(1);

      // Second request - should hit cache
      const start2 = Date.now();
      const result2 = await apiClient.searchEntities('test query', 'urn:entity:brand');
      const end2 = Date.now();

      // Should not make another API call
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result2.entities).toHaveLength(1);
      
      // Cache hit should be faster (though timing can be unreliable in tests)
      expect(result2.metadata.cached).toBe(true);
      
      // Verify cache stats
      const cacheStats = cacheManager.getStats();
      expect(cacheStats.hits).toBe(1);
      expect(cacheStats.misses).toBe(1);
      expect(cacheStats.hitRate).toBe(0.5);
    });

    it('should handle cache TTL expiration correctly', async () => {
      const mockResponse = {
        entities: [{ id: 'entity-1', name: 'Test Entity', type: 'urn:entity:brand' }]
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers()
      } as Response);

      // First request
      await apiClient.searchEntities('test query', 'urn:entity:brand');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Second request after expiration - should hit API again
      await apiClient.searchEntities('test query', 'urn:entity:brand');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should use different cache keys for different parameters', async () => {
      const mockResponse = {
        entities: [{ id: 'entity-1', name: 'Test Entity', type: 'urn:entity:brand' }]
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers()
      } as Response);

      // Different queries should not share cache
      await apiClient.searchEntities('query1', 'urn:entity:brand');
      await apiClient.searchEntities('query2', 'urn:entity:brand');
      await apiClient.searchEntities('query1', 'urn:entity:artist'); // Different type

      expect(mockFetch).toHaveBeenCalledTimes(3);

      // Same query should use cache
      await apiClient.searchEntities('query1', 'urn:entity:brand');
      expect(mockFetch).toHaveBeenCalledTimes(3); // No additional call
    });

    it('should handle cache invalidation patterns', async () => {
      const mockResponse = { entities: [] };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers()
      } as Response);

      // Cache multiple entity searches
      await apiClient.searchEntities('nike', 'urn:entity:brand');
      await apiClient.searchEntities('adidas', 'urn:entity:brand');
      await apiClient.searchEntities('taylor swift', 'urn:entity:artist');

      expect(mockFetch).toHaveBeenCalledTimes(3);

      // Invalidate all brand entities
      await cacheManager.invalidate('search:urn:entity:brand:.*');

      // Brand searches should hit API again, artist should use cache
      await apiClient.searchEntities('nike', 'urn:entity:brand');
      await apiClient.searchEntities('taylor swift', 'urn:entity:artist');

      expect(mockFetch).toHaveBeenCalledTimes(4); // Only one additional call for nike
    });

    it('should track cache performance metrics', async () => {
      const mockResponse = { entities: [] };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers()
      } as Response);

      // Generate cache hits and misses
      await apiClient.searchEntities('query1', 'urn:entity:brand'); // miss
      await apiClient.searchEntities('query2', 'urn:entity:brand'); // miss
      await apiClient.searchEntities('query1', 'urn:entity:brand'); // hit
      await apiClient.searchEntities('query2', 'urn:entity:brand'); // hit
      await apiClient.searchEntities('query1', 'urn:entity:brand'); // hit

      const stats = cacheManager.getStats();
      expect(stats.hits).toBe(3);
      expect(stats.misses).toBe(2);
      expect(stats.hitRate).toBe(0.6);
      expect(stats.totalEntries).toBe(2);
    });
  });

  describe('Rate Limiting Performance', () => {
    it('should respect rate limits and queue requests', async () => {
      const mockResponse = { entities: [] };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers()
      } as Response);

      const startTime = Date.now();
      const promises: Promise<any>[] = [];

      // Make 15 requests (exceeds rate limit of 10/second)
      for (let i = 0; i < 15; i++) {
        promises.push(apiClient.searchEntities(`query${i}`, 'urn:entity:brand'));
      }

      await Promise.all(promises);
      const endTime = Date.now();

      // Should have taken at least 1 second due to rate limiting
      expect(endTime - startTime).toBeGreaterThan(900);
      expect(mockFetch).toHaveBeenCalledTimes(15);
    });

    it('should handle burst requests within burst limit', async () => {
      const mockResponse = { entities: [] };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers()
      } as Response);

      const startTime = Date.now();
      const promises: Promise<any>[] = [];

      // Make requests within burst limit (20)
      for (let i = 0; i < 15; i++) {
        promises.push(apiClient.searchEntities(`query${i}`, 'urn:entity:brand'));
      }

      await Promise.all(promises);
      const endTime = Date.now();

      // Should complete quickly within burst allowance
      expect(endTime - startTime).toBeLessThan(500);
      expect(mockFetch).toHaveBeenCalledTimes(15);
    });

    it('should recover from rate limit errors', async () => {
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          return Promise.resolve({
            ok: false,
            status: 429,
            statusText: 'Too Many Requests',
            headers: new Headers({ 'Retry-After': '1' })
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ entities: [] }),
          headers: new Headers()
        } as Response);
      });

      const result = await apiClient.searchEntities('test', 'urn:entity:brand');
      
      expect(result).toBeDefined();
      expect(callCount).toBe(3); // Should retry after rate limit errors
    });

    it('should track rate limiting metrics', async () => {
      const mockResponse = { entities: [] };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers()
      } as Response);

      // Make several requests to trigger rate limiting
      const promises: Promise<any>[] = [];
      for (let i = 0; i < 25; i++) {
        promises.push(apiClient.searchEntities(`query${i}`, 'urn:entity:brand'));
      }

      await Promise.all(promises);

      const stats = rateLimiter.getStats();
      expect(stats.totalRequests).toBe(25);
      expect(stats.queuedRequests).toBeGreaterThan(0);
      expect(stats.averageWaitTime).toBeGreaterThan(0);
    });
  });

  describe('Request Optimization Performance', () => {
    it('should batch similar requests together', async () => {
      const mockResponse = { entities: [] };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers()
      } as Response);

      // Make multiple similar requests quickly
      const promises = [
        apiClient.searchEntities('nike', 'urn:entity:brand'),
        apiClient.searchEntities('adidas', 'urn:entity:brand'),
        apiClient.searchEntities('puma', 'urn:entity:brand'),
        apiClient.searchEntities('reebok', 'urn:entity:brand')
      ];

      await Promise.all(promises);

      // Should batch requests and make fewer API calls
      expect(mockFetch).toHaveBeenCalledTimes(1);
      
      // Verify batch request format
      const batchCall = mockFetch.mock.calls[0];
      const url = batchCall[0] as string;
      expect(url).toContain('q=nike%2Cadidas%2Cpuma%2Creebok');
    });

    it('should deduplicate identical requests', async () => {
      const mockResponse = { entities: [] };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers()
      } as Response);

      // Make identical requests simultaneously
      const promises = [
        apiClient.searchEntities('nike', 'urn:entity:brand'),
        apiClient.searchEntities('nike', 'urn:entity:brand'),
        apiClient.searchEntities('nike', 'urn:entity:brand')
      ];

      const results = await Promise.all(promises);

      // Should only make one API call
      expect(mockFetch).toHaveBeenCalledTimes(1);
      
      // All promises should resolve with same result
      expect(results[0]).toEqual(results[1]);
      expect(results[1]).toEqual(results[2]);
    });

    it('should optimize insights requests with multiple signals', async () => {
      const mockResponse = {
        entities: [],
        tags: [],
        audiences: [],
        confidence: 0.7
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers()
      } as Response);

      const params1: InsightsParams = {
        'filter.type': 'urn:entity:brand',
        'signal.interests.entities': ['entity1', 'entity2']
      };

      const params2: InsightsParams = {
        'filter.type': 'urn:entity:brand',
        'signal.interests.entities': ['entity3', 'entity4']
      };

      // Make requests that can be optimized
      const promises = [
        apiClient.getInsights(params1),
        apiClient.getInsights(params2)
      ];

      await Promise.all(promises);

      // Should optimize by combining signals
      expect(mockFetch).toHaveBeenCalledTimes(1);
      
      const call = mockFetch.mock.calls[0];
      const url = call[0] as string;
      expect(url).toContain('signal.interests.entities=entity1%2Centity2%2Centity3%2Centity4');
    });

    it('should track optimization metrics', async () => {
      const mockResponse = { entities: [] };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers()
      } as Response);

      // Make requests that trigger optimization
      await Promise.all([
        apiClient.searchEntities('nike', 'urn:entity:brand'),
        apiClient.searchEntities('adidas', 'urn:entity:brand'),
        apiClient.searchEntities('nike', 'urn:entity:brand'), // Duplicate
        apiClient.searchEntities('puma', 'urn:entity:brand')
      ]);

      const stats = requestOptimizer.getStats();
      expect(stats.totalRequests).toBe(4);
      expect(stats.batchedRequests).toBeGreaterThan(0);
      expect(stats.deduplicatedRequests).toBe(1); // One duplicate
      expect(stats.optimizationRatio).toBeGreaterThan(0);
    });
  });

  describe('Memory Performance', () => {
    it('should manage cache memory usage effectively', async () => {
      const smallCacheManager = new QlooCacheManager({
        maxSize: 5, // Very small cache
        defaultTtl: 10000
      });

      const clientWithSmallCache = new QlooApiClient({
        cacheManager: smallCacheManager
      });

      const mockResponse = { entities: [] };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers()
      } as Response);

      // Fill cache beyond capacity
      for (let i = 0; i < 10; i++) {
        await clientWithSmallCache.searchEntities(`query${i}`, 'urn:entity:brand');
      }

      const stats = smallCacheManager.getStats();
      expect(stats.totalEntries).toBeLessThanOrEqual(5);
      expect(stats.evictions).toBeGreaterThan(0);
    });

    it('should clean up expired entries automatically', async () => {
      const shortTtlCache = new QlooCacheManager({
        defaultTtl: 100, // Very short TTL
        maxSize: 100
      });

      const clientWithShortTtl = new QlooApiClient({
        cacheManager: shortTtlCache
      });

      const mockResponse = { entities: [] };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers()
      } as Response);

      // Add entries to cache
      await clientWithShortTtl.searchEntities('query1', 'urn:entity:brand');
      await clientWithShortTtl.searchEntities('query2', 'urn:entity:brand');

      expect(shortTtlCache.getStats().totalEntries).toBe(2);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      // Trigger cleanup
      await shortTtlCache.cleanup();

      expect(shortTtlCache.getStats().totalEntries).toBe(0);
      expect(shortTtlCache.getStats().expirations).toBe(2);
    });
  });

  describe('Concurrent Request Performance', () => {
    it('should handle high concurrency without degradation', async () => {
      const mockResponse = { entities: [] };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers()
      } as Response);

      const concurrentRequests = 50;
      const promises: Promise<any>[] = [];

      const startTime = Date.now();

      // Make many concurrent requests
      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(apiClient.searchEntities(`query${i}`, 'urn:entity:brand'));
      }

      const results = await Promise.all(promises);
      const endTime = Date.now();

      // All requests should complete successfully
      expect(results).toHaveLength(concurrentRequests);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.entities).toBeDefined();
      });

      // Should complete within reasonable time (accounting for rate limiting)
      expect(endTime - startTime).toBeLessThan(10000); // 10 seconds max
    });

    it('should maintain cache consistency under concurrent access', async () => {
      const mockResponse = { entities: [{ id: 'test', name: 'Test' }] };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers()
      } as Response);

      // Make concurrent requests for same data
      const promises = Array(10).fill(0).map(() => 
        apiClient.searchEntities('same query', 'urn:entity:brand')
      );

      const results = await Promise.all(promises);

      // Should only make one API call due to deduplication/caching
      expect(mockFetch).toHaveBeenCalledTimes(1);
      
      // All results should be identical
      results.forEach(result => {
        expect(result.entities[0].name).toBe('Test');
      });
    });
  });

  describe('Performance Monitoring', () => {
    it('should track response times accurately', async () => {
      const mockResponse = { entities: [] };
      
      // Mock slow response
      mockFetch.mockImplementation(() => 
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              status: 200,
              json: async () => mockResponse,
              headers: new Headers()
            } as Response);
          }, 200);
        })
      );

      const result = await apiClient.searchEntities('test', 'urn:entity:brand');

      expect(result.metadata.processing_time).toBeGreaterThan(150);
      expect(result.metadata.processing_time).toBeLessThan(300);
    });

    it('should provide comprehensive performance statistics', async () => {
      const mockResponse = { entities: [] };
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
        headers: new Headers()
      } as Response);

      // Generate various operations
      await apiClient.searchEntities('query1', 'urn:entity:brand');
      await apiClient.searchEntities('query1', 'urn:entity:brand'); // Cache hit
      await apiClient.getTagsByCategory({ category: 'music' });
      await apiClient.getInsights({ 'filter.type': 'urn:entity:brand' });

      const stats = apiClient.getPerformanceStats();
      
      expect(stats).toMatchObject({
        totalRequests: expect.any(Number),
        cacheHitRate: expect.any(Number),
        averageResponseTime: expect.any(Number),
        rateLimitingEvents: expect.any(Number),
        optimizationSavings: expect.any(Number)
      });

      expect(stats.totalRequests).toBeGreaterThan(0);
      expect(stats.cacheHitRate).toBeGreaterThanOrEqual(0);
      expect(stats.averageResponseTime).toBeGreaterThan(0);
    });
  });
});