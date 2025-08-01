// Types for the Qloo-first persona generation flow

import { Persona } from '@/types';

/**
 * Signals extracted from BriefFormData for Qloo API consumption
 */
export interface QlooSignals {
    demographics: {
        ageRange: { min: number; max: number };
        location: string;
        occupation?: string; // extracted from brief if possible
    };
    interests: string[]; // PREDEFINED_INTERESTS + custom
    values: string[]; // PREDEFINED_VALUES + custom
    culturalContext: {
        language: 'fr' | 'en';
        personaCount: number;
    };
}

/**
 * Cultural constraints retrieved from Qloo API to guide Gemini generation
 */
export interface CulturalConstraints {
    music: string[];
    brand: string[];
    restaurant: string[];
    movie: string[];
    tv: string[];
    book: string[];
    travel: string[];
    fashion: string[];
    beauty: string[];
    food: string[];
    socialMedia: string[];
}

/**
 * Context for building enriched prompts with cultural constraints
 */
export interface EnrichedPromptContext {
    originalBrief: string;
    culturalConstraints: CulturalConstraints;
    userSignals: QlooSignals;
    templateVariables: Record<string, any>;
}

/**
 * Error types specific to the Qloo-first generation flow
 */
export enum QlooFirstError {
    QLOO_API_UNAVAILABLE = 'QLOO_API_UNAVAILABLE',
    QLOO_API_TIMEOUT = 'QLOO_API_TIMEOUT',
    QLOO_API_RATE_LIMITED = 'QLOO_API_RATE_LIMITED',
    QLOO_API_INVALID_RESPONSE = 'QLOO_API_INVALID_RESPONSE',
    SIGNAL_EXTRACTION_FAILED = 'SIGNAL_EXTRACTION_FAILED',
    SIGNAL_VALIDATION_FAILED = 'SIGNAL_VALIDATION_FAILED',
    CULTURAL_DATA_INSUFFICIENT = 'CULTURAL_DATA_INSUFFICIENT',
    CULTURAL_DATA_INVALID = 'CULTURAL_DATA_INVALID',
    PROMPT_BUILDING_FAILED = 'PROMPT_BUILDING_FAILED',
    PROMPT_VALIDATION_FAILED = 'PROMPT_VALIDATION_FAILED',
    GEMINI_GENERATION_FAILED = 'GEMINI_GENERATION_FAILED',
    GEMINI_API_TIMEOUT = 'GEMINI_API_TIMEOUT',
    CACHE_ERROR = 'CACHE_ERROR',
    CONFIGURATION_ERROR = 'CONFIGURATION_ERROR'
}

/**
 * Error severity levels for monitoring and alerting
 */
export enum ErrorSeverity {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
}

/**
 * Detailed error information for comprehensive error handling
 */
export interface QlooFirstErrorDetails {
    type: QlooFirstError;
    severity: ErrorSeverity;
    message: string;
    originalError?: Error;
    context?: Record<string, any>;
    timestamp: number;
    retryable: boolean;
    fallbackRecommended: boolean;
}

/**
 * Error handling strategy configuration
 */
export interface ErrorHandlingStrategy {
    error: QlooFirstError;
    fallbackAction: 'retry' | 'legacy-flow' | 'fail';
    maxRetries: number;
    retryDelayMs: number;
    backoffMultiplier: number;
}

/**
 * Retry configuration for transient failures
 */
export interface RetryConfig {
    maxRetries: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
    retryableErrors: QlooFirstError[];
}

/**
 * Result of the Qloo-first persona generation with metadata tracking
 */
export interface GenerationResult {
    personas: Partial<Persona>[];
    metadata: {
        source: 'qloo-first' | 'fallback-legacy' | 'legacy';
        qlooDataUsed: boolean;
        culturalConstraintsApplied: string[];
        processingTime: number;
        qlooApiCallsCount?: number;
        cacheHitRate?: number;
        errorEncountered?: QlooFirstError | string;
        retryCount?: number;
        validationResult?: import('./validation').ValidationResult;
        fallbackUsed?: boolean;
    };
}

/**
 * Performance metrics for monitoring the new flow
 */
export interface PerformanceMetrics {
    qlooExtractionTime: number;
    qlooApiCallsCount: number;
    promptBuildingTime: number;
    geminiGenerationTime: number;
    totalProcessingTime: number;
    cacheHitRate: number;
}

/**
 * Feature flag configuration for the Qloo-first flow
 */
export interface FeatureFlags {
    qlooFirstGeneration: boolean;
    qlooFirstFallbackEnabled: boolean;
    qlooFirstDebugMode: boolean;
}

/**
 * Runtime configuration for the Qloo-first flow
 */
export interface QlooFirstConfig {
    enabled: boolean;
    fallbackEnabled: boolean;
    debugMode: boolean;
    batchSize: number;
    maxParallelRequests: number;
    cacheTTL: number;
    supportedLanguages: ('fr' | 'en')[];
}

/**
 * Enhanced Qloo API request structure for the new flow
 */
export interface QlooApiRequest {
    entityType: string;
    signals: {
        'signal.demographics.audiences': string;
        'signal.demographics.location': string;
        [key: string]: string; // Additional signals from interests/values
    };
    take: number;
    cacheKey: string;
}

/**
 * Enhanced persona output with cultural data directly integrated
 */
export interface EnrichedPersona extends Partial<Persona> {
    culturalData: {
        music: string[];
        brand: string[];
        restaurant: string[];
        movie: string[];
        tv: string[];
        book: string[];
        travel: string[];
        fashion: string[];
        beauty: string[];
        food: string[];
        socialMedia: string[];
    };
    metadata: {
        qlooConstraintsUsed: string[];
        generationMethod: 'qloo-first' | 'legacy-fallback';
        culturalDataSource: 'qloo' | 'fallback';
    };
}