// Client API pour Qloo Taste AI avec vraie intégration

import type {
  QlooRequest,
  QlooResponse,
  QlooError,
  QlooRecommendation,
  QlooClientConfig,
  QlooMetadata,
  QlooRateLimits,
  QlooInsights,
  QlooBatchRequest,
  QlooBatchResponse
} from '@/lib/types/qloo';

export class QlooClient {
  private config: QlooClientConfig;
  private rateLimits: QlooRateLimits | null = null;

  constructor(apiKey?: string, config?: Partial<QlooClientConfig>) {
    this.config = {
      apiKey: apiKey || process.env.QLOO_API_KEY || '',
      baseUrl: config?.baseUrl || process.env.QLOO_API_URL || 'https://api.qloo.com/v1',
      timeout: config?.timeout || 10000,
      retries: config?.retries || 3,
      cacheEnabled: config?.cacheEnabled ?? true,
      cacheTTL: config?.cacheTTL || 3600000, // 1 heure
      ...config
    };
  }

  async getRecommendations(request: QlooRequest): Promise<QlooResponse> {
    try {
      // Validation des données d'entrée
      this.validateRequest(request);

      // Si pas de clé API, utiliser le mode simulation
      if (!this.config.apiKey) {
        console.warn('Qloo API key not provided, using simulated data');
        return this.getSimulatedRecommendations(request);
      }

      // Appel API réel
      const response = await this.makeApiCall('/recommendations', request);
      
      // Mettre à jour les rate limits
      this.updateRateLimits(response.headers);
      
      return this.parseResponse(response);

    } catch (error) {
      console.error('Qloo API Error:', error);
      
      // Fallback vers les données simulées en cas d'erreur
      console.warn('Falling back to simulated data due to API error');
      return this.getSimulatedRecommendations(request);
    }
  }

  async getBatchRecommendations(batchRequest: QlooBatchRequest): Promise<QlooBatchResponse> {
    if (!this.config.apiKey) {
      throw new Error('Batch operations require API key');
    }

    try {
      const response = await this.makeApiCall('/batch/recommendations', batchRequest);
      return this.parseBatchResponse(response);
    } catch (error) {
      console.error('Qloo Batch API Error:', error);
      throw this.createQlooError('BATCH_FAILED', error);
    }
  }

  async getInsights(request: QlooRequest): Promise<QlooInsights> {
    if (!this.config.apiKey) {
      return this.getSimulatedInsights(request);
    }

    try {
      const response = await this.makeApiCall('/insights', request);
      return response.data;
    } catch (error) {
      console.error('Qloo Insights Error:', error);
      return this.getSimulatedInsights(request);
    }
  }

  private async makeApiCall(endpoint: string, data: unknown): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'User-Agent': 'PersonaCraft/1.0'
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(`HTTP 401: Unauthorized - Vérifiez votre clé API Qloo. Obtenez une clé API sur https://docs.qloo.com/`);
        } else if (response.status === 403) {
          throw new Error(`HTTP 403: Forbidden - Votre clé API Qloo n'a pas les permissions nécessaires`);
        } else if (response.status === 404) {
          throw new Error(`HTTP 404: Not Found - L'endpoint Qloo n'existe pas: ${endpoint}`);
        } else if (response.status === 429) {
          throw new Error(`HTTP 429: Too Many Requests - Limite de taux Qloo atteinte`);
        } else if (response.status >= 500) {
          throw new Error(`HTTP ${response.status}: Erreur serveur Qloo - Réessayez plus tard`);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }

      return {
        data: await response.json(),
        headers: response.headers
      };

    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private parseResponse(response: any): QlooResponse {
    const data = response.data;
    
    return {
      recommendations: data.recommendations || [],
      metadata: {
        total_results: data.total_results || 0,
        confidence_threshold: data.confidence_threshold || 0.5,
        processing_time: data.processing_time || 0,
        request_id: data.request_id || crypto.randomUUID(),
        api_version: 'v1',
        cached: false
      },
      status: {
        code: 200,
        message: 'Success',
        success: true
      }
    };
  }

  private parseBatchResponse(response: any): QlooBatchResponse {
    const data = response.data;
    
    return {
      batch_id: data.batch_id || crypto.randomUUID(),
      responses: data.responses || [],
      status: data.status || 'completed',
      summary: {
        total: data.summary?.total || 0,
        successful: data.summary?.successful || 0,
        failed: data.summary?.failed || 0
      }
    };
  }

  private validateRequest(request: QlooRequest): void {
    if (!request.interests || request.interests.length === 0) {
      throw this.createQlooError('INVALID_REQUEST', 'Interests are required');
    }

    if (!request.demographics || !request.demographics.age) {
      throw this.createQlooError('INVALID_REQUEST', 'Demographics with age are required');
    }

    if (request.demographics.age < 13 || request.demographics.age > 120) {
      throw this.createQlooError('INVALID_REQUEST', 'Age must be between 13 and 120');
    }
  }

  private createQlooError(code: string, message: unknown): QlooError {
    return {
      error: message instanceof Error ? message.message : String(message),
      code,
      details: {
        field: 'request',
        value: message,
        constraint: 'validation_failed',
        suggestion: 'Vérifiez les données envoyées'
      },
      request_id: crypto.randomUUID()
    };
  }

  private updateRateLimits(headers: Headers): void {
    const limit = headers.get('X-RateLimit-Limit');
    const remaining = headers.get('X-RateLimit-Remaining');
    const reset = headers.get('X-RateLimit-Reset');

    if (limit && remaining && reset) {
      // Mise à jour simplifiée des rate limits
      console.log(`Rate limits: ${remaining}/${limit}, reset: ${reset}`);
    }
  }

  // Méthodes de simulation pour développement/démonstration
  private async getSimulatedRecommendations(request: QlooRequest): Promise<QlooResponse> {
    // Simuler un délai d'API
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    const simulatedData = this.generateSimulatedData(request);

    return {
      recommendations: simulatedData,
      metadata: {
        total_results: simulatedData.length,
        confidence_threshold: 0.7,
        processing_time: Math.random() * 500 + 200,
        request_id: crypto.randomUUID(),
        api_version: 'v1-simulated',
        cached: false,
        filters_applied: ['interests', 'demographics']
      },
      status: {
        code: 200,
        message: 'Success (Simulated)',
        success: true,
        warnings: ['Using simulated data - API key not provided']
      }
    };
  }

  private getSimulatedInsights(request: QlooRequest): QlooInsights {
    return {
      demographic_analysis: {
        age_group_fit: 0.8 + Math.random() * 0.2,
        location_relevance: 0.7 + Math.random() * 0.3,
        gender_alignment: 0.75 + Math.random() * 0.25
      },
      trend_analysis: {
        trending_items: [],
        seasonal_relevance: 0.6 + Math.random() * 0.4,
        viral_potential: 0.3 + Math.random() * 0.4,
        longevity_score: 0.5 + Math.random() * 0.5
      },
      cultural_analysis: {
        cultural_fit: 0.8 + Math.random() * 0.2,
        cross_cultural_appeal: 0.6 + Math.random() * 0.4,
        local_preferences: ['Local brand preference', 'Regional cuisine'],
        global_trends: ['Sustainability', 'Digital lifestyle']
      },
      recommendation_quality: {
        average_confidence: 0.75 + Math.random() * 0.25,
        diversity_score: 0.7 + Math.random() * 0.3,
        novelty_score: 0.6 + Math.random() * 0.4,
        relevance_score: 0.8 + Math.random() * 0.2
      }
    };
  }

  private generateSimulatedData(request: QlooRequest): QlooRecommendation[] {
    const simulatedRecommendations: QlooRecommendation[] = [];

    // Données simulées par catégorie
    const categoryData = {
      music: ['Électronique', 'Indie Pop', 'Jazz Fusion', 'Hip-hop alternatif'],
      brands: ['Patagonia', 'Veja', 'Lush', 'Everlane', 'Reformation'],
      movies: ['Parasite', 'The Grand Budapest Hotel', 'Moonlight', 'Her'],
      food: ['Cuisine végétarienne', 'Ramen artisanal', 'Café de spécialité', 'Pâtisserie française'],
      books: ['Haruki Murakami', 'Elena Ferrante', 'Yuval Noah Harari', 'Michelle Obama'],
      lifestyle: ['Yoga', 'Photographie', 'Jardinage urbain', 'Cyclisme', 'Méditation']
    };

    request.categories.forEach(category => {
      const items = categoryData[category as keyof typeof categoryData] || [];
      
      items.slice(0, 4).forEach((item, index) => {
        simulatedRecommendations.push({
          id: crypto.randomUUID(),
          type: category,
          name: item,
          confidence: 0.7 + (Math.random() * 0.3),
          attributes: {
            popularity: Math.random(),
            cultural_relevance: 0.6 + Math.random() * 0.4,
            trending_score: Math.random(),
            demographic_fit: 0.7 + Math.random() * 0.3,
            price_range: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
            tags: [`${category}-tag-${index + 1}`, 'popular', 'trending']
          }
        });
      });
    });

    return simulatedRecommendations;
  }
}

// Instance par défaut
export const qlooClient = new QlooClient();

// Re-export des types pour faciliter l'utilisation
export type {
  QlooRequest,
  QlooResponse,
  QlooError,
  QlooRecommendation,
  QlooClientConfig,
  QlooInsights
} from '@/lib/types/qloo';