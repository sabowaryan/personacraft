// Orchestrateur principal pour la génération de personas

import { qlooClient, QlooRequest } from './qloo';
import { geminiClient, GeminiClient } from './gemini';
import { Persona, BriefFormData } from '../types/persona';

export interface GenerationResult {
  personas: Persona[];
  metadata: {
    generated_count: number;
    requested_count: number;
    generation_time: string;
    sources_used: string[];
    errors?: string[];
  };
}

export class PersonaGenerator {
  private qlooClient: typeof qlooClient;
  private geminiClient: GeminiClient;

  constructor() {
    this.qlooClient = qlooClient;
    this.geminiClient = geminiClient;
  }

  async generatePersonas(brief: BriefFormData): Promise<GenerationResult> {
    const startTime = Date.now();
    const personas: Persona[] = [];
    const errors: string[] = [];
    const personaCount = brief.generateMultiple ? 3 : 1;

    try {
      // 1. Obtenir les recommandations culturelles de Qloo
      const culturalData = await this.getCulturalRecommendations(brief);

      // 2. Générer les personas avec Gemini
      for (let i = 0; i < personaCount; i++) {
        try {
          const persona = await this.generateSinglePersona(brief, culturalData, i);
          personas.push(persona);
          
          // Délai entre les générations pour éviter la surcharge
          if (i < personaCount - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          const errorMessage = `Erreur génération persona ${i + 1}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
          errors.push(errorMessage);
          console.error(errorMessage);
        }
      }

      const endTime = Date.now();
      const generationTime = `${endTime - startTime}ms`;

      return {
        personas,
        metadata: {
          generated_count: personas.length,
          requested_count: personaCount,
          generation_time: generationTime,
          sources_used: ['Qloo Taste AI', 'Google Gemini'],
          ...(errors.length > 0 && { errors })
        }
      };

    } catch (error) {
      throw new Error(`Échec de la génération de personas: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  private async getCulturalRecommendations(brief: BriefFormData) {
    try {
      const qlooRequest: QlooRequest = {
        interests: brief.interests,
        demographics: {
          age: this.parseAgeRange(brief.ageRange),
          location: brief.location || 'France'
        },
        categories: ['music', 'brands', 'movies', 'food', 'books', 'lifestyle']
      };

      return await this.qlooClient.getRecommendations(qlooRequest);
    } catch (error) {
      console.warn('Impossible d\'obtenir les recommandations Qloo, utilisation de données par défaut:', error);
      return null;
    }
  }

  private async generateSinglePersona(brief: BriefFormData, culturalData: any, index: number): Promise<Persona> {
    const prompt = GeminiClient.buildPersonaPrompt(
      brief.description,
      brief.interests,
      brief.values,
      {
        ageRange: brief.ageRange,
        location: brief.location
      },
      culturalData
    );

    // Ajouter de la variabilité pour les personas multiples
    const variationPrompt = index > 0 ? `\n\nCrée une variation unique et différente des personas précédents, avec une personnalité et des caractéristiques distinctes.` : '';

    // Construire la requête Gemini selon le type attendu
    const geminiRequest = {
      prompt: prompt + variationPrompt,
      persona_type: 'marketing' as const,
      consistency_check: true,
      context: {
        user_context: {
          description: brief.description,
          interests: brief.interests,
          values: brief.values,
          ageRange: brief.ageRange,
          location: brief.location
        },
        cultural_data: culturalData
      },
      parameters: {
        temperature: 0.8,
        max_tokens: 2000,
        format: 'json' as const
      }
    };

    const response = await this.geminiClient.generatePersona(geminiRequest, culturalData);
    const personaData = response.persona_data;

    // Validation et enrichissement des données
    if (!GeminiClient.validatePersonaResponse(personaData)) {
      throw new Error('Réponse invalide de l\'IA - champs manquants');
    }

    // Construction du persona final
    const persona: Persona = {
      id: crypto.randomUUID(),
      name: personaData.name,
      age: personaData.age,
      location: personaData.location,
      bio: personaData.bio,
      values: personaData.values,
      quote: personaData.quote,
      interests: {
        music: personaData.interests.music || [],
        brands: personaData.interests.brands || [],
        movies: personaData.interests.movies || [],
        food: personaData.interests.food || [],
        books: personaData.interests.books || [],
        lifestyle: personaData.interests.lifestyle || []
      },
      communication: {
        preferredChannels: personaData.communication.preferredChannels || [],
        tone: personaData.communication.tone || '',
        contentTypes: personaData.communication.contentTypes || [],
        frequency: personaData.communication.frequency || ''
      },
      marketing: {
        painPoints: personaData.marketing.painPoints || [],
        motivations: personaData.marketing.motivations || [],
        buyingBehavior: personaData.marketing.buyingBehavior || '',
        influences: personaData.marketing.influences || []
      },
      generatedAt: new Date(),
      sources: ['Qloo Taste AI', 'Google Gemini', 'Analyse comportementale'],
      avatar: this.generateAvatarUrl()
    };

    return persona;
  }

  private parseAgeRange(ageRange: string): number {
    const ranges: Record<string, [number, number]> = {
      '18-25': [18, 25],
      '25-35': [25, 35],
      '35-45': [35, 45],
      '45-55': [45, 55],
      '55-65': [55, 65],
      '65+': [65, 80]
    };
    
    const [min, max] = ranges[ageRange] || [25, 35];
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private generateAvatarUrl(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `https://images.unsplash.com/photo-${1500000000000 + random}?w=150&h=150&fit=crop&crop=face&auto=format&q=80`;
  }

  // Méthodes utilitaires statiques
  static async generateFromAPI(brief: BriefFormData): Promise<GenerationResult> {
    const response = await fetch('/api/generate-persona', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(brief)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  static validateBrief(brief: BriefFormData): string[] {
    const errors: string[] = [];

    if (!brief.description || brief.description.length < 10) {
      errors.push('La description doit contenir au moins 10 caractères');
    }

    if (!brief.interests || brief.interests.length === 0) {
      errors.push('Au moins un centre d\'intérêt est requis');
    }

    if (!brief.values || brief.values.length === 0) {
      errors.push('Au moins une valeur est requise');
    }

    if (brief.interests && brief.interests.length > 10) {
      errors.push('Maximum 10 centres d\'intérêt autorisés');
    }

    if (brief.values && brief.values.length > 8) {
      errors.push('Maximum 8 valeurs autorisées');
    }

    return errors;
  }
}

// Instance par défaut
export const personaGenerator = new PersonaGenerator();