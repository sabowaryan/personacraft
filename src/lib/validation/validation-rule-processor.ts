/**
 * ValidationRuleProcessor - Processes individual validation rules
 * 
 * This class provides:
 * - Execution of individual validation rules
 * - Parallel processing for independent rules
 * - Priority and dependency management
 */

import {
    ValidationRule,
    ValidationResult,
    ValidationContext,
    ValidationError,
    ValidationWarning,
    ValidationSeverity,
    ValidationErrorType,
    ValidationMetadata
} from '../../types/validation';

export interface RuleExecutionResult {
    ruleId: string;
    result: ValidationResult;
    executionTime: number;
    success: boolean;
    error?: Error;
}

export interface RuleExecutionPlan {
    parallelGroups: ValidationRule[][];
    dependencies: Map<string, string[]>;
    executionOrder: string[];
}

export class ValidationRuleProcessor {
    private readonly maxConcurrentRules: number;
    private readonly defaultTimeout: number;

    constructor(config?: {
        maxConcurrentRules?: number;
        defaultTimeout?: number;
    }) {
        this.maxConcurrentRules = config?.maxConcurrentRules || 10;
        this.defaultTimeout = config?.defaultTimeout || 10000; // 10 seconds - augmenté pour éviter les timeouts
    }

    /**
     * Process all validation rules with parallel execution where possible
     */
    async processRules(
        rules: ValidationRule[],
        response: any,
        context: ValidationContext
    ): Promise<{
        results: RuleExecutionResult[];
        aggregatedResult: ValidationResult;
        executionPlan: RuleExecutionPlan;
    }> {
        const startTime = Date.now();

        // Create execution plan
        const executionPlan = this.createExecutionPlan(rules);

        // Execute rules according to the plan
        const results = await this.executeRulesWithPlan(
            executionPlan,
            response,
            context
        );

        // Aggregate results
        const aggregatedResult = this.aggregateResults(results, startTime);

        return {
            results,
            aggregatedResult,
            executionPlan
        };
    }

    /**
     * Process a single validation rule
     */
    async processRule(
        rule: ValidationRule,
        response: any,
        context: ValidationContext
    ): Promise<RuleExecutionResult> {
        const startTime = Date.now();

        try {
            // Get field value
            const fieldValue = this.getFieldValue(response, rule.field);

            // Create timeout promise
            const timeoutMs = rule.timeout || this.defaultTimeout;
            const timeoutPromise = new Promise<ValidationResult>((_, reject) => {
                setTimeout(() => {
                    reject(new Error(`Rule ${rule.id} timed out after ${timeoutMs}ms`));
                }, timeoutMs);
            });

            // Execute rule with timeout
            const validationPromise = rule.validator(fieldValue, context);
            const result = await Promise.race([validationPromise, timeoutPromise]);

            const executionTime = Date.now() - startTime;

            return {
                ruleId: rule.id,
                result,
                executionTime,
                success: true
            };

        } catch (error) {
            const executionTime = Date.now() - startTime;
            const errorResult = this.createErrorResult(rule, error as Error);

            return {
                ruleId: rule.id,
                result: errorResult,
                executionTime,
                success: false,
                error: error as Error
            };
        }
    }

    /**
     * Create execution plan with parallel groups and dependencies
     */
    private createExecutionPlan(rules: ValidationRule[]): RuleExecutionPlan {
        // Build dependency map
        const dependencies = new Map<string, string[]>();
        const ruleMap = new Map<string, ValidationRule>();

        rules.forEach(rule => {
            ruleMap.set(rule.id, rule);
            dependencies.set(rule.id, rule.dependencies || []);
        });

        // Create execution groups
        const parallelGroups: ValidationRule[][] = [];
        const processed = new Set<string>();
        const executionOrder: string[] = [];

        while (processed.size < rules.length) {
            const currentGroup: ValidationRule[] = [];

            // Find rules that can be executed in parallel
            for (const rule of rules) {
                if (processed.has(rule.id)) {
                    continue;
                }

                // Check if all dependencies are satisfied
                const ruleDeps = dependencies.get(rule.id) || [];
                const canExecute = ruleDeps.every(dep => processed.has(dep));

                if (canExecute) {
                    currentGroup.push(rule);
                }
            }

            if (currentGroup.length === 0) {
                // Circular dependency or other issue
                const remaining = rules.filter(rule => !processed.has(rule.id));
                console.warn('Circular dependency detected or unresolvable dependencies:', 
                    remaining.map(r => r.id));
                
                // Add remaining rules to break the deadlock
                currentGroup.push(...remaining);
            }

            // Sort current group by priority
            currentGroup.sort((a, b) => (b.priority || 0) - (a.priority || 0));

            parallelGroups.push(currentGroup);
            currentGroup.forEach(rule => {
                processed.add(rule.id);
                executionOrder.push(rule.id);
            });
        }

        return {
            parallelGroups,
            dependencies,
            executionOrder
        };
    }

    /**
     * Execute rules according to the execution plan
     */
    private async executeRulesWithPlan(
        plan: RuleExecutionPlan,
        response: any,
        context: ValidationContext
    ): Promise<RuleExecutionResult[]> {
        const allResults: RuleExecutionResult[] = [];

        // Execute each parallel group sequentially
        for (const group of plan.parallelGroups) {
            // Limit concurrent executions within the group
            const groupResults = await this.executeRulesInParallel(
                group,
                response,
                context
            );

            allResults.push(...groupResults);

            // Check if we should stop processing due to critical errors
            const criticalErrors = groupResults.filter(result => 
                !result.success || 
                result.result.errors.some(error => 
                    error.severity === ValidationSeverity.ERROR &&
                    error.type === ValidationErrorType.STRUCTURE_INVALID
                )
            );

            if (criticalErrors.length > 0) {
                console.log('Critical errors detected, stopping rule processing');
                break;
            }
        }

        return allResults;
    }

    /**
     * Execute rules in parallel with concurrency limit
     */
    private async executeRulesInParallel(
        rules: ValidationRule[],
        response: any,
        context: ValidationContext
    ): Promise<RuleExecutionResult[]> {
        const results: RuleExecutionResult[] = [];
        
        // Process rules in batches to respect concurrency limit
        for (let i = 0; i < rules.length; i += this.maxConcurrentRules) {
            const batch = rules.slice(i, i + this.maxConcurrentRules);
            
            const batchPromises = batch.map(rule => 
                this.processRule(rule, response, context)
            );

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
        }

        return results;
    }

    /**
     * Aggregate individual rule results into a single validation result
     */
    private aggregateResults(
        results: RuleExecutionResult[],
        startTime: number
    ): ValidationResult {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];
        let totalScore = 0;
        let validResults = 0;

        results.forEach(result => {
            errors.push(...result.result.errors);
            warnings.push(...result.result.warnings);
            
            if (result.success) {
                totalScore += result.result.score;
                validResults++;
            }
        });

        // Calculate average score
        const averageScore = validResults > 0 ? Math.round(totalScore / validResults) : 0;

        // Create metadata
        const metadata: ValidationMetadata = {
            templateId: '', // Will be set by the calling engine
            templateVersion: '', // Will be set by the calling engine
            validationTime: Date.now() - startTime,
            rulesExecuted: results.filter(r => r.success).length,
            rulesSkipped: results.length - results.filter(r => r.success).length,
            timestamp: Date.now()
        };

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            score: averageScore,
            metadata
        };
    }

    /**
     * Get field value from response using dot notation
     */
    private getFieldValue(response: any, fieldPath: string): any {
        if (fieldPath === 'root') {
            return response;
        }

        const parts = fieldPath.split('.');
        let current = response;

        for (const part of parts) {
            if (current === null || current === undefined) {
                return undefined;
            }

            // Handle array indices
            if (part.includes('[') && part.includes(']')) {
                const [arrayField, indexStr] = part.split('[');
                const index = parseInt(indexStr.replace(']', ''), 10);
                
                current = current[arrayField];
                if (Array.isArray(current) && index >= 0 && index < current.length) {
                    current = current[index];
                } else {
                    return undefined;
                }
            } else {
                current = current[part];
            }
        }

        return current;
    }

    /**
     * Create error result for rule execution failures
     */
    private createErrorResult(rule: ValidationRule, error: Error): ValidationResult {
        return {
            isValid: false,
            errors: [{
                id: `${rule.id}-execution-error`,
                type: ValidationErrorType.VALIDATION_TIMEOUT,
                field: rule.field,
                message: `Rule execution failed: ${error.message}`,
                severity: ValidationSeverity.ERROR,
                context: {
                    ruleId: rule.id,
                    errorType: error.name,
                    stack: error.stack
                }
            }],
            warnings: [],
            score: 0,
            metadata: {
                templateId: '',
                templateVersion: '',
                validationTime: 0,
                rulesExecuted: 0,
                rulesSkipped: 1,
                timestamp: Date.now()
            }
        };
    }

    /**
     * Get execution statistics
     */
    getExecutionStats(results: RuleExecutionResult[]): {
        totalRules: number;
        successfulRules: number;
        failedRules: number;
        averageExecutionTime: number;
        totalExecutionTime: number;
        slowestRule: { id: string; time: number } | null;
        fastestRule: { id: string; time: number } | null;
    } {
        const totalRules = results.length;
        const successfulRules = results.filter(r => r.success).length;
        const failedRules = totalRules - successfulRules;
        
        const executionTimes = results.map(r => r.executionTime);
        const totalExecutionTime = executionTimes.reduce((sum, time) => sum + time, 0);
        const averageExecutionTime = totalRules > 0 ? totalExecutionTime / totalRules : 0;

        let slowestRule: { id: string; time: number } | null = null;
        let fastestRule: { id: string; time: number } | null = null;

        if (results.length > 0) {
            const sortedByTime = [...results].sort((a, b) => b.executionTime - a.executionTime);
            slowestRule = { id: sortedByTime[0].ruleId, time: sortedByTime[0].executionTime };
            fastestRule = { id: sortedByTime[sortedByTime.length - 1].ruleId, time: sortedByTime[sortedByTime.length - 1].executionTime };
        }

        return {
            totalRules,
            successfulRules,
            failedRules,
            averageExecutionTime: Math.round(averageExecutionTime),
            totalExecutionTime,
            slowestRule,
            fastestRule
        };
    }

    /**
     * Validate rule dependencies
     */
    validateRuleDependencies(rules: ValidationRule[]): {
        isValid: boolean;
        circularDependencies: string[][];
        missingDependencies: Array<{ ruleId: string; missingDeps: string[] }>;
    } {
        const ruleIds = new Set(rules.map(r => r.id));
        const missingDependencies: Array<{ ruleId: string; missingDeps: string[] }> = [];
        const circularDependencies: string[][] = [];

        // Check for missing dependencies
        rules.forEach(rule => {
            if (rule.dependencies) {
                const missing = rule.dependencies.filter(dep => !ruleIds.has(dep));
                if (missing.length > 0) {
                    missingDependencies.push({ ruleId: rule.id, missingDeps: missing });
                }
            }
        });

        // Check for circular dependencies using DFS
        const visited = new Set<string>();
        const recursionStack = new Set<string>();
        const dependencyMap = new Map<string, string[]>();

        rules.forEach(rule => {
            dependencyMap.set(rule.id, rule.dependencies || []);
        });

        const detectCycle = (ruleId: string, path: string[]): boolean => {
            if (recursionStack.has(ruleId)) {
                const cycleStart = path.indexOf(ruleId);
                circularDependencies.push(path.slice(cycleStart).concat(ruleId));
                return true;
            }

            if (visited.has(ruleId)) {
                return false;
            }

            visited.add(ruleId);
            recursionStack.add(ruleId);

            const dependencies = dependencyMap.get(ruleId) || [];
            for (const dep of dependencies) {
                if (detectCycle(dep, [...path, ruleId])) {
                    return true;
                }
            }

            recursionStack.delete(ruleId);
            return false;
        };

        rules.forEach(rule => {
            if (!visited.has(rule.id)) {
                detectCycle(rule.id, []);
            }
        });

        return {
            isValid: missingDependencies.length === 0 && circularDependencies.length === 0,
            circularDependencies,
            missingDependencies
        };
    }
}