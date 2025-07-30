/**
 * QlooBatchProcessor - Batch processing for multiple Qloo API calls
 * 
 * This service implements batch processing to optimize performance by:
 * - Grouping multiple API calls into efficient batches
 * - Processing requests in parallel with rate limiting
 * - Implementing intelligent request deduplication
 * - Optimizing for personaCount parameter to avoid redundant calls
 * 
 * Requirements: 6.1, 6.4, 6.5
 */

import { QlooSignals } from '@/types/qloo-first';
import { getQlooCacheService } from './qloo-cache';

/**
 * Configuration for a batch request
 */
interface BatchRequestConfig {
    entityType: string;
    take: number;
    priority: number; // Higher number = higher priority
    signals: QlooSignals;
    additionalContext?: Record<string, any>;
}

/**
 * Result of a batch request
 */
interface BatchRequestResult {
    entityType: string;
    data: string[];
    cached: boolean;
    processingTime: number;
    error?: Error;
}

/**
 * Configuration for the batch processor
 */
interface BatchProcessorConfig {
    maxConcurrentRequests: number; // Maximum parallel requests
    batchSize: number; // Maximum requests per batch
    requestDelayMs: number; // Delay between requests to respect rate limits
    enableDeduplication: boolean; // Whether to deduplicate similar requests
    priorityThreshold: number; // Minimum priority for high-priority processing
}

/**
 * Default batch processor configuration
 */
const DEFAULT_BATCH_CONFIG: BatchProcessorConfig = {
    maxConcurrentRequests: 3,
    batchSize: 5,
    requestDelayMs: 100, // 100ms delay between requests
    enableDeduplication: true,
    priorityThreshold: 2
};

/**
 * Statistics for batch processing
 */
interface BatchProcessingStats {
    totalRequests: number;
    cachedRequests: number;
    deduplicatedRequests: number;
    failedRequests: number;
    averageProcessingTime: number;
    batchesProcessed: number;
}

/**
 * Batch processor for optimizing Qloo API calls
 */
export class QlooBatchProcessor {
    private config: BatchProcessorConfig;
    private stats: BatchProcessingStats;
    private activeRequests = new Set<string>();

    constructor(config: Partial<BatchProcessorConfig> = {}) {
        this.config = { ...DEFAULT_BATCH_CONFIG, ...config };
        this.stats = this.initializeStats();
    }

    /**
     * Create optimized batch requests based on signals and entity configuration
     * Requirements: 6.1 - Optimize for personaCount parameter to avoid redundant calls
     */
    createOptimizedRequests(
        signals: QlooSignals,
        entityTypesConfig: Array<{ type: string; take: number; priority: number }>
    ): BatchRequestConfig[] {
        const cacheService = getQlooCacheService();
        const requests: BatchRequestConfig[] = [];

        // Check if we can reuse data for multiple personas
        const canReuseData = cacheService.canReuseDataForPersonaCount(signals, signals.culturalContext.personaCount);

        for (const entityConfig of entityTypesConfig) {
            // Check cache first to avoid unnecessary requests
            const cachedData = cacheService.getEntityData(
                entityConfig.type,
                signals,
                entityConfig.take
            );

            if (cachedData) {
                // Data is already cached, skip this request
                this.stats.cachedRequests++;
                continue;
            }

            // Optimize take count based on persona count and caching
            let optimizedTake = entityConfig.take;
            
            if (canReuseData && signals.culturalContext.personaCount > 1) {
                // If we can reuse data, fetch slightly more to ensure diversity
                optimizedTake = Math.min(entityConfig.take * 1.5, entityConfig.take + 3);
            }

            const request: BatchRequestConfig = {
                entityType: entityConfig.type,
                take: Math.floor(optimizedTake),
                priority: entityConfig.priority,
                signals,
                additionalContext: {
                    personaCount: signals.culturalContext.personaCount,
                    canReuse: canReuseData
                }
            };

            requests.push(request);
        }

        // Sort by priority (highest first) for optimal processing order
        requests.sort((a, b) => b.priority - a.priority);

        return requests;
    }

    /**
     * Process batch requests with intelligent caching and parallel processing
     * Requirements: 6.4 - Batch processing for multiple Qloo API calls
     */
    async processBatch(
        requests: BatchRequestConfig[],
        fetchFunction: (entityType: string, signals: QlooSignals, take: number) => Promise<string[]>
    ): Promise<BatchRequestResult[]> {
        const startTime = Date.now();
        this.stats.batchesProcessed++;

        // Deduplicate requests if enabled
        const deduplicatedRequests = this.config.enableDeduplication 
            ? this.deduplicateRequests(requests)
            : requests;

        this.stats.deduplicatedRequests += requests.length - deduplicatedRequests.length;

        // Split into priority groups
        const highPriorityRequests = deduplicatedRequests.filter(r => r.priority >= this.config.priorityThreshold);
        const lowPriorityRequests = deduplicatedRequests.filter(r => r.priority < this.config.priorityThreshold);

        const results: BatchRequestResult[] = [];

        // Process high-priority requests first
        if (highPriorityRequests.length > 0) {
            const highPriorityResults = await this.processRequestGroup(
                highPriorityRequests,
                fetchFunction,
                'high-priority'
            );
            results.push(...highPriorityResults);
        }

        // Process low-priority requests
        if (lowPriorityRequests.length > 0) {
            const lowPriorityResults = await this.processRequestGroup(
                lowPriorityRequests,
                fetchFunction,
                'low-priority'
            );
            results.push(...lowPriorityResults);
        }

        // Update statistics
        this.stats.totalRequests += deduplicatedRequests.length;
        this.stats.failedRequests += results.filter(r => r.error).length;
        
        const totalProcessingTime = Date.now() - startTime;
        this.updateAverageProcessingTime(totalProcessingTime);

        console.log(`📦 Batch processed: ${results.length} requests in ${totalProcessingTime}ms`);

        return results;
    }

    /**
     * Process a group of requests with controlled concurrency
     */
    private async processRequestGroup(
        requests: BatchRequestConfig[],
        fetchFunction: (entityType: string, signals: QlooSignals, take: number) => Promise<string[]>,
        groupName: string
    ): Promise<BatchRequestResult[]> {
        const results: BatchRequestResult[] = [];
        const cacheService = getQlooCacheService();

        // Process requests in batches to respect concurrency limits
        for (let i = 0; i < requests.length; i += this.config.batchSize) {
            const batch = requests.slice(i, i + this.config.batchSize);
            
            console.log(`🔄 Processing ${groupName} batch ${Math.floor(i / this.config.batchSize) + 1}: ${batch.length} requests`);

            // Process batch with controlled concurrency
            const batchPromises = batch.map(async (request, index) => {
                // Add delay to respect rate limits
                if (index > 0) {
                    await this.delay(this.config.requestDelayMs * index);
                }

                return this.processIndividualRequest(request, fetchFunction, cacheService);
            });

            // Wait for batch to complete with concurrency control
            const batchResults = await this.processConcurrently(
                batchPromises,
                this.config.maxConcurrentRequests
            );

            results.push(...batchResults);
        }

        return results;
    }

    /**
     * Process an individual request with caching
     */
    private async processIndividualRequest(
        request: BatchRequestConfig,
        fetchFunction: (entityType: string, signals: QlooSignals, take: number) => Promise<string[]>,
        cacheService: any
    ): Promise<BatchRequestResult> {
        const requestStartTime = Date.now();
        const requestKey = this.generateRequestKey(request);

        // Check if this request is already being processed
        if (this.activeRequests.has(requestKey)) {
            console.log(`⏳ Request already in progress: ${request.entityType}`);
            // Wait a bit and check cache again
            await this.delay(50);
            const cachedData = cacheService.getEntityData(
                request.entityType,
                request.signals,
                request.take,
                request.additionalContext
            );
            
            if (cachedData) {
                return {
                    entityType: request.entityType,
                    data: cachedData,
                    cached: true,
                    processingTime: Date.now() - requestStartTime
                };
            }
        }

        // Mark request as active
        this.activeRequests.add(requestKey);

        try {
            // Check cache one more time before making the API call
            const cachedData = cacheService.getEntityData(
                request.entityType,
                request.signals,
                request.take,
                request.additionalContext
            );

            if (cachedData) {
                return {
                    entityType: request.entityType,
                    data: cachedData,
                    cached: true,
                    processingTime: Date.now() - requestStartTime
                };
            }

            // Make the API call
            console.log(`🌐 Fetching ${request.entityType} data (take: ${request.take}, priority: ${request.priority})`);
            
            const data = await fetchFunction(request.entityType, request.signals, request.take);

            // Cache the result
            cacheService.setEntityData(
                request.entityType,
                request.signals,
                request.take,
                data,
                request.additionalContext
            );

            return {
                entityType: request.entityType,
                data,
                cached: false,
                processingTime: Date.now() - requestStartTime
            };

        } catch (error) {
            console.error(`❌ Failed to fetch ${request.entityType} data:`, error);
            
            return {
                entityType: request.entityType,
                data: [],
                cached: false,
                processingTime: Date.now() - requestStartTime,
                error: error instanceof Error ? error : new Error(String(error))
            };

        } finally {
            // Remove from active requests
            this.activeRequests.delete(requestKey);
        }
    }

    /**
     * Deduplicate similar requests to avoid redundant API calls
     * Requirements: 6.5 - Avoid redundant calls
     */
    private deduplicateRequests(requests: BatchRequestConfig[]): BatchRequestConfig[] {
        const seen = new Map<string, BatchRequestConfig>();
        const deduplicated: BatchRequestConfig[] = [];

        for (const request of requests) {
            const key = this.generateRequestKey(request);
            
            if (!seen.has(key)) {
                seen.set(key, request);
                deduplicated.push(request);
            } else {
                // If we've seen this request before, keep the one with higher priority or higher take count
                const existing = seen.get(key)!;
                if (request.priority > existing.priority || 
                    (request.priority === existing.priority && request.take > existing.take)) {
                    seen.set(key, request);
                    // Replace in deduplicated array
                    const index = deduplicated.findIndex(r => this.generateRequestKey(r) === key);
                    if (index !== -1) {
                        deduplicated[index] = request;
                    }
                }
            }
        }

        return deduplicated;
    }

    /**
     * Generate a unique key for request deduplication
     */
    private generateRequestKey(request: BatchRequestConfig): string {
        const signalsKey = JSON.stringify({
            demographics: request.signals.demographics,
            interests: request.signals.interests.sort(),
            values: request.signals.values.sort(),
            language: request.signals.culturalContext.language
        });
        
        return `${request.entityType}:${request.take}:${signalsKey}`;
    }

    /**
     * Process promises with controlled concurrency
     */
    private async processConcurrently<T>(
        promises: Promise<T>[],
        maxConcurrency: number
    ): Promise<T[]> {
        const results: T[] = [];
        const executing: Promise<void>[] = [];

        for (const promise of promises) {
            const wrappedPromise = promise.then(result => {
                results.push(result);
            });

            executing.push(wrappedPromise);

            if (executing.length >= maxConcurrency) {
                await Promise.race(executing);
                // Remove completed promises
                const completedIndex = executing.findIndex(p => 
                    p === wrappedPromise || 
                    (p as any).isCompleted
                );
                if (completedIndex !== -1) {
                    executing.splice(completedIndex, 1);
                }
            }
        }

        // Wait for all remaining promises
        await Promise.all(executing);
        return results;
    }

    /**
     * Utility function to add delay
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Initialize processing statistics
     */
    private initializeStats(): BatchProcessingStats {
        return {
            totalRequests: 0,
            cachedRequests: 0,
            deduplicatedRequests: 0,
            failedRequests: 0,
            averageProcessingTime: 0,
            batchesProcessed: 0
        };
    }

    /**
     * Update average processing time
     */
    private updateAverageProcessingTime(newTime: number): void {
        if (this.stats.batchesProcessed === 1) {
            this.stats.averageProcessingTime = newTime;
        } else {
            this.stats.averageProcessingTime = 
                (this.stats.averageProcessingTime * (this.stats.batchesProcessed - 1) + newTime) / 
                this.stats.batchesProcessed;
        }
    }

    /**
     * Get processing statistics
     */
    getStats(): BatchProcessingStats {
        return { ...this.stats };
    }

    /**
     * Reset statistics
     */
    resetStats(): void {
        this.stats = this.initializeStats();
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<BatchProcessorConfig>): void {
        this.config = { ...this.config, ...newConfig };
        console.log('⚙️ Batch processor configuration updated:', newConfig);
    }

    /**
     * Get current configuration
     */
    getConfig(): BatchProcessorConfig {
        return { ...this.config };
    }

    /**
     * Clear active requests (mainly for cleanup)
     */
    clearActiveRequests(): void {
        this.activeRequests.clear();
    }
}

/**
 * Singleton instance for global batch processor
 */
let batchProcessorInstance: QlooBatchProcessor | null = null;

/**
 * Get the singleton batch processor instance
 */
export function getQlooBatchProcessor(config?: Partial<BatchProcessorConfig>): QlooBatchProcessor {
    if (!batchProcessorInstance) {
        batchProcessorInstance = new QlooBatchProcessor(config);
    }
    return batchProcessorInstance;
}

/**
 * Reset the singleton instance (mainly for testing)
 */
export function resetQlooBatchProcessor(): void {
    batchProcessorInstance = null;
}