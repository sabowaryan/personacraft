/**
 * QlooFirstErrorHandler Service
 * 
 * Comprehensive error handling for the Qloo-first persona generation flow.
 * Provides specific error types, retry logic, and graceful degradation strategies.
 * 
 * Requirements: 1.5, 4.6
 */

import { 
    QlooFirstError, 
    QlooFirstErrorDetails, 
    ErrorHandlingStrategy, 
    RetryConfig,
    ErrorSeverity 
} from '@/types/qloo-first';

/**
 * Configuration for the error handler
 */
interface ErrorHandlerConfig {
    retryConfig: RetryConfig;
    strategies: ErrorHandlingStrategy[];
    enableLogging: boolean;
    enableMetrics: boolean;
}

/**
 * Default retry configuration for transient failures
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
    retryableErrors: [
        QlooFirstError.QLOO_API_TIMEOUT,
        QlooFirstError.QLOO_API_RATE_LIMITED,
        QlooFirstError.GEMINI_API_TIMEOUT,
        QlooFirstError.CACHE_ERROR
    ]
};

/**
 * Default error handling strategies
 */
const DEFAULT_STRATEGIES: ErrorHandlingStrategy[] = [
    {
        error: QlooFirstError.QLOO_API_UNAVAILABLE,
        fallbackAction: 'legacy-flow',
        maxRetries: 2,
        retryDelayMs: 2000,
        backoffMultiplier: 2
    },
    {
        error: QlooFirstError.QLOO_API_TIMEOUT,
        fallbackAction: 'retry',
        maxRetries: 3,
        retryDelayMs: 1000,
        backoffMultiplier: 2
    },
    {
        error: QlooFirstError.QLOO_API_RATE_LIMITED,
        fallbackAction: 'retry',
        maxRetries: 5,
        retryDelayMs: 5000,
        backoffMultiplier: 1.5
    },
    {
        error: QlooFirstError.QLOO_API_INVALID_RESPONSE,
        fallbackAction: 'legacy-flow',
        maxRetries: 1,
        retryDelayMs: 1000,
        backoffMultiplier: 1
    },
    {
        error: QlooFirstError.SIGNAL_EXTRACTION_FAILED,
        fallbackAction: 'legacy-flow',
        maxRetries: 0,
        retryDelayMs: 0,
        backoffMultiplier: 1
    },
    {
        error: QlooFirstError.SIGNAL_VALIDATION_FAILED,
        fallbackAction: 'legacy-flow',
        maxRetries: 1,
        retryDelayMs: 500,
        backoffMultiplier: 1
    },
    {
        error: QlooFirstError.CULTURAL_DATA_INSUFFICIENT,
        fallbackAction: 'legacy-flow',
        maxRetries: 1,
        retryDelayMs: 1000,
        backoffMultiplier: 1
    },
    {
        error: QlooFirstError.CULTURAL_DATA_INVALID,
        fallbackAction: 'legacy-flow',
        maxRetries: 0,
        retryDelayMs: 0,
        backoffMultiplier: 1
    },
    {
        error: QlooFirstError.PROMPT_BUILDING_FAILED,
        fallbackAction: 'legacy-flow',
        maxRetries: 1,
        retryDelayMs: 500,
        backoffMultiplier: 1
    },
    {
        error: QlooFirstError.PROMPT_VALIDATION_FAILED,
        fallbackAction: 'legacy-flow',
        maxRetries: 0,
        retryDelayMs: 0,
        backoffMultiplier: 1
    },
    {
        error: QlooFirstError.GEMINI_GENERATION_FAILED,
        fallbackAction: 'legacy-flow',
        maxRetries: 2,
        retryDelayMs: 2000,
        backoffMultiplier: 2
    },
    {
        error: QlooFirstError.GEMINI_API_TIMEOUT,
        fallbackAction: 'retry',
        maxRetries: 3,
        retryDelayMs: 3000,
        backoffMultiplier: 2
    },
    {
        error: QlooFirstError.CACHE_ERROR,
        fallbackAction: 'retry',
        maxRetries: 2,
        retryDelayMs: 500,
        backoffMultiplier: 1.5
    },
    {
        error: QlooFirstError.CONFIGURATION_ERROR,
        fallbackAction: 'fail',
        maxRetries: 0,
        retryDelayMs: 0,
        backoffMultiplier: 1
    }
];

/**
 * Error severity mapping for monitoring and alerting
 */
const ERROR_SEVERITY_MAP: Record<QlooFirstError, ErrorSeverity> = {
    [QlooFirstError.QLOO_API_UNAVAILABLE]: ErrorSeverity.HIGH,
    [QlooFirstError.QLOO_API_TIMEOUT]: ErrorSeverity.MEDIUM,
    [QlooFirstError.QLOO_API_RATE_LIMITED]: ErrorSeverity.MEDIUM,
    [QlooFirstError.QLOO_API_INVALID_RESPONSE]: ErrorSeverity.MEDIUM,
    [QlooFirstError.SIGNAL_EXTRACTION_FAILED]: ErrorSeverity.HIGH,
    [QlooFirstError.SIGNAL_VALIDATION_FAILED]: ErrorSeverity.MEDIUM,
    [QlooFirstError.CULTURAL_DATA_INSUFFICIENT]: ErrorSeverity.MEDIUM,
    [QlooFirstError.CULTURAL_DATA_INVALID]: ErrorSeverity.MEDIUM,
    [QlooFirstError.PROMPT_BUILDING_FAILED]: ErrorSeverity.HIGH,
    [QlooFirstError.PROMPT_VALIDATION_FAILED]: ErrorSeverity.MEDIUM,
    [QlooFirstError.GEMINI_GENERATION_FAILED]: ErrorSeverity.HIGH,
    [QlooFirstError.GEMINI_API_TIMEOUT]: ErrorSeverity.MEDIUM,
    [QlooFirstError.CACHE_ERROR]: ErrorSeverity.LOW,
    [QlooFirstError.CONFIGURATION_ERROR]: ErrorSeverity.CRITICAL
};

/**
 * Comprehensive error handler for the Qloo-first persona generation flow
 */
export class QlooFirstErrorHandler {
    private config: ErrorHandlerConfig;
    private errorMetrics: Map<QlooFirstError, number> = new Map();
    private retryAttempts: Map<string, number> = new Map();

    constructor(config?: Partial<ErrorHandlerConfig>) {
        this.config = {
            retryConfig: DEFAULT_RETRY_CONFIG,
            strategies: DEFAULT_STRATEGIES,
            enableLogging: true,
            enableMetrics: true,
            ...config
        };
    }

    /**
     * Handle an error with appropriate strategy (retry, fallback, or fail)
     */
    async handleError<T>(
        error: Error,
        context: Record<string, any>,
        operation: () => Promise<T>,
        operationId?: string
    ): Promise<{ result?: T; shouldFallback: boolean; errorDetails?: QlooFirstErrorDetails }> {
        const errorDetails = this.categorizeError(error, context);
        const strategy = this.getStrategy(errorDetails.type);

        // Track error metrics
        if (this.config.enableMetrics) {
            this.trackError(errorDetails.type);
        }

        // Log error if enabled
        if (this.config.enableLogging) {
            this.logError(errorDetails, context);
        }

        // Handle non-retryable errors immediately
        if (!errorDetails.retryable || strategy.fallbackAction === 'fail') {
            return {
                shouldFallback: strategy.fallbackAction === 'legacy-flow',
                errorDetails
            };
        }

        // Handle retryable errors
        if (strategy.fallbackAction === 'retry' && strategy.maxRetries > 0) {
            const retryResult = await this.executeWithRetry(
                operation,
                strategy,
                operationId || 'unknown',
                errorDetails
            );

            if (retryResult.success) {
                return { result: retryResult.result, shouldFallback: false };
            }

            // If retries exhausted, check if we should fallback
            return {
                shouldFallback: true,
                errorDetails: retryResult.lastError || errorDetails
            };
        }

        // Default to fallback for legacy flow
        return {
            shouldFallback: strategy.fallbackAction === 'legacy-flow',
            errorDetails
        };
    }

    /**
     * Execute operation with retry logic
     */
    private async executeWithRetry<T>(
        operation: () => Promise<T>,
        strategy: ErrorHandlingStrategy,
        operationId: string,
        initialError: QlooFirstErrorDetails
    ): Promise<{ success: boolean; result?: T; lastError?: QlooFirstErrorDetails }> {
        let lastError = initialError;
        let delay = strategy.retryDelayMs;

        for (let attempt = 1; attempt <= strategy.maxRetries; attempt++) {
            try {
                // Wait before retry (except for first attempt)
                if (attempt > 1) {
                    await this.sleep(delay);
                    delay = Math.min(delay * strategy.backoffMultiplier, this.config.retryConfig.maxDelayMs);
                }

                if (this.config.enableLogging) {
                    console.log(`🔄 Retry attempt ${attempt}/${strategy.maxRetries} for ${operationId}`);
                }

                const result = await operation();
                
                if (this.config.enableLogging) {
                    console.log(`✅ Retry successful for ${operationId} after ${attempt} attempts`);
                }

                return { success: true, result };
            } catch (error) {
                lastError = this.categorizeError(error as Error, { attempt, operationId });
                
                if (this.config.enableLogging) {
                    console.warn(`❌ Retry ${attempt}/${strategy.maxRetries} failed for ${operationId}:`, lastError.message);
                }

                // If this error type is not retryable, stop retrying
                if (!this.isRetryableError(lastError.type)) {
                    break;
                }
            }
        }

        return { success: false, lastError };
    }

    /**
     * Categorize and enrich error information
     */
    private categorizeError(error: Error, context: Record<string, any>): QlooFirstErrorDetails {
        const errorType = this.extractErrorType(error);
        const severity = ERROR_SEVERITY_MAP[errorType] || ErrorSeverity.MEDIUM;

        return {
            type: errorType,
            severity,
            message: error.message,
            originalError: error,
            context,
            timestamp: Date.now(),
            retryable: this.isRetryableError(errorType),
            fallbackRecommended: this.shouldRecommendFallback(errorType)
        };
    }

    /**
     * Extract error type from error message or error properties
     */
    private extractErrorType(error: Error): QlooFirstError {
        const message = error.message.toLowerCase();

        // Check for specific error patterns in message
        if (message.includes('qloo_api_unavailable') || message.includes('api unavailable')) {
            return QlooFirstError.QLOO_API_UNAVAILABLE;
        }
        if (message.includes('qloo_api_timeout') || message.includes('api timeout')) {
            return QlooFirstError.QLOO_API_TIMEOUT;
        }
        if (message.includes('qloo_api_rate_limited') || message.includes('rate limited')) {
            return QlooFirstError.QLOO_API_RATE_LIMITED;
        }
        if (message.includes('qloo_api_invalid_response') || message.includes('invalid response')) {
            return QlooFirstError.QLOO_API_INVALID_RESPONSE;
        }
        if (message.includes('signal_extraction_failed') || message.includes('signal extraction')) {
            return QlooFirstError.SIGNAL_EXTRACTION_FAILED;
        }
        if (message.includes('signal_validation_failed') || message.includes('signal validation')) {
            return QlooFirstError.SIGNAL_VALIDATION_FAILED;
        }
        if (message.includes('cultural_data_insufficient') || message.includes('insufficient data')) {
            return QlooFirstError.CULTURAL_DATA_INSUFFICIENT;
        }
        if (message.includes('cultural_data_invalid') || message.includes('invalid cultural data')) {
            return QlooFirstError.CULTURAL_DATA_INVALID;
        }
        if (message.includes('prompt_building_failed') || message.includes('prompt building')) {
            return QlooFirstError.PROMPT_BUILDING_FAILED;
        }
        if (message.includes('prompt_validation_failed') || message.includes('prompt validation')) {
            return QlooFirstError.PROMPT_VALIDATION_FAILED;
        }
        if (message.includes('gemini_generation_failed') || message.includes('generation failed')) {
            return QlooFirstError.GEMINI_GENERATION_FAILED;
        }
        if (message.includes('gemini_api_timeout') || message.includes('gemini timeout')) {
            return QlooFirstError.GEMINI_API_TIMEOUT;
        }
        if (message.includes('cache_error') || message.includes('cache')) {
            return QlooFirstError.CACHE_ERROR;
        }
        if (message.includes('configuration_error') || message.includes('configuration')) {
            return QlooFirstError.CONFIGURATION_ERROR;
        }

        // Check for HTTP status codes and network errors
        if (message.includes('timeout') || message.includes('etimedout')) {
            return QlooFirstError.QLOO_API_TIMEOUT;
        }
        if (message.includes('429') || message.includes('too many requests')) {
            return QlooFirstError.QLOO_API_RATE_LIMITED;
        }
        if (message.includes('500') || message.includes('502') || message.includes('503') || message.includes('504')) {
            return QlooFirstError.QLOO_API_UNAVAILABLE;
        }

        // Default to API unavailable for unknown errors
        return QlooFirstError.QLOO_API_UNAVAILABLE;
    }

    /**
     * Get error handling strategy for a specific error type
     */
    private getStrategy(errorType: QlooFirstError): ErrorHandlingStrategy {
        return this.config.strategies.find(s => s.error === errorType) || {
            error: errorType,
            fallbackAction: 'legacy-flow',
            maxRetries: 1,
            retryDelayMs: 1000,
            backoffMultiplier: 2
        };
    }

    /**
     * Check if an error type is retryable
     */
    private isRetryableError(errorType: QlooFirstError): boolean {
        return this.config.retryConfig.retryableErrors.includes(errorType);
    }

    /**
     * Check if fallback is recommended for an error type
     */
    private shouldRecommendFallback(errorType: QlooFirstError): boolean {
        const strategy = this.getStrategy(errorType);
        return strategy.fallbackAction === 'legacy-flow';
    }

    /**
     * Log error with appropriate level based on severity
     */
    private logError(errorDetails: QlooFirstErrorDetails, context: Record<string, any>): void {
        const logMessage = `🚨 QlooFirst Error [${errorDetails.type}]: ${errorDetails.message}`;
        const logContext = { ...context, severity: errorDetails.severity, timestamp: errorDetails.timestamp };

        switch (errorDetails.severity) {
            case ErrorSeverity.CRITICAL:
                console.error(logMessage, logContext);
                break;
            case ErrorSeverity.HIGH:
                console.error(logMessage, logContext);
                break;
            case ErrorSeverity.MEDIUM:
                console.warn(logMessage, logContext);
                break;
            case ErrorSeverity.LOW:
                console.log(logMessage, logContext);
                break;
        }
    }

    /**
     * Track error metrics for monitoring
     */
    private trackError(errorType: QlooFirstError): void {
        const currentCount = this.errorMetrics.get(errorType) || 0;
        this.errorMetrics.set(errorType, currentCount + 1);
    }

    /**
     * Get error metrics for monitoring and debugging
     */
    getErrorMetrics(): Record<string, number> {
        const metrics: Record<string, number> = {};
        this.errorMetrics.forEach((count, errorType) => {
            metrics[errorType] = count;
        });
        return metrics;
    }

    /**
     * Reset error metrics
     */
    resetMetrics(): void {
        this.errorMetrics.clear();
        this.retryAttempts.clear();
    }

    /**
     * Update error handling configuration
     */
    updateConfig(config: Partial<ErrorHandlerConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Get current configuration
     */
    getConfig(): ErrorHandlerConfig {
        return { ...this.config };
    }

    /**
     * Create a graceful degradation strategy for insufficient cultural data
     */
    createGracefulDegradation(
        originalConstraints: any,
        availableData: Partial<any>
    ): { degradedConstraints: any; degradationApplied: string[] } {
        const degradationApplied: string[] = [];
        const degradedConstraints = { ...originalConstraints };

        // Apply graceful degradation strategies
        Object.keys(degradedConstraints).forEach(key => {
            if (!availableData[key] || (Array.isArray(availableData[key]) && availableData[key].length === 0)) {
                // Use fallback data or remove constraint
                if (this.hasFallbackData(key)) {
                    degradedConstraints[key] = this.getFallbackData(key);
                    degradationApplied.push(`${key}: used fallback data`);
                } else {
                    delete degradedConstraints[key];
                    degradationApplied.push(`${key}: removed due to insufficient data`);
                }
            }
        });

        return { degradedConstraints, degradationApplied };
    }

    /**
     * Check if fallback data is available for a constraint type
     */
    private hasFallbackData(constraintType: string): boolean {
        const fallbackData = {
            music: ['Popular Music', 'Local Artists'],
            brands: ['Popular Brands', 'Local Brands'],
            restaurants: ['Popular Restaurants', 'Local Cuisine'],
            movies: ['Popular Movies', 'Local Cinema'],
            tv: ['Popular Shows', 'Local TV'],
            books: ['Bestsellers', 'Local Authors'],
            travel: ['Popular Destinations'],
            fashion: ['Popular Fashion', 'Local Style'],
            beauty: ['Popular Beauty', 'Local Brands'],
            food: ['Popular Food', 'Local Cuisine'],
            socialMedia: ['Instagram', 'Facebook', 'TikTok']
        };

        return constraintType in fallbackData;
    }

    /**
     * Get fallback data for a constraint type
     */
    private getFallbackData(constraintType: string): string[] {
        const fallbackData: Record<string, string[]> = {
            music: ['Popular Music', 'Local Artists'],
            brands: ['Popular Brands', 'Local Brands'],
            restaurants: ['Popular Restaurants', 'Local Cuisine'],
            movies: ['Popular Movies', 'Local Cinema'],
            tv: ['Popular Shows', 'Local TV'],
            books: ['Bestsellers', 'Local Authors'],
            travel: ['Popular Destinations'],
            fashion: ['Popular Fashion', 'Local Style'],
            beauty: ['Popular Beauty', 'Local Brands'],
            food: ['Popular Food', 'Local Cuisine'],
            socialMedia: ['Instagram', 'Facebook', 'TikTok']
        };

        return fallbackData[constraintType] || [];
    }

    /**
     * Sleep utility for retry delays
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Create error details for manual error creation
     */
    static createErrorDetails(
        type: QlooFirstError,
        message: string,
        context?: Record<string, any>
    ): QlooFirstErrorDetails {
        return {
            type,
            severity: ERROR_SEVERITY_MAP[type] || ErrorSeverity.MEDIUM,
            message,
            context: context || {},
            timestamp: Date.now(),
            retryable: DEFAULT_RETRY_CONFIG.retryableErrors.includes(type),
            fallbackRecommended: DEFAULT_STRATEGIES.find(s => s.error === type)?.fallbackAction === 'legacy-flow' || false
        };
    }

    /**
     * Validate error handling configuration
     */
    static validateConfig(config: Partial<ErrorHandlerConfig>): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (config.retryConfig) {
            if (config.retryConfig.maxRetries < 0) {
                errors.push('maxRetries must be non-negative');
            }
            if (config.retryConfig.initialDelayMs < 0) {
                errors.push('initialDelayMs must be non-negative');
            }
            if (config.retryConfig.maxDelayMs < config.retryConfig.initialDelayMs) {
                errors.push('maxDelayMs must be greater than or equal to initialDelayMs');
            }
            if (config.retryConfig.backoffMultiplier <= 0) {
                errors.push('backoffMultiplier must be positive');
            }
        }

        if (config.strategies) {
            config.strategies.forEach((strategy, index) => {
                if (strategy.maxRetries < 0) {
                    errors.push(`Strategy ${index}: maxRetries must be non-negative`);
                }
                if (strategy.retryDelayMs < 0) {
                    errors.push(`Strategy ${index}: retryDelayMs must be non-negative`);
                }
                if (strategy.backoffMultiplier <= 0) {
                    errors.push(`Strategy ${index}: backoffMultiplier must be positive`);
                }
            });
        }

        return { valid: errors.length === 0, errors };
    }
}