// Intelligent fallback data provider for Qloo API
// Provides coherent fallback data that maintains persona consistency when API calls fail

import type {
  QlooEntity,
  QlooTag,
  QlooAudience,
  EntityUrn,
  QlooAudienceDemographics,
  QlooInsightsResponse,
  InsightsParams
} from '@/lib/types/qloo-compliant';
import { QlooLogger } from './qloo-error-handler';

/**
 * Context information for generating fallback data
 */
export interface PersonaContext {
  /** User interests or keywords */
  interests?: string[];
  /** Demographic information */
  demographics?: Partial<QlooAudienceDemographics>;
  /** Preferred language */
  language?: string;
  /** Geographic region */
  region?: string;
  /** Age range if available */
  ageRange?: { min: number; max: number };
  /** Gender if specified */
  gender?: 'male' | 'female' | 'other';
  /** Income level if known */
  incomeLevel?: 'low' | 'medium' | 'high' | 'very_high';
}

/**
 * Extended entity interface for fallback data with additional filtering properties
 */
interface FallbackEntityData extends Partial<QlooEntity> {
  /** Age range for filtering */
  ageRange?: { min: number; max: number };
  /** Supported regions */
  regions?: string[];
}

/**
 * Fallback usage tracking
 */
export interface FallbackUsageStats {
  /** Total fallback calls */
  totalCalls: number;
  /** Calls by entity type */
  callsByEntityType: Record<EntityUrn, number>;
  /** Calls by reason */
  callsByReason: Record<string, number>;
  /** Last usage timestamp */
  lastUsed: string;
  /** Success rate of fallback data */
  successRate: number;
}

/**
 * Fallback data quality metrics
 */
export interface FallbackQualityMetrics {
  /** Coherence score (0-1) */
  coherenceScore: number;
  /** Diversity score (0-1) */
  diversityScore: number;
  /** Cultural relevance score (0-1) */
  culturalRelevanceScore: number;
  /** Persona consistency score (0-1) */
  personaConsistencyScore: number;
}

/**
 * Intelligent fallback data provider
 * Maintains persona consistency and provides culturally relevant fallback data
 */
export class QlooFallbackProvider {
  private logger: QlooLogger;
  private usageStats: FallbackUsageStats;
  private fallbackData: Map<string, any>;

  constructor(logger?: QlooLogger) {
    this.logger = logger || new QlooLogger();
    this.usageStats = {
      totalCalls: 0,
      callsByEntityType: {} as Record<EntityUrn, number>,
      callsByReason: {},
      lastUsed: new Date().toISOString(),
      successRate: 0.95 // Default high success rate for fallback
    };
    this.fallbackData = new Map();
    this.initializeFallbackData();
  }

  /**
   * Get fallback entities for a specific type and context
   */
  getEntityFallback(type: EntityUrn, context: PersonaContext, reason: string = 'api_error'): QlooEntity[] {
    this.trackUsage(type, reason);

    const entities = this.generateEntitiesForType(type, context);

    this.logger.logFallbackUsage(
      `Entity fallback used for type ${type}`,
      {
        endpoint: '/search',
        method: 'GET',
        attempt: 1,
        maxAttempts: 1,
        startTime: Date.now()
      },
      entities
    );

    return entities;
  }

  /**
   * Get fallback tags based on interests and context
   */
  getTagFallback(interests: string[], context?: PersonaContext, reason: string = 'api_error'): QlooTag[] {
    this.trackUsage('urn:entity:tag' as EntityUrn, reason);

    const tags = this.generateTagsFromInterests(interests, context);

    this.logger.logFallbackUsage(
      `Tag fallback used for interests: ${interests.join(', ')}`,
      {
        endpoint: '/v2/tags',
        method: 'GET',
        attempt: 1,
        maxAttempts: 1,
        startTime: Date.now()
      },
      tags
    );

    return tags;
  }

  /**
   * Get fallback audiences based on demographics
   */
  getAudienceFallback(demographics: Partial<QlooAudienceDemographics>, context?: PersonaContext, reason: string = 'api_error'): QlooAudience[] {
    this.trackUsage('urn:entity:audience' as EntityUrn, reason);

    const audiences = this.generateAudiencesFromDemographics(demographics, context);

    this.logger.logFallbackUsage(
      `Audience fallback used for demographics`,
      {
        endpoint: '/v2/audiences',
        method: 'GET',
        attempt: 1,
        maxAttempts: 1,
        startTime: Date.now()
      },
      audiences
    );

    return audiences;
  }

  /**
   * Get complete fallback insights response
   */
  getInsightsFallback(params: InsightsParams, context: PersonaContext, reason: string = 'api_error'): QlooInsightsResponse {
    this.trackUsage(params['filter.type'], reason);

    const entities = this.generateEntitiesForType(params['filter.type'], context);
    const tags = this.generateTagsFromContext(context);
    const audiences = this.generateAudiencesFromContext(context);

    const response: QlooInsightsResponse = {
      entities,
      tags,
      audiences,
      confidence: this.calculateFallbackConfidence(context),
      metadata: {
        request_id: this.generateUUID(),
        processing_time: 150, // Simulate realistic processing time
        data_source: 'fallback',
        api_version: 'fallback-v1.0',
        timestamp: new Date().toISOString(),
        total_results: entities.length + tags.length + audiences.length,
        filters_applied: ['fallback_mode'],
        signals_used: this.extractSignalsFromParams(params),
        cached: false
      },
      status: {
        code: 200,
        message: 'Success (Fallback Mode)',
        success: true,
        warnings: ['Using fallback data due to API unavailability']
      }
    };

    this.logger.logFallbackUsage(
      `Complete insights fallback used`,
      {
        endpoint: '/v2/insights',
        method: 'GET',
        attempt: 1,
        maxAttempts: 1,
        startTime: Date.now()
      },
      response
    );

    return response;
  }

  /**
   * Get fallback usage statistics
   */
  getUsageStats(): FallbackUsageStats {
    return { ...this.usageStats };
  }

  /**
   * Calculate quality metrics for fallback data
   */
  calculateQualityMetrics(context: PersonaContext): FallbackQualityMetrics {
    return {
      coherenceScore: this.calculateCoherenceScore(context),
      diversityScore: this.calculateDiversityScore(context),
      culturalRelevanceScore: this.calculateCulturalRelevanceScore(context),
      personaConsistencyScore: this.calculatePersonaConsistencyScore(context)
    };
  }

  /**
   * Initialize fallback data collections
   */
  private initializeFallbackData(): void {
    // Initialize entity data by type
    this.fallbackData.set('brands', this.getBrandFallbackData());
    this.fallbackData.set('artists', this.getArtistFallbackData());
    this.fallbackData.set('movies', this.getMovieFallbackData());
    this.fallbackData.set('tv_shows', this.getTvShowFallbackData());
    this.fallbackData.set('books', this.getBookFallbackData());
    this.fallbackData.set('songs', this.getSongFallbackData());
    this.fallbackData.set('albums', this.getAlbumFallbackData());
    this.fallbackData.set('restaurants', this.getRestaurantFallbackData());
    this.fallbackData.set('products', this.getProductFallbackData());

    // Initialize tag categories
    this.fallbackData.set('tags', this.getTagFallbackData());

    // Initialize audience segments
    this.fallbackData.set('audiences', this.getAudienceFallbackData());
  }

  /**
   * Generate entities for a specific type based on context
   */
  private generateEntitiesForType(type: EntityUrn, context: PersonaContext): QlooEntity[] {
    const entityType = type.replace('urn:entity:', '');
    const baseData = this.fallbackData.get(entityType) || [];

    // Filter and customize based on context
    let entities = this.filterEntitiesByContext(baseData, context);

    // Ensure we have at least 3-5 entities
    if (entities.length < 3) {
      entities = this.expandEntitiesForContext(entities, entityType, context);
    }

    // If still no entities, use base data without filtering
    if (entities.length === 0 && baseData.length > 0) {
      entities = [...baseData];
    }

    // If still no entities, generate at least one generic entity
    if (entities.length === 0) {
      entities = [this.createGenericEntity(type, entityType)];
    }

    // Limit to reasonable number
    entities = entities.slice(0, 8);

    // Add context-specific confidence scores
    return entities.map(entity => ({
      ...entity,
      confidence: this.calculateEntityConfidence(entity, context)
    }));
  }

  /**
   * Generate tags from interests and context
   */
  private generateTagsFromInterests(interests: string[], context?: PersonaContext): QlooTag[] {
    const baseTags = this.fallbackData.get('tags') || [];

    // Create tags based on interests
    const interestTags = interests.map((interest, index) => ({
      id: `tag_${interest.toLowerCase().replace(/\s+/g, '_')}_${index}`,
      name: interest,
      category: this.categorizeInterest(interest),
      weight: 0.8 + Math.random() * 0.2,
      description: `Interest in ${interest}`
    }));

    // Add contextual tags
    const contextualTags = this.getContextualTags(context);

    // Combine and deduplicate
    const allTags = [...interestTags, ...contextualTags, ...baseTags];
    const uniqueTags = this.deduplicateTags(allTags);

    return uniqueTags.slice(0, 10);
  }

  /**
   * Generate audiences from demographics
   */
  private generateAudiencesFromDemographics(demographics: Partial<QlooAudienceDemographics>, context?: PersonaContext): QlooAudience[] {
    const baseAudiences = this.fallbackData.get('audiences') || [];

    // Filter audiences that match demographics
    const matchingAudiences = baseAudiences.filter((audience: QlooAudience) =>
      this.audienceMatchesDemographics(audience, demographics)
    );

    // Generate custom audiences if needed
    if (matchingAudiences.length < 2) {
      const customAudiences = this.generateCustomAudiences(demographics, context);
      matchingAudiences.push(...customAudiences);
    }

    return matchingAudiences.slice(0, 5);
  }

  /**
   * Track fallback usage for analytics
   */
  private trackUsage(entityType: EntityUrn, reason: string): void {
    this.usageStats.totalCalls++;
    this.usageStats.callsByEntityType[entityType] = (this.usageStats.callsByEntityType[entityType] || 0) + 1;
    this.usageStats.callsByReason[reason] = (this.usageStats.callsByReason[reason] || 0) + 1;
    this.usageStats.lastUsed = new Date().toISOString();
  }

  /**
   * Calculate fallback confidence based on context quality
   */
  private calculateFallbackConfidence(context: PersonaContext): number {
    let confidence = 0.7; // Base fallback confidence

    if (context.interests && context.interests.length > 0) confidence += 0.1;
    if (context.demographics) confidence += 0.1;
    if (context.ageRange) confidence += 0.05;
    if (context.region) confidence += 0.05;

    return Math.min(confidence, 0.9); // Cap at 0.9 for fallback data
  }

  /**
   * Extract signals from insights parameters
   */
  private extractSignalsFromParams(params: InsightsParams): string[] {
    const signals: string[] = [];

    if (params['signal.interests.entities']) signals.push('entities');
    if (params['signal.interests.tags']) signals.push('tags');
    if (params['signal.demographics.audiences']) signals.push('audiences');

    return signals;
  }

  // Quality metric calculation methods
  private calculateCoherenceScore(context: PersonaContext): number {
    // Higher score if context has consistent information
    let score = 0.7;

    if (context.interests && context.interests.length > 2) score += 0.1;
    if (context.demographics && Object.keys(context.demographics).length > 2) score += 0.1;
    if (context.ageRange && context.incomeLevel) score += 0.1;

    return Math.min(score, 1.0);
  }

  private calculateDiversityScore(context: PersonaContext): number {
    // Score based on variety of interests and demographics
    let score = 0.6;

    const interestCount = context.interests?.length || 0;
    if (interestCount > 3) score += 0.2;
    if (interestCount > 5) score += 0.1;

    const demoFields = Object.keys(context.demographics || {}).length;
    if (demoFields > 2) score += 0.1;

    return Math.min(score, 1.0);
  }

  private calculateCulturalRelevanceScore(context: PersonaContext): number {
    // Score based on cultural context availability
    let score = 0.6;

    if (context.region) score += 0.2;
    if (context.language) score += 0.1;
    if (context.interests?.some(i => this.isCulturalInterest(i))) score += 0.1;

    return Math.min(score, 1.0);
  }

  private calculatePersonaConsistencyScore(context: PersonaContext): number {
    // Score based on how well context elements align
    let score = 0.7;

    if (this.hasConsistentAgeIncome(context)) score += 0.1;
    if (this.hasConsistentInterestsDemographics(context)) score += 0.1;
    if (this.hasConsistentRegionLanguage(context)) score += 0.1;

    return Math.min(score, 1.0);
  }

  // Helper methods for data generation and filtering
  private filterEntitiesByContext(entities: any[], context: PersonaContext): QlooEntity[] {
    return entities.filter(entity => {
      // Filter based on age appropriateness
      if (context.ageRange && entity.ageRange) {
        const overlap = this.hasAgeOverlap(context.ageRange, entity.ageRange);
        if (!overlap) return false;
      }

      // Filter based on cultural relevance
      if (context.region && entity.regions) {
        if (!entity.regions.includes(context.region)) return false;
      }

      return true;
    });
  }

  private expandEntitiesForContext(entities: QlooEntity[], entityType: string, context: PersonaContext): QlooEntity[] {
    const expanded = [...entities];

    // Generate additional entities based on interests
    if (context.interests) {
      context.interests.forEach((interest, index) => {
        if (expanded.length < 5) {
          expanded.push(this.createEntityFromInterest(interest, entityType, index));
        }
      });
    }

    return expanded;
  }

  private createEntityFromInterest(interest: string, entityType: string, index: number): QlooEntity {
    return {
      id: `fallback_${entityType}_${interest.toLowerCase().replace(/\s+/g, '_')}_${index}`,
      name: `${interest} ${this.getEntityTypeName(entityType)}`,
      type: `urn:entity:${entityType}` as EntityUrn,
      confidence: 0.75,
      description: `A ${entityType} related to ${interest}`,
      tags: [interest.toLowerCase()]
    };
  }

  private createGenericEntity(type: EntityUrn, entityType: string): QlooEntity {
    return {
      id: `generic_${entityType}_${Date.now()}`,
      name: `Generic ${this.getEntityTypeName(entityType)}`,
      type: type,
      confidence: 0.6,
      description: `A generic ${entityType} for fallback purposes`,
      tags: ['generic', entityType]
    };
  }

  private calculateEntityConfidence(entity: any, context: PersonaContext): number {
    let confidence = 0.7;

    // Boost confidence if entity matches context
    if (context.interests && entity.tags) {
      const matchingTags = entity.tags.filter((tag: string) =>
        context.interests!.some(interest =>
          interest.toLowerCase().includes(tag.toLowerCase()) ||
          tag.toLowerCase().includes(interest.toLowerCase())
        )
      );
      confidence += matchingTags.length * 0.05;
    }

    return Math.min(confidence, 0.9);
  }

  private generateTagsFromContext(context: PersonaContext): QlooTag[] {
    const tags: QlooTag[] = [];

    // Generate from interests
    if (context.interests) {
      context.interests.forEach((interest, index) => {
        tags.push({
          id: `context_tag_${index}`,
          name: interest,
          category: this.categorizeInterest(interest),
          weight: 0.8
        });
      });
    }

    // Add demographic tags
    if (context.demographics) {
      if (context.demographics.age_range) {
        tags.push({
          id: 'demo_age',
          name: `Age ${context.demographics.age_range.min}-${context.demographics.age_range.max}`,
          category: 'demographics',
          weight: 0.7
        });
      }
    }

    return tags;
  }

  private generateAudiencesFromContext(context: PersonaContext): QlooAudience[] {
    const audiences: QlooAudience[] = [];

    if (context.demographics) {
      audiences.push({
        id: 'fallback_audience_primary',
        name: this.generateAudienceName(context.demographics),
        demographics: context.demographics as QlooAudienceDemographics,
        size: this.estimateAudienceSize(context.demographics),
        interests: context.interests || [],
        description: 'Primary audience segment based on provided demographics'
      });
    }

    return audiences;
  }

  // Utility methods
  private categorizeInterest(interest: string): string {
    const categories: Record<string, string[]> = {
      'entertainment': ['music', 'movies', 'tv', 'games', 'books'],
      'lifestyle': ['fashion', 'food', 'travel', 'fitness', 'wellness'],
      'technology': ['tech', 'gadgets', 'software', 'ai', 'digital'],
      'sports': ['football', 'basketball', 'tennis', 'soccer', 'fitness'],
      'culture': ['art', 'history', 'literature', 'philosophy', 'culture']
    };

    const lowerInterest = interest.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerInterest.includes(keyword))) {
        return category;
      }
    }

    return 'general';
  }

  private getContextualTags(context?: PersonaContext): QlooTag[] {
    const tags: QlooTag[] = [];

    if (context?.region) {
      tags.push({
        id: `region_${context.region}`,
        name: context.region,
        category: 'location',
        weight: 0.6
      });
    }

    if (context?.language) {
      tags.push({
        id: `lang_${context.language}`,
        name: context.language,
        category: 'language',
        weight: 0.5
      });
    }

    return tags;
  }

  private deduplicateTags(tags: QlooTag[]): QlooTag[] {
    const seen = new Set<string>();
    return tags.filter(tag => {
      const key = tag.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private audienceMatchesDemographics(audience: QlooAudience, demographics: Partial<QlooAudienceDemographics>): boolean {
    if (!audience.demographics) return false;

    // Check age range overlap
    if (demographics.age_range && audience.demographics.age_range) {
      if (!this.hasAgeOverlap(demographics.age_range, audience.demographics.age_range)) {
        return false;
      }
    }

    // Check income level match
    if (demographics.income_level && audience.demographics.income_level) {
      if (demographics.income_level !== audience.demographics.income_level) {
        return false;
      }
    }

    return true;
  }

  private generateCustomAudiences(demographics: Partial<QlooAudienceDemographics>, context?: PersonaContext): QlooAudience[] {
    return [{
      id: 'custom_audience_1',
      name: this.generateAudienceName(demographics),
      demographics: demographics as QlooAudienceDemographics,
      size: this.estimateAudienceSize(demographics),
      interests: context?.interests || [],
      description: 'Custom audience generated from provided demographics'
    }];
  }

  private generateAudienceName(demographics: Partial<QlooAudienceDemographics>): string {
    const parts: string[] = [];

    if (demographics.age_range) {
      parts.push(`${demographics.age_range.min}-${demographics.age_range.max} years`);
    }

    if (demographics.income_level) {
      parts.push(`${demographics.income_level} income`);
    }

    if (demographics.location?.country) {
      parts.push(demographics.location.country);
    }

    return parts.length > 0 ? parts.join(', ') : 'General Audience';
  }

  private estimateAudienceSize(demographics: Partial<QlooAudienceDemographics>): number {
    // Simple estimation based on demographic specificity
    let baseSize = 1000000; // 1M base

    if (demographics.age_range) {
      const ageSpan = demographics.age_range.max - demographics.age_range.min;
      baseSize *= (ageSpan / 50); // Adjust based on age range
    }

    if (demographics.income_level) {
      const incomeMultipliers = { low: 0.4, medium: 0.8, high: 0.3, very_high: 0.1 };
      baseSize *= incomeMultipliers[demographics.income_level] || 0.5;
    }

    return Math.floor(baseSize);
  }

  private hasAgeOverlap(range1: { min: number; max: number }, range2: { min: number; max: number }): boolean {
    return range1.min <= range2.max && range2.min <= range1.max;
  }

  private isCulturalInterest(interest: string): boolean {
    const culturalKeywords = ['music', 'art', 'literature', 'film', 'culture', 'history', 'tradition'];
    return culturalKeywords.some(keyword => interest.toLowerCase().includes(keyword));
  }

  private hasConsistentAgeIncome(context: PersonaContext): boolean {
    if (!context.ageRange || !context.incomeLevel) return true;

    // Young people typically have lower income
    if (context.ageRange.max < 25 && context.incomeLevel === 'very_high') return false;
    // Older people typically have higher income
    if (context.ageRange.min > 50 && context.incomeLevel === 'low') return false;

    return true;
  }

  private hasConsistentInterestsDemographics(context: PersonaContext): boolean {
    // Simple consistency check - could be more sophisticated
    return true; // For now, assume consistency
  }

  private hasConsistentRegionLanguage(context: PersonaContext): boolean {
    if (!context.region || !context.language) return true;

    // Simple region-language consistency check
    const regionLanguageMap: Record<string, string[]> = {
      'US': ['en'],
      'FR': ['fr'],
      'ES': ['es'],
      'DE': ['de'],
      'IT': ['it']
    };

    const expectedLanguages = regionLanguageMap[context.region];
    if (expectedLanguages) {
      return expectedLanguages.includes(context.language);
    }

    return true;
  }

  private getEntityTypeName(entityType: string): string {
    const typeNames: Record<string, string> = {
      'brand': 'Brand',
      'artist': 'Artist',
      'movie': 'Movie',
      'tv_show': 'TV Show',
      'book': 'Book',
      'song': 'Song',
      'album': 'Album',
      'restaurant': 'Restaurant',
      'product': 'Product'
    };

    return typeNames[entityType] || 'Item';
  }

  /**
   * Generate a UUID for fallback data
   */
  private generateUUID(): string {
    // Simple UUID v4 implementation for fallback
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Fallback data collections
  private getBrandFallbackData(): FallbackEntityData[] {
    return [
      {
        id: 'brand_nike',
        name: 'Nike',
        type: 'urn:entity:brand',
        description: 'Global athletic footwear and apparel brand',
        tags: ['sports', 'athletic', 'lifestyle'],
        ageRange: { min: 16, max: 45 },
        regions: ['US', 'EU', 'GLOBAL']
      },
      {
        id: 'brand_apple',
        name: 'Apple',
        type: 'urn:entity:brand',
        description: 'Technology and consumer electronics brand',
        tags: ['technology', 'premium', 'innovation'],
        ageRange: { min: 18, max: 65 },
        regions: ['US', 'EU', 'GLOBAL']
      },
      {
        id: 'brand_starbucks',
        name: 'Starbucks',
        type: 'urn:entity:brand',
        description: 'Global coffeehouse chain',
        tags: ['coffee', 'lifestyle', 'social'],
        ageRange: { min: 20, max: 50 },
        regions: ['US', 'EU', 'GLOBAL']
      }
    ];
  }

  private getArtistFallbackData(): FallbackEntityData[] {
    return [
      {
        id: 'artist_taylor_swift',
        name: 'Taylor Swift',
        type: 'urn:entity:artist',
        description: 'Pop and country music artist',
        tags: ['pop', 'country', 'mainstream'],
        ageRange: { min: 13, max: 35 },
        regions: ['US', 'GLOBAL']
      },
      {
        id: 'artist_drake',
        name: 'Drake',
        type: 'urn:entity:artist',
        description: 'Hip-hop and R&B artist',
        tags: ['hip-hop', 'r&b', 'mainstream'],
        ageRange: { min: 16, max: 40 },
        regions: ['US', 'CA', 'GLOBAL']
      }
    ];
  }

  private getMovieFallbackData(): FallbackEntityData[] {
    return [
      {
        id: 'movie_avengers',
        name: 'Avengers: Endgame',
        type: 'urn:entity:movie',
        description: 'Superhero action film',
        tags: ['action', 'superhero', 'blockbuster'],
        ageRange: { min: 13, max: 50 },
        regions: ['US', 'GLOBAL']
      }
    ];
  }

  private getTvShowFallbackData(): FallbackEntityData[] {
    return [
      {
        id: 'tv_stranger_things',
        name: 'Stranger Things',
        type: 'urn:entity:tv_show',
        description: 'Science fiction horror series',
        tags: ['sci-fi', 'horror', 'nostalgia'],
        ageRange: { min: 13, max: 40 },
        regions: ['US', 'GLOBAL']
      }
    ];
  }

  private getBookFallbackData(): FallbackEntityData[] {
    return [
      {
        id: 'book_harry_potter',
        name: 'Harry Potter Series',
        type: 'urn:entity:book',
        description: 'Fantasy book series',
        tags: ['fantasy', 'young-adult', 'magic'],
        ageRange: { min: 10, max: 50 },
        regions: ['UK', 'GLOBAL']
      }
    ];
  }

  private getSongFallbackData(): FallbackEntityData[] {
    return [
      {
        id: 'song_blinding_lights',
        name: 'Blinding Lights',
        type: 'urn:entity:song',
        description: 'Pop song by The Weeknd',
        tags: ['pop', 'synth-pop', 'mainstream'],
        ageRange: { min: 16, max: 40 },
        regions: ['US', 'GLOBAL']
      }
    ];
  }

  private getAlbumFallbackData(): FallbackEntityData[] {
    return [
      {
        id: 'album_folklore',
        name: 'folklore',
        type: 'urn:entity:album',
        description: 'Album by Taylor Swift',
        tags: ['indie', 'folk', 'alternative'],
        ageRange: { min: 16, max: 40 },
        regions: ['US', 'GLOBAL']
      }
    ];
  }

  private getRestaurantFallbackData(): FallbackEntityData[] {
    return [
      {
        id: 'restaurant_mcdonalds',
        name: 'McDonald\'s',
        type: 'urn:entity:restaurant',
        description: 'Fast food restaurant chain',
        tags: ['fast-food', 'affordable', 'global'],
        ageRange: { min: 5, max: 65 },
        regions: ['US', 'GLOBAL']
      }
    ];
  }

  private getProductFallbackData(): FallbackEntityData[] {
    return [
      {
        id: 'product_iphone',
        name: 'iPhone',
        type: 'urn:entity:product',
        description: 'Smartphone by Apple',
        tags: ['technology', 'premium', 'mobile'],
        ageRange: { min: 16, max: 65 },
        regions: ['US', 'GLOBAL']
      }
    ];
  }

  private getTagFallbackData(): QlooTag[] {
    return [
      { id: 'tag_music', name: 'Music', category: 'entertainment', weight: 0.9 },
      { id: 'tag_technology', name: 'Technology', category: 'interests', weight: 0.8 },
      { id: 'tag_fashion', name: 'Fashion', category: 'lifestyle', weight: 0.7 },
      { id: 'tag_sports', name: 'Sports', category: 'activities', weight: 0.8 },
      { id: 'tag_travel', name: 'Travel', category: 'lifestyle', weight: 0.7 }
    ];
  }

  private getAudienceFallbackData(): QlooAudience[] {
    return [
      {
        id: 'audience_millennials',
        name: 'Millennials',
        demographics: {
          age_range: { min: 25, max: 40 },
          income_level: 'medium'
        },
        size: 72000000,
        interests: ['technology', 'sustainability', 'experiences'],
        description: 'Digital natives born between 1981-1996'
      },
      {
        id: 'audience_gen_z',
        name: 'Generation Z',
        demographics: {
          age_range: { min: 16, max: 24 },
          income_level: 'low'
        },
        size: 68000000,
        interests: ['social media', 'gaming', 'activism'],
        description: 'Digital natives born after 1997'
      }
    ];
  }
}

// Default fallback provider instance
export const defaultFallbackProvider = new QlooFallbackProvider();

