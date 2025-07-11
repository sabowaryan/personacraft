// Types pour l'intégration avec l'API Google Gemini

export interface GeminiRequest {
  prompt: string;
  context?: GeminiContext;
  parameters?: GeminiParameters;
  safety_settings?: GeminiSafetySettings;
  tools?: GeminiTool[];
}

export interface GeminiContext {
  conversation_history?: GeminiMessage[];
  system_instruction?: string;
  user_context?: Record<string, any>;
  cultural_data?: any;
  previous_personas?: any[];
}

export interface GeminiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface GeminiParameters {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  top_k?: number;
  format?: 'json' | 'text' | 'markdown';
  language?: 'fr' | 'en' | 'es' | 'de';
  creativity_level?: 'low' | 'medium' | 'high';
  consistency_mode?: boolean;
}

export interface GeminiSafetySettings {
  harassment?: GeminiSafetyLevel;
  hate_speech?: GeminiSafetyLevel;
  sexually_explicit?: GeminiSafetyLevel;
  dangerous_content?: GeminiSafetyLevel;
}

export type GeminiSafetyLevel = 
  | 'BLOCK_NONE' 
  | 'BLOCK_ONLY_HIGH' 
  | 'BLOCK_MEDIUM_AND_ABOVE' 
  | 'BLOCK_LOW_AND_ABOVE';

export interface GeminiTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface GeminiResponse {
  content: string;
  usage: GeminiUsage;
  model: string;
  finish_reason: GeminiFinishReason;
  safety_ratings?: GeminiSafetyRating[];
  metadata: GeminiResponseMetadata;
}

export interface GeminiUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost?: number;
}

export type GeminiFinishReason = 
  | 'stop' 
  | 'max_tokens' 
  | 'safety' 
  | 'recitation' 
  | 'other';

export interface GeminiSafetyRating {
  category: string;
  probability: 'NEGLIGIBLE' | 'LOW' | 'MEDIUM' | 'HIGH';
  blocked: boolean;
}

export interface GeminiResponseMetadata {
  request_id: string;
  processing_time: number;
  model_version: string;
  cached: boolean;
  quality_score?: number;
}

// Types pour les erreurs Gemini
export interface GeminiError {
  error: string;
  code: string;
  details?: GeminiErrorDetails;
  request_id?: string;
  retry_after?: number;
}

export interface GeminiErrorDetails {
  reason: string;
  domain: string;
  metadata?: Record<string, any>;
  suggestions?: string[];
}

// Types spécialisés pour la génération de personas
export interface GeminiPersonaRequest extends GeminiRequest {
  persona_type: 'marketing' | 'user' | 'buyer' | 'brand';
  variation_seed?: number;
  consistency_check?: boolean;
}

export interface GeminiPersonaResponse extends GeminiResponse {
  persona_data: GeminiPersonaData;
  validation_results: GeminiValidationResults;
}

export interface GeminiPersonaData {
  name: string;
  age: number;
  location: string;
  bio: string;
  values: string[];
  interests: Record<string, string[]>;
  communication: Record<string, any>;
  marketing: Record<string, any>;
  quote: string;
  confidence_score: number;
}

export interface GeminiValidationResults {
  is_valid: boolean;
  completeness_score: number;
  consistency_score: number;
  realism_score: number;
  issues: GeminiValidationIssue[];
}

export interface GeminiValidationIssue {
  field: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  suggestion?: string;
}

// Types pour les prompts et templates
export interface GeminiPromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: GeminiPromptVariable[];
  category: 'persona' | 'content' | 'analysis';
  language: string;
  version: string;
}

export interface GeminiPromptVariable {
  name: string;
  type: 'string' | 'number' | 'array' | 'object';
  required: boolean;
  description: string;
  default_value?: any;
  validation?: string;
}

// Types pour la configuration du client
export interface GeminiClientConfig {
  api_key: string;
  base_url?: string;
  model?: string;
  timeout?: number;
  retries?: number;
  default_parameters?: GeminiParameters;
  safety_settings?: GeminiSafetySettings;
}

// Types pour les métriques et monitoring
export interface GeminiMetrics {
  requests_count: number;
  average_response_time: number;
  token_usage: GeminiTokenUsage;
  error_rate: number;
  quality_metrics: GeminiQualityMetrics;
}

export interface GeminiTokenUsage {
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  estimated_cost: number;
}

export interface GeminiQualityMetrics {
  average_quality_score: number;
  consistency_rate: number;
  completion_rate: number;
  safety_compliance_rate: number;
}

// Types pour les batch operations
export interface GeminiBatchRequest {
  requests: GeminiRequest[];
  batch_id?: string;
  priority?: 'low' | 'normal' | 'high';
  callback_url?: string;
}

export interface GeminiBatchResponse {
  batch_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  responses: (GeminiResponse | GeminiError)[];
  summary: GeminiBatchSummary;
}

export interface GeminiBatchSummary {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  total_tokens_used: number;
  processing_time: number;
}

// Types pour les webhooks
export interface GeminiWebhookEvent {
  event_type: 'batch.completed' | 'quota.warning' | 'model.updated';
  timestamp: string;
  data: any;
  batch_id?: string;
}

// Types pour les modèles disponibles
export interface GeminiModel {
  name: string;
  display_name: string;
  description: string;
  version: string;
  input_token_limit: number;
  output_token_limit: number;
  supported_generation_methods: string[];
  temperature_range: [number, number];
  top_p_range: [number, number];
  top_k_range: [number, number];
}

// Types pour les fine-tuning (si disponible)
export interface GeminiFineTuningJob {
  job_id: string;
  model_name: string;
  training_data: GeminiTrainingData[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  created_at: string;
  completed_at?: string;
}

export interface GeminiTrainingData {
  input: string;
  output: string;
  metadata?: Record<string, any>;
}

// Utilitaires de type
export type GeminiRequestWithDefaults = Required<Pick<GeminiRequest, 'prompt'>> & 
  Partial<Omit<GeminiRequest, 'prompt'>>;

export type GeminiResponseSuccess = Omit<GeminiResponse, 'error'>;
export type GeminiResponseError = GeminiError;