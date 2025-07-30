import { Persona } from '@/types';
import { mapEntityType, getAgeRange, mapOccupationToSignal, normalizeLocation } from './mappers';
import { getFallbackDataForType, getFallbackPersonaEnrichment, getFallbackEnrichment } from './fallback';
import { enrichSocialMediaWithQloo } from './social-media';
import { buildValidatedUrl } from './validation';
import { RequestHandler } from './request-handler';
import { PerformanceMonitor } from './performance-monitor';

export class PersonaEnrichment {
    constructor(
        private apiKey: string,
        private baseUrl: string,
        private requestHandler: RequestHandler
    ) { }

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
            return getFallbackPersonaEnrichment(persona);
        }

        try {
            const takeCount = 3;
            const brandsTakeCount = 4;
            const restaurantsTakeCount = 3;

            // Traitement par lots prioritaires pour réduire la charge
            const highPriorityTypes = ['music', 'movie', 'brand', 'tv'];
            const mediumPriorityTypes = ['book', 'restaurant', 'travel'];
            const lowPriorityTypes = ['fashion', 'beauty', 'food'];

            console.log(`🔄 Processing high-priority batch: ${highPriorityTypes.length} requests`);
            const highPriorityResults = await Promise.allSettled([
                this.fetchData('music', persona.age, persona.occupation, persona.location, takeCount),
                this.fetchData('movie', persona.age, persona.occupation, persona.location, takeCount),
                this.fetchData('brand', persona.age, persona.occupation, persona.location, brandsTakeCount),
                this.fetchData('tv', persona.age, persona.occupation, persona.location, takeCount)
            ]);

            // Petit délai entre les lots
            await this.sleep(100);

            console.log(`🔄 Processing medium-priority batch: ${mediumPriorityTypes.length} requests`);
            const mediumPriorityResults = await Promise.allSettled([
                this.fetchData('book', persona.age, persona.occupation, persona.location, takeCount),
                this.fetchData('restaurant', persona.age, persona.occupation, persona.location, restaurantsTakeCount),
                this.fetchData('travel', persona.age, persona.occupation, persona.location, takeCount)
            ]);

            await this.sleep(100);

            console.log(`🔄 Processing low-priority batch: ${lowPriorityTypes.length} requests`);
            const lowPriorityResults = await Promise.allSettled([
                this.fetchData('fashion', persona.age, persona.occupation, persona.location, takeCount),
                this.fetchData('beauty', persona.age, persona.occupation, persona.location, takeCount),
                this.fetchData('food', persona.age, persona.occupation, persona.location, takeCount)
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
                    return getFallbackDataForType(allTypes[index]);
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

            return {
                ...persona,
                culturalData: {
                    ...persona.culturalData,
                    music: musicData,
                    movie: movieData,
                    tv: tvData,
                    book: bookData,
                    brand: brandData,
                    restaurant: restaurantData,
                    travel: travelData,
                    fashion: fashionData,
                    beauty: beautyData,
                    food: foodData,
                    socialMedia: socialMediaEnrichment.platforms
                },
                socialMediaInsights: {
                    insights: socialMediaEnrichment.insights,
                    platforms: socialMediaEnrichment.platforms
                }
            };

        } catch (error) {
            console.error(`Erreur enrichissement Qloo pour ${persona.name || 'une persona'}:`, error);
            return getFallbackPersonaEnrichment(persona);
        }
    }

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
            // Log l'erreur pour le debugging mais ne la propage pas
            console.warn(`Erreur API Qloo pour ${entityType}:`, error instanceof Error ? error.message : error);
            endTimer();
            // En cas d'erreur, retourner les données de fallback
            return getFallbackDataForType(entityType);
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}