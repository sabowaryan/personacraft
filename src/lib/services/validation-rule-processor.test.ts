/**
 * Tests pour ValidationRuleProcessor
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ValidationRuleProcessor } from './validation-rule-processor';
import {
    ValidationRule,
    ValidationContext,
    ValidationResult,
    ValidationRuleType,
    ValidationSeverity,
    PersonaType,
    ValidationErrorType
} from '../../types/validation';

// Mock data pour les tests
const mockContext: ValidationContext = {
    originalRequest: {
        personaType: PersonaType.STANDARD,
        culturalData: {},
        demographics: {},
        psychographics: {}
    },
    templateVariables: {},
    culturalConstraints: {
        country: 'US',
        language: 'en',
        region: 'North America'
    },
    userSignals: {
        interests: [],
        behaviors: [],
        preferences: {}
    },
    generationAttempt: 1,
    previousErrors: []
};

const mockData = {
    id: 'test-persona',
    name: 'Test User',
    age: 25,
    email: 'test@example.com'
};

describe('ValidationRuleProcessor', () => {
    let processor: ValidationRuleProcessor;

    beforeEach(() => {
        processor = new ValidationRuleProcessor();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Constructor et Configuration', () => {
        it('devrait initialiser avec la configuration par défaut', () => {
            const config = processor.getConfig();
            
            expect(config.maxParallelRules).toBe(10);
            expect(config.defaultTimeout).toBe(5000);
            expect(config.enableParallelization).toBe(true);
            expect(config.skipDependentOnFailure).toBe(true);
            expect(config.collectDetailedMetrics).toBe(true);
        });

        it('devrait permettre de personnaliser la configuration', () => {
            const customProcessor = new ValidationRuleProcessor({
                maxParallelRules: 5,
                defaultTimeout: 3000,
                enableParallelization: false
            });

            const config = customProcessor.getConfig();
            expect(config.maxParallelRules).toBe(5);
            expect(config.defaultTimeout).toBe(3000);
            expect(config.enableParallelization).toBe(false);
        });

        it('devrait permettre de mettre à jour la configuration', () => {
            processor.updateConfig({ maxParallelRules: 15 });
            
            const config = processor.getConfig();
            expect(config.maxParallelRules).toBe(15);
        });
    });

    describe('Exécution de règles individuelles', () => {
        it('devrait exécuter une règle simple avec succès', async () => {
            const mockValidator = vi.fn().mockImplementation(async () => {
                // Ajouter un petit délai pour simuler l'exécution
                await new Promise(resolve => setTimeout(resolve, 1));
                return {
                    isValid: true,
                    errors: [],
                    warnings: [],
                    score: 1.0,
                    metadata: {}
                };
            });

            const rule: ValidationRule = {
                id: 'test-rule',
                type: ValidationRuleType.STRUCTURE,
                field: 'name',
                validator: mockValidator,
                severity: ValidationSeverity.ERROR,
                message: 'Test rule',
                required: true
            };

            const result = await processor.executeRule(rule, mockData, mockContext);

            expect(result.success).toBe(true);
            expect(result.ruleId).toBe('test-rule');
            expect(result.skipped).toBe(false);
            expect(result.executionTime).toBeGreaterThanOrEqual(0);
            expect(mockValidator).toHaveBeenCalledWith(mockData, mockContext);
        });

        it('devrait gérer les erreurs de validation', async () => {
            const mockValidator = vi.fn().mockRejectedValue(new Error('Validation failed'));

            const rule: ValidationRule = {
                id: 'failing-rule',
                type: ValidationRuleType.CONTENT,
                field: 'age',
                validator: mockValidator,
                severity: ValidationSeverity.ERROR,
                message: 'Failing rule',
                required: true
            };

            const result = await processor.executeRule(rule, mockData, mockContext);

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.error?.message).toBe('Validation failed');
            expect(result.skipped).toBe(false);
        });

        it('devrait gérer les timeouts', async () => {
            const mockValidator = vi.fn().mockImplementation(() => 
                new Promise(resolve => setTimeout(resolve, 1000))
            );

            const rule: ValidationRule = {
                id: 'slow-rule',
                type: ValidationRuleType.FORMAT,
                field: 'email',
                validator: mockValidator,
                severity: ValidationSeverity.WARNING,
                message: 'Slow rule',
                required: false,
                timeout: 100 // 100ms timeout
            };

            const result = await processor.executeRule(rule, mockData, mockContext);

            expect(result.success).toBe(false);
            expect(result.error?.message).toContain('timed out');
        });
    });

    describe('Plan d\'exécution', () => {
        it('devrait créer un plan d\'exécution simple sans dépendances', () => {
            const rules: ValidationRule[] = [
                {
                    id: 'rule1',
                    type: ValidationRuleType.STRUCTURE,
                    field: 'name',
                    validator: vi.fn(),
                    severity: ValidationSeverity.ERROR,
                    message: 'Rule 1',
                    required: true,
                    priority: 1
                },
                {
                    id: 'rule2',
                    type: ValidationRuleType.CONTENT,
                    field: 'age',
                    validator: vi.fn(),
                    severity: ValidationSeverity.ERROR,
                    message: 'Rule 2',
                    required: true,
                    priority: 2
                }
            ];

            const plan = processor.createExecutionPlan(rules);

            expect(plan.parallelGroups).toHaveLength(1);
            expect(plan.parallelGroups[0]).toHaveLength(2);
            expect(plan.priorityOrder[0].id).toBe('rule1'); // Plus haute priorité
            expect(plan.priorityOrder[1].id).toBe('rule2');
        });

        it('devrait gérer les dépendances entre règles', () => {
            const rules: ValidationRule[] = [
                {
                    id: 'rule1',
                    type: ValidationRuleType.STRUCTURE,
                    field: 'name',
                    validator: vi.fn(),
                    severity: ValidationSeverity.ERROR,
                    message: 'Rule 1',
                    required: true
                },
                {
                    id: 'rule2',
                    type: ValidationRuleType.CONTENT,
                    field: 'age',
                    validator: vi.fn(),
                    severity: ValidationSeverity.ERROR,
                    message: 'Rule 2',
                    required: true,
                    dependencies: ['rule1']
                }
            ];

            const plan = processor.createExecutionPlan(rules);

            expect(plan.parallelGroups).toHaveLength(2);
            expect(plan.parallelGroups[0]).toHaveLength(1);
            expect(plan.parallelGroups[0][0].id).toBe('rule1');
            expect(plan.parallelGroups[1]).toHaveLength(1);
            expect(plan.parallelGroups[1][0].id).toBe('rule2');
        });

        it('devrait trier les règles par priorité', () => {
            const rules: ValidationRule[] = [
                {
                    id: 'rule-low',
                    type: ValidationRuleType.STRUCTURE,
                    field: 'name',
                    validator: vi.fn(),
                    severity: ValidationSeverity.ERROR,
                    message: 'Low priority',
                    required: true,
                    priority: 10
                },
                {
                    id: 'rule-high',
                    type: ValidationRuleType.CONTENT,
                    field: 'age',
                    validator: vi.fn(),
                    severity: ValidationSeverity.ERROR,
                    message: 'High priority',
                    required: true,
                    priority: 1
                }
            ];

            const plan = processor.createExecutionPlan(rules);

            expect(plan.priorityOrder[0].id).toBe('rule-high');
            expect(plan.priorityOrder[1].id).toBe('rule-low');
        });
    });

    describe('Traitement complet des règles', () => {
        it('devrait traiter toutes les règles avec succès', async () => {
            const mockValidator1 = vi.fn().mockResolvedValue({
                isValid: true,
                errors: [],
                warnings: [],
                score: 1.0,
                metadata: {}
            });

            const mockValidator2 = vi.fn().mockResolvedValue({
                isValid: true,
                errors: [],
                warnings: [],
                score: 0.8,
                metadata: {}
            });

            const rules: ValidationRule[] = [
                {
                    id: 'rule1',
                    type: ValidationRuleType.STRUCTURE,
                    field: 'name',
                    validator: mockValidator1,
                    severity: ValidationSeverity.ERROR,
                    message: 'Rule 1',
                    required: true
                },
                {
                    id: 'rule2',
                    type: ValidationRuleType.CONTENT,
                    field: 'age',
                    validator: mockValidator2,
                    severity: ValidationSeverity.ERROR,
                    message: 'Rule 2',
                    required: true
                }
            ];

            const result = await processor.processRules(rules, mockData, mockContext);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.score).toBe(0.9); // Moyenne de 1.0 et 0.8
            expect(result.metadata.rulesExecuted).toBe(2);
            expect(result.metadata.rulesSkipped).toBe(0);
        });

        it('devrait gérer les échecs de validation', async () => {
            const mockValidator1 = vi.fn().mockResolvedValue({
                isValid: false,
                errors: [{
                    id: 'error1',
                    type: ValidationErrorType.REQUIRED_FIELD_MISSING,
                    field: 'name',
                    message: 'Name is required',
                    severity: ValidationSeverity.ERROR
                }],
                warnings: [],
                score: 0,
                metadata: {}
            });

            const mockValidator2 = vi.fn().mockResolvedValue({
                isValid: true,
                errors: [],
                warnings: [],
                score: 1.0,
                metadata: {}
            });

            const rules: ValidationRule[] = [
                {
                    id: 'rule1',
                    type: ValidationRuleType.STRUCTURE,
                    field: 'name',
                    validator: mockValidator1,
                    severity: ValidationSeverity.ERROR,
                    message: 'Rule 1',
                    required: true
                },
                {
                    id: 'rule2',
                    type: ValidationRuleType.CONTENT,
                    field: 'age',
                    validator: mockValidator2,
                    severity: ValidationSeverity.ERROR,
                    message: 'Rule 2',
                    required: true
                }
            ];

            const result = await processor.processRules(rules, mockData, mockContext);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].message).toBe('Name is required');
            expect(result.score).toBe(0.5); // Moyenne de 0 et 1.0
        });

        it('devrait sauter les règles dépendantes en cas d\'échec', async () => {
            const mockValidator1 = vi.fn().mockRejectedValue(new Error('Rule 1 failed'));
            const mockValidator2 = vi.fn().mockResolvedValue({
                isValid: true,
                errors: [],
                warnings: [],
                score: 1.0,
                metadata: {}
            });

            const rules: ValidationRule[] = [
                {
                    id: 'rule1',
                    type: ValidationRuleType.STRUCTURE,
                    field: 'name',
                    validator: mockValidator1,
                    severity: ValidationSeverity.ERROR,
                    message: 'Rule 1',
                    required: true
                },
                {
                    id: 'rule2',
                    type: ValidationRuleType.CONTENT,
                    field: 'age',
                    validator: mockValidator2,
                    severity: ValidationSeverity.ERROR,
                    message: 'Rule 2',
                    required: true,
                    dependencies: ['rule1']
                }
            ];

            const result = await processor.processRules(rules, mockData, mockContext);

            expect(result.isValid).toBe(false);
            expect(result.metadata.rulesExecuted).toBe(1);
            expect(result.metadata.rulesSkipped).toBe(1);
            expect(mockValidator1).toHaveBeenCalled();
            expect(mockValidator2).not.toHaveBeenCalled();
        });
    });

    describe('Parallélisation', () => {
        it('devrait exécuter les règles indépendantes en parallèle', async () => {
            const startTimes: number[] = [];
            
            const mockValidator1 = vi.fn().mockImplementation(async () => {
                startTimes.push(Date.now());
                await new Promise(resolve => setTimeout(resolve, 50));
                return {
                    isValid: true,
                    errors: [],
                    warnings: [],
                    score: 1.0,
                    metadata: {}
                };
            });

            const mockValidator2 = vi.fn().mockImplementation(async () => {
                startTimes.push(Date.now());
                await new Promise(resolve => setTimeout(resolve, 50));
                return {
                    isValid: true,
                    errors: [],
                    warnings: [],
                    score: 1.0,
                    metadata: {}
                };
            });

            const rules: ValidationRule[] = [
                {
                    id: 'rule1',
                    type: ValidationRuleType.STRUCTURE,
                    field: 'name',
                    validator: mockValidator1,
                    severity: ValidationSeverity.ERROR,
                    message: 'Rule 1',
                    required: true
                },
                {
                    id: 'rule2',
                    type: ValidationRuleType.CONTENT,
                    field: 'age',
                    validator: mockValidator2,
                    severity: ValidationSeverity.ERROR,
                    message: 'Rule 2',
                    required: true
                }
            ];

            await processor.processRules(rules, mockData, mockContext);

            // Les règles devraient commencer à peu près en même temps
            expect(Math.abs(startTimes[0] - startTimes[1])).toBeLessThan(10);
        });

        it('devrait respecter la limite de parallélisation', async () => {
            const processorWithLimit = new ValidationRuleProcessor({
                maxParallelRules: 2
            });

            const mockValidator = vi.fn().mockResolvedValue({
                isValid: true,
                errors: [],
                warnings: [],
                score: 1.0,
                metadata: {}
            });

            const rules: ValidationRule[] = Array.from({ length: 5 }, (_, i) => ({
                id: `rule${i + 1}`,
                type: ValidationRuleType.STRUCTURE,
                field: 'name',
                validator: mockValidator,
                severity: ValidationSeverity.ERROR,
                message: `Rule ${i + 1}`,
                required: true
            }));

            await processorWithLimit.processRules(rules, mockData, mockContext);

            expect(mockValidator).toHaveBeenCalledTimes(5);
        });
    });

    describe('Métriques', () => {
        it('devrait collecter les métriques d\'exécution', async () => {
            const mockValidator = vi.fn().mockImplementation(async () => {
                // Ajouter un petit délai pour simuler l'exécution
                await new Promise(resolve => setTimeout(resolve, 1));
                return {
                    isValid: true,
                    errors: [],
                    warnings: [],
                    score: 1.0,
                    metadata: {}
                };
            });

            const rules: ValidationRule[] = [
                {
                    id: 'rule1',
                    type: ValidationRuleType.STRUCTURE,
                    field: 'name',
                    validator: mockValidator,
                    severity: ValidationSeverity.ERROR,
                    message: 'Rule 1',
                    required: true
                }
            ];

            await processor.processRules(rules, mockData, mockContext);

            const metrics = processor.getMetrics();
            expect(metrics.totalRulesExecuted).toBe(1);
            expect(metrics.totalRulesSkipped).toBe(0);
            expect(metrics.totalExecutionTime).toBeGreaterThanOrEqual(0);
            expect(metrics.averageRuleExecutionTime).toBeGreaterThanOrEqual(0);
            expect(metrics.ruleExecutionTimes.has('rule1')).toBe(true);
        });

        it('devrait réinitialiser les métriques', () => {
            processor.resetMetrics();
            
            const metrics = processor.getMetrics();
            expect(metrics.totalRulesExecuted).toBe(0);
            expect(metrics.totalRulesSkipped).toBe(0);
            expect(metrics.totalExecutionTime).toBe(0);
            expect(metrics.ruleExecutionTimes.size).toBe(0);
        });
    });

    describe('Gestion d\'erreurs critiques', () => {
        it('devrait gérer les erreurs critiques du processeur', async () => {
            // Simuler une erreur critique en passant des règles invalides
            const invalidRules = null as any;

            const result = await processor.processRules(invalidRules, mockData, mockContext);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].type).toBe(ValidationErrorType.VALIDATION_TIMEOUT);
            expect(result.score).toBe(0);
        });
    });
});