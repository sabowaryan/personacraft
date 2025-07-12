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
      // Vérifier les paramètres d'entrée
      if (!request || !request.persona_type) {
        throw new Error('Requête persona invalide: persona_type manquant');
      }
      
      // Construire le prompt pour persona
      const prompt = this.buildPersonaPrompt(request, culturalData);
      
      // Ajouter des instructions spécifiques pour le JSON
      const enhancedPrompt = `${prompt}

IMPORTANT: Votre réponse doit être exclusivement du JSON valide, sans texte additionnel avant ou après. 
Utilisez cette structure exacte:

{
  "name": "Nom de la persona",
  "age": 30,
  "location": "Ville, Pays",
  "bio": "Description détaillée de la persona",
  "quote": "Une citation représentative",
  "values": ["Valeur 1", "Valeur 2", "Valeur 3"],
  "interests": ["Intérêt 1", "Intérêt 2", "Intérêt 3"],
  "communication": {
    "style": "Style de communication",
    "tone": "Ton de communication",
    "channels": ["Canal 1", "Canal 2"]
  },
  "marketing": {
    "segments": ["Segment 1", "Segment 2"],
    "approaches": ["Approche 1", "Approche 2"],
    "channels": ["Canal marketing 1", "Canal marketing 2"]
  }
}

Répondez UNIQUEMENT avec le JSON valide, sans balises de code ni autre formatage.`;
      
      const geminiRequest: GeminiRequest = {
        prompt: enhancedPrompt,
        context: {
          cultural_data: culturalData,
          system_instruction: PERSONA_PROMPTS.BASE_SYSTEM,
          user_context: { persona_type: request.persona_type }
        },
        parameters: {
          ...request.parameters,
          format: 'json',
          consistency_mode: request.consistency_check || false,
          temperature: 0.7, // Réduire la température pour plus de consistance
          max_tokens: 2048
        }
      };

      console.log('Génération persona avec prompt:', enhancedPrompt.substring(0, 200) + '...');

      const response = await this.generateContent(geminiRequest);
      
      console.log('Réponse brute Gemini:', response.content.substring(0, 500) + '...');
      
      // Parser la réponse JSON avec la logique améliorée
      let personaData = this.parsePersonaResponse(response.content);
      
      console.log('Données persona parsées:', personaData);
      
      // Validation des données
      const validationResults = this.validatePersonaData(personaData);
      
      if (!validationResults.is_valid) {
        console.warn('Données persona invalides:', validationResults.issues);
        // Compléter les données manquantes
        const completedData = this.completePersonaData(personaData);
        console.log('Données complétées:', completedData);
        personaData = completedData;
      }

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
      
      // Gestion d'erreur plus détaillée
      if (error instanceof Error) {
        // Si c'est une erreur de parsing JSON, essayer de générer une persona de fallback
        if (error.message.includes('JSON')) {
          console.log('Tentative de génération de persona de fallback...');
          
          const fallbackPersona = this.generateFallbackPersona(request);
          
          return {
            content: JSON.stringify(fallbackPersona),
            usage: {
              prompt_tokens: 0,
              completion_tokens: 0,
              total_tokens: 0,
              estimated_cost: 0
            },
            model: this.config.model || 'gemini-1.5-flash',
            finish_reason: 'fallback' as GeminiFinishReason,
            persona_data: {
              ...fallbackPersona,
              confidence_score: 0.5
            },
            validation_results: {
              is_valid: true,
              completeness_score: 0.8,
              consistency_score: 0.5,
              realism_score: 0.6,
              issues: [{
                field: 'generation',
                severity: 'medium' as const,
                message: 'Données générées en fallback',
                suggestion: 'Vérifiez la configuration API'
              }]
            },
            metadata: {
              request_id: crypto.randomUUID(),
              processing_time: Date.now(),
              model_version: 'fallback-v1',
              cached: false,
              quality_score: 0.5
            }
          };
        }
      }
      
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
      
      // Supprimer les caractères de contrôle et les espaces en trop
      jsonContent = jsonContent.replace(/[\r\n\t]/g, ' ').replace(/\s+/g, ' ').trim();
      
      // Trouver le JSON dans la réponse avec plusieurs stratégies
      let extractedJson = '';
      
      // Stratégie 1: Chercher entre les premières accolades
      const jsonStart = jsonContent.indexOf('{');
      const jsonEnd = jsonContent.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        extractedJson = jsonContent.substring(jsonStart, jsonEnd);
      } else {
        // Stratégie 2: Prendre tout le contenu si pas d'accolades trouvées
        extractedJson = jsonContent;
      }
      
      // Nettoyer les caractères problématiques avant parsing
      extractedJson = this.cleanJsonString(extractedJson);
      
      // Validation basique du JSON avant parsing
      if (!this.isValidJsonStructure(extractedJson)) {
        throw new Error('Structure JSON invalide détectée');
      }
      
      const parsedData = JSON.parse(extractedJson);
      
      // Validation des données parsées
      if (!parsedData || typeof parsedData !== 'object') {
        throw new Error('Données JSON invalides: objet attendu');
      }
      
      return parsedData;
      
    } catch (parseError) {
      console.error('Erreur parsing JSON Gemini:', parseError);
      console.error('Contenu brut:', content);
      console.error('Tentative de parsing:', content.substring(0, 1000) + '...');
      
      // Tentative de récupération avec une stratégie de fallback
      const fallbackData = this.tryFallbackParsing(content);
      if (fallbackData) {
        console.warn('Utilisation des données de fallback');
        return fallbackData;
      }
      
      throw new Error(`Réponse JSON invalide de Gemini: ${parseError instanceof Error ? parseError.message : 'Erreur inconnue'}`);
    }
  }
  
  private cleanJsonString(jsonString: string): string {
    // Nettoyer les caractères échappés incorrectement
    return jsonString
      .replace(/\\n/g, ' ')  // Remplacer les \n par des espaces
      .replace(/\\t/g, ' ')  // Remplacer les \t par des espaces
      .replace(/\\r/g, ' ')  // Remplacer les \r par des espaces
      .replace(/\\\\/g, '\\') // Corriger les doubles backslashes
      .replace(/\\"/g, '"')   // Corriger les guillemets échappés
      .replace(/,(\s*[}\]])/g, '$1')  // Supprimer les virgules avant } ou ]
      .replace(/([}\]])(\s*[,])/g, '$1'); // Supprimer les virgules après } ou ]
  }
  
  private isValidJsonStructure(jsonString: string): boolean {
    // Vérifications basiques de structure JSON
    const trimmed = jsonString.trim();
    
    // Doit commencer par { et finir par }
    if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
      return false;
    }
    
    // Compter les accolades pour vérifier l'équilibre
    let braceCount = 0;
    let bracketCount = 0;
    let inString = false;
    let escaped = false;
    
    for (let i = 0; i < trimmed.length; i++) {
      const char = trimmed[i];
      
      if (escaped) {
        escaped = false;
        continue;
      }
      
      if (char === '\\') {
        escaped = true;
        continue;
      }
      
      if (char === '"') {
        inString = !inString;
        continue;
      }
      
      if (inString) continue;
      
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
      if (char === '[') bracketCount++;
      if (char === ']') bracketCount--;
    }
    
    return braceCount === 0 && bracketCount === 0;
  }
  
  private tryFallbackParsing(content: string): any | null {
    try {
      // Stratégie de fallback: créer un objet persona minimal
      console.log('Tentative de création de persona de fallback...');
      
      // Extraire des informations basiques du texte
      const extractedInfo = this.extractBasicInfo(content);
      
      return {
        name: extractedInfo.name || 'Persona Générée',
        age: extractedInfo.age || 30,
        location: extractedInfo.location || 'France',
        bio: extractedInfo.bio || 'Persona générée automatiquement',
        quote: extractedInfo.quote || 'Une citation inspirante',
        values: extractedInfo.values || ['Qualité', 'Innovation', 'Respect'],
        interests: extractedInfo.interests || ['Technologie', 'Culture', 'Voyage'],
        communication: {
          style: 'Professionnel et accessible',
          tone: 'Chaleureux et informatif',
          channels: ['Email', 'Réseaux sociaux']
        },
        marketing: {
          segments: ['Adultes 25-45 ans'],
          approaches: ['Contenu éducatif', 'Expériences personnalisées'],
          channels: ['Digital', 'Social media']
        }
      };
    } catch (error) {
      console.error('Échec du parsing de fallback:', error);
      return null;
    }
  }
  
  private extractBasicInfo(content: string): any {
    const info: any = {};
    
    // Extraire le nom (chercher des patterns comme "name": "...")
    const nameMatch = content.match(/"name"\s*:\s*"([^"]+)"/i);
    if (nameMatch) info.name = nameMatch[1];
    
    // Extraire l'âge
    const ageMatch = content.match(/"age"\s*:\s*(\d+)/i);
    if (ageMatch) info.age = parseInt(ageMatch[1]);
    
    // Extraire la localisation
    const locationMatch = content.match(/"location"\s*:\s*"([^"]+)"/i);
    if (locationMatch) info.location = locationMatch[1];
    
    // Extraire la bio
    const bioMatch = content.match(/"bio"\s*:\s*"([^"]+)"/i);
    if (bioMatch) info.bio = bioMatch[1];
    
    // Extraire la citation
    const quoteMatch = content.match(/"quote"\s*:\s*"([^"]+)"/i);
    if (quoteMatch) info.quote = quoteMatch[1];
    
    return info;
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

  private completePersonaData(data: any): any {
    const defaults = {
      name: 'Persona Générée',
      age: 30,
      location: 'France',
      bio: 'Persona générée automatiquement avec des données par défaut',
      quote: 'Une citation inspirante qui représente ma vision',
      values: ['Qualité', 'Innovation', 'Respect'],
      interests: ['Technologie', 'Culture', 'Voyage'],
      communication: {
        style: 'Professionnel et accessible',
        tone: 'Chaleureux et informatif',
        channels: ['Email', 'Réseaux sociaux']
      },
      marketing: {
        segments: ['Adultes 25-45 ans'],
        approaches: ['Contenu éducatif', 'Expériences personnalisées'],
        channels: ['Digital', 'Social media']
      }
    };
    
    // Fusionner les données existantes avec les valeurs par défaut
    return {
      ...defaults,
      ...data,
      communication: {
        ...defaults.communication,
        ...(data.communication || {})
      },
      marketing: {
        ...defaults.marketing,
        ...(data.marketing || {})
      }
    };
  }
  
  private generateFallbackPersona(request: GeminiPersonaRequest): any {
    const personaType = request.persona_type || 'general';
    
    const fallbackPersonas: { [key: string]: any } = {
      general: {
        name: 'Alex Martin',
        age: 32,
        location: 'Lyon, France',
        bio: 'Professionnel dynamique passionné par les nouvelles technologies et les expériences humaines authentiques.',
        quote: 'L\'innovation naît de la curiosité et de l\'audace d\'explorer l\'inconnu.',
        values: ['Innovation', 'Authenticité', 'Collaboration'],
        interests: ['Technologie', 'Voyages', 'Gastronomie'],
        communication: {
          style: 'Direct et bienveillant',
          tone: 'Professionnel avec une touche personnelle',
          channels: ['Email', 'LinkedIn', 'Teams']
        },
        marketing: {
          segments: ['Professionnels 25-40 ans', 'Early adopters'],
          approaches: ['Contenu éducatif', 'Témoignages clients', 'Démonstrations'],
          channels: ['Digital', 'Réseaux sociaux', 'Événements']
        }
      },
      business: {
        name: 'Sophie Dubois',
        age: 38,
        location: 'Paris, France',
        bio: 'Dirigeante d\'entreprise expérimentée, focalisée sur la croissance durable et l\'innovation.',
        quote: 'Le succès se mesure par l\'impact positif que nous créons ensemble.',
        values: ['Excellence', 'Durabilité', 'Leadership'],
        interests: ['Stratégie', 'Développement durable', 'Mentoring'],
        communication: {
          style: 'Structuré et inspirant',
          tone: 'Professionnel et visionnaire',
          channels: ['Présentations', 'Webinaires', 'Networking']
        },
        marketing: {
          segments: ['Dirigeants', 'Décideurs B2B'],
          approaches: ['Thought leadership', 'Études de cas', 'ROI démontré'],
          channels: ['LinkedIn', 'Événements professionnels', 'Presse spécialisée']
        }
      },
      creative: {
        name: 'Jules Moreau',
        age: 28,
        location: 'Bordeaux, France',
        bio: 'Créatif passionné par le design et l\'art numérique, toujours à la recherche de nouvelles inspirations.',
        quote: 'La créativité est l\'art de transformer l\'ordinaire en extraordinaire.',
        values: ['Créativité', 'Expression', 'Innovation'],
        interests: ['Design', 'Art', 'Photographie'],
        communication: {
          style: 'Créatif et engageant',
          tone: 'Inspirant et artistique',
          channels: ['Instagram', 'Behance', 'Portfolios']
        },
        marketing: {
          segments: ['Créatifs', 'Millennials', 'Amateurs d\'art'],
          approaches: ['Contenu visuel', 'Storytelling', 'Expériences immersives'],
          channels: ['Social media', 'Galeries', 'Événements culturels']
        }
      },
      user: {
        name: 'Marie Lefevre',
        age: 29,
        location: 'Nantes, France',
        bio: 'Utilisatrice experte, toujours à la recherche de solutions pratiques et efficaces.',
        quote: 'La simplicité est la sophistication ultime.',
        values: ['Efficacité', 'Praticité', 'Qualité'],
        interests: ['Productivité', 'Bien-être', 'Technologie'],
        communication: {
          style: 'Pratique et direct',
          tone: 'Amical et constructif',
          channels: ['Applications', 'Tutoriels', 'Support']
        },
        marketing: {
          segments: ['Utilisateurs actifs', 'Professionnels'],
          approaches: ['Guides pratiques', 'Retours d\'expérience', 'Optimisation'],
          channels: ['Applications', 'Webinaires', 'Forums']
        }
      },
      marketing: {
        name: 'Pierre Dubois',
        age: 35,
        location: 'Marseille, France',
        bio: 'Expert en marketing digital, spécialisé dans les stratégies data-driven.',
        quote: 'Le marketing, c\'est l\'art de créer des connexions authentiques.',
        values: ['Performance', 'Créativité', 'Analyse'],
        interests: ['Marketing digital', 'Analytics', 'Growth hacking'],
        communication: {
          style: 'Analytique et persuasif',
          tone: 'Professionnel et dynamique',
          channels: ['Campagnes', 'Webinaires', 'Rapports']
        },
        marketing: {
          segments: ['Marketeurs', 'Entreprises', 'Startups'],
          approaches: ['Données probantes', 'Cas d\'usage', 'ROI'],
          channels: ['LinkedIn', 'Conférences', 'Études de cas']
        }
      },
      buyer: {
        name: 'Claire Moreau',
        age: 42,
        location: 'Toulouse, France',
        bio: 'Responsable achats expérimentée, focalisée sur la valeur et la qualité.',
        quote: 'Un bon achat, c\'est un investissement pour l\'avenir.',
        values: ['Qualité', 'Valeur', 'Durabilité'],
        interests: ['Négociation', 'Qualité', 'Sustainability'],
        communication: {
          style: 'Méthodique et réfléchi',
          tone: 'Professionnel et exigeant',
          channels: ['Négociations', 'Présentations', 'Rapports']
        },
        marketing: {
          segments: ['Acheteurs B2B', 'Décideurs'],
          approaches: ['Preuves de valeur', 'Comparatifs', 'Références'],
          channels: ['Salons', 'Présentations', 'Dossiers techniques']
        }
      },
      brand: {
        name: 'Antoine Leclerc',
        age: 31,
        location: 'Lille, France',
        bio: 'Brand manager passionné par la construction d\'identités fortes et mémorables.',
        quote: 'Une marque forte crée une communauté, pas seulement des clients.',
        values: ['Authenticité', 'Cohérence', 'Impact'],
        interests: ['Branding', 'Storytelling', 'Design'],
        communication: {
          style: 'Créatif et cohérent',
          tone: 'Inspirant et authentique',
          channels: ['Campagnes', 'Réseaux sociaux', 'Événements']
        },
        marketing: {
          segments: ['Communautés', 'Fans de marque', 'Influenceurs'],
          approaches: ['Storytelling', 'Expériences', 'Engagement'],
          channels: ['Social media', 'Événements', 'Collaborations']
        }
      }
    };
    
    return fallbackPersonas[personaType] || fallbackPersonas.general;
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