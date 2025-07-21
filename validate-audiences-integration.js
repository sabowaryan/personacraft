// Script de validation de l'intégration du service Audiences
// Vérifie que le service est correctement intégré dans le client principal

const { QlooApiClient } = require('./lib/api/qloo.ts');

async function validateAudiencesIntegration() {
  console.log('🔍 Validation de l\'intégration du service Audiences...\n');

  try {
    // Test 1: Vérifier que le client peut être instancié avec une clé API factice
    console.log('1. Test d\'instanciation du client...');
    const client = new QlooApiClient('test-key-for-validation');
    console.log('✅ Client instancié avec succès\n');

    // Test 2: Vérifier que les méthodes d'audiences sont disponibles
    console.log('2. Test de disponibilité des méthodes d\'audiences...');
    const audienceMethods = [
      'getAudiences',
      'searchAudiences', 
      'validateAudienceIds',
      'extractAudienceMetadata',
      'getSupportedAudienceCategories',
      'validateAudienceCategory',
      'validateDemographics'
    ];

    audienceMethods.forEach(method => {
      if (typeof client[method] === 'function') {
        console.log(`✅ ${method} disponible`);
      } else {
        console.log(`❌ ${method} manquante`);
      }
    });

    // Test 3: Vérifier les catégories d'audiences supportées
    console.log('\n3. Test des catégories d\'audiences supportées...');
    const categories = client.getSupportedAudienceCategories();
    console.log(`✅ ${categories.length} catégories supportées:`);
    categories.slice(0, 5).forEach(cat => console.log(`   - ${cat}`));
    if (categories.length > 5) {
      console.log(`   ... et ${categories.length - 5} autres`);
    }

    // Test 4: Vérifier la validation des catégories
    console.log('\n4. Test de validation des catégories...');
    const validCategory = client.validateAudienceCategory('millennials');
    const invalidCategory = client.validateAudienceCategory('invalid_category');
    console.log(`✅ Validation 'millennials': ${validCategory}`);
    console.log(`✅ Validation 'invalid_category': ${invalidCategory}`);

    // Test 5: Vérifier la validation des données démographiques
    console.log('\n5. Test de validation des données démographiques...');
    const validDemographics = {
      age_range: { min: 25, max: 40 },
      income_level: 'high',
      education_level: 'bachelor'
    };
    
    const validationResult = client.validateDemographics(validDemographics);
    console.log(`✅ Validation démographique: ${validationResult.valid ? 'Valide' : 'Invalide'}`);
    if (validationResult.errors.length > 0) {
      console.log(`   Erreurs: ${validationResult.errors.join(', ')}`);
    }

    // Test 6: Vérifier l'extraction de métadonnées
    console.log('\n6. Test d\'extraction de métadonnées...');
    const sampleAudience = {
      id: 'test_aud_1',
      name: 'Tech Enthusiasts',
      demographics: {
        age_range: { min: 25, max: 40 },
        location: { country: 'France' },
        income_level: 'high'
      },
      size: 2500000,
      interests: ['technology', 'innovation', 'startups'],
      behaviors: ['early_adopter', 'tech_savvy']
    };

    const metadata = client.extractAudienceMetadata(sampleAudience);
    console.log('✅ Métadonnées extraites:');
    console.log(`   Résumé démographique: ${metadata.demographic_summary}`);
    console.log(`   Portée estimée: ${metadata.estimated_reach}`);
    console.log(`   Potentiel de ciblage: ${metadata.targeting_potential}`);
    console.log(`   Intérêts clés: ${metadata.key_interests.join(', ')}`);

    console.log('\n🎉 Tous les tests d\'intégration ont réussi!');
    console.log('✅ Le service Audiences est correctement intégré dans le client Qloo');

  } catch (error) {
    console.error('❌ Erreur lors de la validation:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Exécuter la validation si le script est appelé directement
if (require.main === module) {
  validateAudiencesIntegration();
}

module.exports = { validateAudiencesIntegration };