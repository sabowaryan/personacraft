import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CulturalDataMigrationService, MigrationIntegrityValidator } from '../cultural-data-migration-service';
import { Persona, CulturalData, SocialMediaInsights } from '@/types';
import { CulturalInsights } from '@/types/cultural-insights';

// Mock the CulturalInsightEngine
vi.mock('@/lib/engines/cultural-insight-engine', () => ({
  CulturalInsightEngine: vi.fn().mockImplementation(() => ({
    generateInsights: vi.fn(),
    enrichCategory: vi.fn()
  }))
}));

describe('CulturalDataMigrationService - Data Integrity Validation', () => {
  let migrationService: CulturalDataMigrationService;
  let integrityValidator: MigrationIntegrityValidator;
  let mockPersona: Persona;

  beforeEach(() => {
    migrationService = new CulturalDataMigrationService();
    integrityValidator = new MigrationIntegrityValidator();

    // Create mock persona with cultural data
    mockPersona = {
      id: 'test-persona-1',
      name: 'Test Persona',
      age: 28,
      occupation: 'Software Developer',
      location: 'San Francisco',
      culturalData: {
        music: ['Taylor Swift', 'The Beatles', 'Billie Eilish'],
        brand: ['Apple', 'Nike', 'Tesla'],
        movie: ['Inception', 'The Matrix', 'Interstellar'],
        tv: ['Breaking Bad', 'Game of Thrones', 'Stranger Things'],
        book: ['1984', 'To Kill a Mockingbird', 'The Great Gatsby'],
        restaurant: ['Chipotle', 'In-N-Out', 'Starbucks'],
        travel: ['Paris', 'Tokyo', 'New York'],
        fashion: ['Zara', 'H&M', 'Uniqlo'],
        beauty: ['Sephora', 'MAC', 'Glossier'],
        food: ['Pizza', 'Sushi', 'Tacos'],
        socialMedia: ['Instagram', 'TikTok', 'Twitter']
      },
      socialMediaInsights: {
        insights: {
          audienceMatches: [
            { name: 'Instagram Fashion', estimatedFollowingOverlap: 75 },
            { name: 'TikTok Tech', estimatedFollowingOverlap: 60 }
          ],
          brandInfluence: [
            { brand: 'Apple', relevanceScore: 85, platforms: ['Instagram', 'Twitter'] },
            { brand: 'Nike', relevanceScore: 70, platforms: ['TikTok', 'Instagram'] }
          ],
          demographicAlignment: [
            { ageGroup: '25-34', primaryPlatforms: ['Instagram', 'Twitter'] }
          ],
          contentPreferences: ['Tech Reviews', 'Fashion', 'Travel']
        }
      },
      psychographics: {
        interests: ['Technology', 'Fashion', 'Travel'],
        values: ['Innovation', 'Sustainability'],
        lifestyle: 'Urban Professional'
      }
    } as Persona;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('MigrationIntegrityValidator', () => {
    describe('createRollbackData', () => {
      it('should create comprehensive rollback data', () => {
        const rollbackData = integrityValidator.createRollbackData(mockPersona);

        expect(rollbackData).toMatchObject({
          personaId: mockPersona.id,
          originalCulturalData: mockPersona.culturalData,
          originalSocialMediaInsights: mockPersona.socialMediaInsights,
          backupMetadata: {
            version: '1.0',
            createdBy: 'migration-service',
            categories: Object.keys(mockPersona.culturalData),
            hasSocialMedia: true
          }
        });

        expect(rollbackData.timestamp).toBeDefined();
        expect(rollbackData.checksum).toBeDefined();
        expect(rollbackData.backupMetadata.dataSize).toBeGreaterThan(0);
      });

      it('should handle persona without social media insights', () => {
        const personaWithoutSocial = { ...mockPersona, socialMediaInsights: undefined };
        const rollbackData = integrityValidator.createRollbackData(personaWithoutSocial);

        expect(rollbackData.originalSocialMediaInsights).toBeUndefined();
        expect(rollbackData.backupMetadata.hasSocialMedia).toBe(false);
      });

      it('should store rollback data for retrieval', () => {
        integrityValidator.createRollbackData(mockPersona);
        
        expect(integrityValidator.hasRollbackData(mockPersona.id)).toBe(true);
        expect(integrityValidator.getRollbackData(mockPersona.id)).toBeDefined();
      });
    });

    describe('rollbackMigration', () => {
      it('should successfully rollback a failed migration', async () => {
        // Create rollback data
        const rollbackData = integrityValidator.createRollbackData(mockPersona);

        // Simulate a migrated persona with cultural insights
        const migratedPersona: Persona = {
          ...mockPersona,
          culturalInsights: {} as CulturalInsights // Mock migrated insights
        };

        // Perform rollback
        const restoredPersona = await integrityValidator.rollbackMigration(migratedPersona);

        expect(restoredPersona.culturalData).toEqual(mockPersona.culturalData);
        expect(restoredPersona.socialMediaInsights).toEqual(mockPersona.socialMediaInsights);
        expect(restoredPersona.culturalInsights).toBeUndefined();
      });

      it('should fail rollback with mismatched persona ID', async () => {
        const rollbackData = integrityValidator.createRollbackData(mockPersona);
        const differentPersona = { ...mockPersona, id: 'different-id' };

        await expect(
          integrityValidator.rollbackMigration(differentPersona)
        ).rejects.toThrow('No rollback data found for persona different-id');
      });

      it('should fail rollback when no rollback data exists', async () => {
        const personaWithoutRollback = { ...mockPersona, id: 'no-rollback' };

        await expect(
          integrityValidator.rollbackMigration(personaWithoutRollback)
        ).rejects.toThrow('No rollback data found');
      });

      it('should clean up rollback data after successful rollback', async () => {
        integrityValidator.createRollbackData(mockPersona);
        const migratedPersona = { ...mockPersona, culturalInsights: {} as CulturalInsights };

        await integrityValidator.rollbackMigration(migratedPersona);

        expect(integrityValidator.hasRollbackData(mockPersona.id)).toBe(false);
      });
    });

    describe('logMigrationActivity', () => {
      it('should log migration activities with proper structure', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

        integrityValidator.logMigrationActivity(
          mockPersona.id,
          'test_operation',
          { testData: 'value' },
          'info'
        );

        const logs = integrityValidator.getMigrationLogs(mockPersona.id);
        expect(logs).toHaveLength(1);
        expect(logs[0]).toMatchObject({
          personaId: mockPersona.id,
          operation: 'test_operation',
          details: { testData: 'value' },
          level: 'info'
        });

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });

      it('should handle different log levels', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        integrityValidator.logMigrationActivity(mockPersona.id, 'error_op', {}, 'error');
        integrityValidator.logMigrationActivity(mockPersona.id, 'warn_op', {}, 'warn');

        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(consoleWarnSpy).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
      });

      it('should maintain log size limit', () => {
        // Add more than 1000 logs
        for (let i = 0; i < 1005; i++) {
          integrityValidator.logMigrationActivity(
            `persona-${i}`,
            'bulk_operation',
            { index: i },
            'info'
          );
        }

        const allLogs = integrityValidator.getAllMigrationLogs();
        expect(allLogs.length).toBe(1000);
      });
    });

    describe('getMigrationLogs', () => {
      beforeEach(() => {
        // Add some test logs
        integrityValidator.logMigrationActivity(mockPersona.id, 'op1', {}, 'info');
        integrityValidator.logMigrationActivity(mockPersona.id, 'op2', {}, 'warn');
        integrityValidator.logMigrationActivity('other-persona', 'op3', {}, 'error');
      });

      it('should filter logs by persona ID', () => {
        const logs = integrityValidator.getMigrationLogs(mockPersona.id);
        expect(logs).toHaveLength(2);
        expect(logs.every(log => log.personaId === mockPersona.id)).toBe(true);
      });

      it('should filter logs by level', () => {
        const errorLogs = integrityValidator.getAllMigrationLogs({ level: 'error' });
        expect(errorLogs).toHaveLength(1);
        expect(errorLogs[0].level).toBe('error');
      });

      it('should filter logs by operation', () => {
        const op1Logs = integrityValidator.getAllMigrationLogs({ operation: 'op1' });
        expect(op1Logs).toHaveLength(1);
        expect(op1Logs[0].operation).toBe('op1');
      });

      it('should limit log results', () => {
        const limitedLogs = integrityValidator.getAllMigrationLogs({ limit: 2 });
        expect(limitedLogs.length).toBeLessThanOrEqual(2);
      });
    });

    describe('exportMigrationLogs', () => {
      beforeEach(() => {
        integrityValidator.logMigrationActivity(mockPersona.id, 'test_op', { data: 'test' }, 'info');
      });

      it('should export logs as JSON', () => {
        const jsonExport = integrityValidator.exportMigrationLogs('json');
        const parsed = JSON.parse(jsonExport);
        
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed.length).toBeGreaterThan(0);
        expect(parsed[0]).toHaveProperty('personaId');
        expect(parsed[0]).toHaveProperty('operation');
      });

      it('should export logs as CSV', () => {
        const csvExport = integrityValidator.exportMigrationLogs('csv');
        const lines = csvExport.split('\n');
        
        expect(lines[0]).toContain('timestamp,personaId,operation,level,details');
        expect(lines.length).toBeGreaterThan(1);
      });
    });

    describe('cleanupRollbackData', () => {
      it('should remove old rollback data', async () => {
        // Create rollback data
        integrityValidator.createRollbackData(mockPersona);
        
        // Verify it exists
        expect(integrityValidator.hasRollbackData(mockPersona.id)).toBe(true);
        
        // Wait a small amount to ensure timestamp difference
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // Clean up data older than 0 hours (should remove all)
        integrityValidator.cleanupRollbackData(0);
        
        // Verify it's removed
        expect(integrityValidator.hasRollbackData(mockPersona.id)).toBe(false);
      });

      it('should preserve recent rollback data', () => {
        integrityValidator.createRollbackData(mockPersona);
        
        // Clean up data older than 24 hours (should preserve recent data)
        integrityValidator.cleanupRollbackData(24);
        
        expect(integrityValidator.hasRollbackData(mockPersona.id)).toBe(true);
      });
    });
  });

  describe('CulturalDataMigrationService Integration', () => {
    describe('enhanced migration with integrity validation', () => {
      it('should create rollback data before migration', async () => {
        // Mock the migration methods to avoid actual Qloo calls
        vi.spyOn(migrationService, 'migrateCulturalData').mockResolvedValue({} as CulturalInsights);
        vi.spyOn(migrationService, 'migrateSocialMediaInsights').mockResolvedValue({
          category: 'socialMedia',
          items: [],
          metadata: { generatedAt: '', source: 'user', dataQuality: 'medium', enrichmentLevel: 50 },
          analytics: {
            preferences: { primaryPreferences: [], secondaryPreferences: [], emergingInterests: [], preferenceStrength: 0 },
            behavioralInfluence: { purchaseInfluence: 0, socialInfluence: 0, lifestyleAlignment: 0, emotionalConnection: 0 },
            demographicAlignment: { ageGroupAlignment: 0, locationAlignment: 0, occupationAlignment: 0, overallFit: 0 },
            trends: { currentTrends: [], emergingTrends: [], trendAlignment: 0, innovatorScore: 0 }
          }
        });

        await migrationService.migratePersona(mockPersona);

        expect(migrationService.hasRollbackData(mockPersona.id)).toBe(true);
      });

      it('should log migration activities during migration', async () => {
        vi.spyOn(migrationService, 'migrateCulturalData').mockResolvedValue({} as CulturalInsights);
        
        await migrationService.migratePersona(mockPersona);

        const logs = migrationService.getDetailedMigrationLogs(mockPersona.id);
        expect(logs.length).toBeGreaterThan(0);
        
        const operationTypes = logs.map(log => log.operation);
        expect(operationTypes).toContain('migration_started');
        expect(operationTypes).toContain('cultural_data_migration_started');
      });

      it('should handle migration failure with proper logging', async () => {
        vi.spyOn(migrationService, 'migrateCulturalData').mockRejectedValue(new Error('Migration failed'));

        await expect(migrationService.migratePersona(mockPersona)).rejects.toThrow('Migration failed');

        const logs = migrationService.getDetailedMigrationLogs(mockPersona.id);
        const errorLogs = logs.filter(log => log.level === 'error');
        expect(errorLogs.length).toBeGreaterThan(0);
      });
    });

    describe('rollbackFailedMigration', () => {
      it('should successfully rollback a failed migration', async () => {
        // First create rollback data
        const integrityValidator = new MigrationIntegrityValidator();
        integrityValidator.createRollbackData(mockPersona);
        
        // Simulate migrated persona
        const migratedPersona = {
          ...mockPersona,
          culturalInsights: {} as CulturalInsights
        };

        // Mock the internal validator
        (migrationService as any).integrityValidator = integrityValidator;

        const restoredPersona = await migrationService.rollbackFailedMigration(migratedPersona);

        expect(restoredPersona.culturalData).toEqual(mockPersona.culturalData);
        expect(restoredPersona.culturalInsights).toBeUndefined();
      });
    });

    describe('validatePersonaIntegrity', () => {
      it('should validate persona integrity without migration', () => {
        const result = migrationService.validatePersonaIntegrity(mockPersona);

        expect(result).toHaveProperty('isValid');
        expect(result).toHaveProperty('errors');
        expect(result).toHaveProperty('warnings');
        expect(result).toHaveProperty('score');
        expect(result).toHaveProperty('details');
      });
    });

    describe('utility methods', () => {
      it('should export migration logs', () => {
        const jsonExport = migrationService.exportMigrationLogs('json');
        expect(typeof jsonExport).toBe('string');
        
        const csvExport = migrationService.exportMigrationLogs('csv');
        expect(typeof csvExport).toBe('string');
        expect(csvExport).toContain('timestamp,personaId');
      });

      it('should clean up old data', () => {
        migrationService.cleanupOldData(0); // Should not throw
      });

      it('should clear migration logs', () => {
        migrationService.clearMigrationLogs();
        // Should not throw and should clear internal logs
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle persona with null cultural data', () => {
      const personaWithNullData = {
        ...mockPersona,
        culturalData: null as any
      };

      const rollbackData = integrityValidator.createRollbackData(personaWithNullData);
      expect(rollbackData.originalCulturalData).toBeNull();
    });

    it('should handle persona with empty cultural data', () => {
      const personaWithEmptyData = {
        ...mockPersona,
        culturalData: {} as CulturalData
      };

      const rollbackData = integrityValidator.createRollbackData(personaWithEmptyData);
      expect(rollbackData.backupMetadata.categories).toEqual([]);
    });

    it('should handle rollback validation with corrupted data', async () => {
      const rollbackData = integrityValidator.createRollbackData(mockPersona);
      
      // Corrupt the rollback data
      rollbackData.originalCulturalData = null as any;
      
      const migratedPersona = { ...mockPersona, culturalInsights: {} as CulturalInsights };
      
      await expect(
        integrityValidator.rollbackMigration(migratedPersona, rollbackData)
      ).rejects.toThrow();
    });

    it('should handle checksum calculation with various data types', () => {
      const personaWithComplexData = {
        ...mockPersona,
        culturalData: {
          ...mockPersona.culturalData,
          complexField: { nested: { data: [1, 2, 3] } }
        } as any
      };

      const rollbackData = integrityValidator.createRollbackData(personaWithComplexData);
      expect(rollbackData.checksum).toBeDefined();
      expect(typeof rollbackData.checksum).toBe('string');
    });
  });
});