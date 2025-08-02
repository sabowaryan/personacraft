// Runtime validation utilities for Cultural Insights types
// Provides type guards and validation functions for cultural insights data

import type {
  CulturalInsight,
  CulturalInsightItem,
  InsightMetadata,
  InsightAnalytics,
  PreferenceAnalysis,
  BehavioralInfluence,
  DemographicAlignment,
  TrendAnalysis,
  CulturalInsights,
  InsightValidationResult,
  InsightError
} from './cultural-insights';

/**
 * Type guard for CulturalInsightItem
 */
export function isCulturalInsightItem(obj: any): obj is CulturalInsightItem {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.name === 'string' &&
    obj.name.trim().length > 0 &&
    typeof obj.relevanceScore === 'number' &&
    obj.relevanceScore >= 0 &&
    obj.relevanceScore <= 100 &&
    typeof obj.confidence === 'number' &&
    obj.confidence >= 0 &&
    obj.confidence <= 1 &&
    ['qloo', 'fallback', 'user'].includes(obj.source)
  );
}

/**
 * Type guard for InsightMetadata
 */
export function isInsightMetadata(obj: any): obj is InsightMetadata {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.generatedAt === 'string' &&
    ['qloo', 'fallback', 'hybrid'].includes(obj.source) &&
    ['high', 'medium', 'low'].includes(obj.dataQuality) &&
    typeof obj.enrichmentLevel === 'number' &&
    obj.enrichmentLevel >= 0 &&
    obj.enrichmentLevel <= 100
  );
}

/**
 * Type guard for PreferenceAnalysis
 */
export function isPreferenceAnalysis(obj: any): obj is PreferenceAnalysis {
  return (
    obj &&
    typeof obj === 'object' &&
    Array.isArray(obj.primaryPreferences) &&
    Array.isArray(obj.secondaryPreferences) &&
    Array.isArray(obj.emergingInterests) &&
    typeof obj.preferenceStrength === 'number' &&
    obj.preferenceStrength >= 0 &&
    obj.preferenceStrength <= 100
  );
}

/**
 * Type guard for BehavioralInfluence
 */
export function isBehavioralInfluence(obj: any): obj is BehavioralInfluence {
  const isValidScore = (score: any) => 
    typeof score === 'number' && score >= 0 && score <= 100;

  return (
    obj &&
    typeof obj === 'object' &&
    isValidScore(obj.purchaseInfluence) &&
    isValidScore(obj.socialInfluence) &&
    isValidScore(obj.lifestyleAlignment) &&
    isValidScore(obj.emotionalConnection)
  );
}

/**
 * Type guard for DemographicAlignment
 */
export function isDemographicAlignment(obj: any): obj is DemographicAlignment {
  const isValidScore = (score: any) => 
    typeof score === 'number' && score >= 0 && score <= 100;

  return (
    obj &&
    typeof obj === 'object' &&
    isValidScore(obj.ageGroupAlignment) &&
    isValidScore(obj.locationAlignment) &&
    isValidScore(obj.occupationAlignment) &&
    isValidScore(obj.overallFit)
  );
}

/**
 * Type guard for TrendAnalysis
 */
export function isTrendAnalysis(obj: any): obj is TrendAnalysis {
  const isValidScore = (score: any) => 
    typeof score === 'number' && score >= 0 && score <= 100;

  return (
    obj &&
    typeof obj === 'object' &&
    Array.isArray(obj.currentTrends) &&
    Array.isArray(obj.emergingTrends) &&
    isValidScore(obj.trendAlignment) &&
    isValidScore(obj.innovatorScore)
  );
}

/**
 * Type guard for InsightAnalytics
 */
export function isInsightAnalytics(obj: any): obj is InsightAnalytics {
  return (
    obj &&
    typeof obj === 'object' &&
    isPreferenceAnalysis(obj.preferences) &&
    isBehavioralInfluence(obj.behavioralInfluence) &&
    isDemographicAlignment(obj.demographicAlignment) &&
    isTrendAnalysis(obj.trends)
  );
}

/**
 * Type guard for CulturalInsight
 */
export function isCulturalInsight(obj: any): obj is CulturalInsight {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.category === 'string' &&
    Array.isArray(obj.items) &&
    obj.items.every(isCulturalInsightItem) &&
    isInsightMetadata(obj.metadata) &&
    isInsightAnalytics(obj.analytics)
  );
}

/**
 * Type guard for CulturalInsights
 */
export function isCulturalInsights(obj: any): obj is CulturalInsights {
  const requiredCategories = [
    'music', 'brand', 'movie', 'tv', 'book', 
    'restaurant', 'travel', 'fashion', 'beauty', 'food', 'socialMedia'
  ];

  return (
    obj &&
    typeof obj === 'object' &&
    requiredCategories.every(category => 
      obj[category] && isCulturalInsight(obj[category])
    )
  );
}

/**
 * Validates a CulturalInsightItem and returns validation result
 */
export function validateCulturalInsightItem(item: any): InsightValidationResult {
  const errors: InsightError[] = [];
  const warnings: string[] = [];

  if (!item || typeof item !== 'object') {
    errors.push({
      category: 'structure',
      errorType: 'validation',
      message: 'Item must be an object',
      recoveryAction: 'Provide a valid object structure'
    });
    return { isValid: false, errors, warnings, score: 0 };
  }

  // Validate name
  if (typeof item.name !== 'string' || item.name.trim().length === 0) {
    errors.push({
      category: 'name',
      errorType: 'validation',
      message: 'Name must be a non-empty string',
      recoveryAction: 'Provide a valid name'
    });
  }

  // Validate relevance score
  if (typeof item.relevanceScore !== 'number' || item.relevanceScore < 0 || item.relevanceScore > 100) {
    errors.push({
      category: 'relevanceScore',
      errorType: 'validation',
      message: 'Relevance score must be a number between 0 and 100',
      recoveryAction: 'Set relevance score to a valid range'
    });
  } else if (item.relevanceScore < 50) {
    warnings.push('Low relevance score may indicate poor data quality');
  }

  // Validate confidence
  if (typeof item.confidence !== 'number' || item.confidence < 0 || item.confidence > 1) {
    errors.push({
      category: 'confidence',
      errorType: 'validation',
      message: 'Confidence must be a number between 0 and 1',
      recoveryAction: 'Set confidence to a valid range'
    });
  } else if (item.confidence < 0.5) {
    warnings.push('Low confidence may indicate uncertain data');
  }

  // Validate source
  if (!['qloo', 'fallback', 'user'].includes(item.source)) {
    errors.push({
      category: 'source',
      errorType: 'validation',
      message: 'Source must be one of: qloo, fallback, user',
      recoveryAction: 'Set source to a valid value'
    });
  }

  // Validate optional relationships
  if (item.relationships && !Array.isArray(item.relationships)) {
    errors.push({
      category: 'relationships',
      errorType: 'validation',
      message: 'Relationships must be an array',
      recoveryAction: 'Provide relationships as an array or remove the field'
    });
  }

  const score = errors.length === 0 ? (warnings.length === 0 ? 100 : 80) : 0;
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score
  };
}

/**
 * Validates a complete CulturalInsight and returns validation result
 */
export function validateCulturalInsight(insight: any): InsightValidationResult {
  const errors: InsightError[] = [];
  const warnings: string[] = [];

  if (!insight || typeof insight !== 'object') {
    errors.push({
      category: 'structure',
      errorType: 'validation',
      message: 'Insight must be an object',
      recoveryAction: 'Provide a valid insight object'
    });
    return { isValid: false, errors, warnings, score: 0 };
  }

  // Validate category
  if (typeof insight.category !== 'string' || insight.category.trim().length === 0) {
    errors.push({
      category: 'category',
      errorType: 'validation',
      message: 'Category must be a non-empty string',
      recoveryAction: 'Provide a valid category name'
    });
  }

  // Validate items
  if (!Array.isArray(insight.items)) {
    errors.push({
      category: 'items',
      errorType: 'validation',
      message: 'Items must be an array',
      recoveryAction: 'Provide items as an array'
    });
  } else {
    insight.items.forEach((item: any, index: number) => {
      const itemValidation = validateCulturalInsightItem(item);
      if (!itemValidation.isValid) {
        errors.push(...itemValidation.errors.map(error => ({
          ...error,
          category: `items[${index}].${error.category}`
        })));
      }
      warnings.push(...itemValidation.warnings.map(warning => 
        `Item ${index}: ${warning}`
      ));
    });

    if (insight.items.length === 0) {
      warnings.push('No items found in insight - consider adding fallback data');
    }
  }

  // Validate metadata
  if (!isInsightMetadata(insight.metadata)) {
    errors.push({
      category: 'metadata',
      errorType: 'validation',
      message: 'Invalid metadata structure',
      recoveryAction: 'Provide valid metadata with required fields'
    });
  }

  // Validate analytics
  if (!isInsightAnalytics(insight.analytics)) {
    errors.push({
      category: 'analytics',
      errorType: 'validation',
      message: 'Invalid analytics structure',
      recoveryAction: 'Provide valid analytics with all required components'
    });
  }

  const score = errors.length === 0 ? 
    (warnings.length === 0 ? 100 : Math.max(60, 100 - warnings.length * 10)) : 
    0;

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score
  };
}

/**
 * Validates complete CulturalInsights structure
 */
export function validateCulturalInsights(insights: any): InsightValidationResult {
  const errors: InsightError[] = [];
  const warnings: string[] = [];

  const requiredCategories = [
    'music', 'brand', 'movie', 'tv', 'book', 
    'restaurant', 'travel', 'fashion', 'beauty', 'food', 'socialMedia'
  ];

  if (!insights || typeof insights !== 'object') {
    errors.push({
      category: 'structure',
      errorType: 'validation',
      message: 'Insights must be an object',
      recoveryAction: 'Provide a valid insights object'
    });
    return { isValid: false, errors, warnings, score: 0 };
  }

  // Validate each required category
  requiredCategories.forEach(category => {
    if (!insights[category]) {
      errors.push({
        category,
        errorType: 'validation',
        message: `Missing required category: ${category}`,
        recoveryAction: `Add ${category} insight to the structure`
      });
    } else {
      const categoryValidation = validateCulturalInsight(insights[category]);
      if (!categoryValidation.isValid) {
        errors.push(...categoryValidation.errors.map(error => ({
          ...error,
          category: `${category}.${error.category}`
        })));
      }
      warnings.push(...categoryValidation.warnings.map(warning => 
        `${category}: ${warning}`
      ));
    }
  });

  const score = errors.length === 0 ? 
    Math.max(50, 100 - warnings.length * 2) : 
    0;

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score
  };
}

/**
 * Utility to create a default/empty CulturalInsight for a category
 */
export function createEmptyCulturalInsight(category: string): CulturalInsight {
  return {
    category,
    items: [],
    metadata: {
      generatedAt: new Date().toISOString(),
      source: 'fallback',
      dataQuality: 'low',
      enrichmentLevel: 0
    },
    analytics: {
      preferences: {
        primaryPreferences: [],
        secondaryPreferences: [],
        emergingInterests: [],
        preferenceStrength: 0
      },
      behavioralInfluence: {
        purchaseInfluence: 0,
        socialInfluence: 0,
        lifestyleAlignment: 0,
        emotionalConnection: 0
      },
      demographicAlignment: {
        ageGroupAlignment: 0,
        locationAlignment: 0,
        occupationAlignment: 0,
        overallFit: 0
      },
      trends: {
        currentTrends: [],
        emergingTrends: [],
        trendAlignment: 0,
        innovatorScore: 0
      }
    }
  };
}

/**
 * Utility to create a complete empty CulturalInsights structure
 */
export function createEmptyCulturalInsights(): CulturalInsights {
  return {
    music: createEmptyCulturalInsight('music'),
    brand: createEmptyCulturalInsight('brand'),
    movie: createEmptyCulturalInsight('movie'),
    tv: createEmptyCulturalInsight('tv'),
    book: createEmptyCulturalInsight('book'),
    restaurant: createEmptyCulturalInsight('restaurant'),
    travel: createEmptyCulturalInsight('travel'),
    fashion: createEmptyCulturalInsight('fashion'),
    beauty: createEmptyCulturalInsight('beauty'),
    food: createEmptyCulturalInsight('food'),
    socialMedia: createEmptyCulturalInsight('socialMedia')
  };
}