// Client API pour Google Gemini avec vraie intégration

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiRequest {
  prompt: string;
  context?: any;
  parameters?: {
    temperature?: number;
    maxTokens?: number;
    format?: 'json' | 'text';
  };
}

export interface GeminiResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: string;
}

export interface GeminiError {
  error: string;
  code?: string;
  details?: any;
}

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY || '';
    if (!key) {
      throw new Error('Clé API Gemini manquante');
    }
    
    this.genAI = new GoogleGenerativeAI(key);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateContent(request: GeminiRequest): Promise<GeminiResponse> {
    try {
      const { prompt, parameters = {} } = request;
      
      // Configuration du modèle
      const generationConfig = {
        temperature: parameters.temperature || 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: parameters.maxTokens || 2048,
      };

      // Génération du contenu
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });

      const response = await result.response;
      const text = response.text();

      // Estimation des tokens (approximation)
      const promptTokens = Math.ceil(prompt.length / 4);
      const completionTokens = Math.ceil(text.length / 4);

      return {
        content: text,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens
        },
        model: 'gemini-pro',
        finishReason: 'stop'
      };

    } catch (error) {
      console.error('Erreur Gemini API:', error);
      throw new Error(`Échec génération Gemini: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  async generatePersona(prompt: string, context?: any): Promise<any> {
    const request: GeminiRequest = {
      prompt,
      context,
      parameters: {
        temperature: 0.8,
        maxTokens: 2000,
        format: 'json'
      }
    };

    const response = await this.generateContent(request);
    
    try {
      // Nettoyer la réponse pour extraire le JSON
      let jsonContent = response.content.trim();
      
      // Supprimer les balises markdown si présentes
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Trouver le JSON dans la réponse
      const jsonStart = jsonContent.indexOf('{');
      const jsonEnd = jsonContent.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        jsonContent = jsonContent.substring(jsonStart, jsonEnd);
      }

      return JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Erreur parsing JSON Gemini:', parseError);
      console.log('Contenu reçu:', response.content);
      throw new Error('Réponse JSON invalide de Gemini');
    }
  }

  async generateText(prompt: string, context?: any): Promise<string> {
    const request: GeminiRequest = {
      prompt,
      context,
      parameters: {
        temperature: 0.7,
        maxTokens: 1000,
        format: 'text'
      }
    };

    const response = await this.generateContent(request);
    return response.content;
  }

  // Méthodes utilitaires pour les prompts
  static buildPersonaPrompt(
    description: string,
    interests: string[],
    values: string[],
    demographics: { ageRange: string; location: string },
    culturalData?: any
  ): string {
    return `Tu es un expert en marketing et en création de personas. Génère un persona marketing authentique et détaillé.

CONTEXTE DU PROJET :
${description}

DÉMOGRAPHIE :
- Âge : ${demographics.ageRange} ans
- Localisation : ${demographics.location || 'France'}

INTÉRÊTS PRINCIPAUX :
${interests.join(', ')}

VALEURS IMPORTANTES :
${values.join(', ')}

${culturalData ? `
DONNÉES CULTURELLES (Qloo AI) :
${culturalData.recommendations?.map((r: any) => `- ${r.type}: ${r.name} (confiance: ${Math.round(r.confidence * 100)}%)`).join('\n') || 'Aucune donnée disponible'}
` : ''}

INSTRUCTIONS :
1. Crée un persona cohérent qui reflète les intérêts et valeurs spécifiés
2. Utilise les données culturelles Qloo pour enrichir les centres d'intérêt
3. Assure-toi que tous les aspects du persona sont alignés et réalistes
4. La biographie doit être engageante et refléter la personnalité
5. La citation doit être authentique et révélatrice de la personnalité

Réponds UNIQUEMENT en JSON valide avec cette structure exacte :
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
    "contentTypes": ["string"] (3-4 types de contenu préférés)",
    "frequency": "string (fréquence de communication souhaitée)"
  },
  "marketing": {
    "painPoints": ["string"] (3-4 points de douleur spécifiques),
    "motivations": ["string"] (3-4 motivations principales),
    "buyingBehavior": "string (description du comportement d'achat)",
    "influences": ["string"] (3-4 sources d'influence)
  }
}

Génère maintenant le persona en JSON :`;
  }

  static validatePersonaResponse(response: any): boolean {
    const requiredFields = [
      'name', 'age', 'location', 'bio', 'quote', 'values',
      'interests', 'communication', 'marketing'
    ];

    return requiredFields.every(field => response.hasOwnProperty(field));
  }
}

// Instance par défaut
export const geminiClient = new GeminiClient();