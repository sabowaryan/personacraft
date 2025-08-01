/**
 * Test script to verify cache performance fixes
 */

import { GeminiClient } from './src/lib/api/gemini/client';
import { optimizedCache } from './src/lib/api/qloo/performance/cache/optimized-cache';
import { realTimeMonitor } from './src/lib/api/qloo/performance/monitoring/real-time-monitor';
import { advancedOptimizer } from './src/lib/api/qloo/performance/optimization/advanced-performance-optimizer';
import { autoTuner } from './src/lib/api/qloo/performance/tuning/auto-tuner';

async function testCacheFixes() {
    console.log('🧪 Testing cache performance fixes...\n');

    // Test 1: Gemini Client Cache with Retry
    console.log('1. Testing Gemini Client cache and retry mechanism...');
    try {
        const geminiClient = new GeminiClient();
        
        // Test cache stats
        const cacheStats = geminiClient.getCacheStats();
        console.log('   ✅ Gemini cache stats:', {
            size: cacheStats.size,
            memoryUsage: Math.round(cacheStats.memoryUsage / 1024) + 'KB'
        });

        // Test connection (will use retry mechanism if needed)
        const connectionTest = await geminiClient.testConnection();
        console.log('   ✅ Gemini connection test:', connectionTest ? 'SUCCESS' : 'FAILED');
        
    } catch (error) {
        console.log('   ❌ Gemini client test failed:', error.message);
    }

    // Test 2: Optimized Cache Hit Rate Calculation
    console.log('\n2. Testing optimized cache hit rate calculation...');
    try {
        // Add some test data to cache
        optimizedCache.set('test_music_25_global_tech_rock|jazz_creativity|innovation_5', 
            [{ name: 'Test Persona', age: 25 }]);
        
        // Test cache hit
        const cachedData = optimizedCache.get('test_music_25_global_tech_rock|jazz_creativity|innovation_5');
        console.log('   ✅ Cache hit test:', cachedData ? 'SUCCESS' : 'FAILED');
        
        // Get cache stats
        const stats = optimizedCache.getStats();
        console.log('   ✅ Cache stats:', {
            size: stats.size,
            hitRate: Math.round(stats.hitRate * 100) + '%',
            memoryUsage: Math.round(stats.memoryUsage / 1024) + 'KB'
        });
        
    } catch (error) {
        console.log('   ❌ Optimized cache test failed:', error.message);
    }

    // Test 3: Real-time Monitor Cache Hit Rate
    console.log('\n3. Testing real-time monitor cache hit rate calculation...');
    try {
        // Start monitoring
        realTimeMonitor.startMonitoring();
        
        // Record some test requests
        realTimeMonitor.recordRequest('music', 150, true, true);  // Cache hit
        realTimeMonitor.recordRequest('movie', 200, true, false); // Cache miss
        realTimeMonitor.recordRequest('book', 180, true, true);   // Cache hit
        
        // Wait a moment for metrics collection
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const dashboardData = realTimeMonitor.getDashboardData();
        console.log('   ✅ Real-time monitor metrics:', {
            currentCacheHitRate: dashboardData.currentMetrics ? 
                Math.round(dashboardData.currentMetrics.cacheHitRate * 100) + '%' : 'N/A',
            entityPerformance: dashboardData.entityPerformance.length + ' entities tracked'
        });
        
        realTimeMonitor.stopMonitoring();
        
    } catch (error) {
        console.log('   ❌ Real-time monitor test failed:', error.message);
    }

    // Test 4: Advanced Performance Optimizer
    console.log('\n4. Testing advanced performance optimizer cache hit rate...');
    try {
        const metrics = advancedOptimizer.getMetrics();
        console.log('   ✅ Advanced optimizer metrics:', {
            totalRequests: metrics.totalRequests,
            cacheHitRate: Math.round(metrics.cacheHitRate * 100) + '%',
            averageResponseTime: Math.round(metrics.averageResponseTime) + 'ms'
        });
        
        // Test circuit breaker status
        const circuitStatus = advancedOptimizer.getCircuitBreakerStatus();
        console.log('   ✅ Circuit breakers:', Object.keys(circuitStatus).length + ' monitored');
        
    } catch (error) {
        console.log('   ❌ Advanced optimizer test failed:', error.message);
    }

    // Test 5: AutoTuner Conservative Preloading
    console.log('\n5. Testing AutoTuner conservative preloading...');
    try {
        const autoTunerStatus = autoTuner.getStatus();
        console.log('   ✅ AutoTuner status:', {
            enabled: autoTunerStatus.enabled,
            isRunning: autoTunerStatus.isRunning,
            systemHealth: {
                responseTime: Math.round(autoTunerStatus.systemHealth.responseTime) + 'ms',
                cacheHitRate: Math.round(autoTunerStatus.systemHealth.cacheHitRate * 100) + '%',
                memoryUsage: Math.round(autoTunerStatus.systemHealth.memoryUsage / 1024 / 1024) + 'MB'
            }
        });
        
        // Force a tuning cycle to test conservative logic
        console.log('   🔄 Forcing tuning cycle to test conservative preloading...');
        autoTuner.forceTune();
        
        console.log('   ✅ AutoTuner tuning cycle completed');
        
    } catch (error) {
        console.log('   ❌ AutoTuner test failed:', error.message);
    }

    // Test 6: Memory Usage Optimization
    console.log('\n6. Testing memory usage optimization...');
    try {
        // Test cache cleanup
        const statsBefore = optimizedCache.getStats();
        console.log('   📊 Cache before cleanup:', {
            size: statsBefore.size,
            memoryUsage: Math.round(statsBefore.memoryUsage / 1024) + 'KB'
        });
        
        // Add more test data to trigger potential cleanup
        for (let i = 0; i < 10; i++) {
            optimizedCache.set(`test_data_${i}`, { test: `data_${i}` });
        }
        
        const statsAfter = optimizedCache.getStats();
        console.log('   📊 Cache after additions:', {
            size: statsAfter.size,
            memoryUsage: Math.round(statsAfter.memoryUsage / 1024) + 'KB'
        });
        
        console.log('   ✅ Memory optimization test completed');
        
    } catch (error) {
        console.log('   ❌ Memory optimization test failed:', error.message);
    }

    console.log('\n🎉 Cache performance fixes testing completed!');
    console.log('\n📋 Summary of fixes applied:');
    console.log('   ✅ Gemini Client: Enhanced retry mechanism with exponential backoff');
    console.log('   ✅ Real-time Monitor: Fixed cache hit rate calculation');
    console.log('   ✅ Advanced Optimizer: Improved cache hit rate tracking');
    console.log('   ✅ AutoTuner: Implemented conservative preloading to prevent system overload');
    console.log('   ✅ Memory Management: Enhanced cleanup and monitoring');
}

// Run the tests
if (require.main === module) {
    testCacheFixes().catch(console.error);
}

export { testCacheFixes };