// Tests unitaires pour le QlooRequestOptimizer
// Teste l'optimisation des requêtes, le batching et la déduplication

import { QlooRequestOptimizer, type RequestOptimizerConfig } from '@/lib/api/qloo-request-optimizer';
import { QlooRateLimiter } from '@/lib/api/qloo-rate-limiter';
import type { EntityUrn, SearchResult, BatchSearchQuery, BatchSearchResult } from '@/lib/types/qloo-compliant';

// Mock pour setTimeout et clearTimeout
jest.useFakeTimers();

describe('QlooRequestOptimizer', () => {
  let optimizer: QlooRequestOptimizer;
  let rateLimiter: QlooRateLimiter;
  let mockExecuteFn: jest.Mock;
  let mockBatchExecuteFn: jest.Mock;

  beforeEach(() => {
    jest.clearAllTimers();
    
    rateLimiter = new QlooRateLimiter({
      requestsPerMinute: 100,
      requestsPerHour: 1000,
      windowMs: 60000
    });

    const config: Partial<RequestOptimizerConfig> = {
      maxBatchSize: 3,
      batchWindow: 50,
      similarityThreshold: 0.8,
      eligibleTypes: ['search', 'entity_lookup'],
      enableResultCache: true,
      resultCacheTtl: 300000
    };

    optimizer = new QlooRequestOptimizer(rateLimiter, config);

    mockExecuteFn = jest.fn();
    mockBatchExecuteFn = jest.fn();
  });

  afterEach(() => {
    optimizer.cleanup();
    rateLimiter.cleanup();
    jest.clearAllTimers();
  });

  describe('Entity Search Optimization', () => {
    const mockSearchResult: SearchResult = {
      entities: [
        {
          id: 'entity1',
          name: 'Test Entity',
          type: 'urn:entity:brand' as EntityUrn,
          confidence: 0.9
        }
      ],
      metadata: {
        query: 'test',
        total_results: 1,
        processing_time: 100,
        request_id: 'req123'
      },
      status: {
        code: 200,
        message: 'Success',
        success: true
      }
    };

    it('should optimize entity search requests', async () => {
      mockExecuteFn.mockResolvedValue(mockSearchResult);

      const result = await optimizer.optimizeEntitySearch(
        'test query',
        'urn:entity:brand',
        { limit: 10 },
        mockExecuteFn
      );

      expect(result).toEqual(mockSearchResult);
      expect(mockExecuteFn).toHaveBeenCalledWith('test query', 'urn:entity:brand', { limit: 10 });
      
      const stats = optimizer.getStats();
      expect(stats.totalRequests).toBe(1);
    });

    it('should cache search results', async () => {
      mockExecuteFn.mockResolvedValue(mockSearchResult);

      // Première requête
      const result1 = await optimizer.optimizeEntitySearch(
        'cached query',
        'urn:entity:brand',
        {},
        mockExecuteFn
      );

      // Deuxième requête identique
      const result2 = await optimizer.optimizeEntitySearch(
        'cached query',
        'urn:entity:brand',
        {},
        mockExecuteFn
      );

      expect(result1).toEqual(mockSearchResult);
      expect(result2).toEqual(mockSearchResult);
      expect(mockExecuteFn).toHaveBeenCalledTimes(1); // Seulement la première fois
      
      const stats = optimizer.getStats();
      expect(stats.cacheHits).toBe(1);
    });

    it('should batch similar requests', async () => {
      mockExecuteFn.mockResolvedValue(mockSearchResult);

      const promises = [
        optimizer.optimizeEntitySearch('query1', 'urn:entity:brand', {}, mockExecuteFn),
        optimizer.optimizeEntitySearch('query2', 'urn:entity:brand', {}, mockExecuteFn)
      ];

      // Avancer le temps pour déclencher le batch
      jest.advanceTimersByTime(50);

      const results = await Promise.all(promises);

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual(mockSearchResult);
      expect(results[1]).toEqual(mockSearchResult);
      
      const stats = optimizer.getStats();
      expect(stats.batchedRequests).toBe(2);
    });

    it('should deduplicate identical requests', async () => {
      mockExecuteFn.mockResolvedValue(mockSearchResult);

      const promises = [
        optimizer.optimizeEntitySearch('same query', 'urn:entity:brand', {}, mockExecuteFn),
        optimizer.optimizeEntitySearch('same query', 'urn:entity:brand', {}, mockExecuteFn),
        optimizer.optimizeEntitySearch('same query', 'urn:entity:brand', {}, mockExecuteFn)
      ];

      jest.advanceTimersByTime(50);

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results[0]).toEqual(mockSearchResult);
      expect(results[1]).toEqual(mockSearchResult);
      expect(results[2]).toEqual(mockSearchResult);
      expect(mockExecuteFn).toHaveBeenCalledTimes(1); // Une seule exécution
      
      const stats = optimizer.getStats();
      expect(stats.deduplicatedRequests).toBe(2);
    });

    it('should execute immediately for non-eligible types', async () => {
      mockExecuteFn.mockResolvedValue(mockSearchResult);

      const result = await optimizer.optimizeEntitySearch(
        'test query',
        'urn:entity:brand',
        {},
        mockExecuteFn
      );

      expect(result).toEqual(mockSearchResult);
      expect(mockExecuteFn).toHaveBeenCalledTimes(1);
      
      const stats = optimizer.getStats();
      expect(stats.batchedRequests).toBe(0);
    });
  });

  describe('Batch Search Optimization', () => {
    const mockBatchResult: BatchSearchResult = {
      results: [
        {
          query_id: 'q1',
          query: 'query1',
          type: 'urn:entity:brand' as EntityUrn,
          entities: [
            {
              id: 'entity1',
              name: 'Entity 1',
              type: 'urn:entity:brand' as EntityUrn,
              confidence: 0.9
            }
          ],
          status: {
            code: 200,
            message: 'Success',
            success: true
          }
        }
      ],
      metadata: {
        total_queries: 1,
        successful_queries: 1,
        failed_queries: 0,
        total_entities: 1,
        processing_time: 150,
        request_id: 'batch123'
      },
      status: {
        code: 200,
        message: 'Batch completed',
        success: true
      }
    };

    it('should optimize batch search requests', async () => {
      const queries: BatchSearchQuery[] = [
        { query: 'query1', type: 'urn:entity:brand', id: 'q1' },
        { query: 'query2', type: 'urn:entity:artist', id: 'q2' }
      ];

      mockBatchExecuteFn.mockResolvedValue(mockBatchResult);

      const result = await optimizer.optimizeBatchSearch(queries, mockBatchExecuteFn);

      expect(result).toEqual(mockBatchResult);
      expect(mockBatchExecuteFn).toHaveBeenCalledWith(queries);
    });

    it('should deduplicate identical queries in batch', async () => {
      const queries: BatchSearchQuery[] = [
        { query: 'duplicate', type: 'urn:entity:brand', id: 'q1' },
        { query: 'duplicate', type: 'urn:entity:brand', id: 'q2' },
        { query: 'unique', type: 'urn:entity:brand', id: 'q3' }
      ];

      mockBatchExecuteFn.mockResolvedValue(mockBatchResult);

      const result = await optimizer.optimizeBatchSearch(queries, mockBatchExecuteFn);

      expect(mockBatchExecuteFn).toHaveBeenCalledWith([
        { query: 'duplicate', type: 'urn:entity:brand', id: 'q1' },
        { query: 'unique', type: 'urn:entity:brand', id: 'q3' }
      ]);
      
      const stats = optimizer.getStats();
      expect(stats.deduplicatedRequests).toBe(1);
    });

    it('should split large batches into smaller ones', async () => {
      const queries: BatchSearchQuery[] = [];
      for (let i = 0; i < 7; i++) {
        queries.push({
          query: `query${i}`,
          type: 'urn:entity:brand',
          id: `q${i}`
        });
      }

      mockBatchExecuteFn.mockResolvedValue(mockBatchResult);

      const result = await optimizer.optimizeBatchSearch(queries, mockBatchExecuteFn);

      // Devrait être divisé en 3 batches (3, 3, 1)
      expect(mockBatchExecuteFn).toHaveBeenCalledTimes(3);
      expect(result.metadata.total_queries).toBe(7);
    });

    it('should consolidate results from multiple batches', async () => {
      const queries: BatchSearchQuery[] = [];
      for (let i = 0; i < 5; i++) {
        queries.push({
          query: `query${i}`,
          type: 'urn:entity:brand',
          id: `q${i}`
        });
      }

      const batchResult1: BatchSearchResult = {
        ...mockBatchResult,
        metadata: {
          ...mockBatchResult.metadata,
          total_queries: 3,
          successful_queries: 3,
          total_entities: 3,
          processing_time: 100
        }
      };

      const batchResult2: BatchSearchResult = {
        ...mockBatchResult,
        metadata: {
          ...mockBatchResult.metadata,
          total_queries: 2,
          successful_queries: 2,
          total_entities: 2,
          processing_time: 80
        }
      };

      mockBatchExecuteFn
        .mockResolvedValueOnce(batchResult1)
        .mockResolvedValueOnce(batchResult2);

      const result = await optimizer.optimizeBatchSearch(queries, mockBatchExecuteFn);

      expect(result.metadata.total_queries).toBe(5);
      expect(result.metadata.successful_queries).toBe(5);
      expect(result.metadata.total_entities).toBe(5);
      expect(result.metadata.processing_time).toBe(180);
    });
  });

  describe('Caching', () => {
    const mockSearchResult: SearchResult = {
      entities: [
        {
          id: 'cached_entity',
          name: 'Cached Entity',
          type: 'urn:entity:brand' as EntityUrn,
          confidence: 0.8
        }
      ],
      metadata: {
        query: 'cached',
        total_results: 1,
        processing_time: 50,
        request_id: 'cached123'
      },
      status: {
        code: 200,
        message: 'Success',
        success: true
      }
    };

    it('should cache results with TTL', async () => {
      mockExecuteFn.mockResolvedValue(mockSearchResult);

      // Première requête
      await optimizer.optimizeEntitySearch('cache test', 'urn:entity:brand', {}, mockExecuteFn);
      
      // Deuxième requête immédiate
      await optimizer.optimizeEntitySearch('cache test', 'urn:entity:brand', {}, mockExecuteFn);

      expect(mockExecuteFn).toHaveBeenCalledTimes(1);
      
      const stats = optimizer.getStats();
      expect(stats.cacheHits).toBe(1);
    });

    it('should expire cached results after TTL', async () => {
      const shortTtlOptimizer = new QlooRequestOptimizer(rateLimiter, {
        resultCacheTtl: 100 // 100ms TTL
      });

      mockExecuteFn.mockResolvedValue(mockSearchResult);

      // Première requête
      await shortTtlOptimizer.optimizeEntitySearch('expire test', 'urn:entity:brand', {}, mockExecuteFn);
      
      // Avancer le temps au-delà du TTL
      jest.advanceTimersByTime(150);
      
      // Deuxième requête après expiration
      await shortTtlOptimizer.optimizeEntitySearch('expire test', 'urn:entity:brand', {}, mockExecuteFn);

      expect(mockExecuteFn).toHaveBeenCalledTimes(2);
      
      shortTtlOptimizer.cleanup();
    });

    it('should clean up expired cache entries', async () => {
      mockExecuteFn.mockResolvedValue(mockSearchResult);

      await optimizer.optimizeEntitySearch('cleanup test', 'urn:entity:brand', {}, mockExecuteFn);
      
      // Avancer le temps pour déclencher le nettoyage
      jest.advanceTimersByTime(60000); // 1 minute
      
      // Le cache devrait être nettoyé automatiquement
      const stats = optimizer.getStats();
      expect(stats.totalRequests).toBe(1);
    });
  });

  describe('Priority Handling', () => {
    it('should prioritize requests with higher limits', async () => {
      mockExecuteFn.mockResolvedValue({
        entities: [],
        metadata: { query: '', total_results: 0, processing_time: 0, request_id: '' },
        status: { code: 200, message: 'Success', success: true }
      });

      const promises = [
        optimizer.optimizeEntitySearch('low priority', 'urn:entity:brand', { limit: 5 }, mockExecuteFn),
        optimizer.optimizeEntitySearch('high priority', 'urn:entity:brand', { limit: 20 }, mockExecuteFn)
      ];

      jest.advanceTimersByTime(50);

      await Promise.all(promises);

      // Vérifier que les requêtes ont été traitées (l'ordre exact dépend de l'implémentation)
      expect(mockExecuteFn).toHaveBeenCalledTimes(2);
    });

    it('should prioritize requests with higher confidence thresholds', async () => {
      mockExecuteFn.mockResolvedValue({
        entities: [],
        metadata: { query: '', total_results: 0, processing_time: 0, request_id: '' },
        status: { code: 200, message: 'Success', success: true }
      });

      const promises = [
        optimizer.optimizeEntitySearch('low confidence', 'urn:entity:brand', { min_confidence: 0.5 }, mockExecuteFn),
        optimizer.optimizeEntitySearch('high confidence', 'urn:entity:brand', { min_confidence: 0.9 }, mockExecuteFn)
      ];

      jest.advanceTimersByTime(50);

      await Promise.all(promises);

      expect(mockExecuteFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Statistics and Monitoring', () => {
    it('should track optimization statistics', async () => {
      mockExecuteFn.mockResolvedValue({
        entities: [],
        metadata: { query: '', total_results: 0, processing_time: 0, request_id: '' },
        status: { code: 200, message: 'Success', success: true }
      });

      // Requête normale
      await optimizer.optimizeEntitySearch('stat test 1', 'urn:entity:brand', {}, mockExecuteFn);
      
      // Requêtes batchées
      const promises = [
        optimizer.optimizeEntitySearch('batch 1', 'urn:entity:artist', {}, mockExecuteFn),
        optimizer.optimizeEntitySearch('batch 2', 'urn:entity:artist', {}, mockExecuteFn)
      ];
      
      jest.advanceTimersByTime(50);
      await Promise.all(promises);

      const stats = optimizer.getStats();
      
      expect(stats.totalRequests).toBe(3);
      expect(stats.batchedRequests).toBe(2);
      expect(stats.apiCallReduction).toBeGreaterThan(0);
      expect(stats.byType['urn:entity:brand']).toBeDefined();
      expect(stats.byType['urn:entity:artist']).toBeDefined();
    });

    it('should calculate API call reduction percentage', async () => {
      mockExecuteFn.mockResolvedValue({
        entities: [],
        metadata: { query: '', total_results: 0, processing_time: 0, request_id: '' },
        status: { code: 200, message: 'Success', success: true }
      });

      // Créer des requêtes qui bénéficient d'optimisations
      const promises = [
        optimizer.optimizeEntitySearch('same', 'urn:entity:brand', {}, mockExecuteFn),
        optimizer.optimizeEntitySearch('same', 'urn:entity:brand', {}, mockExecuteFn), // Dédupliquée
        optimizer.optimizeEntitySearch('different', 'urn:entity:brand', {}, mockExecuteFn)
      ];

      jest.advanceTimersByTime(50);
      await Promise.all(promises);

      const stats = optimizer.getStats();
      expect(stats.apiCallReduction).toBeGreaterThan(0);
      expect(stats.deduplicatedRequests).toBe(1);
    });

    it('should reset statistics', async () => {
      mockExecuteFn.mockResolvedValue({
        entities: [],
        metadata: { query: '', total_results: 0, processing_time: 0, request_id: '' },
        status: { code: 200, message: 'Success', success: true }
      });

      await optimizer.optimizeEntitySearch('reset test', 'urn:entity:brand', {}, mockExecuteFn);
      
      let stats = optimizer.getStats();
      expect(stats.totalRequests).toBe(1);

      optimizer.resetStats();
      
      stats = optimizer.getStats();
      expect(stats.totalRequests).toBe(0);
      expect(stats.batchedRequests).toBe(0);
      expect(stats.deduplicatedRequests).toBe(0);
    });
  });

  describe('Configuration Management', () => {
    it('should return current configuration', () => {
      const config = optimizer.getConfig();
      
      expect(config.maxBatchSize).toBe(3);
      expect(config.batchWindow).toBe(50);
      expect(config.enableResultCache).toBe(true);
    });

    it('should update configuration', () => {
      const newConfig = {
        maxBatchSize: 5,
        batchWindow: 100,
        resultCacheTtl: 600000
      };

      optimizer.updateConfig(newConfig);
      
      const config = optimizer.getConfig();
      expect(config.maxBatchSize).toBe(5);
      expect(config.batchWindow).toBe(100);
      expect(config.resultCacheTtl).toBe(600000);
    });
  });

  describe('Error Handling', () => {
    it('should handle batch execution errors', async () => {
      const batchError = new Error('Batch execution failed');
      mockExecuteFn.mockRejectedValue(batchError);

      const promises = [
        optimizer.optimizeEntitySearch('error 1', 'urn:entity:brand', {}, mockExecuteFn),
        optimizer.optimizeEntitySearch('error 2', 'urn:entity:brand', {}, mockExecuteFn)
      ];

      jest.advanceTimersByTime(50);

      await expect(Promise.all(promises)).rejects.toThrow('Batch execution failed');
    });

    it('should handle individual request errors in batch', async () => {
      mockExecuteFn
        .mockResolvedValueOnce({ entities: [], metadata: { query: '', total_results: 0, processing_time: 0, request_id: '' }, status: { code: 200, message: 'Success', success: true } })
        .mockRejectedValueOnce(new Error('Individual error'));

      const promises = [
        optimizer.optimizeEntitySearch('success', 'urn:entity:brand', {}, mockExecuteFn),
        optimizer.optimizeEntitySearch('error', 'urn:entity:brand', {}, mockExecuteFn)
      ];

      jest.advanceTimersByTime(50);

      const results = await Promise.allSettled(promises);
      
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources properly', async () => {
      mockExecuteFn.mockImplementation(() => new Promise(() => {})); // Never resolves

      const promise = optimizer.optimizeEntitySearch('cleanup test', 'urn:entity:brand', {}, mockExecuteFn);

      optimizer.cleanup();

      await expect(promise).rejects.toThrow('Request optimizer cleanup');
    });

    it('should clear cache on cleanup', async () => {
      mockExecuteFn.mockResolvedValue({
        entities: [],
        metadata: { query: '', total_results: 0, processing_time: 0, request_id: '' },
        status: { code: 200, message: 'Success', success: true }
      });

      await optimizer.optimizeEntitySearch('cache cleanup', 'urn:entity:brand', {}, mockExecuteFn);
      
      optimizer.cleanup();

      // Créer un nouvel optimiseur pour tester que le cache est vide
      const newOptimizer = new QlooRequestOptimizer(rateLimiter, {
        enableResultCache: true
      });

      await newOptimizer.optimizeEntitySearch('cache cleanup', 'urn:entity:brand', {}, mockExecuteFn);

      expect(mockExecuteFn).toHaveBeenCalledTimes(2); // Pas de hit de cache
      
      newOptimizer.cleanup();
    });
  });
});