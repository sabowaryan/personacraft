import { Persona } from '@/types';
import { CulturalInsight, CulturalInsights } from '@/types/cultural-insights';
import { CulturalInsightEngine } from '@/lib/engines/cultural-insight-engine';
import { mapEntityType, getAgeRange, mapOccupationToSignal, normalizeLocation } from './mappers';
import { getFallbackDataForType, getFallbackPersonaEnrichment, getFallbackEnrichment } from './fallback';
import { enrichSocialMediaWithQloo } from './social-media';
import { buildValidatedUrl } from './validation';
import { RequestHandler } from './request-handler';
import { PerformanceMonitor } from './performance/';


export class PersonaEnrichment {
    private insightEngine: CulturalInsightEngine;

    constructor(
        private apiKey: string,
        private baseUrl: string,
        private requestHandler: RequestHandler
    ) {
        this.insightEngine = new CulturalInsightEngine({
            enableQlooEnrichment: !!this.apiKey,
            fallbackToSimpleData: true,
            minimumConfidenceThreshold: 0.3,
            maxItemsPerCategory: 10,
            enableTrendAnalysis: true,
            enableBehavioralAnalysis: true
        });

        // Set the Qloo fetch function for the insight engine
        // This enables the insight engine to fetch data from Qloo API
        if (this.apiKey) {
            this.insightEngine.setQlooFetchFunction(this.fetchData.bind(this));
        }
    }

    async enrichPersonas(personas: Partial<Persona>[]): Promise<Partial<Persona>[]> {
        if (!this.apiKey) {
            console.warn('Clé API Qloo manquante, utilisation de données simulées');
            return getFallbackEnrichment(personas);
        }

        try {
            const batchSize = 2;
            const enrichedPersonas: Partial<Persona>[] = [];

            for (let i = 0; i < personas.length; i += batchSize) {
                const batch = personas.slice(i, i + batchSize);
                const batchResults = await Promise.all(
                    batch.map(persona => this.enrichSinglePersona(persona))
                );
                enrichedPersonas.push(...batchResults);

                if (i + batchSize < personas.length) {
                    await this.sleep(500);
                }
            }

            return enrichedPersonas;
        } catch (error) {
            console.error('Erreur générale Qloo:', error);
            return getFallbackEnrichment(personas);
        }
    }

    private async enrichSinglePersona(persona: Partial<Persona>): Promise<Partial<Persona>> {
        if (!persona.age) {
            // Generate cultural insights even for personas without age using fallback data
            try {
                const culturalInsights = await this.generateCulturalInsights(persona);
                const fallbackPersona = getFallbackPersonaEnrichment(persona);
                return {
                    ...fallbackPersona,
                    culturalInsights
                };
            } catch (error) {
                console.error(`Error generating cultural insights for persona without age:`, error);
                return getFallbackPersonaEnrichment(persona);
            }
        }

        try {
            // Generate cultural insights first using the new engine
            // The insight engine will use the Qloo fetch function we provided in the constructor
            const culturalInsights = await this.generateCulturalInsights(persona);

            // Then, enrich with Qloo data using the existing method for backward compatibility
            const qlooEnrichedPersona = await this.enrichWithQlooData(persona);

            return {
                ...qlooEnrichedPersona,
                culturalInsights
            };

        } catch (error) {
            console.error(`Erreur enrichissement Qloo pour ${persona.name || 'une persona'}:`, error);

            // Try to generate insights with fallback data
            try {
                const culturalInsights = await this.generateCulturalInsights(persona);
                const fallbackPersona = getFallbackPersonaEnrichment(persona);
                return {
                    ...fallbackPersona,
                    culturalInsights
                };
            } catch (insightError) {
                console.error(`Error generating fallback cultural insights:`, insightError);
                return getFallbackPersonaEnrichment(persona);
            }
        }
    }

    /**
     * Enrich persona with Qloo data using the existing method (for backward compatibility)
     */
    private async enrichWithQlooData(persona: Partial<Persona>): Promise<Partial<Persona>> {
        const takeCount = 3;
        const brandsTakeCount = 4;
        const restaurantsTakeCount = 3;

        // Traitement par lots prioritaires pour réduire la charge
        const highPriorityTypes = ['music', 'movie', 'brand', 'tv'];
        const mediumPriorityTypes = ['book', 'restaurant', 'travel'];
        const lowPriorityTypes = ['fashion', 'beauty', 'food'];

        console.log(`🔄 Processing high-priority batch: ${highPriorityTypes.length} requests`);
        const highPriorityResults = await Promise.allSettled([
            this.fetchData('music', persona.age || 30, persona.occupation, persona.location, takeCount),
            this.fetchData('movie', persona.age || 30, persona.occupation, persona.location, takeCount),
            this.fetchData('brand', persona.age || 30, persona.occupation, persona.location, brandsTakeCount),
            this.fetchData('tv', persona.age || 30, persona.occupation, persona.location, takeCount)
        ]);

        // Petit délai entre les lots
        await this.sleep(100);

        console.log(`🔄 Processing medium-priority batch: ${mediumPriorityTypes.length} requests`);
        const mediumPriorityResults = await Promise.allSettled([
            this.fetchData('book', persona.age || 30, persona.occupation, persona.location, takeCount),
            this.fetchData('restaurant', persona.age || 30, persona.occupation, persona.location, restaurantsTakeCount),
            this.fetchData('travel', persona.age || 30, persona.occupation, persona.location, takeCount)
        ]);

        await this.sleep(100);

        console.log(`🔄 Processing low-priority batch: ${lowPriorityTypes.length} requests`);
        const lowPriorityResults = await Promise.allSettled([
            this.fetchData('fashion', persona.age || 30, persona.occupation, persona.location, takeCount),
            this.fetchData('beauty', persona.age || 30, persona.occupation, persona.location, takeCount),
            this.fetchData('food', persona.age || 30, persona.occupation, persona.location, takeCount)
        ]);

        const allResults = [...highPriorityResults, ...mediumPriorityResults, ...lowPriorityResults];
        const allTypes = [...highPriorityTypes, ...mediumPriorityTypes, ...lowPriorityTypes];

        const [
            musicData,
            movieData,
            brandData,
            tvData,
            bookData,
            restaurantData,
            travelData,
            fashionData,
            beautyData,
            foodData
        ] = allResults.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                console.warn(`Erreur pour ${allTypes[index]}:`, result.reason);
                // Return null for failed API calls - let the cultural insight engine handle fallback
                return null;
            }
        });

        let socialMediaEnrichment;
        try {
            socialMediaEnrichment = await enrichSocialMediaWithQloo(persona, this.fetchData.bind(this));
        } catch (error) {
            console.warn('Erreur enrichissement réseaux sociaux:', error);
            socialMediaEnrichment = {
                platforms: getFallbackDataForType('socialMedia'),
                insights: {
                    audienceMatches: [],
                    brandInfluence: [],
                    contentPreferences: [],
                    demographicAlignment: []
                }
            };
        }

        // Helper function to get data for a category
        const getCategoryData = (existingData: string[] | undefined, newData: string[] | null) => {
            // If we have existing data, use it
            if (existingData && existingData.length > 0) {
                return existingData;
            }
            // If we have new data from API, use it
            if (newData && newData.length > 0) {
                return newData;
            }
            // If no data available, return empty array (let cultural insight engine handle fallback)
            return [];
        };

        // Ensure backward compatibility by preserving the existing culturalData structure
        // while also enabling the new cultural insights system

        return {
            ...persona,
            culturalData: {
                ...persona.culturalData,
                music: getCategoryData(persona.culturalData?.music, musicData),
                movie: getCategoryData(persona.culturalData?.movie, movieData),
                tv: getCategoryData(persona.culturalData?.tv, tvData),
                book: getCategoryData(persona.culturalData?.book, bookData),
                brand: getCategoryData(persona.culturalData?.brand, brandData),
                restaurant: getCategoryData(persona.culturalData?.restaurant, restaurantData),
                travel: getCategoryData(persona.culturalData?.travel, travelData),
                fashion: getCategoryData(persona.culturalData?.fashion, fashionData),
                beauty: getCategoryData(persona.culturalData?.beauty, beautyData),
                food: getCategoryData(persona.culturalData?.food, foodData),
                socialMedia: getCategoryData(persona.culturalData?.socialMedia, socialMediaEnrichment.platforms)
            },
            socialMediaInsights: {
                insights: socialMediaEnrichment.insights,
                platforms: socialMediaEnrichment.platforms
            }
        };
    }

    /**
     * Generate cultural insights using the CulturalInsightEngine
     */
    private async generateCulturalInsights(persona: Partial<Persona> | null): Promise<CulturalInsights> {
        try {
            return await this.insightEngine.generateInsights(persona);
        } catch (error) {
            console.error('Error generating cultural insights:', error);

            // Try to generate insights with minimal persona data
            try {
                const minimalPersona = persona ? {
                    age: persona.age,
                    occupation: persona.occupation,
                    location: persona.location
                } : null;

                return await this.insightEngine.generateInsights(minimalPersona);
            } catch (fallbackError) {
                console.error('Error generating fallback insights:', fallbackError);
                // Return minimal fallback structure as last resort
                return this.createMinimalCulturalInsights();
            }
        }
    }

    /**
     * Create minimal cultural insights structure as last resort fallback
     */
    private createMinimalCulturalInsights(): CulturalInsights {
        const categories = ['music', 'brand', 'movie', 'tv', 'book', 'restaurant', 'travel', 'fashion', 'beauty', 'food', 'socialMedia'];
        const insights: any = {};

        categories.forEach(category => {
            insights[category] = {
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
        });

        return insights as CulturalInsights;
    }

    /**
     * Fetch cultural insight data for a specific category
     * Returns CulturalInsight object with enriched data
     * This method integrates with the existing Qloo enrichment system
     */
    async fetchCulturalInsight(category: string, persona: Partial<Persona> | null): Promise<CulturalInsight> {
        try {
            // Use the insight engine to enrich the specific category
            // The engine will automatically use the Qloo fetch function if available
            return await this.insightEngine.enrichCategory(category, persona);
        } catch (error) {
            console.error(`Error fetching cultural insight for ${category}:`, error);

            // Try with minimal persona data if available
            try {
                const minimalPersona = persona ? {
                    age: persona.age,
                    occupation: persona.occupation,
                    location: persona.location
                } : null;

                return await this.insightEngine.enrichCategory(category, minimalPersona);
            } catch (fallbackError) {
                console.error(`Error fetching fallback cultural insight for ${category}:`, fallbackError);

                // Return minimal fallback insight structure
                return this.createMinimalCulturalInsight(category);
            }
        }
    }

    /**
     * Update fetchData method to return CulturalInsight objects when requested
     * Maintains backward compatibility while enabling new insight structure
     */
    async fetchDataAsInsight(entityType: string, age: number, occupation?: string, location?: string, take: number = 3): Promise<CulturalInsight> {
        const persona: Partial<Persona> = {
            age,
            occupation,
            location
        };

        return this.fetchCulturalInsight(entityType, persona);
    }

    /**
     * Create minimal cultural insight for a category as last resort fallback
     */
    private createMinimalCulturalInsight(category: string): CulturalInsight {
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
     * Legacy fetchData method for backward compatibility
     * Returns simple string array as before
     * This method is also used by the CulturalInsightEngine for Qloo integration
     * 
     * Integration with CulturalInsightEngine:
     * - This method is bound to the insight engine in the constructor
     * - The insight engine calls this method to fetch Qloo data
     * - Results are then enriched with analytics and metadata
     */
    async fetchData(entityType: string, age: number, occupation?: string, location?: string, take: number = 3): Promise<string[]> {
        const monitor = PerformanceMonitor.getInstance();
        const endTimer = monitor.startTimer(`qloo_${entityType}`);

        // Clé de cache optimisée - moins spécifique pour plus de hits
        const ageRange = Math.floor(age / 10) * 10; // Grouper par décennie
        const normalizedLocation = location ? location.toLowerCase().split(',')[0].trim() : 'global';
        const cacheKey = `${entityType}_${ageRange}_${normalizedLocation}_${take}`;

        const cached = this.requestHandler.getCachedData(cacheKey);
        if (cached) {
            console.log(`🎯 Cache hit for ${entityType} (key: ${cacheKey})`);
            endTimer();
            return cached;
        }

        try {
            const result = await this.requestHandler.makeRequestWithRetry(async () => {
                const mappedEntityType = mapEntityType(entityType);
                const params: Record<string, any> = {};

                if (age) {
                    const ageRange = getAgeRange(age);
                    params['signal.demographics.audiences'] = ageRange;
                } else {
                    params['signal.demographics.audiences'] = 'millennials';
                }

                if (occupation) {
                    const professionSignal = mapOccupationToSignal(occupation);
                    if (professionSignal) {
                        const [key, value] = professionSignal.split('=');
                        params[key] = value;
                    }
                }

                if (location) {
                    params['signal.demographics.location'] = normalizeLocation(location);
                }

                const url = buildValidatedUrl(this.baseUrl, mappedEntityType, params, take);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 8000); // Réduit de 10s à 8s

                try {
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'X-API-Key': this.apiKey,
                            'Content-Type': 'application/json',
                            'Connection': 'keep-alive'
                        },
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        if (response.status === 400) {
                            try {
                                const errorBody = await response.text();
                                if (errorBody.includes('does not yet support audience requests')) {
                                    throw new Error(`400_AUDIENCE_NOT_SUPPORTED_${entityType}`);
                                }
                            } catch (e) { }
                            throw new Error(`400_BAD_REQUEST_${entityType}`);
                        }

                        if (response.status === 403) {
                            throw new Error(`403_FORBIDDEN_${entityType}`);
                        }

                        if (response.status === 404) {
                            throw new Error(`404_NOT_FOUND_${entityType}`);
                        }

                        if (response.status === 429) {
                            const retryAfter = response.headers.get('Retry-After');
                            const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 2000;
                            throw new Error(`429_RATE_LIMIT_${waitTime}`);
                        }

                        // Pour toute autre erreur HTTP, ne pas lancer d'exception
                        console.warn(`Erreur HTTP ${response.status} pour ${entityType}, utilisation des données de fallback`);
                        return [];
                    }

                    const result = await response.json();
                    const entities = result.results?.entities || [];

                    if (entities.length > 0) {
                        const extractedNames = entities.map((entity: any) => entity.name || entity.title).filter(Boolean);
                        return extractedNames;
                    }
                    return [];
                } catch (error) {
                    clearTimeout(timeoutId);
                    throw error;
                }
            }, entityType);

            this.requestHandler.setCachedData(cacheKey, result);
            endTimer();
            return result;
        } catch (error) {
            // Log l'erreur pour le debugging et la propager
            console.warn(`Erreur API Qloo pour ${entityType}:`, error instanceof Error ? error.message : error);
            endTimer();
            // Propager l'erreur pour que l'appelant puisse décider quoi faire
            throw error;
        }
    }

    /**
     * Validate the integration between PersonaEnrichment and CulturalInsightEngine
     * Ensures that the Qloo fetch function is properly set and working
     */
    async validateQlooIntegration(): Promise<{ isValid: boolean; error?: string }> {
        try {
            // Check if the insight engine has the Qloo fetch function
            if (!this.insightEngine['qlooFetchFunction']) {
                return {
                    isValid: false,
                    error: 'Qloo fetch function not set in CulturalInsightEngine'
                };
            }

            // Test a simple fetch to ensure integration works
            const testResult = await this.fetchData('music', 30, 'test', 'test', 1);
            
            // Test that the insight engine can generate insights
            const testInsight = await this.fetchCulturalInsight('music', {
                age: 30,
                occupation: 'test',
                location: 'test'
            });

            if (!testInsight || !testInsight.category) {
                return {
                    isValid: false,
                    error: 'Cultural insight generation failed'
                };
            }

            return { isValid: true };
        } catch (error) {
            return {
                isValid: false,
                error: `Integration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }

    /**
     * Get integration status and configuration
     * Useful for debugging and monitoring
     */
    getIntegrationStatus(): {
        hasApiKey: boolean;
        hasQlooFetchFunction: boolean;
        insightEngineConfig: any;
        cacheStats: any;
    } {
        return {
            hasApiKey: !!this.apiKey,
            hasQlooFetchFunction: !!this.insightEngine['qlooFetchFunction'],
            insightEngineConfig: this.insightEngine['config'],
            cacheStats: this.requestHandler.getCacheStats()
        };
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}