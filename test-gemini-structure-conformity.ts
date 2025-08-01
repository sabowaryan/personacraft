/**
 * Test de conformité de la structure JSON générée par Gemini
 * avec les templates de validation mis à jour
 */

import { GeminiClient } from './src/lib/api/gemini/client';
import { PersonaValidator } from './src/lib/validators/persona-validator';
import { ValidationTemplateEngine } from './src/lib/validation/validation-template-engine';
import { simplePersonaTemplate } from './src/lib/validation/templates/simple-persona-template';
import { standardPersonaTemplate } from './src/lib/validation/templates/standard-persona-template';
import { PersonaType } from './src/types/validation';

async function testGeminiStructureConformity() {
    console.log('🧪 Test de conformité de la structure JSON Gemini\n');

    try {
        // Initialiser le client Gemini
        const geminiClient = new GeminiClient();

        // Test de connexion
        console.log('🔗 Test de connexion Gemini...');
        const isConnected = await geminiClient.testConnection();
        if (!isConnected) {
            console.error('❌ Connexion Gemini échouée');
            return;
        }
        console.log('✅ Connexion Gemini réussie\n');

        // Brief de test
        const testBrief = "Application mobile de fitness pour professionnels urbains actifs âgés de 25-40 ans";

        // Générer des personas avec Gemini
        console.log('🎯 Génération de personas avec Gemini...');
        const personas = await geminiClient.generatePersonas(testBrief, undefined, {
            promptType: 'DEFAULT',
            useLegacyValidation: false
        });

        console.log(`✅ ${personas.length} personas générés\n`);

        // Analyser la structure de chaque persona
        personas.forEach((persona, index) => {
            console.log(`📋 Analyse du Persona ${index + 1}: ${persona.name}`);
            console.log('📊 Structure actuelle:');

            // Vérifier les champs requis par les templates
            const requiredFields = [
                'id', 'name', 'age', 'occupation', 'location',
                'email', 'phone', 'quote', 'demographics',
                'psychographics', 'behavioral', 'professional'
            ];

            const missingFields: string[] = [];
            const presentFields: string[] = [];

            requiredFields.forEach(field => {
                if (persona.hasOwnProperty(field) && persona[field as keyof typeof persona] !== undefined) {
                    presentFields.push(field);
                } else {
                    missingFields.push(field);
                }
            });

            console.log(`   ✅ Champs présents (${presentFields.length}): ${presentFields.join(', ')}`);
            if (missingFields.length > 0) {
                console.log(`   ❌ Champs manquants (${missingFields.length}): ${missingFields.join(', ')}`);
            }

            // Vérifier la structure des sous-objets
            console.log('📋 Analyse des sous-structures:');

            if (persona.demographics) {
                const demoFields = Object.keys(persona.demographics);
                console.log(`   📊 Demographics: ${demoFields.join(', ')}`);
            } else {
                console.log('   ❌ Demographics: manquant');
            }

            if (persona.psychographics) {
                const psychoFields = Object.keys(persona.psychographics);
                console.log(`   🧠 Psychographics: ${psychoFields.join(', ')}`);
            } else {
                console.log('   ❌ Psychographics: manquant');
            }

            // Vérifier les nouveaux champs
            console.log('📋 Nouveaux champs requis:');
            console.log(`   📧 Email: ${persona.email ? '✅ ' + persona.email : '❌ manquant'}`);
            console.log(`   📞 Phone: ${persona.phone ? '✅ ' + persona.phone : '❌ manquant'}`);
            console.log(`   💬 Quote: ${persona.quote ? '✅ "' + persona.quote.substring(0, 50) + '..."' : '❌ manquant'}`);

            console.log('\n');
        });

        // Test avec les templates de validation
        console.log('🔍 Test avec les templates de validation mis à jour\n');

        const validationEngine = new ValidationTemplateEngine();

        // Enregistrer les templates
        validationEngine.registerTemplate(simplePersonaTemplate);
        validationEngine.registerTemplate(standardPersonaTemplate);

        // Créer le contexte de validation
        const validationContext = {
            originalRequest: {
                personaType: PersonaType.SIMPLE,
                culturalData: {},
                demographics: {},
                psychographics: {},
                businessContext: {},
                customFields: {}
            },
            templateVariables: {
                templateId: simplePersonaTemplate.id,
                templateVersion: simplePersonaTemplate.version
            },
            culturalConstraints: {
                music: [],
                brand: [],
                restaurant: [],
                movie: [],
                tv: [],
                book: [],
                travel: [],
                fashion: [],
                beauty: [],
                food: [],
                socialMedia: []
            },
            userSignals: {
                demographics: {
                    ageRange: { min: 25, max: 40 },
                    location: 'Paris, France',
                    occupation: 'Professional'
                },
                interests: ['fitness', 'technology'],
                values: ['efficiency', 'innovation'],
                culturalContext: {
                    language: 'fr' as const,
                    personaCount: 1
                }
            },
            generationAttempt: 1,
            previousErrors: []
        };

        // Test avec le template simple
        console.log('📝 Test avec le template Simple:');
        try {
            const simpleResults = await validationEngine.validateResponse(
                personas[0],
                simplePersonaTemplate.id,
                validationContext
            );
            console.log(`   ✅ Validation réussie - Score: ${simpleResults.score}`);
            if (simpleResults.errors.length > 0) {
                console.log(`   ❌ Erreurs (${simpleResults.errors.length}):`);
                simpleResults.errors.forEach(error => {
                    console.log(`      - ${error.field}: ${error.message}`);
                });
            }
            if (simpleResults.warnings.length > 0) {
                console.log(`   ⚠️  Avertissements (${simpleResults.warnings.length}):`);
                simpleResults.warnings.forEach(warning => {
                    console.log(`      - ${warning.field}: ${warning.message}`);
                });
            }
        } catch (error) {
            console.log(`   ❌ Validation échouée: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }

        // Test avec le template standard
        console.log('\n📝 Test avec le template Standard:');
        try {
            const standardContext = {
                ...validationContext,
                templateVariables: {
                    templateId: standardPersonaTemplate.id,
                    templateVersion: standardPersonaTemplate.version
                }
            };

            const standardResults = await validationEngine.validateResponse(
                personas[0],
                standardPersonaTemplate.id,
                standardContext
            );
            console.log(`   ✅ Validation réussie - Score: ${standardResults.score}`);
            if (standardResults.errors.length > 0) {
                console.log(`   ❌ Erreurs (${standardResults.errors.length}):`);
                standardResults.errors.forEach(error => {
                    console.log(`      - ${error.field}: ${error.message}`);
                });
            }
            if (standardResults.warnings.length > 0) {
                console.log(`   ⚠️  Avertissements (${standardResults.warnings.length}):`);
                standardResults.warnings.forEach(warning => {
                    console.log(`      - ${warning.field}: ${warning.message}`);
                });
            }
        } catch (error) {
            console.log(`   ❌ Validation échouée: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }

        // Recommandations
        console.log('\n💡 Recommandations:');

        const firstPersona = personas[0];
        const recommendations: string[] = [];

        if (!firstPersona.email) {
            recommendations.push('Ajouter le champ email aux prompts Gemini');
        }
        if (!firstPersona.phone) {
            recommendations.push('Ajouter le champ phone aux prompts Gemini');
        }
        if (!firstPersona.quote) {
            recommendations.push('Ajouter le champ quote aux prompts Gemini');
        }
        if (!firstPersona.hasOwnProperty('behavioral')) {
            recommendations.push('Ajouter la section behavioral aux prompts Gemini');
        }
        if (!firstPersona.hasOwnProperty('professional')) {
            recommendations.push('Ajouter la section professional aux prompts Gemini');
        }

        if (recommendations.length === 0) {
            console.log('✅ La structure JSON de Gemini est conforme aux templates mis à jour');
        } else {
            console.log('❌ Modifications nécessaires:');
            recommendations.forEach((rec, index) => {
                console.log(`   ${index + 1}. ${rec}`);
            });
        }

        // Afficher un exemple de structure attendue
        console.log('\n📋 Structure JSON attendue:');
        console.log(JSON.stringify({
            id: "persona_123",
            name: "Marie Dupont",
            age: 32,
            occupation: "Chef de projet digital",
            location: "Paris, France",
            email: "marie.dupont@example.com",
            phone: "+33 6 12 34 56 78",
            quote: "L'efficacité et l'innovation sont mes moteurs quotidiens",
            demographics: {
                income: "45000-55000€",
                education: "Master",
                familyStatus: "En couple"
            },
            psychographics: {
                personality: ["Organisée", "Ambitieuse"],
                values: ["Innovation", "Efficacité"],
                interests: ["Technologie", "Sport"],
                lifestyle: "Urbain actif"
            },
            behavioral: {
                buyingBehavior: "Recherche de qualité",
                decisionMaking: "Analytique",
                communicationStyle: "Direct"
            },
            professional: {
                industry: "Digital",
                experience: "8 ans",
                skills: ["Gestion de projet", "Digital"],
                goals: ["Évolution managériale"]
            },
            culturalData: {
                music: ["Pop", "Électro"],
                brand: ["Apple", "Nike"],
                // ... autres catégories
            },
            painPoints: ["Manque de temps", "Stress"],
            goals: ["Équilibre vie-travail", "Évolution"],
            marketingInsights: {
                preferredChannels: ["Email", "LinkedIn"],
                messagingTone: "Professionnel",
                buyingBehavior: "Recherche de valeur"
            },
            qualityScore: 85
        }, null, 2));

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    }
}

// Exécuter le test
if (require.main === module) {
    testGeminiStructureConformity();
}

export { testGeminiStructureConformity };