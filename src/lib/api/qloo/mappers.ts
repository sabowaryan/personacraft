export function mapEntityType(entityType: string): string {
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

export function getAgeRange(age: number): string {
    if (age < 25) return 'gen-z';
    if (age < 35) return 'millennials';
    if (age < 50) return 'gen-x';
    return 'baby-boomers';
}

export function mapOccupationToSignal(occupation: string): string | null {
    const lowerOccupation = occupation.toLowerCase();

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

import { cityToIsoMap } from './city-mappings';

export function normalizeLocation(location: string): string {
    if (/^[A-Z]{2}-[A-Z0-9]{1,3}$/.test(location)) {
        return location;
    }

    const normalizedCity = location.toLowerCase().trim();
    return cityToIsoMap[normalizedCity] || location;
}