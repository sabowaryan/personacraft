// Client API pour Qloo Taste AI

export interface QlooRequest {
  interests: string[];
  demographics: {
    age: number;
    location: string;
  };
  categories: string[];
}

export interface QlooRecommendation {
  id: string;
  type: 'music' | 'brand' | 'movie' | 'food' | 'book' | 'lifestyle';
  name: string;
  confidence: number;
  attributes: {
    genre?: string;
    category?: string;
    popularity?: number;
    cultural_relevance?: number;
  };
}

export interface QlooResponse {
  recommendations: QlooRecommendation[];
  metadata: {
    total_results: number;
    confidence_threshold: number;
    processing_time: number;
  };
}

export class QlooClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    this.apiKey = apiKey || process.env.QLOO_API_KEY || '';
  }

  async getRecommendations(request: QlooRequest): Promise<QlooResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/qloo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Qloo API Error:', error);
      throw new Error(`Failed to get recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRecommendationsByCategory(
    interests: string[], 
    demographics: { age: number; location: string }, 
    category: string
  ): Promise<QlooRecommendation[]> {
    const response = await this.getRecommendations({
      interests,
      demographics,
      categories: [category]
    });

    return response.recommendations.filter(rec => rec.type === category);
  }

  // Méthodes utilitaires
  static filterByConfidence(recommendations: QlooRecommendation[], minConfidence: number = 0.7): QlooRecommendation[] {
    return recommendations.filter(rec => rec.confidence >= minConfidence);
  }

  static sortByConfidence(recommendations: QlooRecommendation[]): QlooRecommendation[] {
    return [...recommendations].sort((a, b) => b.confidence - a.confidence);
  }

  static groupByType(recommendations: QlooRecommendation[]): Record<string, QlooRecommendation[]> {
    return recommendations.reduce((acc, rec) => {
      if (!acc[rec.type]) {
        acc[rec.type] = [];
      }
      acc[rec.type].push(rec);
      return acc;
    }, {} as Record<string, QlooRecommendation[]>);
  }
}

// Instance par défaut
export const qlooClient = new QlooClient();