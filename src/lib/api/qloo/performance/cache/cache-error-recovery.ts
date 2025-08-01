import { optimizedCache } from './optimized-cache';

interface ErrorRecoveryConfig {
    maxRetryAttempts: number;
    retryDelay: number;
    enableCircuitBreaker: boolean;
    circuitBreakerThreshold: number;
    circuitBreakerTimeout: number;
    enableFallbackCache: boolean;
    fallbackCacheTTL: number;
}

interface CacheErrorMetrics {
    totalErrors: number;
    readErrors: number;
    writeErrors: number;
    recoveryAttempts: number;
    successfulRecoveries: number;
    circuitBreakerTrips: number;
    lastErrorTime: number;
    errorsByType: Record<string, number>;
}

interface CircuitBreakerState {
    isOpen: boolean;
    failureCount: number;
    lastFailureTime: number;
    nextAttemptTime: number;
}

export class CacheErrorRecovery {
    private config: ErrorRecoveryConfig;
    private metrics: CacheErrorMetrics;
    private circuitBreaker: CircuitBreakerState;
    private fallbackCache = new Map<string, { data: any; timestamp: number }>();
    private corruptedKeys = new Set<string>();
    private errorPatterns = new Map<string, number>();

    constructor(config: Partial<ErrorRecoveryConfig> = {}) {
        this.config = {
            maxRetryAttempts: 3,
            retryDelay: 1000,
            enableCircuitBreaker: true,
            circuitBreakerThreshold: 5,
            circuitBreakerTimeout: 30000, // 30 seconds
            enableFallbackCache: true,
            fallbackCacheTTL: 300000, // 5 minutes
            ...config
        };

        this.metrics = {
            totalErrors: 0,
            readErrors: 0,
            writeErrors: 0,
            recoveryAttempts: 0,
            successfulRecoveries: 0,
            circuitBreakerTrips: 0,
            lastErrorTime: 0,
            errorsByType: {}
        };

        this.circuitBreaker = {
            isOpen: false,
            failureCount: 0,
            lastFailureTime: 0,
            nextAttemptTime: 0
        };

        // Cleanup fallback cache periodically
        setInterval(() => this.cleanupFallbackCache(), 60000); // Every minute
    }

    /**
     * Handles cache errors with comprehensive recovery strategies
     */
    async handleCacheError(
        error: any,
        key: string,
        operationType: 'read' | 'write',
        data?: any
    ): Promise<{
        recovered: boolean;
        fallbackData?: any;
        strategy: string;
        retryCount?: number;
    }> {
        this.updateErrorMetrics(error, operationType);

        console.error(`🚨 Cache Error (${operationType}) for key '${key}':`, error);

        // Check circuit breaker
        if (this.isCircuitBreakerOpen()) {
            return this.handleCircuitBreakerOpen(key, operationType, data);
        }

        // Attempt recovery based on operation type
        const recoveryResult = await this.attemptRecovery(error, key, operationType, data);

        // Update circuit breaker state
        this.updateCircuitBreaker(recoveryResult.recovered);

        return recoveryResult;
    }

    /**
     * Attempts recovery with multiple strategies
     */
    private async attemptRecovery(
        error: any,
        key: string,
        operationType: 'read' | 'write',
        data?: any
    ): Promise<{
        recovered: boolean;
        fallbackData?: any;
        strategy: string;
        retryCount?: number;
    }> {
        this.metrics.recoveryAttempts++;

        switch (operationType) {
            case 'read':
                return await this.recoverFromReadError(error, key);
            case 'write':
                return await this.recoverFromWriteError(error, key, data);
            default:
                return { recovered: false, strategy: 'unknown_operation' };
        }
    }

    /**
     * Recovers from cache read errors
     */
    private async recoverFromReadError(
        error: any,
        key: string
    ): Promise<{
        recovered: boolean;
        fallbackData?: any;
        strategy: string;
        retryCount?: number;
    }> {
        // Strategy 1: Check if key is corrupted and clear it
        if (this.isCorruptionError(error)) {
            console.log(`🔧 Clearing corrupted cache entry: ${key}`);
            this.clearEntry(key);
            this.corruptedKeys.add(key);

            // Try fallback cache
            const fallbackData = this.getFallbackData(key);
            if (fallbackData) {
                return { recovered: true, fallbackData, strategy: 'fallback_after_corruption' };
            }

            return { recovered: true, strategy: 'corruption_cleared' };
        }

        // Strategy 2: Memory pressure - trigger cleanup and retry
        if (this.isMemoryError(error)) {
            console.log(`🧹 Memory pressure detected, triggering cache cleanup`);
            await this.emergencyCleanup();

            // Retry read after cleanup
            try {
                const retryData = optimizedCache.get(key);
                if (retryData) {
                    return { recovered: true, fallbackData: retryData, strategy: 'retry_after_cleanup' };
                }
            } catch (retryError) {
                console.warn(`Retry after cleanup failed:`, retryError);
            }
        }

        // Strategy 3: Check fallback cache
        const fallbackData = this.getFallbackData(key);
        if (fallbackData) {
            console.log(`📦 Using fallback cache for key: ${key}`);
            return { recovered: true, fallbackData, strategy: 'fallback_cache' };
        }

        // Strategy 4: Attempt cache reconstruction
        const reconstructedData = await this.attemptCacheReconstruction(key);
        if (reconstructedData) {
            return { recovered: true, fallbackData: reconstructedData, strategy: 'reconstruction' };
        }

        return { recovered: false, strategy: 'all_strategies_failed' };
    }

    /**
     * Recovers from cache write errors
     */
    private async recoverFromWriteError(
        error: any,
        key: string,
        data?: any
    ): Promise<{
        recovered: boolean;
        strategy: string;
        retryCount?: number;
    }> {
        // Strategy 1: Retry with exponential backoff
        if (this.isTransientError(error)) {
            const retryResult = await this.retryWithBackoff(key, data);
            if (retryResult.success) {
                return {
                    recovered: true,
                    strategy: 'retry_with_backoff',
                    retryCount: retryResult.attempts
                };
            }
        }

        // Strategy 2: Memory pressure - cleanup and retry
        if (this.isMemoryError(error)) {
            console.log(`🧹 Memory pressure during write, triggering cleanup`);
            await this.emergencyCleanup();

            try {
                optimizedCache.set(key, data);
                return { recovered: true, strategy: 'retry_after_cleanup' };
            } catch (retryError) {
                console.warn(`Write retry after cleanup failed:`, retryError);
            }
        }

        // Strategy 3: Store in fallback cache
        if (this.config.enableFallbackCache && data) {
            this.setFallbackData(key, data);
            console.log(`📦 Stored in fallback cache: ${key}`);
            return { recovered: true, strategy: 'fallback_storage' };
        }

        // Strategy 4: Graceful degradation - log and continue
        console.warn(`⚠️ Cache write failed for ${key}, continuing without caching`);
        return { recovered: true, strategy: 'graceful_degradation' };
    }

    /**
     * Retry operation with exponential backoff
     */
    private async retryWithBackoff(
        key: string,
        data: any
    ): Promise<{ success: boolean; attempts: number }> {
        let attempts = 0;

        while (attempts < this.config.maxRetryAttempts) {
            attempts++;
            const delay = this.config.retryDelay * Math.pow(2, attempts - 1);

            console.log(`🔄 Retry attempt ${attempts}/${this.config.maxRetryAttempts} for ${key} (delay: ${delay}ms)`);

            await this.sleep(delay);

            try {
                optimizedCache.set(key, data);
                console.log(`✅ Retry successful for ${key} after ${attempts} attempts`);
                return { success: true, attempts };
            } catch (error) {
                console.warn(`Retry ${attempts} failed:`, error);

                if (attempts === this.config.maxRetryAttempts) {
                    console.error(`❌ All retry attempts failed for ${key}`);
                }
            }
        }

        return { success: false, attempts };
    }

    /**
     * Emergency cache cleanup to free memory
     */
    private async emergencyCleanup(): Promise<void> {
        console.log(`🚨 Emergency cache cleanup initiated`);

        try {
            // Get current stats
            const stats = optimizedCache.getStats();
            const targetReduction = Math.floor(stats.size * 0.3); // Remove 30%

            console.log(`🧹 Attempting to free ${targetReduction} cache entries`);

            // Force cleanup of expired entries first
            (optimizedCache as any).cleanup?.();

            // If still over capacity, trigger LRU eviction
            let evicted = 0;
            while (evicted < targetReduction && optimizedCache.getStats().size > 0) {
                (optimizedCache as any).evictLeastUsed?.();
                evicted++;
            }

            console.log(`✅ Emergency cleanup completed: ${evicted} entries removed`);
        } catch (cleanupError) {
            console.error(`❌ Emergency cleanup failed:`, cleanupError);
        }
    }

    /**
     * Attempt to reconstruct cache data from patterns
     */
    private async attemptCacheReconstruction(key: string): Promise<any> {
        // Try to find similar keys that might help reconstruct the data
        const keyParts = key.split('_');
        const entityType = keyParts[0];

        // Look for similar cached entries
        const stats = optimizedCache.getStats();
        if (stats.size === 0) return null;

        // This is a simplified reconstruction - in practice, you might have
        // more sophisticated logic based on your data patterns
        console.log(`🔨 Attempting cache reconstruction for ${entityType}`);

        // For now, return null - this would be implemented based on specific needs
        return null;
    }

    /**
     * Circuit breaker management
     */
    private isCircuitBreakerOpen(): boolean {
        if (!this.config.enableCircuitBreaker) return false;

        const now = Date.now();

        // Check if circuit breaker should be reset
        if (this.circuitBreaker.isOpen && now >= this.circuitBreaker.nextAttemptTime) {
            console.log(`🔄 Circuit breaker reset attempt`);
            this.circuitBreaker.isOpen = false;
            this.circuitBreaker.failureCount = 0;
        }

        return this.circuitBreaker.isOpen;
    }

    private updateCircuitBreaker(success: boolean): void {
        if (!this.config.enableCircuitBreaker) return;

        const now = Date.now();

        if (success) {
            this.circuitBreaker.failureCount = 0;
        } else {
            this.circuitBreaker.failureCount++;
            this.circuitBreaker.lastFailureTime = now;

            if (this.circuitBreaker.failureCount >= this.config.circuitBreakerThreshold) {
                this.circuitBreaker.isOpen = true;
                this.circuitBreaker.nextAttemptTime = now + this.config.circuitBreakerTimeout;
                this.metrics.circuitBreakerTrips++;

                console.warn(`🚨 Circuit breaker opened after ${this.circuitBreaker.failureCount} failures`);
            }
        }
    }

    private handleCircuitBreakerOpen(
        key: string,
        operationType: string,
        data?: any
    ): { recovered: boolean; fallbackData?: any; strategy: string } {
        console.warn(`⚡ Circuit breaker is open, using fallback for ${key}`);

        if (operationType === 'read') {
            const fallbackData = this.getFallbackData(key);
            return {
                recovered: !!fallbackData,
                fallbackData,
                strategy: 'circuit_breaker_fallback'
            };
        } else {
            // For writes, store in fallback cache
            if (data && this.config.enableFallbackCache) {
                this.setFallbackData(key, data);
            }
            return { recovered: true, strategy: 'circuit_breaker_fallback' };
        }
    }

    /**
     * Fallback cache management
     */
    private getFallbackData(key: string): any {
        if (!this.config.enableFallbackCache) return null;

        const entry = this.fallbackCache.get(key);
        if (!entry) return null;

        const now = Date.now();
        if (now - entry.timestamp > this.config.fallbackCacheTTL) {
            this.fallbackCache.delete(key);
            return null;
        }

        return entry.data;
    }

    private setFallbackData(key: string, data: any): void {
        if (!this.config.enableFallbackCache) return;

        this.fallbackCache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    private cleanupFallbackCache(): void {
        const now = Date.now();
        let cleaned = 0;

        for (const [key, entry] of this.fallbackCache.entries()) {
            if (now - entry.timestamp > this.config.fallbackCacheTTL) {
                this.fallbackCache.delete(key);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`🧹 Cleaned ${cleaned} expired fallback cache entries`);
        }
    }

    /**
     * Error classification
     */
    private isCorruptionError(error: any): boolean {
        const errorMessage = error?.message?.toLowerCase() || '';
        return errorMessage.includes('corrupt') ||
            errorMessage.includes('invalid') ||
            errorMessage.includes('malformed') ||
            errorMessage.includes('parse');
    }

    private isMemoryError(error: any): boolean {
        const errorMessage = error?.message?.toLowerCase() || '';
        return errorMessage.includes('memory') ||
            errorMessage.includes('heap') ||
            errorMessage.includes('out of space') ||
            error?.code === 'ENOMEM';
    }

    private isTransientError(error: any): boolean {
        const errorMessage = error?.message?.toLowerCase() || '';
        return errorMessage.includes('timeout') ||
            errorMessage.includes('network') ||
            errorMessage.includes('temporary') ||
            errorMessage.includes('busy');
    }

    /**
     * Metrics and monitoring
     */
    private updateErrorMetrics(error: any, operationType: string): void {
        this.metrics.totalErrors++;
        this.metrics.lastErrorTime = Date.now();

        if (operationType === 'read') {
            this.metrics.readErrors++;
        } else if (operationType === 'write') {
            this.metrics.writeErrors++;
        }

        // Track error types
        const errorType = error?.constructor?.name || 'UnknownError';
        this.metrics.errorsByType[errorType] = (this.metrics.errorsByType[errorType] || 0) + 1;

        // Track error patterns
        const errorPattern = this.extractErrorPattern(error);
        this.errorPatterns.set(errorPattern, (this.errorPatterns.get(errorPattern) || 0) + 1);
    }

    private extractErrorPattern(error: any): string {
        const message = error?.message || '';
        // Extract key patterns from error messages
        if (message.includes('timeout')) return 'timeout';
        if (message.includes('memory')) return 'memory';
        if (message.includes('corrupt')) return 'corruption';
        if (message.includes('network')) return 'network';
        return 'other';
    }

    /**
     * Clear a specific cache entry (add to OptimizedCache interface)
     */
    private clearEntry(key: string): void {
        try {
            (optimizedCache as any).cache?.delete(key);
            (optimizedCache as any).updateStats?.();
            console.log(`🗑️ Cleared problematic cache entry: ${key}`);
        } catch (error) {
            console.error(`Failed to clear cache entry ${key}:`, error);
        }
    }

    /**
     * Public API methods
     */
    getMetrics(): CacheErrorMetrics {
        return { ...this.metrics };
    }

    getCircuitBreakerState(): CircuitBreakerState {
        return { ...this.circuitBreaker };
    }

    getFallbackCacheStats(): { size: number; keys: string[] } {
        return {
            size: this.fallbackCache.size,
            keys: Array.from(this.fallbackCache.keys())
        };
    }

    getErrorPatterns(): Array<{ pattern: string; count: number }> {
        return Array.from(this.errorPatterns.entries())
            .map(([pattern, count]) => ({ pattern, count }))
            .sort((a, b) => b.count - a.count);
    }

    resetMetrics(): void {
        this.metrics = {
            totalErrors: 0,
            readErrors: 0,
            writeErrors: 0,
            recoveryAttempts: 0,
            successfulRecoveries: 0,
            circuitBreakerTrips: 0,
            lastErrorTime: 0,
            errorsByType: {}
        };
        this.errorPatterns.clear();
    }

    resetCircuitBreaker(): void {
        this.circuitBreaker = {
            isOpen: false,
            failureCount: 0,
            lastFailureTime: 0,
            nextAttemptTime: 0
        };
        console.log(`🔄 Circuit breaker manually reset`);
    }

    clearFallbackCache(): void {
        this.fallbackCache.clear();
        console.log(`🧹 Fallback cache cleared`);
    }

    updateConfig(newConfig: Partial<ErrorRecoveryConfig>): void {
        this.config = { ...this.config, ...newConfig };
        console.log(`⚙️ Cache error recovery config updated:`, newConfig);
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Singleton instance
export const cacheErrorRecovery = new CacheErrorRecovery();

// Enhanced cache wrapper with error recovery
export const safeCache = {
    async get<T>(key: string): Promise<T | null> {
        try {
            return optimizedCache.get<T>(key);
        } catch (error) {
            const recovery = await cacheErrorRecovery.handleCacheError(error, key, 'read');
            return recovery.fallbackData || null;
        }
    },

    async set<T>(key: string, data: T, ttl?: number): Promise<boolean> {
        try {
            optimizedCache.set(key, data, ttl);
            return true;
        } catch (error) {
            const recovery = await cacheErrorRecovery.handleCacheError(error, key, 'write', data);
            return recovery.recovered;
        }
    },

    generateKey: optimizedCache.generateKey.bind(optimizedCache),
    getStats: optimizedCache.getStats.bind(optimizedCache),
    clear: optimizedCache.clear.bind(optimizedCache)
};


