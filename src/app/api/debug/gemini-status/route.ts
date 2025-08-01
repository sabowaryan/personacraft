import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/api/gemini';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Diagnostic Gemini demandé');
    
    const client = getGeminiClient();
    const circuitBreakerStatus = client.getCircuitBreakerStatus();
    const cacheStats = client.getCacheStats();
    
    // Test de connexion
    let connectionTest = false;
    try {
      connectionTest = await client.testConnection();
    } catch (error) {
      console.error('❌ Test de connexion échoué:', error);
    }
    
    const diagnostic = {
      timestamp: new Date().toISOString(),
      circuitBreaker: {
        isOpen: circuitBreakerStatus.isOpen,
        failureCount: circuitBreakerStatus.failureCount,
        lastFailureTime: circuitBreakerStatus.lastFailureTime,
        timeUntilReset: circuitBreakerStatus.timeUntilReset
      },
      cache: {
        size: cacheStats.size,
        memoryUsage: cacheStats.memoryUsage,
        oldestEntry: cacheStats.oldestEntry
      },
      connection: {
        isConnected: connectionTest,
        status: connectionTest ? 'OK' : 'FAILED'
      },
      recommendations: [] as string[]
    };
    
    // Ajouter des recommandations
    if (circuitBreakerStatus.isOpen) {
      diagnostic.recommendations.push('Circuit breaker ouvert - vider le cache et réinitialiser');
    }
    
    if (cacheStats.size > 10) {
      diagnostic.recommendations.push('Cache volumineux - considérer le vidage');
    }
    
    if (!connectionTest) {
      diagnostic.recommendations.push('Connexion Gemini échouée - vérifier la clé API');
    }
    
    console.log('📊 Diagnostic Gemini:', diagnostic);
    
    return NextResponse.json({
      success: true,
      diagnostic
    });
    
  } catch (error) {
    console.error('❌ Erreur diagnostic Gemini:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      diagnostic: {
        timestamp: new Date().toISOString(),
        circuitBreaker: { isOpen: true, failureCount: 999, lastFailureTime: Date.now(), timeUntilReset: 0 },
        cache: { size: 0, memoryUsage: 0, oldestEntry: Date.now() },
        connection: { isConnected: false, status: 'ERROR' },
        recommendations: ['Erreur lors du diagnostic - vérifier la configuration']
      }
    }, { status: 500 });
  }
} 