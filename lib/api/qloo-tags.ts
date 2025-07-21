// Service de gestion des tags Qloo conforme aux spécifications officielles
// Implémente les méthodes getTagsByCategory, searchTags et validateTagIds

import type {
  QlooTag,
  TagSearchParams,
  TagSearchResult,
  QlooResponseStatus,
  QlooCompliantError
} from '@/lib/types/qloo-compliant';
import { QlooErrorType } from '@/lib/types/qloo-compliant';

/**
 * Paramètres pour la récupération de tags par catégorie
 */
export interface TagsByCategoryParams {
  /** Catégorie de tags à récupérer */
  category?: string;
  /** Nombre maximum de résultats */
  limit?: number;
  /** Langue pour les tags */
  language?: string;
  /** Score de confiance minimum */
  min_confidence?: number;
}

/**
 * Résultat de validation des IDs de tags
 */
export interface TagValidationResult {
  /** IDs de tags valides */
  valid_ids: string[];
  /** IDs de tags invalides */
  invalid_ids: string[];
  /** Tags trouvés avec leurs détails */
  found_tags: QlooTag[];
  /** Métadonnées de la validation */
  metadata: {
    total_checked: number;
    valid_count: number;
    invalid_count: number;
    processing_time: number;
    request_id: string;
  };
  /** Statut de la validation */
  status: QlooResponseStatus;
}

/**
 * Service de gestion des tags Qloo
 * Implémente toutes les opérations liées aux tags selon les spécifications API
 */
export class QlooTagsService {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(apiKey: string, baseUrl: string = 'https://hackathon.api.qloo.com', timeout: number = 10000) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Récupère les tags par catégorie via l'endpoint /v2/tags
   * Conforme aux spécifications Qloo pour la découverte de tags
   */
  async getTagsByCategory(params: TagsByCategoryParams = {}): Promise<TagSearchResult> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    try {
      const url = new URL('/v2/tags', this.baseUrl);
      
      // Ajouter les paramètres de requête
      if (params.category) {
        url.searchParams.append('category', params.category);
      }
      if (params.limit) {
        url.searchParams.append('limit', params.limit.toString());
      }
      if (params.language) {
        url.searchParams.append('language', params.language);
      }
      if (params.min_confidence) {
        url.searchParams.append('min_confidence', params.min_confidence.toString());
      }

      const response = await this.makeHttpRequest(url.toString());
      const processingTime = Date.now() - startTime;

      return this.parseTagsResponse(response.data, {
        category: params.category,
        total_results: response.data?.tags?.length || 0,
        processing_time: processingTime,
        request_id: requestId
      });

    } catch (error) {
      throw this.handleTagsError(error, 'getTagsByCategory', requestId);
    }
  }

  /**
   * Recherche des tags par terme de recherche
   * Utilise l'endpoint /v2/tags avec paramètre de recherche
   */
  async searchTags(params: TagSearchParams): Promise<TagSearchResult> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    try {
      const url = new URL('/v2/tags', this.baseUrl);
      
      // Ajouter les paramètres de recherche
      if (params.query) {
        url.searchParams.append('q', params.query);
      }
      if (params.category) {
        url.searchParams.append('category', params.category);
      }
      if (params.limit) {
        url.searchParams.append('limit', params.limit.toString());
      }
      if (params.language) {
        url.searchParams.append('language', params.language);
      }

      const response = await this.makeHttpRequest(url.toString());
      const processingTime = Date.now() - startTime;

      return this.parseTagsResponse(response.data, {
        query: params.query,
        category: params.category,
        total_results: response.data?.tags?.length || 0,
        processing_time: processingTime,
        request_id: requestId
      });

    } catch (error) {
      throw this.handleTagsError(error, 'searchTags', requestId);
    }
  }

  /**
   * Valide une liste d'IDs de tags pour s'assurer qu'ils sont valides
   * Utilise l'endpoint /v2/tags avec validation des IDs
   */
  async validateTagIds(tagIds: string[]): Promise<TagValidationResult> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    if (!tagIds || tagIds.length === 0) {
      return {
        valid_ids: [],
        invalid_ids: [],
        found_tags: [],
        metadata: {
          total_checked: 0,
          valid_count: 0,
          invalid_count: 0,
          processing_time: Date.now() - startTime,
          request_id: requestId
        },
        status: {
          code: 200,
          message: 'No tag IDs provided for validation',
          success: true,
          warnings: ['Empty tag IDs array provided']
        }
      };
    }

    try {
      // Valider les IDs par lots pour optimiser les appels API
      const batchSize = 50; // Limite raisonnable pour éviter les URLs trop longues
      const batches = this.chunkArray(tagIds, batchSize);
      const allValidIds: string[] = [];
      const allInvalidIds: string[] = [];
      const allFoundTags: QlooTag[] = [];

      for (const batch of batches) {
        const batchResult = await this.validateTagIdsBatch(batch, requestId);
        allValidIds.push(...batchResult.valid_ids);
        allInvalidIds.push(...batchResult.invalid_ids);
        allFoundTags.push(...batchResult.found_tags);
      }

      const processingTime = Date.now() - startTime;

      return {
        valid_ids: allValidIds,
        invalid_ids: allInvalidIds,
        found_tags: allFoundTags,
        metadata: {
          total_checked: tagIds.length,
          valid_count: allValidIds.length,
          invalid_count: allInvalidIds.length,
          processing_time: processingTime,
          request_id: requestId
        },
        status: {
          code: 200,
          message: `Validated ${tagIds.length} tag IDs`,
          success: true,
          warnings: allInvalidIds.length > 0 ? [`${allInvalidIds.length} invalid tag IDs found`] : undefined
        }
      };

    } catch (error) {
      throw this.handleTagsError(error, 'validateTagIds', requestId);
    }
  }

  /**
   * Valide un lot d'IDs de tags
   */
  private async validateTagIdsBatch(tagIds: string[], requestId: string): Promise<{
    valid_ids: string[];
    invalid_ids: string[];
    found_tags: QlooTag[];
  }> {
    const url = new URL('/v2/tags', this.baseUrl);
    url.searchParams.append('ids', tagIds.join(','));

    try {
      const response = await this.makeHttpRequest(url.toString());
      const foundTags: QlooTag[] = response.data?.tags || [];
      const foundIds = foundTags.map(tag => tag.id);
      const invalidIds = tagIds.filter(id => !foundIds.includes(id));

      return {
        valid_ids: foundIds,
        invalid_ids: invalidIds,
        found_tags: foundTags
      };

    } catch (error) {
      // En cas d'erreur, considérer tous les IDs comme invalides
      return {
        valid_ids: [],
        invalid_ids: tagIds,
        found_tags: []
      };
    }
  }

  /**
   * Effectue une requête HTTP avec authentification et gestion d'erreurs
   */
  private async makeHttpRequest(url: string): Promise<{ data: any; headers: Headers }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey,
          'User-Agent': 'PersonaCraft/1.0',
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw this.createHttpError(response.status, response.statusText, url);
      }

      const data = await response.json();
      return { data, headers: response.headers };

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw this.createCompliantError(
          QlooErrorType.NETWORK_ERROR,
          'TIMEOUT',
          `Request timeout after ${this.timeout}ms`
        );
      }
      
      throw error;
    }
  }

  /**
   * Parse la réponse des tags et la formate selon les spécifications
   */
  private parseTagsResponse(data: any, metadata: {
    query?: string;
    category?: string;
    total_results: number;
    processing_time: number;
    request_id: string;
  }): TagSearchResult {
    const tags: QlooTag[] = (data?.tags || []).map((tag: any) => ({
      id: tag.id || crypto.randomUUID(),
      name: tag.name || 'Unknown Tag',
      category: tag.category,
      weight: tag.weight || 0.5,
      description: tag.description,
      parent_tags: tag.parent_tags || [],
      child_tags: tag.child_tags || []
    }));

    return {
      tags,
      metadata,
      status: {
        code: 200,
        message: 'Tags retrieved successfully',
        success: true
      }
    };
  }

  /**
   * Crée une erreur HTTP appropriée selon le code de statut
   */
  private createHttpError(status: number, statusText: string, url: string): QlooCompliantError {
    switch (status) {
      case 401:
        return this.createCompliantError(
          QlooErrorType.AUTHENTICATION,
          'UNAUTHORIZED',
          'Invalid API key for tags endpoint'
        );
      case 403:
        return this.createCompliantError(
          QlooErrorType.AUTHORIZATION,
          'FORBIDDEN',
          'API key does not have permission to access tags'
        );
      case 404:
        return this.createCompliantError(
          QlooErrorType.NOT_FOUND,
          'ENDPOINT_NOT_FOUND',
          'Tags endpoint not found'
        );
      case 422:
        return this.createCompliantError(
          QlooErrorType.VALIDATION,
          'INVALID_PARAMS',
          'Invalid parameters for tags request'
        );
      case 429:
        return this.createCompliantError(
          QlooErrorType.RATE_LIMIT,
          'RATE_LIMIT_EXCEEDED',
          'Rate limit exceeded for tags endpoint',
          undefined,
          true
        );
      default:
        if (status >= 500) {
          return this.createCompliantError(
            QlooErrorType.SERVER_ERROR,
            'SERVER_ERROR',
            `Server error on tags endpoint: ${status} ${statusText}`,
            undefined,
            true
          );
        }
        return this.createCompliantError(
          QlooErrorType.NETWORK_ERROR,
          'HTTP_ERROR',
          `HTTP ${status}: ${statusText}`
        );
    }
  }

  /**
   * Crée une erreur conforme aux spécifications Qloo
   */
  private createCompliantError(
    type: QlooErrorType,
    code: string,
    message: string,
    details?: any,
    retryable: boolean = false
  ): QlooCompliantError {
    return {
      type,
      message,
      code,
      details,
      request_id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      retryable
    };
  }

  /**
   * Gère les erreurs spécifiques aux opérations de tags
   */
  private handleTagsError(error: any, operation: string, requestId: string): QlooCompliantError {
    if (error.type && error.code) {
      // Erreur déjà formatée
      return error;
    }

    return this.createCompliantError(
      QlooErrorType.SERVER_ERROR,
      'TAGS_OPERATION_FAILED',
      `Tags operation '${operation}' failed: ${error.message || 'Unknown error'}`,
      { operation, original_error: error.message }
    );
  }

  /**
   * Divise un tableau en chunks de taille spécifiée
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Retourne les catégories de tags supportées
   */
  getSupportedCategories(): string[] {
    return [
      'music',
      'movies',
      'books',
      'brands',
      'lifestyle',
      'food',
      'travel',
      'technology',
      'sports',
      'fashion',
      'art',
      'culture',
      'entertainment',
      'business',
      'health',
      'education'
    ];
  }

  /**
   * Valide qu'une catégorie est supportée
   */
  validateCategory(category: string): boolean {
    return this.getSupportedCategories().includes(category.toLowerCase());
  }
}