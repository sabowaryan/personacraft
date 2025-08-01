/**
 * Service d'intégration pour migrer progressivement vers le système de performance avancé
 * Ce service permet d'utiliser les deux systèmes en parallèle pendant la transition
 */

import { RequestHandler } from './request-handler';
import { integratedRequestSystem, getPerformanceStats } from './performance';

interface RequestOptions {
  useAdvancedSystem?: boolean;
  priority?: number;
  timeout?: number;
  retries?: number;
}

export class PerformanceIntegrationService {
  constructor(
    private legacyHandler: RequestHandler,
    private enableAdvancedSystem: boolean = true
  ) {}

  /**
   * Méthode unifiée pour faire des requêtes avec choix du système
   */
  async makeRequest<T>(
    entityType: string,
    params: any,
    requestFn: () => Promise<T>,
    options: RequestOptions = {}
  ): Promise<T> {
    const useAdvanced = options.useAdvancedSystem ?? this.enableAdvancedSystem;

    if (useAdvanced) {
      // Utiliser le système avancé
      return await integratedRequestSystem.makeOptimizedRequest(
        {
          entityType,
          ...params
        },
        requestFn,
        {
          priority: options.priority,
          timeout: options.timeout,
          retries: options.retries
        }
      );
    } else {
      // Utiliser le système legacy
      return await this.legacyHandler.makeRequestWithRetry(
        requestFn,
        entityType,
        options.retries || 3
      );
    }
  }

  /**
   * Statistiques combinées des deux systèmes
   */
  getCombinedStats() {
    const legacyStats = this.legacyHandler.getCacheStats();
    const advancedStats = getPerformanceStats();

    return {
      legacy: legacyStats,
      advanced: advancedStats,
      recommendation: this.getPerformanceRecommendation(legacyStats, advancedStats)
    };
  }

  /**
   * Recommandations basées sur les performances
   */
  private getPerformanceRecommendation(legacyStats: any, advancedStats: any) {
    const recommendations = [];

    // Analyser le cache hit rate
    const legacyHitRate = parseFloat(legacyStats.hitRate) / 100;
    const advancedHitRate = advancedStats.cache?.hitRate || 0;

    if (advancedHitRate > legacyHitRate + 0.1) {
      recommendations.push('Le système avancé offre un meilleur cache hit rate (+' + 
        Math.round((advancedHitRate - legacyHitRate) * 100) + '%)');
    }

    // Analyser les temps de réponse
    if (advancedStats.optimizer?.averageResponseTime < 2000) {
      recommendations.push('Le système avancé maintient des temps de réponse optimaux');
    }

    // Analyser la charge système
    if (advancedStats.optimizer?.concurrentRequests > 5) {
      recommendations.push('Le système avancé gère efficacement la charge élevée');
    }

    return recommendations;
  }

  /**
   * Test de performance comparatif
   */
  async runPerformanceComparison(testRequests: Array<{
    entityType: string;
    params: any;
    requestFn: () => Promise<any>;
  }>) {
    console.log('🔬 Démarrage du test de performance comparatif');

    const results = {
      legacy: { totalTime: 0, errors: 0, requests: 0 },
      advanced: { totalTime: 0, errors: 0, requests: 0 }
    };

    // Test avec système legacy
    console.log('📊 Test du système legacy...');
    const legacyStart = Date.now();
    for (const request of testRequests) {
      try {
        await this.makeRequest(
          request.entityType,
          request.params,
          request.requestFn,
          { useAdvancedSystem: false }
        );
        results.legacy.requests++;
      } catch (error) {
        results.legacy.errors++;
      }
    }
    results.legacy.totalTime = Date.now() - legacyStart;

    // Attendre un peu pour éviter les interférences
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test avec système avancé
    console.log('🚀 Test du système avancé...');
    const advancedStart = Date.now();
    for (const request of testRequests) {
      try {
        await this.makeRequest(
          request.entityType,
          request.params,
          request.requestFn,
          { useAdvancedSystem: true }
        );
        results.advanced.requests++;
      } catch (error) {
        results.advanced.errors++;
      }
    }
    results.advanced.totalTime = Date.now() - advancedStart;

    // Calculer les métriques
    const comparison = {
      speedImprovement: results.legacy.totalTime > 0 ? 
        ((results.legacy.totalTime - results.advanced.totalTime) / results.legacy.totalTime * 100).toFixed(1) : 0,
      errorReduction: results.legacy.errors > 0 ?
        ((results.legacy.errors - results.advanced.errors) / results.legacy.errors * 100).toFixed(1) : 0,
      results
    };

    console.log('📈 Résultats du test comparatif:');
    console.log(`   Legacy: ${results.legacy.totalTime}ms, ${results.legacy.errors} erreurs`);
    console.log(`   Advanced: ${results.advanced.totalTime}ms, ${results.advanced.errors} erreurs`);
    console.log(`   Amélioration vitesse: ${comparison.speedImprovement}%`);
    console.log(`   Réduction erreurs: ${comparison.errorReduction}%`);

    return comparison;
  }
}

// Instance singleton pour l'intégration
let integrationService: PerformanceIntegrationService | null = null;

export function getPerformanceIntegration(legacyHandler: RequestHandler): PerformanceIntegrationService {
  if (!integrationService) {
    integrationService = new PerformanceIntegrationService(legacyHandler);
  }
  return integrationService;
}