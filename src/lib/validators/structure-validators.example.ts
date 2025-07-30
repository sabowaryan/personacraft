/**
 * Example usage of structure validators
 * This file demonstrates how to use the various structure validation functions
 */

import { 
    validateRequiredFields, 
    validateJSONStructure, 
    validateCulturalDataStructure,
    validateArrayStructure,
    validateObjectStructure,
    validateStringStructure
} from './structure-validators';
import { ValidationContext, PersonaType } from '@/types/validation';

// Example validation context
const exampleContext: ValidationContext = {
    originalRequest: {
        personaType: PersonaType.STANDARD,
    },
    templateVariables: { templateId: 'example-template' },
    culturalConstraints: {
        music: ['pop', 'rock', 'jazz'],
        brands: ['nike', 'apple', 'google'],
        restaurants: ['mcdonalds', 'starbucks', 'subway'],
        movies: ['avengers', 'titanic', 'inception'],
        tv: ['friends', 'game-of-thrones', 'breaking-bad'],
        books: ['harry-potter', 'lord-of-rings', '1984'],
        travel: ['paris', 'tokyo', 'new-york'],
        fashion: ['zara', 'h&m', 'uniqlo'],
        beauty: ['loreal', 'maybelline', 'chanel'],
        food: ['pizza', 'sushi', 'pasta'],
        socialMedia: ['instagram', 'tiktok', 'twitter']
    },
    userSignals: {
        demographics: {
            ageRange: { min: 25, max: 35 },
            location: 'Paris, France',
            occupation: 'Designer'
        },
        interests: ['art', 'cooking', 'travel', 'design'],
        values: ['creativity', 'family', 'sustainability', 'innovation'],
        culturalContext: {
            language: 'fr',
            personaCount: 1
        }
    },
    generationAttempt: 1,
    previousErrors: []
};

// Example persona data
const examplePersona = {
    name: 'Marie Dubois',
    age: 32,
    location: {
        city: 'Paris',
        country: 'France'
    },
    interests: ['cooking', 'art', 'travel'],
    skills: ['french', 'design'],
    contact: {
        email: 'marie@example.com',
        phone: '+33123456789'
    },
    culturalData: {
        demographics: {
            ageGroup: '30-35',
            income: 'middle'
        },
        psychographics: {
            values: ['family', 'creativity'],
            lifestyle: 'urban'
        },
        culturalValues: {
            traditions: ['french_cuisine'],
            holidays: ['bastille_day']
        },
        consumptionPatterns: {
            spending: 'moderate',
            preferences: ['local_products']
        }
    }
};

// Example usage of structure validators
export function demonstrateStructureValidators() {
    console.log('=== Structure Validators Examples ===\n');

    // 1. Validate required fields
    console.log('1. Required Fields Validation:');
    const requiredFieldsValidator = validateRequiredFields([
        'name', 
        'age', 
        'location.city', 
        'culturalData'
    ]);
    const requiredFieldsResult = requiredFieldsValidator(examplePersona, exampleContext);
    console.log(`Valid: ${requiredFieldsResult.isValid}, Score: ${requiredFieldsResult.score}`);
    console.log(`Errors: ${requiredFieldsResult.errors.length}\n`);

    // 2. Validate JSON structure
    console.log('2. JSON Structure Validation:');
    const jsonValidator = validateJSONStructure();
    const jsonResult = jsonValidator(examplePersona, exampleContext);
    console.log(`Valid: ${jsonResult.isValid}, Score: ${jsonResult.score}`);
    console.log(`Errors: ${jsonResult.errors.length}\n`);

    // 3. Validate cultural data structure
    console.log('3. Cultural Data Structure Validation:');
    const culturalValidator = validateCulturalDataStructure();
    const culturalResult = culturalValidator(examplePersona, exampleContext);
    console.log(`Valid: ${culturalResult.isValid}, Score: ${culturalResult.score}`);
    console.log(`Errors: ${culturalResult.errors.length}\n`);

    // 4. Validate array structure
    console.log('4. Array Structure Validation:');
    const arrayValidator = validateArrayStructure({
        'interests': 2,  // At least 2 interests
        'skills': 1      // At least 1 skill
    });
    const arrayResult = arrayValidator(examplePersona, exampleContext);
    console.log(`Valid: ${arrayResult.isValid}, Score: ${arrayResult.score}`);
    console.log(`Errors: ${arrayResult.errors.length}\n`);

    // 5. Validate object structure
    console.log('5. Object Structure Validation:');
    const objectValidator = validateObjectStructure({
        'location': ['city', 'country'],
        'contact': ['email'],
        'culturalData.demographics': ['ageGroup']
    });
    const objectResult = objectValidator(examplePersona, exampleContext);
    console.log(`Valid: ${objectResult.isValid}, Score: ${objectResult.score}`);
    console.log(`Errors: ${objectResult.errors.length}\n`);

    // 6. Validate string structure
    console.log('6. String Structure Validation:');
    const stringValidator = validateStringStructure({
        'name': 3,           // At least 3 characters
        'location.city': 2   // At least 2 characters
    });
    const stringResult = stringValidator(examplePersona, exampleContext);
    console.log(`Valid: ${stringResult.isValid}, Score: ${stringResult.score}`);
    console.log(`Errors: ${stringResult.errors.length}\n`);

    // Example with validation errors
    console.log('=== Example with Validation Errors ===\n');
    const invalidPersona = {
        name: 'Jo', // Too short
        // age missing
        interests: ['cooking'], // Only 1 interest, needs 2
        contact: {
            // email missing
            phone: '+33123456789'
        }
    };

    const combinedValidation = [
        validateRequiredFields(['name', 'age', 'contact.email']),
        validateStringStructure({ 'name': 3 }),
        validateArrayStructure({ 'interests': 2 }),
        validateObjectStructure({ 'contact': ['email'] })
    ];

    combinedValidation.forEach((validator, index) => {
        const result = validator(invalidPersona, exampleContext);
        console.log(`Validator ${index + 1}: Valid: ${result.isValid}, Errors: ${result.errors.length}`);
        if (result.errors.length > 0) {
            result.errors.forEach(error => {
                console.log(`  - ${error.field}: ${error.message}`);
            });
        }
    });
}

// Example of combining multiple validators
export function createPersonaStructureValidator() {
    return {
        validateBasicStructure: validateRequiredFields([
            'name',
            'age',
            'culturalData'
        ]),
        validateJSON: validateJSONStructure(),
        validateCulturalData: validateCulturalDataStructure(),
        validateArrays: validateArrayStructure({
            'interests': 1,
            'culturalData.psychographics.values': 1
        }),
        validateObjects: validateObjectStructure({
            'culturalData': ['demographics', 'psychographics'],
            'culturalData.demographics': ['ageGroup'],
            'culturalData.psychographics': ['values']
        }),
        validateStrings: validateStringStructure({
            'name': 2,
            'culturalData.demographics.ageGroup': 1
        })
    };
}

// Run the demonstration if this file is executed directly
if (require.main === module) {
    demonstrateStructureValidators();
}