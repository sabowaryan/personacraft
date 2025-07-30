import { NextRequest, NextResponse } from 'next/server'
const { prisma } = await import('@/lib/prisma');

import { getAuthenticatedUser } from '@/lib/auth-utils';
import { normalizePersona, calculateCulturalRichness } from '@/lib/utils/persona-normalization';
import { 
  EnrichedPersona, 
  PersonaDetailResponse,
  CulturalDataVisualization,
  GenerationMetadata
} from '@/types/enhanced-persona';
import { CulturalData } from '@/types';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const resolvedParams = await params;
        const { searchParams } = new URL(request.url);
        const includeComparison = searchParams.get('includeComparison') === 'true';
        const includeRelated = searchParams.get('includeRelated') === 'true';

        // Fetch the main persona
        const rawPersona = await prisma.persona.findFirst({
            where: {
                id: resolvedParams.id,
                userId: user.id
            }
        });

        if (!rawPersona) {
            return NextResponse.json({ error: 'Persona non trouvé' }, { status: 404 })
        }

        // Normalize the persona with full metadata
        const persona = normalizePersona(rawPersona as any, { 
            validateCulturalData: true,
            strictValidation: false 
        });

        // Build the response object with enhanced cultural data visualization
        const response: PersonaDetailResponse = {
            persona: {
                ...persona,
                // Add enhanced cultural data visualization for requirement 2.1 and 2.2
                culturalDataVisualization: organizeCulturalDataForDisplay(persona.culturalData, persona.generationMetadata),
                // Add legacy status indicator for requirement 5.3
                legacyStatus: determineLegacyStatus(persona)
            }
        };

        // Add related personas if requested
        if (includeRelated) {
            response.relatedPersonas = await findRelatedPersonas(user.id, persona);
        }

        // Add comparison data if requested
        if (includeComparison) {
            response.comparisonData = await calculateComparisonData(user.id, persona);
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error('Erreur lors de la récupération du persona:', error)
        
        // Handle specific error types
        if (error instanceof Error && error.message === 'Auth timeout') {
            return NextResponse.json(
                { error: 'Timeout d\'authentification' },
                { status: 408 }
            );
        }
        
        return NextResponse.json(
            { error: 'Erreur lors de la récupération du persona' },
            { status: 500 }
        )
    }
}

/**
 * Find related personas based on generation method and characteristics
 */
async function findRelatedPersonas(userId: string, targetPersona: EnrichedPersona): Promise<EnrichedPersona[]> {
    const generationSource = targetPersona.generationMetadata?.source;
    const templateUsed = targetPersona.templateUsed;
    const ageRange = [targetPersona.age - 10, targetPersona.age + 10];

    // Build OR conditions for similarity matching
    const orConditions: any[] = [];

    // Same generation method (if available)
    if (generationSource) {
        orConditions.push({
            generationMetadata: {
                path: ['source'],
                equals: generationSource
            }
        });
    }

    // Same template (if available)
    if (templateUsed && templateUsed !== 'legacy') {
        orConditions.push({ templateUsed });
    }

    // Similar age range
    orConditions.push({
        age: {
            gte: ageRange[0],
            lte: ageRange[1]
        }
    });

    // Same location
    if (targetPersona.location && targetPersona.location !== 'Non spécifié') {
        orConditions.push({ location: targetPersona.location });
    }

    // Same occupation
    if (targetPersona.occupation && targetPersona.occupation !== 'Non spécifié') {
        orConditions.push({ occupation: targetPersona.occupation });
    }

    // If no conditions, return empty array
    if (orConditions.length === 0) {
        return [];
    }

    // Find personas with similar characteristics
    const rawRelatedPersonas = await prisma.persona.findMany({
        where: {
            userId,
            id: { not: targetPersona.id }, // Exclude the target persona
            OR: orConditions
        },
        take: 8, // Get more to allow for better filtering
        orderBy: [
            { qualityScore: 'desc' },
            { createdAt: 'desc' }
        ]
    });

    // Normalize related personas
    const normalizedPersonas = rawRelatedPersonas.map(persona => 
        normalizePersona(persona as any, { validateCulturalData: true })
    );

    // Score and sort by relevance with enhanced comparison logic
    const scoredPersonas = normalizedPersonas.map(persona => {
        let relevanceScore = 0;

        // Same generation method gets highest score (for comparison purposes)
        if (persona.generationMetadata?.source === generationSource) {
            relevanceScore += 10;
        } else if (generationSource && persona.generationMetadata?.source) {
            // Different generation methods are also valuable for comparison
            relevanceScore += 7;
        }

        // Same template gets high score
        if (persona.templateUsed === templateUsed && templateUsed !== 'legacy') {
            relevanceScore += 8;
        }

        // Cultural data richness comparison bonus
        const targetRichness = targetPersona.culturalRichness || calculateCulturalRichness(targetPersona.culturalData);
        const personaRichness = persona.culturalRichness || calculateCulturalRichness(persona.culturalData);
        if (targetRichness === personaRichness) {
            relevanceScore += 5;
        }

        // Validation score similarity
        const targetValidationScore = targetPersona.validationMetadata?.validationScore || 0;
        const personaValidationScore = persona.validationMetadata?.validationScore || 0;
        const validationDiff = Math.abs(targetValidationScore - personaValidationScore);
        relevanceScore += Math.max(0, 5 - validationDiff / 20);

        // Age similarity (closer age = higher score)
        const ageDiff = Math.abs(persona.age - targetPersona.age);
        relevanceScore += Math.max(0, 5 - ageDiff / 2);

        // Same location gets medium score
        if (persona.location === targetPersona.location && targetPersona.location !== 'Non spécifié') {
            relevanceScore += 6;
        }

        // Same occupation gets medium score
        if (persona.occupation === targetPersona.occupation && targetPersona.occupation !== 'Non spécifié') {
            relevanceScore += 6;
        }

        // Quality score bonus
        relevanceScore += (persona.qualityScore || 0) / 20;

        // Legacy vs modern comparison bonus (useful for showing improvement)
        if (targetPersona.isLegacy !== persona.isLegacy) {
            relevanceScore += 4; // Different legacy status makes for good comparison
        }

        return { persona, relevanceScore };
    });

    // Sort by relevance and return top 5
    return scoredPersonas
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 5)
        .map(item => item.persona);
}

/**
 * Calculate comprehensive comparison data for the persona
 */
async function calculateComparisonData(userId: string, targetPersona: EnrichedPersona) {
    // Get all user's personas for comparison
    const allRawPersonas = await prisma.persona.findMany({
        where: { userId },
        select: {
            id: true,
            qualityScore: true,
            validationMetadata: true,
            generationMetadata: true,
            templateUsed: true,
            culturalData: true,
            culturalDataSource: true,
            processingTime: true,
            createdAt: true,
            age: true,
            location: true,
            occupation: true
        }
    });

    const allPersonas = allRawPersonas.map(persona => 
        normalizePersona(persona as any, { validateCulturalData: true })
    );

    // Filter out the target persona from comparisons
    const otherPersonas = allPersonas.filter(p => p.id !== targetPersona.id);
    const totalPersonas = otherPersonas.length;

    if (totalPersonas === 0) {
        return {
            averageScores: {
                quality: 0,
                validation: 0,
                culturalRichness: 1
            },
            sourceDistribution: {},
            templateUsageStats: {},
            targetPersonaRanking: {
                qualityRank: 1,
                validationRank: 1,
                culturalRichnessRank: 1,
                totalPersonas: 1
            },
            similarPersonasCount: 0,
            improvementSuggestions: [],
            migrationRecommendations: []
        };
    }

    // Calculate average scores
    const averageQuality = otherPersonas.reduce((sum, p) => sum + (p.qualityScore || 0), 0) / totalPersonas;

    const personasWithValidation = otherPersonas.filter(p => p.validationMetadata?.validationScore !== undefined);
    const averageValidation = personasWithValidation.length > 0 ?
        personasWithValidation.reduce((sum, p) => sum + (p.validationMetadata?.validationScore || 0), 0) / personasWithValidation.length : 0;

    // Calculate cultural richness scores
    const culturalRichnessScores = otherPersonas.map(p => {
        const richness = p.culturalRichness || calculateCulturalRichness(p.culturalData);
        return richness === 'high' ? 3 : richness === 'medium' ? 2 : 1;
    });
    const averageCulturalRichness = culturalRichnessScores.length > 0 ?
        culturalRichnessScores.reduce((sum, score) => sum + score, 0) / culturalRichnessScores.length : 1;

    // Calculate source distribution
    const sourceDistribution: Record<string, number> = {};
    allPersonas.forEach(persona => {
        const source = persona.generationMetadata?.source || 'unknown';
        sourceDistribution[source] = (sourceDistribution[source] || 0) + 1;
    });

    // Calculate template usage stats
    const templateUsageStats: Record<string, number> = {};
    allPersonas.forEach(persona => {
        const template = persona.templateUsed || 'unknown';
        templateUsageStats[template] = (templateUsageStats[template] || 0) + 1;
    });

    // Calculate target persona ranking
    const targetQualityScore = targetPersona.qualityScore || 0;
    const targetValidationScore = targetPersona.validationMetadata?.validationScore || 0;
    const targetCulturalRichness = targetPersona.culturalRichness || calculateCulturalRichness(targetPersona.culturalData);
    const targetCulturalScore = targetCulturalRichness === 'high' ? 3 : targetCulturalRichness === 'medium' ? 2 : 1;

    const qualityRank = otherPersonas.filter(p => (p.qualityScore || 0) > targetQualityScore).length + 1;
    const validationRank = personasWithValidation.filter(p => 
        (p.validationMetadata?.validationScore || 0) > targetValidationScore
    ).length + 1;
    const culturalRichnessRank = otherPersonas.filter(p => {
        const richness = p.culturalRichness || calculateCulturalRichness(p.culturalData);
        const score = richness === 'high' ? 3 : richness === 'medium' ? 2 : 1;
        return score > targetCulturalScore;
    }).length + 1;

    // Count similar personas (same generation method, similar age, etc.)
    const similarPersonasCount = otherPersonas.filter(p => {
        const sameSource = p.generationMetadata?.source === targetPersona.generationMetadata?.source;
        const similarAge = Math.abs(p.age - targetPersona.age) <= 10;
        const sameLocation = p.location === targetPersona.location;
        const sameOccupation = p.occupation === targetPersona.occupation;
        
        return sameSource || similarAge || sameLocation || sameOccupation;
    }).length;

    // Generate improvement suggestions with enhanced migration guidance
    const improvementSuggestions = generateImprovementSuggestions(
        targetPersona, 
        averageQuality, 
        averageValidation, 
        averageCulturalRichness,
        sourceDistribution
    );

    // Add specific migration recommendations based on comparison
    const migrationRecommendations = generateMigrationRecommendations(
        targetPersona,
        otherPersonas,
        averageQuality,
        averageValidation
    );

    return {
        averageScores: {
            quality: averageQuality,
            validation: averageValidation,
            culturalRichness: averageCulturalRichness
        },
        sourceDistribution,
        templateUsageStats,
        targetPersonaRanking: {
            qualityRank,
            validationRank,
            culturalRichnessRank,
            totalPersonas: totalPersonas + 1 // Include target persona in total
        },
        similarPersonasCount,
        improvementSuggestions,
        migrationRecommendations
    };
}

/**
 * Generate improvement suggestions based on comparison data
 */
function generateImprovementSuggestions(
    targetPersona: EnrichedPersona,
    averageQuality: number,
    averageValidation: number,
    averageCulturalRichness: number,
    sourceDistribution: Record<string, number>
): string[] {
    const suggestions: string[] = [];
    const targetQuality = targetPersona.qualityScore || 0;
    const targetValidation = targetPersona.validationMetadata?.validationScore || 0;
    const targetCulturalRichness = targetPersona.culturalRichness || calculateCulturalRichness(targetPersona.culturalData);
    const targetCulturalScore = targetCulturalRichness === 'high' ? 3 : targetCulturalRichness === 'medium' ? 2 : 1;

    // Quality score suggestions
    if (targetQuality < averageQuality - 10) {
        suggestions.push('Le score de qualité est inférieur à la moyenne - considérer la régénération');
    }

    // Validation score suggestions
    if (targetValidation < averageValidation - 10) {
        suggestions.push('Le score de validation est faible - utiliser un template de validation plus récent');
    }

    // Cultural richness suggestions
    if (targetCulturalScore < averageCulturalRichness - 0.5) {
        suggestions.push('Les données culturelles pourraient être enrichies avec plus de catégories');
    }

    // Generation method suggestions
    const isLegacy = targetPersona.generationMetadata?.source === 'legacy-fallback' || !targetPersona.generationMetadata;
    const qlooFirstCount = sourceDistribution['qloo-first'] || 0;
    const totalCount = Object.values(sourceDistribution).reduce((sum, count) => sum + count, 0);
    
    if (isLegacy && qlooFirstCount > 0) {
        suggestions.push('Migrer vers Qloo First pour de meilleures données culturelles et métadonnées');
    }

    // Template suggestions
    if (!targetPersona.templateUsed || targetPersona.templateUsed === 'legacy') {
        suggestions.push('Utiliser un template de génération plus récent pour améliorer la structure');
    }

    // Processing time suggestions
    if (targetPersona.processingTime && targetPersona.processingTime > 30000) {
        suggestions.push('Temps de traitement élevé - optimiser les contraintes de génération');
    }

    // Metadata completeness suggestions
    if (!targetPersona.generationMetadata || !targetPersona.validationMetadata) {
        suggestions.push('Métadonnées incomplètes - régénérer pour obtenir toutes les informations');
    }

    return suggestions;
}

/**
 * Organize cultural data for enhanced display (Requirement 2.1 and 2.2)
 * Creates a structured visualization object for cultural data categories
 */
function organizeCulturalDataForDisplay(
    culturalData?: CulturalData, 
    generationMetadata?: GenerationMetadata
): CulturalDataVisualization {
    if (!culturalData) {
        return {
            categories: {},
            richness: 'low',
            sourceIndicator: 'unknown',
            totalItems: 0,
            categoriesWithData: 0
        };
    }

    const categories: Record<string, { items: string[]; source: string; confidence: number; isEmpty: boolean }> = {};
    let totalItems = 0;
    let categoriesWithData = 0;

    // Define category priorities and confidence levels based on generation method
    const categoryPriorities = {
        music: 1,
        brands: 2,
        restaurants: 3,
        movies: 4,
        tv: 5,
        food: 6,
        socialMedia: 7,
        fashion: 8,
        travel: 9,
        books: 10,
        beauty: 11,
        podcasts: 12,
        videoGames: 13,
        influencers: 14
    };

    // Determine base confidence based on generation source
    const baseConfidence = generationMetadata?.source === 'qloo-first' ? 0.9 : 0.6;
    const sourceIndicator = generationMetadata?.qlooDataUsed ? 'qloo' : 
                           generationMetadata?.source === 'legacy-fallback' ? 'fallback' : 'unknown';

    // Process each cultural data category
    Object.entries(culturalData).forEach(([category, items]) => {
        const itemArray = Array.isArray(items) ? items : [];
        const isEmpty = itemArray.length === 0;
        
        if (!isEmpty) {
            categoriesWithData++;
            totalItems += itemArray.length;
        }

        // Calculate confidence based on category priority and data richness
        const categoryPriority = categoryPriorities[category as keyof typeof categoryPriorities] || 15;
        const itemCountBonus = Math.min(itemArray.length * 0.05, 0.2);
        const priorityBonus = (16 - categoryPriority) * 0.01;
        const confidence = Math.min(baseConfidence + itemCountBonus + priorityBonus, 1.0);

        categories[category] = {
            items: itemArray,
            source: sourceIndicator,
            confidence: Math.round(confidence * 100) / 100,
            isEmpty
        };
    });

    // Calculate overall richness
    const richness = calculateCulturalRichness(culturalData);

    // Determine mixed source indicator if needed
    const finalSourceIndicator = generationMetadata?.qlooDataUsed && generationMetadata?.fallbackReason ? 
        'mixed' : sourceIndicator;

    return {
        categories,
        richness,
        sourceIndicator: finalSourceIndicator,
        totalItems,
        categoriesWithData
    };
}

/**
 * Determine legacy status for clear indication (Requirement 5.3)
 * Provides detailed legacy status information for UI display
 */
function determineLegacyStatus(persona: EnrichedPersona): {
    isLegacy: boolean;
    legacyType: 'full-legacy' | 'partial-metadata' | 'modern' | 'needs-update';
    indicator: string;
    description: string;
    migrationSuggestion?: string;
    qualityImpact: 'none' | 'low' | 'medium' | 'high';
} {
    const hasGenerationMetadata = !!persona.generationMetadata;
    const hasValidationMetadata = !!persona.validationMetadata;
    const isQlooFirst = persona.generationMetadata?.source === 'qloo-first';
    const hasRecentTemplate = persona.templateUsed && persona.templateUsed !== 'legacy';

    // Determine legacy type
    let legacyType: 'full-legacy' | 'partial-metadata' | 'modern' | 'needs-update';
    let indicator: string;
    let description: string;
    let migrationSuggestion: string | undefined;
    let qualityImpact: 'none' | 'low' | 'medium' | 'high';

    if (!hasGenerationMetadata && !hasValidationMetadata) {
        // Full legacy persona
        legacyType = 'full-legacy';
        indicator = '🔄 Persona Legacy';
        description = 'Ce persona a été créé avec l\'ancien système et ne contient pas de métadonnées enrichies.';
        migrationSuggestion = 'Régénérer avec Qloo First pour obtenir des données culturelles enrichies et des métadonnées complètes.';
        qualityImpact = 'high';
    } else if (hasGenerationMetadata && !isQlooFirst) {
        // Has metadata but not Qloo First
        legacyType = 'partial-metadata';
        indicator = '⚡ Génération Standard';
        description = 'Ce persona contient des métadonnées mais n\'utilise pas les dernières améliorations Qloo First.';
        migrationSuggestion = 'Migrer vers Qloo First pour de meilleures données culturelles et une validation améliorée.';
        qualityImpact = 'medium';
    } else if (isQlooFirst && !hasRecentTemplate) {
        // Qloo First but old template
        legacyType = 'needs-update';
        indicator = '🔧 Template Ancien';
        description = 'Ce persona utilise Qloo First mais avec un template de génération ancien.';
        migrationSuggestion = 'Régénérer avec un template plus récent pour améliorer la structure et la validation.';
        qualityImpact = 'low';
    } else {
        // Modern persona
        legacyType = 'modern';
        indicator = '✨ Persona Moderne';
        description = 'Ce persona utilise les dernières technologies de génération avec métadonnées complètes.';
        qualityImpact = 'none';
    }

    return {
        isLegacy: legacyType !== 'modern',
        legacyType,
        indicator,
        description,
        migrationSuggestion,
        qualityImpact
    };
}

/**
 * Generate specific migration recommendations based on comparison with other personas
 * Provides actionable guidance for improving persona quality
 */
function generateMigrationRecommendations(
    targetPersona: EnrichedPersona,
    otherPersonas: EnrichedPersona[],
    averageQuality: number,
    averageValidation: number
): Array<{
    type: 'regenerate' | 'validate' | 'enrich' | 'template-update';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    expectedImprovement: {
        qualityScore?: number;
        validationScore?: number;
        culturalRichness?: 'low' | 'medium' | 'high';
    };
    comparisonBasis: string;
}> {
    const recommendations: Array<{
        type: 'regenerate' | 'validate' | 'enrich' | 'template-update';
        priority: 'low' | 'medium' | 'high' | 'critical';
        title: string;
        description: string;
        expectedImprovement: {
            qualityScore?: number;
            validationScore?: number;
            culturalRichness?: 'low' | 'medium' | 'high';
        };
        comparisonBasis: string;
    }> = [];

    const targetQuality = targetPersona.qualityScore || 0;
    const targetValidation = targetPersona.validationMetadata?.validationScore || 0;
    const targetRichness = targetPersona.culturalRichness || calculateCulturalRichness(targetPersona.culturalData);
    const isLegacy = targetPersona.isLegacy;

    // Find similar personas with better scores for comparison
    const betterQualityPersonas = otherPersonas.filter(p => (p.qualityScore || 0) > targetQuality + 10);
    const betterValidationPersonas = otherPersonas.filter(p => 
        (p.validationMetadata?.validationScore || 0) > targetValidation + 10
    );
    const betterCulturalPersonas = otherPersonas.filter(p => {
        const pRichness = p.culturalRichness || calculateCulturalRichness(p.culturalData);
        return (pRichness === 'high' && targetRichness !== 'high') || 
               (pRichness === 'medium' && targetRichness === 'low');
    });

    // Legacy persona recommendations
    if (isLegacy && betterQualityPersonas.length > 0) {
        const bestExample = betterQualityPersonas.reduce((best, current) => 
            (current.qualityScore || 0) > (best.qualityScore || 0) ? current : best
        );
        
        recommendations.push({
            type: 'regenerate',
            priority: 'high',
            title: 'Migration vers Qloo First recommandée',
            description: `Vos personas modernes ont un score de qualité moyen de ${Math.round(averageQuality)}%, soit ${Math.round(averageQuality - targetQuality)}% de plus que ce persona legacy.`,
            expectedImprovement: {
                qualityScore: Math.round(averageQuality - targetQuality),
                culturalRichness: 'high'
            },
            comparisonBasis: `Basé sur ${betterQualityPersonas.length} personas similaires avec de meilleurs scores`
        });
    }

    // Validation improvement recommendations
    if (betterValidationPersonas.length > 0 && targetValidation < averageValidation - 10) {
        const bestValidationExample = betterValidationPersonas.reduce((best, current) => 
            (current.validationMetadata?.validationScore || 0) > (best.validationMetadata?.validationScore || 0) ? current : best
        );

        recommendations.push({
            type: 'validate',
            priority: 'medium',
            title: 'Amélioration de la validation possible',
            description: `Des personas similaires atteignent un score de validation de ${bestValidationExample.validationMetadata?.validationScore}% avec le template "${bestValidationExample.templateUsed}".`,
            expectedImprovement: {
                validationScore: Math.round((bestValidationExample.validationMetadata?.validationScore || 0) - targetValidation)
            },
            comparisonBasis: `Basé sur ${betterValidationPersonas.length} personas avec de meilleurs scores de validation`
        });
    }

    // Cultural data enrichment recommendations
    if (betterCulturalPersonas.length > 0) {
        const qlooFirstPersonas = betterCulturalPersonas.filter(p => 
            p.generationMetadata?.source === 'qloo-first'
        );

        if (qlooFirstPersonas.length > 0) {
            recommendations.push({
                type: 'enrich',
                priority: 'medium',
                title: 'Enrichissement des données culturelles',
                description: `${qlooFirstPersonas.length} personas similaires générés avec Qloo First ont des données culturelles plus riches.`,
                expectedImprovement: {
                    culturalRichness: 'high'
                },
                comparisonBasis: `Basé sur des personas Qloo First avec des profils similaires`
            });
        }
    }

    // Template update recommendations
    const modernTemplatePersonas = otherPersonas.filter(p => 
        p.templateUsed && p.templateUsed !== 'legacy' && p.templateUsed !== targetPersona.templateUsed
    );

    if (modernTemplatePersonas.length > 0 && (!targetPersona.templateUsed || targetPersona.templateUsed === 'legacy')) {
        const templateStats = modernTemplatePersonas.reduce((stats, persona) => {
            const template = persona.templateUsed || 'unknown';
            if (!stats[template]) {
                stats[template] = { count: 0, avgQuality: 0, totalQuality: 0 };
            }
            stats[template].count++;
            stats[template].totalQuality += persona.qualityScore || 0;
            stats[template].avgQuality = stats[template].totalQuality / stats[template].count;
            return stats;
        }, {} as Record<string, { count: number; avgQuality: number; totalQuality: number }>);

        const bestTemplate = Object.entries(templateStats).reduce((best, [template, stats]) => 
            stats.avgQuality > best.avgQuality ? { template, ...stats } : best
        , { template: '', avgQuality: 0, count: 0, totalQuality: 0 });

        if (bestTemplate.avgQuality > targetQuality + 5) {
            recommendations.push({
                type: 'template-update',
                priority: 'low',
                title: 'Template de génération plus récent disponible',
                description: `Le template "${bestTemplate.template}" utilisé par ${bestTemplate.count} personas similaires donne un score moyen de ${Math.round(bestTemplate.avgQuality)}%.`,
                expectedImprovement: {
                    qualityScore: Math.round(bestTemplate.avgQuality - targetQuality)
                },
                comparisonBasis: `Basé sur ${bestTemplate.count} personas utilisant des templates plus récents`
            });
        }
    }

    // Sort recommendations by priority
    const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
    return recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const resolvedParams = await params;
        const body = await request.json()
        const {
            name,
            age,
            occupation,
            location,
            bio,
            quote,
            demographics,
            psychographics,
            culturalData,
            painPoints,
            goals,
            marketingInsights,
            qualityScore,
            // Enhanced metadata fields
            generationMetadata,
            validationMetadata,
            culturalDataSource,
            templateUsed,
            processingTime
        } = body

        // Check if persona exists and belongs to user
        const existingPersona = await prisma.persona.findFirst({
            where: {
                id: resolvedParams.id,
                userId: user.id
            }
        });

        if (!existingPersona) {
            return NextResponse.json({ error: 'Persona non trouvé' }, { status: 404 })
        }

        // Prepare update data, preserving existing metadata if not provided
        const updateData: any = {
            name,
            age,
            occupation,
            location,
            bio,
            quote,
            demographics,
            psychographics,
            culturalData,
            painPoints,
            goals,
            marketingInsights,
            qualityScore
        };

        // Only update metadata fields if they are provided
        if (generationMetadata !== undefined) {
            updateData.generationMetadata = generationMetadata;
        }
        if (validationMetadata !== undefined) {
            updateData.validationMetadata = validationMetadata;
        }
        if (culturalDataSource !== undefined) {
            updateData.culturalDataSource = culturalDataSource;
        }
        if (templateUsed !== undefined) {
            updateData.templateUsed = templateUsed;
        }
        if (processingTime !== undefined) {
            updateData.processingTime = processingTime;
        }

        // Update the persona
        await prisma.persona.update({
            where: { id: resolvedParams.id },
            data: updateData
        });

        // Fetch the updated persona
        const updatedRawPersona = await prisma.persona.findUnique({
            where: { id: resolvedParams.id }
        });

        if (!updatedRawPersona) {
            return NextResponse.json({ error: 'Erreur lors de la récupération du persona mis à jour' }, { status: 500 })
        }

        // Normalize the updated persona before returning
        const enrichedPersona = normalizePersona(updatedRawPersona as any, { 
            validateCulturalData: true,
            strictValidation: false 
        });

        return NextResponse.json(enrichedPersona)
    } catch (error) {
        console.error('Erreur lors de la mise à jour du persona:', error)
        
        // Handle specific error types
        if (error instanceof Error && error.message === 'Auth timeout') {
            return NextResponse.json(
                { error: 'Timeout d\'authentification' },
                { status: 408 }
            );
        }
        
        return NextResponse.json(
            { error: 'Erreur lors de la mise à jour du persona' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const resolvedParams = await params;
        const persona = await prisma.persona.deleteMany({
            where: {
                id: resolvedParams.id,
                userId: user.id
            }
        })

        if (persona.count === 0) {
            return NextResponse.json({ error: 'Persona non trouvé' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Persona supprimé avec succès' })
    } catch (error) {
        console.error('Erreur lors de la suppression du persona:', error)
        
        // Handle specific error types
        if (error instanceof Error && error.message === 'Auth timeout') {
            return NextResponse.json(
                { error: 'Timeout d\'authentification' },
                { status: 408 }
            );
        }
        
        return NextResponse.json(
            { error: 'Erreur lors de la suppression du persona' },
            { status: 500 }
        )
    }
}