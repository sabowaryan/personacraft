// Unit tests for Qloo metrics collection and monitoring functionality
// Tests metrics tracking, performance monitoring, and observability features

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { QlooMetricsCollector, createMetricsCollector } from '../lib/api/qloo-metrics';
import { QlooErrorType } from '../lib/types/qloo-compliant';

// Mock timers for testing
jest.useFakeTimers();

describe('QlooMetricsCollector', () => {
  let metricsCollector: QlooMetricsCollector;

  beforeEach(() => {
    metricsCollector = new QlooMetricsCollector({
      enabled: true,
      collectionInterval: 1000,
      retentionPeriod: 60000,
      maxRecords: 100,
      enableHealthChecks: false // Disable for unit tests
    });
  });

  afterEach(() => {
    metricsCollector.stop();
    jest.clearAllTimers();
  });

  describe('API Call Metrics', () => {
    it('should record API calls correctly', () => {
      // Record successful API call
      metricsCollector.recordApiCall({
        endpoint: '/search',
        method: 'GET',
        params: { query: 'test' },
        responseTime: 150,
        success: true,
        cached: false,
        retryAttempt: 1
      });

      // Record failed API call
      metricsCollector.recordApiCall({
        endpoint: '/v2/insights',
        method: 'POST',
        params: { 'filter.type': 'urn:entity:brand' },
        responseTime: 300,
        success: false,
        statusCode: 500,
        errorType: QlooErrorType.SERVER_ERROR,
        cached: false,
        retryAttempt: 2
      });

      const metrics = metricsCollector.getMetrics();

      expect(metrics.apiCalls.total).toBe(2);
      expect(metrics.apiCalls.totalSuccesses).toBe(1);
      expect(metrics.apiCalls.totalErrors).toBe(1);
      expect(metrics.apiCalls.successRate).toBe(50);
      expect(metrics.apiCalls.errorRate).toBe(50);
      expect(metrics.apiCalls.byEndpoint['/search']).toBe(1);
      expect(metrics.apiCalls.byEndpoint['/v2/insights']).toBe(1);
      expect(metrics.apiCalls.byMethod['GET']).toBe(1);
      expect(metrics.apiCalls.byMethod['POST']).toBe(1);
    });

    it('should calculate response time percentiles correctly', () => {
      const responseTimes = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
      
      responseTimes.forEach((time, index) => {
        metricsCollector.recordApiCall({
          endpoint: '/test',
          method: 'GET',
          params: {},
          responseTime: time,
          success: true,
          cached: false,
          retryAttempt: 1
        });
      });

      const metrics = metricsCollector.getMetrics();

      expect(metrics.apiCalls.averageResponseTime).toBe(550);
      expect(metrics.apiCalls.p95ResponseTime).toBeGreaterThan(900);
      expect(metrics.apiCalls.p99ResponseTime).toBeGreaterThan(950);
    });

    it('should track concurrent requests', () => {
      const callId1 = metricsCollector.recordApiCallStart();
      const callId2 = metricsCollector.recordApiCallStart();
      const callId3 = metricsCollector.recordApiCallStart();

      expect(callId1).toBeTruthy();
      expect(callId2).toBeTruthy();
      expect(callId3).toBeTruthy();

      // Complete one call
      metricsCollector.recordApiCall({
        endpoint: '/test',
        method: 'GET',
        params: {},
        responseTime: 100,
        success: true,
        cached: false,
        retryAttempt: 1
      });

      const metrics = metricsCollector.getMetrics();
      expect(metrics.performance.concurrency.maxConcurrentRequests).toBe(3);
    });
  });

  describe('Cache Metrics', () => {
    it('should record cache operations correctly', () => {
      // Record cache hits and misses
      metricsCollector.recordCacheOperation({
        operation: 'get',
        key: 'search:test',
        endpoint: '/search',
        result: 'hit',
        keySize: 10,
        valueSize: 1000
      });

      metricsCollector.recordCacheOperation({
        operation: 'get',
        key: 'insights:brand',
        endpoint: '/v2/insights',
        result: 'miss',
        keySize: 15
      });

      metricsCollector.recordCacheOperation({
        operation: 'set',
        key: 'insights:brand',
        endpoint: '/v2/insights',
        result: 'success',
        keySize: 15,
        valueSize: 2000,
        ttl: 3600
      });

      const metrics = metricsCollector.getMetrics();

      expect(metrics.cache.totalHits).toBe(1);
      expect(metrics.cache.totalMisses).toBe(1);
      expect(metrics.cache.totalRequests).toBe(2);
      expect(metrics.cache.hitRate).toBe(50);
      expect(metrics.cache.missRate).toBe(50);
      expect(metrics.cache.totalMemoryUsage).toBe(3000);
      expect(metrics.cache.byEndpoint['/search'].hits).toBe(1);
      expect(metrics.cache.byEndpoint['/v2/insights'].misses).toBe(1);
    });

    it('should calculate cache hit rates per endpoint', () => {
      // Multiple operations for /search endpoint
      metricsCollector.recordCacheOperation({
        operation: 'get',
        key: 'search:1',
        endpoint: '/search',
        result: 'hit'
      });

      metricsCollector.recordCacheOperation({
        operation: 'get',
        key: 'search:2',
        endpoint: '/search',
        result: 'hit'
      });

      metricsCollector.recordCacheOperation({
        operation: 'get',
        key: 'search:3',
        endpoint: '/search',
        result: 'miss'
      });

      const metrics = metricsCollector.getMetrics();
      
      expect(metrics.cache.byEndpoint['/search'].hits).toBe(2);
      expect(metrics.cache.byEndpoint['/search'].misses).toBe(1);
      expect(metrics.cache.byEndpoint['/search'].hitRate).toBeCloseTo(66.67, 1);
    });
  });

  describe('Error Metrics', () => {
    it('should track errors by type and endpoint', () => {
      metricsCollector.recordApiCall({
        endpoint: '/search',
        method: 'GET',
        params: {},
        responseTime: 100,
        success: false,
        statusCode: 401,
        errorType: QlooErrorType.AUTHENTICATION,
        cached: false,
        retryAttempt: 1
      });

      metricsCollector.recordApiCall({
        endpoint: '/v2/insights',
        method: 'POST',
        params: {},
        responseTime: 200,
        success: false,
        statusCode: 429,
        errorType: QlooErrorType.RATE_LIMIT,
        cached: false,
        retryAttempt: 1
      });

      metricsCollector.recordApiCall({
        endpoint: '/v2/insights',
        method: 'POST',
        params: {},
        responseTime: 150,
        success: false,
        statusCode: 500,
        errorType: QlooErrorType.SERVER_ERROR,
        cached: false,
        retryAttempt: 2
      });

      const metrics = metricsCollector.getMetrics();

      expect(metrics.errors.totalErrors).toBe(3);
      expect(metrics.errors.byType[QlooErrorType.AUTHENTICATION]).toBe(1);
      expect(metrics.errors.byType[QlooErrorType.RATE_LIMIT]).toBe(1);
      expect(metrics.errors.byType[QlooErrorType.SERVER_ERROR]).toBe(1);
      expect(metrics.errors.byEndpoint['/search']).toBe(1);
      expect(metrics.errors.byEndpoint['/v2/insights']).toBe(2);
      expect(metrics.errors.byStatusCode[401]).toBe(1);
      expect(metrics.errors.byStatusCode[429]).toBe(1);
      expect(metrics.errors.byStatusCode[500]).toBe(1);
    });

    it('should identify most common errors', () => {
      // Create multiple server errors
      for (let i = 0; i < 5; i++) {
        metricsCollector.recordApiCall({
          endpoint: '/test',
          method: 'GET',
          params: {},
          responseTime: 100,
          success: false,
          errorType: QlooErrorType.SERVER_ERROR,
          cached: false,
          retryAttempt: 1
        });
      }

      // Create fewer rate limit errors
      for (let i = 0; i < 2; i++) {
        metricsCollector.recordApiCall({
          endpoint: '/test',
          method: 'GET',
          params: {},
          responseTime: 100,
          success: false,
          errorType: QlooErrorType.RATE_LIMIT,
          cached: false,
          retryAttempt: 1
        });
      }

      const metrics = metricsCollector.getMetrics();
      
      expect(metrics.errors.mostCommonErrors).toHaveLength(2);
      expect(metrics.errors.mostCommonErrors[0].type).toBe(QlooErrorType.SERVER_ERROR);
      expect(metrics.errors.mostCommonErrors[0].count).toBe(5);
      expect(metrics.errors.mostCommonErrors[1].type).toBe(QlooErrorType.RATE_LIMIT);
      expect(metrics.errors.mostCommonErrors[1].count).toBe(2);
    });
  });

  describe('Performance Metrics', () => {
    it('should calculate performance statistics correctly', () => {
      const responseTimes = [100, 200, 300, 400, 500];
      
      responseTimes.forEach(time => {
        metricsCollector.recordApiCall({
          endpoint: '/test',
          method: 'GET',
          params: {},
          responseTime: time,
          success: true,
          cached: false,
          retryAttempt: 1
        });
      });

      const metrics = metricsCollector.getMetrics();

      expect(metrics.performance.responseTime.average).toBe(300);
      expect(metrics.performance.responseTime.min).toBe(100);
      expect(metrics.performance.responseTime.max).toBe(500);
      expect(metrics.performance.responseTime.median).toBe(300);
    });

    it('should track throughput metrics', () => {
      // Mock current time
      const now = Date.now();
      jest.setSystemTime(now);

      // Record requests at different times
      metricsCollector.recordApiCall({
        endpoint: '/test',
        method: 'GET',
        params: {},
        responseTime: 100,
        success: true,
        cached: false,
        retryAttempt: 1
      });

      // Advance time and record more requests
      jest.setSystemTime(now + 30000); // 30 seconds later

      metricsCollector.recordApiCall({
        endpoint: '/test',
        method: 'GET',
        params: {},
        responseTime: 100,
        success: true,
        cached: false,
        retryAttempt: 1
      });

      const metrics = metricsCollector.getMetrics();

      expect(metrics.performance.throughput.requestsPerMinute).toBeGreaterThan(0);
      expect(metrics.performance.throughput.requestsPerHour).toBeGreaterThan(0);
    });
  });

  describe('Health Metrics', () => {
    it('should calculate health status based on error rates', () => {
      // Record mostly successful calls (95% success rate = 5% error rate, which is healthy)
      for (let i = 0; i < 19; i++) {
        metricsCollector.recordApiCall({
          endpoint: '/test',
          method: 'GET',
          params: {},
          responseTime: 100,
          success: true,
          cached: false,
          retryAttempt: 1
        });
      }

      // Record one error (5% error rate)
      metricsCollector.recordApiCall({
        endpoint: '/test',
        method: 'GET',
        params: {},
        responseTime: 100,
        success: false,
        errorType: QlooErrorType.SERVER_ERROR,
        cached: false,
        retryAttempt: 1
      });

      const metrics = metricsCollector.getMetrics();

      expect(metrics.health.isHealthy).toBe(true); // 5% error rate should be healthy
      expect(metrics.health.connectivity.status).toBe('connected');
    });

    it('should track uptime correctly', () => {
      const startTime = Date.now();
      jest.setSystemTime(startTime);

      const collector = new QlooMetricsCollector();

      // Advance time
      jest.setSystemTime(startTime + 60000); // 1 minute later

      const metrics = collector.getMetrics();

      expect(metrics.health.uptime).toBe(60000);
      collector.stop();
    });
  });

  describe('Metrics for Time Period', () => {
    it('should filter metrics by time period', () => {
      const baseTime = Date.now();
      jest.setSystemTime(baseTime);

      // Record some calls
      metricsCollector.recordApiCall({
        endpoint: '/test1',
        method: 'GET',
        params: {},
        responseTime: 100,
        success: true,
        cached: false,
        retryAttempt: 1
      });

      // Advance time
      jest.setSystemTime(baseTime + 30000);

      metricsCollector.recordApiCall({
        endpoint: '/test2',
        method: 'GET',
        params: {},
        responseTime: 200,
        success: true,
        cached: false,
        retryAttempt: 1
      });

      // Get metrics for specific period
      const startTime = new Date(baseTime + 15000);
      const endTime = new Date(baseTime + 45000);
      const periodMetrics = metricsCollector.getMetricsForPeriod(startTime, endTime);

      expect(periodMetrics.apiCalls.total).toBe(1); // Only second call should be included
      expect(periodMetrics.collectionPeriod.start).toBe(startTime.toISOString());
      expect(periodMetrics.collectionPeriod.end).toBe(endTime.toISOString());
    });
  });

  describe('Configuration and Lifecycle', () => {
    it('should respect enabled configuration', () => {
      const disabledCollector = new QlooMetricsCollector({ enabled: false });

      disabledCollector.recordApiCall({
        endpoint: '/test',
        method: 'GET',
        params: {},
        responseTime: 100,
        success: true,
        cached: false,
        retryAttempt: 1
      });

      const metrics = disabledCollector.getMetrics();
      expect(metrics.apiCalls.total).toBe(0);

      disabledCollector.stop();
    });

    it('should clean up old records based on retention policy', () => {
      const collector = new QlooMetricsCollector({
        retentionPeriod: 1000, // 1 second
        maxRecords: 5
      });

      // Record more than maxRecords
      for (let i = 0; i < 10; i++) {
        collector.recordApiCall({
          endpoint: '/test',
          method: 'GET',
          params: {},
          responseTime: 100,
          success: true,
          cached: false,
          retryAttempt: 1
        });
      }

      // Advance time beyond retention period
      jest.advanceTimersByTime(2000);

      const metrics = collector.getMetrics();
      expect(metrics.apiCalls.total).toBeLessThanOrEqual(5);

      collector.stop();
    });

    it('should reset metrics correctly', () => {
      metricsCollector.recordApiCall({
        endpoint: '/test',
        method: 'GET',
        params: {},
        responseTime: 100,
        success: true,
        cached: false,
        retryAttempt: 1
      });

      let metrics = metricsCollector.getMetrics();
      expect(metrics.apiCalls.total).toBe(1);

      metricsCollector.resetMetrics();

      metrics = metricsCollector.getMetrics();
      expect(metrics.apiCalls.total).toBe(0);
    });
  });

  describe('Factory Function', () => {
    it('should create metrics collector with custom config', () => {
      const customCollector = createMetricsCollector({
        enabled: true,
        maxRecords: 50,
        enableHealthChecks: false
      });

      expect(customCollector).toBeInstanceOf(QlooMetricsCollector);
      customCollector.stop();
    });
  });
});

describe('Metrics Integration', () => {
  it('should provide comprehensive metrics snapshot', () => {
    const collector = new QlooMetricsCollector({
      enableHealthChecks: false
    });

    // Simulate various API activities
    collector.recordApiCall({
      endpoint: '/search',
      method: 'GET',
      params: { query: 'test' },
      responseTime: 150,
      success: true,
      cached: false,
      retryAttempt: 1
    });

    collector.recordApiCall({
      endpoint: '/v2/insights',
      method: 'POST',
      params: { 'filter.type': 'urn:entity:brand' },
      responseTime: 300,
      success: false,
      statusCode: 500,
      errorType: QlooErrorType.SERVER_ERROR,
      cached: false,
      retryAttempt: 2
    });

    collector.recordCacheOperation({
      operation: 'get',
      key: 'search:test',
      endpoint: '/search',
      result: 'hit',
      keySize: 10,
      valueSize: 1000
    });

    const metrics = collector.getMetrics();

    // Verify all metric categories are present
    expect(metrics.apiCalls).toBeDefined();
    expect(metrics.cache).toBeDefined();
    expect(metrics.errors).toBeDefined();
    expect(metrics.performance).toBeDefined();
    expect(metrics.health).toBeDefined();
    expect(metrics.timestamp).toBeDefined();
    expect(metrics.collectionPeriod).toBeDefined();

    // Verify data consistency
    expect(metrics.apiCalls.total).toBe(metrics.apiCalls.totalSuccesses + metrics.apiCalls.totalErrors);
    expect(metrics.cache.totalRequests).toBe(metrics.cache.totalHits + metrics.cache.totalMisses);

    collector.stop();
  });
});