export function validateParametersForEntityType(entityType: string, params: Record<string, any>): boolean {
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

export function buildValidatedUrl(baseUrl: string, entityType: string, params: Record<string, any>, take: number): string {
    validateParametersForEntityType(entityType, params);

    const url = new URL('/v2/insights', baseUrl);
    url.searchParams.set('filter.type', entityType);
    url.searchParams.set('take', take.toString());

    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            url.searchParams.set(key, value);
        }
    });

    return url.toString();
}

export function supportsAudienceRequests(entityType: string): boolean {
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