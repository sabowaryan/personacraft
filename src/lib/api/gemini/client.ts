import { GoogleGenerativeAI } from '@google/generative-ai';
import { Persona } from '@/types';
import { PersonaValidator, PersonaValidationError } from '@/lib/validators/persona-validator';
import { PromptManager, PROMPTS, PromptType, DEFAULT_PROMPT_VARIABLES } from '@/lib/prompts/gemini-prompts';
import { getFallbackPersonas } from './fallback';

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
            useLegacyValidation?: boolean;
        } = {}
    ): Promise<Partial<Persona>[]> {
        try {
            const prompt = await this.buildPrompt(brief, userContext, options);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return this.parsePersonasResponse(text, brief, options.useLegacyValidation);
        } catch (error) {
            console.error('Erreur Gemini API:', error);
            return getFallbackPersonas(brief);
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

    private parsePersonasResponse(text: string, brief: string, useLegacyValidation?: boolean): Partial<Persona>[] {
        try {
            // Utiliser le validateur approprié selon le contexte
            if (useLegacyValidation) {
                return PersonaValidator.parseGeminiResponseLegacy(text, brief);
            } else {
                return PersonaValidator.parseGeminiResponse(text, brief);
            }
        } catch (error) {
            console.error('Erreur parsing Gemini response:', error);

            if (error instanceof PersonaValidationError) {
                console.error('Erreur de validation:', error.message);
            }

            console.log('Raw response:', text);
            return getFallbackPersonas(brief);
        }
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