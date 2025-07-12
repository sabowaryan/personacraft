import { NextRequest, NextResponse } from 'next/server';
import { QlooClient } from '@/lib/api/qloo';
import { QlooRequest } from '@/lib/types/qloo';

// Configuration pour l'export statique
export const dynamic = 'force-dynamic';

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

    // Créer le client Qloo - lèvera une erreur si pas de clé API
    const qlooClient = new QlooClient(process.env.QLOO_API_KEY);
    
    // Obtenir les recommandations
    const response = await qlooClient.getRecommendations(body);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Qloo API Error:', error);
    
    // Retourner l'erreur sans fallback
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    if (errorMessage.includes('Qloo API key is required')) {
      return NextResponse.json(
        { 
          error: 'Qloo API key is required',
          message: 'Please configure QLOO_API_KEY environment variable. Get your API key at https://docs.qloo.com/',
          code: 'API_KEY_MISSING'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Qloo API request failed',
        message: errorMessage,
        code: 'API_REQUEST_FAILED'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const hasApiKey = !!process.env.QLOO_API_KEY;
  
  return NextResponse.json(
    { 
      message: 'Qloo API endpoint',
      methods: ['POST'],
      description: 'Get cultural taste recommendations based on interests and demographics',
      status: hasApiKey ? 'configured' : 'not configured - API key required',
      api_key_required: true,
      documentation: 'https://docs.qloo.com/'
    },
    { status: hasApiKey ? 200 : 400 }
  );
}
