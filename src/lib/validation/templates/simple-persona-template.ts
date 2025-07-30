/**
 * Simple Persona Validation Template
 * Minimal validation rules for simple personas with essential fields only
 */

import {
    ValidationTemplate,
    ValidationRule,
    ValidationRuleType,
    ValidationSeverity,
    PersonaType,
    FallbackStrategyType
} from '@/types/validation';

import { validateRequiredFields, validateJSONStructure } from '@/lib/validators/structure-validators';
import { validateAgeRange, validateLocationFormat } from '@/lib/validators/content-validators';
import { validateArrayFormat } from '@/lib/validators/format-validators';

/**
 * Simple persona template with minimal validation rules
 */
export const simplePersonaTemplate: ValidationTemplate = {
    id: 'simple-persona-v1',
    name: 'Simple Persona Validation',
    version: '1.0.0',
    personaType: PersonaType.SIMPLE,
    rules: [
        // Essential structure validation rules
        {
            id: 'required-fields-simple',
            type: ValidationRuleType.STRUCTURE,
            field: 'root',
            validator: validateRequiredFields([
                'id',
                'name',
                'age',
                'occupation',
                'location'
            ]),
            severity: ValidationSeverity.ERROR,
            message: 'Missing required basic fields for simple persona',
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
            id: 'demographics-structure',
            type: ValidationRuleType.STRUCTURE,
            field: 'demographics',
            validator: validateRequiredFields([
                'demographics.income',
                'demographics.education',
                'demographics.familyStatus'
            ]),
            severity: ValidationSeverity.ERROR,
            message: 'Missing required demographic fields',
            required: true,
            priority: 2
        },
        {
            id: 'psychographics-structure',
            type: ValidationRuleType.STRUCTURE,
            field: 'psychographics',
            validator: validateRequiredFields([
                'psychographics.personality',
                'psychographics.values',
                'psychographics.interests'
            ]),
            severity: ValidationSeverity.ERROR,
            message: 'Missing required psychographic fields',
            required: true,
            priority: 2
        },

        // Essential content validation rules
        {
            id: 'age-range-simple',
            type: ValidationRuleType.CONTENT,
            field: 'age',
            validator: validateAgeRange(18, 80),
            severity: ValidationSeverity.ERROR,
            message: 'Age must be between 18 and 80',
            required: true,
            priority: 3
        },
        {
            id: 'location-format-simple',
            type: ValidationRuleType.CONTENT,
            field: 'location',
            validator: validateLocationFormat(['city_country', 'city_state_country', 'simple']),
            severity: ValidationSeverity.WARNING,
            message: 'Location should be in recognizable format',
            required: false,
            priority: 4
        },

        // Essential format validation rules
        {
            id: 'array-format-personality',
            type: ValidationRuleType.FORMAT,
            field: 'psychographics.personality',
            validator: validateArrayFormat({
                'psychographics.personality': {
                    minLength: 1,
                    maxLength: 5,
                    itemType: 'string',
                    allowEmpty: false,
                    uniqueItems: true
                }
            }),
            severity: ValidationSeverity.ERROR,
            message: 'Personality should be a non-empty array of traits',
            required: true,
            priority: 3
        },
        {
            id: 'array-format-values',
            type: ValidationRuleType.FORMAT,
            field: 'psychographics.values',
            validator: validateArrayFormat({
                'psychographics.values': {
                    minLength: 1,
                    maxLength: 5,
                    itemType: 'string',
                    allowEmpty: false,
                    uniqueItems: true
                }
            }),
            severity: ValidationSeverity.ERROR,
            message: 'Values should be a non-empty array of core values',
            required: true,
            priority: 3
        },
        {
            id: 'array-format-interests',
            type: ValidationRuleType.FORMAT,
            field: 'psychographics.interests',
            validator: validateArrayFormat({
                'psychographics.interests': {
                    minLength: 1,
                    maxLength: 10,
                    itemType: 'string',
                    allowEmpty: false,
                    uniqueItems: true
                }
            }),
            severity: ValidationSeverity.ERROR,
            message: 'Interests should be a non-empty array of interests',
            required: true,
            priority: 3
        },
        {
            id: 'array-format-pain-points',
            type: ValidationRuleType.FORMAT,
            field: 'painPoints',
            validator: validateArrayFormat({
                'painPoints': {
                    minLength: 1,
                    maxLength: 5,
                    itemType: 'string',
                    allowEmpty: false,
                    uniqueItems: true
                }
            }),
            severity: ValidationSeverity.ERROR,
            message: 'Pain points should be a non-empty array',
            required: true,
            priority: 3
        },
        {
            id: 'array-format-goals',
            type: ValidationRuleType.FORMAT,
            field: 'goals',
            validator: validateArrayFormat({
                'goals': {
                    minLength: 1,
                    maxLength: 5,
                    itemType: 'string',
                    allowEmpty: false,
                    uniqueItems: true
                }
            }),
            severity: ValidationSeverity.ERROR,
            message: 'Goals should be a non-empty array',
            required: true,
            priority: 3
        },

        // Optional cultural data validation (relaxed)
        {
            id: 'cultural-data-optional',
            type: ValidationRuleType.STRUCTURE,
            field: 'culturalData',
            validator: validateOptionalCulturalData(),
            severity: ValidationSeverity.WARNING,
            message: 'Cultural data should contain basic preferences if provided',
            required: false,
            priority: 2
        },

        // Basic business validation
        {
            id: 'persona-basic-completeness',
            type: ValidationRuleType.BUSINESS,
            field: 'root',
            validator: validateBasicCompleteness(),
            severity: ValidationSeverity.WARNING,
            message: 'Simple persona should have basic completeness for usability',
            required: false,
            priority: 6
        }
    ],
    fallbackStrategy: {
        type: FallbackStrategyType.DEFAULT_RESPONSE,
        maxRetries: 2,
        defaultResponse: getDefaultSimplePersona(),
        retryDelay: 500,
        backoffMultiplier: 1.2
    },
    metadata: {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        author: 'Qloo Validation System',
        description: 'Minimal validation template for simple personas with essential fields only',
        tags: ['simple', 'minimal', 'basic', 'fallback'],
        isActive: true,
        supportedLLMs: ['gpt-4', 'gpt-3.5-turbo', 'claude-3', 'gemini-pro']
    }
};

/**
 * Validates optional cultural data with relaxed requirements
 */
function validateOptionalCulturalData() {
    return (value: any, context: any) => {
        const errors: any[] = [];
        const warnings: any[] = [];
        const startTime = Date.now();

        // If cultural data is provided, do basic validation
        if (value && typeof value === 'object') {
            const culturalFields = ['music', 'brands', 'restaurants', 'movies', 'tv', 'socialMedia'];
            let providedFields = 0;

            culturalFields.forEach(field => {
                if (value[field] && Array.isArray(value[field]) && value[field].length > 0) {
                    providedFields++;
                }
            });

            // Warn if cultural data is too sparse
            if (providedFields < 2) {
                warnings.push({
                    id: 'cultural-data-sparse',
                    field: 'culturalData',
                    message: 'Cultural data is sparse, consider adding more preferences',
                    value: providedFields,
                    suggestion: 'Include at least 2-3 cultural preference categories'
                });
            }
        }

        const validationTime = Date.now() - startTime;

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            score: errors.length === 0 ? (warnings.length === 0 ? 100 : 85) : 0,
            metadata: {
                templateId: context.templateVariables?.templateId || 'simple-persona-v1',
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
 * Validates basic completeness for simple personas
 */
function validateBasicCompleteness() {
    return (value: any, context: any) => {
        const errors: any[] = [];
        const warnings: any[] = [];
        const startTime = Date.now();

        // Check if essential fields have meaningful content
        const essentialFields = [
            { field: 'name', minLength: 2 },
            { field: 'occupation', minLength: 3 },
            { field: 'bio', minLength: 10 },
            { field: 'quote', minLength: 5 }
        ];

        let completenessScore = 0;
        const totalFields = essentialFields.length;

        essentialFields.forEach(({ field, minLength }) => {
            const fieldValue = value[field];
            if (fieldValue && typeof fieldValue === 'string' && fieldValue.trim().length >= minLength) {
                completenessScore++;
            } else {
                warnings.push({
                    id: `basic-completeness-${field}`,
                    field,
                    message: `${field} should have meaningful content (min ${minLength} characters)`,
                    value: fieldValue,
                    suggestion: `Provide more detailed ${field} information`
                });
            }
        });

        // Check if pain points and goals are meaningful
        if (value.painPoints && Array.isArray(value.painPoints)) {
            const meaningfulPainPoints = value.painPoints.filter((point: any) => 
                typeof point === 'string' && point.trim().length > 10
            );
            if (meaningfulPainPoints.length === 0) {
                warnings.push({
                    id: 'basic-completeness-pain-points',
                    field: 'painPoints',
                    message: 'Pain points should be detailed and meaningful',
                    value: value.painPoints,
                    suggestion: 'Provide specific, actionable pain points'
                });
            } else {
                completenessScore += 0.5;
            }
        }

        if (value.goals && Array.isArray(value.goals)) {
            const meaningfulGoals = value.goals.filter((goal: any) => 
                typeof goal === 'string' && goal.trim().length > 10
            );
            if (meaningfulGoals.length === 0) {
                warnings.push({
                    id: 'basic-completeness-goals',
                    field: 'goals',
                    message: 'Goals should be detailed and meaningful',
                    value: value.goals,
                    suggestion: 'Provide specific, actionable goals'
                });
            } else {
                completenessScore += 0.5;
            }
        }

        const completenessPercentage = (completenessScore / (totalFields + 1)) * 100;

        const validationTime = Date.now() - startTime;

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            score: Math.max(0, completenessPercentage),
            metadata: {
                templateId: context.templateVariables?.templateId || 'simple-persona-v1',
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
 * Provides a default simple persona response for fallback scenarios
 */
function getDefaultSimplePersona() {
    return {
        id: 'simple-persona-fallback',
        name: 'Persona Générique',
        age: 35,
        occupation: 'Professionnel',
        location: 'France',
        bio: 'Persona générique créée comme solution de secours.',
        quote: 'Je recherche des solutions pratiques et efficaces.',
        demographics: {
            income: '30000-40000€',
            education: 'Études supérieures',
            familyStatus: 'En couple'
        },
        psychographics: {
            personality: ['Pratique', 'Organisé'],
            values: ['Efficacité', 'Qualité'],
            interests: ['Technologie', 'Loisirs', 'Famille'],
            lifestyle: 'Équilibre entre vie professionnelle et personnelle'
        },
        culturalData: {
            music: ['Pop française', 'Variété'],
            brands: ['Marques connues', 'Qualité-prix'],
            restaurants: ['Cuisine traditionnelle', 'Restaurants familiaux'],
            movies: ['Comédie', 'Drame'],
            tv: ['Actualités', 'Divertissement'],
            socialMedia: ['Facebook', 'Instagram']
        },
        painPoints: [
            'Manque de temps pour les loisirs',
            'Difficulté à trouver des produits de qualité'
        ],
        goals: [
            'Améliorer l\'équilibre vie-travail',
            'Trouver des solutions pratiques'
        ],
        marketingInsights: {
            preferredChannels: ['Email', 'Réseaux sociaux'],
            messagingTone: 'Professionnel et accessible',
            buyingBehavior: 'Recherche de valeur et de praticité'
        },
        qualityScore: 75
    };
}