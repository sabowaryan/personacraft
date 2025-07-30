/**
 * RetryManager - Manages intelligent retry strategies for validation failures
 * 
 * This class is responsible for:
 * - Implementing retry logic with prompt enhancement
 * - Detecting recurring error patterns
 * - Escalating to simpler templates when appropriate
 * - Managing backoff strategies and retry limits
 */

import {
    ValidationError,
    ValidationContext,
    ValidationErrorType,
    PersonaType,
    RetryStrategy,
    FallbackStrategy,
    FallbackStrategyType
} from '../../types/validation';

export interface RetryResult {
    shouldRetry: boolean;
    enhancedPrompt?: string;
    suggestedTemplate?: string;
    retryDelay: number;
    reason: string;
    metadata: {
        attempt: number;
        totalAttempts: number;
        errorPattern: string;
        escalationLevel: number;
        timestamp: number;
    };
}

export interface ErrorPattern {
    errorTypes: ValidationErrorType[];
    frequency: number;
    lastOccurrence: number;
    fields: string[];
    severity: 'low' | 'medium' | 'high';
}

export interface PromptEnhancement {
    errorType: ValidationErrorType;
    enhancement: string;
    priority: number;
}

export class RetryManager {
    private errorPatterns: Map<string, ErrorPattern> = new Map();
    private retryHistory: Map<string, number[]> = new Map();
    private promptEnhancements: Map<ValidationErrorType, PromptEnhancement[]> = new Map();

    constructor() {
        this.initializePromptEnhancements();
    }

    /**
     * Determines if a retry should be attempted and provides enhancement suggestions
     */
    shouldRetry(
        errors: ValidationError[],
        context: ValidationContext,
        strategy: RetryStrategy,
        currentAttempt: number
    ): RetryResult {
        const startTime = Date.now();
        const requestId = this.generateRequestId(context);

        // Check if we've exceeded max retries
        if (currentAttempt >= strategy.maxRetries) {
            return {
                shouldRetry: false,
                retryDelay: 0,
                reason: `Maximum retry attempts (${strategy.maxRetries}) exceeded`,
                metadata: {
                    attempt: currentAttempt,
                    totalAttempts: strategy.maxRetries,
                    errorPattern: this.analyzeErrorPattern(errors),
                    escalationLevel: this.calculateEscalationLevel(errors, currentAttempt),
                    timestamp: startTime
                }
            };
        }

        // Check if errors are retryable
        const retryableErrors = errors.filter(error => 
            strategy.retryableErrors.includes(error.type)
        );

        if (retryableErrors.length === 0) {
            return {
                shouldRetry: false,
                retryDelay: 0,
                reason: 'No retryable errors found',
                metadata: {
                    attempt: currentAttempt,
                    totalAttempts: strategy.maxRetries,
                    errorPattern: this.analyzeErrorPattern(errors),
                    escalationLevel: 0,
                    timestamp: startTime
                }
            };
        }

        // Update error patterns and detect recurring issues
        this.updateErrorPatterns(requestId, errors);
        const errorPattern = this.getErrorPattern(requestId);
        
        // Determine if we should escalate to a simpler template
        const escalationLevel = this.calculateEscalationLevel(errors, currentAttempt);
        const suggestedTemplate = this.suggestTemplateEscalation(
            context.originalRequest.personaType,
            escalationLevel,
            errorPattern
        );

        // Calculate retry delay with exponential backoff
        const retryDelay = this.calculateRetryDelay(strategy, currentAttempt);

        // Generate enhanced prompt if enabled
        let enhancedPrompt: string | undefined;
        if (strategy.enhancePromptOnRetry) {
            enhancedPrompt = this.generateEnhancedPrompt(errors, context, currentAttempt);
        }

        return {
            shouldRetry: true,
            enhancedPrompt,
            suggestedTemplate,
            retryDelay,
            reason: `Retry attempt ${currentAttempt + 1} of ${strategy.maxRetries}`,
            metadata: {
                attempt: currentAttempt,
                totalAttempts: strategy.maxRetries,
                errorPattern: this.analyzeErrorPattern(errors),
                escalationLevel,
                timestamp: startTime
            }
        };
    }

    /**
     * Detects if there are recurring error patterns that suggest systematic issues
     */
    detectRecurringErrors(
        requestId: string,
        threshold: number = 3
    ): {
        hasRecurringErrors: boolean;
        patterns: ErrorPattern[];
        recommendations: string[];
    } {
        const pattern = this.errorPatterns.get(requestId);
        const recommendations: string[] = [];

        if (!pattern) {
            return {
                hasRecurringErrors: false,
                patterns: [],
                recommendations
            };
        }

        const hasRecurringErrors = pattern.frequency >= threshold;

        if (hasRecurringErrors) {
            // Generate recommendations based on error patterns
            if (pattern.errorTypes.includes(ValidationErrorType.STRUCTURE_INVALID)) {
                recommendations.push('Consider using a simpler template with fewer required fields');
                recommendations.push('Review the JSON schema validation rules');
            }

            if (pattern.errorTypes.includes(ValidationErrorType.CULTURAL_DATA_INCONSISTENT)) {
                recommendations.push('Simplify cultural data requirements');
                recommendations.push('Use more generic cultural categories');
            }

            if (pattern.errorTypes.includes(ValidationErrorType.BUSINESS_RULE_VIOLATION)) {
                recommendations.push('Relax business rule constraints');
                recommendations.push('Consider template escalation to simpler persona type');
            }

            if (pattern.errorTypes.includes(ValidationErrorType.FORMAT_INVALID)) {
                recommendations.push('Provide more specific format examples in the prompt');
                recommendations.push('Use format validation with auto-correction');
            }
        }

        return {
            hasRecurringErrors,
            patterns: pattern ? [pattern] : [],
            recommendations
        };
    }

    /**
     * Suggests template escalation based on error patterns and attempt count
     */
    suggestTemplateEscalation(
        currentPersonaType: PersonaType,
        escalationLevel: number,
        errorPattern?: ErrorPattern
    ): string | undefined {
        const escalationMap: Record<PersonaType, PersonaType[]> = {
            [PersonaType.B2B]: [PersonaType.STANDARD, PersonaType.SIMPLE],
            [PersonaType.STANDARD]: [PersonaType.SIMPLE],
            [PersonaType.SIMPLE]: [] // No further escalation
        };

        const availableEscalations = escalationMap[currentPersonaType] || [];
        
        if (availableEscalations.length === 0 || escalationLevel === 0) {
            return undefined;
        }

        // Determine escalation target based on level and error severity
        const targetIndex = Math.min(escalationLevel - 1, availableEscalations.length - 1);
        const targetPersonaType = availableEscalations[targetIndex];

        return `${targetPersonaType}-persona-v1`;
    }

    /**
     * Generates an enhanced prompt based on previous errors
     */
    generateEnhancedPrompt(
        errors: ValidationError[],
        context: ValidationContext,
        attempt: number
    ): string {
        const enhancements: string[] = [];

        // Group errors by type for targeted enhancements
        const errorsByType = errors.reduce((acc, error) => {
            if (!acc[error.type]) {
                acc[error.type] = [];
            }
            acc[error.type].push(error);
            return acc;
        }, {} as Record<ValidationErrorType, ValidationError[]>);

        // Generate specific enhancements for each error type
        for (const [errorType, errorList] of Object.entries(errorsByType)) {
            const typeEnhancements = this.promptEnhancements.get(errorType as ValidationErrorType);
            if (typeEnhancements) {
                // Sort by priority and take the most relevant enhancement
                const enhancement = typeEnhancements
                    .sort((a, b) => b.priority - a.priority)[0];
                
                if (enhancement) {
                    // Customize enhancement with specific error details
                    const customizedEnhancement = this.customizeEnhancement(
                        enhancement.enhancement,
                        errorList,
                        context
                    );
                    enhancements.push(customizedEnhancement);
                }
            }
        }

        // Add attempt-specific guidance
        if (attempt >= 2) {
            enhancements.push(
                'IMPORTANT: Previous attempts failed validation. Please be extra careful with:'
            );
            
            const failedFields = [...new Set(errors.map(e => e.field))];
            enhancements.push(`- Field accuracy for: ${failedFields.join(', ')}`);
            enhancements.push('- JSON structure and format compliance');
            enhancements.push('- Required field completeness');
        }

        if (attempt >= 3) {
            enhancements.push(
                'CRITICAL: Multiple validation failures detected. Consider simplifying the response structure.'
            );
        }

        return enhancements.join('\n');
    }

    /**
     * Gets retry statistics for monitoring
     */
    getRetryStatistics(): {
        totalRetries: number;
        successfulRetries: number;
        failedRetries: number;
        averageRetriesPerRequest: number;
        commonErrorPatterns: ErrorPattern[];
        escalationFrequency: Record<string, number>;
    } {
        const totalRetries = Array.from(this.retryHistory.values())
            .reduce((sum, attempts) => sum + attempts.length, 0);

        // For a real implementation, we'd track success/failure rates
        const successfulRetries = Math.floor(totalRetries * 0.7); // Placeholder
        const failedRetries = totalRetries - successfulRetries;

        const averageRetriesPerRequest = this.retryHistory.size > 0 
            ? totalRetries / this.retryHistory.size 
            : 0;

        const commonErrorPatterns = Array.from(this.errorPatterns.values())
            .filter(pattern => pattern.frequency >= 2)
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 10);

        // Placeholder for escalation frequency
        const escalationFrequency: Record<string, number> = {};

        return {
            totalRetries,
            successfulRetries,
            failedRetries,
            averageRetriesPerRequest,
            commonErrorPatterns,
            escalationFrequency
        };
    }

    /**
     * Clears old retry history and error patterns to prevent memory leaks
     */
    cleanup(maxAge: number = 24 * 60 * 60 * 1000): void { // 24 hours default
        const now = Date.now();
        
        // Clean up old error patterns
        for (const [key, pattern] of this.errorPatterns.entries()) {
            if (now - pattern.lastOccurrence > maxAge) {
                this.errorPatterns.delete(key);
            }
        }

        // Clean up old retry history
        // For simplicity, we'll clear all history older than maxAge
        // In a real implementation, we'd store timestamps with each retry
        if (this.retryHistory.size > 1000) { // Arbitrary limit
            this.retryHistory.clear();
        }
    }

    // Private helper methods

    private generateRequestId(context: ValidationContext): string {
        // Generate a unique ID for this validation request
        const { originalRequest, generationAttempt } = context;
        return `${originalRequest.personaType}-${Date.now()}-${generationAttempt}`;
    }

    private updateErrorPatterns(requestId: string, errors: ValidationError[]): void {
        const now = Date.now();
        const errorTypes = errors.map(e => e.type);
        const fields = [...new Set(errors.map(e => e.field))];

        let pattern = this.errorPatterns.get(requestId);
        
        if (!pattern) {
            pattern = {
                errorTypes: [],
                frequency: 0,
                lastOccurrence: now,
                fields: [],
                severity: 'low'
            };
            this.errorPatterns.set(requestId, pattern);
        }

        // Update pattern
        pattern.errorTypes = [...new Set([...pattern.errorTypes, ...errorTypes])];
        pattern.fields = [...new Set([...pattern.fields, ...fields])];
        pattern.frequency += 1;
        pattern.lastOccurrence = now;

        // Determine severity based on error types and frequency
        const criticalErrors = errorTypes.filter(type => 
            [ValidationErrorType.STRUCTURE_INVALID, 
             ValidationErrorType.BUSINESS_RULE_VIOLATION,
             ValidationErrorType.REQUIRED_FIELD_MISSING].includes(type)
        );

        if (criticalErrors.length >= 2 || pattern.frequency >= 3) {
            pattern.severity = 'high';
        } else if (criticalErrors.length >= 1 || pattern.frequency >= 2) {
            pattern.severity = 'medium';
        }

        // Update retry history
        if (!this.retryHistory.has(requestId)) {
            this.retryHistory.set(requestId, []);
        }
        this.retryHistory.get(requestId)!.push(now);
    }

    private getErrorPattern(requestId: string): ErrorPattern | undefined {
        return this.errorPatterns.get(requestId);
    }

    private analyzeErrorPattern(errors: ValidationError[]): string {
        const errorTypes = errors.map(e => e.type);
        const uniqueTypes = [...new Set(errorTypes)];
        
        if (uniqueTypes.length === 1) {
            return `single-${uniqueTypes[0]}`;
        } else if (uniqueTypes.includes(ValidationErrorType.STRUCTURE_INVALID)) {
            return 'structure-dominant';
        } else if (uniqueTypes.includes(ValidationErrorType.BUSINESS_RULE_VIOLATION)) {
            return 'business-rule-dominant';
        } else {
            return 'mixed-errors';
        }
    }

    private calculateEscalationLevel(errors: ValidationError[], attempt: number): number {
        // Base escalation on error severity and attempt count
        const criticalErrors = errors.filter(e => 
            [ValidationErrorType.STRUCTURE_INVALID,
             ValidationErrorType.BUSINESS_RULE_VIOLATION,
             ValidationErrorType.REQUIRED_FIELD_MISSING].includes(e.type)
        );

        let escalationLevel = 0;

        // Escalate based on critical error count
        if (criticalErrors.length >= 3) {
            escalationLevel = 2; // Escalate to simplest template
        } else if (criticalErrors.length >= 1) {
            escalationLevel = 1; // Escalate one level
        }

        // Escalate based on attempt count
        if (attempt >= 3) {
            escalationLevel = Math.max(escalationLevel, 2);
        } else if (attempt >= 2) {
            escalationLevel = Math.max(escalationLevel, 1);
        }

        return escalationLevel;
    }

    private calculateRetryDelay(strategy: RetryStrategy, attempt: number): number {
        const baseDelay = strategy.retryDelay || 1000; // 1 second default
        const multiplier = strategy.backoffMultiplier || 2;
        
        return baseDelay * Math.pow(multiplier, attempt);
    }

    private customizeEnhancement(
        enhancement: string,
        errors: ValidationError[],
        context: ValidationContext
    ): string {
        let customized = enhancement;

        // Replace placeholders with specific error information
        const fields = errors.map(e => e.field).join(', ');
        customized = customized.replace('{fields}', fields);

        const personaType = context.originalRequest.personaType;
        customized = customized.replace('{personaType}', personaType);

        return customized;
    }

    private initializePromptEnhancements(): void {
        // Structure validation enhancements
        this.promptEnhancements.set(ValidationErrorType.STRUCTURE_INVALID, [
            {
                errorType: ValidationErrorType.STRUCTURE_INVALID,
                enhancement: 'Ensure the response follows the exact JSON structure required. Pay special attention to nested objects and array formats.',
                priority: 10
            },
            {
                errorType: ValidationErrorType.STRUCTURE_INVALID,
                enhancement: 'Validate that all required parent objects exist before adding child properties.',
                priority: 8
            }
        ]);

        // Required field enhancements
        this.promptEnhancements.set(ValidationErrorType.REQUIRED_FIELD_MISSING, [
            {
                errorType: ValidationErrorType.REQUIRED_FIELD_MISSING,
                enhancement: 'Double-check that all required fields are present: {fields}. Do not omit any mandatory fields.',
                priority: 10
            },
            {
                errorType: ValidationErrorType.REQUIRED_FIELD_MISSING,
                enhancement: 'For {personaType} personas, ensure all core demographic and profile fields are included.',
                priority: 9
            }
        ]);

        // Format validation enhancements
        this.promptEnhancements.set(ValidationErrorType.FORMAT_INVALID, [
            {
                errorType: ValidationErrorType.FORMAT_INVALID,
                enhancement: 'Pay careful attention to data formats. Use proper email formats, phone number formats, and date formats (YYYY-MM-DD).',
                priority: 9
            },
            {
                errorType: ValidationErrorType.FORMAT_INVALID,
                enhancement: 'Ensure arrays contain the correct data types and objects have the expected property types.',
                priority: 8
            }
        ]);

        // Business rule enhancements
        this.promptEnhancements.set(ValidationErrorType.BUSINESS_RULE_VIOLATION, [
            {
                errorType: ValidationErrorType.BUSINESS_RULE_VIOLATION,
                enhancement: 'Review business logic constraints. Ensure age ranges, income levels, and professional roles are realistic and consistent.',
                priority: 10
            },
            {
                errorType: ValidationErrorType.BUSINESS_RULE_VIOLATION,
                enhancement: 'For B2B personas, ensure company size, industry, and role combinations are logical and realistic.',
                priority: 9
            }
        ]);

        // Cultural data enhancements
        this.promptEnhancements.set(ValidationErrorType.CULTURAL_DATA_INCONSISTENT, [
            {
                errorType: ValidationErrorType.CULTURAL_DATA_INCONSISTENT,
                enhancement: 'Ensure cultural data is internally consistent. Location, cultural background, and preferences should align logically.',
                priority: 9
            },
            {
                errorType: ValidationErrorType.CULTURAL_DATA_INCONSISTENT,
                enhancement: 'Use culturally appropriate values for the specified location and demographic profile.',
                priority: 8
            }
        ]);

        // Type mismatch enhancements
        this.promptEnhancements.set(ValidationErrorType.TYPE_MISMATCH, [
            {
                errorType: ValidationErrorType.TYPE_MISMATCH,
                enhancement: 'Verify data types match expectations: strings for text, numbers for ages/income, arrays for lists, objects for nested data.',
                priority: 8
            }
        ]);

        // Value range enhancements
        this.promptEnhancements.set(ValidationErrorType.VALUE_OUT_OF_RANGE, [
            {
                errorType: ValidationErrorType.VALUE_OUT_OF_RANGE,
                enhancement: 'Ensure numeric values fall within acceptable ranges. Ages should be 18-80, income levels should be realistic.',
                priority: 8
            }
        ]);
    }
}