import { EnrichedPersona, EnhancedPersonaFilters, EnhancedSortOptions } from '@/types/enhanced-persona';

/**
 * Calculate cultural richness based on cultural data
 */
export const calculateCulturalRichness = (culturalData: any): 'low' | 'medium' | 'high' => {
    if (!culturalData) return 'low';

    const totalItems = Object.values(culturalData).flat().length;
    if (totalItems > 50) return 'high';
    if (totalItems > 20) return 'medium';
    return 'low';
};

/**
 * Get validation score from persona metadata or fallback to quality score
 */
export const getValidationScore = (persona: EnrichedPersona): number => {
    return persona.validationMetadata?.validationScore ?? persona.qualityScore;
};

/**
 * Get generation source from persona metadata
 */
export const getGenerationSource = (persona: EnrichedPersona): 'qloo-first' | 'legacy-fallback' => {
    return persona.generationMetadata?.source ?? 'legacy-fallback';
};

/**
 * Check if persona matches search query
 */
export const matchesSearchQuery = (persona: EnrichedPersona, query: string): boolean => {
    if (!query.trim()) return true;

    const searchLower = query.toLowerCase();
    const searchableFields = [
        persona.name,
        persona.occupation,
        persona.location,
        persona.bio,
        persona.quote,
        ...(persona.demographics ? Object.values(persona.demographics).filter(Boolean) : []),
        ...(persona.psychographics?.personality || []),
        ...(persona.psychographics?.values || []),
        ...(persona.psychographics?.interests || []),
        ...(persona.goals || []),
        ...(persona.painPoints || [])
    ].filter(Boolean);

    return searchableFields.some(field =>
        String(field).toLowerCase().includes(searchLower)
    );
};

/**
 * Check if persona matches all applied filters
 */
export const matchesFilters = (persona: EnrichedPersona, filters: EnhancedPersonaFilters): boolean => {
    // Generation source filter
    if (filters.generationSource?.length) {
        const personaSource = getGenerationSource(persona);
        if (!filters.generationSource.includes(personaSource)) {
            return false;
        }
    }

    // Validation score range filter
    if (filters.validationScore) {
        const validationScore = getValidationScore(persona);
        const [min, max] = filters.validationScore;
        if (validationScore < min || validationScore > max) {
            return false;
        }
    }

    // Cultural data richness filter
    if (filters.culturalDataRichness?.length) {
        const richness = calculateCulturalRichness(persona.culturalData);
        if (!filters.culturalDataRichness.includes(richness)) {
            return false;
        }
    }

    // Quality score range filter
    if (filters.qualityScore) {
        const [min, max] = filters.qualityScore;
        if (persona.qualityScore < min || persona.qualityScore > max) {
            return false;
        }
    }

    // Age range filter
    if (filters.ageRange) {
        const [min, max] = filters.ageRange;
        if (persona.age < min || persona.age > max) {
            return false;
        }
    }

    // Occupation filter
    if (filters.occupation?.length) {
        if (!filters.occupation.some(occ =>
            persona.occupation.toLowerCase().includes(occ.toLowerCase())
        )) {
            return false;
        }
    }

    // Location filter
    if (filters.location?.length) {
        if (!filters.location.some(loc =>
            persona.location.toLowerCase().includes(loc.toLowerCase())
        )) {
            return false;
        }
    }

    // Template used filter
    if (filters.templateUsed?.length) {
        const templateUsed = persona.generationMetadata?.templateUsed;
        if (!templateUsed || !filters.templateUsed.includes(templateUsed)) {
            return false;
        }
    }

    // Cultural data source filter
    if (filters.culturalDataSource?.length) {
        const culturalDataSource = persona.culturalDataSource || 'unknown';
        if (!filters.culturalDataSource.includes(culturalDataSource)) {
            return false;
        }
    }

    // Has metadata filter
    if (filters.hasMetadata !== undefined) {
        const hasMetadata = !!(persona.generationMetadata || persona.validationMetadata);
        if (hasMetadata !== filters.hasMetadata) {
            return false;
        }
    }

    // Processing time range filter
    if (filters.processingTimeRange) {
        const processingTime = persona.generationMetadata?.processingTime || persona.processingTime || 0;
        const [min, max] = filters.processingTimeRange;
        if (processingTime < min || processingTime > max) {
            return false;
        }
    }

    // Date range filter
    if (filters.dateRange) {
        const createdAt = new Date(persona.createdAt);
        const [startDate, endDate] = filters.dateRange.map(d => new Date(d));
        if (createdAt < startDate || createdAt > endDate) {
            return false;
        }
    }

    return true;
};

/**
 * Sort personas based on sort options
 */
export const sortPersonas = (personas: EnrichedPersona[], sortOptions: EnhancedSortOptions): EnrichedPersona[] => {
    return [...personas].sort((a, b) => {
        let comparison = 0;

        switch (sortOptions.field) {
            case 'qualityScore':
                comparison = a.qualityScore - b.qualityScore;
                break;

            case 'validationScore':
                comparison = getValidationScore(a) - getValidationScore(b);
                break;

            case 'culturalRichness':
                const richnessOrder = { low: 1, medium: 2, high: 3 };
                const aRichness = calculateCulturalRichness(a.culturalData);
                const bRichness = calculateCulturalRichness(b.culturalData);
                comparison = richnessOrder[aRichness] - richnessOrder[bRichness];
                break;

            case 'name':
                comparison = a.name.localeCompare(b.name);
                break;

            case 'age':
                comparison = a.age - b.age;
                break;

            case 'occupation':
                comparison = a.occupation.localeCompare(b.occupation);
                break;

            case 'location':
                comparison = a.location.localeCompare(b.location);
                break;

            case 'createdAt':
                comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                break;

            case 'processingTime':
                const aProcessingTime = a.generationMetadata?.processingTime || a.processingTime || 0;
                const bProcessingTime = b.generationMetadata?.processingTime || b.processingTime || 0;
                comparison = aProcessingTime - bProcessingTime;
                break;

            case 'generatedAt':
                const aGeneratedAt = a.generationMetadata?.generatedAt || a.createdAt;
                const bGeneratedAt = b.generationMetadata?.generatedAt || b.createdAt;
                comparison = new Date(aGeneratedAt).getTime() - new Date(bGeneratedAt).getTime();
                break;

            default:
                comparison = 0;
        }

        return sortOptions.direction === 'desc' ? -comparison : comparison;
    });
};

/**
 * Filter and sort personas based on search query, filters, and sort options
 */
export const filterAndSortPersonas = (
    personas: EnrichedPersona[],
    searchQuery: string,
    filters: EnhancedPersonaFilters,
    sortOptions: EnhancedSortOptions
): EnrichedPersona[] => {
    let filteredPersonas = personas;

    // Apply search query filter
    if (searchQuery.trim()) {
        filteredPersonas = filteredPersonas.filter(persona =>
            matchesSearchQuery(persona, searchQuery)
        );
    }

    // Apply filters
    filteredPersonas = filteredPersonas.filter(persona =>
        matchesFilters(persona, filters)
    );

    // Apply sorting
    return sortPersonas(filteredPersonas, sortOptions);
};

/**
 * Get available filter options from a list of personas
 */
export const getAvailableFilterOptions = (personas: EnrichedPersona[]) => {
    const occupations = [...new Set(personas.map(p => p.occupation))].sort();
    const locations = [...new Set(personas.map(p => p.location))].sort();
    const templates = [...new Set(personas
        .map(p => p.generationMetadata?.templateUsed)
        .filter(Boolean)
    )].sort();
    const culturalDataSources = [...new Set(personas
        .map(p => p.culturalDataSource)
        .filter(Boolean)
    )].sort();

    const validationScores = personas
        .map(p => getValidationScore(p))
        .filter(score => score !== undefined);

    const qualityScores = personas.map(p => p.qualityScore);
    const ages = personas.map(p => p.age);

    const processingTimes = personas
        .map(p => p.generationMetadata?.processingTime || p.processingTime)
        .filter((time): time is number => typeof time === 'number');

    return {
        occupations,
        locations,
        templates,
        culturalDataSources,
        validationScoreRange: validationScores.length > 0
            ? [Math.min(...validationScores), Math.max(...validationScores)] as [number, number]
            : [0, 100] as [number, number],
        qualityScoreRange: qualityScores.length > 0
            ? [Math.min(...qualityScores), Math.max(...qualityScores)] as [number, number]
            : [0, 100] as [number, number],
        ageRange: ages.length > 0
            ? [Math.min(...ages), Math.max(...ages)] as [number, number]
            : [0, 100] as [number, number],
        processingTimeRange: processingTimes.length > 0
            ? [Math.min(...processingTimes), Math.max(...processingTimes)] as [number, number]
            : [0, 10000] as [number, number],
        dateRange: personas.length > 0
            ? [
                Math.min(...personas.map(p => new Date(p.createdAt).getTime())),
                Math.max(...personas.map(p => new Date(p.createdAt).getTime()))
            ].map(timestamp => new Date(timestamp).toISOString().split('T')[0]) as [string, string]
            : [new Date().toISOString().split('T')[0], new Date().toISOString().split('T')[0]] as [string, string]
    };
};

/**
 * Get filter statistics for display
 */
export const getFilterStatistics = (
    allPersonas: EnrichedPersona[],
    filteredPersonas: EnrichedPersona[]
) => {
    const total = allPersonas.length;
    const filtered = filteredPersonas.length;

    const generationSourceStats = {
        'qloo-first': filteredPersonas.filter(p => getGenerationSource(p) === 'qloo-first').length,
        'legacy-fallback': filteredPersonas.filter(p => getGenerationSource(p) === 'legacy-fallback').length
    };

    const culturalRichnessStats = {
        low: filteredPersonas.filter(p => calculateCulturalRichness(p.culturalData) === 'low').length,
        medium: filteredPersonas.filter(p => calculateCulturalRichness(p.culturalData) === 'medium').length,
        high: filteredPersonas.filter(p => calculateCulturalRichness(p.culturalData) === 'high').length
    };

    const averageValidationScore = filteredPersonas.length > 0
        ? filteredPersonas.reduce((sum, p) => sum + getValidationScore(p), 0) / filteredPersonas.length
        : 0;

    const averageQualityScore = filteredPersonas.length > 0
        ? filteredPersonas.reduce((sum, p) => sum + p.qualityScore, 0) / filteredPersonas.length
        : 0;

    return {
        total,
        filtered,
        generationSourceStats,
        culturalRichnessStats,
        averageValidationScore: Math.round(averageValidationScore * 10) / 10,
        averageQualityScore: Math.round(averageQualityScore * 10) / 10
    };
};