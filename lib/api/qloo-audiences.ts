// Service de gestion des audiences Qloo conforme aux spécifications officielles
// Implémente les méthodes getAudiences avec filtrage et validation

import type {
  QlooAudience,
  AudienceSearchParams,
  AudienceSearchResult,
  QlooResponseStatus,
  QlooCompliantError,
  QlooAudienceDemographics
} from '@/lib/types/qloo-compliant';
import { QlooErrorType } from '@/lib/types/qloo-compliant';

/**
 * Paramètres pour la récupération d'audiences avec filtres
 */
export interface AudienceFilters {
  /** Filtres démographiques */
  demographics?: Partial<QlooAudienceDemographics>;
  /** Intérêts à rechercher */
  interests?: string[];
  /** Taille minimum de l'audience */
  min_size?: number;
  /** Taille maximum de l'audience */
  max_size?: number;
  /** Nombre maximum de résultats */
  limit?: number;
  /** Langue pour les audiences */
  language?: string;
  /** Score de confiance minimum */
  min_confidence?: number;
}

/**
 * Résultat de validation des IDs d'audiences
 */
export interface AudienceValidationResult {
  /** IDs d'audiences valides */
  valid_ids: string[];
  /** IDs d'audiences invalides */
  invalid_ids: string[];
  /** Audiences trouvées avec leurs détails */
  found_audiences: QlooAudience[];
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
 * Service de gestion des audiences Qloo
 * Implémente toutes les opérations liées aux audiences selon les spécifications API
 */
export class QlooAudiencesService {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(apiKey: string, baseUrl: string = 'https://hackathon.api.qloo.com', timeout: number = 10000) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Récupère les audiences via l'endpoint /v2/audiences
   * Conforme aux spécifications Qloo pour la découverte d'audiences
   */
  async getAudiences(filters: AudienceFilters = {}): Promise<AudienceSearchResult> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    try {
      const url = new URL('/v2/audiences', this.baseUrl);

      // Ajouter les paramètres de filtrage
      this.addFiltersToUrl(url, filters);

      const response = await this.makeHttpRequest(url.toString());
      const processingTime = Date.now() - startTime;

      return this.parseAudiencesResponse(response.data, {
        total_results: response.data?.audiences?.length || 0,
        processing_time: processingTime,
        request_id: requestId
      });

    } catch (error) {
      throw this.handleAudiencesError(error, 'getAudiences', requestId);
    }
  }

  /**
   * Recherche des audiences avec paramètres spécifiques
   * Utilise l'endpoint /v2/audiences avec paramètres de recherche
   */
  async searchAudiences(params: AudienceSearchParams): Promise<AudienceSearchResult> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    try {
      const url = new URL('/v2/audiences', this.baseUrl);

      // Ajouter les paramètres de recherche
      if (params.demographics) {
        this.addDemographicsToUrl(url, params.demographics);
      }
      if (params.interests && params.interests.length > 0) {
        url.searchParams.append('interests', params.interests.join(','));
      }
      if (params.limit) {
        url.searchParams.append('limit', params.limit.toString());
      }
      if (params.language) {
        url.searchParams.append('language', params.language);
      }

      const response = await this.makeHttpRequest(url.toString());
      const processingTime = Date.now() - startTime;

      return this.parseAudiencesResponse(response.data, {
        total_results: response.data?.audiences?.length || 0,
        processing_time: processingTime,
        request_id: requestId
      });

    } catch (error) {
      throw this.handleAudiencesError(error, 'searchAudiences', requestId);
    }
  }

  /**
   * Valide une liste d'IDs d'audiences pour s'assurer qu'ils sont valides
   * Utilise l'endpoint /v2/audiences avec validation des IDs
   */
  async validateAudienceIds(audienceIds: string[]): Promise<AudienceValidationResult> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    if (!audienceIds || audienceIds.length === 0) {
      return {
        valid_ids: [],
        invalid_ids: [],
        found_audiences: [],
        metadata: {
          total_checked: 0,
          valid_count: 0,
          invalid_count: 0,
          processing_time: Date.now() - startTime,
          request_id: requestId
        },
        status: {
          code: 200,
          message: 'No audience IDs provided for validation',
          success: true,
          warnings: ['Empty audience IDs array provided']
        }
      };
    }

    try {
      // Valider les IDs par lots pour optimiser les appels API
      const batchSize = 50; // Limite raisonnable pour éviter les URLs trop longues
      const batches = this.chunkArray(audienceIds, batchSize);
      const allValidIds: string[] = [];
      const allInvalidIds: string[] = [];
      const allFoundAudiences: QlooAudience[] = [];

      for (const batch of batches) {
        const batchResult = await this.validateAudienceIdsBatch(batch);
        allValidIds.push(...batchResult.valid_ids);
        allInvalidIds.push(...batchResult.invalid_ids);
        allFoundAudiences.push(...batchResult.found_audiences);
      }

      const processingTime = Date.now() - startTime;

      return {
        valid_ids: allValidIds,
        invalid_ids: allInvalidIds,
        found_audiences: allFoundAudiences,
        metadata: {
          total_checked: audienceIds.length,
          valid_count: allValidIds.length,
          invalid_count: allInvalidIds.length,
          processing_time: processingTime,
          request_id: requestId
        },
        status: {
          code: 200,
          message: `Validated ${audienceIds.length} audience IDs`,
          success: true,
          warnings: allInvalidIds.length > 0 ? [`${allInvalidIds.length} invalid audience IDs found`] : undefined
        }
      };

    } catch (error) {
      throw this.handleAudiencesError(error, 'validateAudienceIds', requestId);
    }
  }

  /**
   * Extrait les métadonnées d'une audience
   * Analyse les données démographiques et comportementales
   */
  extractAudienceMetadata(audience: QlooAudience): {
    demographic_summary: string;
    key_interests: string[];
    estimated_reach: string;
    targeting_potential: 'high' | 'medium' | 'low';
  } {
    const demographics = audience.demographics;
    const interests = audience.interests || [];
    const size = audience.size || 0;

    // Résumé démographique
    let demographicSummary = 'General audience';
    if (demographics?.age_range) {
      demographicSummary = `Ages ${demographics.age_range.min}-${demographics.age_range.max}`;
    }
    if (demographics?.location?.country) {
      demographicSummary += ` in ${demographics.location.country}`;
    }

    // Potentiel de ciblage basé sur la taille et les données disponibles
    let targetingPotential: 'high' | 'medium' | 'low' = 'medium';
    if (size > 1000000 && interests.length > 3) {
      targetingPotential = 'high';
    } else if (size < 100000 || interests.length < 2) {
      targetingPotential = 'low';
    }

    // Estimation de la portée
    let estimatedReach = 'Unknown';
    if (size > 0) {
      if (size > 10000000) estimatedReach = 'Very Large (10M+)';
      else if (size > 1000000) estimatedReach = 'Large (1M-10M)';
      else if (size > 100000) estimatedReach = 'Medium (100K-1M)';
      else estimatedReach = 'Small (<100K)';
    }

    return {
      demographic_summary: demographicSummary,
      key_interests: interests.slice(0, 5), // Top 5 interests
      estimated_reach: estimatedReach,
      targeting_potential: targetingPotential
    };
  }

  /**
   * Ajoute les filtres à l'URL de requête
   */
  private addFiltersToUrl(url: URL, filters: AudienceFilters): void {
    if (filters.demographics) {
      this.addDemographicsToUrl(url, filters.demographics);
    }
    if (filters.interests && filters.interests.length > 0) {
      url.searchParams.append('interests', filters.interests.join(','));
    }
    if (filters.min_size) {
      url.searchParams.append('min_size', filters.min_size.toString());
    }
    if (filters.max_size) {
      url.searchParams.append('max_size', filters.max_size.toString());
    }
    if (filters.limit) {
      url.searchParams.append('limit', filters.limit.toString());
    }
    if (filters.language) {
      url.searchParams.append('language', filters.language);
    }
    if (filters.min_confidence) {
      url.searchParams.append('min_confidence', filters.min_confidence.toString());
    }
  }

  /**
   * Ajoute les paramètres démographiques à l'URL
   */
  private addDemographicsToUrl(url: URL, demographics: Partial<QlooAudienceDemographics>): void {
    if (demographics.age_range) {
      if (demographics.age_range.min) {
        url.searchParams.append('age_min', demographics.age_range.min.toString());
      }
      if (demographics.age_range.max) {
        url.searchParams.append('age_max', demographics.age_range.max.toString());
      }
    }
    if (demographics.gender_distribution) {
      const genders = Object.entries(demographics.gender_distribution)
        .filter(([_, value]) => value && value > 0)
        .map(([gender, _]) => gender);
      if (genders.length > 0) {
        url.searchParams.append('gender', genders.join(','));
      }
    }
    if (demographics.location) {
      if (demographics.location.country) {
        url.searchParams.append('country', demographics.location.country);
      }
      if (demographics.location.region) {
        url.searchParams.append('region', demographics.location.region);
      }
      if (demographics.location.city) {
        url.searchParams.append('city', demographics.location.city);
      }
    }
    if (demographics.income_level) {
      url.searchParams.append('income_level', demographics.income_level);
    }
    if (demographics.education_level) {
      url.searchParams.append('education_level', demographics.education_level);
    }
  }

  /**
   * Valide un lot d'IDs d'audiences
   */
  private async validateAudienceIdsBatch(audienceIds: string[]): Promise<{
    valid_ids: string[];
    invalid_ids: string[];
    found_audiences: QlooAudience[];
  }> {
    const url = new URL('/v2/audiences', this.baseUrl);
    url.searchParams.append('ids', audienceIds.join(','));

    try {
      const response = await this.makeHttpRequest(url.toString());
      const foundAudiences: QlooAudience[] = response.data?.audiences || [];
      const foundIds = foundAudiences.map(audience => audience.id);
      const invalidIds = audienceIds.filter(id => !foundIds.includes(id));

      return {
        valid_ids: foundIds,
        invalid_ids: invalidIds,
        found_audiences: foundAudiences
      };

    } catch (error) {
      // En cas d'erreur, considérer tous les IDs comme invalides
      return {
        valid_ids: [],
        invalid_ids: audienceIds,
        found_audiences: []
      };
    }
  }  /**

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
   * Parse la réponse des audiences et la formate selon les spécifications
   */
  private parseAudiencesResponse(data: any, metadata: {
    total_results: number;
    processing_time: number;
    request_id: string;
  }): AudienceSearchResult {
    const audiences: QlooAudience[] = (data?.audiences || []).map((audience: any) => ({
      id: audience.id || crypto.randomUUID(),
      name: audience.name || 'Unknown Audience',
      demographics: this.parseDemographics(audience.demographics),
      size: audience.size || 0,
      description: audience.description,
      interests: audience.interests || [],
      behaviors: audience.behaviors || []
    }));

    return {
      audiences,
      metadata,
      status: {
        code: 200,
        message: 'Audiences retrieved successfully',
        success: true
      }
    };
  }

  /**
   * Parse les données démographiques depuis la réponse API
   */
  private parseDemographics(demographics: any): QlooAudienceDemographics | undefined {
    if (!demographics) return undefined;

    return {
      age_range: demographics.age_range ? {
        min: demographics.age_range.min || 0,
        max: demographics.age_range.max || 100
      } : undefined,
      gender_distribution: demographics.gender_distribution ? {
        male: demographics.gender_distribution.male,
        female: demographics.gender_distribution.female,
        other: demographics.gender_distribution.other
      } : undefined,
      location: demographics.location ? {
        country: demographics.location.country,
        region: demographics.location.region,
        city: demographics.location.city
      } : undefined,
      income_level: demographics.income_level,
      education_level: demographics.education_level
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
          'Invalid API key for audiences endpoint'
        );
      case 403:
        return this.createCompliantError(
          QlooErrorType.AUTHORIZATION,
          'FORBIDDEN',
          'API key does not have permission to access audiences'
        );
      case 404:
        return this.createCompliantError(
          QlooErrorType.NOT_FOUND,
          'ENDPOINT_NOT_FOUND',
          'Audiences endpoint not found'
        );
      case 422:
        return this.createCompliantError(
          QlooErrorType.VALIDATION,
          'INVALID_PARAMS',
          'Invalid parameters for audiences request'
        );
      case 429:
        return this.createCompliantError(
          QlooErrorType.RATE_LIMIT,
          'RATE_LIMIT_EXCEEDED',
          'Rate limit exceeded for audiences endpoint',
          undefined,
          true
        );
      default:
        if (status >= 500) {
          return this.createCompliantError(
            QlooErrorType.SERVER_ERROR,
            'SERVER_ERROR',
            `Server error on audiences endpoint: ${status} ${statusText}`,
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
   * Gère les erreurs spécifiques aux opérations d'audiences
   */
  private handleAudiencesError(error: any, operation: string, requestId: string): QlooCompliantError {
    if (error.type && error.code) {
      // Erreur déjà formatée
      return error;
    }

    return this.createCompliantError(
      QlooErrorType.SERVER_ERROR,
      'AUDIENCES_OPERATION_FAILED',
      `Audiences operation '${operation}' failed: ${error.message || 'Unknown error'}`,
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
   * Retourne les catégories d'audiences supportées
   */
  getSupportedAudienceCategories(): string[] {
    return [
      'millennials',
      'gen_z',
      'gen_x',
      'baby_boomers',
      'urban_professionals',
      'suburban_families',
      'college_students',
      'young_parents',
      'empty_nesters',
      'tech_enthusiasts',
      'fitness_enthusiasts',
      'food_lovers',
      'travel_enthusiasts',
      'fashion_forward',
      'eco_conscious',
      'budget_conscious',
      'luxury_seekers',
      'early_adopters',
      'traditionalists',
      'social_media_active'
    ];
  }

  /**
   * Valide qu'une catégorie d'audience est supportée
   */
  validateAudienceCategory(category: string): boolean {
    return this.getSupportedAudienceCategories().includes(category.toLowerCase());
  }

  /**
   * Retourne les niveaux de revenus supportés
   */
  getSupportedIncomeLevels(): Array<'low' | 'medium' | 'high' | 'very_high'> {
    return ['low', 'medium', 'high', 'very_high'];
  }

  /**
   * Retourne les niveaux d'éducation supportés
   */
  getSupportedEducationLevels(): Array<'high_school' | 'bachelor' | 'master' | 'phd' | 'other'> {
    return ['high_school', 'bachelor', 'master', 'phd', 'other'];
  }

  /**
   * Valide les paramètres démographiques
   */
  validateDemographics(demographics: Partial<QlooAudienceDemographics>): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validation de la tranche d'âge
    if (demographics.age_range) {
      if (demographics.age_range.min < 0 || demographics.age_range.min > 120) {
        errors.push('Age minimum must be between 0 and 120');
      }
      if (demographics.age_range.max < 0 || demographics.age_range.max > 120) {
        errors.push('Age maximum must be between 0 and 120');
      }
      if (demographics.age_range.min >= demographics.age_range.max) {
        errors.push('Age minimum must be less than age maximum');
      }
    }

    // Validation de la distribution par genre
    if (demographics.gender_distribution) {
      const total = (demographics.gender_distribution.male || 0) +
        (demographics.gender_distribution.female || 0) +
        (demographics.gender_distribution.other || 0);
      if (total > 1.1) { // Tolérance de 10% pour les erreurs d'arrondi
        warnings.push('Gender distribution percentages sum to more than 100%');
      }
    }

    // Validation du niveau de revenu
    if (demographics.income_level && !this.getSupportedIncomeLevels().includes(demographics.income_level)) {
      errors.push(`Invalid income level: ${demographics.income_level}`);
    }

    // Validation du niveau d'éducation
    if (demographics.education_level && !this.getSupportedEducationLevels().includes(demographics.education_level)) {
      errors.push(`Invalid education level: ${demographics.education_level}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}