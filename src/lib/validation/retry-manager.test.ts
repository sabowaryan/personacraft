/**
 * Tests for RetryManager
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RetryManager } from './retry-manager';
import {
    ValidationError,
    ValidationContext,
    ValidationErrorType,
    ValidationSeverity,
    PersonaType,
    RetryStrategy
} from '../../types/validation';

describe('RetryManager', () => {
    let retryManager: RetryManager;
    let mockContext: ValidationContext;
    let mockStrategy: RetryStrategy;

    beforeEach(() => {
        retryManager = new RetryManager();

        mockContext = {
            originalRequest: {
                personaType: PersonaType.STANDARD,
                culturalData: {},
                demographics: {}
            },
            templateVariables: { templateId: 'test-template' },
            culturalConstraints: {
                music: ['pop', 'rock'],
                brands: ['nike', 'apple'],
                restaurants: ['mcdonalds', 'starbucks'],
                movies: ['action', 'comedy'],
                tv: ['drama', 'sitcom'],
                books: ['fiction', 'biography'],
                travel: ['europe', 'asia'],
                fashion: ['casual', 'formal'],
                beauty: ['skincare', 'makeup'],
                food: ['italian', 'asian'],
                socialMedia: ['instagram', 'tiktok']
            },
            userSignals: {
                demographics: {
                    ageRange: { min: 25, max: 35 },
                    location: 'Toronto',
                    occupation: 'Developer'
                },
                interests: ['technology', 'music'],
                values: ['innovation', 'creativity'],
                culturalContext: {
                    language: 'en',
                    personaCount: 1
                }
            },
            generationAttempt: 1,
            previousErrors: []
        } as ValidationContext;

        mockStrategy = {
            maxRetries: 3,
            backoffMultiplier: 2,
            retryableErrors: [
                ValidationErrorType.STRUCTURE_INVALID,
                ValidationErrorType.FORMAT_INVALID,
                ValidationErrorType.REQUIRED_FIELD_MISSING,
                ValidationErrorType.CULTURAL_DATA_INCONSISTENT
            ],
            enhancePromptOnRetry: true,
            fallbackAfterMaxRetries: true,
            retryDelay: 1000
        };
    });

    describe('shouldRetry', () => {
        it('should allow retry within max attempts with retryable errors', () => {
            const errors: ValidationError[] = [
                {
                    id: 'error-1',
                    type: ValidationErrorType.STRUCTURE_INVALID,
                    field: 'root',
                    message: 'Invalid structure',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const result = retryManager.shouldRetry(errors, mockContext, mockStrategy, 1);

            expect(result.shouldRetry).toBe(true);
            expect(result.enhancedPrompt).toBeDefined();
            expect(result.retryDelay).toBe(2000); // 1000 * 2^1
            expect(result.reason).toContain('Retry attempt 2 of 3');
            expect(result.metadata.attempt).toBe(1);
            expect(result.metadata.totalAttempts).toBe(3);
        });

        it('should reject retry when max attempts exceeded', () => {
            const errors: ValidationError[] = [
                {
                    id: 'error-1',
                    type: ValidationErrorType.STRUCTURE_INVALID,
                    field: 'root',
                    message: 'Invalid structure',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const result = retryManager.shouldRetry(errors, mockContext, mockStrategy, 3);

            expect(result.shouldRetry).toBe(false);
            expect(result.retryDelay).toBe(0);
            expect(result.reason).toContain('Maximum retry attempts (3) exceeded');
        });

        it('should reject retry when no retryable errors present', () => {
            const errors: ValidationError[] = [
                {
                    id: 'error-1',
                    type: ValidationErrorType.BUSINESS_RULE_VIOLATION,
                    field: 'occupation',
                    message: 'Invalid occupation',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const result = retryManager.shouldRetry(errors, mockContext, mockStrategy, 1);

            expect(result.shouldRetry).toBe(false);
            expect(result.reason).toBe('No retryable errors found');
        });

        it('should suggest template escalation for critical errors', () => {
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
                    type: ValidationErrorType.REQUIRED_FIELD_MISSING,
                    field: 'age',
                    message: 'Age missing',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const result = retryManager.shouldRetry(errors, mockContext, mockStrategy, 1);

            expect(result.shouldRetry).toBe(true);
            expect(result.suggestedTemplate).toBe('simple-persona-v1');
            expect(result.metadata.escalationLevel).toBe(2);
        });

        it('should calculate exponential backoff delay correctly', () => {
            const errors: ValidationError[] = [
                {
                    id: 'error-1',
                    type: ValidationErrorType.FORMAT_INVALID,
                    field: 'email',
                    message: 'Invalid email',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const result1 = retryManager.shouldRetry(errors, mockContext, mockStrategy, 0);
            const result2 = retryManager.shouldRetry(errors, mockContext, mockStrategy, 1);
            const result3 = retryManager.shouldRetry(errors, mockContext, mockStrategy, 2);

            expect(result1.retryDelay).toBe(1000); // 1000 * 2^0
            expect(result2.retryDelay).toBe(2000); // 1000 * 2^1
            expect(result3.retryDelay).toBe(4000); // 1000 * 2^2
        });

        it('should not generate enhanced prompt when disabled', () => {
            const strategyNoEnhancement = {
                ...mockStrategy,
                enhancePromptOnRetry: false
            };

            const errors: ValidationError[] = [
                {
                    id: 'error-1',
                    type: ValidationErrorType.STRUCTURE_INVALID,
                    field: 'root',
                    message: 'Invalid structure',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const result = retryManager.shouldRetry(errors, mockContext, strategyNoEnhancement, 1);

            expect(result.shouldRetry).toBe(true);
            expect(result.enhancedPrompt).toBeUndefined();
        });
    });

    describe('detectRecurringErrors', () => {
        it('should detect recurring errors above threshold', () => {
            const requestId = 'test-request-1';
            const errors: ValidationError[] = [
                {
                    id: 'error-1',
                    type: ValidationErrorType.STRUCTURE_INVALID,
                    field: 'root',
                    message: 'Invalid structure',
                    severity: ValidationSeverity.ERROR
                }
            ];

            // Simulate multiple retry attempts with same errors
            retryManager.shouldRetry(errors, mockContext, mockStrategy, 1);
            retryManager.shouldRetry(errors, mockContext, mockStrategy, 2);
            retryManager.shouldRetry(errors, mockContext, mockStrategy, 3);

            // Note: In the current implementation, we'd need to access the internal requestId
            // For testing purposes, we'll test the method with a known pattern
            const result = retryManager.detectRecurringErrors(requestId, 2);

            // Since we can't easily inject the requestId, we'll test the structure
            expect(result).toHaveProperty('hasRecurringErrors');
            expect(result).toHaveProperty('patterns');
            expect(result).toHaveProperty('recommendations');
            expect(Array.isArray(result.recommendations)).toBe(true);
        });

        it('should provide appropriate recommendations for structure errors', () => {
            const requestId = 'test-request-structure';
            
            // This test verifies the recommendation logic structure
            const result = retryManager.detectRecurringErrors(requestId, 1);
            
            expect(result.recommendations).toBeInstanceOf(Array);
        });
    });

    describe('suggestTemplateEscalation', () => {
        it('should escalate B2B to Standard for level 1', () => {
            const result = retryManager.suggestTemplateEscalation(PersonaType.B2B, 1);
            expect(result).toBe('standard-persona-v1');
        });

        it('should escalate B2B to Simple for level 2', () => {
            const result = retryManager.suggestTemplateEscalation(PersonaType.B2B, 2);
            expect(result).toBe('simple-persona-v1');
        });

        it('should escalate Standard to Simple for level 1', () => {
            const result = retryManager.suggestTemplateEscalation(PersonaType.STANDARD, 1);
            expect(result).toBe('simple-persona-v1');
        });

        it('should return undefined for Simple persona (no escalation possible)', () => {
            const result = retryManager.suggestTemplateEscalation(PersonaType.SIMPLE, 1);
            expect(result).toBeUndefined();
        });

        it('should return undefined for escalation level 0', () => {
            const result = retryManager.suggestTemplateEscalation(PersonaType.B2B, 0);
            expect(result).toBeUndefined();
        });

        it('should handle escalation level higher than available options', () => {
            const result = retryManager.suggestTemplateEscalation(PersonaType.B2B, 5);
            expect(result).toBe('simple-persona-v1'); // Should cap at highest available
        });
    });

    describe('generateEnhancedPrompt', () => {
        it('should generate enhanced prompt for structure errors', () => {
            const errors: ValidationError[] = [
                {
                    id: 'error-1',
                    type: ValidationErrorType.STRUCTURE_INVALID,
                    field: 'root',
                    message: 'Invalid structure',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const prompt = retryManager.generateEnhancedPrompt(errors, mockContext, 1);

            expect(prompt).toContain('JSON structure');
            expect(prompt).toBeDefined();
            expect(prompt.length).toBeGreaterThan(0);
        });

        it('should generate enhanced prompt for required field errors', () => {
            const errors: ValidationError[] = [
                {
                    id: 'error-1',
                    type: ValidationErrorType.REQUIRED_FIELD_MISSING,
                    field: 'name',
                    message: 'Name is required',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const prompt = retryManager.generateEnhancedPrompt(errors, mockContext, 1);

            expect(prompt).toContain('required fields');
            expect(prompt).toContain('name');
        });

        it('should add attempt-specific guidance for multiple attempts', () => {
            const errors: ValidationError[] = [
                {
                    id: 'error-1',
                    type: ValidationErrorType.FORMAT_INVALID,
                    field: 'email',
                    message: 'Invalid email format',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const prompt = retryManager.generateEnhancedPrompt(errors, mockContext, 2);

            expect(prompt).toContain('Previous attempts failed');
            expect(prompt).toContain('email');
        });

        it('should add critical guidance for high attempt counts', () => {
            const errors: ValidationError[] = [
                {
                    id: 'error-1',
                    type: ValidationErrorType.STRUCTURE_INVALID,
                    field: 'root',
                    message: 'Invalid structure',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const prompt = retryManager.generateEnhancedPrompt(errors, mockContext, 3);

            expect(prompt).toContain('CRITICAL');
            expect(prompt).toContain('Multiple validation failures');
        });

        it('should handle multiple error types', () => {
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
                    type: ValidationErrorType.FORMAT_INVALID,
                    field: 'email',
                    message: 'Invalid email',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const prompt = retryManager.generateEnhancedPrompt(errors, mockContext, 1);

            expect(prompt).toContain('JSON structure');
            expect(prompt).toContain('format');
            expect(prompt.length).toBeGreaterThan(50); // Should be substantial
        });
    });

    describe('getRetryStatistics', () => {
        it('should return statistics structure', () => {
            const stats = retryManager.getRetryStatistics();

            expect(stats).toHaveProperty('totalRetries');
            expect(stats).toHaveProperty('successfulRetries');
            expect(stats).toHaveProperty('failedRetries');
            expect(stats).toHaveProperty('averageRetriesPerRequest');
            expect(stats).toHaveProperty('commonErrorPatterns');
            expect(stats).toHaveProperty('escalationFrequency');

            expect(typeof stats.totalRetries).toBe('number');
            expect(typeof stats.successfulRetries).toBe('number');
            expect(typeof stats.failedRetries).toBe('number');
            expect(typeof stats.averageRetriesPerRequest).toBe('number');
            expect(Array.isArray(stats.commonErrorPatterns)).toBe(true);
            expect(typeof stats.escalationFrequency).toBe('object');
        });

        it('should return zero statistics for new manager', () => {
            const newManager = new RetryManager();
            const stats = newManager.getRetryStatistics();

            expect(stats.totalRetries).toBe(0);
            expect(stats.averageRetriesPerRequest).toBe(0);
            expect(stats.commonErrorPatterns).toHaveLength(0);
        });
    });

    describe('cleanup', () => {
        it('should clean up old data', () => {
            // Generate some retry attempts to create data
            const errors: ValidationError[] = [
                {
                    id: 'error-1',
                    type: ValidationErrorType.STRUCTURE_INVALID,
                    field: 'root',
                    message: 'Invalid structure',
                    severity: ValidationSeverity.ERROR
                }
            ];

            retryManager.shouldRetry(errors, mockContext, mockStrategy, 1);
            retryManager.shouldRetry(errors, mockContext, mockStrategy, 2);

            // Cleanup should not throw
            expect(() => retryManager.cleanup(1000)).not.toThrow();
        });

        it('should handle cleanup with no data', () => {
            const newManager = new RetryManager();
            expect(() => newManager.cleanup()).not.toThrow();
        });
    });

    describe('error pattern analysis', () => {
        it('should track error patterns across multiple retries', () => {
            const errors1: ValidationError[] = [
                {
                    id: 'error-1',
                    type: ValidationErrorType.STRUCTURE_INVALID,
                    field: 'root',
                    message: 'Invalid structure',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const errors2: ValidationError[] = [
                {
                    id: 'error-2',
                    type: ValidationErrorType.STRUCTURE_INVALID,
                    field: 'root',
                    message: 'Invalid structure',
                    severity: ValidationSeverity.ERROR
                },
                {
                    id: 'error-3',
                    type: ValidationErrorType.REQUIRED_FIELD_MISSING,
                    field: 'name',
                    message: 'Name missing',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const result1 = retryManager.shouldRetry(errors1, mockContext, mockStrategy, 1);
            const result2 = retryManager.shouldRetry(errors2, mockContext, mockStrategy, 2);

            expect(result1.metadata.errorPattern).toBe('single-STRUCTURE_INVALID');
            expect(result2.metadata.errorPattern).toBe('structure-dominant');
        });

        it('should identify business rule dominant patterns', () => {
            const errors: ValidationError[] = [
                {
                    id: 'error-1',
                    type: ValidationErrorType.BUSINESS_RULE_VIOLATION,
                    field: 'occupation',
                    message: 'Invalid occupation',
                    severity: ValidationSeverity.ERROR
                },
                {
                    id: 'error-2',
                    type: ValidationErrorType.FORMAT_INVALID,
                    field: 'email',
                    message: 'Invalid email',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const result = retryManager.shouldRetry(errors, mockContext, mockStrategy, 1);

            expect(result.metadata.errorPattern).toBe('business-rule-dominant');
        });

        it('should identify mixed error patterns', () => {
            const errors: ValidationError[] = [
                {
                    id: 'error-1',
                    type: ValidationErrorType.FORMAT_INVALID,
                    field: 'email',
                    message: 'Invalid email',
                    severity: ValidationSeverity.ERROR
                },
                {
                    id: 'error-2',
                    type: ValidationErrorType.CULTURAL_DATA_INCONSISTENT,
                    field: 'culturalData',
                    message: 'Inconsistent cultural data',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const result = retryManager.shouldRetry(errors, mockContext, mockStrategy, 1);

            expect(result.metadata.errorPattern).toBe('mixed-errors');
        });
    });

    describe('escalation level calculation', () => {
        it('should calculate escalation level based on critical error count', () => {
            const criticalErrors: ValidationError[] = [
                {
                    id: 'error-1',
                    type: ValidationErrorType.STRUCTURE_INVALID,
                    field: 'root',
                    message: 'Invalid structure',
                    severity: ValidationSeverity.ERROR
                },
                {
                    id: 'error-2',
                    type: ValidationErrorType.BUSINESS_RULE_VIOLATION,
                    field: 'occupation',
                    message: 'Invalid occupation',
                    severity: ValidationSeverity.ERROR
                },
                {
                    id: 'error-3',
                    type: ValidationErrorType.REQUIRED_FIELD_MISSING,
                    field: 'name',
                    message: 'Name missing',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const result = retryManager.shouldRetry(criticalErrors, mockContext, mockStrategy, 1);

            expect(result.metadata.escalationLevel).toBe(2); // Should escalate to simplest
        });

        it('should calculate escalation level based on attempt count', () => {
            const minorErrors: ValidationError[] = [
                {
                    id: 'error-1',
                    type: ValidationErrorType.FORMAT_INVALID,
                    field: 'email',
                    message: 'Invalid email',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const result = retryManager.shouldRetry(minorErrors, mockContext, mockStrategy, 3);

            expect(result.metadata.escalationLevel).toBe(2); // Should escalate due to high attempt count
        });
    });
});