// Tests unitaires pour le service d'insights Qloo
// Couvre les opérations d'insights et la validation complète des paramètres

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { QlooInsightsService, type InsightsParamsValidationResult } from '@/lib/api/qloo-insights';
import { QlooErrorType, type EntityUrn, type InsightsParams } from '@/lib/types/qloo-compliant';

// Mock fetch pour les tests
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
    value: {
        randomUUID: jest.fn(() => 'test-uuid-123')
    }
});

describe('QlooInsightsService', () => {
    let insightsService: QlooInsightsService;
    const mockApiKey = 'test-api-key';
    const mockBaseUrl = 'https://hackathon.api.qloo.com';

    beforeEach(() => {
        insightsService = new QlooInsightsService(mockApiKey, mockBaseUrl);
        mockFetch.mockClear();
    });

    describe('Constructor', () => {
        it('should throw error when API key is missing', () => {
            expect(() => new QlooInsightsService('')).toThrow('API key is required for Qloo Insights Service');
        });

        it('should throw error when API key is whitespace', () => {
            expect(() => new QlooInsightsService('   ')).toThrow('API key is required for Qloo Insights Service');
        });

        it('should initialize with correct configuration', () => {
            const service = new QlooInsightsService(mockApiKey, mockBaseUrl, 5000);
            expect(service).toBeInstanceOf(QlooInsightsService);
        });
    });

    describe('Parameter Validation', () => {
        describe('Required Parameters', () => {
            it('should require filter.type parameter', () => {
                const params = {} as InsightsParams;
                const result = insightsService.validateParams(params);

                expect(result.valid).toBe(false);
                expect(result.errors).toContain('filter.type is required according to Qloo API specifications');
            });

            it('should validate filter.type is a valid EntityUrn', () => {
                const params: InsightsParams = {
                    'filter.type': 'invalid:type' as EntityUrn
                };
                const result = insightsService.validateParams(params);

                expect(result.valid).toBe(false);
                expect(result.errors).toContain('Invalid filter.type: invalid:type. Must be a valid EntityUrn.');
                expect(result.suggestions).toContain('Use one of: urn:entity:brand, urn:entity:artist, urn:entity:movie, urn:entity:tv_show, urn:entity:book');
            });

            it('should accept all valid EntityUrn types', () => {
                const validTypes: EntityUrn[] = [
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

                validTypes.forEach(type => {
                    const params: InsightsParams = { 'filter.type': type };
                    const result = insightsService.validateParams(params);
                    expect(result.valid).toBe(true);
                });
            });
        });

        describe('Signal Parameters', () => {
            it('should validate signal.interests.entities is an array', () => {
                const params: InsightsParams = {
                    'filter.type': 'urn:entity:brand',
                    'signal.interests.entities': 'not-an-array' as any
                };
                const result = insightsService.validateParams(params);

                expect(result.valid).toBe(false);
                expect(result.errors).toContain('signal.interests.entities must be an array of entity IDs');
            });

            it('should warn when signal.interests.entities is empty', () => {
                const params: InsightsParams = {
                    'filter.type': 'urn:entity:brand',
                    'signal.interests.entities': []
                };
                const result = insightsService.validateParams(params);

                expect(result.valid).toBe(true);
                expect(result.warnings).toContain('signal.interests.entities is empty');
            });

            it('should warn when signal.interests.entities has too many items', () => {
                const params: InsightsParams = {
                    'filter.type': 'urn:entity:brand',
                    'signal.interests.entities': Array(51).fill('entity-id')
                };
                const result = insightsService.validateParams(params);

                expect(result.valid).toBe(true);
                expect(result.warnings).toContain('signal.interests.entities has more than 50 items, may impact performance');
                expect(result.suggestions).toContain('Consider limiting to the most relevant entities (max 20-30)');
            });

            it('should validate entity IDs are strings', () => {
                const params: InsightsParams = {
                    'filter.type': 'urn:entity:brand',
                    'signal.interests.entities': ['valid-id', '', '   ', 123 as any]
                };
                const result = insightsService.validateParams(params);

                expect(result.valid).toBe(false);
                expect(result.errors).toContain('signal.interests.entities[3] must be a string');
                
                // Empty strings should be handled by normalization, not validation
                expect(result.normalized_params['signal.interests.entities']).toEqual(['valid-id']);
            });

            it('should validate signal.interests.tags similarly', () => {
                const params: InsightsParams = {
                    'filter.type': 'urn:entity:brand',
                    'signal.interests.tags': Array(101).fill('tag-id')
                };
                const result = insightsService.validateParams(params);

                expect(result.valid).toBe(true);
                expect(result.warnings).toContain('signal.interests.tags has more than 100 items, may impact performance');
                expect(result.suggestions).toContain('Consider limiting to the most relevant tags (max 50)');
            });

            it('should validate signal.demographics.audiences', () => {
                const params: InsightsParams = {
                    'filter.type': 'urn:entity:brand',
                    'signal.demographics.audiences': Array(21).fill('audience-id')
                };
                const result = insightsService.validateParams(params);

                expect(result.valid).toBe(true);
                expect(result.warnings).toContain('signal.demographics.audiences has more than 20 items, may impact performance');
                expect(result.suggestions).toContain('Consider limiting to the most relevant audiences (max 10)');
            });
        });

        describe('Filter Parameters', () => {
            it('should validate filter.tags is an array', () => {
                const params: InsightsParams = {
                    'filter.type': 'urn:entity:brand',
                    'filter.tags': 'not-an-array' as any
                };
                const result = insightsService.validateParams(params);

                expect(result.valid).toBe(false);
                expect(result.errors).toContain('filter.tags must be an array of tag IDs');
            });

            it('should warn when filter arrays are empty', () => {
                const params: InsightsParams = {
                    'filter.type': 'urn:entity:brand',
                    'filter.tags': [],
                    'filter.entities': [],
                    'filter.audiences': []
                };
                const result = insightsService.validateParams(params);

                expect(result.valid).toBe(true);
                expect(result.warnings).toContain('filter.tags is empty');
                expect(result.warnings).toContain('filter.entities is empty');
                expect(result.warnings).toContain('filter.audiences is empty');
            });

            it('should warn when filter arrays are too large', () => {
                const params: InsightsParams = {
                    'filter.type': 'urn:entity:brand',
                    'filter.tags': Array(51).fill('tag-id'),
                    'filter.entities': Array(31).fill('entity-id'),
                    'filter.audiences': Array(11).fill('audience-id')
                };
                const result = insightsService.validateParams(params);

                expect(result.valid).toBe(true);
                expect(result.warnings).toContain('filter.tags has more than 50 items, may impact performance');
                expect(result.warnings).toContain('filter.entities has more than 30 items, may impact performance');
                expect(result.warnings).toContain('filter.audiences has more than 10 items, may impact performance');
            });
        });

        describe('Configuration Parameters', () => {
            it('should validate limit parameter', () => {
                const invalidLimits = [0, -1, 101, 1.5, 'not-a-number'];
                
                invalidLimits.forEach(limit => {
                    const params: InsightsParams = {
                        'filter.type': 'urn:entity:brand',
                        limit: limit as any
                    };
                    const result = insightsService.validateParams(params);
                    expect(result.valid).toBe(false);
                    expect(result.errors).toContain('limit must be an integer between 1 and 100');
                });
            });

            it('should warn for high limit values', () => {
                const params: InsightsParams = {
                    'filter.type': 'urn:entity:brand',
                    limit: 75
                };
                const result = insightsService.validateParams(params);

                expect(result.valid).toBe(true);
                expect(result.warnings).toContain('High limit value may impact response time');
                expect(result.suggestions).toContain('Consider using pagination for large result sets');
            });

            it('should validate min_confidence parameter', () => {
                const invalidConfidences = [-0.1, 1.1, 'not-a-number'];
                
                invalidConfidences.forEach(confidence => {
                    const params: InsightsParams = {
                        'filter.type': 'urn:entity:brand',
                        min_confidence: confidence as any
                    };
                    const result = insightsService.validateParams(params);
                    expect(result.valid).toBe(false);
                    expect(result.errors).toContain('min_confidence must be a number between 0 and 1');
                });
            });

            it('should warn for very high confidence thresholds', () => {
                const params: InsightsParams = {
                    'filter.type': 'urn:entity:brand',
                    min_confidence: 0.95
                };
                const result = insightsService.validateParams(params);

                expect(result.valid).toBe(true);
                expect(result.warnings).toContain('Very high confidence threshold may result in few results');
                expect(result.suggestions).toContain('Consider lowering min_confidence to 0.7-0.8 for better results');
            });

            it('should validate language parameter', () => {
                const params: InsightsParams = {
                    'filter.type': 'urn:entity:brand',
                    language: 'invalid-lang' as any
                };
                const result = insightsService.validateParams(params);

                expect(result.valid).toBe(false);
                expect(result.errors).toContain('Unsupported language: invalid-lang. Supported: en, fr, es, de, it, pt');
            });

            it('should accept valid languages', () => {
                const validLanguages = ['en', 'fr', 'es', 'de', 'it', 'pt'];
                
                validLanguages.forEach(language => {
                    const params: InsightsParams = {
                        'filter.type': 'urn:entity:brand',
                        language: language as any
                    };
                    const result = insightsService.validateParams(params);
                    expect(result.valid).toBe(true);
                });
            });

            it('should validate region parameter', () => {
                const params: InsightsParams = {
                    'filter.type': 'urn:entity:brand',
                    region: ''
                };
                const result = insightsService.validateParams(params);

                expect(result.valid).toBe(false);
                expect(result.errors).toContain('region must be a non-empty string');
            });

            it('should warn for unusually long region codes', () => {
                const params: InsightsParams = {
                    'filter.type': 'urn:entity:brand',
                    region: 'very-long-region-code'
                };
                const result = insightsService.validateParams(params);

                expect(result.valid).toBe(true);
                expect(result.warnings).toContain('Region code seems unusually long');
                expect(result.suggestions).toContain('Use standard region codes (e.g., US, EU, APAC)');
            });
        });

        describe('Parameter Coherence', () => {
            it('should require at least one signal or filter', () => {
                const params: InsightsParams = {
                    'filter.type': 'urn:entity:brand'
                };
                const result = insightsService.validateParams(params);

                expect(result.valid).toBe(true);
                expect(result.warnings).toContain('No signals or filters provided - insights may be limited');
                expect(result.suggestions).toContain('Add signal.interests.entities, signal.interests.tags, or signal.demographics.audiences for better insights');
            });

            it('should provide suggestions based on filter.type', () => {
                const params: InsightsParams = {
                    'filter.type': 'urn:entity:brand',
                    'signal.interests.tags': ['tag1']
                };
                const result = insightsService.validateParams(params);

                expect(result.valid).toBe(true);
                expect(result.suggestions).toContain('For brand insights, consider adding signal.interests.entities with related brands');
            });

            it('should warn when too many parameters are provided', () => {
                const params: InsightsParams = {
                    'filter.type': 'urn:entity:brand',
                    'signal.interests.entities': ['entity1'],
                    'signal.interests.tags': ['tag1'],
                    'signal.demographics.audiences': ['audience1'],
                    'filter.tags': ['filter-tag1'],
                    'filter.entities': ['filter-entity1'],
                    'filter.audiences': ['filter-audience1'],
                    limit: 20,
                    min_confidence: 0.8,
                    language: 'en'
                };
                const result = insightsService.validateParams(params);

                expect(result.valid).toBe(true);
                expect(result.warnings).toContain('Many parameters provided, may impact performance');
                expect(result.suggestions).toContain('Focus on the most relevant signals and filters for better performance');
            });
        });

        describe('Parameter Normalization', () => {
            it('should normalize parameters correctly', () => {
                const params: InsightsParams = {
                    'filter.type': 'urn:entity:brand',
                    'signal.interests.entities': ['entity1', 'entity1', '', '  ', 'entity2'], // duplicates and empty
                    'signal.interests.tags': ['tag1', 'tag2', 'tag1'], // duplicates
                    limit: 150, // too high
                    min_confidence: 1.5, // too high
                    language: 'EN', // wrong case
                    region: '  us  ' // whitespace
                };
                const result = insightsService.validateParams(params);

                expect(result.normalized_params['signal.interests.entities']).toEqual(['entity1', 'entity2']);
                expect(result.normalized_params['signal.interests.tags']).toEqual(['tag1', 'tag2']);
                expect(result.normalized_params.limit).toBe(100);
                expect(result.normalized_params.min_confidence).toBe(1);
                expect(result.normalized_params.language).toBe('en');
                expect(result.normalized_params.region).toBe('US');
            });
        });
    });

    describe('getInsights', () => {
        const validParams: InsightsParams = {
            'filter.type': 'urn:entity:brand',
            'signal.interests.entities': ['entity1', 'entity2'],
            limit: 10
        };

        const mockInsightsResponse = {
            entities: [
                {
                    id: 'entity-1',
                    name: 'Test Brand',
                    type: 'urn:entity:brand',
                    confidence: 0.9,
                    metadata: { category: 'fashion' }
                }
            ],
            tags: [
                {
                    id: 'tag-1',
                    name: 'Fashion',
                    category: 'lifestyle',
                    weight: 0.8
                }
            ],
            audiences: [
                {
                    id: 'audience-1',
                    name: 'Fashion Enthusiasts',
                    size: 1000000
                }
            ],
            confidence: 0.85
        };

        beforeEach(() => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => mockInsightsResponse,
                headers: new Headers()
            } as Response);
        });

        it('should get insights successfully', async () => {
            const result = await insightsService.getInsights(validParams);

            expect(result.entities).toHaveLength(1);
            expect(result.entities[0].name).toBe('Test Brand');
            expect(result.tags).toHaveLength(1);
            expect(result.audiences).toHaveLength(1);
            expect(result.confidence).toBe(0.85);
            expect(result.metadata.data_source).toBe('qloo_api');
            expect(result.status.success).toBe(true);
        });

        it('should validate parameters before making request', async () => {
            const invalidParams = {} as InsightsParams;

            await expect(insightsService.getInsights(invalidParams))
                .rejects.toMatchObject({
                    type: QlooErrorType.VALIDATION,
                    code: 'INVALID_INSIGHTS_PARAMS'
                });
        });

        it('should construct correct URL with parameters', async () => {
            await insightsService.getInsights(validParams);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/v2/insights'),
                expect.any(Object)
            );
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('filter.type=urn%3Aentity%3Abrand'),
                expect.any(Object)
            );
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('signal.interests.entities=entity1%2Centity2'),
                expect.any(Object)
            );
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('limit=10'),
                expect.any(Object)
            );
        });

        it('should include correct headers', async () => {
            await insightsService.getInsights(validParams);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'X-API-Key': mockApiKey,
                        'User-Agent': 'PersonaCraft/1.0',
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    })
                })
            );
        });

        it('should handle API errors correctly', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 401,
                statusText: 'Unauthorized'
            } as Response);

            await expect(insightsService.getInsights(validParams))
                .rejects.toMatchObject({
                    type: QlooErrorType.AUTHENTICATION,
                    code: 'UNAUTHORIZED'
                });
        });

        it('should handle network timeout', async () => {
            mockFetch.mockImplementation(() =>
                new Promise((_, reject) => {
                    const error = new Error('Timeout');
                    error.name = 'AbortError';
                    setTimeout(() => reject(error), 100);
                })
            );

            await expect(insightsService.getInsights(validParams))
                .rejects.toMatchObject({
                    type: QlooErrorType.NETWORK_ERROR,
                    code: 'TIMEOUT'
                });
        });

        it('should parse response with missing fields gracefully', async () => {
            const incompleteResponse = {
                entities: [
                    { id: 'entity-1', name: 'Complete Entity', type: 'urn:entity:brand' },
                    { id: 'entity-2' }, // Missing name and type
                    null, // Invalid entity
                ],
                tags: [
                    { id: 'tag-1', name: 'Complete Tag' },
                    { name: 'No ID Tag' }, // Missing ID
                ],
                audiences: [
                    { id: 'audience-1', name: 'Complete Audience' },
                    'invalid' // Invalid audience
                ]
            };

            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => incompleteResponse,
                headers: new Headers()
            } as Response);

            const result = await insightsService.getInsights(validParams);

            // Should handle missing fields gracefully
            expect(result.entities.length).toBeGreaterThan(0);
            result.entities.forEach(entity => {
                expect(entity.id).toBeDefined();
                expect(entity.name).toBeDefined();
                expect(entity.type).toBeDefined();
            });

            result.tags.forEach(tag => {
                expect(tag.id).toBeDefined();
                expect(tag.name).toBeDefined();
            });

            result.audiences.forEach(audience => {
                expect(audience.id).toBeDefined();
                expect(audience.name).toBeDefined();
            });
        });

        it('should include correct metadata in response', async () => {
            const result = await insightsService.getInsights(validParams);

            expect(result.metadata).toMatchObject({
                request_id: 'test-uuid-123',
                data_source: 'qloo_api',
                api_version: 'hackathon-v1',
                total_results: 3, // 1 entity + 1 tag + 1 audience
                cached: false
            });

            expect(result.metadata.processing_time).toBeGreaterThan(0);
            expect(result.metadata.timestamp).toBeDefined();
            expect(result.metadata.filters_applied).toContain('type:urn:entity:brand');
            expect(result.metadata.filters_applied).toContain('limit:10');
            expect(result.metadata.signals_used).toContain('interest_entities:2');
        });
    });

    describe('HTTP Error Handling', () => {
        const validParams: InsightsParams = {
            'filter.type': 'urn:entity:brand',
            'signal.interests.entities': ['entity1']
        };

        const testCases = [
            { status: 401, expectedType: QlooErrorType.AUTHENTICATION, expectedCode: 'UNAUTHORIZED' },
            { status: 403, expectedType: QlooErrorType.AUTHORIZATION, expectedCode: 'FORBIDDEN' },
            { status: 404, expectedType: QlooErrorType.NOT_FOUND, expectedCode: 'ENDPOINT_NOT_FOUND' },
            { status: 422, expectedType: QlooErrorType.VALIDATION, expectedCode: 'INVALID_PARAMS' },
            { status: 429, expectedType: QlooErrorType.RATE_LIMIT, expectedCode: 'RATE_LIMIT_EXCEEDED' },
            { status: 500, expectedType: QlooErrorType.SERVER_ERROR, expectedCode: 'SERVER_ERROR' },
            { status: 400, expectedType: QlooErrorType.NETWORK_ERROR, expectedCode: 'HTTP_ERROR' }
        ];

        testCases.forEach(({ status, expectedType, expectedCode }) => {
            it(`should handle ${status} HTTP error correctly`, async () => {
                mockFetch.mockResolvedValue({
                    ok: false,
                    status,
                    statusText: `HTTP ${status}`
                } as Response);

                await expect(insightsService.getInsights(validParams))
                    .rejects.toMatchObject({
                        type: expectedType,
                        code: expectedCode
                    });
            });
        });
    });

    describe('Utility Methods', () => {
        it('should return supported entity types', () => {
            const types = insightsService.getSupportedEntityTypes();
            expect(types).toContain('urn:entity:brand');
            expect(types).toContain('urn:entity:artist');
            expect(types).toContain('urn:entity:movie');
            expect(types).toHaveLength(10);
        });

        it('should return supported languages', () => {
            const languages = insightsService.getSupportedLanguages();
            expect(languages).toEqual(['en', 'fr', 'es', 'de', 'it', 'pt']);
        });

        it('should validate entity types correctly', () => {
            expect(insightsService.validateEntityType('urn:entity:brand')).toBe(true);
            expect(insightsService.validateEntityType('invalid:type')).toBe(false);
        });

        it('should validate languages correctly', () => {
            expect(insightsService.validateLanguage('en')).toBe(true);
            expect(insightsService.validateLanguage('invalid')).toBe(false);
        });
    });

    describe('Complex Parameter Combinations', () => {
        it('should handle all parameter types together', async () => {
            const complexParams: InsightsParams = {
                'filter.type': 'urn:entity:brand',
                'signal.interests.entities': ['entity1', 'entity2'],
                'signal.interests.tags': ['tag1', 'tag2'],
                'signal.demographics.audiences': ['audience1'],
                'filter.tags': ['filter-tag1'],
                'filter.entities': ['filter-entity1'],
                'filter.audiences': ['filter-audience1'],
                limit: 25,
                min_confidence: 0.7,
                language: 'fr',
                region: 'EU'
            };

            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => ({ entities: [], tags: [], audiences: [] }),
                headers: new Headers()
            } as Response);

            const result = await insightsService.getInsights(complexParams);

            expect(result.status.success).toBe(true);
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('signal.interests.entities=entity1%2Centity2'),
                expect.any(Object)
            );
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('language=fr'),
                expect.any(Object)
            );
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('region=EU'),
                expect.any(Object)
            );
        });

        it('should validate complex parameter combinations', () => {
            const complexParams: InsightsParams = {
                'filter.type': 'urn:entity:brand',
                'signal.interests.entities': ['entity1', 'entity2'],
                'signal.interests.tags': ['tag1', 'tag2'],
                'signal.demographics.audiences': ['audience1'],
                limit: 25,
                min_confidence: 0.7,
                language: 'fr',
                region: 'EU'
            };

            const result = insightsService.validateParams(complexParams);

            expect(result.valid).toBe(true);
            expect(result.normalized_params).toMatchObject({
                'filter.type': 'urn:entity:brand',
                'signal.interests.entities': ['entity1', 'entity2'],
                'signal.interests.tags': ['tag1', 'tag2'],
                'signal.demographics.audiences': ['audience1'],
                limit: 25,
                min_confidence: 0.7,
                language: 'fr',
                region: 'EU'
            });
        });
    });
});

describe('QlooApiClient Insights Integration', () => {
    let apiClient: any;
    const mockApiKey = 'test-api-key';

    beforeEach(() => {
        // Mock environment variable
        process.env.QLOO_API_KEY = mockApiKey;
        const { QlooApiClient } = require('@/lib/api/qloo');
        apiClient = new QlooApiClient();
        mockFetch.mockClear();
    });

    afterEach(() => {
        delete process.env.QLOO_API_KEY;
    });

    it('should integrate insights service correctly', async () => {
        const mockResponse = {
            entities: [{ id: '1', name: 'Test Entity', type: 'urn:entity:brand' }],
            tags: [],
            audiences: []
        };

        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
            headers: new Headers()
        } as Response);

        const params: InsightsParams = {
            'filter.type': 'urn:entity:brand',
            'signal.interests.entities': ['entity1']
        };

        const result = await apiClient.getInsights(params);

        expect(result.entities).toHaveLength(1);
        expect(result.entities[0].name).toBe('Test Entity');
    });

    it('should validate insights parameters through main client', () => {
        const params: InsightsParams = {
            'filter.type': 'urn:entity:brand',
            'signal.interests.entities': ['entity1']
        };

        const result = apiClient.validateInsightsParams(params);
        expect(result.valid).toBe(true);
    });

    it('should provide insights utility methods through main client', () => {
        expect(apiClient.getSupportedInsightsEntityTypes()).toContain('urn:entity:brand');
        expect(apiClient.getSupportedInsightsLanguages()).toContain('en');
        expect(apiClient.validateInsightsEntityType('urn:entity:brand')).toBe(true);
        expect(apiClient.validateInsightsLanguage('en')).toBe(true);
    });
});