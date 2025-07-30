import { optimizedCache } from './optimized-cache';
import { requestBatcher, prioritizer } from './request-batcher';

interface PerformanceMetrics {
  totalRequests: number;
  averageResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  throughput: number;
  concurrentRequests: number;
  queueLength: number;
}

interface OptimizationConfig {
  enableAdaptiveTimeout: boolean;
  enableCircuitBreaker: boolean;
  enableRequestDeduplication: boolean;
  enablePredictivePreloading: boolean;
  maxConcurrentRequests: number;
  adaptiveTimeoutMin: number;
  adaptiveTimeoutMax: number;
  circuitBreakerThreshold: number;
}

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  nextAttemptTime: number;
}

export class AdvancedPerformanceOptimizer {
  private metrics: PerformanceMetrics = {
    totalRequests: 0,
    averageResponseTime: 0,
    cacheHitRate: 0,
    errorRate: 0,
    throughput: 0,
    concurrentRequests: 0,
    queueLength: 0
  };

  private config: OptimizationConfig = {
    enableAdaptiveTimeout: true,
    enableCircuitBreaker: true,
    enableRequestDeduplication: true,
    enablePredictivePreloading: true,
    maxConcurrentRequests: 8,
    adaptiveTimeoutMin: 3000,
    adaptiveTimeoutMax: 15000,
    circuitBreakerThreshold: 5
  };

  private circuitBreakers = new Map<string, CircuitBreakerState>();
  private pendingRequests = new Map<string, Promise<any>>();
  private responseTimeHistory: number[] = [];
  private requestQueue: Array<() => Promise<any>> = [];
  private activeRequests = 0;

  constructor(config?: Partial<OptimizationConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    // Start metrics collection
    this.startMetricsCollection();
  }

  /**
   * Optimized request execution with all performance enhancements
   */
  async executeOptimizedRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
    options: {
      entityType: string;
      priority?: number;
      timeout?: number;
      retries?: number;
    }
  ): Promise<T> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      // 1. Check cache first
      const cachedResult = optimizedCache.get<T>(key);
      if (cachedResult) {
        this.updateMetrics(startTime, true);
        return cachedResult;
      }

      // 2. Request deduplication
      if (this.config.enableRequestDeduplication && this.pendingRequests.has(key)) {
        console.log(`🔄 Deduplicating request: ${key}`);
        return await this.pendingRequests.get(key);
      }

      // 3. Circuit breaker check
      if (this.config.enableCircuitBreaker && !this.isCircuitClosed(options.entityType)) {
        throw new Error(`Circuit breaker OPEN for ${options.entityType}`);
      }

      // 4. Queue management
      if (this.activeRequests >= this.config.maxConcurrentRequests) {
        await this.queueRequest();
      }

      // 5. Execute with optimizations
      const optimizedRequest = this.wrapWithOptimizations(key, requestFn, options);
      
      if (this.config.enableRequestDeduplication) {
        this.pendingRequests.set(key, optimizedRequest);
      }

      const result = await optimizedRequest;
      
      // 6. Cache successful result
      optimizedCache.set(key, result);
      
      // 7. Update circuit breaker
      this.recordSuccess(options.entityType);
      
      this.updateMetrics(startTime, false);
      return result;

    } catch (error) {
      this.recordFailure(options.entityType);
      this.updateMetrics(startTime, false, true);
      throw error;
    } finally {
      this.pendingRequests.delete(key);
      this.activeRequests--;
      this.processQueue();
    }
  }

  /**
   * Wrap request with all optimization layers
   */
  private async wrapWithOptimizations<T>(
    key: string,
    requestFn: () => Promise<T>,
    options: any
  ): Promise<T> {
    this.activeRequests++;

    // Adaptive timeout
    const timeout = this.config.enableAdaptiveTimeout 
      ? this.calculateAdaptiveTimeout(options.entityType)
      : options.timeout || 8000;

    // Retry with exponential backoff
    const maxRetries = options.retries || 2;
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeWithTimeout(requestFn, timeout);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          const backoffDelay = Math.min(1000 * Math.pow(2, attempt), 5000);
          console.log(`🔄 Retry ${attempt + 1}/${maxRetries} for ${key} after ${backoffDelay}ms`);
          await this.sleep(backoffDelay);
        }
      }
    }

    throw lastError!;
  }

  /**
   * Execute request with timeout
   */
  private async executeWithTimeout<T>(
    requestFn: () => Promise<T>,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      requestFn(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      )
    ]);
  }

  /**
   * Calculate adaptive timeout based on historical performance
   */
  private calculateAdaptiveTimeout(entityType: string): number {
    const recentResponses = this.responseTimeHistory.slice(-20);
    if (recentResponses.length === 0) {
      return this.config.adaptiveTimeoutMin;
    }

    const avgResponseTime = recentResponses.reduce((a, b) => a + b, 0) / recentResponses.length;
    const p95ResponseTime = this.calculatePercentile(recentResponses, 0.95);
    
    // Base timeout on P95 + buffer
    const adaptiveTimeout = Math.max(
      p95ResponseTime * 1.5,
      this.config.adaptiveTimeoutMin
    );

    return Math.min(adaptiveTimeout, this.config.adaptiveTimeoutMax);
  }

  /**
   * Circuit breaker implementation
   */
  private isCircuitClosed(entityType: string): boolean {
    const breaker = this.circuitBreakers.get(entityType);
    if (!breaker) return true;

    const now = Date.now();

    switch (breaker.state) {
      case 'CLOSED':
        return true;
      
      case 'OPEN':
        if (now >= breaker.nextAttemptTime) {
          breaker.state = 'HALF_OPEN';
          console.log(`🔄 Circuit breaker HALF_OPEN for ${entityType}`);
          return true;
        }
        return false;
      
      case 'HALF_OPEN':
        return true;
      
      default:
        return true;
    }
  }

  private recordSuccess(entityType: string): void {
    const breaker = this.circuitBreakers.get(entityType);
    if (breaker) {
      if (breaker.state === 'HALF_OPEN') {
        breaker.state = 'CLOSED';
        breaker.failures = 0;
        console.log(`✅ Circuit breaker CLOSED for ${entityType}`);
      }
    }
  }

  private recordFailure(entityType: string): void {
    let breaker = this.circuitBreakers.get(entityType);
    if (!breaker) {
      breaker = {
        failures: 0,
        lastFailureTime: 0,
        state: 'CLOSED',
        nextAttemptTime: 0
      };
      this.circuitBreakers.set(entityType, breaker);
    }

    breaker.failures++;
    breaker.lastFailureTime = Date.now();

    if (breaker.failures >= this.config.circuitBreakerThreshold) {
      breaker.state = 'OPEN';
      breaker.nextAttemptTime = Date.now() + (30 * 1000); // 30 seconds
      console.log(`🚫 Circuit breaker OPEN for ${entityType} (${breaker.failures} failures)`);
    }
  }

  /**
   * Request queue management
   */
  private async queueRequest(): Promise<void> {
    return new Promise((resolve) => {
      this.requestQueue.push(async () => {
        resolve();
        return Promise.resolve();
      });
      this.metrics.queueLength = this.requestQueue.length;
    });
  }

  private processQueue(): void {
    if (this.requestQueue.length > 0 && this.activeRequests < this.config.maxConcurrentRequests) {
      const nextRequest = this.requestQueue.shift();
      if (nextRequest) {
        nextRequest();
        this.metrics.queueLength = this.requestQueue.length;
      }
    }
  }

  /**
   * Predictive preloading based on usage patterns
   */
  async enablePredictivePreloading(
    commonPatterns: Array<{
      entityType: string;
      params: any;
      frequency: number;
    }>
  ): Promise<void> {
    if (!this.config.enablePredictivePreloading) return;

    console.log(`🔮 Starting predictive preloading for ${commonPatterns.length} patterns`);

    // Sort by frequency and preload most common
    const sortedPatterns = commonPatterns
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10); // Top 10 patterns

    for (const pattern of sortedPatterns) {
      const cacheKey = optimizedCache.generateKey({
        entityType: pattern.entityType,
        ...pattern.params
      });

      // Only preload if not already cached
      if (!optimizedCache.get(cacheKey)) {
        try {
          // Simulate preloading (would call actual API in real implementation)
          console.log(`🔄 Preloading ${pattern.entityType} data`);
          await this.sleep(100); // Simulate API call
        } catch (error) {
          console.warn(`⚠️ Preloading failed for ${pattern.entityType}:`, error);
        }
      }
    }

    console.log(`✅ Predictive preloading completed`);
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(startTime: number, cacheHit: boolean, error: boolean = false): void {
    const responseTime = Date.now() - startTime;
    
    if (!cacheHit) {
      this.responseTimeHistory.push(responseTime);
      if (this.responseTimeHistory.length > 100) {
        this.responseTimeHistory.shift();
      }
    }

    // Update running averages
    const totalTime = this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + responseTime;
    this.metrics.averageResponseTime = totalTime / this.metrics.totalRequests;

    // Update cache hit rate
    const cacheStats = optimizedCache.getStats();
    this.metrics.cacheHitRate = cacheStats.hitRate;

    // Update error rate
    if (error) {
      this.metrics.errorRate = (this.metrics.errorRate * (this.metrics.totalRequests - 1) + 1) / this.metrics.totalRequests;
    } else {
      this.metrics.errorRate = (this.metrics.errorRate * (this.metrics.totalRequests - 1)) / this.metrics.totalRequests;
    }

    this.metrics.concurrentRequests = this.activeRequests;
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    setInterval(() => {
      // Calculate throughput (requests per second)
      const now = Date.now();
      const recentRequests = this.responseTimeHistory.filter(
        time => now - time < 60000 // Last minute
      ).length;
      this.metrics.throughput = recentRequests / 60;

      // Log performance summary every 5 minutes
      if (this.metrics.totalRequests > 0 && this.metrics.totalRequests % 50 === 0) {
        this.logPerformanceSummary();
      }
    }, 10000); // Every 10 seconds
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus(): Record<string, CircuitBreakerState> {
    const status: Record<string, CircuitBreakerState> = {};
    for (const [entityType, breaker] of this.circuitBreakers.entries()) {
      status[entityType] = { ...breaker };
    }
    return status;
  }

  /**
   * Log performance summary
   */
  private logPerformanceSummary(): void {
    console.log(`
📊 Performance Summary:
   Total Requests: ${this.metrics.totalRequests}
   Avg Response Time: ${Math.round(this.metrics.averageResponseTime)}ms
   Cache Hit Rate: ${Math.round(this.metrics.cacheHitRate * 100)}%
   Error Rate: ${Math.round(this.metrics.errorRate * 100)}%
   Throughput: ${Math.round(this.metrics.throughput)} req/min
   Active Requests: ${this.metrics.concurrentRequests}
   Queue Length: ${this.metrics.queueLength}
    `);
  }

  /**
   * Utility functions
   */
  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * percentile) - 1;
    return sorted[index] || 0;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Reset all metrics and state
   */
  reset(): void {
    this.metrics = {
      totalRequests: 0,
      averageResponseTime: 0,
      cacheHitRate: 0,
      errorRate: 0,
      throughput: 0,
      concurrentRequests: 0,
      queueLength: 0
    };
    this.circuitBreakers.clear();
    this.pendingRequests.clear();
    this.responseTimeHistory = [];
    this.requestQueue = [];
    this.activeRequests = 0;
  }
}

// Singleton instance
export const advancedOptimizer = new AdvancedPerformanceOptimizer();