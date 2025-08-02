// Cultural Insights System Types
// Unified structure for cultural data insights across all categories

/**
 * Core cultural insight interface that standardizes cultural data representation
 * Replaces the inconsistency between simple culturalData and complex socialMediaInsights
 */
export interface CulturalInsight {
  category: string;
  items: CulturalInsightItem[];
  metadata: InsightMetadata;
  analytics: InsightAnalytics;
}

/**
 * Individual cultural insight item with enriched data
 * Contains relevance scoring, confidence levels, and relationship mapping
 */
export interface CulturalInsightItem {
  name: string;
  relevanceScore: number; // 0-100
  confidence: number; // 0-1
  source: 'qloo' | 'fallback' | 'user';
  attributes?: Record<string, any>;
  relationships?: string[]; // Relations with other items
}

/**
 * Metadata for insight generation tracking
 * Provides context about how and when insights were generated
 */
export interface InsightMetadata {
  generatedAt: string;
  source: 'qloo' | 'fallback' | 'user' | 'hybrid';
  dataQuality: 'high' | 'medium' | 'low';
  enrichmentLevel: number; // 0-100
}

/**
 * Comprehensive analytics for cultural insights
 * Provides behavioral, demographic, and trend analysis
 */
export interface InsightAnalytics {
  preferences: PreferenceAnalysis;
  behavioralInfluence: BehavioralInfluence;
  demographicAlignment: DemographicAlignment;
  trends: TrendAnalysis;
}

/**
 * Preference analysis for cultural items
 * Categorizes preferences by strength and emergence
 */
export interface PreferenceAnalysis {
  primaryPreferences: string[]; // Top 3 preferences
  secondaryPreferences: string[]; // Moderate preferences
  emergingInterests: string[]; // New trends detected
  preferenceStrength: number; // Overall preference strength (0-100)
}

/**
 * Behavioral influence analysis
 * Measures impact on various behavioral aspects
 */
export interface BehavioralInfluence {
  purchaseInfluence: number; // Impact on purchase decisions (0-100)
  socialInfluence: number; // Impact on social behavior (0-100)
  lifestyleAlignment: number; // Alignment with lifestyle (0-100)
  emotionalConnection: number; // Emotional connection strength (0-100)
}

/**
 * Demographic alignment analysis
 * Measures how well cultural preferences align with demographic profile
 */
export interface DemographicAlignment {
  ageGroupAlignment: number; // Alignment with age group (0-100)
  locationAlignment: number; // Geographic alignment (0-100)
  occupationAlignment: number; // Professional alignment (0-100)
  overallFit: number; // Overall demographic coherence (0-100)
}

/**
 * Trend analysis for cultural preferences
 * Identifies current and emerging trends in cultural preferences
 */
export interface TrendAnalysis {
  currentTrends: string[]; // Current trends identified
  emergingTrends: string[]; // Emerging trends
  trendAlignment: number; // Alignment with trends (0-100)
  innovatorScore: number; // Early adoption score (0-100)
}

/**
 * Unified cultural insights structure
 * Replaces the old CulturalData interface with insight-rich structure
 */
export interface CulturalInsights {
  music: CulturalInsight;
  brand: CulturalInsight;
  movie: CulturalInsight;
  tv: CulturalInsight;
  book: CulturalInsight;
  restaurant: CulturalInsight;
  travel: CulturalInsight;
  fashion: CulturalInsight;
  beauty: CulturalInsight;
  food: CulturalInsight;
  socialMedia: CulturalInsight; // Integrated into unified structure
}

/**
 * Enhanced persona interface with cultural insights
 * Extends the base persona with the new insight structure
 */
export interface EnhancedPersonaWithInsights extends Omit<import('./index').Persona, 'culturalData' | 'socialMediaInsights'> {
  culturalInsights: CulturalInsights;
  insightMetadata: {
    generationTimestamp: string;
    enrichmentLevel: number;
    dataQuality: 'high' | 'medium' | 'low';
    qlooDataUsed: boolean;
    migrationStatus?: 'original' | 'migrated' | 'enhanced';
  };
}

/**
 * Insight error interface for error handling
 * Provides structured error information for insight generation failures
 */
export interface InsightError {
  category: string;
  errorType: 'enrichment' | 'validation' | 'migration';
  message: string;
  recoveryAction: string;
}

/**
 * Validation result for insight structure validation
 * Used by validation systems to verify insight integrity
 */
export interface InsightValidationResult {
  isValid: boolean;
  errors: InsightError[];
  warnings: string[];
  score: number; // 0-100
}

/**
 * Migration status for data migration tracking
 * Tracks the progress and status of cultural data migration
 */
export interface MigrationStatus {
  personaId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  errors?: InsightError[];
  preservedDataIntegrity: boolean;
}

/**
 * Insight generation configuration
 * Configuration options for cultural insight generation
 */
export interface InsightGenerationConfig {
  enableQlooEnrichment: boolean;
  fallbackToSimpleData: boolean;
  minimumConfidenceThreshold: number; // 0-1
  maxItemsPerCategory: number;
  enableTrendAnalysis: boolean;
  enableBehavioralAnalysis: boolean;
}

/**
 * Visualization configuration for UI components
 * Defines how insights should be displayed in the interface
 */
export interface InsightVisualizationConfig {
  category: string;
  displayType: 'list' | 'chart' | 'graph' | 'cards';
  showAnalytics: boolean;
  showTrends: boolean;
  maxDisplayItems: number;
  colorScheme: string;
}

/**
 * Cultural category metadata
 * Defines properties and behavior for each cultural category
 */
export interface CulturalCategoryMetadata {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  color: string;
  priority: number; // Display priority
  analyticsEnabled: boolean;
  trendsEnabled: boolean;
  qlooSupported: boolean;
}