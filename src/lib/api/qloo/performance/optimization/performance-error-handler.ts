import { AdvancedPerformanceOptimizer } from './advanced-performance-optimizer';
import { RetryManager } from '@/lib/validation/retry-manager';
import { ValidationSeverity, PersonaType } from '@/types/validation';

export enum PerformanceErrorType {
    TIMEOUT = 'TIMEOUT',
    RESOURCE_EXHAUSTION = 'RESOURCE_EXHAUSTION',
    CIRCUIT_BREAKER_OPEN = 'CIRCUIT_BREAKER_OPEN',
    UNKNOWN = 'UNKNOWN'
}

export interface PerformanceError {
    type: PerformanceErrorType;
    message: string;
    details?: any;
}

export class PerformanceErrorHandler {
    private optimizer: AdvancedPerformanceOptimizer;
    private retryManager: RetryManager;

    constructor(optimizer: AdvancedPerformanceOptimizer, retryManager: RetryManager) {
        this.optimizer = optimizer;
        this.retryManager = retryManager;
    }

    handleError(error: any, entityType: string, currentAttempt: number): {
        shouldRetry: boolean;
        delay?: number;
        fallback?: boolean;
        message: string;
    } {
        let performanceError: PerformanceError;

        if (error.message.includes('Request timeout')) {
            performanceError = { type: PerformanceErrorType.TIMEOUT, message: error.message };
        } else if (error.message.includes('Circuit breaker OPEN')) {
            performanceError = { type: PerformanceErrorType.CIRCUIT_BREAKER_OPEN, message: error.message };
        } else if (error.message.includes('resource exhaustion')) { // Placeholder for actual resource exhaustion detection
            performanceError = { type: PerformanceErrorType.RESOURCE_EXHAUSTION, message: error.message };
        } else {
            performanceError = { type: PerformanceErrorType.UNKNOWN, message: error.message, details: error };
        }

        console.error(`Performance Error [${performanceError.type}]: ${performanceError.message}`);

        // Use RetryManager for progressive retries
        const retryResult = this.retryManager.shouldRetry(
            [{
                id: `perf-error-${Date.now()}`,
                type: performanceError.type as any,
                message: performanceError.message,
                field: 'performance',
                severity: ValidationSeverity.ERROR
            }], // Complete ValidationError for retryManager
            {
                originalRequest: { personaType: PersonaType.STANDARD },
                templateVariables: {},
                culturalConstraints: {
                    music: [],
                    brand: [],
                    restaurant: [],
                    movie: [],
                    tv: [],
                    book: [],
                    travel: [],
                    fashion: [],
                    beauty: [],
                    food: [],
                    socialMedia: []
                },
                userSignals: {
                    demographics: {
                        ageRange: { min: 18, max: 65 },
                        location: 'unknown'
                    },
                    interests: [],
                    values: [],
                    culturalContext: {
                        language: 'en' as const,
                        personaCount: 1
                    }
                },
                generationAttempt: currentAttempt,
                previousErrors: []
            }, // Complete ValidationContext
            {
                maxRetries: 3,
                backoffMultiplier: 2,
                retryableErrors: [PerformanceErrorType.TIMEOUT as any, PerformanceErrorType.RESOURCE_EXHAUSTION as any],
                enhancePromptOnRetry: false,
                fallbackAfterMaxRetries: true,
                retryDelay: 1000
            },
            currentAttempt
        );

        if (retryResult.shouldRetry) {
            return {
                shouldRetry: true,
                delay: retryResult.retryDelay,
                message: `Retrying due to ${performanceError.type}. Attempt ${currentAttempt + 1}.`
            };
        } else {
            return {
                shouldRetry: false,
                fallback: true, // Suggest fallback if retries exhausted
                message: `Max retries for ${performanceError.type} exceeded. Suggesting fallback.`
            };
        }
    }
}


