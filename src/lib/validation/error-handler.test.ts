/**
 * Tests for ValidationErrorHandler
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ValidationErrorHandler, ErrorRecoveryAction } from './error-handler';
import {
    ValidationError,
    ValidationResult,
    ValidationContext,
    ValidationErrorType,
    ValidationSeverity,
    PersonaType,
    RetryStrategy
} from '../../types/validation';

describe('ValidationErrorHandler', () => {
    let errorHandler: ValidationErrorHandler;
    let mockContext: ValidationContext;
    let mockRetryContext: any;

    beforeEach(() => {
        errorHandler = new ValidationErrorHandler();
        
        mockContext = {
            originalRequest: {
                personaType: PersonaType.STANDARD,
                culturalData: {},
                demographics: {}
            },
            templateVariables: { templateId: 'test-template' },
            culturalConstraints: {
                music: ['Pop', 'Rock'],
                brands: ['Nike', 'Apple'],
                restaurants: ['McDonalds', 'Starbucks'],
                movies: ['Avengers', 'Star Wars'],
                tv: ['Friends', 'The Office'],
                books: ['Harry Potter', '1984'],
                travel: ['Paris', 'Tokyo'],
                fashion: ['Casual', 'Business'],
                beauty: ['Skincare', 'Makeup'],
                food: ['Italian', 'Asian'],
                socialMedia: ['Instagram', 'TikTok']
            },
            userSignals: {
                demographics: {
                    ageRange: { min: 25, max: 35 },
                    location: 'New York',
                    occupation: 'Software Engineer'
                },
                interests: ['Technology', 'Music'],
                values: ['Innovation', 'Creativity'],
                culturalContext: {
                    language: 'en' as const,
                    personaCount: 3
                }
            },
            generationAttempt: 1,
            previousErrors: []
        } as ValidationContext;

        mockRetryContext = {
            attempt: 1,
            maxRetries: 3,
            previousErrors: [],
            backoffDelay: 1000,
            startTime: Date.now()
        };
    });

    describe('analyzeErrors', () => {
        it('should return no retry when no errors exist', () => {
            const validationResult: ValidationResult = {
                isValid: true,
                errors: [],
                warnings: [],
                score: 100,
                metadata: {
                    templateId: 'test',
                    templateVersion: '1.0.0',
                    validationTime: 100,
                    rulesExecuted: 1,
                    rulesSkipped: 0,
                    timestamp: Date.now()
                }
            };

            const result = errorHandler.analyzeErrors(validationResult, mockContext, mockRetryContext);

            expect(result.shouldRetry).toBe(false);
            expect(result.action).toBe(ErrorRecoveryAction.FAIL_FAST);
            expect(result.reason).toBe('No errors to recover from');
        });

        it('should suggest immediate retry for format errors', () => {
            const errors: ValidationError[] = [{
                id: 'format-error-1',
                type: ValidationErrorType.FORMAT_INVALID,
                field: 'email',
                message: 'Invalid email format',
                severity: ValidationSeverity.ERROR
            }];

            const validationResult: ValidationResult = {
                isValid: false,
                errors,
                warnings: [],
                score: 50,
                metadata: {
                    templateId: 'test',
                    templateVersion: '1.0.0',
                    validationTime: 100,
                    rulesExecuted: 1,
                    rulesSkipped: 0,
                    timestamp: Date.now()
                }
            };

            const result = errorHandler.analyzeErrors(validationResult, mockContext, mockRetryContext);

            expect(result.shouldRetry).toBe(true);
            expect(result.action).toBe(ErrorRecoveryAction.IMMEDIATE_RETRY);
            expect(result.delay).toBeGreaterThan(0);
        });

        it('should suggest guided regeneration for structure errors', () => {
            const errors: ValidationError[] = [{
                id: 'structure-error-1',
                type: ValidationErrorType.STRUCTURE_INVALID,
                field: 'root',
                message: 'Invalid JSON structure',
                severity: ValidationSeverity.ERROR
            }];

            const validationResult: ValidationResult = {
                isValid: false,
                errors,
                warnings: [],
                score: 30,
                metadata: {
                    templateId: 'test',
                    templateVersion: '1.0.0',
                    validationTime: 100,
                    rulesExecuted: 1,
                    rulesSkipped: 0,
                    timestamp: Date.now()
                }
            };

            const result = errorHandler.analyzeErrors(validationResult, mockContext, mockRetryContext);

            expect(result.shouldRetry).toBe(true);
            expect(result.action).toBe(ErrorRecoveryAction.GUIDED_REGENERATION);
            expect(result.enhancedPrompt).toBeDefined();
            expect(result.enhancedPrompt).toContain('STRUCTURE ISSUE');
        });

        it('should fallback when max retries exceeded', () => {
            mockRetryContext.attempt = 3;
            mockRetryContext.maxRetries = 3;

            const errors: ValidationError[] = [{
                id: 'error-1',
                type: ValidationErrorType.FORMAT_INVALID,
                field: 'email',
                message: 'Invalid email format',
                severity: ValidationSeverity.ERROR
            }];

            const validationResult: ValidationResult = {
                isValid: false,
                errors,
                warnings: [],
                score: 50,
                metadata: {
                    templateId: 'test',
                    templateVersion: '1.0.0',
                    validationTime: 100,
                    rulesExecuted: 1,
                    rulesSkipped: 0,
                    timestamp: Date.now()
                }
            };

            const result = errorHandler.analyzeErrors(validationResult, mockContext, mockRetryContext);

            expect(result.shouldRetry).toBe(false);
            expect(result.action).toBe(ErrorRecoveryAction.TEMPLATE_FALLBACK);
            expect(result.reason).toContain('Max retries exceeded');
        });

        it('should prioritize critical errors over warnings', () => {
            const errors: ValidationError[] = [
                {
                    id: 'warning-1',
                    type: ValidationErrorType.CULTURAL_DATA_INCONSISTENT,
                    field: 'culturalData',
                    message: 'Cultural data inconsistency',
                    severity: ValidationSeverity.WARNING
                },
                {
                    id: 'error-1',
                    type: ValidationErrorType.REQUIRED_FIELD_MISSING,
                    field: 'name',
                    message: 'Name is required',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const validationResult: ValidationResult = {
                isValid: false,
                errors,
                warnings: [],
                score: 40,
                metadata: {
                    templateId: 'test',
                    templateVersion: '1.0.0',
                    validationTime: 100,
                    rulesExecuted: 1,
                    rulesSkipped: 0,
                    timestamp: Date.now()
                }
            };

            const result = errorHandler.analyzeErrors(validationResult, mockContext, mockRetryContext);

            expect(result.shouldRetry).toBe(true);
            expect(result.action).toBe(ErrorRecoveryAction.GUIDED_REGENERATION);
            expect(result.enhancedPrompt).toContain('MISSING FIELDS');
        });
    });

    describe('calculateRetryDelay', () => {
        it('should calculate exponential backoff correctly', () => {
            const delay1 = errorHandler.calculateRetryDelay(1);
            const delay2 = errorHandler.calculateRetryDelay(2);
            const delay3 = errorHandler.calculateRetryDelay(3);

            expect(delay1).toBeGreaterThanOrEqual(750); // ~1000ms with jitter
            expect(delay1).toBeLessThanOrEqual(1250);
            
            expect(delay2).toBeGreaterThanOrEqual(1500); // ~2000ms with jitter
            expect(delay2).toBeLessThanOrEqual(2500);
            
            expect(delay3).toBeGreaterThanOrEqual(3000); // ~4000ms with jitter
            expect(delay3).toBeLessThanOrEqual(5000);
        });

        it('should respect minimum delay', () => {
            const customStrategy: RetryStrategy = {
                maxRetries: 3,
                backoffMultiplier: 1,
                retryableErrors: [],
                enhancePromptOnRetry: true,
                fallbackAfterMaxRetries: true,
                retryDelay: 50 // Very small base delay
            };

            const delay = errorHandler.calculateRetryDelay(1, customStrategy);
            expect(delay).toBeGreaterThanOrEqual(100); // Minimum 100ms
        });

        it('should use custom backoff multiplier', () => {
            const customStrategy: RetryStrategy = {
                maxRetries: 3,
                backoffMultiplier: 3,
                retryableErrors: [],
                enhancePromptOnRetry: true,
                fallbackAfterMaxRetries: true,
                retryDelay: 1000
            };

            const delay1 = errorHandler.calculateRetryDelay(1, customStrategy);
            const delay2 = errorHandler.calculateRetryDelay(2, customStrategy);

            // Second delay should be roughly 3x the first (accounting for jitter)
            expect(delay2).toBeGreaterThan(delay1 * 2);
        });
    });

    describe('createEnhancedPrompt', () => {
        it('should create specific guidance for structure errors', () => {
            const errors: ValidationError[] = [{
                id: 'structure-error-1',
                type: ValidationErrorType.STRUCTURE_INVALID,
                field: 'demographics',
                message: 'Invalid structure',
                severity: ValidationSeverity.ERROR
            }];

            const prompt = errorHandler.createEnhancedPrompt(errors, mockContext, 1);

            expect(prompt).toContain('STRUCTURE ISSUE');
            expect(prompt).toContain('demographics');
            expect(prompt).toContain('JSON follows the exact schema');
        });

        it('should create specific guidance for missing field errors', () => {
            const errors: ValidationError[] = [{
                id: 'missing-field-1',
                type: ValidationErrorType.REQUIRED_FIELD_MISSING,
                field: 'name',
                message: 'Name is required',
                severity: ValidationSeverity.ERROR
            }];

            const prompt = errorHandler.createEnhancedPrompt(errors, mockContext, 1);

            expect(prompt).toContain('MISSING FIELDS');
            expect(prompt).toContain('name');
            expect(prompt).toContain('mandatory fields');
        });

        it('should include attempt information for retries', () => {
            const errors: ValidationError[] = [{
                id: 'error-1',
                type: ValidationErrorType.FORMAT_INVALID,
                field: 'email',
                message: 'Invalid format',
                severity: ValidationSeverity.ERROR
            }];

            const prompt = errorHandler.createEnhancedPrompt(errors, mockContext, 2);

            expect(prompt).toContain('This is attempt 2');
            expect(prompt).toContain('previous attempts');
        });

        it('should handle multiple error types', () => {
            const errors: ValidationError[] = [
                {
                    id: 'structure-error-1',
                    type: ValidationErrorType.STRUCTURE_INVALID,
                    field: 'root',
                    message: 'Invalid structure',
                    severity: ValidationSeverity.ERROR
                },
                {
                    id: 'format-error-1',
                    type: ValidationErrorType.FORMAT_INVALID,
                    field: 'email',
                    message: 'Invalid email',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const prompt = errorHandler.createEnhancedPrompt(errors, mockContext, 1);

            expect(prompt).toContain('STRUCTURE ISSUE');
            expect(prompt).toContain('FORMAT ERRORS');
        });
    });

    describe('isRetryableError', () => {
        it('should identify retryable errors correctly', () => {
            expect(errorHandler.isRetryableError(ValidationErrorType.FORMAT_INVALID)).toBe(true);
            expect(errorHandler.isRetryableError(ValidationErrorType.VALUE_OUT_OF_RANGE)).toBe(true);
            expect(errorHandler.isRetryableError(ValidationErrorType.STRUCTURE_INVALID)).toBe(true);
            expect(errorHandler.isRetryableError(ValidationErrorType.REQUIRED_FIELD_MISSING)).toBe(true);
        });

        it('should identify non-retryable errors correctly', () => {
            expect(errorHandler.isRetryableError(ValidationErrorType.TEMPLATE_NOT_FOUND)).toBe(false);
        });
    });

    describe('detectRecurringErrors', () => {
        it('should detect errors that appear in multiple attempts', () => {
            const currentErrors: ValidationError[] = [
                {
                    id: 'error-1',
                    type: ValidationErrorType.FORMAT_INVALID,
                    field: 'email',
                    message: 'Invalid email',
                    severity: ValidationSeverity.ERROR
                },
                {
                    id: 'error-2',
                    type: ValidationErrorType.REQUIRED_FIELD_MISSING,
                    field: 'name',
                    message: 'Name missing',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const previousErrors: ValidationError[] = [
                {
                    id: 'prev-error-1',
                    type: ValidationErrorType.FORMAT_INVALID,
                    field: 'email',
                    message: 'Invalid email format',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const recurring = errorHandler.detectRecurringErrors(currentErrors, previousErrors);

            expect(recurring).toHaveLength(1);
            expect(recurring[0].type).toBe(ValidationErrorType.FORMAT_INVALID);
            expect(recurring[0].field).toBe('email');
        });

        it('should return empty array when no recurring errors', () => {
            const currentErrors: ValidationError[] = [
                {
                    id: 'error-1',
                    type: ValidationErrorType.FORMAT_INVALID,
                    field: 'email',
                    message: 'Invalid email',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const previousErrors: ValidationError[] = [
                {
                    id: 'prev-error-1',
                    type: ValidationErrorType.REQUIRED_FIELD_MISSING,
                    field: 'name',
                    message: 'Name missing',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const recurring = errorHandler.detectRecurringErrors(currentErrors, previousErrors);

            expect(recurring).toHaveLength(0);
        });
    });

    describe('suggestTemplateEscalation', () => {
        it('should escalate B2B to Standard when many structural errors', () => {
            const errors: ValidationError[] = [
                {
                    id: 'error-1',
                    type: ValidationErrorType.STRUCTURE_INVALID,
                    field: 'root',
                    message: 'Invalid structure',
                    severity: ValidationSeverity.ERROR
                },
                {
                    id: 'error-2',
                    type: ValidationErrorType.REQUIRED_FIELD_MISSING,
                    field: 'name',
                    message: 'Name missing',
                    severity: ValidationSeverity.ERROR
                },
                {
                    id: 'error-3',
                    type: ValidationErrorType.BUSINESS_RULE_VIOLATION,
                    field: 'industry',
                    message: 'Invalid industry',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const suggestion = errorHandler.suggestTemplateEscalation(errors, PersonaType.B2B, 1);

            expect(suggestion).toBe(PersonaType.STANDARD);
        });

        it('should escalate Standard to Simple when many structural errors', () => {
            const errors: ValidationError[] = [
                {
                    id: 'error-1',
                    type: ValidationErrorType.STRUCTURE_INVALID,
                    field: 'root',
                    message: 'Invalid structure',
                    severity: ValidationSeverity.ERROR
                },
                {
                    id: 'error-2',
                    type: ValidationErrorType.REQUIRED_FIELD_MISSING,
                    field: 'name',
                    message: 'Name missing',
                    severity: ValidationSeverity.ERROR
                },
                {
                    id: 'error-3',
                    type: ValidationErrorType.BUSINESS_RULE_VIOLATION,
                    field: 'occupation',
                    message: 'Invalid occupation',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const suggestion = errorHandler.suggestTemplateEscalation(errors, PersonaType.STANDARD, 1);

            expect(suggestion).toBe(PersonaType.SIMPLE);
        });

        it('should return null when already at simplest template', () => {
            const errors: ValidationError[] = [
                {
                    id: 'error-1',
                    type: ValidationErrorType.STRUCTURE_INVALID,
                    field: 'root',
                    message: 'Invalid structure',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const suggestion = errorHandler.suggestTemplateEscalation(errors, PersonaType.SIMPLE, 1);

            expect(suggestion).toBeNull();
        });

        it('should escalate on second attempt even with fewer errors', () => {
            const errors: ValidationError[] = [
                {
                    id: 'error-1',
                    type: ValidationErrorType.STRUCTURE_INVALID,
                    field: 'root',
                    message: 'Invalid structure',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const suggestion = errorHandler.suggestTemplateEscalation(errors, PersonaType.B2B, 2);

            expect(suggestion).toBe(PersonaType.STANDARD);
        });

        it('should not escalate with few non-structural errors', () => {
            const errors: ValidationError[] = [
                {
                    id: 'error-1',
                    type: ValidationErrorType.FORMAT_INVALID,
                    field: 'email',
                    message: 'Invalid email',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const suggestion = errorHandler.suggestTemplateEscalation(errors, PersonaType.B2B, 1);

            expect(suggestion).toBeNull();
        });
    });

    describe('custom retry strategy', () => {
        it('should use custom retry strategy when provided', () => {
            const customStrategy = {
                maxRetries: 5,
                retryDelay: 500
            };

            const customErrorHandler = new ValidationErrorHandler(customStrategy);
            
            const delay = customErrorHandler.calculateRetryDelay(1);
            
            // Should use custom base delay (500ms) instead of default (1000ms)
            expect(delay).toBeGreaterThanOrEqual(375); // ~500ms with jitter
            expect(delay).toBeLessThanOrEqual(625);
        });
    });
});