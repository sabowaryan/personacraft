/**
 * Script de diagnostic du Circuit Breaker Gemini
 */

import { getGeminiClient } from '@/lib/api/gemini';

async function debugCircuitBreaker() {
  console.log('🔍 Diagnostic du Circuit Breaker Gemini');
  
  const client = getGeminiClient();
  const status = client.getCircuitBreakerStatus();
  
  console.log('📊 Statut Circuit Breaker:', {
    isOpen: status.isOpen,
    failureCount: status.failureCount,
    lastFailureTime: status.lastFailureTime,
    timeUntilReset: status.timeUntilReset
  });
  
  console.log('📊 Cache Stats:', client.getCacheStats());
  
  if (status.isOpen) {
    console.log('🔴 Circuit Breaker est OUVERT - utilisation du fallback');
    console.log(`⏰ Réinitialisation dans ${Math.round(status.timeUntilReset / 1000)} secondes`);
  } else {
    console.log('🟢 Circuit Breaker est FERMÉ - API Gemini disponible');
  }
  
  // Test de connexion
  console.log('🧪 Test de connexion Gemini...');
  const isConnected = await client.testConnection();
  console.log('📡 Connexion Gemini:', isConnected ? '✅ OK' : '❌ ÉCHEC');
}

debugCircuitBreaker().catch(console.error); 