import { optimizedCache } from './optimized-cache';
import { realTimeMonitor } from './real-time-monitor';
import { advancedOptimizer } from './advanced-performance-optimizer';

interface PreloadPattern {
    entityType: string;
    params: {
        age?: number;
        location?: string;
        occupation?: string;
        interests?: string[];
        values?: string[];
        take?: number;
    };
    frequency: number;
    lastUsed: number;
    priority: number;
}

interface PreloadConfig {
    enableIntelligentPreloading: boolean;
    maxPreloadItems: number;
    preloadThreshold: number;
    adaptivePreloading: boolean;
    preloadInterval: number;
    maxConcurrentPreloads: number;
}

interface UsagePattern {
    entityType: string;
    params: string;
    count: number;
    lastAccess: number;
    avgResponseTime: number;
}

export class IntelligentPreloader {
    private config: PreloadConfig = {
        enableIntelligentPreloading: true,
        maxPreloadItems: 50,
        preloadThreshold: 3, // Preload after 3 uses
        adaptivePreloading: true,
        preloadInterval: 300000, // 5 minutes
        maxConcurrentPreloads: 3
    };

    private usagePatterns = new Map<string, UsagePattern>();
    private preloadQueue: PreloadPattern[] = [];
    private activePreloads = 0;
    private preloadInterval?: NodeJS.Timeout;
    private isPreloading = false;

    constructor(config?: Partial<PreloadConfig>) {
        if (config) {
            this.config = { ...this.config, ...config };
        }

        // Start intelligent preloading
        this.startIntelligentPreloading();

        // Listen to real-time monitor events
        this.setupMonitoringIntegration();
    }

    /**
     * Record usage pattern for intelligent preloading
     */
    recordUsage(
        entityType: string,
        params: any,
        responseTime: number
    ): void {
        const paramsKey = this.normalizeParams(params);
        const patternKey = `${entityType}_${paramsKey}`;

        let pattern = this.usagePatterns.get(patternKey);
        if (!pattern) {
            pattern = {
                entityType,
                params: paramsKey,
                count: 0,
                lastAccess: 0,
                avgResponseTime: 0
            };
            this.usagePatterns.set(patternKey, pattern);
        }

        // Update pattern statistics
        pattern.count++;
        pattern.lastAccess = Date.now();
        pattern.avgResponseTime = (pattern.avgResponseTime * (pattern.count - 1) + responseTime) / pattern.count;

        // Consider for preloading if threshold met
        if (pattern.count >= this.config.preloadThreshold) {
            this.considerForPreloading(entityType, params, pattern);
        }
    }

    /**
     * Consider adding pattern to preload queue
     */
    private considerForPreloading(
        entityType: string,
        params: any,
        pattern: UsagePattern
    ): void {
        const cacheKey = optimizedCache.generateKey({
            entityType,
            ...params
        });

        // Don't preload if already cached
        if (optimizedCache.get(cacheKey)) {
            return;
        }

        // Calculate priority based on usage frequency and recency
        const now = Date.now();
        const recencyScore = Math.max(0, 1 - (now - pattern.lastAccess) / (24 * 60 * 60 * 1000)); // 24h decay
        const frequencyScore = Math.min(1, pattern.count / 10); // Normalize to 0-1
        const responseTimeScore = Math.max(0, 1 - pattern.avgResponseTime / 10000); // Favor fast responses

        const priority = (recencyScore * 0.4 + frequencyScore * 0.4 + responseTimeScore * 0.2) * 100;

        const preloadPattern: PreloadPattern = {
            entityType,
            params,
            frequency: pattern.count,
            lastUsed: pattern.lastAccess,
            priority
        };

        // Add to queue if not already present
        const existingIndex = this.preloadQueue.findIndex(
            p => p.entityType === entityType && JSON.stringify(p.params) === JSON.stringify(params)
        );

        if (existingIndex >= 0) {
            // Update existing pattern
            this.preloadQueue[existingIndex] = preloadPattern;
        } else {
            // Add new pattern
            this.preloadQueue.push(preloadPattern);
        }

        // Sort by priority and limit queue size
        this.preloadQueue.sort((a, b) => b.priority - a.priority);
        if (this.preloadQueue.length > this.config.maxPreloadItems) {
            this.preloadQueue = this.preloadQueue.slice(0, this.config.maxPreloadItems);
        }

        console.log(`🎯 Added ${entityType} to preload queue (priority: ${Math.round(priority)})`);
    }

    /**
     * Start intelligent preloading process
     */
    private startIntelligentPreloading(): void {
        if (!this.config.enableIntelligentPreloading || this.isPreloading) {
            return;
        }

        console.log('🚀 Starting intelligent preloading system');
        this.isPreloading = true;

        this.preloadInterval = setInterval(() => {
            this.processPreloadQueue();
        }, this.config.preloadInterval);
    }

    /**
     * Process preload queue
     */
    private async processPreloadQueue(): Promise<void> {
        if (this.preloadQueue.length === 0 || this.activePreloads >= this.config.maxConcurrentPreloads) {
            return;
        }

        const pattern = this.preloadQueue.shift();
        if (!pattern) return;

        this.activePreloads++;

        try {
            await this.executePreload(pattern);
        } catch (error) {
            console.warn(`⚠️ Preload failed for ${pattern.entityType}:`, error);
        } finally {
            this.activePreloads--;
        }
    }

    /**
     * Execute individual preload
     */
    private async executePreload(pattern: PreloadPattern): Promise<void> {
        const cacheKey = optimizedCache.generateKey({
            entityType: pattern.entityType,
            ...pattern.params
        });

        // Double-check cache before preloading
        if (optimizedCache.get(cacheKey)) {
            return;
        }

        console.log(`🔄 Preloading ${pattern.entityType} data (priority: ${Math.round(pattern.priority)})`);

        try {
            // Use the advanced optimizer for preloading
            const result = await advancedOptimizer.executeOptimizedRequest(
                cacheKey,
                () => this.simulateAPICall(pattern),
                {
                    entityType: pattern.entityType,
                    priority: pattern.priority,
                    timeout: 10000
                }
            );

            console.log(`✅ Preloaded ${pattern.entityType} data successfully`);

            // Record successful preload
            realTimeMonitor.recordRequest(pattern.entityType, 1000, true, false);

        } catch (error) {
            console.warn(`❌ Preload failed for ${pattern.entityType}:`, error);
            realTimeMonitor.recordRequest(pattern.entityType, 5000, false, false);
        }
    }

    /**
     * Simulate API call for preloading (replace with actual API calls)
     */
    private async simulateAPICall(pattern: PreloadPattern): Promise<any> {
        // This would be replaced with actual API calls to your services
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

        // Return mock data based on entity type
        return this.generateMockData(pattern.entityType, pattern.params);
    }

    /**
     * Generate mock data for testing
     */
    private generateMockData(entityType: string, params: any): any[] {
        const count = params.take || 5;
        const mockData = [];

        for (let i = 0; i < count; i++) {
            mockData.push({
                id: `${entityType}_${i}`,
                name: `Sample ${entityType} ${i}`,
                type: entityType,
                relevanceScore: Math.random() * 100,
                metadata: {
                    preloaded: true,
                    timestamp: Date.now()
                }
            });
        }

        return mockData;
    }

    /**
     * Setup integration with real-time monitor
     */
    private setupMonitoringIntegration(): void {
        realTimeMonitor.on('request:recorded', (data: any) => {
            // Learn from actual request patterns
            if (data.success && data.responseTime < 5000) {
                // This is a good candidate for preloading
                this.recordUsage(data.entityType, {}, data.responseTime);
            }
        });

        realTimeMonitor.on('alert:triggered', (alert: any) => {
            // Adjust preloading based on performance alerts
            if (alert.metric === 'responseTime' && alert.type === 'WARNING') {
                this.boostPreloadingForEntity(alert.entityType);
            }
        });
    }

    /**
     * Boost preloading for specific entity type
     */
    private boostPreloadingForEntity(entityType: string): void {
        // Increase priority for this entity type in preload queue
        for (const pattern of this.preloadQueue) {
            if (pattern.entityType === entityType) {
                pattern.priority *= 1.5;
            }
        }

        // Re-sort queue
        this.preloadQueue.sort((a, b) => b.priority - a.priority);

        console.log(`🚀 Boosted preloading priority for ${entityType}`);
    }

    /**
     * Adaptive preloading based on system performance
     */
    private adaptPreloadingStrategy(): void {
        if (!this.config.adaptivePreloading) return;

        const metrics = advancedOptimizer.getMetrics();
        const cacheStats = optimizedCache.getStats();

        // Reduce preloading if system is under stress
        if (metrics.concurrentRequests > 5 || metrics.queueLength > 10) {
            this.config.maxConcurrentPreloads = Math.max(1, this.config.maxConcurrentPreloads - 1);
            console.log(`📉 Reduced preload concurrency to ${this.config.maxConcurrentPreloads}`);
        }

        // Increase preloading if cache hit rate is low
        else if (cacheStats.hitRate < 0.3 && metrics.concurrentRequests < 3) {
            this.config.maxConcurrentPreloads = Math.min(5, this.config.maxConcurrentPreloads + 1);
            console.log(`📈 Increased preload concurrency to ${this.config.maxConcurrentPreloads}`);
        }
    }

    /**
     * Normalize parameters for consistent pattern matching
     */
    private normalizeParams(params: any): string {
        const normalized = {
            age: params.age ? Math.floor(params.age / 10) * 10 : 'any',
            location: params.location ? params.location.toLowerCase().split(',')[0].trim() : 'global',
            occupation: this.normalizeOccupation(params.occupation),
            interests: params.interests ? params.interests.slice(0, 3).sort().join('|') : '',
            values: params.values ? params.values.slice(0, 3).sort().join('|') : '',
            take: params.take || 5
        };

        return Object.values(normalized).join('_');
    }

    /**
     * Normalize occupation for better pattern matching
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
     * Get preloading statistics
     */
    getStats(): {
        totalPatterns: number;
        queueLength: number;
        activePreloads: number;
        topPatterns: Array<{
            entityType: string;
            frequency: number;
            priority: number;
        }>;
    } {
        const topPatterns = this.preloadQueue
            .slice(0, 10)
            .map(p => ({
                entityType: p.entityType,
                frequency: p.frequency,
                priority: Math.round(p.priority)
            }));

        return {
            totalPatterns: this.usagePatterns.size,
            queueLength: this.preloadQueue.length,
            activePreloads: this.activePreloads,
            topPatterns
        };
    }

    /**
     * Manually trigger preloading for specific patterns
     */
    async preloadPatterns(patterns: Array<{
        entityType: string;
        params: any;
        priority?: number;
    }>): Promise<void> {
        console.log(`🎯 Manual preloading triggered for ${patterns.length} patterns`);

        for (const pattern of patterns) {
            const preloadPattern: PreloadPattern = {
                entityType: pattern.entityType,
                params: pattern.params,
                frequency: 1,
                lastUsed: Date.now(),
                priority: pattern.priority || 50
            };

            this.preloadQueue.unshift(preloadPattern); // Add to front of queue
        }

        // Process immediately
        while (this.preloadQueue.length > 0 && this.activePreloads < this.config.maxConcurrentPreloads) {
            await this.processPreloadQueue();
        }
    }

    /**
     * Stop preloading system
     */
    stopPreloading(): void {
        if (this.preloadInterval) {
            clearInterval(this.preloadInterval);
            this.preloadInterval = undefined;
        }

        this.isPreloading = false;
        console.log('⏹️ Intelligent preloading stopped');
    }

    /**
     * Reset preloading system
     */
    reset(): void {
        this.usagePatterns.clear();
        this.preloadQueue = [];
        this.activePreloads = 0;
        console.log('🔄 Preloading system reset');
    }
}

// Singleton instance
export const intelligentPreloader = new IntelligentPreloader();