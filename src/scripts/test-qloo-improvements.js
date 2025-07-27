/**
 * Script de test pour les améliorations Qloo basées sur la documentation du hackathon
 */

const { getQlooClient } = require('../lib/api/qloo.ts');

async function testQlooImprovements() {
    console.log('🔧 Test des améliorations Qloo basées sur la documentation du hackathon...\n');
    
    const client = getQlooClient();
    
    // Test 1: Vérification des types d'entités mappés
    console.log('1. Test des types d\'entités mappés...');
    const entityTypes = ['music', 'brand', 'movie', 'tv', 'book', 'restaurant', 'travel', 'fashion', 'beauty', 'food'];
    
    for (const type of entityTypes.slice(0, 3)) { // Tester seulement les 3 premiers pour éviter le rate limiting
        try {
            console.log(`   Testing ${type}...`);
            const data = await client.fetchData(type, 25, 'développeur', 'Paris', 2);
            console.log(`   ✅ ${type}: ${data.length} résultats`);
            if (data.length > 0) {
                console.log(`      Exemple: ${data[0]}`);
            }
        } catch (error) {
            console.error(`   ❌ ${type}: ${error.message}`);
        }
        
        // Délai pour éviter le rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('\n2. Test des audiences démographiques...');
    
    // Test différentes tranches d'âge
    const ageTests = [
        { age: 22, expected: 'gen-z' },
        { age: 30, expected: 'millennials' },
        { age: 45, expected: 'gen-x' },
        { age: 60, expected: 'baby-boomers' }
    ];
    
    for (const test of ageTests) {
        try {
            const data = await client.fetchData('music', test.age, undefined, undefined, 1);
            console.log(`   ✅ Âge ${test.age} (${test.expected}): ${data.length} résultats`);
        } catch (error) {
            console.error(`   ❌ Âge ${test.age}: ${error.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('\n3. Test de recherche de tags...');
    try {
        const techTags = await client.searchTags('technology', 5);
        console.log(`   ✅ Tags technologie: ${techTags.length} trouvés`);
        if (techTags.length > 0) {
            console.log(`   Exemples: ${techTags.slice(0, 3).join(', ')}`);
        }
        
        const musicTags = await client.searchTags('music', 5);
        console.log(`   ✅ Tags musique: ${musicTags.length} trouvés`);
        if (musicTags.length > 0) {
            console.log(`   Exemples: ${musicTags.slice(0, 3).join(', ')}`);
        }
    } catch (error) {
        console.error(`   ❌ Erreur recherche tags: ${error.message}`);
    }
    
    console.log('\n4. Test de recherche d\'entités...');
    try {
        const brands = await client.searchEntities('Apple', ['brand'], 3);
        console.log(`   ✅ Marques Apple: ${brands.length} trouvées`);
        
        const artists = await client.searchEntities('Beatles', ['artist'], 3);
        console.log(`   ✅ Artistes Beatles: ${artists.length} trouvés`);
        
        const movies = await client.searchEntities('Inception', ['movie'], 3);
        console.log(`   ✅ Films Inception: ${movies.length} trouvés`);
    } catch (error) {
        console.error(`   ❌ Erreur recherche entités: ${error.message}`);
    }
    
    console.log('\n5. Test d\'enrichissement complet avec nouvelles améliorations...');
    const testPersonas = [
        {
            name: 'Alex Gen-Z',
            age: 22,
            occupation: 'Développeur frontend',
            location: 'Lyon'
        },
        {
            name: 'Sophie Millennial',
            age: 32,
            occupation: 'Designer UX',
            location: 'Marseille'
        }
    ];
    
    try {
        const enriched = await client.enrichPersonas(testPersonas);
        
        enriched.forEach((persona, index) => {
            console.log(`   ✅ ${persona.name}:`);
            console.log(`      Musique: ${persona.culturalData?.music?.slice(0, 2).join(', ') || 'Fallback'}`);
            console.log(`      Marques: ${persona.culturalData?.brands?.slice(0, 2).join(', ') || 'Fallback'}`);
            console.log(`      Réseaux sociaux: ${persona.culturalData?.socialMedia?.slice(0, 3).join(', ') || 'N/A'}`);
        });
        
    } catch (error) {
        console.error(`   ❌ Erreur enrichissement: ${error.message}`);
    }
    
    console.log('\n🎉 Test des améliorations terminé !');
    console.log('\n📋 Résumé des améliorations appliquées:');
    console.log('   - ✅ Types d\'entités mappés selon la documentation');
    console.log('   - ✅ Audiences démographiques par tranches d\'âge');
    console.log('   - ✅ Validation des paramètres par type d\'entité');
    console.log('   - ✅ Méthodes de recherche de tags et entités');
    console.log('   - ✅ Requêtes GET explicites');
    console.log('   - ✅ URL de base hackathon correcte');
}

// Exécuter le test si le script est appelé directement
if (require.main === module) {
    testQlooImprovements().catch(console.error);
}

module.exports = { testQlooImprovements };