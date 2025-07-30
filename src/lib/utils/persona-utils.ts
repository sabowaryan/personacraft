import { METADATA_BADGE_CONFIG } from "./METADATA_BADGE_CONFIG";
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

  const culturalRichness = calculateCulturalRichness(persona.culturalData);

  return {
    id: persona.id || '',
    name: persona.name || '',
    age: persona.age || 0,
    occupation: persona.occupation || '',
    location: persona.location || ",
    bio: persona.bio || 
    quote: persona.quote || 
    qualityScore: persona.qualityScore || 0,
    culturalData: persona.culturalData || {},
    demographics: persona.demographics || {},
    psychographics: persona.psychographics || {},
    painPoints: persona.painPoints || [],
    goals: persona.goals || [],
    marketingInsights: persona.marketingInsights || {},
    createdAt: persona.createdAt || new Date().toISOString(),
    updatedAt: persona.updatedAt || new Date().toISOString(),
    generationMetadata: persona.generationMetadata || defaultMetadata,
    validationMetadata: persona.validationMetadata || defaultValidationData,
    culturalDataSource: persona.culturalDataSource || 'unknown',
    culturalRichness,
    isLegacy: !persona.generationMetadata || persona.generationMetadata.source === 'legacy-fallback'
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

/**
 * Type guard for Qloo-First personas.
 */
export const isQlooFirstPersona = (persona: EnrichedPersona): boolean => {
  return persona.generationMetadata?.source === 'qloo-first';
};

/**
 * Type guard for legacy personas.
 */
export const isLegacyPersona = (persona: EnrichedPersona): boolean => {
  return persona.isLegacy === true;
};

/**
 * Compares two personas and highlights differences.
 */
export const comparePersonas = (persona1: EnrichedPersona, persona2: EnrichedPersona) => {
  const differences: any = {};
  const recommendations: string[] = [];

  if (persona1.generationMetadata?.source !== persona2.generationMetadata?.source) {
    differences.generationMethod = true;
    recommendations.push('Consider migrating legacy personas to Qloo-First for enhanced data.');
  }

  // Add more comparison logic as needed

  return {
    persona1,
    persona2,
    differences,
    recommendations,
  };
};

/**
 * Generates migration suggestions for personas.
 */
export const generateMigrationSuggestion = (persona: EnrichedPersona) => {
  let currentStatus: 'up-to-date' | 'needs-update' | 'critical-update' = 'up-to-date';
  const suggestedActions: string[] = [];
  let priority: 'low' | 'medium' | 'high' = 'low';

  if (isLegacyPersona(persona)) {
    currentStatus = 'needs-update';
    suggestedActions.push('Migrate this persona to the Qloo-First system to leverage enhanced data and validation.');
    priority = 'high';
  }

  if (persona.validationMetadata?.overallStatus === 'failed') {
    currentStatus = 'critical-update';
    suggestedActions.push('Review validation details and correct errors to ensure data integrity.');
    priority = 'high';
  }

  if (persona.validationMetadata?.validationScore && persona.validationMetadata.validationScore < 75) {
    if (currentStatus === 'up-to-date') currentStatus = 'needs-update';
    suggestedActions.push('Improve the quality score by enriching cultural data or refining existing information.');
    if (priority !== 'high') priority = 'medium';
  }

  if (!hasEnhancedMetadata(persona)) {
    if (currentStatus === 'up-to-date') currentStatus = 'needs-update';
    suggestedActions.push('Add missing generation and validation metadata for better traceability and analysis.');
    if (priority === 'low') priority = 'medium';
  }

  return {
    currentStatus,
    suggestedActions,
    priority,
  };
};

