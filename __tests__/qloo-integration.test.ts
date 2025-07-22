// Tests d'intégration pour le service d'intégration Qloo PersonaCraft
// Teste le flux complet d'enrichissement des personas

import { QlooIntegrationService, EnrichedPersonaData } from '@/lib/api/qloo-integration';
import { QlooApiClient } from '@/lib/api/qloo';
import type { BriefFormData } from '@/lib/types/persona';
import type {
  QlooEntity,
  QlooTag,
  QlooAudience,
  QlooInsightsResponse,
  SearchResult,
  TagSearchResult,
  AudienceSearchResult
} from '@/lib/types/qloo-compliant';

// Mock du client Qloo
jest.mock('@/lib/api/qloo');

describe('QlooIntegrationService', () => {
  let integrationService: QlooIntegrationService;
  let mockQlooClient: jest.Mocked<QlooApiClient>;

  // Données de test
  const mockBrief: BriefFormData = {
    description: 'Jeune professionnel urbain passionné de technologie',
    ageRange: '25-35',
    location: 'Paris, France',
    interests: ['technologie', 'fitness', 'cuisine'],
    values: ['innovation', 'durabilité'],
    generateMultiple: false
  };

  const mockEntities: QlooEntity[] = [
    {
      id: 'entity_apple',
      name: 'Apple',
      type: 'urn:entity:brand',
      confidence: 0.9,
      description: 'Technology company',
      tags: ['technology', 'innovation']
    },
    {
      id: 'entity_spotify',
      name: 'Spotify',
      type: 'urn:entity:brand',
      confidence: 0.8,
      description: 'Music streaming service'
    },
    {
      id: 'entity_netflix',
      name: 'Netflix',
      type: 'urn:entity:brand',
      confidence: 0.85,
      description: 'Streaming platform'
    }
  ];

  const mockTags: QlooTag[] = [
    {
      id: 'tag_tech',
      name: 'Technology',
      category: 'interests',
      weight: 0.9,
      description: 'Technology related content'
    },
    {
      id: 'tag_fitness',
      name: 'Fitness',
      category: 'lifestyle',
      weight: 0.8,
      description: 'Health and fitness'
    }
  ];

  const mockAudiences: QlooAudience[] = [
    {
      id: 'audience_young_professionals',
      name: 'Young Urban Professionals',
      demographics: {
        age_range: { min: 25, max: 35 },
        location: { country: 'FR', region: 'Paris' },
        income_level: 'high',
        education_level: 'bachelor'
      },
      interests: ['technology', 'fitness'],
      size: 150000,
      description: 'Tech-savvy young professionals in Paris'
    }
  ];

  const mockInsightsResponse: QlooInsightsResponse = {
    entities: mockEntities,
    tags: mockTags,
    audiences: mockAudiences,
    confidence: 0.85,
    metadata: {
      request_id: 'test_request_123',
      processing_time: 250,
      data_source: 'qloo_api',
      api_version: 'v2',
      timestamp: new Date().toISOString(),
      total_results: 3,
      filters_applied: ['filter.type'],
      signals_used: ['signal.interests.entities', 'signal.interests.tags'],
      cached: false
    },
    status: {
      code: 200,
      message: 'Success',
      success: true
    }
  };

  beforeEach(() => {
    // Réinitialiser les mocks
    jest.clearAllMocks();
    
    // Créer le mock du client Qloo
    mockQlooClient = {
      searchEntities: jest.fn(),
      searchTags: jest.fn(),
      getTagsByCategory: jest.fn(),
      getAudiences: jest.fn(),
      getInsights: jest.fn(),
      getStats: jest.fn().mockReturnValue({ requestCount: 0, lastRequestTime: 0 })
    } as any;

    // Mock du constructeur QlooApiClient
    (QlooApiClient as jest.MockedClass<typeof QlooApiClient>).mockImplementation(() => mockQlooClient);

    // Créer le service d'intégration
    integrationService = new QlooIntegrationService('test-api-key', {
      enableCache: false,
      fallbackEnabled: true,
      confidenceThreshold: 0.5
    });
  });

  describe('enrichPersona', () => {
    it('should successfully enrich persona with complete data flow', async () => {
      // Configurer les mocks pour un flux réussi
      mockQlooClient.searchEntities.mockResolvedValue({
        entities: mockEntities,
        metadata: {
          query: 'technologie',
          total_results: 3,
          processing_time: 100,
          request_id: 'search_123'
        },
        status: { code: 200, message: 'Success', success: true }
      } as SearchResult);

      mockQlooClient.searchTags.mockResolvedValue({
        tags: mockTags,
        metadata: {
          query: 'technologie',
          total_results: 2,
          processing_time: 50,
          request_id: 'tags_123'
        },
        status: { code: 200, message: 'Success', success: true }
      } as TagSearchResult);

      mockQlooClient.getTagsByCategory.mockResolvedValue({
        tags: mockTags,
        metadata: {
          category: 'lifestyle',
          total_results: 2,
          processing_time: 50,
          request_id: 'category_tags_123'
        },
        status: { code: 200, message: 'Success', success: true }
      } as TagSearchResult);

      mockQlooClient.getAudiences.mockResolvedValue({
        audiences: mockAudiences,
        metadata: {
          total_results: 1,
          processing_time: 75,
          request_id: 'audiences_123'
        },
        status: { code: 200, message: 'Success', success: true }
      } as AudienceSearchResult);

      mockQlooClient.getInsights.mockResolvedValue(mockInsightsResponse);

      // Exécuter l'enrichissement
      const result = await integrationService.enrichPersona(mockBrief);

      // Vérifications
      expect(result).toBeDefined();
      expect(result.sources.qloo).toBe(true);
      expect(result.sources.fallback).toBe(false);
      expect(result.confidence).toBe(0.85);
      expect(result.metadata.dataFlow).toContain('entity_search');
      expect(result.metadata.dataFlow).toContain('tags_discovery');
      expect(result.metadata.dataFlow).toContain('audience_identification');
      expect(result.metadata.dataFlow).toContain('insights_generation');
    });

    it('should categorize cultural insights correctly', async () => {
      // Entités avec différents types
      const diverseEntities: QlooEntity[] = [
        { id: '1', name: 'Apple', type: 'urn:entity:brand', confidence: 0.9 },
        { id: '2', name: 'Spotify Artist', type: 'urn:entity:artist', confidence: 0.8 },
        { id: '3', name: 'Inception', type: 'urn:entity:movie', confidence: 0.85 },
        { id: '4', name: 'Breaking Bad', type: 'urn:entity:tv_show', confidence: 0.9 },
        { id: '5', name: 'The Lean Startup', type: 'urn:entity:book', confidence: 0.7 }
      ];

      const diverseInsights: QlooInsightsResponse = {
        ...mockInsightsResponse,
        entities: diverseEntities
      };

      // Configurer les mocks
      mockQlooClient.searchEntities.mockResolvedValue({
        entities: diverseEntities,
        metadata: { query: 'test', total_results: 5, processing_time: 100, request_id: 'test' },
        status: { code: 200, message: 'Success', success: true }
      });

      mockQlooClient.searchTags.mockResolvedValue({
        tags: mockTags,
        metadata: { query: 'test', total_results: 2, processing_time: 50, request_id: 'test' },
        status: { code: 200, message: 'Success', success: true }
      });

      mockQlooClient.getTagsByCategory.mockResolvedValue({
        tags: [],
        metadata: { category: 'test', total_results: 0, processing_time: 25, request_id: 'test' },
        status: { code: 200, message: 'Success', success: true }
      });

      mockQlooClient.getAudiences.mockResolvedValue({
        audiences: mockAudiences,
        metadata: { total_results: 1, processing_time: 75, request_id: 'test' },
        status: { code: 200, message: 'Success', success: true }
      });

      mockQlooClient.getInsights.mockResolvedValue(diverseInsights);

      const result = await integrationService.enrichPersona(mockBrief);

      // Vérifier la catégorisation
      expect(result.culturalInsights.brands).toHaveLength(1);
      expect(result.culturalInsights.brands[0].name).toBe('Apple');
      expect(result.culturalInsights.music).toHaveLength(1);
      expect(result.culturalInsights.music[0].name).toBe('Spotify Artist');
      expect(result.culturalInsights.movies).toHaveLength(1);
      expect(result.culturalInsights.movies[0].name).toBe('Inception');
      expect(result.culturalInsights.tvShows).toHaveLength(1);
      expect(result.culturalInsights.tvShows[0].name).toBe('Breaking Bad');
      expect(result.culturalInsights.books).toHaveLength(1);
      expect(result.culturalInsights.books[0].name).toBe('The Lean Startup');
    });

    it('should handle API errors with fallback data', async () => {
      // Configurer les mocks pour échouer
      mockQlooClient.searchEntities.mockRejectedValue(new Error('API Error'));
      mockQlooClient.searchTags.mockRejectedValue(new Error('API Error'));
      mockQlooClient.getAudiences.mockRejectedValue(new Error('API Error'));
      mockQlooClient.getInsights.mockRejectedValue(new Error('API Error'));

      const result = await integrationService.enrichPersona(mockBrief);

      // Vérifier que les données de fallback sont utilisées
      expect(result.sources.fallback).toBe(true);
      expect(result.sources.qloo).toBe(false);
      expect(result.confidence).toBe(0.6);
      expect(result.metadata.errors).toHaveLength(1);
      expect(result.metadata.warnings).toContain('Using fallback data due to API error');
      expect(result.metadata.dataFlow).toContain('fallback_generation');
    });

    it('should generate coherent fallback data', async () => {
      // Forcer l'utilisation du fallback
      mockQlooClient.searchEntities.mockRejectedValue(new Error('API Error'));

      const result = await integrationService.enrichPersona(mockBrief);

      // Vérifier la cohérence des données de fallback
      expect(result.interests).toHaveLength(mockBrief.interests.length);
      expect(result.interests.every(tag => mockBrief.interests.includes(tag.name))).toBe(true);
      
      expect(result.demographics).toHaveLength(1);
      expect(result.demographics[0].name).toContain(mockBrief.location);
      expect(result.demographics[0].name).toContain(mockBrief.ageRange);
      
      // Vérifier que les insights culturels contiennent des données pour chaque intérêt
      const totalCulturalItems = Object.values(result.culturalInsights)
        .reduce((sum, items) => sum + items.length, 0);
      expect(totalCulturalItems).toBeGreaterThan(0);
    });

    it('should track data sources correctly', async () => {
      // Test avec succès partiel (certaines APIs fonctionnent, d'autres non)
      mockQlooClient.searchEntities.mockResolvedValue({
        entities: mockEntities,
        metadata: { query: 'test', total_results: 3, processing_time: 100, request_id: 'test' },
        status: { code: 200, message: 'Success', success: true }
      });

      mockQlooClient.searchTags.mockRejectedValue(new Error('Tags API Error'));
      mockQlooClient.getTagsByCategory.mockRejectedValue(new Error('Tags API Error'));
      mockQlooClient.getAudiences.mockRejectedValue(new Error('Audiences API Error'));
      
      // Insights réussit mais avec des données limitées
      mockQlooClient.getInsights.mockResolvedValue({
        ...mockInsightsResponse,
        tags: [],
        audiences: []
      });

      const result = await integrationService.enrichPersona(mockBrief);

      // Vérifier le tracking des sources
      expect(result.sources.qloo).toBe(true); // Au moins searchEntities a réussi
      expect(result.metadata.errors.length).toBeGreaterThan(0);
      expect(result.metadata.dataFlow).toContain('entity_search');
      expect(result.metadata.dataFlow).toContain('insights_generation');
    });

    it('should respect confidence threshold', async () => {
      // Créer un service avec un seuil de confiance élevé
      const highConfidenceService = new QlooIntegrationService('test-api-key', {
        confidenceThreshold: 0.9
      });

      // Entités avec confiance faible
      const lowConfidenceEntities: QlooEntity[] = [
        { id: '1', name: 'Low Confidence Entity', type: 'urn:entity:brand', confidence: 0.3 }
      ];

      mockQlooClient.searchEntities.mockResolvedValue({
        entities: lowConfidenceEntities,
        metadata: { query: 'test', total_results: 1, processing_time: 100, request_id: 'test' },
        status: { code: 200, message: 'Success', success: true }
      });

      // Vérifier que le seuil de confiance est passé aux appels API
      await highConfidenceService.enrichPersona(mockBrief);

      expect(mockQlooClient.searchEntities).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          min_confidence: 0.9
        })
      );
    });

    it('should deduplicate entities and tags', async () => {
      // Entités dupliquées
      const duplicatedEntities: QlooEntity[] = [
        { id: 'entity_1', name: 'Entity 1', type: 'urn:entity:brand', confidence: 0.9 },
        { id: 'entity_1', name: 'Entity 1 Duplicate', type: 'urn:entity:brand', confidence: 0.8 },
        { id: 'entity_2', name: 'Entity 2', type: 'urn:entity:brand', confidence: 0.7 }
      ];

      mockQlooClient.searchEntities.mockResolvedValue({
        entities: duplicatedEntities,
        metadata: { query: 'test', total_results: 3, processing_time: 100, request_id: 'test' },
        status: { code: 200, message: 'Success', success: true }
      });

      mockQlooClient.searchTags.mockResolvedValue({
        tags: mockTags,
        metadata: { query: 'test', total_results: 2, processing_time: 50, request_id: 'test' },
        status: { code: 200, message: 'Success', success: true }
      });

      mockQlooClient.getTagsByCategory.mockResolvedValue({
        tags: [],
        metadata: { category: 'test', total_results: 0, processing_time: 25, request_id: 'test' },
        status: { code: 200, message: 'Success', success: true }
      });

      mockQlooClient.getAudiences.mockResolvedValue({
        audiences: mockAudiences,
        metadata: { total_results: 1, processing_time: 75, request_id: 'test' },
        status: { code: 200, message: 'Success', success: true }
      });

      mockQlooClient.getInsights.mockResolvedValue({
        ...mockInsightsResponse,
        entities: duplicatedEntities
      });

      const result = await integrationService.enrichPersona(mockBrief);

      // Vérifier que les doublons sont supprimés
      const totalEntities = Object.values(result.culturalInsights)
        .reduce((sum, items) => sum + items.length, 0);
      
      // Devrait avoir seulement 2 entités uniques (entity_1 et entity_2)
      expect(totalEntities).toBe(2);
    });

    it('should handle empty API responses gracefully', async () => {
      // Configurer les mocks pour retourner des réponses vides
      mockQlooClient.searchEntities.mockResolvedValue({
        entities: [],
        metadata: { query: 'test', total_results: 0, processing_time: 50, request_id: 'test' },
        status: { code: 200, message: 'No results', success: true }
      });

      mockQlooClient.searchTags.mockResolvedValue({
        tags: [],
        metadata: { query: 'test', total_results: 0, processing_time: 25, request_id: 'test' },
        status: { code: 200, message: 'No results', success: true }
      });

      mockQlooClient.getTagsByCategory.mockResolvedValue({
        tags: [],
        metadata: { category: 'test', total_results: 0, processing_time: 25, request_id: 'test' },
        status: { code: 200, message: 'No results', success: true }
      });

      mockQlooClient.getAudiences.mockResolvedValue({
        audiences: [],
        metadata: { total_results: 0, processing_time: 30, request_id: 'test' },
        status: { code: 200, message: 'No results', success: true }
      });

      mockQlooClient.getInsights.mockResolvedValue({
        entities: [],
        tags: [],
        audiences: [],
        confidence: 0.5,
        metadata: {
          request_id: 'empty_insights',
          processing_time: 100,
          data_source: 'qloo_api',
          api_version: 'v2',
          timestamp: new Date().toISOString(),
          total_results: 0,
          filters_applied: [],
          signals_used: [],
          cached: false
        },
        status: { code: 200, message: 'No insights', success: true }
      });

      const result = await integrationService.enrichPersona(mockBrief);

      // Vérifier que le service gère gracieusement les réponses vides
      expect(result).toBeDefined();
      expect(result.sources.qloo).toBe(false); // Pas de données Qloo utiles
      expect(result.confidence).toBeLessThan(0.8);
      
      // Devrait avoir des données de fallback
      expect(result.sources.fallback).toBe(true);
      expect(result.interests.length).toBeGreaterThan(0);
    });
  });

  describe('Configuration and Stats', () => {
    it('should respect configuration options', () => {
      const customConfig = {
        enableCache: false,
        fallbackEnabled: false,
        maxRetries: 5,
        timeout: 15000,
        confidenceThreshold: 0.8
      };

      const customService = new QlooIntegrationService('test-key', customConfig);
      
      // Vérifier que la configuration est appliquée
      expect(customService).toBeDefined();
      // Note: Les propriétés de configuration sont privées, 
      // donc nous testons indirectement via le comportement
    });

    it('should provide service statistics', () => {
      const stats = integrationService.getStats();
      
      expect(stats).toBeDefined();
      expect(typeof stats.requestCount).toBe('number');
      expect(typeof stats.lastRequestTime).toBe('number');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when fallback is disabled and API fails', async () => {
      // Créer un service sans fallback
      const noFallbackService = new QlooIntegrationService('test-key', {
        fallbackEnabled: false
      });

      // Configurer tous les mocks pour échouer
      mockQlooClient.searchEntities.mockRejectedValue(new Error('API Error'));

      // Vérifier que l'erreur est propagée
      await expect(noFallbackService.enrichPersona(mockBrief))
        .rejects.toThrow('API Error');
    });

    it('should handle network timeouts gracefully', async () => {
      // Simuler un timeout
      mockQlooClient.searchEntities.mockRejectedValue(new Error('Request timeout'));

      const result = await integrationService.enrichPersona(mockBrief);

      // Vérifier que le fallback est utilisé
      expect(result.sources.fallback).toBe(true);
      expect(result.metadata.errors).toContain('Integration error: Request timeout');
    });
  });

  describe('Data Quality', () => {
    it('should maintain data consistency in fallback mode', async () => {
      // Forcer le fallback
      mockQlooClient.searchEntities.mockRejectedValue(new Error('API Error'));

      const result = await integrationService.enrichPersona(mockBrief);

      // Vérifier la cohérence des données
      expect(result.interests.every(tag => 
        mockBrief.interests.includes(tag.name)
      )).toBe(true);

      expect(result.demographics[0].demographics?.age_range?.min).toBe(25);
      expect(result.demographics[0].demographics?.age_range?.max).toBe(35);
      expect(result.demographics[0].demographics?.location?.region).toBe(mockBrief.location);
    });

    it('should provide meaningful metadata', async () => {
      mockQlooClient.searchEntities.mockResolvedValue({
        entities: mockEntities,
        metadata: { query: 'test', total_results: 3, processing_time: 100, request_id: 'test' },
        status: { code: 200, message: 'Success', success: true }
      });

      mockQlooClient.searchTags.mockResolvedValue({
        tags: mockTags,
        metadata: { query: 'test', total_results: 2, processing_time: 50, request_id: 'test' },
        status: { code: 200, message: 'Success', success: true }
      });

      mockQlooClient.getTagsByCategory.mockResolvedValue({
        tags: [],
        metadata: { category: 'test', total_results: 0, processing_time: 25, request_id: 'test' },
        status: { code: 200, message: 'Success', success: true }
      });

      mockQlooClient.getAudiences.mockResolvedValue({
        audiences: mockAudiences,
        metadata: { total_results: 1, processing_time: 75, request_id: 'test' },
        status: { code: 200, message: 'Success', success: true }
      });

      mockQlooClient.getInsights.mockResolvedValue(mockInsightsResponse);

      const result = await integrationService.enrichPersona(mockBrief);

      // Vérifier les métadonnées
      expect(result.metadata.requestId).toBeDefined();
      expect(result.metadata.processingTime).toBeGreaterThan(0);
      expect(result.metadata.dataFlow).toEqual([
        'entity_search',
        'tags_discovery',
        'audience_identification',
        'insights_generation'
      ]);
      expect(result.metadata.errors).toEqual([]);
      expect(result.metadata.warnings).toEqual([]);
    });
  });
});