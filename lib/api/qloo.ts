// Client API pour Qloo Taste AI avec vraie intégration

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
    this.baseUrl = process.env.QLOO_API_URL || 'https://hackathon.api.qloo.com';
    this.apiKey = apiKey || process.env.QLOO_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('Clé API Qloo manquante, utilisation des données simulées');
    }
  }

  async getRecommendations(request: QlooRequest): Promise<QlooResponse> {
    if (!this.apiKey) {
      return this.getMockRecommendations(request);
    }

    try {
      const response = await fetch(`${this.baseUrl}/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({
          user_profile: {
            interests: request.interests,
            demographics: {
              age: request.demographics.age,
              location: request.demographics.location
            }
          },
          categories: request.categories,
          max_results: 20,
          min_confidence: 0.6
        })
      });

      if (!response.ok) {
        console.warn(`Erreur API Qloo (${response.status}), utilisation des données simulées`);
        return this.getMockRecommendations(request);
      }

      const data = await response.json();
      return this.transformQlooResponse(data);

    } catch (error) {
      console.warn('Erreur lors de l\'appel à Qloo API, utilisation des données simulées:', error);
      return this.getMockRecommendations(request);
    }
  }

  private transformQlooResponse(data: any): QlooResponse {
    const recommendations: QlooRecommendation[] = [];
    
    if (data.recommendations) {
      data.recommendations.forEach((item: any) => {
        recommendations.push({
          id: item.id || Math.random().toString(36).substr(2, 9),
          type: this.mapQlooCategory(item.category),
          name: item.name || item.title,
          confidence: item.confidence || Math.random() * 0.4 + 0.6,
          attributes: {
            genre: item.genre,
            category: item.category,
            popularity: item.popularity,
            cultural_relevance: item.cultural_relevance
          }
        });
      });
    }

    return {
      recommendations,
      metadata: {
        total_results: recommendations.length,
        confidence_threshold: 0.6,
        processing_time: data.processing_time || 800
      }
    };
  }

  private mapQlooCategory(category: string): QlooRecommendation['type'] {
    const mapping: Record<string, QlooRecommendation['type']> = {
      'music': 'music',
      'brand': 'brand',
      'brands': 'brand',
      'movie': 'movie',
      'movies': 'movie',
      'film': 'movie',
      'food': 'food',
      'restaurant': 'food',
      'book': 'book',
      'books': 'book',
      'lifestyle': 'lifestyle',
      'activity': 'lifestyle'
    };

    return mapping[category.toLowerCase()] || 'lifestyle';
  }

  private getMockRecommendations(request: QlooRequest): QlooResponse {
    const mockData: Record<string, QlooRecommendation[]> = {
      music: [
        { id: '1', type: 'music', name: 'Indie Pop', confidence: 0.85, attributes: { genre: 'Alternative', popularity: 78 } },
        { id: '2', type: 'music', name: 'Electronic', confidence: 0.72, attributes: { genre: 'Dance', popularity: 82 } },
        { id: '3', type: 'music', name: 'Jazz Fusion', confidence: 0.68, attributes: { genre: 'Jazz', popularity: 45 } },
      ],
      brand: [
        { id: '4', type: 'brand', name: 'Patagonia', confidence: 0.91, attributes: { category: 'Outdoor', cultural_relevance: 88 } },
        { id: '5', type: 'brand', name: 'Tesla', confidence: 0.84, attributes: { category: 'Tech', cultural_relevance: 92 } },
        { id: '6', type: 'brand', name: 'Whole Foods', confidence: 0.76, attributes: { category: 'Food', cultural_relevance: 71 } },
      ],
      movie: [
        { id: '7', type: 'movie', name: 'Dune', confidence: 0.79, attributes: { genre: 'Sci-Fi', popularity: 85 } },
        { id: '8', type: 'movie', name: 'Parasite', confidence: 0.88, attributes: { genre: 'Thriller', popularity: 91 } },
        { id: '9', type: 'movie', name: 'Her', confidence: 0.73, attributes: { genre: 'Drama', popularity: 67 } },
      ],
      food: [
        { id: '10', type: 'food', name: 'Sushi', confidence: 0.82, attributes: { category: 'Japanese', cultural_relevance: 89 } },
        { id: '11', type: 'food', name: 'Avocado Toast', confidence: 0.75, attributes: { category: 'Healthy', cultural_relevance: 76 } },
        { id: '12', type: 'food', name: 'Craft Coffee', confidence: 0.87, attributes: { category: 'Beverage', cultural_relevance: 83 } },
      ],
      book: [
        { id: '13', type: 'book', name: 'Atomic Habits', confidence: 0.89, attributes: { genre: 'Self-Help', popularity: 94 } },
        { id: '14', type: 'book', name: 'Sapiens', confidence: 0.86, attributes: { genre: 'History', popularity: 88 } },
        { id: '15', type: 'book', name: 'The Design of Everyday Things', confidence: 0.71, attributes: { genre: 'Design', popularity: 65 } },
      ],
      lifestyle: [
        { id: '16', type: 'lifestyle', name: 'Yoga', confidence: 0.83, attributes: { category: 'Wellness', cultural_relevance: 81 } },
        { id: '17', type: 'lifestyle', name: 'Sustainable Living', confidence: 0.78, attributes: { category: 'Environment', cultural_relevance: 74 } },
        { id: '18', type: 'lifestyle', name: 'Digital Nomad', confidence: 0.69, attributes: { category: 'Work', cultural_relevance: 72 } },
      ],
    };

    const recommendations: QlooRecommendation[] = [];
    
    request.categories.forEach(category => {
      const categoryKey = category === 'brands' ? 'brand' : category;
      if (mockData[categoryKey]) {
        const items = mockData[categoryKey];
        const selectedCount = Math.floor(Math.random() * 3) + 2;
        const selectedItems = items
          .sort(() => 0.5 - Math.random())
          .slice(0, selectedCount);
        
        recommendations.push(...selectedItems);
      }
    });

    return {
      recommendations,
      metadata: {
        total_results: recommendations.length,
        confidence_threshold: 0.6,
        processing_time: 800
      }
    };
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