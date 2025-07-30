/**
 * Tests for format validators
 */

import {
    validateEmailFormat,
    validatePhoneFormat,
    validateDateFormat,
    validateArrayFormat,
    ArrayValidationRule
} from './format-validators';
import {
    ValidationContext,
    ValidationErrorType,
    ValidationSeverity,
    PersonaType
} from '@/types/validation';

// Mock validation context
const mockContext: ValidationContext = {
    originalRequest: {
        personaType: PersonaType.STANDARD,
        culturalData: {},
        demographics: {},
        psychographics: {},
        businessContext: {},
        customFields: {}
    },
    templateVariables: { templateId: 'test-template' },
    culturalConstraints: {
        music: [],
        brands: [],
        restaurants: [],
        movies: [],
        tv: [],
        books: [],
        travel: [],
        fashion: [],
        beauty: [],
        food: [],
        socialMedia: []
    },
    userSignals: {
        demographics: {
            ageRange: { min: 25, max: 35 },
            location: 'New York, NY',
            occupation: 'Software Engineer'
        },
        interests: ['technology', 'reading'],
        values: ['innovation', 'creativity'],
        culturalContext: {
            language: 'en',
            personaCount: 1
        }
    },
    generationAttempt: 1,
    previousErrors: []
};

describe('validateEmailFormat', () => {
    const emailValidator = validateEmailFormat();
    const multipleEmailValidator = validateEmailFormat(true);

    describe('single persona validation', () => {
        it('should validate correct email format', () => {
            const persona = { email: 'test@example.com' };
            const result = emailValidator(persona, mockContext);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.score).toBe(100);
        });

        it('should reject invalid email format', () => {
            const persona = { email: 'invalid-email' };
            const result = emailValidator(persona, mockContext);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].type).toBe(ValidationErrorType.FORMAT_INVALID);
            expect(result.errors[0].message).toContain('Invalid email format');
        });

        it('should reject non-string email', () => {
            const persona = { email: 12345 };
            const result = emailValidator(persona, mockContext);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].type).toBe(ValidationErrorType.TYPE_MISMATCH);
        });

        it('should reject empty email', () => {
            const persona = { email: '' };
            const result = emailValidator(persona, mockContext);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].type).toBe(ValidationErrorType.FORMAT_INVALID);
            expect(result.errors[0].message).toContain('cannot be empty');
        });

        it('should find email in nested properties', () => {
            const persona = { contact: { email: 'nested@example.com' } };
            const result = emailValidator(persona, mockContext);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should add warning for long email', () => {
            const longEmail = 'a'.repeat(250) + '@example.com';
            const persona = { email: longEmail };
            const result = emailValidator(persona, mockContext);

            expect(result.isValid).toBe(true);
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0].message).toContain('longer than recommended');
        });
    });

    describe('multiple email validation', () => {
        it('should validate multiple emails when allowed', () => {
            const persona = { email: 'test1@example.com, test2@example.com' };
            const result = multipleEmailValidator(persona, mockContext);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject invalid email in multiple email list', () => {
            const persona = { email: 'valid@example.com, invalid-email' };
            const result = multipleEmailValidator(persona, mockContext);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].message).toContain('invalid-email');
        });
    });

    describe('array of personas validation', () => {
        it('should validate emails in array of personas', () => {
            const personas = [
                { email: 'test1@example.com' },
                { email: 'test2@example.com' }
            ];
            const result = emailValidator(personas, mockContext);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should catch invalid email in array', () => {
            const personas = [
                { email: 'valid@example.com' },
                { email: 'invalid-email' }
            ];
            const result = emailValidator(personas, mockContext);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].field).toContain('[1]');
        });
    });
});

describe('validatePhoneFormat', () => {
    const phoneValidator = validatePhoneFormat();
    const internationalOnlyValidator = validatePhoneFormat(['international']);

    describe('single persona validation', () => {
        it('should validate international phone format', () => {
            const persona = { phone: '+1234567890' };
            const result = phoneValidator(persona, mockContext);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should validate national phone format', () => {
            const persona = { phone: '(123) 456-7890' };
            const result = phoneValidator(persona, mockContext);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should validate various national formats', () => {
            const formats = ['123-456-7890', '123.456.7890', '1234567890'];

            formats.forEach(format => {
                const persona = { phone: format };
                const result = phoneValidator(persona, mockContext);
                expect(result.isValid).toBe(true);
            });
        });

        it('should reject invalid phone format', () => {
            const persona = { phone: '123' };
            const result = phoneValidator(persona, mockContext);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].type).toBe(ValidationErrorType.FORMAT_INVALID);
        });

        it('should reject non-string phone', () => {
            const persona = { phone: 1234567890 };
            const result = phoneValidator(persona, mockContext);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].type).toBe(ValidationErrorType.TYPE_MISMATCH);
        });

        it('should find phone in nested properties', () => {
            const persona = { contact: { phone: '+1234567890' } };
            const result = phoneValidator(persona, mockContext);

            expect(result.isValid).toBe(true);
        });

        it('should add warning for short phone', () => {
            const persona = { phone: '123456' };
            const result = phoneValidator(persona, mockContext);

            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0].message).toContain('unusually short');
        });
    });

    describe('format restrictions', () => {
        it('should only accept international format when restricted', () => {
            const persona = { phone: '(123) 456-7890' };
            const result = internationalOnlyValidator(persona, mockContext);

            expect(result.isValid).toBe(false);
            expect(result.errors[0].message).toContain('international');
        });
    });
});

describe('validateDateFormat', () => {
    const dateValidator = validateDateFormat();
    const noFutureDatesValidator = validateDateFormat(['iso'], false);

    describe('single persona validation', () => {
        it('should validate ISO date format', () => {
            const persona = { birthDate: '1990-05-15' };
            const result = dateValidator(persona, mockContext);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should validate US date format', () => {
            const persona = { birthDate: '05/15/1990' };
            const result = dateValidator(persona, mockContext);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should validate EU date format', () => {
            const persona = { birthDate: '15/05/1990' };
            const result = dateValidator(persona, mockContext);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should validate Date object', () => {
            const persona = { birthDate: new Date('1990-05-15') };
            const result = dateValidator(persona, mockContext);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should validate timestamp', () => {
            const persona = { birthDate: 642470400000 }; // 1990-05-15
            const result = dateValidator(persona, mockContext);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject invalid date format', () => {
            const persona = { birthDate: 'invalid-date' };
            const result = dateValidator(persona, mockContext);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].type).toBe(ValidationErrorType.FORMAT_INVALID);
        });

        it('should reject non-date types', () => {
            const persona = { birthDate: true };
            const result = dateValidator(persona, mockContext);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].type).toBe(ValidationErrorType.TYPE_MISMATCH);
        });

        it('should find date in nested properties', () => {
            const persona = { demographics: { birthDate: '1990-05-15' } };
            const result = dateValidator(persona, mockContext);

            expect(result.isValid).toBe(true);
        });
    });

    describe('future date restrictions', () => {
        it('should reject future dates when not allowed', () => {
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);

            const persona = { birthDate: futureDate.toISOString() };
            const result = noFutureDatesValidator(persona, mockContext);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].type).toBe(ValidationErrorType.VALUE_OUT_OF_RANGE);
        });

        it('should allow future dates when permitted', () => {
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);

            const persona = { birthDate: futureDate.toISOString() };
            const result = dateValidator(persona, mockContext);

            expect(result.isValid).toBe(true);
        });
    });

    describe('edge case warnings', () => {
        it('should warn about very old dates', () => {
            const persona = { birthDate: '1800-01-01' };
            const result = dateValidator(persona, mockContext);

            expect(result.isValid).toBe(true);
            expect(result.warnings).toHaveLength(1);
            expect(result.warnings[0].message).toContain('150 years ago');
        });
    });
});

describe('validateArrayFormat', () => {
    const basicArrayRule: ArrayValidationRule = {
        minLength: 1,
        maxLength: 10,
        itemType: 'string'
    };

    const arrayValidator = validateArrayFormat({
        'interests': basicArrayRule,
        'skills': {
            minLength: 2,
            itemType: 'string',
            uniqueItems: true
        }
    });

    describe('single persona validation', () => {
        it('should validate correct array format', () => {
            const persona = {
                interests: ['reading', 'swimming'],
                skills: ['javascript', 'python']
            };
            const result = arrayValidator(persona, mockContext);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject non-array values', () => {
            const persona = { interests: 'not-an-array' };
            const result = arrayValidator(persona, mockContext);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].type).toBe(ValidationErrorType.TYPE_MISMATCH);
        });

        it('should validate array length constraints', () => {
            const persona = { interests: [] }; // Below minLength
            const result = arrayValidator(persona, mockContext);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].type).toBe(ValidationErrorType.VALUE_OUT_OF_RANGE);
            expect(result.errors[0].message).toContain('below minimum');
        });

        it('should validate item types', () => {
            const persona = { interests: ['reading', 123] }; // Mixed types
            const result = arrayValidator(persona, mockContext);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].type).toBe(ValidationErrorType.TYPE_MISMATCH);
            expect(result.errors[0].field).toContain('[1]');
        });

        it('should validate unique items constraint', () => {
            const persona = { skills: ['javascript', 'javascript'] }; // Duplicates
            const result = arrayValidator(persona, mockContext);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].type).toBe(ValidationErrorType.BUSINESS_RULE_VIOLATION);
            expect(result.errors[0].message).toContain('duplicate items');
        });
    });

    describe('custom validation rules', () => {
        const customValidator = validateArrayFormat({
            'scores': {
                itemType: 'number',
                itemValidator: (item: any) => item >= 0 && item <= 100
            }
        });

        it('should apply custom item validation', () => {
            const persona = { scores: [85, 92, 150] }; // 150 is out of range
            const result = customValidator(persona, mockContext);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].type).toBe(ValidationErrorType.BUSINESS_RULE_VIOLATION);
            expect(result.errors[0].field).toContain('[2]');
        });
    });

    describe('array of personas validation', () => {
        it('should validate arrays in multiple personas', () => {
            const personas = [
                { interests: ['reading'] },
                { interests: ['swimming', 'running'] }
            ];
            const result = arrayValidator(personas, mockContext);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should catch array errors in specific personas', () => {
            const personas = [
                { interests: ['reading'] },
                { interests: 'not-an-array' }
            ];
            const result = arrayValidator(personas, mockContext);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].field).toContain('[1]');
        });
    });

    describe('empty array handling', () => {
        const allowEmptyValidator = validateArrayFormat({
            'tags': {
                allowEmpty: true,
                itemType: 'string'
            }
        });

        it('should allow empty arrays when permitted', () => {
            const persona = { tags: [] };
            const result = allowEmptyValidator(persona, mockContext);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });
});

describe('edge cases and error handling', () => {
    const emailValidator = validateEmailFormat();

    it('should handle undefined values gracefully', () => {
        const persona = {}; // No email field
        const result = emailValidator(persona, mockContext);

        expect(result.isValid).toBe(true); // No validation needed if field is missing
        expect(result.errors).toHaveLength(0);
    });

    it('should handle null values', () => {
        const persona = { email: null };
        const result = emailValidator(persona, mockContext);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].type).toBe(ValidationErrorType.TYPE_MISMATCH);
    });

    it('should include proper metadata in results', () => {
        const persona = { email: 'test@example.com' };
        const result = emailValidator(persona, mockContext);

        expect(result.metadata).toBeDefined();
        expect(result.metadata.templateId).toBe('test-template');
        expect(result.metadata.validationTime).toBeGreaterThan(0);
        expect(result.metadata.rulesExecuted).toBe(1);
        expect(result.metadata.timestamp).toBeGreaterThan(0);
    });
});