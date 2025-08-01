import { hybridCache } from '@/lib/cache/hybrid-cache';
import { optimizedCache } from './optimized-cache';

export class HybridCacheIntegration {
    private fallbackToMemory = true;

    async get<T>(key: string): Promise<T | null> {
        try {
            // Try hybrid cache first (Redis + Memory)
            const result = await hybridCache.get<T>(key);
            if (result) {
                return result;
            }

            // Fallback to existing optimized cache if needed
            if (this.fallbackToMemory) {
                return optimizedCache.get(key) || null;
            }

            return null;
        } catch (error) {
            console.warn('Hybrid cache GET failed, using memory fallback:', error);
            return optimizedCache.get(key) || null;
        }
    }

    async set<T>(key: string, data: T, ttlMs: number): Promise<void> {
        try {
            // Store in hybrid cache (Redis + Memory)
            await hybridCache.set(key, data, ttlMs);

            // Also store in existing optimized cache for immediate fallback
            if (this.fallbackToMemory) {
                optimizedCache.set(key, data, ttlMs);
            }
        } catch (error) {
            console.warn('Hybrid cache SET failed, using memory fallback:', error);
            optimizedCache.set(key, data, ttlMs);
        }
    }

    async delete(key: string): Promise<void> {
        try {
            await hybridCache.delete(key);
            // Note: optimizedCache doesn't support individual key deletion
            // Only clear() is available for the entire cache
        } catch (error) {
            console.warn('Hybrid cache DELETE failed:', error);
            // Cannot delete individual keys from optimizedCache
        }
    }

    async clear(pattern?: string): Promise<void> {
        try {
            await hybridCache.clear(pattern);
            if (this.fallbackToMemory) {
                optimizedCache.clear();
            }
        } catch (error) {
            console.warn('Hybrid cache CLEAR failed:', error);
            optimizedCache.clear();
        }
    }

    getStats() {
        const hybridStats = hybridCache.getStats();
        const memoryStats = optimizedCache.getStats();

        return {
            hybrid: hybridStats,
            memory: memoryStats,
            integration: {
                fallbackEnabled: this.fallbackToMemory,
                totalEntries: hybridStats.memoryEntries + memoryStats.size,
                strategy: 'Redis + Memory with fallback'
            }
        };
    }

    // Method to migrate existing cache to Redis
    async migrateToRedis(): Promise<void> {
        console.log('🔄 Migrating existing cache to Redis...');

        try {
            const memoryStats = optimizedCache.getStats();
            console.log(`📊 Found ${memoryStats.size} entries in memory cache`);

            // Note: optimizedCache doesn't expose getAllEntries() method
            // Migration would require adding that method to OptimizedCache class
            // For now, we'll just clear the old cache after Redis is ready
            console.log('⚠️ Individual entry migration not supported - clearing memory cache');

            // Clear the old cache to force fresh data into Redis
            if (this.fallbackToMemory) {
                optimizedCache.clear();
            }

            console.log(`✅ Memory cache cleared, new requests will populate Redis`);
        } catch (error) {
            console.error('❌ Cache migration failed:', error);
        }
    }

    // Enable/disable memory fallback
    setFallbackMode(enabled: boolean): void {
        this.fallbackToMemory = enabled;
        console.log(`🔧 Memory fallback ${enabled ? 'enabled' : 'disabled'}`);
    }
}

// Singleton instance
export const hybridCacheIntegration = new HybridCacheIntegration();