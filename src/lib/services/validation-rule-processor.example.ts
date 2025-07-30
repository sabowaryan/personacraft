/**
 * Exemple d'utilisation du ValidationRuleProcessor
 * 
 * Ce fichier montre comment utiliser le ValidationRuleProcessor
 * pour exécuter des règles de validation avec parallélisation
 * et gestion des dépendances.
 */

import { ValidationRuleProcessor } from './validation-rule-processor';
import {
    ValidationRule,
    ValidationContext,
    ValidationRuleType,
    ValidationSeverity,
    PersonaType,
    ValidationErrorType
} from '../../types/validation';

// Exemple de contexte de validation
const exampleContext: ValidationContext = {
    originalRequest: {
        personaType: PersonaType.STANDARD,
        culturalData: { country: 'US', language: 'en' },
        demographics: { ageRange: '25-35' },
        psychographics: { interests: ['technology', 'travel'] }
    },
    templateVariables: { strict: true },
    culturalConstraints: {
        music: ['pop', 'rock'],
        brands: ['Nike', 'Apple'],
        restaurants: ['Starbucks', 'McDonalds'],
        movies: ['Marvel', 'Disney'],
        tv: ['Netflix', 'HBO'],
        books: ['Fiction', 'Non-fiction'],
        travel: ['Europe', 'Asia'],
        fashion: ['Casual', 'Business'],
        beauty: ['Skincare', 'Makeup'],
        food: ['Italian', 'Asian'],
        socialMedia: ['Instagram', 'TikTok']
    },
    userSignals: {
        demographics: {
            ageRange: { min: 25, max: 35 },
            location: 'New York',
            occupation: 'Software Engineer'
        },
        interests: ['technology', 'travel'],
        values: ['innovation', 'sustainability'],
        culturalContext: {
            language: 'en',
            personaCount: 1
        }
    },
    generationAttempt: 1,
    previousErrors: []
};

// Exemple de données à valider
const examplePersonaData = {
    id: 'persona-123',
    name: 'John Doe',
    age: 28,
    email: 'john.doe@example.com',
    occupation: 'Software Engineer',
    culturalData: {
        country: 'US',
        language: 'en',
        traditions: ['thanksgiving', 'independence_day']
    },
    demographics: {
        ageRange: '25-35',
        income: '$75,000-$100,000',
        education: 'Bachelor\'s Degree'
    }
};

// Exemples de validateurs
const validateRequiredFields = (data: any) => {
    const requiredFields = ['id', 'name', 'age', 'email'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    return {
        isValid: missingFields.length === 0,
        errors: missingFields.map(field => ({
            id: `missing-${field}`,
            type: ValidationErrorType.REQUIRED_FIELD_MISSING,
            field,
            message: `Required field '${field}' is missing`,
            severity: ValidationSeverity.ERROR
        })),
        warnings: [],
        score: missingFields.length === 0 ? 1.0 : 0.0,
        metadata: {
            templateId: 'example',
            templateVersion: '1.0.0',
            validationTime: 0,
            rulesExecuted: 1,
            rulesSkipped: 0,
            timestamp: Date.now()
        }
    };
};

const validateAgeRange = (data: any) => {
    const age = data.age;
    const isValid = age >= 18 && age <= 80;
    
    return {
        isValid,
        errors: isValid ? [] : [{
            id: 'invalid-age',
            type: ValidationErrorType.VALUE_OUT_OF_RANGE,
            field: 'age',
            message: `Age ${age} is not in valid range (18-80)`,
            severity: ValidationSeverity.ERROR,
            value: age,
            expectedValue: '18-80'
        }],
        warnings: [],
        score: isValid ? 1.0 : 0.0,
        metadata: {
            templateId: 'example',
            templateVersion: '1.0.0',
            validationTime: 0,
            rulesExecuted: 1,
            rulesSkipped: 0,
            timestamp: Date.now()
        }
    };
};

const validateEmailFormat = (data: any) => {
    const email = data.email;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    
    return {
        isValid,
        errors: isValid ? [] : [{
            id: 'invalid-email',
            type: ValidationErrorType.FORMAT_INVALID,
            field: 'email',
            message: `Email '${email}' has invalid format`,
            severity: ValidationSeverity.ERROR,
            value: email
        }],
        warnings: [],
        score: isValid ? 1.0 : 0.0,
        metadata: {
            templateId: 'example',
            templateVersion: '1.0.0',
            validationTime: 0,
            rulesExecuted: 1,
            rulesSkipped: 0,
            timestamp: Date.now()
        }
    };
};

const validateCulturalConsistency = (data: any) => {
    const culturalData = data.culturalData;
    if (!culturalData) {
        return {
            isValid: false,
            errors: [{
                id: 'missing-cultural-data',
                type: ValidationErrorType.REQUIRED_FIELD_MISSING,
                field: 'culturalData',
                message: 'Cultural data is required',
                severity: ValidationSeverity.ERROR
            }],
            warnings: [],
            score: 0.0,
            metadata: {
                templateId: 'example',
                templateVersion: '1.0.0',
                validationTime: 0,
                rulesExecuted: 1,
                rulesSkipped: 0,
                timestamp: Date.now()
            }
        };
    }

    // Vérifier la cohérence entre pays et traditions
    const country = culturalData.country;
    const traditions = culturalData.traditions || [];
    
    const warnings = [];
    if (country === 'US' && !traditions.includes('independence_day')) {
        warnings.push({
            id: 'missing-tradition',
            field: 'culturalData.traditions',
            message: 'US personas typically include Independence Day tradition',
            suggestion: 'Consider adding "independence_day" to traditions'
        });
    }

    return {
        isValid: true,
        errors: [],
        warnings,
        score: warnings.length === 0 ? 1.0 : 0.8,
        metadata: {
            templateId: 'example',
            templateVersion: '1.0.0',
            validationTime: 0,
            rulesExecuted: 1,
            rulesSkipped: 0,
            timestamp: Date.now()
        }
    };
};

// Définition des règles de validation
const validationRules: ValidationRule[] = [
    {
        id: 'required-fields',
        type: ValidationRuleType.STRUCTURE,
        field: 'root',
        validator: validateRequiredFields,
        severity: ValidationSeverity.ERROR,
        message: 'Validate required fields are present',
        required: true,
        priority: 1 // Haute priorité - doit être exécutée en premier
    },
    {
        id: 'age-validation',
        type: ValidationRuleType.CONTENT,
        field: 'age',
        validator: validateAgeRange,
        severity: ValidationSeverity.ERROR,
        message: 'Validate age is in acceptable range',
        required: true,
        dependencies: ['required-fields'], // Dépend de la validation des champs requis
        priority: 2
    },
    {
        id: 'email-format',
        type: ValidationRuleType.FORMAT,
        field: 'email',
        validator: validateEmailFormat,
        severity: ValidationSeverity.ERROR,
        message: 'Validate email format',
        required: true,
        dependencies: ['required-fields'], // Dépend de la validation des champs requis
        priority: 2
    },
    {
        id: 'cultural-consistency',
        type: ValidationRuleType.BUSINESS,
        field: 'culturalData',
        validator: validateCulturalConsistency,
        severity: ValidationSeverity.WARNING,
        message: 'Validate cultural data consistency',
        required: false,
        priority: 3, // Priorité plus basse
        timeout: 2000 // Timeout personnalisé de 2 secondes
    }
];

/**
 * Exemple d'utilisation basique du ValidationRuleProcessor
 */
export async function basicValidationExample() {
    console.log('=== Exemple d\'utilisation basique ===');
    
    // Créer une instance du processeur avec configuration par défaut
    const processor = new ValidationRuleProcessor();
    
    try {
        // Exécuter toutes les règles de validation
        const result = await processor.processRules(
            validationRules,
            examplePersonaData,
            exampleContext
        );
        
        console.log('Résultat de validation:', {
            isValid: result.isValid,
            score: result.score,
            errorsCount: result.errors.length,
            warningsCount: result.warnings.length,
            executionTime: result.metadata.validationTime,
            rulesExecuted: result.metadata.rulesExecuted,
            rulesSkipped: result.metadata.rulesSkipped
        });
        
        if (result.errors.length > 0) {
            console.log('Erreurs détectées:');
            result.errors.forEach(error => {
                console.log(`- ${error.field}: ${error.message}`);
            });
        }
        
        if (result.warnings.length > 0) {
            console.log('Avertissements:');
            result.warnings.forEach(warning => {
                console.log(`- ${warning.field}: ${warning.message}`);
            });
        }
        
        // Afficher les métriques du processeur
        const metrics = processor.getMetrics();
        console.log('Métriques du processeur:', {
            totalRulesExecuted: metrics.totalRulesExecuted,
            totalExecutionTime: metrics.totalExecutionTime,
            averageRuleExecutionTime: metrics.averageRuleExecutionTime,
            parallelGroupsExecuted: metrics.parallelGroupsExecuted
        });
        
    } catch (error) {
        console.error('Erreur lors de la validation:', error);
    }
}

/**
 * Exemple avec configuration personnalisée
 */
export async function customConfigurationExample() {
    console.log('\n=== Exemple avec configuration personnalisée ===');
    
    // Créer un processeur avec configuration personnalisée
    const processor = new ValidationRuleProcessor({
        maxParallelRules: 2, // Limiter à 2 règles en parallèle
        defaultTimeout: 3000, // Timeout de 3 secondes
        enableParallelization: true,
        skipDependentOnFailure: true,
        collectDetailedMetrics: true
    });
    
    try {
        const result = await processor.processRules(
            validationRules,
            examplePersonaData,
            exampleContext
        );
        
        console.log('Résultat avec configuration personnalisée:', {
            isValid: result.isValid,
            score: result.score,
            executionTime: result.metadata.validationTime
        });
        
        // Afficher les temps d'exécution par règle
        const metrics = processor.getMetrics();
        console.log('Temps d\'exécution par règle:');
        for (const [ruleId, time] of metrics.ruleExecutionTimes.entries()) {
            console.log(`- ${ruleId}: ${time}ms`);
        }
        
    } catch (error) {
        console.error('Erreur lors de la validation:', error);
    }
}

/**
 * Exemple de validation d'une règle individuelle
 */
export async function singleRuleExample() {
    console.log('\n=== Exemple de validation d\'une règle individuelle ===');
    
    const processor = new ValidationRuleProcessor();
    
    // Exécuter une seule règle
    const rule = validationRules.find(r => r.id === 'email-format')!;
    const result = await processor.executeRule(rule, examplePersonaData, exampleContext);
    
    console.log('Résultat de la règle individuelle:', {
        ruleId: result.ruleId,
        success: result.success,
        executionTime: result.executionTime,
        skipped: result.skipped
    });
    
    if (result.result) {
        console.log('Détails de validation:', {
            isValid: result.result.isValid,
            errorsCount: result.result.errors.length,
            score: result.result.score
        });
    }
}

/**
 * Exemple de plan d'exécution
 */
export async function executionPlanExample() {
    console.log('\n=== Exemple de plan d\'exécution ===');
    
    const processor = new ValidationRuleProcessor();
    
    // Créer et afficher le plan d'exécution
    const plan = processor.createExecutionPlan(validationRules);
    
    console.log('Plan d\'exécution:');
    console.log(`Nombre de groupes parallèles: ${plan.parallelGroups.length}`);
    
    plan.parallelGroups.forEach((group, index) => {
        console.log(`Groupe ${index + 1}:`);
        group.forEach(rule => {
            const dependencies = plan.dependencyMap.get(rule.id) || [];
            console.log(`  - ${rule.id} (priorité: ${rule.priority || 100}, dépendances: [${dependencies.join(', ')}])`);
        });
    });
}

// Exécuter tous les exemples si ce fichier est exécuté directement
if (require.main === module) {
    (async () => {
        await basicValidationExample();
        await customConfigurationExample();
        await singleRuleExample();
        await executionPlanExample();
    })();
}