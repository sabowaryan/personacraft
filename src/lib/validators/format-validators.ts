/**
 * Format validators for LLM response validation
 * These validators ensure that the generated personas have properly formatted data
 */

import {
    ValidationResult,
    ValidationError,
    ValidationWarning,
    ValidationContext,
    ValidationErrorType,
    ValidationSeverity
} from '@/types/validation';

/**
 * Validates email format using RFC 5322 compliant regex
 * @param allowMultiple Whether to allow multiple emails separated by commas
 * @returns Validator function
 */
export function validateEmailFormat(allowMultiple: boolean = false) {
    return (value: any, context: ValidationContext): ValidationResult => {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];
        const startTime = performance.now();

        // Handle array of personas
        if (Array.isArray(value)) {
            value.forEach((persona, index) => {
                // Check each email field location, prioritizing direct email field
                let email = getNestedProperty(persona, 'email');
                let hasEmailField = email !== undefined;

                if (!hasEmailField) {
                    email = getNestedProperty(persona, 'contact.email');
                    hasEmailField = email !== undefined;
                }

                if (!hasEmailField) {
                    email = getNestedProperty(persona, 'demographics.email');
                    hasEmailField = email !== undefined;
                }

                if (hasEmailField) {
                    const emailValidation = validateSingleEmail(email, allowMultiple, `[${index}]`, index);
                    errors.push(...emailValidation.errors);
                    warnings.push(...emailValidation.warnings);
                }
            });
        } else {
            // Handle single persona
            // Check each email field location, prioritizing direct email field
            let email = getNestedProperty(value, 'email');
            let hasEmailField = email !== undefined;

            if (!hasEmailField) {
                email = getNestedProperty(value, 'contact.email');
                hasEmailField = email !== undefined;
            }

            if (!hasEmailField) {
                email = getNestedProperty(value, 'demographics.email');
                hasEmailField = email !== undefined;
            }

            if (hasEmailField) {
                const emailValidation = validateSingleEmail(email, allowMultiple, 'root');
                errors.push(...emailValidation.errors);
                warnings.push(...emailValidation.warnings);
            }
        }

        const validationTime = Math.max(1, Math.round(performance.now() - startTime));

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
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
 * Validates phone number format supporting international formats
 * @param allowedFormats Array of allowed phone formats ('international', 'national', 'e164')
 * @returns Validator function
 */
export function validatePhoneFormat(allowedFormats: string[] = ['international', 'national']) {
    return (value: any, context: ValidationContext): ValidationResult => {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];
        const startTime = performance.now();

        // Handle array of personas
        if (Array.isArray(value)) {
            value.forEach((persona, index) => {
                const phone = getNestedProperty(persona, 'phone') ||
                    getNestedProperty(persona, 'contact.phone') ||
                    getNestedProperty(persona, 'demographics.phone');

                if (phone !== undefined) {
                    const phoneValidation = validateSinglePhone(phone, allowedFormats, `[${index}]`, index);
                    errors.push(...phoneValidation.errors);
                    warnings.push(...phoneValidation.warnings);
                }
            });
        } else {
            // Handle single persona
            const phone = getNestedProperty(value, 'phone') ||
                getNestedProperty(value, 'contact.phone') ||
                getNestedProperty(value, 'demographics.phone');

            if (phone !== undefined) {
                const phoneValidation = validateSinglePhone(phone, allowedFormats, 'root');
                errors.push(...phoneValidation.errors);
                warnings.push(...phoneValidation.warnings);
            }
        }

        const validationTime = Math.max(1, Math.round(performance.now() - startTime));

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
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
 * Validates date format supporting multiple date formats
 * @param allowedFormats Array of allowed date formats ('iso', 'us', 'eu', 'timestamp')
 * @param allowFutureDates Whether to allow future dates
 * @returns Validator function
 */
export function validateDateFormat(allowedFormats: string[] = ['iso', 'us', 'eu'], allowFutureDates: boolean = true) {
    return (value: any, context: ValidationContext): ValidationResult => {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];
        const startTime = performance.now();

        // Handle array of personas
        if (Array.isArray(value)) {
            value.forEach((persona, index) => {
                // Check common date fields
                const dateFields = ['birthDate', 'dateOfBirth', 'createdAt', 'updatedAt'];
                dateFields.forEach(field => {
                    const dateValue = getNestedProperty(persona, field) ||
                        getNestedProperty(persona, `demographics.${field}`);

                    if (dateValue !== undefined) {
                        const dateValidation = validateSingleDate(dateValue, allowedFormats, allowFutureDates, `[${index}].${field}`, index);
                        errors.push(...dateValidation.errors);
                        warnings.push(...dateValidation.warnings);
                    }
                });
            });
        } else {
            // Handle single persona
            const dateFields = ['birthDate', 'dateOfBirth', 'createdAt', 'updatedAt'];
            dateFields.forEach(field => {
                const dateValue = getNestedProperty(value, field) ||
                    getNestedProperty(value, `demographics.${field}`);

                if (dateValue !== undefined) {
                    const dateValidation = validateSingleDate(dateValue, allowedFormats, allowFutureDates, field);
                    errors.push(...dateValidation.errors);
                    warnings.push(...dateValidation.warnings);
                }
            });
        }

        const validationTime = Math.max(1, Math.round(performance.now() - startTime));

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
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
 * Validates array format ensuring proper structure and content
 * @param arrayRules Object mapping field paths to array validation rules
 * @returns Validator function
 */
export function validateArrayFormat(arrayRules: Record<string, ArrayValidationRule>) {
    return (value: any, context: ValidationContext): ValidationResult => {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];
        const startTime = performance.now();

        // Handle array of personas
        if (Array.isArray(value)) {
            value.forEach((persona, index) => {
                Object.entries(arrayRules).forEach(([fieldPath, rule]) => {
                    const arrayValue = getNestedProperty(persona, fieldPath);

                    if (arrayValue !== undefined) {
                        const arrayValidation = validateSingleArray(arrayValue, rule, `[${index}].${fieldPath}`, index);
                        errors.push(...arrayValidation.errors);
                        warnings.push(...arrayValidation.warnings);
                    }
                });
            });
        } else {
            // Handle single persona
            Object.entries(arrayRules).forEach(([fieldPath, rule]) => {
                const arrayValue = getNestedProperty(value, fieldPath);

                if (arrayValue !== undefined) {
                    const arrayValidation = validateSingleArray(arrayValue, rule, fieldPath);
                    errors.push(...arrayValidation.errors);
                    warnings.push(...arrayValidation.warnings);
                }
            });
        }

        const validationTime = Math.max(1, Math.round(performance.now() - startTime));

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
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

// Supporting interfaces and types
export interface ArrayValidationRule {
    minLength?: number;
    maxLength?: number;
    itemType?: 'string' | 'number' | 'object' | 'boolean';
    allowEmpty?: boolean;
    uniqueItems?: boolean;
    itemValidator?: (item: any) => boolean;
}

// Helper functions for individual validations

function validateSingleEmail(email: any, allowMultiple: boolean, fieldPrefix: string, personaIndex?: number): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
} {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const fieldPath = fieldPrefix === 'root' ? 'email' : `${fieldPrefix}.email`;

    if (typeof email !== 'string') {
        errors.push({
            id: `email-invalid-type-${personaIndex || 0}`,
            type: ValidationErrorType.TYPE_MISMATCH,
            field: fieldPath,
            message: `Email must be a string, got ${typeof email}`,
            severity: ValidationSeverity.ERROR,
            value: email,
            expectedValue: 'String',
            context: { personaIndex, actualType: typeof email }
        });
        return { errors, warnings };
    }

    const emailString = email.trim();

    if (emailString.length === 0) {
        errors.push({
            id: `email-empty-${personaIndex || 0}`,
            type: ValidationErrorType.FORMAT_INVALID,
            field: fieldPath,
            message: 'Email cannot be empty',
            severity: ValidationSeverity.ERROR,
            value: email,
            expectedValue: 'Non-empty email address',
            context: { personaIndex }
        });
        return { errors, warnings };
    }

    if (allowMultiple && emailString.includes(',')) {
        // Validate multiple emails
        const emails = emailString.split(',').map(e => e.trim());
        emails.forEach((singleEmail, index) => {
            if (!isValidEmailFormat(singleEmail)) {
                errors.push({
                    id: `email-invalid-format-multiple-${personaIndex || 0}-${index}`,
                    type: ValidationErrorType.FORMAT_INVALID,
                    field: fieldPath,
                    message: `Invalid email format: "${singleEmail}" in multiple email list`,
                    severity: ValidationSeverity.ERROR,
                    value: singleEmail,
                    expectedValue: 'Valid email format (e.g., user@example.com)',
                    context: { personaIndex, emailIndex: index }
                });
            }
        });
    } else {
        // Validate single email
        if (!isValidEmailFormat(emailString)) {
            errors.push({
                id: `email-invalid-format-${personaIndex || 0}`,
                type: ValidationErrorType.FORMAT_INVALID,
                field: fieldPath,
                message: `Invalid email format: "${emailString}"`,
                severity: ValidationSeverity.ERROR,
                value: emailString,
                expectedValue: 'Valid email format (e.g., user@example.com)',
                context: { personaIndex }
            });
        }
    }

    // Add warnings for common issues
    if (emailString.includes('..')) {
        warnings.push({
            id: `email-double-dots-${personaIndex || 0}`,
            field: fieldPath,
            message: 'Email contains consecutive dots which may cause delivery issues',
            severity: ValidationSeverity.WARNING,
            value: emailString,
            suggestion: 'Avoid consecutive dots in email addresses'
        });
    }

    if (emailString.length > 254) {
        warnings.push({
            id: `email-too-long-${personaIndex || 0}`,
            field: fieldPath,
            message: 'Email address is longer than recommended maximum (254 characters)',
            severity: ValidationSeverity.WARNING,
            value: emailString.length,
            suggestion: 'Consider using shorter email addresses'
        });
    }

    return { errors, warnings };
}

function validateSinglePhone(phone: any, allowedFormats: string[], fieldPrefix: string, personaIndex?: number): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
} {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const fieldPath = fieldPrefix === 'root' ? 'phone' : `${fieldPrefix}.phone`;

    if (typeof phone !== 'string') {
        errors.push({
            id: `phone-invalid-type-${personaIndex || 0}`,
            type: ValidationErrorType.TYPE_MISMATCH,
            field: fieldPath,
            message: `Phone must be a string, got ${typeof phone}`,
            severity: ValidationSeverity.ERROR,
            value: phone,
            expectedValue: 'String',
            context: { personaIndex, actualType: typeof phone }
        });
        return { errors, warnings };
    }

    const phoneString = phone.trim();

    if (phoneString.length === 0) {
        errors.push({
            id: `phone-empty-${personaIndex || 0}`,
            type: ValidationErrorType.FORMAT_INVALID,
            field: fieldPath,
            message: 'Phone number cannot be empty',
            severity: ValidationSeverity.ERROR,
            value: phone,
            expectedValue: 'Non-empty phone number',
            context: { personaIndex }
        });
        return { errors, warnings };
    }

    const formatValidation = validatePhoneFormatString(phoneString, allowedFormats);
    if (!formatValidation.isValid) {
        errors.push({
            id: `phone-invalid-format-${personaIndex || 0}`,
            type: ValidationErrorType.FORMAT_INVALID,
            field: fieldPath,
            message: `Invalid phone format: "${phoneString}". ${formatValidation.error}`,
            severity: ValidationSeverity.ERROR,
            value: phoneString,
            expectedValue: `Valid phone format (${allowedFormats.join(', ')})`,
            context: { personaIndex, allowedFormats, error: formatValidation.error }
        });
    }

    // Add warnings for potential issues
    if (phoneString.length < 7) {
        warnings.push({
            id: `phone-too-short-${personaIndex || 0}`,
            field: fieldPath,
            message: 'Phone number seems unusually short',
            severity: ValidationSeverity.WARNING,
            value: phoneString,
            suggestion: 'Verify phone number completeness'
        });
    }

    if (phoneString.length > 20) {
        warnings.push({
            id: `phone-too-long-${personaIndex || 0}`,
            field: fieldPath,
            message: 'Phone number seems unusually long',
            severity: ValidationSeverity.WARNING,
            value: phoneString,
            suggestion: 'Verify phone number format'
        });
    }

    return { errors, warnings };
}

function validateSingleDate(dateValue: any, allowedFormats: string[], allowFutureDates: boolean, fieldPath: string, personaIndex?: number): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
} {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Handle different date input types
    let dateObject: Date | null = null;
    let originalFormat: string | null = null;

    if (dateValue instanceof Date) {
        dateObject = dateValue;
        originalFormat = 'date_object';
    } else if (typeof dateValue === 'number') {
        // Timestamp
        dateObject = new Date(dateValue);
        originalFormat = 'timestamp';
    } else if (typeof dateValue === 'string') {
        const parseResult = parseDateString(dateValue, allowedFormats);
        dateObject = parseResult.date;
        originalFormat = parseResult.format;

        if (!dateObject) {
            errors.push({
                id: `date-invalid-format-${personaIndex || 0}`,
                type: ValidationErrorType.FORMAT_INVALID,
                field: fieldPath,
                message: `Invalid date format: "${dateValue}". Expected formats: ${allowedFormats.join(', ')}`,
                severity: ValidationSeverity.ERROR,
                value: dateValue,
                expectedValue: `Valid date format (${allowedFormats.join(', ')})`,
                context: { personaIndex, allowedFormats }
            });
            return { errors, warnings };
        }
    } else {
        errors.push({
            id: `date-invalid-type-${personaIndex || 0}`,
            type: ValidationErrorType.TYPE_MISMATCH,
            field: fieldPath,
            message: `Date must be a string, number, or Date object, got ${typeof dateValue}`,
            severity: ValidationSeverity.ERROR,
            value: dateValue,
            expectedValue: 'String, number, or Date object',
            context: { personaIndex, actualType: typeof dateValue }
        });
        return { errors, warnings };
    }

    // Validate the parsed date
    if (isNaN(dateObject.getTime())) {
        errors.push({
            id: `date-invalid-value-${personaIndex || 0}`,
            type: ValidationErrorType.FORMAT_INVALID,
            field: fieldPath,
            message: `Invalid date value: "${dateValue}"`,
            severity: ValidationSeverity.ERROR,
            value: dateValue,
            expectedValue: 'Valid date value',
            context: { personaIndex }
        });
        return { errors, warnings };
    }

    // Check future date restriction
    const now = new Date();
    if (!allowFutureDates && dateObject > now) {
        errors.push({
            id: `date-future-not-allowed-${personaIndex || 0}`,
            type: ValidationErrorType.VALUE_OUT_OF_RANGE,
            field: fieldPath,
            message: `Future dates are not allowed: ${dateObject.toISOString()}`,
            severity: ValidationSeverity.ERROR,
            value: dateObject.toISOString(),
            expectedValue: `Date <= ${now.toISOString()}`,
            context: { personaIndex, allowFutureDates }
        });
    }

    // Add warnings for edge cases
    const yearsDiff = (now.getTime() - dateObject.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

    if (yearsDiff > 150) {
        warnings.push({
            id: `date-very-old-${personaIndex || 0}`,
            field: fieldPath,
            message: `Date is more than 150 years ago: ${dateObject.toISOString()}`,
            severity: ValidationSeverity.WARNING,
            value: dateObject.toISOString(),
            suggestion: 'Verify date accuracy for very old dates'
        });
    }

    if (allowFutureDates && yearsDiff < -50) {
        warnings.push({
            id: `date-far-future-${personaIndex || 0}`,
            field: fieldPath,
            message: `Date is more than 50 years in the future: ${dateObject.toISOString()}`,
            severity: ValidationSeverity.WARNING,
            value: dateObject.toISOString(),
            suggestion: 'Verify date accuracy for far future dates'
        });
    }

    return { errors, warnings };
}

function validateSingleArray(arrayValue: any, rule: ArrayValidationRule, fieldPath: string, personaIndex?: number): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
} {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!Array.isArray(arrayValue)) {
        errors.push({
            id: `array-not-array-${personaIndex || 0}`,
            type: ValidationErrorType.TYPE_MISMATCH,
            field: fieldPath,
            message: `Expected array, got ${typeof arrayValue}`,
            severity: ValidationSeverity.ERROR,
            value: arrayValue,
            expectedValue: 'Array',
            context: { personaIndex, actualType: typeof arrayValue }
        });
        return { errors, warnings };
    }

    // Check length constraints
    if (rule.minLength !== undefined && arrayValue.length < rule.minLength) {
        errors.push({
            id: `array-too-short-${personaIndex || 0}`,
            type: ValidationErrorType.VALUE_OUT_OF_RANGE,
            field: fieldPath,
            message: `Array length ${arrayValue.length} is below minimum ${rule.minLength}`,
            severity: ValidationSeverity.ERROR,
            value: arrayValue.length,
            expectedValue: `>= ${rule.minLength}`,
            context: { personaIndex, minLength: rule.minLength, actualLength: arrayValue.length }
        });
    }

    if (rule.maxLength !== undefined && arrayValue.length > rule.maxLength) {
        errors.push({
            id: `array-too-long-${personaIndex || 0}`,
            type: ValidationErrorType.VALUE_OUT_OF_RANGE,
            field: fieldPath,
            message: `Array length ${arrayValue.length} exceeds maximum ${rule.maxLength}`,
            severity: ValidationSeverity.ERROR,
            value: arrayValue.length,
            expectedValue: `<= ${rule.maxLength}`,
            context: { personaIndex, maxLength: rule.maxLength, actualLength: arrayValue.length }
        });
    }

    // Check empty array (only if allowEmpty is explicitly false)
    if (rule.allowEmpty === false && arrayValue.length === 0) {
        errors.push({
            id: `array-empty-not-allowed-${personaIndex || 0}`,
            type: ValidationErrorType.VALUE_OUT_OF_RANGE,
            field: fieldPath,
            message: 'Empty arrays are not allowed',
            severity: ValidationSeverity.ERROR,
            value: arrayValue.length,
            expectedValue: '> 0',
            context: { personaIndex }
        });
    }

    // Check item types
    if (rule.itemType) {
        arrayValue.forEach((item, index) => {
            const actualType = Array.isArray(item) ? 'array' : typeof item;
            if (actualType !== rule.itemType) {
                errors.push({
                    id: `array-item-wrong-type-${personaIndex || 0}-${index}`,
                    type: ValidationErrorType.TYPE_MISMATCH,
                    field: `${fieldPath}[${index}]`,
                    message: `Array item at index ${index} should be ${rule.itemType}, got ${actualType}`,
                    severity: ValidationSeverity.ERROR,
                    value: item,
                    expectedValue: rule.itemType,
                    context: { personaIndex, itemIndex: index, expectedType: rule.itemType, actualType }
                });
            }
        });
    }

    // Check unique items
    if (rule.uniqueItems) {
        const seen = new Set();
        const duplicates: number[] = [];

        arrayValue.forEach((item, index) => {
            const itemKey = JSON.stringify(item);
            if (seen.has(itemKey)) {
                duplicates.push(index);
            } else {
                seen.add(itemKey);
            }
        });

        if (duplicates.length > 0) {
            errors.push({
                id: `array-duplicate-items-${personaIndex || 0}`,
                type: ValidationErrorType.BUSINESS_RULE_VIOLATION,
                field: fieldPath,
                message: `Array contains duplicate items at indices: ${duplicates.join(', ')}`,
                severity: ValidationSeverity.ERROR,
                value: duplicates,
                expectedValue: 'Unique items only',
                context: { personaIndex, duplicateIndices: duplicates }
            });
        }
    }

    // Custom item validation
    if (rule.itemValidator) {
        arrayValue.forEach((item, index) => {
            if (!rule.itemValidator!(item)) {
                errors.push({
                    id: `array-item-validation-failed-${personaIndex || 0}-${index}`,
                    type: ValidationErrorType.BUSINESS_RULE_VIOLATION,
                    field: `${fieldPath}[${index}]`,
                    message: `Array item at index ${index} failed custom validation`,
                    severity: ValidationSeverity.ERROR,
                    value: item,
                    expectedValue: 'Item passing custom validation',
                    context: { personaIndex, itemIndex: index }
                });
            }
        });
    }

    return { errors, warnings };
}

// Utility functions

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

function isValidEmailFormat(email: string): boolean {
    // RFC 5322 compliant email regex (simplified but robust)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
}

function validatePhoneFormatString(phone: string, allowedFormats: string[]): { isValid: boolean; error?: string } {
    // Remove all non-digit characters for basic validation
    const digitsOnly = phone.replace(/\D/g, '');

    if (digitsOnly.length < 7) {
        return { isValid: false, error: 'Phone number too short' };
    }

    if (digitsOnly.length > 15) {
        return { isValid: false, error: 'Phone number too long' };
    }

    // Check specific formats
    for (const format of allowedFormats) {
        switch (format) {
            case 'international':
                // International format: +1234567890 or +1 234 567 8900
                if (/^\+[1-9]\d{1,14}$/.test(phone.replace(/\s/g, ''))) {
                    return { isValid: true };
                }
                break;
            case 'national':
                // National format: (123) 456-7890, 123-456-7890, 123.456.7890
                if (/^(\(\d{3}\)\s?|\d{3}[-.\s]?)\d{3}[-.\s]?\d{4}$/.test(phone)) {
                    return { isValid: true };
                }
                break;
            case 'e164':
                // E.164 format: +1234567890 (no spaces or formatting)
                if (/^\+[1-9]\d{1,14}$/.test(phone)) {
                    return { isValid: true };
                }
                break;
        }
    }

    return { isValid: false, error: `Phone format not recognized for allowed formats: ${allowedFormats.join(', ')}` };
}

function parseDateString(dateString: string, allowedFormats: string[]): { date: Date | null; format: string | null } {
    const trimmed = dateString.trim();

    for (const format of allowedFormats) {
        let date: Date | null = null;

        switch (format) {
            case 'iso':
                // ISO 8601: 2023-12-25, 2023-12-25T10:30:00Z
                if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/.test(trimmed)) {
                    date = new Date(trimmed);
                }
                break;
            case 'us':
                // US format: MM/DD/YYYY, MM-DD-YYYY
                if (/^(0?[1-9]|1[0-2])[\/\-](0?[1-9]|[12]\d|3[01])[\/\-]\d{4}$/.test(trimmed)) {
                    date = new Date(trimmed);
                }
                break;
            case 'eu':
                // European format: DD/MM/YYYY, DD-MM-YYYY
                const euMatch = trimmed.match(/^(0?[1-9]|[12]\d|3[01])[\/\-](0?[1-9]|1[0-2])[\/\-](\d{4})$/);
                if (euMatch) {
                    const [, day, month, year] = euMatch;
                    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                }
                break;
            case 'timestamp':
                // Unix timestamp (seconds or milliseconds)
                const timestamp = parseInt(trimmed);
                if (!isNaN(timestamp)) {
                    // Assume milliseconds if > 1e10, otherwise seconds
                    date = new Date(timestamp > 1e10 ? timestamp : timestamp * 1000);
                }
                break;
        }

        if (date && !isNaN(date.getTime())) {
            return { date, format };
        }
    }

    return { date: null, format: null };
}
