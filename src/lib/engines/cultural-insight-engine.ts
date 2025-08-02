import {
  CulturalInsight,
  CulturalInsights,
  CulturalInsightItem,
  InsightMetadata,
  InsightAnalytics,
  PreferenceAnalysis,
  BehavioralInfluence,
  DemographicAlignment,
  TrendAnalysis,
  InsightGenerationConfig
} from '@/types/cultural-insights';
import { Persona } from '@/types';

/**
 * Cultural Insight Generation Engine
 * 
 * Core engine responsible for generating enriched cultural insights
 * for all cultural categories, replacing the inconsistent structure
 * between simple culturalData and complex socialMediaInsights.
 */
export class CulturalInsightEngine {
  private config: InsightGenerationConfig;

  constructor(config?: Partial<InsightGenerationConfig>) {
    this.config = {
      enableQlooEnrichment: true,
      fallbackToSimpleData: true,
      minimumConfidenceThreshold: 0.3,
      maxItemsPerCategory: 10,
      enableTrendAnalysis: true,
      enableBehavioralAnalysis: true,
      ...config
    };
  }

  /**
   * Generate complete cultural insights for a persona
   * 
   * @param persona - The persona to enrich with cultural insights
   * @returns Promise<CulturalInsights> - Complete cultural insights structure
   */
  async generateInsights(persona: Partial<Persona> | null): Promise<CulturalInsights> {
    try {
      const categories = [
        'music', 'brand', 'movie', 'tv', 'book',
        'restaurant', 'travel', 'fashion', 'beauty', 'food', 'socialMedia'
      ];

      // Generate insights for each category
      const insightPromises = categories.map(category =>
        this.enrichCategory(category, persona)
      );

      const insights = await Promise.all(insightPromises);

      // Build the complete insights structure
      const culturalInsights: CulturalInsights = {
        music: insights[0],
        brand: insights[1],
        movie: insights[2],
        tv: insights[3],
        book: insights[4],
        restaurant: insights[5],
        travel: insights[6],
        fashion: insights[7],
        beauty: insights[8],
        food: insights[9],
        socialMedia: insights[10]
      };

      return culturalInsights;
    } catch (error) {
      console.error('Error generating cultural insights:', error);
      throw new Error(`Failed to generate cultural insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Enrich a specific cultural category with insights
   * 
   * @param category - The cultural category to enrich
   * @param persona - The persona context for enrichment
   * @returns Promise<CulturalInsight> - Enriched insight for the category
   */
  async enrichCategory(category: string, persona: Partial<Persona> | null): Promise<CulturalInsight> {
    try {
      // Get base cultural data for the category and its source
      const { data: baseData, source: dataSource } = await this.getBaseCulturalDataWithSource(category, persona);

      // Calculate relevance scores for items
      const relevanceScores = this.calculateRelevanceScores(baseData, persona);

      // Create insight items with enriched data
      const items: CulturalInsightItem[] = baseData.map((item, index) => ({
        name: item,
        relevanceScore: relevanceScores[index],
        confidence: this.calculateConfidence(item, persona, category),
        source: dataSource,
        attributes: this.generateItemAttributes(item, category, persona),
        relationships: this.findItemRelationships(item, baseData)
      }));

      // Filter items by confidence threshold
      const filteredItems = items.filter(item =>
        item.confidence >= this.config.minimumConfidenceThreshold
      );

      // Limit items to max per category
      const limitedItems = filteredItems.slice(0, this.config.maxItemsPerCategory);

      // Generate metadata
      const metadata: InsightMetadata = {
        generatedAt: new Date().toISOString(),
        source: this.determineOverallSource(limitedItems),
        dataQuality: this.assessDataQuality(limitedItems),
        enrichmentLevel: this.calculateEnrichmentLevel(limitedItems)
      };

      // Generate analytics
      const analytics: InsightAnalytics = {
        preferences: this.analyzePreferences(limitedItems, persona),
        behavioralInfluence: this.analyzeBehavioralInfluence(limitedItems, persona, category),
        demographicAlignment: this.analyzeDemographicAlignment(limitedItems, persona),
        trends: this.analyzeTrends(limitedItems, category)
      };

      return {
        category,
        items: limitedItems,
        metadata,
        analytics
      };
    } catch (error) {
      console.error(`Error enriching category ${category}:`, error);

      // Return fallback insight structure
      return this.createFallbackInsight(category, persona || {});
    }
  }

  /**
   * Calculate relevance scores for cultural items
   * 
   * @param items - Array of cultural items
   * @param persona - Persona context for scoring
   * @returns number[] - Array of relevance scores (0-100)
   */
  calculateRelevanceScores(items: string[], persona: Partial<Persona> | null | undefined): number[] {
    // Handle empty items array
    if (!items || items.length === 0) {
      return [];
    }

    return items.map(item => {
      let score = 50; // Base score

      // Handle null/undefined persona
      if (!persona) {
        return score;
      }

      // Age-based scoring - handle both number and invalid types
      if (persona.age && typeof persona.age === 'number' && !isNaN(persona.age)) {
        score += this.getAgeRelevanceBoost(item, persona.age);
      }

      // Occupation-based scoring - ensure it's a valid string
      if (persona.occupation && typeof persona.occupation === 'string') {
        score += this.getOccupationRelevanceBoost(item, persona.occupation);
      }

      // Location-based scoring - ensure it's a valid string
      if (persona.location && typeof persona.location === 'string') {
        score += this.getLocationRelevanceBoost(item, persona.location);
      }

      // Psychographics-based scoring - ensure it exists and is an object
      if (persona.psychographics && typeof persona.psychographics === 'object') {
        score += this.getPsychographicsRelevanceBoost(item, persona.psychographics);
      }

      // Demographics-based scoring for additional context
      if (persona.demographics && typeof persona.demographics === 'object') {
        score += this.getDemographicsRelevanceBoost(item, persona.demographics);
      }

      // Ensure score is within bounds
      return Math.max(0, Math.min(100, score));
    });
  }

  /**
   * Get base cultural data for a category from existing persona data or Qloo API
   */
  private async getBaseCulturalData(category: string, persona: Partial<Persona> | null): Promise<string[]> {
    const { data } = await this.getBaseCulturalDataWithSource(category, persona);
    return data;
  }

  /**
   * Get base cultural data for a category with its source information
   */
  private async getBaseCulturalDataWithSource(category: string, persona: Partial<Persona> | null): Promise<{ data: string[], source: 'qloo' | 'fallback' | 'user' }> {
    // Handle null/undefined persona
    if (!persona) {
      return { data: this.getFallbackDataForCategory(category), source: 'fallback' };
    }

    // Try to get from existing culturalData first
    if (persona.culturalData && persona.culturalData[category as keyof typeof persona.culturalData]) {
      const categoryData = persona.culturalData[category as keyof typeof persona.culturalData] || [];
      // If the array is not empty, use it; otherwise fall back to Qloo or default data
      if (categoryData.length > 0) {
        return { data: categoryData, source: 'user' };
      }
      // If we have an empty array, it means the data was processed but no results were found
      // Continue to try Qloo, but if that fails, we'll use fallback
    }

    // If Qloo enrichment is enabled and we have a fetch function, try to get fresh data
    if (this.config.enableQlooEnrichment && this.qlooFetchFunction && persona.age) {
      try {
        const qlooData = await this.qlooFetchFunction(
          category,
          persona.age,
          persona.occupation,
          persona.location,
          this.config.maxItemsPerCategory
        );
        
        if (qlooData && qlooData.length > 0) {
          return { data: qlooData, source: 'qloo' };
        }
      } catch (error) {
        console.warn(`Failed to fetch Qloo data for ${category}:`, error);
      }
    }

    // Fallback to default data based on category
    return { data: this.getFallbackDataForCategory(category), source: 'fallback' };
  }

  /**
   * Set Qloo fetch function for integration with Qloo API
   * This allows the engine to fetch data from Qloo when available
   */
  setQlooFetchFunction(fetchFn: (entityType: string, age: number, occupation?: string, location?: string, take?: number) => Promise<string[]>) {
    this.qlooFetchFunction = fetchFn;
  }

  private qlooFetchFunction?: (entityType: string, age: number, occupation?: string, location?: string, take?: number) => Promise<string[]>;

  /**
   * Calculate confidence score for an item
   */
  private calculateConfidence(item: string, persona: Partial<Persona> | null, category: string): number {
    let confidence = 0.5; // Base confidence

    // Handle null/undefined persona
    if (!persona) {
      return 0.3; // Low confidence for fallback
    }

    // Higher confidence if item comes from existing data
    if (persona.culturalData && persona.culturalData[category as keyof typeof persona.culturalData]?.includes(item)) {
      confidence += 0.3;
    } else if (persona.culturalData && persona.culturalData[category as keyof typeof persona.culturalData]?.length === 0) {
      // If cultural data exists but is empty, give fallback items moderate confidence
      confidence += 0.1;
    }

    // Adjust based on persona completeness
    const completeness = this.calculatePersonaCompleteness(persona);
    confidence += (completeness - 0.5) * 0.2;

    return Math.max(0, Math.min(1, confidence));
  }



  /**
   * Generate attributes for an item based on category and persona
   */
  private generateItemAttributes(item: string, category: string, persona: Partial<Persona> | null | undefined): Record<string, any> {
    const attributes: Record<string, any> = {};

    switch (category) {
      case 'music':
        attributes.genre = this.inferMusicGenre(item);
        attributes.popularity = this.inferPopularity(item);
        break;
      case 'brand':
        attributes.category = this.inferBrandCategory(item);
        attributes.priceRange = this.inferPriceRange(item, persona);
        break;
      case 'movie':
      case 'tv':
        attributes.genre = this.inferMediaGenre(item);
        attributes.rating = this.inferRating(item);
        break;
      case 'restaurant':
        attributes.cuisine = this.inferCuisineType(item);
        attributes.priceRange = this.inferRestaurantPriceRange(item, persona);
        break;
      case 'travel':
        attributes.type = this.inferTravelType(item);
        attributes.budget = this.inferTravelBudget(item, persona);
        break;
      default:
        attributes.category = category;
    }

    return attributes;
  }

  /**
   * Find relationships between items
   */
  private findItemRelationships(item: string, allItems: string[]): string[] {
    // Simple relationship detection based on common words or themes
    const relationships: string[] = [];
    const itemWords = item.toLowerCase().split(' ');

    for (const otherItem of allItems) {
      if (otherItem === item) continue;

      const otherWords = otherItem.toLowerCase().split(' ');
      const commonWords = itemWords.filter(word => otherWords.includes(word));

      if (commonWords.length > 0) {
        relationships.push(otherItem);
      }
    }

    return relationships.slice(0, 3); // Limit to 3 relationships
  }

  /**
   * Determine overall source for metadata
   */
  private determineOverallSource(items: CulturalInsightItem[]): 'qloo' | 'fallback' | 'user' | 'hybrid' {
    const sources = items.map(item => item.source);
    const uniqueSources = [...new Set(sources)];

    if (uniqueSources.length === 1) {
      return uniqueSources[0] as 'qloo' | 'fallback' | 'user';
    }

    return 'hybrid';
  }

  /**
   * Assess data quality based on items
   */
  private assessDataQuality(items: CulturalInsightItem[]): 'high' | 'medium' | 'low' {
    const avgConfidence = items.reduce((sum, item) => sum + item.confidence, 0) / items.length;

    if (avgConfidence >= 0.8) return 'high';
    if (avgConfidence >= 0.5) return 'medium';
    return 'low';
  }

  /**
   * Calculate enrichment level
   */
  private calculateEnrichmentLevel(items: CulturalInsightItem[]): number {
    const avgRelevance = items.reduce((sum, item) => sum + item.relevanceScore, 0) / items.length;
    const avgConfidence = items.reduce((sum, item) => sum + item.confidence, 0) / items.length;

    return Math.round((avgRelevance + avgConfidence * 100) / 2);
  }

  /**
   * Analyze preferences from cultural insight items
   * Categorizes preferences by strength and identifies emerging interests
   * 
   * @param items - Cultural insight items to analyze
   * @param persona - Persona context for preference analysis
   * @returns PreferenceAnalysis - Structured preference analysis
   */
  private analyzePreferences(items: CulturalInsightItem[], persona: Partial<Persona> | null): PreferenceAnalysis {
    if (!items || items.length === 0) {
      return {
        primaryPreferences: [],
        secondaryPreferences: [],
        emergingInterests: [],
        preferenceStrength: 0
      };
    }

    // Sort items by relevance score and confidence
    const sortedItems = items.sort((a, b) => {
      const scoreA = (a.relevanceScore * 0.7) + (a.confidence * 30);
      const scoreB = (b.relevanceScore * 0.7) + (b.confidence * 30);
      return scoreB - scoreA;
    });

    // Calculate preference strength based on average relevance and confidence
    const avgRelevance = sortedItems.reduce((sum, item) => sum + item.relevanceScore, 0) / sortedItems.length;
    const avgConfidence = sortedItems.reduce((sum, item) => sum + item.confidence, 0) / sortedItems.length;
    const preferenceStrength = Math.round((avgRelevance * 0.7) + (avgConfidence * 30));

    // Identify primary preferences (top scoring items with high confidence)
    const primaryPreferences = sortedItems
      .filter(item => item.confidence >= 0.7 && item.relevanceScore >= 70)
      .slice(0, 3)
      .map(item => item.name);

    // Identify secondary preferences (moderate scoring items)
    const secondaryPreferences = sortedItems
      .filter(item =>
        item.confidence >= 0.5 &&
        item.relevanceScore >= 50 &&
        item.relevanceScore < 70 &&
        !primaryPreferences.includes(item.name)
      )
      .slice(0, 4)
      .map(item => item.name);

    // Identify emerging interests (items with growing relevance or recent attributes)
    const emergingInterests = this.identifyEmergingInterests(sortedItems, persona || {});

    return {
      primaryPreferences,
      secondaryPreferences,
      emergingInterests,
      preferenceStrength
    };
  }

  /**
   * Analyze behavioral influence of cultural items
   * Measures impact on purchase decisions, social behavior, lifestyle, and emotional connection
   * 
   * @param items - Cultural insight items to analyze
   * @param persona - Persona context for behavioral analysis
   * @param category - Cultural category being analyzed
   * @returns BehavioralInfluence - Behavioral influence metrics
   */
  private analyzeBehavioralInfluence(items: CulturalInsightItem[], persona: Partial<Persona> | null, category: string): BehavioralInfluence {
    if (!items || items.length === 0) {
      return {
        purchaseInfluence: 0,
        socialInfluence: 0,
        lifestyleAlignment: 0,
        emotionalConnection: 0
      };
    }

    // Calculate purchase influence based on category and persona income
    const purchaseInfluence = this.calculatePurchaseInfluence(items, persona, category);

    // Calculate social influence based on social media presence and sharing behavior
    const socialInfluence = this.calculateSocialInfluence(items, persona, category);

    // Calculate lifestyle alignment based on persona psychographics and values
    const lifestyleAlignment = this.calculateLifestyleAlignment(items, persona);

    // Calculate emotional connection based on personal interests and values alignment
    const emotionalConnection = this.calculateEmotionalConnection(items, persona, category);

    return {
      purchaseInfluence,
      socialInfluence,
      lifestyleAlignment,
      emotionalConnection
    };
  }

  /**
   * Analyze demographic alignment of cultural preferences
   * Measures how well preferences align with age, location, and occupation
   * 
   * @param items - Cultural insight items to analyze
   * @param persona - Persona context for demographic analysis
   * @returns DemographicAlignment - Demographic alignment metrics
   */
  private analyzeDemographicAlignment(items: CulturalInsightItem[], persona: Partial<Persona> | null): DemographicAlignment {
    if (!items || items.length === 0) {
      return {
        ageGroupAlignment: 0,
        locationAlignment: 0,
        occupationAlignment: 0,
        overallFit: 0
      };
    }

    // Calculate age group alignment
    const ageGroupAlignment = this.calculateAgeGroupAlignment(items, persona);

    // Calculate location alignment
    const locationAlignment = this.calculateLocationAlignment(items, persona);

    // Calculate occupation alignment
    const occupationAlignment = this.calculateOccupationAlignment(items, persona);

    // Calculate overall demographic fit
    const overallFit = Math.round((ageGroupAlignment + locationAlignment + occupationAlignment) / 3);

    return {
      ageGroupAlignment,
      locationAlignment,
      occupationAlignment,
      overallFit
    };
  }

  /**
   * Analyze trends in cultural preferences
   * Identifies current trends, emerging trends, and innovation adoption patterns
   * 
   * @param items - Cultural insight items to analyze
   * @param category - Cultural category being analyzed
   * @returns TrendAnalysis - Trend analysis results
   */
  private analyzeTrends(items: CulturalInsightItem[], category: string): TrendAnalysis {
    if (!items || items.length === 0) {
      return {
        currentTrends: [],
        emergingTrends: [],
        trendAlignment: 0,
        innovatorScore: 0
      };
    }

    // Identify current trends based on popularity and relevance
    const currentTrends = this.identifyCurrentTrends(items, category);

    // Identify emerging trends based on growth patterns and novelty
    const emergingTrends = this.identifyEmergingTrends(items, category);

    // Calculate trend alignment score
    const trendAlignment = this.calculateTrendAlignment(items, currentTrends, emergingTrends);

    // Calculate innovator score based on early adoption patterns
    const innovatorScore = this.calculateInnovatorScore(items, emergingTrends);

    return {
      currentTrends,
      emergingTrends,
      trendAlignment,
      innovatorScore
    };
  }

  // Helper methods for behavioral influence analysis

  /**
   * Calculate purchase influence based on category and persona characteristics
   */
  private calculatePurchaseInfluence(items: CulturalInsightItem[], persona: Partial<Persona> | null | undefined, category: string): number {
    let baseInfluence = 50;

    // Category-specific purchase influence
    const categoryInfluenceMap: Record<string, number> = {
      'brand': 85,
      'fashion': 80,
      'beauty': 75,
      'food': 70,
      'restaurant': 65,
      'travel': 60,
      'music': 40,
      'movie': 35,
      'tv': 30,
      'book': 45,
      'socialMedia': 25
    };

    baseInfluence = categoryInfluenceMap[category] || 50;

    // Handle null/undefined persona
    if (!persona) {
      return Math.max(0, Math.min(100, Math.round(baseInfluence)));
    }

    // Adjust based on item attributes
    const luxuryItems = items.filter(item =>
      item.attributes?.priceRange === 'high' ||
      item.attributes?.category === 'luxury' ||
      item.name.toLowerCase().includes('luxury') ||
      item.name.toLowerCase().includes('premium')
    );

    if (luxuryItems.length > 0) {
      // Check if persona has high income
      if (persona.demographics?.income?.toLowerCase().includes('high')) {
        baseInfluence += 15;
      } else {
        baseInfluence -= 10; // Luxury items but low income
      }
    }

    // Adjust based on confidence levels
    const avgConfidence = items.reduce((sum, item) => sum + item.confidence, 0) / items.length;
    baseInfluence += (avgConfidence - 0.5) * 20;

    return Math.max(0, Math.min(100, Math.round(baseInfluence)));
  }

  /**
   * Calculate social influence based on sharing potential and social media alignment
   */
  private calculateSocialInfluence(items: CulturalInsightItem[], persona: Partial<Persona> | null | undefined, category: string): number {
    let baseInfluence = 40;

    // Categories with high social sharing potential
    const socialCategoryMap: Record<string, number> = {
      'socialMedia': 90,
      'fashion': 75,
      'beauty': 70,
      'travel': 80,
      'food': 65,
      'restaurant': 60,
      'music': 55,
      'movie': 50,
      'tv': 45,
      'book': 35,
      'brand': 40
    };

    baseInfluence = socialCategoryMap[category] || 40;

    // Handle null/undefined persona
    if (!persona) {
      return Math.max(0, Math.min(100, Math.round(baseInfluence)));
    }

    // Adjust based on age (younger people tend to share more)
    if (persona.age && typeof persona.age === 'number') {
      if (persona.age < 25) {
        baseInfluence += 20;
      } else if (persona.age < 35) {
        baseInfluence += 10;
      } else if (persona.age > 55) {
        baseInfluence -= 15;
      }
    }

    // Adjust based on social media presence in cultural data
    if (persona.culturalData?.socialMedia && persona.culturalData.socialMedia.length > 0) {
      baseInfluence += 15;
    }

    // Adjust based on item popularity and trendiness
    const trendyItems = items.filter(item =>
      item.relevanceScore > 75 ||
      item.name.toLowerCase().includes('trending') ||
      item.name.toLowerCase().includes('viral')
    );

    if (trendyItems.length > 0) {
      baseInfluence += (trendyItems.length / items.length) * 20;
    }

    return Math.max(0, Math.min(100, Math.round(baseInfluence)));
  }

  /**
   * Calculate lifestyle alignment based on psychographics and values
   */
  private calculateLifestyleAlignment(items: CulturalInsightItem[], persona: Partial<Persona> | null | undefined): number {
    let alignment = 50;

    if (!persona || !persona.psychographics) {
      return alignment;
    }

    // Check alignment with interests
    if (persona.psychographics.interests && Array.isArray(persona.psychographics.interests)) {
      const matchingItems = items.filter(item => {
        const itemLower = item.name.toLowerCase();
        return persona.psychographics!.interests!.some((interest: string) =>
          itemLower.includes(interest.toLowerCase()) ||
          interest.toLowerCase().includes(itemLower)
        );
      });

      if (matchingItems.length > 0) {
        alignment += (matchingItems.length / items.length) * 30;
      }
    }

    // Check alignment with values
    if (persona.psychographics.values && Array.isArray(persona.psychographics.values)) {
      const sustainabilityValues = persona.psychographics.values.filter((value: string) =>
        value.toLowerCase().includes('sustainability') ||
        value.toLowerCase().includes('environment') ||
        value.toLowerCase().includes('eco')
      );

      if (sustainabilityValues.length > 0) {
        const ecoItems = items.filter(item =>
          item.name.toLowerCase().includes('eco') ||
          item.name.toLowerCase().includes('sustainable') ||
          item.name.toLowerCase().includes('bio') ||
          item.name.toLowerCase().includes('green')
        );

        if (ecoItems.length > 0) {
          alignment += 20;
        }
      }
    }

    // Check lifestyle consistency across items
    const avgRelevance = items.reduce((sum, item) => sum + item.relevanceScore, 0) / items.length;
    alignment += (avgRelevance - 50) * 0.3;

    return Math.max(0, Math.min(100, Math.round(alignment)));
  }

  /**
   * Calculate emotional connection based on personal resonance
   */
  private calculateEmotionalConnection(items: CulturalInsightItem[], persona: Partial<Persona> | null | undefined, category: string): number {
    let connection = 40;

    // Categories with higher emotional connection potential
    const emotionalCategoryMap: Record<string, number> = {
      'music': 80,
      'book': 70,
      'movie': 65,
      'tv': 60,
      'travel': 75,
      'food': 55,
      'fashion': 50,
      'beauty': 45,
      'brand': 40,
      'restaurant': 50,
      'socialMedia': 35
    };

    connection = emotionalCategoryMap[category] || 40;

    // Handle null/undefined persona
    if (!persona) {
      return Math.max(0, Math.min(100, Math.round(connection)));
    }

    // Adjust based on confidence and relevance
    const highConfidenceItems = items.filter(item => item.confidence > 0.7);
    if (highConfidenceItems.length > 0) {
      connection += (highConfidenceItems.length / items.length) * 25;
    }

    // Adjust based on personal interests alignment
    if (persona.psychographics?.interests) {
      const personalItems = items.filter(item => {
        const itemLower = item.name.toLowerCase();
        return persona.psychographics!.interests!.some((interest: string) =>
          itemLower.includes(interest.toLowerCase())
        );
      });

      if (personalItems.length > 0) {
        connection += (personalItems.length / items.length) * 20;
      }
    }

    // Adjust based on item relationships (items with relationships suggest deeper engagement)
    const connectedItems = items.filter(item => item.relationships && item.relationships.length > 0);
    if (connectedItems.length > 0) {
      connection += (connectedItems.length / items.length) * 15;
    }

    return Math.max(0, Math.min(100, Math.round(connection)));
  }

  // Helper methods for demographic alignment analysis

  /**
   * Calculate age group alignment
   */
  private calculateAgeGroupAlignment(items: CulturalInsightItem[], persona: Partial<Persona> | null | undefined): number {
    let alignment = 50;

    if (!persona || !persona.age || typeof persona.age !== 'number') {
      return alignment;
    }

    // Age-based preference patterns
    const age = persona.age;

    if (age < 25) {
      // Gen Z preferences
      const genZItems = items.filter(item => {
        const itemLower = item.name.toLowerCase();
        return itemLower.includes('tiktok') ||
          itemLower.includes('gaming') ||
          itemLower.includes('streaming') ||
          itemLower.includes('social') ||
          itemLower.includes('digital');
      });
      alignment += (genZItems.length / items.length) * 30;

    } else if (age < 40) {
      // Millennial preferences
      const millennialItems = items.filter(item => {
        const itemLower = item.name.toLowerCase();
        return itemLower.includes('instagram') ||
          itemLower.includes('netflix') ||
          itemLower.includes('craft') ||
          itemLower.includes('artisan') ||
          itemLower.includes('experience');
      });
      alignment += (millennialItems.length / items.length) * 25;

    } else if (age < 55) {
      // Gen X preferences
      const genXItems = items.filter(item => {
        const itemLower = item.name.toLowerCase();
        return itemLower.includes('facebook') ||
          itemLower.includes('traditional') ||
          itemLower.includes('classic') ||
          itemLower.includes('established');
      });
      alignment += (genXItems.length / items.length) * 20;

    } else {
      // Boomer preferences
      const boomerItems = items.filter(item => {
        const itemLower = item.name.toLowerCase();
        return itemLower.includes('traditional') ||
          itemLower.includes('classic') ||
          itemLower.includes('heritage') ||
          itemLower.includes('established') ||
          itemLower.includes('quality');
      });
      alignment += (boomerItems.length / items.length) * 25;
    }

    return Math.max(0, Math.min(100, Math.round(alignment)));
  }

  /**
   * Calculate location alignment
   */
  private calculateLocationAlignment(items: CulturalInsightItem[], persona: Partial<Persona> | null | undefined): number {
    let alignment = 60; // Default moderate alignment

    if (!persona || !persona.location || typeof persona.location !== 'string') {
      return alignment;
    }

    const location = persona.location.toLowerCase();

    // Urban vs rural preferences
    if (location.includes('city') || location.includes('urban') || location.includes('metropolitan')) {
      const urbanItems = items.filter(item => {
        const itemLower = item.name.toLowerCase();
        return itemLower.includes('urban') ||
          itemLower.includes('modern') ||
          itemLower.includes('contemporary') ||
          itemLower.includes('trendy') ||
          itemLower.includes('cosmopolitan');
      });
      alignment += (urbanItems.length / items.length) * 20;

    } else if (location.includes('rural') || location.includes('country') || location.includes('small town')) {
      const ruralItems = items.filter(item => {
        const itemLower = item.name.toLowerCase();
        return itemLower.includes('traditional') ||
          itemLower.includes('local') ||
          itemLower.includes('artisan') ||
          itemLower.includes('craft') ||
          itemLower.includes('heritage');
      });
      alignment += (ruralItems.length / items.length) * 20;
    }

    // Regional cultural alignment (simplified)
    const culturalItems = items.filter(item => {
      const itemLower = item.name.toLowerCase();
      return itemLower.includes('local') ||
        itemLower.includes('regional') ||
        itemLower.includes('cultural');
    });

    if (culturalItems.length > 0) {
      alignment += (culturalItems.length / items.length) * 15;
    }

    return Math.max(0, Math.min(100, Math.round(alignment)));
  }

  /**
   * Calculate occupation alignment
   */
  private calculateOccupationAlignment(items: CulturalInsightItem[], persona: Partial<Persona> | null | undefined): number {
    let alignment = 55;

    if (!persona || !persona.occupation || typeof persona.occupation !== 'string') {
      return alignment;
    }

    const occupation = persona.occupation.toLowerCase();

    // Tech/Creative professional alignment
    if (occupation.includes('tech') || occupation.includes('developer') || occupation.includes('engineer')) {
      const techItems = items.filter(item => {
        const itemLower = item.name.toLowerCase();
        return itemLower.includes('tech') ||
          itemLower.includes('digital') ||
          itemLower.includes('innovation') ||
          itemLower.includes('startup') ||
          itemLower.includes('modern');
      });
      alignment += (techItems.length / items.length) * 25;

    } else if (occupation.includes('creative') || occupation.includes('artist') || occupation.includes('designer')) {
      const creativeItems = items.filter(item => {
        const itemLower = item.name.toLowerCase();
        return itemLower.includes('art') ||
          itemLower.includes('creative') ||
          itemLower.includes('design') ||
          itemLower.includes('indie') ||
          itemLower.includes('alternative');
      });
      alignment += (creativeItems.length / items.length) * 25;

    } else if (occupation.includes('business') || occupation.includes('manager') || occupation.includes('executive')) {
      const businessItems = items.filter(item => {
        const itemLower = item.name.toLowerCase();
        return itemLower.includes('premium') ||
          itemLower.includes('professional') ||
          itemLower.includes('luxury') ||
          itemLower.includes('quality') ||
          itemLower.includes('established');
      });
      alignment += (businessItems.length / items.length) * 20;

    } else if (occupation.includes('education') || occupation.includes('teacher') || occupation.includes('academic')) {
      const educationalItems = items.filter(item => {
        const itemLower = item.name.toLowerCase();
        return itemLower.includes('educational') ||
          itemLower.includes('documentary') ||
          itemLower.includes('cultural') ||
          itemLower.includes('intellectual') ||
          itemLower.includes('literary');
      });
      alignment += (educationalItems.length / items.length) * 20;
    }

    return Math.max(0, Math.min(100, Math.round(alignment)));
  }

  // Helper methods for trend analysis

  /**
   * Identify emerging interests based on novelty and growth patterns
   */
  private identifyEmergingInterests(items: CulturalInsightItem[], persona: Partial<Persona> | null): string[] {
    // Look for items with moderate relevance but high confidence (suggesting new interests)
    const emergingCandidates = items.filter(item =>
      item.relevanceScore >= 40 &&
      item.relevanceScore <= 70 &&
      item.confidence >= 0.6
    );

    // Look for items that suggest novelty or trends
    const trendyItems = items.filter(item => {
      const itemLower = item.name.toLowerCase();
      return itemLower.includes('new') ||
        itemLower.includes('emerging') ||
        itemLower.includes('trending') ||
        itemLower.includes('latest') ||
        itemLower.includes('innovative');
    });

    const combined = [...emergingCandidates, ...trendyItems];
    const unique = Array.from(new Set(combined.map(item => item.name)));

    return unique.slice(0, 3);
  }

  /**
   * Identify current trends in the category
   */
  private identifyCurrentTrends(items: CulturalInsightItem[], category: string): string[] {
    // High relevance, high confidence items are likely current trends
    const trendCandidates = items
      .filter(item => item.relevanceScore >= 70 && item.confidence >= 0.6)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Category-specific trend identification
    const categoryTrends = this.getCategorySpecificTrends(items, category);

    const combined = [...trendCandidates.map(item => item.name), ...categoryTrends];
    const unique = Array.from(new Set(combined));

    return unique.slice(0, 4);
  }

  /**
   * Identify emerging trends based on growth patterns
   */
  private identifyEmergingTrends(items: CulturalInsightItem[], category: string): string[] {
    // Look for items with growing relevance or innovative attributes
    const emergingCandidates = items.filter(item => {
      const itemLower = item.name.toLowerCase();
      return (item.relevanceScore >= 50 && item.confidence >= 0.5) ||
        itemLower.includes('emerging') ||
        itemLower.includes('new') ||
        itemLower.includes('innovative') ||
        itemLower.includes('next');
    });

    return emergingCandidates
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3)
      .map(item => item.name);
  }

  /**
   * Calculate trend alignment score
   */
  private calculateTrendAlignment(items: CulturalInsightItem[], currentTrends: string[], emergingTrends: string[]): number {
    const allTrends = [...currentTrends, ...emergingTrends];

    if (allTrends.length === 0) {
      return 30; // Low alignment if no trends identified
    }

    const trendAlignedItems = items.filter(item =>
      allTrends.some(trend =>
        trend.toLowerCase().includes(item.name.toLowerCase()) ||
        item.name.toLowerCase().includes(trend.toLowerCase())
      )
    );

    const alignmentRatio = trendAlignedItems.length / items.length;
    const avgRelevanceOfTrendItems = trendAlignedItems.length > 0
      ? trendAlignedItems.reduce((sum, item) => sum + item.relevanceScore, 0) / trendAlignedItems.length
      : 0;

    const alignment = (alignmentRatio * 50) + (avgRelevanceOfTrendItems * 0.5);

    return Math.max(0, Math.min(100, Math.round(alignment)));
  }

  /**
   * Calculate innovator score based on early adoption patterns
   */
  private calculateInnovatorScore(items: CulturalInsightItem[], emergingTrends: string[]): number {
    let score = 40; // Base score

    // Higher score for having emerging trends
    if (emergingTrends.length > 0) {
      score += emergingTrends.length * 15;
    }

    // Look for innovative or cutting-edge items
    const innovativeItems = items.filter(item => {
      const itemLower = item.name.toLowerCase();
      return itemLower.includes('innovative') ||
        itemLower.includes('cutting-edge') ||
        itemLower.includes('experimental') ||
        itemLower.includes('avant-garde') ||
        itemLower.includes('pioneering') ||
        itemLower.includes('breakthrough');
    });

    if (innovativeItems.length > 0) {
      score += (innovativeItems.length / items.length) * 30;
    }

    // Adjust based on confidence in new items
    const newItems = items.filter(item => {
      const itemLower = item.name.toLowerCase();
      return itemLower.includes('new') || itemLower.includes('latest');
    });

    if (newItems.length > 0) {
      const avgConfidenceInNew = newItems.reduce((sum, item) => sum + item.confidence, 0) / newItems.length;
      score += avgConfidenceInNew * 20;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Get category-specific trends
   */
  private getCategorySpecificTrends(items: CulturalInsightItem[], category: string): string[] {
    const trends: Record<string, string[]> = {
      'music': ['streaming', 'indie', 'electronic', 'lo-fi'],
      'fashion': ['sustainable', 'vintage', 'streetwear', 'minimalist'],
      'beauty': ['clean beauty', 'k-beauty', 'natural', 'cruelty-free'],
      'food': ['plant-based', 'organic', 'local', 'artisan'],
      'travel': ['eco-tourism', 'digital nomad', 'local experiences', 'sustainable'],
      'socialMedia': ['short-form video', 'authentic content', 'community-driven', 'creator economy'],
      'brand': ['purpose-driven', 'sustainable', 'direct-to-consumer', 'personalized'],
      'restaurant': ['farm-to-table', 'fusion', 'plant-based', 'ghost kitchen'],
      'movie': ['streaming originals', 'international', 'documentary', 'limited series'],
      'tv': ['binge-worthy', 'international', 'reality', 'true crime'],
      'book': ['audiobooks', 'diverse voices', 'self-help', 'graphic novels']
    };

    const categoryTrends = trends[category] || [];

    return items
      .filter(item => {
        const itemLower = item.name.toLowerCase();
        return categoryTrends.some(trend =>
          itemLower.includes(trend.toLowerCase()) ||
          trend.toLowerCase().includes(itemLower)
        );
      })
      .map(item => item.name);
  }

  // Helper methods for scoring and inference
  private getAgeRelevanceBoost(item: string, age: number): number {
    // Age-based relevance logic
    if (age < 25) {
      if (item.toLowerCase().includes('tiktok') || item.toLowerCase().includes('gaming')) return 20;
    } else if (age > 50) {
      if (item.toLowerCase().includes('facebook') || item.toLowerCase().includes('traditional')) return 15;
    }
    return 0;
  }

  private getOccupationRelevanceBoost(item: string, occupation: string): number {
    const occupationLower = occupation.toLowerCase();
    const itemLower = item.toLowerCase();

    if (occupationLower.includes('tech') && itemLower.includes('tech')) return 15;
    if (occupationLower.includes('creative') && itemLower.includes('art')) return 15;

    return 0;
  }

  private getLocationRelevanceBoost(item: string, location: string): number {
    // Location-based relevance logic
    return 0; // Placeholder
  }

  private getPsychographicsRelevanceBoost(item: string, psychographics: any): number {
    if (!psychographics) return 0;

    let boost = 0;
    const itemLower = item.toLowerCase();

    // Check interests alignment
    if (psychographics.interests && Array.isArray(psychographics.interests)) {
      const matchingInterests = psychographics.interests.filter((interest: string) =>
        itemLower.includes(interest.toLowerCase()) || interest.toLowerCase().includes(itemLower)
      );
      boost += matchingInterests.length * 5;
    }

    // Check values alignment
    if (psychographics.values && Array.isArray(psychographics.values)) {
      const matchingValues = psychographics.values.filter((value: string) =>
        itemLower.includes(value.toLowerCase()) || value.toLowerCase().includes(itemLower)
      );
      boost += matchingValues.length * 3;
    }

    return Math.min(boost, 20); // Cap at 20 points
  }

  private getDemographicsRelevanceBoost(item: string, demographics: any): number {
    if (!demographics) return 0;

    let boost = 0;
    const itemLower = item.toLowerCase();

    // Income-based relevance
    if (demographics.income) {
      const income = demographics.income.toLowerCase();
      if (income.includes('high') && (itemLower.includes('luxury') || itemLower.includes('premium'))) {
        boost += 10;
      } else if (income.includes('low') && (itemLower.includes('budget') || itemLower.includes('affordable'))) {
        boost += 10;
      }
    }

    // Education-based relevance
    if (demographics.education) {
      const education = demographics.education.toLowerCase();
      if (education.includes('master') || education.includes('phd')) {
        if (itemLower.includes('documentary') || itemLower.includes('educational') || itemLower.includes('tech')) {
          boost += 5;
        }
      }
    }

    return Math.min(boost, 15); // Cap at 15 points
  }

  private calculatePersonaCompleteness(persona: Partial<Persona>): number {
    if (!persona) return 0;

    let completeness = 0;
    const fields = ['age', 'occupation', 'location', 'psychographics', 'demographics'];

    fields.forEach(field => {
      if (persona[field as keyof Persona]) completeness += 0.2;
    });

    return completeness;
  }

  // Inference methods for attributes
  private inferMusicGenre(item: string): string {
    const itemLower = item.toLowerCase();
    if (itemLower.includes('pop')) return 'Pop';
    if (itemLower.includes('rock')) return 'Rock';
    if (itemLower.includes('jazz')) return 'Jazz';
    if (itemLower.includes('electronic')) return 'Electronic';
    return 'General';
  }

  private inferPopularity(item: string): 'high' | 'medium' | 'low' {
    // Simple popularity inference
    return 'medium';
  }

  private inferBrandCategory(item: string): string {
    const itemLower = item.toLowerCase();
    if (itemLower.includes('tech') || itemLower.includes('apple') || itemLower.includes('google')) return 'Technology';
    if (itemLower.includes('fashion') || itemLower.includes('zara') || itemLower.includes('nike')) return 'Fashion';
    if (itemLower.includes('beauty') || itemLower.includes('sephora')) return 'Beauty';
    return 'General';
  }

  private inferPriceRange(item: string, persona: Partial<Persona> | null | undefined): 'low' | 'medium' | 'high' {
    // Price range inference based on brand and persona income
    if (persona?.demographics?.income) {
      const income = persona.demographics.income.toLowerCase();
      if (income.includes('high')) return 'high';
      if (income.includes('low')) return 'low';
    }
    return 'medium';
  }

  private inferMediaGenre(item: string): string {
    const itemLower = item.toLowerCase();
    if (itemLower.includes('comedy') || itemLower.includes('comédie')) return 'Comedy';
    if (itemLower.includes('drama') || itemLower.includes('drame')) return 'Drama';
    if (itemLower.includes('action')) return 'Action';
    if (itemLower.includes('documentary') || itemLower.includes('documentaire')) return 'Documentary';
    return 'General';
  }

  private inferRating(item: string): string {
    return 'PG-13'; // Placeholder
  }

  private inferCuisineType(item: string): string {
    const itemLower = item.toLowerCase();
    if (itemLower.includes('italian') || itemLower.includes('italien')) return 'Italian';
    if (itemLower.includes('asian') || itemLower.includes('asiatique')) return 'Asian';
    if (itemLower.includes('french') || itemLower.includes('français')) return 'French';
    if (itemLower.includes('mexican') || itemLower.includes('mexicain')) return 'Mexican';
    return 'International';
  }

  private inferRestaurantPriceRange(item: string, persona: Partial<Persona> | null | undefined): 'budget' | 'mid-range' | 'upscale' {
    if (item.toLowerCase().includes('food truck') || item.toLowerCase().includes('fast')) return 'budget';
    if (item.toLowerCase().includes('fine dining') || item.toLowerCase().includes('gastronomique')) return 'upscale';
    return 'mid-range';
  }

  private inferTravelType(item: string): string {
    const itemLower = item.toLowerCase();
    if (itemLower.includes('adventure') || itemLower.includes('aventure')) return 'Adventure';
    if (itemLower.includes('luxury') || itemLower.includes('luxe')) return 'Luxury';
    if (itemLower.includes('budget') || itemLower.includes('économique')) return 'Budget';
    if (itemLower.includes('cultural') || itemLower.includes('culturel')) return 'Cultural';
    return 'General';
  }

  private inferTravelBudget(item: string, persona: Partial<Persona> | null | undefined): 'low' | 'medium' | 'high' {
    if (item.toLowerCase().includes('luxury') || item.toLowerCase().includes('luxe')) return 'high';
    if (item.toLowerCase().includes('budget') || item.toLowerCase().includes('économique')) return 'low';
    return 'medium';
  }

  /**
   * Get fallback data for a category
   */
  private getFallbackDataForCategory(category: string): string[] {
    const fallbackData: Record<string, string[]> = {
      music: ['Indie Pop', 'Electronic', 'Jazz moderne', 'Alternative Rock'],
      brand: ['Apple', 'Zara', 'Sephora', 'Airbnb', 'Nike'],
      movie: ['Films indépendants', 'Documentaires', 'Comédies', 'Drames'],
      tv: ['Séries Netflix', 'Documentaires', 'Comédies', 'Séries dramatiques'],
      book: ['Romans contemporains', 'Développement personnel', 'Biographies', 'Science-fiction'],
      restaurant: ['Restaurants bio', 'Cuisine fusion', 'Food trucks', 'Gastronomie locale'],
      travel: ['Voyages éco-responsables', 'City breaks', 'Aventures outdoor', 'Voyages culturels'],
      fashion: ['Mode durable', 'Streetwear', 'Vintage', 'Minimalisme'],
      beauty: ['Cosmétiques naturels', 'Skincare coréenne', 'Maquillage minimaliste', 'Soins bio'],
      food: ['Cuisine végétarienne', 'Superfoods', 'Cuisine locale', 'Alimentation bio'],
      socialMedia: ['Instagram', 'LinkedIn', 'TikTok', 'Twitter']
    };

    return fallbackData[category] || ['General', 'Popular', 'Trending'];
  }

  /**
   * Create fallback insight when enrichment fails
   */
  private createFallbackInsight(category: string, persona: Partial<Persona> | null): CulturalInsight {
    const fallbackItems = this.getFallbackDataForCategory(category);
    const items: CulturalInsightItem[] = fallbackItems.map(item => ({
      name: item,
      relevanceScore: 50,
      confidence: 0.3,
      source: 'fallback',
      attributes: {},
      relationships: []
    }));

    return {
      category,
      items,
      metadata: {
        generatedAt: new Date().toISOString(),
        source: 'fallback',
        dataQuality: 'low',
        enrichmentLevel: 30
      },
      analytics: {
        preferences: {
          primaryPreferences: fallbackItems.slice(0, 3),
          secondaryPreferences: [],
          emergingInterests: [],
          preferenceStrength: 30
        },
        behavioralInfluence: {
          purchaseInfluence: 30,
          socialInfluence: 30,
          lifestyleAlignment: 30,
          emotionalConnection: 30
        },
        demographicAlignment: {
          ageGroupAlignment: 30,
          locationAlignment: 30,
          occupationAlignment: 30,
          overallFit: 30
        },
        trends: {
          currentTrends: [],
          emergingTrends: [],
          trendAlignment: 30,
          innovatorScore: 30
        }
      }
    };
  }
}