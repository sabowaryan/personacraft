import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { ensureUserExists } from '@/lib/user-utils';
import { CulturalDataMigrationService } from '@/lib/services/cultural-data-migration-service';
import { 
  BatchMigrationProgress,
  setMigrationProgress,
  updateMigrationProgress,
  generateMigrationId,
  getActiveMigrations,
  getMigrationProgress
} from '@/lib/services/migration-progress-service';
import { Persona } from '@/types';

const { prisma } = await import('@/lib/prisma');

interface BatchMigrationRequest {
  personaIds?: string[];
  userId?: string;
  batchSize?: number;
  validateIntegrity?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await ensureUserExists(user);

    const body: BatchMigrationRequest = await request.json();
    const { personaIds, userId, batchSize = 10, validateIntegrity = true } = body;

    // Generate unique migration ID
    const migrationId = generateMigrationId();

    // Determine which personas to migrate
    let targetPersonas: any[];

    if (personaIds && personaIds.length > 0) {
      // Migrate specific personas
      targetPersonas = await prisma.persona.findMany({
        where: {
          id: { in: personaIds },
          userId: user.id // Ensure user can only migrate their own personas
        }
      });
    } else if (userId && userId === user.id) {
      // Migrate all personas for the user
      targetPersonas = await prisma.persona.findMany({
        where: { userId: user.id }
      });
    } else {
      return NextResponse.json(
        { error: 'Must specify either personaIds or userId' },
        { status: 400 }
      );
    }

    if (targetPersonas.length === 0) {
      return NextResponse.json(
        { error: 'No personas found to migrate' },
        { status: 404 }
      );
    }

    // Initialize progress tracking
    const progress: BatchMigrationProgress = {
      id: migrationId,
      status: 'pending',
      totalPersonas: targetPersonas.length,
      processedPersonas: 0,
      successfulMigrations: 0,
      failedMigrations: 0,
      startTime: new Date().toISOString(),
      errors: [],
      userId: user.id
    };

    setMigrationProgress(migrationId, progress);

    // Start migration process asynchronously
    processBatchMigration(migrationId, targetPersonas, batchSize, validateIntegrity)
      .catch(error => {
        console.error(`Batch migration ${migrationId} failed:`, error);
        updateMigrationProgress(migrationId, {
          status: 'failed',
          endTime: new Date().toISOString(),
          errors: [{
            personaId: 'system',
            error: error instanceof Error ? error.message : 'Unknown error'
          }]
        });
      });

    return NextResponse.json({
      success: true,
      migrationId,
      message: 'Batch migration started',
      totalPersonas: targetPersonas.length,
      progressUrl: `/api/personas/migrate/progress/${migrationId}`
    });

  } catch (error) {
    console.error('Batch migration API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all active migrations for the user
    const activeMigrations = getActiveMigrations()
      .filter(progress => progress.userId === user.id);

    return NextResponse.json({
      activeMigrations,
      totalActive: activeMigrations.length
    });

  } catch (error) {
    console.error('Get active migrations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processBatchMigration(
  migrationId: string,
  personas: any[],
  batchSize: number,
  validateIntegrity: boolean
) {
  const migrationService = new CulturalDataMigrationService();
  
  // Update status to in_progress
  const progress = updateMigrationProgress(migrationId, { status: 'in_progress' });

  if (!progress) {
    throw new Error('Migration progress not found');
  }

  try {
    // Process personas in batches
    for (let i = 0; i < personas.length; i += batchSize) {
      const batch = personas.slice(i, i + batchSize);

      for (const persona of batch) {
        progress.currentPersona = persona.name;

        try {
          // Skip if already migrated
          if (persona.culturalInsights) {
            progress.processedPersonas++;
            continue;
          }

          // Perform migration
          const migratedPersona = await migrationService.migratePersona(persona as Persona);

          // Validate integrity if requested
          if (validateIntegrity) {
            const validation = migrationService.validatePersonaIntegrity(migratedPersona);
            if (!validation.isValid) {
              throw new Error(`Migration validation failed: ${validation.errors.join(', ')}`);
            }
          }

          // Update database
          await prisma.persona.update({
            where: { id: persona.id },
            data: {
              culturalInsights: migratedPersona.culturalInsights as any
            }
          });

          progress.successfulMigrations++;
          progress.processedPersonas++;

        } catch (error) {
          progress.failedMigrations++;
          progress.processedPersonas++;
          progress.errors.push({
            personaId: persona.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Small delay between batches to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    progress.status = 'completed';
    progress.endTime = new Date().toISOString();
    progress.currentPersona = undefined;

  } catch (error) {
    progress.status = 'failed';
    progress.endTime = new Date().toISOString();
    progress.errors.push({
      personaId: 'system',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Note: migrationProgress is available within this module but not exported
// to comply with Next.js route handler constraints. If you need to access
// migration progress from other routes, consider using a separate service module.