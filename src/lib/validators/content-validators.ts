/**
 * Content validators for LLM response validation
 * These validators ensure that the generated personas have valid content values and consistency
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
 * Validates that age values are within acceptable ranges
 * @param minAge Minimum acceptable age (default: 18)
 * @param maxAge Maximum acceptable age (default: 80)
 * @returns Validator function
 */
export function validateAgeRange(minAge: number = 18, maxAge: number = 80) {
    return (value: any, context: ValidationContext): ValidationResult => {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];
        const startTime = Date.now();

        // Handle array of personas
        if (Array.isArray(value)) {
            value.forEach((persona, index) => {
                const age = getNestedProperty(persona, 'age') || getNestedProperty(persona, 'demographics.age');
                if (age !== undefined) {
                    const ageValidation = validateSingleAge(age, minAge, maxAge, `[${index}]`, index);
                    errors.push(...ageValidation.errors);
                    warnings.push(...ageValidation.warnings);
                }
            });
        } else {
            // Handle single persona
            const age = getNestedProperty(value, 'age') || getNestedProperty(value, 'demographics.age');
            if (age !== undefined) {
                const ageValidation = validateSingleAge(age, minAge, maxAge, 'root');
                errors.push(...ageValidation.errors);
                warnings.push(...ageValidation.warnings);
            }
        }

        const validationTime = Date.now() - startTime;

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
 * Validates location format for geographic data
 * Supports formats like "City, Country", "City, State, Country", coordinates, etc.
 * @param allowedFormats Array of allowed format patterns
 * @returns Validator function
 */
export function validateLocationFormat(allowedFormats?: string[]) {
    const defaultFormats = [
        'city_country', // "Paris, France"
        'city_state_country', // "New York, NY, USA"
        'coordinates', // { lat: 40.7128, lng: -74.0060 }
        'full_address' // Complete address string
    ];

    const formats = allowedFormats || defaultFormats;

    return (value: any, context: ValidationContext): ValidationResult => {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];
        const startTime = Date.now();

        // Handle array of personas
        if (Array.isArray(value)) {
            value.forEach((persona, index) => {
                const location = getNestedProperty(persona, 'location') ||
                    getNestedProperty(persona, 'demographics.location') ||
                    getNestedProperty(persona, 'culturalData.demographics.location');

                if (location !== undefined) {
                    const locationValidation = validateSingleLocation(location, formats, `[${index}]`, index);
                    errors.push(...locationValidation.errors);
                    warnings.push(...locationValidation.warnings);
                }
            });
        } else {
            // Handle single persona
            const location = getNestedProperty(value, 'location') ||
                getNestedProperty(value, 'demographics.location') ||
                getNestedProperty(value, 'culturalData.demographics.location');

            if (location !== undefined) {
                const locationValidation = validateSingleLocation(location, formats, 'root');
                errors.push(...locationValidation.errors);
                warnings.push(...locationValidation.warnings);
            }
        }

        const validationTime = Date.now() - startTime;

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
 * Validates cultural data consistency across different sections
 * Ensures that cultural values, demographics, and consumption patterns are coherent
 * @returns Validator function
 */
export function validateCulturalDataConsistency() {
    return (value: any, context: ValidationContext): ValidationResult => {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];
        const startTime = Date.now();

        // Handle array of personas
        if (Array.isArray(value)) {
            value.forEach((persona, index) => {
                if (persona.culturalData) {
                    const consistencyValidation = validateSingleCulturalConsistency(persona.culturalData, `[${index}]`, index);
                    errors.push(...consistencyValidation.errors);
                    warnings.push(...consistencyValidation.warnings);
                }
            });
        } else {
            // Handle single persona
            if (value.culturalData) {
                const consistencyValidation = validateSingleCulturalConsistency(value.culturalData, 'root');
                errors.push(...consistencyValidation.errors);
                warnings.push(...consistencyValidation.warnings);
            }
        }

        const validationTime = Date.now() - startTime;

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            score: errors.length === 0 ? 100 : Math.max(0, 100 - (errors.length * 10) - (warnings.length * 5)),
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
 * Validates income ranges and financial data consistency
 * @param minIncome Minimum acceptable income
 * @param maxIncome Maximum acceptable income
 * @returns Validator function
 */
export function validateIncomeRange(minIncome: number = 0, maxIncome: number = 1000000) {
    return (value: any, context: ValidationContext): ValidationResult => {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];
        const startTime = Date.now();

        // Handle array of personas
        if (Array.isArray(value)) {
            value.forEach((persona, index) => {
                const income = getNestedProperty(persona, 'income') ||
                    getNestedProperty(persona, 'demographics.income') ||
                    getNestedProperty(persona, 'financialProfile.income');

                if (income !== undefined) {
                    const incomeValidation = validateSingleIncome(income, minIncome, maxIncome, `[${index}]`, index);
                    errors.push(...incomeValidation.errors);
                    warnings.push(...incomeValidation.warnings);
                }
            });
        } else {
            // Handle single persona
            const income = getNestedProperty(value, 'income') ||
                getNestedProperty(value, 'demographics.income') ||
                getNestedProperty(value, 'financialProfile.income');

            if (income !== undefined) {
                const incomeValidation = validateSingleIncome(income, minIncome, maxIncome, 'root');
                errors.push(...incomeValidation.errors);
                warnings.push(...incomeValidation.warnings);
            }
        }

        const validationTime = Date.now() - startTime;

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
 * Validates occupation and professional data consistency
 * @returns Validator function
 */
export function validateOccupationConsistency() {
    return (value: any, context: ValidationContext): ValidationResult => {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];
        const startTime = Date.now();

        // Handle array of personas
        if (Array.isArray(value)) {
            value.forEach((persona, index) => {
                const occupationValidation = validateSingleOccupation(persona, `[${index}]`, index);
                errors.push(...occupationValidation.errors);
                warnings.push(...occupationValidation.warnings);
            });
        } else {
            // Handle single persona
            const occupationValidation = validateSingleOccupation(value, 'root');
            errors.push(...occupationValidation.errors);
            warnings.push(...occupationValidation.warnings);
        }

        const validationTime = Date.now() - startTime;

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            score: errors.length === 0 ? 100 : Math.max(0, 100 - (errors.length * 12) - (warnings.length * 3)),
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

// Helper functions for individual validations

function validateSingleAge(age: any, minAge: number, maxAge: number, fieldPrefix: string, personaIndex?: number): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
} {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const fieldPath = fieldPrefix === 'root' ? 'age' : `${fieldPrefix}.age`;

    // Check if age is a number
    if (typeof age !== 'number') {
        // Try to parse as number
        const parsedAge = parseInt(age, 10);
        if (isNaN(parsedAge)) {
            errors.push({
                id: `age-invalid-type-${personaIndex || 0}`,
                type: ValidationErrorType.TYPE_MISMATCH,
                field: fieldPath,
                message: `Age must be a number, got ${typeof age}`,
                severity: ValidationSeverity.ERROR,
                value: age,
                expectedValue: 'Number',
                context: { personaIndex, actualType: typeof age }
            });
            return { errors, warnings };
        } else {
            age = parsedAge;
            warnings.push({
                id: `age-type-conversion-${personaIndex || 0}`,
                field: fieldPath,
                message: `Age was converted from ${typeof age} to number`,
                severity: ValidationSeverity.WARNING,
                value: age,
                suggestion: 'Provide age as a number directly'
            });
        }
    }

    // Check age range
    if (age < minAge) {
        errors.push({
            id: `age-too-low-${personaIndex || 0}`,
            type: ValidationErrorType.VALUE_OUT_OF_RANGE,
            field: fieldPath,
            message: `Age ${age} is below minimum age of ${minAge}`,
            severity: ValidationSeverity.ERROR,
            value: age,
            expectedValue: `>= ${minAge}`,
            context: { personaIndex, minAge, actualAge: age }
        });
    } else if (age > maxAge) {
        errors.push({
            id: `age-too-high-${personaIndex || 0}`,
            type: ValidationErrorType.VALUE_OUT_OF_RANGE,
            field: fieldPath,
            message: `Age ${age} is above maximum age of ${maxAge}`,
            severity: ValidationSeverity.ERROR,
            value: age,
            expectedValue: `<= ${maxAge}`,
            context: { personaIndex, maxAge, actualAge: age }
        });
    }

    // Add warnings for edge cases
    if (age < 25) {
        warnings.push({
            id: `age-young-warning-${personaIndex || 0}`,
            field: fieldPath,
            message: `Age ${age} is quite young, ensure this aligns with target demographics`,
            severity: ValidationSeverity.WARNING,
            value: age,
            suggestion: 'Consider if this age range matches your target audience'
        });
    } else if (age > 65) {
        warnings.push({
            id: `age-senior-warning-${personaIndex || 0}`,
            field: fieldPath,
            message: `Age ${age} is in senior demographic, ensure this aligns with target audience`,
            severity: ValidationSeverity.WARNING,
            value: age,
            suggestion: 'Consider if senior demographics match your target market'
        });
    }

    return { errors, warnings };
}

function validateSingleLocation(location: any, allowedFormats: string[], fieldPrefix: string, personaIndex?: number): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
} {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const fieldPath = fieldPrefix === 'root' ? 'location' : `${fieldPrefix}.location`;

    if (typeof location === 'string') {
        // Validate string location formats
        const isValidFormat = validateLocationString(location, allowedFormats);
        if (!isValidFormat) {
            errors.push({
                id: `location-invalid-format-${personaIndex || 0}`,
                type: ValidationErrorType.FORMAT_INVALID,
                field: fieldPath,
                message: `Location format "${location}" is not recognized`,
                severity: ValidationSeverity.ERROR,
                value: location,
                expectedValue: 'Valid location format (e.g., "City, Country")',
                context: { personaIndex, allowedFormats }
            });
        }
    } else if (typeof location === 'object' && location !== null) {
        // Validate coordinate object
        if (allowedFormats.includes('coordinates')) {
            const coordValidation = validateCoordinates(location);
            if (!coordValidation.isValid) {
                errors.push({
                    id: `location-invalid-coordinates-${personaIndex || 0}`,
                    type: ValidationErrorType.FORMAT_INVALID,
                    field: fieldPath,
                    message: 'Invalid coordinate format',
                    severity: ValidationSeverity.ERROR,
                    value: location,
                    expectedValue: '{ lat: number, lng: number }',
                    context: { personaIndex, error: coordValidation.error }
                });
            }
        } else {
            errors.push({
                id: `location-coordinates-not-allowed-${personaIndex || 0}`,
                type: ValidationErrorType.FORMAT_INVALID,
                field: fieldPath,
                message: 'Coordinate format not allowed for this validation',
                severity: ValidationSeverity.ERROR,
                value: location,
                expectedValue: 'String location format',
                context: { personaIndex, allowedFormats }
            });
        }
    } else {
        errors.push({
            id: `location-invalid-type-${personaIndex || 0}`,
            type: ValidationErrorType.TYPE_MISMATCH,
            field: fieldPath,
            message: `Location must be a string or coordinate object, got ${typeof location}`,
            severity: ValidationSeverity.ERROR,
            value: location,
            expectedValue: 'String or coordinate object',
            context: { personaIndex, actualType: typeof location }
        });
    }

    return { errors, warnings };
}

function validateSingleCulturalConsistency(culturalData: any, fieldPrefix: string, personaIndex?: number): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
} {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate that culturalData has the expected structure
    if (!culturalData || typeof culturalData !== 'object') {
        errors.push({
            id: `cultural-data-invalid-type-${personaIndex || 0}`,
            type: ValidationErrorType.TYPE_MISMATCH,
            field: `${fieldPrefix}.culturalData`,
            message: 'Cultural data must be an object',
            severity: ValidationSeverity.ERROR,
            value: culturalData,
            expectedValue: 'Object with cultural data categories'
        });
        return { errors, warnings };
    }

    // Check for required cultural data categories
    const requiredCategories = ['music', 'brand', 'restaurant', 'movie', 'tv', 'book', 'travel', 'fashion', 'beauty', 'food', 'socialMedia'];
    const missingCategories: string[] = [];

    requiredCategories.forEach(category => {
        if (!culturalData[category] || !Array.isArray(culturalData[category]) || culturalData[category].length === 0) {
            missingCategories.push(category);
        }
    });

    if (missingCategories.length > 0) {
        warnings.push({
            id: `cultural-data-missing-categories-${personaIndex || 0}`,
            field: `${fieldPrefix}.culturalData`,
            message: `Missing or empty cultural data categories: ${missingCategories.join(', ')}`,
            severity: ValidationSeverity.WARNING,
            value: missingCategories,
            suggestion: 'Consider adding data for missing cultural categories'
        });
    }

    // Validate data quality for each category
    Object.entries(culturalData).forEach(([category, items]) => {
        if (Array.isArray(items)) {
            // Check for generic/placeholder values
            const genericItems = items.filter((item: string) => 
                typeof item === 'string' && (
                    item.includes('item_') || 
                    item.includes('food_item_') || 
                    item.includes('restaurant_item_') ||
                    item.includes('Utilisez les vrais') ||
                    item.includes('artiste1') ||
                    item.includes('marque1') ||
                    item.includes('film1') ||
                    item.trim() === ''
                )
            );

            if (genericItems.length > 0) {
                warnings.push({
                    id: `cultural-data-generic-items-${category}-${personaIndex || 0}`,
                    field: `${fieldPrefix}.culturalData.${category}`,
                    message: `Category ${category} contains generic or placeholder values`,
                    severity: ValidationSeverity.WARNING,
                    value: genericItems,
                    suggestion: 'Use specific, real cultural data instead of placeholders'
                });
            }

            // Check for reasonable number of items
            if (items.length > 10) {
                warnings.push({
                    id: `cultural-data-too-many-items-${category}-${personaIndex || 0}`,
                    field: `${fieldPrefix}.culturalData.${category}`,
                    message: `Category ${category} has too many items (${items.length})`,
                    severity: ValidationSeverity.WARNING,
                    value: items.length,
                    suggestion: 'Consider limiting to 3-8 items per category for better persona focus'
                });
            }
        }
    });

    return { errors, warnings };
}

function validateSingleIncome(income: any, minIncome: number, maxIncome: number, fieldPrefix: string, personaIndex?: number): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
} {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const fieldPath = fieldPrefix === 'root' ? 'income' : `${fieldPrefix}.income`;

    // Handle different income formats
    let numericIncome: number;

    if (typeof income === 'number') {
        numericIncome = income;
    } else if (typeof income === 'string') {
        // Try to parse income string (e.g., "$50,000", "50k", "50000")
        const parsed = parseIncomeString(income);
        if (parsed === null) {
            errors.push({
                id: `income-invalid-format-${personaIndex || 0}`,
                type: ValidationErrorType.FORMAT_INVALID,
                field: fieldPath,
                message: `Income format "${income}" could not be parsed`,
                severity: ValidationSeverity.ERROR,
                value: income,
                expectedValue: 'Numeric value or parseable string (e.g., "$50,000", "50k")',
                context: { personaIndex }
            });
            return { errors, warnings };
        }
        numericIncome = parsed;
    } else {
        errors.push({
            id: `income-invalid-type-${personaIndex || 0}`,
            type: ValidationErrorType.TYPE_MISMATCH,
            field: fieldPath,
            message: `Income must be a number or string, got ${typeof income}`,
            severity: ValidationSeverity.ERROR,
            value: income,
            expectedValue: 'Number or string',
            context: { personaIndex, actualType: typeof income }
        });
        return { errors, warnings };
    }

    // Validate income range
    if (numericIncome < minIncome) {
        errors.push({
            id: `income-too-low-${personaIndex || 0}`,
            type: ValidationErrorType.VALUE_OUT_OF_RANGE,
            field: fieldPath,
            message: `Income ${numericIncome} is below minimum of ${minIncome}`,
            severity: ValidationSeverity.ERROR,
            value: numericIncome,
            expectedValue: `>= ${minIncome}`,
            context: { personaIndex, minIncome, actualIncome: numericIncome }
        });
    } else if (numericIncome > maxIncome) {
        errors.push({
            id: `income-too-high-${personaIndex || 0}`,
            type: ValidationErrorType.VALUE_OUT_OF_RANGE,
            field: fieldPath,
            message: `Income ${numericIncome} is above maximum of ${maxIncome}`,
            severity: ValidationSeverity.ERROR,
            value: numericIncome,
            expectedValue: `<= ${maxIncome}`,
            context: { personaIndex, maxIncome, actualIncome: numericIncome }
        });
    }

    return { errors, warnings };
}

function validateSingleOccupation(persona: any, fieldPrefix: string, personaIndex?: number): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
} {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const occupation = getNestedProperty(persona, 'occupation') ||
        getNestedProperty(persona, 'demographics.occupation') ||
        getNestedProperty(persona, 'professionalProfile.occupation');

    const industry = getNestedProperty(persona, 'industry') ||
        getNestedProperty(persona, 'demographics.industry') ||
        getNestedProperty(persona, 'professionalProfile.industry');

    const income = getNestedProperty(persona, 'income') ||
        getNestedProperty(persona, 'demographics.income') ||
        getNestedProperty(persona, 'financialProfile.income');

    // Check occupation-industry consistency
    if (occupation && industry) {
        const isConsistent = isOccupationIndustryConsistent(occupation, industry);
        if (!isConsistent) {
            warnings.push({
                id: `occupation-industry-mismatch-${personaIndex || 0}`,
                field: `${fieldPrefix}.occupation`,
                message: `Occupation "${occupation}" may not typically align with industry "${industry}"`,
                severity: ValidationSeverity.WARNING,
                value: { occupation, industry },
                suggestion: 'Review occupation and industry alignment'
            });
        }
    }

    // Check occupation-income consistency
    if (occupation && income) {
        const expectedIncomeRange = getExpectedIncomeRange(occupation);
        const numericIncome = typeof income === 'number' ? income : parseIncomeString(income);

        if (expectedIncomeRange && numericIncome !== null) {
            if (numericIncome < expectedIncomeRange.min || numericIncome > expectedIncomeRange.max) {
                warnings.push({
                    id: `occupation-income-mismatch-${personaIndex || 0}`,
                    field: `${fieldPrefix}.occupation`,
                    message: `Income ${numericIncome} may not align with typical range for "${occupation}" (${expectedIncomeRange.min}-${expectedIncomeRange.max})`,
                    severity: ValidationSeverity.WARNING,
                    value: { occupation, income: numericIncome },
                    suggestion: `Consider if income aligns with occupation expectations`
                });
            }
        }
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

function validateLocationString(location: string, allowedFormats: string[]): boolean {
    if (allowedFormats.includes('city_country')) {
        // Pattern: "City, Country" or "City,Country"
        if (/^[^,]+,\s*[^,]+$/.test(location)) {
            return true;
        }
    }

    if (allowedFormats.includes('city_state_country')) {
        // Pattern: "City, State, Country"
        if (/^[^,]+,\s*[^,]+,\s*[^,]+$/.test(location)) {
            return true;
        }
    }

    if (allowedFormats.includes('full_address')) {
        // Full address should contain at least some address-like components
        // Must have at least one comma AND some meaningful content (numbers or multiple words)
        if (location.length >= 5 && location.length <= 200 &&
            /,/.test(location) && (/\d/.test(location) || location.split(/\s+/).length >= 3)) {
            return true;
        }
    }

    return false;
}

function validateCoordinates(coords: any): { isValid: boolean; error?: string } {
    if (typeof coords !== 'object' || coords === null) {
        return { isValid: false, error: 'Coordinates must be an object' };
    }

    const { lat, lng, latitude, longitude } = coords;
    const latValue = lat !== undefined ? lat : latitude;
    const lngValue = lng !== undefined ? lng : longitude;

    if (typeof latValue !== 'number' || typeof lngValue !== 'number') {
        return { isValid: false, error: 'Latitude and longitude must be numbers' };
    }

    if (latValue < -90 || latValue > 90) {
        return { isValid: false, error: 'Latitude must be between -90 and 90' };
    }

    if (lngValue < -180 || lngValue > 180) {
        return { isValid: false, error: 'Longitude must be between -180 and 180' };
    }

    return { isValid: true };
}

function getGenerationFromAge(age: number): string | null {
    if (age >= 18 && age <= 26) return 'Gen Z';
    if (age >= 27 && age <= 42) return 'Millennial';
    if (age >= 43 && age <= 58) return 'Gen X';
    if (age >= 59 && age <= 77) return 'Baby Boomer';
    return null;
}

function extractCountryFromLocation(location: string): string | null {
    const parts = location.split(',').map(part => part.trim());
    if (parts.length >= 2) {
        return parts[parts.length - 1]; // Last part is usually the country
    }
    return null;
}

function categorizeIncome(income: any): string | null {
    const numericIncome = typeof income === 'number' ? income : parseIncomeString(income);
    if (numericIncome === null) return null;

    if (numericIncome < 30000) return 'low';
    if (numericIncome < 75000) return 'middle';
    if (numericIncome < 150000) return 'upper-middle';
    return 'high';
}

function categorizeSpending(spendingHabits: any): string | null {
    if (typeof spendingHabits === 'string') {
        const lower = spendingHabits.toLowerCase();
        if (lower.includes('frugal') || lower.includes('budget') || lower.includes('conservative')) {
            return 'low';
        }
        if (lower.includes('luxury') || lower.includes('premium') || lower.includes('high-end')) {
            return 'high';
        }
        return 'middle';
    }
    return null;
}

function isSpendingConsistentWithIncome(incomeLevel: string, spendingLevel: string): boolean {
    const consistencyMap: Record<string, string[]> = {
        'low': ['low', 'middle'],
        'middle': ['low', 'middle', 'high'],
        'upper-middle': ['middle', 'high'],
        'high': ['middle', 'high']
    };

    return consistencyMap[incomeLevel]?.includes(spendingLevel) || false;
}

function parseIncomeString(income: string): number | null {
    // Remove currency symbols and spaces
    let cleaned = income.replace(/[$€£¥,\s]/g, '');

    // Handle 'k' suffix (thousands)
    if (cleaned.toLowerCase().endsWith('k')) {
        const num = parseFloat(cleaned.slice(0, -1));
        return isNaN(num) ? null : num * 1000;
    }

    // Handle 'm' suffix (millions)
    if (cleaned.toLowerCase().endsWith('m')) {
        const num = parseFloat(cleaned.slice(0, -1));
        return isNaN(num) ? null : num * 1000000;
    }

    // Try to parse as regular number
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
}

function isOccupationIndustryConsistent(occupation: string, industry: string): boolean {
    // Simple consistency check - this could be expanded with a comprehensive mapping
    const occupationLower = occupation.toLowerCase();
    const industryLower = industry.toLowerCase();

    // Common mappings
    const mappings: Record<string, string[]> = {
        'software': ['technology', 'tech', 'software', 'it'],
        'developer': ['technology', 'tech', 'software', 'it'],
        'engineer': ['technology', 'engineering', 'manufacturing', 'construction'],
        'teacher': ['education', 'academic', 'school'],
        'doctor': ['healthcare', 'medical', 'health'],
        'nurse': ['healthcare', 'medical', 'health'],
        'lawyer': ['legal', 'law', 'justice'],
        'accountant': ['finance', 'accounting', 'financial'],
        'manager': ['management', 'business', 'corporate'],
        'sales': ['sales', 'retail', 'business'],
        'marketing': ['marketing', 'advertising', 'business']
    };

    for (const [occKey, industries] of Object.entries(mappings)) {
        if (occupationLower.includes(occKey)) {
            return industries.some(ind => industryLower.includes(ind));
        }
    }

    // If no specific mapping found, assume it's consistent
    return true;
}

function getExpectedIncomeRange(occupation: string): { min: number; max: number } | null {
    const occupationLower = occupation.toLowerCase();

    // Rough income ranges by occupation (in USD)
    const ranges: Record<string, { min: number; max: number }> = {
        'software engineer': { min: 60000, max: 200000 },
        'developer': { min: 50000, max: 180000 },
        'teacher': { min: 35000, max: 80000 },
        'doctor': { min: 150000, max: 500000 },
        'nurse': { min: 50000, max: 100000 },
        'lawyer': { min: 60000, max: 300000 },
        'accountant': { min: 45000, max: 120000 },
        'manager': { min: 60000, max: 200000 },
        'sales': { min: 35000, max: 150000 },
        'marketing': { min: 40000, max: 130000 }
    };

    for (const [occKey, range] of Object.entries(ranges)) {
        if (occupationLower.includes(occKey.split(' ')[0])) {
            return range;
        }
    }

    return null;
}