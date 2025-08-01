import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/api/gemini';
import { getAuthenticatedUser } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    // Utiliser la fonction centralisée d'authentification
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { brief, userContext } = await request.json();

    if (!brief) {
      return NextResponse.json(
        { error: 'Brief marketing requis' },
        { status: 400 }
      );
    }

    const geminiClient = getGeminiClient();
    const personas = await geminiClient.generatePersonas(brief, userContext);

    return NextResponse.json({
      success: true,
      personas,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de la génération Gemini:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Route pour tester la connexion Gemini
export async function GET() {
  try {
    const geminiClient = getGeminiClient();
    const isConnected = await geminiClient.testConnection();

    return NextResponse.json({
      success: true,
      connected: isConnected,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur test connexion Gemini:', error);
    return NextResponse.json({
      success: false,
      connected: false,
      error: 'Erreur de connexion'
    });
  }
}

