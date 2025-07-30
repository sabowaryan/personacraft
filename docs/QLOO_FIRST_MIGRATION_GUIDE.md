# Qloo-First Persona Generation Migration Guide

This guide helps you migrate to the new Qloo-First persona generation feature while maintaining backward compatibility and ensuring a smooth transition.

## Overview

The Qloo-First persona generation feature introduces a new flow that prioritizes cultural data from Qloo API before generating personas with Gemini. This migration guide covers:

- Understanding the differences between flows
- Gradual rollout strategies
- Monitoring and validation
- Troubleshooting common issues

## Migration Strategy

### Phase 1: Preparation and Testing

#### 1.1 Environment Setup

First, add the new environment variables to your configuration:

```bash
# Feature flags (start with disabled)
QLOO_FIRST_GENERATION_ENABLED=false
QLOO_FIRST_FALLBACK_ENABLED=true
QLOO_FIRST_DEBUG_MODE=false

# Performance tuning (conservative settings)
QLOO_FIRST_BATCH_SIZE=3
QLOO_FIRST_PARALLEL_REQUESTS=2
QLOO_FIRST_CACHE_TTL=3600
```

#### 1.2 Development Environment Testing

Enable the feature in development for testing:

```bash
# Development environment
QLOO_FIRST_GENERATION_ENABLED=true
QLOO_FIRST_DEBUG_MODE=true
```

Test with various BriefFormData combinations:

```typescript
// Test cases to validate
const testCases = [
  {
    brief: "Young professionals in tech",
    ageRange: { min: 25, max: 35 },
    location: "San Francisco, CA",
    language: "en",
    personaCount: 2,
    interests: ["technology", "fitness"],
    values: ["innovation", "work-life-balance"]
  },
  {
    brief: "Jeunes parents urbains",
    ageRange: { min: 30, max: 40 },
    location: "Paris, France",
    language: "fr",
    personaCount: 3,
    interests: ["family", "health"],
    values: ["security", "family-time"]
  }
];
```

#### 1.3 Validation Criteria

Validate that the new flow produces:

- **Coherent cultural data**: Music, brands, restaurants match location and age
- **Consistent interests**: Generated personas reflect specified interests
- **Appropriate values**: Personas embody the specified values
- **Proper fallback**: Legacy flow works when Qloo-First fails

### Phase 2: Staging Environment Validation

#### 2.1 Staging Configuration

```bash
# Staging environment
QLOO_FIRST_GENERATION_ENABLED=true
QLOO_FIRST_FALLBACK_ENABLED=true
QLOO_FIRST_DEBUG_MODE=false

# Optimized performance settings
QLOO_FIRST_BATCH_SIZE=5
QLOO_FIRST_PARALLEL_REQUESTS=3
QLOO_FIRST_CACHE_TTL=3600
```

#### 2.2 A/B Testing Setup

Implement feature flag-based A/B testing:

```typescript
// Example A/B testing logic
const useQlooFirst = Math.random() < 0.5; // 50% split

// Override environment variable for testing
process.env.QLOO_FIRST_GENERATION_ENABLED = useQlooFirst.toString();
```

#### 2.3 Performance Monitoring

Monitor key metrics during staging:

```typescript
// Metrics to track
interface MigrationMetrics {
  // Performance comparison
  qlooFirstAvgTime: number;
  legacyAvgTime: number;
  
  // Quality metrics
  qlooFirstSuccessRate: number;
  fallbackRate: number;
  
  // API usage
  qlooApiCallsPerRequest: number;
  cacheHitRate: number;
  
  // Error rates
  qlooFirstErrorRate: number;
  legacyErrorRate: number;
}
```

### Phase 3: Gradual Production Rollout

#### 3.1 Initial Rollout (10% Traffic)

Start with a small percentage of traffic:

```bash
# Production - Initial rollout
QLOO_FIRST_GENERATION_ENABLED=true
QLOO_FIRST_FALLBACK_ENABLED=true
QLOO_FIRST_DEBUG_MODE=false

# Conservative performance settings
QLOO_FIRST_BATCH_SIZE=3
QLOO_FIRST_PARALLEL_REQUESTS=2
QLOO_FIRST_CACHE_TTL=3600
```

Implement percentage-based rollout:

```typescript
// Rollout configuration
const ROLLOUT_PERCENTAGE = 10; // Start with 10%

function shouldUseQlooFirst(userId: string): boolean {
  // Use consistent hashing for stable user experience
  const hash = hashUserId(userId);
  return (hash % 100) < ROLLOUT_PERCENTAGE;
}
```

#### 3.2 Monitoring and Validation

Monitor these key indicators:

```typescript
// Critical metrics to watch
const criticalMetrics = {
  // User experience
  avgResponseTime: 'Should not increase significantly',
  errorRate: 'Should remain stable or improve',
  
  // Business metrics
  personaQuality: 'Should improve (measured by user feedback)',
  culturalRelevance: 'Should be higher than legacy',
  
  // Technical metrics
  qlooApiHealth: 'Monitor for rate limiting or failures',
  fallbackRate: 'Should be low (<5%)',
  cacheEffectiveness: 'Should improve over time'
};
```

#### 3.3 Incremental Rollout

Gradually increase the rollout percentage:

- Week 1: 10% traffic
- Week 2: 25% traffic (if metrics are good)
- Week 3: 50% traffic
- Week 4: 75% traffic
- Week 5: 100% traffic

### Phase 4: Full Migration

#### 4.1 Complete Rollout

```bash
# Production - Full rollout
QLOO_FIRST_GENERATION_ENABLED=true
QLOO_FIRST_FALLBACK_ENABLED=true
QLOO_FIRST_DEBUG_MODE=false

# Optimized performance settings
QLOO_FIRST_BATCH_SIZE=5
QLOO_FIRST_PARALLEL_REQUESTS=3
QLOO_FIRST_CACHE_TTL=3600
```

#### 4.2 Legacy Code Cleanup

After successful full rollout, plan for legacy code removal:

1. **Keep fallback enabled** for at least 1 month
2. **Monitor fallback usage** - should be minimal
3. **Plan legacy code removal** after stable operation
4. **Update documentation** to reflect new default behavior

## Frontend Migration

### No Changes Required

The API maintains full backward compatibility:

```typescript
// Existing code continues to work unchanged
const generatePersonas = async (briefFormData: BriefFormData) => {
  const response = await fetch('/api/generate-personas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(briefFormData)
  });
  
  const data = await response.json();
  return data.personas; // Same as before
};
```

### Optional Enhancements

You can optionally enhance your frontend to utilize new metadata:

```typescript
// Enhanced frontend with metadata usage
const generatePersonasEnhanced = async (briefFormData: BriefFormData) => {
  const response = await fetch('/api/generate-personas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(briefFormData)
  });
  
  const data = await response.json();
  
  // Optional: Show generation method to users
  if (data.generation.source === 'qloo-first') {
    console.log('✨ Enhanced cultural data used');
  }
  
  // Optional: Handle fallback scenarios
  if (data.fallback) {
    console.warn('Fallback used:', data.fallback.reason);
    // Maybe show a subtle indicator to users
  }
  
  // Optional: Performance monitoring
  if (data.performance) {
    analytics.track('persona_generation_performance', {
      processingTime: data.generation.processingTime,
      qlooApiCalls: data.performance.qlooApiCalls,
      cacheHitRate: data.performance.cacheHitRate
    });
  }
  
  return data.personas;
};
```

## Backend Integration Migration

### API Response Changes

The response structure is enhanced but backward compatible:

```typescript
// Before (still works)
interface LegacyResponse {
  success: boolean;
  personas: Persona[];
  // ... other existing fields
}

// After (enhanced, but legacy fields preserved)
interface EnhancedResponse extends LegacyResponse {
  timestamp: string;
  generation: GenerationMetadata;
  sources: SourceTracking;
  culturalConstraints: CulturalConstraintInfo;
  performance?: PerformanceMetrics;
  fallback?: FallbackInfo;
  featureFlags: FeatureFlagStatus;
}
```

### Integration Updates

Update your backend integrations to leverage new metadata:

```typescript
// Enhanced backend integration
const processPersonaGeneration = async (briefFormData: BriefFormData) => {
  const response = await callPersonaAPI(briefFormData);
  
  // Log generation metadata for monitoring
  logger.info('Persona generation completed', {
    source: response.generation.source,
    processingTime: response.generation.processingTime,
    qlooDataUsed: response.sources.qloo,
    fallbackOccurred: !!response.fallback
  });
  
  // Handle fallback scenarios
  if (response.fallback) {
    // Alert monitoring system
    monitoring.alert('persona_generation_fallback', {
      reason: response.fallback.reason,
      briefFormData: briefFormData
    });
  }
  
  // Track performance metrics
  if (response.performance) {
    metrics.histogram('persona_generation_time', response.generation.processingTime);
    metrics.histogram('qloo_api_calls', response.performance.qlooApiCalls);
    metrics.gauge('cache_hit_rate', response.performance.cacheHitRate);
  }
  
  return response.personas;
};
```

## Monitoring and Alerting

### Key Metrics to Monitor

```typescript
// Production monitoring checklist
const monitoringChecklist = {
  // Performance metrics
  avgResponseTime: 'Should be < 5 seconds',
  p95ResponseTime: 'Should be < 10 seconds',
  
  // Reliability metrics
  successRate: 'Should be > 99%',
  fallbackRate: 'Should be < 5%',
  errorRate: 'Should be < 1%',
  
  // Quality metrics
  qlooDataUsageRate: 'Should be > 95%',
  culturalConstraintsApplied: 'Should be > 8 per request',
  
  // Resource usage
  qlooApiCallsPerRequest: 'Should be 5-10',
  cacheHitRate: 'Should improve over time (target > 30%)',
  
  // Business metrics
  userSatisfaction: 'Monitor through feedback',
  personaRelevance: 'Monitor through usage patterns'
};
```

### Alerting Rules

Set up alerts for critical scenarios:

```typescript
// Alert configurations
const alerts = {
  // High fallback rate
  fallbackRate: {
    threshold: 10, // %
    action: 'Investigate Qloo API issues'
  },
  
  // High response time
  responseTime: {
    threshold: 8000, // ms
    action: 'Check performance bottlenecks'
  },
  
  // Low cache hit rate
  cacheHitRate: {
    threshold: 20, // %
    action: 'Review caching strategy'
  },
  
  // High error rate
  errorRate: {
    threshold: 2, // %
    action: 'Investigate system issues'
  }
};
```

## Rollback Strategy

### Emergency Rollback

If issues arise, you can quickly rollback:

```bash
# Emergency rollback - disable Qloo-First
QLOO_FIRST_GENERATION_ENABLED=false
```

This immediately switches all traffic back to the legacy flow.

### Gradual Rollback

For less critical issues, gradually reduce traffic:

```typescript
// Reduce rollout percentage
const ROLLOUT_PERCENTAGE = 25; // Reduce from 50% to 25%

function shouldUseQlooFirst(userId: string): boolean {
  const hash = hashUserId(userId);
  return (hash % 100) < ROLLOUT_PERCENTAGE;
}
```

### Rollback Checklist

When rolling back:

1. ✅ **Update environment variables**
2. ✅ **Monitor error rates** - should decrease
3. ✅ **Check response times** - should return to baseline
4. ✅ **Verify user experience** - should remain stable
5. ✅ **Document rollback reason** for future reference
6. ✅ **Plan fix and re-rollout** strategy

## Validation and Testing

### Automated Testing

Implement comprehensive tests:

```typescript
// Migration validation tests
describe('Qloo-First Migration', () => {
  test('backward compatibility maintained', async () => {
    const legacyRequest = { brief: 'Test brief' };
    const response = await generatePersonas(legacyRequest);
    
    expect(response.success).toBe(true);
    expect(response.personas).toBeDefined();
    expect(Array.isArray(response.personas)).toBe(true);
  });
  
  test('enhanced metadata available', async () => {
    const request = createFullBriefFormData();
    const response = await generatePersonas(request);
    
    expect(response.generation).toBeDefined();
    expect(response.sources).toBeDefined();
    expect(response.culturalConstraints).toBeDefined();
  });
  
  test('fallback works correctly', async () => {
    // Mock Qloo API failure
    mockQlooApiFailure();
    
    const response = await generatePersonas(createFullBriefFormData());
    
    expect(response.success).toBe(true);
    expect(response.generation.source).toBe('fallback-legacy');
    expect(response.fallback).toBeDefined();
  });
});
```

### Manual Testing Scenarios

Test these scenarios manually:

1. **Happy Path**: Normal request with all fields
2. **Minimal Request**: Only brief field provided
3. **Edge Cases**: Empty interests/values arrays
4. **Error Scenarios**: Invalid location, extreme age ranges
5. **Performance**: Large persona counts (5+)
6. **Multilingual**: Both French and English requests

## Common Issues and Solutions

### Issue 1: High Fallback Rate

**Symptoms:**
- `fallback.reason` frequently appears in responses
- `generation.source` is often `"fallback-legacy"`

**Possible Causes:**
- Qloo API rate limiting
- Network connectivity issues
- Invalid signal extraction

**Solutions:**
1. Reduce parallel requests:
   ```bash
   QLOO_FIRST_PARALLEL_REQUESTS=1
   ```

2. Increase cache TTL:
   ```bash
   QLOO_FIRST_CACHE_TTL=7200
   ```

3. Check Qloo API status and credentials

### Issue 2: Performance Degradation

**Symptoms:**
- Increased response times
- Higher resource usage

**Solutions:**
1. Optimize batch size:
   ```bash
   QLOO_FIRST_BATCH_SIZE=3
   ```

2. Enable caching:
   ```bash
   QLOO_FIRST_CACHE_TTL=3600
   ```

3. Monitor and tune parallel requests

### Issue 3: Inconsistent Results

**Symptoms:**
- Sometimes Qloo-First, sometimes legacy
- Varying cultural data quality

**Solutions:**
1. Check feature flag consistency
2. Verify environment variable loading
3. Monitor fallback triggers

## Success Criteria

The migration is considered successful when:

- ✅ **Fallback rate < 5%**
- ✅ **Response time increase < 20%**
- ✅ **Error rate remains stable**
- ✅ **Cultural data relevance improves**
- ✅ **User satisfaction maintained or improved**
- ✅ **Cache hit rate > 30%**
- ✅ **No breaking changes reported**

## Post-Migration Optimization

After successful migration:

1. **Optimize performance settings** based on production data
2. **Improve caching strategies** using usage patterns
3. **Fine-tune Qloo API usage** for better efficiency
4. **Collect user feedback** on persona quality
5. **Plan legacy code removal** timeline

## Related Documentation

- [Environment Variables](./QLOO_FIRST_ENVIRONMENT_VARIABLES.md)
- [API Documentation](./QLOO_FIRST_API_DOCUMENTATION.md)
- [Gemini Prompts](./GEMINI_PROMPTS.md)