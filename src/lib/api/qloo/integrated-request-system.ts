import { optimizedCache } from './optimized-cache';
import { advancedOptimizer } from './advanced-performance-optimizer';
import { intelligentPreloader } from './intelligent-preloader';
import { realTimeMonitor } from './real-time-monitor';

interface QlooRequestParams {
  entityType: string;
  age?: number;
  location?: string;
  occupation?: string;
  interests?: string[];
  values?: string[];
  take?: number;
}

interface RequestOptions {
  priority?: number;
  timeout?: number;
  retries?: number;
  enablePreloading?: boolean;
}

export class IntegratedRequestSystem {
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the integrated system
   */
  private initialize(): void {
    if (this.isInitialized) return;

    console.log('🚀 Initializing integrated request system');
    
    // Start real-time monitoring
    realTimeMonitor.startMonitoring();
    
    // Setup preloading patterns based on common requests
    this.setupCommonPreloadPatterns();
    
    this.isInitialized = true;
    console.log('✅ Integrated request system initialized');
  }

  /**
   * Main method to make optimized Qloo API requests
   */
  async makeOptimizedRequest<T>(
    params: QlooRequestParams,
    requestFn: () => Promise<T>,
    options: RequestOptions = {}
  ): Promise<T> {
    const startTime = Date.now();
    const cacheKey = optimizedCache.generateKey(params);
    
    try {
      // Record usage pattern for intelligent preloading
      intelligentPreloader.recordUsage(
        params.entityType,
        params,
        0 // Will be updated after request
      );

      // Execute optimized request
      const result = await advancedOptimizer.executeOptimizedRequest(
        cacheKey,
        requestFn,
        {
          entityType: params.entityType,
          priority: options.priority || 1,
          timeout: options.timeout,
          retries: options.retries
        }
      );

      const responseTime = Date.now() - startTime;
      
      // Record successful request
      realTimeMonitor.recordRequest(
        params.entityType,
        responseTime,
        true,
        optimizedCache.get(cacheKey) !== null
      );

      // Update preloader with actual response time
      intelligentPreloader.recordUsage(
        params.entityType,
        params,
        responseTime
      );

      console.log(`✅ ${params.entityType} request completed in ${responseTime}ms`);
      return result;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Record failed request
      realTimeMonitor.recordRequest(
        params.entityType,
        responseTime,
        false,
        false
      );

      console.error(`❌ ${params.entityType} request failed after ${responseTime}ms:`, error);
      throw error;
    }
  }

  /**
   * Batch multiple requests with intelligent prioritization
   */
  async makeBatchRequests<T>(
    requests: Array<{
      params: QlooRequestParams;
      requestFn: () => Promise<T>;
      options?: RequestOptions;
    }>
  ): Promise<T[]> {
    console.log(`📦 Processing batch of ${requests.length} requests`);

    // Sort by priority (higher priority first)
    const sortedRequests = requests.sort((a, b) => 
      (b.options?.priority || 1) - (a.options?.priority || 1)
    );

    // Execute requests with concurrency control
    const results: T[] = [];
    const concurrentLimit = 3; // Adjust based on system capacity
    
    for (let i = 0; i < sortedRequests.length; i += concurrentLimit) {
      const batch = sortedRequests.slice(i, i + concurrentLimit);
      
      const batchPromises = batch.map(request =>
        this.makeOptimizedRequest(
          request.params,
          request.requestFn,
          request.options
        )
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    console.log(`✅ Batch completed: ${results.length} requests processed`);
    return results;
  }

  /**
   * Setup common preload patterns based on typical usage
   */
  private setupCommonPreloadPatterns(): void {
    const commonPatterns = [
      // Tech professionals
      {
        entityType: 'music',
        params: { age: 30, occupation: 'developer', take: 5 },
        priority: 80
      },
      {
        entityType: 'brand',
        params: { age: 30, occupation: 'developer', take: 5 },
        priority: 70
      },
      
      // Business professionals
      {
        entityType: 'music',
        params: { age: 35, occupation: 'manager', take: 5 },
        priority: 75
      },
      {
        entityType: 'travel',
        params: { age: 35, occupation: 'manager', take: 4 },
        priority: 65
      },
      
      // Creative professionals
      {
        entityType: 'fashion',
        params: { age: 28, occupation: 'designer', take: 4 },
        priority: 70
      },
      {
        entityType: 'beauty',
        params: { age: 28, occupation: 'designer', take: 3 },
        priority: 60
      },
      
      // General patterns
      {
        entityType: 'movie',
        params: { age: 30, location: 'global', take: 4 },
        priority: 60
      },
      {
        entityType: 'book',
        params: { age: 30, location: 'global', take: 4 },
        priority: 55
      }
    ];

    // Trigger preloading for common patterns
    intelligentPreloader.preloadPatterns(commonPatterns);
  }

  /**
   * Get comprehensive system statistics
   */
  getSystemStats(): {
    cache: ReturnType<typeof optimizedCache.getStats>;
    optimizer: ReturnType<typeof advancedOptimizer.getMetrics>;
    preloader: ReturnType<typeof intelligentPreloader.getStats>;
    monitor: ReturnType<typeof realTimeMonitor.getDashboardData>;
  } {
    return {
      cache: optimizedCache.getStats(),
      optimizer: advancedOptimizer.getMetrics(),
      preloader: intelligentPreloader.getStats(),
      monitor: realTimeMonitor.getDashboardData()
    };
  }

  /**
   * Warm cache with specific patterns
   */
  async warmCache(patterns: Array<{
    entityType: string;
    params: any;
    mockData?: any;
  }>): Promise<void> {
    console.log(`🔥 Warming cache with ${patterns.length} patterns`);

    const cacheEntries = patterns.map(pattern => ({
      key: optimizedCache.generateKey({
        entityType: pattern.entityType,
        ...pattern.params
      }),
      data: pattern.mockData || this.generateMockData(pattern.entityType, pattern.params.take || 5)
    }));

    await optimizedCache.warmCache(cacheEntries);
    console.log(`✅ Cache warmed with ${cacheEntries.length} entries`);
  }

  /**
   * Generate mock data for cache warming
   */
  private generateMockData(entityType: string, count: number): any[] {
    const mockData = [];
    
    for (let i = 0; i < count; i++) {
      mockData.push({
        id: `${entityType}_${i}_${Date.now()}`,
        name: `Sample ${entityType} ${i}`,
        type: entityType,
        relevanceScore: Math.random() * 100,
        metadata: {
          cached: true,
          timestamp: Date.now()
        }
      });
    }
    
    return mockData;
  }

  /**
   * Handle performance alerts and auto-optimization
   */
  setupAutoOptimization(): void {
    realTimeMonitor.on('alert:triggered', (alert: any) => {
      console.log(`🚨 Performance alert: ${alert.message}`);
      
      switch (alert.metric) {
        case 'responseTime':
          if (alert.type === 'CRITICAL') {
            // Boost preloading for slow entity types
            if (alert.entityType) {
              console.log(`🚀 Boosting preloading for ${alert.entityType}`);
              this.boostPreloadingForEntity(alert.entityType);
            }
          }
          break;
          
        case 'cacheHitRate':
          if (alert.value < 0.3) {
            console.log('📈 Low cache hit rate detected, warming cache');
            this.setupCommonPreloadPatterns();
          }
          break;
          
        case 'queueLength':
          if (alert.value > 10) {
            console.log('⚠️ High queue length, reducing concurrent requests');
            // The advanced optimizer will handle this automatically
          }
          break;
      }
    });

    // Monitor cache performance every 5 minutes
    setInterval(() => {
      const stats = this.getSystemStats();
      
      if (stats.cache.hitRate < 0.3) {
        console.log(`📊 Cache hit rate: ${Math.round(stats.cache.hitRate * 100)}% - Consider warming cache`);
      }
      
      if (stats.optimizer.averageResponseTime > 3000) {
        console.log(`📊 Average response time: ${Math.round(stats.optimizer.averageResponseTime)}ms - Consider optimization`);
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Boost preloading for specific entity type
   */
  private async boostPreloadingForEntity(entityType: string): Promise<void> {
    const boostPatterns = [
      {
        entityType,
        params: { age: 30, location: 'global', take: 5 },
        priority: 90
      },
      {
        entityType,
        params: { age: 35, location: 'global', take: 5 },
        priority: 85
      },
      {
        entityType,
        params: { age: 25, location: 'global', take: 5 },
        priority: 80
      }
    ];

    await intelligentPreloader.preloadPatterns(boostPatterns);
  }

  /**
   * Reset all systems (useful for testing)
   */
  reset(): void {
    optimizedCache.clear();
    advancedOptimizer.reset();
    intelligentPreloader.reset();
    realTimeMonitor.reset();
    console.log('🔄 All systems reset');
  }

  /**
   * Graceful shutdown
   */
  shutdown(): void {
    realTimeMonitor.stopMonitoring();
    intelligentPreloader.stopPreloading();
    optimizedCache.destroy();
    console.log('⏹️ Integrated request system shutdown');
  }
}

// Singleton instance
export const integratedRequestSystem = new IntegratedRequestSystem();