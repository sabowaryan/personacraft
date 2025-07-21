// Service de gestion des insights Qloo conforme aux spécifications officielles
// Implémente les méthodes getInsights avec validation complète des paramètres

import type {
  InsightsParams,
  QlooInsightsResponse,
  QlooCompliantError,
  QlooResponseStatus,
  EntityUrn,
  ParamsValidationResult
} from '@/lib/types/qloo-compliant';
import { QlooErrorType } from '@/lib/types/qloo-compliant';

/**
 * Résultat de validation des paramètres d'insights
 */
export interface InsightsParamsValidationResult extends ParamsValidationResult {
  /** Paramètres normalisés et validés */
  normalized_params: InsightsParams;
  /** Suggestions d'amélioration */
  suggestions?: string[];
}

/**
 * Service de gestion des insights Qloo
 * Implémente toutes les opérations liées aux insights selon les spécifications API
 */
export class QlooInsightsService {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(apiKey: string, baseUrl: string = 'https://hackathon.api.qloo.com', timeout: number = 10000) {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('API key is required for Qloo Insights Service');
    }
    
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Récupère les insights via l'endpoint /v2/insights
   * Conforme aux spécifications Qloo avec validation complète des paramètres
   */
  async getInsights(params: InsightsParams): Promise<QlooInsightsResponse> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    try {
      // Validation des paramètres
      const validationResult = this.validateParams(params);
      if (!validationResult.valid) {
        throw this.createValidationError(validationResult.errors, requestId);
      }

      // Utiliser les paramètres normalisés
      const normalizedParams = validationResult.normalized_params;

      const url = new URL('/v2/insights', this.baseUrl);
      
      // Ajouter les paramètres à l'URL
      this.addParamsToUrl(url, normalizedParams);

      const response = await this.makeHttpRequest(url.toString());
      const processingTime = Date.now() - startTime;

      return this.parseInsightsResponse(response.data, {
        processing_time: processingTime,
        request_id: requestId,
        original_params: params,
        normalized_params: normalizedParams
      });

    } catch (error) {
      throw this.handleInsightsError(error, 'getInsights', requestId);
    }
  }

  /**
   * Valide les paramètres d'insights selon les spécifications Qloo
   * Effectue une validation complète avec normalisation des paramètres
   */
  validateParams(params: InsightsParams): InsightsParamsValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validation du paramètre obligatoire filter.type
    if (!params['filter.type']) {
      errors.push('filter.type is required according to Qloo API specifications');
    } else if (!this.isValidEntityUrn(params['filter.type'])) {
      errors.push(`Invalid filter.type: ${params['filter.type']}. Must be a valid EntityUrn.`);
      suggestions.push('Use one of: urn:entity:brand, urn:entity:artist, urn:entity:movie, urn:entity:tv_show, urn:entity:book');
    }

    // Validation des paramètres de signal
    this.validateSignalParams(params, errors, warnings, suggestions);

    // Validation des paramètres de filtre
    this.validateFilterParams(params, errors, warnings, suggestions);

    // Validation des paramètres de configuration
    this.validateConfigParams(params, errors, warnings, suggestions);

    // Validation de la cohérence globale
    this.validateParamsCoherence(params, errors, warnings, suggestions);

    // Normalisation des paramètres - always normalize regardless of validation errors
    const normalized_params = this.normalizeParams(params);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      normalized_params
    };
  }

  /**
   * Valide les paramètres de signal (signal.*)
   */
  private validateSignalParams(
    params: InsightsParams, 
    errors: string[], 
    warnings: string[], 
    suggestions: string[]
  ): void {
    // Validation signal.interests.entities
    if (params['signal.interests.entities'] !== undefined) {
      if (!Array.isArray(params['signal.interests.entities'])) {
        errors.push('signal.interests.entities must be an array of entity IDs');
      } else {
        if (params['signal.interests.entities'].length === 0) {
          warnings.push('signal.interests.entities is empty');
        } else if (params['signal.interests.entities'].length > 50) {
          warnings.push('signal.interests.entities has more than 50 items, may impact performance');
          suggestions.push('Consider limiting to the most relevant entities (max 20-30)');
        }
        
        // Validation des IDs d'entités - allow normalization to handle empty strings
        params['signal.interests.entities'].forEach((entityId, index) => {
          if (typeof entityId !== 'string') {
            errors.push(`signal.interests.entities[${index}] must be a string`);
          }
        });
      }
    }

    // Validation signal.interests.tags
    if (params['signal.interests.tags'] !== undefined) {
      if (!Array.isArray(params['signal.interests.tags'])) {
        errors.push('signal.interests.tags must be an array of tag IDs');
      } else {
        if (params['signal.interests.tags'].length === 0) {
          warnings.push('signal.interests.tags is empty');
        } else if (params['signal.interests.tags'].length > 100) {
          warnings.push('signal.interests.tags has more than 100 items, may impact performance');
          suggestions.push('Consider limiting to the most relevant tags (max 50)');
        }

        // Validation des IDs de tags - allow normalization to handle empty strings
        params['signal.interests.tags'].forEach((tagId, index) => {
          if (typeof tagId !== 'string') {
            errors.push(`signal.interests.tags[${index}] must be a string`);
          }
        });
      }
    }

    // Validation signal.demographics.audiences
    if (params['signal.demographics.audiences'] !== undefined) {
      if (!Array.isArray(params['signal.demographics.audiences'])) {
        errors.push('signal.demographics.audiences must be an array of audience IDs');
      } else {
        if (params['signal.demographics.audiences'].length === 0) {
          warnings.push('signal.demographics.audiences is empty');
        } else if (params['signal.demographics.audiences'].length > 20) {
          warnings.push('signal.demographics.audiences has more than 20 items, may impact performance');
          suggestions.push('Consider limiting to the most relevant audiences (max 10)');
        }

        // Validation des IDs d'audiences - allow normalization to handle empty strings
        params['signal.demographics.audiences'].forEach((audienceId, index) => {
          if (typeof audienceId !== 'string') {
            errors.push(`signal.demographics.audiences[${index}] must be a string`);
          }
        });
      }
    }
  }

  /**
   * Valide les paramètres de filtre (filter.*)
   */
  private validateFilterParams(
    params: InsightsParams, 
    errors: string[], 
    warnings: string[], 
    suggestions: string[]
  ): void {
    // Validation filter.tags
    if (params['filter.tags'] !== undefined) {
      if (!Array.isArray(params['filter.tags'])) {
        errors.push('filter.tags must be an array of tag IDs');
      } else {
        if (params['filter.tags'].length === 0) {
          warnings.push('filter.tags is empty');
        } else if (params['filter.tags'].length > 50) {
          warnings.push('filter.tags has more than 50 items, may impact performance');
        }

        params['filter.tags'].forEach((tagId, index) => {
          if (typeof tagId !== 'string') {
            errors.push(`filter.tags[${index}] must be a string`);
          }
        });
      }
    }

    // Validation filter.entities
    if (params['filter.entities'] !== undefined) {
      if (!Array.isArray(params['filter.entities'])) {
        errors.push('filter.entities must be an array of entity IDs');
      } else {
        if (params['filter.entities'].length === 0) {
          warnings.push('filter.entities is empty');
        } else if (params['filter.entities'].length > 30) {
          warnings.push('filter.entities has more than 30 items, may impact performance');
        }

        params['filter.entities'].forEach((entityId, index) => {
          if (typeof entityId !== 'string') {
            errors.push(`filter.entities[${index}] must be a string`);
          }
        });
      }
    }

    // Validation filter.audiences
    if (params['filter.audiences'] !== undefined) {
      if (!Array.isArray(params['filter.audiences'])) {
        errors.push('filter.audiences must be an array of audience IDs');
      } else {
        if (params['filter.audiences'].length === 0) {
          warnings.push('filter.audiences is empty');
        } else if (params['filter.audiences'].length > 10) {
          warnings.push('filter.audiences has more than 10 items, may impact performance');
        }

        params['filter.audiences'].forEach((audienceId, index) => {
          if (typeof audienceId !== 'string') {
            errors.push(`filter.audiences[${index}] must be a string`);
          }
        });
      }
    }
  }

  /**
   * Valide les paramètres de configuration
   */
  private validateConfigParams(
    params: InsightsParams, 
    errors: string[], 
    warnings: string[], 
    suggestions: string[]
  ): void {
    // Validation limit
    if (params.limit !== undefined) {
      if (!Number.isInteger(params.limit) || params.limit < 1 || params.limit > 100) {
        errors.push('limit must be an integer between 1 and 100');
      } else if (params.limit > 50) {
        warnings.push('High limit value may impact response time');
        suggestions.push('Consider using pagination for large result sets');
      }
    }

    // Validation min_confidence
    if (params.min_confidence !== undefined) {
      if (typeof params.min_confidence !== 'number' || params.min_confidence < 0 || params.min_confidence > 1) {
        errors.push('min_confidence must be a number between 0 and 1');
      } else if (params.min_confidence > 0.9) {
        warnings.push('Very high confidence threshold may result in few results');
        suggestions.push('Consider lowering min_confidence to 0.7-0.8 for better results');
      }
    }

    // Validation language
    if (params.language !== undefined) {
      const supportedLanguages = ['en', 'fr', 'es', 'de', 'it', 'pt'];
      if (!supportedLanguages.includes(params.language)) {
        errors.push(`Unsupported language: ${params.language}. Supported: ${supportedLanguages.join(', ')}`);
      }
    }

    // Validation region
    if (params.region !== undefined) {
      if (typeof params.region !== 'string' || params.region.trim() === '') {
        errors.push('region must be a non-empty string');
      } else if (params.region.length > 10) {
        warnings.push('Region code seems unusually long');
        suggestions.push('Use standard region codes (e.g., US, EU, APAC)');
      }
    }
  }

  /**
   * Valide la cohérence globale des paramètres
   */
  private validateParamsCoherence(
    params: InsightsParams, 
    errors: string[], 
    warnings: string[], 
    suggestions: string[]
  ): void {
    // Vérifier qu'au moins un signal ou filtre est fourni (non vide)
    const hasSignals = !!(
      (params['signal.interests.entities'] && params['signal.interests.entities'].length > 0) ||
      (params['signal.interests.tags'] && params['signal.interests.tags'].length > 0) ||
      (params['signal.demographics.audiences'] && params['signal.demographics.audiences'].length > 0)
    );

    const hasFilters = !!(
      (params['filter.tags'] && params['filter.tags'].length > 0) ||
      (params['filter.entities'] && params['filter.entities'].length > 0) ||
      (params['filter.audiences'] && params['filter.audiences'].length > 0)
    );

    // Vérifier si au moins un paramètre signal/filter est défini (même vide)
    const hasAnySignalOrFilterDefined = !!(
      params['signal.interests.entities'] !== undefined ||
      params['signal.interests.tags'] !== undefined ||
      params['signal.demographics.audiences'] !== undefined ||
      params['filter.tags'] !== undefined ||
      params['filter.entities'] !== undefined ||
      params['filter.audiences'] !== undefined
    );

    // Only require signals/filters if none are defined at all
    // This allows for basic validation to pass with just filter.type
    if (!hasSignals && !hasFilters && !hasAnySignalOrFilterDefined) {
      // Only warn, don't error, for basic parameter validation
      warnings.push('No signals or filters provided - insights may be limited');
      suggestions.push('Add signal.interests.entities, signal.interests.tags, or signal.demographics.audiences for better insights');
    }

    // Vérifier la cohérence entre filter.type et les autres paramètres
    if (params['filter.type']) {
      const filterType = params['filter.type'];
      
      // Suggestions basées sur le type de filtre
      if (filterType === 'urn:entity:brand' && !params['signal.interests.entities']?.length) {
        suggestions.push('For brand insights, consider adding signal.interests.entities with related brands');
      }
      
      if (filterType === 'urn:entity:artist' && !params['signal.interests.tags']?.length) {
        suggestions.push('For artist insights, consider adding signal.interests.tags with music genres');
      }
    }

    // Avertissement si trop de paramètres sont fournis
    const totalParams = Object.keys(params).length;
    if (totalParams > 8) {
      warnings.push('Many parameters provided, may impact performance');
      suggestions.push('Focus on the most relevant signals and filters for better performance');
    }
  }

  /**
   * Normalise les paramètres pour l'API
   */
  private normalizeParams(params: InsightsParams): InsightsParams {
    const normalized: InsightsParams = {
      'filter.type': params['filter.type']
    };

    // Normaliser les arrays en supprimant les doublons et les valeurs vides
    if (params['signal.interests.entities'] && Array.isArray(params['signal.interests.entities'])) {
      normalized['signal.interests.entities'] = Array.from(new Set(
        params['signal.interests.entities'].filter(id => typeof id === 'string' && id.trim().length > 0)
      ));
    }

    if (params['signal.interests.tags'] && Array.isArray(params['signal.interests.tags'])) {
      normalized['signal.interests.tags'] = Array.from(new Set(
        params['signal.interests.tags'].filter(id => typeof id === 'string' && id.trim().length > 0)
      ));
    }

    if (params['signal.demographics.audiences'] && Array.isArray(params['signal.demographics.audiences'])) {
      normalized['signal.demographics.audiences'] = Array.from(new Set(
        params['signal.demographics.audiences'].filter(id => typeof id === 'string' && id.trim().length > 0)
      ));
    }

    if (params['filter.tags'] && Array.isArray(params['filter.tags'])) {
      normalized['filter.tags'] = Array.from(new Set(
        params['filter.tags'].filter(id => typeof id === 'string' && id.trim().length > 0)
      ));
    }

    if (params['filter.entities'] && Array.isArray(params['filter.entities'])) {
      normalized['filter.entities'] = Array.from(new Set(
        params['filter.entities'].filter(id => typeof id === 'string' && id.trim().length > 0)
      ));
    }

    if (params['filter.audiences'] && Array.isArray(params['filter.audiences'])) {
      normalized['filter.audiences'] = Array.from(new Set(
        params['filter.audiences'].filter(id => typeof id === 'string' && id.trim().length > 0)
      ));
    }

    // Normaliser les paramètres de configuration
    if (params.limit !== undefined) {
      normalized.limit = Math.max(1, Math.min(100, Math.floor(params.limit)));
    }

    if (params.min_confidence !== undefined) {
      normalized.min_confidence = Math.max(0, Math.min(1, params.min_confidence));
    }

    if (params.language) {
      normalized.language = params.language.toLowerCase() as any;
    }

    if (params.region) {
      normalized.region = params.region.trim().toUpperCase();
    }

    return normalized;
  }

  /**
   * Vérifie si une chaîne est un EntityUrn valide
   */
  private isValidEntityUrn(urn: string): urn is EntityUrn {
    const validUrns: EntityUrn[] = [
      'urn:entity:brand',
      'urn:entity:artist',
      'urn:entity:movie',
      'urn:entity:tv_show',
      'urn:entity:book',
      'urn:entity:song',
      'urn:entity:album',
      'urn:entity:restaurant',
      'urn:entity:product',
      'urn:entity:location'
    ];
    
    return validUrns.includes(urn as EntityUrn);
  }

  /**
   * Ajoute les paramètres à l'URL de requête
   */
  private addParamsToUrl(url: URL, params: InsightsParams): void {
    // Paramètre obligatoire
    url.searchParams.append('filter.type', params['filter.type']);

    // Paramètres de signal
    if (params['signal.interests.entities']?.length) {
      url.searchParams.append('signal.interests.entities', params['signal.interests.entities'].join(','));
    }
    if (params['signal.interests.tags']?.length) {
      url.searchParams.append('signal.interests.tags', params['signal.interests.tags'].join(','));
    }
    if (params['signal.demographics.audiences']?.length) {
      url.searchParams.append('signal.demographics.audiences', params['signal.demographics.audiences'].join(','));
    }

    // Paramètres de filtre
    if (params['filter.tags']?.length) {
      url.searchParams.append('filter.tags', params['filter.tags'].join(','));
    }
    if (params['filter.entities']?.length) {
      url.searchParams.append('filter.entities', params['filter.entities'].join(','));
    }
    if (params['filter.audiences']?.length) {
      url.searchParams.append('filter.audiences', params['filter.audiences'].join(','));
    }

    // Paramètres de configuration
    if (params.limit) {
      url.searchParams.append('limit', params.limit.toString());
    }
    if (params.min_confidence) {
      url.searchParams.append('min_confidence', params.min_confidence.toString());
    }
    if (params.language) {
      url.searchParams.append('language', params.language);
    }
    if (params.region) {
      url.searchParams.append('region', params.region);
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
   * Parse la réponse d'insights et la formate selon les spécifications
   */
  private parseInsightsResponse(
    data: any, 
    metadata: {
      processing_time: number;
      request_id: string;
      original_params: InsightsParams;
      normalized_params: InsightsParams;
    }
  ): QlooInsightsResponse {
    const entities = (data?.entities || [])
      .filter((entity: any) => entity && typeof entity === 'object')
      .map((entity: any) => ({
        id: entity.id || crypto.randomUUID(),
        name: entity.name || 'Unknown Entity',
        type: entity.type || metadata.normalized_params['filter.type'],
        confidence: entity.confidence || 0.8,
        metadata: entity.metadata || {},
        image_url: entity.image_url,
        description: entity.description,
        tags: entity.tags || []
      }));

    const tags = (data?.tags || [])
      .filter((tag: any) => tag && typeof tag === 'object')
      .map((tag: any) => ({
        id: tag.id || crypto.randomUUID(),
        name: tag.name || 'Unknown Tag',
        category: tag.category,
        weight: tag.weight || 0.5,
        description: tag.description,
        parent_tags: tag.parent_tags || [],
        child_tags: tag.child_tags || []
      }));

    const audiences = (data?.audiences || [])
      .filter((audience: any) => audience && typeof audience === 'object')
      .map((audience: any) => ({
        id: audience.id || crypto.randomUUID(),
        name: audience.name || 'Unknown Audience',
        demographics: audience.demographics,
        size: audience.size || 0,
        description: audience.description,
        interests: audience.interests || [],
        behaviors: audience.behaviors || []
      }));

    return {
      entities,
      tags,
      audiences,
      confidence: data?.confidence || 0.8,
      metadata: {
        request_id: metadata.request_id,
        processing_time: metadata.processing_time,
        data_source: 'qloo_api',
        api_version: 'hackathon-v1',
        timestamp: new Date().toISOString(),
        total_results: entities.length + tags.length + audiences.length,
        filters_applied: this.extractFiltersApplied(metadata.normalized_params),
        signals_used: this.extractSignalsUsed(metadata.normalized_params),
        cached: false
      },
      status: {
        code: 200,
        message: 'Insights retrieved successfully',
        success: true
      }
    };
  }

  /**
   * Extrait les filtres appliqués des paramètres
   */
  private extractFiltersApplied(params: InsightsParams): string[] {
    const filters: string[] = [];
    
    if (params['filter.type']) filters.push(`type:${params['filter.type']}`);
    if (params['filter.tags']?.length) filters.push(`tags:${params['filter.tags'].length}`);
    if (params['filter.entities']?.length) filters.push(`entities:${params['filter.entities'].length}`);
    if (params['filter.audiences']?.length) filters.push(`audiences:${params['filter.audiences'].length}`);
    if (params.limit) filters.push(`limit:${params.limit}`);
    if (params.min_confidence) filters.push(`min_confidence:${params.min_confidence}`);
    if (params.language) filters.push(`language:${params.language}`);
    if (params.region) filters.push(`region:${params.region}`);
    
    return filters;
  }

  /**
   * Extrait les signaux utilisés des paramètres
   */
  private extractSignalsUsed(params: InsightsParams): string[] {
    const signals: string[] = [];
    
    if (params['signal.interests.entities']?.length) {
      signals.push(`interest_entities:${params['signal.interests.entities'].length}`);
    }
    if (params['signal.interests.tags']?.length) {
      signals.push(`interest_tags:${params['signal.interests.tags'].length}`);
    }
    if (params['signal.demographics.audiences']?.length) {
      signals.push(`demographic_audiences:${params['signal.demographics.audiences'].length}`);
    }
    
    return signals;
  }

  /**
   * Crée une erreur de validation
   */
  private createValidationError(errors: string[], requestId: string): QlooCompliantError {
    return this.createCompliantError(
      QlooErrorType.VALIDATION,
      'INVALID_INSIGHTS_PARAMS',
      `Parameter validation failed: ${errors.join(', ')}`,
      { validation_errors: errors, request_id: requestId }
    );
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
          'Invalid API key for insights endpoint'
        );
      case 403:
        return this.createCompliantError(
          QlooErrorType.AUTHORIZATION,
          'FORBIDDEN',
          'API key does not have permission to access insights'
        );
      case 404:
        return this.createCompliantError(
          QlooErrorType.NOT_FOUND,
          'ENDPOINT_NOT_FOUND',
          'Insights endpoint not found'
        );
      case 422:
        return this.createCompliantError(
          QlooErrorType.VALIDATION,
          'INVALID_PARAMS',
          'Invalid parameters for insights request'
        );
      case 429:
        return this.createCompliantError(
          QlooErrorType.RATE_LIMIT,
          'RATE_LIMIT_EXCEEDED',
          'Rate limit exceeded for insights endpoint',
          undefined,
          true
        );
      default:
        if (status >= 500) {
          return this.createCompliantError(
            QlooErrorType.SERVER_ERROR,
            'SERVER_ERROR',
            `Server error on insights endpoint: ${status} ${statusText}`,
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
   * Gère les erreurs spécifiques aux opérations d'insights
   */
  private handleInsightsError(error: any, operation: string, requestId: string): QlooCompliantError {
    if (error.type && error.code) {
      // Erreur déjà formatée
      return error;
    }

    return this.createCompliantError(
      QlooErrorType.SERVER_ERROR,
      'INSIGHTS_OPERATION_FAILED',
      `Insights operation '${operation}' failed: ${error.message || 'Unknown error'}`,
      { operation, original_error: error.message, request_id: requestId }
    );
  }

  /**
   * Retourne les types d'entités supportés pour les insights
   */
  getSupportedEntityTypes(): EntityUrn[] {
    return [
      'urn:entity:brand',
      'urn:entity:artist',
      'urn:entity:movie',
      'urn:entity:tv_show',
      'urn:entity:book',
      'urn:entity:song',
      'urn:entity:album',
      'urn:entity:restaurant',
      'urn:entity:product',
      'urn:entity:location'
    ];
  }

  /**
   * Retourne les langues supportées
   */
  getSupportedLanguages(): Array<'en' | 'fr' | 'es' | 'de' | 'it' | 'pt'> {
    return ['en', 'fr', 'es', 'de', 'it', 'pt'];
  }

  /**
   * Valide qu'un type d'entité est supporté pour les insights
   */
  validateEntityType(type: string): boolean {
    return this.getSupportedEntityTypes().includes(type as EntityUrn);
  }

  /**
   * Valide qu'une langue est supportée
   */
  validateLanguage(language: string): boolean {
    return this.getSupportedLanguages().includes(language as any);
  }
}