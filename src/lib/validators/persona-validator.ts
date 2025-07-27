import { z } from 'zod';
import { Persona } from '@/types';

// Schéma de validation pour les demographics
const DemographicsSchema = z.object({
    income: z.string().min(1, "Income is required"),
    education: z.string().min(1, "Education is required"),
    familyStatus: z.string().min(1, "Family status is required")
});

// Schéma de validation pour les psychographics
const PsychographicsSchema = z.object({
    personality: z.array(z.string()).min(1, "At least one personality trait required"),
    values: z.array(z.string()).min(1, "At least one value required"),
    interests: z.array(z.string()).min(1, "At least one interest required"),
    lifestyle: z.string().min(1, "Lifestyle description is required")
});

// Schéma de validation pour les marketing insights
const MarketingInsightsSchema = z.object({
    preferredChannels: z.array(z.string()).min(1, "At least one preferred channel required"),
    messagingTone: z.string().min(1, "Messaging tone is required"),
    buyingBehavior: z.string().min(1, "Buying behavior is required")
});

// Schéma de validation pour les données culturelles (optionnel)
const CulturalDataSchema = z.object({
    music: z.array(z.string()).default([]),
    movies: z.array(z.string()).default([]),
    tv: z.array(z.string()).default([]),
    books: z.array(z.string()).default([]),
    brands: z.array(z.string()).default([]),
    restaurants: z.array(z.string()).default([]),
    travel: z.array(z.string()).default([]),
    fashion: z.array(z.string()).default([]),
    beauty: z.array(z.string()).default([]),
    food: z.array(z.string()).default([]),
    socialMedia: z.array(z.string()).default([])
}).optional();

// Schéma principal pour un persona
const PersonaSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    age: z.number().min(18, "Age must be at least 18").max(100, "Age must be less than 100"),
    occupation: z.string().min(1, "Occupation is required"),
    location: z.string().min(1, "Location is required"),
    bio: z.string().min(10, "Bio must be at least 10 characters long"),
    quote: z.string().min(5, "Quote must be at least 5 characters long"),
    demographics: DemographicsSchema,
    psychographics: PsychographicsSchema,
    painPoints: z.array(z.string()).min(1, "At least one pain point required"),
    goals: z.array(z.string()).min(1, "At least one goal required"),
    marketingInsights: MarketingInsightsSchema,
    qualityScore: z.number().min(0).max(100, "Quality score must be between 0 and 100"),
    culturalData: CulturalDataSchema,
    createdAt: z.string().optional(),
    brief: z.string().optional()
});

// Schéma pour un tableau de personas
const PersonasArraySchema = z.array(PersonaSchema).min(1, "At least one persona required");

export class PersonaValidator {
    /**
     * Parse et valide une réponse JSON de Gemini
     */
    static parseGeminiResponse(rawResponse: string, brief: string): Partial<Persona>[] {
        try {
            // Étape 1: Nettoyer la réponse
            const cleanedResponse = this.cleanJsonResponse(rawResponse);

            // Étape 2: Parser le JSON
            const parsedData = this.parseJson(cleanedResponse);

            // Étape 3: Valider avec Zod
            const validatedPersonas = this.validatePersonas(parsedData);

            // Étape 4: Enrichir avec les métadonnées
            return this.enrichPersonas(validatedPersonas, brief);

        } catch (error) {
            console.error('Erreur lors du parsing Gemini:', error);
            console.log('Raw response:', rawResponse);
            throw new PersonaValidationError(`Échec du parsing: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }

    /**
     * Nettoie la réponse JSON de Gemini
     */
    private static cleanJsonResponse(rawResponse: string): string {
        let cleaned = rawResponse.trim();

        // Supprimer les balises markdown
        cleaned = cleaned.replace(/```json\n?/gi, '');
        cleaned = cleaned.replace(/```\n?/gi, '');
        cleaned = cleaned.replace(/^json\n?/gi, '');

        // Supprimer les commentaires JavaScript
        cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
        cleaned = cleaned.replace(/\/\/.*$/gm, '');

        // Trouver le tableau JSON principal
        const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            cleaned = jsonMatch[0];
        }

        // Nettoyer les caractères invisibles
        cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

        return cleaned;
    }

    /**
     * Parse le JSON avec gestion d'erreurs détaillée
     */
    private static parseJson(jsonString: string): unknown {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            // Tentative de réparation automatique
            const repairedJson = this.attemptJsonRepair(jsonString);
            try {
                return JSON.parse(repairedJson);
            } catch (repairError) {
                throw new Error(`JSON invalide: ${error instanceof Error ? error.message : 'Erreur de parsing'}`);
            }
        }
    }

    /**
     * Tentative de réparation automatique du JSON
     */
    private static attemptJsonRepair(jsonString: string): string {
        let repaired = jsonString;

        // Réparer les virgules manquantes
        repaired = repaired.replace(/}(\s*){/g, '},\n{');
        repaired = repaired.replace(/](\s*){/g, '],\n{');

        // Réparer les guillemets manquants sur les clés
        repaired = repaired.replace(/(\w+):/g, '"$1":');

        // Réparer les virgules en trop
        repaired = repaired.replace(/,(\s*[}\]])/g, '$1');

        // Réparer les caractères d'échappement problématiques
        repaired = repaired.replace(/\\"/g, '\\"');
        repaired = repaired.replace(/\n/g, '\\n');
        repaired = repaired.replace(/\r/g, '\\r');
        repaired = repaired.replace(/\t/g, '\\t');

        // Réparer les accolades/crochets non fermés
        const openBraces = (repaired.match(/{/g) || []).length;
        const closeBraces = (repaired.match(/}/g) || []).length;
        const openBrackets = (repaired.match(/\[/g) || []).length;
        const closeBrackets = (repaired.match(/]/g) || []).length;

        // Ajouter les accolades manquantes
        for (let i = 0; i < openBraces - closeBraces; i++) {
            repaired += '}';
        }

        // Ajouter les crochets manquants
        for (let i = 0; i < openBrackets - closeBrackets; i++) {
            repaired += ']';
        }

        return repaired;
    }

    /**
     * Valide les personas avec Zod
     */
    private static validatePersonas(data: unknown): z.infer<typeof PersonaSchema>[] {
        // Vérifier que c'est un tableau
        if (!Array.isArray(data)) {
            throw new Error('La réponse doit être un tableau de personas');
        }

        // Valider chaque persona individuellement pour des erreurs plus précises
        const validatedPersonas: z.infer<typeof PersonaSchema>[] = [];
        const errors: string[] = [];

        data.forEach((persona, index) => {
            try {
                const validated = PersonaSchema.parse(persona);
                validatedPersonas.push(validated);
            } catch (error) {
                if (error instanceof z.ZodError) {
                    const errorMessages = error.issues.map(err =>
                        `${err.path.join('.')}: ${err.message}`
                    ).join(', ');
                    errors.push(`Persona ${index + 1}: ${errorMessages}`);
                } else {
                    errors.push(`Persona ${index + 1}: Erreur de validation inconnue`);
                }
            }
        });

        if (validatedPersonas.length === 0) {
            throw new Error(`Aucun persona valide trouvé. Erreurs: ${errors.join('; ')}`);
        }

        if (errors.length > 0) {
            console.warn('Certains personas ont été ignorés:', errors);
        }

        return validatedPersonas;
    }

    /**
     * Enrichit les personas avec les métadonnées
     */
    private static enrichPersonas(personas: z.infer<typeof PersonaSchema>[], brief: string): Partial<Persona>[] {
        const timestamp = Date.now();

        return personas.map((persona, index) => ({
            ...persona,
            id: persona.id || `persona_${timestamp}_${index}`,
            createdAt: persona.createdAt || new Date().toISOString(),
            brief: persona.brief || brief,
            culturalData: persona.culturalData || {
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
            }
        }));
    }

    /**
     * Valide un persona individuel
     */
    static validateSinglePersona(persona: unknown): Partial<Persona> {
        try {
            const validated = PersonaSchema.parse(persona);
            return validated;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errorMessages = error.issues.map(err =>
                    `${err.path.join('.')}: ${err.message}`
                ).join(', ');
                throw new PersonaValidationError(`Validation échouée: ${errorMessages}`);
            }
            throw error;
        }
    }

    /**
     * Valide partiellement un persona (pour les mises à jour)
     */
    static validatePartialPersona(persona: unknown): Partial<Persona> {
        const PartialPersonaSchema = PersonaSchema.partial();
        try {
            return PartialPersonaSchema.parse(persona);
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errorMessages = error.issues.map(err =>
                    `${err.path.join('.')}: ${err.message}`
                ).join(', ');
                throw new PersonaValidationError(`Validation partielle échouée: ${errorMessages}`);
            }
            throw error;
        }
    }
}

/**
 * Erreur personnalisée pour la validation des personas
 */
export class PersonaValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PersonaValidationError';
    }
}

// Export des schémas pour utilisation externe si nécessaire
export { PersonaSchema, PersonasArraySchema };