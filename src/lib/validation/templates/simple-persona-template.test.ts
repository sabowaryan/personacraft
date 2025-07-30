/**
 * Unit tests for Simple Persona Validation Template
 * Tests the basic validation rules for simple personas
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { simplePersonaTemplate } from './simple-persona-template';
import {
    ValidationContext,
    ValidationSeverity,
    ValidationErrorType,
    PersonaType
} from '@/types/validation';

describe('Simple Persona Template', () => {
    let mockContext: ValidationContext;

    beforeEach(() => {
        mockContext = {
            originalRequest: {
                personaType: PersonaType.SIMPLE,
                demographics: { ageRange: '25-35', location: 'New York, USA' },
                psychographics: { interests: [], values: [] }
            },
            templateVariables: {
                location: 'New York, USA',
                ageRange: '25-35',
                interests: [],
                values: []
            },
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
                    location: 'New York, USA'
                },
                interests: [],
                values: [],
                culturalContext: { language: 'en', personaCount: 2 }
            },
            generationAttempt: 1,
            previousErrors: []
        };
    });

    it('should have correct template metadata', () => {
        expect(simplePersonaTemplate.id).toBe('simple-persona-v1');
        expect(simplePersonaTemplate.name).toBe('Simple Persona Validation');
        expect(simplePersonaTemplate.personaType).toBe(PersonaType.SIMPLE);
        expect(simplePersonaTemplate.version).toBe('1.0.0');
    });

    it('should have validation rules with correct severity levels', () => {
        const rules = simplePersonaTemplate.rules;
        expect(rules.length).toBeGreaterThan(0);

        // Check that ValidationSeverity enum is properly accessible
        const errorRules = rules.filter(rule => rule.severity === ValidationSeverity.ERROR);
        const warningRules = rules.filter(rule => rule.severity === ValidationSeverity.WARNING);

        expect(errorRules.length).toBeGreaterThan(0);
        expect(warningRules.length).toBeGreaterThanOrEqual(0);
    });

    it('should validate required fields rule', async () => {
        const requiredFieldsRule = simplePersonaTemplate.rules.find(
            rule => rule.id === 'required-fields-simple'
        );

        expect(requiredFieldsRule).toBeDefined();
        expect(requiredFieldsRule?.severity).toBe(ValidationSeverity.ERROR);
        expect(requiredFieldsRule?.required).toBe(true);

        // Test with valid persona
        const validPersona = {
            id: 'test-1',
            name: 'John Doe',
            age: 30,
            occupation: 'Engineer',
            location: 'New York, USA'
        };

        const result = await requiredFieldsRule!.validator(validPersona, mockContext);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for missing required fields', async () => {
        const requiredFieldsRule = simplePersonaTemplate.rules.find(
            rule => rule.id === 'required-fields-simple'
        );

        expect(requiredFieldsRule).toBeDefined();

        // Test with invalid persona (missing required fields)
        const invalidPersona = {
            name: 'John Doe'
            // Missing: id, age, occupation, location
        };

        const result = await requiredFieldsRule!.validator(invalidPersona, mockContext);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);

        // Check that errors have correct severity
        result.errors.forEach(error => {
            expect(error.severity).toBe(ValidationSeverity.ERROR);
            expect(error.type).toBe(ValidationErrorType.REQUIRED_FIELD_MISSING);
        });
    });

    it('should validate JSON structure rule', async () => {
        const jsonStructureRule = simplePersonaTemplate.rules.find(
            rule => rule.id === 'json-structure'
        );

        expect(jsonStructureRule).toBeDefined();
        expect(jsonStructureRule?.severity).toBe(ValidationSeverity.ERROR);

        // Test with valid JSON structure
        const validPersona = {
            id: 'test-1',
            name: 'John Doe',
            age: 30,
            occupation: 'Engineer',
            location: 'New York, USA'
        };

        const result = await jsonStructureRule!.validator(validPersona, mockContext);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for invalid JSON structure', async () => {
        const jsonStructureRule = simplePersonaTemplate.rules.find(
            rule => rule.id === 'json-structure'
        );

        expect(jsonStructureRule).toBeDefined();

        // Test with null/undefined
        let result = await jsonStructureRule!.validator(null, mockContext);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0].severity).toBe(ValidationSeverity.ERROR);

        // Test with primitive value
        result = await jsonStructureRule!.validator("not an object", mockContext);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors[0].severity).toBe(ValidationSeverity.ERROR);
    });

    it('should have proper fallback strategy', () => {
        expect(simplePersonaTemplate.fallbackStrategy).toBeDefined();
        expect(simplePersonaTemplate.fallbackStrategy.maxRetries).toBeGreaterThan(0);
        expect(simplePersonaTemplate.fallbackStrategy.type).toBeDefined();
    });

    it('should have active metadata', () => {
        expect(simplePersonaTemplate.metadata).toBeDefined();
        expect(simplePersonaTemplate.metadata.isActive).toBe(true);
        expect(simplePersonaTemplate.metadata.createdAt).toBeGreaterThan(0);
        expect(simplePersonaTemplate.metadata.author).toBeDefined();
    });
});