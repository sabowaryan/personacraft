# Qloo-First Persona Generation API Documentation

This document provides comprehensive documentation for the enhanced `/api/generate-personas` endpoint with Qloo-First persona generation capabilities.

## Overview

The `/api/generate-personas` endpoint has been enhanced to support a new Qloo-First generation flow while maintaining backward compatibility with the existing legacy flow. The new flow prioritizes cultural data from Qloo API before generating personas with Gemini, ensuring better coherence between user specifications and cultural data.

## Endpoint

```
POST /api/generate-personas
```

## Request Format

The endpoint accepts the same `BriefFormData` format as before, ensuring backward compatibility:

```typescript
interface BriefFormData {
  brief: string;                    // Marketing brief (required)
  ageRange: {                      // Age range for personas
    min: number;
    max: number;
  };
  location: string;                // Geographic location
  language: 'fr' | 'en';          // Language preference
  personaCount: number;            // Number of personas to generate
  interests: string[];             // Mix of predefined and custom interests
  values: string[];                // Mix of predefined and custom values
}
```

### Example Request

```json
{
  "brief": "Créer des personas pour une application de fitness destinée aux jeunes professionnels urbains",
  "ageRange": {
    "min": 25,
    "max": 35
  },
  "location": "Paris, France",
  "language": "fr",
  "personaCount": 3,
  "interests": ["fitness", "technology", "healthy-eating"],
  "values": ["health", "productivity", "work-life-balance"]
}
```

## Response Format

The response format has been enhanced with detailed metadata while maintaining backward compatibility:

### Success Response

```typescript
interface ApiResponse {
  success: true;
  personas: Persona[];             // Generated personas
  timestamp: string;               // ISO timestamp
  
  // Generation metadata for tracking and debugging
  generation: {
    source: 'qloo-first' | 'legacy';
    method: 'qloo-first' | 'legacy';
    processingTime: number;        // Processing time in milliseconds
    personaCount: number;          // Actual personas generated
    requestedCount: number;        // Requested persona count
  };
  
  // Data source tracking
  sources: {
    gemini: boolean;               // Whether Gemini was used
    qloo: boolean;                 // Whether Qloo data was used
    culturalData: 'qloo' | 'none'; // Source of cultural data
  };
  
  // Cultural constraints applied (for qloo-first flow)
  culturalConstraints: {
    applied: string[];             // List of constraint types applied
    count: number;                 // Number of constraints applied
  };
  
  // Performance metrics (when available)
  performance?: {
    qlooApiCalls: number;          // Number of Qloo API calls made
    cacheHitRate: number;          // Cache hit rate (0-1)
  };
  
  // Error information (when fallback occurred)
  fallback?: {
    reason: string;                // Reason for fallback
    originalFlowFailed: boolean;   // Whether original flow failed
  };
  
  // Feature flag status for debugging
  featureFlags: {
    qlooFirstEnabled: boolean;
    fallbackEnabled: boolean;
    debugMode: boolean;
  };
}
```

### Error Response

```typescript
interface ErrorResponse {
  success: false;
  error: string;                   // Error message
  timestamp: string;               // ISO timestamp
  
  // Generation metadata (same structure as success)
  generation: {
    source: 'error';
    method: 'qloo-first' | 'legacy';
    processingTime: 0;
    personaCount: 0;
    requestedCount: number;
  };
  
  // Data source tracking
  sources: {
    gemini: false;
    qloo: false;
    culturalData: 'none';
  };
  
  // Feature flag status
  featureFlags: {
    qlooFirstEnabled: boolean;
    fallbackEnabled: boolean;
    debugMode: boolean;
  };
}
```

## Response Examples

### Qloo-First Flow Success

```json
{
  "success": true,
  "personas": [
    {
      "id": "persona-1",
      "name": "Marie Dubois",
      "age": 28,
      "location": "Paris, France",
      "occupation": "Marketing Manager",
      "interests": ["fitness", "technology", "healthy-eating"],
      "values": ["health", "productivity", "work-life-balance"],
      "culturalData": {
        "music": ["Dua Lipa", "The Weeknd", "Angèle"],
        "brands": ["Nike", "Apple", "Whole Foods"],
        "restaurants": ["Breizh Café", "L'As du Fallafel", "Clover"],
        "movies": ["Parasite", "La La Land", "Inception"],
        "tv": ["Stranger Things", "The Crown", "Emily in Paris"],
        "books": ["Atomic Habits", "The 7 Habits", "Sapiens"],
        "travel": ["Tokyo", "New York", "Barcelona"],
        "fashion": ["Zara", "COS", "Everlane"],
        "beauty": ["Glossier", "The Ordinary", "Fenty Beauty"],
        "food": ["Avocado toast", "Smoothie bowls", "Quinoa salads"],
        "socialMedia": ["Instagram", "LinkedIn", "TikTok"]
      }
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "generation": {
    "source": "qloo-first",
    "method": "qloo-first",
    "processingTime": 2500,
    "personaCount": 3,
    "requestedCount": 3
  },
  "sources": {
    "gemini": true,
    "qloo": true,
    "culturalData": "qloo"
  },
  "culturalConstraints": {
    "applied": ["music", "brands", "restaurants", "movies", "tv", "books", "travel", "fashion", "beauty", "food", "socialMedia"],
    "count": 11
  },
  "performance": {
    "qlooApiCalls": 8,
    "cacheHitRate": 0.25
  },
  "featureFlags": {
    "qlooFirstEnabled": true,
    "fallbackEnabled": true,
    "debugMode": false
  }
}
```

### Legacy Flow Success

```json
{
  "success": true,
  "personas": [
    {
      "id": "persona-1",
      "name": "Marie Dubois",
      "age": 28,
      "location": "Paris, France",
      "occupation": "Marketing Manager",
      "interests": ["fitness", "technology", "healthy-eating"],
      "values": ["health", "productivity", "work-life-balance"],
      "culturalData": {
        "music": ["Pop music", "Electronic"],
        "brands": ["Nike", "Apple"],
        "restaurants": ["Healthy restaurants"],
        "movies": ["Action movies", "Documentaries"],
        "tv": ["Netflix series"],
        "books": ["Self-help books"],
        "travel": ["European cities"],
        "fashion": ["Casual wear"],
        "beauty": ["Natural products"],
        "food": ["Healthy food"],
        "socialMedia": ["Instagram", "LinkedIn"]
      }
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "generation": {
    "source": "legacy",
    "method": "legacy",
    "processingTime": 1800,
    "personaCount": 3,
    "requestedCount": 3
  },
  "sources": {
    "gemini": true,
    "qloo": true,
    "culturalData": "qloo"
  },
  "culturalConstraints": {
    "applied": ["post-hoc-enrichment"],
    "count": 1
  },
  "performance": {
    "qlooApiCalls": 1,
    "cacheHitRate": 0
  },
  "featureFlags": {
    "qlooFirstEnabled": false,
    "fallbackEnabled": true,
    "debugMode": false
  }
}
```

### Fallback Scenario

```json
{
  "success": true,
  "personas": [
    {
      "id": "persona-1",
      "name": "Marie Dubois",
      "age": 28,
      "location": "Paris, France",
      "occupation": "Marketing Manager",
      "interests": ["fitness", "technology", "healthy-eating"],
      "values": ["health", "productivity", "work-life-balance"],
      "culturalData": {
        "music": ["Pop music", "Electronic"],
        "brands": ["Nike", "Apple"],
        "restaurants": ["Healthy restaurants"]
      }
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "generation": {
    "source": "fallback-legacy",
    "method": "legacy",
    "processingTime": 1800,
    "personaCount": 3,
    "requestedCount": 3
  },
  "sources": {
    "gemini": true,
    "qloo": true,
    "culturalData": "qloo"
  },
  "culturalConstraints": {
    "applied": ["post-hoc-enrichment"],
    "count": 1
  },
  "fallback": {
    "reason": "QLOO_API_TIMEOUT",
    "originalFlowFailed": true
  },
  "performance": {
    "qlooApiCalls": 0,
    "cacheHitRate": 0
  },
  "featureFlags": {
    "qlooFirstEnabled": true,
    "fallbackEnabled": true,
    "debugMode": false
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Erreur interne du serveur",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "generation": {
    "source": "error",
    "method": "qloo-first",
    "processingTime": 0,
    "personaCount": 0,
    "requestedCount": 3
  },
  "sources": {
    "gemini": false,
    "qloo": false,
    "culturalData": "none"
  },
  "featureFlags": {
    "qlooFirstEnabled": true,
    "fallbackEnabled": true,
    "debugMode": false
  }
}
```

## Key Differences Between Flows

### Qloo-First Flow vs Legacy Flow

| Aspect | Qloo-First Flow | Legacy Flow |
|--------|----------------|-------------|
| **Data Source Priority** | Qloo data first, then Gemini generation | Gemini generation first, then Qloo enrichment |
| **Cultural Data Quality** | High coherence, location-specific | Generic enrichment, may be inconsistent |
| **Processing Time** | Slightly higher due to upfront Qloo calls | Lower, but may require post-processing |
| **API Calls** | Multiple targeted Qloo calls | Single enrichment call |
| **Cache Utilization** | Intelligent caching based on signals | Limited caching |
| **Error Handling** | Comprehensive with fallback | Basic error handling |
| **Metadata** | Detailed performance and source tracking | Basic metadata |

### Response Metadata Differences

#### Qloo-First Flow Metadata
- `source`: `"qloo-first"`
- `culturalConstraints.applied`: Array of specific constraint types
- `performance.qlooApiCalls`: Actual number of API calls made
- `performance.cacheHitRate`: Cache effectiveness metric

#### Legacy Flow Metadata
- `source`: `"legacy"`
- `culturalConstraints.applied`: `["post-hoc-enrichment"]`
- `performance.qlooApiCalls`: Estimated (usually 1)
- `performance.cacheHitRate`: 0 (no caching)

## Migration Guide

### For Frontend Applications

The API maintains backward compatibility, so existing frontend code will continue to work without changes. However, you can enhance your application by utilizing the new metadata:

#### Basic Usage (No Changes Required)
```typescript
// Existing code continues to work
const response = await fetch('/api/generate-personas', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(briefFormData)
});

const data = await response.json();
const personas = data.personas; // Works as before
```

#### Enhanced Usage (Optional)
```typescript
const response = await fetch('/api/generate-personas', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(briefFormData)
});

const data = await response.json();

// Access enhanced metadata
console.log('Generation method:', data.generation.source);
console.log('Processing time:', data.generation.processingTime);
console.log('Cultural constraints applied:', data.culturalConstraints.applied);

// Handle fallback scenarios
if (data.fallback) {
  console.warn('Fallback occurred:', data.fallback.reason);
}

// Monitor performance
if (data.performance) {
  console.log('Qloo API calls:', data.performance.qlooApiCalls);
  console.log('Cache hit rate:', data.performance.cacheHitRate);
}
```

### For Backend Integrations

If you're integrating with the API from other services, you can now:

1. **Monitor Generation Quality**: Use `generation.source` to track which flow was used
2. **Performance Monitoring**: Track `generation.processingTime` and `performance` metrics
3. **Error Handling**: Check for `fallback` information to understand when fallbacks occur
4. **Feature Flag Awareness**: Use `featureFlags` to understand the current configuration

### Breaking Changes

**None.** The API maintains full backward compatibility. All existing fields are preserved, and new fields are additive.

### Recommended Updates

While not required, consider updating your code to:

1. **Log generation metadata** for monitoring and debugging
2. **Handle fallback scenarios** gracefully in your UI
3. **Display performance metrics** in development/staging environments
4. **Use feature flag information** for conditional behavior

## Status Codes

| Code | Description | Scenario |
|------|-------------|----------|
| 200 | Success | Personas generated successfully |
| 400 | Bad Request | Invalid or missing brief |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Persona limit reached |
| 408 | Request Timeout | Authentication timeout |
| 500 | Internal Server Error | Server error occurred |

## Rate Limiting

The endpoint respects existing rate limiting policies. The Qloo-First flow may make additional API calls to Qloo, but these are optimized through:

- Intelligent batching
- Parallel processing
- Smart caching
- Request deduplication

## Monitoring and Debugging

### Debug Mode

When `QLOO_FIRST_DEBUG_MODE=true`, the API provides additional debugging information:

- Detailed error messages
- Step-by-step processing logs
- Extended performance metrics
- Cultural constraint details

### Performance Monitoring

Monitor these key metrics:

- `generation.processingTime`: Total processing time
- `performance.qlooApiCalls`: Number of Qloo API calls
- `performance.cacheHitRate`: Cache effectiveness
- `culturalConstraints.count`: Number of constraints applied

### Error Tracking

Track these scenarios:

- `fallback.reason`: Why fallback occurred
- `generation.source`: Which flow was used
- `sources.qloo`: Whether Qloo data was successfully used

## Related Documentation

- [Environment Variables](./QLOO_FIRST_ENVIRONMENT_VARIABLES.md)
- [Migration Guide](./QLOO_FIRST_MIGRATION_GUIDE.md)
- [Gemini Prompts](./GEMINI_PROMPTS.md)