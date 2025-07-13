import { Persona } from '../types/persona';
import { downloadPersonaPDF } from './pdf-generator';
import { CSVExporter, exportPersonasWithAnalytics } from './csv-exporter';

// Export PDF enrichi avec le vrai générateur
export async function exportToPDF(persona: Persona, options?: {
  includeCharts?: boolean;
  includeMetadata?: boolean;
  theme?: 'light' | 'dark' | 'brand';
}): Promise<void> {
  try {
    console.log('Début génération PDF pour:', persona.name);
    
    // Utiliser la fonction utilitaire pour télécharger le PDF
    await downloadPersonaPDF(persona, {
      format: 'a4',
      orientation: 'portrait',
      includeCharts: options?.includeCharts || false,
      includeMetadata: options?.includeMetadata || true,
      theme: options?.theme || 'brand'
    });

    console.log('PDF généré avec succès');

  } catch (error) {
    console.error('Erreur génération PDF:', error);
    
    // Fallback vers l'ancien système en cas d'erreur
    const content = generateFallbackContent(persona);
    downloadAsText(content, `${persona.name.replace(/\s+/g, '_')}_persona.txt`);
  }
}

// Export CSV enrichi avec le vrai exporter - Compatible Excel 2025
export async function exportToCSV(personas: Persona[], options?: {
  delimiter?: ',' | ';' | '\t';
  includeMetadata?: boolean;
  flattenArrays?: boolean;
  excelCompatible?: boolean;
  includeAnalytics?: boolean;
  format?: 'horizontal' | 'vertical' | 'sections';
  maxCellLength?: number;
  truncateText?: boolean;
  wrapText?: boolean;
}): Promise<void> {
  try {
    console.log('Début génération CSV pour', personas.length, 'personas');

    // Configuration optimisée pour Excel français avec format lisible et gestion des textes longs
    const csvExporter = new CSVExporter({
      delimiter: options?.delimiter || ';', // Point-virgule pour Excel français
      includeHeaders: true,
      includeMetadata: options?.includeMetadata !== false, // true par défaut
      flattenArrays: options?.flattenArrays !== false, // true par défaut
      dateFormat: 'excel', // Format de date Excel-friendly
      encoding: 'utf-8-bom', // BOM UTF-8 pour Excel
      excelCompatible: options?.excelCompatible !== false, // true par défaut
      format: options?.format || 'sections', // Format sections par défaut pour meilleure lisibilité
      maxCellLength: options?.maxCellLength || 100, // Limite de caractères par cellule
      truncateText: options?.truncateText !== false, // Tronquer par défaut
      wrapText: options?.wrapText || false // Pas de retour à la ligne par défaut
    });

    let csvContent: string;
    
    if (options?.includeAnalytics) {
      // Export avec analyse statistique avancée
      csvContent = exportPersonasWithAnalytics(personas);
      console.log('CSV avec analytics généré');
    } else {
      // Export standard avec nouveau format
      csvContent = csvExporter.exportPersonas(personas);
      console.log('CSV avec format', options?.format || 'sections', 'généré');
    }

    // Nom de fichier avec timestamp pour éviter les conflits
    const timestamp = new Date().toISOString().split('T')[0];
    const formatSuffix = options?.format ? `_${options.format}` : '_sections';
    const filename = `PersonaCraft_Export${formatSuffix}_${timestamp}.csv`;
    
    // Téléchargement avec type MIME correct pour Excel
    downloadAsText(csvContent, filename, 'text/csv;charset=utf-8;');
    
    console.log('Export CSV terminé:', filename);

  } catch (error) {
    console.error('Erreur export CSV:', error);
    
    // Fallback amélioré vers l'ancien système
    console.log('Utilisation du système de fallback...');
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

Généré le: ${new Date(persona.generatedAt).toLocaleDateString()}
Sources: ${persona.sources.join(', ')}
  `;
}

async function exportToCSVFallback(personas: Persona[]): Promise<void> {
  console.log('Utilisation du système de fallback CSV...');
  
  // Headers en français pour Excel
  const headers = [
    'Nom', 'Age', 'Localisation', 'Bio', 'Valeurs', 'Citation',
    'Musique', 'Marques', 'Films', 'Cuisine', 'Livres', 'Lifestyle',
    'Canaux Préférés', 'Ton', 'Types Contenu', 'Fréquence',
    'Points Douleur', 'Motivations', 'Comportement Achat', 'Influences',
    'Date Création', 'Sources'
  ];

  const rows = personas.map(persona => [
    persona.name || '',
    persona.age?.toString() || '',
    persona.location || '',
    persona.bio || '',
    persona.values?.join(' | ') || '',
    persona.quote || '',
    persona.interests?.music?.join(' | ') || '',
    persona.interests?.brands?.join(' | ') || '',
    persona.interests?.movies?.join(' | ') || '',
    persona.interests?.food?.join(' | ') || '',
    persona.interests?.books?.join(' | ') || '',
    persona.interests?.lifestyle?.join(' | ') || '',
    persona.communication?.preferredChannels?.join(' | ') || '',
    persona.communication?.tone || '',
    persona.communication?.contentTypes?.join(' | ') || '',
    persona.communication?.frequency || '',
    persona.marketing?.painPoints?.join(' | ') || '',
    persona.marketing?.motivations?.join(' | ') || '',
    persona.marketing?.buyingBehavior || '',
    persona.marketing?.influences?.join(' | ') || '',
    persona.generatedAt ? new Date(persona.generatedAt).toLocaleDateString('fr-FR') : '',
    persona.sources?.join(' | ') || ''
  ]);

  // Utiliser point-virgule et BOM UTF-8 pour Excel
  const csvContent = '\uFEFF' + [headers, ...rows]
    .map(row => row.map(field => {
      // Nettoyer et échapper les champs
      const cleaned = String(field || '')
        .replace(/[\r\n]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/"/g, '""');
      return `"${cleaned}"`;
    }).join(';'))
    .join('\r\n');

  const timestamp = new Date().toISOString().split('T')[0];
  downloadAsText(csvContent, `PersonaCraft_Fallback_${timestamp}.csv`, 'text/csv;charset=utf-8;');
}