// Tests unitaires pour le QlooCacheManager
// Couvre les opérations de cache, TTL, invalidation et statistiques

import { 
  QlooCacheManager, 
  CacheKeyStrategy, 
  getQlooCacheManager,
  type CacheConfig,
  type CacheStats 
} from '@/lib/api/qloo-cache-manager';

describe('QlooCacheManager', () => {
  let cacheManager: QlooCacheManager;

  beforeEach(() => {
    cacheManager = new QlooCacheManager({
      defaultTtl: 1000, // 1 seconde pour les tests
      maxSize: 5,
      strategy: 'lru',
      ttlByType: {
        entities: 1000,
        tags: 2000,
        audiences: 3000,
        insights: 500,
        search: 1500,
      }
    });
  });

  describe('Configuration', () => {
    it('should use default configuration when none provided', () => {
      const defaultManager = new QlooCacheManager();
      const config = defaultManager.getConfig();
      
      expect(config.defaultTtl).toBe(3600000);
      expect(config.maxSize).toBe(1000);
      expect(config.strategy).toBe('lru');
      expect(config.ttlByType.entities).toBe(3600000);
    });

    it('should merge provided configuration with defaults', () => {
      const customManager = new QlooCacheManager({
        maxSize: 100,
        ttlByType: {
          entities: 5000,
          tags: 7200000,
          audiences: 86400000,
          insights: 1800000,
          search: 3600000,
        }
      });
      
      const config = customManager.getConfig();
      expect(config.maxSize).toBe(100);
      expect(config.ttlByType.entities).toBe(5000);
      expect(config.defaultTtl).toBe(3600000); // Should keep default
    });

    it('should update configuration', () => {
      cacheManager.updateConfig({ maxSize: 10 });
      const config = cacheManager.getConfig();
      expect(config.maxSize).toBe(10);
    });
  });

  describe('Basic Cache Operations', () => {
    it('should store and retrieve values', async () => {
      const key = 'test:key';
      const value = { data: 'test' };

      await cacheManager.set(key, value);
      const retrieved = await cacheManager.get(key);

      expect(retrieved).toEqual(value);
    });

    it('should return null for non-existent keys', async () => {
      const result = await cacheManager.get('non-existent');
      expect(result).toBeNull();
    });

    it('should handle different data types', async () => {
      const testCases = [
        { key: 'string', value: 'test string' },
        { key: 'number', value: 42 },
        { key: 'boolean', value: true },
        { key: 'array', value: [1, 2, 3] },
        { key: 'object', value: { nested: { data: 'value' } } },
        { key: 'null', value: null }
      ];

      for (const testCase of testCases) {
        await cacheManager.set(testCase.key, testCase.value);
        const retrieved = await cacheManager.get(testCase.key);
        expect(retrieved).toEqual(testCase.value);
      }
    });
  });

  describe('TTL Behavior', () => {
    it('should expire entries after TTL', async () => {
      const key = 'expire:test';
      const value = 'will expire';

      await cacheManager.set(key, value, 100); // 100ms TTL
      
      // Should be available immediately
      expect(await cacheManager.get(key)).toBe(value);
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should be expired
      expect(await cacheManager.get(key)).toBeNull();
    });

    it('should use type-specific TTL when no TTL provided', async () => {
      const entityKey = 'entity:brand:test';
      const tagKey = 'tags:category:test';
      
      await cacheManager.set(entityKey, 'entity data');
      await cacheManager.set(tagKey, 'tag data');
      
      // Both should be available initially
      expect(await cacheManager.get(entityKey)).toBe('entity data');
      expect(await cacheManager.get(tagKey)).toBe('tag data');
      
      // Wait for entity TTL to expire (1000ms) but not tag TTL (2000ms)
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      expect(await cacheManager.get(entityKey)).toBeNull();
      expect(await cacheManager.get(tagKey)).toBe('tag data');
    });

    it('should update access time on get', async () => {
      const key = 'access:test';
      await cacheManager.set(key, 'data', 200);
      
      // Access after 100ms
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(await cacheManager.get(key)).toBe('data');
      
      // Should still be available after another 150ms (total 250ms)
      // because TTL is from creation time, not last access
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(await cacheManager.get(key)).toBeNull();
    });
  });

  describe('Cache Eviction', () => {
    it('should evict LRU entries when cache is full', async () => {
      // Fill cache to max size
      for (let i = 0; i < 5; i++) {
        await cacheManager.set(`key${i}`, `value${i}`);
      }
      
      // Access key1 to make it recently used
      await cacheManager.get('key1');
      
      // Add one more entry, should evict key0 (least recently used)
      await cacheManager.set('key5', 'value5');
      
      expect(await cacheManager.get('key0')).toBeNull();
      expect(await cacheManager.get('key1')).toBe('value1');
      expect(await cacheManager.get('key5')).toBe('value5');
    });

    it('should handle FIFO eviction strategy', async () => {
      const fifoManager = new QlooCacheManager({
        maxSize: 3,
        strategy: 'fifo',
        defaultTtl: 10000
      });
      
      // Add entries
      await fifoManager.set('first', 'data1');
      await new Promise(resolve => setTimeout(resolve, 10)); // Ensure different timestamps
      await fifoManager.set('second', 'data2');
      await new Promise(resolve => setTimeout(resolve, 10));
      await fifoManager.set('third', 'data3');
      
      // Access first to make it recently used (shouldn't matter for FIFO)
      await fifoManager.get('first');
      
      // Add fourth entry, should evict 'first' (first in)
      await fifoManager.set('fourth', 'data4');
      
      expect(await fifoManager.get('first')).toBeNull();
      expect(await fifoManager.get('second')).toBe('data2');
      expect(await fifoManager.get('fourth')).toBe('data4');
    });

    it('should update existing entries without eviction', async () => {
      // Fill cache
      for (let i = 0; i < 5; i++) {
        await cacheManager.set(`key${i}`, `value${i}`);
      }
      
      // Update existing entry
      await cacheManager.set('key2', 'updated value');
      
      // All original entries should still exist
      for (let i = 0; i < 5; i++) {
        const value = await cacheManager.get(`key${i}`);
        expect(value).not.toBeNull();
        if (i === 2) {
          expect(value).toBe('updated value');
        }
      }
    });
  });

  describe('Cache Invalidation', () => {
    beforeEach(async () => {
      // Setup test data
      await cacheManager.set('entity:brand:nike', 'nike data');
      await cacheManager.set('entity:artist:taylor', 'taylor data');
      await cacheManager.set('tags:music:pop', 'pop tags');
      await cacheManager.set('tags:fashion:casual', 'casual tags');
      await cacheManager.set('insights:123', 'insights data');
    });

    it('should invalidate entries matching pattern', async () => {
      const invalidated = await cacheManager.invalidate('entity:*');
      
      expect(invalidated).toBe(2);
      expect(await cacheManager.get('entity:brand:nike')).toBeNull();
      expect(await cacheManager.get('entity:artist:taylor')).toBeNull();
      expect(await cacheManager.get('tags:music:pop')).toBe('pop tags');
    });

    it('should invalidate specific patterns', async () => {
      const invalidated = await cacheManager.invalidate('tags:music:.*');
      
      expect(invalidated).toBe(1);
      expect(await cacheManager.get('tags:music:pop')).toBeNull();
      expect(await cacheManager.get('tags:fashion:casual')).toBe('casual tags');
    });

    it('should invalidate by tags', async () => {
      // Set entries with tags
      await cacheManager.set('tagged1', 'data1', undefined, ['user:123', 'type:entity']);
      await cacheManager.set('tagged2', 'data2', undefined, ['user:456', 'type:entity']);
      await cacheManager.set('tagged3', 'data3', undefined, ['user:123', 'type:tag']);
      
      const invalidated = await cacheManager.invalidateByTags(['user:123']);
      
      expect(invalidated).toBe(2);
      expect(await cacheManager.get('tagged1')).toBeNull();
      expect(await cacheManager.get('tagged2')).toBe('data2');
      expect(await cacheManager.get('tagged3')).toBeNull();
    });

    it('should return correct invalidation count', async () => {
      const count1 = await cacheManager.invalidate('nonexistent:*');
      expect(count1).toBe(0);
      
      const count2 = await cacheManager.invalidate('tags:*');
      expect(count2).toBe(2);
    });
  });

  describe('Cache Cleanup', () => {
    it('should clean up expired entries', async () => {
      // Add entries with different TTLs
      await cacheManager.set('short', 'data1', 50);
      await cacheManager.set('medium', 'data2', 150);
      await cacheManager.set('long', 'data3', 300);
      
      // Wait for some to expire
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const cleaned = await cacheManager.cleanup();
      expect(cleaned).toBe(1); // Only 'short' should be expired
      
      expect(await cacheManager.get('short')).toBeNull();
      expect(await cacheManager.get('medium')).toBe('data2');
      expect(await cacheManager.get('long')).toBe('data3');
    });

    it('should update expiration stats during cleanup', async () => {
      await cacheManager.set('expire1', 'data', 50);
      await cacheManager.set('expire2', 'data', 50);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      await cacheManager.cleanup();
      
      const stats = cacheManager.getStats();
      expect(stats.expirations).toBe(2);
    });
  });

  describe('Cache Statistics', () => {
    it('should track hits and misses', async () => {
      await cacheManager.set('key1', 'value1');
      
      // Generate hits
      await cacheManager.get('key1');
      await cacheManager.get('key1');
      
      // Generate misses
      await cacheManager.get('nonexistent1');
      await cacheManager.get('nonexistent2');
      
      const stats = cacheManager.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(2);
      expect(stats.hitRate).toBe(0.5);
    });

    it('should track statistics by type', async () => {
      await cacheManager.set('entity:brand:test', 'entity data');
      await cacheManager.set('tags:music:test', 'tag data');
      
      // Generate hits for different types
      await cacheManager.get('entity:brand:test');
      await cacheManager.get('tags:music:test');
      await cacheManager.get('entity:brand:nonexistent');
      
      const stats = cacheManager.getStats();
      
      expect(stats.byType.entity.hits).toBe(1);
      expect(stats.byType.entity.misses).toBe(1);
      expect(stats.byType.entity.hitRate).toBe(0.5);
      
      expect(stats.byType.tags.hits).toBe(1);
      expect(stats.byType.tags.misses).toBe(0);
      expect(stats.byType.tags.hitRate).toBe(1);
    });

    it('should track cache size and entries', async () => {
      const initialStats = cacheManager.getStats();
      expect(initialStats.totalEntries).toBe(0);
      expect(initialStats.totalSize).toBe(0);
      
      await cacheManager.set('key1', 'small');
      await cacheManager.set('key2', { large: 'object with more data' });
      
      const stats = cacheManager.getStats();
      expect(stats.totalEntries).toBe(2);
      expect(stats.totalSize).toBeGreaterThan(0);
    });

    it('should track evictions', async () => {
      // Fill cache beyond capacity
      for (let i = 0; i < 7; i++) {
        await cacheManager.set(`key${i}`, `value${i}`);
      }
      
      const stats = cacheManager.getStats();
      expect(stats.evictions).toBe(2); // Should have evicted 2 entries
      expect(stats.totalEntries).toBe(5); // Max size
    });
  });

  describe('Cache Key Strategies', () => {
    it('should generate consistent entity keys', () => {
      const key1 = CacheKeyStrategy.entity('urn:entity:brand', 'Nike');
      const key2 = CacheKeyStrategy.entity('urn:entity:brand', 'nike'); // Different case
      const key3 = CacheKeyStrategy.entity('urn:entity:brand', 'Nike', { limit: 10 });
      
      expect(key1).toBe('entity:urn:entity:brand:nike');
      expect(key2).toBe('entity:urn:entity:brand:nike');
      expect(key3).toMatch(/^entity:urn:entity:brand:nike:[a-z0-9]+$/);
      expect(key1).toBe(key2); // Should normalize case
      expect(key1).not.toBe(key3); // Should include options hash
    });

    it('should generate consistent tag keys', () => {
      const key1 = CacheKeyStrategy.tags('music');
      const key2 = CacheKeyStrategy.tags('music', 'pop');
      const key3 = CacheKeyStrategy.tags(undefined, 'pop');
      
      expect(key1).toBe('tags:cat:music');
      expect(key2).toBe('tags:cat:music:q:pop');
      expect(key3).toBe('tags:q:pop');
    });

    it('should generate consistent audience keys', () => {
      const filters1 = { age_min: 18, age_max: 35 };
      const filters2 = { age_max: 35, age_min: 18 }; // Different order
      
      const key1 = CacheKeyStrategy.audiences(filters1);
      const key2 = CacheKeyStrategy.audiences(filters2);
      
      expect(key1).toBe(key2); // Should normalize object key order
    });

    it('should generate consistent insight keys', () => {
      const params1 = {
        'filter.type': 'urn:entity:brand' as const,
        'signal.interests.tags': ['music', 'fashion'],
        'signal.interests.entities': ['nike', 'adidas']
      };
      
      const params2 = {
        'signal.interests.entities': ['adidas', 'nike'], // Different order
        'filter.type': 'urn:entity:brand' as const,
        'signal.interests.tags': ['fashion', 'music'] // Different order
      };
      
      const key1 = CacheKeyStrategy.insights(params1);
      const key2 = CacheKeyStrategy.insights(params2);
      
      expect(key1).toBe(key2); // Should normalize arrays and key order
    });

    it('should generate consistent search keys', () => {
      const key1 = CacheKeyStrategy.search('Nike shoes', 'urn:entity:brand');
      const key2 = CacheKeyStrategy.search('nike shoes', 'urn:entity:brand'); // Different case
      const key3 = CacheKeyStrategy.search('Nike  shoes', 'urn:entity:brand'); // Extra spaces
      
      expect(key1).toBe(key2);
      expect(key1).toBe(key3);
      expect(key1).toBe('search:urn:entity:brand:nike_shoes');
    });
  });

  describe('Clear Cache', () => {
    it('should clear all cache data', async () => {
      // Use a fresh cache manager to avoid interference from other tests
      const freshCacheManager = new QlooCacheManager({
        defaultTtl: 10000,
        maxSize: 10,
        strategy: 'lru',
        ttlByType: {
          entities: 10000,
          tags: 10000,
          audiences: 10000,
          insights: 10000,
          search: 10000,
        }
      });
      
      // Add some data
      await freshCacheManager.set('key1', 'value1');
      await freshCacheManager.set('key2', 'value2');
      await freshCacheManager.get('key1'); // Generate some stats
      
      // Verify data exists before clearing
      expect(await freshCacheManager.get('key1')).toBe('value1');
      expect(await freshCacheManager.get('key2')).toBe('value2');
      
      await freshCacheManager.clear();
      
      // Check stats immediately after clearing (before any get operations)
      const stats = freshCacheManager.getStats();
      expect(stats.totalEntries).toBe(0);
      expect(stats.totalSize).toBe(0);
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      
      // Verify data is cleared (this will generate misses, but that's expected)
      expect(await freshCacheManager.get('key1')).toBeNull();
      expect(await freshCacheManager.get('key2')).toBeNull();
    });
  });

  describe('Default Instance', () => {
    it('should return singleton instance', () => {
      const instance1 = getQlooCacheManager();
      const instance2 = getQlooCacheManager();
      
      expect(instance1).toBe(instance2);
    });

    it('should maintain state across calls', async () => {
      const instance1 = getQlooCacheManager();
      await instance1.set('test', 'data');
      
      const instance2 = getQlooCacheManager();
      const result = await instance2.get('test');
      
      expect(result).toBe('data');
    });
  });

  describe('Edge Cases', () => {
    it('should handle circular references in data', async () => {
      const circular: any = { name: 'test' };
      circular.self = circular;
      
      // Should not throw, but size estimation might use fallback
      await expect(cacheManager.set('circular', circular)).resolves.not.toThrow();
    });

    it('should handle very large objects', async () => {
      const largeObject = {
        data: 'x'.repeat(10000),
        array: new Array(1000).fill('large data')
      };
      
      await cacheManager.set('large', largeObject);
      const retrieved = await cacheManager.get('large');
      
      expect(retrieved).toEqual(largeObject);
    });

    it('should handle undefined and null values', async () => {
      await cacheManager.set('undefined', undefined);
      await cacheManager.set('null', null);
      
      expect(await cacheManager.get('undefined')).toBeUndefined();
      expect(await cacheManager.get('null')).toBeNull();
    });

    it('should handle empty strings and objects', async () => {
      await cacheManager.set('empty-string', '');
      await cacheManager.set('empty-object', {});
      await cacheManager.set('empty-array', []);
      
      expect(await cacheManager.get('empty-string')).toBe('');
      expect(await cacheManager.get('empty-object')).toEqual({});
      expect(await cacheManager.get('empty-array')).toEqual([]);
    });
  });
});