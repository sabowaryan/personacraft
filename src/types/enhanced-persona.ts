// Enhanced persona types with metadata interfaces for UI updates
// This file consolidates and extends persona types for the enhanced UI functionality

import { Persona, CulturalData } from '@/types';

/**
 * Generation metadata tracking how a persona was created
 * Tracks the source, method, and processing details of persona generation
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
    constraints?: {
        ageRange?: [number, number];
        location?: string;
        industry?: string;
        culturalFocus?: string[];
    };
}

/**
 * Individual validation rule result with detailed information
 */
export interface ValidationDetail {
    rule: string;
    passed: boolean;
    score: number;
    message: string;
    category: 'format' | 'content' | 'cultural' | 'demographic';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    field?: string; // Which persona field this validation applies to
    expectedValue?: any;
    actualValue?: any;
}

/**
 * Validation metadata from template validation system
 * Contains comprehensive validation results and scoring information
 */
export interface ValidationMetadata {
    templateName: string;
    validationScore: number;
    validationDetails: ValidationDetail[];
    failedRules: string[];
    passedRules: string[];
    validationTime: number;
    validatedAt: string;
    overallStatus: 'passed' | 'failed' | 'warning';
    categoryScores: {
        format: number;
        content: number;
        cultural: number;
        demographic: number;
    };
}

/**
 * Enhanced persona interface extending the base Persona with metadata
 * This is the main interface for personas with enhanced metadata support
 */
export interface EnrichedPersona extends Persona {
    // Enhanced metadata
    generationMetadata?: GenerationMetadata;
    validationMetadata?: ValidationMetadata;
    
    // Additional database fields for enhanced functionality
    culturalDataSource?: string;
    templateUsed?: string;
    processingTime?: number;
    
    // Temporary metadata for generation context
    metadata?: {
        generationMethod?: string;
        culturalDataSource?: string;
        templateUsed?: string;
        processingTime?: number;
        qlooConstraintsUsed?: string[];
        validationScore?: number;
        validationErrors?: number;
        validationWarnings?: number;
    };
    
    // Computed properties for UI display
    culturalRichness?: 'low' | 'medium' | 'high';
    qualityLevel?: 'excellent' | 'good' | 'fair' | 'poor';
    isLegacy?: boolean;
}

/**
 * Extended filters for enhanced persona list with metadata-based filtering
 */
export interface EnhancedPersonaFilters {
    // Base filters
    ageRange?: [number, number];
    occupation?: string[];
    location?: string[];
    qualityScore?: [number, number];
    dateRange?: [string, string];
    
    // Enhanced metadata filters
    generationSource?: ('qloo-first' | 'legacy-fallback')[];
    validationScore?: [number, number];
    culturalDataRichness?: ('low' | 'medium' | 'high')[];
    templateUsed?: string[];
    culturalDataSource?: string[];
    hasMetadata?: boolean;
    processingTimeRange?: [number, number];
}

/**
 * Extended sort options for enhanced persona list
 */
export interface EnhancedSortOptions {
    field: keyof EnrichedPersona | 'validationScore' | 'culturalRichness' | 'processingTime' | 'generatedAt';
    direction: 'asc' | 'desc';
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
        averageQualityScore: number;
        culturalRichnessDistribution: {
            low: number;
            medium: number;
            high: number;
        };
    };
    filters: {
        availableSources: string[];
        validationScoreRange: [number, number];
        templatesUsed: string[];
        culturalDataSources: string[];
        dateRange: [string, string];
    };
}

/**
 * Legacy status information for clear persona identification
 */
export interface LegacyStatus {
    isLegacy: boolean;
    legacyType: 'full-legacy' | 'partial-metadata' | 'modern' | 'needs-update';
    indicator: string;
    description: string;
    migrationSuggestion?: string;
    qualityImpact: 'none' | 'low' | 'medium' | 'high';
}

/**
 * Enhanced persona detail response with comparison data
 */
export interface PersonaDetailResponse {
    persona: EnrichedPersona & {
        culturalDataVisualization?: CulturalDataVisualization;
        legacyStatus?: LegacyStatus;
    };
    relatedPersonas?: EnrichedPersona[];
    comparisonData?: {
        averageScores: {
            quality: number;
            validation: number;
            culturalRichness: number;
        };
        sourceDistribution: Record<string, number>;
        templateUsageStats: Record<string, number>;
        targetPersonaRanking: {
            qualityRank: number;
            validationRank: number;
            culturalRichnessRank: number;
            totalPersonas: number;
        };
        similarPersonasCount: number;
        improvementSuggestions: string[];
        migrationRecommendations?: Array<{
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
        }>;
    };
}

/**
 * Cultural data visualization structure for UI components
 */
export interface CulturalDataVisualization {
    categories: Record<string, {
        items: string[];
        source: string;
        confidence: number;
        isEmpty: boolean;
    }>;
    richness: 'low' | 'medium' | 'high';
    sourceIndicator: 'qloo' | 'fallback' | 'mixed' | 'unknown';
    totalItems: number;
    categoriesWithData: number;
}

/**
 * Validation score display configuration for UI
 */
export interface ValidationScoreDisplay {
    score: number;
    level: 'excellent' | 'good' | 'fair' | 'poor';
    color: string;
    bgColor: string;
    description: string;
    icon: string;
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
        description: string;
    };
    'legacy-fallback': {
        bg: string;
        text: string;
        icon: string;
        label: string;
        description: string;
    };
    'high-validation': {
        bg: string;
        text: string;
        icon: string;
        label: string;
        description: string;
    };
    'low-validation': {
        bg: string;
        text: string;
        icon: string;
        label: string;
        description: string;
    };
}

/**
 * Persona comparison result for side-by-side analysis
 */
export interface PersonaComparison {
    persona1: EnrichedPersona;
    persona2: EnrichedPersona;
    differences: {
        qualityScore: number;
        validationScore: number;
        culturalRichness: 'persona1' | 'persona2' | 'equal';
        processingTime: number;
        generationMethod: boolean; // true if different
    };
    recommendations: string[];
}

/**
 * Migration suggestion for legacy personas
 */
export interface MigrationSuggestion {
    personaId: string;
    currentStatus: 'legacy' | 'partial-metadata' | 'needs-update';
    suggestedActions: ('regenerate' | 'validate' | 'enrich-metadata')[];
    estimatedImprovement: {
        qualityScore: number;
        validationScore: number;
        culturalRichness: 'low' | 'medium' | 'high';
    };
    priority: 'low' | 'medium' | 'high';
}

/**
 * Batch operation result for persona management
 */
export interface BatchOperationResult {
    total: number;
    successful: number;
    failed: number;
    errors: Array<{
        personaId: string;
        error: string;
    }>;
    processingTime: number;
}

/**
 * Persona analytics data for dashboard display
 */
export interface PersonaAnalytics {
    totalPersonas: number;
    generationSourceBreakdown: Record<string, number>;
    averageScores: {
        quality: number;
        validation: number;
    };
    trendsOverTime: Array<{
        date: string;
        count: number;
        averageQuality: number;
    }>;
    templateUsage: Record<string, number>;
    culturalDataSourceStats: Record<string, number>;
}