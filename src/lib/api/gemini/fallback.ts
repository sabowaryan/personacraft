import { Persona } from '@/types';

/**
 * Génère des personas de fallback en cas d'erreur avec l'API Gemini
 */
export function getFallbackPersonas(brief: string): Partial<Persona>[] {
  const timestamp = Date.now();
  
  return [
    {
      id: `persona_${timestamp}_0`,
      name: 'Marie Dubois',
      age: 32,
      occupation: 'Chef de projet marketing',
      location: 'Paris, France',
      demographics: {
        income: '45 000 - 60 000€/an',
        education: 'Master en Marketing',
        familyStatus: 'En couple, sans enfants'
      },
      psychographics: {
        personality: ['Organisée', 'Analytique', 'Créative'],
        values: ['Innovation', 'Efficacité', 'Collaboration'],
        interests: ['Marketing digital', 'Data analytics', 'Tendances tech'],
        lifestyle: 'Urbaine active, équilibre travail-vie personnelle'
      },
      culturalData: {
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
      },
      painPoints: [
        'Manque de temps pour la veille concurrentielle',
        'Difficulté à mesurer le ROI des campagnes créatives',
        'Pression pour des résultats rapides'
      ],
      goals: [
        'Optimiser les performances des campagnes digitales',
        'Développer une stratégie de contenu efficace',
        'Améliorer la mesure de l\'impact marketing'
      ],
      marketingInsights: {
        preferredChannels: ['LinkedIn', 'Email marketing'],
        messagingTone: 'Professionnel mais accessible',
        buyingBehavior: 'Recherche approfondie avant achat'
      },
      qualityScore: 92,
      createdAt: new Date().toISOString(),
      brief: brief
    },
    {
      id: `persona_${timestamp}_1`,
      name: 'Thomas Martin',
      age: 28,
      occupation: 'Développeur Full-Stack',
      location: 'Lyon, France',
      demographics: {
        income: '40 000 - 55 000€/an',
        education: 'École d\'ingénieur',
        familyStatus: 'Célibataire'
      },
      psychographics: {
        personality: ['Curieux', 'Méthodique', 'Innovant'],
        values: ['Apprentissage continu', 'Qualité du code', 'Open source'],
        interests: ['Nouvelles technologies', 'Gaming', 'Podcasts tech'],
        lifestyle: 'Digital nomad occasionnel, passionné de tech'
      },
      culturalData: {
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
      },
      painPoints: [
        'Complexité des nouvelles technologies à maîtriser',
        'Équilibre vie professionnelle/personnelle difficile',
        'Besoin de formation continue'
      ],
      goals: [
        'Monter en compétences sur les technologies émergentes',
        'Contribuer à des projets innovants',
        'Développer son réseau professionnel'
      ],
      marketingInsights: {
        preferredChannels: ['Twitter', 'Dev communities'],
        messagingTone: 'Technique et direct',
        buyingBehavior: 'Influence par les avis de pairs'
      },
      qualityScore: 88,
      createdAt: new Date().toISOString(),
      brief: brief
    }
  ];
}

/**
 * Génère un persona de fallback personnalisé basé sur des paramètres
 */
export function generateCustomFallbackPersona(
  brief: string,
  overrides: Partial<Persona> = {}
): Partial<Persona> {
  const timestamp = Date.now();
  const basePersona = getFallbackPersonas(brief)[0];
  
  return {
    ...basePersona,
    ...overrides,
    id: `persona_${timestamp}_custom`,
    createdAt: new Date().toISOString(),
    brief: brief
  };
}