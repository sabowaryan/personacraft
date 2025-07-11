import { Persona } from '../types/persona';

export interface CSVExportOptions {
  delimiter: ',' | ';' | '\t';
  includeHeaders: boolean;
  includeMetadata: boolean;
  flattenArrays: boolean;
  dateFormat: 'iso' | 'locale' | 'timestamp';
}

export class CSVExporter {
  private options: CSVExportOptions;

  constructor(options: Partial<CSVExportOptions> = {}) {
    this.options = {
      delimiter: ',',
      includeHeaders: true,
      includeMetadata: true,
      flattenArrays: true,
      dateFormat: 'locale',
      ...options
    };
  }

  public exportPersonas(personas: Persona[]): string {
    if (personas.length === 0) {
      throw new Error('No personas to export');
    }

    const headers = this.generateHeaders();
    const rows = personas.map(persona => this.personaToRow(persona));

    const csvContent = [];
    
    if (this.options.includeHeaders) {
      csvContent.push(headers.join(this.options.delimiter));
    }
    
    csvContent.push(...rows.map(row => row.join(this.options.delimiter)));

    return csvContent.join('\n');
  }

  private generateHeaders(): string[] {
    const baseHeaders = [
      'ID',
      'Name',
      'Age',
      'Location',
      'Bio',
      'Quote'
    ];

    const valueHeaders = ['Values'];
    
    const interestHeaders = [
      'Music_Interests',
      'Brand_Interests', 
      'Movie_Interests',
      'Food_Interests',
      'Book_Interests',
      'Lifestyle_Interests'
    ];

    const communicationHeaders = [
      'Preferred_Channels',
      'Communication_Tone',
      'Content_Types',
      'Communication_Frequency'
    ];

    const marketingHeaders = [
      'Pain_Points',
      'Motivations',
      'Buying_Behavior',
      'Influences'
    ];

    const metadataHeaders = this.options.includeMetadata 
      ? ['Generated_At', 'Sources']
      : [];

    return [
      ...baseHeaders,
      ...valueHeaders,
      ...interestHeaders,
      ...communicationHeaders,
      ...marketingHeaders,
      ...metadataHeaders
    ];
  }

  private personaToRow(persona: Persona): string[] {
    const baseData = [
      this.escapeValue(persona.id),
      this.escapeValue(persona.name),
      persona.age.toString(),
      this.escapeValue(persona.location),
      this.escapeValue(persona.bio),
      this.escapeValue(persona.quote)
    ];

    const valueData = [
      this.escapeValue(this.arrayToString(persona.values))
    ];

    const interestData = [
      this.escapeValue(this.arrayToString(persona.interests.music)),
      this.escapeValue(this.arrayToString(persona.interests.brands)),
      this.escapeValue(this.arrayToString(persona.interests.movies)),
      this.escapeValue(this.arrayToString(persona.interests.food)),
      this.escapeValue(this.arrayToString(persona.interests.books)),
      this.escapeValue(this.arrayToString(persona.interests.lifestyle))
    ];

    const communicationData = [
      this.escapeValue(this.arrayToString(persona.communication.preferredChannels)),
      this.escapeValue(persona.communication.tone),
      this.escapeValue(this.arrayToString(persona.communication.contentTypes)),
      this.escapeValue(persona.communication.frequency)
    ];

    const marketingData = [
      this.escapeValue(this.arrayToString(persona.marketing.painPoints)),
      this.escapeValue(this.arrayToString(persona.marketing.motivations)),
      this.escapeValue(persona.marketing.buyingBehavior),
      this.escapeValue(this.arrayToString(persona.marketing.influences))
    ];

    const metadataData = this.options.includeMetadata 
      ? [
          this.escapeValue(this.formatDate(persona.generatedAt)),
          this.escapeValue(this.arrayToString(persona.sources))
        ]
      : [];

    return [
      ...baseData,
      ...valueData,
      ...interestData,
      ...communicationData,
      ...marketingData,
      ...metadataData
    ];
  }

  private arrayToString(array: string[]): string {
    if (!this.options.flattenArrays) {
      return JSON.stringify(array);
    }
    return array.join('; ');
  }

  private formatDate(date: Date): string {
    switch (this.options.dateFormat) {
      case 'iso':
        return date.toISOString();
      case 'timestamp':
        return date.getTime().toString();
      case 'locale':
      default:
        return date.toLocaleString('fr-FR');
    }
  }

  private escapeValue(value: string): string {
    // Échapper les guillemets doubles
    const escaped = value.replace(/"/g, '""');
    
    // Entourer de guillemets si nécessaire
    if (escaped.includes(this.options.delimiter) || 
        escaped.includes('\n') || 
        escaped.includes('\r') || 
        escaped.includes('"')) {
      return `"${escaped}"`;
    }
    
    return escaped;
  }
}

// Fonctions utilitaires
export function exportPersonasToCSV(
  personas: Persona[], 
  options?: Partial<CSVExportOptions>
): string {
  const exporter = new CSVExporter(options);
  return exporter.exportPersonas(personas);
}

export function downloadPersonasCSV(
  personas: Persona[], 
  filename?: string,
  options?: Partial<CSVExportOptions>
): void {
  const csvContent = exportPersonasToCSV(personas, options);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `personas_export_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Fonction pour créer un CSV avec analyse statistique
export function exportPersonasWithAnalytics(personas: Persona[]): string {
  const exporter = new CSVExporter();
  const basicCSV = exporter.exportPersonas(personas);
  
  // Ajouter des statistiques
  const analytics = generatePersonaAnalytics(personas);
  const analyticsCSV = '\n\n--- ANALYTICS ---\n' + 
    Object.entries(analytics)
      .map(([key, value]) => `${key},${value}`)
      .join('\n');
  
  return basicCSV + analyticsCSV;
}

function generatePersonaAnalytics(personas: Persona[]): Record<string, string | number> {
  const totalPersonas = personas.length;
  const avgAge = Math.round(personas.reduce((sum, p) => sum + p.age, 0) / totalPersonas);
  
  const locations = personas.reduce((acc, p) => {
    const country = p.location.split(',').pop()?.trim() || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topLocation = Object.entries(locations)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
  
  const allValues = personas.flatMap(p => p.values);
  const valueFreq = allValues.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topValue = Object.entries(valueFreq)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

  return {
    'Total Personas': totalPersonas,
    'Average Age': avgAge,
    'Top Location': topLocation,
    'Top Value': topValue,
    'Export Date': new Date().toISOString(),
    'Unique Locations': Object.keys(locations).length,
    'Unique Values': Object.keys(valueFreq).length
  };
}