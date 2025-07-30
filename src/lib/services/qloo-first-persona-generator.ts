/**
 * QlooFirstPersonaGenerator Service
 * 
 * Main orchestration service for the Qloo-first persona generation flow.
 * This service coordinates the entire new flow: extract signals from BriefFormData,
 * fetch cultural data from Qloo, build enriched prompts, and generate personas with Gemini.
 */

import { BriefFormData } from '@/components/forms/BriefForm';
import {
    GenerationResult,
    QlooSignals,
    CulturalConstraints,
    EnrichedPromptContext,
    QlooFirstError,
    PerformanceMetrics
} from '@/types/qloo-first';
import { Persona } from '@/types';
import { QlooSignalExtractor } from '@/services/qloo-signal-extractor';
import { EnrichedPromptBuilder } from '@/lib/services/enriched-prompt-builder';
import { QlooPerformanceMonitor } from '@/lib/services/qloo-performance-monitor';
import { getGeminiClient } from '@/lib/api/gemini';
import { getQlooClient } from '@/lib/api/qloo';
import { ValidationTemplateEngine } from '@/lib/validation/validation-template-engine';
import { ValidationErrorHandler } from '@/lib/validation/error-handler';
import { RetryManager } from '@/lib/validation/retry-manager';
import {
    ValidationContext,
    ValidationResult,
    PersonaType,
    PersonaGenerationRequest,
    ValidationError,
    ValidationErrorType,
    ValidationSeverity,
    RetryStrategy
} from '@/types/validation';


/**
 * Configuration for the QlooFirstPersonaGenerator
 */
interface QlooFirstGeneratorConfig {
    enableFallback: boolean;
    debugMode: boolean;
    maxRetries: number;
    timeoutMs: number;
    enableValidation: boolean;
    validationRetryStrategy?: Partial<RetryStrategy>;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: QlooFirstGeneratorConfig = {
    enableFallback: true,
    debugMode: false,
    maxRetries: 2,
    timeoutMs: 30000, // 30 seconds
    enableValidation: true,
    validationRetryStrategy: {
        maxRetries: 3,
        enhancePromptOnRetry: true,
        fallbackAfterMaxRetries: true
    }
};

/**
 * Main orchestration service for Qloo-first persona generation
 */
export class QlooFirstPersonaGenerator {
    private signalExtractor: QlooSignalExtractor;
    private promptBuilder: EnrichedPromptBuilder;
    private config: QlooFirstGeneratorConfig;
    private performanceMetrics: PerformanceMetrics;
    private performanceMonitor: QlooPerformanceMonitor;
    private validationEngine: ValidationTemplateEngine;
    private errorHandler: ValidationErrorHandler;
    private retryManager: RetryManager;

    constructor(config: Partial<QlooFirstGeneratorConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.performanceMetrics = this.initializeMetrics();
        this.performanceMonitor = new QlooPerformanceMonitor({
            enableDetailedLogging: this.config.debugMode,
            logLevel: this.config.debugMode ? 'debug' : 'info'
        });
        this.signalExtractor = new QlooSignalExtractor(this.performanceMonitor);
        this.promptBuilder = new EnrichedPromptBuilder();

        // Initialize validation components
        this.validationEngine = new ValidationTemplateEngine();
        this.errorHandler = new ValidationErrorHandler(this.config.validationRetryStrategy);
        this.retryManager = new RetryManager();
    }

    /**
     * Main method to generate personas using the Qloo-first flow
     * Requirements: 2.1, 2.2, 2.5
     * 
     * @param briefFormData - The form data from the user
     * @returns Promise<GenerationResult> - The generated personas with metadata
     */
    async generatePersonas(briefFormData: BriefFormData): Promise<GenerationResult> {
        this.performanceMetrics = this.initializeMetrics();

        // Start performance monitoring
        this.performanceMonitor.startMonitoring();

        try {
            if (this.config.debugMode) {
                console.log('🚀 Starting Qloo-first persona generation flow');
                console.log('� SBrief form data:', {
                    brief: briefFormData.brief.substring(0, 100) + '...',
                    location: briefFormData.location,
                    ageRange: briefFormData.ageRange,
                    personaCount: briefFormData.personaCount,
                    interests: briefFormData.interests,
                    values: briefFormData.values
                });
            }

            // Step 1: Extract signals and fetch cultural data
            const culturalConstraints = await this.extractAndFetchCulturalData(briefFormData);

            // Step 2: Generate personas with cultural constraints and validation
            const personas = await this.generateWithConstraintsAndValidation(
                briefFormData,
                culturalConstraints,
                this.signalExtractor.extractSignals(briefFormData)
            );

            // Complete performance monitoring and get detailed metrics
            const detailedMetrics = this.performanceMonitor.completeMonitoring();

            // Update basic performance metrics for backward compatibility
            this.performanceMetrics.totalProcessingTime = detailedMetrics.totalProcessingTime;
            this.performanceMetrics.qlooExtractionTime = detailedMetrics.qlooExtractionTime;
            this.performanceMetrics.promptBuildingTime = detailedMetrics.promptBuildingTime;
            this.performanceMetrics.geminiGenerationTime = detailedMetrics.geminiGenerationTime;
            this.performanceMetrics.qlooApiCallsCount = detailedMetrics.qlooApiCallsCount;
            this.performanceMetrics.cacheHitRate = detailedMetrics.cacheHitRate;

            const result: GenerationResult = {
                personas,
                metadata: {
                    source: 'qloo-first',
                    qlooDataUsed: true,
                    culturalConstraintsApplied: this.getCulturalConstraintsSummary(culturalConstraints),
                    processingTime: this.performanceMetrics.totalProcessingTime,
                    qlooApiCallsCount: this.performanceMetrics.qlooApiCallsCount,
                    cacheHitRate: this.performanceMetrics.cacheHitRate
                }
            };

            if (this.config.debugMode) {
                console.log('✅ Qloo-first generation completed successfully');
                console.log('📊 Performance metrics:', this.performanceMetrics);
                console.log('📊 Detailed metrics:', detailedMetrics);
                console.log('🚨 Performance alerts:', this.performanceMonitor.getAlerts());
                console.log('🎭 Generated personas count:', personas.length);
            }

            return result;

        } catch (error) {
            console.error('❌ Qloo-first generation failed:', error);

            // If fallback is enabled, try the legacy flow
            if (this.config.enableFallback) {
                if (this.config.debugMode) {
                    console.log('🔄 Falling back to legacy flow');
                }
                return await this.fallbackToLegacyFlow(briefFormData, error);
            }

            // Otherwise, throw the error
            throw error;
        }
    }

    /**
     * Extract signals from BriefFormData and fetch cultural data from Qloo
     * This is the core pipeline that replaces the old "Gemini first, Qloo second" approach
     * Requirements: 2.1, 2.2
     * 
     * @param briefFormData - The form data from the user
     * @returns Promise<CulturalConstraints> - The cultural constraints from Qloo
     */
    private async extractAndFetchCulturalData(briefFormData: BriefFormData): Promise<CulturalConstraints> {
        try {
            // Step 1: Extract signals from the form data
            this.performanceMonitor.startStep('signalExtraction');

            if (this.config.debugMode) {
                console.log('🔍 Extracting signals from BriefFormData');
            }

            const signals = this.signalExtractor.extractSignals(briefFormData);
            this.performanceMonitor.endStep('signalExtraction');

            if (this.config.debugMode) {
                console.log('📊 Extracted signals:', {
                    demographics: signals.demographics,
                    interestsCount: signals.interests.length,
                    valuesCount: signals.values.length,
                    culturalContext: signals.culturalContext
                });
            }

            // Step 2: Fetch cultural data from Qloo using the extracted signals
            this.performanceMonitor.startStep('culturalDataFetch');

            if (this.config.debugMode) {
                console.log('🌍 Fetching cultural data from Qloo API');
            }

            const culturalConstraints = await this.signalExtractor.fetchCulturalData(signals);
            this.performanceMonitor.endStep('culturalDataFetch');

            // Update performance metrics
            this.performanceMetrics.qlooApiCallsCount = this.estimateApiCallsCount(culturalConstraints);

            // Log cultural constraints for performance monitoring
            this.performanceMonitor.logCulturalConstraints(signals, culturalConstraints);

            if (this.config.debugMode) {
                console.log('🎨 Cultural constraints fetched:', {
                    music: culturalConstraints.music.length,
                    brands: culturalConstraints.brands.length,
                    restaurants: culturalConstraints.restaurants.length,
                    totalConstraints: Object.values(culturalConstraints).reduce((sum, arr) => sum + arr.length, 0)
                });
            }

            return culturalConstraints;

        } catch (error) {
            // End any running steps
            this.performanceMonitor.endStep('signalExtraction');
            this.performanceMonitor.endStep('culturalDataFetch');

            if (error instanceof Error) {
                if (error.message.includes(QlooFirstError.SIGNAL_EXTRACTION_FAILED)) {
                    throw error;
                }
                if (error.message.includes(QlooFirstError.QLOO_API_UNAVAILABLE)) {
                    throw error;
                }
                if (error.message.includes(QlooFirstError.CULTURAL_DATA_INSUFFICIENT)) {
                    throw error;
                }
            }

            throw new Error(`${QlooFirstError.QLOO_API_UNAVAILABLE}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Generate personas using enriched prompts with cultural constraints and validation
     * Requirements: 1.1, 1.2, 1.4, 2.3, 2.4, 2.5
     * 
     * @param briefFormData - The original form data
     * @param culturalConstraints - The cultural constraints from Qloo
     * @param signals - The extracted signals
     * @returns Promise<Partial<Persona>[]> - The generated and validated personas
     */
    private async generateWithConstraintsAndValidation(
        briefFormData: BriefFormData,
        culturalConstraints: CulturalConstraints,
        signals: QlooSignals
    ): Promise<Partial<Persona>[]> {
        if (!this.config.enableValidation) {
            // If validation is disabled, use the original method
            return this.generateWithConstraints(
                briefFormData.brief,
                culturalConstraints,
                signals
            );
        }

        // Determine persona type based on brief content and form data
        const personaType = this.determinePersonaType(briefFormData);

        // Create validation context
        const validationContext: ValidationContext = {
            originalRequest: {
                personaType,
                culturalData: culturalConstraints,
                demographics: signals.demographics,
                psychographics: { interests: signals.interests, values: signals.values },
                businessContext: signals.culturalContext
            },
            templateVariables: {
                location: signals.demographics.location,
                ageRange: signals.demographics.ageRange,
                interests: signals.interests,
                values: signals.values,
                language: signals.culturalContext.language,
                personaCount: signals.culturalContext.personaCount
            },
            culturalConstraints,
            userSignals: signals,
            generationAttempt: 1,
            previousErrors: []
        };

        let currentAttempt = 1;
        let enhancedPrompt: string | undefined;
        let currentPersonaType = personaType;

        while (currentAttempt <= this.config.maxRetries) {
            try {
                if (this.config.debugMode) {
                    console.log(`🔄 Generation attempt ${currentAttempt} with persona type: ${currentPersonaType}`);
                }

                // Generate personas with current parameters
                const personas = await this.generateWithConstraints(
                    enhancedPrompt || briefFormData.brief,
                    culturalConstraints,
                    signals
                );

                if (personas.length === 0) {
                    throw new Error('No personas generated');
                }

                // Validate the generated personas
                const validationResult = await this.validatePersonas(
                    personas,
                    currentPersonaType,
                    validationContext
                );

                if (validationResult.isValid) {
                    if (this.config.debugMode) {
                        console.log(`✅ Validation passed on attempt ${currentAttempt}`);
                        console.log(`📊 Validation score: ${validationResult.score}`);
                    }
                    return personas;
                }

                // Handle validation failure
                if (this.config.debugMode) {
                    console.log(`❌ Validation failed on attempt ${currentAttempt}`);
                    console.log(`🔍 Errors: ${validationResult.errors.length}, Warnings: ${validationResult.warnings.length}`);
                    console.log(`📊 Validation score: ${validationResult.score}`);
                }

                // Determine retry strategy
                const retryResult = this.retryManager.shouldRetry(
                    validationResult.errors,
                    validationContext,
                    this.getEffectiveRetryStrategy(),
                    currentAttempt - 1
                );

                if (!retryResult.shouldRetry) {
                    if (this.config.debugMode) {
                        console.log(`🚫 No more retries: ${retryResult.reason}`);
                    }

                    // Try fallback if enabled
                    if (this.config.enableFallback) {
                        return await this.handleValidationFallback(
                            briefFormData,
                            validationResult.errors,
                            currentPersonaType
                        );
                    }

                    throw new Error(`Validation failed after ${currentAttempt} attempts: ${retryResult.reason}`);
                }

                // Prepare for retry
                enhancedPrompt = retryResult.enhancedPrompt;
                if (retryResult.suggestedTemplate) {
                    currentPersonaType = this.extractPersonaTypeFromTemplate(retryResult.suggestedTemplate);
                }

                // Update validation context for next attempt
                validationContext.generationAttempt = currentAttempt + 1;
                validationContext.previousErrors = [...validationContext.previousErrors, ...validationResult.errors];

                // Wait before retry
                if (retryResult.retryDelay > 0) {
                    await new Promise(resolve => setTimeout(resolve, retryResult.retryDelay));
                }

                currentAttempt++;

            } catch (error) {
                if (this.config.debugMode) {
                    console.error(`❌ Generation attempt ${currentAttempt} failed:`, error);
                }

                if (currentAttempt >= this.config.maxRetries) {
                    if (this.config.enableFallback) {
                        return await this.handleValidationFallback(
                            briefFormData,
                            [],
                            currentPersonaType
                        );
                    }
                    throw error;
                }

                currentAttempt++;
            }
        }

        // If we get here, all attempts failed
        throw new Error(`Failed to generate valid personas after ${this.config.maxRetries} attempts`);
    }

    /**
     * Generate personas using enriched prompts with cultural constraints (original method)
     * Requirements: 2.3, 2.4, 2.5
     * 
     * @param brief - The original brief text
     * @param culturalConstraints - The cultural constraints from Qloo
     * @param signals - The extracted signals
     * @returns Promise<Partial<Persona>[]> - The generated personas
     */
    private async generateWithConstraints(
        brief: string,
        culturalConstraints: CulturalConstraints,
        signals: QlooSignals
    ): Promise<Partial<Persona>[]> {
        try {
            // Step 1: Build enriched prompt with cultural constraints
            this.performanceMonitor.startStep('promptEnrichment');

            if (this.config.debugMode) {
                console.log('📝 Building enriched prompt with cultural constraints');
            }

            const enrichedPromptContext: EnrichedPromptContext = {
                originalBrief: brief,
                culturalConstraints,
                userSignals: signals,
                templateVariables: {
                    location: signals.demographics.location,
                    ageRange: signals.demographics.ageRange,
                    interests: signals.interests,
                    values: signals.values,
                    language: signals.culturalContext.language,
                    personaCount: signals.culturalContext.personaCount
                }
            };

            const enrichedPrompt = await this.promptBuilder.buildPrompt(enrichedPromptContext);
            this.performanceMonitor.endStep('promptEnrichment');

            if (this.config.debugMode) {
                console.log('✨ Enriched prompt built successfully');
                console.log('📏 Prompt length:', enrichedPrompt.length);
            }

            // Step 2: Generate personas with Gemini using the enriched prompt
            this.performanceMonitor.startStep('geminiRequest');

            if (this.config.debugMode) {
                console.log('🤖 Generating personas with Gemini using enriched prompt');
            }

            const geminiClient = getGeminiClient();
            const personas = await geminiClient.generatePersonas(enrichedPrompt);
            this.performanceMonitor.endStep('geminiRequest');

            if (this.config.debugMode) {
                console.log('🎭 Personas generated successfully');
                console.log('👥 Generated personas count:', personas.length);
            }

            // Step 3: Integrate cultural data directly into personas
            this.performanceMonitor.startStep('culturalIntegration');

            // Since we used cultural constraints in the prompt, the personas should already
            // reflect the cultural data. We don't need post-processing enrichment.
            const enrichedPersonas = this.integrateCulturalDataIntoPersonas(personas, culturalConstraints);
            this.performanceMonitor.endStep('culturalIntegration');

            // Record resource usage
            this.performanceMonitor.recordResourceUsage();

            return enrichedPersonas;

        } catch (error) {
            // End any running steps
            this.performanceMonitor.endStep('promptEnrichment');
            this.performanceMonitor.endStep('geminiRequest');
            this.performanceMonitor.endStep('culturalIntegration');

            if (error instanceof Error && error.message.includes(QlooFirstError.PROMPT_BUILDING_FAILED)) {
                throw error;
            }

            throw new Error(`${QlooFirstError.GEMINI_GENERATION_FAILED}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Integrate cultural data directly into the generated personas
     * Since we used Qloo-first approach, this is mainly for metadata and validation
     */
    private integrateCulturalDataIntoPersonas(
        personas: Partial<Persona>[],
        culturalConstraints: CulturalConstraints
    ): Partial<Persona>[] {
        return personas.map(persona => ({
            ...persona,
            // The cultural data should already be integrated via the enriched prompt
            // This is mainly for ensuring consistency and adding metadata
            culturalData: {
                music: culturalConstraints.music,
                brands: culturalConstraints.brands,
                restaurants: culturalConstraints.restaurants,
                movies: culturalConstraints.movies,
                tv: culturalConstraints.tv,
                books: culturalConstraints.books,
                travel: culturalConstraints.travel,
                fashion: culturalConstraints.fashion,
                beauty: culturalConstraints.beauty,
                food: culturalConstraints.food,
                socialMedia: culturalConstraints.socialMedia
            },
            metadata: {
                qlooConstraintsUsed: this.getCulturalConstraintsSummary(culturalConstraints),
                generationMethod: 'qloo-first' as const,
                culturalDataSource: 'qloo' as const
            }
        }));
    }

    /**
     * Get a summary of applied cultural constraints for metadata
     */
    private getCulturalConstraintsSummary(constraints: CulturalConstraints): string[] {
        const summary: string[] = [];

        Object.entries(constraints).forEach(([category, items]) => {
            if (items.length > 0) {
                summary.push(`${category}: ${items.length} items`);
            }
        });

        return summary;
    }

    /**
     * Estimate the number of API calls made to Qloo based on constraints
     */
    private estimateApiCallsCount(constraints: CulturalConstraints): number {
        // Count non-empty categories as API calls
        return Object.values(constraints).filter(items => items.length > 0).length;
    }

    /**
     * Initialize performance metrics
     */
    private initializeMetrics(): PerformanceMetrics {
        return {
            qlooExtractionTime: 0,
            qlooApiCallsCount: 0,
            promptBuildingTime: 0,
            geminiGenerationTime: 0,
            totalProcessingTime: 0,
            cacheHitRate: 0
        };
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<QlooFirstGeneratorConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * Get current configuration
     */
    getConfig(): QlooFirstGeneratorConfig {
        return { ...this.config };
    }

    /**
     * Get performance metrics from the last generation
     */
    getPerformanceMetrics(): PerformanceMetrics {
        return { ...this.performanceMetrics };
    }

    /**
     * Fallback to the legacy persona generation flow when Qloo-first fails
     * Requirements: 5.3, 5.5
     * 
     * @param briefFormData - The original form data
     * @param originalError - The error that caused the fallback
     * @returns Promise<GenerationResult> - Result from legacy flow with fallback metadata
     */
    private async fallbackToLegacyFlow(
        briefFormData: BriefFormData,
        originalError?: any
    ): Promise<GenerationResult> {
        const fallbackStartTime = Date.now();

        try {
            if (this.config.debugMode) {
                console.log('🔄 Executing fallback to legacy flow');
                console.log('❌ Original error:', originalError?.message || 'Unknown error');
            }

            // Use the existing legacy flow: Gemini first, then Qloo enrichment
            const legacyPersonas = await this.executeLegacyFlow(briefFormData);

            const fallbackProcessingTime = Date.now() - fallbackStartTime;
            const totalProcessingTime = this.performanceMetrics.totalProcessingTime + fallbackProcessingTime;

            const result: GenerationResult = {
                personas: legacyPersonas,
                metadata: {
                    source: 'fallback-legacy',
                    qlooDataUsed: true, // Legacy flow uses Qloo for enrichment
                    culturalConstraintsApplied: ['legacy-enrichment'],
                    processingTime: totalProcessingTime,
                    qlooApiCallsCount: this.performanceMetrics.qlooApiCallsCount,
                    cacheHitRate: this.performanceMetrics.cacheHitRate,
                    errorEncountered: this.categorizeError(originalError)
                }
            };

            if (this.config.debugMode) {
                console.log('✅ Legacy fallback completed successfully');
                console.log('👥 Fallback personas count:', legacyPersonas.length);
                console.log('⏱️ Fallback processing time:', fallbackProcessingTime);
            }

            return result;

        } catch (fallbackError) {
            console.error('❌ Legacy fallback also failed:', fallbackError);

            // If even the fallback fails, return a minimal result with error information
            return {
                personas: [],
                metadata: {
                    source: 'fallback-legacy',
                    qlooDataUsed: false,
                    culturalConstraintsApplied: [],
                    processingTime: Date.now() - fallbackStartTime,
                    errorEncountered: this.categorizeError(fallbackError)
                }
            };
        }
    }

    /**
     * Execute the legacy persona generation flow (Gemini first, Qloo enrichment second)
     * This replicates the existing logic from /api/generate-personas route
     * 
     * @param briefFormData - The form data
     * @returns Promise<Partial<Persona>[]> - Generated and enriched personas
     */
    private async executeLegacyFlow(briefFormData: BriefFormData): Promise<Partial<Persona>[]> {
        try {
            // Step 1: Generate personas with Gemini using the original brief
            if (this.config.debugMode) {
                console.log('🤖 Generating personas with Gemini (legacy flow)');
            }

            const geminiClient = getGeminiClient();

            // Build user context similar to the existing API route
            const userContext = this.buildUserContextForLegacyFlow(briefFormData);

            const personas = await geminiClient.generatePersonas(briefFormData.brief, userContext, { useLegacyValidation: true });

            if (this.config.debugMode) {
                console.log('✅ Gemini generation completed (legacy)');
                console.log('👥 Generated personas count:', personas.length);
            }

            // Step 2: Enrich with Qloo data (post-hoc enrichment)
            if (this.config.debugMode) {
                console.log('🌍 Enriching personas with Qloo data (legacy)');
            }

            let enrichedPersonas = personas;
            let qlooSuccess = false;

            try {
                const qlooClient = getQlooClient();
                enrichedPersonas = await qlooClient.enrichPersonas(personas);
                qlooSuccess = true;

                if (this.config.debugMode) {
                    console.log('✅ Qloo enrichment completed (legacy)');
                }
            } catch (qlooError) {
                console.warn('⚠️ Qloo enrichment failed in legacy flow, using Gemini personas only:', qlooError);
                // Keep the original Gemini personas
            }

            // Add metadata to indicate this came from legacy flow
            const personasWithMetadata = enrichedPersonas.map(persona => ({
                ...persona,
                metadata: {
                    qlooConstraintsUsed: qlooSuccess ? ['post-hoc-enrichment'] : [],
                    generationMethod: 'legacy-fallback' as const,
                    culturalDataSource: qlooSuccess ? 'qloo' : 'fallback' as const
                }
            }));

            return personasWithMetadata;

        } catch (error) {
            console.error('Legacy flow execution failed:', error);
            throw error;
        }
    }

    /**
     * Build user context for legacy flow similar to the existing API route
     */
    private buildUserContextForLegacyFlow(briefFormData: BriefFormData): string {
        const contexts: string[] = [];

        // Add location context
        if (briefFormData.location) {
            contexts.push(`pour la région ${briefFormData.location}`);
        }

        // Add age range context
        if (briefFormData.ageRange) {
            contexts.push(`pour la tranche d'âge ${briefFormData.ageRange.min}-${briefFormData.ageRange.max} ans`);
        }

        // Add interests context
        if (briefFormData.interests.length > 0) {
            contexts.push(`avec des intérêts pour ${briefFormData.interests.join(', ')}`);
        }

        // Add values context
        if (briefFormData.values.length > 0) {
            contexts.push(`valorisant ${briefFormData.values.join(', ')}`);
        }

        // Add persona count context
        if (briefFormData.personaCount > 1) {
            contexts.push(`générer ${briefFormData.personaCount} personas distincts`);
        }

        return contexts.join(', ');
    }

    /**
     * Validate generated personas using the validation engine
     * Requirements: 1.1, 1.2, 1.4
     */
    private async validatePersonas(
        personas: Partial<Persona>[],
        personaType: PersonaType,
        validationContext: ValidationContext
    ): Promise<ValidationResult> {
        try {
            if (this.config.debugMode) {
                console.log(`🔍 Validating ${personas.length} personas with type: ${personaType}`);
            }

            const validationResult = await this.validationEngine.validateResponse(
                personas,
                personaType,
                validationContext
            );

            if (this.config.debugMode) {
                console.log(`📊 Validation result: ${validationResult.isValid ? 'VALID' : 'INVALID'}`);
                console.log(`📊 Score: ${validationResult.score}, Errors: ${validationResult.errors.length}, Warnings: ${validationResult.warnings.length}`);
            }

            return validationResult;

        } catch (error) {
            console.error('❌ Validation failed:', error);

            // Return a failed validation result
            return {
                isValid: false,
                score: 0,
                errors: [{
                    id: `validation-engine-error-${Date.now()}`,
                    type: ValidationErrorType.VALIDATION_TIMEOUT,
                    message: `Validation engine failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    field: 'system',
                    severity: ValidationSeverity.ERROR
                }],
                warnings: [],
                metadata: {
                    templateId: personaType,
                    templateVersion: '1.0.0',
                    validationTime: 0,
                    rulesExecuted: 0,
                    rulesSkipped: 0,
                    timestamp: Date.now()
                }
            };
        }
    }

    /**
     * Determine the persona type based on brief content and form data
     * Requirements: 1.1, 3.1
     */
    private determinePersonaType(briefFormData: BriefFormData): PersonaType {
        const brief = briefFormData.brief.toLowerCase();

        // Check for B2B indicators
        const b2bKeywords = [
            'business', 'company', 'enterprise', 'corporate', 'b2b', 'professional',
            'industry', 'organization', 'workplace', 'employee', 'manager', 'executive',
            'department', 'team', 'client', 'vendor', 'supplier', 'partner'
        ];

        const hasB2BKeywords = b2bKeywords.some(keyword => brief.includes(keyword));

        // Check for simple persona indicators (fewer requirements)
        const isSimpleRequest = briefFormData.personaCount <= 2 ||
            brief.length < 100 ||
            (!briefFormData.interests || briefFormData.interests.length === 0) ||
            (!briefFormData.values || briefFormData.values.length === 0);

        if (hasB2BKeywords) {
            return PersonaType.B2B;
        } else if (isSimpleRequest) {
            return PersonaType.SIMPLE;
        } else {
            return PersonaType.STANDARD;
        }
    }

    /**
     * Handle validation fallback when validation fails
     * Requirements: 3.4, 5.4
     */
    private async handleValidationFallback(
        briefFormData: BriefFormData,
        validationErrors: ValidationError[],
        currentPersonaType: PersonaType
    ): Promise<Partial<Persona>[]> {
        try {
            if (this.config.debugMode) {
                console.log(`🔄 Handling validation fallback from ${currentPersonaType}`);
                console.log(`❌ Validation errors: ${validationErrors.length}`);
            }

            // Try with a simpler persona type
            let fallbackPersonaType: PersonaType;

            if (currentPersonaType === PersonaType.B2B) {
                fallbackPersonaType = PersonaType.STANDARD;
            } else if (currentPersonaType === PersonaType.STANDARD) {
                fallbackPersonaType = PersonaType.SIMPLE;
            } else {
                // Already at simplest type, use legacy flow
                if (this.config.debugMode) {
                    console.log('🔄 Falling back to legacy flow (already at simplest validation)');
                }
                return await this.executeLegacyFlow(briefFormData);
            }

            // Create new validation context for fallback
            const signals = this.signalExtractor.extractSignals(briefFormData);
            const culturalConstraints = await this.signalExtractor.fetchCulturalData(signals);

            const fallbackContext: ValidationContext = {
                originalRequest: {
                    personaType: fallbackPersonaType,
                    culturalData: culturalConstraints,
                    demographics: signals.demographics,
                    psychographics: { interests: signals.interests, values: signals.values },
                    businessContext: signals.culturalContext
                },
                templateVariables: {
                    location: signals.demographics.location,
                    ageRange: signals.demographics.ageRange,
                    interests: signals.interests,
                    values: signals.values,
                    language: signals.culturalContext.language,
                    personaCount: signals.culturalContext.personaCount
                },
                culturalConstraints,
                userSignals: signals,
                generationAttempt: 1,
                previousErrors: validationErrors
            };

            // Generate with simpler validation
            const personas = await this.generateWithConstraints(
                briefFormData.brief,
                culturalConstraints,
                signals
            );

            // Validate with simpler template
            const validationResult = await this.validatePersonas(
                personas,
                fallbackPersonaType,
                fallbackContext
            );

            if (validationResult.isValid) {
                if (this.config.debugMode) {
                    console.log(`✅ Validation fallback successful with ${fallbackPersonaType}`);
                }
                return personas;
            }

            // If still failing, use legacy flow
            if (this.config.debugMode) {
                console.log('🔄 Validation fallback failed, using legacy flow');
            }
            return await this.executeLegacyFlow(briefFormData);

        } catch (error) {
            console.error('❌ Validation fallback failed:', error);

            // Final fallback to legacy flow
            return await this.executeLegacyFlow(briefFormData);
        }
    }

    /**
     * Extract persona type from template name
     * Requirements: 3.1
     */
    private extractPersonaTypeFromTemplate(templateName: string): PersonaType {
        const lowerTemplate = templateName.toLowerCase();

        if (lowerTemplate.includes('b2b')) {
            return PersonaType.B2B;
        } else if (lowerTemplate.includes('simple')) {
            return PersonaType.SIMPLE;
        } else {
            return PersonaType.STANDARD;
        }
    }

    /**
     * Get effective retry strategy combining config and defaults
     * Requirements: 5.2, 5.3
     */
    private getEffectiveRetryStrategy(): RetryStrategy {
        const defaultStrategy: RetryStrategy = {
            maxRetries: 3,
            retryDelay: 1000,
            backoffMultiplier: 2,
            enhancePromptOnRetry: true,
            fallbackAfterMaxRetries: true,
            retryableErrors: [ValidationErrorType.STRUCTURE_INVALID, ValidationErrorType.FORMAT_INVALID, ValidationErrorType.REQUIRED_FIELD_MISSING]
        };

        return {
            ...defaultStrategy,
            ...this.config.validationRetryStrategy
        };
    }

    /**
     * Categorize error for metadata and fallback decisions
     */
    private categorizeError(error: any): QlooFirstError | undefined {
        if (!error) return undefined;

        const errorMessage = error.message || error.toString();

        if (errorMessage.includes(QlooFirstError.QLOO_API_UNAVAILABLE)) {
            return QlooFirstError.QLOO_API_UNAVAILABLE;
        }
        if (errorMessage.includes(QlooFirstError.SIGNAL_EXTRACTION_FAILED)) {
            return QlooFirstError.SIGNAL_EXTRACTION_FAILED;
        }
        if (errorMessage.includes(QlooFirstError.CULTURAL_DATA_INSUFFICIENT)) {
            return QlooFirstError.CULTURAL_DATA_INSUFFICIENT;
        }
        if (errorMessage.includes(QlooFirstError.PROMPT_BUILDING_FAILED)) {
            return QlooFirstError.PROMPT_BUILDING_FAILED;
        }
        if (errorMessage.includes(QlooFirstError.GEMINI_GENERATION_FAILED)) {
            return QlooFirstError.GEMINI_GENERATION_FAILED;
        }

        return undefined;
    }

    /**
     * Check if automatic fallback should be triggered based on error type
     * Requirements: 5.3
     */
    private shouldTriggerFallback(error: any): boolean {
        if (!this.config.enableFallback) {
            return false;
        }

        const errorType = this.categorizeError(error);

        // Define which errors should trigger fallback
        const fallbackTriggers = [
            QlooFirstError.QLOO_API_UNAVAILABLE,
            QlooFirstError.CULTURAL_DATA_INSUFFICIENT,
            QlooFirstError.SIGNAL_EXTRACTION_FAILED
        ];

        return fallbackTriggers.includes(errorType as QlooFirstError);
    }
}