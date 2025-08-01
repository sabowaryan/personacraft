import { NextRequest, NextResponse } from 'next/server';
const { prisma } = await import('@/lib/prisma');

import { getAuthenticatedUser } from '@/lib/auth-utils';
import { normalizePersona, calculateCulturalRichness } from '@/lib/utils/persona-normalization';
import { 
  EnrichedPersona, 
  PersonaListResponse, 
  EnhancedPersonaFilters,
  EnhancedSortOptions 
} from '@/types/enhanced-persona';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
   
    if (!user) {
      
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Parse query parameters for filtering and sorting
    const { searchParams } = new URL(request.url);
    const filters = parseFilters(searchParams);
    const sortOptions = parseSortOptions(searchParams);

    // Build where clause with filters
    const whereClause = buildWhereClause(user.id, filters);
   
    // Build order by clause
    const orderByClause = buildOrderByClause(sortOptions);

    // Fetch personas with enhanced metadata
    const rawPersonas = await prisma.persona.findMany({
      where: whereClause,
      orderBy: orderByClause
    });
    
   
    // Normalize personas to ensure consistent metadata
    const personas: EnrichedPersona[] = rawPersonas.map(persona => 
      normalizePersona(persona as any, { validateCulturalData: true })
    );

   
    // Calculate aggregated statistics
    const metadata = calculateAggregatedMetadata(personas);
    
    // Calculate available filter options
    const filterOptions = calculateFilterOptions(personas);

    const response: PersonaListResponse = {
      personas,
      metadata,
      filters: filterOptions
    };

  

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erreur lors de la récupération des personas:', error)
    
    // Handle specific error types
    if (error instanceof Error && error.message === 'Auth timeout') {
      return NextResponse.json(
        { error: 'Timeout d\'authentification' },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des personas' },
      { status: 500 }
    )
  }
}

/**
 * Parse filters from query parameters
 */
function parseFilters(searchParams: URLSearchParams): EnhancedPersonaFilters {
  const filters: EnhancedPersonaFilters = {};

  // Age range filter
  const minAge = searchParams.get('minAge');
  const maxAge = searchParams.get('maxAge');
  if (minAge && maxAge) {
    filters.ageRange = [parseInt(minAge), parseInt(maxAge)];
  }

  // Generation source filter
  const generationSource = searchParams.get('generationSource');
  if (generationSource) {
    filters.generationSource = generationSource.split(',') as ('qloo-first' | 'legacy-fallback')[];
  }

  // Validation score filter
  const minValidationScore = searchParams.get('minValidationScore');
  const maxValidationScore = searchParams.get('maxValidationScore');
  if (minValidationScore && maxValidationScore) {
    filters.validationScore = [parseFloat(minValidationScore), parseFloat(maxValidationScore)];
  }

  // Quality score filter
  const minQualityScore = searchParams.get('minQualityScore');
  const maxQualityScore = searchParams.get('maxQualityScore');
  if (minQualityScore && maxQualityScore) {
    filters.qualityScore = [parseFloat(minQualityScore), parseFloat(maxQualityScore)];
  }

  // Cultural data richness filter
  const culturalRichness = searchParams.get('culturalRichness');
  if (culturalRichness) {
    filters.culturalDataRichness = culturalRichness.split(',') as ('low' | 'medium' | 'high')[];
  }

  // Template used filter
  const templateUsed = searchParams.get('templateUsed');
  if (templateUsed) {
    filters.templateUsed = templateUsed.split(',');
  }

  // Cultural data source filter
  const culturalDataSource = searchParams.get('culturalDataSource');
  if (culturalDataSource) {
    filters.culturalDataSource = culturalDataSource.split(',');
  }

  // Has metadata filter
  const hasMetadata = searchParams.get('hasMetadata');
  if (hasMetadata) {
    filters.hasMetadata = hasMetadata === 'true';
  }

  // Processing time range filter
  const minProcessingTime = searchParams.get('minProcessingTime');
  const maxProcessingTime = searchParams.get('maxProcessingTime');
  if (minProcessingTime && maxProcessingTime) {
    filters.processingTimeRange = [parseInt(minProcessingTime), parseInt(maxProcessingTime)];
  }

  // Date range filter
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  if (startDate && endDate) {
    filters.dateRange = [startDate, endDate];
  }

  // Location and occupation filters
  const location = searchParams.get('location');
  if (location) {
    filters.location = location.split(',');
  }

  const occupation = searchParams.get('occupation');
  if (occupation) {
    filters.occupation = occupation.split(',');
  }

  return filters;
}

/**
 * Parse sort options from query parameters
 */
function parseSortOptions(searchParams: URLSearchParams): EnhancedSortOptions {
  const sortField = searchParams.get('sortField') || 'createdAt';
  const sortDirection = searchParams.get('sortDirection') || 'desc';

  return {
    field: sortField as EnhancedSortOptions['field'],
    direction: sortDirection as 'asc' | 'desc'
  };
}

/**
 * Build Prisma where clause from filters
 */
function buildWhereClause(userId: string, filters: EnhancedPersonaFilters): any {
  const where: any = { userId };

  // Age range filter
  if (filters.ageRange) {
    where.age = {
      gte: filters.ageRange[0],
      lte: filters.ageRange[1]
    };
  }

  // Quality score filter
  if (filters.qualityScore) {
    where.qualityScore = {
      gte: filters.qualityScore[0],
      lte: filters.qualityScore[1]
    };
  }

  // Location filter
  if (filters.location && filters.location.length > 0) {
    where.location = {
      in: filters.location
    };
  }

  // Occupation filter
  if (filters.occupation && filters.occupation.length > 0) {
    where.occupation = {
      in: filters.occupation
    };
  }

  // Cultural data source filter
  if (filters.culturalDataSource && filters.culturalDataSource.length > 0) {
    where.culturalDataSource = {
      in: filters.culturalDataSource
    };
  }

  // Template used filter
  if (filters.templateUsed && filters.templateUsed.length > 0) {
    where.templateUsed = {
      in: filters.templateUsed
    };
  }

  // Processing time range filter
  if (filters.processingTimeRange) {
    where.processingTime = {
      gte: filters.processingTimeRange[0],
      lte: filters.processingTimeRange[1]
    };
  }

  // Date range filter
  if (filters.dateRange) {
    where.createdAt = {
      gte: new Date(filters.dateRange[0]),
      lte: new Date(filters.dateRange[1])
    };
  }

  // Has metadata filter
  if (filters.hasMetadata !== undefined) {
    if (filters.hasMetadata) {
      where.generationMetadata = { not: null };
    } else {
      where.generationMetadata = null;
    }
  }

  // Generation source filter (requires JSON filtering)
  if (filters.generationSource && filters.generationSource.length > 0) {
    where.OR = filters.generationSource.map(source => ({
      generationMetadata: {
        path: ['source'],
        equals: source
      }
    }));
  }

  return where;
}

/**
 * Build Prisma order by clause from sort options
 */
function buildOrderByClause(sortOptions: EnhancedSortOptions): any {
  const { field, direction } = sortOptions;

  // Handle special sorting fields
  switch (field) {
    case 'validationScore':
      return {
        validationMetadata: {
          path: ['validationScore'],
          sort: direction
        }
      };
    case 'generatedAt':
      return {
        generationMetadata: {
          path: ['generatedAt'],
          sort: direction
        }
      };
    case 'processingTime':
      return { processingTime: direction };
    default:
      return { [field]: direction };
  }
}

/**
 * Calculate aggregated metadata for the persona list
 */
function calculateAggregatedMetadata(personas: EnrichedPersona[]) {
  const total = personas.length;
  let qlooFirstCount = 0;
  let legacyCount = 0;
  let totalValidationScore = 0;
  let totalProcessingTime = 0;
  let totalQualityScore = 0;
  let validationScoreCount = 0;
  let processingTimeCount = 0;

  const culturalRichnessDistribution = { low: 0, medium: 0, high: 0 };

  personas.forEach(persona => {
    // Count generation sources
    if (persona.generationMetadata?.source === 'qloo-first') {
      qlooFirstCount++;
    } else {
      legacyCount++;
    }

    // Sum validation scores
    if (persona.validationMetadata?.validationScore !== undefined) {
      totalValidationScore += persona.validationMetadata.validationScore;
      validationScoreCount++;
    }

    // Sum processing times
    if (persona.processingTime && persona.processingTime > 0) {
      totalProcessingTime += persona.processingTime;
      processingTimeCount++;
    }

    // Sum quality scores
    totalQualityScore += persona.qualityScore || 0;

    // Count cultural richness distribution
    const richness = persona.culturalRichness || calculateCulturalRichness(persona.culturalData);
    culturalRichnessDistribution[richness]++;
  });

  return {
    total,
    qlooFirstCount,
    legacyCount,
    averageValidationScore: validationScoreCount > 0 ? totalValidationScore / validationScoreCount : 0,
    averageProcessingTime: processingTimeCount > 0 ? totalProcessingTime / processingTimeCount : 0,
    averageQualityScore: total > 0 ? totalQualityScore / total : 0,
    culturalRichnessDistribution
  };
}

/**
 * Calculate available filter options based on current personas
 */
function calculateFilterOptions(personas: EnrichedPersona[]) {
  const sources = new Set<string>();
  const templates = new Set<string>();
  const culturalDataSources = new Set<string>();
  let minValidationScore = 100;
  let maxValidationScore = 0;
  let minDate = new Date();
  let maxDate = new Date(0);

  personas.forEach(persona => {
    // Collect generation sources
    if (persona.generationMetadata?.source) {
      sources.add(persona.generationMetadata.source);
    }

    // Collect templates used
    if (persona.templateUsed) {
      templates.add(persona.templateUsed);
    }

    // Collect cultural data sources
    if (persona.culturalDataSource) {
      culturalDataSources.add(persona.culturalDataSource);
    }

    // Track validation score range
    if (persona.validationMetadata?.validationScore !== undefined) {
      minValidationScore = Math.min(minValidationScore, persona.validationMetadata.validationScore);
      maxValidationScore = Math.max(maxValidationScore, persona.validationMetadata.validationScore);
    }

    // Track date range
    const createdAt = new Date(persona.createdAt);
    if (createdAt < minDate) minDate = createdAt;
    if (createdAt > maxDate) maxDate = createdAt;
  });

  return {
    availableSources: Array.from(sources),
    validationScoreRange: [minValidationScore, maxValidationScore] as [number, number],
    templatesUsed: Array.from(templates),
    culturalDataSources: Array.from(culturalDataSources),
    dateRange: [minDate.toISOString(), maxDate.toISOString()] as [string, string]
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      age,
      occupation,
      location,
      bio,
      quote,
      email,
      phone,
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
      processingTime,
      // Additional metadata from generation
      metadata
    } = body

    // Extract generation method from metadata if available
    const generationMethod = metadata?.generationMethod || generationMetadata?.generationMethod || 'unknown';
    const culturalDataSourceFinal = culturalDataSource || metadata?.culturalDataSource || 'unknown';
    
    // Fix: Properly extract templateUsed as string from multiple sources
    const templateUsedFinal = templateUsed || 
                             metadata?.templateUsed || 
                             metadata?.validation?.templateId || 
                             validationMetadata?.templateId ||
                             generationMetadata?.templateUsed ||
                             'standard';
    
    const processingTimeFinal = processingTime || metadata?.processingTime || 0;

    // Fix: Create proper validationMetadata JSON object from generation response
    const validationMetadataFinal = validationMetadata || {
      isValid: metadata?.validation?.isValid ?? true,
      validationScore: metadata?.validation?.score ?? metadata?.validationScore ?? 0,
      validatedAt: new Date().toISOString(),
      validationVersion: '1.0',
      templateId: templateUsedFinal,
      validationTime: metadata?.validation?.validationTime ?? 0,
      errorCount: metadata?.validation?.errorCount ?? metadata?.validationErrors ?? 0,
      warningCount: metadata?.validation?.warningCount ?? metadata?.validationWarnings ?? 0,
      retryCount: metadata?.validation?.retryCount ?? 0,
      issues: metadata?.validation?.errors ?? metadata?.validationIssues ?? []
    };

    const persona = await prisma.persona.create({
      data: {
        userId: user.id,
        name,
        age,
        occupation,
        location,
        bio,
        quote,
        email,
        phone,
        demographics,
        psychographics,
        culturalData,
        painPoints,
        goals,
        marketingInsights,
        qualityScore,
        // Enhanced metadata
        generationMetadata: {
          ...generationMetadata,
          generationMethod,
          culturalDataSource: culturalDataSourceFinal,
          templateUsed: templateUsedFinal,
          processingTime: processingTimeFinal,
          qlooConstraintsUsed: metadata?.qlooConstraintsUsed || [],
          validationScore: metadata?.validationScore || 0,
          validationErrors: metadata?.validationErrors || 0,
          validationWarnings: metadata?.validationWarnings || 0
        },
        validationMetadata: validationMetadataFinal,
        culturalDataSource: culturalDataSourceFinal,
        templateUsed: templateUsedFinal,
        processingTime: processingTimeFinal,
        // Fix: Save the metadata field
        metadata
      }
    })

    // Normalize the created persona before returning
    const enrichedPersona = normalizePersona(persona as any, { validateCulturalData: true });

    return NextResponse.json(enrichedPersona, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du persona:', error)
    
    // Handle specific error types
    if (error instanceof Error && error.message === 'Auth timeout') {
      return NextResponse.json(
        { error: 'Timeout d\'authentification' },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création du persona' },
      { status: 500 }
    )
  }
}