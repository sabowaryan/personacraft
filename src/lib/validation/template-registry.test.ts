/**
 * Unit tests for ValidationTemplateRegistry
 */

import { ValidationTemplateRegistry } from './template-registry';
import { ValidationTemplate, PersonaType, ValidationRuleType, ValidationSeverity, FallbackStrategyType } from '@/types/validation';

describe('ValidationTemplateRegistry', () => {
    let registry: ValidationTemplateRegistry;

    const mockTemplate: ValidationTemplate = {
        id: 'test-template-v1',
        name: 'Test Template',
        version: '1.0.0',
        personaType: PersonaType.STANDARD,
        rules: [{
            id: 'test-rule',
            type: ValidationRuleType.STRUCTURE,
            field: 'name',
            validator: () => ({ isValid: true, errors: [], warnings: [], score: 100, metadata: {} as any }),
            severity: ValidationSeverity.ERROR,
            message: 'Test rule',
            required: true,
            priority: 1
        }],
        fallbackStrategy: {
            type: FallbackStrategyType.SIMPLE_TEMPLATE,
            maxRetries: 3,
            fallbackTemplate: 'simple-template-v1',
            retryDelay: 1000,
            backoffMultiplier: 1.5
        },
        metadata: {
            createdAt: Date.now(),
            updatedAt: Date.now(),
            author: 'Test Author',
            description: 'Test template',
            tags: ['test'],
            isActive: true,
            supportedLLMs: ['gpt-4']
        }
    };

    const mockTemplate2: ValidationTemplate = {
        ...mockTemplate,
        id: 'test-template-v2',
        version: '2.0.0',
        personaType: PersonaType.B2B,
        metadata: {
            ...mockTemplate.metadata,
            updatedAt: Date.now() + 1000
        }
    };

    beforeEach(() => {
        registry = new ValidationTemplateRegistry();
    });

    describe('register', () => {
        it('should register a new template', () => {
            registry.register(mockTemplate);
            
            const retrieved = registry.get(mockTemplate.id);
            expect(retrieved).toEqual(mockTemplate);
        });

        it('should throw error when registering template with duplicate id', () => {
            registry.register(mockTemplate);
            
            expect(() => registry.register(mockTemplate)).toThrow('Template with id test-template-v1 already exists');
        });

        it('should throw error when registering template without required fields', () => {
            const invalidTemplate = { ...mockTemplate, id: '' };
            
            expect(() => registry.register(invalidTemplate)).toThrow('Template id is required');
        });

        it('should throw error when registering template without name', () => {
            const invalidTemplate = { ...mockTemplate, id: 'valid-id', name: '' };
            
            expect(() => registry.register(invalidTemplate)).toThrow('Template name is required');
        });

        it('should throw error when registering template without rules', () => {
            const invalidTemplate = { ...mockTemplate, id: 'valid-id', rules: [] };
            
            expect(() => registry.register(invalidTemplate)).toThrow('Template must have at least one validation rule');
        });
    });

    describe('get', () => {
        it('should return template by id', () => {
            registry.register(mockTemplate);
            
            const retrieved = registry.get(mockTemplate.id);
            expect(retrieved).toEqual(mockTemplate);
        });

        it('should return null for non-existent template', () => {
            const retrieved = registry.get('non-existent');
            expect(retrieved).toBeNull();
        });
    });

    describe('update', () => {
        it('should update existing template', () => {
            registry.register(mockTemplate);
            
            const updatedTemplate = { ...mockTemplate, name: 'Updated Template' };
            registry.update(mockTemplate.id, updatedTemplate);
            
            const retrieved = registry.get(mockTemplate.id);
            expect(retrieved?.name).toBe('Updated Template');
        });

        it('should throw error when updating non-existent template', () => {
            expect(() => registry.update('non-existent', mockTemplate)).toThrow('Template with id non-existent not found');
        });

        it('should update the updatedAt timestamp', () => {
            registry.register(mockTemplate);
            const originalUpdatedAt = mockTemplate.metadata.updatedAt;
            
            // Wait a bit to ensure timestamp difference
            setTimeout(() => {
                const updatedTemplate = { ...mockTemplate, name: 'Updated Template' };
                registry.update(mockTemplate.id, updatedTemplate);
                
                const retrieved = registry.get(mockTemplate.id);
                expect(retrieved?.metadata.updatedAt).toBeGreaterThan(originalUpdatedAt);
            }, 10);
        });
    });

    describe('delete', () => {
        it('should delete existing template', () => {
            registry.register(mockTemplate);
            
            const deleted = registry.delete(mockTemplate.id);
            expect(deleted).toBe(true);
            
            const retrieved = registry.get(mockTemplate.id);
            expect(retrieved).toBeNull();
        });

        it('should return false when deleting non-existent template', () => {
            const deleted = registry.delete('non-existent');
            expect(deleted).toBe(false);
        });
    });

    describe('list', () => {
        it('should return empty array when no templates registered', () => {
            const templates = registry.list();
            expect(templates).toEqual([]);
        });

        it('should return all registered templates', () => {
            registry.register(mockTemplate);
            registry.register(mockTemplate2);
            
            const templates = registry.list();
            expect(templates).toHaveLength(2);
            expect(templates).toContain(mockTemplate);
            expect(templates).toContain(mockTemplate2);
        });

        it('should return templates sorted by updatedAt descending', () => {
            registry.register(mockTemplate);
            registry.register(mockTemplate2);
            
            const templates = registry.list();
            expect(templates[0].metadata.updatedAt).toBeGreaterThanOrEqual(templates[1].metadata.updatedAt);
        });
    });

    describe('getByPersonaType', () => {
        it('should return templates for specific persona type', () => {
            registry.register(mockTemplate); // STANDARD
            registry.register(mockTemplate2); // B2B
            
            const standardTemplates = registry.getByPersonaType(PersonaType.STANDARD);
            expect(standardTemplates).toHaveLength(1);
            expect(standardTemplates[0].personaType).toBe(PersonaType.STANDARD);
            
            const b2bTemplates = registry.getByPersonaType(PersonaType.B2B);
            expect(b2bTemplates).toHaveLength(1);
            expect(b2bTemplates[0].personaType).toBe(PersonaType.B2B);
        });

        it('should return empty array for persona type with no templates', () => {
            registry.register(mockTemplate);
            
            const simpleTemplates = registry.getByPersonaType(PersonaType.SIMPLE);
            expect(simpleTemplates).toEqual([]);
        });

        it('should return templates sorted by version descending', () => {
            const template1 = { ...mockTemplate, id: 'template-v1', version: '1.0.0' };
            const template2 = { ...mockTemplate, id: 'template-v2', version: '2.0.0' };
            const template3 = { ...mockTemplate, id: 'template-v3', version: '1.5.0' };
            
            registry.register(template1);
            registry.register(template2);
            registry.register(template3);
            
            const templates = registry.getByPersonaType(PersonaType.STANDARD);
            expect(templates[0].version).toBe('2.0.0');
            expect(templates[1].version).toBe('1.5.0');
            expect(templates[2].version).toBe('1.0.0');
        });
    });

    describe('getLatestByPersonaType', () => {
        it('should return latest active template for persona type', () => {
            const template1 = { ...mockTemplate, id: 'template-v1', version: '1.0.0' };
            const template2 = { ...mockTemplate, id: 'template-v2', version: '2.0.0' };
            
            registry.register(template1);
            registry.register(template2);
            
            const latest = registry.getLatestByPersonaType(PersonaType.STANDARD);
            expect(latest?.version).toBe('2.0.0');
        });

        it('should return null if no active templates exist for persona type', () => {
            const inactiveTemplate = { 
                ...mockTemplate, 
                metadata: { ...mockTemplate.metadata, isActive: false }
            };
            registry.register(inactiveTemplate);
            
            const latest = registry.getLatestByPersonaType(PersonaType.STANDARD);
            expect(latest).toBeNull();
        });

        it('should return null if no templates exist for persona type', () => {
            const latest = registry.getLatestByPersonaType(PersonaType.SIMPLE);
            expect(latest).toBeNull();
        });

        it('should skip inactive templates and return latest active one', () => {
            const template1 = { ...mockTemplate, id: 'template-v1', version: '1.0.0' };
            const template2 = { 
                ...mockTemplate, 
                id: 'template-v2', 
                version: '2.0.0',
                metadata: { ...mockTemplate.metadata, isActive: false }
            };
            const template3 = { ...mockTemplate, id: 'template-v3', version: '1.5.0' };
            
            registry.register(template1);
            registry.register(template2);
            registry.register(template3);
            
            const latest = registry.getLatestByPersonaType(PersonaType.STANDARD);
            expect(latest?.version).toBe('1.5.0'); // Should skip v2.0.0 as it's inactive
        });
    });

    describe('getActiveTemplates', () => {
        it('should return only active templates', () => {
            const activeTemplate = mockTemplate;
            const inactiveTemplate = { 
                ...mockTemplate2, 
                metadata: { ...mockTemplate2.metadata, isActive: false }
            };
            
            registry.register(activeTemplate);
            registry.register(inactiveTemplate);
            
            const activeTemplates = registry.getActiveTemplates();
            expect(activeTemplates).toHaveLength(1);
            expect(activeTemplates[0].metadata.isActive).toBe(true);
        });

        it('should return empty array if no active templates', () => {
            const inactiveTemplate = { 
                ...mockTemplate, 
                metadata: { ...mockTemplate.metadata, isActive: false }
            };
            registry.register(inactiveTemplate);
            
            const activeTemplates = registry.getActiveTemplates();
            expect(activeTemplates).toEqual([]);
        });
    });

    describe('clear', () => {
        it('should remove all templates', () => {
            registry.register(mockTemplate);
            registry.register(mockTemplate2);
            
            registry.clear();
            
            const templates = registry.list();
            expect(templates).toEqual([]);
        });
    });

    describe('exists', () => {
        it('should return true for existing template', () => {
            registry.register(mockTemplate);
            
            const exists = registry.exists(mockTemplate.id);
            expect(exists).toBe(true);
        });

        it('should return false for non-existent template', () => {
            const exists = registry.exists('non-existent');
            expect(exists).toBe(false);
        });
    });

    describe('getStats', () => {
        it('should return correct statistics', () => {
            const activeTemplate = mockTemplate;
            const inactiveTemplate = { 
                ...mockTemplate2, 
                metadata: { ...mockTemplate2.metadata, isActive: false }
            };
            
            registry.register(activeTemplate);
            registry.register(inactiveTemplate);
            
            const stats = registry.getStats();
            expect(stats.total).toBe(2);
            expect(stats.active).toBe(1);
            expect(stats.inactive).toBe(1);
            expect(stats.byPersonaType[PersonaType.STANDARD]).toBe(1);
            expect(stats.byPersonaType[PersonaType.B2B]).toBe(1);
        });

        it('should return zero stats for empty registry', () => {
            const stats = registry.getStats();
            expect(stats.total).toBe(0);
            expect(stats.active).toBe(0);
            expect(stats.inactive).toBe(0);
            expect(Object.keys(stats.byPersonaType)).toHaveLength(0);
        });
    });

    describe('cache functionality', () => {
        it('should cache templates for performance', () => {
            registry.register(mockTemplate);
            
            // First call should populate cache
            const first = registry.get(mockTemplate.id);
            
            // Second call should use cache
            const second = registry.get(mockTemplate.id);
            
            expect(first).toBe(second); // Same reference indicates caching
        });

        it('should invalidate cache on update', () => {
            registry.register(mockTemplate);
            const original = registry.get(mockTemplate.id);
            
            const updatedTemplate = { ...mockTemplate, name: 'Updated' };
            registry.update(mockTemplate.id, updatedTemplate);
            
            const updated = registry.get(mockTemplate.id);
            expect(updated?.name).toBe('Updated');
            expect(updated).not.toBe(original); // Different reference indicates cache invalidation
        });

        it('should invalidate cache on delete', () => {
            registry.register(mockTemplate);
            registry.get(mockTemplate.id); // Populate cache
            
            registry.delete(mockTemplate.id);
            
            const retrieved = registry.get(mockTemplate.id);
            expect(retrieved).toBeNull();
        });
    });
});