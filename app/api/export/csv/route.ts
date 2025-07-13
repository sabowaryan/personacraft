import { NextRequest, NextResponse } from 'next/server';
import { Persona } from '@/lib/types/persona';

// Configuration pour l'export statique
export const dynamic = 'force-dynamic';

// Fonction pour échapper les valeurs CSV
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Génération du contenu CSV
function generateCSVContent(personas: Persona[]): string {
  const headers = [
    'ID',
    'Name',
    'Age',
    'Location',
    'Bio',
    'Quote',
    'Values',
    'Music_Interests',
    'Brand_Interests',
    'Movie_Interests',
    'Food_Interests',
    'Book_Interests',
    'Lifestyle_Interests',
    'Preferred_Channels',
    'Communication_Tone',
    'Content_Types',
    'Communication_Frequency',
    'Pain_Points',
    'Motivations',
    'Buying_Behavior',
    'Influences',
    'Generated_At',
    'Sources'
  ];

  const rows = personas.map(persona => [
    persona.id,
    persona.name,
    persona.age.toString(),
    persona.location,
    persona.bio,
    persona.quote,
    persona.values.join('; '),
    persona.interests.music.join('; '),
    persona.interests.brands.join('; '),
    persona.interests.movies.join('; '),
    persona.interests.food.join('; '),
    persona.interests.books.join('; '),
    persona.interests.lifestyle.join('; '),
    persona.communication.preferredChannels.join('; '),
    persona.communication.tone,
    persona.communication.contentTypes.join('; '),
    persona.communication.frequency,
    persona.marketing.painPoints.join('; '),
    persona.marketing.motivations.join('; '),
    persona.marketing.buyingBehavior,
    persona.marketing.influences.join('; '),
    persona.generatedAt instanceof Date ? persona.generatedAt.toISOString() : persona.generatedAt,
    persona.sources.join('; ')
  ]);

  // Construction du CSV
  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\n');

  return csvContent;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { personas } = body;

    if (!personas || !Array.isArray(personas) || personas.length === 0) {
      return NextResponse.json(
        { error: 'Personas array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Génération du contenu CSV
    const csvContent = generateCSVContent(personas);
    
    // Simulation du temps de traitement
    await new Promise(resolve => setTimeout(resolve, 500));

    // Création du nom de fichier avec timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `personas_export_${timestamp}.csv`;

    // En production, on pourrait sauvegarder le fichier et retourner une URL
    // Pour la démo, on retourne les métadonnées et le contenu
    return NextResponse.json({
      success: true,
      filename,
      content: csvContent,
      size: csvContent.length,
      contentType: 'text/csv',
      personaCount: personas.length,
      generatedAt: new Date().toISOString(),
      downloadUrl: `/api/export/csv/download/${Date.now()}`
    });

  } catch (error) {
    console.error('CSV Export Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSV' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'CSV Export API endpoint',
      methods: ['POST'],
      description: 'Export multiple personas to CSV format',
      required_fields: ['personas'],
      supported_formats: ['CSV'],
      max_personas: 100
    },
    { status: 200 }
  );
}