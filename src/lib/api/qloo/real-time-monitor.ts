import { EventEmitter } from 'events';

interface PerformanceAlert {
  id: string;
  type: 'WARNING' | 'ERROR' | 'CRITICAL';
  message: string;
  timestamp: number;
  entityType?: string;
  metric: string;
  value: number;
  threshold: number;
}

interface MonitoringConfig {
  alertThresholds: {
    responseTime: number;
    errorRate: number;
    cacheHitRate: number;
    queueLength: number;
    memoryUsage: number;
  };
  samplingInterval: number;
  retentionPeriod: number;
  enableRealTimeAlerts: boolean;
}

interface MetricSnapshot {
  timestamp: number;
  responseTime: number;
  cacheHitRate: number;
  errorRate: number;
  throughput: number;
  queueLength: number;
  memoryUsage: number;
  activeRequests: number;
  entityBreakdown: Record<string, {
    requests: number;
    avgResponseTime: number;
    errorRate: number;
  }>;
}

export class RealTimeMonitor extends EventEmitter {
  private config: MonitoringConfig = {
    alertThresholds: {
      responseTime: 5000,    // 5 seconds
      errorRate: 0.1,        // 10%
      cacheHitRate: 0.3,     // 30% minimum
      queueLength: 20,       // 20 queued requests
      memoryUsage: 100 * 1024 * 1024 // 100MB
    },
    samplingInterval: 5000,  // 5 seconds
    retentionPeriod: 3600000, // 1 hour
    enableRealTimeAlerts: true
  };

  private metrics: MetricSnapshot[] = [];
  private alerts: PerformanceAlert[] = [];
  private entityMetrics = new Map<string, {
    requests: number;
    totalResponseTime: number;
    errors: number;
    lastUpdated: number;
  }>();
  
  private monitoringInterval?: NodeJS.Timeout;
  private isMonitoring = false;

  constructor(config?: Partial<MonitoringConfig>) {
    super();
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * Start real-time monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    console.log('🔍 Starting real-time performance monitoring');
    this.isMonitoring = true;

    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.checkAlerts();
      this.cleanupOldData();
    }, this.config.samplingInterval);

    this.emit('monitoring:started');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    console.log('⏹️ Stopping real-time monitoring');
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    this.emit('monitoring:stopped');
  }

  /**
   * Record request metrics
   */
  recordRequest(
    entityType: string,
    responseTime: number,
    success: boolean,
    cacheHit: boolean = false
  ): void {
    const now = Date.now();
    
    let entityMetric = this.entityMetrics.get(entityType);
    if (!entityMetric) {
      entityMetric = {
        requests: 0,
        totalResponseTime: 0,
        errors: 0,
        lastUpdated: now
      };
      this.entityMetrics.set(entityType, entityMetric);
    }

    entityMetric.requests++;
    entityMetric.totalResponseTime += responseTime;
    entityMetric.lastUpdated = now;

    if (!success) {
      entityMetric.errors++;
    }

    // Emit real-time event
    this.emit('request:recorded', {
      entityType,
      responseTime,
      success,
      cacheHit,
      timestamp: now
    });

    // Check for immediate alerts
    if (this.config.enableRealTimeAlerts) {
      this.checkImmediateAlerts(entityType, responseTime, success);
    }
  }

  /**
   * Collect current metrics snapshot
   */
  private collectMetrics(): void {
    const now = Date.now();
    
    // Calculate aggregate metrics
    let totalRequests = 0;
    let totalResponseTime = 0;
    let totalErrors = 0;
    const entityBreakdown: Record<string, any> = {};

    for (const [entityType, metric] of this.entityMetrics.entries()) {
      totalRequests += metric.requests;
      totalResponseTime += metric.totalResponseTime;
      totalErrors += metric.errors;

      entityBreakdown[entityType] = {
        requests: metric.requests,
        avgResponseTime: metric.requests > 0 ? metric.totalResponseTime / metric.requests : 0,
        errorRate: metric.requests > 0 ? metric.errors / metric.requests : 0
      };
    }

    const snapshot: MetricSnapshot = {
      timestamp: now,
      responseTime: totalRequests > 0 ? totalResponseTime / totalRequests : 0,
      cacheHitRate: this.calculateCacheHitRate(),
      errorRate: totalRequests > 0 ? totalErrors / totalRequests : 0,
      throughput: this.calculateThroughput(),
      queueLength: this.getQueueLength(),
      memoryUsage: this.estimateMemoryUsage(),
      activeRequests: this.getActiveRequests(),
      entityBreakdown
    };

    this.metrics.push(snapshot);
    this.emit('metrics:collected', snapshot);
  }

  /**
   * Check for performance alerts
   */
  private checkAlerts(): void {
    const latest = this.metrics[this.metrics.length - 1];
    if (!latest) return;

    const alerts: PerformanceAlert[] = [];

    // Response time alert
    if (latest.responseTime > this.config.alertThresholds.responseTime) {
      alerts.push({
        id: `response-time-${Date.now()}`,
        type: latest.responseTime > this.config.alertThresholds.responseTime * 2 ? 'CRITICAL' : 'WARNING',
        message: `High response time: ${Math.round(latest.responseTime)}ms`,
        timestamp: latest.timestamp,
        metric: 'responseTime',
        value: latest.responseTime,
        threshold: this.config.alertThresholds.responseTime
      });
    }

    // Error rate alert
    if (latest.errorRate > this.config.alertThresholds.errorRate) {
      alerts.push({
        id: `error-rate-${Date.now()}`,
        type: latest.errorRate > this.config.alertThresholds.errorRate * 2 ? 'CRITICAL' : 'WARNING',
        message: `High error rate: ${Math.round(latest.errorRate * 100)}%`,
        timestamp: latest.timestamp,
        metric: 'errorRate',
        value: latest.errorRate,
        threshold: this.config.alertThresholds.errorRate
      });
    }

    // Cache hit rate alert
    if (latest.cacheHitRate < this.config.alertThresholds.cacheHitRate) {
      alerts.push({
        id: `cache-hit-${Date.now()}`,
        type: 'WARNING',
        message: `Low cache hit rate: ${Math.round(latest.cacheHitRate * 100)}%`,
        timestamp: latest.timestamp,
        metric: 'cacheHitRate',
        value: latest.cacheHitRate,
        threshold: this.config.alertThresholds.cacheHitRate
      });
    }

    // Queue length alert
    if (latest.queueLength > this.config.alertThresholds.queueLength) {
      alerts.push({
        id: `queue-length-${Date.now()}`,
        type: latest.queueLength > this.config.alertThresholds.queueLength * 2 ? 'CRITICAL' : 'WARNING',
        message: `High queue length: ${latest.queueLength} requests`,
        timestamp: latest.timestamp,
        metric: 'queueLength',
        value: latest.queueLength,
        threshold: this.config.alertThresholds.queueLength
      });
    }

    // Memory usage alert
    if (latest.memoryUsage > this.config.alertThresholds.memoryUsage) {
      alerts.push({
        id: `memory-usage-${Date.now()}`,
        type: 'WARNING',
        message: `High memory usage: ${Math.round(latest.memoryUsage / 1024 / 1024)}MB`,
        timestamp: latest.timestamp,
        metric: 'memoryUsage',
        value: latest.memoryUsage,
        threshold: this.config.alertThresholds.memoryUsage
      });
    }

    // Entity-specific alerts
    for (const [entityType, breakdown] of Object.entries(latest.entityBreakdown)) {
      if (breakdown.avgResponseTime > this.config.alertThresholds.responseTime) {
        alerts.push({
          id: `entity-response-${entityType}-${Date.now()}`,
          type: 'WARNING',
          message: `High response time for ${entityType}: ${Math.round(breakdown.avgResponseTime)}ms`,
          timestamp: latest.timestamp,
          entityType,
          metric: 'entityResponseTime',
          value: breakdown.avgResponseTime,
          threshold: this.config.alertThresholds.responseTime
        });
      }
    }

    // Store and emit alerts
    for (const alert of alerts) {
      this.alerts.push(alert);
      this.emit('alert:triggered', alert);
      
      if (alert.type === 'CRITICAL') {
        console.error(`🚨 CRITICAL ALERT: ${alert.message}`);
      } else {
        console.warn(`⚠️ ${alert.type}: ${alert.message}`);
      }
    }
  }

  /**
   * Check for immediate alerts on individual requests
   */
  private checkImmediateAlerts(
    entityType: string,
    responseTime: number,
    success: boolean
  ): void {
    // Immediate response time alert
    if (responseTime > this.config.alertThresholds.responseTime * 1.5) {
      const alert: PerformanceAlert = {
        id: `immediate-${entityType}-${Date.now()}`,
        type: 'WARNING',
        message: `Slow ${entityType} request: ${Math.round(responseTime)}ms`,
        timestamp: Date.now(),
        entityType,
        metric: 'immediateResponseTime',
        value: responseTime,
        threshold: this.config.alertThresholds.responseTime
      };
      
      this.alerts.push(alert);
      this.emit('alert:immediate', alert);
    }

    // Immediate error alert
    if (!success) {
      const alert: PerformanceAlert = {
        id: `error-${entityType}-${Date.now()}`,
        type: 'ERROR',
        message: `Request failed for ${entityType}`,
        timestamp: Date.now(),
        entityType,
        metric: 'requestError',
        value: 1,
        threshold: 0
      };
      
      this.alerts.push(alert);
      this.emit('alert:immediate', alert);
    }
  }

  /**
   * Get performance trends
   */
  getTrends(timeRange: number = 300000): {
    responseTime: { trend: 'up' | 'down' | 'stable'; change: number };
    errorRate: { trend: 'up' | 'down' | 'stable'; change: number };
    cacheHitRate: { trend: 'up' | 'down' | 'stable'; change: number };
    throughput: { trend: 'up' | 'down' | 'stable'; change: number };
  } {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(m => now - m.timestamp <= timeRange);
    
    if (recentMetrics.length < 2) {
      return {
        responseTime: { trend: 'stable', change: 0 },
        errorRate: { trend: 'stable', change: 0 },
        cacheHitRate: { trend: 'stable', change: 0 },
        throughput: { trend: 'stable', change: 0 }
      };
    }

    const first = recentMetrics[0];
    const last = recentMetrics[recentMetrics.length - 1];

    return {
      responseTime: this.calculateTrend(first.responseTime, last.responseTime),
      errorRate: this.calculateTrend(first.errorRate, last.errorRate),
      cacheHitRate: this.calculateTrend(first.cacheHitRate, last.cacheHitRate, true),
      throughput: this.calculateTrend(first.throughput, last.throughput, true)
    };
  }

  /**
   * Get current dashboard data
   */
  getDashboardData(): {
    currentMetrics: MetricSnapshot | null;
    recentAlerts: PerformanceAlert[];
    trends: ReturnType<typeof this.getTrends>;
    entityPerformance: Array<{
      entityType: string;
      avgResponseTime: number;
      errorRate: number;
      requests: number;
    }>;
  } {
    const currentMetrics = this.metrics[this.metrics.length - 1] || null;
    const recentAlerts = this.alerts.slice(-10);
    const trends = this.getTrends();
    
    const entityPerformance = Array.from(this.entityMetrics.entries()).map(([entityType, metric]) => ({
      entityType,
      avgResponseTime: metric.requests > 0 ? metric.totalResponseTime / metric.requests : 0,
      errorRate: metric.requests > 0 ? metric.errors / metric.requests : 0,
      requests: metric.requests
    })).sort((a, b) => b.requests - a.requests);

    return {
      currentMetrics,
      recentAlerts,
      trends,
      entityPerformance
    };
  }

  /**
   * Utility functions
   */
  private calculateTrend(
    oldValue: number,
    newValue: number,
    higherIsBetter: boolean = false
  ): { trend: 'up' | 'down' | 'stable'; change: number } {
    const change = ((newValue - oldValue) / oldValue) * 100;
    const threshold = 5; // 5% change threshold
    
    if (Math.abs(change) < threshold) {
      return { trend: 'stable', change };
    }
    
    const isImproving = higherIsBetter ? change > 0 : change < 0;
    return {
      trend: isImproving ? 'up' : 'down',
      change
    };
  }

  private calculateCacheHitRate(): number {
    // This would integrate with the actual cache system
    // For now, return a placeholder
    return 0.45; // 45% hit rate
  }

  private calculateThroughput(): number {
    const now = Date.now();
    const recentRequests = Array.from(this.entityMetrics.values())
      .filter(metric => now - metric.lastUpdated < 60000)
      .reduce((sum, metric) => sum + metric.requests, 0);
    
    return recentRequests / 60; // requests per second
  }

  private getQueueLength(): number {
    // This would integrate with the actual queue system
    return 0;
  }

  private getActiveRequests(): number {
    // This would integrate with the actual request system
    return 0;
  }

  private estimateMemoryUsage(): number {
    // Estimate memory usage of monitoring data
    const metricsSize = this.metrics.length * 1000; // ~1KB per metric
    const alertsSize = this.alerts.length * 500;    // ~500B per alert
    const entitySize = this.entityMetrics.size * 200; // ~200B per entity
    
    return metricsSize + alertsSize + entitySize;
  }

  private cleanupOldData(): void {
    const now = Date.now();
    const cutoff = now - this.config.retentionPeriod;
    
    // Clean old metrics
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
    
    // Clean old alerts
    this.alerts = this.alerts.filter(a => a.timestamp > cutoff);
    
    // Clean old entity metrics
    for (const [entityType, metric] of this.entityMetrics.entries()) {
      if (now - metric.lastUpdated > this.config.retentionPeriod) {
        this.entityMetrics.delete(entityType);
      }
    }
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = 'timestamp,responseTime,cacheHitRate,errorRate,throughput,queueLength,memoryUsage,activeRequests';
      const rows = this.metrics.map(m => 
        `${m.timestamp},${m.responseTime},${m.cacheHitRate},${m.errorRate},${m.throughput},${m.queueLength},${m.memoryUsage},${m.activeRequests}`
      );
      return [headers, ...rows].join('\n');
    }
    
    return JSON.stringify({
      metrics: this.metrics,
      alerts: this.alerts,
      entityMetrics: Object.fromEntries(this.entityMetrics)
    }, null, 2);
  }

  /**
   * Reset all monitoring data
   */
  reset(): void {
    this.metrics = [];
    this.alerts = [];
    this.entityMetrics.clear();
    this.emit('monitoring:reset');
  }
}

// Singleton instance
export const realTimeMonitor = new RealTimeMonitor();