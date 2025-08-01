import { hybridCacheIntegration } from './src/lib/api/qloo/performance/cache/hybrid-cache-integration';
import { hybridCache } from './src/lib/cache/hybrid-cache';

async function testRedisIntegration() {
    console.log('🧪 Testing Redis Integration...\n');

    try {
        // 1. Test basic operations
        console.log('1. Testing basic cache operations...');
        await hybridCacheIntegration.set('test:music', { genre: 'pop', items: ['song1', 'song2'] }, 60000);
        const musicData = await hybridCacheIntegration.get('test:music');
        console.log('✅ Music data retrieved:', musicData);

        // 2. Test TTL and expiration
        console.log('\n2. Testing TTL...');
        await hybridCacheIntegration.set('test:short', { data: 'expires soon' }, 2000);
        console.log('✅ Short TTL data set');
        
        setTimeout(async () => {
            const expiredData = await hybridCacheIntegration.get('test:short');
            console.log('🕐 After 3s, expired data:', expiredData); // Should be null
        }, 3000);

        // 3. Test performance with multiple entries
        console.log('\n3. Testing performance with batch operations...');
        const startTime = Date.now();
        
        const promises = [];
        for (let i = 0; i < 100; i++) {
            promises.push(
                hybridCacheIntegration.set(`test:batch:${i}`, {
                    id: i,
                    data: `Item ${i}`,
                    timestamp: Date.now()
                }, 300000)
            );
        }
        
        await Promise.all(promises);
        const setTime = Date.now() - startTime;
        console.log(`✅ Set 100 items in ${setTime}ms`);

        // Test batch retrieval
        const retrieveStart = Date.now();
        const retrievePromises = [];
        for (let i = 0; i < 100; i++) {
            retrievePromises.push(hybridCacheIntegration.get(`test:batch:${i}`));
        }
        
        const results = await Promise.all(retrievePromises);
        const retrieveTime = Date.now() - retrieveStart;
        const hits = results.filter(r => r !== null).length;
        console.log(`✅ Retrieved ${hits}/100 items in ${retrieveTime}ms`);

        // 4. Test cache statistics
        console.log('\n4. Cache statistics:');
        const stats = hybridCacheIntegration.getStats();
        console.log('📊 Cache stats:', JSON.stringify(stats, null, 2));

        // 5. Test migration (if you have existing data)
        console.log('\n5. Testing cache migration...');
        await hybridCacheIntegration.migrateToRedis();

        // 6. Test fallback behavior
        console.log('\n6. Testing fallback behavior...');
        hybridCacheIntegration.setFallbackMode(false);
        console.log('🔧 Fallback disabled');
        
        hybridCacheIntegration.setFallbackMode(true);
        console.log('🔧 Fallback re-enabled');

        // 7. Cleanup test data
        console.log('\n7. Cleaning up test data...');
        await hybridCacheIntegration.clear('test:*');
        console.log('🧹 Test data cleaned');

        console.log('\n🎉 Redis integration test completed successfully!');

    } catch (error) {
        console.error('❌ Redis integration test failed:', error);
    }
}

// Run the test
testRedisIntegration().catch(console.error);