/**
 * Système de prompts pour Gemini AI
 * Centralise tous les prompts pour faciliter la maintenance et les tests A/B
 */

export interface PromptTemplate {
    id: string;
    name: string;
    description: string;
    template: string;
    version: string;
    language: 'fr' | 'en';
    expectedPersonaCount: number;
}

import TemplateLoader from '../template-loader';

/**
 * Prompt principal pour la génération de personas
 */
export const PERSONA_GENERATION_PROMPT: PromptTemplate = {
    id: 'persona-generation-v2',
    name: 'Génération de Personas Marketing',
    description: 'Prompt optimisé pour générer des personas détaillés à partir d\'un brief marketing',
    version: '2.0',
    language: 'fr',
    expectedPersonaCount: 2,
    template: '' // Will be loaded lazily
};

/**
 * Prompt alternatif pour des cas spécifiques
 */
export const PERSONA_GENERATION_SIMPLE: PromptTemplate = {
    id: 'persona-generation-simple-v1',
    name: 'Génération Simple de Personas',
    description: 'Version simplifiée pour des briefs courts ou des tests rapides',
    version: '1.0',
    language: 'fr',
    expectedPersonaCount: 2,
    template: '' // Will be loaded lazily
};

/**
 * Prompt pour des personas B2B
 */
export const PERSONA_GENERATION_B2B: PromptTemplate = {
    id: 'persona-generation-b2b-v1',
    name: 'Génération Personas B2B',
    description: 'Spécialisé pour les personas en contexte professionnel B2B',
    version: '1.0',
    language: 'fr',
    expectedPersonaCount: 2,
    template: '' // Will be loaded lazily
};

/**
 * Configuration par défaut des variables de template
 */
export const DEFAULT_PROMPT_VARIABLES = {
    personaCount: 2,
    minAge: 25,
    maxAge: 45,
    personalityTraitCount: 3,
    valuesCount: 3,
    interestsCount: 3,
    painPointsCount: 3,
    goalsCount: 3,
    channelsCount: 2,
    minQualityScore: 75,
    maxQualityScore: 95
};

/**
 * Classe pour gérer les prompts et leurs variables
 */
export class PromptManager {
    /**
     * Construit un prompt en remplaçant les variables
     */
    static async buildPrompt(
        template: PromptTemplate,
        brief: string,
        variables: Partial<typeof DEFAULT_PROMPT_VARIABLES> = {}
    ): Promise<string> {
        const finalVariables = { ...DEFAULT_PROMPT_VARIABLES, ...variables };

        // Load template if not already loaded
        let prompt = template.template;
        if (!prompt) {
            prompt = await TemplateLoader.loadTemplate(template.id);
            template.template = prompt; // Cache it
        }

        // Remplacer le brief
        prompt = prompt.replace(/\{\{brief\}\}/g, brief);

        // Remplacer toutes les variables
        Object.entries(finalVariables).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
                prompt = prompt.replace(regex, value.toString());
            }
        });

        return prompt.trim();
    }

    /**
     * Obtient un prompt par son ID
     */
    static getPromptById(id: string): PromptTemplate | null {
        const prompts = [
            PERSONA_GENERATION_PROMPT,
            PERSONA_GENERATION_SIMPLE,
            PERSONA_GENERATION_B2B
        ];

        return prompts.find(p => p.id === id) || null;
    }

    /**
     * Liste tous les prompts disponibles
     */
    static getAllPrompts(): PromptTemplate[] {
        return [
            PERSONA_GENERATION_PROMPT,
            PERSONA_GENERATION_SIMPLE,
            PERSONA_GENERATION_B2B
        ];
    }

    /**
     * Valide qu'un prompt contient toutes les variables nécessaires
     */
    static validatePrompt(template: PromptTemplate): { valid: boolean; missingVariables: string[] } {
        const requiredVariables = ['brief'];
        const missingVariables: string[] = [];

        requiredVariables.forEach(variable => {
            if (!template.template.includes(`{{${variable}}}`)) {
                missingVariables.push(variable);
            }
        });

        return {
            valid: missingVariables.length === 0,
            missingVariables
        };
    }

    /**
     * Génère un prompt de test avec des données d'exemple
     */
    static async generateTestPrompt(templateId: string = 'persona-generation-v2'): Promise<string> {
        const template = this.getPromptById(templateId);
        if (!template) {
            throw new Error(`Template ${templateId} non trouvé`);
        }

        const testBrief = "Lancement d'une application mobile de fitness pour les professionnels urbains actifs qui manquent de temps pour aller en salle de sport.";

        return await this.buildPrompt(template, testBrief);
    }
}

// Export des prompts les plus utilisés pour un accès rapide
export const PROMPTS = {
    DEFAULT: PERSONA_GENERATION_PROMPT,
    SIMPLE: PERSONA_GENERATION_SIMPLE,
    B2B: PERSONA_GENERATION_B2B
} as const;

export type PromptType = keyof typeof PROMPTS;