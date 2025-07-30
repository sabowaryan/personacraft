/**
 * Standard Persona Validation Template
 * Comprehensive validation rules for standard personas with full cultural data
 */

import {
    ValidationTemplate,
    ValidationRule,
    ValidationRuleType,
    ValidationSeverity,
    PersonaType,
    FallbackStrategyType
} from '@/types/validation';

import { validateRequiredFields, validateCulturalDataStructure, validateJSONStructure } from '@/lib/validators/structure-validators';
import { validateAgeRange, validateLocationFormat, validateCulturalDataConsistency, validateIncomeRange, validateOccupationConsistency } from '@/lib/validators/content-validators';
import { validateEmailFormat, validatePhoneFormat, validateDateFormat, validateArrayFormat } from '@/lib/validators/format-validators';

/**
 * Standard persona template with comprehensive validation rules
 */
export const standardPersonaTemplate: ValidationTemplate = {
    id: 'standard-persona-v1',
    name: 'Standard Persona Validation',
    version: '1.0.0',
    personaType: PersonaType.STANDARD,
    rules: [
        // Structure validation rules
        {
            id: 'required-fields-basic',
            type: ValidationRuleType.STRUCTURE,
            field: 'root',
            validator: validateRequiredFields([
                'id',
                'name', 
                'age',
                'occupation',
                'culturalData'
            ]),
            severity: ValidationSeverity.ERROR,
            message: 'Missing required basic fields',
            required: true,
            priority: 1
        },
        {
            id: 'json-structure',
            type: ValidationRuleType.STRUCTURE,
            field: 'root',
            validator: validateJSONStructure(),
            severity: ValidationSeverity.ERROR,
            message: 'Invalid JSON structure',
            required: true,
            priority: 1
        },
        {
            id: 'cultural-data-structure',
            type: ValidationRuleType.STRUCTURE,
            field: 'culturalData',
            validator: validateCulturalDataStructure(),
            severity: ValidationSeverity.ERROR,
            message: 'Cultural data must contain all required categories',
            required: true,
            priority: 2
        },
        {
            id: 'required-cultural-demographics',
            type: ValidationRuleType.STRUCTURE,
            field: 'culturalData.demographics',
            validator: validateRequiredFields([
                'culturalData.demographics.age',
                'culturalData.demographics.location',
                'culturalData.demographics.income'
            ]),
            severity: ValidationSeverity.ERROR,
            message: 'Missing required demographic fields in cultural data',
            required: true,
            priority: 2
        },
        {
            id: 'required-cultural-psychographics',
            type: ValidationRuleType.STRUCTURE,
            field: 'culturalData.psychographics',
            validator: validateRequiredFields([
                'culturalData.psychographics.values',
                'culturalData.psychographics.interests',
                'culturalData.psychographics.lifestyle'
            ]),
            severity: ValidationSeverity.ERROR,
            message: 'Missing required psychographic fields in cultural data',
            required: true,
            priority: 2
        },

        // Content validation rules
        {
            id: 'age-range',
            type: ValidationRuleType.CONTENT,
            field: 'age',
            validator: validateAgeRange(18, 80),
            severity: ValidationSeverity.ERROR,
            message: 'Age must be between 18 and 80',
            required: true,
            priority: 3
        },
        {
            id: 'cultural-age-consistency',
            type: ValidationRuleType.CONTENT,
            field: 'culturalData.demographics.age',
            validator: validateAgeRange(18, 80),
            severity: ValidationSeverity.ERROR,
            message: 'Cultural data age must be between 18 and 80',
            required: true,
            priority: 3
        },
        {
            id: 'location-format',
            type: ValidationRuleType.CONTENT,
            field: 'culturalData.demographics.location',
            validator: validateLocationFormat(['city_country', 'city_state_country']),
            severity: ValidationSeverity.ERROR,
            message: 'Location must be in valid format (City, Country or City, State, Country)',
            required: true,
            priority: 3
        },
        {
            id: 'income-range',
            type: ValidationRuleType.CONTENT,
            field: 'culturalData.demographics.income',
            validator: validateIncomeRange(0, 1000000),
            severity: ValidationSeverity.ERROR,
            message: 'Income must be within reasonable range',
            required: true,
            priority: 3
        },
        {
            id: 'cultural-data-consistency',
            type: ValidationRuleType.CONTENT,
            field: 'culturalData',
            validator: validateCulturalDataConsistency(),
            severity: ValidationSeverity.WARNING,
            message: 'Cultural data should be internally consistent',
            required: false,
            priority: 4
        },
        {
            id: 'occupation-consistency',
            type: ValidationRuleType.CONTENT,
            field: 'root',
            validator: validateOccupationConsistency(),
            severity: ValidationSeverity.WARNING,
            message: 'Occupation should be consistent with income and industry',
            required: false,
            priority: 4
        },

        // Format validation rules
        {
            id: 'email-format',
            type: ValidationRuleType.FORMAT,
            field: 'email',
            validator: validateEmailFormat(false),
            severity: ValidationSeverity.WARNING,
            message: 'Email format should be valid if provided',
            required: false,
            priority: 5
        },
        {
            id: 'phone-format',
            type: ValidationRuleType.FORMAT,
            field: 'phone',
            validator: validatePhoneFormat(['international', 'national']),
            severity: ValidationSeverity.WARNING,
            message: 'Phone format should be valid if provided',
            required: false,
            priority: 5
        },
        {
            id: 'date-format',
            type: ValidationRuleType.FORMAT,
            field: 'root',
            validator: validateDateFormat(['iso', 'us'], false),
            severity: ValidationSeverity.WARNING,
            message: 'Date fields should be in valid format',
            required: false,
            priority: 5
        },
        {
            id: 'array-format-interests',
            type: ValidationRuleType.FORMAT,
            field: 'culturalData.psychographics.interests',
            validator: validateArrayFormat({
                'culturalData.psychographics.interests': {
                    minLength: 1,
                    maxLength: 20,
                    itemType: 'string',
                    allowEmpty: false,
                    uniqueItems: true
                }
            }),
            severity: ValidationSeverity.ERROR,
            message: 'Interests should be a non-empty array of unique strings',
            required: true,
            priority: 3
        },
        {
            id: 'array-format-values',
            type: ValidationRuleType.FORMAT,
            field: 'culturalData.psychographics.values',
            validator: validateArrayFormat({
                'culturalData.psychographics.values': {
                    minLength: 1,
                    maxLength: 15,
                    itemType: 'string',
                    allowEmpty: false,
                    uniqueItems: true
                }
            }),
            severity: ValidationSeverity.ERROR,
            message: 'Values should be a non-empty array of unique strings',
            required: true,
            priority: 3
        },

        // Business validation rules
        {
            id: 'persona-completeness',
            type: ValidationRuleType.BUSINESS,
            field: 'root',
            validator: validatePersonaCompleteness(),
            severity: ValidationSeverity.WARNING,
            message: 'Persona should have sufficient detail for marketing use',
            required: false,
            priority: 6
        },
        {
            id: 'cultural-depth',
            type: ValidationRuleType.BUSINESS,
            field: 'culturalData',
            validator: validateCulturalDepth(),
            severity: ValidationSeverity.WARNING,
            message: 'Cultural data should provide meaningful insights',
            required: false,
            priority: 6
        },
        {
            id: 'consumption-patterns',
            type: ValidationRuleType.BUSINESS,
            field: 'culturalData.consumptionPatterns',
            validator: validateConsumptionPatterns(),
            severity: ValidationSeverity.ERROR,
            message: 'Consumption patterns must be present and detailed',
            required: true,
            priority: 3
        }
    ],
    fallbackStrategy: {
        type: FallbackStrategyType.SIMPLE_TEMPLATE,
        maxRetries: 3,
        fallbackTemplate: 'simple-persona-v1',
        retryDelay: 1000,
        backoffMultiplier: 1.5
    },
    metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        author: 'Qloo Validation System',
        description: 'Comprehensive validation template for standard personas with full cultural data analysis',
        tags: ['standard', 'cultural-data', 'comprehensive'],
        isActive: true,
        supportedLLMs: ['gpt-4', 'gpt-3.5-turbo', 'claude-3', 'gemini-pro']
    }
};

/**
 * Business rule validator for persona completeness
 */
function validatePersonaCompleteness() {
    return (value: any, context: any) => {
        const errors: any[] = [];
        const warnings: any[] = [];
        const startTime = Date.now();

        // Check if persona has sufficient detail
        const requiredDetailFields = [
            'name', 'age', 'occupation', 'culturalData.demographics',
            'culturalData.psychographics', 'culturalData.culturalValues',
            'culturalData.consumptionPatterns'
        ];

        let completenessScore = 0;
        const totalFields = requiredDetailFields.length;

        requiredDetailFields.forEach(field => {
            if (hasNestedProperty(value, field)) {
                const fieldValue = getNestedProperty(value, field);
                if (fieldValue && (typeof fieldValue === 'string' ? fieldValue.trim().length > 0 : true)) {
                    completenessScore++;
                }
            }
        });

        const completenessPercentage = (completenessScore / totalFields) * 100;

        if (completenessPercentage < 70) {
            warnings.push({
                id: 'persona-completeness-low',
                field: 'root',
                message: `Persona completeness is ${completenessPercentage.toFixed(1)}%, consider adding more detail`,
                value: completenessPercentage,
                suggestion: 'Add more detailed information to improve persona quality'
            });
        }

        const validationTime = Date.now() - startTime;

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            score: Math.max(0, completenessPercentage),
            metadata: {
                templateId: context.templateVariables?.templateId || 'standard-persona-v1',
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
 * Business rule validator for cultural data depth
 */
function validateCulturalDepth() {
    return (value: any, context: any) => {
        const errors: any[] = [];
        const warnings: any[] = [];
        const startTime = Date.now();

        if (!value || typeof value !== 'object') {
            errors.push({
                id: 'cultural-depth-missing',
                type: 'STRUCTURE_INVALID',
                field: 'culturalData',
                message: 'Cultural data is required for depth validation',
                severity: 'ERROR',
                value,
                expectedValue: 'Object with cultural data',
                context: {}
            });
        } else {
            // Check depth of cultural values
            const culturalValues = value.culturalValues;
            if (culturalValues && typeof culturalValues === 'object') {
                const valueKeys = Object.keys(culturalValues);
                if (valueKeys.length < 3) {
                    warnings.push({
                        id: 'cultural-values-shallow',
                        field: 'culturalData.culturalValues',
                        message: 'Cultural values should include more dimensions for better insights',
                        value: valueKeys.length,
                        suggestion: 'Include values like individualism, power distance, uncertainty avoidance, etc.'
                    });
                }
            }

            // Check consumption patterns depth
            const consumptionPatterns = value.consumptionPatterns;
            if (consumptionPatterns && typeof consumptionPatterns === 'object') {
                const requiredPatterns = ['spendingHabits', 'brandPreferences', 'mediaConsumption'];
                const missingPatterns = requiredPatterns.filter(pattern => !consumptionPatterns[pattern]);
                
                if (missingPatterns.length > 0) {
                    warnings.push({
                        id: 'consumption-patterns-incomplete',
                        field: 'culturalData.consumptionPatterns',
                        message: `Missing consumption pattern categories: ${missingPatterns.join(', ')}`,
                        value: missingPatterns,
                        suggestion: 'Include comprehensive consumption pattern analysis'
                    });
                }
            }
        }

        const validationTime = Date.now() - startTime;

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            score: errors.length === 0 ? (warnings.length === 0 ? 100 : 80) : 0,
            metadata: {
                templateId: context.templateVariables?.templateId || 'standard-persona-v1',
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
 * Business rule validator for consumption patterns
 */
function validateConsumptionPatterns() {
    return (value: any, context: any) => {
        const errors: any[] = [];
        const warnings: any[] = [];
        const startTime = Date.now();

        if (!value || typeof value !== 'object') {
            errors.push({
                id: 'consumption-patterns-missing',
                type: 'REQUIRED_FIELD_MISSING',
                field: 'culturalData.consumptionPatterns',
                message: 'Consumption patterns are required for standard personas',
                severity: 'ERROR',
                value,
                expectedValue: 'Object with consumption pattern data',
                context: {}
            });
        } else {
            const requiredFields = ['spendingHabits', 'brandPreferences', 'mediaConsumption'];
            requiredFields.forEach(field => {
                if (!value[field]) {
                    errors.push({
                        id: `consumption-patterns-${field}-missing`,
                        type: 'REQUIRED_FIELD_MISSING',
                        field: `culturalData.consumptionPatterns.${field}`,
                        message: `${field} is required in consumption patterns`,
                        severity: 'ERROR',
                        value: undefined,
                        expectedValue: `${field} data`,
                        context: { field }
                    });
                }
            });
        }

        const validationTime = Date.now() - startTime;

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            score: errors.length === 0 ? 100 : Math.max(0, 100 - (errors.length * 25)),
            metadata: {
                templateId: context.templateVariables?.templateId || 'standard-persona-v1',
                templateVersion: '1.0.0',
                validationTime,
                rulesExecuted: 1,
                rulesSkipped: 0,
                timestamp: Date.now()
            }
        };
    };
}

// Helper functions
function hasNestedProperty(obj: any, path: string): boolean {
    if (!obj || typeof obj !== 'object') {
        return false;
    }

    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
        if (current === null || current === undefined || !(key in current)) {
            return false;
        }
        current = current[key];
    }

    return true;
}

function getNestedProperty(obj: any, path: string): any {
    if (!obj || typeof obj !== 'object') {
        return undefined;
    }

    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
        if (current === null || current === undefined || !(key in current)) {
            return undefined;
        }
        current = current[key];
    }

    return current;
}