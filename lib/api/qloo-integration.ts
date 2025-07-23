// PersonaCraft Integration Layer for Qloo API
// Orchestrates the recommended data flow: search → tags → audiences → insights

import { QlooApiClient } from './qloo';
import type {
  QlooEntity,
  QlooTag,
  QlooAudience,
  QlooInsightsResponse,
  EntityUrn,
  InsightsParams
} from '@/lib/types/qloo-compliant';
import type { BriefFormData } from '@/lib/types/persona';

/**
 * Structure enrichie pour les données de persona avec insights culturels
 */
export interface EnrichedPersonaData {
  culturalInsights: {
    music: QlooEntity[];
    movies: QlooEntity[];
    brands: QlooEntity[];
    books: QlooEntity[];
    tvShows: QlooEntity[];
    restaurants: QlooEntity[];
    products: QlooEntity[];
  };
  demographics: QlooAudience[];
  interests: QlooTag[];
  confidence: number;
  sources: {
    qloo: boolean;
    fallback: boolean;
    cached: boolean;
  };
  metadata: {
    requestId: string;
    processingTime: number;
    dataFlow: string[];
    errors: string[];
    warnings: string[];
  };
}

/**
 * Configuration pour l'intégration Qloo
 */
export interface QlooIntegrationConfig {
  enableCache: boolean;
  fallbackEnabled: boolean;
  maxRetries: number;
  timeout: number;
  confidenceThreshold: number;
}

/**
 * Service d'intégration Qloo pour PersonaCraft
 * Orchestre le flux de données recommandé pour l'enrichissement des personas
 */
export class QlooIntegrationService {
  private client: QlooApiClient;
  private config: QlooIntegrationConfig;

  constructor(apiKey?: string, config?: Partial<QlooIntegrationConfig>) {
    this.client = new QlooApiClient(apiKey);
    this.config = {
      enableCache: true,
      fallbackEnabled: true,
      maxRetries: 3,
      timeout: 10000,
      confidenceThreshold: 0.5,
      ...config
    };
  }

  /**
   * Enrichit un persona avec des données culturelles Qloo
   * Suit le flux recommandé: search → tags → audiences → insights
   */
  async enrichPersona(brief: BriefFormData): Promise<EnrichedPersonaData> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    const dataFlow: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    
    let sources = {
      qloo: false,
      fallback: false,
      cached: false
    };

    try {
      // Étape 1: Recherche d'entités basée sur les intérêts
      dataFlow.push('entity_search');
      const entities = await this.searchEntitiesFromBrief(brief);
      if (entities.length > 0) sources.qloo = true;

      // Étape 2: Récupération des tags pertinents
      dataFlow.push('tags_discovery');
      const tags = await this.discoverRelevantTags(brief, entities);

      // Étape 3: Identification des audiences démographiques
      dataFlow.push('audience_identification');
      const audiences = await this.identifyAudiences(brief);

      // Étape 4: Génération d'insights avec les données collectées
      dataFlow.push('insights_generation');
      const insights = await this.generateInsights(entities, tags, audiences, brief);

      // Vérifier si nous avons des données utiles
      const hasUsefulData = entities.length > 0 || tags.length > 0 || audiences.length > 0;
      
      if (!hasUsefulData && this.config.fallbackEnabled) {
        warnings.push('No useful data from Qloo API, using fallback');
        sources.fallback = true;
        return this.generateFallbackData(brief, requestId, Date.now() - startTime, dataFlow, errors, warnings);
      }

      // Étape 5: Structuration des données culturelles par catégorie
      const culturalInsights = this.categorizeCulturalInsights(insights?.entities || entities);

      const processingTime = Date.now() - startTime;

      return {
        culturalInsights,
        demographics: audiences,
        interests: tags,
        confidence: insights?.confidence || 0.6,
        sources,
        metadata: {
          requestId,
          processingTime,
          dataFlow,
          errors,
          warnings
        }
      };

    } catch (error) {
      errors.push(`Integration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      if (this.config.fallbackEnabled) {
        warnings.push('Using fallback data due to API error');
        sources.fallback = true;
        return this.generateFallbackData(brief, requestId, Date.now() - startTime, dataFlow, errors, warnings);
      }
      
      throw error;
    }
  }

  /**
   * Recherche des entités basées sur le brief utilisateur
   */
  private async searchEntitiesFromBrief(brief: BriefFormData): Promise<QlooEntity[]> {
    const allEntities: QlooEntity[] = [];
    const entityTypes: EntityUrn[] = [
      'urn:entity:brand',
      'urn:entity:artist',
      'urn:entity:movie',
      'urn:entity:tv_show',
      'urn:entity:book',
      'urn:entity:restaurant',
      'urn:entity:product'
    ];

    // Rechercher des entités pour chaque intérêt
    for (const interest of brief.interests) {
      // Skip empty or very short interests
      if (!interest || interest.trim().length < 2) {
        continue;
      }

      for (const entityType of entityTypes) {
        try {
          const searchResult = await this.client.searchEntities(interest, entityType, {
            limit: 5,
            min_confidence: this.config.confidenceThreshold
          });
          
          if (searchResult.entities.length > 0) {
            allEntities.push(...searchResult.entities);
          }
        } catch (error) {
          console.warn(`Search failed for ${interest} (${entityType}):`, error);
          // Continue with other searches instead of failing completely
        }
      }
    }

    // If no entities found, return empty array instead of failing
    if (allEntities.length === 0) {
      console.warn('No entities found from Qloo API, will use fallback data');
      return [];
    }

    // Dédupliquer et limiter les résultats
    const uniqueEntities = this.deduplicateEntities(allEntities);
    return uniqueEntities.slice(0, 50); // Limiter pour éviter la surcharge
  }

  /**
   * Découvre des tags pertinents basés sur le brief et les entités trouvées
   */
  private async discoverRelevantTags(brief: BriefFormData, entities: QlooEntity[]): Promise<QlooTag[]> {
    const allTags: QlooTag[] = [];

    try {
      // Rechercher des tags basés sur les intérêts du brief
      for (const interest of brief.interests) {
        const tagResult = await this.client.searchTags({
          query: interest,
          limit: 10
        });
        allTags.push(...tagResult.tags);
      }

      // Rechercher des tags par catégories pertinentes
      const categories = ['lifestyle', 'entertainment', 'food', 'fashion', 'technology'];
      for (const category of categories) {
        try {
          const categoryTags = await this.client.getTagsByCategory({ category, limit: 5 });
          allTags.push(...categoryTags.tags);
        } catch (error) {
          console.warn(`Failed to get tags for category ${category}:`, error);
        }
      }

      return this.deduplicateTags(allTags).slice(0, 30);
    } catch (error) {
      console.warn('Tag discovery failed:', error);
      return [];
    }
  }

  /**
   * Identifie les audiences démographiques pertinentes
   */
  private async identifyAudiences(brief: BriefFormData): Promise<QlooAudience[]> {
    try {
      // Construire les filtres démographiques basés sur le brief
      const demographicFilters = this.buildDemographicFilters(brief);
      
      const audienceResult = await this.client.getAudiences({
        demographics: demographicFilters,
        interests: brief.interests,
        limit: 10
      });

      return audienceResult.audiences;
    } catch (error) {
      console.warn('Audience identification failed:', error);
      return [];
    }
  }

  /**
   * Génère des insights en utilisant les entités, tags et audiences collectés
   */
  private async generateInsights(
    entities: QlooEntity[],
    tags: QlooTag[],
    audiences: QlooAudience[],
    brief: BriefFormData
  ): Promise<QlooInsightsResponse> {
    // Préparer les paramètres d'insights selon les spécifications Qloo
    const insightsParams: InsightsParams = {
      'filter.type': 'urn:entity:brand', // Type principal pour les insights
      'signal.interests.entities': entities.slice(0, 10).map(e => e.id),
      'signal.interests.tags': tags.slice(0, 10).map(t => t.id),
      'signal.demographics.audiences': audiences.slice(0, 5).map(a => a.id),
      limit: 50,
      min_confidence: this.config.confidenceThreshold,
      language: 'fr'
    };

    try {
      return await this.client.getInsights(insightsParams);
    } catch (error) {
      console.warn('Insights generation failed:', error);
      
      // Fallback: créer une réponse basique avec les données collectées
      return {
        entities,
        tags,
        audiences,
        confidence: 0.6,
        metadata: {
          request_id: this.generateRequestId(),
          processing_time: 0,
          data_source: 'fallback',
          api_version: 'fallback-v1',
          timestamp: new Date().toISOString(),
          total_results: entities.length,
          filters_applied: ['fallback_mode'],
          signals_used: ['collected_entities', 'collected_tags'],
          cached: false
        },
        status: {
          code: 200,
          message: 'Fallback insights generated',
          success: true,
          warnings: ['Using fallback insights due to API error']
        }
      };
    }
  }

  /**
   * Catégorise les insights culturels par type d'entité
   */
  private categorizeCulturalInsights(entities: QlooEntity[]): EnrichedPersonaData['culturalInsights'] {
    const categorized = {
      music: [] as QlooEntity[],
      movies: [] as QlooEntity[],
      brands: [] as QlooEntity[],
      books: [] as QlooEntity[],
      tvShows: [] as QlooEntity[],
      restaurants: [] as QlooEntity[],
      products: [] as QlooEntity[]
    };

    entities.forEach(entity => {
      switch (entity.type) {
        case 'urn:entity:artist':
        case 'urn:entity:song':
        case 'urn:entity:album':
          categorized.music.push(entity);
          break;
        case 'urn:entity:movie':
          categorized.movies.push(entity);
          break;
        case 'urn:entity:brand':
          categorized.brands.push(entity);
          break;
        case 'urn:entity:book':
          categorized.books.push(entity);
          break;
        case 'urn:entity:tv_show':
          categorized.tvShows.push(entity);
          break;
        case 'urn:entity:restaurant':
          categorized.restaurants.push(entity);
          break;
        case 'urn:entity:product':
          categorized.products.push(entity);
          break;
      }
    });

    return categorized;
  }

  /**
   * Construit les filtres démographiques basés sur le brief
   */
  private buildDemographicFilters(brief: BriefFormData): any {
    const filters: any = {};

    // Parser la tranche d'âge
    if (brief.ageRange) {
      const ageMatch = brief.ageRange.match(/(\d+)-(\d+)/);
      if (ageMatch) {
        filters.age_range = {
          min: parseInt(ageMatch[1]),
          max: parseInt(ageMatch[2])
        };
      }
    }

    // Ajouter la localisation
    if (brief.location) {
      filters.location = {
        country: brief.location.includes('France') ? 'FR' : undefined,
        region: brief.location
      };
    }

    return filters;
  }

  /**
   * Déduplique les entités par ID
   */
  private deduplicateEntities(entities: QlooEntity[]): QlooEntity[] {
    const seen = new Set<string>();
    return entities.filter(entity => {
      if (seen.has(entity.id)) return false;
      seen.add(entity.id);
      return true;
    });
  }

  /**
   * Déduplique les tags par ID
   */
  private deduplicateTags(tags: QlooTag[]): QlooTag[] {
    const seen = new Set<string>();
    return tags.filter(tag => {
      if (seen.has(tag.id)) return false;
      seen.add(tag.id);
      return true;
    });
  }

  /**
   * Génère des données de fallback cohérentes
   */
  private generateFallbackData(
    brief: BriefFormData,
    requestId: string,
    processingTime: number,
    dataFlow: string[],
    errors: string[],
    warnings: string[]
  ): EnrichedPersonaData {
    // Générer des données de fallback basées sur les intérêts du brief
    const fallbackEntities = this.generateFallbackEntities(brief);
    const fallbackTags = this.generateFallbackTags(brief);
    const fallbackAudiences = this.generateFallbackAudiences(brief);

    return {
      culturalInsights: this.categorizeCulturalInsights(fallbackEntities),
      demographics: fallbackAudiences,
      interests: fallbackTags,
      confidence: 0.6,
      sources: {
        qloo: false,
        fallback: true,
        cached: false
      },
      metadata: {
        requestId,
        processingTime,
        dataFlow: [...dataFlow, 'fallback_generation'],
        errors,
        warnings
      }
    };
  }

  /**
   * Génère des entités de fallback basées sur les intérêts
   */
  private generateFallbackEntities(brief: BriefFormData): QlooEntity[] {
    const entities: QlooEntity[] = [];
    
    brief.interests.forEach((interest, index) => {
      // Générer différents types d'entités pour chaque intérêt
      const entityTypes: EntityUrn[] = [
        'urn:entity:brand',
        'urn:entity:artist',
        'urn:entity:movie',
        'urn:entity:book'
      ];

      entityTypes.forEach((type, typeIndex) => {
        entities.push({
          id: `fallback_${interest}_${type}_${index}_${typeIndex}`,
          name: `${interest} ${this.getEntityTypeName(type)}`,
          type,
          confidence: 0.6 + Math.random() * 0.3,
          description: `Fallback ${this.getEntityTypeName(type)} related to ${interest}`,
          tags: [interest]
        });
      });
    });

    return entities.slice(0, 30); // Limiter le nombre d'entités
  }

  /**
   * Génère des tags de fallback
   */
  private generateFallbackTags(brief: BriefFormData): QlooTag[] {
    return brief.interests.map((interest, index) => ({
      id: `fallback_tag_${interest}_${index}`,
      name: interest,
      category: 'lifestyle',
      weight: 0.7 + Math.random() * 0.3,
      description: `Fallback tag for ${interest}`
    }));
  }

  /**
   * Génère des audiences de fallback
   */
  private generateFallbackAudiences(brief: BriefFormData): QlooAudience[] {
    const ageMatch = brief.ageRange?.match(/(\d+)-(\d+)/);
    const minAge = ageMatch ? parseInt(ageMatch[1]) : 25;
    const maxAge = ageMatch ? parseInt(ageMatch[2]) : 45;

    return [{
      id: `fallback_audience_${brief.location}_${brief.ageRange}`,
      name: `${brief.location} ${brief.ageRange} Audience`,
      demographics: {
        age_range: { min: minAge, max: maxAge },
        location: { region: brief.location },
        income_level: 'medium'
      },
      interests: brief.interests,
      description: `Fallback audience for ${brief.location} aged ${brief.ageRange}`,
      size: 50000 + Math.floor(Math.random() * 100000)
    }];
  }

  /**
   * Convertit le type d'entité en nom lisible
   */
  private getEntityTypeName(type: EntityUrn): string {
    const typeNames: Record<EntityUrn, string> = {
      'urn:entity:brand': 'Brand',
      'urn:entity:artist': 'Artist',
      'urn:entity:movie': 'Movie',
      'urn:entity:tv_show': 'TV Show',
      'urn:entity:book': 'Book',
      'urn:entity:song': 'Song',
      'urn:entity:album': 'Album',
      'urn:entity:restaurant': 'Restaurant',
      'urn:entity:product': 'Product',
      'urn:entity:location': 'Location'
    };
    return typeNames[type] || 'Entity';
  }

  /**
   * Génère un ID de requête unique
   */
  private generateRequestId(): string {
    // Fallback compatible pour les environnements sans crypto.randomUUID
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    
    // Fallback simple pour les tests et environnements sans crypto
    return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Retourne les statistiques du service
   */
  getStats() {
    return this.client.getStats();
  }
}

// Instance par défaut
let defaultIntegrationService: QlooIntegrationService | null = null;

export function getQlooIntegrationService(): QlooIntegrationService {
  if (!defaultIntegrationService) {
    defaultIntegrationService = new QlooIntegrationService();
  }
  return defaultIntegrationService;
}

// Export pour utilisation directe
export const qlooIntegration = (() => {
  let service: QlooIntegrationService | null = null;
  return {
    get instance() {
      if (!service) {
        service = getQlooIntegrationService();
      }
      return service;
    }
  };
})();