/**
 * Template exports and registration
 * Central location for all validation templates
 */

import { ValidationTemplateRegistry } from '../template-registry';
import { standardPersonaTemplate } from './standard-persona-template';
import { b2bPersonaTemplate } from './b2b-persona-template';
import { simplePersonaTemplate } from './simple-persona-template';

// Export all templates
export { standardPersonaTemplate } from './standard-persona-template';
export { b2bPersonaTemplate } from './b2b-persona-template';
export { simplePersonaTemplate } from './simple-persona-template';

/**
 * Register all templates with the registry
 */
export function registerAllTemplates(registry: ValidationTemplateRegistry): void {
    // Register templates in order of complexity (simple -> standard -> b2b)
    registry.register(simplePersonaTemplate);
    registry.register(standardPersonaTemplate);
    registry.register(b2bPersonaTemplate);
    
    console.log('All validation templates registered successfully');
}

/**
 * Get all available templates
 */
export function getAllTemplates() {
    return [
        simplePersonaTemplate,
        standardPersonaTemplate,
        b2bPersonaTemplate
    ];
}

/**
 * Template registry instance with all templates pre-registered
 */
export function createRegistryWithTemplates(): ValidationTemplateRegistry {
    const registry = new ValidationTemplateRegistry();
    registerAllTemplates(registry);
    return registry;
}