import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { QlooFirstPersonaGenerator } from './qloo-first-persona-generator';
import { BriefFormData } from '@/components/forms/BriefForm';
import { 
    GenerationResult, 
    QlooSignals, 
    CulturalConstraints, 
    QlooFirstError,
    PerformanceMetrics 
} from '@/types/qloo-first';
import { Persona } from '@/types';

// Mock all dependencies
vi.mock('@/services/qloo-signal-extractor');
vi.mock('@/lib/services/enriched-prompt-builder');
vi.mock('@/lib/api/gemini');
vi.mock('@/lib/api/qloo');
vi.mock('@/lib/services/qloo-cache');

// Import mocked modules
import { QlooSignalExtractor } from '@/services/qloo-signal-extractor';
import { EnrichedPromptBuilder } from '@/lib/services/enriched-prompt-builder';
import { getGeminiClient } from '@/lib/api/gemini';
import { getQlooClient } from '@/lib/api/qloo';

describe('QlooFirstPersonaGenerator', () => {
    let generator: QlooFirstPersonaGenerator;
    let mockSignalExtractor: any;
    let mockPromptBuilder: any;
    let mockGeminiClient: any;
    let mockQlooClient: any;

    const mockBriefFormData: BriefFormData = {
        brief: 'Create personas for tech-savvy millennials in Paris',
        ageRange: { min: 25, max: 35 },
        location: 'Paris, France',
        language: 'fr',
        personaCount: 3,
        interests: ['Technologie', 'Voyage'],
        values: ['Innovation', 'Authenticité']
    };

    const mockQlooSignals: QlooSignals = {
        demographics: {
            ageRange: { min: 25, max: 35 },
            location: 'Paris, France',
            occupation: 'developer'
        },
        interests: ['Technologie', 'Voyage'],
        values: ['Innovation', 'Authenticité'],
        culturalContext: {
            language: 'fr',
            personaCount: 3
        }
    };

    const mockCulturalConstraints: CulturalConstraints = {
        music: ['Daft Punk', 'Stromae', 'Christine and the Queens'],
        brands: ['Apple', 'Nike', 'Louis Vuitton'],
        restaurants: ['Starbucks', 'McDonald\'s'],
        movies: ['Amélie', 'The Matrix'],
        tv: ['Stranger Things', 'Friends'],
        books: ['Sapiens', 'The Alchemist'],
        travel: ['Tokyo', 'New York'],
        fashion: ['Zara', 'H&M'],
        beauty: ['L\'Oréal', 'Sephora'],
        food: ['Sushi', 'Pizza'],
        socialMedia: ['Instagram', 'TikTok', 'LinkedIn']
    };

    const mockPersonas: Partial<Persona>[] = [
        {
            name: 'Marie Dubois',
            age: 28,
            occupation: 'Software Developer',
            location: 'Paris',
            interests: ['Technology', 'Travel'],
            values: ['Innovation', 'Authenticity']
        },
        {
            name: 'Pierre Martin',
            age: 32,
            occupation: 'UX Designer',
            location: 'Paris',
            interests: ['Design', 'Music'],
            values: ['Creativity', 'Quality']
        }
    ];

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        // Setup mock implementations
        mockSignalExtractor = {
            extractSignals: vi.fn().mockReturnValue(mockQlooSignals),
            fetchCulturalData: vi.fn().mockResolvedValue(mockCulturalConstraints)
        };

        mockPromptBuilder = {
            buildPrompt: vi.fn().mockResolvedValue('Enriched prompt with cultural constraints...')
        };

        mockGeminiClient = {
            generatePersonas: vi.fn().mockResolvedValue(mockPersonas)
        };

        mockQlooClient = {
            enrichPersonas: vi.fn().mockResolvedValue(mockPersonas)
        };

        // Mock constructors
        (QlooSignalExtractor as any).mockImplementation(() => mockSignalExtractor);
        (EnrichedPromptBuilder as any).mockImplementation(() => mockPromptBuilder);
        (getGeminiClient as any).mockReturnValue(mockGeminiClient);
        (getQlooClient as any).mockReturnValue(mockQlooClient);

        // Create generator instance
        generator = new QlooFirstPersonaGenerator({
            enableFallback: true,
            debugMode: false,
            maxRetries: 2,
            timeoutMs: 30000
        });

        // Mock console methods to avoid noise in tests
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('generatePersonas - Complete Generation Flow', () => {
        it('should successfully generate personas using the complete Qloo-first flow', async () => {
            const result = await generator.generatePersonas(mockBriefFormData);

            // Verify the complete flow was executed
            expect(mockSignalExtractor.extractSignals).toHaveBeenCalledWith(mockBriefFormData);
            expect(mockSignalExtractor.fetchCulturalData).toHaveBeenCalledWith(mockQlooSignals);
            expect(mockPromptBuilder.buildPrompt).toHaveBeenCalledWith(
                expect.objectContaining({
                    originalBrief: mockBriefFormData.brief,
                    culturalConstraints: mockCulturalConstraints,
                    userSignals: mockQlooSignals
                })
            );
            expect(mockGeminiClient.generatePersonas).toHaveBeenCalledWith('Enriched prompt with cultural constraints...');

            // Verify result structure
            expect(result).toEqual({
                personas: expect.arrayContaining([
                    expect.objectContaining({
                        name: 'Marie Dubois',
                        age: 28,
                        culturalData: mockCulturalConstraints,
                        metadata: expect.objectContaining({
                            qlooConstraintsUsed: expect.any(Array),
                            generationMethod: 'qloo-first',
                            culturalDataSource: 'qloo'
                        })
                    })
                ]),
                metadata: {
                    source: 'qloo-first',
                    qlooDataUsed: true,
                    culturalConstraintsApplied: expect.any(Array),
                    processingTime: expect.any(Number),
                    qlooApiCallsCount: expect.any(Number),
                    cacheHitRate: expect.any(Number)
                }
            });
        });

        it('should handle different persona counts correctly', async () => {
            const briefWithDifferentCount = {
                ...mockBriefFormData,
                personaCount: 5
            };

            const signalsWithDifferentCount = {
                ...mockQlooSignals,
                culturalContext: {
                    ...mockQlooSignals.culturalContext,
                    personaCount: 5
                }
            };

            mockSignalExtractor.extractSignals.mockReturnValue(signalsWithDifferentCount);

            const result = await generator.generatePersonas(briefWithDifferentCount);

            expect(mockSignalExtractor.extractSignals).toHaveBeenCalledWith(briefWithDifferentCount);
            expect(result.metadata.source).toBe('qloo-first');
        });

        it('should track performance metrics accurately', async () => {
            const result = await generator.generatePersonas(mockBriefFormData);

            expect(result.metadata.processingTime).toBeGreaterThan(0);
            expect(result.metadata.qlooApiCallsCount).toBeGreaterThan(0);
            expect(result.metadata.cacheHitRate).toBeGreaterThanOrEqual(0);

            // Verify performance metrics are available
            const metrics = generator.getPerformanceMetrics();
            expect(metrics.totalProcessingTime).toBeGreaterThan(0);
            expect(metrics.qlooApiCallsCount).toBeGreaterThan(0);
        });

        it('should integrate cultural data into personas correctly', async () => {
            const result = await generator.generatePersonas(mockBriefFormData);

            result.personas.forEach(persona => {
                expect(persona.culturalData).toEqual(mockCulturalConstraints);
                expect(persona.metadata).toEqual({
                    qlooConstraintsUsed: expect.any(Array),
                    generationMethod: 'qloo-first',
                    culturalDataSource: 'qloo'
                });
            });
        });

        it('should handle debug mode correctly', async () => {
            const debugGenerator = new QlooFirstPersonaGenerator({
                debugMode: true
            });

            await debugGenerator.generatePersonas(mockBriefFormData);

            // Verify debug logs were called (mocked console.log should have been called)
            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('🚀 Starting Qloo-first persona generation flow')
            );
        });
    });

    describe('Fallback Mechanisms', () => {
        it('should fallback to legacy flow when Qloo API fails', async () => {
            // Mock Qloo API failure
            mockSignalExtractor.fetchCulturalData.mockRejectedValue(
                new Error(`${QlooFirstError.QLOO_API_UNAVAILABLE}: API timeout`)
            );

            const result = await generator.generatePersonas(mockBriefFormData);

            // Should have fallen back to legacy flow
            expect(result.metadata.source).toBe('fallback-legacy');
            expect(result.metadata.errorEncountered).toBe(QlooFirstError.QLOO_API_UNAVAILABLE);
            expect(mockQlooClient.enrichPersonas).toHaveBeenCalled();
        });

        it('should fallback when signal extraction fails', async () => {
            mockSignalExtractor.extractSignals.mockImplementation(() => {
                throw new Error(`${QlooFirstError.SIGNAL_EXTRACTION_FAILED}: Invalid data`);
            });

            const result = await generator.generatePersonas(mockBriefFormData);

            expect(result.metadata.source).toBe('fallback-legacy');
            expect(result.metadata.errorEncountered).toBe(QlooFirstError.SIGNAL_EXTRACTION_FAILED);
        });

        it('should fallback when cultural data is insufficient', async () => {
            mockSignalExtractor.fetchCulturalData.mockRejectedValue(
                new Error(`${QlooFirstError.CULTURAL_DATA_INSUFFICIENT}: Not enough data`)
            );

            const result = await generator.generatePersonas(mockBriefFormData);

            expect(result.metadata.source).toBe('fallback-legacy');
            expect(result.metadata.errorEncountered).toBe(QlooFirstError.CULTURAL_DATA_INSUFFICIENT);
        });

        it('should fallback when prompt building fails', async () => {
            mockPromptBuilder.buildPrompt.mockRejectedValue(
                new Error(`${QlooFirstError.PROMPT_BUILDING_FAILED}: Template error`)
            );

            const result = await generator.generatePersonas(mockBriefFormData);

            expect(result.metadata.source).toBe('fallback-legacy');
        });

        it('should fallback when Gemini generation fails', async () => {
            mockGeminiClient.generatePersonas.mockRejectedValue(
                new Error(`${QlooFirstError.GEMINI_GENERATION_FAILED}: Generation timeout`)
            );

            const result = await generator.generatePersonas(mockBriefFormData);

            expect(result.metadata.source).toBe('fallback-legacy');
        });

        it('should handle fallback disabled configuration', async () => {
            const noFallbackGenerator = new QlooFirstPersonaGenerator({
                enableFallback: false
            });

            mockSignalExtractor.fetchCulturalData.mockRejectedValue(
                new Error(`${QlooFirstError.QLOO_API_UNAVAILABLE}: API timeout`)
            );

            await expect(noFallbackGenerator.generatePersonas(mockBriefFormData))
                .rejects.toThrow(QlooFirstError.QLOO_API_UNAVAILABLE);
        });

        it('should execute legacy flow correctly in fallback', async () => {
            mockSignalExtractor.fetchCulturalData.mockRejectedValue(
                new Error(`${QlooFirstError.QLOO_API_UNAVAILABLE}: API timeout`)
            );

            const result = await generator.generatePersonas(mockBriefFormData);

            // Verify legacy flow was executed
            expect(mockGeminiClient.generatePersonas).toHaveBeenCalledWith(
                mockBriefFormData.brief,
                expect.stringContaining('pour la région Paris, France')
            );
            expect(mockQlooClient.enrichPersonas).toHaveBeenCalledWith(mockPersonas);

            expect(result.metadata.source).toBe('fallback-legacy');
            expect(result.personas.length).toBeGreaterThan(0);
        });

        it('should handle legacy flow Qloo enrichment failure gracefully', async () => {
            mockSignalExtractor.fetchCulturalData.mockRejectedValue(
                new Error(`${QlooFirstError.QLOO_API_UNAVAILABLE}: API timeout`)
            );
            mockQlooClient.enrichPersonas.mockRejectedValue(new Error('Qloo enrichment failed'));

            const result = await generator.generatePersonas(mockBriefFormData);

            // Should still return personas without Qloo enrichment
            expect(result.metadata.source).toBe('fallback-legacy');
            expect(result.personas.length).toBeGreaterThan(0);
            expect(console.warn).toHaveBeenCalledWith(
                expect.stringContaining('⚠️ Qloo enrichment failed in legacy flow')
            );
        });

        it('should return minimal result when both flows fail', async () => {
            mockSignalExtractor.fetchCulturalData.mockRejectedValue(
                new Error(`${QlooFirstError.QLOO_API_UNAVAILABLE}: API timeout`)
            );
            mockGeminiClient.generatePersonas.mockRejectedValue(new Error('Gemini failed'));

            const result = await generator.generatePersonas(mockBriefFormData);

            expect(result.metadata.source).toBe('fallback-legacy');
            expect(result.personas).toEqual([]);
            expect(result.metadata.qlooDataUsed).toBe(false);
        });
    });

    describe('Performance Optimizations and Caching', () => {
        it('should track API call counts for optimization', async () => {
            await generator.generatePersonas(mockBriefFormData);

            const metrics = generator.getPerformanceMetrics();
            expect(metrics.qlooApiCallsCount).toBeGreaterThan(0);
            expect(metrics.qlooExtractionTime).toBeGreaterThan(0);
            expect(metrics.promptBuildingTime).toBeGreaterThan(0);
            expect(metrics.geminiGenerationTime).toBeGreaterThan(0);
        });

        it('should optimize for multiple persona generation', async () => {
            const briefWithMultiplePersonas = {
                ...mockBriefFormData,
                personaCount: 5
            };

            const result = await generator.generatePersonas(briefWithMultiplePersonas);

            // Should not make redundant API calls for the same signals
            expect(mockSignalExtractor.fetchCulturalData).toHaveBeenCalledTimes(1);
            expect(result.metadata.qlooApiCallsCount).toBeGreaterThan(0);
        });

        it('should handle batch processing efficiently', async () => {
            const startTime = Date.now();
            await generator.generatePersonas(mockBriefFormData);
            const processingTime = Date.now() - startTime;

            // Should complete within reasonable time
            expect(processingTime).toBeLessThan(5000); // 5 seconds max for tests

            const metrics = generator.getPerformanceMetrics();
            expect(metrics.totalProcessingTime).toBeLessThan(5000);
        });

        it('should provide cache hit rate metrics', async () => {
            await generator.generatePersonas(mockBriefFormData);

            const metrics = generator.getPerformanceMetrics();
            expect(metrics.cacheHitRate).toBeGreaterThanOrEqual(0);
            expect(metrics.cacheHitRate).toBeLessThanOrEqual(1);
        });

        it('should handle parallel requests efficiently', async () => {
            const promises = [
                generator.generatePersonas(mockBriefFormData),
                generator.generatePersonas({
                    ...mockBriefFormData,
                    location: 'London, UK'
                }),
                generator.generatePersonas({
                    ...mockBriefFormData,
                    ageRange: { min: 30, max: 40 }
                })
            ];

            const results = await Promise.all(promises);

            results.forEach(result => {
                expect(result.metadata.source).toBe('qloo-first');
                expect(result.personas.length).toBeGreaterThan(0);
            });
        });

        it('should leverage caching for identical signal patterns', async () => {
            // First call should miss cache
            const result1 = await generator.generatePersonas(mockBriefFormData);
            expect(result1.metadata.source).toBe('qloo-first');

            // Second call with identical data should potentially hit cache
            const result2 = await generator.generatePersonas(mockBriefFormData);
            expect(result2.metadata.source).toBe('qloo-first');

            // Both calls should have been made to signal extractor
            expect(mockSignalExtractor.fetchCulturalData).toHaveBeenCalledTimes(2);
        });

        it('should optimize API calls for similar demographics', async () => {
            const similarBrief1 = {
                ...mockBriefFormData,
                brief: 'Different brief but same demographics'
            };

            const similarBrief2 = {
                ...mockBriefFormData,
                brief: 'Another different brief but same demographics'
            };

            await generator.generatePersonas(similarBrief1);
            await generator.generatePersonas(similarBrief2);

            // Should have made separate calls since briefs are different
            expect(mockSignalExtractor.fetchCulturalData).toHaveBeenCalledTimes(2);
        });

        it('should handle cache misses gracefully', async () => {
            // Mock cache miss scenario
            mockSignalExtractor.fetchCulturalData.mockResolvedValueOnce(mockCulturalConstraints);

            const result = await generator.generatePersonas(mockBriefFormData);

            expect(result.metadata.source).toBe('qloo-first');
            expect(result.metadata.qlooDataUsed).toBe(true);
        });

        it('should track performance metrics across multiple generations', async () => {
            const briefs = [
                mockBriefFormData,
                { ...mockBriefFormData, location: 'London, UK' },
                { ...mockBriefFormData, ageRange: { min: 30, max: 40 } }
            ];

            for (const brief of briefs) {
                await generator.generatePersonas(brief);
                const metrics = generator.getPerformanceMetrics();
                
                expect(metrics.totalProcessingTime).toBeGreaterThan(0);
                expect(metrics.qlooExtractionTime).toBeGreaterThan(0);
                expect(metrics.promptBuildingTime).toBeGreaterThan(0);
                expect(metrics.geminiGenerationTime).toBeGreaterThan(0);
            }
        });

        it('should optimize for different persona counts without redundant calls', async () => {
            const brief1 = { ...mockBriefFormData, personaCount: 1 };
            const brief2 = { ...mockBriefFormData, personaCount: 3 };
            const brief3 = { ...mockBriefFormData, personaCount: 5 };

            await generator.generatePersonas(brief1);
            await generator.generatePersonas(brief2);
            await generator.generatePersonas(brief3);

            // Should have made 3 separate calls since persona counts differ
            expect(mockSignalExtractor.fetchCulturalData).toHaveBeenCalledTimes(3);
        });

        it('should handle memory-efficient processing for large datasets', async () => {
            const largeCulturalConstraints: CulturalConstraints = {
                music: Array(100).fill('Artist').map((_, i) => `Artist ${i}`),
                brands: Array(100).fill('Brand').map((_, i) => `Brand ${i}`),
                restaurants: Array(100).fill('Restaurant').map((_, i) => `Restaurant ${i}`),
                movies: Array(100).fill('Movie').map((_, i) => `Movie ${i}`),
                tv: Array(100).fill('Show').map((_, i) => `Show ${i}`),
                books: Array(100).fill('Book').map((_, i) => `Book ${i}`),
                travel: Array(100).fill('Place').map((_, i) => `Place ${i}`),
                fashion: Array(100).fill('Fashion').map((_, i) => `Fashion ${i}`),
                beauty: Array(100).fill('Beauty').map((_, i) => `Beauty ${i}`),
                food: Array(100).fill('Food').map((_, i) => `Food ${i}`),
                socialMedia: Array(100).fill('Platform').map((_, i) => `Platform ${i}`)
            };

            mockSignalExtractor.fetchCulturalData.mockResolvedValue(largeCulturalConstraints);

            const result = await generator.generatePersonas(mockBriefFormData);

            expect(result.metadata.source).toBe('qloo-first');
            expect(result.metadata.culturalConstraintsApplied.length).toBeGreaterThan(0);
            
            // Should handle large datasets without memory issues
            const metrics = generator.getPerformanceMetrics();
            expect(metrics.totalProcessingTime).toBeLessThan(10000); // 10 seconds max
        });
    });

    describe('Configuration Management', () => {
        it('should use default configuration correctly', () => {
            const defaultGenerator = new QlooFirstPersonaGenerator();
            const config = defaultGenerator.getConfig();

            expect(config.enableFallback).toBe(true);
            expect(config.debugMode).toBe(false);
            expect(config.maxRetries).toBe(2);
            expect(config.timeoutMs).toBe(30000);
        });

        it('should allow configuration updates', () => {
            generator.updateConfig({
                debugMode: true,
                maxRetries: 5
            });

            const config = generator.getConfig();
            expect(config.debugMode).toBe(true);
            expect(config.maxRetries).toBe(5);
            expect(config.enableFallback).toBe(true); // Should remain unchanged
        });

        it('should create generator with custom configuration', () => {
            const customGenerator = new QlooFirstPersonaGenerator({
                enableFallback: false,
                debugMode: true,
                maxRetries: 1,
                timeoutMs: 10000
            });

            const config = customGenerator.getConfig();
            expect(config.enableFallback).toBe(false);
            expect(config.debugMode).toBe(true);
            expect(config.maxRetries).toBe(1);
            expect(config.timeoutMs).toBe(10000);
        });
    });

    describe('Error Handling and Categorization', () => {
        it('should categorize different error types correctly', async () => {
            const errorTests = [
                {
                    error: new Error(`${QlooFirstError.QLOO_API_UNAVAILABLE}: API down`),
                    expectedCategory: QlooFirstError.QLOO_API_UNAVAILABLE
                },
                {
                    error: new Error(`${QlooFirstError.SIGNAL_EXTRACTION_FAILED}: Invalid input`),
                    expectedCategory: QlooFirstError.SIGNAL_EXTRACTION_FAILED
                },
                {
                    error: new Error(`${QlooFirstError.CULTURAL_DATA_INSUFFICIENT}: No data`),
                    expectedCategory: QlooFirstError.CULTURAL_DATA_INSUFFICIENT
                },
                {
                    error: new Error(`${QlooFirstError.PROMPT_BUILDING_FAILED}: Template error`),
                    expectedCategory: QlooFirstError.PROMPT_BUILDING_FAILED
                },
                {
                    error: new Error(`${QlooFirstError.GEMINI_GENERATION_FAILED}: Generation error`),
                    expectedCategory: QlooFirstError.GEMINI_GENERATION_FAILED
                }
            ];

            for (const { error, expectedCategory } of errorTests) {
                mockSignalExtractor.fetchCulturalData.mockRejectedValueOnce(error);
                
                const result = await generator.generatePersonas(mockBriefFormData);
                
                expect(result.metadata.errorEncountered).toBe(expectedCategory);
                expect(result.metadata.source).toBe('fallback-legacy');
            }
        });

        it('should handle unknown errors gracefully', async () => {
            mockSignalExtractor.fetchCulturalData.mockRejectedValue(
                new Error('Unknown error type')
            );

            const result = await generator.generatePersonas(mockBriefFormData);

            expect(result.metadata.source).toBe('fallback-legacy');
            expect(result.metadata.errorEncountered).toBeUndefined();
        });

        it('should handle non-Error objects gracefully', async () => {
            mockSignalExtractor.fetchCulturalData.mockRejectedValue('String error');

            const result = await generator.generatePersonas(mockBriefFormData);

            expect(result.metadata.source).toBe('fallback-legacy');
        });
    });

    describe('Integration with Dependencies', () => {
        it('should properly coordinate with QlooSignalExtractor', async () => {
            await generator.generatePersonas(mockBriefFormData);

            expect(mockSignalExtractor.extractSignals).toHaveBeenCalledWith(mockBriefFormData);
            expect(mockSignalExtractor.fetchCulturalData).toHaveBeenCalledWith(mockQlooSignals);
        });

        it('should properly coordinate with EnrichedPromptBuilder', async () => {
            await generator.generatePersonas(mockBriefFormData);

            expect(mockPromptBuilder.buildPrompt).toHaveBeenCalledWith({
                originalBrief: mockBriefFormData.brief,
                culturalConstraints: mockCulturalConstraints,
                userSignals: mockQlooSignals,
                templateVariables: {
                    location: mockQlooSignals.demographics.location,
                    ageRange: mockQlooSignals.demographics.ageRange,
                    interests: mockQlooSignals.interests,
                    values: mockQlooSignals.values,
                    language: mockQlooSignals.culturalContext.language,
                    personaCount: mockQlooSignals.culturalContext.personaCount
                }
            });
        });

        it('should properly coordinate with Gemini client', async () => {
            await generator.generatePersonas(mockBriefFormData);

            expect(mockGeminiClient.generatePersonas).toHaveBeenCalledWith(
                'Enriched prompt with cultural constraints...'
            );
        });

        it('should handle dependency injection correctly', () => {
            // Verify that dependencies are properly injected
            expect(QlooSignalExtractor).toHaveBeenCalled();
            expect(EnrichedPromptBuilder).toHaveBeenCalled();
            expect(getGeminiClient).toHaveBeenCalled();
        });
    });

    describe('Metadata and Source Tracking', () => {
        it('should track generation source correctly for successful flow', async () => {
            const result = await generator.generatePersonas(mockBriefFormData);

            expect(result.metadata.source).toBe('qloo-first');
            expect(result.metadata.qlooDataUsed).toBe(true);
            expect(result.metadata.culturalConstraintsApplied).toEqual([
                'music: 3 items',
                'brands: 3 items',
                'restaurants: 2 items',
                'movies: 2 items',
                'tv: 2 items',
                'books: 2 items',
                'travel: 2 items',
                'fashion: 2 items',
                'beauty: 2 items',
                'food: 2 items',
                'socialMedia: 3 items'
            ]);
        });

        it('should track generation source correctly for fallback flow', async () => {
            mockSignalExtractor.fetchCulturalData.mockRejectedValue(
                new Error(`${QlooFirstError.QLOO_API_UNAVAILABLE}: API timeout`)
            );

            const result = await generator.generatePersonas(mockBriefFormData);

            expect(result.metadata.source).toBe('fallback-legacy');
            expect(result.metadata.qlooDataUsed).toBe(true); // Legacy flow uses Qloo for enrichment
            expect(result.metadata.culturalConstraintsApplied).toEqual(['legacy-enrichment']);
        });

        it('should include performance metrics in metadata', async () => {
            const result = await generator.generatePersonas(mockBriefFormData);

            expect(result.metadata.processingTime).toBeGreaterThan(0);
            expect(result.metadata.qlooApiCallsCount).toBeGreaterThan(0);
            expect(result.metadata.cacheHitRate).toBeGreaterThanOrEqual(0);
        });

        it('should track persona-level metadata correctly', async () => {
            const result = await generator.generatePersonas(mockBriefFormData);

            result.personas.forEach(persona => {
                expect(persona.metadata).toEqual({
                    qlooConstraintsUsed: expect.any(Array),
                    generationMethod: 'qloo-first',
                    culturalDataSource: 'qloo'
                });
            });
        });
    });

    describe('Edge Cases and Boundary Conditions', () => {
        it('should handle empty cultural constraints', async () => {
            const emptyConstraints: CulturalConstraints = {
                music: [], brands: [], restaurants: [], movies: [], tv: [],
                books: [], travel: [], fashion: [], beauty: [], food: [], socialMedia: []
            };

            mockSignalExtractor.fetchCulturalData.mockResolvedValue(emptyConstraints);

            const result = await generator.generatePersonas(mockBriefFormData);

            expect(result.metadata.source).toBe('qloo-first');
            expect(result.metadata.culturalConstraintsApplied).toEqual([]);
        });

        it('should handle single persona generation', async () => {
            const singlePersonaBrief = {
                ...mockBriefFormData,
                personaCount: 1
            };

            const result = await generator.generatePersonas(singlePersonaBrief);

            expect(result.metadata.source).toBe('qloo-first');
            expect(result.personas.length).toBeGreaterThan(0);
        });

        it('should handle maximum persona count', async () => {
            const maxPersonaBrief = {
                ...mockBriefFormData,
                personaCount: 5
            };

            const result = await generator.generatePersonas(maxPersonaBrief);

            expect(result.metadata.source).toBe('qloo-first');
            expect(result.personas.length).toBeGreaterThan(0);
        });

        it('should handle different languages correctly', async () => {
            const englishBrief = {
                ...mockBriefFormData,
                language: 'en' as const
            };

            const englishSignals = {
                ...mockQlooSignals,
                culturalContext: {
                    ...mockQlooSignals.culturalContext,
                    language: 'en' as const
                }
            };

            mockSignalExtractor.extractSignals.mockReturnValue(englishSignals);

            const result = await generator.generatePersonas(englishBrief);

            expect(result.metadata.source).toBe('qloo-first');
            expect(mockPromptBuilder.buildPrompt).toHaveBeenCalledWith(
                expect.objectContaining({
                    userSignals: expect.objectContaining({
                        culturalContext: expect.objectContaining({
                            language: 'en'
                        })
                    })
                })
            );
        });

        it('should handle very long briefs', async () => {
            const longBrief = {
                ...mockBriefFormData,
                brief: 'A'.repeat(5000) // Very long brief
            };

            const result = await generator.generatePersonas(longBrief);

            expect(result.metadata.source).toBe('qloo-first');
            expect(result.personas.length).toBeGreaterThan(0);
        });

        it('should handle empty interests and values', async () => {
            const emptyInterestsBrief = {
                ...mockBriefFormData,
                interests: [],
                values: []
            };

            const emptyInterestsSignals = {
                ...mockQlooSignals,
                interests: [],
                values: []
            };

            mockSignalExtractor.extractSignals.mockReturnValue(emptyInterestsSignals);

            const result = await generator.generatePersonas(emptyInterestsBrief);

            expect(result.metadata.source).toBe('qloo-first');
            expect(result.personas.length).toBeGreaterThan(0);
        });
    });

    describe('Advanced Performance Optimization Tests', () => {
        it('should implement intelligent caching based on signal similarity', async () => {
            const brief1 = {
                ...mockBriefFormData,
                brief: 'Tech professionals in Paris'
            };

            const brief2 = {
                ...mockBriefFormData,
                brief: 'Software developers in Paris',
                interests: ['Technologie', 'Voyage'] // Same interests
            };

            // First call should extract signals and fetch cultural data
            await generator.generatePersonas(brief1);
            
            // Second call with similar signals should potentially use cached data
            await generator.generatePersonas(brief2);

            // Both calls should have been made since briefs are different
            expect(mockSignalExtractor.extractSignals).toHaveBeenCalledTimes(2);
            expect(mockSignalExtractor.fetchCulturalData).toHaveBeenCalledTimes(2);
        });

        it('should optimize batch processing for multiple persona counts', async () => {
            const batchRequests = [
                { ...mockBriefFormData, personaCount: 1 },
                { ...mockBriefFormData, personaCount: 3 },
                { ...mockBriefFormData, personaCount: 5 }
            ];

            const startTime = Date.now();
            const results = await Promise.all(
                batchRequests.map(brief => generator.generatePersonas(brief))
            );
            const totalTime = Date.now() - startTime;

            // Should complete all requests efficiently
            expect(totalTime).toBeLessThan(10000); // 10 seconds max for batch

            results.forEach(result => {
                expect(result.metadata.source).toBe('qloo-first');
                expect(result.metadata.processingTime).toBeGreaterThan(0);
            });

            // Should have made separate calls for different persona counts
            expect(mockSignalExtractor.fetchCulturalData).toHaveBeenCalledTimes(3);
        });

        it('should handle concurrent requests without race conditions', async () => {
            const concurrentRequests = Array(5).fill(null).map((_, index) => ({
                ...mockBriefFormData,
                brief: `Request ${index} for tech professionals`,
                location: `City ${index}, Country`
            }));

            const promises = concurrentRequests.map(brief => 
                generator.generatePersonas(brief)
            );

            const results = await Promise.all(promises);

            // All requests should succeed
            results.forEach((result, index) => {
                expect(result.metadata.source).toBe('qloo-first');
                expect(result.personas.length).toBeGreaterThan(0);
                expect(result.metadata.processingTime).toBeGreaterThan(0);
            });

            // Should have made separate calls for each unique request
            expect(mockSignalExtractor.extractSignals).toHaveBeenCalledTimes(5);
            expect(mockSignalExtractor.fetchCulturalData).toHaveBeenCalledTimes(5);
        });

        it('should implement memory-efficient processing for large cultural datasets', async () => {
            const largeCulturalData: CulturalConstraints = {
                music: Array(200).fill('Artist').map((_, i) => `Artist ${i}`),
                brands: Array(200).fill('Brand').map((_, i) => `Brand ${i}`),
                restaurants: Array(200).fill('Restaurant').map((_, i) => `Restaurant ${i}`),
                movies: Array(200).fill('Movie').map((_, i) => `Movie ${i}`),
                tv: Array(200).fill('Show').map((_, i) => `Show ${i}`),
                books: Array(200).fill('Book').map((_, i) => `Book ${i}`),
                travel: Array(200).fill('Place').map((_, i) => `Place ${i}`),
                fashion: Array(200).fill('Fashion').map((_, i) => `Fashion ${i}`),
                beauty: Array(200).fill('Beauty').map((_, i) => `Beauty ${i}`),
                food: Array(200).fill('Food').map((_, i) => `Food ${i}`),
                socialMedia: Array(200).fill('Platform').map((_, i) => `Platform ${i}`)
            };

            mockSignalExtractor.fetchCulturalData.mockResolvedValue(largeCulturalData);

            const startTime = Date.now();
            const result = await generator.generatePersonas(mockBriefFormData);
            const processingTime = Date.now() - startTime;

            // Should handle large datasets efficiently
            expect(processingTime).toBeLessThan(15000); // 15 seconds max
            expect(result.metadata.source).toBe('qloo-first');
            expect(result.metadata.culturalConstraintsApplied.length).toBeGreaterThan(0);

            // Memory usage should be reasonable (this is a proxy test)
            const metrics = generator.getPerformanceMetrics();
            expect(metrics.totalProcessingTime).toBeLessThan(15000);
        });

        it('should provide detailed cache performance metrics', async () => {
            // Generate multiple requests to test caching
            const requests = [
                mockBriefFormData,
                { ...mockBriefFormData, personaCount: 2 },
                { ...mockBriefFormData, location: 'London, UK' }
            ];

            for (const request of requests) {
                await generator.generatePersonas(request);
            }

            const metrics = generator.getPerformanceMetrics();
            
            expect(metrics.cacheHitRate).toBeGreaterThanOrEqual(0);
            expect(metrics.cacheHitRate).toBeLessThanOrEqual(1);
            expect(metrics.totalProcessingTime).toBeGreaterThan(0);
            expect(metrics.qlooApiCallsCount).toBeGreaterThan(0);
        });

        it('should implement timeout handling for performance optimization', async () => {
            const timeoutGenerator = new QlooFirstPersonaGenerator({
                timeoutMs: 1000 // 1 second timeout
            });

            // Mock a slow response
            mockSignalExtractor.fetchCulturalData.mockImplementation(
                () => new Promise(resolve => setTimeout(() => resolve(mockCulturalConstraints), 2000))
            );

            const startTime = Date.now();
            const result = await timeoutGenerator.generatePersonas(mockBriefFormData);
            const processingTime = Date.now() - startTime;

            // Should timeout and fallback
            expect(result.metadata.source).toBe('fallback-legacy');
            expect(processingTime).toBeLessThan(5000); // Should not wait full 2 seconds
        });
    });

    describe('Enhanced Fallback Mechanism Tests', () => {
        it('should implement retry logic for transient failures', async () => {
            let callCount = 0;
            mockSignalExtractor.fetchCulturalData.mockImplementation(() => {
                callCount++;
                if (callCount < 2) {
                    throw new Error(`${QlooFirstError.QLOO_API_UNAVAILABLE}: Transient failure`);
                }
                return Promise.resolve(mockCulturalConstraints);
            });

            const result = await generator.generatePersonas(mockBriefFormData);

            // Should have retried and succeeded
            expect(result.metadata.source).toBe('qloo-first');
            expect(mockSignalExtractor.fetchCulturalData).toHaveBeenCalledTimes(2);
        });

        it('should fallback after max retries exceeded', async () => {
            mockSignalExtractor.fetchCulturalData.mockRejectedValue(
                new Error(`${QlooFirstError.QLOO_API_UNAVAILABLE}: Persistent failure`)
            );

            const result = await generator.generatePersonas(mockBriefFormData);

            // Should have tried max retries then fallen back
            expect(result.metadata.source).toBe('fallback-legacy');
            expect(mockSignalExtractor.fetchCulturalData).toHaveBeenCalledTimes(3); // Initial + 2 retries
        });

        it('should handle partial cultural data gracefully', async () => {
            const partialCulturalData: Partial<CulturalConstraints> = {
                music: ['Artist 1', 'Artist 2'],
                brands: ['Brand 1'],
                // Missing other categories
            };

            mockSignalExtractor.fetchCulturalData.mockResolvedValue(partialCulturalData as CulturalConstraints);

            const result = await generator.generatePersonas(mockBriefFormData);

            expect(result.metadata.source).toBe('qloo-first');
            expect(result.metadata.qlooDataUsed).toBe(true);
            expect(result.metadata.culturalConstraintsApplied.length).toBeGreaterThan(0);
        });

        it('should handle empty cultural data by falling back', async () => {
            const emptyCulturalData: CulturalConstraints = {
                music: [],
                brands: [],
                restaurants: [],
                movies: [],
                tv: [],
                books: [],
                travel: [],
                fashion: [],
                beauty: [],
                food: [],
                socialMedia: []
            };

            mockSignalExtractor.fetchCulturalData.mockResolvedValue(emptyCulturalData);

            const result = await generator.generatePersonas(mockBriefFormData);

            // Should fallback due to insufficient cultural data
            expect(result.metadata.source).toBe('fallback-legacy');
            expect(result.metadata.errorEncountered).toBe(QlooFirstError.CULTURAL_DATA_INSUFFICIENT);
        });

        it('should handle cascading failures gracefully', async () => {
            // First failure in signal extraction
            mockSignalExtractor.extractSignals.mockImplementation(() => {
                throw new Error(`${QlooFirstError.SIGNAL_EXTRACTION_FAILED}: Invalid data`);
            });

            // Second failure in legacy flow
            mockGeminiClient.generatePersonas.mockRejectedValue(
                new Error('Gemini also failed')
            );

            const result = await generator.generatePersonas(mockBriefFormData);

            expect(result.metadata.source).toBe('fallback-legacy');
            expect(result.personas).toEqual([]);
            expect(result.metadata.qlooDataUsed).toBe(false);
        });

        it('should preserve original error context in fallback metadata', async () => {
            const originalError = new Error(`${QlooFirstError.SIGNAL_EXTRACTION_FAILED}: Invalid age range`);
            mockSignalExtractor.extractSignals.mockImplementation(() => {
                throw originalError;
            });

            const result = await generator.generatePersonas(mockBriefFormData);

            expect(result.metadata.source).toBe('fallback-legacy');
            expect(result.metadata.errorEncountered).toBe(QlooFirstError.SIGNAL_EXTRACTION_FAILED);
        });
    });

    describe('Integration Flow Validation Tests', () => {
        it('should validate complete data flow from BriefForm to final personas', async () => {
            const result = await generator.generatePersonas(mockBriefFormData);

            // Validate data transformation at each step
            expect(mockSignalExtractor.extractSignals).toHaveBeenCalledWith(
                expect.objectContaining({
                    brief: mockBriefFormData.brief,
                    ageRange: mockBriefFormData.ageRange,
                    location: mockBriefFormData.location,
                    interests: mockBriefFormData.interests,
                    values: mockBriefFormData.values
                })
            );

            expect(mockSignalExtractor.fetchCulturalData).toHaveBeenCalledWith(
                expect.objectContaining({
                    demographics: expect.any(Object),
                    interests: expect.any(Array),
                    values: expect.any(Array),
                    culturalContext: expect.any(Object)
                })
            );

            expect(mockPromptBuilder.buildPrompt).toHaveBeenCalledWith(
                expect.objectContaining({
                    originalBrief: mockBriefFormData.brief,
                    culturalConstraints: mockCulturalConstraints,
                    userSignals: expect.any(Object)
                })
            );

            // Validate final result structure
            expect(result.personas).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        name: expect.any(String),
                        age: expect.any(Number),
                        culturalData: mockCulturalConstraints,
                        metadata: expect.objectContaining({
                            generationMethod: 'qloo-first',
                            culturalDataSource: 'qloo'
                        })
                    })
                ])
            );
        });

        it('should maintain data consistency across language variations', async () => {
            const frenchBrief = {
                ...mockBriefFormData,
                language: 'fr' as const,
                brief: 'Créer des personas pour des professionnels tech à Paris'
            };

            const englishBrief = {
                ...mockBriefFormData,
                language: 'en' as const,
                brief: 'Create personas for tech professionals in Paris'
            };

            const frenchResult = await generator.generatePersonas(frenchBrief);
            const englishResult = await generator.generatePersonas(englishBrief);

            // Both should succeed with qloo-first flow
            expect(frenchResult.metadata.source).toBe('qloo-first');
            expect(englishResult.metadata.source).toBe('qloo-first');

            // Should have called prompt builder with correct language context
            expect(mockPromptBuilder.buildPrompt).toHaveBeenCalledWith(
                expect.objectContaining({
                    userSignals: expect.objectContaining({
                        culturalContext: expect.objectContaining({
                            language: 'fr'
                        })
                    })
                })
            );

            expect(mockPromptBuilder.buildPrompt).toHaveBeenCalledWith(
                expect.objectContaining({
                    userSignals: expect.objectContaining({
                        culturalContext: expect.objectContaining({
                            language: 'en'
                        })
                    })
                })
            );
        });

        it('should handle edge cases in persona count requirements', async () => {
            const edgeCases = [
                { ...mockBriefFormData, personaCount: 1 },
                { ...mockBriefFormData, personaCount: 10 },
                { ...mockBriefFormData, personaCount: 0 } // Edge case
            ];

            for (const briefData of edgeCases) {
                const result = await generator.generatePersonas(briefData);
                
                expect(result.metadata.source).toBe('qloo-first');
                expect(mockSignalExtractor.extractSignals).toHaveBeenCalledWith(
                    expect.objectContaining({
                        personaCount: briefData.personaCount
                    })
                );
            }
        });

        it('should validate cultural constraint application in generated personas', async () => {
            const result = await generator.generatePersonas(mockBriefFormData);

            // Verify cultural constraints were applied
            expect(result.metadata.culturalConstraintsApplied).toEqual(
                expect.arrayContaining([
                    expect.stringMatching(/music: \d+ items/),
                    expect.stringMatching(/brands: \d+ items/),
                    expect.stringMatching(/restaurants: \d+ items/)
                ])
            );

            // Verify personas contain cultural data
            result.personas.forEach(persona => {
                expect(persona.culturalData).toEqual(mockCulturalConstraints);
                expect(persona.metadata?.qlooConstraintsUsed).toEqual(expect.any(Array));
            });
        });

        it('should ensure thread safety in concurrent generation requests', async () => {
            const concurrentBriefs = Array(10).fill(null).map((_, index) => ({
                ...mockBriefFormData,
                brief: `Concurrent request ${index}`,
                personaCount: index + 1
            }));

            const startTime = Date.now();
            const results = await Promise.all(
                concurrentBriefs.map(brief => generator.generatePersonas(brief))
            );
            const totalTime = Date.now() - startTime;

            // All requests should complete successfully
            results.forEach((result, index) => {
                expect(result.metadata.source).toBe('qloo-first');
                expect(result.personas.length).toBeGreaterThan(0);
                expect(result.metadata.processingTime).toBeGreaterThan(0);
            });

            // Should complete within reasonable time
            expect(totalTime).toBeLessThan(20000); // 20 seconds max for 10 concurrent requests

            // Should have made separate calls for each request
            expect(mockSignalExtractor.extractSignals).toHaveBeenCalledTimes(10);
        });
    });

    describe('Complete Integration Flow Tests', () => {
        it('should execute complete generation flow with all components integrated', async () => {
            const result = await generator.generatePersonas(mockBriefFormData);

            // Verify complete flow execution order
            expect(mockSignalExtractor.extractSignals).toHaveBeenCalledWith(mockBriefFormData);
            expect(mockSignalExtractor.fetchCulturalData).toHaveBeenCalledWith(mockQlooSignals);
            expect(mockPromptBuilder.buildPrompt).toHaveBeenCalledWith(
                expect.objectContaining({
                    originalBrief: mockBriefFormData.brief,
                    culturalConstraints: mockCulturalConstraints,
                    userSignals: mockQlooSignals
                })
            );
            expect(mockGeminiClient.generatePersonas).toHaveBeenCalledWith('Enriched prompt with cultural constraints...');

            // Verify result structure matches requirements
            expect(result).toMatchObject({
                personas: expect.arrayContaining([
                    expect.objectContaining({
                        name: expect.any(String),
                        age: expect.any(Number),
                        culturalData: mockCulturalConstraints,
                        metadata: expect.objectContaining({
                            qlooConstraintsUsed: expect.any(Array),
                            generationMethod: 'qloo-first',
                            culturalDataSource: 'qloo'
                        })
                    })
                ]),
                metadata: expect.objectContaining({
                    source: 'qloo-first',
                    qlooDataUsed: true,
                    culturalConstraintsApplied: expect.any(Array),
                    processingTime: expect.any(Number),
                    qlooApiCallsCount: expect.any(Number),
                    cacheHitRate: expect.any(Number)
                })
            });
        });

        it('should handle fallback integration when Qloo API fails completely', async () => {
            mockSignalExtractor.fetchCulturalData.mockRejectedValue(
                new Error(`${QlooFirstError.QLOO_API_UNAVAILABLE}: Complete API failure`)
            );

            const result = await generator.generatePersonas(mockBriefFormData);

            // Verify fallback flow execution
            expect(mockGeminiClient.generatePersonas).toHaveBeenCalledWith(
                mockBriefFormData.brief,
                expect.stringContaining('pour la région Paris, France')
            );
            expect(mockQlooClient.enrichPersonas).toHaveBeenCalledWith(mockPersonas);

            // Verify fallback result structure
            expect(result.metadata.source).toBe('fallback-legacy');
            expect(result.metadata.errorEncountered).toBe(QlooFirstError.QLOO_API_UNAVAILABLE);
            expect(result.personas.length).toBeGreaterThan(0);
        });

        it('should integrate performance optimizations across all components', async () => {
            const startTime = Date.now();
            
            // Test with multiple persona counts to verify optimization
            const results = await Promise.all([
                generator.generatePersonas({ ...mockBriefFormData, personaCount: 1 }),
                generator.generatePersonas({ ...mockBriefFormData, personaCount: 3 }),
                generator.generatePersonas({ ...mockBriefFormData, personaCount: 5 })
            ]);

            const totalTime = Date.now() - startTime;

            // Verify all results are successful
            results.forEach(result => {
                expect(result.metadata.source).toBe('qloo-first');
                expect(result.metadata.processingTime).toBeGreaterThan(0);
                expect(result.metadata.qlooApiCallsCount).toBeGreaterThan(0);
            });

            // Verify performance optimization
            expect(totalTime).toBeLessThan(15000); // Should complete within 15 seconds
            
            // Verify caching metrics are tracked
            const metrics = generator.getPerformanceMetrics();
            expect(metrics.totalProcessingTime).toBeGreaterThan(0);
            expect(metrics.cacheHitRate).toBeGreaterThanOrEqual(0);
        });

        it('should handle integration with different cultural contexts', async () => {
            const culturalTests = [
                {
                    brief: { ...mockBriefFormData, language: 'fr', location: 'Paris, France' },
                    expectedLanguage: 'fr'
                },
                {
                    brief: { ...mockBriefFormData, language: 'en', location: 'London, UK' },
                    expectedLanguage: 'en'
                }
            ];

            for (const { brief, expectedLanguage } of culturalTests) {
                const signals = {
                    ...mockQlooSignals,
                    demographics: { ...mockQlooSignals.demographics, location: brief.location },
                    culturalContext: { ...mockQlooSignals.culturalContext, language: expectedLanguage }
                };

                mockSignalExtractor.extractSignals.mockReturnValueOnce(signals);

                const result = await generator.generatePersonas(brief);

                expect(mockPromptBuilder.buildPrompt).toHaveBeenCalledWith(
                    expect.objectContaining({
                        userSignals: expect.objectContaining({
                            culturalContext: expect.objectContaining({
                                language: expectedLanguage
                            })
                        })
                    })
                );
                expect(result.metadata.source).toBe('qloo-first');
            }
        });

        it('should maintain data integrity throughout the complete integration flow', async () => {
            const result = await generator.generatePersonas(mockBriefFormData);

            // Verify data flows correctly through all components
            const extractSignalsCall = mockSignalExtractor.extractSignals.mock.calls[0][0];
            const fetchCulturalDataCall = mockSignalExtractor.fetchCulturalData.mock.calls[0][0];
            const buildPromptCall = mockPromptBuilder.buildPrompt.mock.calls[0][0];

            expect(extractSignalsCall).toEqual(mockBriefFormData);
            expect(fetchCulturalDataCall).toEqual(mockQlooSignals);
            expect(buildPromptCall.originalBrief).toBe(mockBriefFormData.brief);
            expect(buildPromptCall.culturalConstraints).toEqual(mockCulturalConstraints);
            expect(buildPromptCall.userSignals).toEqual(mockQlooSignals);

            // Verify result data integrity
            result.personas.forEach(persona => {
                expect(persona.culturalData).toEqual(mockCulturalConstraints);
                expect(persona.metadata.generationMethod).toBe('qloo-first');
                expect(persona.metadata.culturalDataSource).toBe('qloo');
            });
        });

        it('should handle integration errors gracefully with proper fallback chain', async () => {
            const errorScenarios = [
                {
                    mockFailure: () => mockSignalExtractor.extractSignals.mockImplementationOnce(() => {
                        throw new Error(`${QlooFirstError.SIGNAL_EXTRACTION_FAILED}: Invalid data`);
                    }),
                    expectedError: QlooFirstError.SIGNAL_EXTRACTION_FAILED
                },
                {
                    mockFailure: () => mockSignalExtractor.fetchCulturalData.mockRejectedValueOnce(
                        new Error(`${QlooFirstError.CULTURAL_DATA_INSUFFICIENT}: Not enough data`)
                    ),
                    expectedError: QlooFirstError.CULTURAL_DATA_INSUFFICIENT
                },
                {
                    mockFailure: () => mockPromptBuilder.buildPrompt.mockRejectedValueOnce(
                        new Error(`${QlooFirstError.PROMPT_BUILDING_FAILED}: Template error`)
                    ),
                    expectedError: QlooFirstError.PROMPT_BUILDING_FAILED
                }
            ];

            for (const { mockFailure, expectedError } of errorScenarios) {
                mockFailure();

                const result = await generator.generatePersonas(mockBriefFormData);

                expect(result.metadata.source).toBe('fallback-legacy');
                expect(result.metadata.errorEncountered).toBe(expectedError);
                expect(result.personas.length).toBeGreaterThan(0);

                // Reset mocks for next iteration
                vi.clearAllMocks();
                beforeEach(); // Re-setup mocks
            }
        });

        it('should integrate caching mechanisms effectively across components', async () => {
            // First call should populate cache
            const result1 = await generator.generatePersonas(mockBriefFormData);
            expect(result1.metadata.source).toBe('qloo-first');

            // Second call with identical data
            const result2 = await generator.generatePersonas(mockBriefFormData);
            expect(result2.metadata.source).toBe('qloo-first');

            // Third call with slightly different data
            const modifiedBrief = { ...mockBriefFormData, personaCount: 5 };
            const result3 = await generator.generatePersonas(modifiedBrief);
            expect(result3.metadata.source).toBe('qloo-first');

            // Verify cache metrics are properly tracked
            const metrics = generator.getPerformanceMetrics();
            expect(metrics.cacheHitRate).toBeGreaterThanOrEqual(0);
            expect(metrics.cacheHitRate).toBeLessThanOrEqual(1);
        });

        it('should handle concurrent integration requests without race conditions', async () => {
            const concurrentRequests = Array.from({ length: 5 }, (_, i) => ({
                ...mockBriefFormData,
                brief: `Concurrent brief ${i}`,
                personaCount: (i % 3) + 1
            }));

            const results = await Promise.all(
                concurrentRequests.map(brief => generator.generatePersonas(brief))
            );

            // All requests should complete successfully
            results.forEach((result, index) => {
                expect(result.metadata.source).toBe('qloo-first');
                expect(result.personas.length).toBeGreaterThan(0);
                expect(result.metadata.processingTime).toBeGreaterThan(0);
            });

            // Verify each request was processed independently
            expect(mockSignalExtractor.extractSignals).toHaveBeenCalledTimes(5);
            expect(mockSignalExtractor.fetchCulturalData).toHaveBeenCalledTimes(5);
        });

        it('should integrate performance monitoring across the complete flow', async () => {
            const result = await generator.generatePersonas(mockBriefFormData);

            // Verify performance metrics are captured for each component
            const metrics = generator.getPerformanceMetrics();
            
            expect(metrics.totalProcessingTime).toBeGreaterThan(0);
            expect(metrics.qlooExtractionTime).toBeGreaterThan(0);
            expect(metrics.promptBuildingTime).toBeGreaterThan(0);
            expect(metrics.geminiGenerationTime).toBeGreaterThan(0);
            expect(metrics.qlooApiCallsCount).toBeGreaterThan(0);

            // Verify result metadata includes performance data
            expect(result.metadata.processingTime).toBeGreaterThan(0);
            expect(result.metadata.qlooApiCallsCount).toBeGreaterThan(0);
        });

        it('should handle integration with edge case data patterns', async () => {
            const edgeCases = [
                {
                    name: 'empty interests and values',
                    brief: { ...mockBriefFormData, interests: [], values: [] }
                },
                {
                    name: 'very long brief',
                    brief: { ...mockBriefFormData, brief: 'A'.repeat(2000) }
                },
                {
                    name: 'high persona count',
                    brief: { ...mockBriefFormData, personaCount: 10 }
                },
                {
                    name: 'wide age range',
                    brief: { ...mockBriefFormData, ageRange: { min: 18, max: 65 } }
                }
            ];

            for (const { name, brief } of edgeCases) {
                const result = await generator.generatePersonas(brief);
                
                expect(result.metadata.source).toBe('qloo-first');
                expect(result.personas.length).toBeGreaterThan(0);
                
                // Verify the flow completed successfully for edge case
                expect(mockSignalExtractor.extractSignals).toHaveBeenCalledWith(brief);
            }
        });
    });
});