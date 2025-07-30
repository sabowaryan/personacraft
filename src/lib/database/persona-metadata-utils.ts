// Database utilities for working with enhanced persona metadata

import { PrismaClient, Prisma } from '@prisma/client';
import {
  EnrichedPersona,
  PersonaDbModel,
  GenerationMetadata,
  ValidationMetadata,
  normalizePersona
} from '@/types/persona-metadata';

/**
 * Convert database model to EnrichedPersona type
 */
export function dbModelToEnrichedPersona(dbPersona: PersonaDbModel): EnrichedPersona {
  return {
    id: dbPersona.id,
    name: dbPersona.name,
    age: dbPersona.age,
    occupation: dbPersona.occupation,
    location: dbPersona.location,
    bio: dbPersona.bio || '',
    quote: dbPersona.quote || '',
    demographics: dbPersona.demographics,
    psychographics: dbPersona.psychographics,
    culturalData: dbPersona.culturalData,
    painPoints: dbPersona.painPoints,
    goals: dbPersona.goals,
    marketingInsights: dbPersona.marketingInsights,
    qualityScore: dbPersona.qualityScore,
    createdAt: dbPersona.createdAt.toISOString(),

    // Enhanced metadata
    generationMetadata: dbPersona.generationMetadata as GenerationMetadata | undefined,
    validationMetadata: dbPersona.validationMetadata as ValidationMetadata | undefined,
    culturalDataSource: dbPersona.culturalDataSource,
    templateUsed: dbPersona.templateUsed,
    processingTime: dbPersona.processingTime
  };
}

/**
 * Convert EnrichedPersona to database model format
 */
export function enrichedPersonaToDbModel(persona: EnrichedPersona): Partial<PersonaDbModel> {
  return {
    id: persona.id,
    name: persona.name,
    age: persona.age,
    occupation: persona.occupation,
    location: persona.location,
    bio: persona.bio,
    quote: persona.quote,
    demographics: persona.demographics,
    psychographics: persona.psychographics,
    culturalData: persona.culturalData,
    painPoints: persona.painPoints,
    goals: persona.goals,
    marketingInsights: persona.marketingInsights,
    qualityScore: persona.qualityScore,

    // Enhanced metadata
    generationMetadata: persona.generationMetadata,
    validationMetadata: persona.validationMetadata,
    culturalDataSource: persona.culturalDataSource,
    templateUsed: persona.templateUsed,
    processingTime: persona.processingTime
  };
}

/**
 * Query personas with enhanced metadata filtering
 */
export async function queryPersonasWithMetadata(
  prisma: PrismaClient,
  filters: {
    userId: string;
    generationSource?: 'qloo-first' | 'legacy-fallback';
    validationScoreMin?: number;
    validationScoreMax?: number;
    culturalDataSource?: string;
    templateUsed?: string;
    limit?: number;
    offset?: number;
  }
): Promise<EnrichedPersona[]> {
  const whereClause: any = {
    userId: filters.userId
  };

  // Add metadata-based filters
  if (filters.generationSource) {
    whereClause.generationMetadata = {
      path: ['source'],
      equals: filters.generationSource
    };
  }

  if (filters.validationScoreMin !== undefined || filters.validationScoreMax !== undefined) {
    whereClause.validationMetadata = {
      path: ['validationScore'],
      ...(filters.validationScoreMin !== undefined && { gte: filters.validationScoreMin }),
      ...(filters.validationScoreMax !== undefined && { lte: filters.validationScoreMax })
    };
  }

  if (filters.culturalDataSource) {
    whereClause.culturalDataSource = filters.culturalDataSource;
  }

  if (filters.templateUsed) {
    whereClause.templateUsed = filters.templateUsed;
  }

  const personas = await prisma.persona.findMany({
    where: whereClause,
    take: filters.limit || 50,
    skip: filters.offset || 0,
    orderBy: [
      { createdAt: 'desc' }
    ]
  });

  return personas.map(persona =>
    normalizePersona(dbModelToEnrichedPersona(persona as PersonaDbModel))
  );
}

/**
 * Get aggregated metadata statistics
 */
export async function getPersonaMetadataStats(
  prisma: PrismaClient,
  userId: string
): Promise<{
  total: number;
  qlooFirstCount: number;
  legacyCount: number;
  averageValidationScore: number;
  averageProcessingTime: number;
  templatesUsed: string[];
  culturalDataSources: string[];
}> {
  type SelectedPersona = {
    generationMetadata: any;
    validationMetadata: any;
    culturalDataSource: string | null;
    templateUsed: string | null;
    processingTime: number | null;
  };

  const personas = await prisma.persona.findMany({
    where: { userId },
    select: {
      generationMetadata: true,
      validationMetadata: true,
      culturalDataSource: true,
      templateUsed: true,
      processingTime: true
    }
  }) as unknown as SelectedPersona[];

  const total = personas.length;
  let qlooFirstCount = 0;
  let legacyCount = 0;
  let totalValidationScore = 0;
  let totalProcessingTime = 0;
  let validationScoreCount = 0;
  let processingTimeCount = 0;
  const templatesUsed = new Set<string>();
  const culturalDataSources = new Set<string>();

  personas.forEach((persona) => {
    const generationMetadata = persona.generationMetadata as GenerationMetadata | null;
    const validationMetadata = persona.validationMetadata as ValidationMetadata | null;

    // Count generation sources
    if (generationMetadata?.source === 'qloo-first') {
      qlooFirstCount++;
    } else {
      legacyCount++;
    }

    // Aggregate validation scores
    if (validationMetadata?.validationScore) {
      totalValidationScore += validationMetadata.validationScore;
      validationScoreCount++;
    }

    // Aggregate processing times
    if (persona.processingTime) {
      totalProcessingTime += persona.processingTime;
      processingTimeCount++;
    }

    // Collect templates and sources
    if (persona.templateUsed) {
      templatesUsed.add(persona.templateUsed);
    }
    if (persona.culturalDataSource) {
      culturalDataSources.add(persona.culturalDataSource);
    }
  });

  return {
    total,
    qlooFirstCount,
    legacyCount,
    averageValidationScore: validationScoreCount > 0 ? totalValidationScore / validationScoreCount : 0,
    averageProcessingTime: processingTimeCount > 0 ? totalProcessingTime / processingTimeCount : 0,
    templatesUsed: Array.from(templatesUsed),
    culturalDataSources: Array.from(culturalDataSources)
  };
}

/**
 * Update persona with enhanced metadata
 */
export async function updatePersonaMetadata(
  prisma: PrismaClient,
  personaId: string,
  metadata: {
    generationMetadata?: GenerationMetadata;
    validationMetadata?: ValidationMetadata;
    culturalDataSource?: string;
    templateUsed?: string;
    processingTime?: number;
  }
): Promise<EnrichedPersona> {
  const updatedPersona = await prisma.persona.update({
    where: { id: personaId },
    data: {
      generationMetadata: metadata.generationMetadata as any,
      validationMetadata: metadata.validationMetadata as any,
      culturalDataSource: metadata.culturalDataSource,
      templateUsed: metadata.templateUsed,
      processingTime: metadata.processingTime
    }
  });

  return normalizePersona(dbModelToEnrichedPersona(updatedPersona as PersonaDbModel));
}

/**
 * Migrate legacy personas to include default metadata
 */
export async function migrateLegacyPersonas(
  prisma: PrismaClient,
  userId: string,
  batchSize: number = 50
): Promise<{ migrated: number; total: number }> {
  // Find personas without generation metadata
  const legacyPersonas = await prisma.persona.findMany({
    where: {
      userId,
      generationMetadata: { equals: Prisma.JsonNull }
    },
    take: batchSize
  });

  let migrated = 0;

  for (const persona of legacyPersonas) {
    const defaultMetadata: GenerationMetadata = {
      source: 'legacy-fallback',
      method: 'legacy-generation',
      culturalConstraintsUsed: [],
      processingTime: 0,
      qlooDataUsed: false,
      generatedAt: persona.createdAt.toISOString()
    };

    const defaultValidation: ValidationMetadata = {
      templateName: 'legacy',
      validationScore: persona.qualityScore,
      validationDetails: [],
      failedRules: [],
      passedRules: [],
      validationTime: 0,
      validatedAt: persona.createdAt.toISOString()
    };

    await prisma.persona.update({
      where: { id: persona.id },
      data: {
        generationMetadata: defaultMetadata as any,
        validationMetadata: defaultValidation as any,
        culturalDataSource: 'unknown',
        templateUsed: 'legacy'
      }
    });

    migrated++;
  }

  const total = await prisma.persona.count({
    where: {
      userId,
      generationMetadata: { equals: Prisma.JsonNull }
    }
  });

  return { migrated, total };
}