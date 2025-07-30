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

describe('POST /api/generate-personas - Complete BriefForm to Persona Generation', () => {
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

        // Setup mock implementations using the imported mocked functions
        (getAuthenticatedUser as any).mockResolvedValue(mockUser);
        (permissionService.checkPersonaLimit as any).mockResolvedValue(true);
        (validateAndCleanPersonas as any).mockImplementation((personas: any) => personas);
        (getGeminiClient as any).mockReturnValue(mockGeminiClient);
        (getQlooClient as any).mockReturnValue(mockQlooClient);
        (QlooFirstPersonaGenerator as any).mockImplementation(() => mockQlooFirstGeneratorInstance);

        // Mock feature flags - default to Qloo-first enabled
        (featureFlagService.isQlooFirstEnabled as any).mockReturnValue(true);
        (featureFlagService.shouldFallbackOnError as any).mockReturnValue(true);
        (featureFlagService.isDebugModeEnabled as any).mockReturnValue(false);

        // Mock console methods
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Complete BriefForm to Persona Generation Flow', () => {
        it('should successfully process complete BriefFormData with Qloo-first flow', async () => {
            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(validBriefFormData)
            });

            const response = await POST(request);
            const responseData = await response.json();

            // Verify authentication and permissions were checked
            expect(getAuthenticatedUser).toHaveBeenCalled();
            expect(permissionService.checkPersonaLimit).toHaveBeenCalledWith('user-123');

            // Verify Qloo-first flow was used
            expect(featureFlagService.isQlooFirstEnabled).toHaveBeenCalled();
            expect(QlooFirstPersonaGenerator).toHaveBeenCalledWith({
                enableFallback: true,
                debugMode: false
            });
            expect(mockQlooFirstGeneratorInstance.generatePersonas).toHaveBeenCalledWith(validBriefFormData);

            // Verify personas were validated
            expect(validateAndCleanPersonas).toHaveBeenCalledWith(mockPersonas);

            // Verify response structure
            expect(response.status).toBe(200);
            expect(responseData).toEqual({
                success: true,
                personas: mockPersonas,
                timestamp: expect.any(String),
                generation: {
                    source: 'qloo-first',
                    method: 'qloo-first',
                    processingTime: 2500,
                    personaCount: 2,
                    requestedCount: 3
                },
                sources: {
                    gemini: true,
                    qloo: true,
                    culturalData: 'qloo'
                },
                culturalConstraints: {
                    applied: ['music: 2 items', 'brands: 2 items', 'socialMedia: 2 items'],
                    count: 3
                },
                performance: {
                    qlooApiCalls: 3,
                    cacheHitRate: 0.6
                },
                featureFlags: {
                    qlooFirstEnabled: true,
                    fallbackEnabled: true,
                    debugMode: false
                }
            });
        });

        it('should handle legacy flow when Qloo-first is disabled', async () => {
            (featureFlagService.isQlooFirstEnabled as any).mockReturnValue(false);

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(validBriefFormData)
            });

            const response = await POST(request);
            const responseData = await response.json();

            // Verify legacy flow was used
            expect(getGeminiClient).toHaveBeenCalled();
            expect(getQlooClient).toHaveBeenCalled();

            // Verify response indicates legacy flow
            expect(responseData.generation.method).toBe('legacy');
            expect(responseData.featureFlags.qlooFirstEnabled).toBe(false);
        });

        it('should handle backward compatibility with old brief format', async () => {
            const oldFormatRequest = {
                brief: validBriefFormData.brief
            };

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(oldFormatRequest)
            });

            const response = await POST(request);
            const responseData = await response.json();

            // Should convert to BriefFormData format with defaults
            expect(mockQlooFirstGeneratorInstance.generatePersonas).toHaveBeenCalledWith({
                brief: validBriefFormData.brief,
                ageRange: { min: 25, max: 45 },
                location: '',
                language: 'fr',
                personaCount: 2,
                interests: [],
                values: []
            });

            expect(response.status).toBe(200);
            expect(responseData.success).toBe(true);
        });

        it('should handle all BriefFormData fields correctly', async () => {
            const comprehensiveBriefData: BriefFormData = {
                brief: 'Comprehensive fitness app for urban professionals',
                ageRange: { min: 28, max: 42 },
                location: 'Lyon, France',
                language: 'en',
                personaCount: 4,
                interests: ['Fitness', 'Nutrition', 'Technology', 'Travel'],
                values: ['Health', 'Efficiency', 'Sustainability', 'Innovation']
            };

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(comprehensiveBriefData)
            });

            const response = await POST(request);
            const responseData = await response.json();

            // Verify all fields were passed correctly
            expect(mockQlooFirstGeneratorInstance.generatePersonas).toHaveBeenCalledWith(comprehensiveBriefData);
            expect(responseData.generation.requestedCount).toBe(4);
            expect(response.status).toBe(200);
        });

        it('should handle fallback scenario with error metadata', async () => {
            const fallbackResult = {
                ...mockQlooFirstResult,
                metadata: {
                    ...mockQlooFirstResult.metadata,
                    source: 'fallback-legacy' as const,
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

            expect(responseData.generation.source).toBe('fallback-legacy');
            expect(responseData.fallback).toEqual({
                reason: 'QLOO_API_UNAVAILABLE',
                originalFlowFailed: true
            });
        });
    });

    describe('Input Validation and Error Handling', () => {
        it('should reject requests without brief', async () => {
            const invalidData = {
                ageRange: { min: 25, max: 35 },
                location: 'Paris'
            };

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(invalidData)
            });

            const response = await POST(request);
            const responseData = await response.json();

            expect(response.status).toBe(400);
            expect(responseData.error).toBe('Brief marketing requis');
        });

        it('should reject requests with empty brief', async () => {
            const emptyBriefData = {
                ...validBriefFormData,
                brief: ''
            };

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(emptyBriefData)
            });

            const response = await POST(request);
            const responseData = await response.json();

            expect(response.status).toBe(400);
            expect(responseData.error).toBe('Brief marketing requis');
        });

        it('should handle unauthenticated requests', async () => {
            (getAuthenticatedUser as any).mockResolvedValue(null);

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(validBriefFormData)
            });

            const response = await POST(request);
            const responseData = await response.json();

            expect(response.status).toBe(401);
            expect(responseData.error).toBe('Authentification requise');
        });

        it('should handle persona limit exceeded', async () => {
            (permissionService.checkPersonaLimit as any).mockResolvedValue(false);

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(validBriefFormData)
            });

            const response = await POST(request);
            const responseData = await response.json();

            expect(response.status).toBe(403);
            expect(responseData.error).toBe('Limite de personas atteinte pour votre plan.');
        });

        it('should handle generation errors gracefully', async () => {
            mockQlooFirstGeneratorInstance.generatePersonas.mockRejectedValue(new Error('Generation failed'));

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(validBriefFormData)
            });

            const response = await POST(request);
            const responseData = await response.json();

            expect(response.status).toBe(500);
            expect(responseData.success).toBe(false);
            expect(responseData.error).toBe('Erreur interne du serveur');
            expect(responseData.generation.source).toBe('error');
        });
    });

    describe('Feature Flag Integration', () => {
        it('should respect debug mode feature flag', async () => {
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

            expect(responseData.featureFlags.debugMode).toBe(true);
        });

        it('should respect fallback disabled feature flag', async () => {
            (featureFlagService.shouldFallbackOnError as any).mockReturnValue(false);

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(validBriefFormData)
            });

            const response = await POST(request);
            const responseData = await response.json();

            expect(QlooFirstPersonaGenerator).toHaveBeenCalledWith({
                enableFallback: false,
                debugMode: false
            });

            expect(responseData.featureFlags.fallbackEnabled).toBe(false);
        });

        it('should include all feature flag states in response', async () => {
            (featureFlagService.isQlooFirstEnabled as any).mockReturnValue(true);
            (featureFlagService.shouldFallbackOnError as any).mockReturnValue(true);
            (featureFlagService.isDebugModeEnabled as any).mockReturnValue(false);

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(validBriefFormData)
            });

            const response = await POST(request);
            const responseData = await response.json();

            expect(responseData.featureFlags).toEqual({
                qlooFirstEnabled: true,
                fallbackEnabled: true,
                debugMode: false
            });
        });
    });

    describe('Response Format and Metadata', () => {
        it('should include comprehensive metadata in successful response', async () => {
            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(validBriefFormData)
            });

            const response = await POST(request);
            const responseData = await response.json();

            expect(responseData).toHaveProperty('success', true);
            expect(responseData).toHaveProperty('personas');
            expect(responseData).toHaveProperty('timestamp');
            expect(responseData).toHaveProperty('generation');
            expect(responseData).toHaveProperty('sources');
            expect(responseData).toHaveProperty('culturalConstraints');
            expect(responseData).toHaveProperty('performance');
            expect(responseData).toHaveProperty('featureFlags');

            // Verify timestamp format
            expect(new Date(responseData.timestamp)).toBeInstanceOf(Date);

            // Verify generation metadata structure
            expect(responseData.generation).toEqual({
                source: 'qloo-first',
                method: 'qloo-first',
                processingTime: expect.any(Number),
                personaCount: expect.any(Number),
                requestedCount: expect.any(Number)
            });

            // Verify sources tracking
            expect(responseData.sources).toEqual({
                gemini: true,
                qloo: true,
                culturalData: 'qloo'
            });
        });

        it('should track persona count accurately', async () => {
            const customResult = {
                ...mockQlooFirstResult,
                personas: [mockPersonas[0]] // Only one persona
            };

            mockQlooFirstGeneratorInstance.generatePersonas.mockResolvedValue(customResult);

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(validBriefFormData)
            });

            const response = await POST(request);
            const responseData = await response.json();

            expect(responseData.generation.personaCount).toBe(1);
            expect(responseData.generation.requestedCount).toBe(3);
        });
    });

    describe('Edge Cases and Boundary Conditions', () => {
        it('should handle minimum valid BriefFormData', async () => {
            const minimalBriefData: BriefFormData = {
                brief: 'Simple brief',
                ageRange: { min: 18, max: 80 },
                location: '',
                language: 'fr',
                personaCount: 1,
                interests: [],
                values: []
            };

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(minimalBriefData)
            });

            const response = await POST(request);
            const responseData = await response.json();

            expect(response.status).toBe(200);
            expect(responseData.success).toBe(true);
            expect(mockQlooFirstGeneratorInstance.generatePersonas).toHaveBeenCalledWith(minimalBriefData);
        });

        it('should handle maximum persona count', async () => {
            const maxPersonaBrief = {
                ...validBriefFormData,
                personaCount: 5
            };

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(maxPersonaBrief)
            });

            const response = await POST(request);

            expect(response.status).toBe(200);
            expect(mockQlooFirstGeneratorInstance.generatePersonas).toHaveBeenCalledWith(maxPersonaBrief);
        });

        it('should handle different language settings', async () => {
            const englishBrief = {
                ...validBriefFormData,
                language: 'en' as const
            };

            const request = new NextRequest('http://localhost:3000/api/generate-personas', {
                method: 'POST',
                body: JSON.stringify(englishBrief)
            });

            const response = await POST(request);

            expect(response.status).toBe(200);
            expect(mockQlooFirstGeneratorInstance.generatePersonas).toHaveBeenCalledWith(englishBrief);
        });
    });
});