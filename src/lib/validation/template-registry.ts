/**
 * TemplateRegistry - Manages storage and retrieval of validation templates
 * 
 * This class provides:
 * - Template storage and retrieval
 * - Caching for performance optimization
 * - CRUD operations for template management
 */

import {
    ValidationTemplate,
    PersonaType,
    TemplateMetadata
} from '../../types/validation';

export interface TemplateRegistry {
    templates: Map<string, ValidationTemplate>;

    register(template: ValidationTemplate): void;
    get(id: string): ValidationTemplate | null;
    getByPersonaType(type: PersonaType): ValidationTemplate[];
    update(id: string, template: ValidationTemplate): void;
    delete(id: string): boolean;
    list(): ValidationTemplate[];
    exists(id: string): boolean;
}

interface CacheEntry {
    template: ValidationTemplate;
    lastAccessed: number;
    accessCount: number;
}

export class ValidationTemplateRegistry implements TemplateRegistry {
    public templates: Map<string, ValidationTemplate> = new Map();
    private cache: Map<string, CacheEntry> = new Map();
    private personaTypeIndex: Map<PersonaType, Set<string>> = new Map();
    private cacheConfig: {
        maxSize: number;
        ttlMs: number;
        cleanupIntervalMs: number;
    };
    private cleanupTimer?: NodeJS.Timeout;

    constructor(config?: {
        maxCacheSize?: number;
        cacheTtlMs?: number;
        cleanupIntervalMs?: number;
    }) {
        this.cacheConfig = {
            maxSize: config?.maxCacheSize || 100,
            ttlMs: config?.cacheTtlMs || 5 * 60 * 1000, // 5 minutes
            cleanupIntervalMs: config?.cleanupIntervalMs || 60 * 1000 // 1 minute
        };

        // Initialize persona type index
        Object.values(PersonaType).forEach(type => {
            this.personaTypeIndex.set(type, new Set());
        });

        // Start cache cleanup timer
        this.startCacheCleanup();
    }

    /**
     * Register a new validation template
     */
    register(template: ValidationTemplate): void {
        // Validate template
        this.validateTemplate(template);

        // Set creation timestamp if not provided
        if (!template.metadata.createdAt) {
            template.metadata.createdAt = Date.now();
        }
        template.metadata.updatedAt = Date.now();

        // Store template
        this.templates.set(template.id, { ...template });

        // Update persona type index
        this.updatePersonaTypeIndex(template.id, template.personaType);

        // Update cache
        this.updateCache(template.id, template);

        console.log(`Template registered: ${template.id} (${template.personaType})`);
    }

    /**
     * Get a template by ID with caching
     */
    get(id: string): ValidationTemplate | null {
        // Check cache first
        const cached = this.getCachedTemplate(id);
        if (cached) {
            return cached;
        }

        // Get from main storage
        const template = this.templates.get(id);
        if (!template) {
            return null;
        }

        // Update cache
        this.updateCache(id, template);

        return { ...template }; // Return a copy to prevent mutations
    }

    /**
     * Get templates by persona type
     */
    getByPersonaType(type: PersonaType): ValidationTemplate[] {
        const templateIds = this.personaTypeIndex.get(type);
        if (!templateIds || templateIds.size === 0) {
            return [];
        }

        const templates: ValidationTemplate[] = [];
        for (const id of templateIds) {
            const template = this.get(id);
            if (template && template.metadata.isActive) {
                templates.push(template);
            }
        }

        // Sort by version (newest first)
        return templates.sort((a, b) => {
            const aVersion = this.parseVersion(a.version);
            const bVersion = this.parseVersion(b.version);
            return bVersion.major - aVersion.major ||
                bVersion.minor - aVersion.minor ||
                bVersion.patch - aVersion.patch;
        });
    }

    /**
     * Get the latest active template for a persona type
     */
    getLatestByPersonaType(type: PersonaType): ValidationTemplate | null {
        const templates = this.getByPersonaType(type);
        return templates.length > 0 ? templates[0] : null;
    }

    /**
     * Update an existing template
     */
    update(id: string, template: ValidationTemplate): void {
        if (!this.templates.has(id)) {
            throw new Error(`Template with id ${id} does not exist`);
        }

        // Validate template
        this.validateTemplate(template);

        // Preserve creation timestamp, update modification timestamp
        const existing = this.templates.get(id)!;
        template.metadata.createdAt = existing.metadata.createdAt;
        template.metadata.updatedAt = Date.now();

        // Update main storage
        this.templates.set(id, { ...template });

        // Update persona type index if type changed
        if (existing.personaType !== template.personaType) {
            this.removeFromPersonaTypeIndex(id, existing.personaType);
            this.updatePersonaTypeIndex(id, template.personaType);
        }

        // Update cache
        this.updateCache(id, template);

        console.log(`Template updated: ${id}`);
    }

    /**
     * Delete a template
     */
    delete(id: string): boolean {
        const template = this.templates.get(id);
        if (!template) {
            return false;
        }

        // Remove from main storage
        this.templates.delete(id);

        // Remove from persona type index
        this.removeFromPersonaTypeIndex(id, template.personaType);

        // Remove from cache
        this.cache.delete(id);

        console.log(`Template deleted: ${id}`);
        return true;
    }

    /**
     * List all templates
     */
    list(): ValidationTemplate[] {
        return Array.from(this.templates.values()).map(template => ({ ...template }));
    }

    /**
     * Check if a template exists
     */
    exists(id: string): boolean {
        return this.templates.has(id);
    }

    /**
     * Search templates by name or description
     */
    search(query: string): ValidationTemplate[] {
        const lowerQuery = query.toLowerCase();
        return this.list().filter(template =>
            template.name.toLowerCase().includes(lowerQuery) ||
            template.metadata.description.toLowerCase().includes(lowerQuery) ||
            template.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    }

    /**
     * Get templates by tag
     */
    getByTag(tag: string): ValidationTemplate[] {
        return this.list().filter(template =>
            template.metadata.tags.includes(tag)
        );
    }

    /**
     * Clear the cache
     */
    clearCache(): void {
        this.cache.clear();
        console.log('Template cache cleared');
    }

    /**
     * Cleanup resources
     */
    destroy(): void {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = undefined;
        }
        this.clearCache();
    }

    // Private methods

    /**
     * Get template from cache
     */
    private getCachedTemplate(id: string): ValidationTemplate | null {
        const entry = this.cache.get(id);
        if (!entry) {
            return null;
        }

        // Check if cache entry is still valid
        const now = Date.now();
        if (now - entry.lastAccessed > this.cacheConfig.ttlMs) {
            this.cache.delete(id);
            return null;
        }

        // Update access statistics
        entry.lastAccessed = now;
        entry.accessCount++;

        return { ...entry.template };
    }

    /**
     * Update cache with template
     */
    private updateCache(id: string, template: ValidationTemplate): void {
        // Check cache size limit
        if (this.cache.size >= this.cacheConfig.maxSize && !this.cache.has(id)) {
            // Remove least recently used entry
            this.evictLeastRecentlyUsed();
        }

        const now = Date.now();
        this.cache.set(id, {
            template: { ...template },
            lastAccessed: now,
            accessCount: this.cache.get(id)?.accessCount || 0
        });
    }

    /**
     * Evict least recently used cache entry
     */
    private evictLeastRecentlyUsed(): void {
        let oldestId: string | null = null;
        let oldestTime = Date.now();

        for (const [id, entry] of this.cache.entries()) {
            if (entry.lastAccessed < oldestTime) {
                oldestTime = entry.lastAccessed;
                oldestId = id;
            }
        }

        if (oldestId) {
            this.cache.delete(oldestId);
        }
    }

    /**
     * Update persona type index
     */
    private updatePersonaTypeIndex(templateId: string, personaType: PersonaType): void {
        const typeSet = this.personaTypeIndex.get(personaType);
        if (typeSet) {
            typeSet.add(templateId);
        }
    }

    /**
     * Remove from persona type index
     */
    private removeFromPersonaTypeIndex(templateId: string, personaType: PersonaType): void {
        const typeSet = this.personaTypeIndex.get(personaType);
        if (typeSet) {
            typeSet.delete(templateId);
        }
    }

    /**
     * Validate template structure
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
            throw new Error(`Invalid persona type: ${template.personaType}`);
        }

        if (!Array.isArray(template.rules) || template.rules.length === 0) {
            throw new Error('Template must have at least one validation rule');
        }

        if (!template.metadata || typeof template.metadata !== 'object') {
            throw new Error('Template must have metadata object');
        }

        // Validate version format (semantic versioning)
        if (!this.isValidVersion(template.version)) {
            throw new Error(`Invalid version format: ${template.version}. Expected semantic versioning (e.g., 1.0.0)`);
        }
    }

    /**
     * Validate version format
     */
    private isValidVersion(version: string): boolean {
        const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9-]+)?$/;
        return semverRegex.test(version);
    }

    /**
     * Parse version string into components
     */
    private parseVersion(version: string): { major: number; minor: number; patch: number } {
        const parts = version.split('-')[0].split('.').map(Number);
        return {
            major: parts[0] || 0,
            minor: parts[1] || 0,
            patch: parts[2] || 0
        };
    }

    /**
     * Start cache cleanup timer
     */
    private startCacheCleanup(): void {
        this.cleanupTimer = setInterval(() => {
            this.cleanupExpiredCache();
        }, this.cacheConfig.cleanupIntervalMs);
    }

    /**
     * Clean up expired cache entries
     */
    private cleanupExpiredCache(): void {
        const now = Date.now();
        const expiredIds: string[] = [];

        for (const [id, entry] of this.cache.entries()) {
            if (now - entry.lastAccessed > this.cacheConfig.ttlMs) {
                expiredIds.push(id);
            }
        }

        expiredIds.forEach(id => this.cache.delete(id));

        if (expiredIds.length > 0) {
            console.log(`Cleaned up ${expiredIds.length} expired cache entries`);
        }
    }
}