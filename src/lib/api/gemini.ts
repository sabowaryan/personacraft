import { GoogleGenerativeAI } from '@google/generative-ai';
import { Persona } from '@/types';
import { PersonaValidator, PersonaValidationError } from '@/lib/validators/persona-validator';
import { PromptManager, PROMPTS, PromptType, DEFAULT_PROMPT_VARIABLES } from '@/lib/prompts/gemini-prompts';

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private defaultPromptType: PromptType;

  constructor(promptType: PromptType = 'DEFAULT') {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.defaultPromptType = promptType;
  }

  async generatePersonas(
    brief: string, 
    userContext?: string,
    options: {
      promptType?: PromptType;
      variables?: Partial<typeof DEFAULT_PROMPT_VARIABLES>;
    } = {}
  ): Promise<Partial<Persona>[]> {
    try {
      const prompt = await this.buildPrompt(brief, userContext, options);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parsePersonasResponse(text, brief);
    } catch (error) {
      console.error('Erreur Gemini API:', error);
      return this.getFallbackPersonas(brief);
    }
  }

  private async buildPrompt(
    brief: string, 
    userContext?: string,
    options: {
      promptType?: PromptType;
      variables?: Partial<typeof DEFAULT_PROMPT_VARIABLES>;
    } = {}
  ): Promise<string> {
    const { promptType = this.defaultPromptType, variables = {} } = options;
    const template = PROMPTS[promptType];
    
    const promptVariables = {
      ...variables,
      ...(userContext && { userContext })
    };
    
    return await PromptManager.buildPrompt(template, brief, promptVariables);
  }

  private parsePersonasResponse(text: string, brief: string): Partial<Persona>[] {
    try {
      // Utiliser le validateur dédié pour parser et valider
      return PersonaValidator.parseGeminiResponse(text, brief);
    } catch (error) {
      console.error('Erreur parsing Gemini response:', error);
      
      if (error instanceof PersonaValidationError) {
        console.error('Erreur de validation:', error.message);
      }
      
      console.log('Raw response:', text);
      return this.getFallbackPersonas(brief);
    }
  }

  private getFallbackPersonas(brief: string): Partial<Persona>[] {
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
   * Change le type de prompt par défaut pour cette instance
   */
  setDefaultPromptType(promptType: PromptType): void {
    this.defaultPromptType = promptType;
  }

  /**
   * Obtient le type de prompt actuellement utilisé par défaut
   */
  getDefaultPromptType(): PromptType {
    return this.defaultPromptType;
  }

  /**
   * Liste tous les types de prompts disponibles
   */
  getAvailablePromptTypes(): PromptType[] {
    return Object.keys(PROMPTS) as PromptType[];
  }

  /**
   * Génère un prompt de test pour vérifier le formatage
   */
  async generateTestPrompt(promptType?: PromptType): Promise<string> {
    const type = promptType || this.defaultPromptType;
    const template = PROMPTS[type];
    const testBrief = "Application mobile de fitness pour professionnels urbains actifs";
    
    return await PromptManager.buildPrompt(template, testBrief);
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await this.model.generateContent('Test de connexion. Réponds simplement "OK".');
      const response = await result.response;
      return response.text().includes('OK');
    } catch (error) {
      console.error('Test de connexion Gemini échoué:', error);
      return false;
    }
  }
}

// Instance singleton pour éviter les multiples initialisations
let geminiClient: GeminiClient | null = null;

export function getGeminiClient(): GeminiClient {
  if (!geminiClient) {
    geminiClient = new GeminiClient();
  }
  return geminiClient;
}