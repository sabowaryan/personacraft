// Validation helpers for persona metadata presence and completeness
// Provides comprehensive validation utilities for enhanced persona functionality

import { 
    EnrichedPersona, 
    GenerationMetadata, 
    ValidationMetadata,
    ValidationDetail
} from '@/types/enhanced-persona';
import { CulturalData } from '@/types';

/**
 * Comprehensive validation result interface
 */
export interface PersonaValidationResult {
    isValid: boolean;
    score: number; // 0-100
    errors: ValidationError[];
    warnings: ValidationWarning[];
    suggestions: ValidationSuggestion[];
    categories: {
        metadata: CategoryValidationResult;
        content: CategoryValidationResult;
        cultural: CategoryValidationResult;
        structure: CategoryValidationResult;
    };
}

/**
 * Individual validation error
 */
export interface ValidationError {
    field: string;
    code: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    fixable: boolean;
}

/**
 * Validation warning for non-critical issues
 */
export interface ValidationWarning {
    field: string;
    code: string;
    message: string;
    impact: 'low' | 'medium' | 'high';
}

/**
 * Validation suggestion for improvements
 */
export interface ValidationSuggestion {
    category: 'metadata' | 'content' | 'cultural' | 'quality';
    action: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    estimatedImprovement: number; // 0-100
}

/**
 * Category-specific validation result
 */
export interface CategoryValidationResult {
    score: number; // 0-100
    passed: boolean;
    errors: number;
    warnings: number;
    completeness: number; // 0-100
}

/**
 * Main validation function for enhanced personas
 */
export function validateEnhancedPersona(persona: EnrichedPersona): PersonaValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    // Validate different categories
    const metadataResult = validateMetadataCategory(persona, errors, warnings, suggestions);
    const contentResult = validateContentCategory(persona, errors, warnings, suggestions);
    const culturalResult = validateCulturalCategory(persona, errors, warnings, suggestions);
    const structureResult = validateStructureCategory(persona, errors, warnings, suggestions);

    // Calculate overall score
    const overallScore = Math.round(
        (metadataResult.score * 0.3 + 
         contentResult.score * 0.3 + 
         culturalResult.score * 0.25 + 
         structureResult.score * 0.15)
    );

    const isValid = errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0;

    return {
        isValid,
        score: overallScore,
        errors,
        warnings,
        suggestions,
        categories: {
            metadata: metadataResult,
            content: contentResult,
            cultural: culturalResult,
            structure: structureResult
        }
    };
}

/**
 * Validates metadata completeness and quality
 */
function validateMetadataCategory(
    persona: EnrichedPersona,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    suggestions: ValidationSuggestion[]
): CategoryValidationResult {
    let score = 0;
    let completeness = 0;
    const maxScore = 100;

    // Generation metadata validation (50% of metadata score)
    if (!persona.generationMetadata) {
        errors.push({
            field: 'generationMetadata',
            code: 'MISSING_GENERATION_METADATA',
            message: 'Métadonnées de génération manquantes',
            severity: 'high',
            fixable: true
        });
        suggestions.push({
            category: 'metadata',
            action: 'regenerate',
            description: 'Régénérer le persona pour obtenir les métadonnées complètes',
            priority: 'high',
            estimatedImprovement: 40
        });
    } else {
        score += 25;
        completeness += 25;

        const gm = persona.generationMetadata;
        
        // Required fields
        if (!gm.source) {
            errors.push({
                field: 'generationMetadata.source',
                code: 'MISSING_SOURCE',
                message: 'Source de génération manquante',
                severity: 'medium',
                fixable: true
            });
        } else {
            score += 5;
            completeness += 5;
        }

        if (!gm.method) {
            warnings.push({
                field: 'generationMetadata.method',
                code: 'MISSING_METHOD',
                message: 'Méthode de génération non spécifiée',
                impact: 'low'
            });
        } else {
            score += 5;
            completeness += 5;
        }

        if (!gm.generatedAt) {
            errors.push({
                field: 'generationMetadata.generatedAt',
                code: 'MISSING_TIMESTAMP',
                message: 'Timestamp de génération manquant',
                severity: 'medium',
                fixable: false
            });
        } else {
            score += 5;
            completeness += 5;
        }

        // Quality checks
        if (gm.processingTime === 0) {
            warnings.push({
                field: 'generationMetadata.processingTime',
                code: 'ZERO_PROCESSING_TIME',
                message: 'Temps de traitement non enregistré',
                impact: 'low'
            });
        } else {
            score += 5;
            completeness += 5;
        }

        if (gm.source === 'qloo-first' && !gm.qlooDataUsed) {
            warnings.push({
                field: 'generationMetadata.qlooDataUsed',
                code: 'QLOO_FIRST_WITHOUT_DATA',
                message: 'Persona Qloo First sans utilisation des données Qloo',
                impact: 'medium'
            });
        }

        if (gm.source === 'legacy-fallback') {
            suggestions.push({
                category: 'metadata',
                action: 'migrate',
                description: 'Migrer vers Qloo First pour de meilleures données',
                priority: 'medium',
                estimatedImprovement: 25
            });
        }
    }

    // Validation metadata validation (50% of metadata score)
    if (!persona.validationMetadata) {
        errors.push({
            field: 'validationMetadata',
            code: 'MISSING_VALIDATION_METADATA',
            message: 'Métadonnées de validation manquantes',
            severity: 'medium',
            fixable: true
        });
        suggestions.push({
            category: 'metadata',
            action: 'validate',
            description: 'Valider le persona avec les templates de validation',
            priority: 'medium',
            estimatedImprovement: 30
        });
    } else {
        score += 25;
        completeness += 25;

        const vm = persona.validationMetadata;

        if (!vm.templateName) {
            warnings.push({
                field: 'validationMetadata.templateName',
                code: 'MISSING_TEMPLATE_NAME',
                message: 'Nom du template de validation manquant',
                impact: 'low'
            });
        } else {
            score += 5;
            completeness += 5;
        }

        if (vm.validationScore === undefined || vm.validationScore < 0) {
            errors.push({
                field: 'validationMetadata.validationScore',
                code: 'INVALID_VALIDATION_SCORE',
                message: 'Score de validation invalide',
                severity: 'medium',
                fixable: true
            });
        } else {
            score += 10;
            completeness += 10;
            
            if (vm.validationScore < 60) {
                suggestions.push({
                    category: 'metadata',
                    action: 'improve',
                    description: 'Score de validation faible - améliorer la qualité',
                    priority: 'medium',
                    estimatedImprovement: 20
                });
            }
        }

        if (!vm.validatedAt) {
            warnings.push({
                field: 'validationMetadata.validatedAt',
                code: 'MISSING_VALIDATION_TIMESTAMP',
                message: 'Timestamp de validation manquant',
                impact: 'low'
            });
        } else {
            score += 5;
            completeness += 5;
        }

        if (vm.validationDetails.length === 0) {
            warnings.push({
                field: 'validationMetadata.validationDetails',
                code: 'NO_VALIDATION_DETAILS',
                message: 'Aucun détail de validation disponible',
                impact: 'medium'
            });
        } else {
            score += 5;
            completeness += 5;
        }
    }

    return {
        score: Math.min(score, maxScore),
        passed: score >= 70,
        errors: errors.filter(e => e.field.startsWith('generationMetadata') || e.field.startsWith('validationMetadata')).length,
        warnings: warnings.filter(w => w.field.startsWith('generationMetadata') || w.field.startsWith('validationMetadata')).length,
        completeness
    };
}

/**
 * Validates content quality and completeness
 */
function validateContentCategory(
    persona: EnrichedPersona,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    suggestions: ValidationSuggestion[]
): CategoryValidationResult {
    let score = 0;
    let completeness = 0;
    const maxScore = 100;

    // Required fields validation
    const requiredFields = [
        { field: 'id', weight: 5 },
        { field: 'name', weight: 15 },
        { field: 'age', weight: 10 },
        { field: 'occupation', weight: 10 },
        { field: 'location', weight: 10 }
    ];

    requiredFields.forEach(({ field, weight }) => {
        const value = persona[field as keyof EnrichedPersona];
        if (!value || (typeof value === 'string' && value.trim().length === 0)) {
            errors.push({
                field,
                code: `MISSING_${field.toUpperCase()}`,
                message: `Champ requis manquant: ${field}`,
                severity: field === 'id' || field === 'name' ? 'critical' : 'high',
                fixable: true
            });
        } else {
            score += weight;
            completeness += weight;
        }
    });

    // Optional but important fields
    const optionalFields = [
        { field: 'bio', weight: 10 },
        { field: 'quote', weight: 5 },
        { field: 'painPoints', weight: 15 },
        { field: 'goals', weight: 15 }
    ];

    optionalFields.forEach(({ field, weight }) => {
        const value = persona[field as keyof EnrichedPersona];
        if (!value || (Array.isArray(value) && value.length === 0) || 
            (typeof value === 'string' && value.trim().length === 0)) {
            warnings.push({
                field,
                code: `MISSING_${field.toUpperCase()}`,
                message: `Champ recommandé manquant: ${field}`,
                impact: 'medium'
            });
        } else {
            score += weight;
            completeness += weight;
        }
    });

    // Data quality checks
    if (persona.age < 13 || persona.age > 100) {
        warnings.push({
            field: 'age',
            code: 'UNUSUAL_AGE',
            message: 'Âge inhabituel détecté',
            impact: 'low'
        });
    }

    if (persona.qualityScore < 60) {
        suggestions.push({
            category: 'content',
            action: 'improve',
            description: 'Score de qualité faible - améliorer le contenu',
            priority: 'high',
            estimatedImprovement: 30
        });
    }

    return {
        score: Math.min(score, maxScore),
        passed: score >= 70,
        errors: errors.filter(e => !e.field.includes('Metadata')).length,
        warnings: warnings.filter(w => !w.field.includes('Metadata')).length,
        completeness
    };
}

/**
 * Validates cultural data richness and quality
 */
function validateCulturalCategory(
    persona: EnrichedPersona,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    suggestions: ValidationSuggestion[]
): CategoryValidationResult {
    let score = 0;
    let completeness = 0;
    const maxScore = 100;

    if (!persona.culturalData) {
        errors.push({
            field: 'culturalData',
            code: 'MISSING_CULTURAL_DATA',
            message: 'Données culturelles manquantes',
            severity: 'high',
            fixable: true
        });
        return {
            score: 0,
            passed: false,
            errors: 1,
            warnings: 0,
            completeness: 0
        };
    }

    const culturalData = persona.culturalData;
    const categories = Object.keys(culturalData);
    let categoriesWithData = 0;
    let totalItems = 0;

    // Analyze each category
    categories.forEach(category => {
        const items = culturalData[category as keyof CulturalData];
        if (Array.isArray(items) && items.length > 0) {
            categoriesWithData++;
            totalItems += items.length;
            score += Math.min(items.length * 2, 10); // Max 10 points per category
        }
    });

    completeness = (categoriesWithData / categories.length) * 100;

    // Quality assessments
    if (categoriesWithData < 3) {
        warnings.push({
            field: 'culturalData',
            code: 'LOW_CATEGORY_COVERAGE',
            message: 'Peu de catégories culturelles renseignées',
            impact: 'high'
        });
        suggestions.push({
            category: 'cultural',
            action: 'enrich',
            description: 'Enrichir les données culturelles',
            priority: 'high',
            estimatedImprovement: 40
        });
    }

    if (totalItems < 15) {
        warnings.push({
            field: 'culturalData',
            code: 'LOW_ITEM_COUNT',
            message: 'Nombre total d\'éléments culturels faible',
            impact: 'medium'
        });
        suggestions.push({
            category: 'cultural',
            action: 'expand',
            description: 'Ajouter plus d\'éléments culturels',
            priority: 'medium',
            estimatedImprovement: 25
        });
    }

    // Bonus for diversity
    if (categoriesWithData >= 8) score += 20;
    else if (categoriesWithData >= 5) score += 10;

    return {
        score: Math.min(score, maxScore),
        passed: score >= 50,
        errors: errors.filter(e => e.field === 'culturalData').length,
        warnings: warnings.filter(w => w.field === 'culturalData').length,
        completeness
    };
}

/**
 * Validates data structure and consistency
 */
function validateStructureCategory(
    persona: EnrichedPersona,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    suggestions: ValidationSuggestion[]
): CategoryValidationResult {
    let score = 0;
    let completeness = 0;
    const maxScore = 100;

    // Validate object structure
    if (!persona.demographics || typeof persona.demographics !== 'object') {
        errors.push({
            field: 'demographics',
            code: 'INVALID_DEMOGRAPHICS_STRUCTURE',
            message: 'Structure des données démographiques invalide',
            severity: 'medium',
            fixable: true
        });
    } else {
        score += 25;
        completeness += 25;
    }

    if (!persona.psychographics || typeof persona.psychographics !== 'object') {
        errors.push({
            field: 'psychographics',
            code: 'INVALID_PSYCHOGRAPHICS_STRUCTURE',
            message: 'Structure des données psychographiques invalide',
            severity: 'medium',
            fixable: true
        });
    } else {
        score += 25;
        completeness += 25;
    }

    if (!persona.marketingInsights || typeof persona.marketingInsights !== 'object') {
        errors.push({
            field: 'marketingInsights',
            code: 'INVALID_MARKETING_INSIGHTS_STRUCTURE',
            message: 'Structure des insights marketing invalide',
            severity: 'medium',
            fixable: true
        });
    } else {
        score += 25;
        completeness += 25;
    }

    // Validate arrays
    if (!Array.isArray(persona.painPoints)) {
        errors.push({
            field: 'painPoints',
            code: 'INVALID_PAIN_POINTS_STRUCTURE',
            message: 'Les points de douleur doivent être un tableau',
            severity: 'medium',
            fixable: true
        });
    } else {
        score += 12.5;
        completeness += 12.5;
    }

    if (!Array.isArray(persona.goals)) {
        errors.push({
            field: 'goals',
            code: 'INVALID_GOALS_STRUCTURE',
            message: 'Les objectifs doivent être un tableau',
            severity: 'medium',
            fixable: true
        });
    } else {
        score += 12.5;
        completeness += 12.5;
    }

    // Validate timestamps
    try {
        new Date(persona.createdAt);
    } catch {
        errors.push({
            field: 'createdAt',
            code: 'INVALID_TIMESTAMP',
            message: 'Timestamp de création invalide',
            severity: 'medium',
            fixable: false
        });
    }

    return {
        score: Math.min(score, maxScore),
        passed: score >= 80,
        errors: errors.filter(e => ['demographics', 'psychographics', 'marketingInsights', 'painPoints', 'goals', 'createdAt'].includes(e.field)).length,
        warnings: 0,
        completeness
    };
}

/**
 * Quick validation for basic persona requirements
 */
export function quickValidatePersona(persona: EnrichedPersona): boolean {
    return !!(
        persona.id &&
        persona.name &&
        persona.age > 0 &&
        persona.occupation &&
        persona.location &&
        persona.culturalData &&
        persona.demographics &&
        persona.psychographics
    );
}

/**
 * Validates metadata presence specifically
 */
export function validateMetadataPresence(persona: EnrichedPersona): {
    hasGenerationMetadata: boolean;
    hasValidationMetadata: boolean;
    isComplete: boolean;
    missingMetadata: string[];
} {
    const missingMetadata: string[] = [];
    
    const hasGenerationMetadata = !!(persona.generationMetadata);
    const hasValidationMetadata = !!(persona.validationMetadata);
    
    if (!hasGenerationMetadata) missingMetadata.push('generationMetadata');
    if (!hasValidationMetadata) missingMetadata.push('validationMetadata');
    
    return {
        hasGenerationMetadata,
        hasValidationMetadata,
        isComplete: hasGenerationMetadata && hasValidationMetadata,
        missingMetadata
    };
}

/**
 * Validates cultural data completeness
 */
export function validateCulturalDataCompleteness(culturalData: CulturalData): {
    totalItems: number;
    categoriesWithData: number;
    totalCategories: number;
    completenessPercentage: number;
    richness: 'low' | 'medium' | 'high';
    recommendations: string[];
} {
    const categories = Object.keys(culturalData);
    let categoriesWithData = 0;
    let totalItems = 0;
    const recommendations: string[] = [];

    categories.forEach(category => {
        const items = culturalData[category as keyof CulturalData];
        if (Array.isArray(items) && items.length > 0) {
            categoriesWithData++;
            totalItems += items.length;
        }
    });

    const completenessPercentage = (categoriesWithData / categories.length) * 100;
    
    let richness: 'low' | 'medium' | 'high' = 'low';
    if (totalItems > 50 && categoriesWithData >= 8) richness = 'high';
    else if (totalItems > 20 && categoriesWithData >= 5) richness = 'medium';

    // Generate recommendations
    if (categoriesWithData < 5) {
        recommendations.push('Ajouter des données dans plus de catégories culturelles');
    }
    if (totalItems < 20) {
        recommendations.push('Augmenter le nombre total d\'éléments culturels');
    }
    if (richness === 'low') {
        recommendations.push('Enrichir les données culturelles pour améliorer la précision du persona');
    }

    return {
        totalItems,
        categoriesWithData,
        totalCategories: categories.length,
        completenessPercentage,
        richness,
        recommendations
    };
}