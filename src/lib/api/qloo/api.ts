import { ConnectionTestResult } from './types';

export class QlooApi {
    constructor(
        private apiKey: string,
        private baseUrl: string
    ) {}

    async searchTags(query: string, take: number = 10): Promise<string[]> {
        try {
            const response = await fetch(
                `${this.baseUrl}/v2/tags?q=${encodeURIComponent(query)}&take=${take}`,
                {
                    headers: {
                        'X-API-Key': this.apiKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                return [];
            }

            const result = await response.json();
            return result.data?.map((tag: any) => tag.id || tag.name) || [];
        } catch (error) {
            return [];
        }
    }

    async searchEntities(query: string, types: string[] = ['artist', 'movie', 'brand'], take: number = 10): Promise<any[]> {
        try {
            const typesParam = types.join(',');
            const response = await fetch(
                `${this.baseUrl}/search?q=${encodeURIComponent(query)}&types=${typesParam}&take=${take}`,
                {
                    headers: {
                        'X-API-Key': this.apiKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                return [];
            }

            const result = await response.json();
            return result.data || [];
        } catch (error) {
            return [];
        }
    }

    async getAudiences(take: number = 50): Promise<any[]> {
        try {
            const response = await fetch(
                `${this.baseUrl}/v2/audiences?take=${take}`,
                {
                    headers: {
                        'X-API-Key': this.apiKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                return [];
            }

            const result = await response.json();
            return result.data || [];
        } catch (error) {
            console.error('Erreur récupération audiences:', error);
            return [];
        }
    }

    async testConnection(): Promise<ConnectionTestResult> {
        if (!this.apiKey) {
            return { success: false, error: 'Clé API manquante' };
        }

        try {
            const response = await fetch(
                `${this.baseUrl}/v2/insights?filter.type=urn:entity:artist&signal.demographics.audiences=millennials&take=1`,
                {
                    headers: {
                        'X-API-Key': this.apiKey,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                return { success: true };
            }

            let errorMessage = `HTTP ${response.status}`;
            if (response.status === 403) {
                errorMessage = 'Accès refusé - Vérifiez l\'URL de base et la clé API';
            } else if (response.status === 429) {
                errorMessage = 'Limite de débit atteinte - Réessayez plus tard';
            }

            return {
                success: false,
                error: errorMessage,
                status: response.status
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Erreur inconnue'
            };
        }
    }

    async getValidEntityIds(entityName: string, entityType: string): Promise<string[]> {
        try {
            const entities = await this.searchEntities(entityName, [entityType], 5);
            return entities.map(entity => entity.id).filter(Boolean);
        } catch (error) {
            return [];
        }
    }

    async getValidTagIds(tagQuery: string): Promise<string[]> {
        try {
            const tags = await this.searchTags(tagQuery, 10);
            return tags.filter(Boolean);
        } catch (error) {
            return [];
        }
    }

    async getValidAudienceIds(): Promise<string[]> {
        try {
            const audiences = await this.getAudiences(20);
            return audiences.map(audience => audience.id).filter(Boolean);
        } catch (error) {
            console.error('Erreur récupération audiences:', error);
            return [];
        }
    }
}