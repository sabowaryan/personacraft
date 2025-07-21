// Tests pour les types Qloo conformes
import { describe, test, expect } from '@jest/globals';
import {
  EntityUrn,
  QlooEntity,
  QlooTag,
  QlooAudience,
  InsightsParams,
  QlooInsightsResponse,
  QlooErrorType,
  isQlooEntity,
  isQlooTag,
  isQlooAudience
} from '@/lib/types/qloo-compliant';

describe('Qloo Compliant Types', () => {
  describe('EntityUrn', () => {
    test('should include all required entity URNs', () => {
      const validUrns: EntityUrn[] = [
        'urn:entity:brand',
        'urn:entity:artist',
        'urn:entity:movie',
        'urn:entity:tv_show',
        'urn:entity:book',
        'urn:entity:song',
        'urn:entity:album',
        'urn:entity:restaurant',
        'urn:entity:product',
        'urn:entity:location'
      ];

      // Test que tous les URNs sont valides
      validUrns.forEach(urn => {
        expect(urn).toMatch(/^urn:entity:/);
      });
    });
  });

  describe('QlooEntity', () => {
    test('should create valid entity with required fields', () => {
      const entity: QlooEntity = {
        id: 'entity_123',
        name: 'Test Brand',
        type: 'urn:entity:brand'
      };

      expect(entity.id).toBe('entity_123');
      expect(entity.name).toBe('Test Brand');
      expect(entity.type).toBe('urn:entity:brand');
    });

    test('should support optional fields', () => {
      const entity: QlooEntity = {
        id: 'entity_456',
        name: 'Test Artist',
        type: 'urn:entity:artist',
        confidence: 0.85,
        metadata: { genre: 'rock' },
        image_url: 'https://example.com/image.jpg',
        description: 'A rock artist',
        tags: ['rock', 'music']
      };

      expect(entity.confidence).toBe(0.85);
      expect(entity.metadata?.genre).toBe('rock');
      expect(entity.tags).toContain('rock');
    });
  });

  describe('InsightsParams', () => {
    test('should require filter.type parameter', () => {
      const params: InsightsParams = {
        'filter.type': 'urn:entity:brand'
      };

      expect(params['filter.type']).toBe('urn:entity:brand');
    });

    test('should support all optional signal parameters', () => {
      const params: InsightsParams = {
        'filter.type': 'urn:entity:brand',
        'signal.interests.entities': ['entity_1', 'entity_2'],
        'signal.interests.tags': ['tag_1', 'tag_2'],
        'signal.demographics.audiences': ['audience_1']
      };

      expect(params['signal.interests.entities']).toHaveLength(2);
      expect(params['signal.interests.tags']).toContain('tag_1');
      expect(params['signal.demographics.audiences']).toContain('audience_1');
    });

    test('should support filter parameters', () => {
      const params: InsightsParams = {
        'filter.type': 'urn:entity:movie',
        'filter.tags': ['action', 'thriller'],
        'filter.entities': ['movie_1', 'movie_2']
      };

      expect(params['filter.tags']).toContain('action');
      expect(params['filter.entities']).toContain('movie_1');
    });
  });

  describe('QlooInsightsResponse', () => {
    test('should have all required fields', () => {
      const response: QlooInsightsResponse = {
        entities: [],
        tags: [],
        audiences: [],
        confidence: 0.8,
        metadata: {
          request_id: 'req_123',
          processing_time: 150,
          data_source: 'qloo_api',
          api_version: 'v2',
          timestamp: '2024-01-01T00:00:00Z',
          total_results: 0,
          filters_applied: [],
          signals_used: [],
          cached: false
        },
        status: {
          code: 200,
          message: 'Success',
          success: true
        }
      };

      expect(response.confidence).toBe(0.8);
      expect(response.metadata.request_id).toBe('req_123');
      expect(response.status.success).toBe(true);
    });
  });

  describe('Type Guards', () => {
    test('isQlooEntity should validate entities correctly', () => {
      const validEntity = {
        id: 'test_id',
        name: 'Test Entity',
        type: 'urn:entity:brand'
      };

      const invalidEntity = {
        id: 'test_id',
        name: 'Test Entity'
        // missing type
      };

      expect(isQlooEntity(validEntity)).toBe(true);
      expect(isQlooEntity(invalidEntity)).toBe(false);
      expect(isQlooEntity(null)).toBe(false);
    });

    test('isQlooTag should validate tags correctly', () => {
      const validTag = {
        id: 'tag_123',
        name: 'Test Tag'
      };

      const invalidTag = {
        id: 'tag_123'
        // missing name
      };

      expect(isQlooTag(validTag)).toBe(true);
      expect(isQlooTag(invalidTag)).toBe(false);
      expect(isQlooTag(null)).toBe(false);
    });

    test('isQlooAudience should validate audiences correctly', () => {
      const validAudience = {
        id: 'audience_123',
        name: 'Test Audience'
      };

      const invalidAudience = {
        id: 'audience_123'
        // missing name
      };

      expect(isQlooAudience(validAudience)).toBe(true);
      expect(isQlooAudience(invalidAudience)).toBe(false);
      expect(isQlooAudience(null)).toBe(false);
    });
  });

  describe('QlooErrorType', () => {
    test('should include all error types', () => {
      expect(QlooErrorType.AUTHENTICATION).toBe('authentication_error');
      expect(QlooErrorType.AUTHORIZATION).toBe('authorization_error');
      expect(QlooErrorType.VALIDATION).toBe('validation_error');
      expect(QlooErrorType.RATE_LIMIT).toBe('rate_limit_error');
      expect(QlooErrorType.SERVER_ERROR).toBe('server_error');
      expect(QlooErrorType.NETWORK_ERROR).toBe('network_error');
      expect(QlooErrorType.NOT_FOUND).toBe('not_found_error');
      expect(QlooErrorType.INVALID_PARAMS).toBe('invalid_params_error');
    });
  });
});