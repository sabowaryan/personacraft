/**
 * Comprehensive tests for structure validators
 */

import { describe, it, expect } from 'vitest';
import { 
    validateRequiredFields, 
    validateJSONStructure, 
    validateCulturalDataStructure,
    validateArrayStructure,
    validateObjectStructure,
    validateStringStructure
} from './structure-validators';
import { ValidationContext, PersonaType, ValidationErrorType } from '@/types/validation';

const mockContext: ValidationContext = {
    originalRequest: {
        personaType: PersonaType.STANDARD,
    },
    templateVariables: { templateId: 'test-template' },
    culturalConstraints: {
        music: ['pop', 'rock'],
        brand: ['nike', 'apple'],
        restaurant: ['mcdonalds', 'starbucks'],
        movie: ['avengers', 'titanic'],
        tv: ['friends', 'game-of-thrones'],
        book: ['harry-potter', 'lord-of-rings'],
        travel: ['paris', 'tokyo'],
        fashion: ['zara', 'h&m'],
        beauty: ['loreal', 'maybelline'],
        food: ['pizza', 'sushi'],
        socialMedia: ['instagram', 'tiktok']
    },
    userSignals: {
        demographics: {
            ageRange: { min: 25, max: 35 },
            location: 'Paris, France',
            occupation: 'Software Engineer'
        },
        interests: ['technology', 'travel', 'cooking'],
        values: ['innovation', 'family', 'sustainability'],
        culturalContext: {
            language: 'fr',
            personaCount: 3
        }
    },
    generationAttempt: 1,
    previousErrors: []
};

describe('Structure Validators', () => {
    describe('validateRequiredFields', () => {
        it('should pass validation when all required fields are present', () => {
            const validator = validateRequiredFields(['name', 'age', 'location.city']);
            const data = {
                name: 'John Doe',
                age: 30,
                location: { city: 'Paris' }
            };

            const result = validator(data, mockContext);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.score).toBe(100);
        });

        it('should fail validation when required fields are missing', () => {
            const validator = validateRequiredFields(['name', 'age', 'email']);
            const data = { name: 'John Doe' };

            const result = validator(data, mockContext);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(2);
            expect(result.errors[0].type).toBe(ValidationErrorType.REQUIRED_FIELD_MISSING);
            expect(result.errors[0].field).toBe('age');
            expect(result.errors[1].field).toBe('email');
        });

        it('should handle array of personas', () => {
            const validator = validateRequiredFields(['name', 'age']);
            const data = [
                { name: 'John', age: 30 },
                { name: 'Jane' } // missing age
            ];

            const result = validator(data, mockContext);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].field).toBe('[1].age');
        });
    });

    describe('validateJSONStructure', () => {
        it('should pass validation for valid JSON objects', () => {
            const validator = validateJSONStructure();
            const data = { name: 'John', age: 30, active: true };

            const result = validator(data, mockContext);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should fail validation for null or undefined values', () => {
            const validator = validateJSONStructure();
            
            const nullResult = validator(null, mockContext);
            expect(nullResult.isValid).toBe(false);
            expect(nullResult.errors[0].type).toBe(ValidationErrorType.STRUCTURE_INVALID);

            const undefinedResult = validator(undefined, mockContext);
            expect(undefinedResult.isValid).toBe(false);
            expect(undefinedResult.errors[0].type).toBe(ValidationErrorType.STRUCTURE_INVALID);
        });

        it('should fail validation for primitive types', () => {
            const validator = validateJSONStructure();
            const result = validator('string', mockContext);

            expect(result.isValid).toBe(false);
            expect(result.errors[0].type).toBe(ValidationErrorType.TYPE_MISMATCH);
        });

        it('should validate against schema when provided', () => {
            const schema = {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    age: { type: 'number' }
                }
            };
            const validator = validateJSONStructure(schema);
            
            const validData = { name: 'John', age: 30 };
            const validResult = validator(validData, mockContext);
            expect(validResult.isValid).toBe(true);

            const invalidData = { name: 'John', age: 'thirty' };
            const invalidResult = validator(invalidData, mockContext);
            expect(invalidResult.isValid).toBe(false);
        });
    });

    describe('validateCulturalDataStructure', () => {
        it('should pass validation when all cultural data categories are present', () => {
            const validator = validateCulturalDataStructure();
            const data = {
                culturalData: {
                    demographics: { age: 30 },
                    psychographics: { values: ['family'] },
                    culturalValues: { traditions: ['holiday'] },
                    consumptionPatterns: { spending: 'moderate' }
                }
            };

            const result = validator(data, mockContext);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should fail validation when cultural data categories are missing', () => {
            const validator = validateCulturalDataStructure();
            const data = {
                culturalData: {
                    demographics: { age: 30 },
                    psychographics: { values: ['family'] }
                    // missing culturalValues and consumptionPatterns
                }
            };

            const result = validator(data, mockContext);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(2);
            expect(result.errors[0].field).toBe('culturalData.culturalValues');
            expect(result.errors[1].field).toBe('culturalData.consumptionPatterns');
        });

        it('should fail validation when culturalData is completely missing', () => {
            const validator = validateCulturalDataStructure();
            const data = { name: 'John' };

            const result = validator(data, mockContext);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].field).toBe('culturalData');
        });
    });

    describe('validateArrayStructure', () => {
        it('should pass validation for arrays with sufficient length', () => {
            const validator = validateArrayStructure({ 'interests': 2, 'skills': 1 });
            const data = {
                interests: ['reading', 'cooking', 'travel'],
                skills: ['javascript']
            };

            const result = validator(data, mockContext);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should fail validation for arrays with insufficient length', () => {
            const validator = validateArrayStructure({ 'interests': 3, 'skills': 2 });
            const data = {
                interests: ['reading'], // needs 3, has 1
                skills: ['javascript'] // needs 2, has 1
            };

            const result = validator(data, mockContext);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(2);
            expect(result.errors[0].type).toBe(ValidationErrorType.VALUE_OUT_OF_RANGE);
        });

        it('should fail validation for non-array values', () => {
            const validator = validateArrayStructure({ 'interests': 1 });
            const data = { interests: 'reading' };

            const result = validator(data, mockContext);
            expect(result.isValid).toBe(false);
            expect(result.errors[0].type).toBe(ValidationErrorType.TYPE_MISMATCH);
        });
    });

    describe('validateObjectStructure', () => {
        it('should pass validation for objects with required properties', () => {
            const validator = validateObjectStructure({ 
                'address': ['street', 'city'], 
                'contact': ['email'] 
            });
            const data = {
                address: { street: '123 Main St', city: 'Paris', country: 'France' },
                contact: { email: 'john@example.com', phone: '123-456-7890' }
            };

            const result = validator(data, mockContext);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should fail validation for objects missing required properties', () => {
            const validator = validateObjectStructure({ 
                'address': ['street', 'city', 'country'] 
            });
            const data = {
                address: { street: '123 Main St' } // missing city and country
            };

            const result = validator(data, mockContext);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(2);
            expect(result.errors[0].type).toBe(ValidationErrorType.REQUIRED_FIELD_MISSING);
        });

        it('should fail validation for non-object values', () => {
            const validator = validateObjectStructure({ 'address': ['street'] });
            const data = { address: 'string address' };

            const result = validator(data, mockContext);
            expect(result.isValid).toBe(false);
            expect(result.errors[0].type).toBe(ValidationErrorType.TYPE_MISMATCH);
        });
    });

    describe('validateStringStructure', () => {
        it('should pass validation for strings with sufficient length', () => {
            const validator = validateStringStructure({ 'name': 2, 'description': 10 });
            const data = {
                name: 'John Doe',
                description: 'A detailed description of the person'
            };

            const result = validator(data, mockContext);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should fail validation for strings with insufficient length', () => {
            const validator = validateStringStructure({ 'name': 5, 'description': 20 });
            const data = {
                name: 'Jo', // needs 5, has 2
                description: 'Short' // needs 20, has 5
            };

            const result = validator(data, mockContext);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(2);
            expect(result.errors[0].type).toBe(ValidationErrorType.VALUE_OUT_OF_RANGE);
        });

        it('should fail validation for non-string values', () => {
            const validator = validateStringStructure({ 'name': 1 });
            const data = { name: 123 };

            const result = validator(data, mockContext);
            expect(result.isValid).toBe(false);
            expect(result.errors[0].type).toBe(ValidationErrorType.TYPE_MISMATCH);
        });

        it('should handle whitespace correctly', () => {
            const validator = validateStringStructure({ 'name': 5 });
            const data = { name: '   Jo   ' }; // trimmed length is 2, needs 5

            const result = validator(data, mockContext);
            expect(result.isValid).toBe(false);
            expect(result.errors[0].type).toBe(ValidationErrorType.VALUE_OUT_OF_RANGE);
        });
    });
});