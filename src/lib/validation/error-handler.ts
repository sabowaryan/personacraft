/**
 * ValidationErrorHandler - Handles error classification, recovery strategies, and retry logic
 * 
 * This class is responsible for:
 * - Classifying validation errors by severity and type
 * - Implementing recovery strategies for different error types
 * - Managing retry logic with exponential backoff
 * - Coordinating with fallback systems
 */

import {
    ValidationError,
    ValidationResult,
    ValidationContext,
    ValidationErrorType,
    ValidationSeverity,
    RetryStrategy,
    FallbackStrategy,
    FallbackStrategyType,
    PersonaType
} from '../../types/validation';

export interface ErrorClassification {
    severity: ValidationSeverity;
    isRetryable: boolean;
    suggestedAction: ErrorRecoveryAction;
    priority: number;
}

export enum ErrorRecoveryAction {
    IMMEDIATE_RETRY = 'immediate_retry',
    GUIDED_REGENERATION = 'guided_regeneration',
    TEMPLATE_FALLBACK = 'template_fallback',
    DEFAULT_RESPONSE = 'default_response',
    FAIL_FAST = 'fail_fast'
}

export interface RetryContext {
    attempt: number;
    maxRetries: number;
    previousErrors: ValidationError[];
    enhancedPrompt?: string;
    backoffDelay: number;
    startTime: number;
}

export interface ErrorRecoveryResult {
    shouldRetry: boolean;
    action: ErrorRecoveryAction;
    enhancedPrompt?: string;
    fallbackTemplateId?: string;
    defaultResponse?: any;
    delay: number;
    reason: string;
}

export class ValidationErrorHandler {
    private readonly defaultRetryStrategy: RetryStrategy = {
        maxRetries: 3,
        backoffMultiplier: 2,
        retryableErrors: [
            ValidationErrorType.FORMAT_INVALID,
            ValidationErrorType.VALUE_OUT_OF_RANGE,
            ValidationErrorType.CULTURAL_DATA_INCONSISTENT,
            ValidationErrorType.BUSINESS_RULE_VIOLATION
        ],
        enhancePromptOnRetry: true,
        fallbackAfterMaxRetries: true,
        retryDelay: 1000
    };

    private readonly errorClassifications: Map<ValidationErrorType, ErrorClassification> = new Map([
        [ValidationErrorType.STRUCTURE_INVALID, {
            severity: ValidationSeverity.ERROR,
            isRetryable: true,
            suggestedAction: ErrorRecoveryAction.GUIDED_REGENERATION,
            priority: 1
        }],
        [ValidationErrorType.REQUIRED_FIELD_MISSING, {
            severity: ValidationSeverity.ERROR,
            isRetryable: true,
            suggestedAction: ErrorRecoveryAction.GUIDED_REGENERATION,
            priority: 1
        }],
        [ValidationErrorType.TYPE_MISMATCH, {
            severity: ValidationSeverity.ERROR,
            isRetryable: true,
            suggestedAction: ErrorRecoveryAction.GUIDED_REGENERATION,
            priority: 2
        }],
        [ValidationErrorType.VALUE_OUT_OF_RANGE, {
            severity: ValidationSeverity.ERROR,
            isRetryable: true,
            suggestedAction: ErrorRecoveryAction.IMMEDIATE_RETRY,
            priority: 3
        }],
        [ValidationErrorType.FORMAT_INVALID, {
            severity: ValidationSeverity.ERROR,
            isRetryable: true,
            suggestedAction: ErrorRecoveryAction.IMMEDIATE_RETRY,
            priority: 3
        }],
        [ValidationErrorType.CULTURAL_DATA_INCONSISTENT, {
            severity: ValidationSeverity.WARNING,
            isRetryable: true,
            suggestedAction: ErrorRecoveryAction.GUIDED_REGENERATION,
            priority: 4
        }],
        [ValidationErrorType.BUSINESS_RULE_VIOLATION, {
            severity: ValidationSeverity.ERROR,
            isRetryable: true,
            suggestedAction: ErrorRecoveryAction.GUIDED_REGENERATION,
            priority: 2
        }],
        [ValidationErrorType.TEMPLATE_NOT_FOUND, {
            severity: ValidationSeverity.ERROR,
            isRetryable: false,
            suggestedAction: ErrorRecoveryAction.TEMPLATE_FALLBACK,
            priority: 1
        }],
        [ValidationErrorType.VALIDATION_TIMEOUT, {
            severity: ValidationSeverity.ERROR,
            isRetryable: true,
            suggestedAction: ErrorRecoveryAction.TEMPLATE_FALLBACK,
            priority: 1
        }]
    ]);

    constructor(private customRetryStrategy?: Partial<RetryStrategy>) {}

    /**
     * Analyzes validation errors and determines the appropriate recovery strategy
     */
    analyzeErrors(
        validationResult: ValidationResult,
        context: ValidationContext,
        retryContext: RetryContext
    ): ErrorRecoveryResult {
        const { errors } = validationResult;
        
        if (errors.length === 0) {
            return {
                shouldRetry: false,
                action: ErrorRecoveryAction.FAIL_FAST,
                delay: 0,
                reason: 'No errors to recover from'
            };
        }

        // Check if we've exceeded max retries
        const strategy = this.getEffectiveRetryStrategy();
        if (retryContext.attempt >= strategy.maxRetries) {
            return this.handleMaxRetriesExceeded(context, strategy);
        }

        // Classify and prioritize errors
        const classifiedErrors = this.classifyErrors(errors);
        const criticalErrors = classifiedErrors.filter(ce => ce.classification.severity === ValidationSeverity.ERROR);
        
        // If we have critical errors, focus on those
        const errorsToHandle = criticalErrors.length > 0 ? criticalErrors : classifiedErrors;
        
        // Sort by priority (lower number = higher priority)
        errorsToHandle.sort((a, b) => a.classification.priority - b.classification.priority);
        
        // Determine recovery action based on highest priority error
        const primaryError = errorsToHandle[0];
        const recoveryAction = this.determineRecoveryAction(primaryError, retryContext, strategy);
        
        return recoveryAction;
    }

    /**
     * Creates an enhanced prompt based on validation errors
     */
    createEnhancedPrompt(
        errors: ValidationError[],
        originalContext: ValidationContext,
        attempt: number
    ): string {
        const errorsByType = this.groupErrorsByType(errors);
        const promptEnhancements: string[] = [];

        // Add specific guidance for each error type
        for (const [errorType, errorList] of errorsByType.entries()) {
            const enhancement = this.createErrorTypeGuidance(errorType, errorList, attempt);
            if (enhancement) {
                promptEnhancements.push(enhancement);
            }
        }

        // Add general retry guidance
        if (attempt > 1) {
            promptEnhancements.push(
                `This is attempt ${attempt}. Please pay special attention to the following issues that occurred in previous attempts.`
            );
        }

        return promptEnhancements.join('\n\n');
    }

    /**
     * Calculates the delay for the next retry using exponential backoff
     */
    calculateRetryDelay(attempt: number, strategy?: RetryStrategy): number {
        const effectiveStrategy = strategy || this.getEffectiveRetryStrategy();
        const baseDelay = effectiveStrategy.retryDelay;
        const multiplier = effectiveStrategy.backoffMultiplier;
        
        // Exponential backoff: delay = baseDelay * (multiplier ^ (attempt - 1))
        const delay = baseDelay * Math.pow(multiplier, attempt - 1);
        
        // Add jitter to prevent thundering herd (±25% random variation)
        const jitter = delay * 0.25 * (Math.random() - 0.5);
        
        return Math.max(100, Math.round(delay + jitter)); // Minimum 100ms delay
    }

    /**
     * Determines if an error type is retryable
     */
    isRetryableError(errorType: ValidationErrorType): boolean {
        const classification = this.errorClassifications.get(errorType);
        return classification?.isRetryable ?? false;
    }

    /**
     * Gets the severity of an error type
     */
    getErrorSeverity(errorType: ValidationErrorType): ValidationSeverity {
        const classification = this.errorClassifications.get(errorType);
        return classification?.severity ?? ValidationSeverity.ERROR;
    }

    /**
     * Detects recurring error patterns across attempts
     */
    detectRecurringErrors(
        currentErrors: ValidationError[],
        previousErrors: ValidationError[]
    ): ValidationError[] {
        const recurringErrors: ValidationError[] = [];
        
        for (const currentError of currentErrors) {
            const isRecurring = previousErrors.some(prevError => 
                prevError.type === currentError.type &&
                prevError.field === currentError.field
            );
            
            if (isRecurring) {
                recurringErrors.push(currentError);
            }
        }
        
        return recurringErrors;
    }

    /**
     * Suggests template escalation based on error patterns
     */
    suggestTemplateEscalation(
        errors: ValidationError[],
        currentPersonaType: PersonaType,
        attempt: number
    ): PersonaType | null {
        // If we have many structural or business rule errors, escalate to simpler template
        const structuralErrors = errors.filter(e => 
            e.type === ValidationErrorType.STRUCTURE_INVALID ||
            e.type === ValidationErrorType.REQUIRED_FIELD_MISSING ||
            e.type === ValidationErrorType.BUSINESS_RULE_VIOLATION
        );

        if (structuralErrors.length >= 3 || attempt >= 2) {
            // Escalate to simpler template
            switch (currentPersonaType) {
                case PersonaType.B2B:
                    return PersonaType.STANDARD;
                case PersonaType.STANDARD:
                    return PersonaType.SIMPLE;
                case PersonaType.SIMPLE:
                    return null; // Already at simplest level
            }
        }

        return null;
    }

    // Private helper methods

    private getEffectiveRetryStrategy(): RetryStrategy {
        return {
            ...this.defaultRetryStrategy,
            ...this.customRetryStrategy
        };
    }

    private classifyErrors(errors: ValidationError[]): Array<{
        error: ValidationError;
        classification: ErrorClassification;
    }> {
        return errors.map(error => ({
            error,
            classification: this.errorClassifications.get(error.type) || {
                severity: ValidationSeverity.ERROR,
                isRetryable: false,
                suggestedAction: ErrorRecoveryAction.FAIL_FAST,
                priority: 999
            }
        }));
    }

    private determineRecoveryAction(
        primaryError: { error: ValidationError; classification: ErrorClassification },
        retryContext: RetryContext,
        strategy: RetryStrategy
    ): ErrorRecoveryResult {
        const { error, classification } = primaryError;
        
        // Check if error type is retryable according to strategy
        if (!strategy.retryableErrors.includes(error.type)) {
            return {
                shouldRetry: false,
                action: ErrorRecoveryAction.TEMPLATE_FALLBACK,
                delay: 0,
                reason: `Error type ${error.type} is not retryable`
            };
        }

        // Calculate delay for retry
        const delay = this.calculateRetryDelay(retryContext.attempt + 1, strategy);
        
        // Determine specific action based on classification
        switch (classification.suggestedAction) {
            case ErrorRecoveryAction.IMMEDIATE_RETRY:
                return {
                    shouldRetry: true,
                    action: ErrorRecoveryAction.IMMEDIATE_RETRY,
                    delay,
                    reason: `Immediate retry for ${error.type}`
                };
                
            case ErrorRecoveryAction.GUIDED_REGENERATION:
                return {
                    shouldRetry: true,
                    action: ErrorRecoveryAction.GUIDED_REGENERATION,
                    enhancedPrompt: this.createEnhancedPrompt([error], {} as ValidationContext, retryContext.attempt + 1),
                    delay,
                    reason: `Guided regeneration for ${error.type}`
                };
                
            case ErrorRecoveryAction.TEMPLATE_FALLBACK:
                return {
                    shouldRetry: false,
                    action: ErrorRecoveryAction.TEMPLATE_FALLBACK,
                    delay: 0,
                    reason: `Template fallback required for ${error.type}`
                };
                
            default:
                return {
                    shouldRetry: false,
                    action: ErrorRecoveryAction.FAIL_FAST,
                    delay: 0,
                    reason: `No recovery strategy for ${error.type}`
                };
        }
    }

    private handleMaxRetriesExceeded(
        context: ValidationContext,
        strategy: RetryStrategy
    ): ErrorRecoveryResult {
        if (strategy.fallbackAfterMaxRetries) {
            return {
                shouldRetry: false,
                action: ErrorRecoveryAction.TEMPLATE_FALLBACK,
                delay: 0,
                reason: 'Max retries exceeded, falling back to simpler template'
            };
        } else {
            return {
                shouldRetry: false,
                action: ErrorRecoveryAction.DEFAULT_RESPONSE,
                delay: 0,
                reason: 'Max retries exceeded, using default response'
            };
        }
    }

    private groupErrorsByType(errors: ValidationError[]): Map<ValidationErrorType, ValidationError[]> {
        const grouped = new Map<ValidationErrorType, ValidationError[]>();
        
        for (const error of errors) {
            if (!grouped.has(error.type)) {
                grouped.set(error.type, []);
            }
            grouped.get(error.type)!.push(error);
        }
        
        return grouped;
    }

    private createErrorTypeGuidance(
        errorType: ValidationErrorType,
        errors: ValidationError[],
        attempt: number
    ): string | null {
        const fieldList = errors.map(e => e.field).join(', ');
        
        switch (errorType) {
            case ValidationErrorType.STRUCTURE_INVALID:
                return `STRUCTURE ISSUE: The response structure is invalid. Please ensure the JSON follows the exact schema required. Affected fields: ${fieldList}`;
                
            case ValidationErrorType.REQUIRED_FIELD_MISSING:
                return `MISSING FIELDS: The following required fields are missing: ${fieldList}. Please include all mandatory fields in your response.`;
                
            case ValidationErrorType.TYPE_MISMATCH:
                return `TYPE ERRORS: The following fields have incorrect data types: ${fieldList}. Please ensure each field uses the correct data type (string, number, object, array).`;
                
            case ValidationErrorType.VALUE_OUT_OF_RANGE:
                return `VALUE RANGE ERRORS: The following fields have values outside acceptable ranges: ${fieldList}. Please check the constraints for each field.`;
                
            case ValidationErrorType.FORMAT_INVALID:
                return `FORMAT ERRORS: The following fields have invalid formats: ${fieldList}. Please ensure proper formatting (e.g., email format, phone format, date format).`;
                
            case ValidationErrorType.CULTURAL_DATA_INCONSISTENT:
                return `CULTURAL CONSISTENCY: There are inconsistencies in cultural data across fields: ${fieldList}. Please ensure demographic, cultural, and consumption data align logically.`;
                
            case ValidationErrorType.BUSINESS_RULE_VIOLATION:
                return `BUSINESS RULE VIOLATIONS: The following fields violate business rules: ${fieldList}. Please review the business logic requirements.`;
                
            default:
                return null;
        }
    }
}