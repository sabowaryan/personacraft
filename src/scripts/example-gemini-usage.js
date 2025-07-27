/**
 * Exemple d'utilisation du client Gemini avec le système de prompts
 * Usage: node src/scripts/example-gemini-usage.js
 */

// Note: Ce script nécessite une clé API Gemini valide dans .env

const { GeminiClient } = require('../lib/api/gemini.ts');

async function exempleUtilisation() {
  console.log('🤖 Exemple d\'utilisation du client Gemini avec prompts\n');

  try {
    // Initialisation du client avec le prompt par défaut
    const client = new GeminiClient('DEFAULT');
    
    console.log('📋 Types de prompts disponibles:');
    const availableTypes = client.getAvailablePromptTypes();
    console.log(availableTypes.join(', '));
    console.log('');

    // Test de connexion
    console.log('🔗 Test de connexion...');
    const isConnected = await client.testConnection();
    console.log(isConnected ? '✅ Connexion réussie' : '❌ Connexion échouée');
    
    if (!isConnected) {
      console.log('⚠️ Vérifiez votre clé API GEMINI_API_KEY dans le fichier .env');
      return;
    }
    console.log('');

    // Exemple 1: Génération avec le prompt par défaut
    console.log('🎯 Génération avec le prompt par défaut:');
    const brief1 = "Application mobile de méditation pour cadres stressés";
    
    const personas1 = await client.generatePersonas(brief1);
    console.log(`✅ ${personas1.length} personas générés pour: "${brief1}"`);
    console.log('Premier persona:', personas1[0]?.name, '-', personas1[0]?.occupation);
    console.log('');

    // Exemple 2: Génération avec prompt B2B
    console.log('🏢 Génération avec le prompt B2B:');
    const brief2 = "Plateforme SaaS de gestion des ressources humaines";
    
    const personas2 = await client.generatePersonas(brief2, {
      promptType: 'B2B'
    });
    console.log(`✅ ${personas2.length} personas B2B générés pour: "${brief2}"`);
    console.log('Premier persona B2B:', personas2[0]?.name, '-', personas2[0]?.occupation);
    console.log('');

    // Exemple 3: Génération avec variables personnalisées
    console.log('⚙️ Génération avec variables personnalisées:');
    const brief3 = "Service de livraison de repas healthy";
    
    const personas3 = await client.generatePersonas(brief3, {
      promptType: 'SIMPLE',
      variables: {
        personaCount: 3,
        minAge: 20,
        maxAge: 35,
        personalityTraitCount: 4
      }
    });
    console.log(`✅ ${personas3.length} personas générés avec variables personnalisées`);
    console.log('Ages des personas:', personas3.map(p => p.age).join(', '));
    console.log('');

    // Exemple 4: Changement du prompt par défaut
    console.log('🔄 Changement du prompt par défaut:');
    console.log('Prompt actuel:', client.getDefaultPromptType());
    client.setDefaultPromptType('B2B');
    console.log('Nouveau prompt par défaut:', client.getDefaultPromptType());
    console.log('');

    // Exemple 5: Génération d'un prompt de test
    console.log('🧪 Génération d\'un prompt de test:');
    const testPrompt = client.generateTestPrompt('SIMPLE');
    console.log('Longueur du prompt de test:', testPrompt.length, 'caractères');
    console.log('Extrait:', testPrompt.substring(0, 150) + '...');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Exécution si le script est appelé directement
if (require.main === module) {
  exempleUtilisation();
}

module.exports = { exempleUtilisation };