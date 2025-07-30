// Schema verification utility to ensure database is properly configured

import { PrismaClient } from '@prisma/client';

/**
 * Verify that the database schema includes all required metadata columns
 */
export async function verifyPersonaMetadataSchema(prisma: PrismaClient): Promise<{
  isValid: boolean;
  missingColumns: string[];
  errors: string[];
}> {
  const errors: string[] = [];
  const missingColumns: string[] = [];

  try {
    // Use raw query to test column existence without relying on TypeScript types
    const testQuery = await prisma.$queryRaw`
      SELECT 
        id,
        "generationMetadata",
        "validationMetadata", 
        "culturalDataSource",
        "templateUsed",
        "processingTime"
      FROM "Persona" 
      LIMIT 1
    `;

    // If we get here, the columns exist
    console.log('✅ All metadata columns are present in the database schema');

    return {
      isValid: true,
      missingColumns: [],
      errors: []
    };
  } catch (error: any) {
    console.error('❌ Schema verification failed:', error.message);

    // Parse error to identify missing columns
    if (error.message.includes('column') && error.message.includes('does not exist')) {
      const columnMatch = error.message.match(/column "([^"]+)" does not exist/);
      if (columnMatch) {
        missingColumns.push(columnMatch[1]);
      }
    }

    errors.push(error.message);

    return {
      isValid: false,
      missingColumns,
      errors
    };
  }
}

/**
 * Verify that the database indexes are properly created
 */
export async function verifyPersonaMetadataIndexes(prisma: PrismaClient): Promise<{
  isValid: boolean;
  indexesFound: string[];
  errors: string[];
}> {
  const errors: string[] = [];
  const indexesFound: string[] = [];

  try {
    // Query to check if indexes exist (PostgreSQL specific)
    const indexQuery = `
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'Persona' 
      AND indexname LIKE 'idx_persona_%'
    `;

    const result = await prisma.$queryRawUnsafe(indexQuery) as Array<{ indexname: string }>;

    const expectedIndexes = [
      'idx_persona_cultural_source',
      'idx_persona_template_used',
      'idx_persona_processing_time',
      'idx_persona_generation_source',
      'idx_persona_validation_score'
    ];

    result.forEach(row => {
      indexesFound.push(row.indexname);
    });

    const missingIndexes = expectedIndexes.filter(index =>
      !indexesFound.some(found => found.includes(index.replace('idx_persona_', '')))
    );

    if (missingIndexes.length === 0) {
      console.log('✅ All expected indexes are present');
    } else {
      console.warn('⚠️ Some indexes may be missing:', missingIndexes);
    }

    return {
      isValid: missingIndexes.length === 0,
      indexesFound,
      errors
    };
  } catch (error: any) {
    console.error('❌ Index verification failed:', error.message);
    errors.push(error.message);

    return {
      isValid: false,
      indexesFound,
      errors
    };
  }
}

/**
 * Check if Prisma client needs regeneration
 */
export async function checkPrismaClientSync(prisma: PrismaClient): Promise<{
  needsRegeneration: boolean;
  suggestion: string;
}> {
  try {
    // Use raw query to test if the fields exist without relying on TypeScript types
    const testQuery = await prisma.$queryRaw`
      SELECT 
        id,
        "generationMetadata",
        "validationMetadata", 
        "culturalDataSource",
        "templateUsed",
        "processingTime"
      FROM "Persona" 
      LIMIT 1
    `;

    // If raw query works, try the typed client
    try {
      await prisma.persona.findFirst({
        select: {
          id: true,
          generationMetadata: true,
          validationMetadata: true,
          culturalDataSource: true,
          templateUsed: true,
          processingTime: true
        }
      });

      return {
        needsRegeneration: false,
        suggestion: 'Prisma client is up to date'
      };
    } catch (typeError: any) {
      if (typeError.message.includes('does not exist in type')) {
        return {
          needsRegeneration: true,
          suggestion: 'Run "npx prisma generate" to regenerate the Prisma client with the latest schema changes'
        };
      }
      throw typeError;
    }

  } catch (error: any) {
    return {
      needsRegeneration: false,
      suggestion: `Database schema error: ${error.message}`
    };
  }
}

/**
 * Run complete schema verification
 */
export async function runCompleteSchemaVerification(prisma: PrismaClient): Promise<{
  schemaValid: boolean;
  indexesValid: boolean;
  clientNeedsRegeneration: boolean;
  summary: string;
}> {
  console.log('🔍 Running complete schema verification...');

  const schemaResult = await verifyPersonaMetadataSchema(prisma);
  const indexResult = await verifyPersonaMetadataIndexes(prisma);
  const clientResult = await checkPrismaClientSync(prisma);

  const summary = `
Schema Verification Results:
- Metadata columns: ${schemaResult.isValid ? '✅ Valid' : '❌ Invalid'}
- Database indexes: ${indexResult.isValid ? '✅ Valid' : '⚠️ Some missing'}
- Prisma client: ${clientResult.needsRegeneration ? '⚠️ Needs regeneration' : '✅ Up to date'}
- Missing columns: ${schemaResult.missingColumns.join(', ') || 'None'}
- Indexes found: ${indexResult.indexesFound.length}
- Errors: ${[...schemaResult.errors, ...indexResult.errors].length}

${clientResult.needsRegeneration ? `💡 Suggestion: ${clientResult.suggestion}` : ''}
  `;

  console.log(summary);

  return {
    schemaValid: schemaResult.isValid,
    indexesValid: indexResult.isValid,
    clientNeedsRegeneration: clientResult.needsRegeneration,
    summary
  };
}