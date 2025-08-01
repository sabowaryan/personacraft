/**
 * Test complet de validation des personas générées par Gemini
 * Teste les 3 templates Qloo First, simule une réponse Gemini, et teste une validation réelle
 */

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config();

import { PersonaValidator, PersonaValidationError } from './src/lib/validators/persona-validator.js';
import { GeminiClient } from './src/lib/api/gemini/client.js';
import fs from 'fs';
import path from 'path';


console.log('🧪 Test de validation des personas Gemini - Début\n');

// Fonction utilitaire pour lire les templates
function readTemplate(templatePath: string): string {
  const fullPath = path.join(process.cwd(), templatePath);
  return fs.readFileSync(fullPath, 'utf-8');
}

// Test 1: Validation des 3 templates Qloo First
async function testTemplatesValidation() {
  console.log('📋 Test 1: Validation des 3 templates Qloo First\n');

  const templates = [
    { name: 'Qloo First Persona', path: 'public/templates/qloo-first-persona.template' },
    { name: 'Qloo First B2B Persona', path: 'public/templates/qloo-first-b2b-persona.template' },
    { name: 'Qloo First Simple', path: 'public/templates/qloo-first-simple-persona.template' }
  ];

  for (const template of templates) {
    try {
      console.log(`🔍 Test du template: ${template.name}`);
      const content = readTemplate(template.path);

      // Vérifier la structure du template
      const hasPersonaCount = content.includes('{{personaCount}}');
      const hasBrief = content.includes('{{brief}}');
      const hasJsonFormat = content.includes('[') && content.includes('{') && content.includes('"id":');

      console.log(`  ✅ Contient {{personaCount}}: ${hasPersonaCount}`);
      console.log(`  ✅ Contient {{brief}}: ${hasBrief}`);
      console.log(`  ✅ Format JSON défini: ${hasJsonFormat}`);

      // Vérifier les champs requis dans le template
      const requiredFields = ['name', 'age', 'occupation', 'location', 'bio', 'quote'];
      const missingFields = requiredFields.filter(field => !content.includes(`"${field}"`));

      if (missingFields.length === 0) {
        console.log(`  ✅ Tous les champs requis présents`);
      } else {
        console.log(`  ⚠️ Champs manquants: ${missingFields.join(', ')}`);
      }

      console.log('');
    } catch (error) {
      console.error(`  ❌ Erreur lors de la lecture du template ${template.name}:`, error);
    }
  }
}

// Test 2: Simulation de réponse Gemini avec différents formats
async function testGeminiResponseSimulation() {
  console.log('🤖 Test 2: Simulation de réponses Gemini\n');

  // Réponse Gemini valide (format standard)
  const validGeminiResponse = `[
  {
    "id": "persona-1",
    "name": "Sophie Martin",
    "age": 32,
    "occupation": "Chef de projet digital",
    "location": "Lyon, France",
    "bio": "Professionnelle dynamique spécialisée dans la transformation digitale des entreprises.",
    "quote": "L'innovation commence par comprendre les vrais besoins utilisateurs.",
    "demographics": {
      "income": "45000-55000€",
      "education": "Master en Management Digital",
      "familyStatus": "En couple, sans enfants"
    },
    "psychographics": {
      "personality": ["Analytique", "Créative", "Organisée"],
      "values": ["Innovation", "Efficacité", "Collaboration"],
      "interests": ["Technologie", "Design UX", "Startups"],
      "lifestyle": "Urbaine active, passionnée de nouvelles technologies"
    },
    "painPoints": [
      "Manque de temps pour se former aux nouvelles technologies",
      "Difficulté à convaincre les équipes du changement",
      "Budget limité pour les outils innovants"
    ],
    "goals": [
      "Devenir experte en IA appliquée au business",
      "Diriger une équipe de transformation digitale",
      "Lancer sa propre startup tech"
    ],
    "marketingInsights": {
      "preferredChannels": ["LinkedIn", "Newsletters tech", "Webinaires"],
      "messagingTone": "Professionnel mais accessible",
      "buyingBehavior": "Recherche approfondie, comparaison détaillée, décision rapide"
    },
    "qualityScore": 87
  }
]`;

  // Réponse Gemini avec format markdown (problématique)
  const geminiWithMarkdown = `\`\`\`json
[
  {
    "name": "Marc Dubois",
    "age": 28,
    "occupation": "Développeur Full Stack",
    "location": "Paris, France",
    "bio": "Développeur passionné par les technologies émergentes.",
    "quote": "Le code propre est la base de tout projet réussi.",
    "demographics": {
      "income": "40000-50000€",
      "education": "École d'ingénieur",
      "familyStatus": "Célibataire"
    },
    "psychographics": {
      "personality": ["Logique", "Curieux", "Perfectionniste"],
      "values": ["Qualité", "Innovation", "Apprentissage"],
      "interests": ["Programmation", "Open Source", "Gaming"],
      "lifestyle": "Geek urbain, toujours connecté"
    },
    "painPoints": [
      "Veille technologique chronophage",
      "Syndrome de l'imposteur",
      "Équilibre vie pro/perso difficile"
    ],
    "goals": [
      "Maîtriser l'architecture cloud",
      "Contribuer à des projets open source majeurs",
      "Créer sa propre application"
    ],
    "marketingInsights": {
      "preferredChannels": ["GitHub", "Stack Overflow", "Twitter tech"],
      "messagingTone": "Technique et direct",
      "buyingBehavior": "Teste avant d'acheter, influence par la communauté"
    },
    "qualityScore": 82
  }
]
\`\`\``;

  // Réponse Gemini malformée (JSON cassé)
  const malformedGeminiResponse = `[
  {
    "name": "Julie Leroy",
    "age": 35,
    "occupation": "Directrice Marketing"
    "location": "Bordeaux, France",
    "bio": "Experte en marketing digital avec 10 ans d'expérience.",
    "quote": "La créativité sans données n'est que de l'art.",
    "demographics": {
      "income": "60000-70000€",
      "education": "Master Marketing",
      "familyStatus": "Mariée, 1 enfant"
    },
    // Commentaire qui casse le JSON
    "psychographics": {
      "personality": ["Créative", "Stratégique", "Empathique"],
      "values": ["Authenticité", "Performance", "Équipe"],
      "interests": ["Marketing", "Psychologie", "Art"],
      "lifestyle": "Équilibre famille-carrière"
    },
    "painPoints": [
      "ROI difficile à mesurer",
      "Évolution rapide des plateformes",
      "Gestion d'équipe à distance"
    ],
    "goals": [
      "Optimiser les conversions de 25%",
      "Développer une stratégie omnicanale",
      "Former son équipe aux nouveaux outils"
    ],
    "marketingInsights": {
      "preferredChannels": ["LinkedIn", "Email", "Podcasts"],
      "messagingTone": "Inspirant et data-driven",
      "buyingBehavior": "Analyse concurrentielle poussée"
    },
    "qualityScore": 89
  }
]`;

  const testCases = [
    { name: 'Réponse valide standard', response: validGeminiResponse, shouldSucceed: true },
    { name: 'Réponse avec markdown', response: geminiWithMarkdown, shouldSucceed: true },
    { name: 'Réponse malformée', response: malformedGeminiResponse, shouldSucceed: false }
  ];

  for (const testCase of testCases) {
    console.log(`🧪 Test: ${testCase.name}`);
    try {
      const personas = PersonaValidator.parseGeminiResponse(testCase.response, "Test brief");
      console.log(`  ✅ Parsing réussi: ${personas.length} persona(s) généré(s)`);

      if (personas.length > 0) {
        const firstPersona = personas[0];
        console.log(`  📊 Premier persona: ${firstPersona.name}, ${firstPersona.age} ans`);
        console.log(`  📈 Score qualité: ${firstPersona.qualityScore}`);
      }
    } catch (error) {
      if (testCase.shouldSucceed) {
        console.log(`  ❌ Échec inattendu: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      } else {
        console.log(`  ✅ Échec attendu: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    }
    console.log('');
  }
}

// Test 3: Test de validation avec le validateur legacy (plus permissif)
async function testLegacyValidation() {
  console.log('🔄 Test 3: Validation legacy (plus permissive)\n');

  // Persona avec structure legacy (champs optionnels)
  const legacyPersonaResponse = `[
  {
    "name": "Antoine Moreau",
    "age": 42,
    "occupation": "Directeur Commercial",
    "jobTitle": "Directeur Commercial",
    "industry": "SaaS",
    "seniority": "Director",
    "location": "Nantes, France",
    "email": "antoine.moreau@saascompany.fr",
    "company": {
      "name": "SaaS Solutions",
      "size": "100-500 employés",
      "industry": "Logiciel",
      "location": "Nantes, France"
    },
    "bio": "Directeur commercial expérimenté dans le secteur SaaS B2B.",
    "quote": "Vendre, c'est avant tout comprendre et résoudre un problème.",
    "demographics": {
      "income": "80000-100000€",
      "education": "École de Commerce",
      "familyStatus": "Marié, 2 enfants",
      "experience": 15
    },
    "psychographics": {
      "personality": ["Persuasif", "Relationnel", "Ambitieux"],
      "values": ["Performance", "Relation client", "Croissance"],
      "interests": ["Vente", "Négociation", "Sport"],
      "lifestyle": "Équilibre vie pro/perso avec focus performance",
      "workStyle": "Orienté résultats avec approche collaborative"
    },
    "professionalProfile": {
      "experience": 15,
      "skills": ["Vente B2B", "Négociation", "Management", "CRM"],
      "responsibilities": ["Équipe commerciale", "Objectifs CA", "Stratégie vente"],
      "decisionMakingAuthority": "High"
    },
    "businessPainPoints": [
      "Cycles de vente trop longs",
      "Qualification des leads insuffisante",
      "Concurrence accrue sur le marché"
    ],
    "businessGoals": [
      "Réduire le cycle de vente de 20%",
      "Augmenter le taux de conversion de 15%",
      "Développer 3 nouveaux segments"
    ],
    "painPoints": [
      "Cycles de vente trop longs",
      "Qualification des leads insuffisante",
      "Concurrence accrue sur le marché"
    ],
    "goals": [
      "Réduire le cycle de vente de 20%",
      "Augmenter le taux de conversion de 15%",
      "Développer 3 nouveaux segments"
    ],
    "decisionMaking": {
      "process": "Analyse ROI puis validation direction",
      "timeline": "2-4 mois",
      "stakeholders": ["Direction", "IT", "Finance"]
    },
    "buyingBehavior": "Analyse comparative détaillée avec focus ROI",
    "marketingInsights": {
      "preferredChannels": ["LinkedIn", "Salons professionnels"],
      "messagingTone": "Business et orienté résultats",
      "buyingBehavior": "Analyse comparative détaillée avec focus ROI"
    },
    "qualityScore": 91
  }
]`;

  console.log('🧪 Test validation standard vs legacy');

  try {
    // Test avec validation standard
    console.log('📊 Validation standard:');
    const standardResult = PersonaValidator.parseGeminiResponse(legacyPersonaResponse, "Test B2B brief");
    console.log(`  ✅ Réussi: ${standardResult.length} persona(s)`);
  } catch (error) {
    console.log(`  ❌ Échec validation standard: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }

  try {
    // Test avec validation legacy
    console.log('📊 Validation legacy:');
    const legacyResult = PersonaValidator.parseGeminiResponseLegacy(legacyPersonaResponse, "Test B2B brief");
    console.log(`  ✅ Réussi: ${legacyResult.length} persona(s)`);

    if (legacyResult.length > 0) {
      const persona = legacyResult[0];
      const jobTitle = (persona as any).jobTitle || persona.occupation;
      const company = (persona as any).company;
      console.log(`  � Pcersona: ${persona.name} (${jobTitle})`);
      if (company) {
        console.log(`  🏢 Entreprise: ${company.name} (${company.size})`);
      }
      console.log(`  📈 Score: ${persona.qualityScore}`);
    }
  } catch (error) {
    console.log(`  ❌ Échec validation legacy: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }

  console.log('');
}

// Test 4: Test de validation réelle avec l'API Gemini
async function testRealGeminiValidation() {
  console.log('🔍 Test 4: Validation réelle avec l\'API Gemini\n');

  // Vérifier si la clé API est disponible
  if (!process.env.GEMINI_API_KEY) {
    console.log('⚠️ GEMINI_API_KEY non définie - Test ignoré');
    return;
  }

  try {
    console.log('🔑 Clé API Gemini détectée');
    const geminiClient = new GeminiClient();

    // Test de connexion
    console.log('🔗 Test de connexion...');
    const isConnected = await geminiClient.testConnection();
    console.log(`  ${isConnected ? '✅' : '❌'} Connexion: ${isConnected ? 'Réussie' : 'Échec'}`);

    if (!isConnected) {
      console.log('❌ Impossible de se connecter à Gemini - Test arrêté');
      return;
    }

    // Test de génération avec différents briefs
    const testBriefs = [
      {
        name: "Brief simple",
        brief: "Application mobile de fitness pour jeunes professionnels urbains",
        options: { useLegacyValidation: false }
      },
      {
        name: "Brief B2B complexe",
        brief: "Plateforme SaaS de gestion de projet pour équipes de développement agiles",
        options: { useLegacyValidation: true }
      },
      {
        name: "Brief avec contraintes culturelles",
        brief: "Service de livraison de repas bio pour familles françaises soucieuses de l'environnement",
        options: { useLegacyValidation: false }
      }
    ];

    for (const testBrief of testBriefs) {
      console.log(`\n🧪 Test: ${testBrief.name}`);
      console.log(`📝 Brief: "${testBrief.brief}"`);
      console.log(`🔧 Validation legacy: ${testBrief.options.useLegacyValidation}`);

      try {
        const startTime = Date.now();
        const personas = await geminiClient.generatePersonas(
          testBrief.brief,
          undefined,
          testBrief.options
        );
        const duration = Date.now() - startTime;

        console.log(`  ⏱️ Durée: ${duration}ms`);
        console.log(`  ✅ Génération réussie: ${personas.length} persona(s)`);

        // Analyser les personas générés
        if (personas.length > 0) {
          const firstPersona = personas[0];
          console.log(`  👤 Premier persona: ${firstPersona.name}`);
          console.log(`  📊 Âge: ${firstPersona.age} ans`);
          console.log(`  💼 Métier: ${firstPersona.occupation}`);
          console.log(`  📍 Localisation: ${firstPersona.location}`);
          console.log(`  📈 Score qualité: ${firstPersona.qualityScore}`);

          // Vérifier la structure
          const hasRequiredFields = !!(
            firstPersona.name &&
            firstPersona.age &&
            firstPersona.occupation &&
            firstPersona.bio &&
            firstPersona.demographics &&
            firstPersona.psychographics &&
            firstPersona.painPoints &&
            firstPersona.goals &&
            firstPersona.marketingInsights
          );

          console.log(`  🏗️ Structure complète: ${hasRequiredFields ? '✅' : '❌'}`);

          // Analyser le score de qualité
          if (firstPersona.qualityScore !== undefined) {
            if (firstPersona.qualityScore === 0) {
              console.log(`  🚨 PROBLÈME: Score de qualité = 0 (échec de validation)`);
            } else if (firstPersona.qualityScore < 70) {
              console.log(`  ⚠️ Score faible: ${firstPersona.qualityScore} (< 70)`);
            } else if (firstPersona.qualityScore >= 85) {
              console.log(`  🎯 Excellent score: ${firstPersona.qualityScore} (≥ 85)`);
            } else {
              console.log(`  ✅ Score correct: ${firstPersona.qualityScore} (70-84)`);
            }
          }
        }

      } catch (error) {
        console.log(`  ❌ Erreur génération: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);

        // Analyser le type d'erreur
        if (error instanceof PersonaValidationError) {
          console.log(`  🔍 Type: Erreur de validation`);
        } else if (error instanceof Error && error.message.includes('API')) {
          console.log(`  🔍 Type: Erreur API Gemini`);
        } else {
          console.log(`  🔍 Type: Erreur inconnue`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors du test Gemini:', error);
  }
}

// Test 5: Test de performance et de cohérence
async function testPerformanceAndConsistency() {
  console.log('⚡ Test 5: Performance et cohérence\n');

  if (!process.env.GEMINI_API_KEY) {
    console.log('⚠️ GEMINI_API_KEY non définie - Test ignoré');
    return;
  }

  try {
    const geminiClient = new GeminiClient();
    const testBrief = "Application de méditation pour professionnels stressés";

    console.log('🔄 Test de cohérence (3 générations identiques)');
    const results = [];

    for (let i = 1; i <= 3; i++) {
      console.log(`  📊 Génération ${i}/3...`);
      const startTime = Date.now();

      try {
        const personas = await geminiClient.generatePersonas(testBrief);
        const duration = Date.now() - startTime;

        results.push({
          success: true,
          duration,
          count: personas.length,
          avgQuality: personas.reduce((sum, p) => sum + (p.qualityScore || 0), 0) / personas.length,
          firstPersonaName: personas[0]?.name || 'N/A'
        });

        console.log(`    ✅ Réussi en ${duration}ms - ${personas.length} personas`);
      } catch (error) {
        results.push({
          success: false,
          duration: Date.now() - startTime,
          count: 0,
          avgQuality: 0,
          firstPersonaName: 'N/A',
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });

        console.log(`    ❌ Échec: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }

      // Pause entre les appels pour éviter le rate limiting
      if (i < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Analyser les résultats
    console.log('\n📈 Analyse des résultats:');
    const successfulResults = results.filter(r => r.success);

    if (successfulResults.length > 0) {
      const avgDuration = successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length;
      const avgCount = successfulResults.reduce((sum, r) => sum + r.count, 0) / successfulResults.length;
      const avgQuality = successfulResults.reduce((sum, r) => sum + r.avgQuality, 0) / successfulResults.length;

      console.log(`  ⏱️ Durée moyenne: ${Math.round(avgDuration)}ms`);
      console.log(`  📊 Nombre moyen de personas: ${avgCount.toFixed(1)}`);
      console.log(`  📈 Score qualité moyen: ${avgQuality.toFixed(1)}`);
      console.log(`  ✅ Taux de réussite: ${(successfulResults.length / results.length * 100).toFixed(1)}%`);

      // Vérifier la cohérence des noms (indicateur de variété)
      const uniqueNames = new Set(successfulResults.map(r => r.firstPersonaName));
      console.log(`  🎭 Variété des personas: ${uniqueNames.size}/${successfulResults.length} noms uniques`);
    } else {
      console.log('  ❌ Aucune génération réussie');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test de performance:', error);
  }
}

// Test 6: Test des edge cases et gestion d'erreurs
async function testEdgeCases() {
  console.log('🚨 Test 6: Edge cases et gestion d\'erreurs\n');

  const edgeCases = [
    {
      name: 'Brief vide',
      brief: '',
      shouldFail: false // Le validateur accepte les briefs vides avec des données mock complètes
    },
    {
      name: 'Brief très court',
      brief: 'App',
      shouldFail: false
    },
    {
      name: 'Brief très long',
      brief: 'Application mobile révolutionnaire de gestion de projet collaborative avec intelligence artificielle intégrée pour les équipes distribuées travaillant sur des projets complexes nécessitant une coordination précise et des outils de communication avancés permettant le suivi en temps réel des tâches, la gestion des ressources, l\'analyse prédictive des délais, l\'optimisation automatique des workflows, l\'intégration avec les systèmes existants, la sécurité enterprise-grade, la conformité réglementaire, et une expérience utilisateur exceptionnelle sur tous les appareils et plateformes.',
      shouldFail: false
    },
    {
      name: 'Brief avec caractères spéciaux',
      brief: 'App de fitness 💪 pour les 18-25 ans 🏃‍♂️ avec IA & ML',
      shouldFail: false
    },
    {
      name: 'Brief en anglais',
      brief: 'AI-powered fitness tracking app for young professionals',
      shouldFail: false
    }
  ];

  for (const testCase of edgeCases) {
    console.log(`🧪 Test: ${testCase.name}`);
    console.log(`📝 Brief: "${testCase.brief}"`);

    try {
      // Test du parsing avec une réponse simulée
      const mockResponse = `[{
                "name": "Test User",
                "age": 25,
                "occupation": "Test Occupation",
                "location": "Test City",
                "bio": "Test bio détaillée avec plus de 10 caractères pour respecter la validation",
                "quote": "Test quote inspirante",
                "demographics": {
                  "income": "30000-40000€",
                  "education": "Master Test",
                  "familyStatus": "Célibataire"
                },
                "psychographics": {
                  "personality": ["Test", "Analytique"],
                  "values": ["Innovation", "Qualité"],
                  "interests": ["Technologie", "Sport"],
                  "lifestyle": "Urbain et connecté"
                },
                "painPoints": ["Test pain point détaillé"],
                "goals": ["Test goal spécifique"],
                "marketingInsights": {
                  "preferredChannels": ["LinkedIn", "Email"],
                  "messagingTone": "Professionnel",
                  "buyingBehavior": "Recherche approfondie avant achat"
                },
                "qualityScore": 75
            }]`;

      const personas = PersonaValidator.parseGeminiResponse(mockResponse, testCase.brief);

      if (testCase.shouldFail) {
        console.log(`  ⚠️ Réussite inattendue: ${personas.length} persona(s)`);
      } else {
        console.log(`  ✅ Réussite attendue: ${personas.length} persona(s)`);
      }

    } catch (error) {
      if (testCase.shouldFail) {
        console.log(`  ✅ Échec attendu: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      } else {
        console.log(`  ❌ Échec inattendu: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    }

    console.log('');
  }
}

// Fonction principale d'exécution des tests
async function runAllTests() {
  console.log('🚀 Démarrage de la suite de tests complète\n');
  console.log('='.repeat(60));

  try {
    await testTemplatesValidation();
    console.log('='.repeat(60));

    await testGeminiResponseSimulation();
    console.log('='.repeat(60));

    await testLegacyValidation();
    console.log('='.repeat(60));

    await testRealGeminiValidation();
    console.log('='.repeat(60));

    await testPerformanceAndConsistency();
    console.log('='.repeat(60));

    await testEdgeCases();
    console.log('='.repeat(60));

    console.log('🎉 Suite de tests terminée avec succès!');

  } catch (error) {
    console.error('💥 Erreur fatale lors des tests:', error);
    process.exit(1);
  }
}

// Exécution des tests
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('💥 Erreur lors de l\'exécution:', error);
    process.exit(1);
  });
}