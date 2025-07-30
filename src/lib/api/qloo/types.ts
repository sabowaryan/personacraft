import { Persona } from '@/types';

export interface QlooConfig {
    apiKey: string;
    baseUrl: string;
    maxConcurrentRequests: number;
    rateLimitDelay: number;
    cacheTimeout: number;
}

export interface CacheEntry {
    data: string[];
    timestamp: number;
}

export interface SocialMediaInsights {
    audienceMatches: Array<{
        name: string;
        relevanceFactors: string[];
        estimatedFollowingOverlap: number;
    }>;
    brandInfluence: Array<{
        brand: string;
        category: string;
        platforms: string[];
        relevanceScore: number;
    }>;
    contentPreferences: string[];
    demographicAlignment: Array<{
        ageGroup: string;
        primaryPlatforms: string[];
        engagementStyle: string;
    }>;
}

export interface SocialMediaEnrichment {
    platforms: string[];
    insights: SocialMediaInsights;
}

export interface ConnectionTestResult {
    success: boolean;
    error?: string;
    status?: number;
}

export interface ApiStatus {
    hasApiKey: boolean;
    baseUrl: string;
}