/**
 * FallbackManager - Manages fallback strategies and default responses
 * 
 * This class is responsible for:
 * - Selecting appropriate fallback templates based on error patterns
 * - Managing pre-validated default responses
 * - Handling complete validation failure scenarios
 * - Coordinating template escalation strategies
 */

import {
    ValidationTemplate,
    ValidationContext,
    ValidationError,
    PersonaType,
    FallbackStrategy,
    FallbackStrategyType,
    ValidationErrorType
} from '../../types/validation';

export interface FallbackResult {
    success: boolean;
    fallbackType: FallbackStrategyType;
    templateId?: string;
    defaultResponse?: any;
    reason: string;
    metadata: {
        originalTemplateId: string;
        fallbackAttempt: number;
        errorCount: number;
        timestamp: number;
    };
}

export interface DefaultPersonaResponse {
    id: string;
    personaType: PersonaType;
    response: any;
    isValidated: boolean;
    createdAt: number;
    lastUsed: number;
    usageCount: number;
}

export class FallbackManager {
    private defaultResponses: Map<PersonaType, DefaultPersonaResponse[]> = new Map();
    private templateEscalationMap: Map<PersonaType, PersonaType[]> = new Map([
        [PersonaType.B2B, [PersonaType.STANDARD, PersonaType.SIMPLE]],
        [PersonaType.STANDARD, [PersonaType.SIMPLE]],
        [PersonaType.SIMPLE, []] // No further escalation possible
    ]);

    constructor() {
        this.initializeDefaultResponses();
    }

    /**
     * Executes fallback strategy based on validation errors and context
     */
    async executeFallback(
        originalTemplateId: string,
        errors: ValidationError[],
        context: ValidationContext,
        fallbackStrategy: FallbackStrategy,
        attempt: number = 1
    ): Promise<FallbackResult> {
        const startTime = Date.now();

        try {
            switch (fallbackStrategy.type) {
                case FallbackStrategyType.SIMPLE_TEMPLATE:
                    return await this.executeTemplateEscalation(
                        originalTemplateId,
                        errors,
                        context,
                        fallbackStrategy,
                        attempt
                    );

                case FallbackStrategyType.DEFAULT_RESPONSE:
                    return await this.executeDefaultResponse(
                        originalTemplateId,
                        context,
                        attempt
                    );

                case FallbackStrategyType.REGENERATE:
                    return await this.executeRegenerationFallback(
                        originalTemplateId,
                        errors,
                        context,
                        fallbackStrategy,
                        attempt
                    );

                case FallbackStrategyType.NONE:
                    return this.executeNoFallback(originalTemplateId, attempt);

                default:
                    return this.executeDefaultResponse(originalTemplateId, context, attempt);
            }
        } catch (error) {
            return {
                success: false,
                fallbackType: FallbackStrategyType.NONE,
                reason: `Fallback execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                metadata: {
                    originalTemplateId,
                    fallbackAttempt: attempt,
                    errorCount: errors.length,
                    timestamp: startTime
                }
            };
        }
    }

    /**
     * Selects the most appropriate fallback template based on current persona type and errors
     */
    selectFallbackTemplate(
        currentPersonaType: PersonaType,
        errors: ValidationError[],
        attempt: number
    ): PersonaType | null {
        const escalationOptions = this.templateEscalationMap.get(currentPersonaType) || [];
        
        if (escalationOptions.length === 0) {
            return null; // No escalation possible
        }

        // Analyze error severity to determine escalation level
        const criticalErrors = errors.filter(e => 
            e.type === ValidationErrorType.STRUCTURE_INVALID ||
            e.type === ValidationErrorType.REQUIRED_FIELD_MISSING ||
            e.type === ValidationErrorType.BUSINESS_RULE_VIOLATION
        );

        const formatErrors = errors.filter(e => 
            e.type === ValidationErrorType.FORMAT_INVALID ||
            e.type === ValidationErrorType.TYPE_MISMATCH
        );

        // Determine escalation level based on error patterns and attempt number
        let escalationLevel = 0;

        if (criticalErrors.length >= 3 || attempt >= 3) {
            // Severe issues - escalate to simplest template
            escalationLevel = escalationOptions.length - 1;
        } else if (criticalErrors.length >= 1 || formatErrors.length >= 2 || attempt >= 2) {
            // Moderate issues - escalate one level
            escalationLevel = Math.min(0, escalationOptions.length - 1);
        }

        return escalationOptions[escalationLevel] || null;
    }

    /**
     * Registers a pre-validated default response for a persona type
     */
    registerDefaultResponse(personaType: PersonaType, response: any): void {
        if (!this.defaultResponses.has(personaType)) {
            this.defaultResponses.set(personaType, []);
        }

        const now = Date.now();
        const defaultResponse: DefaultPersonaResponse = {
            id: `default-${personaType}-${now}`,
            personaType,
            response,
            isValidated: true,
            createdAt: now,
            lastUsed: 0,
            usageCount: 0
        };

        this.defaultResponses.get(personaType)!.push(defaultResponse);
    }

    /**
     * Gets a default response for a persona type
     */
    getDefaultResponse(personaType: PersonaType): DefaultPersonaResponse | null {
        const responses = this.defaultResponses.get(personaType);
        if (!responses || responses.length === 0) {
            return null;
        }

        // Select least recently used response to distribute usage
        // Priority: unused responses (usageCount = 0) first, then by lastUsed time, then by creation time
        const response = responses.reduce((lru, current) => {
            // Prioritize unused responses
            if (current.usageCount === 0 && lru.usageCount > 0) {
                return current;
            } else if (lru.usageCount === 0 && current.usageCount > 0) {
                return lru;
            }
            
            // If both have same usage status, compare by lastUsed
            if (current.lastUsed < lru.lastUsed) {
                return current;
            } else if (current.lastUsed === lru.lastUsed) {
                // If same lastUsed time, prefer the one with higher createdAt (more recently added)
                return current.createdAt > lru.createdAt ? current : lru;
            } else {
                return lru;
            }
        });

        // Create a copy to avoid mutating the original
        const responseCopy = { ...response };
        
        // Update usage statistics on the original
        response.lastUsed = Date.now();
        response.usageCount++;

        // Return the copy with updated stats
        responseCopy.lastUsed = response.lastUsed;
        responseCopy.usageCount = response.usageCount;

        return responseCopy;
    }

    /**
     * Validates if a fallback strategy is applicable given the current context
     */
    isFallbackApplicable(
        strategy: FallbackStrategy,
        errors: ValidationError[],
        context: ValidationContext,
        attempt: number
    ): boolean {
        // Check if we've exceeded max retries for regeneration strategies
        if (strategy.type === FallbackStrategyType.REGENERATE && attempt >= strategy.maxRetries) {
            return false;
        }

        // Check if template escalation is possible
        if (strategy.type === FallbackStrategyType.SIMPLE_TEMPLATE) {
            const currentPersonaType = context.originalRequest.personaType;
            const fallbackTemplate = this.selectFallbackTemplate(currentPersonaType, errors, attempt);
            return fallbackTemplate !== null;
        }

        // Check if default responses are available
        if (strategy.type === FallbackStrategyType.DEFAULT_RESPONSE) {
            const defaultResponse = this.getDefaultResponse(context.originalRequest.personaType);
            return defaultResponse !== null;
        }

        return true;
    }

    /**
     * Gets fallback statistics for monitoring
     */
    getFallbackStatistics(): {
        defaultResponseUsage: Map<PersonaType, { totalUsage: number; averageUsage: number }>;
        escalationPatterns: Map<string, number>;
    } {
        const defaultResponseUsage = new Map<PersonaType, { totalUsage: number; averageUsage: number }>();
        
        for (const [personaType, responses] of this.defaultResponses.entries()) {
            const totalUsage = responses.reduce((sum, response) => sum + response.usageCount, 0);
            const averageUsage = responses.length > 0 ? totalUsage / responses.length : 0;
            
            defaultResponseUsage.set(personaType, { totalUsage, averageUsage });
        }

        // For escalation patterns, we'd need to track this in a real implementation
        const escalationPatterns = new Map<string, number>();

        return {
            defaultResponseUsage,
            escalationPatterns
        };
    }

    // Private helper methods

    private async executeTemplateEscalation(
        originalTemplateId: string,
        errors: ValidationError[],
        context: ValidationContext,
        strategy: FallbackStrategy,
        attempt: number
    ): Promise<FallbackResult> {
        const currentPersonaType = context.originalRequest.personaType;
        const fallbackPersonaType = this.selectFallbackTemplate(currentPersonaType, errors, attempt);

        if (!fallbackPersonaType) {
            // No escalation possible, try default response
            return this.executeDefaultResponse(originalTemplateId, context, attempt);
        }

        const fallbackTemplateId = strategy.fallbackTemplate || `${fallbackPersonaType}-persona-v1`;

        return {
            success: true,
            fallbackType: FallbackStrategyType.SIMPLE_TEMPLATE,
            templateId: fallbackTemplateId,
            reason: `Escalated from ${currentPersonaType} to ${fallbackPersonaType} due to validation errors`,
            metadata: {
                originalTemplateId,
                fallbackAttempt: attempt,
                errorCount: errors.length,
                timestamp: Date.now()
            }
        };
    }

    private async executeDefaultResponse(
        originalTemplateId: string,
        context: ValidationContext,
        attempt: number
    ): Promise<FallbackResult> {
        const personaType = context.originalRequest.personaType;
        const defaultResponse = this.getDefaultResponse(personaType);

        if (!defaultResponse) {
            return {
                success: false,
                fallbackType: FallbackStrategyType.DEFAULT_RESPONSE,
                reason: `No default response available for persona type ${personaType}`,
                metadata: {
                    originalTemplateId,
                    fallbackAttempt: attempt,
                    errorCount: 0,
                    timestamp: Date.now()
                }
            };
        }

        return {
            success: true,
            fallbackType: FallbackStrategyType.DEFAULT_RESPONSE,
            defaultResponse: defaultResponse.response,
            reason: `Using pre-validated default response for ${personaType}`,
            metadata: {
                originalTemplateId,
                fallbackAttempt: attempt,
                errorCount: 0,
                timestamp: Date.now()
            }
        };
    }

    private async executeRegenerationFallback(
        originalTemplateId: string,
        errors: ValidationError[],
        context: ValidationContext,
        strategy: FallbackStrategy,
        attempt: number
    ): Promise<FallbackResult> {
        if (attempt >= strategy.maxRetries) {
            // Max retries reached, escalate to template fallback or default response
            if (strategy.fallbackTemplate) {
                return this.executeTemplateEscalation(originalTemplateId, errors, context, strategy, attempt);
            } else {
                return this.executeDefaultResponse(originalTemplateId, context, attempt);
            }
        }

        return {
            success: true,
            fallbackType: FallbackStrategyType.REGENERATE,
            reason: `Regeneration fallback - attempt ${attempt} of ${strategy.maxRetries}`,
            metadata: {
                originalTemplateId,
                fallbackAttempt: attempt,
                errorCount: errors.length,
                timestamp: Date.now()
            }
        };
    }

    private executeNoFallback(
        originalTemplateId: string,
        attempt: number
    ): FallbackResult {
        return {
            success: false,
            fallbackType: FallbackStrategyType.NONE,
            reason: 'No fallback strategy configured',
            metadata: {
                originalTemplateId,
                fallbackAttempt: attempt,
                errorCount: 0,
                timestamp: Date.now()
            }
        };
    }

    private initializeDefaultResponses(): void {
        // Initialize with basic default responses for each persona type
        this.registerDefaultResponse(PersonaType.SIMPLE, {
            id: "default-simple-persona",
            name: "Default User",
            age: 30,
            location: "United States",
            interests: ["technology", "entertainment"],
            demographics: {
                age: 30,
                location: "United States",
                income: "middle"
            }
        });

        this.registerDefaultResponse(PersonaType.STANDARD, {
            id: "default-standard-persona",
            name: "Default User",
            age: 32,
            occupation: "Professional",
            location: "United States",
            interests: ["technology", "business", "lifestyle"],
            demographics: {
                age: 32,
                location: "United States",
                income: "middle",
                occupation: "Professional"
            },
            culturalData: {
                demographics: {
                    age: 32,
                    location: "United States"
                },
                culturalValues: {
                    generation: "Millennial",
                    culturalBackground: "American"
                },
                consumptionPatterns: {
                    spendingHabits: "moderate",
                    preferredChannels: ["online", "mobile"]
                }
            }
        });

        this.registerDefaultResponse(PersonaType.B2B, {
            id: "default-b2b-persona",
            name: "Default Business User",
            age: 35,
            occupation: "Manager",
            company: "Technology Company",
            industry: "Technology",
            role: "Decision Maker",
            location: "United States",
            demographics: {
                age: 35,
                location: "United States",
                income: "upper-middle",
                occupation: "Manager"
            },
            professionalProfile: {
                company: "Technology Company",
                industry: "Technology",
                role: "Decision Maker",
                experience: "5-10 years"
            },
            businessContext: {
                companySize: "Medium",
                decisionMakingRole: "Influencer",
                budget: "moderate"
            }
        });
    }
}