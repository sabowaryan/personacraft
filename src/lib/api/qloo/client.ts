import { Persona } from '@/types';
import { QlooConfig, ApiStatus } from './types';
import { createConfig } from './config';
import { QlooApi } from './api';
import { PersonaEnrichment } from './enrichment';
import { RequestHandler } from './request-handler';
import { getFallbackDataForType } from './fallback';
import {
    integratedRequestSystem,
    initializePerformanceSystem,
    getPerformanceStats
} from './performance';

export class QlooClient {
    private config: QlooConfig;
    private api: QlooApi;
    private enrichment: PersonaEnrichment;
    private requestHandler: RequestHandler;

    constructor() {
        this.config = createConfig();
        this.api = new QlooApi(this.config.apiKey, this.config.baseUrl);

        // Initialize advanced performance system
        initializePerformanceSystem({
            cache: {
                maxSize: 2000,
                defaultTTL: this.config.cacheTimeout,
                enableErrorRecovery: true
            },
            optimization: {
                maxConcurrentRequests: this.config.maxConcurrentRequests,
                requestTimeout: 8000,
                cacheStrategy: 'balanced',
                batchingEnabled: true,
                priorityEnabled: true
            }
        });

        this.requestHandler = new RequestHandler(
            this.config.maxConcurrentRequests,
            this.config.rateLimitDelay,
            this.config.cacheTimeout
        );
        this.enrichment = new PersonaEnrichment(
            this.config.apiKey,
            this.config.baseUrl,
            this.requestHandler
        );
    }

    // Persona enrichment methods
    async enrichPersonas(personas: Partial<Persona>[]): Promise<Partial<Persona>[]> {
        return this.enrichment.enrichPersonas(personas);
    }

    // API methods
    async searchTags(query: string, take: number = 10): Promise<string[]> {
        return this.api.searchTags(query, take);
    }

    async searchEntities(query: string, types: string[] = ['artist', 'movie', 'brand'], take: number = 10): Promise<any[]> {
        return this.api.searchEntities(query, types, take);
    }

    async getAudiences(take: number = 50): Promise<any[]> {
        return this.api.getAudiences(take);
    }

    async testConnection() {
        return this.api.testConnection();
    }

    // Utility methods
    async getValidEntityIds(entityName: string, entityType: string): Promise<string[]> {
        return this.api.getValidEntityIds(entityName, entityType);
    }

    async getValidTagIds(tagQuery: string): Promise<string[]> {
        return this.api.getValidTagIds(tagQuery);
    }

    async getValidAudienceIds(): Promise<string[]> {
        return this.api.getValidAudienceIds();
    }

    getApiStatus(): ApiStatus {
        return {
            hasApiKey: !!this.config.apiKey,
            baseUrl: this.config.baseUrl
        };
    }

    getCacheStats() {
        // Return both legacy and advanced stats for compatibility
        const legacyStats = this.requestHandler.getCacheStats();
        const advancedStats = getPerformanceStats();

        return {
            ...legacyStats,
            advanced: advancedStats
        };
    }

    // New method to get comprehensive performance stats
    getPerformanceStats() {
        return getPerformanceStats();
    }

    // Fallback method for backward compatibility
    private getFallbackDataForType(type: string): string[] {
        return getFallbackDataForType(type);
    }
}