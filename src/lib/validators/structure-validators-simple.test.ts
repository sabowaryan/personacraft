/**
 * Simple test to verify structure validators are working
 */

import { describe, it, expect } from 'vitest';
import { validateRequiredFields } from './structure-validators';
import { ValidationContext, PersonaType, ValidationErrorType } from '@/types/validation';

describe('Structure Validators Import Test', () => {
    it('should import validateRequiredFields function', () => {
        expect(typeof validateRequiredFields).toBe('function');
    });

    it('should validate required fields correctly', () => {
        const mockContext: ValidationContext = {
            originalRequest: {
                personaType: PersonaType.STANDARD,
            },
            templateVariables: { templateId: 'test-template' },
            culturalConstraints: {
                music: ['pop', 'rock'],
                brands: ['nike', 'apple'],
                restaurants: ['mcdonalds', 'starbucks'],
                movies: ['avengers', 'titanic'],
                tv: ['friends', 'game-of-thrones'],
                books: ['harry-potter', 'lord-of-rings'],
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

        const validator = validateRequiredFields(['name', 'age']);
        
        // Test with valid data
        const validData = { name: 'John Doe', age: 30 };
        const validResult = validator(validData, mockContext);
        expect(validResult.isValid).toBe(true);
        expect(validResult.errors).toHaveLength(0);

        // Test with missing field
        const invalidData = { name: 'John Doe' };
        const invalidResult = validator(invalidData, mockContext);
        expect(invalidResult.isValid).toBe(false);
        expect(invalidResult.errors).toHaveLength(1);
        expect(invalidResult.errors[0].type).toBe(ValidationErrorType.REQUIRED_FIELD_MISSING);
        expect(invalidResult.errors[0].field).toBe('age');
    });
});