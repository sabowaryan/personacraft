// Cache Manager pour l'API Qloo avec TTL et invalidation
// Implémente un système de cache intelligent avec stratégies différenciées par type de données

import type { EntityUrn } from '@/lib/types/qloo-compliant';

/**
 * Configuration du cache avec TTL spécifiques par type de données
 */
export interface CacheConfig {
  /** TTL par défaut en millisecondes */
  defaultTtl: number;
  /** Taille maximale du cache */
  maxSize: number;
  /** Stratégie d'éviction */
  strategy: 'lru' | 'fifo';
  /** TTL spécifiques par type de données */
  ttlByType: {
    entities: number;
    tags: number;
    audiences: number;
    insights: number;
    search: number;
  };
}

/**
 * Entrée de cache avec métadonnées
 */
export interface CacheEntry<T = any> {
  /** Données mises en cache */
  data: T;
  /** Timestamp de création */
  timestamp: number;
  /** TTL en millisecondes */
  ttl: number;
  /** Nombre d'accès */
  accessCount: number;
  /** Dernier accès */
  lastAccess: number;
  /** Taille approximative en bytes */
  size: number;
  /** Tags pour l'invalidation */
  tags: string[];
}

/**
 * Statistiques du cache
 */
export interface CacheStats {
  /** Nombre total d'entrées */
  totalEntries: number;
  /** Taille totale utilisée */
  totalSize: number;
  /** Nombre de hits */
  hits: number;
  /** Nombre de misses */
  misses: number;
  /** Taux de hit (0-1) */
  hitRate: number;
  /** Nombre d'évictions */
  evictions: number;
  /** Nombre d'expirations */
  expirations: number;
  /** Statistiques par type */
  byType: Record<string, {
    entries: number;
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  }>;
}

/**
 * Stratégies de clés de cache pour différents types de données Qloo
 */
export class CacheKeyStrategy {
  /**
   * Génère une clé pour les entités
   */
  static entity(type: EntityUrn, query: string, options?: any): string {
    const optionsHash = options ? this.hashObject(options) : '';
    return `entity:${type}:${this.normalizeQuery(query)}${optionsHash ? `:${optionsHash}` : ''}`;
  }

  /**
   * Génère une clé pour les tags
   */
  static tags(category?: string, query?: string, options?: any): string {
    const parts = ['tags'];
    if (category) parts.push(`cat:${category}`);
    if (query) parts.push(`q:${this.normalizeQuery(query)}`);
    if (options) parts.push(`opt:${this.hashObject(options)}`);
    return parts.join(':');
  }

  /**
   * Génère une clé pour les audiences
   */
  static audiences(filters?: any, options?: any): string {
    const parts = ['audiences'];
    if (filters) parts.push(`filters:${this.hashObject(filters)}`);
    if (options) parts.push(`opt:${this.hashObject(options)}`);
    return parts.join(':');
  }

  /**
   * Génère une clé pour les insights
   */
  static insights(params: any): string {
    // Normaliser les paramètres pour une clé cohérente
    const normalizedParams = this.normalizeInsightsParams(params);
    return `insights:${this.hashObject(normalizedParams)}`;
  }

  /**
   * Génère une clé pour les recherches
   */
  static search(query: string, type: EntityUrn, options?: any): string {
    const optionsHash = options ? this.hashObject(options) : '';
    return `search:${type}:${this.normalizeQuery(query)}${optionsHash ? `:${optionsHash}` : ''}`;
  }

  /**
   * Normalise une requête de recherche
   */
  private static normalizeQuery(query: string): string {
    return query.toLowerCase().trim().replace(/\s+/g, '_');
  }

  /**
   * Normalise les paramètres d'insights pour une clé cohérente
   */
  private static normalizeInsightsParams(params: any): any {
    const normalized: any = {};
    
    // Trier les clés pour une cohérence
    const sortedKeys = Object.keys(params).sort();
    
    for (const key of sortedKeys) {
      const value = params[key];
      if (Array.isArray(value)) {
        // Trier les tableaux pour la cohérence
        normalized[key] = [...value].sort();
      } else {
        normalized[key] = value;
      }
    }
    
    return normalized;
  }

  /**
   * Génère un hash d'un objet pour les clés de cache
   */
  private static hashObject(obj: any): string {
    const str = JSON.stringify(obj, Object.keys(obj).sort());
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

/**
 * Gestionnaire de cache intelligent pour l'API Qloo
 */
export class QlooCacheManager {
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private stats: CacheStats;
  private accessOrder: string[] = []; // Pour LRU

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      defaultTtl: 3600000, // 1 heure
      maxSize: 1000,
      strategy: 'lru',
      ttlByType: {
        entities: 3600000,    // 1 heure - données relativement stables
        tags: 7200000,        // 2 heures - très stables
        audiences: 86400000,  // 24 heures - très stables
        insights: 1800000,    // 30 minutes - peuvent changer plus souvent
        search: 3600000,      // 1 heure - résultats de recherche
      },
      ...config
    };

    this.stats = {
      totalEntries: 0,
      totalSize: 0,
      hits: 0,
      misses: 0,
      hitRate: 0,
      evictions: 0,
      expirations: 0,
      byType: {}
    };
  }

  /**
   * Récupère une valeur du cache
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.recordMiss(key);
      return null;
    }

    // Vérifier l'expiration
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      this.stats.expirations++;
      this.recordMiss(key);
      return null;
    }

    // Mettre à jour les statistiques d'accès
    entry.accessCount++;
    entry.lastAccess = Date.now();
    this.updateAccessOrder(key);
    this.recordHit(key);

    return entry.data as T;
  }

  /**
   * Stocke une valeur dans le cache
   */
  async set<T>(key: string, value: T, ttl?: number, tags: string[] = []): Promise<void> {
    const now = Date.now();
    const effectiveTtl = ttl || this.getTtlForKey(key);
    const size = this.estimateSize(value);

    // Vérifier si on doit faire de la place
    if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      this.evictEntries(1);
    }

    const entry: CacheEntry<T> = {
      data: value,
      timestamp: now,
      ttl: effectiveTtl,
      accessCount: 1,
      lastAccess: now,
      size,
      tags
    };

    // Supprimer l'ancienne entrée si elle existe
    if (this.cache.has(key)) {
      const oldEntry = this.cache.get(key)!;
      this.stats.totalSize -= oldEntry.size;
    } else {
      this.stats.totalEntries++;
    }

    this.cache.set(key, entry);
    this.stats.totalSize += size;
    this.updateAccessOrder(key);
  }

  /**
   * Invalide les entrées correspondant à un pattern
   */
  async invalidate(pattern: string): Promise<number> {
    let invalidatedCount = 0;
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    const keysToDelete: string[] = [];

    // Collect keys to delete first to avoid modifying while iterating
    this.cache.forEach((entry, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });

    // Delete collected keys
    for (const key of keysToDelete) {
      const entry = this.cache.get(key);
      if (entry) {
        this.cache.delete(key);
        this.removeFromAccessOrder(key);
        this.stats.totalEntries--;
        this.stats.totalSize -= entry.size;
        invalidatedCount++;
      }
    }

    return invalidatedCount;
  }

  /**
   * Invalide les entrées par tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    let invalidatedCount = 0;
    const keysToDelete: string[] = [];

    // Collect keys to delete first to avoid modifying while iterating
    this.cache.forEach((entry, key) => {
      if (entry.tags.some(tag => tags.includes(tag))) {
        keysToDelete.push(key);
      }
    });

    // Delete collected keys
    for (const key of keysToDelete) {
      const entry = this.cache.get(key);
      if (entry) {
        this.cache.delete(key);
        this.removeFromAccessOrder(key);
        this.stats.totalEntries--;
        this.stats.totalSize -= entry.size;
        invalidatedCount++;
      }
    }

    return invalidatedCount;
  }

  /**
   * Nettoie les entrées expirées
   */
  async cleanup(): Promise<number> {
    let cleanedCount = 0;
    const keysToDelete: string[] = [];

    // Collect expired keys first to avoid modifying while iterating
    this.cache.forEach((entry, key) => {
      if (this.isExpired(entry)) {
        keysToDelete.push(key);
      }
    });

    // Delete collected keys
    for (const key of keysToDelete) {
      const entry = this.cache.get(key);
      if (entry) {
        this.cache.delete(key);
        this.removeFromAccessOrder(key);
        this.stats.totalEntries--;
        this.stats.totalSize -= entry.size;
        this.stats.expirations++;
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Vide complètement le cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
    this.accessOrder = [];
    this.stats = {
      totalEntries: 0,
      totalSize: 0,
      hits: 0,
      misses: 0,
      hitRate: 0,
      evictions: 0,
      expirations: 0,
      byType: {}
    };
  }

  /**
   * Retourne les statistiques du cache
   */
  getStats(): CacheStats {
    this.updateStats();
    return { ...this.stats };
  }

  /**
   * Retourne la configuration du cache
   */
  getConfig(): CacheConfig {
    return { ...this.config };
  }

  /**
   * Met à jour la configuration du cache
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Vérifie si une entrée est expirée
   */
  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Détermine le TTL approprié pour une clé
   */
  private getTtlForKey(key: string): number {
    if (key.startsWith('entity:')) return this.config.ttlByType.entities;
    if (key.startsWith('tags:')) return this.config.ttlByType.tags;
    if (key.startsWith('audiences:')) return this.config.ttlByType.audiences;
    if (key.startsWith('insights:')) return this.config.ttlByType.insights;
    if (key.startsWith('search:')) return this.config.ttlByType.search;
    return this.config.defaultTtl;
  }

  /**
   * Estime la taille d'un objet en bytes
   */
  private estimateSize(value: any): number {
    try {
      return JSON.stringify(value).length * 2; // Approximation UTF-16
    } catch {
      return 1000; // Valeur par défaut si la sérialisation échoue
    }
  }

  /**
   * Évince des entrées selon la stratégie configurée
   */
  private evictEntries(count: number): void {
    if (this.config.strategy === 'lru') {
      this.evictLRU(count);
    } else {
      this.evictFIFO(count);
    }
  }

  /**
   * Éviction LRU (Least Recently Used)
   */
  private evictLRU(count: number): void {
    for (let i = 0; i < count && this.accessOrder.length > 0; i++) {
      const keyToEvict = this.accessOrder.shift()!;
      const entry = this.cache.get(keyToEvict);
      
      if (entry) {
        this.cache.delete(keyToEvict);
        this.stats.totalEntries--;
        this.stats.totalSize -= entry.size;
        this.stats.evictions++;
      }
    }
  }

  /**
   * Éviction FIFO (First In, First Out)
   */
  private evictFIFO(count: number): void {
    const entries: Array<[string, CacheEntry]> = [];
    
    // Collect all entries
    this.cache.forEach((entry, key) => {
      entries.push([key, entry]);
    });
    
    // Sort by timestamp (oldest first)
    entries.sort(([, a], [, b]) => a.timestamp - b.timestamp);

    for (let i = 0; i < count && i < entries.length; i++) {
      const [key, entry] = entries[i];
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      this.stats.totalEntries--;
      this.stats.totalSize -= entry.size;
      this.stats.evictions++;
    }
  }

  /**
   * Met à jour l'ordre d'accès pour LRU
   */
  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  /**
   * Supprime une clé de l'ordre d'accès
   */
  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  /**
   * Enregistre un hit de cache
   */
  private recordHit(key: string): void {
    this.stats.hits++;
    const type = this.getKeyType(key);
    if (!this.stats.byType[type]) {
      this.stats.byType[type] = { entries: 0, size: 0, hits: 0, misses: 0, hitRate: 0 };
    }
    this.stats.byType[type].hits++;
  }

  /**
   * Enregistre un miss de cache
   */
  private recordMiss(key: string): void {
    this.stats.misses++;
    const type = this.getKeyType(key);
    if (!this.stats.byType[type]) {
      this.stats.byType[type] = { entries: 0, size: 0, hits: 0, misses: 0, hitRate: 0 };
    }
    this.stats.byType[type].misses++;
  }

  /**
   * Détermine le type d'une clé
   */
  private getKeyType(key: string): string {
    const parts = key.split(':');
    return parts[0] || 'unknown';
  }

  /**
   * Met à jour les statistiques calculées
   */
  private updateStats(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;

    // Mettre à jour les statistiques par type
    for (const [type, typeStats] of Object.entries(this.stats.byType)) {
      const typeTotal = typeStats.hits + typeStats.misses;
      typeStats.hitRate = typeTotal > 0 ? typeStats.hits / typeTotal : 0;
      
      // Compter les entrées et la taille par type
      typeStats.entries = 0;
      typeStats.size = 0;
      
      this.cache.forEach((entry, key) => {
        if (this.getKeyType(key) === type) {
          typeStats.entries++;
          typeStats.size += entry.size;
        }
      });
    }
  }
}

// Instance par défaut du cache manager
let defaultCacheManager: QlooCacheManager | null = null;

/**
 * Retourne l'instance par défaut du cache manager
 */
export function getQlooCacheManager(): QlooCacheManager {
  if (!defaultCacheManager) {
    defaultCacheManager = new QlooCacheManager();
  }
  return defaultCacheManager;
}