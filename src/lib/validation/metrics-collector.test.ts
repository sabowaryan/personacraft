/**
 * Tests for ValidationMetricsCollector
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    ValidationMetricsCollector,
    InMemoryMetricsStorage,
    MetricsStorage,
    MetricsQuery
} from './metrics-collector';
import {
    ValidationResult,
    ValidationContext,
    ValidationMetrics,
    ValidationError,
    ValidationWarning,
    ValidationMetadata,
    ValidationErrorType,
    ValidationSeverity,
    PersonaType
} from '../../types/validation';

// Mock data helpers
function createMockValidationResult(overrides: Partial<ValidationResult> = {}): ValidationResult {
    return {
        isValid: true,
        errors: [],
        warnings: [],
        score: 0.95,
        metadata: {
            templateId: 'test-template',
            templateVersion: '1.0.0',
            validationTime: 150,
            rulesExecuted: 5,
            rulesSkipped: 0,
            timestamp: Date.now()
        },
        ...overrides
    };
}

function createMockValidationContext(overrides: Partial<ValidationContext> = {}): ValidationContext {
    return {
        originalRequest: {
            personaType: PersonaType.STANDARD,
            culturalData: {},
            demographics: {},
            psychographics: {}
        },
        templateVariables: {},
        culturalConstraints: {} as any,
        userSignals: {} as any,
        generationAttempt: 1,
        previousErrors: [],
        ...overrides
    };
}

function createMockValidationError(overrides: Partial<ValidationError> = {}): ValidationError {
    return {
        id: 'test-error',
        type: ValidationErrorType.REQUIRED_FIELD_MISSING,
        field: 'testField',
        message: 'Test error message',
        severity: ValidationSeverity.ERROR,
        ...overrides
    };
}

describe('InMemoryMetricsStorage', () => {
    let storage: InMemoryMetricsStorage;

    beforeEach(() => {
        storage = new InMemoryMetricsStorage();
    });

    describe('store', () => {
        it('should store metrics successfully', async () => {
            const metrics: ValidationMetrics = {
                templateId: 'test-template',
                timestamp: Date.now(),
                validationTime: 100,
                isValid: true,
                errorCount: 0,
                warningCount: 0,
                score: 0.95,
                retryCount: 0,
                fallbackUsed: false,
                personaType: PersonaType.STANDARD,
                rulesExecuted: ['rule1', 'rule2'],
                rulesFailed: []
            };

            await expect(storage.store(metrics)).resolves.not.toThrow();
        });

        it('should handle storage limit by removing old metrics', async () => {
            const storage = new InMemoryMetricsStorage();

            // Store more than the limit (10000)
            const promises = [];
            for (let i = 0; i < 10005; i++) {
                const metrics: ValidationMetrics = {
                    templateId: 'test-template',
                    timestamp: Date.now() + i,
                    validationTime: 100,
                    isValid: true,
                    errorCount: 0,
                    warningCount: 0,
                    score: 0.95,
                    retryCount: 0,
                    fallbackUsed: false,
                    personaType: PersonaType.STANDARD,
                    rulesExecuted: ['rule1'],
                    rulesFailed: []
                };
                promises.push(storage.store(metrics));
            }

            await Promise.all(promises);

            // Should have exactly 10000 metrics (the limit)
            const now = Date.now();
            const allMetrics = await storage.getMetrics('test-template', 0, now + 20000);
            expect(allMetrics.length).toBe(10000);
        });
    });

    describe('getMetrics', () => {
        it('should retrieve metrics for specific template and time range', async () => {
            const now = Date.now();
            const metrics1: ValidationMetrics = {
                templateId: 'template1',
                timestamp: now - 1000,
                validationTime: 100,
                isValid: true,
                errorCount: 0,
                warningCount: 0,
                score: 0.95,
                retryCount: 0,
                fallbackUsed: false,
                personaType: PersonaType.STANDARD,
                rulesExecuted: ['rule1'],
                rulesFailed: []
            };

            const metrics2: ValidationMetrics = {
                templateId: 'template2',
                timestamp: now - 500,
                validationTime: 200,
                isValid: false,
                errorCount: 1,
                warningCount: 0,
                score: 0.5,
                retryCount: 1,
                fallbackUsed: true,
                personaType: PersonaType.B2B,
                rulesExecuted: ['rule1', 'rule2'],
                rulesFailed: ['rule2']
            };

            await storage.store(metrics1);
            await storage.store(metrics2);

            const retrieved = await storage.getMetrics('template1', now - 2000, now);
            expect(retrieved).toHaveLength(1);
            expect(retrieved[0].templateId).toBe('template1');
        });

        it('should return empty array for non-existent template', async () => {
            const now = Date.now();
            const retrieved = await storage.getMetrics('non-existent', now - 1000, now);
            expect(retrieved).toHaveLength(0);
        });
    });

    describe('getAggregatedMetrics', () => {
        it('should return null for template with no metrics', async () => {
            const result = await storage.getAggregatedMetrics('non-existent', '24h');
            expect(result).toBeNull();
        });

        it('should aggregate metrics correctly', async () => {
            const now = Date.now();

            // Store multiple metrics for the same template
            const metrics = [
                {
                    templateId: 'test-template',
                    timestamp: now - 1000,
                    validationTime: 100,
                    isValid: true,
                    errorCount: 0,
                    warningCount: 0,
                    score: 0.9,
                    retryCount: 0,
                    fallbackUsed: false,
                    personaType: PersonaType.STANDARD,
                    rulesExecuted: ['rule1'],
                    rulesFailed: []
                },
                {
                    templateId: 'test-template',
                    timestamp: now - 500,
                    validationTime: 200,
                    isValid: false,
                    errorCount: 1,
                    warningCount: 0,
                    score: 0.5,
                    retryCount: 1,
                    fallbackUsed: true,
                    personaType: PersonaType.STANDARD,
                    rulesExecuted: ['rule1', 'rule2'],
                    rulesFailed: ['required-fields']
                }
            ];

            for (const metric of metrics) {
                await storage.store(metric);
            }

            const aggregated = await storage.getAggregatedMetrics('test-template', '24h');

            expect(aggregated).not.toBeNull();
            expect(aggregated!.templateId).toBe('test-template');
            expect(aggregated!.totalValidations).toBe(2);
            expect(aggregated!.successRate).toBe(0.5); // 1 success out of 2
            expect(aggregated!.averageScore).toBe(0.7); // (0.9 + 0.5) / 2
            expect(aggregated!.averageValidationTime).toBe(150); // (100 + 200) / 2
            expect(aggregated!.fallbackUsageRate).toBe(0.5); // 1 fallback out of 2
        });
    });

    describe('cleanup', () => {
        it('should remove metrics older than specified time', async () => {
            const now = Date.now();
            const oldMetrics: ValidationMetrics = {
                templateId: 'test-template',
                timestamp: now - 10000, // 10 seconds ago
                validationTime: 100,
                isValid: true,
                errorCount: 0,
                warningCount: 0,
                score: 0.95,
                retryCount: 0,
                fallbackUsed: false,
                personaType: PersonaType.STANDARD,
                rulesExecuted: ['rule1'],
                rulesFailed: []
            };

            const newMetrics: ValidationMetrics = {
                ...oldMetrics,
                timestamp: now - 1000 // 1 second ago
            };

            await storage.store(oldMetrics);
            await storage.store(newMetrics);

            // Cleanup metrics older than 5 seconds
            await storage.cleanup(now - 5000);

            const remaining = await storage.getMetrics('test-template', 0, now);
            expect(remaining).toHaveLength(1);
            expect(remaining[0].timestamp).toBe(newMetrics.timestamp);
        });
    });
});

describe('ValidationMetricsCollector', () => {
    let collector: ValidationMetricsCollector;
    let mockStorage: MetricsStorage;

    beforeEach(() => {
        mockStorage = {
            store: vi.fn().mockResolvedValue(undefined),
            getMetrics: vi.fn().mockResolvedValue([]),
            getAggregatedMetrics: vi.fn().mockResolvedValue(null),
            cleanup: vi.fn().mockResolvedValue(undefined)
        };
        collector = new ValidationMetricsCollector(mockStorage);
    });

    describe('collectMetrics', () => {
        it('should collect metrics from validation result', async () => {
            const validationResult = createMockValidationResult({
                isValid: true,
                errors: [],
                warnings: [],
                score: 0.95
            });

            const context = createMockValidationContext({
                originalRequest: {
                    personaType: PersonaType.STANDARD,
                    culturalData: {},
                    demographics: {},
                    psychographics: {}
                }
            });

            await collector.collectMetrics(validationResult, context, 0, false);

            expect(mockStorage.store).toHaveBeenCalledWith(
                expect.objectContaining({
                    templateId: 'test-template',
                    isValid: true,
                    errorCount: 0,
                    warningCount: 0,
                    score: 0.95,
                    retryCount: 0,
                    fallbackUsed: false,
                    personaType: PersonaType.STANDARD
                })
            );
        });

        it('should collect metrics with errors and warnings', async () => {
            const error = createMockValidationError({
                id: 'required-fields-error',
                type: ValidationErrorType.REQUIRED_FIELD_MISSING
            });

            const warning: ValidationWarning = {
                id: 'test-warning',
                field: 'testField',
                message: 'Test warning',
                severity: ValidationSeverity.WARNING,
                suggestion: 'Fix this'
            };

            const validationResult = createMockValidationResult({
                isValid: false,
                errors: [error],
                warnings: [warning],
                score: 0.3
            });

            const context = createMockValidationContext();

            await collector.collectMetrics(validationResult, context, 2, true);

            expect(mockStorage.store).toHaveBeenCalledWith(
                expect.objectContaining({
                    isValid: false,
                    errorCount: 1,
                    warningCount: 1,
                    score: 0.3,
                    retryCount: 2,
                    fallbackUsed: true,
                    rulesFailed: ['required-fields-error']
                })
            );
        });

        it('should not collect metrics when disabled', async () => {
            collector.setEnabled(false);

            const validationResult = createMockValidationResult();
            const context = createMockValidationContext();

            await collector.collectMetrics(validationResult, context);

            expect(mockStorage.store).not.toHaveBeenCalled();
        });

        it('should handle storage errors gracefully', async () => {
            vi.mocked(mockStorage.store).mockRejectedValue(new Error('Storage error'));

            const validationResult = createMockValidationResult();
            const context = createMockValidationContext();

            // Should not throw
            await expect(collector.collectMetrics(validationResult, context)).resolves.not.toThrow();
        });
    });

    describe('getMetrics', () => {
        it('should retrieve metrics with query filters', async () => {
            const mockMetrics: ValidationMetrics[] = [
                {
                    templateId: 'test-template',
                    timestamp: Date.now(),
                    validationTime: 100,
                    isValid: true,
                    errorCount: 0,
                    warningCount: 0,
                    score: 0.95,
                    retryCount: 0,
                    fallbackUsed: false,
                    personaType: PersonaType.STANDARD,
                    rulesExecuted: ['rule1'],
                    rulesFailed: []
                }
            ];

            vi.mocked(mockStorage.getMetrics).mockResolvedValue(mockMetrics);

            const query: MetricsQuery = {
                templateId: 'test-template',
                personaType: PersonaType.STANDARD,
                isValid: true
            };

            const result = await collector.getMetrics(query);

            expect(result).toEqual(mockMetrics);
            expect(mockStorage.getMetrics).toHaveBeenCalled();
        });

        it('should filter metrics by query parameters', async () => {
            const mockMetrics: ValidationMetrics[] = [
                {
                    templateId: 'test-template',
                    timestamp: Date.now(),
                    validationTime: 100,
                    isValid: true,
                    errorCount: 0,
                    warningCount: 0,
                    score: 0.95,
                    retryCount: 0,
                    fallbackUsed: false,
                    personaType: PersonaType.STANDARD,
                    rulesExecuted: ['rule1'],
                    rulesFailed: []
                },
                {
                    templateId: 'test-template',
                    timestamp: Date.now(),
                    validationTime: 200,
                    isValid: false,
                    errorCount: 1,
                    warningCount: 0,
                    score: 0.3,
                    retryCount: 1,
                    fallbackUsed: true,
                    personaType: PersonaType.B2B,
                    rulesExecuted: ['rule1', 'rule2'],
                    rulesFailed: ['rule2']
                }
            ];

            vi.mocked(mockStorage.getMetrics).mockResolvedValue(mockMetrics);

            // Filter for only valid results
            const result = await collector.getMetrics({ isValid: true });

            expect(result).toHaveLength(1);
            expect(result[0].isValid).toBe(true);
        });
    });

    describe('getMetricsSummary', () => {
        it('should return empty summary for no metrics', async () => {
            vi.mocked(mockStorage.getMetrics).mockResolvedValue([]);

            const summary = await collector.getMetricsSummary();

            expect(summary).toEqual({
                totalValidations: 0,
                successRate: 0,
                averageScore: 0,
                averageValidationTime: 0,
                errorBreakdown: {},
                fallbackUsageRate: 0,
                topFailingRules: []
            });
        });

        it('should calculate summary correctly', async () => {
            const mockMetrics: ValidationMetrics[] = [
                {
                    templateId: 'test-template',
                    timestamp: Date.now(),
                    validationTime: 100,
                    isValid: true,
                    errorCount: 0,
                    warningCount: 0,
                    score: 0.9,
                    retryCount: 0,
                    fallbackUsed: false,
                    personaType: PersonaType.STANDARD,
                    rulesExecuted: ['rule1'],
                    rulesFailed: []
                },
                {
                    templateId: 'test-template',
                    timestamp: Date.now(),
                    validationTime: 200,
                    isValid: false,
                    errorCount: 1,
                    warningCount: 0,
                    score: 0.5,
                    retryCount: 1,
                    fallbackUsed: true,
                    personaType: PersonaType.STANDARD,
                    rulesExecuted: ['rule1', 'rule2'],
                    rulesFailed: ['required-fields-error']
                }
            ];

            vi.mocked(mockStorage.getMetrics).mockResolvedValue(mockMetrics);

            const summary = await collector.getMetricsSummary();

            expect(summary.totalValidations).toBe(2);
            expect(summary.successRate).toBe(0.5);
            expect(summary.averageScore).toBe(0.7);
            expect(summary.averageValidationTime).toBe(150);
            expect(summary.fallbackUsageRate).toBe(0.5);
            expect(summary.topFailingRules).toEqual([
                { ruleId: 'required-fields-error', failureCount: 1 }
            ]);
        });
    });

    describe('cleanup', () => {
        it('should cleanup old metrics', async () => {
            await collector.cleanup(30);

            expect(mockStorage.cleanup).toHaveBeenCalledWith(
                expect.any(Number)
            );
        });
    });

    describe('enable/disable', () => {
        it('should enable and disable metrics collection', () => {
            expect(collector.isCollectionEnabled()).toBe(true);

            collector.setEnabled(false);
            expect(collector.isCollectionEnabled()).toBe(false);

            collector.setEnabled(true);
            expect(collector.isCollectionEnabled()).toBe(true);
        });
    });
});