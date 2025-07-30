/**
 * Exemple d'utilisation du TemplateRegistry
 * 
 * Ce fichier montre comment utiliser le TemplateRegistry pour gérer
 * les templates de validation des réponses LLM.
 */

import { 
    TemplateRegistry,
    templateRegistry 
} from './template-registry';
import { 
    ValidationTemplate, 
    PersonaType, 
    ValidationRule,
    ValidationRuleType,
    ValidationSeverity,
    FallbackStrategyType,
    ValidationContext,
    ValidationResult 
} from '../../types/validation';

// Exemple de validateur personnalisé
const validateRequiredFields = (requiredFields: string[]) => {
    return (value: any, context: ValidationContext): ValidationResult => {
        const errors = [];
        const missingFields = requiredFields.filter(field => !value[field]);
        
        if (missingFields.length > 0) {
            errors.push({
                id: 'missing-required-fields',
                type: 'REQUIRED_FIELD_MISSING' as any,
                field: 'root',
                message: `Missing required fields: ${missingFields.join(', ')}`,
                severity: ValidationSeverity.ERROR,
                value: missingFields
            });
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings: [],
            score: errors.length === 0 ? 100 : 0,
            metadata: {
                templateId: context.templateVariables?.templateId || 'unknown',
                templateVersion: '1.0.0',
                validationTime: Date.now(),
                rulesExecuted: 1,
                rulesSkipped: 0,
                timestamp: Date.now()
            }
        };
    };
};

// Exemple de création d'un template de validation
export function createExampleTemplate(): ValidationTemplate {
    const requiredFieldsRule: ValidationRule = {
        id: 'required-fields-check',
        type: ValidationRuleType.STRUCTURE,
        field: 'root',
        validator: validateRequiredFields(['id', 'name', 'age', 'occupation']),
        severity: ValidationSeverity.ERROR,
        message: 'All required fields must be present',
        required: true,
        priority: 1
    };

    const ageValidationRule: ValidationRule = {
        id: 'age-range-check',
        type: ValidationRuleType.CONTENT,
        field: 'age',
        validator: (value: any) => ({
            isValid: typeof value === 'number' && value >= 18 && value <= 80,
            errors: typeof value !== 'number' || value < 18 || value > 80 ? [{
                id: 'invalid-age',
                type: 'VALUE_OUT_OF_RANGE' as any,
                field: 'age',
                message: 'Age must be a number between 18 and 80',
                severity: ValidationSeverity.ERROR,
                value,
                expectedValue: 'number between 18 and 80'
            }] : [],
            warnings: [],
            score: (typeof value === 'number' && value >= 18 && value <= 80) ? 100 : 0,
            metadata: {
                templateId: 'example-template',
                templateVersion: '1.0.0',
                validationTime: Date.now(),
                rulesExecuted: 1,
                rulesSkipped: 0,
                timestamp: Date.now()
            }
        }),
        severity: ValidationSeverity.ERROR,
        message: 'Age must be between 18 and 80',
        required: true,
        priority: 2
    };

    return {
        id: 'example-standard-persona-template',
        name: 'Example Standard Persona Template',
        version: '1.0.0',
        personaType: PersonaType.STANDARD,
        rules: [requiredFieldsRule, ageValidationRule],
        fallbackStrategy: {
            type: FallbackStrategyType.REGENERATE,
            maxRetries: 3,
            fallbackTemplate: 'simple-persona-template',
            retryDelay: 1000,
            backoffMultiplier: 2
        },
        metadata: {
            createdAt: Date.now(),
            updatedAt: Date.now(),
            author: 'example-author',
            description: 'Template d\'exemple pour la validation des personas standard',
            tags: ['example', 'standard', 'persona'],
            isActive: true,
            supportedLLMs: ['gpt-4', 'claude-3', 'gemini-pro']
        }
    };
}

// Exemple d'utilisation du registry
export function demonstrateTemplateRegistry() {
    console.log('=== Démonstration du TemplateRegistry ===\n');

    // 1. Créer et enregistrer un template
    const exampleTemplate = createExampleTemplate();
    console.log('1. Enregistrement d\'un template...');
    templateRegistry.register(exampleTemplate);
    console.log(`✓ Template '${exampleTemplate.id}' enregistré avec succès\n`);

    // 2. Récupérer un template par ID
    console.log('2. Récupération du template par ID...');
    const retrievedTemplate = templateRegistry.get(exampleTemplate.id);
    console.log(`✓ Template récupéré: ${retrievedTemplate?.name}\n`);

    // 3. Lister tous les templates
    console.log('3. Liste de tous les templates...');
    const allTemplates = templateRegistry.list();
    console.log(`✓ Nombre total de templates: ${allTemplates.length}`);
    allTemplates.forEach(template => {
        console.log(`  - ${template.name} (${template.personaType})`);
    });
    console.log();

    // 4. Rechercher des templates par type de persona
    console.log('4. Recherche par type de persona...');
    const standardTemplates = templateRegistry.getByPersonaType(PersonaType.STANDARD);
    console.log(`✓ Templates pour personas STANDARD: ${standardTemplates.length}`);
    console.log();

    // 5. Recherche avancée avec critères
    console.log('5. Recherche avancée...');
    const searchResults = templateRegistry.search({
        personaType: PersonaType.STANDARD,
        isActive: true,
        tags: ['example']
    });
    console.log(`✓ Résultats de recherche: ${searchResults.length} templates trouvés`);
    console.log();

    // 6. Métriques du registry
    console.log('6. Métriques du registry...');
    const metrics = templateRegistry.getMetrics();
    console.log(`✓ Total templates: ${metrics.totalTemplates}`);
    console.log(`✓ Taille du cache: ${metrics.cacheSize}`);
    console.log(`✓ Cache hits: ${metrics.cacheHits}`);
    console.log(`✓ Cache misses: ${metrics.cacheMisses}`);
    console.log();

    // 7. Mise à jour d'un template
    console.log('7. Mise à jour du template...');
    const updatedTemplate = {
        ...exampleTemplate,
        name: 'Updated Example Template',
        metadata: {
            ...exampleTemplate.metadata,
            description: 'Template d\'exemple mis à jour'
        }
    };
    templateRegistry.update(exampleTemplate.id, updatedTemplate);
    console.log('✓ Template mis à jour avec succès\n');

    // 8. Configuration du cache
    console.log('8. Configuration du cache...');
    const config = templateRegistry.getConfig();
    console.log(`✓ Cache activé: ${config.cacheEnabled}`);
    console.log(`✓ TTL du cache: ${config.cacheTTL}ms`);
    console.log(`✓ Taille max du cache: ${config.maxCacheSize}`);
    console.log();

    console.log('=== Démonstration terminée ===');
}

// Exemple d'utilisation avec configuration personnalisée
export function demonstrateCustomConfiguration() {
    console.log('=== Configuration personnalisée ===\n');

    // Créer un registry avec configuration personnalisée
    const customRegistry = new TemplateRegistry({
        cacheEnabled: true,
        cacheTTL: 10 * 60 * 1000, // 10 minutes
        maxCacheSize: 50,
        persistenceEnabled: false
    });

    console.log('✓ Registry créé avec configuration personnalisée');
    console.log(`  - Cache TTL: ${customRegistry.getConfig().cacheTTL}ms`);
    console.log(`  - Taille max cache: ${customRegistry.getConfig().maxCacheSize}`);
    console.log();

    // Enregistrer quelques templates
    const template1 = createExampleTemplate();
    template1.id = 'custom-template-1';
    template1.name = 'Custom Template 1';

    const template2 = { ...template1 };
    template2.id = 'custom-template-2';
    template2.name = 'Custom Template 2';
    template2.personaType = PersonaType.B2B;

    customRegistry.register(template1);
    customRegistry.register(template2);

    console.log('✓ Templates enregistrés dans le registry personnalisé');
    console.log(`  - Total: ${customRegistry.getMetrics().totalTemplates}`);
    console.log();

    // Test de performance du cache
    console.log('Test de performance du cache...');
    const startTime = Date.now();
    
    // Accès multiples pour tester le cache
    for (let i = 0; i < 100; i++) {
        customRegistry.get('custom-template-1');
        customRegistry.get('custom-template-2');
    }
    
    const endTime = Date.now();
    const metrics = customRegistry.getMetrics();
    
    console.log(`✓ 200 accès effectués en ${endTime - startTime}ms`);
    console.log(`  - Cache hits: ${metrics.cacheHits}`);
    console.log(`  - Cache misses: ${metrics.cacheMisses}`);
    console.log(`  - Ratio de cache hit: ${((metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100).toFixed(2)}%`);
    console.log();

    console.log('=== Configuration personnalisée terminée ===');
}

// Exporter les fonctions pour utilisation dans d'autres modules
export { templateRegistry };

// Exemple d'exécution (décommentez pour tester)
// demonstrateTemplateRegistry();
// demonstrateCustomConfiguration();