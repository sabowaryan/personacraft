/**
 * Migration Progress Service
 * 
 * Manages in-memory storage for migration progress tracking.
 * In production, this should be replaced with Redis or database storage.
 */

export interface BatchMigrationProgress {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  totalPersonas: number;
  processedPersonas: number;
  successfulMigrations: number;
  failedMigrations: number;
  startTime: string;
  endTime?: string;
  errors: Array<{ personaId: string; error: string }>;
  currentPersona?: string;
  userId?: string; // Track which user initiated the migration
}

// In-memory storage for progress tracking
// In production, use Redis or database
const migrationProgress = new Map<string, BatchMigrationProgress>();

/**
 * Store migration progress
 */
export function setMigrationProgress(migrationId: string, progress: BatchMigrationProgress): void {
  migrationProgress.set(migrationId, progress);
}

/**
 * Get migration progress by ID
 */
export function getMigrationProgress(migrationId: string): BatchMigrationProgress | undefined {
  return migrationProgress.get(migrationId);
}

/**
 * Update migration progress
 */
export function updateMigrationProgress(
  migrationId: string, 
  updates: Partial<BatchMigrationProgress>
): BatchMigrationProgress | undefined {
  const current = migrationProgress.get(migrationId);
  if (!current) {
    return undefined;
  }

  const updated = { ...current, ...updates };
  migrationProgress.set(migrationId, updated);
  return updated;
}

/**
 * Clear migration progress (cleanup)
 */
export function clearMigrationProgress(migrationId: string): boolean {
  return migrationProgress.delete(migrationId);
}

/**
 * Get all active migrations
 */
export function getActiveMigrations(): BatchMigrationProgress[] {
  return Array.from(migrationProgress.values())
    .filter(progress => progress.status === 'in_progress' || progress.status === 'pending');
}

/**
 * Get all migrations for a specific user
 */
export function getUserMigrations(userId: string): BatchMigrationProgress[] {
  return Array.from(migrationProgress.values())
    .filter(progress => progress.userId === userId);
}

/**
 * Cleanup completed migrations older than specified time
 */
export function cleanupOldMigrations(maxAgeMs: number = 24 * 60 * 60 * 1000): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [migrationId, progress] of migrationProgress.entries()) {
    if (progress.status === 'completed' || progress.status === 'failed') {
      const endTime = progress.endTime ? new Date(progress.endTime).getTime() : now;
      if (now - endTime > maxAgeMs) {
        migrationProgress.delete(migrationId);
        cleaned++;
      }
    }
  }

  return cleaned;
}

/**
 * Generate a unique migration ID
 */
export function generateMigrationId(): string {
  return `migration_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Get migration statistics
 */
export function getMigrationStats(): {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  failed: number;
} {
  const all = Array.from(migrationProgress.values());
  
  return {
    total: all.length,
    pending: all.filter(p => p.status === 'pending').length,
    inProgress: all.filter(p => p.status === 'in_progress').length,
    completed: all.filter(p => p.status === 'completed').length,
    failed: all.filter(p => p.status === 'failed').length,
  };
}