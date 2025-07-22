// Unit tests for Qloo monitoring logger functionality
// Tests structured logging, performance tracking, and log management

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { QlooMonitoringLogger, createMonitoringLogger } from '../lib/api/qloo-monitoring-logger';
import { QlooErrorType } from '../lib/types/qloo-compliant';
import type { ErrorContext } from '../lib/api/qloo-error-handler';

// Mock console methods
const mockConsole = {
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
};

// Replace console methods
Object.assign(console, mockConsole);

// Mock timers
jest.useFakeTimers();

describe('QlooMonitoringLogger', () => {
  let logger: QlooMonitoringLogger;

  beforeEach(() => {
    logger = new QlooMonitoringLogger({
      logLevel: 'debug',
      enableConsoleOutput: true,
      enableStructuredLogging: true,
      bufferSize: 100,
      flushInterval: 1000
    });

    // Clear mock calls
    Object.values(mockConsole).forEach(mock => mock.mockClear());
  });

  afterEach(() => {
    logger.stop();
    jest.clearAllTimers();
  });

  describe('API Call Logging', () => {
    it('should log successful API calls with structured format', () => {
      const response = {
        entities: [{ id: '1', name: 'Test' }],
        metadata: { request_id: 'req_123', cached: false }
      };

      logger.logApiCall(
        '/search',
        'GET',
        { query: 'test' },
        response,
        150,
        true
      );

      expect(mockConsole.info).toHaveBeenCalled();
      
      const logCall = mockConsole.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe('info');
      expect(logEntry.service).toBe('qloo-api');
      expect(logEntry.operation).toBe('api_call');
      expect(logEntry.context.endpoint).toBe('/search');
      expect(logEntry.context.method).toBe('GET');
      expect(logEntry.context.success).toBe(true);
      expect(logEntry.context.duration).toBe(150);
      expect(logEntry.duration).toBe(150);
      expect(logEntry.requestId).toBe('req_123');
      expect(logEntry.tags).toContain('api');
      expect(logEntry.tags).toContain('qloo');
      expect(logEntry.tags).toContain('search');
    });

    it('should log failed API calls with error details', () => {
      const error = {
        type: QlooErrorType.SERVER_ERROR,
        message: 'Internal server error',
        code: 'SERVER_ERROR',
        request_id: 'req_456',
        timestamp: new Date().toISOString(),
        retryable: true
      };

      logger.logApiCall(
        '/v2/insights',
        'POST',
        { 'filter.type': 'urn:entity:brand' },
        null,
        300,
        false,
        error
      );

      expect(mockConsole.error).toHaveBeenCalled();
      
      const logCall = mockConsole.error.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe('error');
      expect(logEntry.context.success).toBe(false);
      expect(logEntry.metadata.error).toBeDefined();
      expect(logEntry.metadata.error.type).toBe(QlooErrorType.SERVER_ERROR);
    });

    it('should sanitize sensitive parameters', () => {
      logger.logApiCall(
        '/test',
        'POST',
        { 
          query: 'test',
          api_key: 'secret_key_123',
          apiKey: 'another_secret',
          token: 'bearer_token'
        },
        {},
        100,
        true
      );

      const logCall = mockConsole.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.metadata.params.api_key).toBe('***masked***');
      expect(logEntry.metadata.params.apiKey).toBe('***masked***');
      expect(logEntry.metadata.params.token).toBe('***masked***');
      expect(logEntry.metadata.params.query).toBe('test');
    });
  });

  describe('Cache Operation Logging', () => {
    it('should log cache hits with metadata', () => {
      logger.logCacheOperation(
        'get',
        'search:test:query',
        'hit',
        {
          endpoint: '/search',
          keySize: 15,
          valueSize: 1024,
          ttl: 3600
        }
      );

      expect(mockConsole.debug).toHaveBeenCalled();
      
      const logCall = mockConsole.debug.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe('debug');
      expect(logEntry.service).toBe('qloo-cache');
      expect(logEntry.operation).toBe('cache_operation');
      expect(logEntry.context.operation).toBe('get');
      expect(logEntry.context.result).toBe('hit');
      expect(logEntry.context.endpoint).toBe('/search');
      expect(logEntry.context.keySize).toBe(15);
      expect(logEntry.context.valueSize).toBe(1024);
      expect(logEntry.context.ttl).toBe(3600);
      expect(logEntry.tags).toContain('cache');
      expect(logEntry.tags).toContain('get');
      expect(logEntry.tags).toContain('hit');
    });

    it('should log cache operations with debug level', () => {
      logger.logCacheOperation(
        'set',
        'insights:brand:123',
        'miss'
      );

      expect(mockConsole.debug).toHaveBeenCalled();
      
      const logCall = mockConsole.debug.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe('debug');
      expect(logEntry.context.result).toBe('miss');
    });

    it('should truncate long cache keys', () => {
      const longKey = 'a'.repeat(100);
      
      logger.logCacheOperation('get', longKey, 'hit');

      const logCall = mockConsole.debug.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.context.key).toHaveLength(50); // Truncated to 47 chars + "..."
      expect(logEntry.context.key.endsWith('...')).toBe(true);
    });
  });

  describe('Error Logging', () => {
    it('should log errors with enhanced context', () => {
      const error = {
        type: QlooErrorType.AUTHENTICATION,
        message: 'Invalid API key',
        code: 'AUTH_FAILED',
        details: { statusCode: 401 },
        request_id: 'req_789',
        timestamp: new Date().toISOString(),
        retryable: false
      };

      const context: ErrorContext = {
        endpoint: '/v2/insights',
        method: 'POST',
        params: { 'filter.type': 'urn:entity:brand' },
        attempt: 1,
        maxAttempts: 3,
        startTime: Date.now(),
        userId: 'user_123',
        sessionId: 'session_456'
      };

      const resolution = {
        action: 'fallback_used',
        success: true,
        fallbackUsed: true
      };

      logger.logError(error, context, resolution);

      expect(mockConsole.error).toHaveBeenCalled();
      
      const logCall = mockConsole.error.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe('error');
      expect(logEntry.service).toBe('qloo-api');
      expect(logEntry.operation).toBe('error_handling');
      expect(logEntry.error.type).toBe(QlooErrorType.AUTHENTICATION);
      expect(logEntry.error.retryable).toBe(false);
      expect(logEntry.context.endpoint).toBe('/v2/insights');
      expect(logEntry.context.userId).toBe('user_123');
      expect(logEntry.resolution).toEqual(resolution);
      expect(logEntry.tags).toContain('error');
      expect(logEntry.tags).toContain('authentication_error');
    });

    it('should determine appropriate log level for different error types', () => {
      const serverError = {
        type: QlooErrorType.SERVER_ERROR,
        message: 'Server error',
        code: 'SERVER_ERROR',
        request_id: 'req_1',
        timestamp: new Date().toISOString(),
        retryable: true
      };

      const validationError = {
        type: QlooErrorType.VALIDATION,
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        request_id: 'req_2',
        timestamp: new Date().toISOString(),
        retryable: false
      };

      const context: ErrorContext = {
        endpoint: '/test',
        method: 'GET',
        attempt: 1,
        maxAttempts: 3,
        startTime: Date.now()
      };

      logger.logError(serverError, context);
      logger.logError(validationError, context);

      // Server error should be critical level
      const serverLogCall = mockConsole.error.mock.calls[0][0];
      const serverLogEntry = JSON.parse(serverLogCall);
      expect(serverLogEntry.level).toBe('critical');

      // Validation error should be warn level
      const validationLogCall = mockConsole.warn.mock.calls[0][0];
      const validationLogEntry = JSON.parse(validationLogCall);
      expect(validationLogEntry.level).toBe('warn');
    });
  });

  describe('Performance Logging', () => {
    it('should track performance measurements', () => {
      const operationId = 'test_operation_123';
      
      logger.startPerformanceMeasurement(operationId);
      
      // Simulate some work
      jest.advanceTimersByTime(100);
      
      const duration = logger.endPerformanceMeasurement(
        operationId,
        'api_call',
        { endpoint: '/test' }
      );

      expect(duration).toBeGreaterThan(0);
      expect(mockConsole.debug).toHaveBeenCalled();
      
      const logCall = mockConsole.debug.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe('debug');
      expect(logEntry.service).toBe('qloo-performance');
      expect(logEntry.operation).toBe('api_call');
      expect(logEntry.performance.duration).toBeGreaterThan(0);
      expect(logEntry.performance.startTime).toBeDefined();
      expect(logEntry.performance.endTime).toBeDefined();
      expect(logEntry.tags).toContain('performance');
    });

    it('should handle missing performance marks gracefully', () => {
      const duration = logger.endPerformanceMeasurement(
        'nonexistent_operation',
        'test',
        {}
      );

      expect(duration).toBe(0);
    });
  });

  describe('Health Check Logging', () => {
    it('should log healthy endpoints with info level', () => {
      logger.logHealthCheck('/search', 'healthy', 150);

      expect(mockConsole.info).toHaveBeenCalled();
      
      const logCall = mockConsole.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe('info');
      expect(logEntry.service).toBe('qloo-health');
      expect(logEntry.operation).toBe('health_check');
      expect(logEntry.context.endpoint).toBe('/search');
      expect(logEntry.context.status).toBe('healthy');
      expect(logEntry.context.responseTime).toBe(150);
      expect(logEntry.duration).toBe(150);
      expect(logEntry.tags).toContain('health');
      expect(logEntry.tags).toContain('healthy');
    });

    it('should log unhealthy endpoints with error level', () => {
      const error = new Error('Connection timeout');
      
      logger.logHealthCheck('/v2/insights', 'unhealthy', 5000, error);

      expect(mockConsole.error).toHaveBeenCalled();
      
      const logCall = mockConsole.error.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe('error');
      expect(logEntry.context.status).toBe('unhealthy');
      expect(logEntry.context.error.message).toBe('Connection timeout');
      expect(logEntry.tags).toContain('unhealthy');
    });
  });

  describe('Fallback Logging', () => {
    it('should log successful fallback usage', () => {
      const context: ErrorContext = {
        endpoint: '/search',
        method: 'GET',
        attempt: 2,
        maxAttempts: 3,
        startTime: Date.now(),
        userId: 'user_123'
      };

      const fallbackData = { entities: [{ id: 'fallback_1', name: 'Fallback Entity' }] };

      logger.logFallbackUsage('API timeout', context, fallbackData, true);

      expect(mockConsole.warn).toHaveBeenCalled();
      
      const logCall = mockConsole.warn.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe('warn');
      expect(logEntry.service).toBe('qloo-fallback');
      expect(logEntry.operation).toBe('fallback_usage');
      expect(logEntry.context.reason).toBe('API timeout');
      expect(logEntry.context.success).toBe(true);
      expect(logEntry.context.fallbackDataSize).toBeGreaterThan(0);
      expect(logEntry.tags).toContain('fallback');
      expect(logEntry.tags).toContain('success');
    });

    it('should log failed fallback with error level', () => {
      const context: ErrorContext = {
        endpoint: '/search',
        method: 'GET',
        attempt: 3,
        maxAttempts: 3,
        startTime: Date.now()
      };

      logger.logFallbackUsage('Fallback generation failed', context, null, false);

      expect(mockConsole.error).toHaveBeenCalled();
      
      const logCall = mockConsole.error.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe('error');
      expect(logEntry.context.success).toBe(false);
      expect(logEntry.tags).toContain('failure');
    });
  });

  describe('Retry Logging', () => {
    it('should log retry attempts with context', () => {
      const context: ErrorContext = {
        endpoint: '/v2/insights',
        method: 'POST',
        attempt: 2,
        maxAttempts: 3,
        startTime: Date.now(),
        sessionId: 'session_789'
      };

      logger.logRetryAttempt(context, 2000, 'Rate limit exceeded');

      expect(mockConsole.info).toHaveBeenCalled();
      
      const logCall = mockConsole.info.mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe('info');
      expect(logEntry.service).toBe('qloo-retry');
      expect(logEntry.operation).toBe('retry_attempt');
      expect(logEntry.context.attempt).toBe(2);
      expect(logEntry.context.maxAttempts).toBe(3);
      expect(logEntry.context.retryDelay).toBe(2000);
      expect(logEntry.context.reason).toBe('Rate limit exceeded');
      expect(logEntry.tags).toContain('retry');
      expect(logEntry.tags).toContain('attempt-2');
    });
  });

  describe('Log Buffer Management', () => {
    it('should maintain log buffer with configured size', () => {
      const smallBufferLogger = new QlooMonitoringLogger({
        bufferSize: 3,
        enableConsoleOutput: false
      });

      // Add more logs than buffer size
      for (let i = 0; i < 5; i++) {
        smallBufferLogger.logApiCall(`/test${i}`, 'GET', {}, {}, 100, true);
      }

      expect(smallBufferLogger.getLogBufferSize()).toBe(3);
      
      smallBufferLogger.stop();
    });

    it('should filter logs by level', () => {
      logger.logApiCall('/test', 'GET', {}, {}, 100, true); // info
      logger.logHealthCheck('/test', 'degraded', 100); // warn
      
      const errorContext: ErrorContext = {
        endpoint: '/test',
        method: 'GET',
        attempt: 1,
        maxAttempts: 3,
        startTime: Date.now()
      };
      
      const error = {
        type: QlooErrorType.SERVER_ERROR,
        message: 'Server error',
        code: 'SERVER_ERROR',
        request_id: 'req_1',
        timestamp: new Date().toISOString(),
        retryable: true
      };
      
      logger.logError(error, errorContext); // critical

      const infoLogs = logger.getLogsByLevel('info');
      const warnLogs = logger.getLogsByLevel('warn');
      const criticalLogs = logger.getLogsByLevel('critical');

      expect(infoLogs).toHaveLength(1);
      expect(warnLogs).toHaveLength(1);
      expect(criticalLogs).toHaveLength(1);
    });

    it('should filter logs by service', () => {
      logger.logApiCall('/test', 'GET', {}, {}, 100, true);
      logger.logCacheOperation('get', 'test:key', 'hit');
      logger.logHealthCheck('/test', 'healthy', 100);

      const apiLogs = logger.getLogsByService('qloo-api');
      const cacheLogs = logger.getLogsByService('qloo-cache');
      const healthLogs = logger.getLogsByService('qloo-health');

      expect(apiLogs).toHaveLength(1);
      expect(cacheLogs).toHaveLength(1);
      expect(healthLogs).toHaveLength(1);
    });

    it('should filter logs by tags', () => {
      logger.logApiCall('/search', 'GET', {}, {}, 100, true);
      logger.logCacheOperation('get', 'search:key', 'hit');

      const searchLogs = logger.getLogsByTags(['search']);
      const cacheLogs = logger.getLogsByTags(['cache']);

      expect(searchLogs).toHaveLength(1); // Only API call has search tag
      expect(cacheLogs).toHaveLength(1);
    });

    it('should filter logs by time period', () => {
      const baseTime = Date.now();
      jest.setSystemTime(baseTime);

      logger.logApiCall('/test1', 'GET', {}, {}, 100, true);

      jest.setSystemTime(baseTime + 30000);
      logger.logApiCall('/test2', 'GET', {}, {}, 100, true);

      jest.setSystemTime(baseTime + 60000);
      logger.logApiCall('/test3', 'GET', {}, {}, 100, true);

      const startTime = new Date(baseTime + 15000);
      const endTime = new Date(baseTime + 45000);
      const periodLogs = logger.getLogsForPeriod(startTime, endTime);

      expect(periodLogs).toHaveLength(1); // Only test2 should be in this period
    });

    it('should clear logs when requested', () => {
      logger.logApiCall('/test', 'GET', {}, {}, 100, true);
      expect(logger.getLogBufferSize()).toBeGreaterThan(0);

      logger.clearLogs();
      expect(logger.getLogBufferSize()).toBe(0);
    });
  });

  describe('Configuration and Lifecycle', () => {
    it('should respect log level configuration', () => {
      const warnLogger = new QlooMonitoringLogger({
        logLevel: 'warn',
        enableConsoleOutput: true
      });

      warnLogger.logApiCall('/test', 'GET', {}, {}, 100, true); // info level
      warnLogger.logHealthCheck('/test', 'degraded', 100); // warn level

      // Info level should not be logged
      expect(mockConsole.info).not.toHaveBeenCalled();
      // Warn level should be logged
      expect(mockConsole.warn).toHaveBeenCalled();

      warnLogger.stop();
    });

    it('should handle disabled console output', () => {
      // Clear previous mock calls
      Object.values(mockConsole).forEach(mock => mock.mockClear());
      
      const silentLogger = new QlooMonitoringLogger({
        enableConsoleOutput: false
      });

      silentLogger.logApiCall('/test', 'GET', {}, {}, 100, true);

      // Should still add to buffer but not log to console
      expect(silentLogger.getLogBufferSize()).toBeGreaterThan(0);
      expect(mockConsole.info).not.toHaveBeenCalled();

      silentLogger.stop();
    });

    it('should format simple messages when structured logging is disabled', () => {
      const simpleLogger = new QlooMonitoringLogger({
        enableStructuredLogging: false,
        enableConsoleOutput: true
      });

      simpleLogger.logApiCall('/test', 'GET', {}, {}, 150, true);

      expect(mockConsole.info).toHaveBeenCalled();
      
      const logMessage = mockConsole.info.mock.calls[0][0];
      expect(typeof logMessage).toBe('string');
      expect(logMessage).toContain('qloo-api');
      expect(logMessage).toContain('150ms');

      simpleLogger.stop();
    });
  });

  describe('Factory Function', () => {
    it('should create monitoring logger with custom config', () => {
      const customLogger = createMonitoringLogger({
        logLevel: 'warn',
        bufferSize: 50,
        enablePerformanceLogging: false
      });

      expect(customLogger).toBeInstanceOf(QlooMonitoringLogger);
      customLogger.stop();
    });
  });
});