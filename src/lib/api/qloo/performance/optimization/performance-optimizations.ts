/**
 * Optimisations de performance avancées pour l'API Qloo
 * Basées sur l'analyse des logs de performance
 */

import { optimizedCache } from '../cache/optimized-cache';
import { requestBatcher, prioritizer } from '../requests/request-batcher';

interface PerformanceConfig {
    maxConcurrentRequests: number;
    requestTimeout: number;
    cacheStrategy: 'aggressive' | 'balanced' | 'conservative';
    batchingEnabled: boolean;
    priorityEnabled: boolean;
    monitoringEnabled: boolean;
    fallbackEnabled: boolean;
    retryAttempts: number;
    retryDelay: number;
}

interface PerformanceMetrics {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    cacheHitRate: number;
    batchEfficiency: number;
    errorRate: number;
    lastUpdated: number;
}

interface OptimizationResult {
    success: boolean;
    data?: any;
    fromCache: boolean;
    responseTime: number;
    batchSize?: number;
    priority?: number;
    errors?: string[];
}

export class PerformanceOptimizer {
    private config: PerformanceConfig;
    private metrics: PerformanceMetrics;
    private requestQueue: Map<string, Promise<any>> = new Map();
    private performanceHistory: Array<{ timestamp: number; responseTime: number; success: boolean }> = [];

    constructor(config: Partial<PerformanceConfig> = {}) {
        this.config = {
            maxConcurrentRequests: 5,
            requestTimeout: 8000, // 8 secondes
            cacheStrategy: 'balanced',
            batchingEnabled: true,
            priorityEnabled: true,
            monitoringEnabled: true,
            fallbackEnabled: true,
            retryAttempts: 2,
            retryDelay: 1000,
            ...config
        };

        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            cacheHitRate: 0,
            batchEfficiency: 0,
            errorRate: 0,
            lastUpdated: Date.now()
        };
    }

    /**
     * Optimise une requête avec toutes les stratégies disponibles
     */
    async optimizeRequest<T>(
        entityType: string,
        params: any,
        requestFn: (params: any) => Promise<T>,
        options: {
            priority?: number;
            skipCache?: boolean;
            timeout?: number;
            fallbackData?: T;
        } = {}
    ): Promise<OptimizationResult> {
        const startTime = Date.now();
        const requestId = this.generateRequestId(entityType, params);

        try {
            this.metrics.totalRequests++;

            // 1. Vérifier le cache d'abord
            if (!options.skipCache) {
                const cacheKey = optimizedCache.generateKey({ entityType, ...params });
                const cachedData = optimizedCache.get<T>(cacheKey);

                if (cachedData) {
                    const responseTime = Date.now() - startTime;
                    this.updateMetrics(responseTime, true, true);

                    return {
                        success: true,
                        data: cachedData,
                        fromCache: true,
                        responseTime
                    };
                }
            }

            // 2. Déduplication des requêtes identiques
            if (this.requestQueue.has(requestId)) {
                console.log(`🔄 Requête dédupliquée: ${entityType}`);
                const data = await this.requestQueue.get(requestId);
                const responseTime = Date.now() - startTime;

                return {
                    success: true,
                    data,
                    fromCache: false,
                    responseTime
                };
            }

            // 3. Traitement optimisé avec batching et priorités
            const optimizedPromise = this.executeOptimizedRequest(
                entityType,
                params,
                requestFn,
                options
            );

            this.requestQueue.set(requestId, optimizedPromise);

            const result = await optimizedPromise;
            this.requestQueue.delete(requestId);

            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime, true, false);

            // 4. Mise en cache du résultat
            if (result && !options.skipCache) {
                const cacheKey = optimizedCache.generateKey({ entityType, ...params });
                const ttl = this.calculateOptimalTTL(entityType, result);
                optimizedCache.set(cacheKey, result, ttl);
            }

            return {
                success: true,
                data: result,
                fromCache: false,
                responseTime,
                priority: options.priority
            };

        } catch (error) {
            const responseTime = Date.now() - startTime;
            this.updateMetrics(responseTime, false, false);

            console.error(`❌ Erreur optimisation ${entityType}:`, error);

            // 5. Stratégie de fallback
            if (this.config.fallbackEnabled && options.fallbackData) {
                return {
                    success: true,
                    data: options.fallbackData,
                    fromCache: false,
                    responseTime,
                    errors: [error instanceof Error ? error.message : 'Unknown error']
                };
            }

            return {
                success: false,
                fromCache: false,
                responseTime,
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }

    /**
     * Exécute une requête avec toutes les optimisations
     */
    private async executeOptimizedRequest<T>(
        entityType: string,
        params: any,
        requestFn: (params: any) => Promise<T>,
        options: any
    ): Promise<T> {
        const timeout = options.timeout || this.config.requestTimeout;

        // Utiliser le batcher si activé
        if (this.config.batchingEnabled) {
            const priority = this.config.priorityEnabled
                ? (options.priority || prioritizer.getPriority(entityType, params))
                : 1;

            return await requestBatcher.batchRequest(
                entityType,
                params,
                priority,
                (batchParams) => this.executeWithTimeout(requestFn, batchParams, timeout)
            );
        }

        // Exécution directe avec timeout
        return await this.executeWithTimeout(requestFn, params, timeout);
    }

    /**
     * Exécute une requête avec timeout et retry
     */
    private async executeWithTimeout<T>(
        requestFn: (params: any) => Promise<T>,
        params: any,
        timeout: number
    ): Promise<T> {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
            try {
                const timeoutPromise = new Promise<never>((_, reject) => {
                    setTimeout(() => reject(new Error('Request timeout')), timeout);
                });

                const result = await Promise.race([
                    requestFn(params),
                    timeoutPromise
                ]);

                return result;

            } catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown error');

                if (attempt < this.config.retryAttempts) {
                    console.log(`🔄 Retry ${attempt + 1}/${this.config.retryAttempts} après ${this.config.retryDelay}ms`);
                    await this.sleep(this.config.retryDelay * (attempt + 1)); // Backoff exponentiel
                }
            }
        }

        throw lastError;
    }

    /**
     * Calcule le TTL optimal basé sur le type d'entité et la qualité des données
     */
    private calculateOptimalTTL(entityType: string, data: any): number {
        const baseStrategy = this.config.cacheStrategy;
        let baseTTL: number;

        switch (baseStrategy) {
            case 'aggressive':
                baseTTL = 2 * 60 * 60 * 1000; // 2 heures
                break;
            case 'conservative':
                baseTTL = 30 * 60 * 1000; // 30 minutes
                break;
            default: // balanced
                baseTTL = 60 * 60 * 1000; // 1 heure
        }

        // Ajustements basés sur le type d'entité
        const entityMultipliers: Record<string, number> = {
            music: 1.5,      // Préférences musicales stables
            movie: 1.3,      // Préférences cinéma assez stables
            book: 1.8,       // Préférences livres très stables
            brand: 1.2,      // Marques changent modérément
            tv: 1.4,         // Préférences TV stables
            fashion: 0.6,    // Mode change rapidement
            beauty: 0.7,     // Beauté change assez vite
            food: 1.0,       // Nourriture modérément stable
            travel: 1.6,     // Voyage assez stable
            restaurant: 0.9, // Restaurants changent
            person: 1.4,     // Personnes assez stables
            socialMedia: 0.5 // Réseaux sociaux très volatils
        };

        const multiplier = entityMultipliers[entityType] || 1.0;

        // Ajustement basé sur la qualité des données
        let qualityMultiplier = 1.0;
        if (Array.isArray(data) && data.length > 0) {
            qualityMultiplier = Math.min(1.5, 1 + (data.length / 20));
        }

        return Math.round(baseTTL * multiplier * qualityMultiplier);
    }

    /**
     * Met à jour les métriques de performance
     */
    private updateMetrics(responseTime: number, success: boolean, fromCache: boolean): void {
        if (success) {
            this.metrics.successfulRequests++;
        } else {
            this.metrics.failedRequests++;
        }

        // Mise à jour du temps de réponse moyen
        const totalSuccessful = this.metrics.successfulRequests;
        this.metrics.averageResponseTime =
            (this.metrics.averageResponseTime * (totalSuccessful - 1) + responseTime) / totalSuccessful;

        // Mise à jour du taux d'erreur
        this.metrics.errorRate = this.metrics.failedRequests / this.metrics.totalRequests;

        // Mise à jour des statistiques de cache
        const cacheStats = optimizedCache.getStats();
        this.metrics.cacheHitRate = cacheStats.hitRate;

        // Historique de performance
        this.performanceHistory.push({
            timestamp: Date.now(),
            responseTime,
            success
        });

        // Garder seulement les 1000 dernières entrées
        if (this.performanceHistory.length > 1000) {
            this.performanceHistory = this.performanceHistory.slice(-1000);
        }

        this.metrics.lastUpdated = Date.now();

        if (this.config.monitoringEnabled) {
            this.logPerformanceMetrics();
        }
    }

    /**
     * Génère un ID unique pour une requête
     */
    private generateRequestId(entityType: string, params: any): string {
        const key = JSON.stringify({ entityType, ...params });
        return Buffer.from(key).toString('base64').slice(0, 16);
    }

    /**
     * Log des métriques de performance
     */
    private logPerformanceMetrics(): void {
        if (this.metrics.totalRequests % 10 === 0) { // Log tous les 10 requêtes
            console.log(`📊 Performance Metrics:
        Total: ${this.metrics.totalRequests}
        Success Rate: ${((this.metrics.successfulRequests / this.metrics.totalRequests) * 100).toFixed(1)}%
        Avg Response: ${this.metrics.averageResponseTime.toFixed(0)}ms
        Cache Hit Rate: ${(this.metrics.cacheHitRate * 100).toFixed(1)}%
        Error Rate: ${(this.metrics.errorRate * 100).toFixed(1)}%`);
        }
    }

    /**
     * Obtient les métriques actuelles
     */
    getMetrics(): PerformanceMetrics {
        return { ...this.metrics };
    }

    /**
     * Obtient l'historique de performance
     */
    getPerformanceHistory(): Array<{ timestamp: number; responseTime: number; success: boolean }> {
        return [...this.performanceHistory];
    }

    /**
     * Réinitialise les métriques
     */
    resetMetrics(): void {
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            cacheHitRate: 0,
            batchEfficiency: 0,
            errorRate: 0,
            lastUpdated: Date.now()
        };
        this.performanceHistory = [];
    }

    /**
     * Met à jour la configuration
     */
    updateConfig(newConfig: Partial<PerformanceConfig>): void {
        this.config = { ...this.config, ...newConfig };
        console.log(`⚙️ Configuration mise à jour:`, newConfig);
    }

    /**
     * Nettoie les ressources
     */
    cleanup(): void {
        this.requestQueue.clear();
        this.performanceHistory = [];
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Instance singleton avec configuration optimisée
export const performanceOptimizer = new PerformanceOptimizer({
    maxConcurrentRequests: 5,
    requestTimeout: 8000,
    cacheStrategy: 'balanced',
    batchingEnabled: true,
    priorityEnabled: true,
    monitoringEnabled: true,
    fallbackEnabled: true,
    retryAttempts: 2,
    retryDelay: 1000
});

// Fonctions utilitaires pour l'optimisation
export const optimizationUtils = {
    /**
     * Préchauffe le cache avec des requêtes communes
     */
    async warmupCache(commonRequests: Array<{ entityType: string; params: any }>): Promise<void> {
        console.log(`🔥 Préchauffage du cache avec ${commonRequests.length} requêtes`);

        const warmupData = commonRequests.map(req => ({
            key: optimizedCache.generateKey({ entityType: req.entityType, ...req.params }),
            data: null // Sera rempli par les vraies requêtes
        }));

        await optimizedCache.warmCache(warmupData);
    },

    /**
     * Analyse les performances et suggère des optimisations
     */
    analyzePerformance(): {
        recommendations: string[];
        criticalIssues: string[];
        score: number;
    } {
        const metrics = performanceOptimizer.getMetrics();
        const recommendations: string[] = [];
        const criticalIssues: string[] = [];
        let score = 100;

        // Analyse du taux de cache
        if (metrics.cacheHitRate < 0.3) {
            criticalIssues.push('Taux de cache très faible (<30%)');
            recommendations.push('Augmenter la durée de vie du cache');
            recommendations.push('Améliorer la normalisation des clés de cache');
            score -= 20;
        } else if (metrics.cacheHitRate < 0.5) {
            recommendations.push('Optimiser la stratégie de cache');
            score -= 10;
        }

        // Analyse du temps de réponse
        if (metrics.averageResponseTime > 5000) {
            criticalIssues.push('Temps de réponse très élevé (>5s)');
            recommendations.push('Réduire le timeout des requêtes');
            recommendations.push('Activer le batching agressif');
            score -= 25;
        } else if (metrics.averageResponseTime > 3000) {
            recommendations.push('Optimiser les requêtes lentes');
            score -= 15;
        }

        // Analyse du taux d'erreur
        if (metrics.errorRate > 0.1) {
            criticalIssues.push('Taux d\'erreur élevé (>10%)');
            recommendations.push('Améliorer la gestion des erreurs');
            recommendations.push('Activer les fallbacks');
            score -= 20;
        } else if (metrics.errorRate > 0.05) {
            recommendations.push('Surveiller les erreurs');
            score -= 10;
        }

        return {
            recommendations,
            criticalIssues,
            score: Math.max(0, score)
        };
    },

    /**
     * Génère un rapport de performance détaillé
     */
    generatePerformanceReport(): {
        summary: any;
        metrics: PerformanceMetrics;
        cacheStats: any;
        analysis: any;
        timestamp: number;
    } {
        const metrics = performanceOptimizer.getMetrics();
        const cacheStats = optimizedCache.getStats();
        const analysis = this.analyzePerformance();
        const history = performanceOptimizer.getPerformanceHistory();

        const recentHistory = history.slice(-100); // 100 dernières requêtes
        const avgRecentResponseTime = recentHistory.length > 0
            ? recentHistory.reduce((sum, h) => sum + h.responseTime, 0) / recentHistory.length
            : 0;

        return {
            summary: {
                totalRequests: metrics.totalRequests,
                successRate: metrics.totalRequests > 0
                    ? (metrics.successfulRequests / metrics.totalRequests * 100).toFixed(1) + '%'
                    : '0%',
                averageResponseTime: metrics.averageResponseTime.toFixed(0) + 'ms',
                recentAverageResponseTime: avgRecentResponseTime.toFixed(0) + 'ms',
                cacheHitRate: (metrics.cacheHitRate * 100).toFixed(1) + '%',
                performanceScore: analysis.score + '/100'
            },
            metrics,
            cacheStats,
            analysis,
            timestamp: Date.now()
        };
    }
};