interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  totalRequests: number;
  hitRate: number;
  size: number;
  memoryUsage: number;
}

export class OptimizedCache {
  private cache = new Map<string, CacheEntry>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    hitRate: 0,
    size: 0,
    memoryUsage: 0
  };
  private maxSize: number;
  private defaultTTL: number;
  private cleanupInterval: NodeJS.Timeout;

  constructor(maxSize = 1000, defaultTTL = 3600000) { // 1 hour default
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Generate optimized cache key with better normalization
   */
  generateKey(params: {
    entityType: string;
    age?: number;
    location?: string;
    occupation?: string;
    interests?: string[];
    values?: string[];
    take?: number;
  }): string {
    const {
      entityType,
      age,
      location,
      occupation,
      interests = [],
      values = [],
      take = 5
    } = params;

    // Normalize age to ranges for better cache hits
    const ageRange = age ? Math.floor(age / 10) * 10 : 'any';
    
    // Normalize location to main region
    const normalizedLocation = location 
      ? location.toLowerCase().split(',')[0].trim().replace(/[^a-z0-9]/g, '')
      : 'global';
    
    // Normalize occupation to categories
    const occupationCategory = this.normalizeOccupation(occupation);
    
    // Sort and limit interests/values for consistency
    const sortedInterests = interests.slice(0, 3).sort().join('|');
    const sortedValues = values.slice(0, 3).sort().join('|');
    
    return `${entityType}_${ageRange}_${normalizedLocation}_${occupationCategory}_${sortedInterests}_${sortedValues}_${take}`;
  }

  /**
   * Get data from cache with intelligent TTL
   */
  get<T>(key: string): T | null {
    this.stats.totalRequests++;
    
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    const now = Date.now();
    
    // Check if expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Update access stats
    entry.accessCount++;
    entry.lastAccessed = now;
    
    this.stats.hits++;
    this.updateHitRate();
    
    console.log(`🎯 Cache hit for ${key.split('_')[0]} (${entry.accessCount} accesses)`);
    return entry.data;
  }

  /**
   * Set data in cache with intelligent TTL based on data quality
   */
  set<T>(key: string, data: T, customTTL?: number): void {
    // Calculate intelligent TTL based on data characteristics
    const ttl = customTTL || this.calculateIntelligentTTL(key, data);
    
    // Evict if at max capacity
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now()
    };

    this.cache.set(key, entry);
    this.updateStats();
    
    console.log(`💾 Cached ${key.split('_')[0]} data (TTL: ${Math.round(ttl/60000)}min)`);
  }

  /**
   * Calculate intelligent TTL based on data type and quality
   */
  private calculateIntelligentTTL(key: string, data: any): number {
    const entityType = key.split('_')[0];
    const baseMultiplier = this.getTTLMultiplier(entityType);
    
    // Adjust based on data quality
    let qualityMultiplier = 1;
    if (Array.isArray(data)) {
      // More data = longer cache
      qualityMultiplier = Math.min(2, 1 + (data.length / 10));
    }
    
    // Location-based adjustment
    const isGlobal = key.includes('global');
    const locationMultiplier = isGlobal ? 1.5 : 1;
    
    return this.defaultTTL * baseMultiplier * qualityMultiplier * locationMultiplier;
  }

  /**
   * Get TTL multiplier based on entity type stability
   */
  private getTTLMultiplier(entityType: string): number {
    const multipliers: Record<string, number> = {
      music: 2.0,      // Music preferences are stable
      movie: 1.8,      // Movie preferences fairly stable
      book: 2.2,       // Book preferences very stable
      brand: 1.5,      // Brand preferences change more
      tv: 1.6,         // TV preferences moderate
      fashion: 0.8,    // Fashion changes quickly
      beauty: 0.9,     // Beauty trends change
      food: 1.2,       // Food preferences moderate
      travel: 1.4,     // Travel preferences stable
      restaurant: 1.0, // Restaurant preferences moderate
      person: 1.8,     // Person preferences stable
      socialMedia: 0.7 // Social media changes rapidly
    };
    
    return multipliers[entityType] || 1.0;
  }

  /**
   * Normalize occupation to broader categories for better cache hits
   */
  private normalizeOccupation(occupation?: string): string {
    if (!occupation) return 'general';
    
    const normalized = occupation.toLowerCase();
    
    if (normalized.includes('develop') || normalized.includes('program') || normalized.includes('engineer')) {
      return 'tech';
    }
    if (normalized.includes('design') || normalized.includes('creative')) {
      return 'creative';
    }
    if (normalized.includes('manage') || normalized.includes('director') || normalized.includes('lead')) {
      return 'management';
    }
    if (normalized.includes('market') || normalized.includes('sales')) {
      return 'business';
    }
    
    return 'general';
  }

  /**
   * Evict least recently used entries
   */
  private evictLeastUsed(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(`🗑️ Evicted cache entry: ${oldestKey.split('_')[0]}`);
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired cache entries`);
      this.updateStats();
    }
  }

  /**
   * Update cache statistics
   */
  private updateStats(): void {
    this.stats.size = this.cache.size;
    this.stats.memoryUsage = this.estimateMemoryUsage();
  }

  /**
   * Update hit rate calculation
   */
  private updateHitRate(): void {
    this.stats.hitRate = this.stats.totalRequests > 0 
      ? this.stats.hits / this.stats.totalRequests 
      : 0;
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(): number {
    let totalSize = 0;
    for (const [key, entry] of this.cache.entries()) {
      totalSize += key.length * 2; // UTF-16
      totalSize += JSON.stringify(entry.data).length * 2;
      totalSize += 64; // Overhead
    }
    return totalSize;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    this.updateStats();
    return { ...this.stats };
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      hitRate: 0,
      size: 0,
      memoryUsage: 0
    };
  }

  /**
   * Destroy cache and cleanup
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }

  /**
   * Warm cache with common requests
   */
  async warmCache(commonRequests: Array<{ key: string; data: any }>): Promise<void> {
    console.log(`🔥 Warming cache with ${commonRequests.length} entries`);
    
    for (const { key, data } of commonRequests) {
      this.set(key, data);
    }
    
    console.log(`✅ Cache warmed: ${this.cache.size} entries`);
  }
}

// Singleton instance
export const optimizedCache = new OptimizedCache();