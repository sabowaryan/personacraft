import { GoogleGenerativeAI } from '@google/generative-ai';
import { Persona } from '@/types';
import { PersonaValidator, PersonaValidationError } from '@/lib/validators/persona-validator';
import { PromptManager, PROMPTS, PromptType, DEFAULT_PROMPT_VARIABLES } from '@/lib/prompts/gemini-prompts';
import { getFallbackPersonas } from './fallback';
import crypto from 'crypto';

interface GeminiCacheEntry {
    data: Partial<Persona>[];
    timestamp: number;
    ttl: number;
}

export class GeminiClient {
    private genAI: GoogleGenerativeAI;
    private model: any;
    private defaultPromptType: PromptType;
    private cache = new Map<string, GeminiCacheEntry>();
    private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes
    private readonly MAX_RETRIES = 5;
    private readonly BASE_DELAY = 2000; // 2 seconds
    private readonly MAX_DELAY = 30000; // 30 seconds max delay

    // Circuit breaker properties
    private failureCount = 0;
    private lastFailureTime = 0;
    private readonly FAILURE_THRESHOLD = 3;
    private readonly CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minute

    constructor(promptType: PromptType = 'DEFAULT') {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is required');
        }

        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });
        this.defaultPromptType = promptType;

        // Cleanup expired cache entries every 10 minutes
        setInterval(() => this.cleanupCache(), 10 * 60 * 1000);
    }

    async generatePersonas(
        brief: string,
        userContext?: string,
        options: {
            promptType?: PromptType;
            variables?: Partial<typeof DEFAULT_PROMPT_VARIABLES>;
            useLegacyValidation?: boolean;
            useQlooFirstValidation?: boolean;
        } = {}
    ): Promise<Partial<Persona>[]> {
        const prompt = await this.buildPrompt(brief, userContext, options);
        const cacheKey = this.generateCacheKey(prompt);

        // Check cache first
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            console.log('🎯 Gemini cache hit');
            return cached;
        }

        // Check circuit breaker
        if (this.isCircuitBreakerOpen()) {
            console.warn('🔴 Circuit breaker ouvert - utilisation du fallback immédiat');
            console.log('📊 Circuit breaker status:', this.getCircuitBreakerStatus());
            return getFallbackPersonas(brief);
        }

        // Generate with retry and exponential backoff
        const result = await this.generateWithRetry(prompt, brief, options.useLegacyValidation, options.useQlooFirstValidation);

        // Cache successful result only if it's not fallback
        if (!this.isFallbackResult(result, brief)) {
            this.setCache(cacheKey, result);
            this.resetCircuitBreaker(); // Reset on success
        }

        return result;
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

    private parsePersonasResponse(text: string, brief: string, useLegacyValidation?: boolean, useQlooFirstValidation?: boolean): Partial<Persona>[] {
        try {
            console.log('🔍 Parsing réponse Gemini...');
            console.log('📏 Longueur réponse:', text.length);
            console.log('📄 Début réponse:', text.substring(0, 200) + '...');
            console.log('📄 Fin réponse:', text.substring(text.length - 200) + '...');
            
            // Utiliser le validateur approprié selon le contexte
            if (useQlooFirstValidation) {
                console.log('🔧 Utilisation du parsing Qloo-first');
                return PersonaValidator.parseGeminiResponseQlooFirst(text, brief);
            } else if (useLegacyValidation) {
                console.log('🔧 Utilisation du parsing legacy');
                return PersonaValidator.parseGeminiResponseLegacy(text, brief);
            } else {
                console.log('🔧 Utilisation du parsing standard');
                return PersonaValidator.parseGeminiResponse(text, brief);
            }
        } catch (error) {
            console.error('❌ Erreur parsing Gemini response:', error);

            if (error instanceof PersonaValidationError) {
                console.error('❌ Erreur de validation:', error.message);
            }

            console.log('📄 Raw response complet:', text);
            console.log('🔄 Utilisation du fallback suite à l\'erreur de parsing');
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

    /**
     * Generate cache key from prompt
     */
    private generateCacheKey(prompt: string): string {
        return crypto.createHash('md5').update(prompt).digest('hex');
    }

    /**
     * Get from cache if not expired
     */
    private getFromCache(key: string): Partial<Persona>[] | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    /**
     * Set cache entry
     */
    private setCache(key: string, data: Partial<Persona>[]): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: this.CACHE_TTL
        });
        console.log('💾 Gemini response cached');
    }

    /**
     * Generate with retry and exponential backoff
     */
    private async generateWithRetry(
        prompt: string,
        brief: string,
        useLegacyValidation?: boolean,
        useQlooFirstValidation?: boolean
    ): Promise<Partial<Persona>[]> {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
            try {
                const result = await this.model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                return this.parsePersonasResponse(text, brief, useLegacyValidation, useQlooFirstValidation);
            } catch (error) {
                const currentError = error as Error;
                lastError = currentError;

                console.error(`Erreur Gemini API (tentative ${attempt + 1}/${this.MAX_RETRIES}):`, currentError);

                // Log additional error details for debugging
                if (currentError.message.includes('503') || currentError.message.includes('overloaded')) {
                    console.log({
                        status: 503,
                        statusText: 'Service Unavailable',
                        errorDetails: this.extractErrorDetails(currentError)
                    });
                }

                // Check if it's a retryable error
                if (this.isRetryableError(currentError) && attempt < this.MAX_RETRIES - 1) {
                    const delay = this.calculateDelay(attempt, currentError);
                    console.log(`🔄 Retry dans ${delay}ms...`);
                    await this.sleep(delay);
                    continue;
                }

                // If not retryable, break early
                if (!this.isRetryableError(currentError)) {
                    console.error('🚫 Erreur non-retryable détectée, arrêt des tentatives');
                    break;
                }
            }
        }

        // All retries failed, use fallback
        console.error('🚫 Toutes les tentatives Gemini ont échoué, utilisation du fallback');
        console.error('Dernière erreur:', lastError?.message);

        // Update circuit breaker on failure
        this.recordFailure();

        return getFallbackPersonas(brief);
    }

    /**
     * Check if error is retryable
     */
    private isRetryableError(error: Error): boolean {
        const retryableErrors = [
            'service unavailable',
            'overloaded',
            'timeout',
            'rate limit',
            'temporarily unavailable',
            '503',
            '429',
            '502',
            '504',
            'network error',
            'connection error'
        ];

        const errorMessage = error.message.toLowerCase();
        return retryableErrors.some(retryable => errorMessage.includes(retryable));
    }

    /**
     * Calculate delay with jitter for better distribution
     */
    private calculateDelay(attempt: number, error: Error): number {
        let baseDelay = this.BASE_DELAY * Math.pow(2, attempt);

        // Special handling for overloaded errors - longer delays
        if (error.message.toLowerCase().includes('overloaded')) {
            baseDelay *= 2; // Double the delay for overloaded errors
        }

        // Add jitter (±25% randomization)
        const jitter = baseDelay * 0.25 * (Math.random() - 0.5);
        const finalDelay = Math.min(baseDelay + jitter, this.MAX_DELAY);

        return Math.max(finalDelay, 1000); // Minimum 1 second
    }

    /**
     * Extract error details for logging
     */
    private extractErrorDetails(error: Error): any {
        try {
            // Try to extract structured error information
            const errorStr = error.toString();
            if (errorStr.includes('[') && errorStr.includes(']')) {
                const match = errorStr.match(/\[([^\]]+)\]/);
                return match ? match[1] : undefined;
            }
            return undefined;
        } catch {
            return undefined;
        }
    }

    /**
     * Sleep utility
     */
    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Cleanup expired cache entries
     */
    private cleanupCache(): void {
        const now = Date.now();
        let cleaned = 0;

        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
                cleaned++;
            }
        }

        if (cleaned > 0) {
            console.log(`🧹 Nettoyé ${cleaned} entrées de cache Gemini expirées`);
        }
    }

    /**
     * Get cache statistics
     */
    getCacheStats(): {
        size: number;
        memoryUsage: number;
        oldestEntry: number;
    } {
        let oldestTimestamp = Date.now();
        let memoryUsage = 0;

        for (const [key, entry] of this.cache.entries()) {
            oldestTimestamp = Math.min(oldestTimestamp, entry.timestamp);
            memoryUsage += key.length * 2 + JSON.stringify(entry.data).length * 2 + 64;
        }

        return {
            size: this.cache.size,
            memoryUsage,
            oldestEntry: oldestTimestamp
        };
    }

    /**
     * Clear cache
     */
    clearCache(): void {
        this.cache.clear();
        console.log('🗑️ Cache Gemini vidé');
    }

    /**
     * Circuit breaker methods
     */
    private isCircuitBreakerOpen(): boolean {
        if (this.failureCount < this.FAILURE_THRESHOLD) {
            return false;
        }

        const timeSinceLastFailure = Date.now() - this.lastFailureTime;
        if (timeSinceLastFailure > this.CIRCUIT_BREAKER_TIMEOUT) {
            // Reset circuit breaker after timeout
            this.resetCircuitBreaker();
            return false;
        }

        return true;
    }

    private recordFailure(): void {
        this.failureCount++;
        this.lastFailureTime = Date.now();

        if (this.failureCount >= this.FAILURE_THRESHOLD) {
            console.warn(`🔴 Circuit breaker activé après ${this.failureCount} échecs consécutifs`);
        }
    }

    private resetCircuitBreaker(): void {
        if (this.failureCount > 0) {
            console.log('🟢 Circuit breaker réinitialisé après succès');
        }
        this.failureCount = 0;
        this.lastFailureTime = 0;
    }

    private isFallbackResult(result: Partial<Persona>[], brief: string): boolean {
        // Simple heuristic to detect if result is from fallback
        // Fallback personas typically have generic names and descriptions
        if (result.length === 0) return true;

        const firstPersona = result[0];
        
                        // Check for fallback names (only exact matches from fallback.ts)
                const fallbackNames = [
                    'Marie Dubois',
                    'Thomas Martin',
                    'Antoine Leclerc'
                ];
        
        if (fallbackNames.includes(firstPersona.name || '')) {
            console.log('🔍 Fallback détecté par nom:', firstPersona.name);
            return true;
        }

        const fallbackIndicators = [
            'Persona générique',
            'Utilisateur type',
            'Profil standard',
            'Exemple de persona'
        ];

        const hasFallbackIndicator = fallbackIndicators.some(indicator =>
            firstPersona.name?.includes(indicator) ||
            firstPersona.bio?.includes(indicator)
        );
        
        if (hasFallbackIndicator) {
            console.log('🔍 Fallback détecté par indicateur');
            return true;
        }

        return false;
    }

    /**
     * Get circuit breaker status
     */
    getCircuitBreakerStatus(): {
        isOpen: boolean;
        failureCount: number;
        lastFailureTime: number;
        timeUntilReset: number;
    } {
        const isOpen = this.isCircuitBreakerOpen();
        const timeUntilReset = isOpen
            ? Math.max(0, this.CIRCUIT_BREAKER_TIMEOUT - (Date.now() - this.lastFailureTime))
            : 0;

        return {
            isOpen,
            failureCount: this.failureCount,
            lastFailureTime: this.lastFailureTime,
            timeUntilReset
        };
    }
}