// Unit tests for Cultural Insights validation utilities
// Tests type guards, validation functions, and utility functions

import { describe, it, expect } from 'vitest';
import {
    isCulturalInsightItem,
    isInsightMetadata,
    isPreferenceAnalysis,
    isBehavioralInfluence,
    isDemographicAlignment,
    isTrendAnalysis,
    isInsightAnalytics,
    isCulturalInsight,
    isCulturalInsights,
    validateCulturalInsightItem,
    validateCulturalInsight,
    validateCulturalInsights,
    createEmptyCulturalInsight,
    createEmptyCulturalInsights
} from '../cultural-insights-validators';
import type {
    CulturalInsightItem,
    InsightMetadata,
    PreferenceAnalysis,
    BehavioralInfluence,
    DemographicAlignment,
    TrendAnalysis,
    InsightAnalytics,
    CulturalInsight,
    CulturalInsights
} from '../cultural-insights';

describe('Cultural Insights Validators', () => {
    // Test data fixtures
    const validCulturalInsightItem: CulturalInsightItem = {
        name: 'Taylor Swift',
        relevanceScore: 85,
        confidence: 0.9,
        source: 'qloo',
        relationships: ['pop music', 'celebrity culture']
    };

    const validInsightMetadata: InsightMetadata = {
        generatedAt: '2024-01-01T00:00:00Z',
        source: 'qloo',
        dataQuality: 'high',
        enrichmentLevel: 85
    };

    const validPreferenceAnalysis: PreferenceAnalysis = {
        primaryPreferences: ['pop music', 'indie rock'],
        secondaryPreferences: ['jazz', 'classical'],
        emergingInterests: ['electronic', 'world music'],
        preferenceStrength: 75
    };

    const validBehavioralInfluence: BehavioralInfluence = {
        purchaseInfluence: 80,
        socialInfluence: 75,
        lifestyleAlignment: 85,
        emotionalConnection: 90
    };

    const validDemographicAlignment: DemographicAlignment = {
        ageGroupAlignment: 85,
        locationAlignment: 70,
        occupationAlignment: 80,
        overallFit: 78
    };

    const validTrendAnalysis: TrendAnalysis = {
        currentTrends: ['indie pop', 'sustainable fashion'],
        emergingTrends: ['AI music', 'virtual concerts'],
        trendAlignment: 82,
        innovatorScore: 65
    };

    const validInsightAnalytics: InsightAnalytics = {
        preferences: validPreferenceAnalysis,
        behavioralInfluence: validBehavioralInfluence,
        demographicAlignment: validDemographicAlignment,
        trends: validTrendAnalysis
    };

    const validCulturalInsight: CulturalInsight = {
        category: 'music',
        items: [validCulturalInsightItem],
        metadata: validInsightMetadata,
        analytics: validInsightAnalytics
    };

    describe('isCulturalInsightItem', () => {
        it('should return true for valid CulturalInsightItem', () => {
            expect(isCulturalInsightItem(validCulturalInsightItem)).toBe(true);
        });

        it('should return false for invalid name', () => {
            expect(isCulturalInsightItem({ ...validCulturalInsightItem, name: 123 })).toBe(false);
            expect(isCulturalInsightItem({ ...validCulturalInsightItem, name: '' })).toBe(false);
        });

        it('should return false for invalid relevanceScore', () => {
            expect(isCulturalInsightItem({ ...validCulturalInsightItem, relevanceScore: -1 })).toBe(false);
            expect(isCulturalInsightItem({ ...validCulturalInsightItem, relevanceScore: 101 })).toBe(false);
            expect(isCulturalInsightItem({ ...validCulturalInsightItem, relevanceScore: 'high' })).toBe(false);
        });

        it('should return false for invalid confidence', () => {
            expect(isCulturalInsightItem({ ...validCulturalInsightItem, confidence: -0.1 })).toBe(false);
            expect(isCulturalInsightItem({ ...validCulturalInsightItem, confidence: 1.1 })).toBe(false);
            expect(isCulturalInsightItem({ ...validCulturalInsightItem, confidence: 'high' })).toBe(false);
        });

        it('should return false for invalid source', () => {
            expect(isCulturalInsightItem({ ...validCulturalInsightItem, source: 'invalid' })).toBe(false);
            expect(isCulturalInsightItem({ ...validCulturalInsightItem, source: 123 })).toBe(false);
        });

        it('should return false for null or undefined', () => {
            expect(isCulturalInsightItem(null)).toBeFalsy();
            expect(isCulturalInsightItem(undefined)).toBeFalsy();
            expect(isCulturalInsightItem({})).toBe(false);
        });
    });

    describe('isInsightMetadata', () => {
        it('should return true for valid InsightMetadata', () => {
            expect(isInsightMetadata(validInsightMetadata)).toBe(true);
        });

        it('should return false for invalid generatedAt', () => {
            expect(isInsightMetadata({ ...validInsightMetadata, generatedAt: 123 })).toBe(false);
        });

        it('should return false for invalid source', () => {
            expect(isInsightMetadata({ ...validInsightMetadata, source: 'invalid' })).toBe(false);
        });

        it('should return false for invalid dataQuality', () => {
            expect(isInsightMetadata({ ...validInsightMetadata, dataQuality: 'invalid' })).toBe(false);
        });

        it('should return false for invalid enrichmentLevel', () => {
            expect(isInsightMetadata({ ...validInsightMetadata, enrichmentLevel: -1 })).toBe(false);
            expect(isInsightMetadata({ ...validInsightMetadata, enrichmentLevel: 101 })).toBe(false);
        });
    });

    describe('isPreferenceAnalysis', () => {
        it('should return true for valid PreferenceAnalysis', () => {
            expect(isPreferenceAnalysis(validPreferenceAnalysis)).toBe(true);
        });

        it('should return false for invalid arrays', () => {
            expect(isPreferenceAnalysis({ ...validPreferenceAnalysis, primaryPreferences: 'not array' })).toBe(false);
            expect(isPreferenceAnalysis({ ...validPreferenceAnalysis, secondaryPreferences: null })).toBe(false);
            expect(isPreferenceAnalysis({ ...validPreferenceAnalysis, emergingInterests: undefined })).toBe(false);
        });

        it('should return false for invalid preferenceStrength', () => {
            expect(isPreferenceAnalysis({ ...validPreferenceAnalysis, preferenceStrength: -1 })).toBe(false);
            expect(isPreferenceAnalysis({ ...validPreferenceAnalysis, preferenceStrength: 101 })).toBe(false);
            expect(isPreferenceAnalysis({ ...validPreferenceAnalysis, preferenceStrength: 'high' })).toBe(false);
        });
    });

    describe('isBehavioralInfluence', () => {
        it('should return true for valid BehavioralInfluence', () => {
            expect(isBehavioralInfluence(validBehavioralInfluence)).toBe(true);
        });

        it('should return false for invalid scores', () => {
            expect(isBehavioralInfluence({ ...validBehavioralInfluence, purchaseInfluence: -1 })).toBe(false);
            expect(isBehavioralInfluence({ ...validBehavioralInfluence, socialInfluence: 101 })).toBe(false);
            expect(isBehavioralInfluence({ ...validBehavioralInfluence, lifestyleAlignment: 'high' })).toBe(false);
            expect(isBehavioralInfluence({ ...validBehavioralInfluence, emotionalConnection: null })).toBe(false);
        });
    });

    describe('isDemographicAlignment', () => {
        it('should return true for valid DemographicAlignment', () => {
            expect(isDemographicAlignment(validDemographicAlignment)).toBe(true);
        });

        it('should return false for invalid scores', () => {
            expect(isDemographicAlignment({ ...validDemographicAlignment, ageGroupAlignment: -1 })).toBe(false);
            expect(isDemographicAlignment({ ...validDemographicAlignment, locationAlignment: 101 })).toBe(false);
            expect(isDemographicAlignment({ ...validDemographicAlignment, occupationAlignment: 'high' })).toBe(false);
            expect(isDemographicAlignment({ ...validDemographicAlignment, overallFit: null })).toBe(false);
        });
    });

    describe('isTrendAnalysis', () => {
        it('should return true for valid TrendAnalysis', () => {
            expect(isTrendAnalysis(validTrendAnalysis)).toBe(true);
        });

        it('should return false for invalid arrays', () => {
            expect(isTrendAnalysis({ ...validTrendAnalysis, currentTrends: 'not array' })).toBe(false);
            expect(isTrendAnalysis({ ...validTrendAnalysis, emergingTrends: null })).toBe(false);
        });

        it('should return false for invalid scores', () => {
            expect(isTrendAnalysis({ ...validTrendAnalysis, trendAlignment: -1 })).toBe(false);
            expect(isTrendAnalysis({ ...validTrendAnalysis, innovatorScore: 101 })).toBe(false);
        });
    });

    describe('isInsightAnalytics', () => {
        it('should return true for valid InsightAnalytics', () => {
            expect(isInsightAnalytics(validInsightAnalytics)).toBe(true);
        });

        it('should return false for invalid components', () => {
            expect(isInsightAnalytics({ ...validInsightAnalytics, preferences: null })).toBeFalsy();
            expect(isInsightAnalytics({ ...validInsightAnalytics, behavioralInfluence: {} })).toBe(false);
            expect(isInsightAnalytics({ ...validInsightAnalytics, demographicAlignment: 'invalid' })).toBe(false);
            expect(isInsightAnalytics({ ...validInsightAnalytics, trends: undefined })).toBeFalsy();
        });
    });

    describe('isCulturalInsight', () => {
        it('should return true for valid CulturalInsight', () => {
            expect(isCulturalInsight(validCulturalInsight)).toBe(true);
        });

        it('should return false for invalid category', () => {
            expect(isCulturalInsight({ ...validCulturalInsight, category: 123 })).toBe(false);
            expect(isCulturalInsight({ ...validCulturalInsight, category: null })).toBe(false);
        });

        it('should return false for invalid items', () => {
            expect(isCulturalInsight({ ...validCulturalInsight, items: 'not array' })).toBe(false);
            expect(isCulturalInsight({ ...validCulturalInsight, items: [{ invalid: 'item' }] })).toBe(false);
        });

        it('should return false for invalid metadata or analytics', () => {
            expect(isCulturalInsight({ ...validCulturalInsight, metadata: null })).toBeFalsy();
            expect(isCulturalInsight({ ...validCulturalInsight, analytics: {} })).toBeFalsy();
        });
    });

    describe('validateCulturalInsightItem', () => {
        it('should return valid result for correct item', () => {
            const result = validateCulturalInsightItem(validCulturalInsightItem);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.score).toBe(100);
        });

        it('should return errors for invalid item', () => {
            const invalidItem = {
                name: '',
                relevanceScore: -1,
                confidence: 2,
                source: 'invalid'
            };
            const result = validateCulturalInsightItem(invalidItem);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.score).toBe(0);
        });

        it('should return warnings for low scores', () => {
            const lowScoreItem = {
                ...validCulturalInsightItem,
                relevanceScore: 30,
                confidence: 0.3
            };
            const result = validateCulturalInsightItem(lowScoreItem);
            expect(result.isValid).toBe(true);
            expect(result.warnings.length).toBeGreaterThan(0);
            expect(result.score).toBe(80);
        });

        it('should handle null/undefined input', () => {
            const result = validateCulturalInsightItem(null);
            expect(result.isValid).toBe(false);
            expect(result.errors[0].message).toContain('must be an object');
        });
    });

    describe('validateCulturalInsight', () => {
        it('should return valid result for correct insight', () => {
            const result = validateCulturalInsight(validCulturalInsight);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should return errors for invalid insight', () => {
            const invalidInsight = {
                category: '',
                items: 'not array',
                metadata: null,
                analytics: {}
            };
            const result = validateCulturalInsight(invalidInsight);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it('should validate nested items', () => {
            const insightWithInvalidItem = {
                ...validCulturalInsight,
                items: [{ name: '', relevanceScore: -1, confidence: 2, source: 'invalid' }]
            };
            const result = validateCulturalInsight(insightWithInvalidItem);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.category.includes('items[0]'))).toBe(true);
        });

        it('should warn about empty items', () => {
            const emptyInsight = {
                ...validCulturalInsight,
                items: []
            };
            const result = validateCulturalInsight(emptyInsight);
            expect(result.isValid).toBe(true);
            expect(result.warnings.some(w => w.includes('No items found'))).toBe(true);
        });
    });

    describe('validateCulturalInsights', () => {
        const validCulturalInsights: CulturalInsights = {
            music: validCulturalInsight,
            brand: { ...validCulturalInsight, category: 'brand' },
            movie: { ...validCulturalInsight, category: 'movie' },
            tv: { ...validCulturalInsight, category: 'tv' },
            book: { ...validCulturalInsight, category: 'book' },
            restaurant: { ...validCulturalInsight, category: 'restaurant' },
            travel: { ...validCulturalInsight, category: 'travel' },
            fashion: { ...validCulturalInsight, category: 'fashion' },
            beauty: { ...validCulturalInsight, category: 'beauty' },
            food: { ...validCulturalInsight, category: 'food' },
            socialMedia: { ...validCulturalInsight, category: 'socialMedia' }
        };

        it('should return valid result for complete insights', () => {
            const result = validateCulturalInsights(validCulturalInsights);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should return errors for missing categories', () => {
            const incompleteInsights = {
                music: validCulturalInsight,
                brand: validCulturalInsight
                // Missing other required categories
            };
            const result = validateCulturalInsights(incompleteInsights);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors.some(e => e.message.includes('Missing required category'))).toBe(true);
        });

        it('should validate nested insights', () => {
            const insightsWithInvalidCategory = {
                ...validCulturalInsights,
                music: { ...validCulturalInsight, category: '' }
            };
            const result = validateCulturalInsights(insightsWithInvalidCategory);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(e => e.category.includes('music.category'))).toBe(true);
        });

        it('should handle null/undefined input', () => {
            const result = validateCulturalInsights(null);
            expect(result.isValid).toBe(false);
            expect(result.errors[0].message).toContain('must be an object');
        });
    });

    describe('createEmptyCulturalInsight', () => {
        it('should create valid empty insight for category', () => {
            const emptyInsight = createEmptyCulturalInsight('music');
            expect(emptyInsight.category).toBe('music');
            expect(emptyInsight.items).toEqual([]);
            expect(emptyInsight.metadata.source).toBe('fallback');
            expect(emptyInsight.metadata.dataQuality).toBe('low');
            expect(emptyInsight.metadata.enrichmentLevel).toBe(0);
            expect(isCulturalInsight(emptyInsight)).toBe(true);
        });

        it('should create insight with current timestamp', () => {
            const emptyInsight = createEmptyCulturalInsight('test');
            const timestamp = new Date(emptyInsight.metadata.generatedAt);
            expect(timestamp).toBeInstanceOf(Date);
            expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
        });
    });

    describe('createEmptyCulturalInsights', () => {
        it('should create complete empty insights structure', () => {
            const emptyInsights = createEmptyCulturalInsights();
            expect(isCulturalInsights(emptyInsights)).toBe(true);

            const requiredCategories = [
                'music', 'brand', 'movie', 'tv', 'book',
                'restaurant', 'travel', 'fashion', 'beauty', 'food', 'socialMedia'
            ];

            requiredCategories.forEach(category => {
                expect(emptyInsights[category as keyof CulturalInsights]).toBeDefined();
                expect(emptyInsights[category as keyof CulturalInsights].category).toBe(category);
                expect(emptyInsights[category as keyof CulturalInsights].items).toEqual([]);
            });
        });

        it('should validate successfully', () => {
            const emptyInsights = createEmptyCulturalInsights();
            const result = validateCulturalInsights(emptyInsights);
            expect(result.isValid).toBe(true);
        });
    });
});