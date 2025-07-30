/**
 * Fallback System for Validation
 * 
 * Provides fallback mechanisms when validation is disabled or fails.
 * Ensures graceful degradation to legacy system when needed.
 */

import { ValidationFeatureFlagsManager } from '@/lib/config/feature-flags';
import { ValidationError, ValidationResult, PersonaType, ValidationSeverity } from '@/types/validation';
import { Persona } from '@/types';
import { BriefFormData } from '@/components/forms/BriefForm';

/**
 * Fallback strategy types
 */
export type FallbackStrategy =
  | 'disable-validation'
  | 'legacy-system'
  | 'simple-template'
  | 'default-response';

/**
 * Fallback context information
 */
export interface FallbackContext {
  originalPersonaType: PersonaType;
  validationErrors: ValidationError[];
  attemptCount: number;
  briefFormData: BriefFormData;
  featureFlags: ValidationFeatureFlagsManager;
}

/**
 * Fallback result
 */
export interface FallbackResult {
  strategy: FallbackStrategy;
  shouldUseLegacySystem: boolean;
  shouldDisableValidation: boolean;
  alternativePersonaType?: PersonaType;
  fallbackMessage?: string;
}

/**
 * Fallback system manager
 */
export class ValidationFallbackSystem {
  private featureFlags: ValidationFeatureFlagsManager;

  constructor(featureFlags: ValidationFeatureFlagsManager) {
    this.featureFlags = featureFlags;
  }

  /**
   * Determine the appropriate fallback strategy
   */
  determineFallbackStrategy(context: FallbackContext): FallbackResult {
    // If validation is completely disabled, use legacy system
    if (!this.featureFlags.isValidationEnabled()) {
      return {
        strategy: 'disable-validation',
        shouldUseLegacySystem: true,
        shouldDisableValidation: true,
        fallbackMessage: 'Validation disabled via feature flags'
      };
    }

    // If persona-specific validation is disabled, use legacy system
    if (!this.featureFlags.isPersonaValidationEnabled(context.originalPersonaType)) {
      return {
        strategy: 'disable-validation',
        shouldUseLegacySystem: true,
        shouldDisableValidation: true,
        fallbackMessage: `Validation disabled for ${context.originalPersonaType} personas`
      };
    }

    // If fallback to legacy system is enabled and we have critical errors
    if (this.featureFlags.isFallbackEnabled() && this.hasCriticalErrors(context.validationErrors)) {
      return {
        strategy: 'legacy-system',
        shouldUseLegacySystem: true,
        shouldDisableValidation: false,
        fallbackMessage: 'Critical validation errors detected, falling back to legacy system'
      };
    }

    // If we have too many attempts, try simpler template
    if (context.attemptCount >= 2 && context.originalPersonaType !== PersonaType.SIMPLE) {
      return {
        strategy: 'simple-template',
        shouldUseLegacySystem: false,
        shouldDisableValidation: false,
        alternativePersonaType: PersonaType.SIMPLE,
        fallbackMessage: 'Multiple validation failures, trying simpler template'
      };
    }

    // If all else fails and fallback is enabled, use legacy system
    if (this.featureFlags.isFallbackEnabled()) {
      return {
        strategy: 'legacy-system',
        shouldUseLegacySystem: true,
        shouldDisableValidation: false,
        fallbackMessage: 'Validation failed, falling back to legacy system'
      };
    }

    // Last resort - disable validation for this request
    return {
      strategy: 'disable-validation',
      shouldUseLegacySystem: true,
      shouldDisableValidation: true,
      fallbackMessage: 'All validation attempts failed, disabling validation for this request'
    };
  }

  /**
   * Check if validation errors contain critical issues
   */
  private hasCriticalErrors(errors: ValidationError[]): boolean {
    const criticalErrorTypes = [
      'TEMPLATE_NOT_FOUND',
      'VALIDATION_TIMEOUT',
      'STRUCTURE_INVALID'
    ];

    return errors.some(error =>
      criticalErrorTypes.includes(error.type) ||
      error.severity === 'error'
    );
  }

  /**
   * Create a fallback validation result for legacy system usage
   */
  createLegacyFallbackResult(personas: Partial<Persona>[], message: string): ValidationResult {
    return {
      isValid: true,
      errors: [],
      warnings: [{
        type: 'FALLBACK_USED',
        field: 'system',
        message: message,
        severity: ValidationSeverity.INFO,
        value: 'legacy-system'
      }],
      score: 0.8, // Lower score to indicate fallback was used
      metadata: {
        templateId: 'legacy-fallback',
        validationTime: 0,
        rulesExecuted: 0,
        rulesSkipped: 0,
        timestamp: Date.now(),
        fallbackUsed: true,
        fallbackStrategy: 'legacy-system',
        personaCount: personas.length
      }
    };
  }

  /**
   * Create a disabled validation result
   */
  createDisabledValidationResult(personas: Partial<Persona>[], reason: string): ValidationResult {
    return {
      isValid: true,
      errors: [],
      warnings: [{
        type: 'VALIDATION_DISABLED',
        field: 'system',
        message: reason,
        severity: ValidationSeverity.INFO,
        value: 'disabled'
      }],
      score: 1.0, // Full score since validation is intentionally disabled
      metadata: {
        templateId: 'validation-disabled',
        validationTime: 0,
        rulesExecuted: 0,
        rulesSkipped: 0,
        timestamp: Date.now(),
        fallbackUsed: false,
        validationDisabled: true,
        personaCount: personas.length
      }
    };
  }

  /**
   * Check if we should skip validation entirely
   */
  shouldSkipValidation(personaType: PersonaType): boolean {
    return !this.featureFlags.isValidationEnabled() ||
      !this.featureFlags.isPersonaValidationEnabled(personaType);
  }

  /**
   * Get validation configuration with fallback considerations
   */
  getValidationConfigWithFallback(personaType: PersonaType): {
    enableValidation: boolean;
    enableStructureValidation: boolean;
    enableContentValidation: boolean;
    enableBusinessRuleValidation: boolean;
    enableFormatValidation: boolean;
    enableRetry: boolean;
    enableFallback: boolean;
    maxRetries: number;
  } {
    const baseConfig = this.featureFlags.getValidationConfig();
    const personaValidationEnabled = this.featureFlags.isPersonaValidationEnabled(personaType);

    return {
      enableValidation: baseConfig.enableValidation && personaValidationEnabled,
      enableStructureValidation: this.featureFlags.isValidationTypeEnabled('structure'),
      enableContentValidation: this.featureFlags.isValidationTypeEnabled('content'),
      enableBusinessRuleValidation: this.featureFlags.isValidationTypeEnabled('business'),
      enableFormatValidation: this.featureFlags.isValidationTypeEnabled('format'),
      enableRetry: baseConfig.enableRetry,
      enableFallback: baseConfig.enableFallback,
      maxRetries: this.getMaxRetriesForPersonaType(personaType)
    };
  }

  /**
   * Get max retries based on persona type and feature flags
   */
  private getMaxRetriesForPersonaType(personaType: PersonaType): number {
    // More retries for complex persona types
    switch (personaType) {
      case 'simple':
        return 1;
      case 'standard':
        return 2;
      case 'b2b':
        return 3;
      default:
        return 2;
    }
  }

  /**
   * Log fallback usage for monitoring
   */
  logFallbackUsage(strategy: FallbackStrategy, context: FallbackContext): void {
    if (this.featureFlags.isDebugModeEnabled()) {
      console.log('🔄 Validation fallback triggered:', {
        strategy,
        originalPersonaType: context.originalPersonaType,
        errorCount: context.validationErrors.length,
        attemptCount: context.attemptCount,
        timestamp: new Date().toISOString()
      });
    }

    // Could integrate with metrics collection here
    if (this.featureFlags.isMetricsCollectionEnabled()) {
      // TODO: Send fallback metrics to monitoring system
      this.recordFallbackMetrics(strategy, context);
    }
  }

  /**
   * Record fallback metrics (placeholder for future implementation)
   */
  private recordFallbackMetrics(strategy: FallbackStrategy, context: FallbackContext): void {
    // This would integrate with the metrics collection system
    // For now, just log if verbose logging is enabled
    if (this.featureFlags.isVerboseLoggingEnabled()) {
      console.log('📊 Fallback metrics:', {
        strategy,
        personaType: context.originalPersonaType,
        errorTypes: context.validationErrors.map(e => e.type),
        timestamp: Date.now()
      });
    }
  }
}

/**
 * Create fallback system with current feature flags
 */
export function createFallbackSystem(featureFlags: ValidationFeatureFlagsManager): ValidationFallbackSystem {
  return new ValidationFallbackSystem(featureFlags);
}