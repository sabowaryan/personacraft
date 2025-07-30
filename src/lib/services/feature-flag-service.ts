/**
 * FeatureFlagService - Service for managing feature flags related to Qloo-first persona generation
 * 
 * This service provides methods to check the status of various feature flags
 * that control the behavior of the new Qloo-first persona generation flow.
 */

interface FeatureFlags {
  qlooFirstGeneration: boolean;
  qlooFirstFallbackEnabled: boolean;
  qlooFirstDebugMode: boolean;
}

interface QlooFirstConfig {
  enabled: boolean;
  fallbackEnabled: boolean;
  debugMode: boolean;
  batchSize: number;
  maxParallelRequests: number;
  cacheTTL: number;
  supportedLanguages: ('fr' | 'en')[];
}

export class FeatureFlagService {
  private static instance: FeatureFlagService;
  private config: QlooFirstConfig;

  private constructor() {
    this.config = this.loadConfiguration();
  }

  /**
   * Get singleton instance of FeatureFlagService
   */
  public static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  /**
   * Check if Qloo-first persona generation is enabled
   */
  public isQlooFirstEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Check if fallback to legacy flow should be used on error
   */
  public shouldFallbackOnError(): boolean {
    return this.config.fallbackEnabled;
  }

  /**
   * Check if debug mode is enabled for additional logging
   */
  public isDebugModeEnabled(): boolean {
    return this.config.debugMode;
  }

  /**
   * Get all feature flags as a structured object
   */
  public getFeatureFlags(): FeatureFlags {
    return {
      qlooFirstGeneration: this.config.enabled,
      qlooFirstFallbackEnabled: this.config.fallbackEnabled,
      qlooFirstDebugMode: this.config.debugMode,
    };
  }

  /**
   * Get the complete configuration object
   */
  public getConfig(): QlooFirstConfig {
    return { ...this.config };
  }

  /**
   * Reload configuration from environment variables
   * Useful for testing or runtime configuration changes
   */
  public reloadConfiguration(): void {
    this.config = this.loadConfiguration();
  }

  /**
   * Load configuration from environment variables with defaults
   */
  private loadConfiguration(): QlooFirstConfig {
    return {
      enabled: this.parseBoolean(process.env.QLOO_FIRST_GENERATION_ENABLED, false),
      fallbackEnabled: this.parseBoolean(process.env.QLOO_FIRST_FALLBACK_ENABLED, true),
      debugMode: this.parseBoolean(process.env.QLOO_FIRST_DEBUG_MODE, false),
      batchSize: this.parseNumber(process.env.QLOO_FIRST_BATCH_SIZE, 5),
      maxParallelRequests: this.parseNumber(process.env.QLOO_FIRST_PARALLEL_REQUESTS, 3),
      cacheTTL: this.parseNumber(process.env.QLOO_FIRST_CACHE_TTL, 3600),
      supportedLanguages: ['fr', 'en'],
    };
  }

  /**
   * Parse boolean environment variable with default fallback
   */
  private parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
    if (value === undefined || value === '') {
      return defaultValue;
    }
    return value.toLowerCase() === 'true' || value === '1';
  }

  /**
   * Parse number environment variable with default fallback
   */
  private parseNumber(value: string | undefined, defaultValue: number): number {
    if (value === undefined || value === '') {
      return defaultValue;
    }
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Validate that the current configuration is valid
   */
  public validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.config.batchSize <= 0) {
      errors.push('QLOO_FIRST_BATCH_SIZE must be greater than 0');
    }

    if (this.config.maxParallelRequests <= 0) {
      errors.push('QLOO_FIRST_PARALLEL_REQUESTS must be greater than 0');
    }

    if (this.config.cacheTTL < 0) {
      errors.push('QLOO_FIRST_CACHE_TTL must be greater than or equal to 0');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Log current configuration (useful for debugging)
   */
  public logConfiguration(): void {
    if (this.config.debugMode) {
      console.log('[FeatureFlagService] Current configuration:', {
        enabled: this.config.enabled,
        fallbackEnabled: this.config.fallbackEnabled,
        debugMode: this.config.debugMode,
        batchSize: this.config.batchSize,
        maxParallelRequests: this.config.maxParallelRequests,
        cacheTTL: this.config.cacheTTL,
        supportedLanguages: this.config.supportedLanguages,
      });
    }
  }
}

// Export a default instance for convenience
export const featureFlagService = FeatureFlagService.getInstance();

// Export types for use in other modules
export type { FeatureFlags, QlooFirstConfig };