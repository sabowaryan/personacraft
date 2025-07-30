import { BriefFormData } from '@/components/forms/BriefForm';
import { QlooSignals, CulturalConstraints, QlooFirstError } from '@/types/qloo-first';
import { QlooClient } from '@/lib/api/qloo/client';
import { normalizeLocation, getAgeRange } from '@/lib/api/qloo/mappers';
import { QlooCacheService, getQlooCacheService } from '@/lib/services/qloo-cache';
import { QlooBatchProcessor, getQlooBatchProcessor } from '@/lib/services/qloo-batch-processor';
import { QlooPerformanceMonitor } from '@/lib/services/qloo-performance-monitor';
import { qlooApiAdapter } from '@/lib/api/qloo/qloo-api-adapter';

/**
 * Service responsible for extracting signals from BriefFormData and fetching cultural data from Qloo API
 */
export class QlooSignalExtractor {
    private qlooClient: QlooClient;
    private performanceMonitor?: QlooPerformanceMonitor;

    constructor(performanceMonitor?: QlooPerformanceMonitor) {
        this.qlooClient = new QlooClient();
        this.performanceMonitor = performanceMonitor;
    }

    /**
     * Extract signals from BriefFormData for Qloo API consumption
     * Requirements: 3.1, 3.2, 3.3, 3.4
     */
    extractSignals(briefFormData: BriefFormData): QlooSignals {
        try {
            // Extract occupation from brief if possible
            const occupation = this.extractOccupationFromBrief(briefFormData.brief);

            const signals: QlooSignals = {
                demographics: {
                    ageRange: briefFormData.ageRange,
                    location: normalizeLocation(briefFormData.location),
                    occupation
                },
                interests: briefFormData.interests,
                values: briefFormData.values,
                culturalContext: {
                    language: briefFormData.language,
                    personaCount: briefFormData.personaCount
                }
            };

            // Validate extracted signals
            this.validateSignals(signals);

            return signals;
        } catch (error) {
            throw new Error(`${QlooFirstError.SIGNAL_EXTRACTION_FAILED}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Fetch cultural data from Qloo API using extracted signals
     * Requirements: 1.1, 1.2, 4.1, 4.2, 6.1, 6.4, 6.5
     */
    async fetchCulturalData(signals: QlooSignals): Promise<CulturalConstraints> {
        const startTime = Date.now();

        try {
            // Check cache first for complete cultural constraints
            const cacheService = getQlooCacheService();
            const cachedConstraints = cacheService.getCulturalConstraints(signals);

            if (cachedConstraints) {
                const cacheTime = Date.now() - startTime;
                console.log(`🎯 Using cached cultural constraints (${cacheTime}ms)`);

                // Record cache performance metrics
                if (this.performanceMonitor) {
                    // Record cache hit for overall cultural constraints
                    this.performanceMonitor.recordQlooApiCall('cultural_constraints', cacheTime, true,
                        Object.values(cachedConstraints).reduce((sum, items) => sum + items.length, 0));
                }

                return cachedConstraints;
            }

            // Prepare audience signal based on age range
            const audienceSignal = this.getAudienceSignal(signals.demographics.ageRange);

            // Map interests and values to Qloo categories
            const interestCategories = this.mapInterestsToQlooCategories(signals.interests);
            const valueSignals = this.mapValuesToQlooSignals(signals.values);

            // Optimize entity types configuration based on personaCount
            // Requirements: 6.5 - Optimize for personaCount parameter to avoid redundant calls
            const entityTypesConfig = this.optimizeEntityTypesForPersonaCount(signals.culturalContext.personaCount);

            // Use batch processor for optimized API calls
            // Requirements: 6.1 - Batch processing for multiple Qloo API calls
            const batchProcessor = getQlooBatchProcessor({
                maxConcurrentRequests: Math.min(3, Math.ceil(signals.culturalContext.personaCount / 2)),
                batchSize: Math.max(5, signals.culturalContext.personaCount * 2),
                enableDeduplication: true
            });

            // Create entity types configuration for batch processing
            const entityTypesConfigArray = Object.entries(entityTypesConfig).map(([type, take]) => ({
                type,
                take,
                priority: this.getEntityTypePriority(type)
            }));

            const batchRequests = batchProcessor.createOptimizedRequests(signals, entityTypesConfigArray);

            console.log(`📦 Processing ${batchRequests.length} batch requests for ${signals.culturalContext.personaCount} personas`);

            // Create optimized fetch function with enhanced caching
            const fetchFunction = async (entityType: string, requestSignals: QlooSignals, take: number): Promise<string[]> => {
                return this.fetchEntityDataWithOptimization(entityType, {
                    audienceSignal,
                    location: requestSignals.demographics.location,
                    interestCategories,
                    valueSignals,
                    occupation: requestSignals.demographics.occupation,
                    personaCount: requestSignals.culturalContext.personaCount
                }, take);
            };

            // Process batch requests with intelligent caching and parallel processing
            const batchResultsArray = await batchProcessor.processBatch(batchRequests, fetchFunction);

            // Convert batch results array to object format
            const batchResults: Record<string, string[]> = {};
            batchResultsArray.forEach(result => {
                batchResults[result.entityType] = result.data;
            });

            // Build cultural constraints from batch results with performance tracking
            const constraints = this.buildCulturalConstraintsFromBatchResults(batchResults, signals);

            // Add social media data using existing enrichment logic (with caching)
            try {
                const socialMediaData = await this.fetchSocialMediaDataWithCaching(signals);
                constraints.socialMedia = socialMediaData;
            } catch (error) {
                console.warn('Failed to fetch social media data:', error);
                constraints.socialMedia = [];
            }

            // Apply intelligent fallback mechanisms if insufficient data
            this.applyIntelligentFallbackMechanisms(constraints, signals);

            // Validate that we have sufficient cultural data
            if (this.isCulturalDataInsufficient(constraints)) {
                throw new Error(QlooFirstError.CULTURAL_DATA_INSUFFICIENT);
            }

            // Cache the complete cultural constraints for future use with optimized TTL
            const cacheTTL = this.calculateOptimalCacheTTL(signals, constraints);
            cacheService.setCulturalConstraints(signals, constraints, cacheTTL);

            const processingTime = Date.now() - startTime;
            console.log(`✅ Cultural data fetched successfully in ${processingTime}ms`);

            // Record overall performance metrics
            if (this.performanceMonitor) {
                const totalItems = Object.values(constraints).reduce((sum, items) => sum + items.length, 0);
                this.performanceMonitor.recordQlooApiCall('cultural_data_complete', processingTime, false, totalItems);
            }

            return constraints;
        } catch (error) {
            const processingTime = Date.now() - startTime;
            console.error(`❌ Cultural data fetch failed after ${processingTime}ms:`, error);

            // Record error in performance monitor
            if (this.performanceMonitor) {
                this.performanceMonitor.recordQlooApiCall('cultural_data_error', processingTime, false, 0);
            }

            if (error instanceof Error && error.message.includes(QlooFirstError.CULTURAL_DATA_INSUFFICIENT)) {
                throw error;
            }
            throw new Error(`${QlooFirstError.QLOO_API_UNAVAILABLE}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Map interests to Qloo categories for PREDEFINED_INTERESTS and custom interests
     * Requirements: 4.4, 4.5, 6.3
     */
    mapInterestsToQlooCategories(interests: string[]): string[] {
        const interestMapping: Record<string, string[]> = {
            'Sport et fitness': ['fitness', 'sports', 'health'],
            'Technologie': ['technology', 'innovation', 'gadgets'],
            'Voyage': ['travel', 'adventure', 'culture'],
            'Cuisine': ['food', 'cooking', 'restaurants'],
            'Mode': ['fashion', 'style', 'clothing'],
            'Musique': ['music', 'concerts', 'artists'],
            'Lecture': ['books', 'literature', 'reading'],
            'Cinéma': ['movies', 'cinema', 'entertainment'],
            'Art': ['art', 'creativity', 'design'],
            'Nature': ['nature', 'outdoors', 'environment'],
            'Gaming': ['gaming', 'video_games', 'esports'],
            'Photographie': ['photography', 'visual_arts', 'creativity'],
            'Entrepreneuriat': ['business', 'entrepreneurship', 'startups'],
            'Développement personnel': ['self_improvement', 'wellness', 'mindfulness'],
            'Famille': ['family', 'parenting', 'relationships'],
            'Santé et bien-être': ['health', 'wellness', 'fitness']
        };

        const categories: string[] = [];

        interests.forEach(interest => {
            // Check if it's a predefined interest
            if (interestMapping[interest]) {
                categories.push(...interestMapping[interest]);
            } else {
                // For custom interests, use them directly (normalized)
                categories.push(interest.toLowerCase().replace(/\s+/g, '_'));
            }
        });

        // Remove duplicates and return
        return [...new Set(categories)];
    }

    /**
     * Map values to Qloo signals for PREDEFINED_VALUES and custom values
     * Requirements: 4.4, 4.5, 6.3
     */
    mapValuesToQlooSignals(values: string[]): Record<string, string> {
        const valueMapping: Record<string, string> = {
            'Authenticité': 'authentic_brands',
            'Innovation': 'innovative_products',
            'Durabilité': 'sustainable_brands',
            'Qualité': 'premium_brands',
            'Efficacité': 'efficient_solutions',
            'Créativité': 'creative_content',
            'Collaboration': 'community_brands',
            'Respect': 'ethical_brands',
            'Transparence': 'transparent_companies',
            'Excellence': 'luxury_brands',
            'Simplicité': 'minimalist_brands',
            'Sécurité': 'trusted_brands',
            'Liberté': 'independent_brands',
            'Équilibre vie-travail': 'work_life_balance',
            'Responsabilité sociale': 'socially_responsible',
            'Tradition': 'traditional_brands'
        };

        const signals: Record<string, string> = {};

        values.forEach(value => {
            if (valueMapping[value]) {
                signals[`signal.values.${valueMapping[value]}`] = 'true';
            } else {
                // For custom values, create a normalized signal
                const normalizedValue = value.toLowerCase().replace(/\s+/g, '_');
                signals[`signal.values.${normalizedValue}`] = 'true';
            }
        });

        return signals;
    }

    /**
     * Extract occupation from brief text using simple pattern matching
     */
    private extractOccupationFromBrief(brief: string): string | undefined {
        const occupationPatterns = [
            /(?:développeur|developer|programmeur)/i,
            /(?:designer|graphiste)/i,
            /(?:manager|directeur|chef)/i,
            /(?:marketing|commercial)/i,
            /(?:consultant|conseiller)/i,
            /(?:entrepreneur|fondateur)/i,
            /(?:ingénieur|engineer)/i,
            /(?:professeur|enseignant|teacher)/i,
            /(?:médecin|doctor|docteur)/i,
            /(?:avocat|lawyer|juriste)/i
        ];

        for (const pattern of occupationPatterns) {
            const match = brief.match(pattern);
            if (match) {
                return match[0];
            }
        }

        return undefined;
    }

    /**
     * Get audience signal based on age range
     */
    private getAudienceSignal(ageRange: { min: number; max: number }): string {
        const avgAge = (ageRange.min + ageRange.max) / 2;
        return getAgeRange(avgAge);
    }

    /**
     * Fetch entity data from Qloo API for a specific entity type
     * Now using the optimized integrated request system
     */
    private async fetchEntityData(
        entityType: string,
        context: {
            audienceSignal: string;
            location: string;
            interestCategories: string[];
            valueSignals: Record<string, string>;
            occupation?: string;
        },
        take: number = 3
    ): Promise<string[]> {
        try {
            // Calculate average age from audience signal
            const avgAge = this.calculateAverageAge(context.audienceSignal);

            // Use the new optimized API adapter
            const result = await qlooApiAdapter.makeRequest(
                entityType,
                {
                    age: avgAge,
                    location: context.location,
                    interests: context.interestCategories,
                    occupation: context.occupation,
                    take
                },
                {
                    enableCache: true,
                    enableBatching: true,
                    enablePreloading: true,
                    priority: 'high'
                }
            );

            return Array.isArray(result) ? result : [result];
        } catch (error) {
            console.error(`Error fetching ${entityType} data:`, error);
            return this.getFallbackDataForEntityType(entityType);
        }
    }

    /**
     * Calculate average age from audience signal
     */
    private calculateAverageAge(audienceSignal: string): number {
        switch (audienceSignal) {
            case 'gen-z': return 22;
            case 'millennials': return 30;
            case 'gen-x': return 42;
            case 'baby-boomers': return 65;
            default: return 35;
        }
    }

    /**
     * Validate extracted signals
     */
    private validateSignals(signals: QlooSignals): void {
        if (!signals.demographics.location) {
            throw new Error('Location is required');
        }

        if (signals.demographics.ageRange.min < 18 || signals.demographics.ageRange.max > 80) {
            throw new Error('Age range must be between 18 and 80');
        }

        if (signals.demographics.ageRange.min >= signals.demographics.ageRange.max) {
            throw new Error('Minimum age must be less than maximum age');
        }

        if (signals.culturalContext.personaCount < 1 || signals.culturalContext.personaCount > 5) {
            throw new Error('Persona count must be between 1 and 5');
        }

        if (!['fr', 'en'].includes(signals.culturalContext.language)) {
            throw new Error('Language must be fr or en');
        }
    }

    /**
     * Fetch social media data using existing social media enrichment logic
     */
    private async fetchSocialMediaData(signals: QlooSignals): Promise<string[]> {
        try {
            // Create a mock persona object for social media enrichment
            const mockPersona = {
                age: (signals.demographics.ageRange.min + signals.demographics.ageRange.max) / 2,
                occupation: signals.demographics.occupation,
                location: signals.demographics.location,
                interests: signals.interests
            };

            // Use the existing social media enrichment
            const enrichment = (this.qlooClient as any).enrichment as any;
            if (enrichment && typeof enrichment.fetchData === 'function') {
                const { enrichSocialMediaWithQloo } = await import('@/lib/api/qloo/social-media');
                const socialMediaEnrichment = await enrichSocialMediaWithQloo(
                    mockPersona,
                    enrichment.fetchData.bind(enrichment)
                );
                return socialMediaEnrichment.platforms || [];
            }

            return this.getFallbackSocialMediaData(signals);
        } catch (error) {
            console.error('Error fetching social media data:', error);
            return this.getFallbackSocialMediaData(signals);
        }
    }

    /**
     * Apply fallback mechanisms when Qloo API data is insufficient
     */
    private applyFallbackMechanisms(constraints: CulturalConstraints, signals: QlooSignals): void {
        const minItemsPerCategory = 2;

        // Apply fallbacks for each category that has insufficient data
        Object.keys(constraints).forEach(key => {
            const categoryKey = key as keyof CulturalConstraints;
            if (constraints[categoryKey].length < minItemsPerCategory) {
                const fallbackData = this.getFallbackDataForEntityType(categoryKey);

                // Merge with existing data, avoiding duplicates
                const existingData = constraints[categoryKey];
                const combinedData = [...existingData];

                for (const item of fallbackData) {
                    if (!combinedData.includes(item) && combinedData.length < 5) {
                        combinedData.push(item);
                    }
                }

                constraints[categoryKey] = combinedData;
            }
        });
    }

    /**
     * Get fallback data for a specific entity type
     */
    private getFallbackDataForEntityType(entityType: string): string[] {
        try {
            const { getFallbackDataForType } = require('@/lib/api/qloo/fallback');
            return getFallbackDataForType(entityType) || [];
        } catch (error) {
            console.warn(`No fallback data available for ${entityType}`);
            return this.getGenericFallbackData(entityType);
        }
    }

    /**
     * Get generic fallback data when no specific fallback is available
     */
    private getGenericFallbackData(entityType: string): string[] {
        const genericFallbacks: Record<string, string[]> = {
            music: ['Spotify', 'Apple Music', 'YouTube Music'],
            brands: ['Nike', 'Apple', 'Google'],
            movies: ['Netflix Originals', 'Marvel Movies', 'Popular Cinema'],
            tv: ['Netflix', 'Prime Video', 'Popular Series'],
            books: ['Bestsellers', 'Popular Fiction', 'Non-fiction'],
            restaurants: ['Local Restaurants', 'Fast Casual', 'Fine Dining'],
            travel: ['City Breaks', 'Beach Destinations', 'Cultural Tourism'],
            fashion: ['Casual Wear', 'Business Attire', 'Trendy Fashion'],
            beauty: ['Skincare', 'Makeup', 'Personal Care'],
            food: ['Healthy Eating', 'Comfort Food', 'International Cuisine'],
            socialMedia: ['Instagram', 'TikTok', 'YouTube']
        };

        return genericFallbacks[entityType] || [];
    }

    /**
     * Get fallback social media data based on demographics
     */
    private getFallbackSocialMediaData(signals: QlooSignals): string[] {
        const avgAge = (signals.demographics.ageRange.min + signals.demographics.ageRange.max) / 2;

        if (avgAge < 25) {
            return ['TikTok', 'Instagram', 'Snapchat', 'YouTube'];
        } else if (avgAge < 35) {
            return ['Instagram', 'YouTube', 'TikTok', 'LinkedIn'];
        } else if (avgAge < 50) {
            return ['Facebook', 'Instagram', 'LinkedIn', 'YouTube'];
        } else {
            return ['Facebook', 'YouTube', 'LinkedIn'];
        }
    }

    /**
     * Optimize entity types configuration based on personaCount to avoid redundant calls
     * Requirements: 6.5
     */
    private optimizeEntityTypesForPersonaCount(personaCount: number): Record<string, number> {
        // Base entity types with minimum items needed (using singular forms as expected by Qloo API)
        const baseConfig = {
            music: 3,
            brand: 3,
            movie: 2,
            tv: 2,
            book: 2,
            restaurant: 2,
            travel: 2,
            fashion: 2,
            beauty: 1,
            food: 2
        };

        // Scale up based on persona count to ensure sufficient variety
        const scaleFactor = Math.max(1, Math.ceil(personaCount / 2));
        const optimizedConfig: Record<string, number> = {};

        Object.entries(baseConfig).forEach(([entityType, baseCount]) => {
            // Increase items for higher persona counts, but cap to avoid over-fetching
            optimizedConfig[entityType] = Math.min(baseCount * scaleFactor, baseCount + 3);
        });

        return optimizedConfig;
    }

    /**
     * Fetch entity data with performance optimizations and intelligent caching
     * Requirements: 6.1, 6.4
     */
    private async fetchEntityDataWithOptimization(
        entityType: string,
        context: {
            audienceSignal: string;
            location: string;
            interestCategories: string[];
            valueSignals: Record<string, string>;
            occupation?: string;
            personaCount: number;
        },
        take: number
    ): Promise<string[]> {
        try {
            // Use the new optimized system - it handles caching, retries, and monitoring automatically
            const avgAge = this.calculateAverageAge(context.audienceSignal);

            const result = await qlooApiAdapter.makeRequest(
                entityType,
                {
                    age: avgAge,
                    location: context.location,
                    interests: context.interestCategories,
                    occupation: context.occupation,
                    take
                },
                {
                    enableCache: true,
                    enableBatching: true,
                    enablePreloading: true,
                    priority: 'high',
                    retries: 2,
                    timeout: 10000
                }
            );

            // Record in legacy performance monitor if available
            if (this.performanceMonitor) {
                this.performanceMonitor.recordQlooApiCall(entityType, 0, true, Array.isArray(result) ? result.length : 1);
            }

            return Array.isArray(result) ? result : [result];
        } catch (error) {
            console.error(`❌ Failed to fetch ${entityType} with optimization:`, error);
            
            // Record failed API call
            if (this.performanceMonitor) {
                this.performanceMonitor.recordQlooApiCall(entityType, 0, false, 0);
            }

            return this.getFallbackDataForEntityType(entityType);
        }
    }

    /**
     * Build cultural constraints from batch processing results
     * Requirements: 6.1
     */
    private buildCulturalConstraintsFromBatchResults(
        batchResults: Record<string, string[]>,
        signals: QlooSignals
    ): CulturalConstraints {
        const constraints: CulturalConstraints = {
            music: batchResults.music || [],
            brands: batchResults.brand || [],
            movies: batchResults.movie || [],
            tv: batchResults.tv || [],
            books: batchResults.book || [],
            restaurants: batchResults.restaurant || [],
            travel: batchResults.travel || [],
            fashion: batchResults.fashion || [],
            beauty: batchResults.beauty || [],
            food: batchResults.food || [],
            socialMedia: [] // Will be populated separately
        };

        // Log batch processing results
        const totalItems = Object.values(constraints).reduce((sum, items) => sum + items.length, 0);
        console.log(`📊 Batch processing completed: ${totalItems} total cultural items across ${Object.keys(batchResults).length} categories`);

        return constraints;
    }

    /**
     * Fetch social media data with intelligent caching
     * Requirements: 6.4
     */
    private async fetchSocialMediaDataWithCaching(signals: QlooSignals): Promise<string[]> {
        const cacheService = getQlooCacheService();

        // Check cache first using the correct method signature
        const cachedData = cacheService.getEntityData('socialMedia', signals, 5);
        if (cachedData) {
            console.log(`🎯 Cache hit for social media data`);

            // Record cache hit in performance monitor
            if (this.performanceMonitor) {
                this.performanceMonitor.recordQlooApiCall('socialMedia', 0, true, cachedData.length);
            }

            return cachedData;
        }

        // Fetch fresh data with performance monitoring
        const apiStartTime = Date.now();
        const socialMediaData = await this.fetchSocialMediaData(signals);
        const apiDuration = Date.now() - apiStartTime;

        // Record API call in performance monitor
        if (this.performanceMonitor) {
            this.performanceMonitor.recordQlooApiCall('socialMedia', apiDuration, false, socialMediaData.length);
        }

        // Cache with longer TTL since social media preferences change slowly
        const cacheTTL = 24 * 60 * 60 * 1000; // 24 hours
        cacheService.setEntityData('socialMedia', signals, 5, socialMediaData, undefined, cacheTTL);

        console.log(`✅ Fetched social media data: ${socialMediaData.length} items (${apiDuration}ms)`);
        return socialMediaData;
    }

    /**
     * Apply intelligent fallback mechanisms with performance considerations
     * Requirements: 6.4
     */
    private applyIntelligentFallbackMechanisms(constraints: CulturalConstraints, signals: QlooSignals): void {
        const minItemsPerCategory = Math.max(2, Math.ceil(signals.culturalContext.personaCount / 2));
        let fallbacksApplied = 0;

        // Prioritize categories based on persona generation importance
        const categoryPriority = ['music', 'brands', 'movies', 'tv', 'books', 'restaurants', 'travel', 'fashion', 'beauty', 'food'];

        categoryPriority.forEach(categoryKey => {
            const key = categoryKey as keyof CulturalConstraints;
            if (constraints[key].length < minItemsPerCategory) {
                const fallbackData = this.getFallbackDataForEntityType(categoryKey);
                const existingData = constraints[key];
                const combinedData = [...existingData];

                // Add fallback items up to optimal count
                const targetCount = Math.min(minItemsPerCategory + 1, 5);
                for (const item of fallbackData) {
                    if (!combinedData.includes(item) && combinedData.length < targetCount) {
                        combinedData.push(item);
                        fallbacksApplied++;
                    }
                }

                constraints[key] = combinedData;
            }
        });

        if (fallbacksApplied > 0) {
            console.log(`🔄 Applied ${fallbacksApplied} intelligent fallbacks to ensure sufficient cultural data`);
        }
    }

    /**
     * Calculate optimal cache TTL based on signals and constraints quality
     * Requirements: 6.4
     */
    private calculateOptimalCacheTTL(signals: QlooSignals, constraints: CulturalConstraints): number {
        const baseTTL = 60 * 60 * 1000; // 1 hour base

        // Factors that affect cache duration
        const totalItems = Object.values(constraints).reduce((sum, items) => sum + items.length, 0);
        const dataQuality = totalItems / (Object.keys(constraints).length * 3); // Target 3 items per category

        // Higher quality data can be cached longer
        const qualityMultiplier = Math.min(2, Math.max(0.5, dataQuality));

        // Location-based caching - more specific locations cache longer
        const locationSpecificity = signals.demographics.location.includes(',') ? 1.5 : 1.0;

        // Age range specificity - narrower ranges cache longer
        const ageRangeWidth = signals.demographics.ageRange.max - signals.demographics.ageRange.min;
        const ageSpecificity = Math.max(0.8, 2 - (ageRangeWidth / 20));

        const finalTTL = baseTTL * qualityMultiplier * locationSpecificity * ageSpecificity;

        console.log(`⏰ Cache TTL calculated: ${Math.round(finalTTL / 1000 / 60)}min (quality: ${dataQuality.toFixed(2)}, location: ${locationSpecificity}, age: ${ageSpecificity.toFixed(2)})`);

        return Math.round(finalTTL);
    }

    /**
     * Get priority for entity type (higher number = higher priority)
     */
    private getEntityTypePriority(entityType: string): number {
        const priorities: Record<string, number> = {
            music: 5,        // High priority - core cultural signal
            brands: 5,       // High priority - strong cultural indicator
            movies: 4,       // Medium-high priority
            tv: 4,          // Medium-high priority
            books: 3,       // Medium priority
            restaurants: 3, // Medium priority
            travel: 2,      // Lower priority
            fashion: 2,     // Lower priority
            beauty: 1,      // Lowest priority
            food: 2         // Lower priority
        };

        return priorities[entityType] || 1;
    }

    /**
     * Calculate cache TTL for individual entity data
     */
    private calculateEntityCacheTTL(entityType: string, itemCount: number): number {
        const baseTTL = 30 * 60 * 1000; // 30 minutes base

        // Entity types that change frequently get shorter cache
        const volatilityFactors: Record<string, number> = {
            music: 0.8,      // Music trends change quickly
            movies: 1.2,     // Movies are more stable
            books: 1.5,      // Books change slowly
            brands: 1.0,     // Brands are moderately stable
            restaurants: 0.9, // Restaurant data changes moderately
            travel: 1.3,     // Travel destinations are stable
            fashion: 0.7,    // Fashion changes quickly
            beauty: 0.9,     // Beauty trends change moderately
            food: 1.1,       // Food preferences are stable
            tv: 1.0          // TV shows are moderately stable
        };

        const volatilityFactor = volatilityFactors[entityType] || 1.0;

        // More items = better cache (more comprehensive data)
        const itemCountFactor = Math.min(1.5, 1 + (itemCount / 10));

        return Math.round(baseTTL * volatilityFactor * itemCountFactor);
    }

    /**
     * Check if cultural data is insufficient
     */
    private isCulturalDataInsufficient(constraints: CulturalConstraints): boolean {
        const totalItems = Object.values(constraints).reduce((sum, items) => sum + items.length, 0);
        return totalItems < 5; // Require at least 5 cultural data points
    }
}