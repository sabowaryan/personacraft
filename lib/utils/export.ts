import { Persona } from '../types/persona';
import { downloadPersonaPDF } from './pdf-generator';
import { CSVExporter } from './csv-exporter';

// Export PDF enrichi avec le vrai générateur
export async function exportToPDF(persona: Persona, options?: {
  includeCharts?: boolean;
  includeMetadata?: boolean;
  theme?: 'light' | 'dark' | 'brand';
}): Promise<void> {
  try {
    // Utiliser la fonction utilitaire pour télécharger le PDF
    downloadPersonaPDF(persona, {
      format: 'a4',
      orientation: 'portrait',
      includeCharts: options?.includeCharts || false,
      includeMetadata: options?.includeMetadata || true,
      theme: options?.theme || 'brand'
    });

  } catch (error) {
    console.error('Erreur génération PDF:', error);
    
    // Fallback vers l'ancien système en cas d'erreur
    const content = generateFallbackContent(persona);
    downloadAsText(content, `${persona.name.replace(/\s+/g, '_')}_persona.txt`);
  }
}

// Export CSV enrichi avec le vrai exporter
export async function exportToCSV(personas: Persona[], options?: {
  delimiter?: ',' | ';' | '\t';
  includeMetadata?: boolean;
  flattenArrays?: boolean;
}): Promise<void> {
  try {
    const csvExporter = new CSVExporter({
      delimiter: options?.delimiter || ',',
      includeHeaders: true,
      includeMetadata: options?.includeMetadata || true,
      flattenArrays: options?.flattenArrays || true,
      dateFormat: 'locale'
    });

    const csvContent = csvExporter.exportPersonas(personas);
    const filename = `personas_export_${new Date().toISOString().split('T')[0]}.csv`;
    
    downloadAsText(csvContent, filename, 'text/csv');

  } catch (error) {
    console.error('Erreur export CSV:', error);
    
    // Fallback vers l'ancien système
    await exportToCSVFallback(personas);
  }
}

// Export JSON pour les nouvelles fonctionnalités
export async function exportToJSON(personas: Persona[], options?: {
  includeMetadata?: boolean;
  prettify?: boolean;
}): Promise<void> {
  const data = {
    metadata: {
      exported_at: new Date().toISOString(),
      total_personas: personas.length,
      exported_by: 'PersonaCraft v2.0',
      ...(options?.includeMetadata && {
        export_options: options
      })
    },
    personas: personas.map(persona => ({
      ...persona,
      generatedAt: persona.generatedAt.toISOString()
    }))
  };

  const jsonContent = options?.prettify 
    ? JSON.stringify(data, null, 2) 
    : JSON.stringify(data);
  
  const filename = `personas_export_${new Date().toISOString().split('T')[0]}.json`;
  downloadAsText(jsonContent, filename, 'application/json');
}

// Fonctions utilitaires
function downloadAsText(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Fallback functions (ancien système)
function generateFallbackContent(persona: Persona): string {
  return `
PERSONA: ${persona.name}

Âge: ${persona.age} ans
Localisation: ${persona.location}

Bio: ${persona.bio}

Valeurs: ${persona.values.join(', ')}

Quote: "${persona.quote}"

Intérêts:
- Musique: ${persona.interests.music.join(', ')}
- Marques: ${persona.interests.brands.join(', ')}
- Films: ${persona.interests.movies.join(', ')}
- Cuisine: ${persona.interests.food.join(', ')}
- Lectures: ${persona.interests.books.join(', ')}
- Lifestyle: ${persona.interests.lifestyle.join(', ')}

Communication:
- Canaux préférés: ${persona.communication.preferredChannels.join(', ')}
- Ton: ${persona.communication.tone}
- Types de contenu: ${persona.communication.contentTypes.join(', ')}
- Fréquence: ${persona.communication.frequency}

Marketing:
- Points de douleur: ${persona.marketing.painPoints.join(', ')}
- Motivations: ${persona.marketing.motivations.join(', ')}
- Comportement d'achat: ${persona.marketing.buyingBehavior}
- Influences: ${persona.marketing.influences.join(', ')}

Généré le: ${persona.generatedAt.toLocaleDateString()}
Sources: ${persona.sources.join(', ')}
  `;
}

async function exportToCSVFallback(personas: Persona[]): Promise<void> {
  const headers = [
    'Name', 'Age', 'Location', 'Bio', 'Values', 'Quote',
    'Music', 'Brands', 'Movies', 'Food', 'Books', 'Lifestyle',
    'Preferred Channels', 'Tone', 'Content Types', 'Frequency',
    'Pain Points', 'Motivations', 'Buying Behavior', 'Influences',
    'Generated At', 'Sources'
  ];

  const rows = personas.map(persona => [
    persona.name,
    persona.age.toString(),
    persona.location,
    persona.bio,
    persona.values.join('; '),
    persona.quote,
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
    persona.generatedAt.toISOString(),
    persona.sources.join('; ')
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
    .join('\n');

  downloadAsText(csvContent, `personas_export_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
}