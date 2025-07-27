import { Persona, Demographics, Psychographics, CulturalData, MarketingInsights } from '@/types';

/**
 * Valide et nettoie un objet Persona pour s'assurer qu'il a toutes les propriétés requises
 */
export function validateAndCleanPersona(persona: Partial<Persona>): Persona {
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
    movies: [],
    tv: [],
    books: [],
    brands: [],
    restaurants: [],
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
    brief: persona.brief
  };
}

/**
 * Valide un tableau de personas et nettoie chacun d'eux
 */
export function validateAndCleanPersonas(personas: Partial<Persona>[]): Persona[] {
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
  if (persona.culturalData.brands.length > 0) score += 3;
  if (persona.culturalData.socialMedia.length > 0) score += 4;

  // Marketing insights (10 points)
  if (persona.marketingInsights.preferredChannels.length > 0) score += 5;
  if (persona.marketingInsights.messagingTone !== 'Non spécifié') score += 5;

  return Math.min(score, maxScore);
}