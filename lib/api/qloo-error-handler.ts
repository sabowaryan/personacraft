// Comprehensive error handling system for Qloo API
// Implements specific strategies for different error types with retry logic and structured logging

import { QlooErrorType, type QlooCompliantError } from '../types/qloo-compliant';

/**
 * Context information for error handling
 */
export interface ErrorContext {
  endpoint: string;
  method: string;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  attempt: number;
  maxAttempts: number;
  startTime: number;
  userId?: string;
  sessionId?: string;
}

/**
 * Error handling strategy result
 */
export interface ErrorHandlingResult {
  shouldRetry: boolean;
  retryDelay?: number;
  fallbackData?: any;
  userMessage: string;
  logLevel: 'error' | 'warn' | 'info';
  additionalContext?: Record<string, any>;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitterEnabled: boolean;
  retryableErrors: QlooErrorType[];
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  jitterEnabled: true,
  retryableErrors: [
    QlooErrorType.RATE_LIMIT,
    QlooErrorType.SERVER_ERROR,
    QlooErrorType.NETWORK_ERROR
  ]
};

/**
 * Comprehensive error handler for Qloo API
 * Implements specific strategies for different error types
 */
export class QlooErrorHandler {
  private retryConfig: RetryConfig;
  private logger: QlooLogger;

  constructor(retryConfig?: Partial<RetryConfig>, logger?: QlooLogger) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
    this.logger = logger || new QlooLogger();
  }

  /**
   * Main error handling method
   * Routes errors to specific handlers based on error type
   */
  handleError(error: QlooCompliantError, context: ErrorContext): ErrorHandlingResult {
    // Log the error with context
    this.logger.logError(error, context);

    // Route to specific error handler
    switch (error.type) {
      case QlooErrorType.AUTHENTICATION:
        return this.handleAuthenticationError(error, context);
      
      case QlooErrorType.AUTHORIZATION:
        return this.handleAuthorizationError(error, context);
      
      case QlooErrorType.VALIDATION:
        return this.handleValidationError(error, context);
      
      case QlooErrorType.RATE_LIMIT:
        return this.handleRateLimitError(error, context);
      
      case QlooErrorType.SERVER_ERROR:
        return this.handleServerError(error, context);
      
      case QlooErrorType.NETWORK_ERROR:
        return this.handleNetworkError(error, context);
      
      case QlooErrorType.NOT_FOUND:
        return this.handleNotFoundError(error, context);
      
      case QlooErrorType.INVALID_PARAMS:
        return this.handleInvalidParamsError(error, context);
      
      default:
        return this.handleUnknownError(error, context);
    }
  }

  /**
   * Handle authentication errors (401)
   */
  private handleAuthenticationError(error: QlooCompliantError, context: ErrorContext): ErrorHandlingResult {
    return {
      shouldRetry: false,
      userMessage: 'API authentication failed. Please check your API key configuration.',
      logLevel: 'error',
      additionalContext: {
        suggestion: 'Verify API key is valid and properly configured',
        documentation: 'https://docs.qloo.com/authentication'
      }
    };
  }

  /**
   * Handle authorization errors (403)
   */
  private handleAuthorizationError(error: QlooCompliantError, context: ErrorContext): ErrorHandlingResult {
    return {
      shouldRetry: false,
      userMessage: 'Insufficient permissions for this API operation.',
      logLevel: 'error',
      additionalContext: {
        suggestion: 'Check API key permissions and subscription level',
        endpoint: context.endpoint,
        requiredPermissions: this.getRequiredPermissions(context.endpoint)
      }
    };
  }

  /**
   * Handle validation errors (422)
   */
  private handleValidationError(error: QlooCompliantError, context: ErrorContext): ErrorHandlingResult {
    const shouldRetry = this.canRetryWithValidParams(error, context);
    
    return {
      shouldRetry,
      retryDelay: shouldRetry ? 0 : undefined, // Immediate retry with corrected params
      userMessage: `Request validation failed: ${error.message}`,
      logLevel: 'warn',
      additionalContext: {
        validationErrors: error.details,
        suggestion: this.getValidationSuggestion(error, context),
        correctedParams: shouldRetry ? this.correctParams(error, context) : undefined
      }
    };
  }

  /**
   * Handle rate limit errors (429)
   */
  private handleRateLimitError(error: QlooCompliantError, context: ErrorContext): ErrorHandlingResult {
    const shouldRetry = this.shouldRetry(error, context);
    const retryDelay = shouldRetry ? this.calculateRetryDelay(context.attempt) : undefined;

    return {
      shouldRetry,
      retryDelay,
      userMessage: 'API rate limit exceeded. Request will be retried automatically.',
      logLevel: 'warn',
      additionalContext: {
        rateLimitInfo: this.extractRateLimitInfo(error),
        nextRetryAt: retryDelay ? new Date(Date.now() + retryDelay).toISOString() : undefined
      }
    };
  }

  /**
   * Handle server errors (5xx)
   */
  private handleServerError(error: QlooCompliantError, context: ErrorContext): ErrorHandlingResult {
    const shouldRetry = this.shouldRetry(error, context);
    const retryDelay = shouldRetry ? this.calculateRetryDelay(context.attempt) : undefined;

    return {
      shouldRetry,
      retryDelay,
      userMessage: 'Qloo API server error. Request will be retried automatically.',
      logLevel: 'error',
      additionalContext: {
        serverErrorCode: error.code,
        isTemporary: shouldRetry,
        fallbackAvailable: this.hasFallbackData(context)
      }
    };
  }

  /**
   * Handle network errors
   */
  private handleNetworkError(error: QlooCompliantError, context: ErrorContext): ErrorHandlingResult {
    const shouldRetry = this.shouldRetry(error, context);
    const retryDelay = shouldRetry ? this.calculateRetryDelay(context.attempt) : undefined;

    return {
      shouldRetry,
      retryDelay,
      userMessage: 'Network connection error. Request will be retried automatically.',
      logLevel: 'warn',
      additionalContext: {
        networkError: error.details,
        connectionStatus: this.checkConnectionStatus(),
        fallbackAvailable: this.hasFallbackData(context)
      }
    };
  }

  /**
   * Handle not found errors (404)
   */
  private handleNotFoundError(error: QlooCompliantError, context: ErrorContext): ErrorHandlingResult {
    return {
      shouldRetry: false,
      userMessage: `API endpoint not found: ${context.endpoint}`,
      logLevel: 'error',
      additionalContext: {
        endpoint: context.endpoint,
        suggestion: 'Check API endpoint URL and version',
        availableEndpoints: this.getAvailableEndpoints()
      }
    };
  }

  /**
   * Handle invalid parameters errors
   */
  private handleInvalidParamsError(error: QlooCompliantError, context: ErrorContext): ErrorHandlingResult {
    const canCorrect = this.canCorrectParams(error, context);
    
    return {
      shouldRetry: canCorrect,
      retryDelay: canCorrect ? 0 : undefined,
      userMessage: `Invalid request parameters: ${error.message}`,
      logLevel: 'warn',
      additionalContext: {
        invalidParams: error.details,
        suggestion: this.getParamCorrectionSuggestion(error, context),
        correctedParams: canCorrect ? this.correctParams(error, context) : undefined
      }
    };
  }

  /**
   * Handle unknown errors
   */
  private handleUnknownError(error: QlooCompliantError, context: ErrorContext): ErrorHandlingResult {
    return {
      shouldRetry: false,
      userMessage: 'An unexpected error occurred with the Qloo API.',
      logLevel: 'error',
      additionalContext: {
        unknownError: error,
        context: context,
        suggestion: 'Contact support if this error persists'
      }
    };
  }

  /**
   * Determine if an error should be retried
   */
  shouldRetry(error: QlooCompliantError, context: ErrorContext): boolean {
    // Check if we've exceeded max attempts
    if (context.attempt >= this.retryConfig.maxAttempts) {
      return false;
    }

    // Check if error type is retryable
    if (!this.retryConfig.retryableErrors.includes(error.type)) {
      return false;
    }

    // Check if error is explicitly marked as retryable
    if (error.retryable === false) {
      return false;
    }

    return true;
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  calculateRetryDelay(attempt: number): number {
    const baseDelay = this.retryConfig.baseDelay;
    const maxDelay = this.retryConfig.maxDelay;
    const backoffMultiplier = this.retryConfig.backoffMultiplier;

    // Calculate exponential backoff
    let delay = Math.min(
      baseDelay * Math.pow(backoffMultiplier, attempt - 1),
      maxDelay
    );

    // Add jitter to prevent thundering herd
    if (this.retryConfig.jitterEnabled) {
      delay += Math.random() * 1000;
    }

    return Math.floor(delay);
  }

  /**
   * Helper methods for specific error handling logic
   */
  private getRequiredPermissions(endpoint: string): string[] {
    const permissionMap: Record<string, string[]> = {
      '/search': ['search:read'],
      '/v2/tags': ['tags:read'],
      '/v2/audiences': ['audiences:read'],
      '/v2/insights': ['insights:read', 'recommendations:read']
    };

    return permissionMap[endpoint] || ['api:access'];
  }

  private canRetryWithValidParams(error: QlooCompliantError, context: ErrorContext): boolean {
    // Check if we can automatically correct the validation error
    return error.details?.suggestion !== undefined || 
           this.hasParamCorrection(error, context);
  }

  private getValidationSuggestion(error: QlooCompliantError, context: ErrorContext): string {
    if (error.details?.suggestion) {
      return error.details.suggestion;
    }

    // Provide context-specific suggestions
    if (context.endpoint === '/v2/insights') {
      return 'Ensure filter.type is specified and signal.* or filter.* parameters are provided';
    }

    return 'Check API documentation for required parameters';
  }

  private correctParams(error: QlooCompliantError, context: ErrorContext): Record<string, any> | undefined {
    // Implement parameter correction logic based on error details
    if (context.endpoint === '/v2/insights' && error.message.includes('filter.type')) {
      return {
        ...context.params,
        'filter.type': 'urn:entity:brand' // Default fallback
      };
    }

    return undefined;
  }

  private extractRateLimitInfo(error: QlooCompliantError): Record<string, any> {
    return {
      limit: error.details?.limit || 'unknown',
      remaining: error.details?.remaining || 0,
      resetTime: error.details?.resetTime || 'unknown'
    };
  }

  private hasFallbackData(context: ErrorContext): boolean {
    // Check if fallback data is available for this endpoint
    const fallbackEndpoints = ['/search', '/v2/tags', '/v2/audiences', '/v2/insights'];
    return fallbackEndpoints.includes(context.endpoint);
  }

  private checkConnectionStatus(): string {
    // Simple connection check - in real implementation, this could ping a health endpoint
    return 'unknown';
  }

  private getAvailableEndpoints(): string[] {
    return [
      '/search',
      '/v2/tags',
      '/v2/audiences',
      '/v2/insights'
    ];
  }

  private canCorrectParams(error: QlooCompliantError, context: ErrorContext): boolean {
    return error.details?.field !== undefined && 
           this.hasParamCorrection(error, context);
  }

  private hasParamCorrection(error: QlooCompliantError, context: ErrorContext): boolean {
    // Check if we have logic to correct this specific parameter error
    const correctableFields = ['filter.type', 'signal.interests.entities', 'limit'];
    return Boolean(error.details?.field && correctableFields.includes(error.details.field));
  }

  private getParamCorrectionSuggestion(error: QlooCompliantError, context: ErrorContext): string {
    if (error.details?.field === 'filter.type') {
      return 'filter.type must be a valid entity URN (e.g., urn:entity:brand)';
    }
    
    if (error.details?.field === 'limit') {
      return 'limit must be between 1 and 100';
    }

    return 'Check parameter format and allowed values';
  }
}

/**
 * Structured logger for Qloo API operations
 */
export class QlooLogger {
  private logLevel: 'debug' | 'info' | 'warn' | 'error';

  constructor(logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info') {
    this.logLevel = logLevel;
  }

  /**
   * Log API errors with structured context
   */
  logError(error: QlooCompliantError, context: ErrorContext): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      service: 'qloo-api',
      error: {
        type: error.type,
        code: error.code,
        message: error.message,
        details: error.details,
        request_id: error.request_id
      },
      context: {
        endpoint: context.endpoint,
        method: context.method,
        attempt: context.attempt,
        maxAttempts: context.maxAttempts,
        duration: Date.now() - context.startTime,
        userId: context.userId,
        sessionId: context.sessionId
      },
      params: this.sanitizeParams(context.params)
    };

    this.writeLog('error', logEntry);
  }

  /**
   * Log API calls with performance metrics
   */
  logApiCall(
    endpoint: string, 
    method: string, 
    params: Record<string, any>, 
    response: any, 
    duration: number
  ): void {
    if (!this.shouldLog('info')) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      service: 'qloo-api',
      operation: 'api_call',
      endpoint,
      method,
      duration,
      params: this.sanitizeParams(params),
      response: {
        status: response?.status || 'unknown',
        size: JSON.stringify(response).length,
        cached: response?.metadata?.cached || false
      }
    };

    this.writeLog('info', logEntry);
  }

  /**
   * Log cache operations
   */
  logCacheOperation(operation: string, key: string, result: 'hit' | 'miss' | 'set' | 'invalidate'): void {
    if (!this.shouldLog('debug')) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'debug',
      service: 'qloo-cache',
      operation,
      key,
      result
    };

    this.writeLog('debug', logEntry);
  }

  /**
   * Log fallback usage
   */
  logFallbackUsage(reason: string, context: ErrorContext, fallbackData?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      service: 'qloo-fallback',
      reason,
      context: {
        endpoint: context.endpoint,
        attempt: context.attempt
      },
      fallbackDataSize: fallbackData ? JSON.stringify(fallbackData).length : 0
    };

    this.writeLog('warn', logEntry);
  }

  /**
   * Log retry attempts
   */
  logRetryAttempt(context: ErrorContext, retryDelay: number): void {
    if (!this.shouldLog('info')) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      service: 'qloo-retry',
      attempt: context.attempt,
      maxAttempts: context.maxAttempts,
      retryDelay,
      endpoint: context.endpoint
    };

    this.writeLog('info', logEntry);
  }

  /**
   * Check if we should log at this level
   */
  private shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const requestedLevelIndex = levels.indexOf(level);
    
    return requestedLevelIndex >= currentLevelIndex;
  }

  /**
   * Sanitize parameters to remove sensitive data
   */
  private sanitizeParams(params?: Record<string, any>): Record<string, any> {
    if (!params) return {};

    const sanitized = { ...params };
    
    // Remove or mask sensitive fields
    const sensitiveFields = ['api_key', 'apiKey', 'token', 'password'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***masked***';
      }
    });

    return sanitized;
  }

  /**
   * Write log entry to appropriate destination
   */
  private writeLog(level: string, logEntry: any): void {
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.log(JSON.stringify(logEntry, null, 2));
      return;
    }

    // In production, you might want to send to a logging service
    // For now, we'll use console with structured format
    const message = `[${logEntry.timestamp}] ${level.toUpperCase()}: ${logEntry.service}`;
    
    switch (level) {
      case 'error':
        console.error(message, logEntry);
        break;
      case 'warn':
        console.warn(message, logEntry);
        break;
      case 'info':
        console.info(message, logEntry);
        break;
      case 'debug':
        console.debug(message, logEntry);
        break;
      default:
        console.log(message, logEntry);
    }
  }
}

/**
 * Default error handler instance
 */
export const defaultErrorHandler = new QlooErrorHandler();

/**
 * Default logger instance
 */
export const defaultLogger = new QlooLogger();

/**
 * Utility function to create error context
 */
export function createErrorContext(
  endpoint: string,
  method: string = 'GET',
  params?: Record<string, any>,
  attempt: number = 1,
  maxAttempts: number = 3,
  startTime: number = Date.now(),
  userId?: string,
  sessionId?: string
): ErrorContext {
  return {
    endpoint,
    method,
    params,
    attempt,
    maxAttempts,
    startTime,
    userId,
    sessionId
  };
}

/**
 * Utility function to create a Qloo compliant error
 */
export function createQlooError(
  type: QlooErrorType,
  message: string,
  code: string,
  details?: any,
  retryable: boolean = false
): QlooCompliantError {
  return {
    type,
    message,
    code,
    details,
    request_id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    retryable
  };
}