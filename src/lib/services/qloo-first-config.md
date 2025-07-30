# Qloo-First Persona Generation Configuration

This document describes the configuration options for the Qloo-First persona generation feature.

## Environment Variables

### Feature Flags

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `QLOO_FIRST_GENERATION_ENABLED` | boolean | `false` | Enables the new Qloo-first persona generation flow |
| `QLOO_FIRST_FALLBACK_ENABLED` | boolean | `true` | Enables fallback to legacy flow when Qloo-first fails |
| `QLOO_FIRST_DEBUG_MODE` | boolean | `false` | Enables debug logging for the Qloo-first flow |

### Performance Tuning

| Variable | Type | Default | Min | Max | Description |
|----------|------|---------|-----|-----|-------------|
| `QLOO_FIRST_BATCH_SIZE` | number | `5` | 1 | 20 | Number of entities to request per Qloo API call |
| `QLOO_FIRST_PARALLEL_REQUESTS` | number | `3` | 1 | 10 | Maximum number of parallel Qloo API requests |
| `QLOO_FIRST_CACHE_TTL` | number | `3600` | 60 | 86400 | Cache TTL in seconds for Qloo responses |

## Configuration Interface

```typescript
interface QlooFirstConfig {
  enabled: boolean;
  fallbackEnabled: boolean;
  debugMode: boolean;
  batchSize: number;
  maxParallelRequests: number;
  cacheTTL: number;
  supportedLanguages: ('fr' | 'en')[];
}
```

## Usage

### Basic Usage

```typescript
import { featureFlagService } from '@/lib/services/feature-flag-service';

// Check if Qloo-first is enabled
if (featureFlagService.isQlooFirstEnabled()) {
  // Use new flow
} else {
  // Use legacy flow
}

// Check if fallback is enabled
if (featureFlagService.shouldFallbackOnError()) {
  // Implement fallback logic
}

// Check debug mode
if (featureFlagService.isDebugModeEnabled()) {
  console.log('Debug mode is enabled');
}
```

### Getting Full Configuration

```typescript
import { featureFlagService } from '@/lib/services/feature-flag-service';

const config = featureFlagService.getConfig();
console.log('Batch size:', config.batchSize);
console.log('Max parallel requests:', config.maxParallelRequests);
console.log('Cache TTL:', config.cacheTTL);
```

### Getting Feature Flags Object

```typescript
import { featureFlagService } from '@/lib/services/feature-flag-service';

const flags = featureFlagService.getFeatureFlags();
console.log('Feature flags:', flags);
// Output: { qlooFirstGeneration: false, qlooFirstFallbackEnabled: true, qlooFirstDebugMode: false }
```

## Configuration Validation

The service automatically validates configuration on startup:

- `batchSize` must be greater than 0
- `maxParallelRequests` must be greater than 0  
- `cacheTTL` must be greater than or equal to 0

Invalid values will result in errors being thrown during service initialization.

## Environment Setup

### Development

```bash
# Enable Qloo-first for development testing
QLOO_FIRST_GENERATION_ENABLED=true
QLOO_FIRST_DEBUG_MODE=true

# Use smaller batch sizes for development
QLOO_FIRST_BATCH_SIZE=3
QLOO_FIRST_PARALLEL_REQUESTS=2
```

### Production

```bash
# Gradual rollout - start disabled
QLOO_FIRST_GENERATION_ENABLED=false
QLOO_FIRST_FALLBACK_ENABLED=true
QLOO_FIRST_DEBUG_MODE=false

# Optimized for production
QLOO_FIRST_BATCH_SIZE=5
QLOO_FIRST_PARALLEL_REQUESTS=3
QLOO_FIRST_CACHE_TTL=3600
```

### Testing

```bash
# Enable all features for comprehensive testing
QLOO_FIRST_GENERATION_ENABLED=true
QLOO_FIRST_FALLBACK_ENABLED=true
QLOO_FIRST_DEBUG_MODE=true

# Smaller values for faster test execution
QLOO_FIRST_BATCH_SIZE=2
QLOO_FIRST_PARALLEL_REQUESTS=1
QLOO_FIRST_CACHE_TTL=60
```

## Runtime Configuration Changes

The service supports runtime configuration reloading:

```typescript
import { featureFlagService } from '@/lib/services/feature-flag-service';

// Reload configuration from environment variables
featureFlagService.reloadConfiguration();
```

This is particularly useful for testing scenarios where you need to change configuration without restarting the application.

## Troubleshooting

### Common Issues

1. **Feature not enabled**: Check that `QLOO_FIRST_GENERATION_ENABLED=true`
2. **Performance issues**: Adjust `QLOO_FIRST_BATCH_SIZE` and `QLOO_FIRST_PARALLEL_REQUESTS`
3. **Cache issues**: Modify `QLOO_FIRST_CACHE_TTL` or set to 0 to disable caching
4. **Debug information**: Enable `QLOO_FIRST_DEBUG_MODE=true` for detailed logging

### Validation Errors

If you encounter validation errors on startup:

- Ensure all numeric values are positive integers
- Check that boolean values are 'true' or 'false'
- Verify environment variables are properly set

### Logging

When debug mode is enabled, the service will log:
- Current configuration on startup
- Feature flag status changes
- Configuration validation results