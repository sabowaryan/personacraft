import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FeatureFlagService } from './feature-flag-service';

describe('FeatureFlagService', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    
    // Clear environment variables
    delete process.env.QLOO_FIRST_GENERATION_ENABLED;
    delete process.env.QLOO_FIRST_FALLBACK_ENABLED;
    delete process.env.QLOO_FIRST_DEBUG_MODE;
    delete process.env.QLOO_FIRST_BATCH_SIZE;
    delete process.env.QLOO_FIRST_PARALLEL_REQUESTS;
    delete process.env.QLOO_FIRST_CACHE_TTL;

    // Reset singleton instance
    (FeatureFlagService as any).instance = undefined;
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    
    // Reset singleton instance
    (FeatureFlagService as any).instance = undefined;
  });

  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      const instance1 = FeatureFlagService.getInstance();
      const instance2 = FeatureFlagService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('default configuration', () => {
    it('should use default values when environment variables are not set', () => {
      const service = FeatureFlagService.getInstance();
      
      expect(service.isQlooFirstEnabled()).toBe(false);
      expect(service.shouldFallbackOnError()).toBe(true);
      expect(service.isDebugModeEnabled()).toBe(false);
      
      const config = service.getConfig();
      expect(config.batchSize).toBe(5);
      expect(config.maxParallelRequests).toBe(3);
      expect(config.cacheTTL).toBe(3600);
      expect(config.supportedLanguages).toEqual(['fr', 'en']);
    });
  });

  describe('environment variable parsing', () => {
    it('should parse boolean environment variables correctly', () => {
      process.env.QLOO_FIRST_GENERATION_ENABLED = 'true';
      process.env.QLOO_FIRST_FALLBACK_ENABLED = 'false';
      process.env.QLOO_FIRST_DEBUG_MODE = '1';
      
      const service = FeatureFlagService.getInstance();
      
      expect(service.isQlooFirstEnabled()).toBe(true);
      expect(service.shouldFallbackOnError()).toBe(false);
      expect(service.isDebugModeEnabled()).toBe(true);
    });

    it('should parse number environment variables correctly', () => {
      process.env.QLOO_FIRST_BATCH_SIZE = '10';
      process.env.QLOO_FIRST_PARALLEL_REQUESTS = '5';
      process.env.QLOO_FIRST_CACHE_TTL = '7200';
      
      const service = FeatureFlagService.getInstance();
      const config = service.getConfig();
      
      expect(config.batchSize).toBe(10);
      expect(config.maxParallelRequests).toBe(5);
      expect(config.cacheTTL).toBe(7200);
    });

    it('should handle invalid boolean values gracefully', () => {
      process.env.QLOO_FIRST_GENERATION_ENABLED = 'invalid';
      process.env.QLOO_FIRST_FALLBACK_ENABLED = '';
      
      const service = FeatureFlagService.getInstance();
      
      expect(service.isQlooFirstEnabled()).toBe(false);
      expect(service.shouldFallbackOnError()).toBe(true); // default value
    });

    it('should handle invalid number values gracefully', () => {
      process.env.QLOO_FIRST_BATCH_SIZE = 'invalid';
      process.env.QLOO_FIRST_PARALLEL_REQUESTS = '';
      process.env.QLOO_FIRST_CACHE_TTL = 'not-a-number';
      
      const service = FeatureFlagService.getInstance();
      const config = service.getConfig();
      
      expect(config.batchSize).toBe(5); // default value
      expect(config.maxParallelRequests).toBe(3); // default value
      expect(config.cacheTTL).toBe(3600); // default value
    });
  });

  describe('getFeatureFlags', () => {
    it('should return structured feature flags object', () => {
      process.env.QLOO_FIRST_GENERATION_ENABLED = 'true';
      process.env.QLOO_FIRST_FALLBACK_ENABLED = 'false';
      process.env.QLOO_FIRST_DEBUG_MODE = 'true';
      
      const service = FeatureFlagService.getInstance();
      const flags = service.getFeatureFlags();
      
      expect(flags).toEqual({
        qlooFirstGeneration: true,
        qlooFirstFallbackEnabled: false,
        qlooFirstDebugMode: true,
      });
    });
  });

  describe('reloadConfiguration', () => {
    it('should reload configuration from updated environment variables', () => {
      const service = FeatureFlagService.getInstance();
      
      // Initial state
      expect(service.isQlooFirstEnabled()).toBe(false);
      
      // Update environment
      process.env.QLOO_FIRST_GENERATION_ENABLED = 'true';
      
      // Should still be false before reload
      expect(service.isQlooFirstEnabled()).toBe(false);
      
      // Reload configuration
      service.reloadConfiguration();
      
      // Should now be true
      expect(service.isQlooFirstEnabled()).toBe(true);
    });
  });

  describe('validateConfiguration', () => {
    it('should validate configuration successfully with valid values', () => {
      process.env.QLOO_FIRST_BATCH_SIZE = '5';
      process.env.QLOO_FIRST_PARALLEL_REQUESTS = '3';
      process.env.QLOO_FIRST_CACHE_TTL = '3600';
      
      const service = FeatureFlagService.getInstance();
      const validation = service.validateConfiguration();
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should return validation errors for invalid batch size', () => {
      process.env.QLOO_FIRST_BATCH_SIZE = '0';
      
      const service = FeatureFlagService.getInstance();
      const validation = service.validateConfiguration();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('QLOO_FIRST_BATCH_SIZE must be greater than 0');
    });

    it('should return validation errors for invalid parallel requests', () => {
      process.env.QLOO_FIRST_PARALLEL_REQUESTS = '-1';
      
      const service = FeatureFlagService.getInstance();
      const validation = service.validateConfiguration();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('QLOO_FIRST_PARALLEL_REQUESTS must be greater than 0');
    });

    it('should return validation errors for invalid cache TTL', () => {
      process.env.QLOO_FIRST_CACHE_TTL = '-100';
      
      const service = FeatureFlagService.getInstance();
      const validation = service.validateConfiguration();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('QLOO_FIRST_CACHE_TTL must be greater than or equal to 0');
    });

    it('should return multiple validation errors', () => {
      process.env.QLOO_FIRST_BATCH_SIZE = '0';
      process.env.QLOO_FIRST_PARALLEL_REQUESTS = '-1';
      process.env.QLOO_FIRST_CACHE_TTL = '-100';
      
      const service = FeatureFlagService.getInstance();
      const validation = service.validateConfiguration();
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveLength(3);
    });
  });

  describe('logConfiguration', () => {
    it('should log configuration when debug mode is enabled', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      process.env.QLOO_FIRST_DEBUG_MODE = 'true';
      
      const service = FeatureFlagService.getInstance();
      service.logConfiguration();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[FeatureFlagService] Current configuration:',
        expect.objectContaining({
          enabled: false,
          fallbackEnabled: true,
          debugMode: true,
          batchSize: 5,
          maxParallelRequests: 3,
          cacheTTL: 3600,
          supportedLanguages: ['fr', 'en'],
        })
      );
      
      consoleSpy.mockRestore();
    });

    it('should not log configuration when debug mode is disabled', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      process.env.QLOO_FIRST_DEBUG_MODE = 'false';
      
      const service = FeatureFlagService.getInstance();
      service.logConfiguration();
      
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('edge cases', () => {
    it('should handle empty string environment variables', () => {
      process.env.QLOO_FIRST_GENERATION_ENABLED = '';
      process.env.QLOO_FIRST_BATCH_SIZE = '';
      
      const service = FeatureFlagService.getInstance();
      const config = service.getConfig();
      
      expect(service.isQlooFirstEnabled()).toBe(false);
      expect(config.batchSize).toBe(5);
    });

    it('should handle zero cache TTL as valid', () => {
      process.env.QLOO_FIRST_CACHE_TTL = '0';
      
      const service = FeatureFlagService.getInstance();
      const validation = service.validateConfiguration();
      
      expect(validation.isValid).toBe(true);
      expect(service.getConfig().cacheTTL).toBe(0);
    });
  });
});