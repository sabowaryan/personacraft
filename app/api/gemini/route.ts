import { NextRequest, NextResponse } from 'next/server';

// Types pour l'API Gemini
interface GeminiRequest {
  prompt: string;
  context?: any;
  parameters?: {
    temperature?: number;
    maxTokens?: number;
    format?: 'json' | 'text';
  };
}

interface GeminiResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: string;
}

// Prompts prédéfinis pour la génération de personas
const PERSONA_PROMPTS = {
  base: `Tu es un expert en marketing et en création de personas. Génère un persona marketing détaillé et authentique basé sur les informations fournies.`,
  
  structure: `
Le persona doit inclure :
- Nom complet réaliste
- Âge précis
- Localisation (ville, pays)
- Biographie personnelle (2-3 phrases)
- Citation personnelle authentique
- Valeurs fondamentales
- Centres d'intérêt détaillés par catégorie
- Profil de communication (canaux, ton, fréquence)
- Profil marketing (points de douleur, motivations, comportement d'achat)
`,

  format: `
Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
{
  "name": "string",
  "age": number,
  "location": "string",
  "bio": "string",
  "quote": "string",
  "values": ["string"],
  "interests": {
    "music": ["string"],
    "brands": ["string"],
    "movies": ["string"],
    "food": ["string"],
    "books": ["string"],
    "lifestyle": ["string"]
  },
  "communication": {
    "preferredChannels": ["string"],
    "tone": "string",
    "contentTypes": ["string"],
    "frequency": "string"
  },
  "marketing": {
    "painPoints": ["string"],
    "motivations": ["string"],
    "buyingBehavior": "string",
    "influences": ["string"]
  }
}
`
};

// Simulation de réponse Gemini (remplacer par vraie API)
function generateMockPersona(prompt: string, context: any): any {
  const names = [
    'Sophie Moreau', 'Alexandre Dubois', 'Emma Chen', 'Lucas Martin', 
    'Maya Patel', 'Thomas Rodriguez', 'Léa Müller', 'Noah Johnson'
  ];
  
  const locations = [
    'Paris, France', 'Lyon, France', 'Marseille, France', 'Toulouse, France',
    'Montreal, Canada', 'Londres, UK', 'Berlin, Allemagne', 'Barcelona, Espagne'
  ];
  
  const quotes = [
    "La créativité naît de la contrainte et s'épanouit dans la liberté.",
    "Je crois au pouvoir des petites actions pour créer de grands changements.",
    "L'authenticité est ma boussole dans un monde de façades.",
    "Chaque jour est une opportunité d'apprendre et de grandir.",
    "La diversité enrichit nos perspectives et nos expériences.",
    "L'équilibre entre ambition et bien-être guide mes choix.",
    "Je valorise les relations humaines authentiques avant tout.",
    "L'innovation responsable peut transformer notre société."
  ];

  const tones = ['Décontracté', 'Professionnel', 'Inspirant', 'Authentique', 'Bienveillant'];
  const frequencies = ['Quotidien', 'Hebdomadaire', 'Bi-hebdomadaire', 'Mensuel'];
  
  // Utilisation du contexte Qloo si disponible
  const contextInterests = context?.recommendations || [];
  
  const musicItems = contextInterests.filter((r: any) => r.type === 'music').map((r: any) => r.name);
  const brandItems = contextInterests.filter((r: any) => r.type === 'brand').map((r: any) => r.name);
  const movieItems = contextInterests.filter((r: any) => r.type === 'movie').map((r: any) => r.name);
  const foodItems = contextInterests.filter((r: any) => r.type === 'food').map((r: any) => r.name);
  const bookItems = contextInterests.filter((r: any) => r.type === 'book').map((r: any) => r.name);
  const lifestyleItems = contextInterests.filter((r: any) => r.type === 'lifestyle').map((r: any) => r.name);

  return {
    name: names[Math.floor(Math.random() * names.length)],
    age: Math.floor(Math.random() * 40) + 25, // 25-65 ans
    location: locations[Math.floor(Math.random() * locations.length)],
    bio: `Professionnel créatif passionné par l'innovation et l'authenticité. Toujours à la recherche de nouvelles expériences enrichissantes et de connexions humaines significatives. Valorise l'équilibre entre vie professionnelle et personnelle.`,
    quote: quotes[Math.floor(Math.random() * quotes.length)],
    values: ['Authenticité', 'Innovation', 'Durabilité', 'Créativité'].slice(0, 3),
    interests: {
      music: musicItems.length > 0 ? musicItems : ['Indie Pop', 'Electronic', 'Jazz'],
      brands: brandItems.length > 0 ? brandItems : ['Apple', 'Patagonia', 'Tesla'],
      movies: movieItems.length > 0 ? movieItems : ['Dune', 'Parasite', 'Her'],
      food: foodItems.length > 0 ? foodItems : ['Sushi', 'Café artisanal', 'Cuisine bio'],
      books: bookItems.length > 0 ? bookItems : ['Atomic Habits', 'Sapiens', 'Educated'],
      lifestyle: lifestyleItems.length > 0 ? lifestyleItems : ['Yoga', 'Photographie', 'Voyages']
    },
    communication: {
      preferredChannels: ['Instagram', 'LinkedIn', 'Podcasts'].slice(0, 2 + Math.floor(Math.random() * 2)),
      tone: tones[Math.floor(Math.random() * tones.length)],
      contentTypes: ['Vidéos courtes', 'Articles de fond', 'Infographies'],
      frequency: frequencies[Math.floor(Math.random() * frequencies.length)]
    },
    marketing: {
      painPoints: [
        'Manque de temps pour explorer de nouvelles options',
        'Difficultés à trouver des produits authentiques',
        'Besoin de recommandations personnalisées'
      ],
      motivations: [
        'Améliorer sa qualité de vie',
        'Découvrir de nouvelles expériences',
        'Soutenir des marques éthiques'
      ],
      buyingBehavior: 'Recherche approfondie avant achat, sensible aux recommandations et aux valeurs de marque',
      influences: ['Avis d\'experts', 'Recommandations d\'amis', 'Contenu éducatif']
    }
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: GeminiRequest = await request.json();
    
    if (!body.prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Simulation d'un délai d'API
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Construction du prompt complet
    const fullPrompt = `${PERSONA_PROMPTS.base}\n\n${body.prompt}\n\n${PERSONA_PROMPTS.structure}\n\n${PERSONA_PROMPTS.format}`;
    
    // Génération du persona (simulation)
    const personaData = generateMockPersona(fullPrompt, body.context);
    
    const response: GeminiResponse = {
      content: JSON.stringify(personaData, null, 2),
      usage: {
        promptTokens: fullPrompt.length / 4, // Approximation
        completionTokens: JSON.stringify(personaData).length / 4,
        totalTokens: (fullPrompt.length + JSON.stringify(personaData).length) / 4
      },
      model: 'gemini-pro',
      finishReason: 'stop'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Gemini API endpoint',
      methods: ['POST'],
      description: 'Generate persona content using Google Gemini AI'
    },
    { status: 200 }
  );
}