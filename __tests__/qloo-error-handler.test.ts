// Comprehensive unit tests for Qloo error handling system
// Tests all error scenarios and recovery strategies

import {
  QlooErrorHandler,
  QlooLogger,
  createErrorContext,
  createQlooError,
  defaultErrorHandler,
  defaultLogger
} from '../lib/api/qloo-error-handler';
import type {
  ErrorContext,
  ErrorHandlingResult,
  RetryConfig
} from '../lib/api/qloo-error-handler';
import { QlooErrorType, type QlooCompliantError } from '../lib/types/qloo-compliant';

// Mock console methods to avoid noise in tests
const mockConsole = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'test-uuid-123')
  }
});

beforeEach(() => {
  jest.clearAllMocks();
  // Replace console methods
  Object.assign(console, mockConsole);
});

describe('QlooErrorHandler', () => {
  let errorHandler: QlooErrorHandler;
  let logger: QlooLogger;
  let mockContext: ErrorContext;

  beforeEach(() => {
    logger = new QlooLogger('error'); // Only log errors in tests
    errorHandler = new QlooErrorHandler(undefined, logger);
    mockContext = createErrorContext('/v2/insights', 'POST', { 'filter.type': 'urn:entity:brand' });
  });

  describe('Authentication Error Handling', () => {
    it('should handle 401 authentication errors correctly', () => {
      const error = createQlooError(
        QlooErrorType.AUTHENTICATION,
        'Invalid API key',
        'UNAUTHORIZED'
      );

      const result = errorHandler.handleError(error, mockContext);

      expect(result.shouldRetry).toBe(false);
      expect(result.userMessage).toContain('API authentication failed');
      expect(result.logLevel).toBe('error');
      expect(result.additionalContext?.suggestion).toContain('Verify API key');
      expect(result.additionalContext?.documentation).toBe('https://docs.qloo.com/authentication');
    });

    it('should not retry authentication errors', () => {
      const error = createQlooError(QlooErrorType.AUTHENTICATION, 'Invalid API key', 'UNAUTHORIZED');
      
      expect(errorHandler.shouldRetry(error, mockContext)).toBe(false);
    });
  });

  describe('Authorization Error Handling', () => {
    it('should handle 403 authorization errors correctly', () => {
      const error = createQlooError(
        QlooErrorType.AUTHORIZATION,
        'Insufficient permissions',
        'FORBIDDEN'
      );

      const result = errorHandler.handleError(error, mockContext);

      expect(result.shouldRetry).toBe(false);
      expect(result.userMessage).toContain('Insufficient permissions');
      expect(result.logLevel).toBe('error');
      expect(result.additionalContext?.requiredPermissions).toEqual(['insights:read', 'recommendations:read']);
    });

    it('should provide correct required permissions for different endpoints', () => {
      const searchContext = createErrorContext('/search');
      const tagsContext = createErrorContext('/v2/tags');
      const audiencesContext = createErrorContext('/v2/audiences');

      const error = createQlooError(QlooErrorType.AUTHORIZATION, 'Forbidden', 'FORBIDDEN');

      const searchResult = errorHandler.handleError(error, searchContext);
      const tagsResult = errorHandler.handleError(error, tagsContext);
      const audiencesResult = errorHandler.handleError(error, audiencesContext);

      expect(searchResult.additionalContext?.requiredPermissions).toEqual(['search:read']);
      expect(tagsResult.additionalContext?.requiredPermissions).toEqual(['tags:read']);
      expect(audiencesResult.additionalContext?.requiredPermissions).toEqual(['audiences:read']);
    });
  });

  describe('Validation Error Handling', () => {
    it('should handle validation errors with correction suggestions', () => {
      const error = createQlooError(
        QlooErrorType.VALIDATION,
        'Missing required parameter: filter.type',
        'INVALID_PARAMS',
        { field: 'filter.type', suggestion: 'Add filter.type parameter' }
      );

      const result = errorHandler.handleError(error, mockContext);

      expect(result.shouldRetry).toBe(true);
      expect(result.retryDelay).toBe(0); // Immediate retry
      expect(result.userMessage).toContain('Request validation failed');
      expect(result.logLevel).toBe('warn');
      expect(result.additionalContext?.suggestion).toContain('Add filter.type parameter');
    });

    it('should provide parameter correction for insights endpoint', () => {
      const contextWithoutFilterType = createErrorContext('/v2/insights', 'POST', {});
      const error = createQlooError(
        QlooErrorType.VALIDATION,
        'Missing filter.type',
        'INVALID_PARAMS'
      );

      const result = errorHandler.handleError(error, contextWithoutFilterType);

      expect(result.shouldRetry).toBe(false); // No automatic correction without suggestion
      expect(result.additionalContext?.suggestion).toContain('filter.type is specified');
    });

    it('should handle correctable parameter errors', () => {
      const error = createQlooError(
        QlooErrorType.VALIDATION,
        'Invalid filter.type',
        'INVALID_PARAMS',
        { field: 'filter.type' }
      );

      const result = errorHandler.handleError(error, mockContext);

      expect(result.shouldRetry).toBe(true);
      expect(result.additionalContext?.correctedParams).toEqual({
        'filter.type': 'urn:entity:brand'
      });
    });
  });

  describe('Rate Limit Error Handling', () => {
    it('should handle rate limit errors with retry logic', () => {
      const error = createQlooError(
        QlooErrorType.RATE_LIMIT,
        'Rate limit exceeded',
        'RATE_LIMIT_EXCEEDED',
        { limit: 100, remaining: 0, resetTime: '2024-01-01T12:00:00Z' },
        true
      );

      const result = errorHandler.handleError(error, mockContext);

      expect(result.shouldRetry).toBe(true);
      expect(result.retryDelay).toBeGreaterThan(0);
      expect(result.userMessage).toContain('rate limit exceeded');
      expect(result.logLevel).toBe('warn');
      expect(result.additionalContext?.rateLimitInfo).toEqual({
        limit: 100,
        remaining: 0,
        resetTime: '2024-01-01T12:00:00Z'
      });
    });

    it('should not retry rate limit errors after max attempts', () => {
      const contextMaxAttempts = createErrorContext('/v2/insights', 'POST', {}, 3, 3);
      const error = createQlooError(QlooErrorType.RATE_LIMIT, 'Rate limit', 'RATE_LIMIT', {}, true);

      expect(errorHandler.shouldRetry(error, contextMaxAttempts)).toBe(false);
    });
  });

  describe('Server Error Handling', () => {
    it('should handle server errors with retry logic', () => {
      const error = createQlooError(
        QlooErrorType.SERVER_ERROR,
        'Internal server error',
        'SERVER_ERROR',
        {},
        true
      );

      const result = errorHandler.handleError(error, mockContext);

      expect(result.shouldRetry).toBe(true);
      expect(result.retryDelay).toBeGreaterThan(0);
      expect(result.userMessage).toContain('server error');
      expect(result.logLevel).toBe('error');
      expect(result.additionalContext?.fallbackAvailable).toBe(true);
    });

    it('should indicate fallback availability for supported endpoints', () => {
      const supportedEndpoints = ['/search', '/v2/tags', '/v2/audiences', '/v2/insights'];
      const error = createQlooError(QlooErrorType.SERVER_ERROR, 'Server error', 'SERVER_ERROR');

      supportedEndpoints.forEach(endpoint => {
        const context = createErrorContext(endpoint);
        const result = errorHandler.handleError(error, context);
        expect(result.additionalContext?.fallbackAvailable).toBe(true);
      });
    });
  });

  describe('Network Error Handling', () => {
    it('should handle network errors with retry logic', () => {
      const error = createQlooError(
        QlooErrorType.NETWORK_ERROR,
        'Connection timeout',
        'NETWORK_ERROR',
        { timeout: 10000 },
        true
      );

      const result = errorHandler.handleError(error, mockContext);

      expect(result.shouldRetry).toBe(true);
      expect(result.retryDelay).toBeGreaterThan(0);
      expect(result.userMessage).toContain('Network connection error');
      expect(result.logLevel).toBe('warn');
      expect(result.additionalContext?.networkError).toEqual({ timeout: 10000 });
    });
  });

  describe('Not Found Error Handling', () => {
    it('should handle 404 not found errors', () => {
      const error = createQlooError(
        QlooErrorType.NOT_FOUND,
        'Endpoint not found',
        'ENDPOINT_NOT_FOUND'
      );

      const result = errorHandler.handleError(error, mockContext);

      expect(result.shouldRetry).toBe(false);
      expect(result.userMessage).toContain('API endpoint not found');
      expect(result.logLevel).toBe('error');
      expect(result.additionalContext?.availableEndpoints).toEqual([
        '/search',
        '/v2/tags',
        '/v2/audiences',
        '/v2/insights'
      ]);
    });
  });

  describe('Invalid Parameters Error Handling', () => {
    it('should handle invalid parameter errors with correction', () => {
      const error = createQlooError(
        QlooErrorType.INVALID_PARAMS,
        'Invalid limit value',
        'INVALID_PARAMS',
        { field: 'limit', value: 150 }
      );

      const result = errorHandler.handleError(error, mockContext);

      expect(result.shouldRetry).toBe(true);
      expect(result.userMessage).toContain('Invalid request parameters');
      expect(result.logLevel).toBe('warn');
      expect(result.additionalContext?.suggestion).toContain('limit must be between 1 and 100');
    });
  });

  describe('Retry Logic', () => {
    it('should calculate exponential backoff correctly', () => {
      const delay1 = errorHandler.calculateRetryDelay(1);
      const delay2 = errorHandler.calculateRetryDelay(2);
      const delay3 = errorHandler.calculateRetryDelay(3);

      // Base delay is 1000ms, multiplier is 2
      expect(delay1).toBeGreaterThanOrEqual(1000);
      expect(delay1).toBeLessThan(3000); // Including jitter
      expect(delay2).toBeGreaterThanOrEqual(2000);
      expect(delay2).toBeLessThan(4000);
      expect(delay3).toBeGreaterThanOrEqual(4000);
      expect(delay3).toBeLessThan(6000);
    });

    it('should respect max delay configuration', () => {
      const customConfig: Partial<RetryConfig> = {
        maxDelay: 5000,
        baseDelay: 1000,
        backoffMultiplier: 2
      };
      const customHandler = new QlooErrorHandler(customConfig);

      const delay = customHandler.calculateRetryDelay(10); // Very high attempt
      expect(delay).toBeLessThanOrEqual(6000); // Max delay + jitter
    });

    it('should handle jitter configuration', () => {
      const noJitterConfig: Partial<RetryConfig> = {
        jitterEnabled: false,
        baseDelay: 1000,
        backoffMultiplier: 2
      };
      const noJitterHandler = new QlooErrorHandler(noJitterConfig);

      const delay = noJitterHandler.calculateRetryDelay(1);
      expect(delay).toBe(1000); // Exact base delay without jitter
    });

    it('should respect retryable error types configuration', () => {
      const customConfig: Partial<RetryConfig> = {
        retryableErrors: [QlooErrorType.RATE_LIMIT] // Only rate limit errors
      };
      const customHandler = new QlooErrorHandler(customConfig);

      const rateLimitError = createQlooError(QlooErrorType.RATE_LIMIT, 'Rate limit', 'RATE_LIMIT', {}, true);
      const serverError = createQlooError(QlooErrorType.SERVER_ERROR, 'Server error', 'SERVER_ERROR');

      expect(customHandler.shouldRetry(rateLimitError, mockContext)).toBe(true);
      expect(customHandler.shouldRetry(serverError, mockContext)).toBe(false);
    });

    it('should respect explicit retryable flag', () => {
      const nonRetryableError = createQlooError(
        QlooErrorType.RATE_LIMIT,
        'Rate limit',
        'RATE_LIMIT',
        {},
        false // Explicitly not retryable
      );

      expect(errorHandler.shouldRetry(nonRetryableError, mockContext)).toBe(false);
    });
  });

  describe('Unknown Error Handling', () => {
    it('should handle unknown error types gracefully', () => {
      const unknownError = {
        type: 'unknown_error' as QlooErrorType,
        message: 'Unknown error occurred',
        code: 'UNKNOWN',
        request_id: 'test-123',
        timestamp: new Date().toISOString()
      };

      const result = errorHandler.handleError(unknownError, mockContext);

      expect(result.shouldRetry).toBe(false);
      expect(result.userMessage).toContain('unexpected error');
      expect(result.logLevel).toBe('error');
      expect(result.additionalContext?.suggestion).toContain('Contact support');
    });
  });
});

describe('QlooLogger', () => {
  let logger: QlooLogger;
  let mockContext: ErrorContext;

  beforeEach(() => {
    logger = new QlooLogger('debug'); // Log everything in tests
    mockContext = createErrorContext('/v2/insights', 'POST');
  });

  describe('Error Logging', () => {
    it('should log errors with structured context', () => {
      // Mock NODE_ENV to development to trigger console.log
      const originalEnv = process.env.NODE_ENV;
      jest.replaceProperty(process.env, 'NODE_ENV', 'development');
      
      const error = createQlooError(QlooErrorType.AUTHENTICATION, 'Auth failed', 'UNAUTHORIZED');
      
      logger.logError(error, mockContext);

      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('"level": "error"')
      );
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('"service": "qloo-api"')
      );
      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('UNAUTHORIZED')
      );
      
      // Restore original NODE_ENV
      jest.replaceProperty(process.env, 'NODE_ENV', originalEnv);
    });

    it('should sanitize sensitive parameters', () => {
      // Mock NODE_ENV to development to trigger console.log
      const originalEnv = process.env.NODE_ENV;
      jest.replaceProperty(process.env, 'NODE_ENV', 'development');
      
      const contextWithSensitiveData = createErrorContext(
        '/v2/insights',
        'POST',
        { 'filter.type': 'urn:entity:brand', apiKey: 'secret-key-123' }
      );
      const error = createQlooError(QlooErrorType.VALIDATION, 'Validation failed', 'INVALID');

      logger.logError(error, contextWithSensitiveData);

      const logCall = mockConsole.log.mock.calls[0][0];
      expect(logCall).toContain('***masked***');
      expect(logCall).not.toContain('secret-key-123');
      
      // Restore original NODE_ENV
      jest.replaceProperty(process.env, 'NODE_ENV', originalEnv);
    });
  });

  describe('API Call Logging', () => {
    it('should log API calls with performance metrics', () => {
      // Mock NODE_ENV to production to trigger console.info
      const originalEnv = process.env.NODE_ENV;
      jest.replaceProperty(process.env, 'NODE_ENV', 'production');
      
      const response = { status: 200, data: { entities: [] } };
      
      logger.logApiCall('/v2/insights', 'POST', { 'filter.type': 'urn:entity:brand' }, response, 250);

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('qloo-api'),
        expect.objectContaining({
          operation: 'api_call',
          endpoint: '/v2/insights',
          duration: 250
        })
      );
      
      // Restore original NODE_ENV
      jest.replaceProperty(process.env, 'NODE_ENV', originalEnv);
    });

    it('should respect log level configuration', () => {
      const errorOnlyLogger = new QlooLogger('error');
      
      errorOnlyLogger.logApiCall('/search', 'GET', {}, {}, 100);

      expect(mockConsole.info).not.toHaveBeenCalled();
    });
  });

  describe('Cache Operation Logging', () => {
    it('should log cache operations at debug level', () => {
      // Mock NODE_ENV to production to trigger console.debug
      const originalEnv = process.env.NODE_ENV;
      jest.replaceProperty(process.env, 'NODE_ENV', 'production');
      
      logger.logCacheOperation('get', 'insights:brand:123', 'hit');

      expect(mockConsole.debug).toHaveBeenCalledWith(
        expect.stringContaining('qloo-cache'),
        expect.objectContaining({
          operation: 'get',
          key: 'insights:brand:123',
          result: 'hit'
        })
      );
      
      // Restore original NODE_ENV
      jest.replaceProperty(process.env, 'NODE_ENV', originalEnv);
    });
  });

  describe('Fallback Usage Logging', () => {
    it('should log fallback usage with context', () => {
      // Mock NODE_ENV to production to trigger console.warn
      const originalEnv = process.env.NODE_ENV;
      jest.replaceProperty(process.env, 'NODE_ENV', 'production');
      
      const fallbackData = { entities: [{ id: '1', name: 'Fallback Brand' }] };
      
      logger.logFallbackUsage('API unavailable', mockContext, fallbackData);

      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('qloo-fallback'),
        expect.objectContaining({
          reason: 'API unavailable',
          fallbackDataSize: expect.any(Number)
        })
      );
      
      // Restore original NODE_ENV
      jest.replaceProperty(process.env, 'NODE_ENV', originalEnv);
    });
  });

  describe('Retry Attempt Logging', () => {
    it('should log retry attempts with delay information', () => {
      // Mock NODE_ENV to production to trigger console.info
      const originalEnv = process.env.NODE_ENV;
      jest.replaceProperty(process.env, 'NODE_ENV', 'production');
      
      logger.logRetryAttempt(mockContext, 2000);

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('qloo-retry'),
        expect.objectContaining({
          attempt: 1,
          maxAttempts: 3,
          retryDelay: 2000,
          endpoint: '/v2/insights'
        })
      );
      
      // Restore original NODE_ENV
      jest.replaceProperty(process.env, 'NODE_ENV', originalEnv);
    });
  });

  describe('Log Level Management', () => {
    it('should filter logs based on configured level', () => {
      const warnLogger = new QlooLogger('warn');
      
      warnLogger.logCacheOperation('get', 'test', 'hit'); // debug level - should not log
      warnLogger.logFallbackUsage('test', mockContext); // warn level - should log

      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.warn).toHaveBeenCalled();
    });

    it('should handle all log levels correctly', () => {
      const levels = ['debug', 'info', 'warn', 'error'] as const;
      
      levels.forEach(level => {
        const levelLogger = new QlooLogger(level);
        expect(levelLogger).toBeDefined();
      });
    });
  });
});

describe('Utility Functions', () => {
  describe('createErrorContext', () => {
    it('should create error context with default values', () => {
      const context = createErrorContext('/v2/insights');

      expect(context.endpoint).toBe('/v2/insights');
      expect(context.method).toBe('GET');
      expect(context.attempt).toBe(1);
      expect(context.maxAttempts).toBe(3);
      expect(context.startTime).toBeCloseTo(Date.now(), -2); // Within 100ms
    });

    it('should create error context with custom values', () => {
      const customStartTime = Date.now() - 1000;
      const context = createErrorContext(
        '/search',
        'POST',
        { query: 'test' },
        2,
        5,
        customStartTime,
        'user-123',
        'session-456'
      );

      expect(context.endpoint).toBe('/search');
      expect(context.method).toBe('POST');
      expect(context.params).toEqual({ query: 'test' });
      expect(context.attempt).toBe(2);
      expect(context.maxAttempts).toBe(5);
      expect(context.startTime).toBe(customStartTime);
      expect(context.userId).toBe('user-123');
      expect(context.sessionId).toBe('session-456');
    });
  });

  describe('createQlooError', () => {
    it('should create Qloo compliant error with required fields', () => {
      const error = createQlooError(
        QlooErrorType.VALIDATION,
        'Validation failed',
        'INVALID_PARAMS'
      );

      expect(error.type).toBe(QlooErrorType.VALIDATION);
      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe('INVALID_PARAMS');
      expect(error.request_id).toBe('test-uuid-123');
      expect(error.timestamp).toBeDefined();
      expect(error.retryable).toBe(false);
    });

    it('should create error with optional fields', () => {
      const details = { field: 'filter.type', value: 'invalid' };
      const error = createQlooError(
        QlooErrorType.RATE_LIMIT,
        'Rate limit exceeded',
        'RATE_LIMIT',
        details,
        true
      );

      expect(error.details).toEqual(details);
      expect(error.retryable).toBe(true);
    });
  });
});

describe('Default Instances', () => {
  it('should provide default error handler instance', () => {
    expect(defaultErrorHandler).toBeInstanceOf(QlooErrorHandler);
  });

  it('should provide default logger instance', () => {
    expect(defaultLogger).toBeInstanceOf(QlooLogger);
  });

  it('should handle errors with default instances', () => {
    const error = createQlooError(QlooErrorType.AUTHENTICATION, 'Auth failed', 'UNAUTHORIZED');
    const context = createErrorContext('/v2/insights');

    const result = defaultErrorHandler.handleError(error, context);

    expect(result).toBeDefined();
    expect(result.shouldRetry).toBe(false);
    expect(result.userMessage).toContain('authentication failed');
  });
});

describe('Integration Tests', () => {
  let integrationErrorHandler: QlooErrorHandler;

  beforeEach(() => {
    integrationErrorHandler = new QlooErrorHandler();
  });

  it('should handle complete error flow with retry logic', () => {
    const retryableError = createQlooError(
      QlooErrorType.RATE_LIMIT,
      'Rate limit exceeded',
      'RATE_LIMIT',
      {},
      true
    );
    
    const context1 = createErrorContext('/v2/insights', 'POST', {}, 1);
    const context2 = createErrorContext('/v2/insights', 'POST', {}, 2);
    const context3 = createErrorContext('/v2/insights', 'POST', {}, 3);

    const result1 = integrationErrorHandler.handleError(retryableError, context1);
    const result2 = integrationErrorHandler.handleError(retryableError, context2);
    const result3 = integrationErrorHandler.handleError(retryableError, context3);

    expect(result1.shouldRetry).toBe(true);
    expect(result2.shouldRetry).toBe(true);
    expect(result3.shouldRetry).toBe(false); // Max attempts reached
    
    expect(result1.retryDelay).toBeLessThan(result2.retryDelay!); // Exponential backoff
  });

  it('should handle validation error with parameter correction', () => {
    const validationError = createQlooError(
      QlooErrorType.VALIDATION,
      'Missing filter.type',
      'INVALID_PARAMS',
      { field: 'filter.type' }
    );
    
    const context = createErrorContext('/v2/insights', 'POST', {});
    const result = integrationErrorHandler.handleError(validationError, context);

    expect(result.shouldRetry).toBe(true);
    expect(result.retryDelay).toBe(0); // Immediate retry
    expect(result.additionalContext?.correctedParams).toEqual({
      'filter.type': 'urn:entity:brand'
    });
  });

  it('should provide comprehensive error information for debugging', () => {
    // Mock NODE_ENV to development to trigger console.log
    const originalEnv = process.env.NODE_ENV;
    jest.replaceProperty(process.env, 'NODE_ENV', 'development');
    
    const complexError = createQlooError(
      QlooErrorType.SERVER_ERROR,
      'Database connection failed',
      'DB_CONNECTION_ERROR',
      {
        database: 'qloo-prod',
        connectionPool: 'exhausted',
        retryAfter: 30
      },
      true
    );

    const context = createErrorContext(
      '/v2/insights',
      'POST',
      { 'filter.type': 'urn:entity:brand', 'signal.interests.tags': ['music', 'fashion'] },
      2,
      3,
      Date.now() - 5000,
      'user-789',
      'session-abc'
    );

    const result = integrationErrorHandler.handleError(complexError, context);

    expect(result.shouldRetry).toBe(true);
    expect(result.additionalContext?.serverErrorCode).toBe('DB_CONNECTION_ERROR');
    expect(result.additionalContext?.fallbackAvailable).toBe(true);
    
    // Verify logging was called with comprehensive context
    expect(mockConsole.log).toHaveBeenCalledWith(
      expect.stringContaining('"service": "qloo-api"')
    );
    
    // Restore original NODE_ENV
    jest.replaceProperty(process.env, 'NODE_ENV', originalEnv);
  });
});