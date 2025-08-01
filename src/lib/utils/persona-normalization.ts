// Persona data normalization utilities for handling legacy personas and metadata validation
// Provides comprehensive normalization, validation, and data integrity functions

import { 
    EnrichedPersona, 
    GenerationMetadata, 
    ValidationMetadata,
    ValidationDetail,
    CulturalDataVisualization,
    BatchOperationResult
} from '@/types/enhanced-persona';
import { Persona, CulturalData } from '@/types';

/**
 * Comprehensive persona normalization with data integrity checks
 * Handles various edge cases and ensures data consistency
 */
export function normalizePersona(
    persona: Partial<EnrichedPersona>, 
    options: NormalizationOptions = {}
): EnrichedPersona {
    const {
        preserveOriginalTimestamps = true,
        validateCulturalData = true,
        generateMissingIds = true,
        strictValidation = false
    } = options;

    const now = new Date().toISOString();
    
    // Generate ID if missing and allowed
    const personaId = persona.id || (generateMissingIds ? generatePersonaId() : '');
    
    // Normalize timestamps
    const createdAt = preserveOriginalTimestamps && persona.createdAt ? persona.createdAt : now;
    
    // Normalize cultural data with validation
    const normalizedCulturalData = validateCulturalData ? 
        normalizeCulturalData(persona.culturalData) : 
        persona.culturalData || getEmptyCulturalData();

    // Create enhanced generation metadata
    const generationMetadata = normalizeGenerationMetadata(persona, createdAt);
    
    // Create enhanced validation metadata
    const validationMetadata = normalizeValidationMetadata(persona, createdAt);

    // Build normalized persona
    const normalizedPersona: EnrichedPersona = {
        // Core persona fields with defaults
        id: personaId,
        name: sanitizeString(persona.name) || 'Persona sans nom',
        age: normalizeAge(persona.age),
        occupation: sanitizeString(persona.occupation) || 'Non spécifié',
        location: sanitizeString(persona.location) || 'Non spécifié',
        bio: sanitizeString(persona.bio) || '',
        quote: sanitizeString(persona.quote) || '',
        
        // Complex objects with normalization
        demographics: normalizeDemographics(persona.demographics),
        psychographics: normalizePsychographics(persona.psychographics),
        culturalData: normalizedCulturalData,
        painPoints: normalizeStringArray(persona.painPoints),
        goals: normalizeStringArray(persona.goals),
        marketingInsights: normalizeMarketingInsights(persona.marketingInsights),
        
        // Scores and timestamps
        qualityScore: normalizeScore(persona.qualityScore),
        createdAt,
        
        // Enhanced metadata
        generationMetadata,
        validationMetadata,
        culturalDataSource: persona.culturalDataSource || 'unknown',
        templateUsed: persona.templateUsed || 'legacy',
        processingTime: Math.max(0, persona.processingTime || 0),
        
        // Computed properties
        culturalRichness: calculateCulturalRichness(normalizedCulturalData),
        qualityLevel: getQualityLevel(normalizeScore(persona.qualityScore)),
        isLegacy: !persona.generationMetadata || persona.generationMetadata.source === 'legacy-fallback',
        
        // Optional fields
        brief: persona.brief,
        socialMediaInsights: persona.socialMediaInsights
    };

    // Perform strict validation if requested
    if (strictValidation) {
        const validationResult = validatePersonaIntegrity(normalizedPersona);
        if (!validationResult.isValid) {
            throw new Error(`Persona validation failed: ${validationResult.errors.join(', ')}`);
        }
    }

    return normalizedPersona;
}

/**
 * Normalization options for controlling the normalization process
 */
export interface NormalizationOptions {
    preserveOriginalTimestamps?: boolean;
    validateCulturalData?: boolean;
    generateMissingIds?: boolean;
    strictValidation?: boolean;
    defaultQualityScore?: number;
    fallbackTemplate?: string;
}

/**
 * Normalizes generation metadata with comprehensive defaults
 */
function normalizeGenerationMetadata(
    persona: Partial<EnrichedPersona>, 
    createdAt: string
): GenerationMetadata {
    const existing = persona.generationMetadata;
    
    return {
        source: existing?.source || 'legacy-fallback',
        method: existing?.method || 'legacy-generation',
        culturalConstraintsUsed: Array.isArray(existing?.culturalConstraintsUsed) ? 
            existing.culturalConstraintsUsed : [],
        processingTime: Math.max(0, existing?.processingTime || persona.processingTime || 0),
        qlooDataUsed: existing?.qlooDataUsed || false,
        templateUsed: existing?.templateUsed || persona.templateUsed || 'legacy',
        fallbackReason: existing?.fallbackReason || 
            (existing?.source === 'legacy-fallback' ? 'Legacy persona without metadata' : undefined),
        cacheHitRate: existing?.cacheHitRate,
        generatedAt: existing?.generatedAt || createdAt,
        qlooApiCallsCount: existing?.qlooApiCallsCount,
        retryCount: existing?.retryCount || 0,
        constraints: existing?.constraints
    };
}

/**
 * Normalizes validation metadata with comprehensive defaults
 */
function normalizeValidationMetadata(
    persona: Partial<EnrichedPersona>, 
    createdAt: string
): ValidationMetadata {
    const existing = persona.validationMetadata;
    const qualityScore = normalizeScore(persona.qualityScore);
    
    return {
        templateName: existing?.templateName || persona.templateUsed || 'legacy',
        validationScore: existing?.validationScore || qualityScore,
        validationDetails: Array.isArray(existing?.validationDetails) ? 
            existing.validationDetails : [],
        failedRules: Array.isArray(existing?.failedRules) ? existing.failedRules : [],
        passedRules: Array.isArray(existing?.passedRules) ? existing.passedRules : [],
        validationTime: Math.max(0, existing?.validationTime || 0),
        validatedAt: existing?.validatedAt || createdAt,
        overallStatus: existing?.overallStatus || (qualityScore >= 70 ? 'passed' : 'warning'),
        categoryScores: existing?.categoryScores || {
            format: qualityScore,
            content: qualityScore,
            cultural: qualityScore,
            demographic: qualityScore
        }
    };
}

/**
 * Advanced cultural data richness calculation with weighted categories
 */
export function calculateCulturalRichness(culturalData?: CulturalData): 'low' | 'medium' | 'high' {
    if (!culturalData) return 'low';

    // Weight different categories based on importance
    const categoryWeights: Record<string, number> = {
        music: 1.2,
        brands: 1.1,
        restaurants: 1.0,
        movies: 1.0,
        tv: 1.0,
        books: 0.9,
        travel: 0.8,
        fashion: 0.8,
        beauty: 0.7,
        food: 1.0,
        socialMedia: 1.1,
        podcasts: 0.6,
        videoGames: 0.6,
        influencers: 0.7
    };

    let weightedScore = 0;
    let categoriesWithData = 0;
    let totalItems = 0;

    Object.entries(culturalData).forEach(([category, items]) => {
        if (Array.isArray(items) && items.length > 0) {
            const weight = categoryWeights[category] || 1.0;
            const itemCount = items.length;
            
            weightedScore += itemCount * weight;
            categoriesWithData++;
            totalItems += itemCount;
        }
    });

    // Calculate richness based on weighted score and category diversity
    const diversityBonus = categoriesWithData >= 8 ? 1.2 : categoriesWithData >= 5 ? 1.1 : 1.0;
    const finalScore = weightedScore * diversityBonus;

    if (finalScore > 60 && categoriesWithData >= 7) return 'high';
    if (finalScore > 25 && categoriesWithData >= 4) return 'medium';
    return 'low';
}

/**
 * Validates metadata presence and completeness with detailed analysis
 */
export function validateMetadataCompleteness(persona: EnrichedPersona): MetadataValidationResult {
    const missingFields: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validate generation metadata
    if (!persona.generationMetadata) {
        missingFields.push('generationMetadata');
        suggestions.push('Régénérer le persona avec le nouveau système');
    } else {
        const gm = persona.generationMetadata;
        
        if (!gm.source) missingFields.push('generationMetadata.source');
        if (!gm.method) missingFields.push('generationMetadata.method');
        if (!gm.generatedAt) missingFields.push('generationMetadata.generatedAt');
        
        if (gm.processingTime === 0) warnings.push('Temps de traitement non enregistré');
        if (gm.source === 'qloo-first' && !gm.qlooDataUsed) {
            warnings.push('Persona Qloo First sans utilisation des données Qloo');
        }
        if (gm.source === 'legacy-fallback') {
            suggestions.push('Considérer la migration vers Qloo First pour de meilleures données culturelles');
        }
    }

    // Validate validation metadata
    if (!persona.validationMetadata) {
        missingFields.push('validationMetadata');
        suggestions.push('Valider le persona avec les templates de validation');
    } else {
        const vm = persona.validationMetadata;
        
        if (!vm.templateName) missingFields.push('validationMetadata.templateName');
        if (vm.validationScore === undefined) missingFields.push('validationMetadata.validationScore');
        if (!vm.validatedAt) missingFields.push('validationMetadata.validatedAt');
        
        if (vm.validationDetails.length === 0) {
            warnings.push('Aucun détail de validation disponible');
        }
        if (vm.validationScore < 70) {
            suggestions.push('Score de validation faible - considérer la re-validation');
        }
    }

    // Validate cultural data
    const culturalRichness = calculateCulturalRichness(persona.culturalData);
    if (culturalRichness === 'low') {
        suggestions.push('Données culturelles limitées - considérer l\'enrichissement');
    }

    return {
        isComplete: missingFields.length === 0,
        missingFields,
        warnings,
        suggestions,
        completenessScore: calculateCompletenessScore(persona),
        recommendedActions: generateRecommendedActions(missingFields, warnings, suggestions)
    };
}

/**
 * Metadata validation result interface
 */
export interface MetadataValidationResult {
    isComplete: boolean;
    missingFields: string[];
    warnings: string[];
    suggestions: string[];
    completenessScore: number; // 0-100
    recommendedActions: RecommendedAction[];
}

/**
 * Recommended action for improving persona metadata
 */
export interface RecommendedAction {
    type: 'regenerate' | 'validate' | 'enrich' | 'migrate';
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    estimatedImpact: 'low' | 'medium' | 'high';
}

/**
 * Batch normalization with progress tracking and error handling
 */
export function batchNormalizePersonas(
    personas: Partial<EnrichedPersona>[],
    options: NormalizationOptions = {},
    onProgress?: (progress: number, current: number, total: number) => void
): BatchNormalizationResult {
    const startTime = Date.now();
    const results: EnrichedPersona[] = [];
    const errors: Array<{ index: number; error: string; persona?: Partial<EnrichedPersona> }> = [];

    personas.forEach((persona, index) => {
        try {
            const normalized = normalizePersona(persona, options);
            results.push(normalized);
            
            // Report progress
            if (onProgress) {
                const progress = ((index + 1) / personas.length) * 100;
                onProgress(progress, index + 1, personas.length);
            }
        } catch (error) {
            errors.push({
                index,
                error: error instanceof Error ? error.message : 'Unknown error',
                persona
            });
        }
    });

    const processingTime = Date.now() - startTime;

    return {
        successful: results,
        errors,
        totalProcessed: personas.length,
        successCount: results.length,
        errorCount: errors.length,
        processingTime,
        averageTimePerPersona: processingTime / personas.length
    };
}

/**
 * Batch normalization result interface
 */
export interface BatchNormalizationResult {
    successful: EnrichedPersona[];
    errors: Array<{ index: number; error: string; persona?: Partial<EnrichedPersona> }>;
    totalProcessed: number;
    successCount: number;
    errorCount: number;
    processingTime: number;
    averageTimePerPersona: number;
}

/**
 * Validates persona data integrity
 */
function validatePersonaIntegrity(persona: EnrichedPersona): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields validation
    if (!persona.id) errors.push('ID is required');
    if (!persona.name || persona.name.trim().length === 0) errors.push('Name is required');
    if (persona.age < 0 || persona.age > 150) errors.push('Age must be between 0 and 150');
    
    // Data consistency validation
    if (persona.qualityScore < 0 || persona.qualityScore > 100) {
        errors.push('Quality score must be between 0 and 100');
    }
    
    if (persona.validationMetadata?.validationScore !== undefined) {
        const vs = persona.validationMetadata.validationScore;
        if (vs < 0 || vs > 100) {
            errors.push('Validation score must be between 0 and 100');
        }
    }

    // Timestamp validation
    try {
        new Date(persona.createdAt);
    } catch {
        errors.push('Invalid createdAt timestamp');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

// Helper functions for normalization

function sanitizeString(value: any): string {
    if (typeof value !== 'string') return '';
    return value.trim().replace(/\s+/g, ' ');
}

function normalizeAge(age: any): number {
    const numAge = typeof age === 'number' ? age : parseInt(age, 10);
    return isNaN(numAge) ? 25 : Math.max(0, Math.min(150, numAge));
}

function normalizeScore(score: any): number {
    const numScore = typeof score === 'number' ? score : parseFloat(score);
    return isNaN(numScore) ? 0 : Math.max(0, Math.min(100, numScore));
}

function normalizeStringArray(arr: any): string[] {
    if (!Array.isArray(arr)) return [];
    return arr.filter(item => typeof item === 'string' && item.trim().length > 0)
              .map(item => item.trim());
}

function normalizeDemographics(demographics: any): any {
    return {
        income: sanitizeString(demographics?.income) || '',
        education: sanitizeString(demographics?.education) || '',
        familyStatus: sanitizeString(demographics?.familyStatus) || '',
        ...demographics
    };
}

function normalizePsychographics(psychographics: any): any {
    return {
        personality: normalizeStringArray(psychographics?.personality),
        values: normalizeStringArray(psychographics?.values),
        interests: normalizeStringArray(psychographics?.interests),
        lifestyle: sanitizeString(psychographics?.lifestyle) || '',
        ...psychographics
    };
}

function normalizeMarketingInsights(insights: any): any {
    return {
        preferredChannels: normalizeStringArray(insights?.preferredChannels),
        messagingTone: sanitizeString(insights?.messagingTone) || '',
        buyingBehavior: sanitizeString(insights?.buyingBehavior) || '',
        ...insights
    };
}

function normalizeCulturalData(culturalData: any): CulturalData {
    if (!culturalData || typeof culturalData !== 'object') {
        return getEmptyCulturalData();
    }

    const normalized: CulturalData = {
        music: normalizeStringArray(culturalData.music),
        movie: normalizeStringArray(culturalData.movie),
        tv: normalizeStringArray(culturalData.tv),
        book: normalizeStringArray(culturalData.book),
        brand: normalizeStringArray(culturalData.brand),
        restaurant: normalizeStringArray(culturalData.restaurant),
        travel: normalizeStringArray(culturalData.travel),
        fashion: normalizeStringArray(culturalData.fashion),
        beauty: normalizeStringArray(culturalData.beauty),
        food: normalizeStringArray(culturalData.food),
        socialMedia: normalizeStringArray(culturalData.socialMedia),
        podcasts: normalizeStringArray(culturalData.podcasts),
        videoGames: normalizeStringArray(culturalData.videoGames),
        influencers: normalizeStringArray(culturalData.influencers)
    };

    return normalized;
}

function getEmptyCulturalData(): CulturalData {
    return {
        music: [],
        movie: [],
        tv: [],
        book: [],
        brand: [],
        restaurant: [],
        travel: [],
        fashion: [],
        beauty: [],
        food: [],
        socialMedia: [],
        podcasts: [],
        videoGames: [],
        influencers: []
    };
}

function generatePersonaId(): string {
    return `persona_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getQualityLevel(qualityScore: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (qualityScore >= 90) return 'excellent';
    if (qualityScore >= 75) return 'good';
    if (qualityScore >= 60) return 'fair';
    return 'poor';
}

function calculateCompletenessScore(persona: EnrichedPersona): number {
    let score = 0;
    const maxScore = 100;

    // Base persona data (40 points)
    if (persona.id) score += 5;
    if (persona.name) score += 5;
    if (persona.age > 0) score += 5;
    if (persona.occupation) score += 5;
    if (persona.location) score += 5;
    if (persona.bio) score += 5;
    if (persona.painPoints?.length > 0) score += 5;
    if (persona.goals?.length > 0) score += 5;

    // Generation metadata (30 points)
    if (persona.generationMetadata) {
        score += 10;
        if (persona.generationMetadata.source) score += 5;
        if (persona.generationMetadata.method) score += 5;
        if (persona.generationMetadata.generatedAt) score += 5;
        if (persona.generationMetadata.processingTime > 0) score += 5;
    }

    // Validation metadata (20 points)
    if (persona.validationMetadata) {
        score += 10;
        if (persona.validationMetadata.validationScore > 0) score += 5;
        if (persona.validationMetadata.validationDetails?.length > 0) score += 5;
    }

    // Cultural data richness (10 points)
    const richness = calculateCulturalRichness(persona.culturalData);
    if (richness === 'high') score += 10;
    else if (richness === 'medium') score += 7;
    else if (richness === 'low') score += 3;

    return Math.min(score, maxScore);
}

function generateRecommendedActions(
    missingFields: string[], 
    warnings: string[], 
    suggestions: string[]
): RecommendedAction[] {
    const actions: RecommendedAction[] = [];

    // Critical missing fields
    if (missingFields.includes('generationMetadata')) {
        actions.push({
            type: 'regenerate',
            priority: 'high',
            description: 'Régénérer le persona avec le nouveau système pour obtenir les métadonnées complètes',
            estimatedImpact: 'high'
        });
    }

    if (missingFields.includes('validationMetadata')) {
        actions.push({
            type: 'validate',
            priority: 'medium',
            description: 'Valider le persona avec les templates de validation',
            estimatedImpact: 'medium'
        });
    }

    // Warnings-based actions
    if (warnings.some(w => w.includes('validation'))) {
        actions.push({
            type: 'validate',
            priority: 'medium',
            description: 'Re-valider le persona pour améliorer la qualité des métadonnées',
            estimatedImpact: 'medium'
        });
    }

    // Suggestions-based actions
    if (suggestions.some(s => s.includes('migration'))) {
        actions.push({
            type: 'migrate',
            priority: 'low',
            description: 'Migrer vers Qloo First pour de meilleures données culturelles',
            estimatedImpact: 'high'
        });
    }

    if (suggestions.some(s => s.includes('enrichissement'))) {
        actions.push({
            type: 'enrich',
            priority: 'low',
            description: 'Enrichir les données culturelles du persona',
            estimatedImpact: 'medium'
        });
    }

    return actions;
}