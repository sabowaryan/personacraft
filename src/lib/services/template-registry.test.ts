/**
 * Tests unitaires pour TemplateRegistry
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { 
    TemplateRegistry, 
    TemplateRegistryConfig,
    TemplateSearchCriteria 
} from './template-registry';
import { 
    ValidationTemplate, 
    PersonaType, 
    ValidationRule,
    ValidationRuleType,
    ValidationSeverity,
    FallbackStrategyType,
    TemplateMetadata 
} from '../../types/validation';

// Mock template factory
const createMockTemplate = (
    id: string, 
    personaType: PersonaType = PersonaType.STANDARD,
    overrides: Partial<ValidationTemplate> = {}
): ValidationTemplate => {
    const mockRule: ValidationRule = {
        id: 'test-rule',
        type: ValidationRuleType.STRUCTURE,
        field: 'test-field',
        validator: vi.fn(),
        severity: ValidationSeverity.ERROR,
        message: 'Test validation rule',
        required: true
    };

    const mockMetadata: TemplateMetadata = {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        author: 'test-author',
        description: 'Test template',
        tags: ['test'],
        isActive: true,
        supportedLLMs: ['gpt-4']
    };

    return {
        id,
        name: `Test Template ${id}`,
        version: '1.0.0',
        personaType,
        rules: [mockRule],
        fallbackStrategy: {
            type: FallbackStrategyType.REGENERATE,
            maxRetries: 3
        },
        metadata: mockMetadata,
        ...overrides
    };
};

describe('TemplateRegistry', () => {
    let registry: TemplateRegistry;
    let mockTemplate: ValidationTemplate;

    beforeEach(() => {
        registry = new TemplateRegistry();
        mockTemplate = createMockTemplate('test-template-1');
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    describe('Configuration', () => {
        it('should initialize with default configuration', () => {
            const config = registry.getConfig();
            expect(config.cacheEnabled).toBe(true);
            expect(config.cacheTTL).toBe(5 * 60 * 1000);
            expect(config.maxCacheSize).toBe(100);
            expect(config.persistenceEnabled).toBe(false);
        });

        it('should accept custom configuration', () => {
            const customConfig: Partial<TemplateRegistryConfig> = {
                cacheEnabled: false,
                cacheTTL: 10000,
                maxCacheSize: 50
            };

            const customRegistry = new TemplateRegistry(customConfig);
            const config = customRegistry.getConfig();
            
            expect(config.cacheEnabled).toBe(false);
            expect(config.cacheTTL).toBe(10000);
            expect(config.maxCacheSize).toBe(50);
        });

        it('should update configuration', () => {
            registry.updateConfig({ cacheEnabled: false });
            const config = registry.getConfig();
            expect(config.cacheEnabled).toBe(false);
        });
    });

    describe('Template Registration', () => {
        it('should register a valid template', () => {
            expect(() => registry.register(mockTemplate)).not.toThrow();
            expect(registry.exists('test-template-1')).toBe(true);
        });

        it('should throw error when registering duplicate template', () => {
            registry.register(mockTemplate);
            expect(() => registry.register(mockTemplate)).toThrow(
                "Template with id 'test-template-1' already exists"
            );
        });

        it('should validate template structure on registration', () => {
            const invalidTemplate = { ...mockTemplate, id: '' };
            expect(() => registry.register(invalidTemplate as ValidationTemplate)).toThrow(
                'Template must have a valid string id'
            );
        });

        it('should update template metadata on registration', () => {
            const beforeTime = Date.now();
            registry.register(mockTemplate);
            const retrieved = registry.get('test-template-1');
            
            expect(retrieved?.metadata.updatedAt).toBeGreaterThanOrEqual(beforeTime);
            expect(retrieved?.metadata.createdAt).toBeGreaterThanOrEqual(beforeTime);
        });
    });

    describe('Template Retrieval', () => {
        beforeEach(() => {
            registry.register(mockTemplate);
        });

        it('should retrieve existing template by id', () => {
            const retrieved = registry.get('test-template-1');
            expect(retrieved).toEqual(mockTemplate);
        });

        it('should return null for non-existing template', () => {
            const retrieved = registry.get('non-existing');
            expect(retrieved).toBeNull();
        });

        it('should retrieve templates by persona type', () => {
            const b2bTemplate = createMockTemplate('b2b-template', PersonaType.B2B);
            registry.register(b2bTemplate);

            const standardTemplates = registry.getByPersonaType(PersonaType.STANDARD);
            const b2bTemplates = registry.getByPersonaType(PersonaType.B2B);

            expect(standardTemplates).toHaveLength(1);
            expect(standardTemplates[0].id).toBe('test-template-1');
            expect(b2bTemplates).toHaveLength(1);
            expect(b2bTemplates[0].id).toBe('b2b-template');
        });

        it('should only return active templates by persona type', () => {
            const inactiveTemplate = createMockTemplate('inactive-template', PersonaType.STANDARD, {
                metadata: { ...mockTemplate.metadata, isActive: false }
            });
            registry.register(inactiveTemplate);

            const templates = registry.getByPersonaType(PersonaType.STANDARD);
            expect(templates).toHaveLength(1);
            expect(templates[0].id).toBe('test-template-1');
        });

        it('should get latest template by persona type', () => {
            const olderTemplate = createMockTemplate('older-template', PersonaType.STANDARD);
            registry.register(olderTemplate);

            // Manually set timestamps to ensure proper ordering
            const newer = registry.get('test-template-1')!;
            const older = registry.get('older-template')!;
            newer.metadata.updatedAt = Date.now();
            older.metadata.updatedAt = Date.now() - 10000;

            const latest = registry.getLatestByPersonaType(PersonaType.STANDARD);
            expect(latest?.id).toBe('test-template-1');
        });
    });

    describe('Template Updates', () => {
        beforeEach(() => {
            registry.register(mockTemplate);
        });

        it('should update existing template', () => {
            const updatedTemplate = { ...mockTemplate, name: 'Updated Template' };
            expect(() => registry.update('test-template-1', updatedTemplate)).not.toThrow();
            
            const retrieved = registry.get('test-template-1');
            expect(retrieved?.name).toBe('Updated Template');
        });

        it('should throw error when updating non-existing template', () => {
            expect(() => registry.update('non-existing', mockTemplate)).toThrow(
                "Template with id 'non-existing' not found"
            );
        });

        it('should preserve creation time on update', async () => {
            const originalCreatedAt = mockTemplate.metadata.createdAt;
            const updatedTemplate = { ...mockTemplate, name: 'Updated' };
            
            // Small delay to ensure different timestamps
            await new Promise(resolve => setTimeout(resolve, 10));
            
            registry.update('test-template-1', updatedTemplate);
            const retrieved = registry.get('test-template-1');
            
            expect(retrieved?.metadata.createdAt).toBe(originalCreatedAt);
            expect(retrieved?.metadata.updatedAt).toBeGreaterThan(originalCreatedAt);
        });
    });

    describe('Template Deletion', () => {
        beforeEach(() => {
            registry.register(mockTemplate);
        });

        it('should delete existing template', () => {
            const deleted = registry.delete('test-template-1');
            expect(deleted).toBe(true);
            expect(registry.exists('test-template-1')).toBe(false);
        });

        it('should return false when deleting non-existing template', () => {
            const deleted = registry.delete('non-existing');
            expect(deleted).toBe(false);
        });
    });

    describe('Template Listing', () => {
        it('should list all templates', () => {
            const template1 = createMockTemplate('template-1');
            const template2 = createMockTemplate('template-2');
            
            registry.register(template1);
            registry.register(template2);

            const templates = registry.list();
            expect(templates).toHaveLength(2);
            expect(templates.map(t => t.id)).toContain('template-1');
            expect(templates.map(t => t.id)).toContain('template-2');
        });

        it('should sort templates by update time (newest first)', () => {
            const template1 = createMockTemplate('template-1');
            const template2 = createMockTemplate('template-2');
            
            registry.register(template1);
            registry.register(template2);

            // Manually update timestamps to test sorting
            const t1 = registry.get('template-1')!;
            const t2 = registry.get('template-2')!;
            t1.metadata.updatedAt = 1000;
            t2.metadata.updatedAt = 2000;

            const templates = registry.list();
            expect(templates[0].id).toBe('template-2');
            expect(templates[1].id).toBe('template-1');
        });
    });

    describe('Template Search', () => {
        beforeEach(() => {
            const template1 = createMockTemplate('template-1', PersonaType.STANDARD, {
                metadata: {
                    ...mockTemplate.metadata,
                    author: 'author1',
                    tags: ['tag1', 'tag2'],
                    supportedLLMs: ['gpt-4']
                }
            });
            const template2 = createMockTemplate('template-2', PersonaType.B2B, {
                metadata: {
                    ...mockTemplate.metadata,
                    author: 'author2',
                    tags: ['tag2', 'tag3'],
                    supportedLLMs: ['claude']
                }
            });
            const template3 = createMockTemplate('template-3', PersonaType.STANDARD, {
                metadata: {
                    ...mockTemplate.metadata,
                    author: 'author1',
                    isActive: false,
                    tags: ['tag1'],
                    supportedLLMs: ['gpt-4']
                }
            });

            registry.register(template1);
            registry.register(template2);
            registry.register(template3);
        });

        it('should search by persona type', () => {
            const criteria: TemplateSearchCriteria = { personaType: PersonaType.STANDARD };
            const results = registry.search(criteria);
            
            expect(results).toHaveLength(2);
            expect(results.every(t => t.personaType === PersonaType.STANDARD)).toBe(true);
        });

        it('should search by active status', () => {
            const criteria: TemplateSearchCriteria = { isActive: true };
            const results = registry.search(criteria);
            
            expect(results).toHaveLength(2);
            expect(results.every(t => t.metadata.isActive === true)).toBe(true);
        });

        it('should search by author', () => {
            const criteria: TemplateSearchCriteria = { author: 'author1' };
            const results = registry.search(criteria);
            
            expect(results).toHaveLength(2);
            expect(results.every(t => t.metadata.author === 'author1')).toBe(true);
        });

        it('should search by tags', () => {
            const criteria: TemplateSearchCriteria = { tags: ['tag1'] };
            const results = registry.search(criteria);
            
            expect(results).toHaveLength(2);
            expect(results.every(t => t.metadata.tags.includes('tag1'))).toBe(true);
        });

        it('should search by supported LLMs', () => {
            const criteria: TemplateSearchCriteria = { supportedLLMs: ['gpt-4'] };
            const results = registry.search(criteria);
            
            expect(results).toHaveLength(2);
            expect(results.every(t => t.metadata.supportedLLMs?.includes('gpt-4'))).toBe(true);
        });

        it('should combine multiple search criteria', () => {
            const criteria: TemplateSearchCriteria = {
                personaType: PersonaType.STANDARD,
                isActive: true,
                author: 'author1'
            };
            const results = registry.search(criteria);
            
            expect(results).toHaveLength(1);
            expect(results[0].id).toBe('template-1');
        });
    });

    describe('Caching', () => {
        beforeEach(() => {
            registry = new TemplateRegistry({ cacheEnabled: true, cacheTTL: 1000 });
            registry.register(mockTemplate);
        });

        it('should cache retrieved templates', () => {
            // Clear cache first to ensure clean state
            registry.clearCache();
            
            // Premier accès - cache miss
            registry.get('test-template-1');
            let metrics = registry.getMetrics();
            expect(metrics.cacheMisses).toBe(1);
            expect(metrics.cacheHits).toBe(0);

            // Deuxième accès - cache hit
            registry.get('test-template-1');
            metrics = registry.getMetrics();
            expect(metrics.cacheHits).toBe(1);
        });

        it('should respect cache TTL', async () => {
            // Clear cache first to ensure clean state
            registry.clearCache();
            
            registry.get('test-template-1');
            
            // Attendre que le cache expire
            await new Promise(resolve => setTimeout(resolve, 1100));
            
            registry.get('test-template-1');
            const metrics = registry.getMetrics();
            expect(metrics.cacheMisses).toBe(2);
        });

        it('should clear cache when disabled', () => {
            registry.get('test-template-1');
            expect(registry.getMetrics().cacheSize).toBe(1);
            
            registry.updateConfig({ cacheEnabled: false });
            expect(registry.getMetrics().cacheSize).toBe(0);
        });

        it('should evict oldest entries when cache is full', () => {
            const smallCacheRegistry = new TemplateRegistry({ 
                cacheEnabled: true, 
                maxCacheSize: 2 
            });

            const template1 = createMockTemplate('template-1');
            const template2 = createMockTemplate('template-2');
            const template3 = createMockTemplate('template-3');

            smallCacheRegistry.register(template1);
            smallCacheRegistry.register(template2);
            smallCacheRegistry.register(template3);
            
            // Clear cache to start fresh
            smallCacheRegistry.clearCache();

            // Remplir le cache
            smallCacheRegistry.get('template-1');
            smallCacheRegistry.get('template-2');
            expect(smallCacheRegistry.getMetrics().cacheSize).toBe(2);

            // Ajouter un troisième élément devrait évincer le plus ancien
            smallCacheRegistry.get('template-3');
            expect(smallCacheRegistry.getMetrics().cacheSize).toBe(2);
        });
    });

    describe('Metrics', () => {
        it('should track template count', () => {
            expect(registry.getMetrics().totalTemplates).toBe(0);
            
            registry.register(mockTemplate);
            expect(registry.getMetrics().totalTemplates).toBe(1);
            
            registry.delete('test-template-1');
            expect(registry.getMetrics().totalTemplates).toBe(0);
        });

        it('should track cache metrics', () => {
            registry.register(mockTemplate);
            registry.clearCache(); // Clear cache to ensure clean state
            
            registry.get('test-template-1'); // cache miss
            registry.get('test-template-1'); // cache hit
            
            const metrics = registry.getMetrics();
            expect(metrics.cacheHits).toBe(1);
            expect(metrics.cacheMisses).toBe(1);
            expect(metrics.cacheSize).toBe(1);
        });

        it('should update last updated timestamp', () => {
            const beforeTime = Date.now();
            registry.register(mockTemplate);
            const afterTime = Date.now();
            
            const metrics = registry.getMetrics();
            expect(metrics.lastUpdated).toBeGreaterThanOrEqual(beforeTime);
            expect(metrics.lastUpdated).toBeLessThanOrEqual(afterTime);
        });
    });

    describe('Template Validation', () => {
        it('should validate required fields', () => {
            const invalidTemplates = [
                { ...mockTemplate, id: '' },
                { ...mockTemplate, name: '' },
                { ...mockTemplate, version: '' },
                { ...mockTemplate, personaType: 'invalid' as PersonaType },
                { ...mockTemplate, rules: [] },
                { ...mockTemplate, fallbackStrategy: null },
                { ...mockTemplate, metadata: null }
            ];

            invalidTemplates.forEach(template => {
                expect(() => registry.register(template as ValidationTemplate)).toThrow();
            });
        });

        it('should validate rule structure', () => {
            const invalidRule = {
                id: '',
                type: ValidationRuleType.STRUCTURE,
                field: 'test',
                validator: vi.fn(),
                severity: ValidationSeverity.ERROR,
                message: 'test',
                required: true
            };

            const templateWithInvalidRule = {
                ...mockTemplate,
                rules: [invalidRule]
            };

            expect(() => registry.register(templateWithInvalidRule as ValidationTemplate)).toThrow(
                "Invalid rule structure in template 'test-template-1'"
            );
        });
    });
});