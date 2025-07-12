// Types pour l'intégration avec l'API Qloo Taste AI

export interface QlooRequest {
  interests: string[];
  demographics: QlooDemographics;
  categories: QlooCategory[];
  options?: QlooRequestOptions;
}

export interface QlooDemographics {
  age: number;
  location: string;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  income?: 'low' | 'medium' | 'high';
  education?: 'high-school' | 'bachelor' | 'master' | 'phd';
}

export interface QlooRequestOptions {
  maxResults?: number;
  minConfidence?: number;
  includeAttributes?: boolean;
  language?: 'en' | 'fr' | 'es' | 'de';
  region?: string;
}

export type QlooCategory = 
  | 'music' 
  | 'brands' 
  | 'movies' 
  | 'food' 
  | 'books' 
  | 'lifestyle'
  | 'travel'
  | 'sports'
  | 'technology'
  | 'fashion';

export interface QlooResponse {
  recommendations: QlooRecommendation[];
  metadata: QlooMetadata;
  status: QlooStatus;
}

export interface QlooRecommendation {
  id: string;
  type: QlooCategory;
  name: string;
  confidence: number;
  attributes: QlooAttributes;
  related?: QlooRecommendation[];
}

export interface QlooAttributes {
  genre?: string;
  category?: string;
  subcategory?: string;
  popularity?: number;
  cultural_relevance?: number;
  trending_score?: number;
  demographic_fit?: number;
  seasonal_relevance?: number;
  price_range?: 'low' | 'medium' | 'high' | 'luxury';
  availability?: 'global' | 'regional' | 'limited';
  tags?: string[];
  description?: string;
  image_url?: string;
  external_url?: string;
}

export interface QlooMetadata {
  total_results: number;
  confidence_threshold: number;
  processing_time: number;
  request_id: string;
  api_version: string;
  cached: boolean;
  filters_applied?: string[];
}

export interface QlooStatus {
  code: number;
  message: string;
  success: boolean;
  warnings?: string[];
}

// Types pour les erreurs Qloo
export interface QlooError {
  error: string;
  code: string;
  details?: QlooErrorDetails;
  request_id?: string;
}

export interface QlooErrorDetails {
  field?: string;
  value?: unknown;
  constraint?: string;
  suggestion?: string;
}

// Types pour les réponses spécialisées par catégorie
export interface QlooMusicRecommendation extends QlooRecommendation {
  type: 'music';
  attributes: QlooMusicAttributes;
}

export interface QlooMusicAttributes extends QlooAttributes {
  genre: string;
  artist?: string;
  album?: string;
  year?: number;
  tempo?: 'slow' | 'medium' | 'fast';
  mood?: string[];
  instruments?: string[];
  spotify_id?: string;
  apple_music_id?: string;
}

export interface QlooBrandRecommendation extends QlooRecommendation {
  type: 'brands';
  attributes: QlooBrandAttributes;
}

export interface QlooBrandAttributes extends QlooAttributes {
  industry: string;
  brand_values?: string[];
  target_demographic?: string;
  price_positioning?: 'budget' | 'mid-range' | 'premium' | 'luxury';
  sustainability_score?: number;
  innovation_score?: number;
  brand_personality?: string[];
  logo_url?: string;
  website_url?: string;
}

export interface QlooMovieRecommendation extends QlooRecommendation {
  type: 'movies';
  attributes: QlooMovieAttributes;
}

export interface QlooMovieAttributes extends QlooAttributes {
  genre: string;
  director?: string;
  cast?: string[];
  year?: number;
  duration?: number;
  rating?: string;
  imdb_score?: number;
  themes?: string[];
  streaming_platforms?: string[];
  trailer_url?: string;
}

// Types pour les configurations et paramètres
export interface QlooClientConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  cacheEnabled?: boolean;
  cacheTTL?: number;
}

export interface QlooRateLimits {
  requests_per_minute: number;
  requests_per_hour: number;
  requests_per_day: number;
  current_usage: {
    minute: number;
    hour: number;
    day: number;
  };
}

// Types pour les analytics et insights
export interface QlooInsights {
  demographic_analysis: QlooDemographicInsights;
  trend_analysis: QlooTrendInsights;
  cultural_analysis: QlooCulturalInsights;
  recommendation_quality: QlooQualityMetrics;
}

export interface QlooDemographicInsights {
  age_group_fit: number;
  location_relevance: number;
  gender_alignment?: number;
  income_compatibility?: number;
}

export interface QlooTrendInsights {
  trending_items: QlooRecommendation[];
  seasonal_relevance: number;
  viral_potential: number;
  longevity_score: number;
}

export interface QlooCulturalInsights {
  cultural_fit: number;
  cross_cultural_appeal: number;
  local_preferences: string[];
  global_trends: string[];
}

export interface QlooQualityMetrics {
  average_confidence: number;
  diversity_score: number;
  novelty_score: number;
  relevance_score: number;
}

// Utilitaires de type
export type QlooRecommendationByType<T extends QlooCategory> = 
  T extends 'music' ? QlooMusicRecommendation :
  T extends 'brands' ? QlooBrandRecommendation :
  T extends 'movies' ? QlooMovieRecommendation :
  QlooRecommendation;

export type QlooAttributesByType<T extends QlooCategory> = 
  T extends 'music' ? QlooMusicAttributes :
  T extends 'brands' ? QlooBrandAttributes :
  T extends 'movies' ? QlooMovieAttributes :
  QlooAttributes;

// Types pour les webhooks et événements
export interface QlooWebhookEvent {
  event_type: 'recommendation.generated' | 'trend.detected' | 'insight.updated';
  timestamp: string;
  data: unknown;
  request_id: string;
}

// Types pour les batch operations
export interface QlooBatchRequest {
  requests: QlooRequest[];
  batch_id?: string;
  priority?: 'low' | 'normal' | 'high';
}

export interface QlooBatchResponse {
  batch_id: string;
  responses: (QlooResponse | QlooError)[];
  status: 'completed' | 'partial' | 'failed';
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// Tous les types sont exportés individuellement ci-dessus
// Les types TypeScript ne peuvent pas être exportés comme valeurs par défaut