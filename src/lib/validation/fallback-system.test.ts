/**
 * Unit tests for ValidationFallbackSystem
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ValidationFallbackSystem, createFallbackSystem, FallbackStrategy } from './fallback-system';
import { ValidationFeatureFlagsManager } from '@/lib/config/feature-flags';
import { PersonaType, ValidationError, ValidationErrorType, ValidationSeverity } from '@/types/validation';
import { BriefFormData } from '@/components/forms/BriefForm';

// Mock the feature flags manager
vi.mock('@/lib/config/feature-flags');

describe('ValidationFallbackSystem', () => {
    let fallbackSystem: ValidationFallbackSystem;
    let mockFeatureFlags: any;

    beforeEach(() => {
        mockFeatureFlags = {
            isValidationEnabled: vi.fn(),
            isPersonaValidationEnabled: vi.fn(),
            isFallbackEnabled: vi.fn(),
            isDebugModeEnabled: vi.fn(),
            isMetricsCollectionEnabled: vi.fn(),
            isVerboseLoggingEnabled: vi.fn(),
            getValidationConfig: vi.fn(),
            isValidationTypeEnabled: vi.fn()
        };

        fallbackSystem = new ValidationFallbackSystem(mockFeatureFlags);
    });

    describe('determineFallbackStrategy', () => {
        const mockContext = {
            originalPersonaType: PersonaType.STANDARD,
            validationErrors: [],
            attemptCount: 1,
            briefFormData: {} as BriefFormData,
            featureFlags: mockFeatureFlags
        };

        it('should return disable-validation when validation is disabled', () => {
            mockFeatureFlags.isValidationEnabled.mockReturnValue(false);

            const result = fallbackSystem.determineFallbackStrategy(mockContext);

            expect(result.strategy).toBe('disable-validation');
            expect(result.shouldUseLegacySystem).toBe(true);
            expect(result.shouldDisableValidation).toBe(true);
            expect(result.fallbackMessage).toContain('Validation disabled via feature flags');
        });

        it('should return disable-validation when persona validation is disabled', () => {
            mockFeatureFlags.isValidationEnabled.mockReturnValue(true);
            mockFeatureFlags.isPersonaValidationEnabled.mockReturnValue(false);

            const result = fallbackSystem.determineFallbackStrategy(mockContext);

            expect(result.strategy).toBe('disable-validation');
            expect(result.shouldUseLegacySystem).toBe(true);
            expect(result.shouldDisableValidation).toBe(true);
            expect(result.fallbackMessage).toContain('Validation disabled for standard personas');
        });

        it('should return legacy-system when fallback is enabled and has critical errors', () => {
            mockFeatureFlags.isValidationEnabled.mockReturnValue(true);
            mockFeatureFlags.isPersonaValidationEnabled.mockReturnValue(true);
            mockFeatureFlags.isFallbackEnabled.mockReturnValue(true);

            const criticalErrors: ValidationError[] = [{
                id: 'test-error',
                type: 'TEMPLATE_NOT_FOUND',
                field: 'test',
                message: 'Critical error',
                severity: ValidationSeverity.ERROR
            }];

            const contextWithErrors = {
                ...mockContext,
                validationErrors: criticalErrors
            };

            const result = fallbackSystem.determineFallbackStrategy(contextWithErrors);

            expect(result.strategy).toBe('legacy-system');
            expect(result.shouldUseLegacySystem).toBe(true);
            expect(result.shouldDisableValidation).toBe(false);
            expect(result.fallbackMessage).toContain('Critical validation errors detected');
        });

        it('should return simple-template after multiple attempts with non-simple persona', () => {
            mockFeatureFlags.isValidationEnabled.mockReturnValue(true);
            mockFeatureFlags.isPersonaValidationEnabled.mockReturnValue(true);
            mockFeatureFlags.isFallbackEnabled.mockReturnValue(false);

            const contextWithMultipleAttempts = {
                ...mockContext,
                attemptCount: 2,
                originalPersonaType: PersonaType.B2B
            };

            const result = fallbackSystem.determineFallbackStrategy(contextWithMultipleAttempts);

            expect(result.strategy).toBe('simple-template');
            expect(result.shouldUseLegacySystem).toBe(false);
            expect(result.shouldDisableValidation).toBe(false);
            expect(result.alternativePersonaType).toBe(PersonaType.SIMPLE);
            expect(result.fallbackMessage).toContain('Multiple validation failures');
        });

        it('should not suggest simple-template if already using simple persona', () => {
            mockFeatureFlags.isValidationEnabled.mockReturnValue(true);
            mockFeatureFlags.isPersonaValidationEnabled.mockReturnValue(true);
            mockFeatureFlags.isFallbackEnabled.mockReturnValue(true);

            const contextWithSimplePersona = {
                ...mockContext,
                attemptCount: 3,
                originalPersonaType: PersonaType.SIMPLE
            };

            const result = fallbackSystem.determineFallbackStrategy(contextWithSimplePersona);

            expect(result.strategy).toBe('legacy-system');
            expect(result.alternativePersonaType).toBeUndefined();
        });

        it('should return legacy-system when fallback is enabled and other strategies fail', () => {
            mockFeatureFlags.isValidationEnabled.mockReturnValue(true);
            mockFeatureFlags.isPersonaValidationEnabled.mockReturnValue(true);
            mockFeatureFlags.isFallbackEnabled.mockReturnValue(true);

            const result = fallbackSystem.determineFallbackStrategy(mockContext);

            expect(result.strategy).toBe('legacy-system');
            expect(result.shouldUseLegacySystem).toBe(true);
            expect(result.shouldDisableValidation).toBe(false);
            expect(result.fallbackMessage).toContain('Validation failed, falling back to legacy system');
        });

        it('should return disable-validation as last resort', () => {
            mockFeatureFlags.isValidationEnabled.mockReturnValue(true);
            mockFeatureFlags.isPersonaValidationEnabled.mockReturnValue(true);
            mockFeatureFlags.isFallbackEnabled.mockReturnValue(false);

            const result = fallbackSystem.determineFallbackStrategy(mockContext);

            expect(result.strategy).toBe('disable-validation');
            expect(result.shouldUseLegacySystem).toBe(true);
            expect(result.shouldDisableValidation).toBe(true);
            expect(result.fallbackMessage).toContain('All validation attempts failed');
        });
    });

    describe('createLegacyFallbackResult', () => {
        it('should create a valid fallback result for legacy system', () => {
            const personas = [{ name: 'Test Persona', age: 30 }];
            const message = 'Using legacy system';

            const result = fallbackSystem.createLegacyFallbackResult(personas, message);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0].type).toBe('FALLBACK_USED');
            expect(result.warnings[0].message).toBe(message);
            expect(result.score).toBe(0.8);
            expect(result.metadata.templateId).toBe('legacy-fallback');
            expect(result.metadata.fallbackUsed).toBe(true);
            expect(result.metadata.fallbackStrategy).toBe('legacy-system');
            expect(result.metadata.personaCount).toBe(1);
        });
    });

    describe('createDisabledValidationResult', () => {
        it('should create a valid result for disabled validation', () => {
            const personas = [{ name: 'Test Persona', age: 30 }];
            const reason = 'Validation disabled';

            const result = fallbackSystem.createDisabledValidationResult(personas, reason);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0].type).toBe('VALIDATION_DISABLED');
            expect(result.warnings[0].message).toBe(reason);
            expect(result.score).toBe(1.0);
            expect(result.metadata.templateId).toBe('validation-disabled');
            expect(result.metadata.fallbackUsed).toBe(false);
            expect(result.metadata.validationDisabled).toBe(true);
            expect(result.metadata.personaCount).toBe(1);
        });
    });

    describe('shouldSkipValidation', () => {
        it('should return true when validation is disabled', () => {
            mockFeatureFlags.isValidationEnabled.mockReturnValue(false);
            mockFeatureFlags.isPersonaValidationEnabled.mockReturnValue(true);

            const result = fallbackSystem.shouldSkipValidation(PersonaType.STANDARD);

            expect(result).toBe(true);
        });

        it('should return true when persona validation is disabled', () => {
            mockFeatureFlags.isValidationEnabled.mockReturnValue(true);
            mockFeatureFlags.isPersonaValidationEnabled.mockReturnValue(false);

            const result = fallbackSystem.shouldSkipValidation(PersonaType.STANDARD);

            expect(result).toBe(true);
        });

        it('should return false when both validations are enabled', () => {
            mockFeatureFlags.isValidationEnabled.mockReturnValue(true);
            mockFeatureFlags.isPersonaValidationEnabled.mockReturnValue(true);

            const result = fallbackSystem.shouldSkipValidation(PersonaType.STANDARD);

            expect(result).toBe(false);
        });
    });

    describe('getValidationConfigWithFallback', () => {
        it('should return configuration with fallback considerations', () => {
            const baseConfig = {
                enableValidation: true,
                enableRetry: true,
                enableFallback: true
            };

            mockFeatureFlags.getValidationConfig.mockReturnValue(baseConfig);
            mockFeatureFlags.isPersonaValidationEnabled.mockReturnValue(true);
            mockFeatureFlags.isValidationTypeEnabled.mockImplementation((type) => {
                return type === 'structure' || type === 'content';
            });

            const result = fallbackSystem.getValidationConfigWithFallback(PersonaType.STANDARD);

            expect(result.enableValidation).toBe(true);
            expect(result.enableStructureValidation).toBe(true);
            expect(result.enableContentValidation).toBe(true);
            expect(result.enableBusinessRuleValidation).toBe(false);
            expect(result.enableFormatValidation).toBe(false);
            expect(result.enableRetry).toBe(true);
            expect(result.enableFallback).toBe(true);
            expect(result.maxRetries).toBe(2); // Standard persona gets 2 retries
        });

        it('should disable validation when persona validation is disabled', () => {
            const baseConfig = {
                enableValidation: true,
                enableRetry: true,
                enableFallback: true
            };

            mockFeatureFlags.getValidationConfig.mockReturnValue(baseConfig);
            mockFeatureFlags.isPersonaValidationEnabled.mockReturnValue(false);

            const result = fallbackSystem.getValidationConfigWithFallback(PersonaType.STANDARD);

            expect(result.enableValidation).toBe(false);
        });

        it('should return different max retries for different persona types', () => {
            const baseConfig = {
                enableValidation: true,
                enableRetry: true,
                enableFallback: true
            };

            mockFeatureFlags.getValidationConfig.mockReturnValue(baseConfig);
            mockFeatureFlags.isPersonaValidationEnabled.mockReturnValue(true);
            mockFeatureFlags.isValidationTypeEnabled.mockReturnValue(true);

            const simpleResult = fallbackSystem.getValidationConfigWithFallback(PersonaType.SIMPLE);
            const standardResult = fallbackSystem.getValidationConfigWithFallback(PersonaType.STANDARD);
            const b2bResult = fallbackSystem.getValidationConfigWithFallback(PersonaType.B2B);

            expect(simpleResult.maxRetries).toBe(1);
            expect(standardResult.maxRetries).toBe(2);
            expect(b2bResult.maxRetries).toBe(3);
        });
    });

    describe('logFallbackUsage', () => {
        it('should log fallback usage when debug mode is enabled', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
            mockFeatureFlags.isDebugModeEnabled.mockReturnValue(true);
            mockFeatureFlags.isMetricsCollectionEnabled.mockReturnValue(false);

            const context = {
                originalPersonaType: PersonaType.STANDARD,
                validationErrors: [],
                attemptCount: 1,
                briefFormData: {} as BriefFormData,
                featureFlags: mockFeatureFlags
            };

            fallbackSystem.logFallbackUsage('legacy-system', context);

            expect(consoleSpy).toHaveBeenCalledWith(
                '🔄 Validation fallback triggered:',
                expect.objectContaining({
                    strategy: 'legacy-system',
                    originalPersonaType: PersonaType.STANDARD,
                    errorCount: 0,
                    attemptCount: 1
                })
            );

            consoleSpy.mockRestore();
        });

        it('should record metrics when metrics collection is enabled', () => {
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });
            mockFeatureFlags.isDebugModeEnabled.mockReturnValue(false);
            mockFeatureFlags.isMetricsCollectionEnabled.mockReturnValue(true);
            mockFeatureFlags.isVerboseLoggingEnabled.mockReturnValue(true);

            const context = {
                originalPersonaType: PersonaType.STANDARD,
                validationErrors: [],
                attemptCount: 1,
                briefFormData: {} as BriefFormData,
                featureFlags: mockFeatureFlags
            };

            fallbackSystem.logFallbackUsage('template-fallback', context);

            expect(consoleSpy).toHaveBeenCalledWith(
                '📊 Fallback metrics:',
                expect.objectContaining({
                    strategy: 'template-fallback',
                    personaType: PersonaType.STANDARD,
                    errorTypes: []
                })
            );

            consoleSpy.mockRestore();
        });
    });
});

describe('createFallbackSystem', () => {
    it('should create a fallback system with provided feature flags', () => {
        const mockFeatureFlags = {} as ValidationFeatureFlagsManager;

        const fallbackSystem = createFallbackSystem(mockFeatureFlags);

        expect(fallbackSystem).toBeInstanceOf(ValidationFallbackSystem);
    });
});