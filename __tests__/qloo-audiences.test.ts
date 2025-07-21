// Tests unitaires pour le service Audiences Qloo
// Couvre toutes les opérations d'audiences avec mocks et validation

import { QlooAudiencesService, type AudienceFilters, type AudienceValidationResult } from '@/lib/api/qloo-audiences';
import type { 
  QlooAudience, 
  AudienceSearchResult, 
  AudienceSearchParams,
  QlooAudienceDemographics 
} from '@/lib/types/qloo-compliant';
import { QlooErrorType } from '@/lib/types/qloo-compliant';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'test-uuid-123')
  }
});

describe('QlooAudiencesService', () => {
  let service: QlooAudiencesService;
  const mockApiKey = 'test-api-key';
  const mockBaseUrl = 'https://hackathon.api.qloo.com';

  beforeEach(() => {
    service = new QlooAudiencesService(mockApiKey, mockBaseUrl, 5000);
    mockFetch.mockClear();
    mockFetch.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('getAudiences', () => {
    const mockAudiencesResponse = {
      audiences: [
        {
          id: 'aud_1',
          name: 'Tech Enthusiasts',
          demographics: {
            age_range: { min: 25, max: 40 },
            gender_distribution: { male: 0.6, female: 0.4 },
            location: { country: 'US', region: 'West Coast' },
            income_level: 'high',
            education_level: 'bachelor'
          },
          size: 2500000,
          description: 'Technology early adopters and enthusiasts',
          interests: ['technology', 'gadgets', 'innovation'],
          behaviors: ['early_adopter', 'tech_savvy', 'online_shopper']
        },
        {
          id: 'aud_2',
          name: 'Young Professionals',
          demographics: {
            age_range: { min: 22, max: 35 },
            income_level: 'medium'
          },
          size: 1800000,
          interests: ['career', 'networking', 'lifestyle'],
          behaviors: ['ambitious', 'social_media_active']
        }
      ]
    };

    it('should successfully retrieve audiences without filters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAudiencesResponse,
        headers: new Headers()
      } as Response);

      const result = await service.getAudiences();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://hackathon.api.qloo.com/v2/audiences',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'X-API-Key': mockApiKey,
            'User-Agent': 'PersonaCraft/1.0',
            'Accept': 'application/json'
          })
        })
      );

      expect(result.audiences).toHaveLength(2);
      expect(result.audiences[0].id).toBe('aud_1');
      expect(result.audiences[0].name).toBe('Tech Enthusiasts');
      expect(result.audiences[0].demographics?.age_range).toEqual({ min: 25, max: 40 });
      expect(result.status.success).toBe(true);
      expect(result.metadata.total_results).toBe(2);
    });

    it('should apply demographic filters correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAudiencesResponse,
        headers: new Headers()
      } as Response);

      const filters: AudienceFilters = {
        demographics: {
          age_range: { min: 25, max: 40 },
          location: { country: 'US' },
          income_level: 'high'
        },
        interests: ['technology', 'innovation'],
        limit: 10
      };

      await service.getAudiences(filters);

      const expectedUrl = new URL('https://hackathon.api.qloo.com/v2/audiences');
      expectedUrl.searchParams.append('age_min', '25');
      expectedUrl.searchParams.append('age_max', '40');
      expectedUrl.searchParams.append('country', 'US');
      expectedUrl.searchParams.append('income_level', 'high');
      expectedUrl.searchParams.append('interests', 'technology,innovation');
      expectedUrl.searchParams.append('limit', '10');

      expect(mockFetch).toHaveBeenCalledWith(
        expectedUrl.toString(),
        expect.any(Object)
      );
    });

    it('should handle empty response gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ audiences: [] }),
        headers: new Headers()
      } as Response);

      const result = await service.getAudiences();

      expect(result.audiences).toHaveLength(0);
      expect(result.status.success).toBe(true);
      expect(result.metadata.total_results).toBe(0);
    });

    it('should handle API errors correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        headers: new Headers()
      } as Response);

      await expect(service.getAudiences()).rejects.toMatchObject({
        type: QlooErrorType.AUTHENTICATION,
        code: 'UNAUTHORIZED',
        message: 'Invalid API key for audiences endpoint'
      });
    });

    it('should handle network timeout', async () => {
      // Mock AbortError
      const abortError = new Error('Request timeout');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(abortError);

      await expect(service.getAudiences()).rejects.toMatchObject({
        type: QlooErrorType.NETWORK_ERROR,
        code: 'TIMEOUT'
      });
    });
  });

  describe('searchAudiences', () => {
    it('should search audiences with specific parameters', async () => {
      const mockResponse = {
        audiences: [
          {
            id: 'aud_search_1',
            name: 'Fitness Enthusiasts',
            interests: ['fitness', 'health', 'wellness'],
            size: 1200000
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        headers: new Headers()
      } as Response);

      const searchParams: AudienceSearchParams = {
        interests: ['fitness', 'health'],
        demographics: {
          age_range: { min: 20, max: 45 }
        },
        limit: 5
      };

      const result = await service.searchAudiences(searchParams);

      expect(result.audiences).toHaveLength(1);
      expect(result.audiences[0].name).toBe('Fitness Enthusiasts');
      
      const expectedUrl = new URL('https://hackathon.api.qloo.com/v2/audiences');
      expectedUrl.searchParams.append('age_min', '20');
      expectedUrl.searchParams.append('age_max', '45');
      expectedUrl.searchParams.append('interests', 'fitness,health');
      expectedUrl.searchParams.append('limit', '5');

      expect(mockFetch).toHaveBeenCalledWith(
        expectedUrl.toString(),
        expect.any(Object)
      );
    });
  });

  describe('validateAudienceIds', () => {
    beforeEach(() => {
      mockFetch.mockClear();
      mockFetch.mockReset();
    });

    it('should validate audience IDs successfully', async () => {
      const mockValidationResponse = {
        audiences: [
          { id: 'aud_1', name: 'Valid Audience 1' },
          { id: 'aud_3', name: 'Valid Audience 3' }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockValidationResponse,
        headers: new Headers()
      } as Response);

      const audienceIds = ['aud_1', 'aud_2', 'aud_3'];
      const result = await service.validateAudienceIds(audienceIds);

      expect(result.valid_ids).toEqual(['aud_1', 'aud_3']);
      expect(result.invalid_ids).toEqual(['aud_2']);
      expect(result.found_audiences).toHaveLength(2);
      expect(result.metadata.total_checked).toBe(3);
      expect(result.metadata.valid_count).toBe(2);
      expect(result.metadata.invalid_count).toBe(1);
      expect(result.status.success).toBe(true);
    });

    it('should handle empty audience IDs array', async () => {
      const result = await service.validateAudienceIds([]);

      expect(result.valid_ids).toEqual([]);
      expect(result.invalid_ids).toEqual([]);
      expect(result.found_audiences).toEqual([]);
      expect(result.metadata.total_checked).toBe(0);
      expect(result.status.success).toBe(true);
      expect(result.status.warnings).toContain('Empty audience IDs array provided');
    });

    it('should handle validation errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const audienceIds = ['aud_1', 'aud_2'];
      const result = await service.validateAudienceIds(audienceIds);

      // Should treat all IDs as invalid when API fails
      expect(result.valid_ids).toEqual([]);
      expect(result.invalid_ids).toEqual(['aud_1', 'aud_2']);
      expect(result.metadata.valid_count).toBe(0);
      expect(result.metadata.invalid_count).toBe(2);
    });

    it('should handle large batches of audience IDs', async () => {
      // Create array of 75 IDs to test batching (batch size is 50)
      const audienceIds = Array.from({ length: 75 }, (_, i) => `aud_${i + 1}`);
      
      // Mock responses for two batches
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            audiences: Array.from({ length: 30 }, (_, i) => ({
              id: `aud_${i + 1}`,
              name: `Audience ${i + 1}`
            }))
          }),
          headers: new Headers()
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            audiences: Array.from({ length: 20 }, (_, i) => ({
              id: `aud_${i + 51}`,
              name: `Audience ${i + 51}`
            }))
          }),
          headers: new Headers()
        } as Response);

      const result = await service.validateAudienceIds(audienceIds);

      expect(mockFetch).toHaveBeenCalledTimes(2); // Two batches
      expect(result.metadata.total_checked).toBe(75);
      expect(result.valid_ids).toHaveLength(50); // 30 + 20 valid
      expect(result.invalid_ids).toHaveLength(25); // 75 - 50 invalid
    });
  });

  describe('extractAudienceMetadata', () => {
    it('should extract comprehensive metadata from audience', () => {
      const audience: QlooAudience = {
        id: 'aud_test',
        name: 'Test Audience',
        demographics: {
          age_range: { min: 25, max: 40 },
          location: { country: 'France', region: 'Île-de-France' },
          income_level: 'high'
        },
        size: 5000000,
        interests: ['technology', 'innovation', 'startups', 'design', 'entrepreneurship'],
        behaviors: ['early_adopter', 'tech_savvy']
      };

      const metadata = service.extractAudienceMetadata(audience);

      expect(metadata.demographic_summary).toBe('Ages 25-40 in France');
      expect(metadata.key_interests).toEqual(['technology', 'innovation', 'startups', 'design', 'entrepreneurship']);
      expect(metadata.estimated_reach).toBe('Large (1M-10M)');
      expect(metadata.targeting_potential).toBe('high');
    });

    it('should handle audience with minimal data', () => {
      const audience: QlooAudience = {
        id: 'aud_minimal',
        name: 'Minimal Audience',
        size: 50000,
        interests: ['lifestyle']
      };

      const metadata = service.extractAudienceMetadata(audience);

      expect(metadata.demographic_summary).toBe('General audience');
      expect(metadata.key_interests).toEqual(['lifestyle']);
      expect(metadata.estimated_reach).toBe('Small (<100K)');
      expect(metadata.targeting_potential).toBe('low');
    });

    it('should handle audience with no size data', () => {
      const audience: QlooAudience = {
        id: 'aud_no_size',
        name: 'No Size Audience'
      };

      const metadata = service.extractAudienceMetadata(audience);

      expect(metadata.estimated_reach).toBe('Unknown');
      expect(metadata.targeting_potential).toBe('low');
    });
  });

  describe('validation methods', () => {
    it('should validate supported audience categories', () => {
      const categories = service.getSupportedAudienceCategories();
      
      expect(categories).toContain('millennials');
      expect(categories).toContain('gen_z');
      expect(categories).toContain('tech_enthusiasts');
      expect(categories).toContain('urban_professionals');
      
      expect(service.validateAudienceCategory('millennials')).toBe(true);
      expect(service.validateAudienceCategory('invalid_category')).toBe(false);
    });

    it('should validate demographics correctly', () => {
      const validDemographics: Partial<QlooAudienceDemographics> = {
        age_range: { min: 25, max: 40 },
        gender_distribution: { male: 0.6, female: 0.4 },
        income_level: 'high',
        education_level: 'bachelor'
      };

      const result = service.validateDemographics(validDemographics);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid age ranges', () => {
      const invalidDemographics: Partial<QlooAudienceDemographics> = {
        age_range: { min: 50, max: 30 } // min > max
      };

      const result = service.validateDemographics(invalidDemographics);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Age minimum must be less than age maximum');
    });

    it('should detect invalid income levels', () => {
      const invalidDemographics: Partial<QlooAudienceDemographics> = {
        income_level: 'invalid_level' as any
      };

      const result = service.validateDemographics(invalidDemographics);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid income level: invalid_level');
    });

    it('should warn about gender distribution over 100%', () => {
      const demographics: Partial<QlooAudienceDemographics> = {
        gender_distribution: { male: 0.7, female: 0.6 } // Total = 1.3 > 1.0
      };

      const result = service.validateDemographics(demographics);
      
      expect(result.warnings).toContain('Gender distribution percentages sum to more than 100%');
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      mockFetch.mockClear();
      mockFetch.mockReset();
    });

    it('should handle 403 Forbidden errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        headers: new Headers()
      } as Response);

      await expect(service.getAudiences()).rejects.toMatchObject({
        type: QlooErrorType.AUTHORIZATION,
        code: 'FORBIDDEN',
        message: 'API key does not have permission to access audiences'
      });
    });

    it('should handle 404 Not Found errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers()
      } as Response);

      await expect(service.getAudiences()).rejects.toMatchObject({
        type: QlooErrorType.NOT_FOUND,
        code: 'ENDPOINT_NOT_FOUND',
        message: 'Audiences endpoint not found'
      });
    });

    it('should handle 422 Validation errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        headers: new Headers()
      } as Response);

      await expect(service.getAudiences()).rejects.toMatchObject({
        type: QlooErrorType.VALIDATION,
        code: 'INVALID_PARAMS',
        message: 'Invalid parameters for audiences request'
      });
    });

    it('should handle 429 Rate Limit errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: new Headers()
      } as Response);

      await expect(service.getAudiences()).rejects.toMatchObject({
        type: QlooErrorType.RATE_LIMIT,
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Rate limit exceeded for audiences endpoint',
        retryable: true
      });
    });

    it('should handle 500 Server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers()
      } as Response);

      await expect(service.getAudiences()).rejects.toMatchObject({
        type: QlooErrorType.SERVER_ERROR,
        code: 'SERVER_ERROR',
        message: 'Server error on audiences endpoint: 500 Internal Server Error',
        retryable: true
      });
    });
  });

  describe('utility methods', () => {
    it('should return supported income levels', () => {
      const levels = service.getSupportedIncomeLevels();
      expect(levels).toEqual(['low', 'medium', 'high', 'very_high']);
    });

    it('should return supported education levels', () => {
      const levels = service.getSupportedEducationLevels();
      expect(levels).toEqual(['high_school', 'bachelor', 'master', 'phd', 'other']);
    });
  });
});