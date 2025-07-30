// Tests for enhanced persona types and utilities
// Verifies normalization, validation, and helper functions

import { describe, it, expect, beforeEach } from 'vitest';
import { 
    normalizePersona,
    calculateCulturalRichness,
    hasEnhancedMetadata,
    isQlooFirstPersona,
    isLegacyPersona,
    comparePersonas,
    generateMigrationSuggestion,
    METADATA_BADGE_CONFIG
} from '../persona-utils';
import { 
    batchNormalizePersonas,
    validateMetadataCompleteness
} from '../persona-normalization';
import { 
    validateEnhancedPersona,
    quickValidatePersona,
    validateMetadataPresence
} from '../persona-validation-helpers';
import { EnrichedPersona } from '@/types/enhanced-persona';
import { Persona } from '@/types';

describe('Enhanced Persona Utils', () => {
    let mockLegacyPersona: Partial<EnrichedPersona>;
    let mockQlooFirstPersona: EnrichedPersona;

    beforeEach(() => {
        mockLegacyPersona = {
            id: 'test-1',
            name: 'Test Persona',
            age: 30,
            occupation: 'Developer',
            location: 'Paris',
            bio: 'A test persona',
            quote: 'Testing is important',
            qualityScore: 75,
            createdAt: '2024-01-01T00:00:00Z',
            culturalData: {
                music: ['Rock', 'Jazz'],
                movies: ['Sci-fi'],
                tv: [],
                books: ['Tech books'],
                brands: ['Apple', 'Google'],
                restaurants: ['Italian'],
                travel: ['Europe'],
                fashion: [],
                beauty: [],
                food: ['Pizza'],
                socialMedia: ['Twitter'],
                podcasts: [],
                videoGames: [],
                influencers: []
            },
            demographics: { income: '50k', education: 'Bachelor', familyStatus: 'Single' },
            psychographics: { personality: ['Analytical'], values: ['Innovation'], interests: ['Technology'], lifestyle: 'Urban' },
            painPoints: ['Time management'],
            goals: ['Career growth'],
            marketingInsights: { preferredChannels: ['Digital'], messagingTone: 'Professional', buyingBehavior: 'Research-driven' }
        };

        mockQlooFirstPersona = {
            ...mockLegacyPersona,
            generationMetadata: {
                source: 'qloo-first',
                method: 'qloo-enhanced',
                culturalConstraintsUsed: ['music', 'brands'],
                processingTime: 1500,
                qlooDataUsed: true,
                templateUsed: 'standard-persona',
                generatedAt: '2024-01-01T00:00:00Z',
                qlooApiCallsCount: 3,
                retryCount: 0
            },
            validationMetadata: {
                templateName: 'standard-persona',
                validationScore: 85,
                validationDetails: [
                    {
                        rule: 'name-required',
                        passed: true,
                        score: 100,
                        message: 'Name is present',
                        category: 'format'
                    }
                ],
                failedRules: [],
                passedRules: ['name-required', 'age-valid'],
                validationTime: 100,
                validatedAt: '2024-01-01T00:00:00Z',
                overallStatus: 'passed',
                categoryScores: {
                    format: 90,
                    content: 85,
                    cultural: 80,
                    demographic: 85
                }
            }
        } as EnrichedPersona;
    });

    describe('normalizePersona', () => {
        it('should normalize a legacy persona with default metadata', () => {
            const normalized = normalizePersona(mockLegacyPersona);

            expect(normalized.id).toBe('test-1');
            expect(normalized.name).toBe('Test Persona');
            expect(normalized.generationMetadata).toBeDefined();
            expect(normalized.generationMetadata?.source).toBe('legacy-fallback');
            expect(normalized.validationMetadata).toBeDefined();
            expect(normalized.isLegacy).toBe(true);
            expect(normalized.culturalRichness).toBeDefined();
        });

        it('should preserve existing metadata for enhanced personas', () => {
            const normalized = normalizePersona(mockQlooFirstPersona);

            expect(normalized.generationMetadata?.source).toBe('qloo-first');
            expect(normalized.validationMetadata?.validationScore).toBe(85);
            expect(normalized.isLegacy).toBe(false);
        });

        it('should handle missing required fields gracefully', () => {
            const incompletePersona = { id: 'test-incomplete' };
            const normalized = normalizePersona(incompletePersona);

            expect(normalized.name).toBe('');
            expect(normalized.age).toBe(0);
            expect(normalized.occupation).toBe('');
            expect(normalized.culturalData).toBeDefined();
        });
    });

    describe('calculateCulturalRichness', () => {
        it('should return "high" for rich cultural data', () => {
            const richCulturalData = {
                music: ['Rock', 'Jazz', 'Classical', 'Pop', 'Hip-hop', 'Electronic', 'Country'],
                movies: ['Action', 'Drama', 'Comedy', 'Sci-fi', 'Horror', 'Romance'],
                tv: ['Series1', 'Series2', 'Series3', 'Series4', 'Series5'],
                books: ['Book1', 'Book2', 'Book3', 'Book4', 'Book5', 'Book6'],
                brands: ['Brand1', 'Brand2', 'Brand3', 'Brand4', 'Brand5', 'Brand6'],
                restaurants: ['Rest1', 'Rest2', 'Rest3', 'Rest4', 'Rest5'],
                travel: ['Country1', 'Country2', 'Country3', 'Country4'],
                fashion: ['Style1', 'Style2', 'Style3', 'Style4'],
                beauty: ['Product1', 'Product2', 'Product3'],
                food: ['Food1', 'Food2', 'Food3', 'Food4', 'Food5'],
                socialMedia: ['Platform1', 'Platform2', 'Platform3'],
                podcasts: ['Podcast1', 'Podcast2', 'Podcast3'],
                videoGames: ['Game1', 'Game2', 'Game3'],
                influencers: ['Influencer1', 'Influencer2', 'Influencer3']
            };

            const richness = calculateCulturalRichness(richCulturalData);
            expect(richness).toBe('high');
        });

        it('should return "medium" for moderate cultural data', () => {
            const moderateCulturalData = {
                music: ['Rock', 'Jazz', 'Pop', 'Classical'],
                movies: ['Action', 'Drama', 'Comedy'],
                tv: ['Series1', 'Series2'],
                books: ['Book1', 'Book2', 'Book3'],
                brands: ['Brand1', 'Brand2', 'Brand3'],
                restaurants: ['Rest1', 'Rest2'],
                travel: ['Country1', 'Country2'],
                fashion: ['Style1'],
                beauty: ['Product1'],
                food: ['Food1', 'Food2'],
                socialMedia: ['Platform1'],
                podcasts: ['Podcast1'],
                videoGames: [],
                influencers: []
            };

            const richness = calculateCulturalRichness(moderateCulturalData);
            expect(richness).toBe('medium');
        });

        it('should return "low" for sparse cultural data', () => {
            const sparseCulturalData = {
                music: ['Rock'],
                movies: [],
                tv: [],
                books: [],
                brands: ['Brand1'],
                restaurants: [],
                travel: [],
                fashion: [],
                beauty: [],
                food: [],
                socialMedia: [],
                podcasts: [],
                videoGames: [],
                influencers: []
            };

            const richness = calculateCulturalRichness(sparseCulturalData);
            expect(richness).toBe('low');
        });

        it('should return "low" for undefined cultural data', () => {
            const richness = calculateCulturalRichness(undefined);
            expect(richness).toBe('low');
        });
    });

    describe('Type Guards', () => {
        it('should correctly identify enhanced personas', () => {
            expect(hasEnhancedMetadata(mockQlooFirstPersona)).toBe(true);
            expect(hasEnhancedMetadata(mockLegacyPersona)).toBe(false);
        });

        it('should correctly identify Qloo First personas', () => {
            expect(isQlooFirstPersona(mockQlooFirstPersona)).toBe(true);
            
            const legacyNormalized = normalizePersona(mockLegacyPersona);
            expect(isQlooFirstPersona(legacyNormalized)).toBe(false);
        });

        it('should correctly identify legacy personas', () => {
            const legacyNormalized = normalizePersona(mockLegacyPersona);
            expect(isLegacyPersona(legacyNormalized)).toBe(true);
            expect(isLegacyPersona(mockQlooFirstPersona)).toBe(false);
        });
    });

    describe('comparePersonas', () => {
        it('should compare two personas correctly', () => {
            const persona1 = normalizePersona(mockLegacyPersona);
            const persona2 = mockQlooFirstPersona;

            const comparison = comparePersonas(persona1, persona2);

            expect(comparison.persona1).toBe(persona1);
            expect(comparison.persona2).toBe(persona2);
            expect(comparison.differences.generationMethod).toBe(true);
            expect(comparison.recommendations.length).toBeGreaterThan(0);
        });
    });

    describe('generateMigrationSuggestion', () => {
        it('should suggest migration for legacy personas', () => {
            const legacyNormalized = normalizePersona(mockLegacyPersona);
            const suggestion = generateMigrationSuggestion(legacyNormalized);

            expect(suggestion.currentStatus).toBe('needs-update');
            expect(suggestion.suggestedActions.length).toBeGreaterThan(0);
            expect(suggestion.priority).toBeDefined();
        });

        it('should suggest minimal actions for high-quality personas', () => {
            const suggestion = generateMigrationSuggestion(mockQlooFirstPersona);

            expect(suggestion.priority).toBe('low');
            expect(suggestion.suggestedActions.length).toBeLessThanOrEqual(2);
        });
    });
});

describe('Persona Normalization', () => {
    let mockLegacyPersona: Partial<EnrichedPersona>;
    let mockQlooFirstPersona: EnrichedPersona;

    beforeEach(() => {
        mockLegacyPersona = {
            id: 'test-1',
            name: 'Test Persona',
            age: 30,
            occupation: 'Developer',
            location: 'Paris',
            bio: 'A test persona',
            quote: 'Testing is important',
            qualityScore: 75,
            createdAt: '2024-01-01T00:00:00Z',
            culturalData: {
                music: ['Rock', 'Jazz'],
                movies: ['Sci-fi'],
                tv: [],
                books: ['Tech books'],
                brands: ['Apple', 'Google'],
                restaurants: ['Italian'],
                travel: ['Europe'],
                fashion: [],
                beauty: [],
                food: ['Pizza'],
                socialMedia: ['Twitter'],
                podcasts: [],
                videoGames: [],
                influencers: []
            },
            demographics: { income: '50k', education: 'Bachelor', familyStatus: 'Single' },
            psychographics: { personality: ['Analytical'], values: ['Innovation'], interests: ['Technology'], lifestyle: 'Urban' },
            painPoints: ['Time management'],
            goals: ['Career growth'],
            marketingInsights: { preferredChannels: ['Digital'], messagingTone: 'Professional', buyingBehavior: 'Research-driven' }
        };

        mockQlooFirstPersona = {
            ...mockLegacyPersona,
            generationMetadata: {
                source: 'qloo-first',
                method: 'qloo-enhanced',
                culturalConstraintsUsed: ['music', 'brands'],
                processingTime: 1500,
                qlooDataUsed: true,
                templateUsed: 'standard-persona',
                generatedAt: '2024-01-01T00:00:00Z',
                qlooApiCallsCount: 3,
                retryCount: 0
            },
            validationMetadata: {
                templateName: 'standard-persona',
                validationScore: 85,
                validationDetails: [
                    {
                        rule: 'name-required',
                        passed: true,
                        score: 100,
                        message: 'Name is present',
                        category: 'format'
                    }
                ],
                failedRules: [],
                passedRules: ['name-required', 'age-valid'],
                validationTime: 100,
                validatedAt: '2024-01-01T00:00:00Z',
                overallStatus: 'passed',
                categoryScores: {
                    format: 90,
                    content: 85,
                    cultural: 80,
                    demographic: 85
                }
            }
        } as EnrichedPersona;
    });

    describe('batchNormalizePersonas', () => {
        it('should normalize multiple personas successfully', () => {
            const personas = [
                { id: 'test-1', name: 'Persona 1', age: 25 },
                { id: 'test-2', name: 'Persona 2', age: 35 },
                { id: 'test-3', name: 'Persona 3', age: 45 }
            ];

            const result = batchNormalizePersonas(personas);

            expect(result.successCount).toBe(3);
            expect(result.errorCount).toBe(0);
            expect(result.successful).toHaveLength(3);
            expect(result.processingTime).toBeGreaterThan(0);
        });

        it('should handle errors gracefully in batch processing', () => {
            const personas = [
                { id: 'test-1', name: 'Valid Persona', age: 25 },
                null, // This should cause an error
                { id: 'test-3', name: 'Another Valid Persona', age: 35 }
            ];

            const result = batchNormalizePersonas(personas as any);

            expect(result.successCount).toBe(2);
            expect(result.errorCount).toBe(1);
            expect(result.errors).toHaveLength(1);
        });
    });

    describe('validateMetadataCompleteness', () => {
        it('should validate complete metadata', () => {
            const result = validateMetadataCompleteness(mockQlooFirstPersona);

            expect(result.isComplete).toBe(true);
            expect(result.missingFields).toHaveLength(0);
            expect(result.completenessScore).toBeGreaterThan(80);
        });

        it('should identify missing metadata', () => {
            const legacyNormalized = normalizePersona(mockLegacyPersona);
            const result = validateMetadataCompleteness(legacyNormalized);

            expect(result.completenessScore).toBeLessThan(100);
            expect(result.suggestions.length).toBeGreaterThan(0);
        });
    });
});

describe('Persona Validation Helpers', () => {
    let mockLegacyPersona: Partial<EnrichedPersona>;
    let mockQlooFirstPersona: EnrichedPersona;

    beforeEach(() => {
        mockLegacyPersona = {
            id: 'test-1',
            name: 'Test Persona',
            age: 30,
            occupation: 'Developer',
            location: 'Paris',
            bio: 'A test persona',
            quote: 'Testing is important',
            qualityScore: 75,
            createdAt: '2024-01-01T00:00:00Z',
            culturalData: {
                music: ['Rock', 'Jazz'],
                movies: ['Sci-fi'],
                tv: [],
                books: ['Tech books'],
                brands: ['Apple', 'Google'],
                restaurants: ['Italian'],
                travel: ['Europe'],
                fashion: [],
                beauty: [],
                food: ['Pizza'],
                socialMedia: ['Twitter'],
                podcasts: [],
                videoGames: [],
                influencers: []
            },
            demographics: { income: '50k', education: 'Bachelor', familyStatus: 'Single' },
            psychographics: { personality: ['Analytical'], values: ['Innovation'], interests: ['Technology'], lifestyle: 'Urban' },
            painPoints: ['Time management'],
            goals: ['Career growth'],
            marketingInsights: { preferredChannels: ['Digital'], messagingTone: 'Professional', buyingBehavior: 'Research-driven' }
        };

        mockQlooFirstPersona = {
            ...mockLegacyPersona,
            generationMetadata: {
                source: 'qloo-first',
                method: 'qloo-enhanced',
                culturalConstraintsUsed: ['music', 'brands'],
                processingTime: 1500,
                qlooDataUsed: true,
                templateUsed: 'standard-persona',
                generatedAt: '2024-01-01T00:00:00Z',
                qlooApiCallsCount: 3,
                retryCount: 0
            },
            validationMetadata: {
                templateName: 'standard-persona',
                validationScore: 85,
                validationDetails: [
                    {
                        rule: 'name-required',
                        passed: true,
                        score: 100,
                        message: 'Name is present',
                        category: 'format'
                    }
                ],
                failedRules: [],
                passedRules: ['name-required', 'age-valid'],
                validationTime: 100,
                validatedAt: '2024-01-01T00:00:00Z',
                overallStatus: 'passed',
                categoryScores: {
                    format: 90,
                    content: 85,
                    cultural: 80,
                    demographic: 85
                }
            }
        } as EnrichedPersona;
    });

    describe('validateEnhancedPersona', () => {
        it('should validate a complete persona successfully', () => {
            const result = validateEnhancedPersona(mockQlooFirstPersona);

            expect(result.isValid).toBe(true);
            expect(result.score).toBeGreaterThan(70);
            expect(result.categories.metadata.passed).toBe(true);
            expect(result.categories.content.passed).toBe(true);
        });

        it('should identify validation issues', () => {
            const incompletePersona = normalizePersona({
                id: 'test-incomplete',
                name: '',
                age: -5
            });

            const result = validateEnhancedPersona(incompletePersona);

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.score).toBeLessThan(70);
        });
    });

    describe('quickValidatePersona', () => {
        it('should quickly validate complete personas', () => {
            expect(quickValidatePersona(mockQlooFirstPersona)).toBe(true);
        });

        it('should quickly identify incomplete personas', () => {
            const incompletePersona = normalizePersona({
                id: 'test-incomplete'
            });

            expect(quickValidatePersona(incompletePersona)).toBe(false);
        });
    });

    describe('validateMetadataPresence', () => {
        it('should detect metadata presence correctly', () => {
            const result = validateMetadataPresence(mockQlooFirstPersona);

            expect(result.hasGenerationMetadata).toBe(true);
            expect(result.hasValidationMetadata).toBe(true);
            expect(result.isComplete).toBe(true);
            expect(result.missingMetadata).toHaveLength(0);
        });

        it('should detect missing metadata', () => {
            const legacyNormalized = normalizePersona(mockLegacyPersona);
            // Remove metadata to test detection
            delete (legacyNormalized as any).generationMetadata;
            delete (legacyNormalized as any).validationMetadata;

            const result = validateMetadataPresence(legacyNormalized);

            expect(result.hasGenerationMetadata).toBe(false);
            expect(result.hasValidationMetadata).toBe(false);
            expect(result.isComplete).toBe(false);
            expect(result.missingMetadata).toContain('generationMetadata');
            expect(result.missingMetadata).toContain('validationMetadata');
        });
    });
});

describe('Metadata Badge Config', () => {
    it('should have all required badge configurations', () => {
        expect(METADATA_BADGE_CONFIG['qloo-first']).toBeDefined();
        expect(METADATA_BADGE_CONFIG['legacy-fallback']).toBeDefined();
        expect(METADATA_BADGE_CONFIG['high-validation']).toBeDefined();
        expect(METADATA_BADGE_CONFIG['low-validation']).toBeDefined();

        // Check required properties
        Object.values(METADATA_BADGE_CONFIG).forEach(config => {
            expect(config.bg).toBeDefined();
            expect(config.text).toBeDefined();
            expect(config.icon).toBeDefined();
            expect(config.label).toBeDefined();
            expect(config.description).toBeDefined();
        });
    });
});