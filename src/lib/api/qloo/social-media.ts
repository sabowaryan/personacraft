import { Persona } from '@/types';
import { SocialMediaEnrichment, SocialMediaInsights } from './types';
import { getSocialMediaByProfile } from './fallback';
import { getBrandSocialPlatforms, categorizeBrand, calculateBrandRelevance, generateBrandInfluence } from './brand-mappings';

export async function enrichSocialMediaWithQloo(
    persona: Partial<Persona>,
    fetchDataFn: (type: string, age: number, occupation?: string, location?: string, take?: number) => Promise<string[]>
): Promise<SocialMediaEnrichment> {
    try {
        const [influencers, brands, musicArtists] = await Promise.all([
            fetchDataFn('person', persona.age || 25, persona.occupation, persona.location, 3),
            fetchDataFn('brand', persona.age || 25, persona.occupation, persona.location, 3),
            fetchDataFn('music', persona.age || 25, persona.occupation, persona.location, 2)
        ]);

        const qlooMapping = mapQlooDataToSocialPlatforms(influencers, brands, musicArtists, persona);
        const localSocialMedia = getSocialMediaByProfile(persona.age, persona.occupation);
        const enrichedPlatforms = Array.from(new Set([...qlooMapping.platforms, ...localSocialMedia]));

        return {
            platforms: enrichedPlatforms.slice(0, 6),
            insights: qlooMapping.insights
        };
    } catch (error) {
        console.warn('Erreur enrichissement social média via Qloo, utilisation logique locale:', error);
        return {
            platforms: getSocialMediaByProfile(persona.age, persona.occupation),
            insights: { audienceMatches: [], brandInfluence: [], contentPreferences: [], demographicAlignment: [] }
        };
    }
}

function mapQlooDataToSocialPlatforms(
    influencers: string[],
    brands: string[],
    musicArtists: string[],
    persona: Partial<Persona>
): { platforms: string[], insights: SocialMediaInsights } {
    const platforms: string[] = [];
    const insights: SocialMediaInsights = {
        audienceMatches: [],
        brandInfluence: [],
        contentPreferences: [],
        demographicAlignment: []
    };

    // Enhanced mapping basé sur les influenceurs/personnes avec insights
    influencers.forEach(influencer => {
        const lowerInfluencer = influencer.toLowerCase();
        const influencerInsights = analyzeInfluencerProfile(influencer, persona);

        if (isYouTubePersonality(lowerInfluencer)) {
            platforms.push('YouTube');
            insights.contentPreferences.push(`Video content (${influencer})`);
        }
        if (isInstagramInfluencer(lowerInfluencer)) {
            platforms.push('Instagram');
            insights.contentPreferences.push(`Visual storytelling (${influencer})`);
        }
        if (isTikTokCreator(lowerInfluencer)) {
            platforms.push('TikTok');
            insights.contentPreferences.push(`Short-form content (${influencer})`);
        }
        if (isTechPersonality(lowerInfluencer)) {
            platforms.push('Twitter', 'LinkedIn');
            insights.contentPreferences.push(`Professional networking (${influencer})`);
        }

        insights.audienceMatches.push(influencerInsights);
    });

    // Enhanced mapping basé sur les marques avec brand influence tracking
    brands.forEach(brand => {
        const brandPlatforms = getBrandSocialPlatforms(brand);

        platforms.push(...brandPlatforms);
        insights.brandInfluence.push(generateBrandInfluence(brand, persona));
    });

    // Enhanced mapping basé sur les artistes musicaux avec genre analysis
    musicArtists.forEach(artist => {
        const artistPlatforms = getArtistSocialPlatforms(artist);
        const musicGenre = inferMusicGenre(artist);

        platforms.push(...artistPlatforms);
        insights.contentPreferences.push(`${musicGenre} music content (${artist})`);
    });

    // Demographic alignment analysis
    const ageGroup = getAgeRange(persona.age || 25);
    insights.demographicAlignment.push({
        ageGroup,
        primaryPlatforms: getPrimaryPlatformsForAge(persona.age || 25),
        engagementStyle: getEngagementStyleForAge(persona.age || 25)
    });

    return {
        platforms: Array.from(new Set(platforms)),
        insights
    };
}

function isYouTubePersonality(name: string): boolean {
    const youtubeKeywords = ['youtuber', 'vlogger', 'creator', 'channel', 'video'];
    return youtubeKeywords.some(keyword => name.includes(keyword));
}

function isInstagramInfluencer(name: string): boolean {
    const instagramKeywords = ['influencer', 'model', 'fashion', 'lifestyle', 'beauty', 'fitness'];
    return instagramKeywords.some(keyword => name.includes(keyword));
}

function isTikTokCreator(name: string): boolean {
    const tiktokKeywords = ['tiktok', 'viral', 'dance', 'comedy', 'short'];
    return tiktokKeywords.some(keyword => name.includes(keyword));
}

function isTechPersonality(name: string): boolean {
    const techKeywords = ['tech', 'developer', 'engineer', 'startup', 'ceo', 'founder'];
    return techKeywords.some(keyword => name.includes(keyword));
}



function getArtistSocialPlatforms(artist: string): string[] {
    const musicPlatforms = ['Instagram', 'TikTok', 'YouTube', 'Twitter'];
    const artistLower = artist.toLowerCase();

    if (artistLower.includes('electronic') || artistLower.includes('dj')) {
        musicPlatforms.push('SoundCloud');
    }
    if (artistLower.includes('indie') || artistLower.includes('alternative')) {
        musicPlatforms.push('Bandcamp', 'SoundCloud');
    }

    return musicPlatforms;
}

function analyzeInfluencerProfile(influencer: string, persona: Partial<Persona>): any {
    const profile = influencer.toLowerCase();
    return {
        name: influencer,
        relevanceFactors: [
            profile.includes('tech') && persona.occupation?.toLowerCase().includes('développeur') ? 'Tech alignment' : null,
            profile.includes('marketing') && persona.occupation?.toLowerCase().includes('marketing') ? 'Professional alignment' : null,
            profile.includes('design') && persona.occupation?.toLowerCase().includes('design') ? 'Creative alignment' : null
        ].filter(Boolean),
        estimatedFollowingOverlap: Math.floor(Math.random() * 40) + 10
    };
}



function inferMusicGenre(artist: string): string {
    const artistLower = artist.toLowerCase();
    if (artistLower.includes('electronic') || artistLower.includes('dj')) return 'Electronic';
    if (artistLower.includes('rock') || artistLower.includes('metal')) return 'Rock';
    if (artistLower.includes('pop')) return 'Pop';
    if (artistLower.includes('hip') || artistLower.includes('rap')) return 'Hip-Hop';
    if (artistLower.includes('jazz')) return 'Jazz';
    if (artistLower.includes('classical')) return 'Classical';
    return 'Contemporary';
}

function getPrimaryPlatformsForAge(age: number): string[] {
    if (age < 25) return ['TikTok', 'Instagram', 'Snapchat'];
    if (age < 35) return ['Instagram', 'TikTok', 'Twitter'];
    if (age < 50) return ['Facebook', 'LinkedIn', 'Instagram'];
    return ['Facebook', 'YouTube', 'LinkedIn'];
}

function getEngagementStyleForAge(age: number): string {
    if (age < 25) return 'High-frequency, visual-first, trend-driven';
    if (age < 35) return 'Balanced content consumption, story-driven';
    if (age < 50) return 'Thoughtful engagement, news-focused';
    return 'Selective sharing, family-oriented';
}

function getAgeRange(age: number): string {
    if (age < 25) return 'gen-z';
    if (age < 35) return 'millennials';
    if (age < 50) return 'gen-x';
    return 'baby-boomers';
}