// Prompts optimisés pour la génération de personas avec Gemini

export const PERSONA_PROMPTS = {
  // Prompt de base pour la génération de personas
  BASE_SYSTEM: `Tu es un expert en marketing et en création de personas. Tu génères des personas marketing authentiques, détaillés et réalistes basés sur des données comportementales et culturelles réelles.

Tes personas doivent être :
- Authentiques et crédibles
- Basés sur des insights comportementaux réels
- Détaillés mais concis
- Utilisables pour des stratégies marketing concrètes
- Cohérents dans tous leurs aspects

Tu réponds TOUJOURS en JSON valide selon le format spécifié.`,

  // Structure JSON requise
  JSON_STRUCTURE: `
{
  "name": "string (nom complet réaliste)",
  "age": number,
  "location": "string (ville, pays)",
  "bio": "string (2-3 phrases décrivant la personne)",
  "quote": "string (citation personnelle authentique)",
  "values": ["string"] (3-5 valeurs fondamentales),
  "interests": {
    "music": ["string"] (3-4 genres/artistes),
    "brands": ["string"] (4-5 marques préférées),
    "movies": ["string"] (3-4 films/séries),
    "food": ["string"] (3-4 types de cuisine/aliments),
    "books": ["string"] (3-4 livres/genres),
    "lifestyle": ["string"] (4-5 activités/hobbies)
  },
  "communication": {
    "preferredChannels": ["string"] (2-4 canaux de communication),
    "tone": "string (style de communication)",
    "contentTypes": ["string"] (3-4 types de contenu préférés),
    "frequency": "string (fréquence de communication souhaitée)"
  },
  "marketing": {
    "painPoints": ["string"] (3-4 points de douleur spécifiques),
    "motivations": ["string"] (3-4 motivations principales),
    "buyingBehavior": "string (description du comportement d'achat)",
    "influences": ["string"] (3-4 sources d'influence)
  }
}`,

  // Prompt principal pour génération
  GENERATE_PERSONA: (context: any) => `${PERSONA_PROMPTS.BASE_SYSTEM}

CONTEXTE DU PROJET :
${context.description}

PARAMÈTRES DÉMOGRAPHIQUES :
- Âge : ${context.ageRange}
- Localisation : ${context.location || 'France'}

CENTRES D'INTÉRÊT SPÉCIFIÉS :
${context.interests.join(', ')}

VALEURS IMPORTANTES :
${context.values.join(', ')}

${context.culturalData ? `
DONNÉES CULTURELLES (Qloo AI) :
${context.culturalData.recommendations?.map((r: any) => 
  `- ${r.type}: ${r.name} (confiance: ${Math.round(r.confidence * 100)}%)`
).join('\n') || 'Aucune donnée culturelle disponible'}
` : ''}

INSTRUCTIONS :
1. Crée un persona cohérent qui reflète les intérêts et valeurs spécifiés
2. Utilise les données culturelles Qloo pour enrichir les centres d'intérêt
3. Assure-toi que tous les aspects du persona sont alignés et réalistes
4. La biographie doit être engageante et refléter la personnalité
5. La citation doit être authentique et révélatrice de la personnalité
6. Les points de douleur et motivations doivent être spécifiques et actionnables

${PERSONA_PROMPTS.JSON_STRUCTURE}

Génère maintenant le persona en JSON :`,

  // Prompt pour variation de personas
  GENERATE_VARIATION: (basePersona: any, variationIndex: number) => `${PERSONA_PROMPTS.BASE_SYSTEM}

Tu dois créer une VARIATION du persona de base suivant, en gardant les mêmes paramètres généraux mais en créant une personnalité distincte et unique.

PERSONA DE BASE :
${JSON.stringify(basePersona, null, 2)}

INSTRUCTIONS POUR LA VARIATION ${variationIndex + 1} :
1. Garde la même tranche d'âge et région générale
2. Utilise les mêmes centres d'intérêt de base mais avec des nuances différentes
3. Crée une personnalité DISTINCTE avec des valeurs et motivations différentes
4. Change le nom, l'âge exact, la ville spécifique
5. Adapte la biographie et la citation pour refléter cette nouvelle personnalité
6. Varie les canaux de communication et le style
7. Assure-toi que cette variation est cohérente et authentique

${PERSONA_PROMPTS.JSON_STRUCTURE}

Génère la variation en JSON :`,

  // Prompts spécialisés par industrie
  INDUSTRY_SPECIFIC: {
    TECH: `Focus sur les aspects technologiques, innovation, early adopters, canaux digitaux.`,
    FASHION: `Emphasise style, tendances, esthétique, réseaux sociaux visuels, influenceurs mode.`,
    FOOD: `Met l'accent sur les habitudes alimentaires, restaurants, cuisine maison, durabilité.`,
    TRAVEL: `Concentre-toi sur les voyages, découvertes culturelles, expériences, aventure.`,
    HEALTH: `Focus sur bien-être, fitness, santé mentale, habitudes saines, prévention.`,
    FINANCE: `Emphasise sécurité financière, investissements, épargne, planification future.`,
    EDUCATION: `Met l'accent sur apprentissage, développement personnel, compétences, formation.`,
    ENTERTAINMENT: `Focus sur divertissement, culture, loisirs, médias, expériences sociales.`
  },

  // Prompts pour différents types de personas
  PERSONA_TYPES: {
    BUYER: `Crée un persona axé sur le comportement d'achat, les décisions d'achat, le parcours client.`,
    USER: `Focus sur l'utilisation de produits/services, l'expérience utilisateur, les besoins fonctionnels.`,
    BRAND: `Emphasise la relation à la marque, la fidélité, les valeurs partagées, l'engagement.`,
    INFLUENCER: `Met l'accent sur le leadership d'opinion, l'influence sociale, la création de contenu.`
  },

  // Prompts pour améliorer la cohérence
  CONSISTENCY_CHECK: `Vérifie que le persona généré est cohérent :
- Les intérêts correspondent-ils aux valeurs ?
- Le style de communication est-il aligné avec la personnalité ?
- Les points de douleur sont-ils logiques par rapport au profil ?
- Les motivations sont-elles réalistes pour cette démographie ?`,

  // Prompts pour l'enrichissement culturel
  CULTURAL_ENHANCEMENT: (culturalData: any) => `Enrichis le persona avec ces données culturelles :
${JSON.stringify(culturalData, null, 2)}

Intègre naturellement ces recommandations dans les centres d'intérêt du persona, en gardant la cohérence avec sa personnalité.`,

  // Prompts pour différentes langues/régions
  LOCALIZATION: {
    FRANCE: `Adapte le persona pour la culture française : références culturelles françaises, marques locales, habitudes de consommation françaises.`,
    CANADA: `Adapte pour la culture canadienne : bilinguisme, marques canadiennes, climat, valeurs canadiennes.`,
    UK: `Adapte pour la culture britannique : références UK, marques britanniques, humour britannique.`,
    GERMANY: `Adapte pour la culture allemande : efficacité, qualité, marques allemandes, valeurs germaniques.`
  },

  // Prompts pour validation et amélioration
  VALIDATION: `Évalue ce persona sur :
1. Réalisme (0-10)
2. Cohérence interne (0-10)  
3. Utilité marketing (0-10)
4. Complétude des informations (0-10)
5. Authenticité (0-10)

Identifie les points d'amélioration possibles.`,

  // Prompts pour génération de contenu additionnel
  ADDITIONAL_CONTENT: {
    SOCIAL_MEDIA: `Génère 5 posts de réseaux sociaux typiques que ce persona pourrait publier.`,
    SHOPPING_LIST: `Crée une liste de courses typique pour ce persona.`,
    DAILY_SCHEDULE: `Décris une journée type de ce persona.`,
    MEDIA_CONSUMPTION: `Liste les médias (podcasts, chaînes YouTube, magazines) que ce persona consomme.`,
    PAIN_POINT_SCENARIOS: `Décris 3 scénarios concrets où ce persona rencontre ses points de douleur.`
  }
};

// Templates de prompts réutilisables
export const PROMPT_TEMPLATES = {
  // Template pour brief client
  CLIENT_BRIEF: (briefData: any) => `
BRIEF CLIENT :
Projet : ${briefData.projectName}
Objectif : ${briefData.objective}
Cible : ${briefData.targetAudience}
Budget : ${briefData.budget}
Timeline : ${briefData.timeline}
Contraintes : ${briefData.constraints}

Génère un persona qui correspond parfaitement à ce brief client.
`,

  // Template pour A/B testing
  AB_TEST: (variant: 'A' | 'B') => `
Génère une version ${variant} du persona pour un test A/B.
Version A : Plus conservatrice, risk-averse
Version B : Plus innovante, early adopter
`,

  // Template pour personas saisonniers
  SEASONAL: (season: string) => `
Adapte le persona pour la saison ${season} :
- Intérêts saisonniers
- Habitudes de consommation saisonnières  
- Motivations liées à la saison
- Canaux de communication saisonniers
`
};

// Paramètres optimisés pour différents cas d'usage
export const GENERATION_PARAMETERS = {
  CREATIVE: {
    temperature: 0.9,
    top_p: 0.95,
    creativity_level: 'high' as const
  },
  BALANCED: {
    temperature: 0.7,
    top_p: 0.8,
    creativity_level: 'medium' as const
  },
  CONSERVATIVE: {
    temperature: 0.5,
    top_p: 0.7,
    creativity_level: 'low' as const
  },
  CONSISTENT: {
    temperature: 0.3,
    top_p: 0.6,
    consistency_mode: true
  }
};

// Messages d'erreur et fallbacks
export const ERROR_PROMPTS = {
  INVALID_JSON: `La réponse précédente n'était pas un JSON valide. Régénère le persona en respectant exactement le format JSON spécifié.`,
  INCOMPLETE_DATA: `Le persona précédent était incomplet. Assure-toi de remplir tous les champs requis avec des données pertinentes.`,
  INCONSISTENT_DATA: `Le persona précédent contenait des incohérences. Vérifie que tous les aspects sont alignés et logiques.`,
  GENERIC_RESPONSE: `Le persona précédent était trop générique. Crée un persona plus spécifique et unique avec des détails distinctifs.`
};