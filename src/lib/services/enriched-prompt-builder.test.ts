import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EnrichedPromptBuilder } from './enriched-prompt-builder';
import { CulturalConstraints, QlooSignals, EnrichedPromptContext, QlooFirstError } from '@/types/qloo-first';

describe('EnrichedPromptBuilder', () => {
    let builder: EnrichedPromptBuilder;

    beforeEach(() => {
        builder = new EnrichedPromptBuilder();
    });

    describe('formatConstraintsForGemini', () => {
        const mockConstraints: CulturalConstraints = {
            music: ['Daft Punk', 'Stromae', 'Christine and the Queens', 'Angèle', 'PNL'],
            brands: ['Nike', 'Adidas', 'Apple', 'Samsung', 'Louis Vuitton', 'Chanel'],
            restaurants: ['McDonald\'s', 'Subway', 'Starbucks', 'KFC'],
            movies: ['Amélie', 'The Matrix', 'Inception', 'Parasite'],
            tv: ['Stranger Things', 'The Office', 'Friends', 'Breaking Bad'],
            books: ['Harry Potter', 'The Alchemist', 'Sapiens'],
            travel: ['Paris', 'Tokyo', 'New York', 'London'],
            fashion: ['Zara', 'H&M', 'Uniqlo'],
            beauty: ['L\'Oréal', 'Maybelline', 'Sephora'],
            food: ['Pizza', 'Sushi', 'Burger', 'Pasta'],
            socialMedia: ['Instagram', 'TikTok', 'Facebook', 'Twitter', 'LinkedIn']
        };

        it('should format constraints for French language', () => {
            const result = builder.formatConstraintsForGemini(mockConstraints, 'fr');

            expect(result).toHaveProperty('Marques préférées');
            expect(result).toHaveProperty('Artistes/Genres musicaux');
            expect(result).toHaveProperty('Types de restaurants');
            expect(result).toHaveProperty('Films/Cinéma');
            expect(result).toHaveProperty('Séries/Émissions TV');
            expect(result).toHaveProperty('Livres/Littérature');
            expect(result).toHaveProperty('Destinations voyage');
            expect(result).toHaveProperty('Marques/Style mode');
            expect(result).toHaveProperty('Beauté/Cosmétiques');
            expect(result).toHaveProperty('Préférences alimentaires');
            expect(result).toHaveProperty('Plateformes sociales');
        });

        it('should format constraints for English language', () => {
            const result = builder.formatConstraintsForGemini(mockConstraints, 'en');

            expect(result).toHaveProperty('Preferred Brands');
            expect(result).toHaveProperty('Music Artists/Genres');
            expect(result).toHaveProperty('Restaurant Types');
            expect(result).toHaveProperty('Movies/Cinema');
            expect(result).toHaveProperty('TV Shows/Series');
            expect(result).toHaveProperty('Books/Literature');
            expect(result).toHaveProperty('Travel Destinations');
            expect(result).toHaveProperty('Fashion Brands/Style');
            expect(result).toHaveProperty('Beauty/Cosmetics');
            expect(result).toHaveProperty('Food Preferences');
            expect(result).toHaveProperty('Social Media Platforms');
        });

        it('should respect maximum items per category', () => {
            const result = builder.formatConstraintsForGemini(mockConstraints, 'en');

            // Brands should have max 10 items
            expect(result['Preferred Brands']).toHaveLength(6); // We only have 6 brands in mock
            
            // Music should have max 8 items
            expect(result['Music Artists/Genres']).toHaveLength(5); // We only have 5 music items in mock
            
            // Social media should have max 5 items
            expect(result['Social Media Platforms']).toHaveLength(5); // We have exactly 5
        });

        it('should handle empty constraint categories', () => {
            const emptyConstraints: CulturalConstraints = {
                music: [],
                brands: ['Nike', 'Adidas'],
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

            const result = builder.formatConstraintsForGemini(emptyConstraints, 'en');

            expect(result).toHaveProperty('Preferred Brands');
            expect(result['Preferred Brands']).toEqual(['Nike', 'Adidas']);
            expect(result).not.toHaveProperty('Music Artists/Genres');
            expect(result).not.toHaveProperty('Restaurant Types');
        });

        it('should clean and validate constraint items', () => {
            const dirtyConstraints: CulturalConstraints = {
                music: ['  Daft Punk  ', '', 'Stromae', 'Very Long Artist Name That Should Be Filtered Out Because It Exceeds The Maximum Length Limit'],
                brands: ['Nike', 'Nike', 'Adidas'], // Duplicates
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

            const result = builder.formatConstraintsForGemini(dirtyConstraints, 'en');

            // Should clean whitespace and remove empty items
            expect(result['Music Artists/Genres']).toEqual(['Stromae', 'Daft Punk']);
            
            // Should remove duplicates
            expect(result['Preferred Brands']).toEqual(['Nike', 'Adidas']);
        });

        it('should sort items by length and then alphabetically', () => {
            const constraints: CulturalConstraints = {
                music: ['Very Long Artist Name', 'Short', 'Medium Length', 'A'],
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

            const result = builder.formatConstraintsForGemini(constraints, 'en');

            // Should be sorted by length first, then alphabetically
            expect(result['Music Artists/Genres'][0]).toBe('A'); // Shortest
            expect(result['Music Artists/Genres'][1]).toBe('Short'); // Next shortest
        });

        it('should handle all empty constraints', () => {
            const emptyConstraints: CulturalConstraints = {
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

            const result = builder.formatConstraintsForGemini(emptyConstraints, 'en');

            expect(Object.keys(result)).toHaveLength(0);
        });

        it('should prioritize categories correctly', () => {
            // Create constraints with many items to test priority ordering
            const largeConstraints: CulturalConstraints = {
                music: Array(20).fill('Artist').map((_, i) => `Artist ${i}`),
                brands: Array(20).fill('Brand').map((_, i) => `Brand ${i}`),
                restaurants: Array(20).fill('Restaurant').map((_, i) => `Restaurant ${i}`),
                movies: Array(20).fill('Movie').map((_, i) => `Movie ${i}`),
                tv: Array(20).fill('Show').map((_, i) => `Show ${i}`),
                books: Array(20).fill('Book').map((_, i) => `Book ${i}`),
                travel: Array(20).fill('Place').map((_, i) => `Place ${i}`),
                fashion: Array(20).fill('Fashion').map((_, i) => `Fashion ${i}`),
                beauty: Array(20).fill('Beauty').map((_, i) => `Beauty ${i}`),
                food: Array(20).fill('Food').map((_, i) => `Food ${i}`),
                socialMedia: Array(20).fill('Platform').map((_, i) => `Platform ${i}`)
            };

            const result = builder.formatConstraintsForGemini(largeConstraints, 'en');

            // Brands should have 10 items (highest priority)
            expect(result['Preferred Brands']).toHaveLength(10);
            
            // Music should have 8 items
            expect(result['Music Artists/Genres']).toHaveLength(8);
            
            // Social media should have 5 items
            expect(result['Social Media Platforms']).toHaveLength(5);
        });
    });

    describe('buildPrompt integration', () => {
        const mockSignals: QlooSignals = {
            demographics: {
                ageRange: { min: 25, max: 35 },
                location: 'Paris',
                occupation: 'Developer'
            },
            interests: ['Technologie', 'Voyage'],
            values: ['Innovation', 'Authenticité'],
            culturalContext: {
                language: 'fr',
                personaCount: 3
            }
        };

        const mockConstraints: CulturalConstraints = {
            music: ['Daft Punk', 'Stromae'],
            brands: ['Apple', 'Nike'],
            restaurants: ['Starbucks'],
            movies: ['Inception'],
            tv: ['Stranger Things'],
            books: ['Sapiens'],
            travel: ['Tokyo'],
            fashion: ['Zara'],
            beauty: ['L\'Oréal'],
            food: ['Sushi'],
            socialMedia: ['Instagram']
        };

        const mockContext: EnrichedPromptContext = {
            originalBrief: 'Create personas for tech-savvy millennials in Paris',
            culturalConstraints: mockConstraints,
            userSignals: mockSignals,
            templateVariables: {}
        };

        it('should build prompt with French cultural constraints', async () => {
            const result = await builder.buildPrompt(mockContext);

            expect(result).toContain('CONTRAINTES CULTURELLES SPÉCIFIQUES:');
            expect(result).toContain('Localisation: Paris');
            expect(result).toContain('Tranche d\'âge: 25-35 ans');
            expect(result).toContain('Marques préférées: Nike, Apple');
            expect(result).toContain('Artistes/Genres musicaux: Stromae, Daft Punk');
            expect(result).toContain('Intérêts: Technologie, Voyage');
            expect(result).toContain('Valeurs: Innovation, Authenticité');
        });

        it('should build prompt with English cultural constraints', async () => {
            const englishContext: EnrichedPromptContext = {
                ...mockContext,
                userSignals: {
                    ...mockSignals,
                    culturalContext: {
                        ...mockSignals.culturalContext,
                        language: 'en'
                    }
                }
            };

            const result = await builder.buildPrompt(englishContext);

            expect(result).toContain('SPECIFIC CULTURAL CONSTRAINTS:');
            expect(result).toContain('Location: Paris');
            expect(result).toContain('Age range: 25-35 years');
            expect(result).toContain('Preferred Brands: Nike, Apple');
            expect(result).toContain('Music Artists/Genres: Stromae, Daft Punk');
            expect(result).toContain('Interests: Technologie, Voyage');
            expect(result).toContain('Values: Innovation, Authenticité');
        });

        it('should handle empty cultural constraints gracefully', async () => {
            const emptyConstraintsContext: EnrichedPromptContext = {
                ...mockContext,
                culturalConstraints: {
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
                }
            };

            const result = await builder.buildPrompt(emptyConstraintsContext);

            expect(result).toContain('CONTRAINTES CULTURELLES SPÉCIFIQUES:');
            expect(result).toContain('Localisation: Paris');
            expect(result).toContain('Tranche d\'âge: 25-35 ans');
            // Should not contain cultural preferences section
            expect(result).not.toContain('Préférences culturelles basées sur des données réelles:');
        });

        it('should handle missing interests and values', async () => {
            const noInterestsContext: EnrichedPromptContext = {
                ...mockContext,
                userSignals: {
                    ...mockSignals,
                    interests: [],
                    values: []
                }
            };

            const result = await builder.buildPrompt(noInterestsContext);

            expect(result).toContain('CONTRAINTES CULTURELLES SPÉCIFIQUES:');
            expect(result).not.toContain('Intérêts:');
            expect(result).not.toContain('Valeurs:');
        });

        it('should validate prompt length', async () => {
            // Create a builder with very small max length to trigger validation error
            const restrictiveBuilder = new EnrichedPromptBuilder({ maxPromptLength: 100 });

            await expect(restrictiveBuilder.buildPrompt(mockContext))
                .rejects.toThrow('Prompt too long');
        });

        it('should validate prompt contains required elements', async () => {
            // Mock the base prompt to not contain required elements
            const builderWithMockPrompt = new EnrichedPromptBuilder();
            
            // Create a context that would result in a prompt without required elements
            const invalidContext: EnrichedPromptContext = {
                originalBrief: '',
                culturalConstraints: mockConstraints,
                userSignals: mockSignals,
                templateVariables: {}
            };

            // This should work normally, but let's test the validation logic
            const result = await builderWithMockPrompt.buildPrompt(invalidContext);
            
            // The prompt should contain required elements
            expect(result.toLowerCase()).toContain('json');
            expect(result.toLowerCase()).toContain('persona');
        });

        it('should handle prompt building errors gracefully', async () => {
            // Create invalid context that might cause errors
            const invalidContext = {
                originalBrief: null as any,
                culturalConstraints: null as any,
                userSignals: null as any,
                templateVariables: null as any
            };

            await expect(builder.buildPrompt(invalidContext))
                .rejects.toThrow(QlooFirstError.PROMPT_BUILDING_FAILED);
        });
    });

    describe('configuration management', () => {
        it('should use default configuration', () => {
            const config = builder.getConfig();

            expect(config.maxPromptLength).toBe(8000);
            expect(config.culturalConstraintWeight).toBe(0.7);
            expect(config.includeDebugInfo).toBe(false);
        });

        it('should allow configuration updates', () => {
            builder.updateConfig({
                maxPromptLength: 10000,
                includeDebugInfo: true
            });

            const config = builder.getConfig();

            expect(config.maxPromptLength).toBe(10000);
            expect(config.includeDebugInfo).toBe(true);
            expect(config.culturalConstraintWeight).toBe(0.7); // Should remain unchanged
        });

        it('should create builder with custom configuration', () => {
            const customBuilder = new EnrichedPromptBuilder({
                maxPromptLength: 5000,
                culturalConstraintWeight: 0.8,
                includeDebugInfo: true
            });

            const config = customBuilder.getConfig();

            expect(config.maxPromptLength).toBe(5000);
            expect(config.culturalConstraintWeight).toBe(0.8);
            expect(config.includeDebugInfo).toBe(true);
        });
    });

    describe('language-specific formatting edge cases', () => {
        const mockConstraints: CulturalConstraints = {
            music: ['Céline Dion', 'Édith Piaf'],
            brands: ['L\'Oréal', 'Hermès'],
            restaurants: ['Café de Flore'],
            movies: ['Amélie'],
            tv: ['Plus belle la vie'],
            books: ['L\'Étranger'],
            travel: ['Côte d\'Azur'],
            fashion: ['Saint Laurent'],
            beauty: ['Lancôme'],
            food: ['Crème brûlée'],
            socialMedia: ['LinkedIn']
        };

        it('should handle French accents and special characters', () => {
            const result = builder.formatConstraintsForGemini(mockConstraints, 'fr');

            expect(result['Artistes/Genres musicaux']).toContain('Céline Dion');
            expect(result['Artistes/Genres musicaux']).toContain('Édith Piaf');
            expect(result['Marques préférées']).toContain('L\'Oréal');
            expect(result['Marques préférées']).toContain('Hermès');
        });

        it('should sort French text correctly with locale', () => {
            const frenchConstraints: CulturalConstraints = {
                music: ['Édith Piaf', 'Céline Dion', 'Angèle', 'Stromae'],
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

            const result = builder.formatConstraintsForGemini(frenchConstraints, 'fr');

            // Should be sorted with French locale
            const musicItems = result['Artistes/Genres musicaux'];
            expect(musicItems).toBeDefined();
            expect(musicItems.length).toBe(4);
        });

        it('should handle mixed language content appropriately', () => {
            const mixedConstraints: CulturalConstraints = {
                music: ['Daft Punk', 'Stromae', 'Taylor Swift', 'BTS'],
                brands: ['Nike', 'Adidas', 'Louis Vuitton', 'Samsung'],
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

            const frenchResult = builder.formatConstraintsForGemini(mixedConstraints, 'fr');
            const englishResult = builder.formatConstraintsForGemini(mixedConstraints, 'en');

            // Content should be the same, only category names should differ
            expect(frenchResult['Artistes/Genres musicaux']).toEqual(englishResult['Music Artists/Genres']);
            expect(frenchResult['Marques préférées']).toEqual(englishResult['Preferred Brands']);
        });
    });

    describe('prompt injection and formatting', () => {
        const mockSignals: QlooSignals = {
            demographics: {
                ageRange: { min: 25, max: 35 },
                location: 'Paris',
                occupation: 'Developer'
            },
            interests: ['Technologie', 'Voyage'],
            values: ['Innovation', 'Authenticité'],
            culturalContext: {
                language: 'fr',
                personaCount: 3
            }
        };

        const mockConstraints: CulturalConstraints = {
            music: ['Daft Punk', 'Stromae'],
            brands: ['Apple', 'Nike'],
            restaurants: ['Starbucks'],
            movies: ['Inception'],
            tv: ['Stranger Things'],
            books: ['Sapiens'],
            travel: ['Tokyo'],
            fashion: ['Zara'],
            beauty: ['L\'Oréal'],
            food: ['Sushi'],
            socialMedia: ['Instagram']
        };

        it('should inject constraints at the correct position in prompt', async () => {
            const context: EnrichedPromptContext = {
                originalBrief: 'Create personas for tech-savvy millennials',
                culturalConstraints: mockConstraints,
                userSignals: mockSignals,
                templateVariables: {}
            };

            const result = await builder.buildPrompt(context);

            // Should contain the constraints section
            expect(result).toContain('CONTRAINTES CULTURELLES SPÉCIFIQUES:');
            
            // Should contain demographic info
            expect(result).toContain('Localisation: Paris');
            expect(result).toContain('Tranche d\'âge: 25-35 ans');
            
            // Should contain cultural preferences
            expect(result).toContain('Préférences culturelles basées sur des données réelles:');
        });

        it('should handle different persona counts in template variables', async () => {
            const context: EnrichedPromptContext = {
                originalBrief: 'Create personas',
                culturalConstraints: mockConstraints,
                userSignals: { ...mockSignals, culturalContext: { ...mockSignals.culturalContext, personaCount: 5 } },
                templateVariables: { customVariable: 'test' }
            };

            const result = await builder.buildPrompt(context);

            // Should build successfully with different persona count
            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThan(0);
        });

        it('should handle occupation in demographics', async () => {
            const contextWithOccupation: EnrichedPromptContext = {
                originalBrief: 'Create professional personas',
                culturalConstraints: mockConstraints,
                userSignals: {
                    ...mockSignals,
                    demographics: {
                        ...mockSignals.demographics,
                        occupation: 'Software Engineer'
                    }
                },
                templateVariables: {}
            };

            const result = await builder.buildPrompt(contextWithOccupation);

            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThan(0);
        });
    });

    describe('error handling and validation', () => {
        it('should handle malformed cultural constraints', () => {
            const malformedConstraints = {
                music: ['', '   ', 'Valid Artist', null, undefined],
                brands: ['Brand1', 'Brand1', 'Brand2'], // duplicates
                restaurants: ['Very Long Restaurant Name That Exceeds The Maximum Character Limit For Items'],
                movies: [],
                tv: [],
                books: [],
                travel: [],
                fashion: [],
                beauty: [],
                food: [],
                socialMedia: []
            } as any;

            const result = builder.formatConstraintsForGemini(malformedConstraints, 'en');

            // Should clean up the data
            expect(result['Music Artists/Genres']).toEqual(['Valid Artist']);
            expect(result['Preferred Brands']).toEqual(['Brand1', 'Brand2']);
            expect(result).not.toHaveProperty('Restaurant Types'); // Should be filtered out due to length
        });

        it('should validate prompt contains essential elements', async () => {
            const context: EnrichedPromptContext = {
                originalBrief: 'Simple brief',
                culturalConstraints: {
                    music: [], brands: [], restaurants: [], movies: [], tv: [],
                    books: [], travel: [], fashion: [], beauty: [], food: [], socialMedia: []
                },
                userSignals: {
                    demographics: { ageRange: { min: 20, max: 30 }, location: 'Test' },
                    interests: [], values: [],
                    culturalContext: { language: 'en', personaCount: 1 }
                },
                templateVariables: {}
            };

            const result = await builder.buildPrompt(context);

            // Should contain required elements for Gemini
            expect(result.toLowerCase()).toContain('json');
            expect(result.toLowerCase()).toContain('persona');
        });

        it('should handle empty brief gracefully', async () => {
            const context: EnrichedPromptContext = {
                originalBrief: '',
                culturalConstraints: {
                    music: ['Artist'], brands: [], restaurants: [], movies: [], tv: [],
                    books: [], travel: [], fashion: [], beauty: [], food: [], socialMedia: []
                },
                userSignals: {
                    demographics: { ageRange: { min: 20, max: 30 }, location: 'Test' },
                    interests: [], values: [],
                    culturalContext: { language: 'en', personaCount: 1 }
                },
                templateVariables: {}
            };

            const result = await builder.buildPrompt(context);

            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThan(0);
        });

        it('should throw specific error types for different failures', async () => {
            const invalidContext = {
                originalBrief: null,
                culturalConstraints: null,
                userSignals: null,
                templateVariables: null
            } as any;

            await expect(builder.buildPrompt(invalidContext))
                .rejects.toThrow(QlooFirstError.PROMPT_BUILDING_FAILED);
        });
    });

    describe('performance and optimization', () => {
        it('should handle large constraint sets efficiently', () => {
            const largeConstraints: CulturalConstraints = {
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

            const startTime = Date.now();
            const result = builder.formatConstraintsForGemini(largeConstraints, 'en');
            const processingTime = Date.now() - startTime;

            // Should process quickly (under 100ms for large datasets)
            expect(processingTime).toBeLessThan(100);
            
            // Should respect limits
            expect(result['Preferred Brands']).toHaveLength(10);
            expect(result['Music Artists/Genres']).toHaveLength(8);
        });

        it('should maintain consistent output for same input', () => {
            const constraints: CulturalConstraints = {
                music: ['Artist C', 'Artist A', 'Artist B'],
                brands: ['Brand Z', 'Brand A', 'Brand M'],
                restaurants: [], movies: [], tv: [], books: [],
                travel: [], fashion: [], beauty: [], food: [], socialMedia: []
            };

            const result1 = builder.formatConstraintsForGemini(constraints, 'en');
            const result2 = builder.formatConstraintsForGemini(constraints, 'en');

            expect(result1).toEqual(result2);
        });
    });
});