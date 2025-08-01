import { redisCache } from './redis-cache-adapter';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
    accessCount: number;
}

export class HybridCache {
    private memoryCache = new Map<string, CacheEntry<any>>();
    private readonly maxMemoryEntries = 1000;
    private readonly memoryTtlMs = 5 * 60 * 1000; // 5 minutes in memory

    constructor() {
        // Initialize Redis connection
        this.initRedis();

        // Cleanup expired memory entries every minute
        setInterval(() => this.cleanupMemoryCache(), 60000);
    }

    private async initRedis() {
        try {
            await redisCache.connect();
        } catch (error) {
            console.warn('Redis not available, using memory-only cache');
        }
    }

    async get<T>(key: string): Promise<T | null> {
        // 1. Check memory cache first (fastest)
        const memoryEntry = this.memoryCache.get(key);
        if (memoryEntry && Date.now() - memoryEntry.timestamp < memoryEntry.ttl) {
            memoryEntry.accessCount++;
            console.log(`🎯 Memory cache hit for ${key} (${memoryEntry.accessCount} accesses)`);
            return memoryEntry.data;
        }

        // 2. Check Redis cache (persistent)
        try {
            const redisData = await redisCache.get<T>(key);
            if (redisData) {
                // Store in memory for faster subsequent access
                this.setMemoryCache(key, redisData, this.memoryTtlMs);
                console.log(`🎯 Redis cache hit for ${key}`);
                return redisData;
            }
        } catch (error) {
            console.warn('Redis GET failed, falling back to memory only');
        }

        return null;
    }

    async set<T>(key: string, data: T, ttlMs: number): Promise<void> {
        // Store in both memory and Redis
        this.setMemoryCache(key, data, Math.min(ttlMs, this.memoryTtlMs));

        try {
            const ttlSeconds = Math.floor(ttlMs / 1000);
            await redisCache.set(key, data, ttlSeconds);
            console.log(`💾 Cached ${key} (TTL: ${Math.floor(ttlMs / 60000)}min)`);
        } catch (error) {
            console.warn('Redis SET failed, data only in memory');
        }
    }

    private setMemoryCache<T>(key: string, data: T, ttlMs: number): void {
        // Evict oldest entries if memory cache is full
        if (this.memoryCache.size >= this.maxMemoryEntries) {
            const oldestKey = this.memoryCache.keys().next().value;
            if (oldestKey) {
                this.memoryCache.delete(oldestKey);
            }
        }

        this.memoryCache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: ttlMs,
            accessCount: 0
        });
    }

    async delete(key: string): Promise<void> {
        this.memoryCache.delete(key);
        try {
            await redisCache.del(key);
        } catch (error) {
            console.warn('Redis DELETE failed');
        }
    }

    async clear(pattern?: string): Promise<void> {
        if (pattern) {
            // Clear specific pattern
            try {
                const keys = await redisCache.keys(pattern);
                for (const key of keys) {
                    await this.delete(key);
                }
            } catch (error) {
                console.warn('Redis pattern clear failed');
            }

            // Clear matching memory entries
            for (const key of this.memoryCache.keys()) {
                if (key.includes(pattern.replace('*', ''))) {
                    this.memoryCache.delete(key);
                }
            }
        } else {
            // Clear all
            this.memoryCache.clear();
            try {
                const keys = await redisCache.keys('*');
                for (const key of keys) {
                    await redisCache.del(key);
                }
            } catch (error) {
                console.warn('Redis clear all failed');
            }
        }
    }

    private cleanupMemoryCache(): void {
        const now = Date.now();
        let cleaned = 0;

        for (const [key, entry] of this.memoryCache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.memoryCache.delete(key);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`🧹 Cleaned up ${cleaned} expired cache entries`);
        }
    }

    getStats() {
        return {
            memoryEntries: this.memoryCache.size,
            maxMemoryEntries: this.maxMemoryEntries,
            memoryUsage: `${Math.round(this.memoryCache.size * 1.5)}KB` // Rough estimate
        };
    }
}

// Singleton instance
export const hybridCache = new HybridCache();