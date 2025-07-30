import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FeatureFlagService, featureFlagService } from './feature-flag-service';

describe('FeatureFlagService Integration', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    (FeatureFlagService as any).instance = undefined;
  });

  afterEach(() => {
    process.env = originalEnv;
    (FeatureFlagService as any).instance = undefined;
  });

  it('should work with the exported default instance', () => {
    process.env.QLOO_FIRST_GENERATION_ENABLED = 'true';
    process.env.QLOO_FIRST_DEBUG_MODE = 'true';
    
    // Force reload to pick up new environment variables
    featureFlagService.reloadConfiguration();
    
    expect(featureFlagService.isQlooFirstEnabled()).toBe(true);
    expect(featureFlagService.isDebugModeEnabled()).toBe(true);
    expect(featureFlagService.shouldFallbackOnError()).toBe(true); // default
  });

  it('should provide consistent behavior across multiple calls', () => {
    process.env.QLOO_FIRST_GENERATION_ENABLED = 'true';
    process.env.QLOO_FIRST_FALLBACK_ENABLED = 'false';
    
    const service = FeatureFlagService.getInstance();
    
    // Multiple calls should return consistent results
    expect(service.isQlooFirstEnabled()).toBe(true);
    expect(service.isQlooFirstEnabled()).toBe(true);
    expect(service.shouldFallbackOnError()).toBe(false);
    expect(service.shouldFallbackOnError()).toBe(false);
  });

  it('should handle production-like environment configuration', () => {
    // Simulate production environment
    process.env.QLOO_FIRST_GENERATION_ENABLED = 'true';
    process.env.QLOO_FIRST_FALLBACK_ENABLED = 'true';
    process.env.QLOO_FIRST_DEBUG_MODE = 'false';
    process.env.QLOO_FIRST_BATCH_SIZE = '10';
    process.env.QLOO_FIRST_PARALLEL_REQUESTS = '5';
    process.env.QLOO_FIRST_CACHE_TTL = '7200';
    
    const service = FeatureFlagService.getInstance();
    const config = service.getConfig();
    const validation = service.validateConfiguration();
    
    expect(service.isQlooFirstEnabled()).toBe(true);
    expect(service.shouldFallbackOnError()).toBe(true);
    expect(service.isDebugModeEnabled()).toBe(false);
    expect(config.batchSize).toBe(10);
    expect(config.maxParallelRequests).toBe(5);
    expect(config.cacheTTL).toBe(7200);
    expect(validation.isValid).toBe(true);
  });

  it('should handle development-like environment configuration', () => {
    // Simulate development environment
    process.env.QLOO_FIRST_GENERATION_ENABLED = 'false';
    process.env.QLOO_FIRST_FALLBACK_ENABLED = 'true';
    process.env.QLOO_FIRST_DEBUG_MODE = 'true';
    
    const service = FeatureFlagService.getInstance();
    
    expect(service.isQlooFirstEnabled()).toBe(false);
    expect(service.shouldFallbackOnError()).toBe(true);
    expect(service.isDebugModeEnabled()).toBe(true);
    
    const flags = service.getFeatureFlags();
    expect(flags.qlooFirstGeneration).toBe(false);
    expect(flags.qlooFirstFallbackEnabled).toBe(true);
    expect(flags.qlooFirstDebugMode).toBe(true);
  });
});