import { NextRequest, NextResponse } from 'next/server';
import { QlooClient } from '@/lib/api/qloo';
import { QlooRequest } from '@/lib/types/qloo';

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

    if (!body.demographics || !body.demographics.age) {
      return NextResponse.json(
        { error: 'Demographics with age are required' },
        { status: 400 }
      );
    }

    // Créer le client Qloo
    const qlooClient = new QlooClient(process.env.QLOO_API_KEY);
    
    // Obtenir les recommandations
    const response = await qlooClient.getRecommendations(body);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Qloo API Error:', error);
    
    // En cas d'erreur, retourner des données simulées
    const qlooClient = new QlooClient(); // Sans clé API = mode simulation
    const body: QlooRequest = await request.json();
    const fallbackResponse = await qlooClient.getRecommendations(body);
    
    return NextResponse.json({
      ...fallbackResponse,
      warning: 'Using simulated data due to API error'
    });
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Qloo API endpoint',
      methods: ['POST'],
      description: 'Get cultural taste recommendations based on interests and demographics',
      status: process.env.QLOO_API_KEY ? 'configured' : 'using simulated data'
    },
    { status: 200 }
  );
}
