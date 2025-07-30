/**
 * Example usage of FeatureFlagService
 * 
 * This file demonstrates how to use the FeatureFlagService in different scenarios
 * within the Qloo-first persona generation flow.
 */

import { featureFlagService, FeatureFlagService } from './feature-flag-service';

// Example 1: Basic usage with the default instance
export function checkQlooFirstFlow(): boolean {
  // Simple check if the new flow should be used
  return featureFlagService.isQlooFirstEnabled();
}

// Example 2: Comprehensive flow control
export function determineGenerationStrategy(): 'qloo-first' | 'legacy' | 'disabled' {
  if (!featureFlagService.isQlooFirstEnabled()) {
    return 'legacy';
  }
  
  // Additional validation
  const validation = featureFlagService.validateConfiguration();
  if (!validation.isValid) {
    console.error('Invalid Qloo-first configuration:', validation.errors);
    return featureFlagService.shouldFallbackOnError() ? 'legacy' : 'disabled';
  }
  
  return 'qloo-first';
}

// Example 3: Debug logging
export function logFeatureFlagStatus(): void {
  if (featureFlagService.isDebugModeEnabled()) {
    console.log('[Debug] Feature flag status:', featureFlagService.getFeatureFlags());
    featureFlagService.logConfiguration();
  }
}

// Example 4: Error handling with fallback
export async function generatePersonasWithFeatureFlags(briefFormData: any): Promise<any> {
  const strategy = determineGenerationStrategy();
  
  switch (strategy) {
    case 'qloo-first':
      try {
        logFeatureFlagStatus();
        // Use new Qloo-first flow
        console.log('Using Qloo-first persona generation');
        // return await qlooFirstPersonaGenerator.generatePersonas(briefFormData);
        return { source: 'qloo-first', personas: [] }; // Placeholder
      } catch (error) {
        if (featureFlagService.shouldFallbackOnError()) {
          console.warn('Qloo-first flow failed, falling back to legacy:', error);
          // return await legacyPersonaGenerator.generatePersonas(briefFormData);
          return { source: 'legacy-fallback', personas: [] }; // Placeholder
        }
        throw error;
      }
    
    case 'legacy':
      console.log('Using legacy persona generation');
      // return await legacyPersonaGenerator.generatePersonas(briefFormData);
      return { source: 'legacy', personas: [] }; // Placeholder
    
    case 'disabled':
      throw new Error('Persona generation is disabled due to invalid configuration');
  }
}

// Example 5: Configuration monitoring
export function monitorConfiguration(): void {
  const service = FeatureFlagService.getInstance();
  const config = service.getConfig();
  
  // Log configuration for monitoring
  console.log('Qloo-first configuration:', {
    enabled: config.enabled,
    fallbackEnabled: config.fallbackEnabled,
    debugMode: config.debugMode,
    performance: {
      batchSize: config.batchSize,
      maxParallelRequests: config.maxParallelRequests,
      cacheTTL: config.cacheTTL,
    },
  });
  
  // Validate configuration
  const validation = service.validateConfiguration();
  if (!validation.isValid) {
    console.error('Configuration validation failed:', validation.errors);
  }
}

// Example 6: Runtime configuration updates (for testing)
export function updateConfigurationForTesting(overrides: Record<string, string>): () => void {
  // Save current environment
  const originalEnv = { ...process.env };
  
  // Apply overrides
  Object.entries(overrides).forEach(([key, value]) => {
    process.env[key] = value;
  });
  
  // Reload configuration
  featureFlagService.reloadConfiguration();
  
  // Return cleanup function
  return () => {
    // Restore original environment
    Object.keys(overrides).forEach(key => {
      if (originalEnv[key] !== undefined) {
        process.env[key] = originalEnv[key];
      } else {
        delete process.env[key];
      }
    });
    featureFlagService.reloadConfiguration();
  };
}

// Example 7: Feature flag middleware (for API routes)
export function createFeatureFlagMiddleware() {
  return (req: any, res: any, next: any) => {
    // Add feature flag information to request context
    req.featureFlags = featureFlagService.getFeatureFlags();
    req.qlooFirstConfig = featureFlagService.getConfig();
    
    // Add helper methods
    req.isQlooFirstEnabled = () => featureFlagService.isQlooFirstEnabled();
    req.shouldFallbackOnError = () => featureFlagService.shouldFallbackOnError();
    
    next();
  };
}