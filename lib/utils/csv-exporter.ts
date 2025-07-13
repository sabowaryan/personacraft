import { Persona } from '../types/persona';

export interface CSVExportOptions {
  delimiter: ',' | ';' | '\t';
  includeHeaders: boolean;
  includeMetadata: boolean;
  flattenArrays: boolean;
  dateFormat: 'iso' | 'locale' | 'timestamp' | 'excel';
  encoding: 'utf-8' | 'utf-8-bom';
  excelCompatible: boolean;
  format: 'horizontal' | 'vertical' | 'sections';
  maxCellLength: number; // Longueur max des cellules
  truncateText: boolean; // Tronquer les textes longs
  wrapText: boolean; // Permettre le retour à la ligne dans les cellules
}

export class CSVExporter {
  private options: CSVExportOptions;

  constructor(options: Partial<CSVExportOptions> = {}) {
    this.options = {
      delimiter: ';', // Point-virgule par défaut pour Excel français
      includeHeaders: true,
      includeMetadata: true,
      flattenArrays: true,
      dateFormat: 'excel',
      encoding: 'utf-8-bom',
      excelCompatible: true,
      format: 'horizontal', // Défaut pour la compatibilité
      maxCellLength: 100, // Limite à 100 caractères par cellule
      truncateText: true, // Tronquer par défaut
      wrapText: false, // Pas de retour à la ligne par défaut
      ...options
    };
  }

  public exportPersonas(personas: Persona[]): string {
    if (personas.length === 0) {
      throw new Error('Aucun persona à exporter');
    }

    let result: string;

    switch (this.options.format) {
      case 'vertical':
        result = this.exportPersonasVertical(personas);
        break;
      case 'sections':
        result = this.exportPersonasSections(personas);
        break;
      case 'horizontal':
      default:
        result = this.exportPersonasHorizontal(personas);
        break;
    }

    // Ajouter BOM UTF-8 si nécessaire
    if (this.options.encoding === 'utf-8-bom') {
      result = '\uFEFF' + result;
    }

    return result;
  }

  // Export horizontal traditionnel (format original)
  private exportPersonasHorizontal(personas: Persona[]): string {
    const headers = this.generateHeaders();
    const rows = personas.map(persona => this.personaToRow(persona));

    const csvContent = [];
    
    if (this.options.includeHeaders) {
      csvContent.push(headers.join(this.options.delimiter));
    }
    
    csvContent.push(...rows.map(row => row.join(this.options.delimiter)));

    return csvContent.join('\r\n');
  }

  // Export vertical - Plus lisible avec sections organisées
  private exportPersonasVertical(personas: Persona[]): string {
    const sections: string[] = [];

    personas.forEach((persona, index) => {
      if (index > 0) {
        sections.push(''); // Ligne vide entre personas
        sections.push('='.repeat(50));
        sections.push('');
      }

      sections.push(`PERSONA ${index + 1}: ${persona.name}`);
      sections.push('='.repeat(50));
      sections.push('');

      // Informations de base
      sections.push('INFORMATIONS GÉNÉRALES');
      sections.push('-'.repeat(25));
      sections.push(`ID;${this.escapeValue(persona.id)}`);
      sections.push(`Nom;${this.escapeValue(persona.name)}`);
      sections.push(`Âge;${persona.age} ans`);
      sections.push(`Localisation;${this.escapeValue(persona.location)}`);
      sections.push(`Citation;"${this.escapeValue(persona.quote)}"`);
      sections.push('');

      // Valeurs
      sections.push('VALEURS FONDAMENTALES');
      sections.push('-'.repeat(25));
      persona.values.forEach((value, idx) => {
        sections.push(`Valeur ${idx + 1};${this.escapeValue(value)}`);
      });
      sections.push(`Total valeurs;${persona.values.length}`);
      sections.push('');

      // Intérêts par catégorie
      sections.push('CENTRES D\'INTÉRÊT');
      sections.push('-'.repeat(25));
      Object.entries(persona.interests).forEach(([category, items]) => {
        sections.push(`${category.toUpperCase()};${this.arrayToString(items)}`);
      });
      sections.push(`Total intérêts;${Object.values(persona.interests).flat().length}`);
      sections.push('');

      // Communication
      sections.push('COMMUNICATION');
      sections.push('-'.repeat(25));
      sections.push(`Canaux préférés;${this.arrayToString(persona.communication.preferredChannels)}`);
      sections.push(`Ton;${this.escapeValue(persona.communication.tone)}`);
      sections.push(`Types de contenu;${this.arrayToString(persona.communication.contentTypes)}`);
      sections.push(`Fréquence;${this.escapeValue(persona.communication.frequency)}`);
      sections.push('');

      // Marketing
      sections.push('MARKETING & COMPORTEMENT');
      sections.push('-'.repeat(25));
      sections.push(`Points de douleur;${this.arrayToString(persona.marketing.painPoints)}`);
      sections.push(`Motivations;${this.arrayToString(persona.marketing.motivations)}`);
      sections.push(`Comportement d'achat;${this.escapeValue(persona.marketing.buyingBehavior)}`);
      sections.push(`Sources d'influence;${this.arrayToString(persona.marketing.influences)}`);
      sections.push('');

      // Analytics
      sections.push('ANALYTICS & MÉTRIQUES 2025');
      sections.push('-'.repeat(25));
      sections.push(`Score d'engagement;${this.calculateEngagementScore(persona)}/100`);
      sections.push(`Potentiel de conversion;${this.calculateConversionPotential(persona)}`);
      sections.push(`Maturité digitale;${this.calculateDigitalMaturity(persona)}`);
      sections.push(`Budget estimé mensuel;${this.estimateMonthlyBudget(persona)}`);
      sections.push('');

      // Métadonnées
      if (this.options.includeMetadata) {
        sections.push('MÉTADONNÉES');
        sections.push('-'.repeat(25));
        sections.push(`Date de création;${this.formatDate(persona.generatedAt, 'date')}`);
        sections.push(`Heure de création;${this.formatDate(persona.generatedAt, 'time')}`);
        sections.push(`Sources de données;${this.arrayToString(persona.sources)}`);
        sections.push(`Qualité des données;${this.calculateDataQuality(persona)}`);
        sections.push('');
      }
    });

    return sections.join('\r\n');
  }

  // Export par sections - Tableau organisé par thématiques
  private exportPersonasSections(personas: Persona[]): string {
    const sections: string[] = [];

    // En-tête principal
    sections.push('EXPORT PERSONAS - PERSONACRAFT 2025');
    sections.push('='.repeat(60));
    sections.push(`Date d'export;${new Date().toLocaleDateString('fr-FR')}`);
    sections.push(`Nombre de personas;${personas.length}`);
    sections.push('');

    // Section 1: Informations générales
    sections.push('SECTION 1: INFORMATIONS GÉNÉRALES');
    sections.push('='.repeat(40));
    sections.push('Nom;Âge;Localisation;Citation');
    personas.forEach(persona => {
      sections.push(`${this.escapeValue(persona.name)};${persona.age};${this.escapeValue(persona.location)};"${this.escapeValue(persona.quote)}"`);
    });
    sections.push('');

    // Section 2: Valeurs et intérêts
    sections.push('SECTION 2: VALEURS ET INTÉRÊTS');
    sections.push('='.repeat(40));
    sections.push('Nom;Valeurs;Musique;Marques;Films;Cuisine;Livres;Lifestyle');
    personas.forEach(persona => {
      sections.push([
        this.escapeValue(persona.name),
        this.arrayToString(persona.values),
        this.arrayToString(persona.interests.music),
        this.arrayToString(persona.interests.brands),
        this.arrayToString(persona.interests.movies),
        this.arrayToString(persona.interests.food),
        this.arrayToString(persona.interests.books),
        this.arrayToString(persona.interests.lifestyle)
      ].join(';'));
    });
    sections.push('');

    // Section 3: Communication
    sections.push('SECTION 3: COMMUNICATION');
    sections.push('='.repeat(40));
    sections.push('Nom;Canaux;Ton;Types Contenu;Fréquence');
    personas.forEach(persona => {
      sections.push([
        this.escapeValue(persona.name),
        this.arrayToString(persona.communication.preferredChannels),
        this.escapeValue(persona.communication.tone),
        this.arrayToString(persona.communication.contentTypes),
        this.escapeValue(persona.communication.frequency)
      ].join(';'));
    });
    sections.push('');

    // Section 4: Marketing
    sections.push('SECTION 4: MARKETING');
    sections.push('='.repeat(40));
    sections.push('Nom;Points Douleur;Motivations;Comportement Achat;Influences');
    personas.forEach(persona => {
      sections.push([
        this.escapeValue(persona.name),
        this.arrayToString(persona.marketing.painPoints),
        this.arrayToString(persona.marketing.motivations),
        this.escapeValue(persona.marketing.buyingBehavior),
        this.arrayToString(persona.marketing.influences)
      ].join(';'));
    });
    sections.push('');

    // Section 5: Analytics 2025
    sections.push('SECTION 5: ANALYTICS & MÉTRIQUES 2025');
    sections.push('='.repeat(40));
    sections.push('Nom;Score Engagement;Potentiel Conversion;Maturité Digitale;Budget Mensuel;Qualité Données');
    personas.forEach(persona => {
      sections.push([
        this.escapeValue(persona.name),
        this.calculateEngagementScore(persona).toString(),
        this.calculateConversionPotential(persona),
        this.calculateDigitalMaturity(persona),
        this.estimateMonthlyBudget(persona),
        this.calculateDataQuality(persona)
      ].join(';'));
    });
    sections.push('');

    return sections.join('\r\n');
  }

  private generateHeaders(): string[] {
    const baseHeaders = [
      'ID_Persona',
      'Nom_Complet',
      'Age',
      'Localisation',
      'Description_Profil',
      'Citation_Personnelle'
    ];

    const valueHeaders = [
      'Valeurs_Fondamentales',
      'Nombre_Valeurs'
    ];
    
    const interestHeaders = [
      'Musique_Preferences',
      'Marques_Favorites', 
      'Films_Series',
      'Cuisine_Gastronomie',
      'Lectures_Livres',
      'Style_Vie',
      'Total_Interets'
    ];

    const communicationHeaders = [
      'Canaux_Communication',
      'Ton_Communication',
      'Types_Contenu',
      'Frequence_Contact',
      'Nombre_Canaux'
    ];

    const marketingHeaders = [
      'Points_Douleur',
      'Motivations_Achat',
      'Comportement_Achat',
      'Sources_Influence',
      'Nombre_Pain_Points',
      'Nombre_Motivations'
    ];

    const analyticsHeaders = [
      'Score_Engagement',
      'Potentiel_Conversion',
      'Niveau_Maturite_Digitale',
      'Budget_Estimé_Mensuel'
    ];

    const metadataHeaders = this.options.includeMetadata 
      ? [
          'Date_Creation',
          'Heure_Creation',
          'Sources_Donnees',
          'Nombre_Sources',
          'Qualite_Donnees'
        ]
      : [];

    return [
      ...baseHeaders,
      ...valueHeaders,
      ...interestHeaders,
      ...communicationHeaders,
      ...marketingHeaders,
      ...analyticsHeaders,
      ...metadataHeaders
    ];
  }

  private personaToRow(persona: Persona): string[] {
    const baseData = [
      this.escapeValue(persona.id),
      this.escapeValue(persona.name),
      persona.age.toString(),
      this.escapeValue(persona.location),
      this.escapeValueSmart(persona.bio, 'bio'), // Bio avec formatage intelligent
      this.escapeValueSmart(persona.quote, 'quote') // Citation avec formatage intelligent
    ];

    const valueData = [
      this.escapeValue(this.formatListForDisplay(persona.values, 4)), // Max 4 valeurs affichées
      persona.values.length.toString()
    ];

    const interestData = [
      this.escapeValue(this.formatListForDisplay(persona.interests.music, 3)),
      this.escapeValue(this.formatListForDisplay(persona.interests.brands, 3)),
      this.escapeValue(this.formatListForDisplay(persona.interests.movies, 3)),
      this.escapeValue(this.formatListForDisplay(persona.interests.food, 3)),
      this.escapeValue(this.formatListForDisplay(persona.interests.books, 3)),
      this.escapeValue(this.formatListForDisplay(persona.interests.lifestyle, 3)),
      Object.values(persona.interests).flat().length.toString()
    ];

    const communicationData = [
      this.escapeValue(this.formatListForDisplay(persona.communication.preferredChannels, 4)),
      this.escapeValue(persona.communication.tone),
      this.escapeValue(this.formatListForDisplay(persona.communication.contentTypes, 3)),
      this.escapeValue(persona.communication.frequency),
      persona.communication.preferredChannels.length.toString()
    ];

    const marketingData = [
      this.escapeValue(this.formatListForDisplay(persona.marketing.painPoints, 3)),
      this.escapeValue(this.formatListForDisplay(persona.marketing.motivations, 3)),
      this.escapeValueSmart(persona.marketing.buyingBehavior, 'text'), // Texte avec troncature
      this.escapeValue(this.formatListForDisplay(persona.marketing.influences, 3)),
      persona.marketing.painPoints.length.toString(),
      persona.marketing.motivations.length.toString()
    ];

    // Données analytiques calculées (exemples pratiques 2025)
    const analyticsData = [
      this.calculateEngagementScore(persona).toString(),
      this.calculateConversionPotential(persona),
      this.calculateDigitalMaturity(persona),
      this.estimateMonthlyBudget(persona)
    ];

    const metadataData = this.options.includeMetadata 
      ? [
          this.formatDate(persona.generatedAt, 'date'),
          this.formatDate(persona.generatedAt, 'time'),
          this.escapeValue(this.formatListForDisplay(persona.sources, 3)),
          persona.sources.length.toString(),
          this.calculateDataQuality(persona)
        ]
      : [];

    return [
      ...baseData,
      ...valueData,
      ...interestData,
      ...communicationData,
      ...marketingData,
      ...analyticsData,
      ...metadataData
    ];
  }

  private arrayToString(array: string[]): string {
    if (!this.options.flattenArrays) {
      return JSON.stringify(array);
    }
    return array.join(' | '); // Utiliser | au lieu de ; pour éviter les conflits avec le délimiteur
  }

  private formatDate(date: Date | string, type: 'date' | 'time' = 'date'): string {
    // S'assurer que date est un objet Date
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      return 'Date invalide';
    }

    if (type === 'time') {
      return dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    switch (this.options.dateFormat) {
      case 'iso':
        return dateObj.toISOString().split('T')[0];
      case 'timestamp':
        return dateObj.getTime().toString();
      case 'excel':
        return dateObj.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      case 'locale':
      default:
        return dateObj.toLocaleDateString('fr-FR');
    }
  }

  private escapeValue(value: string): string {
    if (!value) return '';
    
    // Nettoyer les caractères problématiques
    let cleaned = value
      .replace(/[\r\n]/g, ' ') // Remplacer les retours à la ligne par des espaces
      .replace(/\s+/g, ' ') // Normaliser les espaces multiples
      .trim();

    // Échapper les guillemets doubles
    cleaned = cleaned.replace(/"/g, '""');
    
    // Toujours entourer de guillemets pour Excel
    if (this.options.excelCompatible) {
      return `"${cleaned}"`;
    }
    
    // Entourer de guillemets si nécessaire
    if (cleaned.includes(this.options.delimiter) || 
        cleaned.includes('\n') || 
        cleaned.includes('\r') || 
        cleaned.includes('"')) {
      return `"${cleaned}"`;
    }
    
    return cleaned;
  }

  // Fonctions spécialisées pour gérer les textes longs
  private smartTruncate(text: string, maxLength: number = this.options.maxCellLength): string {
    if (!text || text.length <= maxLength) return text;
    
    // Tronquer en préservant les mots complets si possible
    const truncated = text.substring(0, maxLength - 3);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.7) {
      // Si on trouve un espace dans les 70% finaux, couper là
      return truncated.substring(0, lastSpace) + '...';
    } else {
      // Sinon couper brutalement
      return truncated + '...';
    }
  }

  private formatBio(bio: string): string {
    // Bio limitée à 150 caractères avec résumé intelligent
    if (bio.length <= 150) return bio;
    
    // Essayer de couper à la première phrase complète
    const sentences = bio.split(/[.!?]+/);
    let result = sentences[0];
    
    if (result.length > 150) {
      return this.smartTruncate(result, 150);
    }
    
    // Ajouter des phrases tant qu'on reste sous 150 caractères
    for (let i = 1; i < sentences.length; i++) {
      const candidate = result + '. ' + sentences[i].trim();
      if (candidate.length > 150) break;
      result = candidate;
    }
    
    return result + (bio.length > result.length ? '...' : '');
  }

  private formatQuote(quote: string): string {
    // Citation limitée à 80 caractères
    return this.smartTruncate(quote, 80);
  }

  private formatListForDisplay(items: string[], maxItems: number = 3): string {
    if (items.length <= maxItems) {
      return items.join(' | ');
    }
    
    const displayed = items.slice(0, maxItems);
    const remaining = items.length - maxItems;
    return displayed.join(' | ') + ` | +${remaining} autres`;
  }

  // Version améliorée de escapeValue avec gestion des textes longs
  private escapeValueSmart(value: string, type: 'bio' | 'quote' | 'list' | 'text' = 'text'): string {
    if (!value) return '';
    
    let processed = value;
    
    // Traitement spécialisé selon le type
    switch (type) {
      case 'bio':
        processed = this.formatBio(value);
        break;
      case 'quote':
        processed = this.formatQuote(value);
        break;
      case 'text':
      default:
        if (this.options.truncateText && value.length > this.options.maxCellLength) {
          processed = this.smartTruncate(value);
        }
        break;
    }
    
    // Nettoyer les caractères problématiques
    let cleaned = processed
      .replace(/[\r\n]/g, this.options.wrapText ? '\n' : ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Échapper les guillemets doubles
    cleaned = cleaned.replace(/"/g, '""');
    
    // Toujours entourer de guillemets pour Excel
    if (this.options.excelCompatible) {
      return `"${cleaned}"`;
    }
    
    // Entourer de guillemets si nécessaire
    if (cleaned.includes(this.options.delimiter) || 
        cleaned.includes('\n') || 
        cleaned.includes('\r') || 
        cleaned.includes('"')) {
      return `"${cleaned}"`;
    }
    
    return cleaned;
  }

  // Méthodes de calcul analytique (exemples pratiques 2025)
  private calculateEngagementScore(persona: Persona): number {
    let score = 50; // Base
    
    // Bonus pour les canaux digitaux
    const digitalChannels = ['Instagram', 'TikTok', 'LinkedIn', 'YouTube'];
    const digitalCount = persona.communication.preferredChannels
      .filter(channel => digitalChannels.includes(channel)).length;
    score += digitalCount * 10;
    
    // Bonus pour l'âge (Gen Z et Millennials plus engagés)
    if (persona.age >= 18 && persona.age <= 35) score += 20;
    else if (persona.age >= 36 && persona.age <= 50) score += 10;
    
    // Bonus pour le nombre d'intérêts
    const totalInterests = Object.values(persona.interests).flat().length;
    score += Math.min(totalInterests * 2, 30);
    
    return Math.min(Math.max(score, 0), 100);
  }

  private calculateConversionPotential(persona: Persona): string {
    const engagementScore = this.calculateEngagementScore(persona);
    const hasStrongMotivations = persona.marketing.motivations.length >= 3;
    const hasDigitalChannels = persona.communication.preferredChannels
      .some(channel => ['Instagram', 'TikTok', 'LinkedIn', 'YouTube'].includes(channel));
    
    if (engagementScore >= 80 && hasStrongMotivations && hasDigitalChannels) {
      return 'Très Élevé';
    } else if (engagementScore >= 60 && hasStrongMotivations) {
      return 'Élevé';
    } else if (engagementScore >= 40) {
      return 'Moyen';
    } else {
      return 'Faible';
    }
  }

  private calculateDigitalMaturity(persona: Persona): string {
    const digitalChannels = ['Instagram', 'TikTok', 'LinkedIn', 'YouTube', 'Twitter'];
    const digitalCount = persona.communication.preferredChannels
      .filter(channel => digitalChannels.includes(channel)).length;
    
    const hasModernInterests = persona.interests.lifestyle
      .some(interest => interest.includes('technologie') || interest.includes('innovation'));
    
    if (digitalCount >= 4 || hasModernInterests) {
      return 'Expert';
    } else if (digitalCount >= 2) {
      return 'Intermédiaire';
    } else if (digitalCount >= 1) {
      return 'Débutant';
    } else {
      return 'Traditionnel';
    }
  }

  public estimateMonthlyBudget(persona: Persona): string {
    let budget = 100; // Base en euros
    
    // Ajustement par âge
    if (persona.age >= 35 && persona.age <= 55) budget *= 2;
    else if (persona.age >= 25 && persona.age <= 34) budget *= 1.5;
    
    // Ajustement par localisation (exemple)
    if (persona.location.includes('Paris') || persona.location.includes('Monaco')) {
      budget *= 2;
    } else if (persona.location.includes('Lyon') || persona.location.includes('Marseille')) {
      budget *= 1.5;
    }
    
    // Ajustement par intérêts premium
    const premiumInterests = persona.interests.brands.filter(brand => 
      ['Apple', 'Tesla', 'Louis Vuitton', 'Rolex'].includes(brand)
    ).length;
    budget += premiumInterests * 200;
    
    return `${Math.round(budget)}€`;
  }

  private calculateDataQuality(persona: Persona): string {
    let score = 0;
    const maxScore = 10;
    
    // Vérifications de qualité
    if (persona.bio.length > 50) score += 2;
    if (persona.quote.length > 20) score += 1;
    if (persona.values.length >= 3) score += 2;
    if (Object.values(persona.interests).flat().length >= 10) score += 2;
    if (persona.communication.preferredChannels.length >= 2) score += 1;
    if (persona.marketing.painPoints.length >= 2) score += 1;
    if (persona.marketing.motivations.length >= 2) score += 1;
    
    const percentage = Math.round((score / maxScore) * 100);
    
    if (percentage >= 90) return 'Excellente';
    else if (percentage >= 70) return 'Bonne';
    else if (percentage >= 50) return 'Moyenne';
    else return 'Faible';
  }
}

// Fonction utilitaire pour estimer le budget mensuel
function estimateMonthlyBudget(persona: Persona): string {
  let budget = 100; // Base en euros
  
  // Ajustement par âge
  if (persona.age >= 35 && persona.age <= 55) budget *= 2;
  else if (persona.age >= 25 && persona.age <= 34) budget *= 1.5;
  
  // Ajustement par localisation (exemple)
  if (persona.location.includes('Paris') || persona.location.includes('Monaco')) {
    budget *= 2;
  } else if (persona.location.includes('Lyon') || persona.location.includes('Marseille')) {
    budget *= 1.5;
  }
  
  // Ajustement par intérêts premium
  const premiumInterests = persona.interests.brands.filter(brand => 
    ['Apple', 'Tesla', 'Louis Vuitton', 'Rolex'].includes(brand)
  ).length;
  budget += premiumInterests * 200;
  
  return `${Math.round(budget)}€`;
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
  
  // Créer un blob avec le bon type MIME pour Excel
  const blob = new Blob([csvContent], { 
    type: 'text/csv;charset=utf-8;' 
  });
  
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `PersonaCraft_Export_${new Date().toISOString().split('T')[0]}.csv`;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

// Fonction pour créer un CSV avec analyse statistique avancée
export function exportPersonasWithAnalytics(personas: Persona[]): string {
  const exporter = new CSVExporter({
    excelCompatible: true,
    includeMetadata: true,
    dateFormat: 'excel',
    format: 'sections' // Utiliser le format sections pour une meilleure lisibilité
  });
  
  const basicCSV = exporter.exportPersonas(personas);
  
  // Ajouter des statistiques avancées
  const analytics = generateAdvancedAnalytics(personas);
  const analyticsCSV = '\r\n\r\n=== ANALYSE STATISTIQUE AVANCÉE ===\r\n' + 
    'Métrique;Valeur;Pourcentage;Tendance_2025\r\n' +
    Object.entries(analytics)
      .map(([key, data]) => `"${key}";"${data.value}";"${data.percentage || 'N/A'}";"${data.trend || 'Stable'}"`)
      .join('\r\n');
  
  return basicCSV + analyticsCSV;
}

function generateAdvancedAnalytics(personas: Persona[]): Record<string, {
  value: string | number;
  percentage?: string;
  trend?: string;
}> {
  const totalPersonas = personas.length;
  const avgAge = Math.round(personas.reduce((sum, p) => sum + p.age, 0) / totalPersonas);
  
  // Analyse des générations
  const genZ = personas.filter(p => p.age >= 18 && p.age <= 26).length;
  const millennials = personas.filter(p => p.age >= 27 && p.age <= 42).length;
  const genX = personas.filter(p => p.age >= 43 && p.age <= 58).length;
  
  // Analyse des canaux digitaux
  const digitalUsers = personas.filter(p => 
    p.communication.preferredChannels.some(ch => 
      ['Instagram', 'TikTok', 'LinkedIn', 'YouTube'].includes(ch)
    )
  ).length;
  
  // Analyse du potentiel de conversion
  const highConversion = personas.filter(p => 
    p.marketing.motivations.length >= 3 && p.marketing.painPoints.length >= 2
  ).length;
  
  // Analyse des budgets
  const avgBudget = personas.reduce((sum, p) => {
    const budgetStr = estimateMonthlyBudget(p);
    const budget = parseInt(budgetStr.replace('€', ''));
    return sum + budget;
  }, 0) / totalPersonas;

  return {
    'Total_Personas': { value: totalPersonas, percentage: '100%', trend: 'Croissance' },
    'Age_Moyen': { value: `${avgAge} ans`, trend: 'Stable' },
    'Generation_Z': { value: genZ, percentage: `${Math.round(genZ/totalPersonas*100)}%`, trend: 'Forte croissance' },
    'Millennials': { value: millennials, percentage: `${Math.round(millennials/totalPersonas*100)}%`, trend: 'Dominant' },
    'Generation_X': { value: genX, percentage: `${Math.round(genX/totalPersonas*100)}%`, trend: 'Déclin' },
    'Utilisateurs_Digitaux': { value: digitalUsers, percentage: `${Math.round(digitalUsers/totalPersonas*100)}%`, trend: 'Explosion' },
    'Potentiel_Conversion_Élevé': { value: highConversion, percentage: `${Math.round(highConversion/totalPersonas*100)}%`, trend: 'Augmentation' },
    'Budget_Moyen_Mensuel': { value: `${Math.round(avgBudget)}€`, trend: 'Hausse inflation' },
    'Date_Export': { value: new Date().toLocaleDateString('fr-FR'), trend: 'Données fraîches' },
    'Qualité_Données': { value: 'Premium AI', percentage: '95%', trend: 'Amélioration continue' }
  };
}