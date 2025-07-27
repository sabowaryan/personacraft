import { NextRequest, NextResponse } from 'next/server';
import { getQlooClient } from '@/lib/api/qloo';
import { getAuthenticatedUser } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { personas } = await request.json();

    if (!personas || !Array.isArray(personas)) {
      return NextResponse.json(
        { error: 'Personas requis pour l\'enrichissement' },
        { status: 400 }
      );
    }

    const qlooClient = getQlooClient();
    const enrichedPersonas = await qlooClient.enrichPersonas(personas);

    // 🔍 LOG DÉTAILLÉ: Données finales envoyées au client
    console.log('\n=== DONNÉES FINALES ENVOYÉES AU CLIENT ===');
    console.log('Nombre de personas enrichies:', enrichedPersonas.length);
    enrichedPersonas.forEach((persona, index) => {
      console.log(`\nPersona ${index + 1}: ${persona.name || 'Sans nom'}`);
      if (persona.culturalData) {
        console.log('  Données culturelles présentes:');
        Object.entries(persona.culturalData).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            console.log(`    ${key}: ${value.length} éléments -`, value);
          } else {
            console.log(`    ${key}:`, value);
          }
        });
      } else {
        console.log('  ⚠️ Aucune donnée culturelle');
      }
    });
    console.log('=== FIN DONNÉES FINALES ===\n');

    return NextResponse.json({
      success: true,
      personas: enrichedPersonas,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur lors de l\'enrichissement Qloo:', error);
    
    // Handle specific error types
    if (error instanceof Error && error.message === 'Auth timeout') {
      return NextResponse.json(
        { error: 'Timeout d\'authentification' },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Route pour tester la connexion Qloo
export async function GET() {
  try {
    const qlooClient = getQlooClient();
    const isConnected = await qlooClient.testConnection();
    const status = qlooClient.getApiStatus();

    return NextResponse.json({
      success: true,
      connected: isConnected,
      status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur test connexion Qloo:', error);
    return NextResponse.json({
      success: false,
      connected: false,
      error: 'Erreur de connexion'
    });
  }
}

