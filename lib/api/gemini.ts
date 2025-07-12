// Client API pour Google Gemini avec vraie intégration

import { GoogleGenerativeAI } from '@google/generative-ai';
import { PERSONA_PROMPTS, GENERATION_PARAMETERS } from '@/lib/constants/prompts';
import {
  GeminiRequest,
  GeminiResponse,
  GeminiError,
  GeminiPersonaRequest,
  GeminiPersonaResponse,
  GeminiParameters,
  GeminiClientConfig,
  GeminiUsage,
  GeminiFinishReason
} from '@/lib/types/gemini';

export class GeminiClient {
  private genAI?: GoogleGenerativeAI;
  private model?: any;
  private config: GeminiClientConfig;

  constructor(apiKey?: string, config?: Partial<GeminiClientConfig>) {
    const key = apiKey || process.env.GEMINI_API_KEY || '';
    
    // Ne pas lancer d'erreur pendant le build, gérer l'erreur à l'utilisation
    if (!key && process.env.NODE_ENV !== 'development') {
      console.warn('Clé API Gemini manquante - l\'API sera indisponible');
    }
    
    this.config = {
      api_key: key,
      model: 'gemini-1.5-flash',
      timeout: 30000,
      retries: 3,
      default_parameters: GENERATION_PARAMETERS.BALANCED,
      ...config
    };
    
    // Initialiser seulement si la clé API est disponible
    if (key) {
      this.genAI = new GoogleGenerativeAI(key);
      this.model = this.genAI.getGenerativeModel({ model: this.config.model || 'gemini-1.5-flash' });
    }
  }

  async generateContent(request: GeminiRequest): Promise<GeminiResponse> {
    try {
      // Vérifier si la clé API est disponible
      if (!this.config.api_key || !this.model) {
        throw new Error('Clé API Gemini manquante. Configurez GEMINI_API_KEY dans vos variables d\'environnement.');
      }
      
      const { prompt, parameters = {}, context } = request;
      
      // Fusionner avec les paramètres par défaut
      const mergedParams: GeminiParameters = {
        ...this.config.default_parameters,
        ...parameters
      };
      
      // Configuration du modèle avec les paramètres optimisés
      const generationConfig = {
        temperature: mergedParams.temperature || 0.8,
        topK: mergedParams.top_k || 40,
        topP: mergedParams.top_p || 0.95,
        maxOutputTokens: mergedParams.max_tokens || 2048,
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

      const usage: GeminiUsage = {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: promptTokens + completionTokens,
        estimated_cost: (promptTokens + completionTokens) * 0.0001 // Estimation
      };

      return {
        content: text,
        usage,
        model: this.config.model || 'gemini-1.5-flash',
        finish_reason: 'stop' as GeminiFinishReason,
        metadata: {
          request_id: crypto.randomUUID(),
          processing_time: Date.now(),
          model_version: 'gemini-1.5-flash-v1',
          cached: false,
          quality_score: this.calculateQualityScore(text)
        }
      };

    } catch (error) {
      console.error('Erreur Gemini API:', error);
      
      let errorMessage = 'Erreur inconnue';
      let suggestions = ['Vérifiez votre clé API', 'Réessayez plus tard'];
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Erreurs spécifiques à Gemini
        if (error.message.includes('404')) {
          errorMessage = 'Modèle Gemini non trouvé. Le modèle gemini-pro a été déprécié.';
          suggestions = [
            'Utilisez gemini-1.5-flash ou gemini-1.5-pro',
            'Vérifiez la documentation API Gemini',
            'Mettez à jour votre configuration'
          ];
        } else if (error.message.includes('403') || error.message.includes('401')) {
          errorMessage = 'Clé API Gemini invalide ou manquante';
          suggestions = [
            'Vérifiez votre clé API dans les variables d\'environnement',
            'Obtenez une nouvelle clé sur https://makersuite.google.com/app/apikey',
            'Assurez-vous que la clé API a les bonnes permissions'
          ];
        } else if (error.message.includes('429')) {
          errorMessage = 'Limite de taux Gemini atteinte';
          suggestions = [
            'Attendez avant de faire une nouvelle requête',
            'Réduisez la fréquence des appels API',
            'Consultez les limites de votre quota'
          ];
        } else if (error.message.includes('500')) {
          errorMessage = 'Erreur serveur Gemini';
          suggestions = [
            'Réessayez dans quelques minutes',
            'Vérifiez le statut de l\'API Gemini',
            'Contactez le support Google si le problème persiste'
          ];
        }
      }
      
      const geminiError: GeminiError = {
        error: `Échec génération Gemini: ${errorMessage}`,
        code: 'GENERATION_FAILED',
        details: {
          reason: errorMessage,
          domain: 'gemini_api',
          suggestions
        },
        request_id: crypto.randomUUID()
      };
      throw geminiError;
    }
  }

  async generatePersona(request: GeminiPersonaRequest, culturalData?: any): Promise<GeminiPersonaResponse> {
    try {
      // Construire le prompt pour persona
      const prompt = this.buildPersonaPrompt(request, culturalData);
      
      const geminiRequest: GeminiRequest = {
        prompt,
        context: {
          cultural_data: culturalData,
          system_instruction: PERSONA_PROMPTS.BASE_SYSTEM,
          user_context: { persona_type: request.persona_type }
        },
        parameters: {
          ...request.parameters,
          format: 'json',
          consistency_mode: request.consistency_check || false
        }
      };

      const response = await this.generateContent(geminiRequest);
      
      // Parser la réponse JSON
      const personaData = this.parsePersonaResponse(response.content);
      
      // Validation des données
      const validationResults = this.validatePersonaData(personaData);

      return {
        ...response,
        persona_data: {
          ...personaData,
          confidence_score: validationResults.consistency_score
        },
        validation_results: validationResults
      };

    } catch (error) {
      console.error('Erreur génération persona:', error);
      throw error;
    }
  }

  private buildPersonaPrompt(request: GeminiPersonaRequest, culturalData?: any): string {
    // Utiliser les prompts optimisés selon le type
    const baseContext = {
      description: request.context?.user_context?.description || '',
      interests: request.context?.user_context?.interests || [],
      values: request.context?.user_context?.values || [],
      ageRange: request.context?.user_context?.ageRange || '25-35',
      location: request.context?.user_context?.location || 'France',
      culturalData
    };

    return PERSONA_PROMPTS.GENERATE_PERSONA(baseContext);
  }

  private parsePersonaResponse(content: string): any {
    try {
      // Nettoyer la réponse pour extraire le JSON
      let jsonContent = content.trim();
      
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
      throw new Error('Réponse JSON invalide de Gemini');
    }
  }

  private validatePersonaData(data: any): any {
    const requiredFields = [
      'name', 'age', 'location', 'bio', 'quote', 'values',
      'interests', 'communication', 'marketing'
    ];

    const missingFields = requiredFields.filter(field => !data.hasOwnProperty(field));
    const isValid = missingFields.length === 0;

    return {
      is_valid: isValid,
      completeness_score: Math.max(0, (requiredFields.length - missingFields.length) / requiredFields.length),
      consistency_score: this.calculateConsistencyScore(data),
      realism_score: this.calculateRealismScore(data),
      issues: missingFields.map(field => ({
        field,
        severity: 'high' as const,
        message: `Champ manquant: ${field}`,
        suggestion: `Ajouter le champ ${field} dans la réponse`
      }))
    };
  }

  private calculateQualityScore(content: string): number {
    // Score basé sur la longueur et la structure du contenu
    const baseScore = Math.min(content.length / 1000, 1);
    const structureBonus = content.includes('{') && content.includes('}') ? 0.2 : 0;
    return Math.min(baseScore + structureBonus, 1);
  }

  private calculateConsistencyScore(data: any): number {
    // Vérifier la cohérence entre les différentes sections
    let score = 1.0;
    
    // Vérifications de base
    if (data.age && (data.age < 16 || data.age > 100)) score -= 0.2;
    if (data.values && data.interests) {
      // Plus de logique de cohérence à implémenter
    }
    
    return Math.max(0, score);
  }

  private calculateRealismScore(data: any): number {
    // Score de réalisme basé sur des heuristiques
    let score = 0.8; // Score de base
    
    if (data.name && data.name.length > 2) score += 0.1;
    if (data.bio && data.bio.length > 50) score += 0.1;
    
    return Math.min(score, 1);
  }

  // Méthodes utilitaires statiques (rétrocompatibilité)
  static buildPersonaPrompt(
    description: string,
    interests: string[],
    values: string[],
    demographics: { ageRange: string; location: string },
    culturalData?: any
  ): string {
    const context = {
      description,
      interests,
      values,
      ageRange: demographics.ageRange,
      location: demographics.location,
      culturalData
    };

    return PERSONA_PROMPTS.GENERATE_PERSONA(context);
  }

  static buildVariationPrompt(basePersona: any, variationIndex: number): string {
    return PERSONA_PROMPTS.GENERATE_VARIATION(basePersona, variationIndex);
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