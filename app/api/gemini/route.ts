import { NextRequest, NextResponse } from 'next/server';
import { GeminiClient } from '@/lib/api/gemini';

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

export async function POST(request: NextRequest) {
  try {
    const body: GeminiRequest = await request.json();
    
    if (!body.prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Vérifier si l'API Gemini est activée
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Créer le client Gemini
    const geminiClient = new GeminiClient(process.env.GEMINI_API_KEY);
    
    // Générer le contenu
    const response = await geminiClient.generateContent(body);

    return NextResponse.json(response);

  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Retourner une erreur détaillée
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: 'Failed to generate content with Gemini API'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Gemini API endpoint',
      methods: ['POST'],
      description: 'Generate persona content using Google Gemini AI',
      status: process.env.GEMINI_API_KEY ? 'configured' : 'not configured'
    },
    { status: 200 }
  );
}