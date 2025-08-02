import { describe, it, expect, beforeEach } from 'vitest';
import { CulturalDataMigrationService } from '../cultural-data-migration-service';
import { Persona } from '@/types';

describe('CulturalDataMigrationService - Enhanced Validation', () => {
  let migrationService: CulturalDataMigrationService;
  let mockPersona: Persona;

  beforeEach(() => {
    migrationService = new CulturalDataMigrationService();
    
    mockPersona = {
      id: 'test-persona-validation',
      name: 'Validation Test Persona',
      age: 30,
      occupation: 'Designer',
      location: 'New York',
      bio: 'Creative professional',
      quote: 'Design is everything',
      demographics: {
        income: 'Medium',
        education: 'Master\'s degree',
        familyStatus: 'Married'
      },
      psychographics: {
        interests: ['design', 'art', 'technology'],
        values: ['creativity', 'quality'],
        lifestyle: 'Urban creative',
        personality: ['Creative', 'Detail-oriented']
      },
      culturalData: {
        music: ['Spotify', 'Indie Artists', 'Jazz'],
        movie: ['Art Films', 'Documentaries', 'Netflix'],
        tv: ['Design Shows', 'Creative Documentaries'],
        book: ['Design Books', 'Art History', 'Biographies'],
        brand: ['Apple', 'Adobe', 'IKEA'],
        restaurant: ['Artisan Cafes', 'Farm-to-table', 'International'],
        travel: ['Art Museums', 'Design Cities', 'Cultural Tours'],
        fashion: ['Sustainable Fashion', 'Minimalist', 'Vintage'],
        beauty: ['Natural Beauty', 'Eco-friendly'],
        food: ['Organic', 'Local', 'Artisan'],
        socialMedia: ['Instagram', 'Pinterest', 'Behance']
      },
      painPoints: ['Creative blocks', 'Client communication'],
      goals: ['Build portfolio', 'Start own studio'],
      marketingInsights: {
        preferredChannels: ['Visual platforms', 'Design communities'],
        messagingTone: 'Inspiring and authentic',
        buyingBehavior: 'Quality-focused'
      },
      qualityScore: 90,
      createdAt: '2024-01-01T00:00:00Z'
    };
  });

  describe('validateDataIntegrityDetailed', () => {
    it('should validate successful migration with high score', async () => {
      const originalData = {
        culturalData: mockPersona.culturalData,
        socialMediaInsights: mockPersona.socialMediaInsights
      };

      const migratedPersona = await migrationService.migratePersona(mockPersona);
      const validationResult = migrationService.validateDataIntegrityDetailed(originalData, migratedPersona);

      expect(validationResult.isValid).toBe(true);
      expect(validationResult.errors).toHaveLength(0);
      expect(validationResult.score).toBeGreaterThan(80);
      expect(validationResult.details.culturalDataPreserved).toBe(true);
      expect(validationResult.details.metadataConsistent).toBe(true);
      expect(validationResult.details.analyticsComplete).toBe(true);
    });

    it('should detect missing categories and penalize score', () => {
      const originalData = {
        culturalData: mockPersona.culturalData,
        socialMediaInsights: mockPersona.socialMediaInsights
      };

      const incompleteMigratedPersona = {
        ...mockPersona,
        culturalInsights: {
          music: {
            category: 'music',
            items: [{ name: 'Spotify', relevanceScore: 80, confidence: 0.8, source: 'user' as const }],
            metadata: {
              generatedAt: new Date().toISOString(),
              source: 'user' as const,
              dataQuality: 'medium' as const,
              enrichmentLevel: 70
            },
            analytics: {
              preferences: { primaryPreferences: ['Spotify'], secondaryPreferences: [], emergingInterests: [], preferenceStrength: 80 },
              behavioralInfluence: { purchaseInfluence: 40, socialInfluence: 70, lifestyleAlignment: 75, emotionalConnection: 85 },
              demographicAlignment: { ageGroupAlignment: 70, locationAlignment: 60, occupationAlignment: 65, overallFit: 65 },
              trends: { currentTrends: ['Spotify'], emergingTrends: [], trendAlignment: 50, innovatorScore: 30 }
            }
          }
          // Missing other categories
        } as any
      };

      const validationResult = migrationService.validateDataIntegrityDetailed(originalData, incompleteMigratedPersona);

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.length).toBeGreaterThan(0);
      expect(validationResult.score).toBeLessThan(50);
      expect(validationResult.details.culturalDataPreserved).toBe(false);
    });

    it('should detect missing items within categories', () => {
      const originalData = {
        culturalData: mockPersona.culturalData,
        socialMediaInsights: mockPersona.socialMediaInsights
      };

      const incompleteMigratedPersona = {
        ...mockPersona,
        culturalInsights: {
          music: {
            category: 'music',
            items: [{ name: 'Spotify' }], // Missing other music items
            metadata: { generatedAt: new Date().toISOString(), source: 'user', dataQuality: 'medium', enrichmentLevel: 70 },
            analytics: {
              preferences: { primaryPreferences: [], secondaryPreferences: [], emergingInterests: [], preferenceStrength: 0 },
              behavioralInfluence: { purchaseInfluence: 0, socialInfluence: 0, lifestyleAlignment: 0, emotionalConnection: 0 },
              demographicAlignment: { ageGroupAlignment: 0, locationAlignment: 0, occupationAlignment: 0, overallFit: 0 },
              trends: { currentTrends: [], emergingTrends: [], trendAlignment: 0, innovatorScore: 0 }
            }
          }
        } as any
      };

      const validationResult = migrationService.validateDataIntegrityDetailed(originalData, incompleteMigratedPersona);

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.some(error => error.includes('missing in migrated music data'))).toBe(true);
    });

    it('should validate metadata consistency', async () => {
      const migratedPersona = await migrationService.migratePersona(mockPersona);
      
      // Corrupt metadata
      if (migratedPersona.culturalInsights) {
        migratedPersona.culturalInsights.music.metadata.generatedAt = '';
        migratedPersona.culturalInsights.music.metadata.enrichmentLevel = 150; // Out of range
      }

      const originalData = {
        culturalData: mockPersona.culturalData,
        socialMediaInsights: mockPersona.socialMediaInsights
      };

      const validationResult = migrationService.validateDataIntegrityDetailed(originalData, migratedPersona);

      expect(validationResult.details.metadataConsistent).toBe(false);
      expect(validationResult.warnings.some(warning => warning.includes('out of range'))).toBe(true);
    });

    it('should validate analytics completeness', async () => {
      const migratedPersona = await migrationService.migratePersona(mockPersona);
      
      // Remove analytics
      if (migratedPersona.culturalInsights) {
        delete (migratedPersona.culturalInsights.music as any).analytics;
      }

      const originalData = {
        culturalData: mockPersona.culturalData,
        socialMediaInsights: mockPersona.socialMediaInsights
      };

      const validationResult = migrationService.validateDataIntegrityDetailed(originalData, migratedPersona);

      expect(validationResult.details.analyticsComplete).toBe(false);
      expect(validationResult.errors.some(error => error.includes('Analytics missing'))).toBe(true);
    });

    it('should validate behavioral influence ranges', async () => {
      const migratedPersona = await migrationService.migratePersona(mockPersona);
      
      // Set invalid behavioral influence values
      if (migratedPersona.culturalInsights) {
        migratedPersona.culturalInsights.music.analytics.behavioralInfluence.purchaseInfluence = 150; // Out of range
        migratedPersona.culturalInsights.music.analytics.behavioralInfluence.socialInfluence = -10; // Out of range
      }

      const originalData = {
        culturalData: mockPersona.culturalData,
        socialMediaInsights: mockPersona.socialMediaInsights
      };

      const validationResult = migrationService.validateDataIntegrityDetailed(originalData, migratedPersona);

      expect(validationResult.warnings.some(warning => 
        warning.includes('purchaseInfluence value out of range')
      )).toBe(true);
      expect(validationResult.warnings.some(warning => 
        warning.includes('socialInfluence value out of range')
      )).toBe(true);
    });
  });

  describe('rollback functionality', () => {
    it('should create rollback data', () => {
      const rollbackData = migrationService.createRollbackData(mockPersona);

      expect(rollbackData.personaId).toBe(mockPersona.id);
      expect(rollbackData.timestamp).toBeDefined();
      expect(rollbackData.originalCulturalData).toEqual(mockPersona.culturalData);
      expect(rollbackData.checksum).toBeDefined();
    });

    it('should successfully rollback a migration', async () => {
      const rollbackData = migrationService.createRollbackData(mockPersona);
      const migratedPersona = await migrationService.migratePersona(mockPersona);
      
      const rolledBackPersona = migrationService.rollbackMigration(migratedPersona, rollbackData);

      expect(rolledBackPersona.culturalData).toEqual(mockPersona.culturalData);
      expect(rolledBackPersona.culturalInsights).toBeUndefined();
      expect(rolledBackPersona.socialMediaInsights).toEqual(mockPersona.socialMediaInsights);
    });

    it('should handle rollback with persona ID mismatch', async () => {
      const rollbackData = migrationService.createRollbackData(mockPersona);
      const migratedPersona = await migrationService.migratePersona(mockPersona);
      
      // Change persona ID to create mismatch
      migratedPersona.id = 'different-id';

      expect(() => {
        migrationService.rollbackMigration(migratedPersona, rollbackData);
      }).toThrow('Rollback data persona ID mismatch');
    });

    it('should handle rollback with social media insights', async () => {
      const personaWithSocial = {
        ...mockPersona,
        socialMediaInsights: {
          insights: {
            audienceMatches: [{ name: 'Designer Community', relevanceFactors: ['design'], estimatedFollowingOverlap: 80 }],
            brandInfluence: [{ brand: 'Adobe', category: 'Software', platforms: ['Instagram'], relevanceScore: 90 }],
            contentPreferences: ['Design Tutorials'],
            demographicAlignment: [{ ageGroup: '25-35', primaryPlatforms: ['Instagram'], engagementStyle: 'Visual' }]
          },
          platforms: ['Instagram', 'Pinterest']
        }
      };

      const rollbackData = migrationService.createRollbackData(personaWithSocial);
      const migratedPersona = await migrationService.migratePersona(personaWithSocial);
      
      const rolledBackPersona = migrationService.rollbackMigration(migratedPersona, rollbackData);

      expect(rolledBackPersona.socialMediaInsights).toEqual(personaWithSocial.socialMediaInsights);
    });
  });

  describe('migration logging', () => {
    it('should log migration activities', async () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
      
      migrationService.logMigrationActivity(
        mockPersona.id,
        'test_operation',
        { test: 'data' },
        'info'
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Migration test_operation'),
        expect.objectContaining({
          personaId: mockPersona.id,
          operation: 'test_operation'
        })
      );

      consoleSpy.mockRestore();
    });

    it('should track logs in migration status', async () => {
      await migrationService.migratePersona(mockPersona);
      
      migrationService.logMigrationActivity(
        mockPersona.id,
        'post_migration_check',
        { status: 'completed' }
      );

      const migrationStatus = migrationService.getMigrationStatus(mockPersona.id);
      expect(migrationStatus?.logs).toBeDefined();
      expect(migrationStatus?.logs?.length).toBeGreaterThan(0);
    });

    it('should handle different log levels', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      migrationService.logMigrationActivity(mockPersona.id, 'warning_test', {}, 'warn');
      migrationService.logMigrationActivity(mockPersona.id, 'error_test', {}, 'error');

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('checksum calculation', () => {
    it('should generate consistent checksums for same data', () => {
      const rollbackData1 = migrationService.createRollbackData(mockPersona);
      const rollbackData2 = migrationService.createRollbackData(mockPersona);

      expect(rollbackData1.checksum).toBe(rollbackData2.checksum);
    });

    it('should generate different checksums for different data', () => {
      const modifiedPersona = {
        ...mockPersona,
        culturalData: {
          ...mockPersona.culturalData,
          music: ['Different Music']
        }
      };

      const rollbackData1 = migrationService.createRollbackData(mockPersona);
      const rollbackData2 = migrationService.createRollbackData(modifiedPersona);

      expect(rollbackData1.checksum).not.toBe(rollbackData2.checksum);
    });
  });

  describe('edge cases in validation', () => {
    it('should handle missing cultural insights in validation', () => {
      const originalData = {
        culturalData: mockPersona.culturalData,
        socialMediaInsights: mockPersona.socialMediaInsights
      };

      const personaWithoutInsights = {
        ...mockPersona,
        culturalInsights: undefined
      };

      const validationResult = migrationService.validateDataIntegrityDetailed(originalData, personaWithoutInsights);

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.score).toBe(0);
    });

    it('should handle validation errors gracefully', () => {
      const originalData = {
        culturalData: mockPersona.culturalData,
        socialMediaInsights: mockPersona.socialMediaInsights
      };

      // Create a persona that will cause validation errors
      const problematicPersona = {
        ...mockPersona,
        culturalInsights: null as any
      };

      const validationResult = migrationService.validateDataIntegrityDetailed(originalData, problematicPersona);

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.length).toBeGreaterThan(0);
      expect(validationResult.score).toBe(0);
    });
  });
});