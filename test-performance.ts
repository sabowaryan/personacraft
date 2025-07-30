import { QlooClient } from './src/lib/api/qloo/client';
import { PerformanceMonitor } from './src/lib/api/qloo/performance-monitor';

async function testPerformance() {
    const client = new QlooClient();
    const monitor = PerformanceMonitor.getInstance();
    
    console.log('🚀 Test de performance Qloo - Version optimisée');
    console.log('================================================');
    
    // Test personas similaires pour vérifier le cache
    const testPersonas = [
        { name: 'Alice', age: 25, occupation: 'developer', location: 'Paris, France' },
        { name: 'Bob', age: 27, occupation: 'designer', location: 'Paris, France' },
        { name: 'Charlie', age: 23, occupation: 'developer', location: 'Lyon, France' },
        { name: 'Diana', age: 29, occupation: 'manager', location: 'Paris, France' }
    ];
    
    const startTime = Date.now();
    
    try {
        console.log(`📊 Enrichissement de ${testPersonas.length} personas...`);
        const enrichedPersonas = await client.enrichPersonas(testPersonas);
        
        const totalTime = Date.now() - startTime;
        console.log(`\n✅ Enrichissement terminé en ${totalTime}ms`);
        
        // Statistiques de cache
        const cacheStats = client.getCacheStats();
        console.log('\n📈 Statistiques de cache:');
        console.log(`   - Hit rate: ${cacheStats.hitRate}`);
        console.log(`   - Cache hits: ${cacheStats.hits}`);
        console.log(`   - Cache misses: ${cacheStats.misses}`);
        console.log(`   - Cache size: ${cacheStats.cacheSize} entries`);
        
        // Métriques de performance
        const metrics = monitor.getMetrics();
        console.log('\n⏱️ Métriques de performance:');
        Object.entries(metrics).forEach(([operation, stats]) => {
            console.log(`   - ${operation}: ${stats.count} calls, avg ${stats.avgTime.toFixed(0)}ms`);
        });
        
        // Vérification des données enrichies
        console.log('\n🎯 Résultats d\'enrichissement:');
        enrichedPersonas.forEach((persona, index) => {
            const culturalDataCount = persona.culturalData ? 
                Object.values(persona.culturalData).filter(data => Array.isArray(data) && data.length > 0).length : 0;
            console.log(`   - ${persona.name}: ${culturalDataCount} catégories culturelles enrichies`);
        });
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    }
}

// Exécuter le test
testPerformance().catch(console.error);