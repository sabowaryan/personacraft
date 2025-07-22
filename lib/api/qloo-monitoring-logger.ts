// Enhanced structured logging system for Qloo API monitoring
// Extends the base QlooLogger with comprehensive monitoring capabilities

import { QlooLogger } from './qloo-error-handler';
import type { QlooCompliantError, QlooErrorType } from '@/lib/types/qloo-compliant';
import type { ErrorContext } from './qloo-error-handler';
import type { QlooMetrics } from './qloo-metrics';

/**
 * Log levels for monitoring
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

/**
 * Structured log entry interface
 */
export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    service: string;
    operation: string;
    message: string;
    context?: Record<string, any>;
    metadata?: Record<string, any>;
    duration?: number;
    requestId?: string;
    userId?: string;
    sessionId?: string;
    tags?: string[];
}

/**
 * Performance log entry
 */
export interface PerformanceLogEntry extends LogEntry {
    operation: 'api_call' | 'cache_operation' | 'health_check' | 'metrics_collection';
    performance: {
        duration: number;
        startTime: string;
        endTime: string;
        memoryUsage?: NodeJS.MemoryUsage;
        cpuUsage?: NodeJS.CpuUsage;
    };
}

/**
 * Error log entry with enhanced context
 */
export interface ErrorLogEntry extends LogEntry {
    error: {
        type: QlooErrorType;
        code: string;
        message: string;
        stack?: string;
        details?: any;
        retryable: boolean;
    };
    context: ErrorContext;
    resolution?: {
        action: string;
        success: boolean;
        fallbackUsed: boolean;
    };
}

/**
 * Monitoring logger configuration
 */
export interface MonitoringLoggerConfig {
    logLevel: LogLevel;
    enableConsoleOutput: boolean;
    enableFileOutput: boolean;
    enableStructuredLogging: boolean;
    enablePerformanceLogging: boolean;
    enableMetricsLogging: boolean;
    logFilePath?: string;
    maxLogFileSize: number; // bytes
    maxLogFiles: number;
    bufferSize: number;
    flushInterval: number; // milliseconds
    sensitiveFields: string[];
}

/**
 * Default monitoring logger configuration
 */
const DEFAULT_MONITORING_CONFIG: MonitoringLoggerConfig = {
    logLevel: 'info',
    enableConsoleOutput: true,
    enableFileOutput: false,
    enableStructuredLogging: true,
    enablePerformanceLogging: true,
    enableMetricsLogging: true,
    maxLogFileSize: 10 * 1024 * 1024, // 10MB
    maxLogFiles: 5,
    bufferSize: 100,
    flushInterval: 5000, // 5 seconds
    sensitiveFields: ['api_key', 'apiKey', 'token', 'password', 'authorization']
};

/**
 * Enhanced monitoring logger for Qloo API
 * Provides comprehensive logging with performance tracking and structured output
 */
export class QlooMonitoringLogger extends QlooLogger {
    private config: MonitoringLoggerConfig;
    private logBuffer: LogEntry[] = [];
    private flushTimer: NodeJS.Timeout | null = null;
    private performanceMarks: Map<string, { startTime: number; startCpu?: NodeJS.CpuUsage }> = new Map();

    constructor(config?: Partial<MonitoringLoggerConfig>) {
        const baseLogLevel = config?.logLevel === 'critical' ? 'error' : (config?.logLevel || 'info');
        super(baseLogLevel as 'debug' | 'info' | 'warn' | 'error');
        this.config = { ...DEFAULT_MONITORING_CONFIG, ...config };

        if (this.config.bufferSize > 0) {
            this.startBufferFlush();
        }
    }

    /**
     * Log API call with comprehensive context and performance metrics
     */
    logApiCall(
        endpoint: string,
        method: string,
        params: Record<string, any>,
        response: any,
        duration: number,
        success: boolean = true,
        error?: QlooCompliantError
    ): void {
        const logEntry: LogEntry = {
            timestamp: new Date().toISOString(),
            level: success ? 'info' : 'error',
            service: 'qloo-api',
            operation: 'api_call',
            message: `${method} ${endpoint} ${success ? 'succeeded' : 'failed'} in ${duration}ms`,
            context: {
                endpoint,
                method,
                success,
                duration,
                responseSize: this.calculateResponseSize(response),
                cached: response?.metadata?.cached || false
            },
            metadata: {
                params: this.sanitizeParamsEnhanced(params),
                response: this.sanitizeResponse(response),
                error: error ? this.sanitizeError(error) : undefined
            },
            duration,
            requestId: response?.metadata?.request_id || this.generateRequestId(),
            tags: ['api', 'qloo', endpoint.replace('/', '')]
        };

        this.writeLogEntry(logEntry);

        // Also call parent method for backward compatibility only if console output is enabled
        if (this.config.enableConsoleOutput) {
            super.logApiCall(endpoint, method, params, response, duration);
        }
    }

    /**
     * Log cache operations with detailed metrics
     */
    logCacheOperation(
        operation: string,
        key: string,
        result: 'hit' | 'miss' | 'set' | 'invalidate',
        metadata?: {
            endpoint?: string;
            keySize?: number;
            valueSize?: number;
            ttl?: number;
            evicted?: boolean;
        }
    ): void {
        const logEntry: LogEntry = {
            timestamp: new Date().toISOString(),
            level: 'debug',
            service: 'qloo-cache',
            operation: 'cache_operation',
            message: `Cache ${operation} ${result} for key: ${this.truncateKey(key)}`,
            context: {
                operation,
                key: this.truncateKey(key),
                result,
                endpoint: metadata?.endpoint,
                keySize: metadata?.keySize,
                valueSize: metadata?.valueSize,
                ttl: metadata?.ttl,
                evicted: metadata?.evicted
            },
            tags: ['cache', 'qloo', operation, result]
        };

        this.writeLogEntry(logEntry);

        // Also call parent method for backward compatibility
        super.logCacheOperation(operation, key, result);
    }

    /**
     * Log errors with enhanced context and resolution tracking
     */
    logError(error: QlooCompliantError, context: ErrorContext, resolution?: {
        action: string;
        success: boolean;
        fallbackUsed: boolean;
    }): void {
        const errorLogEntry: ErrorLogEntry = {
            timestamp: new Date().toISOString(),
            level: this.getErrorLogLevel(error.type),
            service: 'qloo-api',
            operation: 'error_handling',
            message: `${error.type} error: ${error.message}`,
            error: {
                type: error.type,
                code: error.code,
                message: error.message,
                stack: error.details?.stack,
                details: this.sanitizeErrorDetails(error.details),
                retryable: error.retryable || false
            },
            context,
            resolution,
            requestId: error.request_id,
            userId: context.userId,
            sessionId: context.sessionId,
            tags: ['error', 'qloo', error.type, context.endpoint.replace('/', '')]
        };

        this.writeLogEntry(errorLogEntry);

        // Also call parent method for backward compatibility
        super.logError(error, context);
    }

    /**
     * Log performance metrics
     */
    logPerformanceMetrics(metrics: QlooMetrics): void {
        if (!this.config.enablePerformanceLogging) return;

        const logEntry: LogEntry = {
            timestamp: new Date().toISOString(),
            level: 'info',
            service: 'qloo-metrics',
            operation: 'metrics_collection',
            message: `Performance metrics collected: ${metrics.apiCalls.total} API calls, ${metrics.cache.hitRate.toFixed(1)}% cache hit rate`,
            context: {
                apiCalls: {
                    total: metrics.apiCalls.total,
                    successRate: metrics.apiCalls.successRate,
                    averageResponseTime: metrics.apiCalls.averageResponseTime
                },
                cache: {
                    hitRate: metrics.cache.hitRate,
                    totalRequests: metrics.cache.totalRequests
                },
                errors: {
                    totalErrors: metrics.errors.totalErrors,
                    errorRate: metrics.errors.errorRate
                },
                health: {
                    isHealthy: metrics.health.isHealthy,
                    consecutiveFailures: metrics.health.consecutiveFailures
                }
            },
            metadata: {
                collectionPeriod: metrics.collectionPeriod,
                timestamp: metrics.timestamp
            },
            tags: ['metrics', 'performance', 'qloo']
        };

        this.writeLogEntry(logEntry);
    }

    /**
     * Log health check results
     */
    logHealthCheck(
        endpoint: string,
        status: 'healthy' | 'unhealthy' | 'degraded',
        responseTime: number,
        error?: Error
    ): void {
        const logEntry: LogEntry = {
            timestamp: new Date().toISOString(),
            level: status === 'healthy' ? 'info' : (status === 'degraded' ? 'warn' : 'error'),
            service: 'qloo-health',
            operation: 'health_check',
            message: `Health check for ${endpoint}: ${status} (${responseTime}ms)`,
            context: {
                endpoint,
                status,
                responseTime,
                error: error ? {
                    message: error.message,
                    name: error.name
                } : undefined
            },
            duration: responseTime,
            tags: ['health', 'qloo', status, endpoint.replace('/', '')]
        };

        this.writeLogEntry(logEntry);
    }

    /**
     * Log fallback usage
     */
    logFallbackUsage(
        reason: string,
        context: ErrorContext,
        fallbackData?: any,
        success: boolean = true
    ): void {
        const logEntry: LogEntry = {
            timestamp: new Date().toISOString(),
            level: success ? 'warn' : 'error',
            service: 'qloo-fallback',
            operation: 'fallback_usage',
            message: `Fallback ${success ? 'used' : 'failed'}: ${reason}`,
            context: {
                reason,
                endpoint: context.endpoint,
                attempt: context.attempt,
                fallbackDataSize: fallbackData ? this.calculateResponseSize(fallbackData) : 0,
                success
            },
            requestId: this.generateRequestId(),
            userId: context.userId,
            sessionId: context.sessionId,
            tags: ['fallback', 'qloo', success ? 'success' : 'failure']
        };

        this.writeLogEntry(logEntry);

        // Also call parent method for backward compatibility
        super.logFallbackUsage(reason, context, fallbackData);
    }

    /**
     * Start performance measurement
     */
    startPerformanceMeasurement(operationId: string): void {
        if (!this.config.enablePerformanceLogging) return;

        this.performanceMarks.set(operationId, {
            startTime: Date.now(),
            startCpu: process.cpuUsage ? process.cpuUsage() : undefined
        });
    }

    /**
     * End performance measurement and log results
     */
    endPerformanceMeasurement(
        operationId: string,
        operation: string,
        context?: Record<string, any>
    ): number {
        if (!this.config.enablePerformanceLogging) return 0;

        const mark = this.performanceMarks.get(operationId);
        if (!mark) return 0;

        const endTime = Date.now();
        const duration = endTime - mark.startTime;
        const endCpu = process.cpuUsage ? process.cpuUsage(mark.startCpu) : undefined;

        const performanceEntry: PerformanceLogEntry = {
            timestamp: new Date().toISOString(),
            level: 'debug',
            service: 'qloo-performance',
            operation: operation as any,
            message: `Operation ${operation} completed in ${duration}ms`,
            context,
            performance: {
                duration,
                startTime: new Date(mark.startTime).toISOString(),
                endTime: new Date(endTime).toISOString(),
                memoryUsage: process.memoryUsage ? process.memoryUsage() : undefined,
                cpuUsage: endCpu
            },
            duration,
            tags: ['performance', operation]
        };

        this.writeLogEntry(performanceEntry);
        this.performanceMarks.delete(operationId);

        return duration;
    }

    /**
     * Log retry attempts
     */
    logRetryAttempt(
        context: ErrorContext,
        retryDelay: number,
        reason?: string
    ): void {
        const logEntry: LogEntry = {
            timestamp: new Date().toISOString(),
            level: 'info',
            service: 'qloo-retry',
            operation: 'retry_attempt',
            message: `Retry attempt ${context.attempt}/${context.maxAttempts} for ${context.endpoint} in ${retryDelay}ms`,
            context: {
                endpoint: context.endpoint,
                attempt: context.attempt,
                maxAttempts: context.maxAttempts,
                retryDelay,
                reason: reason || 'Unknown reason'
            },
            requestId: this.generateRequestId(),
            userId: context.userId,
            sessionId: context.sessionId,
            tags: ['retry', 'qloo', `attempt-${context.attempt}`]
        };

        this.writeLogEntry(logEntry);

        // Also call parent method for backward compatibility
        super.logRetryAttempt(context, retryDelay);
    }

    /**
     * Get logs for a specific time period
     */
    getLogsForPeriod(startTime: Date, endTime: Date): LogEntry[] {
        return this.logBuffer.filter(entry => {
            const entryTime = new Date(entry.timestamp);
            return entryTime >= startTime && entryTime <= endTime;
        });
    }

    /**
     * Get logs by level
     */
    getLogsByLevel(level: LogLevel): LogEntry[] {
        return this.logBuffer.filter(entry => entry.level === level);
    }

    /**
     * Get logs by service
     */
    getLogsByService(service: string): LogEntry[] {
        return this.logBuffer.filter(entry => entry.service === service);
    }

    /**
     * Get logs by tags
     */
    getLogsByTags(tags: string[]): LogEntry[] {
        return this.logBuffer.filter(entry =>
            entry.tags && tags.some(tag => entry.tags!.includes(tag))
        );
    }

    /**
     * Clear log buffer
     */
    clearLogs(): void {
        this.logBuffer = [];
    }

    /**
     * Get current log buffer size
     */
    getLogBufferSize(): number {
        return this.logBuffer.length;
    }

    /**
     * Write log entry to appropriate destinations
     */
    private writeLogEntry(entry: LogEntry): void {
        // Add to buffer
        this.logBuffer.push(entry);

        // Maintain buffer size
        if (this.logBuffer.length > this.config.bufferSize) {
            this.logBuffer = this.logBuffer.slice(-this.config.bufferSize);
        }

        // Console output
        if (this.config.enableConsoleOutput && this.shouldLogLevel(entry.level)) {
            this.writeToConsole(entry);
        }

        // File output (if enabled)
        if (this.config.enableFileOutput && this.config.logFilePath) {
            this.writeToFile(entry);
        }
    }

    /**
     * Write to console with appropriate formatting
     */
    private writeToConsole(entry: LogEntry): void {
        const message = this.config.enableStructuredLogging
            ? JSON.stringify(entry, null, 2)
            : this.formatSimpleMessage(entry);

        switch (entry.level) {
            case 'critical':
            case 'error':
                console.error(message);
                break;
            case 'warn':
                console.warn(message);
                break;
            case 'info':
                console.info(message);
                break;
            case 'debug':
                console.debug(message);
                break;
            default:
                console.log(message);
        }
    }

    /**
     * Write to file (placeholder for file logging implementation)
     */
    private writeToFile(entry: LogEntry): void {
        // In a real implementation, this would write to a file
        // For now, we'll just store in memory buffer
        // You could implement file rotation, compression, etc.
    }

    /**
     * Format simple log message
     */
    private formatSimpleMessage(entry: LogEntry): string {
        const timestamp = entry.timestamp;
        const level = entry.level.toUpperCase().padEnd(8);
        const service = entry.service.padEnd(15);
        const message = entry.message;
        const duration = entry.duration ? ` (${entry.duration}ms)` : '';

        return `[${timestamp}] ${level} ${service} ${message}${duration}`;
    }

    /**
     * Start buffer flush timer
     */
    private startBufferFlush(): void {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }

        this.flushTimer = setInterval(() => {
            this.flushBuffer();
        }, this.config.flushInterval);
    }

    /**
     * Flush log buffer
     */
    private flushBuffer(): void {
        // In a real implementation, this would flush buffered logs to persistent storage
        // For now, we'll just maintain the buffer size
        if (this.logBuffer.length > this.config.bufferSize * 2) {
            this.logBuffer = this.logBuffer.slice(-this.config.bufferSize);
        }
    }

    /**
     * Check if we should log at this level
     */
    private shouldLogLevel(level: LogLevel): boolean {
        const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'critical'];
        const currentLevelIndex = levels.indexOf(this.config.logLevel);
        const requestedLevelIndex = levels.indexOf(level);

        return requestedLevelIndex >= currentLevelIndex;
    }

    /**
     * Get appropriate log level for error type
     */
    private getErrorLogLevel(errorType: QlooErrorType): LogLevel {
        switch (errorType) {
            case 'authentication_error':
            case 'authorization_error':
                return 'error';
            case 'server_error':
                return 'critical';
            case 'network_error':
            case 'rate_limit_error':
                return 'warn';
            case 'validation_error':
            case 'invalid_params_error':
                return 'warn';
            default:
                return 'error';
        }
    }

    /**
     * Calculate response size
     */
    private calculateResponseSize(response: any): number {
        try {
            return JSON.stringify(response).length;
        } catch {
            return 0;
        }
    }

    /**
     * Sanitize parameters by removing sensitive fields (enhanced version)
     */
    private sanitizeParamsEnhanced(params?: Record<string, any>): Record<string, any> {
        if (!params) return {};

        const sanitized = { ...params };

        this.config.sensitiveFields.forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = '***masked***';
            }
        });

        return sanitized;
    }

    /**
     * Sanitize response data
     */
    private sanitizeResponse(response: any): any {
        if (!response) return response;

        // Remove or truncate large response bodies
        const sanitized = { ...response };

        if (sanitized.entities && Array.isArray(sanitized.entities) && sanitized.entities.length > 10) {
            sanitized.entities = sanitized.entities.slice(0, 10);
            sanitized._truncated = true;
        }

        return sanitized;
    }

    /**
     * Sanitize error details
     */
    private sanitizeErrorDetails(details: any): any {
        if (!details) return details;

        const sanitized = { ...details };

        // Remove sensitive information from error details
        this.config.sensitiveFields.forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = '***masked***';
            }
        });

        return sanitized;
    }

    /**
     * Sanitize error object
     */
    private sanitizeError(error: QlooCompliantError): any {
        return {
            type: error.type,
            code: error.code,
            message: error.message,
            retryable: error.retryable,
            request_id: error.request_id
            // Exclude potentially sensitive details
        };
    }

    /**
     * Truncate cache key for logging
     */
    private truncateKey(key: string): string {
        return key.length > 50 ? `${key.substring(0, 47)}...` : key;
    }

    /**
     * Generate request ID
     */
    private generateRequestId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }

    /**
     * Stop the logger and clean up resources
     */
    stop(): void {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }

        this.flushBuffer();
    }
}

/**
 * Default monitoring logger instance
 */
export const defaultMonitoringLogger = new QlooMonitoringLogger();

/**
 * Create monitoring logger with custom configuration
 */
export function createMonitoringLogger(config?: Partial<MonitoringLoggerConfig>): QlooMonitoringLogger {
    return new QlooMonitoringLogger(config);
}