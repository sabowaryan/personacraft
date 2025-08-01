/**
 * Test d'intégration pour valider l'utilisation des services de performance
 */

import { QlooClient } from './src/lib/api/qloo/client';
import { getPerformanceIntegration } from './src/lib/api/qloo/performance-integration';
import { RequestHandler } from './src/lib/api/qloo/request-handler';

async function testPerformanceIntegration() {
    console.log('🧪 Test d\'intégration des services de performance');
    console.log('=================================================');

    // Initialiser les services
    const client = new QlooClient();
    const legacyHandler = new RequestHandler(8, 1000, 3600000);
    const integration = getPerformanceIntegration(legacyHandler);

    // Données de test
    const testRequests = [
        {
            entityType: 'music',
            params: { age: 25, occupation: 'developer', location: 'Paris' },
            requestFn: async () => {
                // Simuler une requête API
                await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
                return ['Rock', 'Electronic', 'Jazz'];
            }
        },
        {
            entityType: 'brand',
            params: { age: 30, occupation: 'designer', location: 'Lyon' },
            requestFn: async () => {
                await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 300));
                return ['Apple', 'Nike', 'Tesla'];
            }
        },
        {
            entityType: 'movie',
            params: { age: 28, occupation: 'manager', location: 'Marseille' },
            requestFn: async () => {
                await new Promise(resolve => setTimeout(resolve, Math.random() * 1200 + 400));
                return ['Inception', 'Interstellar', 'The Matrix'];
            }
        }
    ];

    try {
        // 1. Test du système legacy
        console.log('\n📊 Test du système legacy...');
        const legacyStart = Date.now();
        for (const request of testRequests) {
            const result = await integration.makeRequest(
                request.entityType,
                request.params,
                request.requestFn,
                { useAdvancedSystem: false }
            );
            console.log(`   ✅ ${request.entityType}: ${result.length} items`);
        }
        const legacyTime = Date.now() - legacyStart;
        console.log(`   ⏱️ Temps total legacy: ${legacyTime}ms`);

        // 2. Test du système avancé
        console.log('\n🚀 Test du système avancé...');
        const advancedStart = Date.now();
        for (const request of testRequests) {
            const result = await integration.makeRequest(
                request.entityType,
                request.params,
                request.requestFn,
                { useAdvancedSystem: true, priority: 1 }
            );
            console.log(`   ✅ ${request.entityType}: ${result.length} items`);
        }
        const advancedTime = Date.now() - advancedStart;
        console.log(`   ⏱️ Temps total avancé: ${advancedTime}ms`);

        // 3. Test de performance comparatif
        console.log('\n🔬 Test de performance comparatif...');
        const comparison = await integration.runPerformanceComparison(testRequests);
        
        // 4. Statistiques combinées
        console.log('\n📈 Statistiques combinées:');
        const combinedStats = integration.getCombinedStats();
        
        console.log('\n   Legacy Stats:');
        console.log(`     - Cache hits: ${combinedStats.legacy.hits}`);
        console.log(`     - Cache misses: ${combinedStats.legacy.misses}`);
        console.log(`     - Hit rate: ${combinedStats.legacy.hitRate}`);
        console.log(`     - Cache size: ${combinedStats.legacy.cacheSize}`);

        console.log('\n   Advanced Stats:');
        if (combinedStats.advanced.cache) {
            console.log(`     - Cache hit rate: ${Math.round(combinedStats.advanced.cache.hitRate * 100)}%`);
            console.log(`     - Cache size: ${combinedStats.advanced.cache.size}`);
        }
        if (combinedStats.advanced.optimizer) {
            console.log(`     - Avg response time: ${Math.round(combinedStats.advanced.optimizer.averageResponseTime)}ms`);
            console.log(`     - Total requests: ${combinedStats.advanced.optimizer.totalRequests}`);
            console.log(`     - Error rate: ${Math.round(combinedStats.advanced.optimizer.errorRate * 100)}%`);
        }

        // 5. Recommandations
        console.log('\n💡 Recommandations:');
        combinedStats.recommendation.forEach(rec => {
            console.log(`     - ${rec}`);
        });

        // 6. Test des personas avec le client
        console.log('\n👥 Test d\'enrichissement de personas...');
        const testPersonas = [
            { name: 'Alice', age: 25, occupation: 'developer', location: 'Paris' },
            { name: 'Bob', age: 30, occupation: 'designer', location: 'Lyon' }
        ];

        const enrichedPersonas = await client.enrichPersonas(testPersonas);
        console.log(`   ✅ ${enrichedPersonas.length} personas enrichis`);

        // 7. Statistiques finales du client
        console.log('\n📊 Statistiques finales du client:');
        const clientStats = client.getCacheStats();
        console.log('   Legacy:', clientStats.hits, 'hits,', clientStats.misses, 'misses');
        if (clientStats.advanced) {
            console.log('   Advanced cache hit rate:', Math.round((clientStats.advanced.cache?.hitRate || 0) * 100) + '%');
        }

        console.log('\n✅ Test d\'intégration terminé avec succès!');

    } catch (error) {
        console.error('\n❌ Erreur lors du test d\'intégration:', error);
    }
}

// Exécuter le test
testPerformanceIntegration().catch(console.error);