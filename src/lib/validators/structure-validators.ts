/**
 * Structure validators for LLM response validation
 * These validators ensure that the generated personas have the correct structure and required fields
 */

import {
    ValidationResult,
    ValidationError,
    ValidationContext,
    ValidationErrorType,
    ValidationSeverity
} from '@/types/validation';

/**
 * Validates that all required fields are present in the response
 * @param requiredFields Array of field paths that must be present
 * @returns Validator function
 */
export function validateRequiredFields(requiredFields: string[]) {
    return (value: any, context: ValidationContext): ValidationResult => {
        const errors: ValidationError[] = [];
        const startTime = Date.now();

        // Handle array of personas
        if (Array.isArray(value)) {
            value.forEach((persona, index) => {
                requiredFields.forEach(fieldPath => {
                    if (!hasNestedProperty(persona, fieldPath)) {
                        errors.push({
                            id: `required-field-${fieldPath}-${index}`,
                            type: ValidationErrorType.REQUIRED_FIELD_MISSING,
                            field: `[${index}].${fieldPath}`,
                            message: `Required field '${fieldPath}' is missing in persona ${index}`,
                            severity: ValidationSeverity.ERROR,
                            value: undefined,
                            expectedValue: `Field '${fieldPath}' should be present`,
                            context: { personaIndex: index, fieldPath }
                        });
                    }
                });
            });
        } else {
            // Handle single persona object
            requiredFields.forEach(fieldPath => {
                if (!hasNestedProperty(value, fieldPath)) {
                    errors.push({
                        id: `required-field-${fieldPath}`,
                        type: ValidationErrorType.REQUIRED_FIELD_MISSING,
                        field: fieldPath,
                        message: `Required field '${fieldPath}' is missing`,
                        severity: ValidationSeverity.ERROR,
                        value: undefined,
                        expectedValue: `Field '${fieldPath}' should be present`,
                        context: { fieldPath }
                    });
                }
            });
        }

        const validationTime = Date.now() - startTime;

        return {
            isValid: errors.length === 0,
            errors,
            warnings: [],
            score: errors.length === 0 ? 100 : Math.max(0, 100 - (errors.length * 10)),
            metadata: {
                templateId: context.templateVariables?.templateId || 'unknown',
                templateVersion: '1.0.0',
                validationTime,
                rulesExecuted: 1,
                rulesSkipped: 0,
                timestamp: Date.now()
            }
        };
    };
}

/**
 * Validates that the response has a valid JSON structure
 * @param expectedSchema Optional schema to validate against
 * @returns Validator function
 */
export function validateJSONStructure(expectedSchema?: any) {
    return (value: any, context: ValidationContext): ValidationResult => {
        const errors: ValidationError[] = [];
        const startTime = Date.now();

        try {
            // Check if value is a valid object
            if (value === null || value === undefined) {
                errors.push({
                    id: 'json-structure-null',
                    type: ValidationErrorType.STRUCTURE_INVALID,
                    field: 'root',
                    message: 'Response is null or undefined',
                    severity: ValidationSeverity.ERROR,
                    value,
                    expectedValue: 'Valid JSON object or array',
                    context: {}
                });
            } else if (typeof value !== 'object') {
                errors.push({
                    id: 'json-structure-invalid-type',
                    type: ValidationErrorType.TYPE_MISMATCH,
                    field: 'root',
                    message: `Expected object or array, got ${typeof value}`,
                    severity: ValidationSeverity.ERROR,
                    value,
                    expectedValue: 'Object or array',
                    context: { actualType: typeof value }
                });
            }

            // If we have an expected schema, validate against it
            if (expectedSchema && errors.length === 0) {
                const schemaErrors = validateAgainstSchema(value, expectedSchema, 'root');
                errors.push(...schemaErrors);
            }
        } catch (error) {
            errors.push({
                id: 'json-structure-parse-error',
                type: ValidationErrorType.STRUCTURE_INVALID,
                field: 'root',
                message: `JSON structure validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                severity: ValidationSeverity.ERROR,
                value,
                expectedValue: 'Valid JSON structure',
                context: { error: error instanceof Error ? error.message : 'Unknown error' }
            });
        }

        const validationTime = Date.now() - startTime;

        return {
            isValid: errors.length === 0,
            errors,
            warnings: [],
            score: errors.length === 0 ? 100 : Math.max(0, 100 - (errors.length * 20)),
            metadata: {
                templateId: context.templateVariables?.templateId || 'unknown',
                templateVersion: '1.0.0',
                validationTime,
                rulesExecuted: 1,
                rulesSkipped: 0,
                timestamp: Date.now()
            }
        };
    };
}

/**
 * Validates cultural data structure for personas
 * @returns Validator function
 */
export function validateCulturalDataStructure() {
    return (value: any, context: ValidationContext): ValidationResult => {
        const errors: ValidationError[] = [];
        const startTime = Date.now();

        try {
            const requiredCategories = [
                'demographics',
                'psychographics',
                'culturalValues',
                'consumptionPatterns'
            ];

            // La valeur reçue est directement l'objet culturalData (pas l'objet parent)
            if (!value || typeof value !== 'object') {
                errors.push({
                    id: 'cultural-data-missing',
                    type: ValidationErrorType.REQUIRED_FIELD_MISSING,
                    field: 'culturalData',
                    message: 'Cultural data is required but missing',
                    severity: ValidationSeverity.ERROR,
                    value: value,
                    expectedValue: 'Object with cultural data categories',
                    context: {}
                });
            } else {
                // Validation des catégories requises - optimisée pour éviter les timeouts
                for (const category of requiredCategories) {
                    if (!value[category] || typeof value[category] !== 'object') {
                        errors.push({
                            id: `cultural-data-${category}`,
                            type: ValidationErrorType.STRUCTURE_INVALID,
                            field: `culturalData.${category}`,
                            message: `Cultural data category '${category}' is missing or invalid`,
                            severity: ValidationSeverity.ERROR,
                            value: value[category],
                            expectedValue: `Object with ${category} data`,
                            context: { category }
                        });
                    }
                }
            }

        } catch (error) {
            errors.push({
                id: 'cultural-data-validation-error',
                type: ValidationErrorType.VALIDATION_TIMEOUT,
                field: 'culturalData',
                message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                severity: ValidationSeverity.ERROR,
                value: value,
                expectedValue: 'Valid cultural data structure',
                context: { error: error instanceof Error ? error.message : 'Unknown error' }
            });
        }

        const validationTime = Date.now() - startTime;

        return {
            isValid: errors.length === 0,
            errors,
            warnings: [],
            score: errors.length === 0 ? 100 : Math.max(0, 100 - (errors.length * 15)),
            metadata: {
                templateId: context.templateVariables?.templateId || 'unknown',
                templateVersion: '1.0.0',
                validationTime,
                rulesExecuted: 1,
                rulesSkipped: 0,
                timestamp: Date.now()
            }
        };
    };
}

/**
 * Helper function to validate against a simple schema
 */
function validateAgainstSchema(value: any, schema: any, fieldPath: string): ValidationError[] {
    const errors: ValidationError[] = [];

    if (schema.type) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== schema.type) {
            errors.push({
                id: `schema-type-mismatch-${fieldPath}`,
                type: ValidationErrorType.TYPE_MISMATCH,
                field: fieldPath,
                message: `Expected type '${schema.type}', got '${actualType}'`,
                severity: ValidationSeverity.ERROR,
                value,
                expectedValue: schema.type,
                context: { expectedType: schema.type, actualType }
            });
        }
    }

    if (schema.properties && typeof value === 'object' && value !== null) {
        Object.keys(schema.properties).forEach(key => {
            const nestedPath = fieldPath === 'root' ? key : `${fieldPath}.${key}`;
            if (value[key] !== undefined) {
                const nestedErrors = validateAgainstSchema(value[key], schema.properties[key], nestedPath);
                errors.push(...nestedErrors);
            }
        });
    }

    return errors;
}

/**
 * Validates that array fields have the correct structure and minimum length
 * @param arrayFields Object mapping field paths to minimum lengths
 * @returns Validator function
 */
export function validateArrayStructure(arrayFields: Record<string, number>) {
    return (value: any, context: ValidationContext): ValidationResult => {
        const errors: ValidationError[] = [];
        const startTime = Date.now();

        // Handle array of personas
        if (Array.isArray(value)) {
            value.forEach((persona, index) => {
                Object.entries(arrayFields).forEach(([fieldPath, minLength]) => {
                    const fieldValue = getNestedProperty(persona, fieldPath);
                    if (fieldValue !== undefined) {
                        if (!Array.isArray(fieldValue)) {
                            errors.push({
                                id: `array-structure-type-${fieldPath}-${index}`,
                                type: ValidationErrorType.TYPE_MISMATCH,
                                field: `[${index}].${fieldPath}`,
                                message: `Field '${fieldPath}' should be an array in persona ${index}`,
                                severity: ValidationSeverity.ERROR,
                                value: fieldValue,
                                expectedValue: 'Array',
                                context: { personaIndex: index, fieldPath, actualType: typeof fieldValue }
                            });
                        } else if (fieldValue.length < minLength) {
                            errors.push({
                                id: `array-structure-length-${fieldPath}-${index}`,
                                type: ValidationErrorType.VALUE_OUT_OF_RANGE,
                                field: `[${index}].${fieldPath}`,
                                message: `Array '${fieldPath}' should have at least ${minLength} items in persona ${index}`,
                                severity: ValidationSeverity.ERROR,
                                value: fieldValue.length,
                                expectedValue: `>= ${minLength}`,
                                context: { personaIndex: index, fieldPath, actualLength: fieldValue.length, minLength }
                            });
                        }
                    }
                });
            });
        } else {
            // Handle single persona
            Object.entries(arrayFields).forEach(([fieldPath, minLength]) => {
                const fieldValue = getNestedProperty(value, fieldPath);
                if (fieldValue !== undefined) {
                    if (!Array.isArray(fieldValue)) {
                        errors.push({
                            id: `array-structure-type-${fieldPath}`,
                            type: ValidationErrorType.TYPE_MISMATCH,
                            field: fieldPath,
                            message: `Field '${fieldPath}' should be an array`,
                            severity: ValidationSeverity.ERROR,
                            value: fieldValue,
                            expectedValue: 'Array',
                            context: { fieldPath, actualType: typeof fieldValue }
                        });
                    } else if (fieldValue.length < minLength) {
                        errors.push({
                            id: `array-structure-length-${fieldPath}`,
                            type: ValidationErrorType.VALUE_OUT_OF_RANGE,
                            field: fieldPath,
                            message: `Array '${fieldPath}' should have at least ${minLength} items`,
                            severity: ValidationSeverity.ERROR,
                            value: fieldValue.length,
                            expectedValue: `>= ${minLength}`,
                            context: { fieldPath, actualLength: fieldValue.length, minLength }
                        });
                    }
                }
            });
        }

        const validationTime = Date.now() - startTime;

        return {
            isValid: errors.length === 0,
            errors,
            warnings: [],
            score: errors.length === 0 ? 100 : Math.max(0, 100 - (errors.length * 15)),
            metadata: {
                templateId: context.templateVariables?.templateId || 'unknown',
                templateVersion: '1.0.0',
                validationTime,
                rulesExecuted: 1,
                rulesSkipped: 0,
                timestamp: Date.now()
            }
        };
    };
}

/**
 * Validates that object fields have the required nested structure
 * @param objectFields Object mapping field paths to required nested properties
 * @returns Validator function
 */
export function validateObjectStructure(objectFields: Record<string, string[]>) {
    return (value: any, context: ValidationContext): ValidationResult => {
        const errors: ValidationError[] = [];
        const startTime = Date.now();

        // Handle array of personas
        if (Array.isArray(value)) {
            value.forEach((persona, index) => {
                Object.entries(objectFields).forEach(([fieldPath, requiredProps]) => {
                    const fieldValue = getNestedProperty(persona, fieldPath);
                    if (fieldValue !== undefined) {
                        if (typeof fieldValue !== 'object' || fieldValue === null) {
                            errors.push({
                                id: `object-structure-type-${fieldPath}-${index}`,
                                type: ValidationErrorType.TYPE_MISMATCH,
                                field: `[${index}].${fieldPath}`,
                                message: `Field '${fieldPath}' should be an object in persona ${index}`,
                                severity: ValidationSeverity.ERROR,
                                value: fieldValue,
                                expectedValue: 'Object',
                                context: { personaIndex: index, fieldPath, actualType: typeof fieldValue }
                            });
                        } else {
                            requiredProps.forEach(prop => {
                                if (!(prop in fieldValue)) {
                                    errors.push({
                                        id: `object-structure-prop-${fieldPath}-${prop}-${index}`,
                                        type: ValidationErrorType.REQUIRED_FIELD_MISSING,
                                        field: `[${index}].${fieldPath}.${prop}`,
                                        message: `Required property '${prop}' is missing in '${fieldPath}' for persona ${index}`,
                                        severity: ValidationSeverity.ERROR,
                                        value: undefined,
                                        expectedValue: `Property '${prop}' should be present`,
                                        context: { personaIndex: index, fieldPath, property: prop }
                                    });
                                }
                            });
                        }
                    }
                });
            });
        } else {
            // Handle single persona
            Object.entries(objectFields).forEach(([fieldPath, requiredProps]) => {
                const fieldValue = getNestedProperty(value, fieldPath);
                if (fieldValue !== undefined) {
                    if (typeof fieldValue !== 'object' || fieldValue === null) {
                        errors.push({
                            id: `object-structure-type-${fieldPath}`,
                            type: ValidationErrorType.TYPE_MISMATCH,
                            field: fieldPath,
                            message: `Field '${fieldPath}' should be an object`,
                            severity: ValidationSeverity.ERROR,
                            value: fieldValue,
                            expectedValue: 'Object',
                            context: { fieldPath, actualType: typeof fieldValue }
                        });
                    } else {
                        requiredProps.forEach(prop => {
                            if (!(prop in fieldValue)) {
                                errors.push({
                                    id: `object-structure-prop-${fieldPath}-${prop}`,
                                    type: ValidationErrorType.REQUIRED_FIELD_MISSING,
                                    field: `${fieldPath}.${prop}`,
                                    message: `Required property '${prop}' is missing in '${fieldPath}'`,
                                    severity: ValidationSeverity.ERROR,
                                    value: undefined,
                                    expectedValue: `Property '${prop}' should be present`,
                                    context: { fieldPath, property: prop }
                                });
                            }
                        });
                    }
                }
            });
        }

        const validationTime = Date.now() - startTime;

        return {
            isValid: errors.length === 0,
            errors,
            warnings: [],
            score: errors.length === 0 ? 100 : Math.max(0, 100 - (errors.length * 12)),
            metadata: {
                templateId: context.templateVariables?.templateId || 'unknown',
                templateVersion: '1.0.0',
                validationTime,
                rulesExecuted: 1,
                rulesSkipped: 0,
                timestamp: Date.now()
            }
        };
    };
}

/**
 * Validates that string fields are not empty and meet minimum length requirements
 * @param stringFields Object mapping field paths to minimum lengths
 * @returns Validator function
 */
export function validateStringStructure(stringFields: Record<string, number>) {
    return (value: any, context: ValidationContext): ValidationResult => {
        const errors: ValidationError[] = [];
        const startTime = Date.now();

        // Handle array of personas
        if (Array.isArray(value)) {
            value.forEach((persona, index) => {
                Object.entries(stringFields).forEach(([fieldPath, minLength]) => {
                    const fieldValue = getNestedProperty(persona, fieldPath);
                    if (fieldValue !== undefined) {
                        if (typeof fieldValue !== 'string') {
                            errors.push({
                                id: `string-structure-type-${fieldPath}-${index}`,
                                type: ValidationErrorType.TYPE_MISMATCH,
                                field: `[${index}].${fieldPath}`,
                                message: `Field '${fieldPath}' should be a string in persona ${index}`,
                                severity: ValidationSeverity.ERROR,
                                value: fieldValue,
                                expectedValue: 'String',
                                context: { personaIndex: index, fieldPath, actualType: typeof fieldValue }
                            });
                        } else if (fieldValue.trim().length < minLength) {
                            errors.push({
                                id: `string-structure-length-${fieldPath}-${index}`,
                                type: ValidationErrorType.VALUE_OUT_OF_RANGE,
                                field: `[${index}].${fieldPath}`,
                                message: `String '${fieldPath}' should have at least ${minLength} characters in persona ${index}`,
                                severity: ValidationSeverity.ERROR,
                                value: fieldValue.trim().length,
                                expectedValue: `>= ${minLength}`,
                                context: { personaIndex: index, fieldPath, actualLength: fieldValue.trim().length, minLength }
                            });
                        }
                    }
                });
            });
        } else {
            // Handle single persona
            Object.entries(stringFields).forEach(([fieldPath, minLength]) => {
                const fieldValue = getNestedProperty(value, fieldPath);
                if (fieldValue !== undefined) {
                    if (typeof fieldValue !== 'string') {
                        errors.push({
                            id: `string-structure-type-${fieldPath}`,
                            type: ValidationErrorType.TYPE_MISMATCH,
                            field: fieldPath,
                            message: `Field '${fieldPath}' should be a string`,
                            severity: ValidationSeverity.ERROR,
                            value: fieldValue,
                            expectedValue: 'String',
                            context: { fieldPath, actualType: typeof fieldValue }
                        });
                    } else if (fieldValue.trim().length < minLength) {
                        errors.push({
                            id: `string-structure-length-${fieldPath}`,
                            type: ValidationErrorType.VALUE_OUT_OF_RANGE,
                            field: fieldPath,
                            message: `String '${fieldPath}' should have at least ${minLength} characters`,
                            severity: ValidationSeverity.ERROR,
                            value: fieldValue.trim().length,
                            expectedValue: `>= ${minLength}`,
                            context: { fieldPath, actualLength: fieldValue.trim().length, minLength }
                        });
                    }
                }
            });
        }

        const validationTime = Date.now() - startTime;

        return {
            isValid: errors.length === 0,
            errors,
            warnings: [],
            score: errors.length === 0 ? 100 : Math.max(0, 100 - (errors.length * 10)),
            metadata: {
                templateId: context.templateVariables?.templateId || 'unknown',
                templateVersion: '1.0.0',
                validationTime,
                rulesExecuted: 1,
                rulesSkipped: 0,
                timestamp: Date.now()
            }
        };
    };
}

/**
 * Helper function to check if an object has a nested property
 * @param obj Object to check
 * @param path Dot-separated path to the property
 * @returns True if property exists
 */
function hasNestedProperty(obj: any, path: string): boolean {
    if (!obj || typeof obj !== 'object') {
        return false;
    }

    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
        if (current === null || current === undefined || typeof current !== 'object') {
            return false;
        }
        if (!(key in current)) {
            return false;
        }
        current = current[key];
    }

    return current !== undefined && current !== null;
}

/**
 * Helper function to get a nested property value
 * @param obj Object to get property from
 * @param path Dot-separated path to the property
 * @returns Property value or undefined if not found
 */
function getNestedProperty(obj: any, path: string): any {
    if (!obj || typeof obj !== 'object') {
        return undefined;
    }

    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
        if (current === null || current === undefined || typeof current !== 'object') {
            return undefined;
        }
        if (!(key in current)) {
            return undefined;
        }
        current = current[key];
    }

    return current;
}