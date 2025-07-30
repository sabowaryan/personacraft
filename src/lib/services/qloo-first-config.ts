/**
 * Qloo-First Configuration Constants and Types
 * 
 * This module provides configuration constants, types, and utilities
 * for the Qloo-First persona generation feature.
 */

import { featureFlagService, type FeatureFlags, type QlooFirstConfig } from './feature-flag-service';

// Re-export types for easy access
export type { FeatureFlags, QlooFirstConfig };

// Re-export the service instance
export { featureFlagService };

/**
 * Configuration constants for Qloo-First feature
 */
export const QLOO_FIRST_CONFIG = {
  // Environment variable names
  ENV_VARS: {
    GENERATION_ENABLED: 'QLOO_FIRST_GENERATION_ENABLED',
    FALLBACK_ENABLED: 'QLOO_FIRST_FALLBACK_ENABLED',
    DEBUG_MODE: 'QLOO_FIRST_DEBUG_MODE',
    BATCH_SIZE: 'QLOO_FIRST_BATCH_SIZE',
    PARALLEL_REQUESTS: 'QLOO_FIRST_PARALLEL_REQUESTS',
    CACHE_TTL: 'QLOO_FIRST_CACHE_TTL',
  },

  // Default values
  DEFAULTS: {
    GENERATION_ENABLED: false,
    FALLBACK_ENABLED: true,
    DEBUG_MODE: false,
    BATCH_SIZE: 5,
    PARALLEL_REQUESTS: 3,
    CACHE_TTL: 3600,
    SUPPORTED_LANGUAGES: ['fr', 'en'] as const,
  },

  // Validation constraints
  CONSTRAINTS: {
    BATCH_SIZE: { min: 1, max: 20 },
    PARALLEL_REQUESTS: { min: 1, max: 10 },
    CACHE_TTL: { min: 60, max: 86400 },
  },
} as const;

/**
 * Utility functions for working with Qloo-First configuration
 */
export const qlooFirstConfigUtils = {
  /**
   * Check if Qloo-First generation is enabled
   */
  isEnabled: (): boolean => featureFlagService.isQlooFirstEnabled(),

  /**
   * Check if fallback to legacy flow is enabled
   */
  shouldFallback: (): boolean => featureFlagService.shouldFallbackOnError(),

  /**
   * Check if debug mode is enabled
   */
  isDebugMode: (): boolean => featureFlagService.isDebugModeEnabled(),

  /**
   * Get the current configuration
   */
  getConfig: (): QlooFirstConfig => featureFlagService.getConfig(),

  /**
   * Get feature flags as a structured object
   */
  getFeatureFlags: (): FeatureFlags => featureFlagService.getFeatureFlags(),

  /**
   * Validate the current configuration
   */
  validateConfig: (): { isValid: boolean; errors: string[] } => 
    featureFlagService.validateConfiguration(),

  /**
   * Log current configuration (only in debug mode)
   */
  logConfig: (): void => featureFlagService.logConfiguration(),

  /**
   * Reload configuration from environment variables
   */
  reloadConfig: (): void => featureFlagService.reloadConfiguration(),
};

/**
 * Configuration validation helper
 */
export const validateQlooFirstConfig = (config: Partial<QlooFirstConfig>): string[] => {
  const errors: string[] = [];

  if (config.batchSize !== undefined && config.batchSize <= 0) {
    errors.push('batchSize must be greater than 0');
  }

  if (config.maxParallelRequests !== undefined && config.maxParallelRequests <= 0) {
    errors.push('maxParallelRequests must be greater than 0');
  }

  if (config.cacheTTL !== undefined && config.cacheTTL < 0) {
    errors.push('cacheTTL must be greater than or equal to 0');
  }

  if (config.supportedLanguages !== undefined && config.supportedLanguages.length === 0) {
    errors.push('supportedLanguages must contain at least one language');
  }

  return errors;
};

/**
 * Environment variable documentation for reference
 */
export const ENV_VAR_DOCS = {
  QLOO_FIRST_GENERATION_ENABLED: {
    type: 'boolean',
    default: 'false',
    description: 'Enables the new Qloo-first persona generation flow',
  },
  QLOO_FIRST_FALLBACK_ENABLED: {
    type: 'boolean', 
    default: 'true',
    description: 'Enables fallback to legacy flow when Qloo-first fails',
  },
  QLOO_FIRST_DEBUG_MODE: {
    type: 'boolean',
    default: 'false', 
    description: 'Enables debug logging for the Qloo-first flow',
  },
  QLOO_FIRST_BATCH_SIZE: {
    type: 'number',
    default: '5',
    description: 'Number of entities to request per Qloo API call',
    constraints: 'Min: 1, Max: 20',
  },
  QLOO_FIRST_PARALLEL_REQUESTS: {
    type: 'number',
    default: '3',
    description: 'Maximum number of parallel Qloo API requests',
    constraints: 'Min: 1, Max: 10',
  },
  QLOO_FIRST_CACHE_TTL: {
    type: 'number',
    default: '3600',
    description: 'Cache TTL in seconds for Qloo responses',
    constraints: 'Min: 60, Max: 86400',
  },
} as const;