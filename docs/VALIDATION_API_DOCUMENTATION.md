# Validation System API Documentation

## Overview

The LLM Response Validation System provides a comprehensive API for validating, managing, and monitoring validation templates used to ensure LLM-generated personas meet quality standards.

## Base URL

All API endpoints are prefixed with `/api/validation`

## Authentication

Currently, the validation API does not require authentication for development purposes. In production, implement appropriate authentication mechanisms.

## API Endpoints

### Templates Management

#### GET /api/validation/templates

Retrieve all validation templates with optional metrics.

**Query Parameters:**
- `includeMetrics` (boolean, optional): Include performance metrics for each template
- `personaType` (string, optional): Filter by persona type (`simple`, `standard`, `b2b`)
- `active` (boolean, optional): Filter by active status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "standard-persona-v1",
      "name": "Standard Persona Validation",
      "version": "1.0.0",
      "personaType": "standard",
      "rules": [...],
      "fallbackStrategy": {
        "type": "regenerate",
        "maxRetries": 3,
        "fallbackTemplate": "simple-persona-v1"
      },
      "metadata": {
        "createdAt": 1640995200000,
        "updatedAt": 1640995200000,
        "author": "System",
        "description": "Validates standard persona structure and content",
        "tags": ["standard", "production"],
        "isActive": true
      },
      "metrics": {
        "successRate": 0.95,
        "averageValidationTime": 150,
        "totalValidations": 1000,
        "errorRate": 0.05
      }
    }
  ]
}
```

#### GET /api/validation/templates/{templateId}

Retrieve a specific validation template by ID.

**Path Parameters:**
- `templateId` (string): The unique identifier of the template

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "standard-persona-v1",
    "name": "Standard Persona Validation",
    // ... full template object
  }
}
```

#### POST /api/validation/templates

Create a new validation template.

**Request Body:**
```json
{
  "id": "custom-template-v1",
  "name": "Custom Template",
  "version": "1.0.0",
  "personaType": "standard",
  "rules": [
    {
      "id": "required-fields",
      "type": "structure",
      "field": "root",
      "severity": "error",
      "message": "Missing required fields",
      "required": true,
      "priority": 100,
      "timeout": 5000
    }
  ],
  "fallbackStrategy": {
    "type": "regenerate",
    "maxRetries": 3
  },
  "metadata": {
    "author": "Developer",
    "description": "Custom validation template",
    "tags": ["custom"],
    "isActive": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "custom-template-v1",
    // ... created template object
  }
}
```

#### PUT /api/validation/templates/{templateId}

Update an existing validation template.

**Path Parameters:**
- `templateId` (string): The unique identifier of the template

**Request Body:** Same as POST request

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "custom-template-v1",
    // ... updated template object
  }
}
```

#### DELETE /api/validation/templates/{templateId}

Delete a validation template.

**Path Parameters:**
- `templateId` (string): The unique identifier of the template

**Response:**
```json
{
  "success": true,
  "message": "Template deleted successfully"
}
```

### Template Testing

#### POST /api/validation/test

Test a validation template with sample data.

**Request Body:**
```json
{
  "templateId": "standard-persona-v1",
  "testData": {
    "id": "persona-123",
    "name": "John Doe",
    "age": 30,
    "occupation": "Software Engineer",
    "demographics": {
      "age": 30,
      "gender": "male",
      "income": 100000
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "errors": [],
    "warnings": [
      {
        "field": "demographics.education",
        "message": "Education field is recommended but not required",
        "type": "content",
        "severity": "warning"
      }
    ],
    "score": 0.95,
    "metadata": {
      "validationTime": 150,
      "rulesExecuted": 12,
      "templateId": "standard-persona-v1",
      "templateVersion": "1.0.0"
    }
  }
}
```

### Metrics and Monitoring

#### GET /api/validation/metrics

Retrieve validation metrics and performance data.

**Query Parameters:**
- `templateId` (string, optional): Filter by specific template
- `startDate` (string, optional): Start date for metrics (ISO 8601)
- `endDate` (string, optional): End date for metrics (ISO 8601)
- `aggregation` (string, optional): Aggregation level (`hour`, `day`, `week`, `month`)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalValidations": 10000,
      "successRate": 0.94,
      "averageValidationTime": 145,
      "errorRate": 0.06
    },
    "byTemplate": {
      "standard-persona-v1": {
        "validations": 6000,
        "successRate": 0.95,
        "averageTime": 140
      },
      "b2b-persona-v1": {
        "validations": 3000,
        "successRate": 0.92,
        "averageTime": 160
      }
    },
    "trends": [
      {
        "timestamp": 1640995200000,
        "validations": 100,
        "successRate": 0.94,
        "averageTime": 145
      }
    ],
    "errorBreakdown": {
      "STRUCTURE_INVALID": 30,
      "REQUIRED_FIELD_MISSING": 25,
      "TYPE_MISMATCH": 20,
      "VALUE_OUT_OF_RANGE": 15,
      "FORMAT_INVALID": 10
    }
  }
}
```

#### GET /api/validation/dashboard

Retrieve dashboard data for monitoring interface.

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "totalValidations": 10000,
      "successRate": 0.94,
      "averageValidationTime": 145,
      "activeTemplates": 5
    },
    "recentActivity": [
      {
        "timestamp": 1640995200000,
        "templateId": "standard-persona-v1",
        "result": "success",
        "validationTime": 120
      }
    ],
    "alerts": [
      {
        "id": "alert-1",
        "type": "error_rate_high",
        "templateId": "b2b-persona-v1",
        "message": "Error rate exceeded threshold (10%)",
        "timestamp": 1640995200000,
        "severity": "warning"
      }
    ]
  }
}
```

## Data Models

### ValidationTemplate

```typescript
interface ValidationTemplate {
  id: string;                    // Unique identifier
  name: string;                  // Human-readable name
  version: string;               // Semantic version
  personaType: PersonaType;      // Target persona type
  rules: ValidationRule[];       // Validation rules
  fallbackStrategy: FallbackStrategy; // Error handling strategy
  metadata: TemplateMetadata;    // Additional metadata
}
```

### ValidationRule

```typescript
interface ValidationRule {
  id: string;                    // Unique rule identifier
  type: ValidationRuleType;      // Rule category
  field: string;                 // Target field path
  validator: ValidatorFunction;  // Validation function
  severity: ValidationSeverity;  // Error severity level
  message: string;               // Error message
  required: boolean;             // Whether rule is required
  priority?: number;             // Execution priority (1-100)
  timeout?: number;              // Timeout in milliseconds
  dependencies?: string[];       // Dependent rule IDs
}
```

### ValidationResult

```typescript
interface ValidationResult {
  isValid: boolean;              // Overall validation result
  errors: ValidationError[];     // Validation errors
  warnings: ValidationWarning[]; // Validation warnings
  score: number;                 // Quality score (0-1)
  metadata: ValidationMetadata;  // Execution metadata
}
```

### ValidationError

```typescript
interface ValidationError {
  field: string;                 // Field that failed validation
  message: string;               // Error description
  type: ValidationErrorType;     // Error category
  severity: ValidationSeverity;  // Error severity
  ruleId: string;               // Rule that generated error
  value?: any;                  // Actual value that failed
  expected?: any;               // Expected value or format
}
```

## Enums

### PersonaType
```typescript
enum PersonaType {
  SIMPLE = 'simple',
  STANDARD = 'standard',
  B2B = 'b2b'
}
```

### ValidationRuleType
```typescript
enum ValidationRuleType {
  STRUCTURE = 'structure',    // JSON structure validation
  CONTENT = 'content',        // Content value validation
  FORMAT = 'format',          // Format and type validation
  BUSINESS = 'business'       // Business rule validation
}
```

### ValidationSeverity
```typescript
enum ValidationSeverity {
  ERROR = 'error',           // Blocks validation
  WARNING = 'warning',       // Allows validation with warning
  INFO = 'info'             // Informational only
}
```

### ValidationErrorType
```typescript
enum ValidationErrorType {
  STRUCTURE_INVALID = 'STRUCTURE_INVALID',
  REQUIRED_FIELD_MISSING = 'REQUIRED_FIELD_MISSING',
  TYPE_MISMATCH = 'TYPE_MISMATCH',
  VALUE_OUT_OF_RANGE = 'VALUE_OUT_OF_RANGE',
  FORMAT_INVALID = 'FORMAT_INVALID',
  CULTURAL_DATA_INCONSISTENT = 'CULTURAL_DATA_INCONSISTENT',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  VALIDATION_TIMEOUT = 'VALIDATION_TIMEOUT'
}
```

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE",
  "details": {
    "field": "specific field that caused error",
    "value": "problematic value"
  }
}
```

### Common HTTP Status Codes

- `200 OK`: Successful request
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation failed
- `500 Internal Server Error`: Server error

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Template Management**: 100 requests per minute per IP
- **Template Testing**: 50 requests per minute per IP
- **Metrics**: 200 requests per minute per IP

## Examples

### Creating a Custom Template

```javascript
const template = {
  id: 'my-custom-template',
  name: 'My Custom Template',
  version: '1.0.0',
  personaType: 'standard',
  rules: [
    {
      id: 'name-required',
      type: 'structure',
      field: 'name',
      severity: 'error',
      message: 'Name is required',
      required: true
    }
  ],
  fallbackStrategy: {
    type: 'regenerate',
    maxRetries: 2
  },
  metadata: {
    author: 'Developer',
    description: 'Custom validation for specific use case',
    tags: ['custom'],
    isActive: true
  }
};

const response = await fetch('/api/validation/templates', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(template)
});

const result = await response.json();
```

### Testing a Template

```javascript
const testData = {
  templateId: 'standard-persona-v1',
  testData: {
    id: 'test-persona',
    name: 'Test User',
    age: 25,
    occupation: 'Designer'
  }
};

const response = await fetch('/api/validation/test', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(testData)
});

const result = await response.json();
console.log('Validation result:', result.data);
```

### Retrieving Metrics

```javascript
const response = await fetch('/api/validation/metrics?templateId=standard-persona-v1&aggregation=day');
const metrics = await response.json();
console.log('Template metrics:', metrics.data);
```

## Configuration Examples

### Environment Variables

The validation system can be configured using environment variables for different deployment environments:

```bash
# Main validation toggle
VALIDATION_ENABLED=true

# Validation type toggles
STRUCTURE_VALIDATION_ENABLED=true
CONTENT_VALIDATION_ENABLED=true
BUSINESS_RULE_VALIDATION_ENABLED=false
FORMAT_VALIDATION_ENABLED=true

# Advanced features
RETRY_ON_VALIDATION_FAILURE=true
FALLBACK_TO_LEGACY_SYSTEM=true
ENHANCED_PROMPT_ON_RETRY=false

# Monitoring
VALIDATION_METRICS_COLLECTION=true
VALIDATION_PERFORMANCE_MONITORING=true
VALIDATION_ALERTING=false

# Template-specific flags
STANDARD_PERSONA_VALIDATION=true
B2B_PERSONA_VALIDATION=true
SIMPLE_PERSONA_VALIDATION=true

# Performance settings
VALIDATION_TIMEOUT_MS=5000
VALIDATION_MAX_RETRIES=3
VALIDATION_CACHE_TTL=300000
VALIDATION_BATCH_SIZE=10

# Debug flags (development only)
VALIDATION_DEBUG_MODE=false
VALIDATION_VERBOSE_LOGGING=false
VALIDATION_TRACE_ENABLED=false
```

### Environment-Specific Configurations

#### Development Environment
```bash
# .env.development
VALIDATION_ENABLED=true
STRUCTURE_VALIDATION_ENABLED=true
CONTENT_VALIDATION_ENABLED=true
FORMAT_VALIDATION_ENABLED=true
SIMPLE_PERSONA_VALIDATION=true
VALIDATION_DEBUG_MODE=true
VALIDATION_VERBOSE_LOGGING=true
```

#### Staging Environment
```bash
# .env.staging
VALIDATION_ENABLED=true
STRUCTURE_VALIDATION_ENABLED=true
CONTENT_VALIDATION_ENABLED=true
FORMAT_VALIDATION_ENABLED=true
SIMPLE_PERSONA_VALIDATION=true
STANDARD_PERSONA_VALIDATION=true
VALIDATION_ALERTING=true
FALLBACK_TO_LEGACY_SYSTEM=true
```

#### Production Environment
```bash
# .env.production
VALIDATION_ENABLED=false  # Start disabled for safe rollout
FALLBACK_TO_LEGACY_SYSTEM=true
VALIDATION_METRICS_COLLECTION=true
VALIDATION_PERFORMANCE_MONITORING=true
VALIDATION_ALERTING=true
```

### Feature Flags Configuration

```javascript
import { ValidationFeatureFlagsManager } from '@/lib/config/feature-flags';

// Initialize with environment
const featureFlags = new ValidationFeatureFlagsManager('production');

// Check if validation is enabled
if (featureFlags.isValidationEnabled()) {
  console.log('Validation is enabled');
}

// Check specific validation types
if (featureFlags.isValidationTypeEnabled('structure')) {
  console.log('Structure validation is enabled');
}

// Check persona-specific validation
if (featureFlags.isPersonaValidationEnabled('standard')) {
  console.log('Standard persona validation is enabled');
}

// Update flags at runtime (for admin interfaces)
featureFlags.updateFlags({
  validationEnabled: true,
  structureValidation: true
});
```

## Advanced Usage Examples

### Custom Validation Integration

```javascript
import { ValidationTemplateEngine } from '@/lib/validation/validation-template-engine';
import { ValidationTemplateRegistry } from '@/lib/validation/template-registry';

// Initialize validation system
const registry = new ValidationTemplateRegistry();
const engine = new ValidationTemplateEngine(registry);

// Custom validation workflow
async function validatePersonaWithRetry(personaData, templateId, maxRetries = 3) {
  let attempt = 0;
  let lastError = null;

  while (attempt < maxRetries) {
    try {
      const context = {
        originalRequest: {
          personaType: 'standard',
          culturalData: personaData.culturalData,
          demographics: personaData.demographics
        },
        templateVariables: {},
        culturalConstraints: {},
        userSignals: {},
        generationAttempt: attempt + 1,
        previousErrors: lastError ? [lastError] : []
      };

      const result = await engine.validateResponse(personaData, templateId, context);
      
      if (result.isValid) {
        return {
          success: true,
          data: personaData,
          validation: result,
          attempts: attempt + 1
        };
      }

      // Log validation errors
      console.log(`Validation attempt ${attempt + 1} failed:`, result.errors);
      lastError = result.errors[0];
      attempt++;

    } catch (error) {
      console.error(`Validation error on attempt ${attempt + 1}:`, error);
      attempt++;
      lastError = {
        id: 'system-error',
        type: 'VALIDATION_TIMEOUT',
        field: 'system',
        message: error.message,
        severity: 'error'
      };
    }
  }

  return {
    success: false,
    error: 'Validation failed after maximum retries',
    attempts: maxRetries,
    lastError
  };
}

// Usage
const result = await validatePersonaWithRetry(personaData, 'standard-persona-v1');
if (result.success) {
  console.log('Persona validated successfully:', result.data);
} else {
  console.error('Validation failed:', result.error);
}
```

### Batch Validation

```javascript
async function validateMultiplePersonas(personas, templateId) {
  const results = await Promise.allSettled(
    personas.map(async (persona, index) => {
      const context = {
        originalRequest: {
          personaType: 'standard',
          culturalData: persona.culturalData
        },
        templateVariables: { batchIndex: index },
        culturalConstraints: {},
        userSignals: {},
        generationAttempt: 1,
        previousErrors: []
      };

      return await engine.validateResponse(persona, templateId, context);
    })
  );

  const validPersonas = [];
  const invalidPersonas = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.isValid) {
      validPersonas.push({
        index,
        persona: personas[index],
        validation: result.value
      });
    } else {
      invalidPersonas.push({
        index,
        persona: personas[index],
        error: result.status === 'rejected' ? result.reason : result.value.errors
      });
    }
  });

  return {
    valid: validPersonas,
    invalid: invalidPersonas,
    successRate: validPersonas.length / personas.length
  };
}
```

### Metrics Collection and Analysis

```javascript
// Collect validation metrics
async function collectValidationMetrics(templateId, period = '24h') {
  const response = await fetch(`/api/validation/metrics?templateId=${templateId}&period=${period}`);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(`Failed to fetch metrics: ${data.error}`);
  }
  
  return data.data;
}

// Analyze validation performance
async function analyzeValidationPerformance(templateId) {
  const metrics = await collectValidationMetrics(templateId, '7d');
  
  const analysis = {
    averageSuccessRate: metrics.overview.successRate,
    performanceTrend: calculateTrend(metrics.trends),
    topErrors: Object.entries(metrics.errorBreakdown)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5),
    recommendations: []
  };
  
  // Generate recommendations
  if (analysis.averageSuccessRate < 0.9) {
    analysis.recommendations.push('Consider reviewing validation rules - success rate is below 90%');
  }
  
  if (metrics.overview.averageValidationTime > 200) {
    analysis.recommendations.push('Validation time is high - consider optimizing rules');
  }
  
  return analysis;
}

function calculateTrend(trends) {
  if (trends.length < 2) return 'insufficient_data';
  
  const recent = trends.slice(-7); // Last 7 data points
  const older = trends.slice(-14, -7); // Previous 7 data points
  
  const recentAvg = recent.reduce((sum, t) => sum + t.successRate, 0) / recent.length;
  const olderAvg = older.reduce((sum, t) => sum + t.successRate, 0) / older.length;
  
  const change = (recentAvg - olderAvg) / olderAvg;
  
  if (change > 0.05) return 'improving';
  if (change < -0.05) return 'declining';
  return 'stable';
}

// Real-time metrics monitoring
class ValidationMetricsMonitor {
  constructor(templateId, updateInterval = 30000) {
    this.templateId = templateId;
    this.updateInterval = updateInterval;
    this.listeners = [];
    this.isRunning = false;
    this.alertThresholds = {
      successRate: 0.85,
      averageTime: 1000,
      errorRate: 0.15
    };
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.intervalId = setInterval(async () => {
      try {
        const metrics = await collectValidationMetrics(this.templateId, '1h');
        this.checkAlerts(metrics);
        this.notifyListeners(metrics);
      } catch (error) {
        console.error('Failed to collect metrics:', error);
        this.notifyListeners({ error: error.message });
      }
    }, this.updateInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  setAlertThresholds(thresholds) {
    this.alertThresholds = { ...this.alertThresholds, ...thresholds };
  }

  checkAlerts(metrics) {
    const alerts = [];
    
    if (metrics.overview.successRate < this.alertThresholds.successRate) {
      alerts.push({
        type: 'success_rate_low',
        message: `Success rate (${(metrics.overview.successRate * 100).toFixed(1)}%) below threshold`,
        severity: 'warning',
        value: metrics.overview.successRate,
        threshold: this.alertThresholds.successRate
      });
    }
    
    if (metrics.overview.averageValidationTime > this.alertThresholds.averageTime) {
      alerts.push({
        type: 'validation_time_high',
        message: `Average validation time (${metrics.overview.averageValidationTime}ms) above threshold`,
        severity: 'warning',
        value: metrics.overview.averageValidationTime,
        threshold: this.alertThresholds.averageTime
      });
    }
    
    if (metrics.overview.errorRate > this.alertThresholds.errorRate) {
      alerts.push({
        type: 'error_rate_high',
        message: `Error rate (${(metrics.overview.errorRate * 100).toFixed(1)}%) above threshold`,
        severity: 'critical',
        value: metrics.overview.errorRate,
        threshold: this.alertThresholds.errorRate
      });
    }
    
    if (alerts.length > 0) {
      this.notifyListeners({ alerts, metrics });
    }
  }

  notifyListeners(data) {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Metrics listener error:', error);
      }
    });
  }
}

// Usage example
const monitor = new ValidationMetricsMonitor('standard-persona-v1');

// Set custom alert thresholds
monitor.setAlertThresholds({
  successRate: 0.90,
  averageTime: 500,
  errorRate: 0.10
});

monitor.addListener((data) => {
  if (data.error) {
    console.error('Metrics collection failed:', data.error);
    return;
  }
  
  if (data.alerts) {
    data.alerts.forEach(alert => {
      console.warn(`🚨 ${alert.type.toUpperCase()}: ${alert.message}`);
      
      // Send to monitoring system
      if (alert.severity === 'critical') {
        sendToSlack(`Critical validation alert: ${alert.message}`);
      }
    });
  }
  
  if (data.metrics) {
    console.log('Current metrics:', {
      successRate: `${(data.metrics.overview.successRate * 100).toFixed(1)}%`,
      avgTime: `${data.metrics.overview.averageValidationTime}ms`,
      totalValidations: data.metrics.overview.totalValidations
    });
  }
});

monitor.start();

// Graceful shutdown
process.on('SIGTERM', () => {
  monitor.stop();
});
```

## Error Handling Patterns

### Comprehensive Error Handling

```javascript
async function robustValidation(personaData, templateId) {
  try {
    const result = await engine.validateResponse(personaData, templateId, context);
    
    if (result.isValid) {
      return { success: true, data: personaData, validation: result };
    }
    
    // Handle different error types
    const criticalErrors = result.errors.filter(e => e.severity === 'error');
    const warnings = result.errors.filter(e => e.severity === 'warning');
    
    if (criticalErrors.length > 0) {
      // Log critical errors for monitoring
      console.error('Critical validation errors:', criticalErrors);
      
      // Check if errors are recoverable
      const recoverableErrors = criticalErrors.filter(e => 
        ['TYPE_MISMATCH', 'FORMAT_INVALID'].includes(e.type)
      );
      
      if (recoverableErrors.length === criticalErrors.length) {
        // All errors are recoverable - attempt data correction
        const correctedData = await attemptDataCorrection(personaData, recoverableErrors);
        if (correctedData) {
          return await robustValidation(correctedData, templateId);
        }
      }
      
      return {
        success: false,
        error: 'Critical validation errors',
        errors: criticalErrors,
        recoverable: recoverableErrors.length > 0
      };
    }
    
    // Only warnings - return with warnings
    return {
      success: true,
      data: personaData,
      validation: result,
      warnings: warnings
    };
    
  } catch (error) {
    console.error('Validation system error:', error);
    
    // Fallback to basic validation or return error
    return {
      success: false,
      error: 'Validation system unavailable',
      systemError: error.message,
      fallbackAvailable: true
    };
  }
}

async function attemptDataCorrection(data, errors) {
  const correctedData = { ...data };
  
  for (const error of errors) {
    switch (error.type) {
      case 'TYPE_MISMATCH':
        if (error.field === 'age' && typeof data.age === 'string') {
          const ageNum = parseInt(data.age, 10);
          if (!isNaN(ageNum)) {
            correctedData.age = ageNum;
          }
        }
        break;
        
      case 'FORMAT_INVALID':
        if (error.field === 'email' && data.email) {
          // Attempt basic email correction
          correctedData.email = data.email.toLowerCase().trim();
        }
        break;
    }
  }
  
  return correctedData;
}
```

## Performance Optimization

### Caching Strategies

```javascript
import { LRUCache } from 'lru-cache';

class CachedValidationEngine {
  constructor(engine) {
    this.engine = engine;
    this.cache = new LRUCache({
      max: 1000,
      ttl: 1000 * 60 * 5 // 5 minutes
    });
  }
  
  async validateResponse(data, templateId, context) {
    // Create cache key based on data hash and template
    const cacheKey = this.createCacheKey(data, templateId);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return {
        ...cached,
        metadata: {
          ...cached.metadata,
          fromCache: true,
          cacheHit: true
        }
      };
    }
    
    // Validate and cache result
    const result = await this.engine.validateResponse(data, templateId, context);
    
    // Only cache successful validations
    if (result.isValid) {
      this.cache.set(cacheKey, result);
    }
    
    return result;
  }
  
  createCacheKey(data, templateId) {
    // Simple hash function for cache key
    const dataStr = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < dataStr.length; i++) {
      const char = dataStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `${templateId}:${hash}`;
  }
}
```

### Parallel Validation

```javascript
async function validatePersonasInParallel(personas, templateId, concurrency = 5) {
  const results = [];
  
  // Process in batches to control concurrency
  for (let i = 0; i < personas.length; i += concurrency) {
    const batch = personas.slice(i, i + concurrency);
    
    const batchResults = await Promise.allSettled(
      batch.map(async (persona, batchIndex) => {
        const context = {
          originalRequest: { personaType: 'standard' },
          templateVariables: { globalIndex: i + batchIndex },
          culturalConstraints: {},
          userSignals: {},
          generationAttempt: 1,
          previousErrors: []
        };
        
        return await engine.validateResponse(persona, templateId, context);
      })
    );
    
    results.push(...batchResults);
  }
  
  return results;
}
```