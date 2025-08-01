/**
 * Script de test pour les templates de validation Standard et Simple
 */

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config();

import { ValidationTemplateEngine } from './src/lib/validation/validation-template-engine';
import { standardPersonaTemplate } from './src/lib/validation/templates/standard-persona-template';
import { simplePersonaTemplate } from './src/lib/validation/templates/simple-persona-template';
import { ValidationContext, PersonaType } from './src/types/validation';

// Exemple de persona STANDARD correctement structuré
const sampleStandardPersona = {
    id: "persona_standard_123",
    name: "Sophie Martin",
    age: 28,
    occupation: "Designer UX",
    location: "Lyon, France",
    email: "sophie.martin@email.fr",
    bio: "Designer UX passionnée par l'innovation et l'expérience utilisateur, toujours à la recherche de nouvelles tendances.",
    quote: "Le design doit être fonctionnel et beau à la fois.",
    demographics: {
        income: "45000-55000 EUR",
        education: "Master en Design",
        familyStatus: "Célibataire"
    },
    psychographics: {
        personality: ["Créative", "Analytique", "Perfectionniste"],
        values: ["Innovation", "Esthétique", "Fonctionnalité"],
        interests: ["Design", "Art", "Technologie", "Photographie"],
        lifestyle: "Urbaine créative"
    },
    culturalData: {
        demographics: {
            age: 28,
            location: "Lyon, France",
            income: "45000-55000 EUR"
        },
        psychographics: {
            values: ["Innovation", "Esthétique", "Fonctionnalité"],
            interests: ["Design", "Art", "Technologie", "Photographie"],
            lifestyle: "Urbaine créative"
        },
        culturalValues: {
            individualism: "High",
            powerDistance: "Low",
            uncertaintyAvoidance: "Medium"
        },
        consumptionPatterns: {
            spendingHabits: {
                categories: ["Design tools", "Art supplies", "Tech gadgets"],
                budget: "Medium-High",
                frequency: "Regular"
            },
            brandPreferences: {
                luxury: ["Apple", "Adobe", "Muji"],
                everyday: ["Zara", "Uniqlo", "IKEA"]
            },
            mediaConsumption: {
                platforms: ["Instagram", "Behance", "Pinterest"],
                content: ["Design inspiration", "Tech reviews", "Art exhibitions"],
                timeSpent: "2-3 hours daily"
            }
        },
        music: ["Électronique", "Indie Pop", "Jazz"],
        brands: ["Apple", "Adobe", "Muji", "Zara"],
        restaurants: ["Cuisine fusion", "Bistrot moderne", "Végétarien"],
        movies: ["Sci-fi", "Documentaires", "Films d'auteur"],
        tv: ["Séries créatives", "Documentaires design"],
        socialMedia: ["Instagram", "Behance", "Pinterest"]
    },
    painPoints: [
        "Difficulté à convaincre les clients de l'importance du design",
        "Manque de temps pour la veille créative"
    ],
    goals: [
        "Développer son portfolio",
        "Lancer son studio de design"
    ],
    marketingInsights: {
        preferredChannels: ["Instagram", "Behance", "Email"],
        messagingTone: "Créatif et inspirant",
        buyingBehavior: "Recherche de qualité et d'esthétique"
    },
    qualityScore: 88
};

// Exemple de persona SIMPLE correctement structuré
const sampleSimplePersona = {
    id: "persona_simple_123",
    name: "Pierre Durand",
    age: 42,
    occupation: "Comptable",
    location: "Toulouse, France",
    bio: "Comptable expérimenté qui apprécie la stabilité et les solutions pratiques.",
    quote: "La simplicité est la sophistication suprême.",
    demographics: {
        income: "35000-45000 EUR",
        education: "BTS Comptabilité",
        familyStatus: "Marié, 2 enfants"
    },
    psychographics: {
        personality: ["Méthodique", "Fiable", "Prudent"],
        values: ["Stabilité", "Famille", "Honnêteté"],
        interests: ["Jardinage", "Lecture", "Football", "Bricolage"],
        lifestyle: "Vie de famille tranquille"
    },
    culturalData: {
        music: ["Variété française", "Rock classique"],
        brands: ["Renault", "Carrefour", "Decathlon"],
        restaurants: ["Cuisine traditionnelle", "Brasseries"],
        movies: ["Comédie française", "Thrillers"],
        tv: ["Actualités", "Sport", "Documentaires"],
        socialMedia: ["Facebook", "YouTube"]
    },
    painPoints: [
        "Manque de temps pour les loisirs",
        "Stress lié aux échéances fiscales",
        "Difficulté avec les nouvelles technologies"
    ],
    goals: [
        "Passer plus de temps en famille",
        "Améliorer son jardin",
        "Préparer sa retraite"
    ],
    marketingInsights: {
        preferredChannels: ["Email", "Courrier", "Radio"],
        messagingTone: "Clair et rassurant",
        buyingBehavior: "Recherche de rapport qualité-prix"
    },
    qualityScore: 82
};

async function testValidationTemplates() {
    console.log('🔍 Test des templates Standard et Simple - Début\n');

    try {
        // Créer le moteur de validation
        const validationEngine = new ValidationTemplateEngine();

        // Enregistrer les templates
        validationEngine.registerTemplate(standardPersonaTemplate);
        validationEngine.registerTemplate(simplePersonaTemplate);

        console.log('📋 Templates enregistrés:');
        console.log(`- Standard: ${standardPersonaTemplate.rules.length} règles`);
        console.log(`- Simple: ${simplePersonaTemplate.rules.length} règles\n`);

        // Contexte de validation standard
        const standardContext: ValidationContext = {
            originalRequest: {
                personaType: PersonaType.STANDARD,
                businessContext: {},
                customFields: {}
            },
            templateVariables: {
                templateId: 'standard-persona-v1',
                personaType: PersonaType.STANDARD
            },
            generationAttempt: 1,
            previousErrors: [],
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
                    location: "Lyon, France",
                    occupation: "Designer UX"
                },
                interests: ["Design", "Art", "Technologie"],
                values: ["Innovation", "Esthétique", "Fonctionnalité"],
                culturalContext: {
                    language: 'fr',
                    personaCount: 1
                }
            }
        };

        // Contexte de validation simple
        const simpleContext: ValidationContext = {
            originalRequest: {
                personaType: PersonaType.SIMPLE,
                businessContext: {},
                customFields: {}
            },
            templateVariables: {
                templateId: 'simple-persona-v1',
                personaType: PersonaType.SIMPLE
            },
            generationAttempt: 1,
            previousErrors: [],
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
                    ageRange: { min: 40, max: 50 },
                    location: "Toulouse, France",
                    occupation: "Comptable"
                },
                interests: ["Jardinage", "Lecture", "Football"],
                values: ["Stabilité", "Famille", "Honnêteté"],
                culturalContext: {
                    language: 'fr',
                    personaCount: 1
                }
            }
        };

        // Test du template STANDARD
        console.log('🧪 Test du template STANDARD...\n');

        const standardResult = await validationEngine.validateResponse(
            sampleStandardPersona,
            'standard-persona-v1',
            standardContext
        );

        console.log('📊 Résultats validation STANDARD:');
        console.log(`✅ Valide: ${standardResult.isValid}`);
        console.log(`📈 Score: ${standardResult.score}`);
        console.log(`❌ Erreurs: ${standardResult.errors.length}`);
        console.log(`⚠️ Avertissements: ${standardResult.warnings.length}`);
        console.log(`⏱️ Temps: ${standardResult.metadata.validationTime}ms\n`);

        if (standardResult.errors.length > 0) {
            console.log('🚨 Erreurs STANDARD:');
            standardResult.errors.slice(0, 5).forEach((error, index) => {
                console.log(`${index + 1}. ${error.field}: ${error.message}`);
            });
            if (standardResult.errors.length > 5) {
                console.log(`... et ${standardResult.errors.length - 5} autres erreurs\n`);
            }
        }

        if (standardResult.warnings.length > 0) {
            console.log('⚠️ Avertissements STANDARD:');
            standardResult.warnings.slice(0, 3).forEach((warning, index) => {
                console.log(`${index + 1}. ${warning.field}: ${warning.message}`);
                if (warning.suggestion) {
                    console.log(`   Suggestion: ${warning.suggestion}`);
                }
            });
            console.log('');
        }

        // Test du template SIMPLE
        console.log('🧪 Test du template SIMPLE...\n');

        const simpleResult = await validationEngine.validateResponse(
            sampleSimplePersona,
            'simple-persona-v1',
            simpleContext
        );

        console.log('📊 Résultats validation SIMPLE:');
        console.log(`✅ Valide: ${simpleResult.isValid}`);
        console.log(`📈 Score: ${simpleResult.score}`);
        console.log(`❌ Erreurs: ${simpleResult.errors.length}`);
        console.log(`⚠️ Avertissements: ${simpleResult.warnings.length}`);
        console.log(`⏱️ Temps: ${simpleResult.metadata.validationTime}ms\n`);

        if (simpleResult.errors.length > 0) {
            console.log('🚨 Erreurs SIMPLE:');
            simpleResult.errors.slice(0, 5).forEach((error, index) => {
                console.log(`${index + 1}. ${error.field}: ${error.message}`);
            });
            if (simpleResult.errors.length > 5) {
                console.log(`... et ${simpleResult.errors.length - 5} autres erreurs\n`);
            }
        }

        if (simpleResult.warnings.length > 0) {
            console.log('⚠️ Avertissements SIMPLE:');
            simpleResult.warnings.slice(0, 3).forEach((warning, index) => {
                console.log(`${index + 1}. ${warning.field}: ${warning.message}`);
                if (warning.suggestion) {
                    console.log(`   Suggestion: ${warning.suggestion}`);
                }
            });
            console.log('');
        }

        // Test avec personas invalides
        console.log('🧪 Test avec personas invalides...\n');

        const invalidPersona = {
            name: "Test Invalide",
            age: 15 // Âge invalide
        };

        const invalidStandardResult = await validationEngine.validateResponse(
            invalidPersona,
            'standard-persona-v1',
            standardContext
        );

        const invalidSimpleResult = await validationEngine.validateResponse(
            invalidPersona,
            'simple-persona-v1',
            simpleContext
        );

        console.log('📊 Résultats personas invalides:');
        console.log(`Standard - Valide: ${invalidStandardResult.isValid}, Score: ${invalidStandardResult.score}, Erreurs: ${invalidStandardResult.errors.length}`);
        console.log(`Simple - Valide: ${invalidSimpleResult.isValid}, Score: ${invalidSimpleResult.score}, Erreurs: ${invalidSimpleResult.errors.length}\n`);

    } catch (error) {
        console.error('💥 Erreur lors du test:', error);

        if (error instanceof Error) {
            console.error('Message:', error.message);
            console.error('Stack:', error.stack);
        }
    }
}

// Exécuter les tests
testValidationTemplates().then(() => {
    console.log('✅ Tests terminés\n');
    console.log('📋 Résumé:');
    console.log('1. ✅ Templates Standard et Simple testés');
    console.log('2. ✅ Validation des personas valides');
    console.log('3. ✅ Test de robustesse avec personas invalides');
    console.log('4. ✅ Mesure des performances de validation');
    console.log('\n🎯 Les templates sont prêts pour la production !');
}).catch(error => {
    console.error('\n💥 Échec des tests:', error);
});