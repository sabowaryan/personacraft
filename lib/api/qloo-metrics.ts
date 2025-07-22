// Comprehensive metrics and observability system for Qloo API
// Tracks API calls, success rates, performance metrics, and cache operations

import type { QlooErrorType } from '@/lib/types/qloo-compliant';

/**
 * API call metrics tracking
 */
export interface ApiCallMetrics {
  total: number;
  byEndpoint: Record<string, number>;
  byMethod: Record<string, number>;
  successRate: number;
  errorRate: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  totalSuccesses: number;
  totalErrors: number;
}

/**
 * Cache performance metrics
 */
export interface CacheMetrics {
  hitRate: number;
  missRate: number;
  totalHits: number;
  totalMisses: number;
  totalRequests: number;
  evictions: number;
  averageKeySize: number;
  totalMemoryUsage: number;
  byEndpoint: Record<string, {
    hits: number;
    misses: number;
    hitRate: number;
  }>;
}

/**
 * Error tracking metrics
 */
export interface ErrorMetrics {
  byType: Record<QlooErrorType, number>;
  byEndpoint: Record<string, number>;
  byStatusCode: Record<number, number>;
  fallbackUsage: number;
  retryAttempts: number;
  totalErrors: number;
  errorRate: number;
  mostCommonErrors: Array<{
    type: QlooErrorType;
    count: number;
    percentage: number;
  }>;
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  responseTime: {
    average: number;
    median: number;
    p95: number;
    p99: number;
    min: number;
    max: number;
  };
  throughput: {
    requestsPerSecond: number;
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  concurrency: {
    activeRequests: number;
    maxConcurrentRequests: number;
    averageConcurrency: number;
  };
}

/**
 * Health check metrics
 */
export interface HealthMetrics {
  isHealthy: boolean;
  lastHealthCheck: string;
  consecutiveFailures: number;
  uptime: number;
  connectivity: {
    status: 'connected' | 'disconnected' | 'degraded';
    latency: number;
    lastSuccessfulCall: string;
  };
  endpoints: Record<string, {
    status: 'healthy' | 'unhealthy' | 'degraded';
    lastCheck: string;
    responseTime: number;
  }>;
}

/**
 * Comprehensive Qloo metrics interface
 */
export interface QlooMetrics {
  apiCalls: ApiCallMetrics;
  cache: CacheMetrics;
  errors: ErrorMetrics;
  performance: PerformanceMetrics;
  health: HealthMetrics;
  timestamp: string;
  collectionPeriod: {
    start: string;
    end: string;
    durationMs: number;
  };
}

/**
 * Individual API call record for tracking
 */
export interface ApiCallRecord {
  id: string;
  timestamp: string;
  endpoint: string;
  method: string;
  params: Record<string, any>;
  responseTime: number;
  success: boolean;
  statusCode?: number;
  errorType?: QlooErrorType;
  cached: boolean;
  retryAttempt: number;
  userId?: string;
  sessionId?: string;
}

/**
 * Cache operation record
 */
export interface CacheOperationRecord {
  id: string;
  timestamp: string;
  operation: 'get' | 'set' | 'delete' | 'invalidate';
  key: string;
  endpoint: string;
  result: 'hit' | 'miss' | 'success' | 'error';
  keySize?: number;
  valueSize?: number;
  ttl?: number;
}

/**
 * Metrics collection configuration
 */
export interface MetricsConfig {
  enabled: boolean;
  collectionInterval: number; // milliseconds
  retentionPeriod: number; // milliseconds
  maxRecords: number;
  enableDetailedTracking: boolean;
  enablePerformanceTracking: boolean;
  enableHealthChecks: boolean;
  healthCheckInterval: number; // milliseconds
}

/**
 * Default metrics configuration
 */
const DEFAULT_METRICS_CONFIG: MetricsConfig = {
  enabled: true,
  collectionInterval: 60000, // 1 minute
  retentionPeriod: 86400000, // 24 hours
  maxRecords: 10000,
  enableDetailedTracking: true,
  enablePerformanceTracking: true,
  enableHealthChecks: true,
  healthCheckInterval: 300000 // 5 minutes
};

/**
 * Comprehensive metrics collector for Qloo API
 */
export class QlooMetricsCollector {
  private config: MetricsConfig;
  private apiCallRecords: ApiCallRecord[] = [];
  private cacheOperationRecords: CacheOperationRecord[] = [];
  private startTime: number;
  private activeRequests: number = 0;
  private maxConcurrentRequests: number = 0;
  private lastHealthCheck: Date | null = null;
  private consecutiveHealthFailures: number = 0;
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private metricsTimer: NodeJS.Timeout | null = null;

  constructor(config?: Partial<MetricsConfig>) {
    this.config = { ...DEFAULT_METRICS_CONFIG, ...config };
    this.startTime = Date.now();
    
    if (this.config.enabled) {
      this.startMetricsCollection();
      if (this.config.enableHealthChecks) {
        this.startHealthChecks();
      }
    }
  }

  /**
   * Record an API call
   */
  recordApiCall(record: Omit<ApiCallRecord, 'id' | 'timestamp'>): void {
    if (!this.config.enabled) return;

    const apiCallRecord: ApiCallRecord = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      ...record
    };

    this.apiCallRecords.push(apiCallRecord);
    this.cleanupOldRecords();

    // Update concurrent request tracking
    if (record.success) {
      this.activeRequests = Math.max(0, this.activeRequests - 1);
    }
  }

  /**
   * Record start of API call (for concurrency tracking)
   */
  recordApiCallStart(): string {
    if (!this.config.enabled) return '';

    this.activeRequests++;
    this.maxConcurrentRequests = Math.max(this.maxConcurrentRequests, this.activeRequests);
    
    return this.generateId();
  }

  /**
   * Record a cache operation
   */
  recordCacheOperation(record: Omit<CacheOperationRecord, 'id' | 'timestamp'>): void {
    if (!this.config.enabled) return;

    const cacheRecord: CacheOperationRecord = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      ...record
    };

    this.cacheOperationRecords.push(cacheRecord);
    this.cleanupOldRecords();
  }

  /**
   * Get current metrics snapshot
   */
  getMetrics(): QlooMetrics {
    const now = new Date();
    const collectionStart = new Date(this.startTime);

    return {
      apiCalls: this.calculateApiCallMetrics(),
      cache: this.calculateCacheMetrics(),
      errors: this.calculateErrorMetrics(),
      performance: this.calculatePerformanceMetrics(),
      health: this.calculateHealthMetrics(),
      timestamp: now.toISOString(),
      collectionPeriod: {
        start: collectionStart.toISOString(),
        end: now.toISOString(),
        durationMs: now.getTime() - this.startTime
      }
    };
  }

  /**
   * Reset all metrics
   */
  resetMetrics(): void {
    this.apiCallRecords = [];
    this.cacheOperationRecords = [];
    this.startTime = Date.now();
    this.activeRequests = 0;
    this.maxConcurrentRequests = 0;
    this.consecutiveHealthFailures = 0;
  }

  /**
   * Get metrics for a specific time period
   */
  getMetricsForPeriod(startTime: Date, endTime: Date): QlooMetrics {
    const filteredApiCalls = this.apiCallRecords.filter(record => {
      const recordTime = new Date(record.timestamp);
      return recordTime >= startTime && recordTime <= endTime;
    });

    const filteredCacheOps = this.cacheOperationRecords.filter(record => {
      const recordTime = new Date(record.timestamp);
      return recordTime >= startTime && recordTime <= endTime;
    });

    // Temporarily store current records
    const originalApiCalls = this.apiCallRecords;
    const originalCacheOps = this.cacheOperationRecords;

    // Set filtered records
    this.apiCallRecords = filteredApiCalls;
    this.cacheOperationRecords = filteredCacheOps;

    // Calculate metrics
    const metrics = {
      apiCalls: this.calculateApiCallMetrics(),
      cache: this.calculateCacheMetrics(),
      errors: this.calculateErrorMetrics(),
      performance: this.calculatePerformanceMetrics(),
      health: this.calculateHealthMetrics(),
      timestamp: new Date().toISOString(),
      collectionPeriod: {
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        durationMs: endTime.getTime() - startTime.getTime()
      }
    };

    // Restore original records
    this.apiCallRecords = originalApiCalls;
    this.cacheOperationRecords = originalCacheOps;

    return metrics;
  }

  /**
   * Calculate API call metrics
   */
  private calculateApiCallMetrics(): ApiCallMetrics {
    const total = this.apiCallRecords.length;
    const successes = this.apiCallRecords.filter(r => r.success).length;
    const errors = total - successes;

    const byEndpoint: Record<string, number> = {};
    const byMethod: Record<string, number> = {};
    const responseTimes: number[] = [];

    this.apiCallRecords.forEach(record => {
      byEndpoint[record.endpoint] = (byEndpoint[record.endpoint] || 0) + 1;
      byMethod[record.method] = (byMethod[record.method] || 0) + 1;
      responseTimes.push(record.responseTime);
    });

    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    const sortedTimes = responseTimes.sort((a, b) => a - b);
    const p95ResponseTime = this.calculatePercentile(sortedTimes, 95);
    const p99ResponseTime = this.calculatePercentile(sortedTimes, 99);

    return {
      total,
      byEndpoint,
      byMethod,
      successRate: total > 0 ? (successes / total) * 100 : 0,
      errorRate: total > 0 ? (errors / total) * 100 : 0,
      averageResponseTime,
      p95ResponseTime,
      p99ResponseTime,
      totalSuccesses: successes,
      totalErrors: errors
    };
  }

  /**
   * Calculate cache metrics
   */
  private calculateCacheMetrics(): CacheMetrics {
    const cacheGets = this.cacheOperationRecords.filter(r => r.operation === 'get');
    const hits = cacheGets.filter(r => r.result === 'hit').length;
    const misses = cacheGets.filter(r => r.result === 'miss').length;
    const total = hits + misses;
    const evictions = this.cacheOperationRecords.filter(r => r.operation === 'delete').length;

    const byEndpoint: Record<string, { hits: number; misses: number; hitRate: number }> = {};
    
    cacheGets.forEach(record => {
      if (!byEndpoint[record.endpoint]) {
        byEndpoint[record.endpoint] = { hits: 0, misses: 0, hitRate: 0 };
      }
      
      if (record.result === 'hit') {
        byEndpoint[record.endpoint].hits++;
      } else if (record.result === 'miss') {
        byEndpoint[record.endpoint].misses++;
      }
    });

    // Calculate hit rates per endpoint
    Object.keys(byEndpoint).forEach(endpoint => {
      const endpointTotal = byEndpoint[endpoint].hits + byEndpoint[endpoint].misses;
      byEndpoint[endpoint].hitRate = endpointTotal > 0 
        ? (byEndpoint[endpoint].hits / endpointTotal) * 100 
        : 0;
    });

    const keySizes = this.cacheOperationRecords
      .filter(r => r.keySize)
      .map(r => r.keySize!);
    
    const averageKeySize = keySizes.length > 0 
      ? keySizes.reduce((sum, size) => sum + size, 0) / keySizes.length 
      : 0;

    const valueSizes = this.cacheOperationRecords
      .filter(r => r.valueSize)
      .map(r => r.valueSize!);
    
    const totalMemoryUsage = valueSizes.reduce((sum, size) => sum + size, 0);

    return {
      hitRate: total > 0 ? (hits / total) * 100 : 0,
      missRate: total > 0 ? (misses / total) * 100 : 0,
      totalHits: hits,
      totalMisses: misses,
      totalRequests: total,
      evictions,
      averageKeySize,
      totalMemoryUsage,
      byEndpoint
    };
  }

  /**
   * Calculate error metrics
   */
  private calculateErrorMetrics(): ErrorMetrics {
    const errorRecords = this.apiCallRecords.filter(r => !r.success);
    const totalRequests = this.apiCallRecords.length;

    const byType: Record<QlooErrorType, number> = {} as Record<QlooErrorType, number>;
    const byEndpoint: Record<string, number> = {};
    const byStatusCode: Record<number, number> = {};

    errorRecords.forEach(record => {
      if (record.errorType) {
        byType[record.errorType] = (byType[record.errorType] || 0) + 1;
      }
      
      byEndpoint[record.endpoint] = (byEndpoint[record.endpoint] || 0) + 1;
      
      if (record.statusCode) {
        byStatusCode[record.statusCode] = (byStatusCode[record.statusCode] || 0) + 1;
      }
    });

    const fallbackUsage = this.apiCallRecords.filter(r => r.cached && !r.success).length;
    const retryAttempts = this.apiCallRecords.filter(r => r.retryAttempt > 1).length;

    // Calculate most common errors
    const mostCommonErrors = Object.entries(byType)
      .map(([type, count]) => ({
        type: type as QlooErrorType,
        count,
        percentage: errorRecords.length > 0 ? (count / errorRecords.length) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      byType,
      byEndpoint,
      byStatusCode,
      fallbackUsage,
      retryAttempts,
      totalErrors: errorRecords.length,
      errorRate: totalRequests > 0 ? (errorRecords.length / totalRequests) * 100 : 0,
      mostCommonErrors
    };
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics(): PerformanceMetrics {
    const responseTimes = this.apiCallRecords.map(r => r.responseTime);
    const sortedTimes = responseTimes.sort((a, b) => a - b);

    const now = Date.now();
    const oneSecondAgo = now - 1000;
    const oneMinuteAgo = now - 60000;
    const oneHourAgo = now - 3600000;

    const recentRequests = this.apiCallRecords.filter(r => 
      new Date(r.timestamp).getTime() > oneSecondAgo
    );
    const lastMinuteRequests = this.apiCallRecords.filter(r => 
      new Date(r.timestamp).getTime() > oneMinuteAgo
    );
    const lastHourRequests = this.apiCallRecords.filter(r => 
      new Date(r.timestamp).getTime() > oneHourAgo
    );

    return {
      responseTime: {
        average: responseTimes.length > 0 
          ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
          : 0,
        median: this.calculatePercentile(sortedTimes, 50),
        p95: this.calculatePercentile(sortedTimes, 95),
        p99: this.calculatePercentile(sortedTimes, 99),
        min: sortedTimes.length > 0 ? sortedTimes[0] : 0,
        max: sortedTimes.length > 0 ? sortedTimes[sortedTimes.length - 1] : 0
      },
      throughput: {
        requestsPerSecond: recentRequests.length,
        requestsPerMinute: lastMinuteRequests.length,
        requestsPerHour: lastHourRequests.length
      },
      concurrency: {
        activeRequests: this.activeRequests,
        maxConcurrentRequests: this.maxConcurrentRequests,
        averageConcurrency: this.calculateAverageConcurrency()
      }
    };
  }

  /**
   * Calculate health metrics
   */
  private calculateHealthMetrics(): HealthMetrics {
    const recentErrors = this.apiCallRecords
      .filter(r => !r.success && new Date(r.timestamp).getTime() > Date.now() - 300000) // Last 5 minutes
      .length;

    const recentSuccesses = this.apiCallRecords
      .filter(r => r.success && new Date(r.timestamp).getTime() > Date.now() - 300000)
      .length;

    const recentTotal = recentErrors + recentSuccesses;
    const recentErrorRate = recentTotal > 0 ? (recentErrors / recentTotal) * 100 : 0;

    const isHealthy = recentErrorRate < 10 && this.consecutiveHealthFailures < 3;

    const lastSuccessfulCall = this.apiCallRecords
      .filter(r => r.success)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

    // Calculate endpoint health
    const endpoints: Record<string, { status: 'healthy' | 'unhealthy' | 'degraded'; lastCheck: string; responseTime: number }> = {};
    
    const endpointGroups = this.groupBy(this.apiCallRecords, 'endpoint');
    Object.entries(endpointGroups).forEach(([endpoint, records]) => {
      const recentRecords = records.filter(r => 
        new Date(r.timestamp).getTime() > Date.now() - 300000
      );
      
      if (recentRecords.length === 0) {
        endpoints[endpoint] = {
          status: 'unhealthy',
          lastCheck: 'never',
          responseTime: 0
        };
        return;
      }

      const endpointErrors = recentRecords.filter(r => !r.success).length;
      const endpointErrorRate = (endpointErrors / recentRecords.length) * 100;
      const avgResponseTime = recentRecords.reduce((sum, r) => sum + r.responseTime, 0) / recentRecords.length;

      let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
      if (endpointErrorRate > 20) {
        status = 'unhealthy';
      } else if (endpointErrorRate > 5 || avgResponseTime > 5000) {
        status = 'degraded';
      }

      endpoints[endpoint] = {
        status,
        lastCheck: recentRecords[recentRecords.length - 1].timestamp,
        responseTime: avgResponseTime
      };
    });

    return {
      isHealthy,
      lastHealthCheck: this.lastHealthCheck?.toISOString() || 'never',
      consecutiveFailures: this.consecutiveHealthFailures,
      uptime: Date.now() - this.startTime,
      connectivity: {
        status: isHealthy ? 'connected' : (recentErrorRate > 50 ? 'disconnected' : 'degraded'),
        latency: this.calculateAverageLatency(),
        lastSuccessfulCall: lastSuccessfulCall?.timestamp || 'never'
      },
      endpoints
    };
  }

  /**
   * Start periodic metrics collection
   */
  private startMetricsCollection(): void {
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
    }

    this.metricsTimer = setInterval(() => {
      this.cleanupOldRecords();
    }, this.config.collectionInterval);
  }

  /**
   * Start health checks
   */
  private startHealthChecks(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  /**
   * Perform health check
   */
  private performHealthCheck(): void {
    this.lastHealthCheck = new Date();
    
    // Simple health check based on recent error rates
    const recentRecords = this.apiCallRecords.filter(r => 
      new Date(r.timestamp).getTime() > Date.now() - 300000
    );

    if (recentRecords.length === 0) {
      return; // No recent activity to check
    }

    const recentErrors = recentRecords.filter(r => !r.success).length;
    const errorRate = (recentErrors / recentRecords.length) * 100;

    if (errorRate > 20) {
      this.consecutiveHealthFailures++;
    } else {
      this.consecutiveHealthFailures = 0;
    }
  }

  /**
   * Clean up old records based on retention policy
   */
  private cleanupOldRecords(): void {
    const cutoffTime = Date.now() - this.config.retentionPeriod;

    this.apiCallRecords = this.apiCallRecords
      .filter(record => new Date(record.timestamp).getTime() > cutoffTime)
      .slice(-this.config.maxRecords);

    this.cacheOperationRecords = this.cacheOperationRecords
      .filter(record => new Date(record.timestamp).getTime() > cutoffTime)
      .slice(-this.config.maxRecords);
  }

  /**
   * Calculate percentile from sorted array
   */
  private calculatePercentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0;
    
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, Math.min(index, sortedArray.length - 1))];
  }

  /**
   * Calculate average concurrency
   */
  private calculateAverageConcurrency(): number {
    // This is a simplified calculation
    // In a real implementation, you'd track concurrency over time
    return this.maxConcurrentRequests / 2;
  }

  /**
   * Calculate average latency
   */
  private calculateAverageLatency(): number {
    const recentRecords = this.apiCallRecords.filter(r => 
      new Date(r.timestamp).getTime() > Date.now() - 60000
    );

    if (recentRecords.length === 0) return 0;

    return recentRecords.reduce((sum, r) => sum + r.responseTime, 0) / recentRecords.length;
  }

  /**
   * Group array by key
   */
  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Stop metrics collection
   */
  stop(): void {
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
      this.metricsTimer = null;
    }

    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }
}

/**
 * Default metrics collector instance
 */
export const defaultMetricsCollector = new QlooMetricsCollector();

/**
 * Utility function to create metrics collector with custom config
 */
export function createMetricsCollector(config?: Partial<MetricsConfig>): QlooMetricsCollector {
  return new QlooMetricsCollector(config);
}