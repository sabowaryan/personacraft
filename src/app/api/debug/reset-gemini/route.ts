import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/api/gemini';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Réinitialisation Gemini demandée');
    
    const client = getGeminiClient();
    
    // Vider le cache
    const cacheStatsBefore = client.getCacheStats();
    client.clearCache();
    const cacheStatsAfter = client.getCacheStats();
    
    // Réinitialiser le circuit breaker (via une méthode publique)
    const circuitBreakerBefore = client.getCircuitBreakerStatus();
    
    // Utiliser une méthode privée via reflection pour réinitialiser
    const resetCircuitBreaker = (client as any).resetCircuitBreaker;
    if (typeof resetCircuitBreaker === 'function') {
      resetCircuitBreaker.call(client);
    }
    
    const circuitBreakerAfter = client.getCircuitBreakerStatus();
    
    // Test de connexion après réinitialisation
    let connectionTest = false;
    try {
      connectionTest = await client.testConnection();
    } catch (error) {
      console.error('❌ Test de connexion échoué après réinitialisation:', error);
    }
    
    const result = {
      timestamp: new Date().toISOString(),
      cache: {
        before: cacheStatsBefore,
        after: cacheStatsAfter,
        cleared: cacheStatsBefore.size - cacheStatsAfter.size
      },
      circuitBreaker: {
        before: circuitBreakerBefore,
        after: circuitBreakerAfter,
        reset: circuitBreakerBefore.isOpen && !circuitBreakerAfter.isOpen
      },
      connection: {
        isConnected: connectionTest,
        status: connectionTest ? 'OK' : 'FAILED'
      }
    };
    
    console.log('✅ Réinitialisation Gemini terminée:', result);
    
    return NextResponse.json({
      success: true,
      message: 'Gemini réinitialisé avec succès',
      result
    });
    
  } catch (error) {
    console.error('❌ Erreur réinitialisation Gemini:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 