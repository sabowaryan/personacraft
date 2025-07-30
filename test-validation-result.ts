// Test file to verify ValidationResult type extension
import {
    ValidationResult,
    ValidationErrorType,
} from './src/types/validation';

// Extended validation result with additional statistics for API responses
type ExtendedValidationResult = ValidationResult & {
    validationStats?: {
        errorsByType: Record<ValidationErrorType, number>;
        personasValidated: number;
        successfulPersonas: number;
    };
};

// Test the type works
const testResult: ExtendedValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    score: 1.0,
    metadata: {
        templateId: 'test',
        templateVersion: '1.0',
        validationTime: 100,
        rulesExecuted: 5,
        rulesSkipped: 0,
        timestamp: Date.now()
    },
    validationStats: {
        errorsByType: {
            [ValidationErrorType.STRUCTURE_INVALID]: 0,
            [ValidationErrorType.REQUIRED_FIELD_MISSING]: 0,
            [ValidationErrorType.TYPE_MISMATCH]: 0,
            [ValidationErrorType.VALUE_OUT_OF_RANGE]: 0,
            [ValidationErrorType.FORMAT_INVALID]: 0,
            [ValidationErrorType.CULTURAL_DATA_INCONSISTENT]: 0,
            [ValidationErrorType.BUSINESS_RULE_VIOLATION]: 0,
            [ValidationErrorType.TEMPLATE_NOT_FOUND]: 0,
            [ValidationErrorType.VALIDATION_TIMEOUT]: 0
        },
        personasValidated: 2,
        successfulPersonas: 2
    }
};

console.log('Type test passed:', testResult.validationStats);