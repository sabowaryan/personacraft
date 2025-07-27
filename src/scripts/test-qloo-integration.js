/**
 * Script de test pour l'intégration Qloo
 * Teste les différentes fonctionnalités de l'API Qloo
 */

const { QlooClient } = require('../lib/api/qloo.ts');

async function testQlooIntegration() {
    console.log('🚀 Test de l\'intégration Qloo...\n');
    
    const client = new QlooClient();
    
    // 1. Test de statut de l'API
    console.log('1. Vérification du statut de l\'API...');
    const status = client.getApiStatus();
    console.log(`   - Clé API présente: ${status.hasApiKey ? '✅' : '❌'}`);
    console.log(`   - URL de base: ${status.baseUrl}\n`);
    
    if (!status.hasApiKey) {
        console.error('❌ Clé API manquante. Vérifiez votre fichier .env');
        return;
    }
    
    // 2. Test de connexion
    console.log('2. Test de connexion...');
    const connectionTest = await client.testConnection();
    if (connectionTest.success) {
        console.log('   ✅ Connexion réussie\n');
    } else {
        console.error(`   ❌ Échec de connexion: ${connectionTest.error}`);
        if (connectionTest.status) {
            console.error(`   Status HTTP: ${connectionTest.status}`);
        }
        return;
    }
    
    // 3. Test de recherche de tags
    console.log('3. Test de recherche de tags...');
    try {
        const tags = await client.searchTags('technology', 5);
        console.log(`   ✅ Tags trouvés: ${tags.length}`);
        if (tags.length > 0) {
            console.log(`   Exemples: ${tags.slice(0, 3).join(', ')}`);
        }
    } catch (error) {
        console.error(`   ❌ Erreur recherche tags: ${error.message}`);
    }
    console.log('');
    
    // 4. Test de recherche d'entités
    console.log('4. Test de recherche d\'entités...');
    try {
        const entities = await client.searchEntities('Netflix', ['brand'], 3);
        console.log(`   ✅ Entités trouvées: ${entities.length}`);
        if (entities.length > 0) {
            console.log(`   Première entité: ${entities[0].name || entities[0].title || 'N/A'}`);
        }
    } catch (error) {
        console.error(`   ❌ Erreur recherche entités: ${error.message}`);
    }
    console.log('');
    
    // 5. Test d'enrichissement de persona
    console.log('5. Test d\'enrichissement de persona...');
    const testPersona = {
        name: 'Marie Dupont',
        age: 28,
        occupation: 'Développeur web',
        location: 'Paris',
        culturalData: {}
    };
    
    try {
        const enrichedPersonas = await client.enrichPersonas([testPersona]);
        const enriched = enrichedPersonas[0];
        
        console.log('   ✅ Enrichissement réussi');
        console.log(`   - Musique: ${enriched.culturalData?.music?.slice(0, 2).join(', ') || 'N/A'}`);
        console.log(`   - Films: ${enriched.culturalData?.movies?.slice(0, 2).join(', ') || 'N/A'}`);
        console.log(`   - Marques: ${enriched.culturalData?.brands?.slice(0, 2).join(', ') || 'N/A'}`);
        console.log(`   - Réseaux sociaux: ${enriched.culturalData?.socialMedia?.slice(0, 3).join(', ') || 'N/A'}`);
        
    } catch (error) {
        console.error(`   ❌ Erreur enrichissement: ${error.message}`);
    }
    
    console.log('\n🎉 Test terminé !');
}

// Exécuter le test si le script est appelé directement
if (require.main === module) {
    testQlooIntegration().catch(console.error);
}

module.exports = { testQlooIntegration };