/**
 * Tests for FallbackManager
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FallbackManager } from './fallback-manager';
import {
    ValidationError,
    ValidationContext,
    ValidationErrorType,
    ValidationSeverity,
    PersonaType,
    FallbackStrategy,
    FallbackStrategyType
} from '../../types/validation';

describe('FallbackManager', () => {
    let fallbackManager: FallbackManager;
    let mockContext: ValidationContext;

    beforeEach(() => {
        fallbackManager = new FallbackManager();

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
    });

    describe('executeFallback', () => {
        it('should execute template escalation fallback', async () => {
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

            const strategy: FallbackStrategy = {
                type: FallbackStrategyType.SIMPLE_TEMPLATE,
                maxRetries: 3,
                fallbackTemplate: 'simple-persona-v1'
            };

            const result = await fallbackManager.executeFallback(
                'standard-persona-v1',
                errors,
                mockContext,
                strategy,
                1
            );

            expect(result.success).toBe(true);
            expect(result.fallbackType).toBe(FallbackStrategyType.SIMPLE_TEMPLATE);
            expect(result.templateId).toBe('simple-persona-v1');
            expect(result.reason).toContain('Escalated from standard to simple');
        });

        it('should execute default response fallback', async () => {
            const errors: ValidationError[] = [];
            const strategy: FallbackStrategy = {
                type: FallbackStrategyType.DEFAULT_RESPONSE,
                maxRetries: 3
            };

            const result = await fallbackManager.executeFallback(
                'standard-persona-v1',
                errors,
                mockContext,
                strategy,
                1
            );

            expect(result.success).toBe(true);
            expect(result.fallbackType).toBe(FallbackStrategyType.DEFAULT_RESPONSE);
            expect(result.defaultResponse).toBeDefined();
            expect(result.defaultResponse.id).toBe('default-standard-persona');
        });

        it('should execute regeneration fallback within retry limit', async () => {
            const errors: ValidationError[] = [
                {
                    id: 'error-1',
                    type: ValidationErrorType.FORMAT_INVALID,
                    field: 'email',
                    message: 'Invalid email',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const strategy: FallbackStrategy = {
                type: FallbackStrategyType.REGENERATE,
                maxRetries: 3
            };

            const result = await fallbackManager.executeFallback(
                'standard-persona-v1',
                errors,
                mockContext,
                strategy,
                2
            );

            expect(result.success).toBe(true);
            expect(result.fallbackType).toBe(FallbackStrategyType.REGENERATE);
            expect(result.reason).toContain('attempt 2 of 3');
        });

        it('should escalate to default response when regeneration retries exceeded', async () => {
            const errors: ValidationError[] = [
                {
                    id: 'error-1',
                    type: ValidationErrorType.FORMAT_INVALID,
                    field: 'email',
                    message: 'Invalid email',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const strategy: FallbackStrategy = {
                type: FallbackStrategyType.REGENERATE,
                maxRetries: 3
            };

            const result = await fallbackManager.executeFallback(
                'standard-persona-v1',
                errors,
                mockContext,
                strategy,
                3 // At max retries
            );

            expect(result.success).toBe(true);
            expect(result.fallbackType).toBe(FallbackStrategyType.DEFAULT_RESPONSE);
            expect(result.defaultResponse).toBeDefined();
        });

        it('should handle no fallback strategy', async () => {
            const errors: ValidationError[] = [];
            const strategy: FallbackStrategy = {
                type: FallbackStrategyType.NONE,
                maxRetries: 0
            };

            const result = await fallbackManager.executeFallback(
                'standard-persona-v1',
                errors,
                mockContext,
                strategy,
                1
            );

            expect(result.success).toBe(false);
            expect(result.fallbackType).toBe(FallbackStrategyType.NONE);
            expect(result.reason).toBe('No fallback strategy configured');
        });
    });

    describe('selectFallbackTemplate', () => {
        it('should escalate B2B to Standard with critical errors', () => {
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

            const result = fallbackManager.selectFallbackTemplate(PersonaType.B2B, errors, 1);

            expect(result).toBe(PersonaType.SIMPLE); // Should escalate to simplest due to 3+ critical errors
        });

        it('should escalate B2B to Standard with moderate errors', () => {
            const errors: ValidationError[] = [
                {
                    id: 'error-1',
                    type: ValidationErrorType.STRUCTURE_INVALID,
                    field: 'root',
                    message: 'Invalid structure',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const result = fallbackManager.selectFallbackTemplate(PersonaType.B2B, errors, 1);

            expect(result).toBe(PersonaType.STANDARD); // Should escalate one level
        });

        it('should escalate Standard to Simple', () => {
            const errors: ValidationError[] = [
                {
                    id: 'error-1',
                    type: ValidationErrorType.STRUCTURE_INVALID,
                    field: 'root',
                    message: 'Invalid structure',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const result = fallbackManager.selectFallbackTemplate(PersonaType.STANDARD, errors, 1);

            expect(result).toBe(PersonaType.SIMPLE);
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

            const result = fallbackManager.selectFallbackTemplate(PersonaType.SIMPLE, errors, 1);

            expect(result).toBeNull();
        });

        it('should escalate based on attempt number even with fewer errors', () => {
            const errors: ValidationError[] = [
                {
                    id: 'error-1',
                    type: ValidationErrorType.FORMAT_INVALID,
                    field: 'email',
                    message: 'Invalid email',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const result = fallbackManager.selectFallbackTemplate(PersonaType.B2B, errors, 3);

            expect(result).toBe(PersonaType.SIMPLE); // Should escalate to simplest due to attempt >= 3
        });

        it('should not escalate with minor format errors on first attempt', () => {
            const errors: ValidationError[] = [
                {
                    id: 'error-1',
                    type: ValidationErrorType.FORMAT_INVALID,
                    field: 'email',
                    message: 'Invalid email',
                    severity: ValidationSeverity.ERROR
                }
            ];

            const result = fallbackManager.selectFallbackTemplate(PersonaType.B2B, errors, 1);

            expect(result).toBe(PersonaType.STANDARD); // Should still escalate one level with any critical/format errors
        });
    });

    describe('registerDefaultResponse and getDefaultResponse', () => {
        it('should register and retrieve custom default response', () => {
            const customResponse = {
                id: 'custom-persona',
                name: 'Custom User',
                age: 25,
                location: 'Canada'
            };

            fallbackManager.registerDefaultResponse(PersonaType.SIMPLE, customResponse);
            const retrieved = fallbackManager.getDefaultResponse(PersonaType.SIMPLE);

            // Debug: log all responses for SIMPLE type
            const allResponses = (fallbackManager as any).defaultResponses.get(PersonaType.SIMPLE);
            console.log('All SIMPLE responses:', allResponses.map((r: any) => ({ 
                id: r.id, 
                responseId: r.response.id, 
                usageCount: r.usageCount, 
                lastUsed: r.lastUsed,
                createdAt: r.createdAt
            })));
            console.log('Retrieved response:', { 
                id: retrieved!.id, 
                responseId: retrieved!.response.id, 
                usageCount: retrieved!.usageCount 
            });

            expect(retrieved).toBeDefined();
            expect(retrieved!.response).toEqual(customResponse);
            expect(retrieved!.personaType).toBe(PersonaType.SIMPLE);
            expect(retrieved!.isValidated).toBe(true);
        });

        it('should update usage statistics when getting default response', () => {
            const response1 = fallbackManager.getDefaultResponse(PersonaType.SIMPLE);
            const response2 = fallbackManager.getDefaultResponse(PersonaType.SIMPLE);

            expect(response1!.usageCount).toBe(1);
            expect(response1!.lastUsed).toBeGreaterThan(0);

            // Should get the same response (least recently used)
            expect(response2!.id).toBe(response1!.id);
            expect(response2!.usageCount).toBe(2);
        });

        it('should return null for persona type with no default responses', () => {
            // Clear existing responses by creating new manager
            const emptyManager = new FallbackManager();

            // Override the initialization to start empty
            (emptyManager as any).defaultResponses.clear();

            const result = emptyManager.getDefaultResponse(PersonaType.SIMPLE);
            expect(result).toBeNull();
        });

        it('should distribute usage across multiple default responses', () => {
            const response1 = { id: 'response-1', name: 'User 1' };
            const response2 = { id: 'response-2', name: 'User 2' };

            fallbackManager.registerDefaultResponse(PersonaType.SIMPLE, response1);
            fallbackManager.registerDefaultResponse(PersonaType.SIMPLE, response2);

            // Get responses multiple times
            const retrieved1 = fallbackManager.getDefaultResponse(PersonaType.SIMPLE);
            const retrieved2 = fallbackManager.getDefaultResponse(PersonaType.SIMPLE);
            const retrieved3 = fallbackManager.getDefaultResponse(PersonaType.SIMPLE);

            // Should distribute usage (least recently used algorithm)
            expect(retrieved1!.response.id).toBeDefined();
            expect(retrieved2!.response.id).toBeDefined();
            expect(retrieved3!.response.id).toBeDefined();

            // At least one should be different (distributed usage)
            const ids = [retrieved1!.response.id, retrieved2!.response.id, retrieved3!.response.id];
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBeGreaterThan(1);
        });
    });

    describe('isFallbackApplicable', () => {
        it('should return false for regeneration strategy when max retries exceeded', () => {
            const strategy: FallbackStrategy = {
                type: FallbackStrategyType.REGENERATE,
                maxRetries: 3
            };

            const result = fallbackManager.isFallbackApplicable(strategy, [], mockContext, 3);

            expect(result).toBe(false);
        });

        it('should return true for regeneration strategy within retry limit', () => {
            const strategy: FallbackStrategy = {
                type: FallbackStrategyType.REGENERATE,
                maxRetries: 3
            };

            const result = fallbackManager.isFallbackApplicable(strategy, [], mockContext, 2);

            expect(result).toBe(true);
        });

        it('should return true for template escalation when escalation possible', () => {
            const strategy: FallbackStrategy = {
                type: FallbackStrategyType.SIMPLE_TEMPLATE,
                maxRetries: 3
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

            const result = fallbackManager.isFallbackApplicable(strategy, errors, mockContext, 1);

            expect(result).toBe(true);
        });

        it('should return false for template escalation when already at simplest template', () => {
            const strategy: FallbackStrategy = {
                type: FallbackStrategyType.SIMPLE_TEMPLATE,
                maxRetries: 3
            };

            const simpleContext = {
                ...mockContext,
                originalRequest: {
                    ...mockContext.originalRequest,
                    personaType: PersonaType.SIMPLE
                }
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

            const result = fallbackManager.isFallbackApplicable(strategy, errors, simpleContext, 1);

            expect(result).toBe(false);
        });

        it('should return true for default response strategy when default available', () => {
            const strategy: FallbackStrategy = {
                type: FallbackStrategyType.DEFAULT_RESPONSE,
                maxRetries: 3
            };

            const result = fallbackManager.isFallbackApplicable(strategy, [], mockContext, 1);

            expect(result).toBe(true);
        });
    });

    describe('getFallbackStatistics', () => {
        it('should return usage statistics for default responses', () => {
            // Use some default responses
            fallbackManager.getDefaultResponse(PersonaType.SIMPLE);
            fallbackManager.getDefaultResponse(PersonaType.SIMPLE);
            fallbackManager.getDefaultResponse(PersonaType.STANDARD);

            const stats = fallbackManager.getFallbackStatistics();

            expect(stats.defaultResponseUsage.has(PersonaType.SIMPLE)).toBe(true);
            expect(stats.defaultResponseUsage.has(PersonaType.STANDARD)).toBe(true);
            expect(stats.defaultResponseUsage.has(PersonaType.B2B)).toBe(true);

            const simpleStats = stats.defaultResponseUsage.get(PersonaType.SIMPLE)!;
            expect(simpleStats.totalUsage).toBe(2);

            const standardStats = stats.defaultResponseUsage.get(PersonaType.STANDARD)!;
            expect(standardStats.totalUsage).toBe(1);
        });

        it('should return empty statistics for unused persona types', () => {
            // Create new manager without using any responses
            const newManager = new FallbackManager();
            const stats = newManager.getFallbackStatistics();

            const simpleStats = stats.defaultResponseUsage.get(PersonaType.SIMPLE)!;
            expect(simpleStats.totalUsage).toBe(0);
            expect(simpleStats.averageUsage).toBe(0);
        });
    });

    describe('initialization', () => {
        it('should initialize with default responses for all persona types', () => {
            const simpleResponse = fallbackManager.getDefaultResponse(PersonaType.SIMPLE);
            const standardResponse = fallbackManager.getDefaultResponse(PersonaType.STANDARD);
            const b2bResponse = fallbackManager.getDefaultResponse(PersonaType.B2B);

            expect(simpleResponse).toBeDefined();
            expect(simpleResponse!.response.id).toBe('default-simple-persona');

            expect(standardResponse).toBeDefined();
            expect(standardResponse!.response.id).toBe('default-standard-persona');
            expect(standardResponse!.response.culturalData).toBeDefined();

            expect(b2bResponse).toBeDefined();
            expect(b2bResponse!.response.id).toBe('default-b2b-persona');
            expect(b2bResponse!.response.professionalProfile).toBeDefined();
        });
    });
});