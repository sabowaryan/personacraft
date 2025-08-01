/**
 * Système de performance intégré pour l'API Qloo
 * 
 * Ce module centralise tous les composants de performance et de cache :
 * - Cache optimisé avec récupération d'erreurs
 * - Optimiseur de performance avancé
 * - Système de surveillance en temps réel
 * - Préchargement intelligent
 * - Auto-tuner pour l'optimisation automatique
 * - Système de requêtes intégré
 */


import { integratedRequestSystem } from './integration/integrated-request-system';

// Core performance components
export { OptimizedCache, optimizedCache } from './cache/optimized-cache';
export { CacheErrorRecovery, cacheErrorRecovery, safeCache } from './cache/cache-error-recovery';

// Performance optimization
export { PerformanceOptimizer, performanceOptimizer, optimizationUtils } from './optimization/performance-optimizations';
export { AdvancedPerformanceOptimizer, advancedOptimizer } from './optimization/advanced-performance-optimizer';
export { PerformanceErrorHandler, PerformanceErrorType } from './optimization/performance-error-handler';

// Monitoring and analytics
export { PerformanceMonitor } from './monitoring/performance-monitor';
export { RealTimeMonitor, realTimeMonitor } from './monitoring/real-time-monitor';

// Request management
export { RequestBatcher, RequestPrioritizer, requestBatcher, prioritizer } from './requests/request-batcher';
export { IntelligentPreloader, intelligentPreloader } from './requests/intelligent-preloader';

// Auto-tuning
export { AutoTuner, autoTuner } from './tuning/auto-tuner';

// Integrated system
export { IntegratedRequestSystem, integratedRequestSystem } from './integration/integrated-request-system';
export { QlooApiAdapter, qlooApiAdapter } from './integration/qloo-api-adapter';

// Types
export interface PerformanceConfig {
  cache: {
    maxSize: number;
    defaultTTL: number;
    enableErrorRecovery: boolean;
  };
  optimization: {
    maxConcurrentRequests: number;
    requestTimeout: number;
    cacheStrategy: 'aggressive' | 'balanced' | 'conservative';
    batchingEnabled: boolean;
    priorityEnabled: boolean;
  };
  monitoring: {
    enableRealTimeAlerts: boolean;
    samplingInterval: number;
    retentionPeriod: number;
  };
  preloading: {
    enableIntelligentPreloading: boolean;
    maxPreloadItems: number;
    preloadThreshold: number;
  };
  autoTuning: {
    enabled: boolean;
    tuningInterval: number;
  };
}

// Default configuration
export const defaultPerformanceConfig: PerformanceConfig = {
  cache: {
    maxSize: 1000,
    defaultTTL: 3600000, // 1 hour
    enableErrorRecovery: true
  },
  optimization: {
    maxConcurrentRequests: 8,
    requestTimeout: 8000,
    cacheStrategy: 'balanced',
    batchingEnabled: true,
    priorityEnabled: true
  },
  monitoring: {
    enableRealTimeAlerts: true,
    samplingInterval: 5000,
    retentionPeriod: 3600000 // 1 hour
  },
  preloading: {
    enableIntelligentPreloading: true,
    maxPreloadItems: 50,
    preloadThreshold: 3
  },
  autoTuning: {
    enabled: true,
    tuningInterval: 60000 // 1 minute
  }
};

/**
 * Initialise le système de performance complet
 */
export function initializePerformanceSystem(config?: Partial<PerformanceConfig>): void {
  const finalConfig = { ...defaultPerformanceConfig, ...config };
  
  console.log('🚀 Initialisation du système de performance Qloo');
  
  // Le système intégré s'initialise automatiquement
  // et configure tous les composants nécessaires
  
  console.log('✅ Système de performance initialisé avec succès');
}

/**
 * Obtient les statistiques complètes du système
 */
export function getPerformanceStats() {
  return integratedRequestSystem.getSystemStats();
}

/**
 * Réinitialise tous les composants de performance
 */
export function resetPerformanceSystem(): void {
  integratedRequestSystem.reset();
  console.log('🔄 Système de performance réinitialisé');
}

/**
 * Arrêt propre du système de performance
 */
export function shutdownPerformanceSystem(): void {
  integratedRequestSystem.shutdown();
  console.log('⏹️ Système de performance arrêté');
}