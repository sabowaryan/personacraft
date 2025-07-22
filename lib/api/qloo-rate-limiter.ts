// Rate Limiter pour l'API Qloo avec gestion intelligente des limites et optimisation des requêtes
// Implémente le respect des limites de taux, backoff exponentiel et batching des requêtes

import type { QlooCompliantError, QlooErrorType } from '@/lib/types/qloo-compliant';

/**
 * Configuration du rate limiter
 */
export interface RateLimiterConfig {
  /** Nombre maximum de requêtes par minute */
  requestsPerMinute: number;
  /** Nombre maximum de requêtes par heure */
  requestsPerHour: number;
  /** Fenêtre de temps pour le comptage (en millisecondes) */
  windowMs: number;
  /** Configuration du backoff exponentiel */
  backoff: {
    /** Délai de base en millisecondes */
    baseDelay: number;
    /** Délai maximum en millisecondes */
    maxDelay: number;
    /** Multiplicateur pour le backoff */
    multiplier: number;
    /** Nombre maximum de tentatives */
    maxAttempts: number;
    /** Activation du jitter pour éviter le thundering herd */
    jitterEnabled: boolean;
  };
  /** Configuration du batching */
  batching: {
    /** Taille maximale d'un batch */
    maxBatchSize: number;
    /** Délai d'attente pour former un batch (en millisecondes) */
    batchDelay: number;
    /** Types de requêtes éligibles au batching */
    eligibleTypes: string[];
  };
}

/**
 * Informations sur une requête en attente
 */
export interface PendingRequest {
  /** Identifiant unique de la requête */
  id: string;
  /** Type de requête */
  type: string;
  /** Paramètres de la requête */
  params: any;
  /** Timestamp de création */
  timestamp: number;
  /** Fonction de résolution */
  resolve: (value: any) => void;
  /** Fonction de rejet */
  reject: (error: any) => void;
  /** Nombre de tentatives */
  attempts: number;
}

/**
 * Statistiques du rate limiter
 */
export interface RateLimiterStats {
  /** Nombre total de requêtes traitées */
  totalRequests: number;
  /** Nombre de requêtes acceptées */
  acceptedRequests: number;
  /** Nombre de requêtes rejetées */
  rejectedRequests: number;
  /** Nombre de requêtes en attente */
  pendingRequests: number;
  /** Nombre de requêtes batchées */
  batchedRequests: number;
  /** Nombre de backoffs effectués */
  backoffCount: number;
  /** Temps d'attente moyen */
  averageWaitTime: number;
  /** Taux de succès */
  successRate: number;
  /** Statistiques par endpoint */
  byEndpoint: Record<string, {
    requests: number;
    accepted: number;
    rejected: number;
    averageWaitTime: number;
  }>;
}

/**
 * Fenêtre glissante pour le comptage des requêtes
 */
class SlidingWindow {
  private requests: number[] = [];
  private windowMs: number;

  constructor(windowMs: number) {
    this.windowMs = windowMs;
  }

  /**
   * Ajoute une requête à la fenêtre
   */
  addRequest(): void {
    const now = Date.now();
    this.requests.push(now);
    this.cleanup();
  }

  /**
   * Retourne le nombre de requêtes dans la fenêtre actuelle
   */
  getCount(): number {
    this.cleanup();
    return this.requests.length;
  }

  /**
   * Nettoie les requêtes expirées
   */
  private cleanup(): void {
    const now = Date.now();
    const cutoff = now - this.windowMs;
    this.requests = this.requests.filter(timestamp => timestamp > cutoff);
  }

  /**
   * Retourne le temps jusqu'à la prochaine fenêtre
   */
  getTimeToNextWindow(): number {
    if (this.requests.length === 0) return 0;
    const oldest = Math.min(...this.requests);
    return Math.max(0, this.windowMs - (Date.now() - oldest));
  }
}

/**
 * Gestionnaire de rate limiting pour l'API Qloo
 */
export class QlooRateLimiter {
  private config: RateLimiterConfig;
  private minuteWindow: SlidingWindow;
  private hourWindow: SlidingWindow;
  private pendingRequests = new Map<string, PendingRequest>();
  private batchQueue = new Map<string, PendingRequest[]>();
  private batchTimers = new Map<string, NodeJS.Timeout>();
  private stats: RateLimiterStats;
  private lastRateLimitReset: number = 0;
  private rateLimitRemaining: number = 0;

  constructor(config?: Partial<RateLimiterConfig>) {
    this.config = {
      requestsPerMinute: 60,
      requestsPerHour: 1000,
      windowMs: 60 * 1000, // 1 minute
      backoff: {
        baseDelay: 1000,
        maxDelay: 30000,
        multiplier: 2,
        maxAttempts: 5,
        jitterEnabled: true
      },
      batching: {
        maxBatchSize: 10,
        batchDelay: 100,
        eligibleTypes: ['search', 'entity_lookup', 'tag_validation']
      },
      ...config
    };

    this.minuteWindow = new SlidingWindow(this.config.windowMs);
    this.hourWindow = new SlidingWindow(60 * 60 * 1000); // 1 heure

    this.stats = {
      totalRequests: 0,
      acceptedRequests: 0,
      rejectedRequests: 0,
      pendingRequests: 0,
      batchedRequests: 0,
      backoffCount: 0,
      averageWaitTime: 0,
      successRate: 0,
      byEndpoint: {}
    };
  }

  /**
   * Vérifie si une requête peut être exécutée immédiatement
   */
  async checkLimit(endpoint: string): Promise<boolean> {
    const minuteCount = this.minuteWindow.getCount();
    const hourCount = this.hourWindow.getCount();

    // Vérifier les limites
    if (minuteCount >= this.config.requestsPerMinute) {
      return false;
    }

    if (hourCount >= this.config.requestsPerHour) {
      return false;
    }

    return true;
  }

  /**
   * Attend qu'un slot soit disponible pour l'endpoint
   */
  async waitForSlot(endpoint: string): Promise<void> {
    const canProceed = await this.checkLimit(endpoint);
    
    if (canProceed) {
      this.recordRequest(endpoint);
      return;
    }

    // Calculer le temps d'attente
    const minuteWait = this.minuteWindow.getTimeToNextWindow();
    const hourWait = this.hourWindow.getTimeToNextWindow();
    const waitTime = Math.min(minuteWait, hourWait);

    if (waitTime > 0) {
      await this.sleep(waitTime);
      return this.waitForSlot(endpoint);
    }
  }

  /**
   * Met à jour les limites basées sur les headers de réponse
   */
  updateLimits(headers: Record<string, string>): void {
    const remaining = headers['x-ratelimit-remaining'];
    const reset = headers['x-ratelimit-reset'];

    if (remaining) {
      this.rateLimitRemaining = parseInt(remaining, 10);
    }

    if (reset) {
      this.lastRateLimitReset = parseInt(reset, 10) * 1000; // Convert to milliseconds
    }
  }

  /**
   * Exécute une requête avec gestion du rate limiting
   */
  async executeRequest<T>(
    endpoint: string,
    requestFn: () => Promise<T>,
    options: {
      type?: string;
      params?: any;
      enableBatching?: boolean;
    } = {}
  ): Promise<T> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    this.stats.totalRequests++;
    this.updateEndpointStats(endpoint, 'request');

    try {
      // Vérifier si la requête peut être batchée
      if (options.enableBatching && this.canBatch(options.type || 'default')) {
        return this.addToBatch<T>(endpoint, requestFn, options, requestId);
      }

      // Attendre un slot disponible
      await this.waitForSlot(endpoint);

      // Exécuter la requête
      const result = await requestFn();

      this.stats.acceptedRequests++;
      this.updateEndpointStats(endpoint, 'accepted');
      this.updateAverageWaitTime(Date.now() - startTime);

      return result;

    } catch (error: any) {
      // Gérer les erreurs de rate limiting
      if (this.isRateLimitError(error)) {
        return this.handleRateLimitError<T>(endpoint, requestFn, options, requestId);
      }

      this.stats.rejectedRequests++;
      this.updateEndpointStats(endpoint, 'rejected');
      throw error;
    }
  }

  /**
   * Gère les erreurs de rate limiting avec backoff exponentiel
   */
  private async handleRateLimitError<T>(
    endpoint: string,
    requestFn: () => Promise<T>,
    options: any,
    requestId: string,
    attempt: number = 1
  ): Promise<T> {
    if (attempt > this.config.backoff.maxAttempts) {
      throw new Error(`Max retry attempts exceeded for request ${requestId}`);
    }

    this.stats.backoffCount++;
    const delay = this.calculateBackoffDelay(attempt);

    await this.sleep(delay);

    try {
      const result = await requestFn();
      
      this.stats.acceptedRequests++;
      this.updateEndpointStats(endpoint, 'accepted');
      
      return result;
    } catch (error: any) {
      if (this.isRateLimitError(error)) {
        return this.handleRateLimitError(endpoint, requestFn, options, requestId, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Calcule le délai de backoff exponentiel
   */
  private calculateBackoffDelay(attempt: number): number {
    const { baseDelay, maxDelay, multiplier, jitterEnabled } = this.config.backoff;
    
    let delay = Math.min(baseDelay * Math.pow(multiplier, attempt - 1), maxDelay);
    
    if (jitterEnabled) {
      // Ajouter un jitter de ±25% pour éviter le thundering herd
      const jitter = delay * 0.25 * (Math.random() * 2 - 1);
      delay += jitter;
    }
    
    return Math.max(0, delay);
  }

  /**
   * Vérifie si une requête peut être batchée
   */
  private canBatch(type: string): boolean {
    return this.config.batching.eligibleTypes.includes(type);
  }

  /**
   * Ajoute une requête au batch
   */
  private async addToBatch<T>(
    endpoint: string,
    requestFn: () => Promise<T>,
    options: any,
    requestId: string
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const request: PendingRequest = {
        id: requestId,
        type: options.type || 'default',
        params: options.params,
        timestamp: Date.now(),
        resolve,
        reject,
        attempts: 0
      };

      const batchKey = `${endpoint}:${options.type || 'default'}`;
      
      if (!this.batchQueue.has(batchKey)) {
        this.batchQueue.set(batchKey, []);
      }

      const batch = this.batchQueue.get(batchKey)!;
      batch.push(request);

      this.stats.pendingRequests++;

      // Programmer l'exécution du batch
      this.scheduleBatchExecution(batchKey, endpoint, requestFn);
    });
  }

  /**
   * Programme l'exécution d'un batch
   */
  private scheduleBatchExecution<T>(
    batchKey: string,
    endpoint: string,
    requestFn: () => Promise<T>
  ): void {
    // Annuler le timer existant s'il y en a un
    if (this.batchTimers.has(batchKey)) {
      clearTimeout(this.batchTimers.get(batchKey)!);
    }

    const timer = setTimeout(async () => {
      await this.executeBatch(batchKey, endpoint, requestFn);
    }, this.config.batching.batchDelay);

    this.batchTimers.set(batchKey, timer);

    // Exécuter immédiatement si le batch est plein
    const batch = this.batchQueue.get(batchKey);
    if (batch && batch.length >= this.config.batching.maxBatchSize) {
      clearTimeout(timer);
      this.batchTimers.delete(batchKey);
      this.executeBatch(batchKey, endpoint, requestFn);
    }
  }

  /**
   * Exécute un batch de requêtes
   */
  private async executeBatch<T>(
    batchKey: string,
    endpoint: string,
    requestFn: () => Promise<T>
  ): Promise<void> {
    const batch = this.batchQueue.get(batchKey);
    if (!batch || batch.length === 0) return;

    this.batchQueue.delete(batchKey);
    this.batchTimers.delete(batchKey);

    this.stats.batchedRequests += batch.length;
    this.stats.pendingRequests -= batch.length;

    try {
      await this.waitForSlot(endpoint);
      
      // Pour cette implémentation, on exécute les requêtes individuellement
      // Dans une vraie implémentation, on pourrait optimiser avec des requêtes batch réelles
      for (const request of batch) {
        try {
          const result = await requestFn();
          request.resolve(result);
          this.stats.acceptedRequests++;
        } catch (error) {
          request.reject(error);
          this.stats.rejectedRequests++;
        }
      }
    } catch (error) {
      // Rejeter toutes les requêtes du batch
      batch.forEach(request => request.reject(error));
      this.stats.rejectedRequests += batch.length;
    }
  }

  /**
   * Vérifie si une erreur est liée au rate limiting
   */
  private isRateLimitError(error: any): boolean {
    return error?.type === 'rate_limit_error' || 
           error?.status === 429 ||
           error?.code === 'RATE_LIMIT_EXCEEDED';
  }

  /**
   * Enregistre une requête dans les fenêtres glissantes
   */
  private recordRequest(endpoint: string): void {
    this.minuteWindow.addRequest();
    this.hourWindow.addRequest();
  }

  /**
   * Met à jour les statistiques par endpoint
   */
  private updateEndpointStats(endpoint: string, type: 'request' | 'accepted' | 'rejected'): void {
    if (!this.stats.byEndpoint[endpoint]) {
      this.stats.byEndpoint[endpoint] = {
        requests: 0,
        accepted: 0,
        rejected: 0,
        averageWaitTime: 0
      };
    }

    const endpointStats = this.stats.byEndpoint[endpoint];
    
    switch (type) {
      case 'request':
        endpointStats.requests++;
        break;
      case 'accepted':
        endpointStats.accepted++;
        break;
      case 'rejected':
        endpointStats.rejected++;
        break;
    }
  }

  /**
   * Met à jour le temps d'attente moyen
   */
  private updateAverageWaitTime(waitTime: number): void {
    const totalRequests = this.stats.acceptedRequests + this.stats.rejectedRequests;
    if (totalRequests === 1) {
      this.stats.averageWaitTime = waitTime;
    } else {
      this.stats.averageWaitTime = (this.stats.averageWaitTime * (totalRequests - 1) + waitTime) / totalRequests;
    }
  }

  /**
   * Génère un identifiant unique pour une requête
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Utilitaire pour attendre
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retourne les statistiques du rate limiter
   */
  getStats(): RateLimiterStats {
    const totalRequests = this.stats.acceptedRequests + this.stats.rejectedRequests;
    this.stats.successRate = totalRequests > 0 ? this.stats.acceptedRequests / totalRequests : 0;
    
    return { ...this.stats };
  }

  /**
   * Retourne la configuration actuelle
   */
  getConfig(): RateLimiterConfig {
    return { ...this.config };
  }

  /**
   * Met à jour la configuration
   */
  updateConfig(newConfig: Partial<RateLimiterConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Remet à zéro les statistiques
   */
  resetStats(): void {
    this.stats = {
      totalRequests: 0,
      acceptedRequests: 0,
      rejectedRequests: 0,
      pendingRequests: 0,
      batchedRequests: 0,
      backoffCount: 0,
      averageWaitTime: 0,
      successRate: 0,
      byEndpoint: {}
    };
  }

  /**
   * Nettoie les ressources (timers, etc.)
   */
  cleanup(): void {
    // Nettoyer tous les timers de batch
    this.batchTimers.forEach(timer => clearTimeout(timer));
    this.batchTimers.clear();
    
    // Rejeter toutes les requêtes en attente
    this.batchQueue.forEach(batch => {
      batch.forEach(request => {
        request.reject(new Error('Rate limiter cleanup - request cancelled'));
      });
    });
    this.batchQueue.clear();
    
    this.pendingRequests.clear();
  }
}

// Instance par défaut du rate limiter
let defaultRateLimiter: QlooRateLimiter | null = null;

/**
 * Retourne l'instance par défaut du rate limiter
 */
export function getQlooRateLimiter(): QlooRateLimiter {
  if (!defaultRateLimiter) {
    defaultRateLimiter = new QlooRateLimiter();
  }
  return defaultRateLimiter;
}