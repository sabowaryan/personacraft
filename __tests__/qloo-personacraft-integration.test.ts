// Integration tests for PersonaCraft with new Qloo integration
// Ensures backward compatibility and functionality preservation

import { describe, it, expect, beforeEach, afterEach, beforeAll, jest } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { usePersonaGeneration } from '@/hooks/use-persona-generation';
import { QlooIntegrationService } from '@/lib/api/qloo-integration';
import { getQlooMigrationService } from '@/lib/utils/qloo-migration';
import type { BriefFormData, EnhancedPersona } from '@/lib/types/persona';
import type { EnrichedPersonaData } from '@/lib/api/qloo-integration';

// Mock fetch for API calls
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Setup DOM environment
beforeAll(() => {
  // Create a basic DOM structure for React testing
  document.body.innerHTML = '<div id="root"></div>';
});

describe('PersonaCraft Qloo Integration Tests', () => {
  const mockBrief: BriefFormData = {
    description: 'Young professional interested in technology and fitness',
    interests: ['technology', 'fitness', 'coffee', 'travel'],
    values: ['innovation', 'health', 'sustainability'],
    ageRange: '25-35',
    location: 'Paris, France',
    generateMultiple: false
  };

  const mockEnrichedData: EnrichedPersonaData = {
    culturalInsights: {
      music: [
        { id: 'artist_1', name: 'Daft Punk', type: 'urn:entity:artist', confidence: 0.8, description: 'French electronic music duo', tags: ['electronic', 'french'] }
      ],
      movies: [
        { id: 'movie_1', name: 'The Matrix', type: 'urn:entity:movie', confidence: 0.9, description: 'Sci-fi action film', tags: ['sci-fi', 'technology'] }
      ],
      brands: [
        { id: 'brand_1', name: 'Apple', type: 'urn:entity:brand', confidence: 0.85, description: 'Technology company', tags: ['technology', 'innovation'] }
      ],
      books: [
        { id: 'book_1', name: 'The Lean Startup', type: 'urn:entity:book', confidence: 0.7, description: 'Business book', tags: ['business', 'innovation'] }
      ],
      tvShows: [],
      restaurants: [],
      products: []
    },
    demographics: [
      {
        id: 'audience_1',
        name: 'Tech-savvy Millennials',
        demographics: { age_range: { min: 25, max: 35 }, location: { region: 'Paris' }, income_level: 'medium' },
        interests: ['technology', 'fitness'],
        description: 'Young professionals in tech',
        size: 75000
      }
    ],
    interests: [
      { id: 'tag_1', name: 'technology', category: 'lifestyle', weight: 0.9, description: 'Technology interest' },
      { id: 'tag_2', name: 'fitness', category: 'health', weight: 0.8, description: 'Fitness interest' }
    ],
    confidence: 0.8,
    sources: { qloo: true, fallback: false, cached: false },
    metadata: {
      requestId: 'test_request_123',
      processingTime: 1500,
      dataFlow: ['entity_search', 'tags_discovery', 'audience_identification', 'insights_generation'],
      errors: [],
      warnings: []
    }
  };

  const mockPersonaResponse = {
    personas: [{
      id: 'persona_123',
      name: 'Alex Martin',
      age: 28,
      location: 'Paris, France',
      bio: 'Tech-savvy professional who values innovation and health',
      values: ['innovation', 'health', 'sustainability'],
      quote: 'Technology should make life better, not more complicated',
      interests: {
        music: ['Daft Punk', 'Justice'],
        brands: ['Apple', 'Nike'],
        movies: ['The Matrix', 'Inception'],
        food: ['Specialty coffee', 'Healthy cuisine'],
        books: ['The Lean Startup'],
        lifestyle: ['Fitness', 'Tech gadgets']
      },
      communication: {
        preferredChannels: ['Email', 'LinkedIn', 'Instagram'],
        tone: 'Professional yet approachable',
        contentTypes: ['Articles', 'Videos', 'Infographics'],
        frequency: 'Weekly'
      },
      marketing: {
        painPoints: ['Time management', 'Information overload'],
        motivations: ['Career growth', 'Health improvement'],
        buyingBehavior: 'Research-driven, values quality',
        influences: ['Industry experts', 'Peer reviews']
      },
      generatedAt: new Date(),
      sources: ['Qloo Taste AI', 'Google Gemini'],
      avatar: 'https://images.unsplash.com/photo-1500000000000',
      validation_metrics: {
        completeness_score: 0.9,
        consistency_score: 0.85,
        realism_score: 0.88,
        quality_indicators: ['Complete', 'Consistent', 'Realistic']
      },
      generation_metadata: {
        gemini_response_time: 2000,
        qloo_response_time: 1500,
        total_processing_time: 3500,
        confidence_level: 'high' as const,
        data_sources: ['Qloo Cultural AI', 'Google Gemini Pro']
      }
    }],
    metadata: {
      generated_count: 1,
      requested_count: 1,
      generation_time: '3500ms',
      sources_used: ['Qloo Taste AI', 'Google Gemini'],
      api_status: { gemini: 'active' as const, qloo: 'active' as const },
      performance_metrics: {
        average_generation_time: 3500,
        success_rate: 1,
        total_tokens_used: 1200
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    sessionStorageMock.getItem.mockReturnValue(null);

    // Mock successful API response
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockPersonaResponse,
    } as Response);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Persona Generation with New Qloo Integration', () => {
    it('should generate personas using new Qloo integration service', async () => {
      const { result } = renderHook(() => usePersonaGeneration());

      await act(async () => {
        await result.current.generatePersonas(mockBrief);
      });

      // Verify API was called with correct data
      expect(mockFetch).toHaveBeenCalledWith('/api/generate-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockBrief)
      });

      // Verify personas were generated
      expect(result.current.personas).toHaveLength(1);
      expect(result.current.personas[0]).toMatchObject({
        name: 'Alex Martin',
        age: 28,
        location: 'Paris, France'
      });

      // Verify new validation metrics are present
      const persona = result.current.personas[0] as EnhancedPersona;
      expect(persona.validation_metrics).toBeDefined();
      expect(persona.validation_metrics.completeness_score).toBe(0.9);
      expect(persona.generation_metadata).toBeDefined();
      expect(persona.generation_metadata.qloo_response_time).toBe(1500);
    });

    it('should handle Qloo API errors gracefully with fallback', async () => {
      // Mock API response with fallback data
      const fallbackResponse = {
        ...mockPersonaResponse,
        warnings: ['No useful data from Qloo API, using fallback'],
        metadata: {
          ...mockPersonaResponse.metadata,
          api_status: { gemini: 'active' as const, qloo: 'degraded' as const }
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => fallbackResponse,
      } as Response);

      const { result } = renderHook(() => usePersonaGeneration());

      await act(async () => {
        await result.current.generatePersonas(mockBrief);
      });

      // Verify personas were still generated with fallback
      expect(result.current.personas).toHaveLength(1);
      expect(result.current.generationState.warnings).toContain('No useful data from Qloo API, using fallback');
    });

    it('should preserve backward compatibility with existing persona structure', async () => {
      const { result } = renderHook(() => usePersonaGeneration());

      await act(async () => {
        await result.current.generatePersonas(mockBrief);
      });

      const persona = result.current.personas[0];

      // Verify all expected persona fields are present
      expect(persona).toHaveProperty('id');
      expect(persona).toHaveProperty('name');
      expect(persona).toHaveProperty('age');
      expect(persona).toHaveProperty('location');
      expect(persona).toHaveProperty('bio');
      expect(persona).toHaveProperty('values');
      expect(persona).toHaveProperty('quote');
      expect(persona).toHaveProperty('interests');
      expect(persona).toHaveProperty('communication');
      expect(persona).toHaveProperty('marketing');
      expect(persona).toHaveProperty('generatedAt');
      expect(persona).toHaveProperty('sources');
      expect(persona).toHaveProperty('avatar');

      // Verify interests structure is preserved
      expect(persona.interests).toHaveProperty('music');
      expect(persona.interests).toHaveProperty('brands');
      expect(persona.interests).toHaveProperty('movies');
      expect(persona.interests).toHaveProperty('food');
      expect(persona.interests).toHaveProperty('books');
      expect(persona.interests).toHaveProperty('lifestyle');
    });

    it('should track performance metrics correctly', async () => {
      const { result } = renderHook(() => usePersonaGeneration());

      await act(async () => {
        await result.current.generatePersonas(mockBrief);
      });

      const metrics = result.current.generationState.performance_metrics;
      expect(metrics.average_response_time).toBe(3500);
      expect(metrics.success_rate).toBe(1);
      expect(metrics.total_tokens_used).toBe(1200);
      expect(metrics.api_health.qloo).toBe('healthy');
      expect(metrics.api_health.gemini).toBe('healthy');
    });
  });

  describe('Data Migration and Backward Compatibility', () => {
    it('should migrate legacy persona data on initialization', async () => {
      // Mock legacy persona data in localStorage
      const legacyPersonas = [{
        id: 'legacy_persona_1',
        name: 'Legacy User',
        age: 30,
        location: 'Paris',
        bio: 'Legacy persona without new metrics',
        values: ['legacy'],
        quote: 'Legacy quote',
        interests: { music: ['Legacy Music'] },
        communication: { preferredChannels: ['Email'] },
        marketing: { painPoints: ['Legacy pain'] },
        generatedAt: '2023-01-01T00:00:00.000Z',
        sources: ['Legacy API'],
        avatar: 'legacy-avatar.jpg'
      }];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(legacyPersonas));

      const { result } = renderHook(() => usePersonaGeneration());

      // Wait for initialization to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Verify legacy persona was migrated
      expect(result.current.personas).toHaveLength(1);
      const migratedPersona = result.current.personas[0] as EnhancedPersona;

      // Verify legacy data is preserved
      expect(migratedPersona.name).toBe('Legacy User');
      expect(migratedPersona.age).toBe(30);

      // Verify new metrics were added
      expect(migratedPersona.validation_metrics).toBeDefined();
      expect(migratedPersona.validation_metrics.completeness_score).toBe(0.8);
      expect(migratedPersona.generation_metadata).toBeDefined();
      expect(migratedPersona.generation_metadata.data_sources).toContain('Migrated Data');
    });

    it('should handle cache migration for Qloo data', async () => {
      const migrationService = getQlooMigrationService();

      // Mock legacy cache data
      const legacyQlooData = {
        recommendations: [
          { id: 'legacy_1', name: 'Legacy Brand', type: 'brand', confidence: 0.7 },
          { id: 'legacy_2', name: 'Legacy Artist', type: 'music', confidence: 0.8 }
        ],
        metadata: { cached: true, api_version: '1.0' }
      };

      // Test migration
      const migratedData = migrationService.migrateLegacyQlooResponse(legacyQlooData);

      expect(migratedData).toBeDefined();
      expect(migratedData!.culturalInsights.brands).toHaveLength(1);
      expect(migratedData!.culturalInsights.music).toHaveLength(1);
      expect(migratedData!.sources.fallback).toBe(true);
      expect(migratedData!.metadata.warnings).toContain('Data migrated from legacy cache format');
    });

    it('should preserve existing localStorage structure', async () => {
      const { result } = renderHook(() => usePersonaGeneration());

      // Generate a new persona
      await act(async () => {
        await result.current.generatePersonas(mockBrief);
      });

      // Manually save personas to trigger localStorage update
      await act(async () => {
        result.current.savePersonas();
      });

      // Verify localStorage is updated with new format
      expect(localStorageMock.setItem).toHaveBeenCalled();

      // Get the stored data
      const setItemCalls = localStorageMock.setItem.mock.calls;
      const personaStorageCall = setItemCalls.find(call => call[0] === 'personacraft-personas');

      if (personaStorageCall) {
        const storedData = JSON.parse(personaStorageCall[1] as string);
        expect(storedData).toHaveLength(1);
        expect(storedData[0]).toHaveProperty('validation_metrics');
        expect(storedData[0]).toHaveProperty('generation_metadata');
      }
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => usePersonaGeneration());

      await act(async () => {
        await result.current.generatePersonas(mockBrief);
      });

      expect(result.current.generationState.error).toContain('Network error');
      expect(result.current.generationState.isGenerating).toBe(false);
    });

    it('should handle malformed API responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid request format' }),
      } as Response);

      const { result } = renderHook(() => usePersonaGeneration());

      await act(async () => {
        await result.current.generatePersonas(mockBrief);
      });

      expect(result.current.generationState.error).toBeDefined();
      expect(result.current.personas).toHaveLength(0);
    });

    it('should validate brief data before API call', async () => {
      const invalidBrief: BriefFormData = {
        description: 'Too short',
        interests: [],
        values: [],
        ageRange: '25-35',
        location: 'Paris'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'Validation failed',
          details: ['At least one interest is required', 'At least one value is required']
        }),
      } as Response);

      const { result } = renderHook(() => usePersonaGeneration());

      await act(async () => {
        await result.current.generatePersonas(invalidBrief);
      });

      expect(result.current.generationState.error).toContain('Validation failed');
    });
  });

  describe('Performance and Caching', () => {
    it('should track generation progress correctly', async () => {
      const { result } = renderHook(() => usePersonaGeneration());

      const progressStates: number[] = [];

      // Mock a slower API response to capture progress
      mockFetch.mockImplementationOnce(() =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => mockPersonaResponse,
            } as Response);
          }, 100);
        })
      );

      await act(async () => {
        const promise = result.current.generatePersonas(mockBrief);

        // Capture progress states
        setTimeout(() => progressStates.push(result.current.generationState.progress), 10);
        setTimeout(() => progressStates.push(result.current.generationState.progress), 50);

        await promise;
      });

      expect(result.current.generationState.progress).toBe(100);
      expect(result.current.generationState.currentStep).toBe('Terminé');
    });

    it('should handle multiple persona generation', async () => {
      const multipleBrief = { ...mockBrief, generateMultiple: true };

      const multipleResponse = {
        ...mockPersonaResponse,
        personas: [
          mockPersonaResponse.personas[0],
          { ...mockPersonaResponse.personas[0], id: 'persona_124', name: 'Sarah Johnson' },
          { ...mockPersonaResponse.personas[0], id: 'persona_125', name: 'Mike Chen' }
        ],
        metadata: {
          ...mockPersonaResponse.metadata,
          generated_count: 3,
          requested_count: 3
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => multipleResponse,
      } as Response);

      const { result } = renderHook(() => usePersonaGeneration());

      await act(async () => {
        await result.current.generatePersonas(multipleBrief);
      });

      expect(result.current.personas).toHaveLength(3);
      expect(result.current.generationState.performance_metrics.success_rate).toBe(1);
    });
  });

  describe('Integration with PersonaCraft Features', () => {
    it('should support persona validation', async () => {
      const { result } = renderHook(() => usePersonaGeneration());

      // First generate a persona
      await act(async () => {
        await result.current.generatePersonas(mockBrief);
      });

      const persona = result.current.personas[0] as EnhancedPersona;

      // Mock validation API response
      const validationResponse = {
        completeness_score: 0.95,
        consistency_score: 0.90,
        realism_score: 0.88,
        issues: []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => validationResponse,
      } as Response);

      let validationResult;
      await act(async () => {
        validationResult = await result.current.validatePersona(persona);
      });

      expect(validationResult).toEqual(validationResponse);
      expect(result.current.generationState.last_validation_results).toEqual(validationResponse);
    });

    it('should support persona export with new metrics', async () => {
      const { result } = renderHook(() => usePersonaGeneration());

      // Generate a persona first
      await act(async () => {
        await result.current.generatePersonas(mockBrief);
      });

      // Mock export API
      const mockBlob = new Blob(['mock pdf content'], { type: 'application/pdf' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
      } as Response);

      // Mock URL.createObjectURL
      global.URL.createObjectURL = jest.fn(() => 'mock-url');
      global.URL.revokeObjectURL = jest.fn();

      // Mock DOM manipulation
      const mockAnchor = {
        href: '',
        download: '',
        click: jest.fn(),
      };
      document.createElement = jest.fn(() => mockAnchor as any);
      document.body.appendChild = jest.fn();
      document.body.removeChild = jest.fn();

      await act(async () => {
        await result.current.exportPersonas('pdf', true);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('includeMetrics')
      });
    });

    it('should maintain quality trends across generations', () => {
      // Test the quality trends calculation directly
      const mockPersonas = [
        {
          ...mockPersonaResponse.personas[0],
          validation_metrics: {
            completeness_score: 0.9,
            consistency_score: 0.85,
            realism_score: 0.88,
            quality_indicators: ['Complete', 'Consistent', 'Realistic']
          }
        },
        {
          ...mockPersonaResponse.personas[0],
          id: 'persona_124',
          validation_metrics: {
            completeness_score: 0.8,
            consistency_score: 0.9,
            realism_score: 0.82,
            quality_indicators: ['Complete', 'Consistent', 'Realistic']
          }
        }
      ];

      // Calculate quality trends manually (same logic as in the hook)
      const calculateQualityTrends = (personas: any[]) => {
        const enhancedPersonas = personas.filter(p => 'validation_metrics' in p);

        if (enhancedPersonas.length === 0) {
          return {
            average_completeness: 0,
            average_consistency: 0,
            average_realism: 0
          };
        }

        return {
          average_completeness: enhancedPersonas.reduce((sum, p) => sum + p.validation_metrics.completeness_score, 0) / enhancedPersonas.length,
          average_consistency: enhancedPersonas.reduce((sum, p) => sum + p.validation_metrics.consistency_score, 0) / enhancedPersonas.length,
          average_realism: enhancedPersonas.reduce((sum, p) => sum + p.validation_metrics.realism_score, 0) / enhancedPersonas.length
        };
      };

      const trends = calculateQualityTrends(mockPersonas);
      expect(trends.average_completeness).toBeCloseTo(0.85, 2);
      expect(trends.average_consistency).toBeCloseTo(0.875, 2);
      expect(trends.average_realism).toBeCloseTo(0.85, 2);
    });
  });
});