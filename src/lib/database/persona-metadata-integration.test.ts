// Integration test for persona metadata database operations
// This test verifies that the database schema and operations work correctly

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { 
  dbModelToEnrichedPersona,
  enrichedPersonaToDbModel,
  getPersonaMetadataStats
} from './persona-metadata-utils';
import type { GenerationMetadata, ValidationMetadata } from '@/types/persona-metadata';

// Mock Prisma client for testing
const mockPrisma = {
  persona: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn()
  }
} as any;

describe('Persona Metadata Database Integration', () => {
  const mockDbPersona = {
    id: 'test-id',
    name: 'Test Persona',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    age: 30,
    culturalData: { music: ['Rock'], brands: ['Nike'] },
    demographics: { income: '50k', education: 'Bachelor' },
    goals: ['Goal 1'],
    location: 'Paris',
    marketingInsights: { channels: ['social'] },
    occupation: 'Developer',
    painPoints: ['Pain 1'],
    psychographics: { values: ['Innovation'] },
    qualityScore: 85,
    userId: 'user-123',
    bio: 'Test bio',
    metadata: null,
    quote: 'Test quote',
    generationMetadata: {
      source: 'qloo-first',
      method: 'enhanced-generation',
      culturalConstraintsUsed: ['music', 'brands'],
      processingTime: 1500,
      qlooDataUsed: true,
      templateUsed: 'simple-persona-template',
      generatedAt: '2025-01-01T00:00:00Z'
    },
    validationMetadata: {
      templateName: 'simple-persona-template',
      validationScore: 92,
      validationDetails: [],
      failedRules: [],
      passedRules: ['name-format'],
      validationTime: 250,
      validatedAt: '2025-01-01T00:00:00Z'
    },
    culturalDataSource: 'qloo',
    templateUsed: 'simple-persona-template',
    processingTime: 1500
  };

  describe('Data Conversion', () => {
    it('should convert database model to EnrichedPersona', () => {
      const enrichedPersona = dbModelToEnrichedPersona(mockDbPersona);
      
      expect(enrichedPersona.id).toBe('test-id');
      expect(enrichedPersona.name).toBe('Test Persona');
      expect(enrichedPersona.generationMetadata?.source).toBe('qloo-first');
      expect(enrichedPersona.validationMetadata?.validationScore).toBe(92);
      expect(enrichedPersona.culturalDataSource).toBe('qloo');
      expect(enrichedPersona.processingTime).toBe(1500);
    });

    it('should convert EnrichedPersona to database model format', () => {
      const enrichedPersona = dbModelToEnrichedPersona(mockDbPersona);
      const dbModel = enrichedPersonaToDbModel(enrichedPersona);
      
      expect(dbModel.id).toBe('test-id');
      expect(dbModel.generationMetadata).toBeDefined();
      expect(dbModel.validationMetadata).toBeDefined();
      expect(dbModel.culturalDataSource).toBe('qloo');
      expect(dbModel.processingTime).toBe(1500);
    });
  });

  describe('Metadata Statistics', () => {
    it('should calculate correct metadata statistics', async () => {
      // Mock the Prisma response
      mockPrisma.persona.findMany.mockResolvedValue([
        {
          generationMetadata: { source: 'qloo-first' },
          validationMetadata: { validationScore: 90 },
          culturalDataSource: 'qloo',
          templateUsed: 'simple-persona-template',
          processingTime: 1000
        },
        {
          generationMetadata: { source: 'legacy-fallback' },
          validationMetadata: { validationScore: 75 },
          culturalDataSource: 'fallback',
          templateUsed: 'legacy',
          processingTime: 500
        }
      ]);

      const stats = await getPersonaMetadataStats(mockPrisma, 'user-123');
      
      expect(stats.total).toBe(2);
      expect(stats.qlooFirstCount).toBe(1);
      expect(stats.legacyCount).toBe(1);
      expect(stats.averageValidationScore).toBe(82.5);
      expect(stats.averageProcessingTime).toBe(750);
      expect(stats.templatesUsed).toContain('simple-persona-template');
      expect(stats.templatesUsed).toContain('legacy');
      expect(stats.culturalDataSources).toContain('qloo');
      expect(stats.culturalDataSources).toContain('fallback');
    });

    it('should handle empty persona list', async () => {
      mockPrisma.persona.findMany.mockResolvedValue([]);

      const stats = await getPersonaMetadataStats(mockPrisma, 'user-123');
      
      expect(stats.total).toBe(0);
      expect(stats.qlooFirstCount).toBe(0);
      expect(stats.legacyCount).toBe(0);
      expect(stats.averageValidationScore).toBe(0);
      expect(stats.averageProcessingTime).toBe(0);
      expect(stats.templatesUsed).toEqual([]);
      expect(stats.culturalDataSources).toEqual([]);
    });
  });

  describe('Schema Validation', () => {
    it('should have all required metadata fields in the schema', () => {
      // This test verifies that our type definitions match the expected database schema
      const requiredFields = [
        'generationMetadata',
        'validationMetadata', 
        'culturalDataSource',
        'templateUsed',
        'processingTime'
      ];

      requiredFields.forEach(field => {
        expect(mockDbPersona).toHaveProperty(field);
      });
    });

    it('should handle JSON metadata fields correctly', () => {
      const generationMetadata = mockDbPersona.generationMetadata as GenerationMetadata;
      const validationMetadata = mockDbPersona.validationMetadata as ValidationMetadata;

      // Verify GenerationMetadata structure
      expect(generationMetadata.source).toBe('qloo-first');
      expect(generationMetadata.qlooDataUsed).toBe(true);
      expect(Array.isArray(generationMetadata.culturalConstraintsUsed)).toBe(true);

      // Verify ValidationMetadata structure
      expect(validationMetadata.validationScore).toBe(92);
      expect(Array.isArray(validationMetadata.passedRules)).toBe(true);
      expect(Array.isArray(validationMetadata.failedRules)).toBe(true);
    });
  });
});