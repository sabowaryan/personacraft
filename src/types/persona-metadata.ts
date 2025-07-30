// Consolidated persona metadata types for enhanced UI functionality

import { Persona } from '@/types';

/**
 * Generation metadata tracking how a persona was created
 */
export interface GenerationMetadata {
    source: 'qloo-first' | 'legacy-fallback';
    method: string;
    culturalConstraintsUsed: string[];
    processingTime: number;
    qlooDataUsed: boolean;
    templateUsed?: string;
    fallbackReason?: string;
    cacheHitRate?: number;
    generatedAt: string;
    qlooApiCallsCount?: number;
    retryCount?: number;
}

/**
 * Validation metadata from template validation system
 */
export interface ValidationMetadata {
    templateName: string;
    validationScore: number;
    validationDetails: ValidationDetail[];
    failedRules: string[];
    passedRules: string[];
    validationTime: number;
    validatedAt: string;
}

/**
 * Individual validation rule result
 */
export interface ValidationDetail {
    rule: string;
    passed: boolean;
    score: number;
    message: string;
    category: 'format' | 'content' | 'cultural' | 'demographic';
    severity?: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Enhanced persona interface extending the base Persona with metadata
 * This matches the database schema with the new metadata columns
 */
export interface EnrichedPersona extends Persona {
    // New metadata columns from database schema
    generationMetadata?: GenerationMetadata;
    validationMetadata?: ValidationMetadata;
    culturalDataSource?: string;
    templateUsed?: string;
    processingTime?: number;
}

/**
 * Database persona model matching Prisma schema
 */
export interface PersonaDbModel {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    age: number;
    culturalData: any; // JSON
    demographics: any; // JSON
    goals: string[];
    location: string;
    marketingInsights: any; // JSON
    occupation: string;
    painPoints: string[];
    psychographics: any; // JSON
    qualityScore: number;
    userId: string;
    bio?: string;
    metadata?: any; // JSON - legacy metadata field
    quote?: string;

    // Enhanced metadata columns
    generationMetadata?: any; // JSONB
    validationMetadata?: any; // JSONB
    culturalDataSource?: string;
    templateUsed?: string;
    processingTime?: number;
}

/**
 * Utility function to normalize personas for backward compatibility
 */
export function normalizePersona(persona: Partial<EnrichedPersona>): EnrichedPersona {
    return {
        ...persona,
        generationMetadata: persona.generationMetadata || {
            source: 'legacy-fallback',
            method: 'unknown',
            culturalConstraintsUsed: [],
            processingTime: persona.processingTime || 0,
            qlooDataUsed: false,
            generatedAt: persona.createdAt || new Date().toISOString()
        },
        validationMetadata: persona.validationMetadata || {
            templateName: 'legacy',
            validationScore: persona.qualityScore || 0,
            validationDetails: [],
            failedRules: [],
            passedRules: [],
            validationTime: 0,
            validatedAt: persona.createdAt || new Date().toISOString()
        },
        culturalDataSource: persona.culturalDataSource || 'unknown',
        templateUsed: persona.templateUsed || 'legacy',
        processingTime: persona.processingTime || 0
    } as EnrichedPersona;
}

/**
 * Calculate cultural data richness level
 */
export function calculateCulturalRichness(culturalData: any): 'low' | 'medium' | 'high' {
    if (!culturalData) return 'low';

    const totalItems = Object.values(culturalData).reduce((acc: number, items: any) => {
        if (Array.isArray(items)) {
            return acc + items.length;
        }
        return acc;
    }, 0);

    if (totalItems > 50) return 'high';
    if (totalItems > 20) return 'medium';
    return 'low';
}

/**
 * Enhanced persona list response with aggregated metadata
 */
export interface PersonaListResponse {
    personas: EnrichedPersona[];
    metadata: {
        total: number;
        qlooFirstCount: number;
        legacyCount: number;
        averageValidationScore: number;
        averageProcessingTime: number;
    };
    filters: {
        availableSources: string[];
        validationScoreRange: [number, number];
        templatesUsed: string[];
    };
}

/**
 * Enhanced persona detail response with comparison data
 */
export interface PersonaDetailResponse {
    persona: EnrichedPersona;
    relatedPersonas?: EnrichedPersona[];
    comparisonData?: {
        averageScores: {
            quality: number;
            validation: number;
            culturalRichness: number;
        };
        sourceDistribution: Record<string, number>;
    };
}

/**
 * Extended filters for enhanced persona list
 */
export interface EnhancedPersonaFilters {
    ageRange?: [number, number];
    occupation?: string[];
    location?: string[];
    qualityScore?: [number, number];
    dateRange?: [string, string];
    generationSource?: ('qloo-first' | 'legacy-fallback')[];
    validationScore?: [number, number];
    culturalDataRichness?: 'low' | 'medium' | 'high';
    templateUsed?: string[];
    culturalDataSource?: string[];
}

/**
 * Extended sort options for enhanced persona list
 */
export interface EnhancedSortOptions {
    field: keyof EnrichedPersona | 'validationScore' | 'culturalRichness' | 'processingTime';
    direction: 'asc' | 'desc';
}

/**
 * Metadata badge configuration for UI display
 */
export interface MetadataBadgeConfig {
    'qloo-first': {
        bg: string;
        text: string;
        icon: string;
        label: string;
    };
    'legacy-fallback': {
        bg: string;
        text: string;
        icon: string;
        label: string;
    };
    'high-validation': {
        bg: string;
        text: string;
        icon: string;
        label: string;
    };
}

/**
 * Cultural data visualization structure
 */
export interface CulturalDataVisualization {
    categories: Record<string, {
        items: string[];
        source: string;
        confidence: number;
    }>;
    richness: 'low' | 'medium' | 'high';
    sourceIndicator: 'qloo' | 'fallback' | 'mixed';
}

/**
 * Validation score display configuration
 */
export interface ValidationScoreDisplay {
    score: number;
    level: 'excellent' | 'good' | 'fair' | 'poor';
    color: string;
    description: string;
}

/**
 * Get validation score display configuration
 */
export function getValidationScoreDisplay(score: number): ValidationScoreDisplay {
    if (score >= 90) {
        return {
            score,
            level: 'excellent',
            color: 'text-green-600',
            description: 'Excellente qualité'
        };
    } else if (score >= 75) {
        return {
            score,
            level: 'good',
            color: 'text-blue-600',
            description: 'Bonne qualité'
        };
    } else if (score >= 60) {
        return {
            score,
            level: 'fair',
            color: 'text-yellow-600',
            description: 'Qualité correcte'
        };
    } else {
        return {
            score,
            level: 'poor',
            color: 'text-red-600',
            description: 'Qualité à améliorer'
        };
    }
}

/**
 * Type guard to check if a persona has enhanced metadata
 */
export function hasEnhancedMetadata(persona: Partial<EnrichedPersona>): persona is EnrichedPersona {
    return !!(persona.generationMetadata || persona.validationMetadata);
}

/**
 * Type guard to check if a persona was generated with Qloo First
 */
export function isQlooFirstPersona(persona: EnrichedPersona): boolean {
    return persona.generationMetadata?.source === 'qloo-first';
}

/**
 * Type guard to check if a persona is legacy
 */
export function isLegacyPersona(persona: EnrichedPersona): boolean {
    return persona.generationMetadata?.source === 'legacy-fallback' || !persona.generationMetadata;
}