import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { BriefFormData } from '@/components/forms/BriefForm';

// Mock server-only dependency to avoid import issues
vi.mock('server-only', () => ({}));

// Mock all external dependencies before importing
vi.mock('@/lib/persona-utils', () => ({
    validateAndCleanPersonas: vi.fn()
}));

vi.mock('@/services/permissionService', () => ({
    permissionService: {
        checkPersonaLimit: vi.fn()
    }
}));

vi.mock('@/lib/auth-utils', () => ({
    getAuthenticatedUser: vi.fn()
}));

vi.mock('@/lib/api/gemini', () => ({
    getGeminiClient: vi.fn()
}));

vi.mock('@/lib/api/qloo', () => ({
    getQlooClient: vi.fn()
}));

vi.mock('@/lib/services/qloo-first-persona-generator', () => ({
    QlooFirstPersonaGenerator: vi.fn()
}));

vi.mock('@/lib/services/feature-flag-service', () => ({
    featureFlagService: {
        isQlooFirstEnabled: vi.fn(),
        shouldFallbackOnError: vi.fn(),
        isDebugModeEnabled: vi.fn()
    }
}));

vi.mock('@/stack-server', () => ({
    getStackServerApp: vi.fn()
}));

// Import the route handler and mocked dependencies
import { POST } from './route';
import { validateAndCleanPersonas } from '@/lib/persona-utils';
import { permissionService } from '@/services/permissionService';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { getGeminiClient } from '@/lib/api/gemini';
import { getQlooClient } from '@/lib/api/qloo';
import { QlooFirstPersonaGenerator } from '@/lib/services/qloo-first-persona-generator';
import { featureFlagService } from '@/lib/services/feature-flag-service';

describe('POST /api/generate-personas - Feature Flag Behavior', () => {
    let mockUser: any;
    let mockGeminiClient: any;
    let mockQlooClient: any;
    let mockQlooFirstGeneratorInstance: any;

    const validBriefFormData: BriefFormData = {
        brief: 'Create personas for a fitness app targeting tech-savvy millennials in Paris who value health and work-life balance',
        ageRange: { min: 25, max: 35 },
        location: 'Paris, France',
        language: 'fr',
        personaCount: 3,
        interests: ['Fitness', 'Technology', 'Wellness'],
        values: ['Health', 'Work-life balance', 'Innovation']
    };

    const mockPersonas = [
        {
            id: '1',
            name: 'Marie Dubois',
            age: 28,
            occupation: 'Software Developer',
            location: 'Paris',
            bio: 'Tech-savvy millennial who prioritizes fitness and wellness',
            goals: ['Stay fit while working remotely', 'Find work-life balance'],
            frustrations: ['Lack of time for gym', 'Sedentary lifestyle'],
            interests: ['Fitness', 'Technology'],
            values: ['Health', 'Innovation']
        },
        {
            id: '2',
            name: 'Pierre Martin',
            age: 32,
            occupation: 'UX Designer',
            location: 'Paris',
            bio: 'Creative professional focused on wellness and productivity',
            goals: ['Maintain fitness routine', 'Improve productivity'],
            frustrations: ['Inconsistent workout schedule', 'Stress from deadlines'],
            interests: ['Design', 'Wellness'],
            values: ['Creativity', 'Balance']
        }
    ];

    const mockQlooFirstResult = {
        personas: mockPersonas,
        metadata: {
            source: 'qloo-first' as const,
            qlooDataUsed: true,
            culturalConstraintsApplied: ['music: 2 items', 'brands: 2 items', 'socialMedia: 2 items'],
            processingTime: 2500,
            qlooApiCallsCount: 3,
            cacheHitRate: 0.6
        }
    };

    const mockLegacyResult = {
        personas: mockPersonas,
        metadata: {
            source: 'legacy' as const,
            qlooDataUsed: true,
            culturalConstraintsApplied: ['post-hoc-enrichment'],
            processingTime: 0,
            qlooApiCallsCount: 1,
            cacheHitRate: 0,
            errorEncountered: undefined
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock authenticated user
        mockUser = {
            id: 'user-123',
            email: 'test@example.com',
            clientReadOnlyMetadata: {
                onboarded: true,
                role: 'marketing-manager',
                industry: 'tech'
            }
        };

        // Mock Gemini client
        mockGeminiClient = {
            generatePersonas: vi.fn().mockResolvedValue(mockPersonas)
        };

        // Mock Qloo client
        mockQlooClient = {
            enrichPersonas: vi.fn().mockResolvedValue(mockPersonas)
        };

        // Mock QlooFirstPersonaGenerator instance
        mockQlooFirstGeneratorInstance = {
            generatePersonas: vi.fn().mockResolvedValue(mockQlooFirstResult)
        };

        // Setup mock implementations
        (getAuthenticatedUser as any).mockResolvedValue(mockUser);
        (permissionService.checkPersonaLimit as any).mockResolvedValue(true);
        (validateAndCleanPersonas as any).mockImplementation((personas: any) => personas);
        (getGeminiClient as any).mockReturnValue(mockGeminiClient);
        (getQlooClient as any).mockReturnValue(mockQlooClient);
        (QlooFirstPersonaGenerator as any).mockImplementation(() => mockQlooFirstGeneratorInstance);

        // Mock console methods
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Feature Flag Enabled/Disabled Scenarios', () => {
        it('should use Qloo-first flow when feature flag is enabled', async () => {
            // Setup: Enable Qloo-first feature flag
            (featureFlagService.isQlooFirstEnabled as any).mockReturnValue(true);
            (featureFlagService.shouldFallbackOnError as any).mockReturnValue(true);
            (featureFlagService.isDebugModeEnabled as any).mockReturnValue(false);

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(validBriefFormData)
            });

            const response = await POST(request);
            const responseData = await response.json();

            // Verify Qloo-first flow was used
            expect(featureFlagService.isQlooFirstEnabled).toHaveBeenCalled();
            expect(QlooFirstPersonaGenerator).toHaveBeenCalledWith({
                enableFallback: true,
                debugMode: false
            });
            expect(mockQlooFirstGeneratorInstance.generatePersonas).toHaveBeenCalledWith(validBriefFormData);

            // Verify legacy flow was NOT used
            expect(getGeminiClient).not.toHaveBeenCalled();
            expect(getQlooClient).not.toHaveBeenCalled();

            // Verify response indicates Qloo-first flow
            expect(responseData.generation.source).toBe('qloo-first');
            expect(responseData.generation.method).toBe('qloo-first');
            expect(responseData.featureFlags.qlooFirstEnabled).toBe(true);
            expect(responseData.sources.culturalData).toBe('qloo');

            // Verify console log for flow selection
            expect(console.log).toHaveBeenCalledWith('🚀 Using Qloo-first persona generation flow');
        });

        it('should use legacy flow when feature flag is disabled', async () => {
            // Setup: Disable Qloo-first feature flag
            (featureFlagService.isQlooFirstEnabled as any).mockReturnValue(false);
            (featureFlagService.shouldFallbackOnError as any).mockReturnValue(true);
            (featureFlagService.isDebugModeEnabled as any).mockReturnValue(false);

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(validBriefFormData)
            });

            const response = await POST(request);
            const responseData = await response.json();

            // Verify legacy flow was used
            expect(featureFlagService.isQlooFirstEnabled).toHaveBeenCalled();
            expect(getGeminiClient).toHaveBeenCalled();
            expect(getQlooClient).toHaveBeenCalled();
            expect(mockGeminiClient.generatePersonas).toHaveBeenCalledWith(
                validBriefFormData.brief,
                'en tant que directeur marketing expérimenté, dans le secteur technologique'
            );

            // Verify Qloo-first flow was NOT used
            expect(QlooFirstPersonaGenerator).not.toHaveBeenCalled();

            // Verify response indicates legacy flow
            expect(responseData.generation.source).toBe('legacy');
            expect(responseData.generation.method).toBe('legacy');
            expect(responseData.featureFlags.qlooFirstEnabled).toBe(false);
            expect(responseData.sources.culturalData).toBe('qloo'); // Still uses Qloo for enrichment

            // Verify console log for flow selection
            expect(console.log).toHaveBeenCalledWith('🔄 Using legacy persona generation flow');
        });

        it('should handle feature flag state changes correctly', async () => {
            // First request with feature flag enabled
            (featureFlagService.isQlooFirstEnabled as any).mockReturnValue(true);
            (featureFlagService.shouldFallbackOnError as any).mockReturnValue(true);
            (featureFlagService.isDebugModeEnabled as any).mockReturnValue(false);

            const request1 = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(validBriefFormData)
            });

            const response1 = await POST(request1);
            const responseData1 = await response1.json();

            expect(responseData1.featureFlags.qlooFirstEnabled).toBe(true);
            expect(responseData1.generation.method).toBe('qloo-first');

            // Clear mocks for second request
            vi.clearAllMocks();
            (getAuthenticatedUser as any).mockResolvedValue(mockUser);
            (permissionService.checkPersonaLimit as any).mockResolvedValue(true);
            (validateAndCleanPersonas as any).mockImplementation((personas: any) => personas);
            (getGeminiClient as any).mockReturnValue(mockGeminiClient);
            (getQlooClient as any).mockReturnValue(mockQlooClient);

            // Second request with feature flag disabled
            (featureFlagService.isQlooFirstEnabled as any).mockReturnValue(false);
            (featureFlagService.shouldFallbackOnError as any).mockReturnValue(true);
            (featureFlagService.isDebugModeEnabled as any).mockReturnValue(false);

            const request2 = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(validBriefFormData)
            });

            const response2 = await POST(request2);
            const responseData2 = await response2.json();

            expect(responseData2.featureFlags.qlooFirstEnabled).toBe(false);
            expect(responseData2.generation.method).toBe('legacy');
        });
    });

    describe('Fallback Behavior When New Flow Encounters Errors', () => {
        it('should fallback to legacy flow when Qloo-first generator throws error and fallback is enabled', async () => {
            // Setup: Enable Qloo-first with fallback enabled
            (featureFlagService.isQlooFirstEnabled as any).mockReturnValue(true);
            (featureFlagService.shouldFallbackOnError as any).mockReturnValue(true);
            (featureFlagService.isDebugModeEnabled as any).mockReturnValue(false);

            // Mock Qloo-first generator to return fallback result
            const fallbackResult = {
                personas: mockPersonas,
                metadata: {
                    source: 'fallback-legacy' as const,
                    qlooDataUsed: true,
                    culturalConstraintsApplied: ['post-hoc-enrichment'],
                    processingTime: 1500,
                    qlooApiCallsCount: 1,
                    cacheHitRate: 0,
                    errorEncountered: 'QLOO_API_UNAVAILABLE'
                }
            };

            mockQlooFirstGeneratorInstance.generatePersonas.mockResolvedValue(fallbackResult);

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(validBriefFormData)
            });

            const response = await POST(request);
            const responseData = await response.json();

            // Verify Qloo-first was attempted with fallback enabled
            expect(QlooFirstPersonaGenerator).toHaveBeenCalledWith({
                enableFallback: true,
                debugMode: false
            });

            // Verify response indicates fallback occurred
            expect(responseData.generation.source).toBe('fallback-legacy');
            expect(responseData.generation.method).toBe('legacy'); // Method becomes 'legacy' when source is 'fallback-legacy'
            expect(responseData.fallback).toEqual({
                reason: 'QLOO_API_UNAVAILABLE',
                originalFlowFailed: true
            });

            // Verify feature flags still show correct state
            expect(responseData.featureFlags.qlooFirstEnabled).toBe(true);
            expect(responseData.featureFlags.fallbackEnabled).toBe(true);
        });

        it('should not fallback when fallback is disabled and error occurs', async () => {
            // Setup: Enable Qloo-first but disable fallback
            (featureFlagService.isQlooFirstEnabled as any).mockReturnValue(true);
            (featureFlagService.shouldFallbackOnError as any).mockReturnValue(false);
            (featureFlagService.isDebugModeEnabled as any).mockReturnValue(false);

            // Mock Qloo-first generator to throw error
            mockQlooFirstGeneratorInstance.generatePersonas.mockRejectedValue(new Error('Qloo API failed'));

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(validBriefFormData)
            });

            const response = await POST(request);
            const responseData = await response.json();

            // Verify Qloo-first was attempted with fallback disabled
            expect(QlooFirstPersonaGenerator).toHaveBeenCalledWith({
                enableFallback: false,
                debugMode: false
            });

            // Verify error response
            expect(response.status).toBe(500);
            expect(responseData.success).toBe(false);
            expect(responseData.error).toBe('Erreur interne du serveur');
            expect(responseData.generation.source).toBe('error');

            // Verify feature flags show correct state
            expect(responseData.featureFlags.qlooFirstEnabled).toBe(true);
            expect(responseData.featureFlags.fallbackEnabled).toBe(false);
        });

        it('should handle different error types in fallback scenarios', async () => {
            (featureFlagService.isQlooFirstEnabled as any).mockReturnValue(true);
            (featureFlagService.shouldFallbackOnError as any).mockReturnValue(true);
            (featureFlagService.isDebugModeEnabled as any).mockReturnValue(false);

            const errorScenarios = [
                {
                    error: 'QLOO_API_UNAVAILABLE',
                    description: 'Qloo API unavailable'
                },
                {
                    error: 'SIGNAL_EXTRACTION_FAILED',
                    description: 'Signal extraction failed'
                },
                {
                    error: 'CULTURAL_DATA_INSUFFICIENT',
                    description: 'Cultural data insufficient'
                },
                {
                    error: 'PROMPT_BUILDING_FAILED',
                    description: 'Prompt building failed'
                }
            ];

            for (const scenario of errorScenarios) {
                vi.clearAllMocks();
                (getAuthenticatedUser as any).mockResolvedValue(mockUser);
                (permissionService.checkPersonaLimit as any).mockResolvedValue(true);
                (validateAndCleanPersonas as any).mockImplementation((personas: any) => personas);
                (QlooFirstPersonaGenerator as any).mockImplementation(() => mockQlooFirstGeneratorInstance);

                const fallbackResult = {
                    personas: mockPersonas,
                    metadata: {
                        source: 'fallback-legacy' as const,
                        qlooDataUsed: true,
                        culturalConstraintsApplied: ['post-hoc-enrichment'],
                        processingTime: 1500,
                        qlooApiCallsCount: 1,
                        cacheHitRate: 0,
                        errorEncountered: scenario.error
                    }
                };

                mockQlooFirstGeneratorInstance.generatePersonas.mockResolvedValue(fallbackResult);

                const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                    method: 'POST',
                    body: JSON.stringify(validBriefFormData)
                });

                const response = await POST(request);
                const responseData = await response.json();

                expect(responseData.fallback.reason).toBe(scenario.error);
                expect(responseData.generation.source).toBe('fallback-legacy');
            }
        });
    });

    describe('Metadata Tracking in Both Flows', () => {
        it('should track metadata correctly in Qloo-first flow', async () => {
            (featureFlagService.isQlooFirstEnabled as any).mockReturnValue(true);
            (featureFlagService.shouldFallbackOnError as any).mockReturnValue(true);
            (featureFlagService.isDebugModeEnabled as any).mockReturnValue(false);

            const detailedResult = {
                personas: mockPersonas,
                metadata: {
                    source: 'qloo-first' as const,
                    qlooDataUsed: true,
                    culturalConstraintsApplied: ['music: 5 items', 'brands: 3 items', 'restaurants: 4 items'],
                    processingTime: 3200,
                    qlooApiCallsCount: 6,
                    cacheHitRate: 0.75
                }
            };

            mockQlooFirstGeneratorInstance.generatePersonas.mockResolvedValue(detailedResult);

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(validBriefFormData)
            });

            const response = await POST(request);
            const responseData = await response.json();

            // Verify comprehensive metadata tracking
            expect(responseData.generation).toEqual({
                source: 'qloo-first',
                method: 'qloo-first',
                processingTime: 3200,
                personaCount: 2,
                requestedCount: 3
            });

            expect(responseData.sources).toEqual({
                gemini: true,
                qloo: true,
                culturalData: 'qloo'
            });

            expect(responseData.culturalConstraints).toEqual({
                applied: ['music: 5 items', 'brands: 3 items', 'restaurants: 4 items'],
                count: 3
            });

            expect(responseData.performance).toEqual({
                qlooApiCalls: 6,
                cacheHitRate: 0.75
            });

            expect(responseData.featureFlags).toEqual({
                qlooFirstEnabled: true,
                fallbackEnabled: true,
                debugMode: false
            });
        });

        it('should track metadata correctly in legacy flow', async () => {
            (featureFlagService.isQlooFirstEnabled as any).mockReturnValue(false);
            (featureFlagService.shouldFallbackOnError as any).mockReturnValue(true);
            (featureFlagService.isDebugModeEnabled as any).mockReturnValue(false);

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(validBriefFormData)
            });

            const response = await POST(request);
            const responseData = await response.json();

            // Verify legacy flow metadata
            expect(responseData.generation).toEqual({
                source: 'legacy',
                method: 'legacy',
                processingTime: 0, // Not tracked in legacy flow
                personaCount: 2,
                requestedCount: 3
            });

            expect(responseData.sources).toEqual({
                gemini: true,
                qloo: true, // Qloo enrichment succeeded
                culturalData: 'qloo'
            });

            expect(responseData.culturalConstraints).toEqual({
                applied: ['post-hoc-enrichment'],
                count: 1
            });

            expect(responseData.performance).toEqual({
                qlooApiCalls: 1, // Estimate for legacy enrichment
                cacheHitRate: 0 // Not tracked in legacy flow
            });

            expect(responseData.featureFlags).toEqual({
                qlooFirstEnabled: false,
                fallbackEnabled: true,
                debugMode: false
            });
        });

        it('should track metadata correctly when legacy Qloo enrichment fails', async () => {
            (featureFlagService.isQlooFirstEnabled as any).mockReturnValue(false);
            (featureFlagService.shouldFallbackOnError as any).mockReturnValue(true);
            (featureFlagService.isDebugModeEnabled as any).mockReturnValue(false);

            // Mock Qloo enrichment to fail
            mockQlooClient.enrichPersonas.mockRejectedValue(new Error('Qloo enrichment failed'));

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(validBriefFormData)
            });

            const response = await POST(request);
            const responseData = await response.json();

            // Verify metadata when Qloo enrichment fails
            expect(responseData.sources).toEqual({
                gemini: true,
                qloo: false, // Qloo enrichment failed
                culturalData: 'none'
            });

            expect(responseData.culturalConstraints).toEqual({
                applied: [],
                count: 0
            });

            // Performance section is not included when qlooApiCallsCount is 0 or undefined
            expect(responseData.performance).toBeUndefined();

            // Verify console warning was logged
            expect(console.warn).toHaveBeenCalledWith(
                '⚠️ Enrichissement Qloo échoué, utilisation des personas Gemini seuls:',
                expect.any(Error)
            );
        });

        it('should include timestamp in all responses', async () => {
            (featureFlagService.isQlooFirstEnabled as any).mockReturnValue(true);
            (featureFlagService.shouldFallbackOnError as any).mockReturnValue(true);
            (featureFlagService.isDebugModeEnabled as any).mockReturnValue(false);

            const beforeRequest = new Date();

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(validBriefFormData)
            });

            const response = await POST(request);
            const responseData = await response.json();

            const afterRequest = new Date();
            const responseTimestamp = new Date(responseData.timestamp);

            // Verify timestamp is valid and within expected range
            expect(responseTimestamp).toBeInstanceOf(Date);
            expect(responseTimestamp.getTime()).toBeGreaterThanOrEqual(beforeRequest.getTime());
            expect(responseTimestamp.getTime()).toBeLessThanOrEqual(afterRequest.getTime());
        });
    });

    describe('Debug Mode Feature Flag', () => {
        it('should enable debug mode when feature flag is set', async () => {
            (featureFlagService.isQlooFirstEnabled as any).mockReturnValue(true);
            (featureFlagService.shouldFallbackOnError as any).mockReturnValue(true);
            (featureFlagService.isDebugModeEnabled as any).mockReturnValue(true);

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(validBriefFormData)
            });

            const response = await POST(request);
            const responseData = await response.json();

            // Verify debug mode was passed to generator
            expect(QlooFirstPersonaGenerator).toHaveBeenCalledWith({
                enableFallback: true,
                debugMode: true
            });

            // Verify debug mode is reflected in response
            expect(responseData.featureFlags.debugMode).toBe(true);
        });

        it('should disable debug mode when feature flag is not set', async () => {
            (featureFlagService.isQlooFirstEnabled as any).mockReturnValue(true);
            (featureFlagService.shouldFallbackOnError as any).mockReturnValue(true);
            (featureFlagService.isDebugModeEnabled as any).mockReturnValue(false);

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(validBriefFormData)
            });

            const response = await POST(request);
            const responseData = await response.json();

            // Verify debug mode was not enabled
            expect(QlooFirstPersonaGenerator).toHaveBeenCalledWith({
                enableFallback: true,
                debugMode: false
            });

            // Verify debug mode is reflected in response
            expect(responseData.featureFlags.debugMode).toBe(false);
        });
    });

    describe('Feature Flag Combinations', () => {
        it('should handle all feature flags enabled', async () => {
            (featureFlagService.isQlooFirstEnabled as any).mockReturnValue(true);
            (featureFlagService.shouldFallbackOnError as any).mockReturnValue(true);
            (featureFlagService.isDebugModeEnabled as any).mockReturnValue(true);

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(validBriefFormData)
            });

            const response = await POST(request);
            const responseData = await response.json();

            expect(QlooFirstPersonaGenerator).toHaveBeenCalledWith({
                enableFallback: true,
                debugMode: true
            });

            expect(responseData.featureFlags).toEqual({
                qlooFirstEnabled: true,
                fallbackEnabled: true,
                debugMode: true
            });

            expect(responseData.generation.method).toBe('qloo-first');
        });

        it('should handle all feature flags disabled', async () => {
            (featureFlagService.isQlooFirstEnabled as any).mockReturnValue(false);
            (featureFlagService.shouldFallbackOnError as any).mockReturnValue(false);
            (featureFlagService.isDebugModeEnabled as any).mockReturnValue(false);

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(validBriefFormData)
            });

            const response = await POST(request);
            const responseData = await response.json();

            // Should use legacy flow
            expect(getGeminiClient).toHaveBeenCalled();
            expect(getQlooClient).toHaveBeenCalled();
            expect(QlooFirstPersonaGenerator).not.toHaveBeenCalled();

            expect(responseData.featureFlags).toEqual({
                qlooFirstEnabled: false,
                fallbackEnabled: false,
                debugMode: false
            });

            expect(responseData.generation.method).toBe('legacy');
        });

        it('should handle mixed feature flag states', async () => {
            (featureFlagService.isQlooFirstEnabled as any).mockReturnValue(true);
            (featureFlagService.shouldFallbackOnError as any).mockReturnValue(false);
            (featureFlagService.isDebugModeEnabled as any).mockReturnValue(true);

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(validBriefFormData)
            });

            const response = await POST(request);
            const responseData = await response.json();

            expect(QlooFirstPersonaGenerator).toHaveBeenCalledWith({
                enableFallback: false,
                debugMode: true
            });

            expect(responseData.featureFlags).toEqual({
                qlooFirstEnabled: true,
                fallbackEnabled: false,
                debugMode: true
            });
        });
    });

    describe('Error Response Feature Flag Tracking', () => {
        it('should include feature flag state in error responses', async () => {
            (featureFlagService.isQlooFirstEnabled as any).mockReturnValue(true);
            (featureFlagService.shouldFallbackOnError as any).mockReturnValue(false);
            (featureFlagService.isDebugModeEnabled as any).mockReturnValue(true);

            // Mock generator to throw error
            mockQlooFirstGeneratorInstance.generatePersonas.mockRejectedValue(new Error('Generation failed'));

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(validBriefFormData)
            });

            const response = await POST(request);
            const responseData = await response.json();

            expect(response.status).toBe(500);
            expect(responseData.success).toBe(false);
            expect(responseData.featureFlags).toEqual({
                qlooFirstEnabled: true,
                fallbackEnabled: false,
                debugMode: true
            });

            expect(responseData.generation.method).toBe('qloo-first');
            expect(responseData.generation.source).toBe('error');
        });

        it('should include feature flag state in authentication error responses', async () => {
            (featureFlagService.isQlooFirstEnabled as any).mockReturnValue(false);
            (featureFlagService.shouldFallbackOnError as any).mockReturnValue(true);
            (featureFlagService.isDebugModeEnabled as any).mockReturnValue(false);

            // Mock authentication failure
            (getAuthenticatedUser as any).mockResolvedValue(null);

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(validBriefFormData)
            });

            const response = await POST(request);
            const responseData = await response.json();

            expect(response.status).toBe(401);
            expect(responseData.error).toBe('Authentification requise');
            
            // Feature flags should not be included in auth errors (they're added in the catch block)
            expect(responseData.featureFlags).toBeUndefined();
        });
    });

    describe('Feature Flag Configuration Validation', () => {
        it('should handle feature flag service configuration errors gracefully', async () => {
            // Mock feature flag service to throw configuration error
            (featureFlagService.isQlooFirstEnabled as any).mockImplementation(() => {
                throw new Error('Feature flag configuration invalid');
            });

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(validBriefFormData)
            });

            const response = await POST(request);
            const responseData = await response.json();

            // Should fallback to legacy flow when feature flag service fails
            expect(response.status).toBe(200);
            expect(responseData.success).toBe(true);
            expect(responseData.generation.method).toBe('legacy');
            
            // Should log the configuration error
            expect(console.error).toHaveBeenCalledWith(
                '❌ Erreur lors de la vérification des feature flags:',
                expect.any(Error)
            );
        });

        it('should validate feature flag consistency across multiple requests', async () => {
            // Test that feature flags remain consistent during concurrent requests
            const requests = [];
            
            (featureFlagService.isQlooFirstEnabled as any).mockReturnValue(true);
            (featureFlagService.shouldFallbackOnError as any).mockReturnValue(true);
            (featureFlagService.isDebugModeEnabled as any).mockReturnValue(false);

            // Create multiple concurrent requests
            for (let i = 0; i < 3; i++) {
                const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                    method: 'POST',
                    body: JSON.stringify({
                        ...validBriefFormData,
                        brief: `Test request ${i + 1}`
                    })
                });
                requests.push(POST(request));
            }

            const responses = await Promise.all(requests);
            const responsesData = await Promise.all(responses.map(r => r.json()));

            // All responses should have consistent feature flag states
            responsesData.forEach((responseData, index) => {
                expect(responseData.featureFlags).toEqual({
                    qlooFirstEnabled: true,
                    fallbackEnabled: true,
                    debugMode: false
                });
                expect(responseData.generation.method).toBe('qloo-first');
            });
        });
    });

    describe('Feature Flag Requirement Compliance', () => {
        it('should satisfy requirement 5.4 - feature flag configurability', async () => {
            // Test that the system is configurable via feature flags as per requirement 5.4
            const testScenarios = [
                { enabled: true, fallback: true, debug: false, expectedMethod: 'qloo-first' },
                { enabled: false, fallback: true, debug: false, expectedMethod: 'legacy' },
                { enabled: true, fallback: false, debug: true, expectedMethod: 'qloo-first' },
                { enabled: false, fallback: false, debug: true, expectedMethod: 'legacy' }
            ];

            for (const scenario of testScenarios) {
                vi.clearAllMocks();
                (getAuthenticatedUser as any).mockResolvedValue(mockUser);
                (permissionService.checkPersonaLimit as any).mockResolvedValue(true);
                (validateAndCleanPersonas as any).mockImplementation((personas: any) => personas);
                (getGeminiClient as any).mockReturnValue(mockGeminiClient);
                (getQlooClient as any).mockReturnValue(mockQlooClient);
                (QlooFirstPersonaGenerator as any).mockImplementation(() => mockQlooFirstGeneratorInstance);

                (featureFlagService.isQlooFirstEnabled as any).mockReturnValue(scenario.enabled);
                (featureFlagService.shouldFallbackOnError as any).mockReturnValue(scenario.fallback);
                (featureFlagService.isDebugModeEnabled as any).mockReturnValue(scenario.debug);

                const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                    method: 'POST',
                    body: JSON.stringify(validBriefFormData)
                });

                const response = await POST(request);
                const responseData = await response.json();

                expect(responseData.generation.method).toBe(scenario.expectedMethod);
                expect(responseData.featureFlags.qlooFirstEnabled).toBe(scenario.enabled);
                expect(responseData.featureFlags.fallbackEnabled).toBe(scenario.fallback);
                expect(responseData.featureFlags.debugMode).toBe(scenario.debug);
            }
        });

        it('should satisfy requirement 5.3 - fallback mechanism', async () => {
            // Test that fallback works as specified in requirement 5.3
            (featureFlagService.isQlooFirstEnabled as any).mockReturnValue(true);
            (featureFlagService.shouldFallbackOnError as any).mockReturnValue(true);
            (featureFlagService.isDebugModeEnabled as any).mockReturnValue(false);

            // Mock fallback scenario
            const fallbackResult = {
                personas: mockPersonas,
                metadata: {
                    source: 'fallback-legacy' as const,
                    qlooDataUsed: true,
                    culturalConstraintsApplied: ['post-hoc-enrichment'],
                    processingTime: 1500,
                    qlooApiCallsCount: 1,
                    cacheHitRate: 0,
                    errorEncountered: 'QLOO_API_UNAVAILABLE'
                }
            };

            mockQlooFirstGeneratorInstance.generatePersonas.mockResolvedValue(fallbackResult);

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(validBriefFormData)
            });

            const response = await POST(request);
            const responseData = await response.json();

            // Verify requirement 5.3 compliance
            expect(responseData.fallback).toBeDefined();
            expect(responseData.fallback.originalFlowFailed).toBe(true);
            expect(responseData.fallback.reason).toBe('QLOO_API_UNAVAILABLE');
            expect(responseData.generation.source).toBe('fallback-legacy');
            
            // Should still return successful personas
            expect(responseData.success).toBe(true);
            expect(responseData.personas).toHaveLength(2);
        });

        it('should satisfy requirement 5.5 - source indication in response', async () => {
            // Test that responses include source indicators as per requirement 5.5
            const testCases = [
                {
                    name: 'qloo-first flow',
                    setup: () => {
                        (featureFlagService.isQlooFirstEnabled as any).mockReturnValue(true);
                        mockQlooFirstGeneratorInstance.generatePersonas.mockResolvedValue(mockQlooFirstResult);
                    },
                    expectedSource: 'qloo-first',
                    expectedMethod: 'qloo-first'
                },
                {
                    name: 'legacy flow',
                    setup: () => {
                        (featureFlagService.isQlooFirstEnabled as any).mockReturnValue(false);
                    },
                    expectedSource: 'legacy',
                    expectedMethod: 'legacy'
                }
            ];

            for (const testCase of testCases) {
                vi.clearAllMocks();
                (getAuthenticatedUser as any).mockResolvedValue(mockUser);
                (permissionService.checkPersonaLimit as any).mockResolvedValue(true);
                (validateAndCleanPersonas as any).mockImplementation((personas: any) => personas);
                (getGeminiClient as any).mockReturnValue(mockGeminiClient);
                (getQlooClient as any).mockReturnValue(mockQlooClient);
                (QlooFirstPersonaGenerator as any).mockImplementation(() => mockQlooFirstGeneratorInstance);
                (featureFlagService.shouldFallbackOnError as any).mockReturnValue(true);
                (featureFlagService.isDebugModeEnabled as any).mockReturnValue(false);

                testCase.setup();

                const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                    method: 'POST',
                    body: JSON.stringify(validBriefFormData)
                });

                const response = await POST(request);
                const responseData = await response.json();

                // Verify requirement 5.5 compliance - source indication
                expect(responseData.generation.source).toBe(testCase.expectedSource);
                expect(responseData.generation.method).toBe(testCase.expectedMethod);
                
                // Should include metadata about which flow was used
                expect(responseData.sources).toBeDefined();
                expect(responseData.sources.culturalData).toBeDefined();
            }
        });
    });
});