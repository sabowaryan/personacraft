import { Persona } from '@/types';
import { EnrichedPersona, GenerationMetadata, ValidationMetadata } from '@/types/enhanced-persona';

/**
 * Normalizes a persona to ensure it has all required metadata for enhanced UI
 * Provides backward compatibility for legacy personas without metadata
 */
export const normalizePersona = (persona: Partial<EnrichedPersona>): EnrichedPersona => {
  const defaultMetadata: GenerationMetadata = {
    source: 'legacy-fallback',
    method: 'unknown',
    culturalConstraintsUsed: [],
    processingTime: 0,
    qlooDataUsed: false,
    generatedAt: persona.createdAt || new Date().toISOString()
  };

  const defaultValidationData: ValidationMetadata = {
    templateName: 'legacy',
    validationScore: persona.qualityScore || 0,
    validationDetails: [],
    failedRules: [],
    passedRules: [],
    validationTime: 0,
    validatedAt: persona.createdAt || new Date().toISOString(),
    overallStatus: 'passed',
    categoryScores: {
      format: persona.qualityScore || 0,
      content: persona.qualityScore || 0,
      cultural: persona.qualityScore || 0,
      demographic: persona.qualityScore || 0
    }
  };

  return {
    ...persona,
    generationMetadata: persona.generationMetadata || defaultMetadata,
    validationMetadata: persona.validationMetadata || defaultValidationData,
    culturalDataSource: persona.culturalDataSource || 'unknown',
    isLegacy: !persona.generationMetadata || persona.generationMetadata.source === 'legacy-fallback'
  } as EnrichedPersona;
};

/**
 * Calculates cultural data richness based on the amount of cultural data available
 */
export const calculateCulturalRichness = (culturalData: any): 'low' | 'medium' | 'high' => {
  if (!culturalData) return 'low';
  
  const totalItems = Object.values(culturalData).flat().length;
  if (totalItems > 50) return 'high';
  if (totalItems > 20) return 'medium';
  return 'low';
};

/**
 * Determines quality level based on quality score
 */
export const getQualityLevel = (score: number): 'excellent' | 'good' | 'fair' | 'poor' => {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
};

/**
 * Checks if a persona has enhanced metadata
 */
export const hasEnhancedMetadata = (persona: EnrichedPersona): boolean => {
  return !!(persona.generationMetadata && persona.validationMetadata);
};

/**
 * Gets a user-friendly description of the generation source
 */
export const getGenerationSourceDescription = (source: string): string => {
  switch (source) {
    case 'qloo-first':
      return 'Generated using Qloo First system with enhanced cultural data';
    case 'legacy-fallback':
      return 'Generated using legacy fallback system';
    default:
      return 'Generation method unknown';
  }
};

/**
 * Gets validation status description
 */
export const getValidationStatusDescription = (score: number): string => {
  if (score >= 80) return 'High quality validation - meets all standards';
  if (score >= 50) return 'Medium quality validation - meets most standards';
  return 'Low quality validation - needs review';
};

/**
 * Normalizes an array of personas for enhanced UI display
 */
export const normalizePersonas = (personas: Partial<EnrichedPersona>[]): EnrichedPersona[] => {
  return personas.map(normalizePersona);
};