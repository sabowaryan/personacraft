import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QlooSignalExtractor } from './qloo-signal-extractor';
import { PREDEFINED_INTERESTS, PREDEFINED_VALUES } from '@/data/form-constants';
import { BriefFormData } from '@/components/forms/BriefForm';
import { QlooSignals, CulturalConstraints, QlooFirstError } from '@/types/qloo-first';

// Mock the entire enrichment module
vi.mock('@/lib/api/qloo/enrichment', () => ({
  PersonaEnrichment: vi.fn().mockImplementation(() => ({
    enrichPersonas: vi.fn().mockResolvedValue([
      {
        name: 'Test Persona',
        age: 25,
        culturalData: {
          music: ['Pop', 'Rock', 'Jazz'],
          movies: ['Action', 'Comedy', 'Drama'],
          tv: ['Series A', 'Series B', 'Series C'],
          books: ['Book 1', 'Book 2', 'Book 3'],
          brands: ['Brand A', 'Brand B', 'Brand C', 'Brand D'],
          restaurants: ['Restaurant 1', 'Restaurant 2', 'Restaurant 3'],
          travel: ['Paris', 'Tokyo', 'New York'],
          fashion: ['Fashion A', 'Fashion B', 'Fashion C'],
          beauty: ['Beauty A', 'Beauty B', 'Beauty C'],
          food: ['Food A', 'Food B', 'Food C'],
          socialMedia: ['Instagram', 'TikTok', 'Twitter']
        },
        socialMediaInsights: {
          insights: ['Insight 1', 'Insight 2'],
          platforms: ['Instagram', 'TikTok', 'Twitter']
        }
      }
    ]),
    fetchData: vi.fn().mockImplementation((entityType: string) => {
      const mockData: Record<string, string[]> = {
        music: ['Pop', 'Rock', 'Jazz'],
        movie: ['Action', 'Comedy', 'Drama'],
        tv: ['Series A', 'Series B', 'Series C'],
        book: ['Book 1', 'Book 2', 'Book 3'],
        brand: ['Brand A', 'Brand B', 'Brand C', 'Brand D'],
        restaurant: ['Restaurant 1', 'Restaurant 2', 'Restaurant 3'],
        travel: ['Paris', 'Tokyo', 'New York'],
        fashion: ['Fashion A', 'Fashion B', 'Fashion C'],
        beauty: ['Beauty A', 'Beauty B', 'Beauty C'],
        food: ['Food A', 'Food B', 'Food C']
      };
      return Promise.resolve(mockData[entityType] || []);
    })
  }))
}));

// Mock the RequestHandler class
vi.mock('@/lib/api/qloo/request-handler', () => ({
  RequestHandler: vi.fn().mockImplementation(() => ({
    makeRequestWithRetry: vi.fn().mockResolvedValue(['Mock Data']),
    getCachedData: vi.fn().mockReturnValue(null),
    setCachedData: vi.fn()
  }))
}));

// Mock the social media module
vi.mock('@/lib/api/qloo/social-media', () => ({
  enrichSocialMediaWithQloo: vi.fn().mockResolvedValue({
    platforms: ['Instagram', 'TikTok', 'Twitter'],
    insights: ['Insight 1', 'Insight 2']
  })
}));

// Mock the fallback module
vi.mock('@/lib/api/qloo/fallback', () => ({
  getFallbackDataForType: vi.fn().mockImplementation((entityType: string) => {
    const fallbackData: Record<string, string[]> = {
      music: ['Pop Fallback', 'Rock Fallback'],
      movie: ['Action Fallback', 'Comedy Fallback'],
      tv: ['TV Fallback 1', 'TV Fallback 2'],
      book: ['Book Fallback 1', 'Book Fallback 2'],
      brand: ['Brand Fallback 1', 'Brand Fallback 2'],
      restaurant: ['Restaurant Fallback 1', 'Restaurant Fallback 2'],
      travel: ['Travel Fallback 1', 'Travel Fallback 2'],
      fashion: ['Fashion Fallback 1', 'Fashion Fallback 2'],
      beauty: ['Beauty Fallback 1', 'Beauty Fallback 2'],
      food: ['Food Fallback 1', 'Food Fallback 2']
    };
    return fallbackData[entityType] || ['Fallback Data'];
  }),
  getFallbackPersonaEnrichment: vi.fn(),
  getFallbackEnrichment: vi.fn()
}));

describe('QlooSignalExtractor - Interest and Value Mapping', () => {
    let extractor: QlooSignalExtractor;

    beforeEach(() => {
        extractor = new QlooSignalExtractor();
    });

    describe('mapInterestsToQlooCategories', () => {
        it('should map predefined interests to correct Qloo categories', () => {
            const interests = ['Sport et fitness', 'Technologie', 'Voyage'];
            const result = extractor.mapInterestsToQlooCategories(interests);

            expect(result).toContain('fitness');
            expect(result).toContain('sports');
            expect(result).toContain('health');
            expect(result).toContain('technology');
            expect(result).toContain('innovation');
            expect(result).toContain('gadgets');
            expect(result).toContain('travel');
            expect(result).toContain('adventure');
            expect(result).toContain('culture');
        });

        it('should handle custom interests by normalizing them', () => {
            const customInterests = ['Custom Interest', 'Another Custom', 'Special Hobby'];
            const result = extractor.mapInterestsToQlooCategories(customInterests);

            expect(result).toContain('custom_interest');
            expect(result).toContain('another_custom');
            expect(result).toContain('special_hobby');
        });

        it('should handle empty interests array', () => {
            const result = extractor.mapInterestsToQlooCategories([]);
            expect(result).toEqual([]);
        });
    });

    describe('mapValuesToQlooSignals', () => {
        it('should map predefined values to correct Qloo signals', () => {
            const values = ['Authenticité', 'Innovation', 'Durabilité'];
            const result = extractor.mapValuesToQlooSignals(values);

            expect(result).toHaveProperty('signal.values.authentic_brands', 'true');
            expect(result).toHaveProperty('signal.values.innovative_products', 'true');
            expect(result).toHaveProperty('signal.values.sustainable_brands', 'true');
        });

        it('should handle custom values by normalizing them', () => {
            const customValues = ['Custom Value', 'Another Custom', 'Special Value'];
            const result = extractor.mapValuesToQlooSignals(customValues);

            expect(result).toHaveProperty('signal.values.custom_value', 'true');
            expect(result).toHaveProperty('signal.values.another_custom', 'true');
            expect(result).toHaveProperty('signal.values.special_value', 'true');
        });

        it('should handle empty values array', () => {
            const result = extractor.mapValuesToQlooSignals([]);
            expect(result).toEqual({});
        });
    });
});

describe('QlooSignalExtractor - Signal Extraction', () => {
    let extractor: QlooSignalExtractor;

    beforeEach(() => {
        extractor = new QlooSignalExtractor();
    });

    describe('extractSignals', () => {
        it('should extract basic signals from BriefFormData', () => {
            const briefFormData: BriefFormData = {
                brief: 'Looking for young professionals in tech',
                ageRange: { min: 25, max: 35 },
                location: 'Paris, France',
                language: 'fr',
                personaCount: 3,
                interests: ['Technologie', 'Voyage'],
                values: ['Innovation', 'Qualité']
            };

            const signals = extractor.extractSignals(briefFormData);

            expect(signals.demographics.ageRange).toEqual({ min: 25, max: 35 });
            expect(signals.demographics.location).toBe('Paris, France');
            expect(signals.interests).toEqual(['Technologie', 'Voyage']);
            expect(signals.values).toEqual(['Innovation', 'Qualité']);
            expect(signals.culturalContext.language).toBe('fr');
            expect(signals.culturalContext.personaCount).toBe(3);
        });

        it('should extract occupation from brief text', () => {
            const briefFormData: BriefFormData = {
                brief: 'We need personas for software developers and designers',
                ageRange: { min: 25, max: 35 },
                location: 'Paris',
                language: 'fr',
                personaCount: 2,
                interests: [],
                values: []
            };

            const signals = extractor.extractSignals(briefFormData);

            expect(signals.demographics.occupation).toBeDefined();
            expect(['développeur', 'developer', 'designer'].some(occ => 
                signals.demographics.occupation?.toLowerCase().includes(occ)
            )).toBe(true);
        });

        it('should validate age range constraints', () => {
            const briefFormData: BriefFormData = {
                brief: 'Test brief',
                ageRange: { min: 15, max: 25 }, // Invalid: min < 18
                location: 'Paris',
                language: 'fr',
                personaCount: 2,
                interests: [],
                values: []
            };

            expect(() => extractor.extractSignals(briefFormData)).toThrow('Age range must be between 18 and 80');
        });

        it('should validate persona count constraints', () => {
            const briefFormData: BriefFormData = {
                brief: 'Test brief',
                ageRange: { min: 25, max: 35 },
                location: 'Paris',
                language: 'fr',
                personaCount: 10, // Invalid: > 5
                interests: [],
                values: []
            };

            expect(() => extractor.extractSignals(briefFormData)).toThrow('Persona count must be between 1 and 5');
        });

        it('should validate required location', () => {
            const briefFormData: BriefFormData = {
                brief: 'Test brief',
                ageRange: { min: 25, max: 35 },
                location: '', // Invalid: empty location
                language: 'fr',
                personaCount: 2,
                interests: [],
                values: []
            };

            expect(() => extractor.extractSignals(briefFormData)).toThrow('Location is required');
        });
    });
});

describe('QlooSignalExtractor - Cultural Data Fetching', () => {
    let extractor: QlooSignalExtractor;

    beforeEach(() => {
        extractor = new QlooSignalExtractor();
        // Mock console methods to avoid noise in tests
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('fetchCulturalData', () => {
        it('should return cultural constraints with all required categories', async () => {
            const signals: QlooSignals = {
                demographics: {
                    ageRange: { min: 25, max: 35 },
                    location: 'Paris, France',
                    occupation: 'developer'
                },
                interests: ['Technologie', 'Voyage'],
                values: ['Innovation', 'Qualité'],
                culturalContext: {
                    language: 'fr',
                    personaCount: 2
                }
            };

            const constraints = await extractor.fetchCulturalData(signals);

            // Verify all required categories are present
            expect(constraints).toHaveProperty('music');
            expect(constraints).toHaveProperty('brands');
            expect(constraints).toHaveProperty('movies');
            expect(constraints).toHaveProperty('tv');
            expect(constraints).toHaveProperty('books');
            expect(constraints).toHaveProperty('restaurants');
            expect(constraints).toHaveProperty('travel');
            expect(constraints).toHaveProperty('fashion');
            expect(constraints).toHaveProperty('beauty');
            expect(constraints).toHaveProperty('food');
            expect(constraints).toHaveProperty('socialMedia');

            // Verify each category has data (either from API or fallback)
            Object.values(constraints).forEach(categoryData => {
                expect(Array.isArray(categoryData)).toBe(true);
                expect(categoryData.length).toBeGreaterThan(0);
            });
        });

        it('should handle different age ranges correctly', async () => {
            const genZSignals: QlooSignals = {
                demographics: {
                    ageRange: { min: 18, max: 25 },
                    location: 'Paris'
                },
                interests: [],
                values: [],
                culturalContext: {
                    language: 'fr',
                    personaCount: 1
                }
            };

            const millennialSignals: QlooSignals = {
                demographics: {
                    ageRange: { min: 26, max: 40 },
                    location: 'Paris'
                },
                interests: [],
                values: [],
                culturalContext: {
                    language: 'fr',
                    personaCount: 1
                }
            };

            const genZConstraints = await extractor.fetchCulturalData(genZSignals);
            const millennialConstraints = await extractor.fetchCulturalData(millennialSignals);

            // Both should have data, but potentially different based on age
            expect(genZConstraints.socialMedia.length).toBeGreaterThan(0);
            expect(millennialConstraints.socialMedia.length).toBeGreaterThan(0);
        });

        it('should handle API failures gracefully with fallback data', async () => {
            // Mock the QlooClient to simulate API failure
            const mockQlooClient = {
                enrichment: {
                    fetchData: vi.fn().mockRejectedValue(new Error('API Error'))
                }
            };
            (extractor as any).qlooClient = mockQlooClient;

            const signals: QlooSignals = {
                demographics: {
                    ageRange: { min: 25, max: 35 },
                    location: 'Paris'
                },
                interests: ['Technologie'],
                values: ['Innovation'],
                culturalContext: {
                    language: 'fr',
                    personaCount: 2
                }
            };

            const constraints = await extractor.fetchCulturalData(signals);

            // Should still return data (fallback)
            expect(constraints.music.length).toBeGreaterThan(0);
            expect(constraints.brands.length).toBeGreaterThan(0);
        });

        it('should handle different languages correctly', async () => {
            const frenchSignals: QlooSignals = {
                demographics: {
                    ageRange: { min: 25, max: 35 },
                    location: 'Paris'
                },
                interests: [],
                values: [],
                culturalContext: {
                    language: 'fr',
                    personaCount: 1
                }
            };

            const englishSignals: QlooSignals = {
                demographics: {
                    ageRange: { min: 25, max: 35 },
                    location: 'London'
                },
                interests: [],
                values: [],
                culturalContext: {
                    language: 'en',
                    personaCount: 1
                }
            };

            const frenchConstraints = await extractor.fetchCulturalData(frenchSignals);
            const englishConstraints = await extractor.fetchCulturalData(englishSignals);

            // Both should have data
            expect(frenchConstraints.music.length).toBeGreaterThan(0);
            expect(englishConstraints.music.length).toBeGreaterThan(0);
        });

        it('should include social media data appropriate for age demographics', async () => {
            const youngSignals: QlooSignals = {
                demographics: {
                    ageRange: { min: 18, max: 25 },
                    location: 'Paris'
                },
                interests: [],
                values: [],
                culturalContext: {
                    language: 'fr',
                    personaCount: 1
                }
            };

            const constraints = await extractor.fetchCulturalData(youngSignals);

            // Should have social media data
            expect(constraints.socialMedia.length).toBeGreaterThan(0);
            expect(Array.isArray(constraints.socialMedia)).toBe(true);
        });

        it('should handle occupation-specific data when available', async () => {
            const signals: QlooSignals = {
                demographics: {
                    ageRange: { min: 25, max: 35 },
                    location: 'Paris',
                    occupation: 'software developer'
                },
                interests: ['Technologie'],
                values: ['Innovation'],
                culturalContext: {
                    language: 'fr',
                    personaCount: 1
                }
            };

            const constraints = await extractor.fetchCulturalData(signals);

            // Should return data for all categories
            expect(constraints.music.length).toBeGreaterThan(0);
            expect(constraints.brands.length).toBeGreaterThan(0);
            expect(constraints.movies.length).toBeGreaterThan(0);
        });

        it('should apply intelligent fallback mechanisms when data is sparse', async () => {
            const signals: QlooSignals = {
                demographics: {
                    ageRange: { min: 25, max: 35 },
                    location: 'Remote Location'
                },
                interests: [],
                values: [],
                culturalContext: {
                    language: 'fr',
                    personaCount: 1
                }
            };

            const constraints = await extractor.fetchCulturalData(signals);

            // Should still return meaningful data through fallback mechanisms
            expect(constraints.music.length).toBeGreaterThan(0);
            expect(constraints.brands.length).toBeGreaterThan(0);
            expect(constraints.socialMedia.length).toBeGreaterThan(0);
        });
    });
});