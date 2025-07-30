/**
 * Feature Flags Configuration for LLM Response Validation System
 * 
 * This module provides feature flags for progressive deployment of the validation system.
 * It allows enabling/disabling different aspects of validation and provides fallback mechanisms.
 */

/**
 * Validation feature flags interface
 */
export interface ValidationFeatureFlags {
  // Main validation toggle
  validationEnabled: boolean;
  
  // Validation type toggles
  structureValidation: boolean;
  contentValidation: boolean;
  businessRuleValidation: boolean;
  formatValidation: boolean;
  
  // Advanced features
  retryOnValidationFailure: boolean;
  fallbackToLegacySystem: boolean;
  enhancedPromptOnRetry: boolean;
  
  // Monitoring and metrics
  metricsCollection: boolean;
  performanceMonitoring: boolean;
  alerting: boolean;
  
  // Template-specific flags
  standardPersonaValidation: boolean;
  b2bPersonaValidation: boolean;
  simplePersonaValidation: boolean;
  
  // Debug and development
  debugMode: boolean;
  verboseLogging: boolean;
}

/**
 * Default feature flags configuration
 * Conservative defaults for safe progressive rollout
 */
const DEFAULT_FEATURE_FLAGS: ValidationFeatureFlags = {
  // Main validation - start disabled for safe rollout
  validationEnabled: false,
  
  // Validation types - all disabled by default
  structureValidation: false,
  contentValidation: false,
  businessRuleValidation: false,
  formatValidation: false,
  
  // Advanced features - conservative defaults
  retryOnValidationFailure: true,
  fallbackToLegacySystem: true,
  enhancedPromptOnRetry: false,
  
  // Monitoring - enabled for observability
  metricsCollection: true,
  performanceMonitoring: true,
  alerting: false,
  
  // Template-specific - all disabled by default
  standardPersonaValidation: false,
  b2bPersonaValidation: false,
  simplePersonaValidation: false,
  
  // Debug - disabled in production
  debugMode: false,
  verboseLogging: false,
};

/**
 * Environment-based feature flag overrides
 */
const ENVIRONMENT_OVERRIDES: Record<string, Partial<ValidationFeatureFlags>> = {
  development: {
    debugMode: true,
    verboseLogging: true,
    validationEnabled: true,
    structureValidation: true,
    contentValidation: true,
    formatValidation: true,
    simplePersonaValidation: true,
  },
  
  staging: {
    validationEnabled: true,
    structureValidation: true,
    contentValidation: true,
    formatValidation: true,
    simplePersonaValidation: true,
    standardPersonaValidation: true,
    alerting: true,
  },
  
  production: {
    // Production flags will be controlled via environment variables
    // Start with conservative settings
    validationEnabled: false,
    fallbackToLegacySystem: true,
    metricsCollection: true,
    performanceMonitoring: true,
  },
};

/**
 * Feature flags manager class
 */
export class ValidationFeatureFlagsManager {
  private flags: ValidationFeatureFlags;
  private environment: string;

  constructor(environment?: string) {
    this.environment = environment || process.env.NODE_ENV || 'development';
    this.flags = this.loadFeatureFlags();
  }

  /**
   * Load feature flags from environment variables and defaults
   */
  private loadFeatureFlags(): ValidationFeatureFlags {
    const baseFlags = { ...DEFAULT_FEATURE_FLAGS };
    
    // Apply environment-specific overrides
    const envOverrides = ENVIRONMENT_OVERRIDES[this.environment] || {};
    Object.assign(baseFlags, envOverrides);
    
    // Apply environment variable overrides
    const envFlags = this.loadFromEnvironmentVariables();
    Object.assign(baseFlags, envFlags);
    
    return baseFlags;
  }

  /**
   * Load feature flags from environment variables
   */
  private loadFromEnvironmentVariables(): Partial<ValidationFeatureFlags> {
    const envFlags: Partial<ValidationFeatureFlags> = {};
    
    // Main validation toggle
    if (process.env.VALIDATION_ENABLED !== undefined) {
      envFlags.validationEnabled = process.env.VALIDATION_ENABLED === 'true';
    }
    
    // Validation type toggles
    if (process.env.STRUCTURE_VALIDATION_ENABLED !== undefined) {
      envFlags.structureValidation = process.env.STRUCTURE_VALIDATION_ENABLED === 'true';
    }
    
    if (process.env.CONTENT_VALIDATION_ENABLED !== undefined) {
      envFlags.contentValidation = process.env.CONTENT_VALIDATION_ENABLED === 'true';
    }
    
    if (process.env.BUSINESS_RULE_VALIDATION_ENABLED !== undefined) {
      envFlags.businessRuleValidation = process.env.BUSINESS_RULE_VALIDATION_ENABLED === 'true';
    }
    
    if (process.env.FORMAT_VALIDATION_ENABLED !== undefined) {
      envFlags.formatValidation = process.env.FORMAT_VALIDATION_ENABLED === 'true';
    }
    
    // Advanced features
    if (process.env.RETRY_ON_VALIDATION_FAILURE !== undefined) {
      envFlags.retryOnValidationFailure = process.env.RETRY_ON_VALIDATION_FAILURE === 'true';
    }
    
    if (process.env.FALLBACK_TO_LEGACY_SYSTEM !== undefined) {
      envFlags.fallbackToLegacySystem = process.env.FALLBACK_TO_LEGACY_SYSTEM === 'true';
    }
    
    if (process.env.ENHANCED_PROMPT_ON_RETRY !== undefined) {
      envFlags.enhancedPromptOnRetry = process.env.ENHANCED_PROMPT_ON_RETRY === 'true';
    }
    
    // Monitoring
    if (process.env.VALIDATION_METRICS_COLLECTION !== undefined) {
      envFlags.metricsCollection = process.env.VALIDATION_METRICS_COLLECTION === 'true';
    }
    
    if (process.env.VALIDATION_PERFORMANCE_MONITORING !== undefined) {
      envFlags.performanceMonitoring = process.env.VALIDATION_PERFORMANCE_MONITORING === 'true';
    }
    
    if (process.env.VALIDATION_ALERTING !== undefined) {
      envFlags.alerting = process.env.VALIDATION_ALERTING === 'true';
    }
    
    // Template-specific flags
    if (process.env.STANDARD_PERSONA_VALIDATION !== undefined) {
      envFlags.standardPersonaValidation = process.env.STANDARD_PERSONA_VALIDATION === 'true';
    }
    
    if (process.env.B2B_PERSONA_VALIDATION !== undefined) {
      envFlags.b2bPersonaValidation = process.env.B2B_PERSONA_VALIDATION === 'true';
    }
    
    if (process.env.SIMPLE_PERSONA_VALIDATION !== undefined) {
      envFlags.simplePersonaValidation = process.env.SIMPLE_PERSONA_VALIDATION === 'true';
    }
    
    // Debug flags
    if (process.env.VALIDATION_DEBUG_MODE !== undefined) {
      envFlags.debugMode = process.env.VALIDATION_DEBUG_MODE === 'true';
    }
    
    if (process.env.VALIDATION_VERBOSE_LOGGING !== undefined) {
      envFlags.verboseLogging = process.env.VALIDATION_VERBOSE_LOGGING === 'true';
    }
    
    return envFlags;
  }

  /**
   * Get all feature flags
   */
  getFlags(): ValidationFeatureFlags {
    return { ...this.flags };
  }

  /**
   * Check if validation is enabled
   */
  isValidationEnabled(): boolean {
    return this.flags.validationEnabled;
  }

  /**
   * Check if a specific validation type is enabled
   */
  isValidationTypeEnabled(type: 'structure' | 'content' | 'business' | 'format'): boolean {
    if (!this.flags.validationEnabled) {
      return false;
    }
    
    switch (type) {
      case 'structure':
        return this.flags.structureValidation;
      case 'content':
        return this.flags.contentValidation;
      case 'business':
        return this.flags.businessRuleValidation;
      case 'format':
        return this.flags.formatValidation;
      default:
        return false;
    }
  }

  /**
   * Check if validation is enabled for a specific persona type
   */
  isPersonaValidationEnabled(personaType: 'simple' | 'standard' | 'b2b'): boolean {
    if (!this.flags.validationEnabled) {
      return false;
    }
    
    switch (personaType) {
      case 'simple':
        return this.flags.simplePersonaValidation;
      case 'standard':
        return this.flags.standardPersonaValidation;
      case 'b2b':
        return this.flags.b2bPersonaValidation;
      default:
        return false;
    }
  }

  /**
   * Check if retry on validation failure is enabled
   */
  isRetryEnabled(): boolean {
    return this.flags.validationEnabled && this.flags.retryOnValidationFailure;
  }

  /**
   * Check if fallback to legacy system is enabled
   */
  isFallbackEnabled(): boolean {
    return this.flags.fallbackToLegacySystem;
  }

  /**
   * Check if enhanced prompt on retry is enabled
   */
  isEnhancedPromptOnRetryEnabled(): boolean {
    return this.flags.validationEnabled && this.flags.enhancedPromptOnRetry;
  }

  /**
   * Check if metrics collection is enabled
   */
  isMetricsCollectionEnabled(): boolean {
    return this.flags.metricsCollection;
  }

  /**
   * Check if performance monitoring is enabled
   */
  isPerformanceMonitoringEnabled(): boolean {
    return this.flags.performanceMonitoring;
  }

  /**
   * Check if alerting is enabled
   */
  isAlertingEnabled(): boolean {
    return this.flags.alerting;
  }

  /**
   * Check if debug mode is enabled
   */
  isDebugModeEnabled(): boolean {
    return this.flags.debugMode;
  }

  /**
   * Check if verbose logging is enabled
   */
  isVerboseLoggingEnabled(): boolean {
    return this.flags.verboseLogging;
  }

  /**
   * Update feature flags at runtime (for testing or admin interfaces)
   */
  updateFlags(updates: Partial<ValidationFeatureFlags>): void {
    this.flags = { ...this.flags, ...updates };
  }

  /**
   * Reset flags to defaults
   */
  resetToDefaults(): void {
    this.flags = this.loadFeatureFlags();
  }

  /**
   * Get current environment
   */
  getEnvironment(): string {
    return this.environment;
  }

  /**
   * Get validation configuration based on current flags
   */
  getValidationConfig(): {
    enableValidation: boolean;
    enableRetry: boolean;
    enableFallback: boolean;
    enableMetrics: boolean;
    debugMode: boolean;
  } {
    return {
      enableValidation: this.flags.validationEnabled,
      enableRetry: this.flags.retryOnValidationFailure,
      enableFallback: this.flags.fallbackToLegacySystem,
      enableMetrics: this.flags.metricsCollection,
      debugMode: this.flags.debugMode,
    };
  }
}

/**
 * Global feature flags manager instance
 */
export const validationFeatureFlags = new ValidationFeatureFlagsManager();

/**
 * Convenience functions for common checks
 */
export const isValidationEnabled = () => validationFeatureFlags.isValidationEnabled();
export const isValidationTypeEnabled = (type: 'structure' | 'content' | 'business' | 'format') => 
  validationFeatureFlags.isValidationTypeEnabled(type);
export const isPersonaValidationEnabled = (personaType: 'simple' | 'standard' | 'b2b') => 
  validationFeatureFlags.isPersonaValidationEnabled(personaType);
export const isFallbackEnabled = () => validationFeatureFlags.isFallbackEnabled();
export const isDebugModeEnabled = () => validationFeatureFlags.isDebugModeEnabled();