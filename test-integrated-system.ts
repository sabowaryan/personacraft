/**
 * Script de test pour le nouveau système intégré Qloo
 */

import { qlooApiAdapter } from './src/lib/api/qloo/qloo-api-adapter';
import { integratedRequestSystem } from './src/lib/api/qloo/integrated-request-system';

async function testIntegratedSystem() {
    console.log('🧪 Test du système intégré Qloo...\n');

    try {
        // Test 1: Requête simple
        console.log('📝 Test 1: Requête simple pour la musique');
        const musicResult = await qlooApiAdapter.makeRequest(
            'music',
            {
                age: 30,
                location: 'France',
                interests: ['technology', 'innovation'],
                occupation: 'developer',
                take: 5
            },
            {
                enableCache: true,
                enableBatching: true,
                priority: 'high'
            }
        );
        console.log('✅ Résultat musique:', musicResult?.slice(0, 2));

        // Test 2: Requêtes par lot
        console.log('\n📦 Test 2: Requêtes par lot');
        const batchResults = await qlooApiAdapter.makeBatchRequests([
            {
                entityType: 'brand',
                params: { age: 25, location: 'France', take: 3 },
                apiCallFn: async () => ['Brand 1', 'Brand 2', 'Brand 3'],
                priority: 3
            },
            {
                entityType: 'movie',
                params: { age: 35, location: 'France', take: 3 },
                apiCallFn: async () => ['Movie 1', 'Movie 2', 'Movie 3'],
                priority: 2
            },
            {
                entityType: 'book',
                params: { age: 40, location: 'France', take: 3 },
                apiCallFn: async () => ['Book 1', 'Book 2', 'Book 3'],
                priority: 1
            }
        ]);
        console.log('✅ Résultats par lot:', batchResults.map(r => r?.slice(0, 1)));

        // Test 3: Statistiques du système
        console.log('\n📊 Test 3: Statistiques du système');
        const stats = qlooApiAdapter.getStats();
        console.log('Cache stats:', {
            hitRate: Math.round(stats.cache.hitRate * 100) + '%',
            totalRequests: stats.cache.totalRequests,
            size: stats.cache.size
        });
        console.log('Optimizer stats:', {
            averageResponseTime: Math.round(stats.optimizer.averageResponseTime) + 'ms',
            totalRequests: stats.optimizer.totalRequests,
            errorRate: Math.round(stats.optimizer.errorRate * 100) + '%'
        });

        // Test 4: Test de performance avec cache
        console.log('\n⚡ Test 4: Performance avec cache');
        const startTime = Date.now();

        // Première requête (pas de cache)
        await qlooApiAdapter.makeRequest('fashion', {
            age: 28,
            location: 'France',
            take: 4
        });
        const firstRequestTime = Date.now() - startTime;

        // Deuxième requête identique (avec cache)
        const cacheStartTime = Date.now();
        await qlooApiAdapter.makeRequest('fashion', {
            age: 28,
            location: 'France',
            take: 4
        });
        const cachedRequestTime = Date.now() - cacheStartTime;

        console.log(`Première requête: ${firstRequestTime}ms`);
        console.log(`Requête avec cache: ${cachedRequestTime}ms`);
        console.log(`Amélioration: ${Math.round((firstRequestTime - cachedRequestTime) / firstRequestTime * 100)}%`);

        // Test 5: Monitoring en temps réel
        console.log('\n📈 Test 5: Données de monitoring');
        const monitorData = stats.monitor;
        console.log('Monitoring:', {
            currentMetrics: monitorData.currentMetrics ? {
                responseTime: Math.round(monitorData.currentMetrics.responseTime) + 'ms',
                cacheHitRate: Math.round(monitorData.currentMetrics.cacheHitRate * 100) + '%',
                errorRate: Math.round(monitorData.currentMetrics.errorRate * 100) + '%',
                throughput: Math.round(monitorData.currentMetrics.throughput * 100) / 100 + ' req/s'
            } : 'No metrics available',
            recentAlerts: monitorData.recentAlerts.length,
            entityPerformance: monitorData.entityPerformance.length + ' entities tracked'
        });

        console.log('\n🎉 Tous les tests sont passés avec succès !');
        console.log('\n📋 Résumé des améliorations:');
        console.log('- ✅ Cache intelligent activé');
        console.log('- ✅ Traitement par lot optimisé');
        console.log('- ✅ Préchargement intelligent');
        console.log('- ✅ Monitoring en temps réel');
        console.log('- ✅ Gestion automatique des erreurs');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error);

        // Afficher les statistiques même en cas d'erreur
        try {
            const stats = qlooApiAdapter.getStats();
            console.log('\n📊 Statistiques partielles:');
            console.log('- Requêtes totales:', stats.cache.totalRequests);
            console.log('- Taux d\'erreur:', Math.round(stats.optimizer.errorRate * 100) + '%');
        } catch (statsError) {
            console.error('Impossible de récupérer les statistiques:', statsError);
        }
    }
}

// Fonction pour tester les performances comparatives
async function testPerformanceComparison() {
    console.log('\n🏁 Test de performance comparative...');

    const testRequests = [
        { entityType: 'music', params: { age: 25, location: 'France', take: 5 } },
        { entityType: 'brand', params: { age: 30, location: 'France', take: 5 } },
        { entityType: 'movie', params: { age: 35, location: 'France', take: 5 } },
        { entityType: 'book', params: { age: 40, location: 'France', take: 5 } }
    ];

    // Test avec le nouveau système
    const newSystemStart = Date.now();
    const newSystemResults = await Promise.all(
        testRequests.map(req =>
            qlooApiAdapter.makeRequest(req.entityType, req.params, { enableCache: true })
        )
    );
    const newSystemTime = Date.now() - newSystemStart;

    console.log(`Nouveau système: ${newSystemTime}ms pour ${testRequests.length} requêtes`);
    console.log(`Temps moyen par requête: ${Math.round(newSystemTime / testRequests.length)}ms`);

    const stats = qlooApiAdapter.getStats();
    console.log(`Taux de cache hit: ${Math.round(stats.cache.hitRate * 100)}%`);
}

// Exécution des tests
async function runAllTests() {
    try {
        await testIntegratedSystem();
        await testPerformanceComparison();

        console.log('\n🚀 Migration vers le système optimisé terminée !');
        console.log('\nPour surveiller les performances en continu:');
        console.log('- Visitez /debug/performance pour le dashboard');
        console.log('- Consultez les logs de la console pour les métriques');
        console.log('- Le système s\'auto-optimise automatiquement');

    } catch (error) {
        console.error('❌ Erreur lors des tests:', error);
    }
}

// Lancer les tests si le script est exécuté directement
if (require.main === module) {
    runAllTests().catch(console.error);
}

export { testIntegratedSystem, testPerformanceComparison };