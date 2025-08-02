/**
 * EnrichedPromptBuilder Service
 * 
 * Service responsible for building enriched Gemini prompts with cultural constraints
 * from Qloo data. This is part of the Qloo-first persona generation flow.
 */

import { 
    EnrichedPromptContext, 
    CulturalConstraints, 
    QlooSignals, 
    QlooFirstError 
} from '@/types/qloo-first';
import { DEFAULT_PROMPT_VARIABLES } from '@/lib/prompts/gemini-prompts';

/**
 * Configuration for prompt building
 */
interface PromptBuildingConfig {
    maxPromptLength: number;
    culturalConstraintWeight: number;
    includeDebugInfo: boolean;
}

/**
 * Default configuration for prompt building
 */
const DEFAULT_CONFIG: PromptBuildingConfig = {
    maxPromptLength: 8000, // Reasonable limit for Gemini
    culturalConstraintWeight: 0.7, // How much to emphasize cultural constraints
    includeDebugInfo: false
};

/**
 * Service for building enriched prompts with cultural constraints
 */
export class EnrichedPromptBuilder {
    private config: PromptBuildingConfig;

    constructor(config: Partial<PromptBuildingConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * Main method to build an enriched prompt with cultural constraints
     * 
     * @param context - The enriched prompt context containing all necessary data
     * @returns Promise<string> - The enriched prompt ready for Gemini
     * @throws QlooFirstError.PROMPT_BUILDING_FAILED if prompt building fails
     */
    async buildPrompt(context: EnrichedPromptContext): Promise<string> {
        try {
            const startTime = Date.now();

            // Get the base prompt template
            const basePrompt = await this.getBasePrompt(context);
            
            // Inject cultural constraints into the prompt
            const enrichedPrompt = this.injectCulturalConstraints(basePrompt, context);
            
            // Validate prompt length and quality
            this.validatePrompt(enrichedPrompt);

            const processingTime = Date.now() - startTime;
            
            if (this.config.includeDebugInfo) {
                console.log(`Prompt built in ${processingTime}ms`);
                console.log(`Cultural constraints applied: ${Object.keys(context.culturalConstraints).length}`);
            }

            return enrichedPrompt;

        } catch (error) {
            console.error('Failed to build enriched prompt:', error);
            throw new Error(`${QlooFirstError.PROMPT_BUILDING_FAILED}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Inject cultural constraints into the base prompt
     * 
     * @param basePrompt - The base prompt template
     * @param context - The enriched prompt context
     * @returns string - The prompt with cultural constraints injected
     */
    private injectCulturalConstraints(basePrompt: string, context: EnrichedPromptContext): string {
        const { culturalConstraints, userSignals } = context;
        
        // Format cultural constraints for Gemini consumption
        const formattedConstraints = this.formatConstraintsForGemini(culturalConstraints, userSignals.culturalContext.language);
        
        // Build the cultural constraints section
        const constraintsSection = this.buildConstraintsSection(formattedConstraints, userSignals);
        
        // Replace the {{culturalConstraints}} placeholder in the template
        return basePrompt.replace('{{culturalConstraints}}', constraintsSection);
    }

    /**
     * Format cultural constraints for Gemini AI consumption
     * 
     * @param constraints - The cultural constraints from Qloo
     * @param language - The target language (fr/en)
     * @returns Record<string, string[]> - Formatted constraints ready for prompt injection
     */
    formatConstraintsForGemini(
        constraints: CulturalConstraints, 
        language: 'fr' | 'en'
    ): Record<string, string[]> {
        const formatted: Record<string, string[]> = {};

        // Priority order for categories (most important first)
        const categoryPriority = [
            'brands', 'music', 'restaurants', 'socialMedia', 
            'fashion', 'movies', 'tv', 'food', 'travel', 'books', 'beauty'
        ];

        // Process categories in priority order
        categoryPriority.forEach(category => {
            const items = constraints[category as keyof CulturalConstraints];
            if (items && items.length > 0) {
                // Clean and validate items
                const cleanedItems = this.cleanConstraintItems(items, language);
                if (cleanedItems.length > 0) {
                    // Limit items per category based on importance
                    const maxItems = this.getMaxItemsForCategory(category);
                    const limitedItems = cleanedItems.slice(0, maxItems);
                    
                    const translatedCategory = this.translateCategoryName(category, language);
                    formatted[translatedCategory] = limitedItems;
                }
            }
        });

        return formatted;
    }

    /**
     * Clean and validate constraint items for AI consumption
     */
    private cleanConstraintItems(items: string[], language: 'fr' | 'en'): string[] {
        return items
            .filter(item => item && item.trim().length > 0)
            .map(item => item.trim())
            .filter(item => item.length <= 50) // Avoid overly long items
            .filter((item, index, array) => array.indexOf(item) === index) // Remove duplicates
            .sort((a, b) => {
                // Sort by relevance/popularity (shorter names often more popular)
                if (a.length !== b.length) {
                    return a.length - b.length;
                }
                return a.localeCompare(b, language === 'fr' ? 'fr-FR' : 'en-US');
            });
    }

    /**
     * Get maximum number of items per category based on importance
     */
    private getMaxItemsForCategory(category: string): number {
        const limits: Record<string, number> = {
            brands: 10,      // Most important for persona authenticity
            music: 8,        // High impact on personality
            restaurants: 6,  // Good for lifestyle indication
            socialMedia: 5,  // Important for communication preferences
            fashion: 6,      // Lifestyle indicator
            movies: 5,       // Entertainment preferences
            tv: 5,           // Entertainment preferences
            food: 6,         // Lifestyle and cultural indicator
            travel: 4,       // Aspirational preferences
            books: 4,        // Intellectual interests
            beauty: 4        // Lifestyle preferences
        };

        return limits[category] || 5;
    }

    /**
     * Get the base prompt template based on context
     */
    private async getBasePrompt(context: EnrichedPromptContext): Promise<string> {
        const { originalBrief, userSignals, templateVariables } = context;
        
        // Determine the best template type based on context
        const templatePath = this.selectTemplateType(context);
        
        // Load the template content
        const templateContent = await this.loadTemplate(templatePath);
        
        // Merge template variables with user signals
        const variables = {
            ...DEFAULT_PROMPT_VARIABLES,
            ...templateVariables,
            personaCount: userSignals.culturalContext.personaCount,
            minAge: userSignals.demographics.ageRange.min,
            maxAge: userSignals.demographics.ageRange.max,
            location: userSignals.demographics.location,
            language: userSignals.culturalContext.language,
            brief: originalBrief
        };

        // Generate location context variables
        const locationContextVariables = this.generateLocationContext(userSignals.demographics.location);
        const allVariables = { ...variables, ...locationContextVariables };

        // Replace template variables
        return this.replaceTemplateVariables(templateContent, allVariables);
    }

    /**
     * Select the most appropriate template type based on context
     * Always uses qloo-first templates when using Qloo First enrichment
     */
    private selectTemplateType(context: EnrichedPromptContext): string {
        const { originalBrief, userSignals } = context;
        
        // Determine template type based on brief content and context
        const isB2BContext = this.isB2BContext(originalBrief, userSignals);
        const isSimpleContext = this.isSimpleContext(originalBrief, userSignals);
        
        // Always use qloo-first templates when using Qloo First enrichment
        if (isB2BContext) {
            return 'public/templates/qloo-first-b2b-persona.template';
        }
        
        if (isSimpleContext) {
            return 'public/templates/qloo-first-simple-persona.template';
        }
        
        return 'public/templates/qloo-first-persona.template';
    }

    /**
     * Determine if this is a B2B context
     */
    private isB2BContext(brief: string, userSignals: QlooSignals): boolean {
        const briefLower = brief.toLowerCase();
        
        // Check brief content for B2B keywords
        const b2bKeywords = [
            'b2b', 'professionnel', 'entreprise', 'business', 'corporate',
            'saas', 'solution', 'équipe', 'organisation', 'société',
            'client professionnel', 'décision d\'achat', 'processus métier'
        ];
        
        const hasB2BKeywords = b2bKeywords.some(keyword => briefLower.includes(keyword));
        
        // Check user signals for professional context
        const hasProfessionalSignals = userSignals.interests?.some(interest => 
            interest.toLowerCase().includes('professionnel') ||
            interest.toLowerCase().includes('business') ||
            interest.toLowerCase().includes('entreprise')
        );
        
        return hasB2BKeywords || hasProfessionalSignals || false;
    }

    /**
     * Determine if this is a simple context
     */
    private isSimpleContext(brief: string, userSignals: QlooSignals): boolean {
        // Simple context indicators
        const isShortBrief = brief.length < 100;
        const hasSimpleLanguage = brief.toLowerCase().includes('simple') || 
                                 brief.toLowerCase().includes('basique') ||
                                 brief.toLowerCase().includes('rapide');
        
        // Check if user signals indicate simple requirements
        const hasLimitedSignals = (userSignals.interests?.length || 0) < 3 &&
                                 (userSignals.values?.length || 0) < 3;
        
        return isShortBrief || hasSimpleLanguage || hasLimitedSignals;
    }

    /**
     * Load template content from file
     */
    private async loadTemplate(templatePath: string): Promise<string> {
        try {
            const fs = await import('fs/promises');
            return await fs.readFile(templatePath, 'utf-8');
        } catch (error) {
            console.error(`Failed to load template ${templatePath}:`, error);
            // Fallback to default template
            const fs = await import('fs/promises');
            return await fs.readFile('public/templates/qloo-first-persona.template', 'utf-8');
        }
    }

    /**
     * Replace template variables with actual values
     */
    private replaceTemplateVariables(template: string, variables: Record<string, any>): string {
        let result = template;
        
        // Replace all template variables
        Object.entries(variables).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
                result = result.replace(regex, value.toString());
            }
        });

        // Handle special variables that need dynamic generation
        result = this.handleDynamicVariables(result, variables);
        
        return result;
    }

    /**
     * Handle dynamic variables that need special processing
     */
    private handleDynamicVariables(template: string, variables: Record<string, any>): string {
        let result = template;
        
        // Replace {{index}} with incremental numbers for each persona
        const personaCount = variables.personaCount || 2;
        for (let i = 1; i <= personaCount; i++) {
            result = result.replace('{{index}}', i.toString());
        }
        
        // Replace age placeholders with realistic ages within range
        const minAge = variables.minAge || 25;
        const maxAge = variables.maxAge || 45;
        result = result.replace(/\{\{age_number\}\}/g, () => {
            return Math.floor(Math.random() * (maxAge - minAge + 1) + minAge).toString();
        });
        
        // Replace quality score placeholders with random scores in range
        result = result.replace(/\{\{quality_score_75_to_95\}\}/g, () => {
            return Math.floor(Math.random() * 21 + 75).toString(); // 75-95
        });
        
        result = result.replace(/\{\{quality_score_80_to_95\}\}/g, () => {
            return Math.floor(Math.random() * 16 + 80).toString(); // 80-95
        });
        
        result = result.replace(/\{\{quality_score_75_to_90\}\}/g, () => {
            return Math.floor(Math.random() * 16 + 75).toString(); // 75-90
        });
        
        return result;
    }



    /**
     * Build the cultural constraints section for the prompt
     */
    private buildConstraintsSection(
        formattedConstraints: Record<string, string[]>, 
        userSignals: QlooSignals
    ): string {
        const { language } = userSignals.culturalContext;
        const { location, ageRange } = userSignals.demographics;

        const sectionTitle = language === 'fr' 
            ? 'CONTRAINTES CULTURELLES SPÉCIFIQUES:'
            : 'SPECIFIC CULTURAL CONSTRAINTS:';

        const locationText = language === 'fr'
            ? `Localisation: ${location}`
            : `Location: ${location}`;

        const ageText = language === 'fr'
            ? `Tranche d'âge: ${ageRange.min}-${ageRange.max} ans`
            : `Age range: ${ageRange.min}-${ageRange.max} years`;

        let section = `\n${sectionTitle}\n`;
        section += `- ${locationText}\n`;
        section += `- ${ageText}\n`;

        // Add cultural preferences
        if (Object.keys(formattedConstraints).length > 0) {
            const preferencesTitle = language === 'fr' 
                ? 'Préférences culturelles basées sur des données réelles:'
                : 'Cultural preferences based on real data:';
            
            section += `- ${preferencesTitle}\n`;
            
            Object.entries(formattedConstraints).forEach(([category, items]) => {
                if (items.length > 0) {
                    section += `  * ${category}: ${items.join(', ')}\n`;
                }
            });
        }

        // Add interests and values if available
        if (userSignals.interests.length > 0) {
            const interestsTitle = language === 'fr' ? 'Intérêts' : 'Interests';
            section += `- ${interestsTitle}: ${userSignals.interests.join(', ')}\n`;
        }

        if (userSignals.values.length > 0) {
            const valuesTitle = language === 'fr' ? 'Valeurs' : 'Values';
            section += `- ${valuesTitle}: ${userSignals.values.join(', ')}\n`;
        }

        const instructionText = language === 'fr'
            ? 'IMPORTANT: Les personas générés DOIVENT refléter ces contraintes culturelles spécifiques.'
            : 'IMPORTANT: Generated personas MUST reflect these specific cultural constraints.';

        section += `\n${instructionText}\n`;

        return section;
    }

    /**
     * Translate category names based on language with context-aware formatting
     */
    private translateCategoryName(category: string, language: 'fr' | 'en'): string {
        if (language === 'en') {
            // Format English category names for better readability
            const englishFormatted: Record<string, string> = {
                music: 'Music Artists/Genres',
                brands: 'Preferred Brands',
                restaurants: 'Restaurant Types',
                movies: 'Movies/Cinema',
                tv: 'TV Shows/Series',
                books: 'Books/Literature',
                travel: 'Travel Destinations',
                fashion: 'Fashion Brands/Style',
                beauty: 'Beauty/Cosmetics',
                food: 'Food Preferences',
                socialMedia: 'Social Media Platforms'
            };
            return englishFormatted[category] || this.capitalizeFirst(category);
        }

        // French translations with context
        const frenchTranslations: Record<string, string> = {
            music: 'Artistes/Genres musicaux',
            brands: 'Marques préférées',
            restaurants: 'Types de restaurants',
            movies: 'Films/Cinéma',
            tv: 'Séries/Émissions TV',
            books: 'Livres/Littérature',
            travel: 'Destinations voyage',
            fashion: 'Marques/Style mode',
            beauty: 'Beauté/Cosmétiques',
            food: 'Préférences alimentaires',
            socialMedia: 'Plateformes sociales'
        };

        return frenchTranslations[category] || this.capitalizeFirst(category);
    }

    /**
     * Generate location-specific context variables for templates
     */
    private generateLocationContext(location: string): Record<string, string> {
        const locationLower = location.toLowerCase();
        
        // Determine location-specific contexts
        let nameContext = "Nom français typique";
        let phoneContext = "+33 X XX XX XX XX";
        let emailContext = "prenom.nom@email.com";
        let occupationContext = "Métier spécifique et réaliste";
        let incomeContext = "Tranche de revenus réaliste (ex: 45000-55000€)";
        let locationSpecific = location;

        // France
        if (locationLower.includes('france') || locationLower.includes('paris') || 
            locationLower.includes('lyon') || locationLower.includes('marseille') ||
            locationLower.includes('toulouse') || locationLower.includes('nice')) {
            nameContext = "Nom français typique (ex: Marie Dubois, Pierre Martin)";
            phoneContext = "+33 X XX XX XX XX";
            emailContext = "prenom.nom@gmail.com ou @orange.fr";
            occupationContext = "Métier français réaliste";
            incomeContext = "Tranche de revenus française (ex: 35000-45000€)";
        }
        
        // Canada
        else if (locationLower.includes('canada') || locationLower.includes('québec') || 
                 locationLower.includes('montreal') || locationLower.includes('toronto') ||
                 locationLower.includes('vancouver')) {
            nameContext = "Nom canadien/québécois (ex: Marie Tremblay, Jean Bouchard)";
            phoneContext = "+1 XXX XXX-XXXX";
            emailContext = "prenom.nom@gmail.com ou @hotmail.ca";
            occupationContext = "Métier canadien réaliste";
            incomeContext = "Tranche de revenus canadienne (ex: 50000-65000 CAD)";
        }
        
        // Belgium
        else if (locationLower.includes('belgique') || locationLower.includes('belgium') ||
                 locationLower.includes('bruxelles') || locationLower.includes('brussels')) {
            nameContext = "Nom belge typique (ex: Marie Janssens, Pierre Dupont)";
            phoneContext = "+32 XXX XX XX XX";
            emailContext = "prenom.nom@gmail.com ou @skynet.be";
            occupationContext = "Métier belge réaliste";
            incomeContext = "Tranche de revenus belge (ex: 40000-50000€)";
        }
        
        // Switzerland
        else if (locationLower.includes('suisse') || locationLower.includes('switzerland') ||
                 locationLower.includes('genève') || locationLower.includes('zurich')) {
            nameContext = "Nom suisse typique (ex: Marie Müller, Pierre Dubois)";
            phoneContext = "+41 XX XXX XX XX";
            emailContext = "prenom.nom@gmail.com ou @bluewin.ch";
            occupationContext = "Métier suisse réaliste";
            incomeContext = "Tranche de revenus suisse (ex: 70000-85000 CHF)";
        }
        
        // USA
        else if (locationLower.includes('usa') || locationLower.includes('états-unis') ||
                 locationLower.includes('united states') || locationLower.includes('america')) {
            nameContext = "American name (e.g., Sarah Johnson, Michael Smith)";
            phoneContext = "+1 XXX-XXX-XXXX";
            emailContext = "firstname.lastname@gmail.com";
            occupationContext = "Realistic American occupation";
            incomeContext = "American income range (e.g., $45,000-$65,000)";
        }
        
        // UK
        else if (locationLower.includes('royaume-uni') || locationLower.includes('uk') ||
                 locationLower.includes('england') || locationLower.includes('london')) {
            nameContext = "British name (e.g., Sarah Williams, James Brown)";
            phoneContext = "+44 XXXX XXX XXX";
            emailContext = "firstname.lastname@gmail.com";
            occupationContext = "Realistic British occupation";
            incomeContext = "British income range (e.g., £35,000-£45,000)";
        }

        return {
            nameContext,
            phoneContext,
            emailContext,
            occupationContext,
            incomeContext,
            locationSpecific
        };
    }

    /**
     * Capitalize first letter of a string
     */
    private capitalizeFirst(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Validate the final prompt for length and quality
     */
    private validatePrompt(prompt: string): void {
        if (!prompt || prompt.trim().length === 0) {
            throw new Error('Generated prompt is empty');
        }

        if (prompt.length > this.config.maxPromptLength) {
            throw new Error(`Prompt too long: ${prompt.length} characters (max: ${this.config.maxPromptLength})`);
        }

        // Check for essential components
        const requiredElements = ['JSON', 'persona'];
        for (const element of requiredElements) {
            if (!prompt.toLowerCase().includes(element.toLowerCase())) {
                throw new Error(`Prompt missing required element: ${element}`);
            }
        }
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<PromptBuildingConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * Get current configuration
     */
    getConfig(): PromptBuildingConfig {
        return { ...this.config };
    }
}