// Tests unitaires pour le service de recherche Qloo
// Couvre les opérations de recherche et la validation des types d'entités

import { QlooSearchService, type BatchSearchQuery } from '@/lib/api/qloo-search';
import { QlooErrorType, type EntityUrn } from '@/lib/types/qloo-compliant';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { afterEach } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import { it } from 'date-fns/locale';
import { describe } from 'node:test';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { describe } from 'node:test';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { describe } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Import QlooApiClient only for integration tests
const { QlooApiClient } = require('@/lib/api/qloo');

// Mock fetch pour les tests
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
    value: {
        randomUUID: jest.fn(() => 'test-uuid-123')
    }
});

describe('QlooSearchService', () => {
    let searchService: QlooSearchService;
    const mockApiKey = 'test-api-key';
    const mockBaseUrl = 'https://hackathon.api.qloo.com';

    beforeEach(() => {
        searchService = new QlooSearchService(mockApiKey, mockBaseUrl);
        mockFetch.mockClear();
    });

    describe('Constructor', () => {
        it('should throw error when API key is missing', () => {
            expect(() => new QlooSearchService('')).toThrow('API key is required for Qloo Search Service');
        });

        it('should initialize with correct configuration', () => {
            const service = new QlooSearchService(mockApiKey, mockBaseUrl, 5000);
            expect(service).toBeInstanceOf(QlooSearchService);
        });
    });

    describe('Entity Type Validation', () => {
        it('should validate all supported entity types', () => {
            const supportedTypes: EntityUrn[] = [
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

            supportedTypes.forEach(type => {
                expect(searchService.validateEntityType(type)).toBe(true);
            });
        });

        it('should reject invalid entity types', () => {
            const invalidTypes = [
                'invalid:type',
                'urn:entity:invalid',
                'brand',
                'artist',
                '',
                'urn:invalid:brand'
            ];

            invalidTypes.forEach(type => {
                expect(searchService.validateEntityType(type)).toBe(false);
            });
        });

        it('should return correct list of supported entity types', () => {
            const supportedTypes = searchService.getSupportedEntityTypes();
            expect(supportedTypes).toHaveLength(10);
            expect(supportedTypes).toContain('urn:entity:brand');
            expect(supportedTypes).toContain('urn:entity:artist');
            expect(supportedTypes).toContain('urn:entity:movie');
            expect(supportedTypes).toContain('urn:entity:tv_show');
            expect(supportedTypes).toContain('urn:entity:book');
        });
    });

    describe('searchEntities', () => {
        const mockSearchResponse = {
            entities: [
                {
                    id: 'entity-1',
                    name: 'Test Brand',
                    type: 'urn:entity:brand',
                    confidence: 0.9,
                    metadata: { category: 'fashion' }
                },
                {
                    id: 'entity-2',
                    name: 'Another Brand',
                    type: 'urn:entity:brand',
                    confidence: 0.8
                }
            ]
        };

        beforeEach(() => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => mockSearchResponse,
                headers: new Headers()
            } as Response);
        });

        it('should search entities successfully', async () => {
            const result = await searchService.searchEntities('test query', 'urn:entity:brand');

            expect(result.entities).toHaveLength(2);
            expect(result.entities[0].name).toBe('Test Brand');
            expect(result.entities[0].type).toBe('urn:entity:brand');
            expect(result.metadata.query).toBe('test query');
            expect(result.metadata.total_results).toBe(2);
            expect(result.status.success).toBe(true);
        });

        it('should validate search parameters', async () => {
            // Test empty query
            await expect(searchService.searchEntities('', 'urn:entity:brand'))
                .rejects.toMatchObject({
                    type: QlooErrorType.VALIDATION,
                    code: 'EMPTY_QUERY'
                });

            // Test invalid entity type
            await expect(searchService.searchEntities('test', 'invalid:type' as EntityUrn))
                .rejects.toMatchObject({
                    type: QlooErrorType.VALIDATION,
                    code: 'INVALID_ENTITY_TYPE'
                });
        });

        it('should handle search options correctly', async () => {
            const options = {
                limit: 10,
                min_confidence: 0.7,
                language: 'fr' as const,
                region: 'EU'
            };

            await searchService.searchEntities('test query', 'urn:entity:brand', options);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('limit=10'),
                expect.any(Object)
            );
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('min_confidence=0.7'),
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

        it('should handle API errors correctly', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 401,
                statusText: 'Unauthorized'
            } as Response);

            await expect(searchService.searchEntities('test', 'urn:entity:brand'))
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

            await expect(searchService.searchEntities('test', 'urn:entity:brand'))
                .rejects.toMatchObject({
                    type: QlooErrorType.NETWORK_ERROR,
                    code: 'TIMEOUT'
                });
        });

        it('should parse entities with missing fields gracefully', async () => {
            const incompleteResponse = {
                entities: [
                    { id: 'entity-1', name: 'Complete Entity', type: 'urn:entity:brand' },
                    { id: 'entity-2' }, // Missing name and type
                    { name: 'No ID Entity', type: 'urn:entity:artist' }, // Missing ID
                    null, // Invalid entity
                    'invalid' // Invalid entity
                ]
            };

            mockFetch.mockResolvedValue({
                ok: true,
                json: async () => incompleteResponse,
                headers: new Headers()
            } as Response);

            const result = await searchService.searchEntities('test', 'urn:entity:brand');

            // Should filter out invalid entities and provide defaults for missing fields
            expect(result.entities.length).toBeGreaterThan(0);
            result.entities.forEach(entity => {
                expect(entity.id).toBeDefined();
                expect(entity.name).toBeDefined();
                expect(entity.type).toBeDefined();
            });
        });
    });

    describe('batchSearch', () => {
        const mockBatchQueries: BatchSearchQuery[] = [
            { query: 'Nike', type: 'urn:entity:brand', id: 'query-1' },
            { query: 'Adidas', type: 'urn:entity:brand', id: 'query-2' },
            { query: 'Taylor Swift', type: 'urn:entity:artist', id: 'query-3' }
        ];

        beforeEach(() => {
            mockFetch.mockImplementation((url) => {
                const urlStr = url as string;
                let mockResponse;

                if (urlStr.includes('Nike')) {
                    mockResponse = { entities: [{ id: '1', name: 'Nike', type: 'urn:entity:brand' }] };
                } else if (urlStr.includes('Adidas')) {
                    mockResponse = { entities: [{ id: '2', name: 'Adidas', type: 'urn:entity:brand' }] };
                } else if (urlStr.includes('Taylor%20Swift')) {
                    mockResponse = { entities: [{ id: '3', name: 'Taylor Swift', type: 'urn:entity:artist' }] };
                } else {
                    mockResponse = { entities: [] };
                }

                return Promise.resolve({
                    ok: true,
                    json: async () => mockResponse,
                    headers: new Headers()
                } as Response);
            });
        });

        it('should perform batch search successfully', async () => {
            const result = await searchService.batchSearch(mockBatchQueries);

            expect(result.results).toHaveLength(3);
            expect(result.metadata.total_queries).toBe(3);
            expect(result.metadata.successful_queries).toBe(3);
            expect(result.metadata.failed_queries).toBe(0);
            expect(result.status.success).toBe(true);
        });

        it('should validate batch search parameters', async () => {
            // Test empty batch
            await expect(searchService.batchSearch([]))
                .rejects.toMatchObject({
                    type: QlooErrorType.VALIDATION,
                    code: 'EMPTY_BATCH'
                });

            // Test batch too large
            const largeBatch = Array(51).fill(0).map((_, i) => ({
                query: `query-${i}`,
                type: 'urn:entity:brand' as EntityUrn,
                id: `id-${i}`
            }));

            await expect(searchService.batchSearch(largeBatch))
                .rejects.toMatchObject({
                    type: QlooErrorType.VALIDATION,
                    code: 'BATCH_TOO_LARGE'
                });
        });

        it('should handle partial failures in batch search', async () => {
            mockFetch.mockImplementation((url) => {
                const urlStr = url as string;

                if (urlStr.includes('Nike')) {
                    return Promise.resolve({
                        ok: true,
                        json: async () => ({ entities: [{ id: '1', name: 'Nike', type: 'urn:entity:brand' }] }),
                        headers: new Headers()
                    } as Response);
                } else {
                    return Promise.resolve({
                        ok: false,
                        status: 500,
                        statusText: 'Internal Server Error'
                    } as Response);
                }
            });

            const result = await searchService.batchSearch(mockBatchQueries);

            expect(result.metadata.successful_queries).toBe(1);
            expect(result.metadata.failed_queries).toBe(2);
            expect(result.status.code).toBe(207); // Multi-Status
            expect(result.status.success).toBe(true); // At least one succeeded
            expect(result.status.warnings).toContain('2 out of 3 searches failed');
        });

        it('should generate query IDs when not provided', async () => {
            const queriesWithoutIds: BatchSearchQuery[] = [
                { query: 'Nike', type: 'urn:entity:brand' },
                { query: 'Adidas', type: 'urn:entity:brand' }
            ];

            const result = await searchService.batchSearch(queriesWithoutIds);

            expect(result.results[0].query_id).toBe('query_0');
            expect(result.results[1].query_id).toBe('query_1');
        });
    });

    describe('HTTP Error Handling', () => {
        const testCases = [
            { status: 401, expectedType: QlooErrorType.AUTHENTICATION, expectedCode: 'UNAUTHORIZED' },
            { status: 403, expectedType: QlooErrorType.AUTHORIZATION, expectedCode: 'FORBIDDEN' },
            { status: 404, expectedType: QlooErrorType.NOT_FOUND, expectedCode: 'ENDPOINT_NOT_FOUND' },
            { status: 422, expectedType: QlooErrorType.VALIDATION, expectedCode: 'INVALID_SEARCH_PARAMS' },
            { status: 429, expectedType: QlooErrorType.RATE_LIMIT, expectedCode: 'RATE_LIMIT_EXCEEDED' },
            { status: 500, expectedType: QlooErrorType.SERVER_ERROR, expectedCode: 'SEARCH_SERVER_ERROR' },
            { status: 400, expectedType: QlooErrorType.NETWORK_ERROR, expectedCode: 'SEARCH_HTTP_ERROR' }
        ];

        testCases.forEach(({ status, expectedType, expectedCode }) => {
            it(`should handle ${status} HTTP error correctly`, async () => {
                mockFetch.mockResolvedValue({
                    ok: false,
                    status,
                    statusText: `HTTP ${status}`
                } as Response);

                await expect(searchService.searchEntities('test', 'urn:entity:brand'))
                    .rejects.toMatchObject({
                        type: expectedType,
                        code: expectedCode
                    });
            });
        });
    });
});

describe('QlooApiClient Search Integration', () => {
    let apiClient: QlooApiClient;
    const mockApiKey = 'test-api-key';

    beforeEach(() => {
        // Mock environment variable
        process.env.QLOO_API_KEY = mockApiKey;
        apiClient = new QlooApiClient();
        mockFetch.mockClear();
    });

    afterEach(() => {
        delete process.env.QLOO_API_KEY;
    });

    it('should integrate search service correctly', async () => {
        const mockResponse = {
            entities: [{ id: '1', name: 'Test Entity', type: 'urn:entity:brand' }]
        };

        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
            headers: new Headers()
        } as Response);

        const result = await apiClient.searchEntities('test', 'urn:entity:brand');

        expect(result.entities).toHaveLength(1);
        expect(result.entities[0].name).toBe('Test Entity');
    });

    it('should validate entity types through main client', () => {
        expect(apiClient.validateEntityType('urn:entity:brand')).toBe(true);
        expect(apiClient.validateEntityType('invalid')).toBe(false);
    });

    it('should return supported entity types through main client', () => {
        const types = apiClient.getSupportedEntityTypes();
        expect(types).toContain('urn:entity:brand');
        expect(types).toContain('urn:entity:artist');
        expect(types).toHaveLength(10);
    });

    it('should perform batch search through main client', async () => {
        const mockResponse = {
            entities: [{ id: '1', name: 'Test Entity', type: 'urn:entity:brand' }]
        };

        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
            headers: new Headers()
        } as Response);

        const queries: BatchSearchQuery[] = [
            { query: 'test', type: 'urn:entity:brand', id: 'test-1' }
        ];

        const result = await apiClient.batchSearch(queries);

        expect(result.results).toHaveLength(1);
        expect(result.metadata.total_queries).toBe(1);
    });
});

describe('Search Service Error Recovery', () => {
    let searchService: QlooSearchService;

    beforeEach(() => {
        searchService = new QlooSearchService('test-key');
    });

    it('should handle malformed API responses gracefully', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ invalid: 'response' }),
            headers: new Headers()
        } as Response);

        const result = await searchService.searchEntities('test', 'urn:entity:brand');

        expect(result.entities).toEqual([]);
        expect(result.metadata.total_results).toBe(0);
        expect(result.status.success).toBe(true);
    });

    it('should handle JSON parsing errors', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => { throw new Error('Invalid JSON'); },
            headers: new Headers()
        } as Response);

        await expect(searchService.searchEntities('test', 'urn:entity:brand'))
            .rejects.toMatchObject({
                type: QlooErrorType.SERVER_ERROR,
                code: 'SEARCH_FAILED'
            });
    });
});