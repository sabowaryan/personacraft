import { NextRequest, NextResponse } from 'next/server';

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
    const qlooResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/qloo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        interests: request.interests,
        demographics: {
          age: generateAgeFromRange(request.ageRange),
          location: request.location
        },
        categories: ['music', 'brands', 'movies', 'food', 'books', 'lifestyle']
      })
    });

    const qlooData = await qlooResponse.json();

    // 2. Construction du prompt pour Gemini
    const prompt = `
Génère un persona marketing authentique avec ces paramètres :

CONTEXTE DU PROJET :
${request.description}

DÉMOGRAPHIE :
- Âge : ${request.ageRange} ans
- Localisation : ${request.location || 'France'}

INTÉRÊTS PRINCIPAUX :
${request.interests.join(', ')}

VALEURS IMPORTANTES :
${request.values.join(', ')}

RECOMMANDATIONS CULTURELLES (basées sur Qloo AI) :
${qlooData.recommendations?.map((r: any) => `- ${r.type}: ${r.name} (confiance: ${Math.round(r.confidence * 100)}%)`).join('\n') || 'Aucune recommandation disponible'}

Crée un persona cohérent qui reflète ces données culturelles et ces valeurs.
Le persona doit être réaliste, détaillé et utilisable pour des stratégies marketing.
`;

    // 3. Appel à l'API Gemini pour générer le persona
    const geminiResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/gemini`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        context: qlooData,
        parameters: {
          temperature: 0.8,
          maxTokens: 2000,
          format: 'json'
        }
      })
    });

    const geminiData = await geminiResponse.json();
    
    // 4. Parse et validation du contenu généré
    let personaContent;
    try {
      personaContent = JSON.parse(geminiData.content);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      throw new Error('Invalid response format from AI');
    }

    // 5. Construction de la réponse finale
    const persona: PersonaResponse = {
      id: crypto.randomUUID(),
      ...personaContent,
      generatedAt: new Date().toISOString(),
      sources: ['Qloo Taste AI', 'Google Gemini', 'Analyse comportementale'],
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=150&h=150&fit=crop&crop=face`
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

    // Génération des personas
    const personaCount = body.generateMultiple ? 3 : 1;
    const personas: PersonaResponse[] = [];

    for (let i = 0; i < personaCount; i++) {
      try {
        const persona = await generatePersonaComplete(body);
        personas.push(persona);
        
        // Délai entre les générations pour éviter la surcharge
        if (i < personaCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
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
        sources_used: ['Qloo Taste AI', 'Google Gemini']
      }
    });

  } catch (error) {
    console.error('Generate Persona API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error during persona generation' },
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
      optional_fields: ['ageRange', 'location', 'generateMultiple']
    },
    { status: 200 }
  );
}