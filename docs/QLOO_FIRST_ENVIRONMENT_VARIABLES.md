# Qloo-First Persona Generation Environment Variables

This document provides comprehensive documentation for all environment variables related to the Qloo-First persona generation feature.

## Overview

The Qloo-First persona generation feature introduces a new flow that prioritizes cultural data from Qloo API before generating personas with Gemini. This approach ensures better coherence between user specifications and cultural data.

## Feature Flag Variables

### QLOO_FIRST_GENERATION_ENABLED

**Type:** Boolean  
**Default:** `false`  
**Required:** No  

Controls whether the new Qloo-First generation flow is enabled.

- `true`: Uses the new Qloo-First flow for persona generation
- `false`: Uses the legacy flow (Gemini first, then Qloo enrichment)

**Example:**
```bash
QLOO_FIRST_GENERATION_ENABLED=true
```

### QLOO_FIRST_FALLBACK_ENABLED

**Type:** Boolean  
**Default:** `true`  
**Required:** No  

Controls whether the system should fallback to the legacy flow when the Qloo-First flow encounters errors.

- `true`: Automatically fallback to legacy flow on errors
- `false`: Return error without fallback (not recommended for production)

**Example:**
```bash
QLOO_FIRST_FALLBACK_ENABLED=true
```

### QLOO_FIRST_DEBUG_MODE

**Type:** Boolean  
**Default:** `false`  
**Required:** No  

Enables debug mode for the Qloo-First feature, providing additional logging and metadata.

- `true`: Enables detailed logging and debug information
- `false`: Standard logging only

**Example:**
```bash
QLOO_FIRST_DEBUG_MODE=false
```

## Performance Tuning Variables

### QLOO_FIRST_BATCH_SIZE

**Type:** Integer  
**Default:** `5`  
**Range:** 1-10  
**Required:** No  

Controls the batch size for Qloo API requests to optimize performance.

**Example:**
```bash
QLOO_FIRST_BATCH_SIZE=5
```

### QLOO_FIRST_PARALLEL_REQUESTS

**Type:** Integer  
**Default:** `3`  
**Range:** 1-5  
**Required:** No  

Controls the maximum number of parallel requests to the Qloo API.

**Example:**
```bash
QLOO_FIRST_PARALLEL_REQUESTS=3
```

### QLOO_FIRST_CACHE_TTL

**Type:** Integer  
**Default:** `3600` (1 hour)  
**Unit:** Seconds  
**Required:** No  

Controls the cache time-to-live for Qloo API responses.

**Example:**
```bash
QLOO_FIRST_CACHE_TTL=3600
```

## Configuration Examples

### Development Environment

For development, enable debug mode and use conservative performance settings:

```bash
# Feature flags
QLOO_FIRST_GENERATION_ENABLED=true
QLOO_FIRST_FALLBACK_ENABLED=true
QLOO_FIRST_DEBUG_MODE=true

# Performance tuning
QLOO_FIRST_BATCH_SIZE=3
QLOO_FIRST_PARALLEL_REQUESTS=2
QLOO_FIRST_CACHE_TTL=1800
```

### Staging Environment

For staging, enable the feature with fallback but disable debug mode:

```bash
# Feature flags
QLOO_FIRST_GENERATION_ENABLED=true
QLOO_FIRST_FALLBACK_ENABLED=true
QLOO_FIRST_DEBUG_MODE=false

# Performance tuning
QLOO_FIRST_BATCH_SIZE=5
QLOO_FIRST_PARALLEL_REQUESTS=3
QLOO_FIRST_CACHE_TTL=3600
```

### Production Environment

For production, use optimized settings with fallback enabled:

```bash
# Feature flags
QLOO_FIRST_GENERATION_ENABLED=true
QLOO_FIRST_FALLBACK_ENABLED=true
QLOO_FIRST_DEBUG_MODE=false

# Performance tuning
QLOO_FIRST_BATCH_SIZE=5
QLOO_FIRST_PARALLEL_REQUESTS=3
QLOO_FIRST_CACHE_TTL=3600
```

### Gradual Rollout

For gradual rollout, you can disable the feature initially:

```bash
# Feature flags
QLOO_FIRST_GENERATION_ENABLED=false
QLOO_FIRST_FALLBACK_ENABLED=true
QLOO_FIRST_DEBUG_MODE=false

# Performance tuning (will be used when feature is enabled)
QLOO_FIRST_BATCH_SIZE=5
QLOO_FIRST_PARALLEL_REQUESTS=3
QLOO_FIRST_CACHE_TTL=3600
```

## Troubleshooting Guide

### Common Issues

#### 1. Feature Not Working Despite Being Enabled

**Symptoms:**
- `QLOO_FIRST_GENERATION_ENABLED=true` but still using legacy flow
- No Qloo-First metadata in API responses

**Possible Causes:**
- Environment variable not properly loaded
- Feature flag service not reading the variable correctly
- Fallback triggered due to errors

**Solutions:**
1. Verify environment variable is loaded:
   ```bash
   # Check if variable is set
   echo $QLOO_FIRST_GENERATION_ENABLED
   ```

2. Enable debug mode to see detailed logs:
   ```bash
   QLOO_FIRST_DEBUG_MODE=true
   ```

3. Check application logs for fallback triggers

#### 2. Performance Issues

**Symptoms:**
- Slow persona generation
- Timeout errors
- High API usage

**Possible Causes:**
- Batch size too large
- Too many parallel requests
- Cache TTL too low

**Solutions:**
1. Reduce batch size:
   ```bash
   QLOO_FIRST_BATCH_SIZE=3
   ```

2. Reduce parallel requests:
   ```bash
   QLOO_FIRST_PARALLEL_REQUESTS=2
   ```

3. Increase cache TTL:
   ```bash
   QLOO_FIRST_CACHE_TTL=7200
   ```

#### 3. Qloo API Rate Limiting

**Symptoms:**
- 429 (Too Many Requests) errors
- Frequent fallbacks to legacy flow

**Possible Causes:**
- Too many parallel requests
- Batch size too large
- Cache TTL too low causing repeated requests

**Solutions:**
1. Reduce parallel requests:
   ```bash
   QLOO_FIRST_PARALLEL_REQUESTS=1
   ```

2. Increase cache TTL:
   ```bash
   QLOO_FIRST_CACHE_TTL=7200
   ```

3. Implement request throttling (contact development team)

#### 4. Inconsistent Results

**Symptoms:**
- Sometimes Qloo-First, sometimes legacy flow
- Inconsistent metadata in responses

**Possible Causes:**
- Fallback enabled and triggering frequently
- Intermittent Qloo API issues

**Solutions:**
1. Enable debug mode to identify fallback triggers:
   ```bash
   QLOO_FIRST_DEBUG_MODE=true
   ```

2. Check Qloo API status and connectivity

3. Consider temporarily disabling fallback for debugging:
   ```bash
   QLOO_FIRST_FALLBACK_ENABLED=false
   ```
   **Warning:** Only use this in development/staging environments

### Monitoring and Debugging

#### Enable Debug Logging

```bash
QLOO_FIRST_DEBUG_MODE=true
```

This will provide detailed logs including:
- Signal extraction process
- Qloo API calls and responses
- Prompt building steps
- Performance metrics
- Fallback triggers

#### Check Feature Flag Status

The system provides runtime information about feature flag status in API responses when debug mode is enabled.

#### Performance Monitoring

Monitor these metrics in your application logs:
- `qlooExtractionTime`: Time spent extracting signals
- `qlooApiCallsCount`: Number of Qloo API calls made
- `promptBuildingTime`: Time spent building enriched prompts
- `geminiGenerationTime`: Time spent generating personas
- `totalProcessingTime`: Total processing time
- `cacheHitRate`: Cache effectiveness

### Best Practices

1. **Always enable fallback in production:**
   ```bash
   QLOO_FIRST_FALLBACK_ENABLED=true
   ```

2. **Use conservative performance settings initially:**
   ```bash
   QLOO_FIRST_BATCH_SIZE=3
   QLOO_FIRST_PARALLEL_REQUESTS=2
   ```

3. **Monitor cache hit rates and adjust TTL accordingly**

4. **Enable debug mode only in development/staging**

5. **Gradually increase performance settings based on monitoring**

## Related Documentation

- [API Documentation](./QLOO_FIRST_API_DOCUMENTATION.md)
- [Migration Guide](./QLOO_FIRST_MIGRATION_GUIDE.md)
- [Gemini Prompts](./GEMINI_PROMPTS.md)