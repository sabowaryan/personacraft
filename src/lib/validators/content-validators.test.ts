/**
 * Tests for content validators
 */

import { describe, it, expect } from 'vitest';
import {
    validateAgeRange,
    validateLocationFormat,
    validateCulturalDataConsistency,
    validateIncomeRange,
    validateOccupationConsistency
} from './content-validators';
import { ValidationContext, PersonaType } from '@/types/validation';

// Mock validation context
const mockContext: ValidationContext = {
    originalRequest: {
        personaType: PersonaType.STANDARD,
        culturalData: {},
        demographics: {},
        psychographics: {}
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
            ageRange: { min: 18, max: 65 },
            location: 'Test Location'
        },
        interests: [],
        values: [],
        culturalContext: {
            language: 'en',
            personaCount: 1
        }
    },
    generationAttempt: 1,
    previousErrors: []
};

describe('validateAgeRange', () => {
    const validator = validateAgeRange(18, 80);

    it('should pass for valid age in single persona', () => {
        const persona = { age: 25 };
        const result = validator(persona, mockContext);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.score).toBe(100);
    });

    it('should pass for valid age in demographics', () => {
        const persona = { demographics: { age: 35 } };
        const result = validator(persona, mockContext);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should fail for age below minimum', () => {
        const persona = { age: 16 };
        const result = validator(persona, mockContext);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].type).toBe('VALUE_OUT_OF_RANGE');
        expect(result.errors[0].message).toContain('below minimum age');
    });

    it('should fail for age above maximum', () => {
        const persona = { age: 85 };
        const result = validator(persona, mockContext);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].type).toBe('VALUE_OUT_OF_RANGE');
        expect(result.errors[0].message).toContain('above maximum age');
    });

    it('should handle string age conversion', () => {
        const persona = { age: '25' };
        const result = validator(persona, mockContext);

        expect(result.isValid).toBe(true);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].message).toContain('converted from');
    });

    it('should fail for invalid age type', () => {
        const persona = { age: 'invalid' };
        const result = validator(persona, mockContext);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].type).toBe('TYPE_MISMATCH');
    });

    it('should handle array of personas', () => {
        const personas = [
            { age: 25 },
            { age: 85 }, // Invalid
            { age: 30 }
        ];
        const result = validator(personas, mockContext);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].field).toContain('[1]');
    });

    it('should add warnings for edge cases', () => {
        const youngPersona = { age: 20 };
        const result1 = validator(youngPersona, mockContext);

        expect(result1.isValid).toBe(true);
        expect(result1.warnings).toHaveLength(1);
        expect(result1.warnings[0].message).toContain('quite young');

        const seniorPersona = { age: 70 };
        const result2 = validator(seniorPersona, mockContext);

        expect(result2.isValid).toBe(true);
        expect(result2.warnings).toHaveLength(1);
        expect(result2.warnings[0].message).toContain('senior demographic');
    });
});

describe('validateLocationFormat', () => {
    const validator = validateLocationFormat();

    it('should pass for valid city, country format', () => {
        const persona = { location: 'Paris, France' };
        const result = validator(persona, mockContext);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should pass for valid city, state, country format', () => {
        const persona = { location: 'New York, NY, USA' };
        const result = validator(persona, mockContext);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should pass for valid coordinates', () => {
        const persona = { location: { lat: 40.7128, lng: -74.0060 } };
        const result = validator(persona, mockContext);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should pass for coordinates with latitude/longitude keys', () => {
        const persona = { location: { latitude: 40.7128, longitude: -74.0060 } };
        const result = validator(persona, mockContext);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should fail for invalid coordinate values', () => {
        const persona = { location: { lat: 100, lng: -74.0060 } }; // Invalid latitude
        const result = validator(persona, mockContext);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].type).toBe('FORMAT_INVALID');
    });

    it('should fail for invalid location format', () => {
        const persona = { location: 'InvalidLocation' };
        const result = validator(persona, mockContext);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].type).toBe('FORMAT_INVALID');
    });

    it('should handle location in demographics', () => {
        const persona = { demographics: { location: 'London, UK' } };
        const result = validator(persona, mockContext);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should handle location in cultural data', () => {
        const persona = { culturalData: { demographics: { location: 'Tokyo, Japan' } } };
        const result = validator(persona, mockContext);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });
});

describe('validateCulturalDataConsistency', () => {
    const validator = validateCulturalDataConsistency();

    it('should pass for consistent cultural data', () => {
        const persona = {
            culturalData: {
                demographics: {
                    age: 25,
                    location: 'Paris, France'
                },
                culturalValues: {
                    generation: 'Millennial',
                    culturalBackground: 'French'
                },
                consumptionPatterns: {
                    spendingHabits: 'moderate'
                }
            }
        };
        const result = validator(persona, mockContext);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should warn for age-generation mismatch', () => {
        const persona = {
            culturalData: {
                demographics: { age: 25 },
                culturalValues: { generation: 'Baby Boomer' }
            }
        };
        const result = validator(persona, mockContext);

        expect(result.isValid).toBe(true);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].message).toContain('generation');
    });

    it('should warn for location-culture mismatch', () => {
        const persona = {
            culturalData: {
                demographics: { location: 'Paris, France' },
                culturalValues: { culturalBackground: 'Japanese' }
            }
        };
        const result = validator(persona, mockContext);

        expect(result.isValid).toBe(true);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].message).toContain('Location suggests');
    });

    it('should handle missing cultural data gracefully', () => {
        const persona = { name: 'Test' };
        const result = validator(persona, mockContext);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });
});

describe('validateIncomeRange', () => {
    const validator = validateIncomeRange(0, 1000000);

    it('should pass for valid numeric income', () => {
        const persona = { income: 50000 };
        const result = validator(persona, mockContext);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should pass for valid string income', () => {
        const persona = { income: '$50,000' };
        const result = validator(persona, mockContext);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should pass for income with k suffix', () => {
        const persona = { income: '50k' };
        const result = validator(persona, mockContext);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should fail for income below minimum', () => {
        const persona = { income: -1000 };
        const result = validator(persona, mockContext);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].type).toBe('VALUE_OUT_OF_RANGE');
    });

    it('should fail for income above maximum', () => {
        const persona = { income: 2000000 };
        const result = validator(persona, mockContext);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].type).toBe('VALUE_OUT_OF_RANGE');
    });

    it('should fail for invalid income format', () => {
        const persona = { income: 'invalid income' };
        const result = validator(persona, mockContext);

        expect(result.isValid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].type).toBe('FORMAT_INVALID');
    });

    it('should handle income in demographics', () => {
        const persona = { demographics: { income: 60000 } };
        const result = validator(persona, mockContext);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });
});

describe('validateOccupationConsistency', () => {
    const validator = validateOccupationConsistency();

    it('should pass for consistent occupation and industry', () => {
        const persona = {
            occupation: 'Software Engineer',
            industry: 'Technology'
        };
        const result = validator(persona, mockContext);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should warn for inconsistent occupation and industry', () => {
        const persona = {
            occupation: 'Teacher',
            industry: 'Technology'
        };
        const result = validator(persona, mockContext);

        expect(result.isValid).toBe(true);
        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings[0].message).toContain('may not typically align');
    });

    it('should warn for occupation-income mismatch', () => {
        const persona = {
            occupation: 'Teacher',
            income: 200000 // High for typical teacher salary
        };
        const result = validator(persona, mockContext);

        expect(result.isValid).toBe(true);
        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings[0].message).toContain('may not align');
    });

    it('should handle missing occupation data gracefully', () => {
        const persona = { name: 'Test' };
        const result = validator(persona, mockContext);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.warnings).toHaveLength(0);
    });

    it('should handle occupation in demographics', () => {
        const persona = {
            demographics: {
                occupation: 'Doctor',
                industry: 'Healthcare'
            }
        };
        const result = validator(persona, mockContext);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });
});