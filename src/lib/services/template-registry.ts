/**
 * TemplateRegistry - Système de stockage et de récupération des templates de validation
 * 
 * Ce service gère le stockage, la récupération et la mise en cache des templates
 * de validation pour le système de validation des réponses LLM.
 */

import { 
    ValidationTemplate, 
    PersonaType, 
    TemplateMetadata,
    ValidationError,
    ValidationErrorType 
} from '../../types/validation';

export interface TemplateRegistryConfig {
    cacheEnabled: boolean;
    cacheTTL: number; // Time to live in milliseconds
    maxCacheSize: number;
    persistenceEnabled: boolean;
    persistencePath?: string;
}

export interface TemplateRegistryMetrics {
    totalTemplates: number;
    cacheHits: number;
    cacheMisses: number;
    cacheSize: number;
    lastUpdated: number;
}

export interface TemplateSearchCriteria {
    personaType?: PersonaType;
    isActive?: boolean;
    tags?: string[];
    author?: string;
    version?: string;
    supportedLLMs?: string[];
}

export interface CacheEntry {
    template: ValidationTemplate;
    timestamp: number;
    accessCount: number;
    lastAccessed: number;
}

/**
 * Registry principal pour la gestion des templates de validation
 */
export class TemplateRegistry {
    private templates: Map<string, ValidationTemplate> = new Map();
    private cache: Map<string, CacheEntry> = new Map();
    private config: TemplateRegistryConfig;
    private metrics: TemplateRegistryMetrics;

    constructor(config: Partial<TemplateRegistryConfig> = {}) {
        this.config = {
            cacheEnabled: true,
            cacheTTL: 5 * 60 * 1000, // 5 minutes par défaut
            maxCacheSize: 100,
            persistenceEnabled: false,
            ...config
        };

        this.metrics = {
            totalTemplates: 0,
            cacheHits: 0,
            cacheMisses: 0,
            cacheSize: 0,
            lastUpdated: Date.now()
        };

        // Nettoyage automatique du cache
        if (this.config.cacheEnabled) {
            setInterval(() => this.cleanupCache(), this.config.cacheTTL);
        }
    }

    /**
     * Enregistre un nouveau template dans le registry
     */
    register(template: ValidationTemplate): void {
        this.validateTemplate(template);
        
        const existingTemplate = this.templates.get(template.id);
        if (existingTemplate) {
            throw new Error(`Template with id '${template.id}' already exists. Use update() to modify existing templates.`);
        }

        // Mise à jour des métadonnées
        template.metadata.updatedAt = Date.now();
        if (!template.metadata.createdAt) {
            template.metadata.createdAt = Date.now();
        }

        this.templates.set(template.id, template);
        this.updateCache(template);
        this.updateMetrics();
    }

    /**
     * Récupère un template par son ID
     */
    get(id: string): ValidationTemplate | null {
        // Vérifier d'abord le cache
        if (this.config.cacheEnabled) {
            const cacheEntry = this.cache.get(id);
            if (cacheEntry && this.isCacheEntryValid(cacheEntry)) {
                cacheEntry.accessCount++;
                cacheEntry.lastAccessed = Date.now();
                this.metrics.cacheHits++;
                return cacheEntry.template;
            }
        }

        // Récupérer depuis le stockage principal
        const template = this.templates.get(id);
        if (template) {
            if (this.config.cacheEnabled) {
                this.metrics.cacheMisses++;
                this.updateCache(template);
            }
            return template;
        }

        if (this.config.cacheEnabled) {
            this.metrics.cacheMisses++;
        }
        return null;
    }

    /**
     * Récupère tous les templates pour un type de persona donné
     */
    getByPersonaType(type: PersonaType): ValidationTemplate[] {
        const templates: ValidationTemplate[] = [];
        
        for (const template of this.templates.values()) {
            if (template.personaType === type && template.metadata.isActive) {
                templates.push(template);
            }
        }

        return templates.sort((a, b) => b.metadata.updatedAt - a.metadata.updatedAt);
    }

    /**
     * Met à jour un template existant
     */
    update(id: string, template: ValidationTemplate): void {
        if (!this.templates.has(id)) {
            throw new Error(`Template with id '${id}' not found. Use register() to add new templates.`);
        }

        this.validateTemplate(template);
        
        // Conserver les métadonnées de création
        const existingTemplate = this.templates.get(id)!;
        const updatedTemplate = {
            ...template,
            metadata: {
                ...template.metadata,
                createdAt: existingTemplate.metadata.createdAt,
                updatedAt: Date.now()
            }
        };

        this.templates.set(id, updatedTemplate);
        this.updateCache(updatedTemplate);
        this.updateMetrics();
    }

    /**
     * Supprime un template du registry
     */
    delete(id: string): boolean {
        const deleted = this.templates.delete(id);
        if (deleted) {
            this.cache.delete(id);
            this.updateMetrics();
        }
        return deleted;
    }

    /**
     * Liste tous les templates
     */
    list(): ValidationTemplate[] {
        return Array.from(this.templates.values())
            .sort((a, b) => b.metadata.updatedAt - a.metadata.updatedAt);
    }

    /**
     * Recherche des templates selon des critères
     */
    search(criteria: TemplateSearchCriteria): ValidationTemplate[] {
        const results: ValidationTemplate[] = [];

        for (const template of this.templates.values()) {
            if (this.matchesCriteria(template, criteria)) {
                results.push(template);
            }
        }

        return results.sort((a, b) => b.metadata.updatedAt - a.metadata.updatedAt);
    }

    /**
     * Récupère le template le plus récent pour un type de persona
     */
    getLatestByPersonaType(type: PersonaType): ValidationTemplate | null {
        const templates = this.getByPersonaType(type);
        return templates.length > 0 ? templates[0] : null;
    }

    /**
     * Vérifie si un template existe
     */
    exists(id: string): boolean {
        return this.templates.has(id);
    }

    /**
     * Vide le cache
     */
    clearCache(): void {
        this.cache.clear();
        this.metrics.cacheSize = 0;
        this.metrics.cacheHits = 0;
        this.metrics.cacheMisses = 0;
    }

    /**
     * Récupère les métriques du registry
     */
    getMetrics(): TemplateRegistryMetrics {
        return { ...this.metrics };
    }

    /**
     * Récupère la configuration actuelle
     */
    getConfig(): TemplateRegistryConfig {
        return { ...this.config };
    }

    /**
     * Met à jour la configuration
     */
    updateConfig(newConfig: Partial<TemplateRegistryConfig>): void {
        this.config = { ...this.config, ...newConfig };
        
        // Réinitialiser le cache si désactivé
        if (!this.config.cacheEnabled) {
            this.clearCache();
        }
    }

    // Méthodes privées

    /**
     * Valide la structure d'un template
     */
    private validateTemplate(template: ValidationTemplate): void {
        if (!template.id || typeof template.id !== 'string') {
            throw new Error('Template must have a valid string id');
        }

        if (!template.name || typeof template.name !== 'string') {
            throw new Error('Template must have a valid string name');
        }

        if (!template.version || typeof template.version !== 'string') {
            throw new Error('Template must have a valid string version');
        }

        if (!Object.values(PersonaType).includes(template.personaType)) {
            throw new Error('Template must have a valid personaType');
        }

        if (!Array.isArray(template.rules) || template.rules.length === 0) {
            throw new Error('Template must have at least one validation rule');
        }

        if (!template.fallbackStrategy) {
            throw new Error('Template must have a fallback strategy');
        }

        if (!template.metadata) {
            throw new Error('Template must have metadata');
        }

        // Validation des règles
        for (const rule of template.rules) {
            if (!rule.id || !rule.type || !rule.field || !rule.validator) {
                throw new Error(`Invalid rule structure in template '${template.id}'`);
            }
        }
    }

    /**
     * Met à jour le cache avec un template
     */
    private updateCache(template: ValidationTemplate): void {
        if (!this.config.cacheEnabled) return;

        // Vérifier la taille du cache avant d'ajouter
        if (this.cache.size >= this.config.maxCacheSize && !this.cache.has(template.id)) {
            this.evictOldestCacheEntry();
        }

        const existingEntry = this.cache.get(template.id);
        const cacheEntry: CacheEntry = {
            template,
            timestamp: Date.now(),
            accessCount: existingEntry ? existingEntry.accessCount + 1 : 1,
            lastAccessed: Date.now()
        };

        this.cache.set(template.id, cacheEntry);
        this.metrics.cacheSize = this.cache.size;
    }

    /**
     * Vérifie si une entrée de cache est valide
     */
    private isCacheEntryValid(entry: CacheEntry): boolean {
        const now = Date.now();
        return (now - entry.timestamp) < this.config.cacheTTL;
    }

    /**
     * Nettoie les entrées expirées du cache
     */
    private cleanupCache(): void {
        if (!this.config.cacheEnabled) return;

        const now = Date.now();
        const expiredKeys: string[] = [];

        for (const [key, entry] of this.cache.entries()) {
            if ((now - entry.timestamp) >= this.config.cacheTTL) {
                expiredKeys.push(key);
            }
        }

        for (const key of expiredKeys) {
            this.cache.delete(key);
        }

        this.metrics.cacheSize = this.cache.size;
    }

    /**
     * Évince l'entrée la moins récemment utilisée du cache
     */
    private evictOldestCacheEntry(): void {
        let oldestKey: string | null = null;
        let oldestTime = Date.now();

        for (const [key, entry] of this.cache.entries()) {
            if (entry.lastAccessed < oldestTime) {
                oldestTime = entry.lastAccessed;
                oldestKey = key;
            }
        }

        if (oldestKey) {
            this.cache.delete(oldestKey);
        }
    }

    /**
     * Vérifie si un template correspond aux critères de recherche
     */
    private matchesCriteria(template: ValidationTemplate, criteria: TemplateSearchCriteria): boolean {
        if (criteria.personaType && template.personaType !== criteria.personaType) {
            return false;
        }

        if (criteria.isActive !== undefined && template.metadata.isActive !== criteria.isActive) {
            return false;
        }

        if (criteria.author && template.metadata.author !== criteria.author) {
            return false;
        }

        if (criteria.version && template.version !== criteria.version) {
            return false;
        }

        if (criteria.tags && criteria.tags.length > 0) {
            const hasAllTags = criteria.tags.every(tag => 
                template.metadata.tags.includes(tag)
            );
            if (!hasAllTags) {
                return false;
            }
        }

        if (criteria.supportedLLMs && criteria.supportedLLMs.length > 0) {
            if (!template.metadata.supportedLLMs) {
                return false;
            }
            const hasAllLLMs = criteria.supportedLLMs.every(llm =>
                template.metadata.supportedLLMs!.includes(llm)
            );
            if (!hasAllLLMs) {
                return false;
            }
        }

        return true;
    }

    /**
     * Met à jour les métriques du registry
     */
    private updateMetrics(): void {
        this.metrics.totalTemplates = this.templates.size;
        this.metrics.cacheSize = this.cache.size;
        this.metrics.lastUpdated = Date.now();
    }
}

/**
 * Instance singleton du registry pour utilisation globale
 */
export const templateRegistry = new TemplateRegistry();