/**
 * Base interfaces and types for the LLM response validation system
 */

import { QlooSignals, CulturalConstraints } from './qloo-first';

// Enums
export enum ValidationErrorType {
    STRUCTURE_INVALID = 'STRUCTURE_INVALID',
    REQUIRED_FIELD_MISSING = 'REQUIRED_FIELD_MISSING',
    TYPE_MISMATCH = 'TYPE_MISMATCH',
    VALUE_OUT_OF_RANGE = 'VALUE_OUT_OF_RANGE',
    FORMAT_INVALID = 'FORMAT_INVALID',
    CULTURAL_DATA_INCONSISTENT = 'CULTURAL_DATA_INCONSISTENT',
    BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
    TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
    VALIDATION_TIMEOUT = 'VALIDATION_TIMEOUT'
}

export enum FallbackStrategyType {
    REGENERATE = 'regenerate',
    SIMPLE_TEMPLATE = 'simple_template',
    DEFAULT_RESPONSE = 'default_response',
    NONE = 'none'
}

export enum ValidationSeverity {
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info'
}

export enum ValidationRuleType {
    STRUCTURE = 'structure',
    CONTENT = 'content',
    FORMAT = 'format',
    BUSINESS = 'business'
}

export enum PersonaType {
    SIMPLE = 'simple',
    B2B = 'b2b',
    STANDARD = 'standard'
}

export type PersonaTypeString = 'simple' | 'b2b' | 'standard';

// Core Interfaces
export interface ValidationError {
    id: string;
    type: ValidationErrorType;
    field: string;
    message: string;
    severity: ValidationSeverity;
    value?: any;
    expectedValue?: any;
    context?: Record<string, any>;
}

export interface ValidationWarning {
    id?: string;
    type?: string;
    field: string;
    message: string;
    severity: ValidationSeverity;
    value?: any;
    suggestion?: string;
}

export interface ValidationMetadata {
    templateId: string;
    templateVersion?: string;
    validationTime: number;
    rulesExecuted: number;
    rulesSkipped: number;
    timestamp: number;
    featureFlagsUsed?: Record<string, any>;
    fallbackUsed?: boolean;
    fallbackStrategy?: string;
    validationDisabled?: boolean;
    personaCount?: number;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    score: number;
    metadata: ValidationMetadata;
}

// Validation Context Types
export interface ValidationContext {
    originalRequest: PersonaGenerationRequest;
    templateVariables: Record<string, any>;
    culturalConstraints: CulturalConstraints;
    userSignals: QlooSignals;
    generationAttempt: number;
    previousErrors: ValidationError[];
}

export interface PersonaGenerationRequest {
    personaType: PersonaType;
    culturalData?: any;
    demographics?: any;
    psychographics?: any;
    businessContext?: any;
    customFields?: Record<string, any>;
}

// Note: CulturalConstraints and QlooSignals are imported from qloo-first.ts

// Validation Metrics Types
export interface ValidationMetrics {
    templateId: string;
    timestamp: number;
    validationTime: number;
    isValid: boolean;
    errorCount: number;
    warningCount: number;
    score: number;
    retryCount: number;
    fallbackUsed: boolean;
    personaType: PersonaType;
    rulesExecuted: string[];
    rulesFailed: string[];
}

export interface ValidationMetricsAggregated {
    templateId: string;
    period: string;
    totalValidations: number;
    successRate: number;
    averageScore: number;
    averageValidationTime: number;
    errorBreakdown: Record<ValidationErrorType, number>;
    fallbackUsageRate: number;
}

export interface MetricsSummary {
    totalValidations: number;
    successRate: number;
    averageScore: number;
    averageValidationTime: number;
    errorBreakdown: Record<ValidationErrorType, number>;
    fallbackUsageRate: number;
    topFailingRules: Array<{ ruleId: string; failureCount: number }>;
}

// Validation Rule and Template Types
export interface ValidatorFunction {
    (value: any, context: ValidationContext): ValidationResult | Promise<ValidationResult>;
}

export interface ValidationRule {
    id: string;
    type: ValidationRuleType;
    field: string;
    validator: ValidatorFunction;
    severity: ValidationSeverity;
    message: string;
    required: boolean;
    dependencies?: string[];
    priority?: number;
    timeout?: number;
}

export interface FallbackStrategy {
    type: FallbackStrategyType;
    maxRetries: number;
    fallbackTemplate?: string;
    defaultResponse?: any;
    retryDelay?: number;
    backoffMultiplier?: number;
}

export interface TemplateMetadata {
    createdAt: number;
    updatedAt: number;
    author: string;
    description: string;
    tags: string[];
    isActive: boolean;
    supportedLLMs?: string[];
}

export interface ValidationTemplate {
    id: string;
    name: string;
    version: string;
    personaType: PersonaType;
    rules: ValidationRule[];
    fallbackStrategy: FallbackStrategy;
    metadata: TemplateMetadata;
}

// Retry Strategy Types
export interface RetryStrategy {
    maxRetries: number;
    backoffMultiplier: number;
    retryableErrors: ValidationErrorType[];
    enhancePromptOnRetry: boolean;
    fallbackAfterMaxRetries: boolean;
    retryDelay: number;
}

// Configuration Types
export interface ValidationConfig {
    VALIDATION_ENABLED: boolean;
    VALIDATION_TIMEOUT_MS: number;
    MAX_VALIDATION_RETRIES: number;
    FALLBACK_ENABLED: boolean;
    METRICS_COLLECTION_ENABLED: boolean;
    ALERT_THRESHOLD_ERROR_RATE: number;
    TEMPLATE_CACHE_TTL: number;
}

export interface ValidationFeatureFlags {
    strictValidation: boolean;
    culturalDataValidation: boolean;
    businessRuleValidation: boolean;
    performanceMetrics: boolean;
    alerting: boolean;
}