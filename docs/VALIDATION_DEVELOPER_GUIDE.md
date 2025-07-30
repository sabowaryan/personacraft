# Validation System Developer Guide

## Overview

This guide provides comprehensive information for developers working with the LLM Response Validation System. It covers architecture, implementation patterns, best practices, and common use cases.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Components](#core-components)
3. [Creating Custom Validators](#creating-custom-validators)
4. [Template Development](#template-development)
5. [Integration Patterns](#integration-patterns)
6. [Testing Strategies](#testing-strategies)
7. [Performance Optimization](#performance-optimization)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

## Architecture Overview

The validation system follows a modular architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Validation System                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Template Engine │  │ Rule Processor  │  │ Error Handler│ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Template Registry│  │ Metrics Collector│  │ Fallback Sys │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Structure Valid │  │ Content Valid   │  │ Format Valid │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Modularity**: Each component has a single responsibility
2. **Extensibility**: Easy to add new validators and templates
3. **Performance**: Optimized for high-throughput validation
4. **Reliability**: Comprehensive error handling and fallback mechanisms
5. **Observability**: Built-in metrics and monitoring

## Core Components

### ValidationTemplateEngine

The main orchestrator that coordinates validation processes.

```typescript
import { ValidationTemplateEngine } from '@/lib/validation/validation-template-engine';
import { TemplateRegistry } from '@/lib/validation/template-registry';

// Initialize the engine
const registry = new TemplateRegistry();
const engine = new ValidationTemplateEngine(registry);

// Validate a response
const result = await engine.validateResponse(
  responseData,
  'standard-persona-v1',
  validationContext
);
```

### TemplateRegistry

Manages template storage, retrieval, and caching.

```typescript
import { TemplateRegistry } from '@/lib/validation/template-registry';

const registry = new TemplateRegistry();

// Register a template
registry.register(myTemplate);

// Get a template
const template = registry.get('template-id');

// List templates by type
const standardTemplates = registry.getByPersonaType('standard');
```

### ValidationRuleProcessor

Executes individual validation rules with support for parallelization and dependencies.

```typescript
import { ValidationRuleProcessor } from '@/lib/validation/rule-processor';

const processor = new ValidationRuleProcessor();

// Process rules for a template
const results = await processor.processRules(
  template.rules,
  responseData,
  context
);
```

## Creating Custom Validators

### Basic Validator Structure

```typescript
import { ValidatorFunction, ValidationResult } from '@/types/validation';

export const validateCustomField: ValidatorFunction = (
  value: any,
  context: ValidationContext
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Validation logic here
  if (!value || typeof value !== 'string') {
    errors.push({
      field: 'customField',
      message: 'Custom field must be a non-empty string',
      type: ValidationErrorType.TYPE_MISMATCH,
      severity: ValidationSeverity.ERROR,
      ruleId: 'custom-field-validator',
      value,
      expected: 'string'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: errors.length === 0 ? 1 : 0,
    metadata: {
      validationTime: Date.now(),
      rulesExecuted: 1,
      templateId: context.templateId,
      templateVersion: context.templateVersion
    }
  };
};
```

### Advanced Validator with Dependencies

```typescript
export const validateComplexField: ValidatorFunction = (
  value: any,
  context: ValidationContext
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check dependencies
  const requiredField = context.data?.requiredField;
  if (!requiredField) {
    errors.push({
      field: 'complexField',
      message: 'Complex field requires requiredField to be present',
      type: ValidationErrorType.BUSINESS_RULE_VIOLATION,
      severity: ValidationSeverity.ERROR,
      ruleId: 'complex-field-dependency',
      value,
      expected: 'requiredField to be present'
    });
    
    return {
      isValid: false,
      errors,
      warnings,
      score: 0,
      metadata: {
        validationTime: Date.now(),
        rulesExecuted: 1,
        templateId: context.templateId,
        templateVersion: context.templateVersion
      }
    };
  }

  // Main validation logic
  if (Array.isArray(value)) {
    if (value.length === 0) {
      warnings.push({
        field: 'complexField',
        message: 'Complex field array is empty',
        type: ValidationRuleType.CONTENT,
        severity: ValidationSeverity.WARNING,
        ruleId: 'complex-field-empty'
      });
    }

    // Validate each item
    value.forEach((item, index) => {
      if (!item.id || !item.name) {
        errors.push({
          field: `complexField[${index}]`,
          message: 'Each item must have id and name',
          type: ValidationErrorType.REQUIRED_FIELD_MISSING,
          severity: ValidationSeverity.ERROR,
          ruleId: 'complex-field-item-structure',
          value: item,
          expected: '{ id: string, name: string }'
        });
      }
    });
  } else {
    errors.push({
      field: 'complexField',
      message: 'Complex field must be an array',
      type: ValidationErrorType.TYPE_MISMATCH,
      severity: ValidationSeverity.ERROR,
      ruleId: 'complex-field-type',
      value,
      expected: 'array'
    });
  }

  const score = errors.length === 0 ? (warnings.length === 0 ? 1 : 0.8) : 0;

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score,
    metadata: {
      validationTime: Date.now(),
      rulesExecuted: 1,
      templateId: context.templateId,
      templateVersion: context.templateVersion
    }
  };
};
```

### Async Validator

```typescript
export const validateAsyncField: ValidatorFunction = async (
  value: any,
  context: ValidationContext
): Promise<ValidationResult> => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  try {
    // Simulate async validation (e.g., API call, database lookup)
    const isValid = await externalValidationService.validate(value);
    
    if (!isValid) {
      errors.push({
        field: 'asyncField',
        message: 'External validation failed',
        type: ValidationErrorType.BUSINESS_RULE_VIOLATION,
        severity: ValidationSeverity.ERROR,
        ruleId: 'async-field-external',
        value
      });
    }
  } catch (error) {
    errors.push({
      field: 'asyncField',
      message: 'External validation service unavailable',
      type: ValidationErrorType.VALIDATION_TIMEOUT,
      severity: ValidationSeverity.WARNING,
      ruleId: 'async-field-timeout',
      value
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: errors.length === 0 ? 1 : 0,
    metadata: {
      validationTime: Date.now(),
      rulesExecuted: 1,
      templateId: context.templateId,
      templateVersion: context.templateVersion
    }
  };
};
```

## Template Development

### Creating a New Template

```typescript
import { ValidationTemplate, PersonaType, ValidationRuleType, ValidationSeverity } from '@/types/validation';
import { validateRequiredFields, validateAgeRange } from '@/lib/validators';

export const customPersonaTemplate: ValidationTemplate = {
  id: 'custom-persona-v1',
  name: 'Custom Persona Validation',
  version: '1.0.0',
  personaType: PersonaType.STANDARD,
  rules: [
    {
      id: 'required-fields',
      type: ValidationRuleType.STRUCTURE,
      field: 'root',
      validator: validateRequiredFields(['id', 'name', 'age', 'occupation']),
      severity: ValidationSeverity.ERROR,
      message: 'Missing required fields: id, name, age, occupation',
      required: true,
      priority: 100
    },
    {
      id: 'age-validation',
      type: ValidationRuleType.CONTENT,
      field: 'age',
      validator: validateAgeRange(18, 80),
      severity: ValidationSeverity.ERROR,
      message: 'Age must be between 18 and 80',
      required: true,
      priority: 90,
      dependencies: ['required-fields']
    },
    {
      id: 'name-format',
      type: ValidationRuleType.FORMAT,
      field: 'name',
      validator: validateNameFormat,
      severity: ValidationSeverity.WARNING,
      message: 'Name should be properly formatted',
      required: false,
      priority: 50,
      dependencies: ['required-fields']
    }
  ],
  fallbackStrategy: {
    type: FallbackStrategyType.REGENERATE,
    maxRetries: 3,
    fallbackTemplate: 'simple-persona-v1'
  },
  metadata: {
    createdAt: Date.now(),
    updatedAt: Date.now(),
    author: 'Developer',
    description: 'Custom validation template for specific use case',
    tags: ['custom', 'standard'],
    isActive: true
  }
};
```

### Template Versioning

```typescript
// Version 1.0.0
export const templateV1: ValidationTemplate = {
  id: 'my-template-v1',
  version: '1.0.0',
  // ... template definition
};

// Version 1.1.0 - Added new validation rule
export const templateV1_1: ValidationTemplate = {
  id: 'my-template-v1-1',
  version: '1.1.0',
  rules: [
    ...templateV1.rules,
    {
      id: 'new-validation-rule',
      // ... new rule definition
    }
  ],
  // ... rest of template
};

// Migration function
export function migrateTemplate(oldTemplate: ValidationTemplate): ValidationTemplate {
  if (oldTemplate.version === '1.0.0') {
    return {
      ...oldTemplate,
      version: '1.1.0',
      rules: [
        ...oldTemplate.rules,
        // Add new rules
      ]
    };
  }
  return oldTemplate;
}
```

## Integration Patterns

### Middleware Integration

```typescript
import { ValidationTemplateEngine } from '@/lib/validation/validation-template-engine';

export async function validatePersonaMiddleware(
  request: PersonaGenerationRequest,
  response: any,
  next: Function
) {
  try {
    const validationResult = await validationEngine.validateResponse(
      response,
      getTemplateIdForPersonaType(request.personaType),
      createValidationContext(request)
    );

    if (!validationResult.isValid) {
      // Handle validation failure
      if (validationResult.errors.some(e => e.severity === 'error')) {
        throw new ValidationError('Response validation failed', validationResult.errors);
      }
    }

    // Attach validation metadata
    response._validation = {
      score: validationResult.score,
      warnings: validationResult.warnings,
      metadata: validationResult.metadata
    };

    next();
  } catch (error) {
    next(error);
  }
}
```

### Service Integration

```typescript
import { QlooFirstPersonaGenerator } from '@/lib/services/qloo-first-persona-generator';
import { ValidationTemplateEngine } from '@/lib/validation/validation-template-engine';

export class ValidatedPersonaGenerator extends QlooFirstPersonaGenerator {
  constructor(
    private validationEngine: ValidationTemplateEngine,
    ...args: any[]
  ) {
    super(...args);
  }

  async generatePersona(request: PersonaGenerationRequest): Promise<PersonaResponse> {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        // Generate persona using parent class
        const persona = await super.generatePersona(request);

        // Validate the generated persona
        const validationResult = await this.validationEngine.validateResponse(
          persona,
          this.getTemplateId(request.personaType),
          this.createValidationContext(request, attempts)
        );

        if (validationResult.isValid) {
          return {
            ...persona,
            _validation: {
              score: validationResult.score,
              warnings: validationResult.warnings,
              metadata: validationResult.metadata
            }
          };
        }

        // Handle validation failure
        attempts++;
        if (attempts >= maxAttempts) {
          // Use fallback strategy
          return await this.handleValidationFailure(request, validationResult);
        }

        // Retry with enhanced prompt
        request = this.enhancePromptWithValidationErrors(request, validationResult.errors);

      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw error;
        }
      }
    }

    throw new Error('Failed to generate valid persona after maximum attempts');
  }

  private getTemplateId(personaType: PersonaType): string {
    const templateMap = {
      [PersonaType.SIMPLE]: 'simple-persona-v1',
      [PersonaType.STANDARD]: 'standard-persona-v1',
      [PersonaType.B2B]: 'b2b-persona-v1'
    };
    return templateMap[personaType];
  }

  private createValidationContext(
    request: PersonaGenerationRequest,
    attempt: number
  ): ValidationContext {
    return {
      originalRequest: request,
      templateVariables: {},
      culturalConstraints: request.culturalData || {},
      userSignals: request.userSignals || {},
      generationAttempt: attempt + 1,
      previousErrors: []
    };
  }

  private enhancePromptWithValidationErrors(
    request: PersonaGenerationRequest,
    errors: ValidationError[]
  ): PersonaGenerationRequest {
    const errorMessages = errors.map(e => `${e.field}: ${e.message}`).join('; ');
    
    return {
      ...request,
      additionalInstructions: [
        ...(request.additionalInstructions || []),
        `Please ensure the response addresses these validation issues: ${errorMessages}`
      ]
    };
  }

  private async handleValidationFailure(
    request: PersonaGenerationRequest,
    validationResult: ValidationResult
  ): Promise<PersonaResponse> {
    // Implement fallback strategy
    const fallbackTemplate = await this.validationEngine.getFallbackTemplate(
      this.getTemplateId(request.personaType)
    );

    if (fallbackTemplate) {
      // Try with simpler template
      return await this.generateWithTemplate(request, fallbackTemplate.id);
    }

    // Return default response
    return this.getDefaultPersonaResponse(request.personaType);
  }
}
```

## Testing Strategies

### Unit Testing Validators

```typescript
import { validateAgeRange } from '@/lib/validators/content-validators';
import { ValidationContext } from '@/types/validation';

describe('validateAgeRange', () => {
  const mockContext: ValidationContext = {
    originalRequest: {} as any,
    templateVariables: {},
    culturalConstraints: {} as any,
    userSignals: {} as any,
    generationAttempt: 1,
    previousErrors: []
  };

  it('should validate age within range', () => {
    const validator = validateAgeRange(18, 65);
    const result = validator(25, mockContext);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.score).toBe(1);
  });

  it('should reject age below minimum', () => {
    const validator = validateAgeRange(18, 65);
    const result = validator(16, mockContext);

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain('below minimum');
  });

  it('should reject age above maximum', () => {
    const validator = validateAgeRange(18, 65);
    const result = validator(70, mockContext);

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain('above maximum');
  });

  it('should handle invalid age types', () => {
    const validator = validateAgeRange(18, 65);
    const result = validator('invalid', mockContext);

    expect(result.isValid).toBe(false);
    expect(result.errors[0].type).toBe(ValidationErrorType.TYPE_MISMATCH);
  });
});
```

### Integration Testing

```typescript
import { ValidationTemplateEngine } from '@/lib/validation/validation-template-engine';
import { TemplateRegistry } from '@/lib/validation/template-registry';
import { standardPersonaTemplate } from '@/lib/validation/templates';

describe('ValidationTemplateEngine Integration', () => {
  let engine: ValidationTemplateEngine;
  let registry: TemplateRegistry;

  beforeEach(() => {
    registry = new TemplateRegistry();
    registry.register(standardPersonaTemplate);
    engine = new ValidationTemplateEngine(registry);
  });

  it('should validate complete persona successfully', async () => {
    const validPersona = {
      id: 'persona-123',
      name: 'John Doe',
      age: 30,
      occupation: 'Software Engineer',
      demographics: {
        age: 30,
        gender: 'male',
        income: 100000,
        education: 'Bachelor\'s Degree'
      },
      culturalData: {
        language: 'English',
        region: 'North America',
        culturalValues: ['individualism']
      }
    };

    const result = await engine.validateResponse(
      validPersona,
      'standard-persona-v1',
      mockValidationContext
    );

    expect(result.isValid).toBe(true);
    expect(result.score).toBeGreaterThan(0.9);
  });

  it('should handle validation failures with retry', async () => {
    const invalidPersona = {
      id: 'persona-123',
      // Missing required fields
    };

    const result = await engine.validateResponse(
      invalidPersona,
      'standard-persona-v1',
      mockValidationContext
    );

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
```

### End-to-End Testing

```typescript
import { request } from 'supertest';
import app from '@/app';

describe('Validation API E2E', () => {
  it('should create and test a template', async () => {
    // Create template
    const templateResponse = await request(app)
      .post('/api/validation/templates')
      .send({
        id: 'test-template',
        name: 'Test Template',
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
          author: 'Test',
          description: 'Test template',
          tags: ['test'],
          isActive: true
        }
      })
      .expect(200);

    expect(templateResponse.body.success).toBe(true);

    // Test template
    const testResponse = await request(app)
      .post('/api/validation/test')
      .send({
        templateId: 'test-template',
        testData: {
          name: 'Test User',
          age: 25
        }
      })
      .expect(200);

    expect(testResponse.body.success).toBe(true);
    expect(testResponse.body.data.isValid).toBe(true);
  });
});
```

## Performance Optimization

### Rule Execution Optimization

```typescript
// Parallel execution for independent rules
export class OptimizedRuleProcessor {
  async processRules(
    rules: ValidationRule[],
    data: any,
    context: ValidationContext
  ): Promise<ValidationResult[]> {
    // Group rules by dependencies
    const ruleGroups = this.groupRulesByDependencies(rules);
    const results: ValidationResult[] = [];

    for (const group of ruleGroups) {
      // Execute rules in parallel within each group
      const groupResults = await Promise.all(
        group.map(rule => this.executeRule(rule, data, context))
      );
      
      results.push(...groupResults);

      // Stop if critical errors found
      const criticalErrors = groupResults.some(
        result => result.errors.some(error => error.severity === 'error')
      );
      
      if (criticalErrors && context.failFast) {
        break;
      }
    }

    return results;
  }

  private groupRulesByDependencies(rules: ValidationRule[]): ValidationRule[][] {
    const groups: ValidationRule[][] = [];
    const processed = new Set<string>();
    
    // Implementation of dependency-based grouping
    // ...
    
    return groups;
  }
}
```

### Caching Strategies

```typescript
import { LRUCache } from 'lru-cache';

export class CachedTemplateRegistry extends TemplateRegistry {
  private cache = new LRUCache<string, ValidationTemplate>({
    max: 100,
    ttl: 1000 * 60 * 10 // 10 minutes
  });

  get(id: string): ValidationTemplate | null {
    // Check cache first
    const cached = this.cache.get(id);
    if (cached) {
      return cached;
    }

    // Load from storage
    const template = super.get(id);
    if (template) {
      this.cache.set(id, template);
    }

    return template;
  }

  register(template: ValidationTemplate): void {
    super.register(template);
    this.cache.set(template.id, template);
  }

  update(id: string, template: ValidationTemplate): void {
    super.update(id, template);
    this.cache.set(id, template);
  }

  delete(id: string): boolean {
    const result = super.delete(id);
    this.cache.delete(id);
    return result;
  }
}
```

## Troubleshooting

### Common Issues

#### Template Not Found
```typescript
// Check if template is registered
const template = registry.get('template-id');
if (!template) {
  console.error('Template not found:', 'template-id');
  console.log('Available templates:', registry.list().map(t => t.id));
}
```

#### Validation Timeout
```typescript
// Increase timeout for specific rules
const rule: ValidationRule = {
  id: 'slow-validation',
  timeout: 10000, // 10 seconds instead of default 5
  // ... other properties
};
```

#### Memory Leaks
```typescript
// Proper cleanup in long-running processes
export class ValidationService {
  private engine: ValidationTemplateEngine;
  
  async cleanup(): Promise<void> {
    // Clear caches
    await this.engine.clearCaches();
    
    // Cancel pending validations
    await this.engine.cancelPendingValidations();
  }
}
```

### Debug Mode

```typescript
// Enable debug logging
const engine = new ValidationTemplateEngine(registry, {
  debug: true,
  logLevel: 'verbose'
});

// Debug specific validation
const result = await engine.validateResponse(data, templateId, {
  ...context,
  debug: true
});

console.log('Debug info:', result.metadata.debugInfo);
```

## Best Practices

### Template Design

1. **Keep rules focused**: Each rule should validate one specific aspect
2. **Use appropriate severity levels**: Reserve ERROR for blocking issues
3. **Provide clear error messages**: Help developers understand what went wrong
4. **Consider performance**: Expensive validations should have higher priority
5. **Plan for evolution**: Design templates to be easily extensible

### Validator Implementation

1. **Handle edge cases**: Always validate input types and handle null/undefined
2. **Use consistent error formats**: Follow the established error structure
3. **Implement timeouts**: Prevent hanging validations
4. **Log appropriately**: Use structured logging for debugging
5. **Test thoroughly**: Cover all code paths and edge cases

### Integration

1. **Use feature flags**: Allow gradual rollout of validation changes
2. **Monitor performance**: Track validation times and success rates
3. **Implement fallbacks**: Always have a recovery strategy
4. **Cache effectively**: Balance performance with data freshness
5. **Handle failures gracefully**: Don't let validation failures break the user experience

### Monitoring

1. **Track key metrics**: Success rates, validation times, error patterns
2. **Set up alerts**: Monitor for unusual patterns or failures
3. **Use structured logging**: Make logs searchable and analyzable
4. **Regular reviews**: Periodically review and optimize templates
5. **User feedback**: Collect feedback on validation accuracy and usefulness

## Conclusion

The validation system provides a robust foundation for ensuring LLM response quality. By following the patterns and practices outlined in this guide, developers can effectively extend and maintain the system while ensuring high performance and reliability.

For additional support or questions, refer to the API documentation or reach out to the development team.