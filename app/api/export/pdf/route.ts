import { NextRequest, NextResponse } from 'next/server';
import { Persona } from '@/lib/types/persona';

// Configuration pour l'export statique
export const dynamic = 'force-dynamic';

// Génération du contenu PDF en format texte structuré
function generatePDFContent(persona: Persona): string {
  const content = `
PERSONA MARKETING - ${persona.name.toUpperCase()}
${'='.repeat(50)}

INFORMATIONS GÉNÉRALES
${'─'.repeat(25)}
Nom: ${persona.name}
Âge: ${persona.age} ans
Localisation: ${persona.location}
Généré le: ${new Date(persona.generatedAt).toLocaleDateString('fr-FR')}

CITATION PERSONNELLE
${'─'.repeat(25)}
"${persona.quote}"

BIOGRAPHIE
${'─'.repeat(25)}
${persona.bio}

VALEURS FONDAMENTALES
${'─'.repeat(25)}
${persona.values.map(value => `• ${value}`).join('\n')}

CENTRES D'INTÉRÊT
${'─'.repeat(25)}

Musique:
${persona.interests.music.map(item => `  • ${item}`).join('\n')}

Marques préférées:
${persona.interests.brands.map(item => `  • ${item}`).join('\n')}

Films & Séries:
${persona.interests.movies.map(item => `  • ${item}`).join('\n')}

Cuisine & Alimentation:
${persona.interests.food.map(item => `  • ${item}`).join('\n')}

Lectures:
${persona.interests.books.map(item => `  • ${item}`).join('\n')}

Style de vie:
${persona.interests.lifestyle.map(item => `  • ${item}`).join('\n')}

PROFIL DE COMMUNICATION
${'─'.repeat(25)}
Canaux préférés: ${persona.communication.preferredChannels.join(', ')}
Ton de communication: ${persona.communication.tone}
Types de contenu: ${persona.communication.contentTypes.join(', ')}
Fréquence: ${persona.communication.frequency}

PROFIL MARKETING
${'─'.repeat(25)}

Points de douleur:
${persona.marketing.painPoints.map(point => `  • ${point}`).join('\n')}

Motivations:
${persona.marketing.motivations.map(motivation => `  • ${motivation}`).join('\n')}

Comportement d'achat:
${persona.marketing.buyingBehavior}

Sources d'influence:
${persona.marketing.influences.map(influence => `  • ${influence}`).join('\n')}

MÉTADONNÉES
${'─'.repeat(25)}
Sources de données: ${persona.sources.join(', ')}
ID du persona: ${persona.id}

${'='.repeat(50)}
Généré par PersonaCraft - https://personacraft.com
`;

  return content;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { persona } = body;

    if (!persona) {
      return NextResponse.json(
        { error: 'Persona data is required' },
        { status: 400 }
      );
    }

    // Génération du contenu PDF
    const pdfContent = generatePDFContent(persona);
    
    // Pour une vraie implémentation, utiliser une bibliothèque comme jsPDF ou Puppeteer
    // Ici, on retourne le contenu texte formaté
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    
    // Simulation de la génération PDF
    await new Promise(resolve => setTimeout(resolve, 1000));

    // En production, retourner le PDF binaire
    // Pour la démo, on retourne les métadonnées
    return NextResponse.json({
      success: true,
      filename: `${persona.name.replace(/\s+/g, '_')}_persona.pdf`,
      size: pdfContent.length,
      contentType: 'application/pdf',
      downloadUrl: `/api/export/pdf/download/${persona.id}`,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('PDF Export Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const personaId = searchParams.get('id');

  if (!personaId) {
    return NextResponse.json(
      { error: 'Persona ID is required' },
      { status: 400 }
    );
  }

  // En production, récupérer le persona depuis la base de données
  // Pour la démo, retourner un message d'information
  return NextResponse.json({
    message: 'PDF download endpoint',
    personaId,
    note: 'In production, this would serve the actual PDF file'
  });
}