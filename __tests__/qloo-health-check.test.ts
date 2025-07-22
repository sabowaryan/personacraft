// Unit tests for Qloo health check functionality
// Tests API connectivity validation, health monitoring, and status reporting

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { QlooHealthCheckService, createHealthCheckService } from '../lib/api/qloo-health-check';
import { QlooMonitoringLogger } from '../lib/api/qloo-monitoring-logger';
import { QlooErrorType } from '../lib/types/qloo-compliant';

// Mock fetch globally
global.fetch = jest.fn();

// Mock timers
jest.useFakeTimers();

describe('QlooHealthCheckService', () => {
  let healthCheckService: QlooHealthCheckService;
  let mockLogger: QlooMonitoringLogger;
  const mockApiKey = 'test-api-key';
  const mockBaseUrl = 'https://test.api.qloo.com';

  beforeEach(() => {
    mockLogger = new QlooMonitoringLogger({
      enableConsoleOutput: false,
      bufferSize: 10
    });

    healthCheckService = new QlooHealthCheckService(
      mockApiKey,
      mockBaseUrl,
      {
        enabled: false, // Disable automatic checks for tests
        interval: 1000,
        timeout: 1000, // Shorter timeout for tests
        retryAttempts: 1, // Fewer retries for tests
        enableConnectivityTests: false // Disable connectivity tests for most tests
      },
      mockLogger
    );

    // Clear all mocks
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    healthCheckService.stop();
    mockLogger.stop();
    jest.clearAllTimers();
  });

  describe('Individual Endpoint Health Checks', () => {
    it('should check search endpoint health successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve('{"results": []}'),
        headers: new Map([['content-type', 'application/json']])
      });

      const result = await healthCheckService.performHealthCheck();

      expect(result.endpoints).toHaveLength(4); // Default endpoints
      const searchEndpoint = result.endpoints.find(e => e.endpoint === '/search');
      expect(searchEndpoint).toBeDefined();
      expect(searchEndpoint!.status).toBe('healthy');
      expect(searchEndpoint!.responseTime).toBeGreaterThan(0);
    });

    it('should handle endpoint failures correctly', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await healthCheckService.performHealthCheck();

      expect(result.overall).toBe('unhealthy');
      result.endpoints.forEach(endpoint => {
        expect(endpoint.status).toBe('unhealthy');
        expect(endpoint.error).toBeDefined();
        expect(endpoint.error!.type).toBe(QlooErrorType.NETWORK_ERROR);
      });
    });

    it('should classify response times correctly', async () => {
      // Mock slow response
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              status: 200,
              statusText: 'OK',
              text: () => Promise.resolve('{}'),
              headers: new Map()
            });
          }, 3000); // 3 second delay
        })
      );

      const result = await healthCheckService.performHealthCheck();

      // Should be degraded due to slow response time
      result.endpoints.forEach(endpoint => {
        expect(['degraded', 'unhealthy']).toContain(endpoint.status);
      });
    });

    it('should retry failed requests according to configuration', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockRejectedValueOnce(new Error('Second attempt failed'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          text: () => Promise.resolve('{}'),
          headers: new Map()
        });

      const result = await healthCheckService.performHealthCheck();

      // Should succeed after retries
      expect(global.fetch).toHaveBeenCalledTimes(12); // 4 endpoints × 3 attempts each
    });
  });

  describe('Overall Health Status Calculation', () => {
    it('should report healthy when all endpoints are healthy', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve('{}'),
        headers: new Map()
      });

      const result = await healthCheckService.performHealthCheck();

      expect(result.overall).toBe('healthy');
      expect(result.endpoints.every(e => e.status === 'healthy')).toBe(true);
    });

    it('should report degraded when some endpoints are degraded', async () => {
      let callCount = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          // First two calls (search, tags) succeed quickly
          return Promise.resolve({
            ok: true,
            status: 200,
            statusText: 'OK',
            text: () => Promise.resolve('{}'),
            headers: new Map()
          });
        } else {
          // Last two calls (audiences, insights) are slow
          return new Promise(resolve => {
            setTimeout(() => {
              resolve({
                ok: true,
                status: 200,
                statusText: 'OK',
                text: () => Promise.resolve('{}'),
                headers: new Map()
              });
            }, 3000);
          });
        }
      });

      const result = await healthCheckService.performHealthCheck();

      expect(result.overall).toBe('degraded');
    });

    it('should report unhealthy when majority of endpoints fail', async () => {
      let callCount = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount <= 1) {
          // Only first call succeeds
          return Promise.resolve({
            ok: true,
            status: 200,
            statusText: 'OK',
            text: () => Promise.resolve('{}'),
            headers: new Map()
          });
        } else {
          // All other calls fail
          return Promise.reject(new Error('Service unavailable'));
        }
      });

      const result = await healthCheckService.performHealthCheck();

      expect(result.overall).toBe('unhealthy');
    });
  });

  describe('Connectivity Testing', () => {
    it('should perform connectivity tests when enabled', async () => {
      const serviceWithConnectivity = new QlooHealthCheckService(
        mockApiKey,
        mockBaseUrl,
        {
          enableConnectivityTests: true,
          enableHealthChecks: false
        },
        mockLogger
      );

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve('{}'),
        headers: new Map()
      });

      const result = await serviceWithConnectivity.performHealthCheck();

      expect(result.connectivity.status).toBe('connected');
      expect(result.connectivity.latency).toBeGreaterThanOrEqual(0);
      expect(result.connectivity.packetLoss).toBeLessThanOrEqual(100);

      serviceWithConnectivity.stop();
    });

    it('should detect connectivity issues', async () => {
      const serviceWithConnectivity = new QlooHealthCheckService(
        mockApiKey,
        mockBaseUrl,
        {
          enableConnectivityTests: true,
          enableHealthChecks: false
        },
        mockLogger
      );

      // Mock 50% packet loss
      let callCount = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount % 2 === 0) {
          return Promise.reject(new Error('Network timeout'));
        } else {
          return Promise.resolve({
            ok: true,
            status: 200,
            statusText: 'OK',
            text: () => Promise.resolve('{}'),
            headers: new Map()
          });
        }
      });

      const result = await serviceWithConnectivity.performHealthCheck();

      expect(result.connectivity.status).toBe('degraded');
      expect(result.connectivity.packetLoss).toBeGreaterThan(0);

      serviceWithConnectivity.stop();
    });
  });

  describe('Performance Metrics', () => {
    it('should calculate performance metrics correctly', async () => {
      const responseTimes = [100, 200, 300, 400];
      let callIndex = 0;

      (global.fetch as jest.Mock).mockImplementation(() => {
        const delay = responseTimes[callIndex % responseTimes.length];
        callIndex++;
        
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              status: 200,
              statusText: 'OK',
              text: () => Promise.resolve('{}'),
              headers: new Map()
            });
          }, delay);
        });
      });

      const result = await healthCheckService.performHealthCheck();

      expect(result.performance.averageResponseTime).toBeGreaterThan(0);
      expect(result.performance.slowestEndpoint).toBeTruthy();
      expect(result.performance.fastestEndpoint).toBeTruthy();
    });
  });

  describe('Error Analysis', () => {
    it('should analyze and categorize errors correctly', async () => {
      const errors = [
        { status: 401, error: 'Unauthorized' },
        { status: 429, error: 'Rate limited' },
        { status: 500, error: 'Server error' },
        { status: 503, error: 'Service unavailable' }
      ];

      let callIndex = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        const errorInfo = errors[callIndex % errors.length];
        callIndex++;
        
        return Promise.resolve({
          ok: false,
          status: errorInfo.status,
          statusText: errorInfo.error,
          text: () => Promise.resolve(`{"error": "${errorInfo.error}"}`),
          headers: new Map()
        });
      });

      const result = await healthCheckService.performHealthCheck();

      expect(result.errors.total).toBeGreaterThan(0);
      expect(result.errors.byType).toBeDefined();
      expect(result.errors.recentErrors).toHaveLength(result.errors.total);
    });
  });

  describe('Recommendations', () => {
    it('should generate appropriate recommendations for healthy system', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve('{}'),
        headers: new Map()
      });

      const result = await healthCheckService.performHealthCheck();

      expect(result.recommendations).toContain('All systems are operating normally');
    });

    it('should generate recommendations for authentication errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: () => Promise.resolve('{"error": "Invalid API key"}'),
        headers: new Map()
      });

      const result = await healthCheckService.performHealthCheck();

      expect(result.recommendations.some(r => 
        r.includes('Authentication/authorization errors')
      )).toBe(true);
    });

    it('should generate recommendations for rate limiting', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        text: () => Promise.resolve('{"error": "Rate limit exceeded"}'),
        headers: new Map()
      });

      const result = await healthCheckService.performHealthCheck();

      expect(result.recommendations.some(r => 
        r.includes('Rate limiting detected')
      )).toBe(true);
    });

    it('should generate recommendations for slow performance', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              status: 200,
              statusText: 'OK',
              text: () => Promise.resolve('{}'),
              headers: new Map()
            });
          }, 6000); // Very slow response
        })
      );

      const result = await healthCheckService.performHealthCheck();

      expect(result.recommendations.some(r => 
        r.includes('response times are high')
      )).toBe(true);
    });
  });

  describe('Health History', () => {
    it('should maintain health check history', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve('{}'),
        headers: new Map()
      });

      // Perform multiple health checks
      await healthCheckService.performHealthCheck();
      await healthCheckService.performHealthCheck();
      await healthCheckService.performHealthCheck();

      const history = healthCheckService.getHealthHistory();
      expect(history).toHaveLength(3);
      
      history.forEach(entry => {
        expect(entry.timestamp).toBeTruthy();
        expect(entry.result).toBeDefined();
        expect(entry.result.overall).toBeTruthy();
      });
    });

    it('should limit history size', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve('{}'),
        headers: new Map()
      });

      // Perform many health checks
      for (let i = 0; i < 15; i++) {
        await healthCheckService.performHealthCheck();
      }

      const history = healthCheckService.getHealthHistory();
      expect(history.length).toBeLessThanOrEqual(10); // Default limit
    });
  });

  describe('Configuration and Lifecycle', () => {
    it('should respect timeout configuration', async () => {
      const shortTimeoutService = new QlooHealthCheckService(
        mockApiKey,
        mockBaseUrl,
        {
          timeout: 100, // Very short timeout
          enableHealthChecks: false
        },
        mockLogger
      );

      (global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              status: 200,
              statusText: 'OK',
              text: () => Promise.resolve('{}'),
              headers: new Map()
            });
          }, 200); // Longer than timeout
        })
      );

      const result = await shortTimeoutService.performHealthCheck();

      expect(result.overall).toBe('unhealthy');
      shortTimeoutService.stop();
    });

    it('should handle service lifecycle correctly', () => {
      const service = new QlooHealthCheckService(
        mockApiKey,
        mockBaseUrl,
        { enableHealthChecks: false },
        mockLogger
      );

      expect(() => service.stop()).not.toThrow();
    });
  });

  describe('Factory Function', () => {
    it('should create health check service with custom config', () => {
      const customService = createHealthCheckService(
        mockApiKey,
        mockBaseUrl,
        {
          interval: 30000,
          timeout: 15000,
          enableDetailedChecks: false
        }
      );

      expect(customService).toBeInstanceOf(QlooHealthCheckService);
      customService.stop();
    });
  });
});

describe('Health Check Integration', () => {
  it('should provide comprehensive health status', async () => {
    const service = new QlooHealthCheckService(
      'test-key',
      'https://test.api.qloo.com',
      { enableHealthChecks: false }
    );

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: () => Promise.resolve('{"status": "ok"}'),
      headers: new Map([['content-type', 'application/json']])
    });

    const result = await service.performHealthCheck();

    // Verify all required fields are present
    expect(result.overall).toBeDefined();
    expect(result.timestamp).toBeDefined();
    expect(result.uptime).toBeGreaterThanOrEqual(0);
    expect(result.endpoints).toBeInstanceOf(Array);
    expect(result.connectivity).toBeDefined();
    expect(result.performance).toBeDefined();
    expect(result.errors).toBeDefined();
    expect(result.recommendations).toBeInstanceOf(Array);

    service.stop();
  });
});