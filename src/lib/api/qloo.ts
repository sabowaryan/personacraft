import { Persona } from '@/types';



export class QlooClient {
    private apiKey: string;
    private baseUrl: string;
    private requestQueue: Promise<any>[] = [];
    private maxConcurrentRequests: number = 2; // Further reduced for stability
    private rateLimitDelay: number = 200; // Increased delay between requests (ms)
    private lastRequestTime: number = 0;
    private cache: Map<string, { data: string[], timestamp: number }> = new Map();
    private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes cache

    constructor() {
        this.apiKey = process.env.QLOO_API_KEY || '';
        // Supprimer le slash final pour éviter les doubles slashes
        this.baseUrl = (process.env.QLOO_API_URL || 'https://hackathon.api.qloo.com').replace(/\/+$/, '');
    }

    async enrichPersonas(personas: Partial<Persona>[]): Promise<Partial<Persona>[]> {
        if (!this.apiKey) {
            console.warn('Clé API Qloo manquante, utilisation de données simulées');
            return this.getFallbackEnrichment(personas);
        }

        try {
            // Process personas in smaller batches to avoid overwhelming the API
            const batchSize = 2;
            const enrichedPersonas: Partial<Persona>[] = [];

            for (let i = 0; i < personas.length; i += batchSize) {
                const batch = personas.slice(i, i + batchSize);
                const batchResults = await Promise.all(
                    batch.map(persona => this.enrichSinglePersona(persona))
                );
                enrichedPersonas.push(...batchResults);

                // Add delay between batches
                if (i + batchSize < personas.length) {
                    await this.sleep(500);
                }
            }

            return enrichedPersonas;
        } catch (error) {
            console.error('Erreur générale Qloo:', error);
            // En cas d'erreur générale, on utilise les données de fallback pour toutes les personas
            return this.getFallbackEnrichment(personas);
        }
    }

    private async enrichSinglePersona(persona: Partial<Persona>): Promise<Partial<Persona>> {
        if (!persona.age) {
            // Si l'âge est manquant, on ne peut pas faire de requête démographique, donc on retourne le fallback
            return this.getFallbackPersonaEnrichment(persona);
        }

        try {
            // Définir le nombre d'éléments à récupérer pour chaque catégorie pour correspondre au slice
            const takeCount = 3; // Pour music, movies, tv, books, beauty, food, travel, fashion
            const brandsTakeCount = 4; // Pour brands
            const restaurantsTakeCount = 3; // Pour restaurants

            const [
                musicData,
                brandsData,
                moviesData,
                tvData,
                booksData,
                restaurantsData,
                travelData,
                fashionData,
                beautyData,
                foodData
            ] = await Promise.all([
                this.fetchData('music', persona.age, persona.occupation, persona.location, takeCount),
                this.fetchData('brand', persona.age, persona.occupation, persona.location, brandsTakeCount),
                this.fetchData('movie', persona.age, persona.occupation, persona.location, takeCount),
                this.fetchData('tv', persona.age, persona.occupation, persona.location, takeCount),
                this.fetchData('book', persona.age, persona.occupation, persona.location, takeCount),
                this.fetchData('restaurant', persona.age, persona.occupation, persona.location, restaurantsTakeCount),
                this.fetchData('travel', persona.age, persona.occupation, persona.location, takeCount),
                this.fetchData('fashion', persona.age, persona.occupation, persona.location, takeCount),
                this.fetchData('beauty', persona.age, persona.occupation, persona.location, takeCount),
                this.fetchData('food', persona.age, persona.occupation, persona.location, takeCount)
            ]);

            const socialMediaEnrichment = await this.enrichSocialMediaWithQloo(persona);

            return {
                ...persona,
                culturalData: {
                    ...persona.culturalData,
                    music: musicData,
                    movies: moviesData,
                    tv: tvData,
                    books: booksData,
                    brands: brandsData,
                    restaurants: restaurantsData,
                    travel: travelData,
                    fashion: fashionData,
                    beauty: beautyData,
                    food: foodData,
                    socialMedia: socialMediaEnrichment.platforms
                },
                // Store insights for potential UI display
                socialMediaInsights: socialMediaEnrichment.insights
            };

        } catch (error) {
            console.error(`Erreur enrichissement Qloo pour ${persona.name || 'une persona'}:`, error);
            return this.getFallbackPersonaEnrichment(persona);
        }
    }

    private async fetchData(entityType: string, age: number, occupation?: string, location?: string, take: number = 3): Promise<string[]> {
        // Create cache key
        const cacheKey = `${entityType}_${age}_${occupation || 'none'}_${location || 'none'}_${take}`;

        // Check cache first
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        const result = await this.makeRequestWithRetry(async () => {
            const mappedEntityType = this.mapEntityType(entityType);
            const params: Record<string, any> = {};

            // Toujours fournir au moins un signal démographique (requis par l'API)
            if (age) {
                const ageRange = this.getAgeRange(age);
                params['signal.demographics.audiences'] = ageRange;
            } else {
                // Si pas d'âge, utiliser une audience par défaut
                params['signal.demographics.audiences'] = 'millennials';
            }

            // Ajouter d'autres signaux si disponibles
            if (occupation) {
                const professionSignal = this.mapOccupationToSignal(occupation);
                if (professionSignal) {
                    const [key, value] = professionSignal.split('=');
                    params[key] = value;
                }
            }

            if (location) {
                params['signal.demographics.location'] = this.normalizeLocation(location);
            }

            // Construire l'URL validée
            const url = this.buildValidatedUrl(entityType, params, take);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

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
                        // Gestion spécifique des erreurs 400 liées aux audience requests
                        try {
                            const errorBody = await response.text();
                            if (errorBody.includes('does not yet support audience requests')) {
        
                                throw new Error(`400_AUDIENCE_NOT_SUPPORTED_${entityType}`);
                            }

                        } catch (e) {

                        }
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



                    throw new Error(`HTTP_${response.status}_${entityType}`);
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

        // Cache the result
        this.cache.set(cacheKey, { data: result, timestamp: Date.now() });

        return result;
    }

    private async makeRequestWithRetry<T>(
        requestFn: () => Promise<T>,
        entityType: string,
        maxRetries: number = 3
    ): Promise<T> {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                // Implement rate limiting with minimum delay between requests
                await this.enforceRateLimit();

                // Limit concurrent requests to prevent overwhelming the API
                while (this.requestQueue.length >= this.maxConcurrentRequests) {
                    await Promise.race(this.requestQueue);
                }

                const requestPromise = requestFn();
                this.requestQueue.push(requestPromise);

                // Clean up completed requests
                requestPromise.finally(() => {
                    const index = this.requestQueue.indexOf(requestPromise);
                    if (index > -1) {
                        this.requestQueue.splice(index, 1);
                    }
                });

                return await requestPromise;

            } catch (error) {
                lastError = error as Error;

                if (lastError.message.includes('403_FORBIDDEN') ||
                    lastError.message.includes('400_AUDIENCE_NOT_SUPPORTED') ||
                    lastError.message.includes('400_BAD_REQUEST')) {
                    // Don't retry 403/400 errors - they indicate configuration issues
                    break;
                }

                if (lastError.message.includes('429_RATE_LIMIT')) {
                    const waitTimeMatch = lastError.message.match(/429_RATE_LIMIT_(\d+)/);
                    let waitTime = waitTimeMatch ? parseInt(waitTimeMatch[1]) : 1000 * Math.pow(2, attempt);

                    // Add jitter to prevent thundering herd
                    waitTime += Math.random() * 1000;

                    if (attempt < maxRetries) {
                        console.log(`Tentative ${attempt + 1}/${maxRetries + 1} pour ${entityType}, attente de ${waitTime}ms`);
                        await this.sleep(waitTime);
                        continue;
                    }
                }

                // For other errors, use exponential backoff
                if (attempt < maxRetries) {
                    const backoffTime = 1000 * Math.pow(2, attempt);
                    await this.sleep(backoffTime);
                }
            }
        }

        // If all retries failed, return fallback data
        return this.getFallbackDataForType(entityType) as T;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async enforceRateLimit(): Promise<void> {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;

        if (timeSinceLastRequest < this.rateLimitDelay) {
            const waitTime = this.rateLimitDelay - timeSinceLastRequest;
            await this.sleep(waitTime);
        }

        this.lastRequestTime = Date.now();
    }


    private getAgeRange(age: number): string {
        // Mapper l'âge vers des audiences démographiques standard
        if (age < 25) return 'gen-z';
        if (age < 35) return 'millennials';
        if (age < 50) return 'gen-x';
        return 'baby-boomers';
    }

    /**
     * Vérifie si un type d'entité supporte les audience requests
     */
    private supportsAudienceRequests(entityType: string): boolean {
        const supportedTypes = [
            'urn:entity:artist',
            'urn:entity:brand',
            'urn:entity:movie',
            'urn:entity:tv_show',
            'urn:entity:book',
            'urn:entity:place',
            'urn:entity:podcast',
            'urn:entity:video_game',
            'urn:entity:person'
        ];
        return supportedTypes.includes(entityType);
    }

    private mapEntityType(entityType: string): string {
        // Mapper vers les types d'entités supportés selon la documentation
        const entityMap: { [key: string]: string } = {
            'music': 'urn:entity:artist',
            'brand': 'urn:entity:brand',
            'movie': 'urn:entity:movie',
            'tv': 'urn:entity:tv_show',
            'book': 'urn:entity:book',
            'restaurant': 'urn:entity:place',
            'travel': 'urn:entity:place',
            'fashion': 'urn:entity:brand',
            'beauty': 'urn:entity:brand',
            'food': 'urn:entity:place',
            'podcast': 'urn:entity:podcast',
            'video_game': 'urn:entity:video_game',
            'person': 'urn:entity:person'
        };

        return entityMap[entityType] || `urn:entity:${entityType}`;
    }

    private mapOccupationToSignal(occupation: string): string | null {
        const lowerOccupation = occupation.toLowerCase();

        // Utiliser les tags d'intérêts plutôt que les signaux démographiques directs
        if (lowerOccupation.includes('développeur') || lowerOccupation.includes('tech')) {
            return 'signal.interests.tags=technology';
        } else if (lowerOccupation.includes('marketing') || lowerOccupation.includes('communication')) {
            return 'signal.interests.tags=marketing';
        } else if (lowerOccupation.includes('designer') || lowerOccupation.includes('créatif')) {
            return 'signal.interests.tags=design';
        } else if (lowerOccupation.includes('manager') || lowerOccupation.includes('directeur')) {
            return 'signal.interests.tags=business';
        }

        return null;
    }

    private async enrichSocialMediaWithQloo(persona: Partial<Persona>): Promise<{ platforms: string[], insights: any }> {
        try {
            // Récupérer des influenceurs/personnes et marques via Qloo pour enrichir les données sociales
            const [influencers, brands, musicArtists] = await Promise.all([
                this.fetchData('person', persona.age || 25, persona.occupation, persona.location, 3),
                this.fetchData('brand', persona.age || 25, persona.occupation, persona.location, 3),
                this.fetchData('music', persona.age || 25, persona.occupation, persona.location, 2)
            ]);

            // Mapper les données Qloo vers des plateformes sociales avec insights détaillés
            const qlooMapping = this.mapQlooDataToSocialPlatforms(influencers, brands, musicArtists, persona);

            // Combiner avec la logique locale existante
            const localSocialMedia = this.getSocialMediaByProfile(persona.age, persona.occupation);

            // Fusionner et dédupliquer, en privilégiant les insights Qloo
            const enrichedPlatforms = Array.from(new Set([...qlooMapping.platforms, ...localSocialMedia]));



            return {
                platforms: enrichedPlatforms.slice(0, 6),
                insights: qlooMapping.insights
            };
        } catch (error) {
            console.warn('Erreur enrichissement social média via Qloo, utilisation logique locale:', error);
            return {
                platforms: this.getSocialMediaByProfile(persona.age, persona.occupation),
                insights: { audienceMatches: [], brandInfluence: [], contentPreferences: [], demographicAlignment: [] }
            };
        }
    }

    private mapQlooDataToSocialPlatforms(
        influencers: string[],
        brands: string[],
        musicArtists: string[],
        persona: Partial<Persona>
    ): { platforms: string[], insights: any } {
        const platforms: string[] = [];
        const insights = {
            audienceMatches: [] as Array<{
                name: string
                relevanceFactors: string[]
                estimatedFollowingOverlap: number
            }>,
            brandInfluence: [] as Array<{
                brand: string
                category: string
                platforms: string[]
                relevanceScore: number
            }>,
            contentPreferences: [] as string[],
            demographicAlignment: [] as Array<{
                ageGroup: string
                primaryPlatforms: string[]
                engagementStyle: string
            }>
        };

        // Enhanced mapping basé sur les influenceurs/personnes avec insights
        influencers.forEach(influencer => {
            const lowerInfluencer = influencer.toLowerCase();
            const influencerInsights = this.analyzeInfluencerProfile(influencer, persona);

            if (this.isYouTubePersonality(lowerInfluencer)) {
                platforms.push('YouTube');
                insights.contentPreferences.push(`Video content (${influencer})`);
            }
            if (this.isInstagramInfluencer(lowerInfluencer)) {
                platforms.push('Instagram');
                insights.contentPreferences.push(`Visual storytelling (${influencer})`);
            }
            if (this.isTikTokCreator(lowerInfluencer)) {
                platforms.push('TikTok');
                insights.contentPreferences.push(`Short-form content (${influencer})`);
            }
            if (this.isTechPersonality(lowerInfluencer)) {
                platforms.push('Twitter', 'LinkedIn');
                insights.contentPreferences.push(`Professional networking (${influencer})`);
            }

            insights.audienceMatches.push(influencerInsights);
        });

        // Enhanced mapping basé sur les marques avec brand influence tracking
        brands.forEach(brand => {
            const brandPlatforms = this.getBrandSocialPlatforms(brand);
            const brandCategory = this.categorizeBrand(brand);

            platforms.push(...brandPlatforms);
            insights.brandInfluence.push({
                brand,
                category: brandCategory,
                platforms: brandPlatforms,
                relevanceScore: this.calculateBrandRelevance(brand, persona)
            });
        });

        // Enhanced mapping basé sur les artistes musicaux avec genre analysis
        musicArtists.forEach(artist => {
            const artistPlatforms = this.getArtistSocialPlatforms(artist);
            const musicGenre = this.inferMusicGenre(artist);

            platforms.push(...artistPlatforms);
            insights.contentPreferences.push(`${musicGenre} music content (${artist})`);
        });

        // Demographic alignment analysis
        const ageGroup = this.getAgeRange(persona.age || 25);
        insights.demographicAlignment.push({
            ageGroup,
            primaryPlatforms: this.getPrimaryPlatformsForAge(persona.age || 25),
            engagementStyle: this.getEngagementStyleForAge(persona.age || 25)
        });

        return {
            platforms: Array.from(new Set(platforms)),
            insights
        };
    }

    private isYouTubePersonality(name: string): boolean {
        const youtubeKeywords = ['youtuber', 'vlogger', 'creator', 'channel', 'video'];
        return youtubeKeywords.some(keyword => name.includes(keyword));
    }

    private isInstagramInfluencer(name: string): boolean {
        const instagramKeywords = ['influencer', 'model', 'fashion', 'lifestyle', 'beauty', 'fitness'];
        return instagramKeywords.some(keyword => name.includes(keyword));
    }

    private isTikTokCreator(name: string): boolean {
        const tiktokKeywords = ['tiktok', 'viral', 'dance', 'comedy', 'short'];
        return tiktokKeywords.some(keyword => name.includes(keyword));
    }

    private isTechPersonality(name: string): boolean {
        const techKeywords = ['tech', 'developer', 'engineer', 'startup', 'ceo', 'founder'];
        return techKeywords.some(keyword => name.includes(keyword));
    }

    private getBrandSocialPlatforms(brand: string): string[] {
        const brandToSocialMap: { [key: string]: string[] } = {
            // Tech brands
            'Apple': ['Twitter', 'YouTube', 'Instagram'],
            'Google': ['YouTube', 'Twitter', 'LinkedIn'],
            'Microsoft': ['LinkedIn', 'Twitter', 'YouTube'],
            'Tesla': ['Twitter', 'YouTube', 'Instagram'],
            'Meta': ['Instagram', 'Facebook', 'Twitter'],

            // Fashion & Lifestyle
            'Nike': ['Instagram', 'TikTok', 'Twitter', 'YouTube'],
            'Adidas': ['Instagram', 'TikTok', 'Twitter'],
            'Zara': ['Instagram', 'Pinterest', 'TikTok'],
            'H&M': ['Instagram', 'TikTok', 'Pinterest'],
            'Louis Vuitton': ['Instagram', 'Pinterest', 'YouTube'],

            // Beauty
            'Sephora': ['Instagram', 'TikTok', 'YouTube', 'Pinterest'],
            'L\'Oréal': ['Instagram', 'YouTube', 'TikTok'],
            'MAC': ['Instagram', 'YouTube', 'TikTok'],

            // Entertainment
            'Netflix': ['Instagram', 'Twitter', 'TikTok', 'YouTube'],
            'Disney': ['Instagram', 'YouTube', 'TikTok', 'Facebook'],
            'Spotify': ['Instagram', 'Twitter', 'TikTok'],

            // Food & Beverage
            'Starbucks': ['Instagram', 'TikTok', 'Twitter'],
            'McDonald\'s': ['Instagram', 'TikTok', 'Twitter', 'Facebook'],
            'Coca-Cola': ['Instagram', 'Facebook', 'Twitter', 'YouTube']
        };

        return brandToSocialMap[brand] || [];
    }

    private getArtistSocialPlatforms(artist: string): string[] {
        // Les artistes sont généralement présents sur ces plateformes
        const musicPlatforms = ['Instagram', 'TikTok', 'YouTube', 'Twitter'];

        // Ajustements basés sur le genre musical (si détectable)
        const artistLower = artist.toLowerCase();
        if (artistLower.includes('electronic') || artistLower.includes('dj')) {
            musicPlatforms.push('SoundCloud');
        }
        if (artistLower.includes('indie') || artistLower.includes('alternative')) {
            musicPlatforms.push('Bandcamp', 'SoundCloud');
        }

        return musicPlatforms;
    }

    private analyzeInfluencerProfile(influencer: string, persona: Partial<Persona>): any {
        const profile = influencer.toLowerCase();
        return {
            name: influencer,
            relevanceFactors: [
                profile.includes('tech') && persona.occupation?.toLowerCase().includes('développeur') ? 'Tech alignment' : null,
                profile.includes('marketing') && persona.occupation?.toLowerCase().includes('marketing') ? 'Professional alignment' : null,
                profile.includes('design') && persona.occupation?.toLowerCase().includes('design') ? 'Creative alignment' : null
            ].filter(Boolean),
            estimatedFollowingOverlap: Math.floor(Math.random() * 40) + 10 // Simulated overlap percentage
        };
    }

    private categorizeBrand(brand: string): string {
        const brandLower = brand.toLowerCase();
        if (['apple', 'google', 'microsoft', 'tesla'].some(tech => brandLower.includes(tech))) return 'Technology';
        if (['nike', 'adidas', 'zara', 'h&m'].some(fashion => brandLower.includes(fashion))) return 'Fashion & Lifestyle';
        if (['sephora', 'l\'oréal', 'mac'].some(beauty => brandLower.includes(beauty))) return 'Beauty & Cosmetics';
        if (['netflix', 'disney', 'spotify'].some(ent => brandLower.includes(ent))) return 'Entertainment';
        if (['starbucks', 'mcdonald\'s', 'coca-cola'].some(food => brandLower.includes(food))) return 'Food & Beverage';
        return 'General';
    }

    private calculateBrandRelevance(brand: string, persona: Partial<Persona>): number {
        let score = 50; // Base score

        const brandCategory = this.categorizeBrand(brand);
        const occupation = persona.occupation?.toLowerCase() || '';

        // Boost score based on occupation-brand alignment
        if (brandCategory === 'Technology' && occupation.includes('développeur')) score += 30;
        if (brandCategory === 'Fashion & Lifestyle' && occupation.includes('marketing')) score += 25;
        if (brandCategory === 'Beauty & Cosmetics' && occupation.includes('design')) score += 20;

        // Age-based adjustments
        const age = persona.age || 25;
        if (age < 25 && ['TikTok', 'Snapchat'].some(platform => this.getBrandSocialPlatforms(brand).includes(platform))) score += 15;
        if (age > 35 && ['LinkedIn', 'Facebook'].some(platform => this.getBrandSocialPlatforms(brand).includes(platform))) score += 10;

        return Math.min(100, score);
    }

    private inferMusicGenre(artist: string): string {
        const artistLower = artist.toLowerCase();
        if (artistLower.includes('electronic') || artistLower.includes('dj')) return 'Electronic';
        if (artistLower.includes('rock') || artistLower.includes('metal')) return 'Rock';
        if (artistLower.includes('pop')) return 'Pop';
        if (artistLower.includes('hip') || artistLower.includes('rap')) return 'Hip-Hop';
        if (artistLower.includes('jazz')) return 'Jazz';
        if (artistLower.includes('classical')) return 'Classical';
        return 'Contemporary';
    }

    private getPrimaryPlatformsForAge(age: number): string[] {
        if (age < 25) return ['TikTok', 'Instagram', 'Snapchat'];
        if (age < 35) return ['Instagram', 'TikTok', 'Twitter'];
        if (age < 50) return ['Facebook', 'LinkedIn', 'Instagram'];
        return ['Facebook', 'YouTube', 'LinkedIn'];
    }

    private getEngagementStyleForAge(age: number): string {
        if (age < 25) return 'High-frequency, visual-first, trend-driven';
        if (age < 35) return 'Balanced content consumption, story-driven';
        if (age < 50) return 'Thoughtful engagement, news-focused';
        return 'Selective sharing, family-oriented';
    }

    getSocialMediaByProfile(age?: number, occupation?: string): string[] {
        // Fonction basée sur des données démographiques réelles
        const baseSocialMedia = ['Instagram', 'LinkedIn'];

        if (!age) return [...baseSocialMedia, 'TikTok'];

        // Ajustements basés sur l'âge (données démographiques 2024)
        if (age < 25) {
            // Gen Z: TikTok dominant, Snapchat, Instagram, Discord
            baseSocialMedia.push('TikTok', 'Snapchat', 'Discord', 'BeReal');
        } else if (age < 35) {
            // Millennials: Instagram, TikTok, Twitter
            baseSocialMedia.push('TikTok', 'Twitter', 'Pinterest');
        } else if (age < 50) {
            // Gen X: Facebook, Twitter, LinkedIn dominant
            baseSocialMedia.push('Facebook', 'Twitter', 'YouTube');
        } else {
            // Baby Boomers: Facebook dominant, YouTube
            baseSocialMedia.push('Facebook', 'YouTube', 'WhatsApp');
        }

        // Ajustements basés sur la profession (plus détaillés)
        const occupationLower = occupation?.toLowerCase() || '';

        if (occupationLower.includes('développeur') || occupationLower.includes('tech') ||
            occupationLower.includes('ingénieur') || occupationLower.includes('data')) {
            baseSocialMedia.push('GitHub', 'Reddit', 'Stack Overflow', 'Hacker News');
        } else if (occupationLower.includes('marketing') || occupationLower.includes('communication') ||
            occupationLower.includes('publicité') || occupationLower.includes('brand')) {
            baseSocialMedia.push('Pinterest', 'Facebook', 'Twitter', 'TikTok');
        } else if (occupationLower.includes('designer') || occupationLower.includes('créatif') ||
            occupationLower.includes('graphique') || occupationLower.includes('ux')) {
            baseSocialMedia.push('Behance', 'Dribbble', 'Pinterest', 'Instagram');
        } else if (occupationLower.includes('vente') || occupationLower.includes('commercial') ||
            occupationLower.includes('business')) {
            baseSocialMedia.push('LinkedIn', 'Twitter', 'Facebook');
        } else if (occupationLower.includes('journaliste') || occupationLower.includes('média') ||
            occupationLower.includes('rédacteur')) {
            baseSocialMedia.push('Twitter', 'LinkedIn', 'Medium');
        } else if (occupationLower.includes('influenceur') || occupationLower.includes('créateur') ||
            occupationLower.includes('youtubeur')) {
            baseSocialMedia.push('TikTok', 'YouTube', 'Instagram', 'Twitch');
        } else if (occupationLower.includes('étudiant') || occupationLower.includes('université')) {
            baseSocialMedia.push('TikTok', 'Snapchat', 'Discord', 'Instagram');
        }

        // Supprimer les doublons, limiter à 6 plateformes max pour éviter la surcharge
        const uniqueSocialMedia = Array.from(new Set(baseSocialMedia));
        return uniqueSocialMedia.slice(0, 6);
    }

    private getFallbackEnrichment(personas: Partial<Persona>[]): Promise<Partial<Persona>[]> {
        return Promise.resolve(personas.map(persona => this.getFallbackPersonaEnrichment(persona)));
    }

    private getFallbackPersonaEnrichment(persona: Partial<Persona>): Partial<Persona> {
        return {
            ...persona,
            culturalData: {
                ...persona.culturalData,
                music: this.getFallbackDataForType('music'),
                movies: this.getFallbackDataForType('movie'),
                tv: this.getFallbackDataForType('tv'),
                books: this.getFallbackDataForType('book'),
                brands: this.getFallbackDataForType('brand'),
                restaurants: this.getFallbackDataForType('restaurant'),
                travel: this.getFallbackDataForType('travel'),
                fashion: this.getFallbackDataForType('fashion'),
                beauty: this.getFallbackDataForType('beauty'),
                food: this.getFallbackDataForType('food'),
                socialMedia: this.getSocialMediaByProfile(persona.age, persona.occupation),
                podcasts: this.getFallbackDataForType('podcast'),
                videoGames: this.getFallbackDataForType('video_game'),
                influencers: this.getFallbackDataForType('person')
            }
        };
    }

    private getFallbackDataForType(type: string): string[] {
        switch (type) {
            case 'music': return ['Indie Pop', 'Electronic', 'Jazz moderne'];
            case 'brand': return ['Apple', 'Zara', 'Sephora', 'Airbnb'];
            case 'movie': return ['Films indépendants', 'Documentaires', 'Comédies'];
            case 'tv': return ['Séries Netflix', 'Documentaires', 'Comédies'];
            case 'book': return ['Romans contemporains', 'Développement personnel', 'Biographies'];
            case 'restaurant': return ['Restaurants bio', 'Cuisine fusion', 'Food trucks'];
            case 'travel': return ['Voyages éco-responsables', 'City breaks', 'Aventures outdoor'];
            case 'fashion': return ['Mode durable', 'Streetwear', 'Vintage'];
            case 'beauty': return ['Cosmétiques naturels', 'Skincare coréenne', 'Maquillage minimaliste'];
            case 'food': return ['Cuisine végétarienne', 'Superfoods', 'Cuisine locale'];
            case 'podcast': return ['True Crime', 'Tech Talk', 'Développement personnel'];
            case 'video_game': return ['Jeux indépendants', 'RPG', 'Jeux de stratégie'];
            case 'person': return ['Influenceurs lifestyle', 'Experts tech', 'Créateurs de contenu'];
            default: return [];
        }
    }
    async searchTags(query: string, take: number = 10): Promise<string[]> {
        try {
            const response = await fetch(
                `${this.baseUrl}/v2/tags?q=${encodeURIComponent(query)}&take=${take}`,
                {
                    headers: {
                        'X-API-Key': this.apiKey, // ✅ Correction de la casse
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                return [];
            }

            const result = await response.json();
            return result.data?.map((tag: any) => tag.id || tag.name) || [];
        } catch (error) {
            return [];
        }
    }

    async searchEntities(query: string, types: string[] = ['artist', 'movie', 'brand'], take: number = 10): Promise<any[]> {
        try {
            const typesParam = types.join(',');
            const response = await fetch(
                `${this.baseUrl}/search?q=${encodeURIComponent(query)}&types=${typesParam}&take=${take}`,
                {
                    headers: {
                        'X-API-Key': this.apiKey, // ✅ Correction de la casse
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                return [];
            }

            const result = await response.json();
            return result.data || [];
        } catch (error) {
            return [];
        }
    }

    async getAudiences(take: number = 50): Promise<any[]> {
        try {
            const response = await fetch(
                `${this.baseUrl}/v2/audiences?take=${take}`,
                {
                    headers: {
                        'X-API-Key': this.apiKey, // ✅ Correction de la casse
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                return [];
            }

            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Erreur récupération audiences:', error);
            return [];
        }
    }

    async testConnection(): Promise<{ success: boolean; error?: string; status?: number }> {
        if (!this.apiKey) {
            return { success: false, error: 'Clé API manquante' };
        }

        try {
            const response = await fetch(
                `${this.baseUrl}/v2/insights?filter.type=urn:entity:artist&signal.demographics.audiences=millennials&take=1`,
                {
                    headers: {
                        'X-API-Key': this.apiKey, // ✅ Correction de la casse
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                return { success: true };
            }

            let errorMessage = `HTTP ${response.status}`;
            if (response.status === 403) {
                errorMessage = 'Accès refusé - Vérifiez l\'URL de base et la clé API';
            } else if (response.status === 429) {
                errorMessage = 'Limite de débit atteinte - Réessayez plus tard';
            }

            return {
                success: false,
                error: errorMessage,
                status: response.status
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }

    /**
     * Valide les paramètres selon le type d'entité
     * Basé sur le guide des paramètres disponibles par type d'entité
     */
    private validateParametersForEntityType(entityType: string, params: Record<string, any>): boolean {
        const supportedParams: { [key: string]: string[] } = {
            'urn:entity:artist': ['signal.demographics.audiences', 'signal.interests.tags', 'signal.demographics.location'],
            'urn:entity:movie': ['signal.demographics.audiences', 'signal.interests.tags', 'signal.demographics.location'],
            'urn:entity:tv_show': ['signal.demographics.audiences', 'signal.interests.tags', 'signal.demographics.location'],
            'urn:entity:book': ['signal.demographics.audiences', 'signal.interests.tags', 'signal.demographics.location'],
            'urn:entity:brand': ['signal.demographics.audiences', 'signal.interests.tags', 'signal.demographics.location'],
            'urn:entity:place': ['signal.demographics.audiences', 'signal.interests.tags', 'signal.demographics.location'],
            'urn:entity:destination': ['signal.demographics.audiences', 'signal.interests.tags', 'signal.demographics.location'],
            'urn:entity:podcast': ['signal.demographics.audiences', 'signal.interests.tags', 'signal.demographics.location'],
            'urn:entity:video_game': ['signal.demographics.audiences', 'signal.interests.tags', 'signal.demographics.location'],
            'urn:entity:person': ['signal.demographics.audiences', 'signal.interests.tags', 'signal.demographics.location']
        };

        const allowedParams = supportedParams[entityType] || [];
        const paramKeys = Object.keys(params);

        return paramKeys.every(key => allowedParams.includes(key));
    }

    /**
     * Construit une URL de requête valide avec validation des paramètres
     */
    private buildValidatedUrl(entityType: string, params: Record<string, any>, take: number): string {
        const mappedEntityType = this.mapEntityType(entityType);

        // Valider les paramètres
        this.validateParametersForEntityType(mappedEntityType, params);

        // Utiliser new URL pour éviter les doubles slashes
        const url = new URL('/v2/insights', this.baseUrl);
        url.searchParams.set('filter.type', mappedEntityType);
        url.searchParams.set('take', take.toString());

        // Ajouter les paramètres validés
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                url.searchParams.set(key, value);
            }
        });

        return url.toString();
    }

    /**
     * Méthode utilitaire pour obtenir des IDs d'entités valides selon le workflow recommandé
     */
    async getValidEntityIds(entityName: string, entityType: string): Promise<string[]> {
        try {
            const entities = await this.searchEntities(entityName, [entityType], 5);
            return entities.map(entity => entity.id).filter(Boolean);
        } catch (error) {
            return [];
        }
    }

    /**
     * Méthode utilitaire pour obtenir des IDs de tags valides
     */
    async getValidTagIds(tagQuery: string): Promise<string[]> {
        try {
            const tags = await this.searchTags(tagQuery, 10);
            return tags.filter(Boolean);
        } catch (error) {
            return [];
        }
    }

    /**
     * Méthode utilitaire pour obtenir des IDs d'audiences valides
     */
    async getValidAudienceIds(): Promise<string[]> {
        try {
            const audiences = await this.getAudiences(20);
            return audiences.map(audience => audience.id).filter(Boolean);
        } catch (error) {
            console.error('Erreur récupération audiences:', error);
            return [];
        }
    }

    /**
     * Convertit une localisation en format accepté par Qloo
     */
    private normalizeLocation(location: string): string {
        // Si c'est déjà un code ISO-3166-2, le retourner tel quel
        if (/^[A-Z]{2}-[A-Z0-9]{1,3}$/.test(location)) {
            return location;
        }

        // Mapping des villes courantes vers codes ISO-3166-2
        const cityToIsoMap: { [key: string]: string } = {
            'paris': 'FR-75',
            'lyon': 'FR-69',
            'marseille': 'FR-13',
            'toulouse': 'FR-31',
            'nice': 'FR-06',
            'london': 'GB-LND',
            'manchester': 'GB-MAN',
            'birmingham': 'GB-BIR',
            'new york': 'US-NY',
            'los angeles': 'US-CA',
            'chicago': 'US-IL',
            'houston': 'US-TX',
            'miami': 'US-FL',
            'toronto': 'CA-ON',
            'vancouver': 'CA-BC',
            'montreal': 'CA-QC',
            'berlin': 'DE-BE',
            'munich': 'DE-BY',
            'hamburg': 'DE-HH',
            'madrid': 'ES-MD',
            'barcelona': 'ES-CT',
            'rome': 'IT-RM',
            'milan': 'IT-MI',
            'amsterdam': 'NL-NH',
            'brussels': 'BE-BRU',
            'zurich': 'CH-ZH',
            'geneva': 'CH-GE'
        };

        const normalizedCity = location.toLowerCase().trim();
        return cityToIsoMap[normalizedCity] || location;
    }

    getApiStatus(): { hasApiKey: boolean; baseUrl: string } {
        return {
            hasApiKey: !!this.apiKey,
            baseUrl: this.baseUrl
        };
    }
}

// Instance singleton
let qlooClient: QlooClient | null = null;

export function getQlooClient(): QlooClient {
    if (!qlooClient) {
        qlooClient = new QlooClient();
    }
    return qlooClient;
}