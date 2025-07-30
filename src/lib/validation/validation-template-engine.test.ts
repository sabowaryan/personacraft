/**
 * Comprehensive tests for ValidationTemplateEngine
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { ValidationTemplateEngine } from './validation-template-engine';
import { ValidationTemplateRegistry } from './template-registry';
import { ValidationRuleProcessor } from './validation-rule-processor';
import { ValidationFeatureFlagsManager } from '@/lib/config/feature-flags';
import {
    ValidationTemplate,
    ValidationContext,
    PersonaType,
    ValidationErrorType,
    ValidationSeverity,
    ValidationResult,
    FallbackStrategyType,
    ValidationRuleType
} from '@/types/validation';

// Mock dependencies
vi.mock('./template-registry');
vi.mock('./validation-rule-processor');
vi.mock('@/lib/config/feature-flags');
vi.mock('./fallback-system');

describe('ValidationTemplateEngine', () => {
    let engine: ValidationTemplateEngine;
    let mockRegistry: jest.Mocked<ValidationTemplateRegistry>;
    let mockRuleProcessor: jest.Mocked<ValidationRuleProcessor>;
    let mockFeatureFlags: jest.Mocked<ValidationFeatureFlagsManager>;
    let mockContext: ValidationContext;
    let mockTemplate: ValidationTemplate;

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        // Create mock instances
        mockRegistry = {
            register: vi.fn(),
            get: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            list: vi.fn(),
            getByPersonaType: vi.fn(),
            getLatestByPersonaType: vi.fn(),
            clear: vi.fn()
        } as any;

        mockRuleProcessor = {
            processRules: vi.fn()
        } as any;

        mockFeatureFlags = {
            isValidationEnabled: vi.fn().mockReturnValue(true),
            isPersonaValidationEnabled: vi.fn().mockReturnValue(true),
            isValidationTypeEnabled: vi.fn().mockReturnValue(true),
            isDebugModeEnabled: vi.fn().mockReturnValue(false),
            isMetricsCollectionEnabled: vi.fn().mockReturnValue(false),
            isVerboseLoggingEnabled: vi.fn().mockReturnValue(false),
            isFallbackEnabled: vi.fn().mockReturnValue(true),
            getValidationConfig: vi.fn().mockReturnValue({
                enableValidation: true,
                enableRetry: true,
                enableFallback: true
            })
        } as any;

        // Create engine with mocked dependencies
        engine = new ValidationTemplateEngine(mockRegistry, mockRuleProcessor, mockFeatureFlags);

        // Mock context
        mockContext = {
            originalRequest: {
                personaType: PersonaType.STANDARD,
                culturalData: {},
                demographics: {},
                psychographics: {}
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
                    location: 'New York',
                    occupation: 'Software Engineer'
                },
                interests: ['technology', 'music', 'travel'],
                values: ['innovation', 'creativity', 'sustainability'],
                culturalContext: {
                    language: 'en',
                    personaCount: 1
                }
            },
            generationAttempt: 1,
            previousErrors: []
        };

        // Mock template
        mockTemplate = {
            id: 'test-template',
            name: 'Test Template',
            personaType: PersonaType.STANDARD,
            version: '1.0.0',
            rules: [
                {
                    id: 'test-rule',
                    type: ValidationRuleType.STRUCTURE,
                    field: 'testField',
                    severity: ValidationSeverity.ERROR,
                    message: 'Test validation message',
                    required: true,
                    priority: 1,
                    validator: vi.fn()
                }
            ],
            metadata: {
                isActive: true,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                author: 'test',
                description: 'Test template for validation',
                tags: ['test', 'validation']
            },
            fallbackStrategy: {
                type: FallbackStrategyType.SIMPLE_TEMPLATE,
                maxRetries: 2,
                retryDelay: 1000,
                defaultResponse: {}
            }
        };
    });

    describe('Constructor', () => {
        it('should initialize with default dependencies when none provided', () => {
            const newEngine = new ValidationTemplateEngine();
            expect(newEngine).toBeInstanceOf(ValidationTemplateEngine);
        });

        it('should use provided dependencies', () => {
            expect(engine.getRegistry()).toBe(mockRegistry);
            expect(engine.getRuleProcessor()).toBe(mockRuleProcessor);
        });
    });

    describe('validateResponse', () => {
        it('should successfully validate a response', async () => {
            const mockResponse = { name: 'Test Persona', age: 25 };
            const mockValidationResult: ValidationResult = {
                isValid: true,
                errors: [],
                warnings: [],
                score: 100,
                metadata: {
                    templateId: 'test-template',
                    validationTime: 100,
                    rulesExecuted: 1,
                    rulesSkipped: 0,
                    timestamp: Date.now()
                }
            };

            mockRegistry.get.mockReturnValue(mockTemplate);
            mockRuleProcessor.processRules.mockResolvedValue({
                aggregatedResult: mockValidationResult,
                individualResults: []
            });

            const result = await engine.validateResponse(mockResponse, 'test-template', mockContext);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.metadata.templateId).toBe('test-template');
            expect(result.metadata.templateVersion).toBe('1.0.0');
        });

        it('should return error when validation is disabled', async () => {
            mockFeatureFlags.isValidationEnabled.mockReturnValue(false);

            const result = await engine.validateResponse({}, 'test-template', mockContext);

            expect(result.isValid).toBe(true);
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0].message).toContain('disabled via feature flags');
        });

        it('should return error when persona validation is disabled', async () => {
            mockFeatureFlags.isPersonaValidationEnabled.mockReturnValue(false);

            const result = await engine.validateResponse({}, 'test-template', mockContext);

            expect(result.isValid).toBe(true);
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0].message).toContain('disabled for standard personas');
        });

        it('should return error when template not found', async () => {
            mockRegistry.get.mockReturnValue(null);

            const result = await engine.validateResponse({}, 'nonexistent-template', mockContext);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].type).toBe(ValidationErrorType.TEMPLATE_NOT_FOUND);
        });

        it('should return error when template is inactive', async () => {
            const inactiveTemplate = { ...mockTemplate, metadata: { ...mockTemplate.metadata, isActive: false } };
            mockRegistry.get.mockReturnValue(inactiveTemplate);

            const result = await engine.validateResponse({}, 'test-template', mockContext);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].message).toContain('not active');
        });

        it('should filter rules based on feature flags', async () => {
            mockFeatureFlags.isValidationTypeEnabled.mockImplementation((type: string) => {
                return type !== ValidationRuleType.STRUCTURE; // Disable structure validation
            });

            const templateWithMultipleRules = {
                ...mockTemplate,
                rules: [
                    { ...mockTemplate.rules[0], type: ValidationRuleType.STRUCTURE },
                    { ...mockTemplate.rules[0], id: 'content-rule', type: ValidationRuleType.CONTENT }
                ]
            };

            mockRegistry.get.mockReturnValue(templateWithMultipleRules);
            mockRuleProcessor.processRules.mockResolvedValue({
                aggregatedResult: {
                    isValid: true,
                    errors: [],
                    warnings: [],
                    score: 100,
                    metadata: {
                        templateId: 'test-template',
                        validationTime: 100,
                        rulesExecuted: 1,
                        rulesSkipped: 1,
                        timestamp: Date.now()
                    }
                },
                individualResults: []
            });

            await engine.validateResponse({}, 'test-template', mockContext);

            // Should only process content rule, not structure rule
            expect(mockRuleProcessor.processRules).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({ type: ValidationRuleType.CONTENT })
                ]),
                expect.anything(),
                expect.anything()
            );
        });

        it('should handle validation timeout errors', async () => {
            mockRegistry.get.mockReturnValue(mockTemplate);
            mockRuleProcessor.processRules.mockRejectedValue(new Error('Timeout'));

            const result = await engine.validateResponse({}, 'test-template', mockContext);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].type).toBe(ValidationErrorType.VALIDATION_TIMEOUT);
        });

        it('should include feature flag metadata in results', async () => {
            mockRegistry.get.mockReturnValue(mockTemplate);
            mockRuleProcessor.processRules.mockResolvedValue({
                aggregatedResult: {
                    isValid: true,
                    errors: [],
                    warnings: [],
                    score: 100,
                    metadata: {
                        templateId: 'test-template',
                        validationTime: 100,
                        rulesExecuted: 1,
                        rulesSkipped: 0,
                        timestamp: Date.now()
                    }
                },
                individualResults: []
            });

            const result = await engine.validateResponse({}, 'test-template', mockContext);

            expect(result.metadata.featureFlagsUsed).toBeDefined();
            expect(result.metadata.featureFlagsUsed?.validationEnabled).toBe(true);
            expect(result.metadata.featureFlagsUsed?.structureValidation).toBe(true);
        });
    });

    describe('Template Management', () => {
        it('should register a template', () => {
            engine.registerTemplate(mockTemplate);
            expect(mockRegistry.register).toHaveBeenCalledWith(mockTemplate);
        });

        it('should get a template by ID', () => {
            mockRegistry.get.mockReturnValue(mockTemplate);
            const result = engine.getTemplate('test-template');
            expect(result).toBe(mockTemplate);
            expect(mockRegistry.get).toHaveBeenCalledWith('test-template');
        });

        it('should update a template', () => {
            engine.updateTemplate('test-template', mockTemplate);
            expect(mockRegistry.update).toHaveBeenCalledWith('test-template', mockTemplate);
        });

        it('should get template by persona type', () => {
            mockRegistry.getLatestByPersonaType.mockReturnValue(mockTemplate);
            const result = engine.getTemplateByPersonaType(PersonaType.STANDARD);
            expect(result).toBe(mockTemplate);
            expect(mockRegistry.getLatestByPersonaType).toHaveBeenCalledWith(PersonaType.STANDARD);
        });

        it('should get all templates', () => {
            const templates = [mockTemplate];
            mockRegistry.list.mockReturnValue(templates);
            const result = engine.getAllTemplates();
            expect(result).toBe(templates);
            expect(mockRegistry.list).toHaveBeenCalled();
        });

        it('should get templates by persona type', () => {
            const templates = [mockTemplate];
            mockRegistry.getByPersonaType.mockReturnValue(templates);
            const result = engine.getTemplatesByPersonaType(PersonaType.STANDARD);
            expect(result).toBe(templates);
            expect(mockRegistry.getByPersonaType).toHaveBeenCalledWith(PersonaType.STANDARD);
        });

        it('should remove a template', () => {
            mockRegistry.delete.mockReturnValue(true);
            const result = engine.removeTemplate('test-template');
            expect(result).toBe(true);
            expect(mockRegistry.delete).toHaveBeenCalledWith('test-template');
        });
    });

    describe('Feature Flag Integration', () => {
        it('should respect validation enabled flag', async () => {
            mockFeatureFlags.isValidationEnabled.mockReturnValue(false);

            const result = await engine.validateResponse({}, 'test-template', mockContext);

            expect(result.warnings[0].message).toContain('disabled via feature flags');
        });

        it('should respect persona-specific validation flags', async () => {
            mockFeatureFlags.isPersonaValidationEnabled.mockReturnValue(false);

            const result = await engine.validateResponse({}, 'test-template', mockContext);

            expect(result.warnings[0].message).toContain('disabled for standard personas');
        });

        it('should log debug information when debug mode is enabled', async () => {
            mockFeatureFlags.isDebugModeEnabled.mockReturnValue(true);
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

            mockRegistry.get.mockReturnValue(mockTemplate);
            mockRuleProcessor.processRules.mockResolvedValue({
                aggregatedResult: {
                    isValid: true,
                    errors: [],
                    warnings: [],
                    score: 100,
                    metadata: {
                        templateId: 'test-template',
                        validationTime: 100,
                        rulesExecuted: 1,
                        rulesSkipped: 0,
                        timestamp: Date.now()
                    }
                },
                individualResults: []
            });

            await engine.validateResponse({}, 'test-template', mockContext);

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Running validation with')
            );

            consoleSpy.mockRestore();
        });
    });

    describe('Error Handling', () => {
        it('should handle registry errors gracefully', async () => {
            mockRegistry.get.mockImplementation(() => {
                throw new Error('Registry error');
            });

            const result = await engine.validateResponse({}, 'test-template', mockContext);

            expect(result.isValid).toBe(false);
            expect(result.errors[0].type).toBe(ValidationErrorType.VALIDATION_TIMEOUT);
            expect(result.errors[0].message).toContain('Registry error');
        });

        it('should handle rule processor errors gracefully', async () => {
            mockRegistry.get.mockReturnValue(mockTemplate);
            mockRuleProcessor.processRules.mockRejectedValue(new Error('Processing error'));

            const result = await engine.validateResponse({}, 'test-template', mockContext);

            expect(result.isValid).toBe(false);
            expect(result.errors[0].message).toContain('Processing error');
        });
    });

    describe('Performance', () => {
        it('should track validation time', async () => {
            mockRegistry.get.mockReturnValue(mockTemplate);
            mockRuleProcessor.processRules.mockImplementation(async () => {
                // Simulate processing time
                await new Promise(resolve => setTimeout(resolve, 50));
                return {
                    aggregatedResult: {
                        isValid: true,
                        errors: [],
                        warnings: [],
                        score: 100,
                        metadata: {
                            templateId: 'test-template',
                            validationTime: 50,
                            rulesExecuted: 1,
                            rulesSkipped: 0,
                            timestamp: Date.now()
                        }
                    },
                    individualResults: []
                };
            });

            const result = await engine.validateResponse({}, 'test-template', mockContext);

            expect(result.metadata.validationTime).toBeGreaterThan(0);
        });
    });
});