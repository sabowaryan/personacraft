// Migration utility for existing Qloo cached data
// Handles backward compatibility with old cache structures

import type { EnrichedPersonaData } from '@/lib/api/qloo-integration';
import { getQlooCacheManager } from '@/lib/api/qloo-cache-manager';

/**
 * Legacy cache entry structure (before refactoring)
 */
interface LegacyCacheEntry {
  data: any;
  timestamp: number;
  ttl?: number;
  version?: string;
}

/**
 * Legacy Qloo response structure
 */
interface LegacyQlooResponse {
  recommendations?: Array<{
    id: string;
    name: string;
    type: string;
    confidence?: number;
  }>;
  metadata?: {
    cached?: boolean;
    api_version?: string;
  };
}

/**
 * Migration service for Qloo cached data
 */
export class QlooMigrationService {
  private cacheManager = getQlooCacheManager();

  /**
   * Migrates all existing Qloo cache entries to new format
   */
  async migrateExistingCache(): Promise<{
    migrated: number;
    skipped: number;
    errors: string[];
  }> {
    const results = {
      migrated: 0,
      skipped: 0,
      errors: [] as string[]
    };

    try {
      // Get all cache keys that might contain legacy Qloo data
      const legacyKeys = await this.findLegacyCacheKeys();
      
      for (const key of legacyKeys) {
        try {
          const legacyEntry = await this.cacheManager.get<LegacyCacheEntry>(key);
          
          if (legacyEntry && this.isLegacyEntry(legacyEntry)) {
            const migratedData = this.migrateLegacyEntry(legacyEntry);
            
            if (migratedData) {
              // Store migrated data with new key structure
              const newKey = this.generateNewCacheKey(key);
              await this.cacheManager.set(newKey, migratedData, 3600000); // 1 hour TTL
              
              // Remove old cache entry
              await this.cacheManager.invalidate(key);
              
              results.migrated++;
            } else {
              results.skipped++;
            }
          } else {
            results.skipped++;
          }
        } catch (error) {
          results.errors.push(`Failed to migrate key ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      console.log(`Qloo cache migration completed: ${results.migrated} migrated, ${results.skipped} skipped, ${results.errors.length} errors`);
      
    } catch (error) {
      results.errors.push(`Migration process failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return results;
  }

  /**
   * Migrates legacy persona data to new enriched format
   */
  migrateLegacyPersonaData(legacyPersona: any): any {
    // If already in new format, return as-is
    if (legacyPersona.validation_metrics && legacyPersona.generation_metadata) {
      return legacyPersona;
    }

    // Migrate old persona structure to new enriched format
    const migratedPersona = {
      ...legacyPersona,
      validation_metrics: {
        completeness_score: 0.8, // Default score for migrated personas
        consistency_score: 0.8,
        realism_score: 0.8,
        quality_indicators: ['Migrated from legacy format']
      },
      generation_metadata: {
        gemini_response_time: 0,
        qloo_response_time: 0,
        total_processing_time: 0,
        confidence_level: 'medium' as const,
        data_sources: ['Legacy PersonaCraft', 'Migrated Data']
      }
    };

    // Ensure generatedAt is a Date object
    if (migratedPersona.generatedAt && typeof migratedPersona.generatedAt === 'string') {
      migratedPersona.generatedAt = new Date(migratedPersona.generatedAt);
    }

    return migratedPersona;
  }

  /**
   * Checks if cached data needs migration
   */
  needsMigration(data: any): boolean {
    // Check for old Qloo response format
    if (data && typeof data === 'object') {
      // Legacy format indicators
      const hasLegacyStructure = (
        data.recommendations && 
        !data.culturalInsights &&
        !data.metadata?.requestId
      );

      const hasOldPersonaFormat = (
        data.id && 
        data.name && 
        !data.validation_metrics &&
        !data.generation_metadata
      );

      return hasLegacyStructure || hasOldPersonaFormat;
    }

    return false;
  }

  /**
   * Migrates legacy Qloo response to new EnrichedPersonaData format
   */
  migrateLegacyQlooResponse(legacyResponse: LegacyQlooResponse): Partial<EnrichedPersonaData> | null {
    if (!legacyResponse.recommendations) {
      return null;
    }

    // Convert legacy recommendations to new cultural insights format
    const culturalInsights = {
      music: [] as any[],
      movies: [] as any[],
      brands: [] as any[],
      books: [] as any[],
      tvShows: [] as any[],
      restaurants: [] as any[],
      products: [] as any[]
    };

    legacyResponse.recommendations.forEach(rec => {
      const entity = {
        id: rec.id,
        name: rec.name,
        type: this.mapLegacyTypeToUrn(rec.type),
        confidence: rec.confidence || 0.7,
        description: `Migrated from legacy cache: ${rec.name}`,
        tags: []
      };

      // Categorize based on type
      switch (rec.type.toLowerCase()) {
        case 'music':
        case 'artist':
          culturalInsights.music.push(entity);
          break;
        case 'movies':
        case 'movie':
          culturalInsights.movies.push(entity);
          break;
        case 'brands':
        case 'brand':
          culturalInsights.brands.push(entity);
          break;
        case 'books':
        case 'book':
          culturalInsights.books.push(entity);
          break;
        default:
          culturalInsights.products.push(entity);
      }
    });

    return {
      culturalInsights,
      demographics: [],
      interests: [],
      confidence: 0.6,
      sources: {
        qloo: false,
        fallback: true,
        cached: true
      },
      metadata: {
        requestId: `migrated_${Date.now()}`,
        processingTime: 0,
        dataFlow: ['legacy_migration'],
        errors: [],
        warnings: ['Data migrated from legacy cache format']
      }
    };
  }

  /**
   * Finds cache keys that might contain legacy data
   */
  private async findLegacyCacheKeys(): Promise<string[]> {
    // This is a simplified implementation
    // In a real scenario, you'd iterate through all cache keys
    const possibleLegacyKeys = [
      'qloo:recommendations',
      'qloo:entities',
      'qloo:cultural_data',
      'persona:qloo_data'
    ];

    const existingKeys: string[] = [];
    
    for (const key of possibleLegacyKeys) {
      try {
        const exists = await this.cacheManager.get(key);
        if (exists) {
          existingKeys.push(key);
        }
      } catch (error) {
        // Key doesn't exist or error accessing it
      }
    }

    return existingKeys;
  }

  /**
   * Checks if an entry is in legacy format
   */
  private isLegacyEntry(entry: any): boolean {
    return (
      entry &&
      typeof entry === 'object' &&
      (
        (entry.data && entry.data.recommendations && !entry.data.culturalInsights) ||
        (entry.recommendations && !entry.culturalInsights) ||
        (!entry.version || entry.version < '2.0')
      )
    );
  }

  /**
   * Migrates a legacy cache entry to new format
   */
  private migrateLegacyEntry(legacyEntry: LegacyCacheEntry): any | null {
    const data = legacyEntry.data || legacyEntry;
    
    if (data.recommendations) {
      return this.migrateLegacyQlooResponse(data);
    }

    return null;
  }

  /**
   * Generates new cache key from legacy key
   */
  private generateNewCacheKey(legacyKey: string): string {
    const timestamp = Date.now();
    return `migrated:${legacyKey}:${timestamp}`;
  }

  /**
   * Maps legacy type strings to new URN format
   */
  private mapLegacyTypeToUrn(legacyType: string): string {
    const typeMap: Record<string, string> = {
      'music': 'urn:entity:artist',
      'artist': 'urn:entity:artist',
      'movies': 'urn:entity:movie',
      'movie': 'urn:entity:movie',
      'brands': 'urn:entity:brand',
      'brand': 'urn:entity:brand',
      'books': 'urn:entity:book',
      'book': 'urn:entity:book',
      'tv_show': 'urn:entity:tv_show',
      'restaurant': 'urn:entity:restaurant',
      'product': 'urn:entity:product'
    };

    return typeMap[legacyType.toLowerCase()] || 'urn:entity:product';
  }
}

// Export singleton instance
let migrationService: QlooMigrationService | null = null;

export function getQlooMigrationService(): QlooMigrationService {
  if (!migrationService) {
    migrationService = new QlooMigrationService();
  }
  return migrationService;
}

/**
 * Utility function to migrate persona data in localStorage
 */
export function migrateLocalStoragePersonas(): void {
  try {
    if (typeof window === 'undefined') return;

    const storedPersonas = localStorage.getItem('personacraft-personas');
    if (!storedPersonas) return;

    const personas = JSON.parse(storedPersonas);
    const migrationService = getQlooMigrationService();
    
    let needsUpdate = false;
    const migratedPersonas = personas.map((persona: any) => {
      if (migrationService.needsMigration(persona)) {
        needsUpdate = true;
        return migrationService.migrateLegacyPersonaData(persona);
      }
      return persona;
    });

    if (needsUpdate) {
      localStorage.setItem('personacraft-personas', JSON.stringify(migratedPersonas));
      console.log(`Migrated ${personas.length} personas to new format`);
    }

  } catch (error) {
    console.error('Error migrating localStorage personas:', error);
  }
}