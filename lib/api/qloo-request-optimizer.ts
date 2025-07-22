// Request Optimizer pour l'API Qloo avec batching intelligent et optimisation des requêtes
// Implémente le groupement de requêtes similaires et l'optimisation des appels API

import type { EntityUrn, SearchParams, SearchResult, BatchSearchQuery, BatchSearchResult } from '@/lib/types/qloo-compliant';
import { QlooRateLimiter } from './qloo-rate-limiter';

/**
 * Configuration de l'optimiseur de requêtes
 */
export interface RequestOptimizerConfig {
  /** Taille maximale d'un batch */
  maxBatchSize: number;
  /** Délai d'attente pour former un batch (en millisecondes) */
  batchWindow: number;
  /** Seuil de similarité pour grouper les requêtes (0-1) */
  similarityThreshold: number;
  /** Types de requêtes éligibles à l'optimisation */
  eligibleTypes: string[];
  /** Cache des résultats pour éviter les doublons */
  enableResultCache: boolean;
  /** TTL du cache de résultats */
  resultCacheTtl: number;
}

/**
 * Requête en attente d'optimisation
 */
export interface PendingOptimizedRequest {
  /** Identifiant unique */
  id: string;
  /** Type de requête */
  type: string;
  /** Paramètres de la requête */
  params: any;
  /** Timestamp de création */
  timestamp: number;
  /** Hash pour la déduplication */
  hash: string;
  /** Fonction de résolution */
  resolve: (value: any) => void;
  /** Fonction de rejet */
  reject: (error: any) => void;
  /** Priorité de la requête */
  priority: number;
}

/**
 * Batch de requêtes optimisées
 */
export interface OptimizedBatch {
  /** Identifiant du batch */
  id: string;
  /** Type de batch */
  type: string;
  /** Requêtes dans le batch */
  requests: PendingOptimizedRequest[];
  /** Timestamp de création */
  createdAt: number;
  /** Paramètres consolidés */
  consolidatedParams: any;
}

/**
 * Statistiques de l'optimiseur
 */
export interface OptimizerStats {
  /** Nombre total de requêtes traitées */
  totalRequests: number;
  /** Nombre de requêtes batchées */
  batchedRequests: number;
  /** Nombre de requêtes dédupliquées */
  deduplicatedRequests: number;
  /** Nombre de hits de cache */
  cacheHits: number;
  /** Réduction du nombre d'appels API */
  apiCallReduction: number;
  /** Temps de traitement moyen */
  averageProcessingTime: number;
  /** Statistiques par type */
  byType: Record<string, {
    requests: number;
    batched: number;
    deduplicated: number;
    cacheHits: number;
    averageProcessingTime: number;
  }>;
}

/**
 * Résultat mis en cache
 */
interface CachedResult {
  /** Données du résultat */
  data: any;
  /** Timestamp de mise en cache */
  timestamp: number;
  /** TTL en millisecondes */
  ttl: number;
  /** Hash de la requête */
  hash: string;
}

/**
 * Optimiseur de requêtes pour l'API Qloo
 */
export class QlooRequestOptimizer {
  private config: RequestOptimizerConfig;
  private rateLimiter: QlooRateLimiter;
  private pendingRequests = new Map<string, PendingOptimizedRequest[]>();
  private batchTimers = new Map<string, NodeJS.Timeout>();
  private resultCache = new Map<string, CachedResult>();
  private stats: OptimizerStats;
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    rateLimiter: QlooRateLimiter,
    config?: Partial<RequestOptimizerConfig>
  ) {
    this.rateLimiter = rateLimiter;
    this.config = {
      maxBatchSize: 10,
      batchWindow: 100,
      similarityThreshold: 0.8,
      eligibleTypes: ['search', 'entity_lookup', 'tag_search', 'audience_search'],
      enableResultCache: true,
      resultCacheTtl: 300000, // 5 minutes
      ...config
    };

    this.stats = {
      totalRequests: 0,
      batchedRequests: 0,
      deduplicatedRequests: 0,
      cacheHits: 0,
      apiCallReduction: 0,
      averageProcessingTime: 0,
      byType: {}
    };

    // Nettoyer le cache périodiquement
    this.cleanupInterval = setInterval(() => {
      this.cleanupCache();
    }, 60000); // Toutes les minutes
  }

  /**
   * Optimise et exécute une requête de recherche d'entités
   */
  async optimizeEntitySearch(
    query: string,
    type: EntityUrn,
    options: Partial<SearchParams> = {},
    executeFn: (query: string, type: EntityUrn, options?: Partial<SearchParams>) => Promise<SearchResult>
  ): Promise<SearchResult> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();
    
    this.stats.totalRequests++;
    this.updateTypeStats(type, 'request');

    // Créer le hash de la requête pour la déduplication
    const requestHash = this.createRequestHash('entity_search', { query, type, options });

    // Vérifier le cache
    if (this.config.enableResultCache) {
      const cachedResult = this.getCachedResult(requestHash);
      if (cachedResult) {
        this.stats.cacheHits++;
        this.updateTypeStats(type, 'cache_hit');
        return cachedResult;
      }
    }

    // Vérifier si la requête peut être optimisée
    if (!this.canOptimize('search')) {
      return this.executeDirectly(executeFn, query, type, options);
    }

    return new Promise<SearchResult>((resolve, reject) => {
      const request: PendingOptimizedRequest = {
        id: requestId,
        type: 'entity_search',
        params: { query, type, options },
        timestamp: startTime,
        hash: requestHash,
        resolve,
        reject,
        priority: this.calculatePriority(options)
      };

      this.addToBatch(request, executeFn);
    });
  }

  /**
   * Optimise et exécute un batch de recherches
   */
  async optimizeBatchSearch(
    queries: BatchSearchQuery[],
    executeFn: (queries: BatchSearchQuery[]) => Promise<BatchSearchResult>
  ): Promise<BatchSearchResult> {
    const startTime = Date.now();
    
    // Déduplication des requêtes identiques
    const deduplicatedQueries = this.deduplicateQueries(queries);
    const deduplicationCount = queries.length - deduplicatedQueries.length;
    
    this.stats.deduplicatedRequests += deduplicationCount;

    // Diviser en batches optimaux si nécessaire
    const batches = this.splitIntoBatches(deduplicatedQueries);
    
    if (batches.length === 1) {
      // Un seul batch, exécuter directement
      return this.rateLimiter.executeRequest(
        'batch_search',
        () => executeFn(batches[0]),
        { type: 'batch_search', enableBatching: false }
      );
    }

    // Exécuter plusieurs batches en parallèle avec rate limiting
    const batchPromises = batches.map(batch =>
      this.rateLimiter.executeRequest(
        'batch_search',
        () => executeFn(batch),
        { type: 'batch_search', enableBatching: false }
      )
    );

    const batchResults = await Promise.all(batchPromises);
    
    // Consolider les résultats
    return this.consolidateBatchResults(batchResults, queries.length);
  }

  /**
   * Ajoute une requête au batch approprié
   */
  private addToBatch(
    request: PendingOptimizedRequest,
    executeFn: Function
  ): void {
    const batchKey = this.getBatchKey(request);
    
    if (!this.pendingRequests.has(batchKey)) {
      this.pendingRequests.set(batchKey, []);
    }

    const batch = this.pendingRequests.get(batchKey)!;
    
    // Vérifier la déduplication
    const existingRequest = batch.find(r => r.hash === request.hash);
    if (existingRequest) {
      // Dupliquer la résolution pour les requêtes identiques
      this.stats.deduplicatedRequests++;
      this.updateTypeStats(request.type, 'deduplicated');
      
      const originalResolve = existingRequest.resolve;
      existingRequest.resolve = (value: any) => {
        originalResolve(value);
        request.resolve(value);
      };
      
      const originalReject = existingRequest.reject;
      existingRequest.reject = (error: any) => {
        originalReject(error);
        request.reject(error);
      };
      
      return;
    }

    batch.push(request);
    this.scheduleBatchExecution(batchKey, executeFn);
  }

  /**
   * Programme l'exécution d'un batch
   */
  private scheduleBatchExecution(batchKey: string, executeFn: Function): void {
    // Annuler le timer existant
    if (this.batchTimers.has(batchKey)) {
      clearTimeout(this.batchTimers.get(batchKey)!);
    }

    const timer = setTimeout(() => {
      this.executeBatch(batchKey, executeFn);
    }, this.config.batchWindow);

    this.batchTimers.set(batchKey, timer);

    // Exécuter immédiatement si le batch est plein
    const batch = this.pendingRequests.get(batchKey);
    if (batch && batch.length >= this.config.maxBatchSize) {
      clearTimeout(timer);
      this.batchTimers.delete(batchKey);
      this.executeBatch(batchKey, executeFn);
    }
  }

  /**
   * Exécute un batch de requêtes
   */
  private async executeBatch(batchKey: string, executeFn: Function): Promise<void> {
    const batch = this.pendingRequests.get(batchKey);
    if (!batch || batch.length === 0) return;

    this.pendingRequests.delete(batchKey);
    this.batchTimers.delete(batchKey);

    this.stats.batchedRequests += batch.length;

    try {
      // Trier par priorité
      batch.sort((a, b) => b.priority - a.priority);

      // Exécuter les requêtes avec rate limiting
      for (const request of batch) {
        try {
          const result = await this.rateLimiter.executeRequest(
            `optimized_${request.type}`,
            () => {
              const { query, type, options } = request.params;
              return executeFn(query, type, options);
            },
            { type: request.type, enableBatching: false }
          );

          // Mettre en cache le résultat
          if (this.config.enableResultCache) {
            this.cacheResult(request.hash, result);
          }

          request.resolve(result);
          this.updateTypeStats(request.type, 'success');
          
        } catch (error) {
          request.reject(error);
          this.updateTypeStats(request.type, 'error');
        }
      }

    } catch (error) {
      // Rejeter toutes les requêtes du batch
      batch.forEach(request => request.reject(error));
    }
  }

  /**
   * Exécute une requête directement sans optimisation
   */
  private async executeDirectly(
    executeFn: Function,
    ...args: any[]
  ): Promise<any> {
    return this.rateLimiter.executeRequest(
      'direct_request',
      () => executeFn(...args),
      { type: 'direct', enableBatching: false }
    );
  }

  /**
   * Déduplique les requêtes identiques
   */
  private deduplicateQueries(queries: BatchSearchQuery[]): BatchSearchQuery[] {
    const seen = new Set<string>();
    const deduplicated: BatchSearchQuery[] = [];

    for (const query of queries) {
      const hash = this.createRequestHash('batch_search', query);
      if (!seen.has(hash)) {
        seen.add(hash);
        deduplicated.push(query);
      }
    }

    return deduplicated;
  }

  /**
   * Divise les requêtes en batches optimaux
   */
  private splitIntoBatches<T>(items: T[]): T[][] {
    const batches: T[][] = [];
    
    for (let i = 0; i < items.length; i += this.config.maxBatchSize) {
      batches.push(items.slice(i, i + this.config.maxBatchSize));
    }
    
    return batches;
  }

  /**
   * Consolide les résultats de plusieurs batches
   */
  private consolidateBatchResults(
    batchResults: BatchSearchResult[],
    originalQueryCount: number
  ): BatchSearchResult {
    const consolidatedResults: BatchSearchResult['results'] = [];
    let totalEntities = 0;
    let totalProcessingTime = 0;
    let successfulQueries = 0;
    let failedQueries = 0;

    for (const batchResult of batchResults) {
      consolidatedResults.push(...batchResult.results);
      totalEntities += batchResult.metadata.total_entities;
      totalProcessingTime += batchResult.metadata.processing_time;
      successfulQueries += batchResult.metadata.successful_queries;
      failedQueries += batchResult.metadata.failed_queries;
    }

    return {
      results: consolidatedResults,
      metadata: {
        total_queries: originalQueryCount,
        successful_queries: successfulQueries,
        failed_queries: failedQueries,
        total_entities: totalEntities,
        processing_time: totalProcessingTime,
        request_id: this.generateRequestId()
      },
      status: {
        code: 200,
        message: 'Batch search completed',
        success: true
      }
    };
  }

  /**
   * Crée un hash pour une requête
   */
  private createRequestHash(type: string, params: any): string {
    const normalized = this.normalizeParams(params);
    const str = `${type}:${JSON.stringify(normalized)}`;
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * Normalise les paramètres pour la comparaison
   */
  private normalizeParams(params: any): any {
    if (typeof params !== 'object' || params === null) {
      return params;
    }

    const normalized: any = {};
    const sortedKeys = Object.keys(params).sort();

    for (const key of sortedKeys) {
      const value = params[key];
      if (Array.isArray(value)) {
        normalized[key] = [...value].sort();
      } else if (typeof value === 'object' && value !== null) {
        normalized[key] = this.normalizeParams(value);
      } else {
        normalized[key] = value;
      }
    }

    return normalized;
  }

  /**
   * Génère une clé de batch pour grouper les requêtes similaires
   */
  private getBatchKey(request: PendingOptimizedRequest): string {
    const { type, params } = request;
    
    // Pour les recherches d'entités, grouper par type d'entité
    if (type === 'entity_search') {
      return `${type}:${params.type}`;
    }
    
    return type;
  }

  /**
   * Calcule la priorité d'une requête
   */
  private calculatePriority(options: any): number {
    let priority = 1;
    
    // Priorité plus élevée pour les requêtes avec limite élevée
    if (options?.limit && options.limit > 10) {
      priority += 1;
    }
    
    // Priorité plus élevée pour les requêtes avec confiance minimum élevée
    if (options?.min_confidence && options.min_confidence > 0.8) {
      priority += 1;
    }
    
    return priority;
  }

  /**
   * Vérifie si une requête peut être optimisée
   */
  private canOptimize(type: string): boolean {
    return this.config.eligibleTypes.includes(type);
  }

  /**
   * Met en cache un résultat
   */
  private cacheResult(hash: string, result: any): void {
    this.resultCache.set(hash, {
      data: result,
      timestamp: Date.now(),
      ttl: this.config.resultCacheTtl,
      hash
    });
  }

  /**
   * Récupère un résultat du cache
   */
  private getCachedResult(hash: string): any | null {
    const cached = this.resultCache.get(hash);
    
    if (!cached) return null;
    
    // Vérifier l'expiration
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.resultCache.delete(hash);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Nettoie le cache des résultats expirés
   */
  private cleanupCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.resultCache.forEach((cached, key) => {
      if (now - cached.timestamp > cached.ttl) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.resultCache.delete(key));
  }

  /**
   * Met à jour les statistiques par type
   */
  private updateTypeStats(type: string, action: string): void {
    if (!this.stats.byType[type]) {
      this.stats.byType[type] = {
        requests: 0,
        batched: 0,
        deduplicated: 0,
        cacheHits: 0,
        averageProcessingTime: 0
      };
    }

    const typeStats = this.stats.byType[type];
    
    switch (action) {
      case 'request':
        typeStats.requests++;
        break;
      case 'batched':
        typeStats.batched++;
        break;
      case 'deduplicated':
        typeStats.deduplicated++;
        break;
      case 'cache_hit':
        typeStats.cacheHits++;
        break;
    }
  }

  /**
   * Génère un identifiant unique
   */
  private generateRequestId(): string {
    return `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Retourne les statistiques de l'optimiseur
   */
  getStats(): OptimizerStats {
    // Calculer la réduction des appels API
    const totalOptimized = this.stats.batchedRequests + this.stats.deduplicatedRequests + this.stats.cacheHits;
    this.stats.apiCallReduction = this.stats.totalRequests > 0 
      ? (totalOptimized / this.stats.totalRequests) * 100 
      : 0;

    return { ...this.stats };
  }

  /**
   * Retourne la configuration actuelle
   */
  getConfig(): RequestOptimizerConfig {
    return { ...this.config };
  }

  /**
   * Met à jour la configuration
   */
  updateConfig(newConfig: Partial<RequestOptimizerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Remet à zéro les statistiques
   */
  resetStats(): void {
    this.stats = {
      totalRequests: 0,
      batchedRequests: 0,
      deduplicatedRequests: 0,
      cacheHits: 0,
      apiCallReduction: 0,
      averageProcessingTime: 0,
      byType: {}
    };
  }

  /**
   * Nettoie les ressources
   */
  cleanup(): void {
    // Nettoyer les timers
    this.batchTimers.forEach(timer => clearTimeout(timer));
    this.batchTimers.clear();
    
    // Nettoyer l'interval de nettoyage du cache
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    // Rejeter les requêtes en attente
    this.pendingRequests.forEach(batch => {
      batch.forEach(request => {
        request.reject(new Error('Request optimizer cleanup - request cancelled'));
      });
    });
    this.pendingRequests.clear();
    
    // Nettoyer le cache
    this.resultCache.clear();
  }
}

// Factory function pour créer un optimiseur avec rate limiter
export function createQlooRequestOptimizer(
  rateLimiterConfig?: Partial<import('./qloo-rate-limiter').RateLimiterConfig>,
  optimizerConfig?: Partial<RequestOptimizerConfig>
): QlooRequestOptimizer {
  const rateLimiter = new QlooRateLimiter(rateLimiterConfig);
  return new QlooRequestOptimizer(rateLimiter, optimizerConfig);
}