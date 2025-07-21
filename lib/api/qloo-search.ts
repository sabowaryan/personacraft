// Qloo Search Service - Conforme aux spécifications officielles du hackathon
// Implémente la recherche d'entités via l'endpoint /search

import type {
    EntityUrn,
    QlooEntity,
    SearchParams,
    SearchResult,
    QlooCompliantError,
    QlooResponseStatus
} from '@/lib/types/qloo-compliant';
import { QlooErrorType } from '@/lib/types/qloo-compliant';

/**
 * Paramètres pour la recherche par lot
 */
export interface BatchSearchQuery {
    /** Terme de recherche */
    query: string;
    /** Type d'entité à rechercher */
    type: EntityUrn;
    /** Identifiant unique pour cette requête dans le lot */
    id?: string;
}

/**
 * Résultat de recherche par lot
 */
export interface BatchSearchResult {
    /** Résultats par requête */
    results: Array<{
        /** ID de la requête */
        query_id: string;
        /** Terme de recherche */
        query: string;
        /** Type d'entité */
        type: EntityUrn;
        /** Entités trouvées */
        entities: QlooEntity[];
        /** Statut de cette recherche spécifique */
        status: QlooResponseStatus;
    }>;
    /** Métadonnées globales du lot */
    metadata: {
        total_queries: number;
        successful_queries: number;
        failed_queries: number;
        total_entities: number;
        processing_time: number;
        request_id: string;
    };
    /** Statut global du lot */
    status: QlooResponseStatus;
}

/**
 * Service de recherche d'entités Qloo
 * Implémente l'endpoint /search avec support pour tous les types d'entités
 */
export class QlooSearchService {
    private baseUrl: string;
    private apiKey: string;
    private timeout: number;

    constructor(apiKey: string, baseUrl: string = 'https://hackathon.api.qloo.com', timeout: number = 10000) {
        if (!apiKey) {
            throw new Error('API key is required for Qloo Search Service');
        }
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.timeout = timeout;
    }

    /**
     * Recherche des entités via l'endpoint /search
     * Supporte tous les types d'entités documentés
     */
    async searchEntities(query: string, type: EntityUrn, options?: Partial<SearchParams>): Promise<SearchResult> {
        if (!query || query.trim().length === 0) {
            throw this.createError(
                QlooErrorType.VALIDATION,
                'EMPTY_QUERY',
                'Search query cannot be empty'
            );
        }

        if (!this.isValidEntityType(type)) {
            throw this.createError(
                QlooErrorType.VALIDATION,
                'INVALID_ENTITY_TYPE',
                `Invalid entity type: ${type}. Must be a valid URN.`
            );
        }

        const startTime = Date.now();
        const requestId = crypto.randomUUID();

        try {
            const searchParams: SearchParams = {
                query: query.trim(),
                type,
                limit: options?.limit || 20,
                min_confidence: options?.min_confidence || 0.5,
                language: options?.language || 'en',
                region: options?.region
            };

            const response = await this.makeSearchRequest(searchParams);
            const processingTime = Date.now() - startTime;

            return {
                entities: this.parseEntities(response.data?.entities || []),
                metadata: {
                    query: searchParams.query,
                    total_results: response.data?.entities?.length || 0,
                    processing_time: processingTime,
                    request_id: requestId
                },
                status: {
                    code: 200,
                    message: 'Search completed successfully',
                    success: true
                }
            };

        } catch (error) {
            const processingTime = Date.now() - startTime;

            // Re-throw Qloo compliant errors as-is
            if (error && typeof error === 'object' && 'type' in error && 'code' in error) {
                throw error;
            }

            throw this.createError(
                QlooErrorType.SERVER_ERROR,
                'SEARCH_FAILED',
                `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                { query, type, processing_time: processingTime }
            );
        }
    }

    /**
     * Recherche par lot pour plusieurs requêtes simultanées
     * Optimise les appels API en groupant les requêtes similaires
     */
    async batchSearch(queries: BatchSearchQuery[]): Promise<BatchSearchResult> {
        if (!queries || queries.length === 0) {
            throw this.createError(
                QlooErrorType.VALIDATION,
                'EMPTY_BATCH',
                'Batch search requires at least one query'
            );
        }

        if (queries.length > 50) {
            throw this.createError(
                QlooErrorType.VALIDATION,
                'BATCH_TOO_LARGE',
                'Batch search is limited to 50 queries maximum'
            );
        }

        const startTime = Date.now();
        const requestId = crypto.randomUUID();
        const results: BatchSearchResult['results'] = [];
        let successfulQueries = 0;
        let failedQueries = 0;
        let totalEntities = 0;

        // Traiter les requêtes en parallèle avec limitation de concurrence
        const batchSize = 5; // Limite de 5 requêtes simultanées
        for (let i = 0; i < queries.length; i += batchSize) {
            const batch = queries.slice(i, i + batchSize);
            const batchPromises = batch.map(async (query, index) => {
                const queryId = query.id || `query_${i + index}`;

                try {
                    const result = await this.searchEntities(query.query, query.type);
                    successfulQueries++;
                    totalEntities += result.entities.length;

                    return {
                        query_id: queryId,
                        query: query.query,
                        type: query.type,
                        entities: result.entities,
                        status: result.status
                    };
                } catch (error) {
                    failedQueries++;

                    return {
                        query_id: queryId,
                        query: query.query,
                        type: query.type,
                        entities: [],
                        status: {
                            code: 500,
                            message: error instanceof Error ? error.message : 'Search failed',
                            success: false,
                            errors: [error instanceof Error ? error.message : 'Unknown error']
                        }
                    };
                }
            });

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
        }

        const processingTime = Date.now() - startTime;

        return {
            results,
            metadata: {
                total_queries: queries.length,
                successful_queries: successfulQueries,
                failed_queries: failedQueries,
                total_entities: totalEntities,
                processing_time: processingTime,
                request_id: requestId
            },
            status: {
                code: failedQueries === 0 ? 200 : 207, // 207 Multi-Status si certaines requêtes ont échoué
                message: failedQueries === 0 ? 'All searches completed successfully' : 'Some searches failed',
                success: successfulQueries > 0,
                warnings: failedQueries > 0 ? [`${failedQueries} out of ${queries.length} searches failed`] : undefined
            }
        };
    }

    /**
     * Valide les types d'entités supportés
     */
    validateEntityType(type: string): boolean {
        return this.isValidEntityType(type as EntityUrn);
    }

    /**
     * Retourne la liste des types d'entités supportés
     */
    getSupportedEntityTypes(): EntityUrn[] {
        return [
            'urn:entity:brand',
            'urn:entity:artist',
            'urn:entity:movie',
            'urn:entity:tv_show',
            'urn:entity:book',
            'urn:entity:song',
            'urn:entity:album',
            'urn:entity:restaurant',
            'urn:entity:product',
            'urn:entity:location'
        ];
    }

    /**
     * Effectue la requête HTTP vers l'endpoint /search
     */
    private async makeSearchRequest(params: SearchParams): Promise<any> {
        const url = new URL('/search', this.baseUrl);

        // Ajouter les paramètres de recherche
        url.searchParams.append('q', params.query);
        if (params.type) url.searchParams.append('type', params.type);
        if (params.limit) url.searchParams.append('limit', params.limit.toString());
        if (params.min_confidence) url.searchParams.append('min_confidence', params.min_confidence.toString());
        if (params.language) url.searchParams.append('language', params.language);
        if (params.region) url.searchParams.append('region', params.region);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'X-API-Key': this.apiKey,
                    'Accept': 'application/json',
                    'User-Agent': 'PersonaCraft/1.0'
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw this.createHttpError(response.status, response.statusText);
            }

            const data = await response.json();
            return { data, headers: response.headers };

        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof Error && error.name === 'AbortError') {
                throw this.createError(
                    QlooErrorType.NETWORK_ERROR,
                    'TIMEOUT',
                    `Search request timeout after ${this.timeout}ms`
                );
            }

            throw error;
        }
    }

    /**
     * Parse et valide les entités retournées par l'API
     */
    private parseEntities(rawEntities: any[]): QlooEntity[] {
        if (!Array.isArray(rawEntities)) {
            return [];
        }

        return rawEntities
            .map(entity => this.parseEntity(entity))
            .filter((entity): entity is QlooEntity => entity !== null);
    }

    /**
     * Parse une entité individuelle
     */
    private parseEntity(rawEntity: any): QlooEntity | null {
        if (!rawEntity || typeof rawEntity !== 'object') {
            return null;
        }

        try {
            return {
                id: rawEntity.id || crypto.randomUUID(),
                name: rawEntity.name || 'Unknown Entity',
                type: rawEntity.type || 'urn:entity:brand',
                confidence: typeof rawEntity.confidence === 'number' ? rawEntity.confidence : 0.8,
                metadata: rawEntity.metadata || {},
                image_url: rawEntity.image_url,
                description: rawEntity.description,
                tags: Array.isArray(rawEntity.tags) ? rawEntity.tags : []
            };
        } catch (error) {
            console.warn('Failed to parse entity:', rawEntity, error);
            return null;
        }
    }

    /**
     * Vérifie si un type d'entité est valide
     */
    private isValidEntityType(type: string): type is EntityUrn {
        const validTypes = this.getSupportedEntityTypes();
        return validTypes.includes(type as EntityUrn);
    }

    /**
     * Crée une erreur HTTP appropriée selon le code de statut
     */
    private createHttpError(status: number, statusText: string): QlooCompliantError {
        switch (status) {
            case 401:
                return this.createError(
                    QlooErrorType.AUTHENTICATION,
                    'UNAUTHORIZED',
                    'Invalid API key for search endpoint'
                );
            case 403:
                return this.createError(
                    QlooErrorType.AUTHORIZATION,
                    'FORBIDDEN',
                    'API key does not have search permissions'
                );
            case 404:
                return this.createError(
                    QlooErrorType.NOT_FOUND,
                    'ENDPOINT_NOT_FOUND',
                    'Search endpoint not found'
                );
            case 422:
                return this.createError(
                    QlooErrorType.VALIDATION,
                    'INVALID_SEARCH_PARAMS',
                    'Invalid search parameters'
                );
            case 429:
                return this.createError(
                    QlooErrorType.RATE_LIMIT,
                    'RATE_LIMIT_EXCEEDED',
                    'Search rate limit exceeded',
                    undefined,
                    true
                );
            default:
                if (status >= 500) {
                    return this.createError(
                        QlooErrorType.SERVER_ERROR,
                        'SEARCH_SERVER_ERROR',
                        `Search server error: ${status} ${statusText}`,
                        undefined,
                        true
                    );
                }
                return this.createError(
                    QlooErrorType.NETWORK_ERROR,
                    'SEARCH_HTTP_ERROR',
                    `Search HTTP ${status}: ${statusText}`
                );
        }
    }

    /**
     * Crée une erreur conforme aux spécifications Qloo
     */
    private createError(
        type: QlooErrorType,
        code: string,
        message: string,
        details?: any,
        retryable: boolean = false
    ): QlooCompliantError {
        return {
            type,
            message,
            code,
            details,
            request_id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            retryable
        };
    }
}