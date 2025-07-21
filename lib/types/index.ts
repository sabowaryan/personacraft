// Barrel export for all type definitions

// Export existing types
export * from './qloo';

// Export new compliant types
export * from './qloo-compliant';

// Re-export commonly used types for convenience
export type {
  // Compliant types
  EntityUrn,
  QlooEntity,
  QlooTag,
  QlooAudience,
  InsightsParams,
  QlooInsightsResponse,
  QlooCompliantConfig,
  QlooCompliantError,
  QlooErrorType,
  
  // Search types
  SearchParams,
  SearchResult,
  TagSearchParams,
  TagSearchResult,
  AudienceSearchParams,
  AudienceSearchResult,
  
  // Utility types
  ParamsValidationResult,
  RequiredInsightsParams,
  OptionalInsightsParams
} from './qloo-compliant';