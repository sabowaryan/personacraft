/**
 * ValidationRuleProcessor - Processeur qui exécute les règles de validation individuelles
 * 
 * Ce service gère l'exécution des règles de validation avec support pour:
 * - Parallélisation des règles indépendantes
 * - Gestion des priorités et dépendances entre règles
 * - Timeout et gestion d'erreurs pour chaque règle
 */

import {
    ValidationRule,
    ValidationResult,
    ValidationContext,
    ValidationError,
    ValidationWarning,
    ValidationErrorType,
    ValidationSeverity,
    ValidationMetadata
} from '../../types/validation';

export interface RuleExecutionResult {
    ruleId: string;
    success: boolean;
    result?: ValidationResult;
    error?: Error;
    executionTime: number;
    skipped: boolean;
    skipReason?: string;
}

export interface RuleExecutionPlan {
    parallelGroups: ValidationRule[][];
    dependencyMap: Map<string, string[]>;
    priorityOrder: ValidationRule[];
}

export interface ProcessorConfig {
    maxParallelRules: number;
    defaultTimeout: number;
    enableParallelization: boolean;
    skipDependentOnFailure: boolean;
    collectDetailedMetrics: boolean;
}

export interface ProcessorMetrics {
    totalRulesExecuted: number;
    totalRulesSkipped: number;
    totalExecutionTime: number;
    parallelGroupsExecuted: number;
    averageRuleExecutionTime: number;
    ruleExecutionTimes: Map<string, number>;
    failedRules: string[];
    skippedRules: string[];
}

/**
 * Processeur principal pour l'exécution des règles de validation
 */
export class ValidationRuleProcessor {
    private config: ProcessorConfig;
    private metrics: ProcessorMetrics;

    constructor(config: Partial<ProcessorConfig> = {}) {
        this.config = {
            maxParallelRules: 10,
            defaultTimeout: 5000, // 5 secondes
            enableParallelization: true,
            skipDependentOnFailure: true,
            collectDetailedMetrics: true,
            ...config
        };

        this.metrics = {
            totalRulesExecuted: 0,
            totalRulesSkipped: 0,
            totalExecutionTime: 0,
            parallelGroupsExecuted: 0,
            averageRuleExecutionTime: 0,
            ruleExecutionTimes: new Map(),
            failedRules: [],
            skippedRules: []
        };
        this.resetMetrics();
    }

    /**
     * Exécute toutes les règles de validation selon leur plan d'exécution
     */
    async processRules(
        rules: ValidationRule[],
        data: any,
        context: ValidationContext
    ): Promise<ValidationResult> {
        const startTime = Date.now();
        this.resetMetrics();

        try {
            // Créer le plan d'exécution
            const executionPlan = this.createExecutionPlan(rules);

            // Exécuter les règles selon le plan
            const ruleResults = await this.executeRulesWithPlan(
                executionPlan,
                data,
                context
            );

            // Agréger les résultats
            const aggregatedResult = this.aggregateResults(
                ruleResults,
                startTime,
                context
            );

            // Mettre à jour les métriques
            this.updateMetrics(ruleResults, Date.now() - startTime);

            return aggregatedResult;

        } catch (error) {
            // En cas d'erreur critique, retourner un résultat d'échec
            return this.createFailureResult(
                error as Error,
                startTime,
                context
            );
        }
    }

    /**
     * Exécute une règle individuelle avec timeout et gestion d'erreurs
     */
    async executeRule(
        rule: ValidationRule,
        data: any,
        context: ValidationContext
    ): Promise<RuleExecutionResult> {
        const startTime = Date.now();
        const timeout = rule.timeout || this.config.defaultTimeout;

        try {
            // Créer une promesse avec timeout
            const validationPromise = Promise.resolve(
                rule.validator(data, context)
            );

            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => {
                    reject(new Error(`Rule '${rule.id}' timed out after ${timeout}ms`));
                }, timeout);
            });

            // Exécuter avec timeout
            const result = await Promise.race([
                validationPromise,
                timeoutPromise
            ]);

            const executionTime = Date.now() - startTime;

            return {
                ruleId: rule.id,
                success: true,
                result,
                executionTime,
                skipped: false
            };

        } catch (error) {
            const executionTime = Date.now() - startTime;

            return {
                ruleId: rule.id,
                success: false,
                error: error as Error,
                executionTime,
                skipped: false
            };
        }
    }

    /**
     * Crée un plan d'exécution optimisé pour les règles
     */
    createExecutionPlan(rules: ValidationRule[]): RuleExecutionPlan {
        // Trier par priorité (plus haute priorité = plus petit nombre)
        const sortedRules = [...rules].sort((a, b) => {
            const priorityA = a.priority || 100;
            const priorityB = b.priority || 100;
            return priorityA - priorityB;
        });

        // Construire la carte des dépendances
        const dependencyMap = new Map<string, string[]>();
        for (const rule of sortedRules) {
            dependencyMap.set(rule.id, rule.dependencies || []);
        }

        // Créer les groupes parallèles
        const parallelGroups = this.createParallelGroups(
            sortedRules,
            dependencyMap
        );

        return {
            parallelGroups,
            dependencyMap,
            priorityOrder: sortedRules
        };
    }

    /**
     * Récupère les métriques actuelles du processeur
     */
    getMetrics(): ProcessorMetrics {
        return { ...this.metrics };
    }

    /**
     * Réinitialise les métriques
     */
    resetMetrics(): void {
        this.metrics = {
            totalRulesExecuted: 0,
            totalRulesSkipped: 0,
            totalExecutionTime: 0,
            parallelGroupsExecuted: 0,
            averageRuleExecutionTime: 0,
            ruleExecutionTimes: new Map(),
            failedRules: [],
            skippedRules: []
        };
    }

    /**
     * Met à jour la configuration du processeur
     */
    updateConfig(newConfig: Partial<ProcessorConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * Récupère la configuration actuelle
     */
    getConfig(): ProcessorConfig {
        return { ...this.config };
    }

    // Méthodes privées

    /**
     * Exécute les règles selon le plan d'exécution
     */
    private async executeRulesWithPlan(
        plan: RuleExecutionPlan,
        data: any,
        context: ValidationContext
    ): Promise<RuleExecutionResult[]> {
        const allResults: RuleExecutionResult[] = [];
        const failedRules = new Set<string>();

        for (const group of plan.parallelGroups) {
            // Filtrer les règles dont les dépendances ont échoué
            const executableRules = group.filter(rule => {
                const dependencies = plan.dependencyMap.get(rule.id) || [];
                const hasFailedDependency = dependencies.some(dep =>
                    failedRules.has(dep)
                );

                if (hasFailedDependency && this.config.skipDependentOnFailure) {
                    return false;
                }

                return true;
            });

            // Exécuter les règles du groupe en parallèle ou séquentiellement
            let groupResults: RuleExecutionResult[];

            if (this.config.enableParallelization && executableRules.length > 1) {
                groupResults = await this.executeRulesInParallel(
                    executableRules,
                    data,
                    context
                );
            } else {
                groupResults = await this.executeRulesSequentially(
                    executableRules,
                    data,
                    context
                );
            }

            // Marquer les règles sautées
            const skippedRules = group.filter(rule =>
                !executableRules.includes(rule)
            );

            for (const rule of skippedRules) {
                groupResults.push({
                    ruleId: rule.id,
                    success: false,
                    executionTime: 0,
                    skipped: true,
                    skipReason: 'Dependency failed'
                });
            }

            // Ajouter les règles échouées à la liste
            for (const result of groupResults) {
                if (!result.success && !result.skipped) {
                    failedRules.add(result.ruleId);
                }
            }

            allResults.push(...groupResults);
            this.metrics.parallelGroupsExecuted++;
        }

        return allResults;
    }

    /**
     * Exécute les règles en parallèle
     */
    private async executeRulesInParallel(
        rules: ValidationRule[],
        data: any,
        context: ValidationContext
    ): Promise<RuleExecutionResult[]> {
        // Limiter le nombre de règles parallèles
        const chunks = this.chunkArray(rules, this.config.maxParallelRules);
        const allResults: RuleExecutionResult[] = [];

        for (const chunk of chunks) {
            const promises = chunk.map(rule =>
                this.executeRule(rule, data, context)
            );

            const chunkResults = await Promise.all(promises);
            allResults.push(...chunkResults);
        }

        return allResults;
    }

    /**
     * Exécute les règles séquentiellement
     */
    private async executeRulesSequentially(
        rules: ValidationRule[],
        data: any,
        context: ValidationContext
    ): Promise<RuleExecutionResult[]> {
        const results: RuleExecutionResult[] = [];

        for (const rule of rules) {
            const result = await this.executeRule(rule, data, context);
            results.push(result);
        }

        return results;
    }

    /**
     * Crée des groupes de règles qui peuvent être exécutées en parallèle
     */
    private createParallelGroups(
        rules: ValidationRule[],
        dependencyMap: Map<string, string[]>
    ): ValidationRule[][] {
        const groups: ValidationRule[][] = [];
        const processed = new Set<string>();
        const ruleMap = new Map(rules.map(rule => [rule.id, rule]));

        while (processed.size < rules.length) {
            const currentGroup: ValidationRule[] = [];

            for (const rule of rules) {
                if (processed.has(rule.id)) continue;

                const dependencies = dependencyMap.get(rule.id) || [];
                const allDependenciesMet = dependencies.every(dep =>
                    processed.has(dep)
                );

                if (allDependenciesMet) {
                    currentGroup.push(rule);
                }
            }

            if (currentGroup.length === 0) {
                // Détection de dépendance circulaire ou règle orpheline
                const remaining = rules.filter(rule => !processed.has(rule.id));
                console.warn('Circular dependency or orphaned rules detected:',
                    remaining.map(r => r.id));

                // Ajouter les règles restantes sans dépendances
                const independentRules = remaining.filter(rule => {
                    const deps = dependencyMap.get(rule.id) || [];
                    return deps.length === 0;
                });

                if (independentRules.length > 0) {
                    currentGroup.push(...independentRules);
                } else {
                    // Forcer l'ajout de la première règle restante
                    currentGroup.push(remaining[0]);
                }
            }

            // Marquer les règles comme traitées
            for (const rule of currentGroup) {
                processed.add(rule.id);
            }

            groups.push(currentGroup);
        }

        return groups;
    }

    /**
     * Agrège les résultats de toutes les règles
     */
    private aggregateResults(
        ruleResults: RuleExecutionResult[],
        startTime: number,
        context: ValidationContext
    ): ValidationResult {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];
        let totalScore = 0;
        let validRules = 0;

        for (const ruleResult of ruleResults) {
            if (ruleResult.skipped) continue;

            if (ruleResult.success && ruleResult.result) {
                const result = ruleResult.result;
                errors.push(...result.errors);
                warnings.push(...result.warnings);
                totalScore += result.score;
                validRules++;
            } else if (ruleResult.error) {
                // Créer une erreur de validation pour l'échec de la règle
                errors.push({
                    id: `rule-execution-${ruleResult.ruleId}`,
                    type: ValidationErrorType.VALIDATION_TIMEOUT,
                    field: 'rule-execution',
                    message: `Rule '${ruleResult.ruleId}' failed: ${ruleResult.error.message}`,
                    severity: ValidationSeverity.ERROR,
                    context: {
                        ruleId: ruleResult.ruleId,
                        executionTime: ruleResult.executionTime
                    }
                });
            }
        }

        const averageScore = validRules > 0 ? totalScore / validRules : 0;
        const isValid = errors.length === 0;

        const metadata: ValidationMetadata = {
            templateId: context.originalRequest.personaType,
            templateVersion: '1.0.0',
            validationTime: Date.now() - startTime,
            rulesExecuted: ruleResults.filter(r => !r.skipped).length,
            rulesSkipped: ruleResults.filter(r => r.skipped).length,
            timestamp: Date.now()
        };

        return {
            isValid,
            errors,
            warnings,
            score: averageScore,
            metadata
        };
    }

    /**
     * Crée un résultat d'échec en cas d'erreur critique
     */
    private createFailureResult(
        error: Error,
        startTime: number,
        context: ValidationContext
    ): ValidationResult {
        const validationError: ValidationError = {
            id: 'processor-critical-error',
            type: ValidationErrorType.VALIDATION_TIMEOUT,
            field: 'processor',
            message: `Critical processor error: ${error.message}`,
            severity: ValidationSeverity.ERROR,
            context: {
                error: error.message,
                stack: error.stack
            }
        };

        const metadata: ValidationMetadata = {
            templateId: context.originalRequest.personaType,
            templateVersion: '1.0.0',
            validationTime: Date.now() - startTime,
            rulesExecuted: 0,
            rulesSkipped: 0,
            timestamp: Date.now()
        };

        return {
            isValid: false,
            errors: [validationError],
            warnings: [],
            score: 0,
            metadata
        };
    }

    /**
     * Met à jour les métriques du processeur
     */
    private updateMetrics(
        results: RuleExecutionResult[],
        totalTime: number
    ): void {
        this.metrics.totalExecutionTime = totalTime;
        this.metrics.totalRulesExecuted = results.filter(r => !r.skipped).length;
        this.metrics.totalRulesSkipped = results.filter(r => r.skipped).length;

        const executedResults = results.filter(r => !r.skipped);
        if (executedResults.length > 0) {
            const totalRuleTime = executedResults.reduce(
                (sum, r) => sum + r.executionTime, 0
            );
            this.metrics.averageRuleExecutionTime = totalRuleTime / executedResults.length;
        }

        // Métriques détaillées
        for (const result of results) {
            this.metrics.ruleExecutionTimes.set(result.ruleId, result.executionTime);

            if (!result.success && !result.skipped) {
                this.metrics.failedRules.push(result.ruleId);
            }

            if (result.skipped) {
                this.metrics.skippedRules.push(result.ruleId);
            }
        }
    }

    /**
     * Divise un tableau en chunks de taille donnée
     */
    private chunkArray<T>(array: T[], chunkSize: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }
}

/**
 * Instance singleton du processeur pour utilisation globale
 */
export const validationRuleProcessor = new ValidationRuleProcessor();