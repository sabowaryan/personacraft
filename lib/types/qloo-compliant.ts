// Types conformes à l'API Qloo officielle pour le hackathon
// Basés sur les spécifications officielles Qloo Taste AI™

/**
 * Types d'entités officiels Qloo avec URNs conformes
 */
export type EntityUrn = 
  | 'urn:entity:brand'
  | 'urn:entity:artist'
  | 'urn:entity:movie'
  | 'urn:entity:tv_show'
  | 'urn:entity:book'
  | 'urn:entity:song'
  | 'urn:entity:album'
  | 'urn:entity:restaurant'
  | 'urn:entity:product'
  | 'urn:entity:location';

/**
 * Interface pour les entités Qloo conformes aux spécifications API
 */
export interface QlooEntity {
  /** Identifiant unique de l'entité */
  id: string;
  /** Nom de l'entité */
  name: string;
  /** Type d'entité avec URN officiel */
  type: EntityUrn;
  /** Score de confiance (0-1) */
  confidence?: number;
  /** Métadonnées additionnelles spécifiques au type d'entité */
  metadata?: Record<string, any>;
  /** URL de l'image si disponible */
  image_url?: string;
  /** Description de l'entité */
  description?: string;
  /** Tags associés à l'entité */
  tags?: string[];
}

/**
 * Interface pour les tags Qloo
 */
export interface QlooTag {
  /** Identifiant unique du tag */
  id: string;
  /** Nom du tag */
  name: string;
  /** Catégorie du tag */
  category?: string;
  /** Poids/importance du tag (0-1) */
  weight?: number;
  /** Description du tag */
  description?: string;
  /** Tags parents dans la hiérarchie */
  parent_tags?: string[];
  /** Tags enfants dans la hiérarchie */
  child_tags?: string[];
}

/**
 * Interface pour les audiences Qloo
 */
export interface QlooAudience {
  /** Identifiant unique de l'audience */
  id: string;
  /** Nom de l'audience */
  name: string;
  /** Données démographiques de l'audience */
  demographics?: QlooAudienceDemographics;
  /** Taille estimée de l'audience */
  size?: number;
  /** Description de l'audience */
  description?: string;
  /** Intérêts principaux de l'audience */
  interests?: string[];
  /** Comportements typiques */
  behaviors?: string[];
}

/**
 * Données démographiques pour les audiences
 */
export interface QlooAudienceDemographics {
  /** Tranche d'âge */
  age_range?: {
    min: number;
    max: number;
  };
  /** Répartition par genre */
  gender_distribution?: {
    male?: number;
    female?: number;
    other?: number;
  };
  /** Localisation géographique */
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  /** Niveau de revenu */
  income_level?: 'low' | 'medium' | 'high' | 'very_high';
  /** Niveau d'éducation */
  education_level?: 'high_school' | 'bachelor' | 'master' | 'phd' | 'other';
}

/**
 * Paramètres pour les requêtes d'insights conformes à l'API Qloo
 * Le paramètre filter.type est OBLIGATOIRE selon les spécifications
 */
export interface InsightsParams {
  /** Type de filtre OBLIGATOIRE - spécifie le type d'entité pour les insights */
  'filter.type': EntityUrn;
  
  // Paramètres de signal optionnels
  /** Entités d'intérêt comme signaux */
  'signal.interests.entities'?: string[];
  /** Tags d'intérêt comme signaux */
  'signal.interests.tags'?: string[];
  /** Audiences démographiques comme signaux */
  'signal.demographics.audiences'?: string[];
  
  // Paramètres de filtre optionnels
  /** Filtrer par tags spécifiques */
  'filter.tags'?: string[];
  /** Filtrer par entités spécifiques */
  'filter.entities'?: string[];
  /** Filtrer par audiences spécifiques */
  'filter.audiences'?: string[];
  
  // Paramètres de configuration optionnels
  /** Nombre maximum de résultats */
  limit?: number;
  /** Score de confiance minimum */
  min_confidence?: number;
  /** Langue pour les résultats */
  language?: 'en' | 'fr' | 'es' | 'de' | 'it' | 'pt';
  /** Région pour la localisation */
  region?: string;
}

/**
 * Réponse des insights Qloo avec métadonnées de tracking
 */
export interface QlooInsightsResponse {
  /** Entités recommandées */
  entities: QlooEntity[];
  /** Tags associés */
  tags: QlooTag[];
  /** Audiences pertinentes */
  audiences: QlooAudience[];
  /** Score de confiance global (0-1) */
  confidence: number;
  /** Métadonnées de la requête et du traitement */
  metadata: QlooInsightsMetadata;
  /** Statut de la réponse */
  status: QlooResponseStatus;
}

/**
 * Métadonnées pour le tracking des requêtes d'insights
 */
export interface QlooInsightsMetadata {
  /** Identifiant unique de la requête */
  request_id: string;
  /** Temps de traitement en millisecondes */
  processing_time: number;
  /** Source des données */
  data_source: 'qloo_api' | 'cache' | 'fallback';
  /** Version de l'API utilisée */
  api_version: string;
  /** Timestamp de la requête */
  timestamp: string;
  /** Nombre total de résultats */
  total_results: number;
  /** Filtres appliqués */
  filters_applied: string[];
  /** Signaux utilisés */
  signals_used: string[];
  /** Indique si les données proviennent du cache */
  cached: boolean;
  /** TTL du cache si applicable */
  cache_ttl?: number;
}

/**
 * Statut de la réponse API
 */
export interface QlooResponseStatus {
  /** Code de statut HTTP */
  code: number;
  /** Message de statut */
  message: string;
  /** Indique si la requête a réussi */
  success: boolean;
  /** Avertissements éventuels */
  warnings?: string[];
  /** Erreurs non-bloquantes */
  errors?: string[];
}

/**
 * Paramètres pour la recherche d'entités
 */
export interface SearchParams {
  /** Terme de recherche */
  query: string;
  /** Type d'entité à rechercher */
  type?: EntityUrn;
  /** Nombre maximum de résultats */
  limit?: number;
  /** Score de confiance minimum */
  min_confidence?: number;
  /** Langue de recherche */
  language?: string;
  /** Région pour la localisation */
  region?: string;
}

/**
 * Résultat de recherche d'entités
 */
export interface SearchResult {
  /** Entités trouvées */
  entities: QlooEntity[];
  /** Métadonnées de la recherche */
  metadata: {
    query: string;
    total_results: number;
    processing_time: number;
    request_id: string;
  };
  /** Statut de la recherche */
  status: QlooResponseStatus;
}

/**
 * Paramètres pour la recherche de tags
 */
export interface TagSearchParams {
  /** Terme de recherche pour les tags */
  query?: string;
  /** Catégorie de tags */
  category?: string;
  /** Nombre maximum de résultats */
  limit?: number;
  /** Langue pour les tags */
  language?: string;
}

/**
 * Résultat de recherche de tags
 */
export interface TagSearchResult {
  /** Tags trouvés */
  tags: QlooTag[];
  /** Métadonnées de la recherche */
  metadata: {
    query?: string;
    category?: string;
    total_results: number;
    processing_time: number;
    request_id: string;
  };
  /** Statut de la recherche */
  status: QlooResponseStatus;
}

/**
 * Paramètres pour la recherche d'audiences
 */
export interface AudienceSearchParams {
  /** Filtres démographiques */
  demographics?: Partial<QlooAudienceDemographics>;
  /** Intérêts à rechercher */
  interests?: string[];
  /** Nombre maximum de résultats */
  limit?: number;
  /** Langue pour les audiences */
  language?: string;
}

/**
 * Résultat de recherche d'audiences
 */
export interface AudienceSearchResult {
  /** Audiences trouvées */
  audiences: QlooAudience[];
  /** Métadonnées de la recherche */
  metadata: {
    total_results: number;
    processing_time: number;
    request_id: string;
  };
  /** Statut de la recherche */
  status: QlooResponseStatus;
}

/**
 * Paramètres pour la recherche par lot
 */
export interface BatchSearchQuery {
  /** Terme de recherche */
  query: string;
  /** Type d'entité à rechercher */
  type: EntityUrn;
  /** Identifiant unique pour cette requête dans le lot */
  id?: string;
}

/**
 * Résultat de recherche par lot
 */
export interface BatchSearchResult {
  /** Résultats par requête */
  results: Array<{
    /** ID de la requête */
    query_id: string;
    /** Terme de recherche */
    query: string;
    /** Type d'entité */
    type: EntityUrn;
    /** Entités trouvées */
    entities: QlooEntity[];
    /** Statut de cette recherche spécifique */
    status: QlooResponseStatus;
  }>;
  /** Métadonnées globales du lot */
  metadata: {
    total_queries: number;
    successful_queries: number;
    failed_queries: number;
    total_entities: number;
    processing_time: number;
    request_id: string;
  };
  /** Statut global du lot */
  status: QlooResponseStatus;
}

/**
 * Configuration du client API Qloo conforme
 */
export interface QlooCompliantConfig {
  /** Clé API Qloo */
  apiKey: string;
  /** URL de base (doit être https://hackathon.api.qloo.com) */
  baseUrl: 'https://hackathon.api.qloo.com';
  /** Timeout des requêtes en millisecondes */
  timeout?: number;
  /** Nombre de tentatives en cas d'échec */
  retryAttempts?: number;
  /** Délai de base pour le backoff exponentiel */
  retryBaseDelay?: number;
  /** Délai maximum pour le backoff */
  retryMaxDelay?: number;
  /** Activation du cache */
  cacheEnabled?: boolean;
  /** TTL par défaut du cache */
  defaultCacheTtl?: number;
  /** User-Agent pour les requêtes */
  userAgent?: string;
}

/**
 * Types d'erreurs Qloo conformes aux spécifications
 */
export enum QlooErrorType {
  AUTHENTICATION = 'authentication_error',
  AUTHORIZATION = 'authorization_error',
  VALIDATION = 'validation_error',
  RATE_LIMIT = 'rate_limit_error',
  SERVER_ERROR = 'server_error',
  NETWORK_ERROR = 'network_error',
  NOT_FOUND = 'not_found_error',
  INVALID_PARAMS = 'invalid_params_error'
}

/**
 * Erreur API Qloo conforme
 */
export interface QlooCompliantError {
  /** Type d'erreur */
  type: QlooErrorType;
  /** Message d'erreur */
  message: string;
  /** Code d'erreur spécifique */
  code: string;
  /** Détails additionnels */
  details?: {
    field?: string;
    value?: any;
    constraint?: string;
    suggestion?: string;
    // Rate limit specific fields
    limit?: number;
    remaining?: number;
    resetTime?: string;
    // Network error specific fields
    timeout?: number;
    connectionType?: string;
    // Server error specific fields
    database?: string;
    connectionPool?: string;
    retryAfter?: number;
    // Allow additional properties for extensibility
    [key: string]: any;
  };
  /** Identifiant de la requête */
  request_id?: string;
  /** Timestamp de l'erreur */
  timestamp?: string;
  /** Indique si l'erreur est récupérable */
  retryable?: boolean;
}

/**
 * Validation des paramètres d'insights
 */
export interface ParamsValidationResult {
  /** Indique si les paramètres sont valides */
  valid: boolean;
  /** Erreurs de validation */
  errors: string[];
  /** Avertissements */
  warnings: string[];
  /** Paramètres normalisés */
  normalized_params?: InsightsParams;
}

/**
 * Utilitaires de type pour la validation
 */
export type RequiredInsightsParams = Pick<InsightsParams, 'filter.type'>;
export type OptionalInsightsParams = Omit<InsightsParams, 'filter.type'>;

/**
 * Type guard pour vérifier si un objet est une entité Qloo valide
 */
export function isQlooEntity(obj: any): obj is QlooEntity {
  return obj !== null && 
         obj !== undefined &&
         typeof obj === 'object' &&
         typeof obj.id === 'string' && 
         typeof obj.name === 'string' && 
         typeof obj.type === 'string' && 
         obj.type.startsWith('urn:entity:');
}

/**
 * Type guard pour vérifier si un objet est un tag Qloo valide
 */
export function isQlooTag(obj: any): obj is QlooTag {
  return obj !== null && 
         obj !== undefined &&
         typeof obj === 'object' &&
         typeof obj.id === 'string' && 
         typeof obj.name === 'string';
}

/**
 * Type guard pour vérifier si un objet est une audience Qloo valide
 */
export function isQlooAudience(obj: any): obj is QlooAudience {
  return obj !== null && 
         obj !== undefined &&
         typeof obj === 'object' &&
         typeof obj.id === 'string' && 
         typeof obj.name === 'string';
}