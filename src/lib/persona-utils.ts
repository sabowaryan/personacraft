import { Persona, Demographics, Psychographics, CulturalData, MarketingInsights } from '@/types';
import { EnrichedPersona } from '@/types/enhanced-persona';

/**
 * Valide et nettoie un objet Persona pour s'assurer qu'il a toutes les propriétés requises
 */
export function validateAndCleanPersona(persona: Partial<EnrichedPersona>): EnrichedPersona {
  const defaultDemographics: Demographics = {
    income: 'Non spécifié',
    education: 'Non spécifié',
    familyStatus: 'Non spécifié'
  };

  const defaultPsychographics: Psychographics = {
    personality: [],
    values: [],
    interests: [],
    lifestyle: 'Non spécifié'
  };

  const defaultCulturalData: CulturalData = {
    music: [],
    movie: [],
    tv: [],
    book: [],
    brand: [],
    restaurant: [],
    travel: [],
    fashion: [],
    beauty: [],
    food: [],
    socialMedia: []
  };

  const defaultMarketingInsights: MarketingInsights = {
    preferredChannels: [],
    messagingTone: 'Non spécifié',
    buyingBehavior: 'Non spécifié'
  };

  return {
    id: persona.id || generateId(),
    name: persona.name || 'Persona sans nom',
    age: persona.age || 25,
    occupation: persona.occupation || 'Non spécifié',
    location: persona.location || 'Non spécifié',
    bio: persona.bio || 'Biographie non disponible',
    quote: persona.quote || 'Citation non disponible',
    email: persona.email,
    phone: persona.phone,
    demographics: {
      ...defaultDemographics,
      ...persona.demographics
    },
    psychographics: {
      ...defaultPsychographics,
      ...persona.psychographics,
      personality: persona.psychographics?.personality || [],
      values: persona.psychographics?.values || [],
      interests: persona.psychographics?.interests || []
    },
    culturalData: {
      ...defaultCulturalData,
      ...persona.culturalData
    },
    painPoints: persona.painPoints || [],
    goals: persona.goals || [],
    marketingInsights: {
      ...defaultMarketingInsights,
      ...persona.marketingInsights,
      preferredChannels: persona.marketingInsights?.preferredChannels || []
    },
    qualityScore: persona.qualityScore || 0,
    createdAt: persona.createdAt || new Date().toISOString(),
    brief: persona.brief,
    socialMediaInsights: persona.socialMediaInsights,
    // Préserver les métadonnées de génération
    generationMetadata: persona.generationMetadata,
    validationMetadata: persona.validationMetadata,
    culturalDataSource: persona.culturalDataSource,
    templateUsed: persona.templateUsed,
    processingTime: persona.processingTime,
    metadata: persona.metadata
  };
}

/**
 * Valide un tableau de personas et nettoie chacun d'eux
 */
export function validateAndCleanPersonas(personas: Partial<EnrichedPersona>[]): EnrichedPersona[] {
  return personas.map(validateAndCleanPersona);
}

/**
 * Vérifie si un persona a des données psychographiques valides
 */
export function hasValidPsychographics(persona: Persona): boolean {
  return !!(
    persona.psychographics &&
    Array.isArray(persona.psychographics.personality) &&
    Array.isArray(persona.psychographics.values) &&
    Array.isArray(persona.psychographics.interests) &&
    typeof persona.psychographics.lifestyle === 'string'
  );
}

/**
 * Génère un ID unique pour un persona
 */
function generateId(): string {
  return `persona_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Calcule un score de qualité basé sur la complétude des données
 */
export function calculateQualityScore(persona: Persona): number {
  let score = 0;
  const maxScore = 100;

  // Données de base (30 points)
  if (persona.name && persona.name !== 'Persona sans nom') score += 5;
  if (persona.age > 0) score += 5;
  if (persona.occupation && persona.occupation !== 'Non spécifié') score += 5;
  if (persona.location && persona.location !== 'Non spécifié') score += 5;
  if (persona.painPoints.length > 0) score += 5;
  if (persona.goals.length > 0) score += 5;

  // Démographiques (20 points)
  if (persona.demographics.income !== 'Non spécifié') score += 7;
  if (persona.demographics.education !== 'Non spécifié') score += 7;
  if (persona.demographics.familyStatus !== 'Non spécifié') score += 6;

  // Psychographiques (30 points)
  if (persona.psychographics.personality.length > 0) score += 8;
  if (persona.psychographics.values.length > 0) score += 8;
  if (persona.psychographics.interests.length > 0) score += 8;
  if (persona.psychographics.lifestyle !== 'Non spécifié') score += 6;

  // Données culturelles (10 points)
  if (persona.culturalData.music.length > 0) score += 3;
  if (persona.culturalData.brand.length > 0) score += 3;
  if (persona.culturalData.socialMedia.length > 0) score += 4;

  // Marketing insights (10 points)
  if (persona.marketingInsights.preferredChannels.length > 0) score += 5;
  if (persona.marketingInsights.messagingTone !== 'Non spécifié') score += 5;

  return Math.min(score, maxScore);
}

/**
 * Formate les données culturelles pour l'affichage
 */
export function formatCulturalData(culturalData: CulturalData): Record<string, string[]> {
  return {
    'Musique': culturalData.music || [],
    'Films': culturalData.movie || [],
    'Télévision': culturalData.tv || [],
    'Livres': culturalData.book || [],
    'Marques': culturalData.brand || [],
    'Restaurants': culturalData.restaurant || [],
    'Voyages': culturalData.travel || [],
    'Mode': culturalData.fashion || [],
    'Beauté': culturalData.beauty || [],
    'Nourriture': culturalData.food || [],
    'Réseaux sociaux': culturalData.socialMedia || []
  };
}

/**
 * Extrait les mots-clés principaux d'un persona pour la recherche
 */
export function extractPersonaKeywords(persona: Persona): string[] {
  const keywords: string[] = [];
  
  // Ajouter les données de base
  if (persona.name) keywords.push(persona.name);
  if (persona.occupation) keywords.push(persona.occupation);
  if (persona.location) keywords.push(persona.location);
  
  // Ajouter les données psychographiques
  keywords.push(...persona.psychographics.personality);
  keywords.push(...persona.psychographics.values);
  keywords.push(...persona.psychographics.interests);
  
  // Ajouter les points de douleur et objectifs
  keywords.push(...persona.painPoints);
  keywords.push(...persona.goals);
  
  // Ajouter les données culturelles
  keywords.push(...persona.culturalData.music);
  keywords.push(...persona.culturalData.brand);
  keywords.push(...persona.culturalData.socialMedia);
  
  // Nettoyer et dédupliquer
  return [...new Set(keywords.filter(k => k && k.trim().length > 0))];
}

/**
 * Compare deux personas et retourne un score de similarité (0-100)
 */
export function calculateSimilarityScore(persona1: Persona, persona2: Persona): number {
  let totalScore = 0;
  let maxPossibleScore = 0;

  // Comparaison démographique (25 points)
  maxPossibleScore += 25;
  if (Math.abs(persona1.age - persona2.age) <= 5) totalScore += 8;
  if (persona1.demographics.income === persona2.demographics.income) totalScore += 6;
  if (persona1.demographics.education === persona2.demographics.education) totalScore += 6;
  if (persona1.demographics.familyStatus === persona2.demographics.familyStatus) totalScore += 5;

  // Comparaison psychographique (35 points)
  maxPossibleScore += 35;
  const personalityOverlap = calculateArrayOverlap(persona1.psychographics.personality, persona2.psychographics.personality);
  const valuesOverlap = calculateArrayOverlap(persona1.psychographics.values, persona2.psychographics.values);
  const interestsOverlap = calculateArrayOverlap(persona1.psychographics.interests, persona2.psychographics.interests);
  
  totalScore += personalityOverlap * 12;
  totalScore += valuesOverlap * 12;
  totalScore += interestsOverlap * 11;

  // Comparaison culturelle (25 points)
  maxPossibleScore += 25;
  const musicOverlap = calculateArrayOverlap(persona1.culturalData.music, persona2.culturalData.music);
  const brandOverlap = calculateArrayOverlap(persona1.culturalData.brand, persona2.culturalData.brand);
  const socialMediaOverlap = calculateArrayOverlap(persona1.culturalData.socialMedia, persona2.culturalData.socialMedia);
  
  totalScore += musicOverlap * 8;
  totalScore += brandOverlap * 9;
  totalScore += socialMediaOverlap * 8;

  // Comparaison marketing (15 points)
  maxPossibleScore += 15;
  const channelsOverlap = calculateArrayOverlap(persona1.marketingInsights.preferredChannels, persona2.marketingInsights.preferredChannels);
  totalScore += channelsOverlap * 10;
  if (persona1.marketingInsights.messagingTone === persona2.marketingInsights.messagingTone) totalScore += 5;

  return Math.round((totalScore / maxPossibleScore) * 100);
}

/**
 * Calcule le pourcentage de chevauchement entre deux tableaux
 */
function calculateArrayOverlap(arr1: string[], arr2: string[]): number {
  if (arr1.length === 0 && arr2.length === 0) return 1;
  if (arr1.length === 0 || arr2.length === 0) return 0;
  
  const set1 = new Set(arr1.map(item => item.toLowerCase()));
  const set2 = new Set(arr2.map(item => item.toLowerCase()));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

/**
 * Filtre les personas selon des critères spécifiques
 */
export function filterPersonas(personas: Persona[], filters: {
  ageRange?: [number, number];
  occupation?: string[];
  location?: string[];
  minQualityScore?: number;
  keywords?: string[];
}): Persona[] {
  return personas.filter(persona => {
    // Filtre par âge
    if (filters.ageRange) {
      const [minAge, maxAge] = filters.ageRange;
      if (persona.age < minAge || persona.age > maxAge) return false;
    }

    // Filtre par profession
    if (filters.occupation && filters.occupation.length > 0) {
      if (!filters.occupation.some(occ => 
        persona.occupation.toLowerCase().includes(occ.toLowerCase())
      )) return false;
    }

    // Filtre par localisation
    if (filters.location && filters.location.length > 0) {
      if (!filters.location.some(loc => 
        persona.location.toLowerCase().includes(loc.toLowerCase())
      )) return false;
    }

    // Filtre par score de qualité
    if (filters.minQualityScore) {
      const qualityScore = calculateQualityScore(persona);
      if (qualityScore < filters.minQualityScore) return false;
    }

    // Filtre par mots-clés
    if (filters.keywords && filters.keywords.length > 0) {
      const personaKeywords = extractPersonaKeywords(persona);
      const hasKeyword = filters.keywords.some(keyword =>
        personaKeywords.some(pk => 
          pk.toLowerCase().includes(keyword.toLowerCase())
        )
      );
      if (!hasKeyword) return false;
    }

    return true;
  });
}

/**
 * Trie les personas selon différents critères
 */
export function sortPersonas(personas: Persona[], sortBy: 'name' | 'age' | 'quality' | 'created', order: 'asc' | 'desc' = 'asc'): Persona[] {
  const sorted = [...personas].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'age':
        comparison = a.age - b.age;
        break;
      case 'quality':
        comparison = calculateQualityScore(a) - calculateQualityScore(b);
        break;
      case 'created':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }

    return order === 'desc' ? -comparison : comparison;
  });

  return sorted;
}

/**
 * Génère un résumé textuel d'un persona
 */
export function generatePersonaSummary(persona: Persona): string {
  const age = persona.age;
  const occupation = persona.occupation;
  const location = persona.location;
  
  const topInterests = persona.psychographics.interests.slice(0, 3).join(', ');
  const topValues = persona.psychographics.values.slice(0, 2).join(' et ');
  
  let summary = `${persona.name} est un(e) ${occupation} de ${age} ans basé(e) à ${location}.`;
  
  if (topInterests) {
    summary += ` Ses principaux centres d'intérêt incluent ${topInterests}.`;
  }
  
  if (topValues) {
    summary += ` Il/Elle valorise particulièrement ${topValues}.`;
  }
  
  if (persona.painPoints.length > 0) {
    summary += ` Ses principales préoccupations sont ${persona.painPoints[0]}.`;
  }
  
  if (persona.goals.length > 0) {
    summary += ` Son objectif principal est ${persona.goals[0]}.`;
  }

  return summary;
}

/**
 * Valide la structure d'un persona importé
 */
export function validateImportedPersona(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Vérifications obligatoires
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Le nom est requis et doit être une chaîne de caractères');
  }

  if (!data.age || typeof data.age !== 'number' || data.age < 0 || data.age > 120) {
    errors.push('L\'âge est requis et doit être un nombre entre 0 et 120');
  }

  if (!data.occupation || typeof data.occupation !== 'string') {
    errors.push('La profession est requise et doit être une chaîne de caractères');
  }

  // Vérifications de structure
  if (data.psychographics) {
    if (!Array.isArray(data.psychographics.personality)) {
      errors.push('Les traits de personnalité doivent être un tableau');
    }
    if (!Array.isArray(data.psychographics.values)) {
      errors.push('Les valeurs doivent être un tableau');
    }
    if (!Array.isArray(data.psychographics.interests)) {
      errors.push('Les centres d\'intérêt doivent être un tableau');
    }
  }

  if (data.culturalData) {
    const culturalFields = ['music', 'movie', 'tv', 'book', 'brand', 'restaurant', 'travel', 'fashion', 'beauty', 'food', 'socialMedia'];
    culturalFields.forEach(field => {
      if (data.culturalData[field] && !Array.isArray(data.culturalData[field])) {
        errors.push(`Les données culturelles ${field} doivent être un tableau`);
      }
    });
  }

  if (data.painPoints && !Array.isArray(data.painPoints)) {
    errors.push('Les points de douleur doivent être un tableau');
  }

  if (data.goals && !Array.isArray(data.goals)) {
    errors.push('Les objectifs doivent être un tableau');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Exporte un persona au format JSON avec toutes les métadonnées
 */
export function exportPersonaToJson(persona: Persona): string {
  const exportData = {
    ...persona,
    exportedAt: new Date().toISOString(),
    qualityScore: calculateQualityScore(persona),
    keywords: extractPersonaKeywords(persona)
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Crée un persona vide avec la structure par défaut
 */
export function createEmptyPersona(): Persona {
  return {
    id: generateId(),
    name: '',
    age: 25,
    occupation: '',
    location: '',
    bio: '',
    quote: '',
    demographics: {
      income: 'Non spécifié',
      education: 'Non spécifié',
      familyStatus: 'Non spécifié'
    },
    psychographics: {
      personality: [],
      values: [],
      interests: [],
      lifestyle: 'Non spécifié'
    },
    culturalData: {
      music: [],
      movie: [],
      tv: [],
      book: [],
      brand: [],
      restaurant: [],
      travel: [],
      fashion: [],
      beauty: [],
      food: [],
      socialMedia: []
    },
    painPoints: [],
    goals: [],
    marketingInsights: {
      preferredChannels: [],
      messagingTone: 'Non spécifié',
      buyingBehavior: 'Non spécifié'
    },
    qualityScore: 0,
    createdAt: new Date().toISOString()
  };
}