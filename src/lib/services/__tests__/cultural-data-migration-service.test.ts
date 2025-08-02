import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CulturalDataMigrationService } from '../cultural-data-migration-service';
import { Persona, CulturalData, SocialMediaInsights } from '@/types';
import { CulturalInsights } from '@/types/cultural-insights';

describe('CulturalDataMigrationService', () => {
    let migrationService: CulturalDataMigrationService;
    let mockPersona: Persona;

    beforeEach(() => {
        migrationService = new CulturalDataMigrationService();

        mockPersona = {
            id: 'test-persona-1',
            name: 'Test Persona',
            age: 28,
            occupation: 'Software Developer',
            location: 'San Francisco',
            bio: 'A tech-savvy professional',
            quote: 'Innovation is key',
            demographics: {
                income: 'High',
                education: 'Bachelor\'s degree',
                familyStatus: 'Single'
            },
            psychographics: {
                interests: ['technology', 'music', 'travel'],
                values: ['innovation', 'sustainability'],
                lifestyle: 'Urban professional',
                personality: ['Analytical', 'Creative']
            },
            culturalData: {
                music: ['Spotify', 'Apple Music', 'SoundCloud'],
                movie: ['Netflix', 'Marvel Movies', 'Sci-Fi'],
                tv: ['Breaking Bad', 'Black Mirror', 'The Office'],
                book: ['Sci-Fi Novels', 'Tech Books', 'Biographies'],
                brand: ['Apple', 'Google', 'Tesla'],
                restaurant: ['Sushi', 'Italian', 'Vegan'],
                travel: ['Japan', 'Europe', 'Tech Conferences'],
                fashion: ['Minimalist', 'Tech Wear', 'Sustainable'],
                beauty: ['Natural Products', 'Skincare'],
                food: ['Organic', 'Plant-based', 'International'],
                socialMedia: ['Instagram', 'Twitter', 'LinkedIn']
            },
            painPoints: ['Work-life balance', 'Information overload'],
            goals: ['Career advancement', 'Travel more'],
            marketingInsights: {
                preferredChannels: ['Digital', 'Social Media'],
                messagingTone: 'Professional yet friendly',
                buyingBehavior: 'Research-driven'
            },
            qualityScore: 85,
            createdAt: '2024-01-01T00:00:00Z'
        };
    });

    describe('migratePersona', () => {
        it('should successfully migrate a complete persona', async () => {
            const result = await migrationService.migratePersona(mockPersona);

            expect(result).toBeDefined();
            expect(result.id).toBe(mockPersona.id);
            expect(result.culturalInsights).toBeDefined();
            expect(result.culturalData).toBeDefined(); // Should preserve original for backward compatibility
        });

        it('should preserve all cultural categories during migration', async () => {
            const result = await migrationService.migratePersona(mockPersona);

            const expectedCategories = [
                'music', 'brand', 'movie', 'tv', 'book',
                'restaurant', 'travel', 'fashion', 'beauty', 'food', 'socialMedia'
            ];

            expectedCategories.forEach(category => {
                expect(result.culturalInsights![category as keyof CulturalInsights]).toBeDefined();
            });
        });

        it('should handle personas with social media insights', async () => {
            const personaWithSocialInsights = {
                ...mockPersona,
                socialMediaInsights: {
                    insights: {
                        audienceMatches: [
                            {
                                name: 'Tech Instagram Influencer',
                                relevanceFactors: ['technology', 'innovation'],
                                estimatedFollowingOverlap: 75
                            }
                        ],
                        brandInfluence: [
                            {
                                brand: 'Apple',
                                category: 'Technology',
                                platforms: ['Instagram', 'Twitter'],
                                relevanceScore: 85
                            }
                        ],
                        contentPreferences: ['Tech Reviews', 'Tutorials', 'Industry News'],
                        demographicAlignment: [
                            {
                                ageGroup: '25-34',
                                primaryPlatforms: ['Instagram', 'LinkedIn'],
                                engagementStyle: 'Professional'
                            }
                        ]
                    },
                    platforms: ['Instagram', 'Twitter', 'LinkedIn']
                }
            };

            const result = await migrationService.migratePersona(personaWithSocialInsights);

            expect(result.culturalInsights!.socialMedia).toBeDefined();
            expect(result.culturalInsights!.socialMedia.items.length).toBeGreaterThan(0);
            expect(result.culturalInsights!.socialMedia.metadata.source).toBe('user');
        });

        it('should handle migration errors gracefully', async () => {
            const invalidPersona = {
                ...mockPersona,
                culturalData: null as any
            };

            await expect(migrationService.migratePersona(invalidPersona)).rejects.toThrow();

            const migrationStatus = migrationService.getMigrationStatus(invalidPersona.id);
            expect(migrationStatus?.status).toBe('failed');
        });

        it('should track migration status', async () => {
            await migrationService.migratePersona(mockPersona);

            const migrationStatus = migrationService.getMigrationStatus(mockPersona.id);
            expect(migrationStatus).toBeDefined();
            expect(migrationStatus!.status).toBe('completed');
            expect(migrationStatus!.personaId).toBe(mockPersona.id);
        });
    });

    describe('migrateCulturalData', () => {
        it('should migrate all cultural data categories', async () => {
            const result = await migrationService.migrateCulturalData(mockPersona.culturalData, mockPersona);

            expect(result).toBeDefined();
            expect(Object.keys(result)).toHaveLength(11); // All categories

            // Check each category has proper structure
            Object.values(result).forEach(insight => {
                expect(insight.category).toBeDefined();
                expect(insight.items).toBeDefined();
                expect(insight.metadata).toBeDefined();
                expect(insight.analytics).toBeDefined();
            });
        });

        it('should preserve original item names', async () => {
            const result = await migrationService.migrateCulturalData(mockPersona.culturalData, mockPersona);

            // Check music category as example
            const musicItems = result.music.items.map(item => item.name);
            expect(musicItems).toEqual(expect.arrayContaining(mockPersona.culturalData.music));
        });

        it('should generate appropriate metadata', async () => {
            const result = await migrationService.migrateCulturalData(mockPersona.culturalData, mockPersona);

            const musicInsight = result.music;
            expect(musicInsight.metadata.source).toBe('user');
            expect(musicInsight.metadata.dataQuality).toBe('medium');
            expect(musicInsight.metadata.enrichmentLevel).toBeGreaterThan(0);
        });

        it('should handle empty cultural data', async () => {
            const emptyCulturalData: CulturalData = {
                music: [],
                movie: [],
                tv: [],
                book: [],
                brand: [],
                restaurant: [],
                travel: [],
                fashion: [],
                beauty: [],
                food: [],
                socialMedia: []
            };

            const result = await migrationService.migrateCulturalData(emptyCulturalData, mockPersona);

            Object.values(result).forEach(insight => {
                expect(insight.items).toHaveLength(0);
                expect(insight.metadata.dataQuality).toBe('low');
            });
        });
    });

    describe('migrateSocialMediaInsights', () => {
        let mockSocialInsights: SocialMediaInsights;

        beforeEach(() => {
            mockSocialInsights = {
                audienceMatches: [
                    {
                        name: 'Tech Instagram Influencer',
                        relevanceFactors: ['technology', 'innovation'],
                        estimatedFollowingOverlap: 75
                    },
                    {
                        name: 'LinkedIn Professional',
                        relevanceFactors: ['career', 'networking'],
                        estimatedFollowingOverlap: 60
                    }
                ],
                brandInfluence: [
                    {
                        brand: 'Apple',
                        category: 'Technology',
                        platforms: ['Instagram', 'Twitter'],
                        relevanceScore: 85
                    },
                    {
                        brand: 'Tesla',
                        category: 'Automotive',
                        platforms: ['Twitter', 'YouTube'],
                        relevanceScore: 70
                    }
                ],
                contentPreferences: ['Tech Reviews', 'Tutorials', 'Industry News'],
                demographicAlignment: [
                    {
                        ageGroup: '25-34',
                        primaryPlatforms: ['Instagram', 'LinkedIn'],
                        engagementStyle: 'Professional'
                    }
                ]
            };
        });

        it('should extract platforms from social media insights', async () => {
            const result = await migrationService.migrateSocialMediaInsights(mockSocialInsights, mockPersona);

            expect(result.category).toBe('socialMedia');
            expect(result.items.length).toBeGreaterThan(0);

            const platformNames = result.items.map(item => item.name);
            expect(platformNames).toEqual(expect.arrayContaining(['instagram', 'twitter', 'linkedin']));
        });

        it('should calculate relevance scores based on insights', async () => {
            const result = await migrationService.migrateSocialMediaInsights(mockSocialInsights, mockPersona);

            result.items.forEach(item => {
                expect(item.relevanceScore).toBeGreaterThanOrEqual(0);
                expect(item.relevanceScore).toBeLessThanOrEqual(100);
            });
        });

        it('should generate high-quality metadata for social insights', async () => {
            const result = await migrationService.migrateSocialMediaInsights(mockSocialInsights, mockPersona);

            expect(result.metadata.source).toBe('user');
            expect(result.metadata.dataQuality).toBe('high');
            expect(result.metadata.enrichmentLevel).toBe(85);
        });

        it('should analyze preferences from social insights', async () => {
            const result = await migrationService.migrateSocialMediaInsights(mockSocialInsights, mockPersona);

            expect(result.analytics.preferences.primaryPreferences.length).toBeGreaterThan(0);
            expect(result.analytics.preferences.emergingInterests).toEqual(
                expect.arrayContaining(['Tech Reviews', 'Tutorials', 'Industry News'])
            );
        });

        it('should handle empty social media insights', async () => {
            const emptySocialInsights: SocialMediaInsights = {
                audienceMatches: [],
                brandInfluence: [],
                contentPreferences: [],
                demographicAlignment: []
            };

            const result = await migrationService.migrateSocialMediaInsights(emptySocialInsights, mockPersona);

            expect(result.items.length).toBe(0);
            expect(result.metadata.dataQuality).toBe('high'); // Still high because it's from existing insights
        });
    });

    describe('preserveDataIntegrity', () => {
        it('should validate successful data preservation', async () => {
            const originalData = {
                culturalData: mockPersona.culturalData,
                socialMediaInsights: mockPersona.socialMediaInsights
            };

            const migratedPersona = await migrationService.migratePersona(mockPersona);
            const integrityPreserved = migrationService.preserveDataIntegrity(originalData, migratedPersona);

            expect(integrityPreserved).toBe(true);
        });

        it('should detect missing categories', () => {
            const originalData = {
                culturalData: mockPersona.culturalData,
                socialMediaInsights: mockPersona.socialMediaInsights
            };

            const incompleteMigratedPersona = {
                ...mockPersona,
                culturalInsights: {
                    music: {} as any,
                    // Missing other categories
                } as any
            };

            const integrityPreserved = migrationService.preserveDataIntegrity(originalData, incompleteMigratedPersona);

            expect(integrityPreserved).toBe(false);
        });

        it('should detect missing items within categories', () => {
            const originalData = {
                culturalData: mockPersona.culturalData,
                socialMediaInsights: mockPersona.socialMediaInsights
            };

            const incompleteMigratedPersona = {
                ...mockPersona,
                culturalInsights: {
                    music: {
                        items: [{ name: 'Spotify' }] // Missing other music items
                    }
                } as any
            };

            const integrityPreserved = migrationService.preserveDataIntegrity(originalData, incompleteMigratedPersona);

            expect(integrityPreserved).toBe(false);
        });
    });

    describe('migration status tracking', () => {
        it('should track migration logs', async () => {
            await migrationService.migratePersona(mockPersona);

            const allLogs = migrationService.getAllMigrationLogs();
            expect(allLogs.length).toBe(1);
            expect(allLogs[0].personaId).toBe(mockPersona.id);
        });

        it('should clear migration logs', async () => {
            await migrationService.migratePersona(mockPersona);

            migrationService.clearMigrationLogs();
            const allLogs = migrationService.getAllMigrationLogs();

            expect(allLogs.length).toBe(0);
        });

        it('should return undefined for non-existent persona migration status', () => {
            const status = migrationService.getMigrationStatus('non-existent-id');
            expect(status).toBeUndefined();
        });
    });

    describe('edge cases and error handling', () => {
        it('should handle persona with null cultural data', async () => {
            const personaWithNullData = {
                ...mockPersona,
                culturalData: null as any
            };

            await expect(migrationService.migratePersona(personaWithNullData)).rejects.toThrow();
        });

        it('should handle persona with undefined properties', async () => {
            const personaWithUndefinedProps = {
                ...mockPersona,
                age: undefined as any,
                occupation: undefined as any,
                psychographics: undefined as any
            };

            const result = await migrationService.migratePersona(personaWithUndefinedProps);
            expect(result).toBeDefined();
            expect(result.culturalInsights).toBeDefined();
        });

        it('should handle cultural data with null arrays', async () => {
            const personaWithNullArrays = {
                ...mockPersona,
                culturalData: {
                    ...mockPersona.culturalData,
                    music: null as any,
                    movie: undefined as any
                }
            };

            const result = await migrationService.migratePersona(personaWithNullArrays);
            expect(result).toBeDefined();
            expect(result.culturalInsights!.music.items).toHaveLength(0);
            expect(result.culturalInsights!.movie.items).toHaveLength(0);
        });
    });

    describe('analytics generation', () => {
        it('should generate behavioral influence analytics', async () => {
            const result = await migrationService.migrateCulturalData(mockPersona.culturalData, mockPersona);

            Object.values(result).forEach(insight => {
                expect(insight.analytics.behavioralInfluence.purchaseInfluence).toBeGreaterThanOrEqual(0);
                expect(insight.analytics.behavioralInfluence.purchaseInfluence).toBeLessThanOrEqual(100);
                expect(insight.analytics.behavioralInfluence.socialInfluence).toBeGreaterThanOrEqual(0);
                expect(insight.analytics.behavioralInfluence.socialInfluence).toBeLessThanOrEqual(100);
            });
        });

        it('should generate demographic alignment analytics', async () => {
            const result = await migrationService.migrateCulturalData(mockPersona.culturalData, mockPersona);

            Object.values(result).forEach(insight => {
                expect(insight.analytics.demographicAlignment.ageGroupAlignment).toBeGreaterThanOrEqual(0);
                expect(insight.analytics.demographicAlignment.ageGroupAlignment).toBeLessThanOrEqual(100);
                expect(insight.analytics.demographicAlignment.overallFit).toBeGreaterThanOrEqual(0);
                expect(insight.analytics.demographicAlignment.overallFit).toBeLessThanOrEqual(100);
            });
        });

        it('should generate preference analytics', async () => {
            const result = await migrationService.migrateCulturalData(mockPersona.culturalData, mockPersona);

            Object.values(result).forEach(insight => {
                expect(insight.analytics.preferences.preferenceStrength).toBeGreaterThanOrEqual(0);
                expect(insight.analytics.preferences.preferenceStrength).toBeLessThanOrEqual(100);
                expect(Array.isArray(insight.analytics.preferences.primaryPreferences)).toBe(true);
                expect(Array.isArray(insight.analytics.preferences.secondaryPreferences)).toBe(true);
            });
        });

        it('should generate trend analytics', async () => {
            const result = await migrationService.migrateCulturalData(mockPersona.culturalData, mockPersona);

            Object.values(result).forEach(insight => {
                expect(insight.analytics.trends.trendAlignment).toBeGreaterThanOrEqual(0);
                expect(insight.analytics.trends.trendAlignment).toBeLessThanOrEqual(100);
                expect(insight.analytics.trends.innovatorScore).toBeGreaterThanOrEqual(0);
                expect(insight.analytics.trends.innovatorScore).toBeLessThanOrEqual(100);
                expect(Array.isArray(insight.analytics.trends.currentTrends)).toBe(true);
                expect(Array.isArray(insight.analytics.trends.emergingTrends)).toBe(true);
            });
        });
    });
});