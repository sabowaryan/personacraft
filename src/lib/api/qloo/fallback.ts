import { Persona } from '@/types';

export function getFallbackDataForType(type: string): string[] {
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

export function getFallbackPersonaEnrichment(persona: Partial<Persona>): Partial<Persona> {
    return {
        ...persona,
        culturalData: {
            ...persona.culturalData,
            music: getFallbackDataForType('music'),
            movie: getFallbackDataForType('movie'),
            tv: getFallbackDataForType('tv'),
            book: getFallbackDataForType('book'),
            brand: getFallbackDataForType('brand'),
            restaurant: getFallbackDataForType('restaurant'),
            travel: getFallbackDataForType('travel'),
            fashion: getFallbackDataForType('fashion'),
            beauty: getFallbackDataForType('beauty'),
            food: getFallbackDataForType('food'),
            socialMedia: getSocialMediaByProfile(persona.age, persona.occupation),
            podcasts: getFallbackDataForType('podcast'),
            videoGames: getFallbackDataForType('video_game'),
            influencers: getFallbackDataForType('person')
        }
    };
}

export function getFallbackEnrichment(personas: Partial<Persona>[]): Promise<Partial<Persona>[]> {
    return Promise.resolve(personas.map(persona => getFallbackPersonaEnrichment(persona)));
}

export function getSocialMediaByProfile(age?: number, occupation?: string): string[] {
    const baseSocialMedia = ['Instagram', 'LinkedIn'];

    if (!age) return [...baseSocialMedia, 'TikTok'];

    if (age < 25) {
        baseSocialMedia.push('TikTok', 'Snapchat', 'Discord', 'BeReal');
    } else if (age < 35) {
        baseSocialMedia.push('TikTok', 'Twitter', 'Pinterest');
    } else if (age < 50) {
        baseSocialMedia.push('Facebook', 'Twitter', 'YouTube');
    } else {
        baseSocialMedia.push('Facebook', 'YouTube', 'WhatsApp');
    }

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

    const uniqueSocialMedia = Array.from(new Set(baseSocialMedia));
    return uniqueSocialMedia.slice(0, 6);
}