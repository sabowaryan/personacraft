// Health check functionality for Qloo API connectivity validation
// Provides comprehensive health monitoring and connectivity testing

import type { QlooCompliantError, EntityUrn } from '@/lib/types/qloo-compliant';
import { QlooErrorType } from '@/lib/types/qloo-compliant';
import { QlooMonitoringLogger } from './qloo-monitoring-logger';

/**
 * Health check status
 */
export type HealthStatus = 'healthy' | 'unhealthy' | 'degraded' | 'unknown';

/**
 * Individual endpoint health check result
 */
export interface EndpointHealthResult {
  endpoint: string;
  status: HealthStatus;
  responseTime: number;
  lastCheck: string;
  error?: {
    type: QlooErrorType;
    message: string;
    code: string;
  };
  metadata?: {
    statusCode?: number;
    headers?: Record<string, string>;
    bodySize?: number;
  };
}

/**
 * Overall health check result
 */
export interface HealthCheckResult {
  overall: HealthStatus;
  timestamp: string;
  uptime: number;
  endpoints: EndpointHealthResult[];
  connectivity: {
    status: 'connected' | 'disconnected' | 'degraded';
    latency: number;
    packetLoss: number;
  };
  performance: {
    averageResponseTime: number;
    slowestEndpoint: string;
    fastestEndpoint: string;
  };
  errors: {
    total: number;
    byType: Record<QlooErrorType, number>;
    recentErrors: Array<{
      timestamp: string;
      endpoint: string;
      error: string;
    }>;
  };
  recommendations: string[];
}

/**
 * Health check configuration
 */
export interface HealthCheckConfig {
  enabled: boolean;
  interval: number; // milliseconds
  timeout: number; // milliseconds
  retryAttempts: number;
  retryDelay: number; // milliseconds
  endpoints: string[];
  thresholds: {
    responseTime: {
      healthy: number; // ms
      degraded: number; // ms
    };
    errorRate: {
      healthy: number; // percentage
      degraded: number; // percentage
    };
    consecutiveFailures: {
      degraded: number;
      unhealthy: number;
    };
  };
  enableDetailedChecks: boolean;
  enableConnectivityTests: boolean;
}

/**
 * Default health check configuration
 */
const DEFAULT_HEALTH_CONFIG: HealthCheckConfig = {
  enabled: true,
  interval: 300000, // 5 minutes
  timeout: 10000, // 10 seconds
  retryAttempts: 2,
  retryDelay: 1000, // 1 second
  endpoints: ['/search', '/v2/tags', '/v2/audiences', '/v2/insights'],
  thresholds: {
    responseTime: {
      healthy: 2000, // 2 seconds
      degraded: 5000  // 5 seconds
    },
    errorRate: {
      healthy: 5,   // 5%
      degraded: 15  // 15%
    },
    consecutiveFailures: {
      degraded: 2,
      unhealthy: 5
    }
  },
  enableDetailedChecks: true,
  enableConnectivityTests: true
};

/**
 * Health check history entry
 */
interface HealthCheckHistoryEntry {
  timestamp: string;
  result: HealthCheckResult;
}

/**
 * Comprehensive health check service for Qloo API
 */
export class QlooHealthCheckService {
  private config: HealthCheckConfig;
  private logger: QlooMonitoringLogger;
  private baseUrl: string;
  private apiKey: string;
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private startTime: number;
  private healthHistory: HealthCheckHistoryEntry[] = [];
  private consecutiveFailures: Map<string, number> = new Map();
  private lastSuccessfulCheck: Map<string, Date> = new Map();

  constructor(
    apiKey: string,
    baseUrl: string = 'https://hackathon.api.qloo.com',
    config?: Partial<HealthCheckConfig>,
    logger?: QlooMonitoringLogger
  ) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.config = { ...DEFAULT_HEALTH_CONFIG, ...config };
    this.logger = logger || new QlooMonitoringLogger();
    this.startTime = Date.now();

    if (this.config.enabled) {
      this.startHealthChecks();
    }
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    this.logger.startPerformanceMeasurement('health_check');

    try {
      // Check all endpoints
      const endpointResults = await Promise.all(
        this.config.endpoints.map(endpoint => this.checkEndpoint(endpoint))
      );

      // Calculate overall status
      const overallStatus = this.calculateOverallStatus(endpointResults);

      // Perform connectivity tests
      const connectivityResult = this.config.enableConnectivityTests
        ? await this.performConnectivityTest()
        : { status: 'disconnected' as const, latency: 0, packetLoss: 0 };

      const connectivity = {
        status: connectivityResult.status,
        latency: connectivityResult.latency,
        packetLoss: connectivityResult.packetLoss
      };

      // Calculate performance metrics
      const performance = this.calculatePerformanceMetrics(endpointResults);

      // Analyze errors
      const errors = this.analyzeErrors(endpointResults);

      // Generate recommendations
      const recommendations = this.generateRecommendations(endpointResults, connectivity, performance);

      const result: HealthCheckResult = {
        overall: overallStatus,
        timestamp,
        uptime: Date.now() - this.startTime,
        endpoints: endpointResults,
        connectivity,
        performance,
        errors,
        recommendations
      };

      // Store in history
      this.healthHistory.push({ timestamp, result });
      this.cleanupHistory();

      // Log the health check
      this.logger.logHealthCheck(
        'overall',
        overallStatus === 'unknown' ? 'unhealthy' : overallStatus,
        Date.now() - startTime
      );

      this.logger.endPerformanceMeasurement('health_check', 'health_check', {
        overallStatus,
        endpointsChecked: endpointResults.length,
        errors: errors.total
      });

      return result;

    } catch (error) {
      const errorResult: HealthCheckResult = {
        overall: 'unhealthy',
        timestamp,
        uptime: Date.now() - this.startTime,
        endpoints: [],
        connectivity: { status: 'disconnected', latency: 0, packetLoss: 100 },
        performance: { averageResponseTime: 0, slowestEndpoint: '', fastestEndpoint: '' },
        errors: { total: 1, byType: {} as any, recentErrors: [] },
        recommendations: ['Health check system failure - check configuration and connectivity']
      };

      this.logger.logHealthCheck(
        'health_check_system',
        'unhealthy',
        Date.now() - startTime,
        error instanceof Error ? error : new Error(String(error))
      );

      return errorResult;
    }
  }

  /**
   * Check individual endpoint health
   */
  private async checkEndpoint(endpoint: string): Promise<EndpointHealthResult> {
    const startTime = Date.now();
    let attempt = 0;
    let lastError: QlooCompliantError | null = null;

    while (attempt < this.config.retryAttempts) {
      try {
        const result = await this.makeHealthCheckRequest(endpoint);
        const responseTime = Date.now() - startTime;

        // Determine status based on response time and success
        let status: HealthStatus = 'healthy';
        if (responseTime > this.config.thresholds.responseTime.degraded) {
          status = 'unhealthy';
        } else if (responseTime > this.config.thresholds.responseTime.healthy) {
          status = 'degraded';
        }

        // Reset consecutive failures on success
        this.consecutiveFailures.set(endpoint, 0);
        this.lastSuccessfulCheck.set(endpoint, new Date());

        this.logger.logHealthCheck(endpoint, status, responseTime);

        return {
          endpoint,
          status,
          responseTime,
          lastCheck: new Date().toISOString(),
          metadata: {
            statusCode: result.statusCode,
            headers: result.headers,
            bodySize: result.bodySize
          }
        };

      } catch (error) {
        attempt++;
        lastError = this.createHealthCheckError(error);

        if (attempt < this.config.retryAttempts) {
          await this.sleep(this.config.retryDelay);
        }
      }
    }

    // All attempts failed
    const responseTime = Date.now() - startTime;
    const consecutiveFailures = (this.consecutiveFailures.get(endpoint) || 0) + 1;
    this.consecutiveFailures.set(endpoint, consecutiveFailures);

    let status: HealthStatus = 'unhealthy';
    if (consecutiveFailures >= this.config.thresholds.consecutiveFailures.unhealthy) {
      status = 'unhealthy';
    } else if (consecutiveFailures >= this.config.thresholds.consecutiveFailures.degraded) {
      status = 'degraded';
    }

    this.logger.logHealthCheck(
      endpoint,
      status,
      responseTime,
      lastError ? new Error(lastError.message) : undefined
    );

    return {
      endpoint,
      status,
      responseTime,
      lastCheck: new Date().toISOString(),
      error: lastError ? {
        type: lastError.type,
        message: lastError.message,
        code: lastError.code
      } : undefined
    };
  }

  /**
   * Make health check request to endpoint
   */
  private async makeHealthCheckRequest(endpoint: string): Promise<{
    statusCode: number;
    headers: Record<string, string>;
    bodySize: number;
  }> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      // Create appropriate test request based on endpoint
      const requestOptions = this.createHealthCheckRequest(endpoint);

      const response = await fetch(url, {
        ...requestOptions,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'PersonaCraft-HealthCheck/1.0',
          ...requestOptions.headers
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      // Consider 2xx and some 4xx as successful for health check purposes
      if (response.ok || response.status === 400 || response.status === 422) {
        return {
          statusCode: response.status,
          headers,
          bodySize: responseText.length
        };
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Create appropriate health check request for endpoint
   */
  private createHealthCheckRequest(endpoint: string): RequestInit {
    switch (endpoint) {
      case '/search':
        return {
          method: 'GET',
          // Add minimal query parameters for search endpoint
        };

      case '/v2/tags':
        return {
          method: 'GET',
        };

      case '/v2/audiences':
        return {
          method: 'GET',
        };

      case '/v2/insights':
        return {
          method: 'POST',
          body: JSON.stringify({
            'filter.type': 'urn:entity:brand' as EntityUrn,
            'signal.interests.entities': ['test'],
            limit: 1
          })
        };

      default:
        return {
          method: 'GET',
        };
    }
  }

  /**
   * Perform connectivity test
   */
  private async performConnectivityTest(): Promise<{
    status: 'connected' | 'disconnected' | 'degraded';
    latency: number;
    packetLoss: number;
  }> {
    const pingCount = 3;
    const pingResults: number[] = [];
    let failures = 0;

    for (let i = 0; i < pingCount; i++) {
      try {
        const startTime = Date.now();
        const response = await fetch(`${this.baseUrl}/health`, {
          method: 'HEAD',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          },
          signal: AbortSignal.timeout(5000)
        });

        const latency = Date.now() - startTime;

        if (response.ok || response.status === 404) { // 404 is OK for health endpoint
          pingResults.push(latency);
        } else {
          failures++;
        }
      } catch {
        failures++;
      }
    }

    const packetLoss = (failures / pingCount) * 100;
    const averageLatency = pingResults.length > 0
      ? pingResults.reduce((sum, latency) => sum + latency, 0) / pingResults.length
      : 0;

    let status: 'connected' | 'disconnected' | 'degraded';
    if (packetLoss >= 50) {
      status = 'disconnected';
    } else if (packetLoss > 10 || averageLatency > 3000) {
      status = 'degraded';
    } else {
      status = 'connected';
    }

    return {
      status,
      latency: averageLatency,
      packetLoss
    };
  }

  /**
   * Calculate overall health status
   */
  private calculateOverallStatus(endpointResults: EndpointHealthResult[]): HealthStatus {
    if (endpointResults.length === 0) return 'unknown';

    const healthyCount = endpointResults.filter(r => r.status === 'healthy').length;
    const degradedCount = endpointResults.filter(r => r.status === 'degraded').length;
    const unhealthyCount = endpointResults.filter(r => r.status === 'unhealthy').length;

    const totalCount = endpointResults.length;
    const healthyPercentage = (healthyCount / totalCount) * 100;

    if (unhealthyCount >= totalCount / 2) {
      return 'unhealthy';
    } else if (healthyPercentage < 50) {
      return 'degraded';
    } else if (degradedCount > 0 || unhealthyCount > 0) {
      return 'degraded';
    } else {
      return 'healthy';
    }
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics(endpointResults: EndpointHealthResult[]): {
    averageResponseTime: number;
    slowestEndpoint: string;
    fastestEndpoint: string;
  } {
    if (endpointResults.length === 0) {
      return { averageResponseTime: 0, slowestEndpoint: '', fastestEndpoint: '' };
    }

    const responseTimes = endpointResults.map(r => r.responseTime);
    const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;

    const slowest = endpointResults.reduce((prev, current) =>
      prev.responseTime > current.responseTime ? prev : current
    );

    const fastest = endpointResults.reduce((prev, current) =>
      prev.responseTime < current.responseTime ? prev : current
    );

    return {
      averageResponseTime,
      slowestEndpoint: slowest.endpoint,
      fastestEndpoint: fastest.endpoint
    };
  }

  /**
   * Analyze errors from health check results
   */
  private analyzeErrors(endpointResults: EndpointHealthResult[]): {
    total: number;
    byType: Record<QlooErrorType, number>;
    recentErrors: Array<{ timestamp: string; endpoint: string; error: string }>;
  } {
    const errors = endpointResults.filter(r => r.error);
    const byType: Record<QlooErrorType, number> = {} as Record<QlooErrorType, number>;
    const recentErrors: Array<{ timestamp: string; endpoint: string; error: string }> = [];

    errors.forEach(result => {
      if (result.error) {
        byType[result.error.type] = (byType[result.error.type] || 0) + 1;
        recentErrors.push({
          timestamp: result.lastCheck,
          endpoint: result.endpoint,
          error: result.error.message
        });
      }
    });

    return {
      total: errors.length,
      byType,
      recentErrors: recentErrors.slice(-10) // Keep last 10 errors
    };
  }

  /**
   * Generate health recommendations
   */
  private generateRecommendations(
    endpointResults: EndpointHealthResult[],
    connectivity: { status: string; latency: number; packetLoss: number },
    performance: { averageResponseTime: number; slowestEndpoint: string }
  ): string[] {
    const recommendations: string[] = [];

    // Connectivity recommendations
    if (connectivity.status === 'disconnected') {
      recommendations.push('Check internet connectivity and firewall settings');
    } else if (connectivity.status === 'degraded') {
      recommendations.push('Network connectivity is degraded - consider checking network quality');
    }

    // Performance recommendations
    if (performance.averageResponseTime > this.config.thresholds.responseTime.degraded) {
      recommendations.push('API response times are high - consider implementing caching or retry logic');
    }

    if (performance.slowestEndpoint) {
      const slowestResult = endpointResults.find(r => r.endpoint === performance.slowestEndpoint);
      if (slowestResult && slowestResult.responseTime > this.config.thresholds.responseTime.degraded) {
        recommendations.push(`${performance.slowestEndpoint} endpoint is particularly slow - investigate specific issues`);
      }
    }

    // Error-specific recommendations
    const authErrors = endpointResults.filter(r =>
      r.error?.type === QlooErrorType.AUTHENTICATION || r.error?.type === QlooErrorType.AUTHORIZATION
    );
    if (authErrors.length > 0) {
      recommendations.push('Authentication/authorization errors detected - verify API key and permissions');
    }

    const rateLimitErrors = endpointResults.filter(r => r.error?.type === QlooErrorType.RATE_LIMIT);
    if (rateLimitErrors.length > 0) {
      recommendations.push('Rate limiting detected - implement exponential backoff and request throttling');
    }

    // General recommendations
    if (endpointResults.filter(r => r.status === 'unhealthy').length > 0) {
      recommendations.push('Some endpoints are unhealthy - enable fallback mechanisms');
    }

    if (recommendations.length === 0) {
      recommendations.push('All systems are operating normally');
    }

    return recommendations;
  }

  /**
   * Get health check history
   */
  getHealthHistory(limit: number = 10): HealthCheckHistoryEntry[] {
    return this.healthHistory.slice(-limit);
  }

  /**
   * Get current health status
   */
  async getCurrentHealth(): Promise<HealthCheckResult> {
    return this.performHealthCheck();
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    // Perform initial health check
    this.performHealthCheck().catch(error => {
      this.logger.logError(
        this.createHealthCheckError(error),
        {
          endpoint: 'health_check_system',
          method: 'GET',
          attempt: 1,
          maxAttempts: 1,
          startTime: Date.now()
        }
      );
    });

    // Schedule periodic checks
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck().catch(error => {
        this.logger.logError(
          this.createHealthCheckError(error),
          {
            endpoint: 'health_check_system',
            method: 'GET',
            attempt: 1,
            maxAttempts: 1,
            startTime: Date.now()
          }
        );
      });
    }, this.config.interval);
  }

  /**
   * Stop health checks
   */
  stop(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  /**
   * Clean up old health history
   */
  private cleanupHistory(): void {
    const maxHistoryEntries = 100;
    if (this.healthHistory.length > maxHistoryEntries) {
      this.healthHistory = this.healthHistory.slice(-maxHistoryEntries);
    }
  }

  /**
   * Create health check error
   */
  private createHealthCheckError(error: any): QlooCompliantError {
    return {
      type: QlooErrorType.NETWORK_ERROR,
      message: error instanceof Error ? error.message : String(error),
      code: 'HEALTH_CHECK_FAILED',
      details: { originalError: error },
      request_id: `health_${Date.now()}`,
      timestamp: new Date().toISOString(),
      retryable: true
    };
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Create health check service with default configuration
 */
export function createHealthCheckService(
  apiKey: string,
  baseUrl?: string,
  config?: Partial<HealthCheckConfig>
): QlooHealthCheckService {
  return new QlooHealthCheckService(apiKey, baseUrl, config);
}