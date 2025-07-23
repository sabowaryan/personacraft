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
Utilisez cette structure EXACTE (respectez les noms de propriétés) :

{
  "name": "Nom complet de la persona",
  "age": 30,
  "location": "Ville, Pays", 
  "bio": "Description détaillée de la persona en 2-3 phrases",
  "quote": "Une citation personnelle authentique",
  "values": ["Valeur 1", "Valeur 2", "Valeur 3"],
  "interests": {
    "music": ["Genre 1", "Genre 2", "Genre 3"],
    "brands": ["Marque 1", "Marque 2", "Marque 3"],
    "movies": ["Film 1", "Film 2", "Film 3"],
    "food": ["Cuisine 1", "Cuisine 2", "Cuisine 3"],
    "books": ["Livre 1", "Livre 2", "Livre 3"],
    "lifestyle": ["Activité 1", "Activité 2", "Activité 3"]
  },
  "communication": {
    "preferredChannels": ["Instagram", "Email", "LinkedIn"],
    "tone": "Professionnel et accessible",
    "contentTypes": ["Articles", "Vidéos", "Stories"],
    "frequency": "Hebdomadaire"
  },
  "marketing": {
    "painPoints": ["Problème 1", "Problème 2", "Problème 3"],
    "motivations": ["Motivation 1", "Motivation 2", "Motivation 3"],
    "buyingBehavior": "Description détaillée du comportement d'achat",
    "influences": ["Source 1", "Source 2", "Source 3"]
  }
}

ATTENTION: Respectez exactement ces noms de propriétés :
- communication.preferredChannels (pas "channels")
- communication.contentTypes (pas "types")
- marketing.painPoints (pas "pain_points")
- marketing.buyingBehavior (pas "buying_behavior")

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

    // Ajout d'une instruction explicite pour éviter les champs vides
    return `${PERSONA_PROMPTS.GENERATE_PERSONA(baseContext)}

IMPORTANT :
- Chaque catégorie d'intérêts (music, brands, movies, food, books, lifestyle) doit contenir AU MOINS UN élément pertinent (pas de tableau vide).
- Les champs de communication (preferredChannels, tone, contentTypes, frequency) doivent TOUJOURS être remplis (pas de champ vide).
- Si aucune donnée n'est disponible, invente une valeur plausible et réaliste.
- Ne laisse JAMAIS de tableau vide ou de champ vide dans le JSON final.`;
  }

  private parsePersonaResponse(content: string): any {
    try {
      console.log('Début parsing réponse Gemini...');
      
      // Extraire le JSON du contenu
      let extractedJson = '';
      const jsonContent = content.trim();
      
      // Rechercher les marqueurs JSON
      const jsonStart = jsonContent.indexOf('{');
      const jsonEnd = jsonContent.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        // Stratégie 1: Extraire entre les accolades
        extractedJson = jsonContent.substring(jsonStart, jsonEnd + 1);
        console.log('JSON extrait entre accolades, longueur:', extractedJson.length);
      } else {
        // Stratégie 2: Prendre tout le contenu si pas d'accolades trouvées
        extractedJson = jsonContent;
        console.log('Utilisation du contenu complet, longueur:', extractedJson.length);
      }
      
      // Afficher un aperçu du JSON avant nettoyage
      console.log('JSON avant nettoyage (premiers 200 chars):', extractedJson.substring(0, 200));
      
      // Nettoyer les caractères problématiques avant parsing
      extractedJson = this.cleanJsonString(extractedJson);
      
      // Afficher un aperçu du JSON après nettoyage
      console.log('JSON après nettoyage (premiers 200 chars):', extractedJson.substring(0, 200));
      
      // Validation basique du JSON avant parsing
      if (!this.isValidJsonStructure(extractedJson)) {
        console.warn('Structure JSON invalide détectée, tentative de parsing quand même...');
      }
      
      console.log('Tentative de parsing JSON...');
      const parsedData = JSON.parse(extractedJson);
      console.log('✅ Parsing JSON réussi');
      
      // Validation des données parsées
      if (!parsedData || typeof parsedData !== 'object') {
        throw new Error('Données JSON invalides: objet attendu');
      }
      
      return parsedData;
      
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON Gemini:', parseError);
      console.error('Contenu brut (premiers 500 chars):', content.substring(0, 500));
      
      // Identifier la position de l'erreur si possible
      if (parseError instanceof SyntaxError && parseError.message.includes('position')) {
        const positionMatch = parseError.message.match(/position (\d+)/);
        if (positionMatch) {
          const position = parseInt(positionMatch[1]);
          const context = content.substring(Math.max(0, position - 50), position + 50);
          console.error(`Erreur à la position ${position}, contexte:`, context);
          console.error('Caractère problématique:', content[position] || 'EOF');
        }
      }
      
      console.log('🔄 Tentative de récupération avec stratégie de fallback...');
      
      // Tentative de récupération avec une stratégie de fallback
      const fallbackData = this.tryFallbackParsing(content);
      if (fallbackData) {
        console.log('✅ Données de fallback récupérées avec succès');
        return fallbackData;
      }
      
      // Si tout échoue, lancer l'erreur originale
      throw parseError;
    }
  }
  
  private cleanJsonString(jsonString: string): string {
    // Première étape : nettoyer les retours à la ligne DANS les chaînes de caractères
    let cleaned = jsonString;
    
    // Fonction pour échapper correctement les retours à la ligne dans les valeurs de chaînes
    const fixStringValues = (str: string): string => {
      // Regex pour capturer les valeurs de chaînes (entre guillemets)
      return str.replace(/"([^"]*(?:\\.[^"]*)*)"/g, (match, content) => {
        // Nettoyer le contenu de la chaîne
        const cleanContent = content
          .replace(/\r?\n/g, ' ')  // Remplacer les vrais retours à la ligne par des espaces
          .replace(/\s+/g, ' ')    // Normaliser les espaces multiples
          .replace(/\\n/g, ' ')    // Remplacer les \n échappés par des espaces
          .replace(/\\t/g, ' ')    // Remplacer les \t échappés par des espaces
          .replace(/\\r/g, ' ')    // Remplacer les \r échappés par des espaces
          .replace(/"/g, '\\"')    // Échapper les guillemets internes
          .trim();                 // Supprimer les espaces en début/fin
        
        return `"${cleanContent}"`;
      });
    };
    
    // Appliquer le nettoyage des chaînes
    cleaned = fixStringValues(cleaned);
    
    // Nettoyer les caractères de contrôle problématiques
    cleaned = cleaned
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ') // Supprimer les caractères de contrôle
      .replace(/,(\s*[}\]])/g, '$1') // Supprimer les virgules avant les fermetures
      .replace(/([}\]])(\s*)([{\[])/g, '$1,$2$3'); // Ajouter des virgules manquantes entre objets/arrays
    
    // Deuxième étape : nettoyer la structure JSON générale
    cleaned = cleaned
      .replace(/\\\\/g, '\\')     // Corriger les doubles backslashes
      .replace(/,(\s*[}\]])/g, '$1')  // Supprimer les virgules avant } ou ]
      .replace(/([}\]])(\s*[,])/g, '$1') // Supprimer les virgules après } ou ]
      .replace(/,(\s*,)/g, ',')   // Supprimer les virgules doubles
      .replace(/:\s*,/g, ': null,') // Remplacer les valeurs vides par null
      .trim();
    
    return cleaned;
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
      console.log('🔄 Tentative de récupération JSON avec stratégies multiples...');
      
      // Stratégie 1: Tenter de réparer le JSON en fixant les retours à la ligne
      try {
        console.log('Stratégie 1: Réparation des retours à la ligne...');
        
        // Extraire le JSON et nettoyer agressivement
        let jsonStart = content.indexOf('{');
        let jsonEnd = content.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1) {
          let extractedJson = content.substring(jsonStart, jsonEnd + 1);
          
          // Réparation agressive des retours à la ligne dans les chaînes
          extractedJson = extractedJson.replace(/"\s*\n\s*/g, ' '); // Retours à la ligne après guillemets
          extractedJson = extractedJson.replace(/\n\s*"/g, ' "'); // Retours à la ligne avant guillemets
          extractedJson = extractedJson.replace(/,\s*\n\s*"/g, ', "'); // Virgule + retour à la ligne + guillemet
          extractedJson = extractedJson.replace(/"\s*\n\s*,/g, '",'); // Guillemet + retour à la ligne + virgule
          
          // Nettoyer les retours à la ligne généraux
          extractedJson = extractedJson.replace(/\r?\n/g, ' ');
          extractedJson = extractedJson.replace(/\s+/g, ' ');
          
          // Appliquer le nettoyage standard
          extractedJson = this.cleanJsonString(extractedJson);
          
          console.log('JSON réparé (premiers 200 chars):', extractedJson.substring(0, 200));
          
          const parsedData = JSON.parse(extractedJson);
          console.log('✅ Stratégie 1 réussie: JSON réparé et parsé');
          return parsedData;
        }
      } catch (repairError) {
        console.log('❌ Stratégie 1 échouée:', repairError instanceof Error ? repairError.message : String(repairError));
      }
      
      // Stratégie 2: Extraction par regex des champs principaux
      try {
        console.log('Stratégie 2: Extraction par regex...');
        
        const extractedInfo = this.extractBasicInfo(content);
        
        if (extractedInfo.name || extractedInfo.bio) {
          console.log('✅ Stratégie 2 réussie: Informations extraites par regex');
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
        }
      } catch (regexError) {
        console.log('❌ Stratégie 2 échouée:', regexError instanceof Error ? regexError.message : String(regexError));
      }
      
      // Stratégie 3: Persona de fallback complet
      console.log('Stratégie 3: Création d\'un persona de fallback générique...');
      
      return {
        name: 'Persona Générée',
        age: 32,
        location: 'Paris, France',
        bio: 'Persona générée automatiquement suite à une erreur de parsing. Les données ont été reconstituées avec des valeurs par défaut.',
        quote: 'L\'innovation et la qualité guident mes choix.',
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
      
    } catch (fallbackError) {
      console.error('❌ Toutes les stratégies de fallback ont échoué:', fallbackError);
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
      interests: {
        music: ['Pop'],
        brands: ['Apple'],
        movies: ['Inception'],
        food: ['Cuisine française'],
        books: ['Sapiens'],
        lifestyle: ['Voyage']
      },
      communication: {
        preferredChannels: ['Email'],
        tone: 'Professionnel et accessible',
        contentTypes: ['Articles'],
        frequency: 'Hebdomadaire'
      },
      marketing: {
        painPoints: ['Manque de temps'],
        motivations: ['Qualité'],
        buyingBehavior: 'Recherche approfondie avant achat',
        influences: ['Avis clients']
      }
    };

    const mappedData = { ...data };

    // Si les intérêts sont un tableau simple, mappe-les vers les catégories
    if (Array.isArray(data.interests) && !data.interests.music) {
      mappedData.interests = this.mapSimpleInterestsToCategories(data.interests);
    }

    // Validation/fallback pour chaque champ d'intérêts
    mappedData.interests = {
      music: (mappedData.interests?.music && mappedData.interests.music.length > 0) ? mappedData.interests.music : defaults.interests.music,
      brands: (mappedData.interests?.brands && mappedData.interests.brands.length > 0) ? mappedData.interests.brands : defaults.interests.brands,
      movies: (mappedData.interests?.movies && mappedData.interests.movies.length > 0) ? mappedData.interests.movies : defaults.interests.movies,
      food: (mappedData.interests?.food && mappedData.interests.food.length > 0) ? mappedData.interests.food : defaults.interests.food,
      books: (mappedData.interests?.books && mappedData.interests.books.length > 0) ? mappedData.interests.books : defaults.interests.books,
      lifestyle: (mappedData.interests?.lifestyle && mappedData.interests.lifestyle.length > 0) ? mappedData.interests.lifestyle : defaults.interests.lifestyle
    };

    // Validation/fallback pour chaque champ de communication
    mappedData.communication = {
      preferredChannels: (data.communication?.preferredChannels && data.communication.preferredChannels.length > 0) ? data.communication.preferredChannels : defaults.communication.preferredChannels,
      tone: data.communication?.tone || defaults.communication.tone,
      contentTypes: (data.communication?.contentTypes && data.communication.contentTypes.length > 0) ? data.communication.contentTypes : defaults.communication.contentTypes,
      frequency: data.communication?.frequency || defaults.communication.frequency
    };

    // Validation/fallback pour marketing
    mappedData.marketing = {
      painPoints: (data.marketing?.painPoints && data.marketing.painPoints.length > 0) ? data.marketing.painPoints : defaults.marketing.painPoints,
      motivations: (data.marketing?.motivations && data.marketing.motivations.length > 0) ? data.marketing.motivations : defaults.marketing.motivations,
      buyingBehavior: data.marketing?.buyingBehavior || defaults.marketing.buyingBehavior,
      influences: (data.marketing?.influences && data.marketing.influences.length > 0) ? data.marketing.influences : defaults.marketing.influences
    };

    // Fusionner les données existantes avec les valeurs par défaut
    return {
      ...defaults,
      ...mappedData,
      communication: {
        ...defaults.communication,
        ...(mappedData.communication || {})
      },
      marketing: {
        ...defaults.marketing,
        ...(mappedData.marketing || {})
      },
      interests: {
        ...defaults.interests,
        ...(mappedData.interests || {})
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
        interests: {
          music: ['Pop', 'Rock', 'Electronic'],
          brands: ['Apple', 'Nike', 'Tesla'],
          movies: ['Inception', 'Interstellar', 'The Matrix'],
          food: ['Cuisine française', 'Sushi', 'Street food'],
          books: ['Sapiens', 'Atomic Habits', 'The Lean Startup'],
          lifestyle: ['Technologie', 'Voyages', 'Sport']
        },
        communication: {
          preferredChannels: ['Email', 'LinkedIn', 'Teams'],
          tone: 'Professionnel avec une touche personnelle',
          contentTypes: ['Articles', 'Vidéos', 'Webinaires'],
          frequency: 'Hebdomadaire'
        },
        marketing: {
          painPoints: ['Manque de temps', 'Surcharge d\'information', 'Difficulté à rester à jour'],
          motivations: ['Efficacité', 'Innovation', 'Croissance professionnelle'],
          buyingBehavior: 'Recherche approfondie en ligne, compare les avis, privilégie la qualité',
          influences: ['Avis clients', 'Recommandations professionnelles', 'Études de cas']
        }
      },
      business: {
        name: 'Sophie Dubois',
        age: 38,
        location: 'Paris, France',
        bio: 'Dirigeante d\'entreprise expérimentée, focalisée sur la croissance durable et l\'innovation.',
        quote: 'Le succès se mesure par l\'impact positif que nous créons ensemble.',
        values: ['Excellence', 'Durabilité', 'Leadership'],
        interests: {
          music: ['Jazz', 'Classical', 'World Music'],
          brands: ['Patagonia', 'Tesla', 'B Corp'],
          movies: ['The Pursuit of Happyness', 'Moneyball', 'Steve Jobs'],
          food: ['Cuisine bio', 'Restaurants étoilés', 'Cuisine du monde'],
          books: ['Good to Great', 'Lean In', 'The Infinite Game'],
          lifestyle: ['Stratégie', 'Développement durable', 'Mentoring']
        },
        communication: {
          preferredChannels: ['LinkedIn', 'Présentations', 'Webinaires'],
          tone: 'Professionnel et visionnaire',
          contentTypes: ['Études de cas', 'Rapports', 'Keynotes'],
          frequency: 'Mensuel'
        },
        marketing: {
          painPoints: ['Complexité réglementaire', 'Recrutement de talents', 'Transformation digitale'],
          motivations: ['Impact social', 'Croissance durable', 'Innovation'],
          buyingBehavior: 'Décisions basées sur ROI, consultations d\'experts, processus structuré',
          influences: ['Études sectorielles', 'Réseaux professionnels', 'Consultants experts']
        }
      },
      creative: {
        name: 'Jules Moreau',
        age: 28,
        location: 'Bordeaux, France',
        bio: 'Créatif passionné par le design et l\'art numérique, toujours à la recherche de nouvelles inspirations.',
        quote: 'La créativité est l\'art de transformer l\'ordinaire en extraordinaire.',
        values: ['Créativité', 'Expression', 'Innovation'],
        interests: {
          music: ['Indie', 'Electronic', 'Alternative'],
          brands: ['Adobe', 'Wacom', 'Moleskine'],
          movies: ['Blade Runner 2049', 'Her', 'The Grand Budapest Hotel'],
          food: ['Cuisine fusion', 'Food trucks', 'Cuisine végétarienne'],
          books: ['The Design of Everyday Things', 'Steal Like an Artist', 'Creative Confidence'],
          lifestyle: ['Design', 'Art', 'Photographie']
        },
        communication: {
          preferredChannels: ['Instagram', 'Behance', 'Dribbble'],
          tone: 'Inspirant et artistique',
          contentTypes: ['Visuels', 'Stories', 'Portfolios'],
          frequency: 'Quotidien'
        },
        marketing: {
          painPoints: ['Clients difficiles', 'Revenus irréguliers', 'Concurrence'],
          motivations: ['Expression artistique', 'Reconnaissance', 'Liberté créative'],
          buyingBehavior: 'Achats impulsifs pour l\'inspiration, investit dans la qualité des outils',
          influences: ['Communauté créative', 'Tendances design', 'Influenceurs artistiques']
        }
      },
      user: {
        name: 'Marie Lefevre',
        age: 29,
        location: 'Nantes, France',
        bio: 'Utilisatrice experte, toujours à la recherche de solutions pratiques et efficaces.',
        quote: 'La simplicité est la sophistication ultime.',
        values: ['Efficacité', 'Praticité', 'Qualité'],
        interests: {
          music: ['Pop', 'Podcasts', 'Audiobooks'],
          brands: ['Apple', 'Notion', 'Spotify'],
          movies: ['The Social Network', 'Julie & Julia', 'The Intern'],
          food: ['Cuisine rapide et saine', 'Meal prep', 'Smoothies'],
          books: ['Productivity guides', 'Self-help', 'Biographies'],
          lifestyle: ['Productivité', 'Bien-être', 'Technologie']
        },
        communication: {
          preferredChannels: ['Applications', 'Email', 'Notifications push'],
          tone: 'Amical et constructif',
          contentTypes: ['Tutoriels', 'Tips', 'Reviews'],
          frequency: 'Quotidien'
        },
        marketing: {
          painPoints: ['Interfaces complexes', 'Perte de temps', 'Trop d\'options'],
          motivations: ['Gain de temps', 'Simplicité', 'Efficacité'],
          buyingBehavior: 'Teste d\'abord, lit les avis, privilégie les solutions simples',
          influences: ['Avis utilisateurs', 'Tutoriels YouTube', 'Recommandations d\'amis']
        }
      },
      marketing: {
        name: 'Pierre Dubois',
        age: 35,
        location: 'Marseille, France',
        bio: 'Expert en marketing digital, spécialisé dans les stratégies data-driven.',
        quote: 'Le marketing, c\'est l\'art de créer des connexions authentiques.',
        values: ['Performance', 'Créativité', 'Analyse'],
        interests: {
          music: ['Techno', 'House', 'Ambient'],
          brands: ['Google', 'HubSpot', 'Mailchimp'],
          movies: ['Mad Men', 'The Wolf of Wall Street', 'Thank You for Smoking'],
          food: ['Cuisine méditerranéenne', 'Tapas', 'Cuisine fusion'],
          books: ['Influence', 'Made to Stick', 'Contagious'],
          lifestyle: ['Marketing digital', 'Analytics', 'Growth hacking']
        },
        communication: {
          preferredChannels: ['LinkedIn', 'Twitter', 'Webinaires'],
          tone: 'Professionnel et dynamique',
          contentTypes: ['Études de cas', 'Infographies', 'Analyses'],
          frequency: 'Bi-hebdomadaire'
        },
        marketing: {
          painPoints: ['Attribution difficile', 'Budgets serrés', 'Évolution constante des plateformes'],
          motivations: ['ROI élevé', 'Innovation', 'Performance'],
          buyingBehavior: 'Analyse data-driven, tests A/B, décisions basées sur métriques',
          influences: ['Études de cas', 'Conférences marketing', 'Thought leaders']
        }
      },
      buyer: {
        name: 'Claire Moreau',
        age: 42,
        location: 'Toulouse, France',
        bio: 'Responsable achats expérimentée, focalisée sur la valeur et la qualité.',
        quote: 'Un bon achat, c\'est un investissement pour l\'avenir.',
        values: ['Qualité', 'Valeur', 'Durabilité'],
        interests: {
          music: ['Classical', 'Opera', 'World Music'],
          brands: ['Quality certifiées', 'Marques durables', 'B2B leaders'],
          movies: ['The Big Short', 'Margin Call', 'Up in the Air'],
          food: ['Cuisine traditionnelle', 'Produits locaux', 'Bio'],
          books: ['Procurement guides', 'Supply chain', 'Negotiation'],
          lifestyle: ['Négociation', 'Qualité', 'Sustainability']
        },
        communication: {
          preferredChannels: ['Email professionnel', 'Réunions', 'Rapports'],
          tone: 'Professionnel et exigeant',
          contentTypes: ['Rapports détaillés', 'Comparatifs', 'Spécifications'],
          frequency: 'Mensuel'
        },
        marketing: {
          painPoints: ['Fournisseurs non fiables', 'Pression sur les prix', 'Complexité réglementaire'],
          motivations: ['Optimisation coûts', 'Qualité garantie', 'Relations durables'],
          buyingBehavior: 'Processus rigoureux, appels d\'offres, négociation approfondie',
          influences: ['Références clients', 'Certifications', 'Historique fournisseur']
        }
      },
      brand: {
        name: 'Antoine Leclerc',
        age: 31,
        location: 'Lille, France',
        bio: 'Brand manager passionné par la construction d\'identités fortes et mémorables.',
        quote: 'Une marque forte crée une communauté, pas seulement des clients.',
        values: ['Authenticité', 'Cohérence', 'Impact'],
        interests: {
          music: ['Indie', 'Alternative', 'Experimental'],
          brands: ['Nike', 'Apple', 'Patagonia'],
          movies: ['The Greatest Showman', 'A Star is Born', 'La La Land'],
          food: ['Street food', 'Cuisine créative', 'Pop-up restaurants'],
          books: ['Building Strong Brands', 'The Brand Gap', 'Zag'],
          lifestyle: ['Branding', 'Storytelling', 'Design']
        },
        communication: {
          preferredChannels: ['Instagram', 'TikTok', 'Brand events'],
          tone: 'Inspirant et authentique',
          contentTypes: ['Stories', 'Behind-the-scenes', 'User-generated content'],
          frequency: 'Quotidien'
        },
        marketing: {
          painPoints: ['Différenciation difficile', 'Cohérence multi-canal', 'Mesure de l\'impact'],
          motivations: ['Authenticité de marque', 'Engagement communauté', 'Impact culturel'],
          buyingBehavior: 'Choix basés sur l\'alignement de valeurs, expérience premium',
          influences: ['Communautés de marque', 'Influenceurs authentiques', 'Tendances culturelles']
        }
      }
    };
    
    return fallbackPersonas[personaType] || fallbackPersonas.general;
  }

  private mapSimpleInterestsToCategories(interests: string[] | undefined): any {
    // Mots-clés pour chaque catégorie
    const categories = {
      music: ['musique', 'music', 'pop', 'rock', 'jazz', 'electro', 'afro', 'sessions', 'beats', 'sounds'],
      brands: ['marque', 'brand', 'apple', 'nike', 'tesla', 'pro', 'eco', 'plus', 'smart'],
      movies: ['film', 'movie', 'cinéma', 'chronicles', 'story', 'inception', 'matrix', 'adventure'],
      food: ['cuisine', 'food', 'kitchen', 'fusion', 'bio', 'vegetarienne', 'organic', 'fresh'],
      books: ['livre', 'book', 'guide', 'manual', 'mastery', 'insights', 'sapiens'],
      lifestyle: ['style', 'life', 'voyage', 'travel', 'sport', 'way', 'photographie', 'technologie', 'mobility']
    };
    const result: any = { music: [], brands: [], movies: [], food: [], books: [], lifestyle: [] };
    if (!Array.isArray(interests)) return result;
    for (const interest of interests) {
      const lower = interest.toLowerCase();
      let found = false;
      for (const [cat, keywords] of Object.entries(categories)) {
        if (keywords.some(k => lower.includes(k))) {
          result[cat].push(interest);
          found = true;
          break;
        }
      }
      if (!found) {
        // Si aucun mot-clé ne correspond, place dans lifestyle par défaut
        result.lifestyle.push(interest);
      }
    }
    // S'assurer qu'il y a au moins un élément par catégorie
    for (const cat of Object.keys(result)) {
      if (result[cat].length === 0) {
        result[cat] = [cat.charAt(0).toUpperCase() + cat.slice(1)];
      }
    }
    return result;
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