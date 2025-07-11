import { NextRequest, NextResponse } from 'next/server';

// Types pour l'API Qloo
interface QlooRequest {
  interests: string[];
  demographics: {
    age: number;
    location: string;
  };
  categories: string[];
}

interface QlooRecommendation {
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

interface QlooResponse {
  recommendations: QlooRecommendation[];
  metadata: {
    total_results: number;
    confidence_threshold: number;
    processing_time: number;
  };
}

// Données simulées pour démonstration (remplacer par vraie API Qloo)
const mockQlooData: Record<string, QlooRecommendation[]> = {
  music: [
    { id: '1', type: 'music', name: 'Indie Pop', confidence: 0.85, attributes: { genre: 'Alternative', popularity: 78 } },
    { id: '2', type: 'music', name: 'Electronic', confidence: 0.72, attributes: { genre: 'Dance', popularity: 82 } },
    { id: '3', type: 'music', name: 'Jazz Fusion', confidence: 0.68, attributes: { genre: 'Jazz', popularity: 45 } },
  ],
  brands: [
    { id: '4', type: 'brand', name: 'Patagonia', confidence: 0.91, attributes: { category: 'Outdoor', cultural_relevance: 88 } },
    { id: '5', type: 'brand', name: 'Tesla', confidence: 0.84, attributes: { category: 'Tech', cultural_relevance: 92 } },
    { id: '6', type: 'brand', name: 'Whole Foods', confidence: 0.76, attributes: { category: 'Food', cultural_relevance: 71 } },
  ],
  movies: [
    { id: '7', type: 'movie', name: 'Dune', confidence: 0.79, attributes: { genre: 'Sci-Fi', popularity: 85 } },
    { id: '8', type: 'movie', name: 'Parasite', confidence: 0.88, attributes: { genre: 'Thriller', popularity: 91 } },
    { id: '9', type: 'movie', name: 'Her', confidence: 0.73, attributes: { genre: 'Drama', popularity: 67 } },
  ],
  food: [
    { id: '10', type: 'food', name: 'Sushi', confidence: 0.82, attributes: { category: 'Japanese', cultural_relevance: 89 } },
    { id: '11', type: 'food', name: 'Avocado Toast', confidence: 0.75, attributes: { category: 'Healthy', cultural_relevance: 76 } },
    { id: '12', type: 'food', name: 'Craft Coffee', confidence: 0.87, attributes: { category: 'Beverage', cultural_relevance: 83 } },
  ],
  books: [
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

export async function POST(request: NextRequest) {
  try {
    const body: QlooRequest = await request.json();
    
    // Validation des données d'entrée
    if (!body.interests || !Array.isArray(body.interests) || body.interests.length === 0) {
      return NextResponse.json(
        { error: 'Interests array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Simulation d'un délai d'API
    await new Promise(resolve => setTimeout(resolve, 800));

    // Génération des recommandations basées sur les intérêts
    const recommendations: QlooRecommendation[] = [];
    const categories = body.categories || ['music', 'brands', 'movies', 'food', 'books', 'lifestyle'];

    categories.forEach(category => {
      if (mockQlooData[category]) {
        // Sélection aléatoire de 2-4 items par catégorie
        const categoryItems = mockQlooData[category];
        const selectedCount = Math.floor(Math.random() * 3) + 2; // 2-4 items
        const selectedItems = categoryItems
          .sort(() => 0.5 - Math.random())
          .slice(0, selectedCount);
        
        recommendations.push(...selectedItems);
      }
    });

    // Ajustement des scores de confiance basé sur les intérêts utilisateur
    const adjustedRecommendations = recommendations.map(rec => ({
      ...rec,
      confidence: Math.min(0.95, rec.confidence + (Math.random() * 0.1 - 0.05))
    }));

    const response: QlooResponse = {
      recommendations: adjustedRecommendations,
      metadata: {
        total_results: adjustedRecommendations.length,
        confidence_threshold: 0.6,
        processing_time: 800
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Qloo API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Qloo API endpoint',
      methods: ['POST'],
      description: 'Get cultural taste recommendations based on interests and demographics'
    },
    { status: 200 }
  );
}