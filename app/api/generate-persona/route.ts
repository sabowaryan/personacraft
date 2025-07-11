import { NextRequest, NextResponse } from 'next/server';
import { GeminiClient } from '@/lib/api/gemini';
import { QlooClient } from '@/lib/api/qloo';

// Types
interface GeneratePersonaRequest {
  description: string;
  ageRange: string;
  location: string;
  interests: string[];
  values: string[];
  generateMultiple: boolean;
}

interface PersonaResponse {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  values: string[];
  interests: {
    music: string[];
    brands: string[];
    movies: string[];
    food: string[];
    books: string[];
    lifestyle: string[];
  };
  communication: {
    preferredChannels: string[];
    tone: string;
    contentTypes: string[];
    frequency: string;
  };
  marketing: {
    painPoints: string[];
    motivations: string[];
    buyingBehavior: string;
    influences: string[];
  };
  quote: string;
  generatedAt: string;
  sources: string[];
  avatar?: string;
}

// Fonction utilitaire pour générer un âge dans la tranche
function generateAgeFromRange(ageRange: string): number {
  const ranges: Record<string, [number, number]> = {
    '18-25': [18, 25],
    '25-35': [25, 35],
    '35-45': [35, 45],
    '45-55': [45, 55],
    '55-65': [55, 65],
    '65+': [65, 80]
  };
  
  const [min, max] = ranges[ageRange] || [25, 35];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Orchestration complète de génération de persona
async function generatePersonaComplete(request: GeneratePersonaRequest): Promise<PersonaResponse> {
  try {
    // 1. Appel à l'API Qloo pour obtenir des recommandations culturelles
    const qlooClient = new QlooClient(process.env.QLOO_API_KEY);
    
    const qlooData = await qlooClient.getRecommendations({
      interests: request.interests,
      demographics: {
        age: generateAgeFromRange(request.ageRange),
        location: request.location || 'France'
      },
      categories: ['music', 'brands', 'movies', 'food', 'books', 'lifestyle']
    });

    // 2. Construction du prompt pour Gemini
    const geminiClient = new GeminiClient(process.env.GEMINI_API_KEY);
    
    const prompt = GeminiClient.buildPersonaPrompt(
      request.description,
      request.interests,
      request.values,
      {
        ageRange: request.ageRange,
        location: request.location
      },
      qlooData
    );

    // 3. Génération du persona avec Gemini
    const personaData = await geminiClient.generatePersona(prompt, qlooData);
    
    // 4. Validation et enrichissement des données
    if (!GeminiClient.validatePersonaResponse(personaData)) {
      throw new Error('Invalid response format from AI');
    }

    // 5. Construction de la réponse finale
    const persona: PersonaResponse = {
      id: crypto.randomUUID(),
      ...personaData,
      generatedAt: new Date().toISOString(),
      sources: ['Qloo Taste AI', 'Google Gemini', 'Analyse comportementale'],
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=150&h=150&fit=crop&crop=face&auto=format&q=80`
    };

    return persona;

  } catch (error) {
    console.error('Error in persona generation:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GeneratePersonaRequest = await request.json();
    
    // Validation des données d'entrée
    if (!body.description || body.description.length < 10) {
      return NextResponse.json(
        { error: 'Description must be at least 10 characters long' },
        { status: 400 }
      );
    }

    if (!body.interests || body.interests.length === 0) {
      return NextResponse.json(
        { error: 'At least one interest is required' },
        { status: 400 }
      );
    }

    if (!body.values || body.values.length === 0) {
      return NextResponse.json(
        { error: 'At least one value is required' },
        { status: 400 }
      );
    }

    // Vérifier la configuration des APIs
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API not configured' },
        { status: 500 }
      );
    }

    // Génération des personas
    const personaCount = body.generateMultiple ? 3 : 1;
    const personas: PersonaResponse[] = [];

    for (let i = 0; i < personaCount; i++) {
      try {
        const persona = await generatePersonaComplete(body);
        personas.push(persona);
        
        // Délai entre les générations pour éviter la surcharge
        if (i < personaCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Error generating persona ${i + 1}:`, error);
        // Continue avec les autres personas même si une génération échoue
      }
    }

    if (personas.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate any personas' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      personas,
      metadata: {
        generated_count: personas.length,
        requested_count: personaCount,
        generation_time: new Date().toISOString(),
        sources_used: ['Qloo Taste AI', 'Google Gemini'],
        api_status: {
          gemini: process.env.GEMINI_API_KEY ? 'active' : 'inactive',
          qloo: process.env.QLOO_API_KEY ? 'active' : 'simulated'
        }
      }
    });

  } catch (error) {
    console.error('Generate Persona API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during persona generation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Generate Persona API endpoint',
      methods: ['POST'],
      description: 'Orchestrate complete persona generation using Qloo and Gemini APIs',
      required_fields: ['description', 'interests', 'values'],
      optional_fields: ['ageRange', 'location', 'generateMultiple'],
      api_status: {
        gemini: process.env.GEMINI_API_KEY ? 'configured' : 'not configured',
        qloo: process.env.QLOO_API_KEY ? 'configured' : 'not configured'
      }
    },
    { status: 200 }
  );
}