// Client API pour Google Gemini

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
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
  }

  async generateContent(request: GeminiRequest): Promise<GeminiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/gemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData: GeminiError = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      return JSON.parse(response.content);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      throw new Error('Invalid JSON response from Gemini API');
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
    return `
Génère un persona marketing authentique et détaillé avec ces paramètres :

CONTEXTE DU PROJET :
${description}

DÉMOGRAPHIE :
- Âge : ${demographics.ageRange} ans
- Localisation : ${demographics.location || 'Non spécifié'}

INTÉRÊTS PRINCIPAUX :
${interests.join(', ')}

VALEURS IMPORTANTES :
${values.join(', ')}

${culturalData ? `
DONNÉES CULTURELLES (Qloo AI) :
${culturalData.recommendations?.map((r: any) => `- ${r.type}: ${r.name} (confiance: ${Math.round(r.confidence * 100)}%)`).join('\n') || 'Aucune donnée disponible'}
` : ''}

Crée un persona cohérent, réaliste et utilisable pour des stratégies marketing.
Le persona doit refléter les données culturelles et les valeurs spécifiées.
Assure-toi que tous les champs requis sont remplis avec des données pertinentes.
`;
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