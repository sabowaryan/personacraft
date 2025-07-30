/**
 * ValidationTemplateEngine - Main validation engine for LLM responses
 * 
 * This class is responsible for:
 * - Validating LLM responses against templates
 * - Managing template selection based on persona type
 * - Coordinating the validation process
 * - Integrating with feature flags for progressive deployment
 */

import {
    ValidationTemplate,
    ValidationResult,
    ValidationContext,
    ValidationError,
    ValidationWarning,
    ValidationMetadata,
    PersonaType,
    ValidationErrorType,
    ValidationSeverity
} from '../../types/validation';
import { ValidationTemplateRegistry } from './template-registry';
import { ValidationRuleProcessor } from './validation-rule-processor';
import { ValidationFeatureFlagsManager } from '@/lib/config/feature-flags';
import { ValidationFallbackSystem, createFallbackSystem } from './fallback-system';
import { validationTracer } from './debug/validation-tracer';
import { validationLogger } from './debug/validation-logger';
import { createFailureAnalyzer } from './debug/failure-analyzer';
import { QlooFirstValidator, QlooFirstValidatorImpl } from './qloo-first-validator';
import { SchemaRepairEngine, SchemaRepairEngineImpl } from './schema-repair-engine';

export interface ValidationEngine {
    validateResponse(
        response: any,
        templateId: string,
        context: ValidationContext
    ): Promise<ValidationResult>;

    registerTemplate(template: ValidationTemplate): void;
    getTemplate(id: string): ValidationTemplate | null;
    updateTemplate(id: string, template: ValidationTemplate): void;
    getTemplateByPersonaType(personaType: PersonaType): ValidationTemplate | null;
}

export class ValidationTemplateEngine implements ValidationEngine {
    private registry: ValidationTemplateRegistry;
    private ruleProcessor: ValidationRuleProcessor;
    private featureFlags: ValidationFeatureFlagsManager;
    private fallbackSystem: ValidationFallbackSystem;
    private failureAnalyzer = createFailureAnalyzer(validationTracer, validationLogger);
    private qlooFirstValidator: QlooFirstValidator;
    private schemaRepairEngine: SchemaRepairEngine;

    constructor(
        registry?: ValidationTemplateRegistry,
        ruleProcessor?: ValidationRuleProcessor,
        featureFlags?: ValidationFeatureFlagsManager,
        qlooFirstValidator?: QlooFirstValidator,
        schemaRepairEngine?: SchemaRepairEngine
    ) {
        this.registry = registry || new ValidationTemplateRegistry();
        this.ruleProcessor = ruleProcessor || new ValidationRuleProcessor();
        this.featureFlags = featureFlags || new ValidationFeatureFlagsManager();
        this.fallbackSystem = createFallbackSystem(this.featureFlags);
        this.qlooFirstValidator = qlooFirstValidator || new QlooFirstValidatorImpl();
        this.schemaRepairEngine = schemaRepairEngine || new SchemaRepairEngineImpl();
    }

    /**
     * Main validation method that validates a response against a template
     * Integrates with feature flags for progressive deployment
     */
    async validateResponse(
        response: any,
        templateId: string,
        context: ValidationContext
    ): Promise<ValidationResult> {
        const startTime = Date.now();

        try {
            // Check if validation is enabled via feature flags
            if (!this.featureFlags.isValidationEnabled()) {
                if (this.featureFlags.isDebugModeEnabled()) {
                    console.log('🚫 Validation disabled via feature flags');
                }
                return this.fallbackSystem.createDisabledValidationResult(
                    [response],
                    'Validation disabled via feature flags'
                );
            }

            // Get the template
            const template = this.getTemplate(templateId);
            if (!template) {
                return this.createErrorResult(
                    templateId,
                    ValidationErrorType.TEMPLATE_NOT_FOUND,
                    `Template with id ${templateId} not found`,
                    startTime
                );
            }

            // Check if validation is enabled for this persona type
            if (!this.featureFlags.isPersonaValidationEnabled(template.personaType)) {
                if (this.featureFlags.isDebugModeEnabled()) {
                    console.log(`🚫 Validation disabled for ${template.personaType} personas`);
                }
                return this.fallbackSystem.createDisabledValidationResult(
                    [response],
                    `Validation disabled for ${template.personaType} personas`
                );
            }

            // Validate that the template is active
            if (!template.metadata.isActive) {
                return this.createErrorResult(
                    templateId,
                    ValidationErrorType.TEMPLATE_NOT_FOUND,
                    `Template ${templateId} is not active`,
                    startTime
                );
            }

            // Filter rules based on feature flags
            const enabledRules = this.filterRulesByFeatureFlags(template.rules);
            
            if (enabledRules.length === 0) {
                if (this.featureFlags.isDebugModeEnabled()) {
                    console.log('🚫 All validation rules disabled via feature flags');
                }
                return this.fallbackSystem.createDisabledValidationResult(
                    [response],
                    'All validation rules disabled via feature flags'
                );
            }

            if (this.featureFlags.isDebugModeEnabled()) {
                console.log(`🔍 Running validation with ${enabledRules.length}/${template.rules.length} rules enabled`);
            }

            // Use the rule processor to execute validation rules
            const { aggregatedResult } = await this.ruleProcessor.processRules(
                enabledRules,
                response,
                context
            );

            // Update metadata with template information and feature flag status
            aggregatedResult.metadata.templateId = template.id;
            aggregatedResult.metadata.templateVersion = template.version;
            aggregatedResult.metadata.featureFlagsUsed = {
                validationEnabled: this.featureFlags.isValidationEnabled(),
                structureValidation: this.featureFlags.isValidationTypeEnabled('structure'),
                contentValidation: this.featureFlags.isValidationTypeEnabled('content'),
                businessRuleValidation: this.featureFlags.isValidationTypeEnabled('business'),
                formatValidation: this.featureFlags.isValidationTypeEnabled('format'),
                rulesFiltered: template.rules.length - enabledRules.length
            };

            // If validation fails, attempt repair or fallback using QlooFirstValidator and SchemaRepairEngine
            if (!aggregatedResult.isValid) {
                if (this.featureFlags.isValidationTypeEnabled('structure')) {
                    const repairedJson = this.schemaRepairEngine.repairJsonStructure(response);
                    const repairedPersona = this.schemaRepairEngine.fillMissingFields(JSON.parse(repairedJson), context);
                    // Re-validate after repair, or integrate repair into the validation process
                    // For now, just logging the repair attempt
                    console.log('Attempted schema repair:', repairedPersona);
                }
                // Apply intelligent fallback if repair is not sufficient or not applicable
                const fallbackResult = this.qlooFirstValidator.applyIntelligentFallback(response, context);
                console.log('Applied intelligent fallback:', fallbackResult);
            }

            return aggregatedResult;

        } catch (error) {
            return this.createErrorResult(
                templateId,
                ValidationErrorType.VALIDATION_TIMEOUT,
                `Validation failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                startTime
            );
        }
    }

    /**
     * Register a new validation template
     */
    registerTemplate(template: ValidationTemplate): void {
        this.registry.register(template);
    }

    /**
     * Get a template by ID
     */
    getTemplate(id: string): ValidationTemplate | null {
        return this.registry.get(id);
    }

    /**
     * Update an existing template
     */
    updateTemplate(id: string, template: ValidationTemplate): void {
        this.registry.update(id, template);
    }

    /**
     * Get template by persona type (automatic selection)
     */
    getTemplateByPersonaType(personaType: PersonaType): ValidationTemplate | null {
        return this.registry.getLatestByPersonaType(personaType);
    }

    /**
     * Get all registered templates
     */
    getAllTemplates(): ValidationTemplate[] {
        return this.registry.list();
    }

    /**
     * Get templates by persona type
     */
    getTemplatesByPersonaType(personaType: PersonaType): ValidationTemplate[] {
        return this.registry.getByPersonaType(personaType);
    }

    /**
     * Remove a template
     */
    removeTemplate(id: string): boolean {
        return this.registry.delete(id);
    }

    /**
     * Get registry instance for advanced operations
     */
    getRegistry(): ValidationTemplateRegistry {
        return this.registry;
    }

    /**
     * Get rule processor instance for advanced operations
     */
    getRuleProcessor(): ValidationRuleProcessor {
        return this.ruleProcessor;
    }

    /**
     * Filter validation rules based on current feature flags
     */
    private filterRulesByFeatureFlags(rules: any[]): any[] {
        return rules.filter(rule => {
            // Check if the rule type is enabled via feature flags
            switch (rule.category) {
                case 'structure':
                    return this.featureFlags.isValidationTypeEnabled('structure');
                case 'content':
                    return this.featureFlags.isValidationTypeEnabled('content');
                case 'business':
                    return this.featureFlags.isValidationTypeEnabled('business');
                case 'format':
                    return this.featureFlags.isValidationTypeEnabled('format');
                default:
                    // If no category specified, include the rule by default
                    return true;
            }
        });
    }

    /**
     * Create an error result for system-level errors
     */
    private createErrorResult(
        templateId: string,
        errorType: ValidationErrorType,
        message: string,
        startTime: number
    ): ValidationResult {
        return {
            isValid: false,
            errors: [{
                id: 'system-error',
                type: errorType,
                field: 'system',
                message,
                severity: ValidationSeverity.ERROR
            }],
            warnings: [],
            score: 0,
            metadata: {
                templateId,
                templateVersion: 'unknown',
                validationTime: Date.now() - startTime,
                rulesExecuted: 0,
                rulesSkipped: 0,
                timestamp: Date.now()
            }
        };
    }


}

