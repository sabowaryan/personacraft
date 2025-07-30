/**
 * FailureAnalyzer - Tools for analyzing validation failures and patterns
 * 
 * This class provides comprehensive analysis of validation failures to help
 * identify patterns, root causes, and optimization opportunities.
 */

import {
    ValidationResult,
    ValidationError,
    ValidationTemplate,
    PersonaType
} from '../../../types/validation';
import { ValidationTrace, ValidationTracer } from './validation-tracer';
import { ValidationLogEntry, ValidationLogger, LogLevel } from './validation-logger';

export interface FailurePattern {
    id: string;
    type: 'recurring_error' | 'template_issue' | 'performance_degradation' | 'fallback_overuse';
    description: string;
    frequency: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    affectedTemplates: string[];
    affectedPersonaTypes: PersonaType[];
    firstSeen: number;
    lastSeen: number;
    examples: string[]; // trace IDs or log IDs
    suggestedActions: string[];
    impact: {
        successRateImpact: number;
        performanceImpact: number;
        userExperienceImpact: 'minimal' | 'moderate' | 'significant' | 'severe';
    };
}

export interface FailureAnalysisReport {
    generatedAt: number;
    timeRange: { start: number; end: number };
    summary: {
        totalFailures: number;
        uniqueErrorTypes: number;
        mostCommonError: string;
        averageFailureRate: number;
        criticalPatterns: number;
    };
    patterns: FailurePattern[];
    recommendations: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
    };
    templateHealth: Array<{
        templateId: string;
        successRate: number;
        averageDuration: number;
        commonErrors: string[];
        healthScore: number;
    }>;
}

export interface AnalysisOptions {
    timeRange?: { start: number; end: number };
    minOccurrences?: number;
    includePerformanceAnalysis?: boolean;
    includeTemplateHealth?: boolean;
    severityThreshold?: FailurePattern['severity'];
}

export class FailureAnalyzer {
    private tracer: ValidationTracer;
    private logger: ValidationLogger;
    private analysisCache: Map<string, FailureAnalysisReport> = new Map();
    private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes

    constructor(tracer: ValidationTracer, logger: ValidationLogger) {
        this.tracer = tracer;
        this.logger = logger;
    }

    /**
     * Analyze validation failures and generate a comprehensive report
     */
    analyzeFailures(options: AnalysisOptions = {}): FailureAnalysisReport {
        const cacheKey = this.generateCacheKey(options);
        const cached = this.analysisCache.get(cacheKey);

        if (cached && Date.now() - cached.generatedAt < this.cacheTimeout) {
            return cached;
        }

        const timeRange = options.timeRange || {
            start: Date.now() - 24 * 60 * 60 * 1000, // Last 24 hours
            end: Date.now()
        };

        const traces = this.tracer.getTraces({
            timeRange,
            hasErrors: true
        });

        const logs = this.logger.getLogs({
            timeRange,
            hasErrors: true
        });

        const patterns = this.identifyFailurePatterns(traces, logs, options);
        const templateHealth = options.includeTemplateHealth
            ? this.analyzeTemplateHealth(traces, timeRange)
            : [];

        const report: FailureAnalysisReport = {
            generatedAt: Date.now(),
            timeRange,
            summary: this.generateSummary(traces, patterns),
            patterns: patterns.filter(p =>
                !options.severityThreshold ||
                this.getSeverityLevel(p.severity) >= this.getSeverityLevel(options.severityThreshold)
            ),
            recommendations: this.generateRecommendations(patterns),
            templateHealth
        };

        this.analysisCache.set(cacheKey, report);
        return report;
    }

    /**
     * Identify specific failure patterns from traces and logs
     */
    private identifyFailurePatterns(
        traces: ValidationTrace[],
        logs: ValidationLogEntry[],
        options: AnalysisOptions
    ): FailurePattern[] {
        const patterns: FailurePattern[] = [];
        const minOccurrences = options.minOccurrences || 3;

        // Analyze recurring errors
        patterns.push(...this.findRecurringErrors(traces, logs, minOccurrences));

        // Analyze template-specific issues
        patterns.push(...this.findTemplateIssues(traces, minOccurrences));

        // Analyze performance degradation
        if (options.includePerformanceAnalysis) {
            patterns.push(...this.findPerformanceDegradation(traces, minOccurrences));
        }

        // Analyze fallback overuse
        patterns.push(...this.findFallbackOveruse(traces, minOccurrences));

        return patterns.sort((a, b) => {
            const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return severityOrder[b.severity] - severityOrder[a.severity] || b.frequency - a.frequency;
        });
    }

    /**
     * Find recurring error patterns
     */
    private findRecurringErrors(
        traces: ValidationTrace[],
        logs: ValidationLogEntry[],
        minOccurrences: number
    ): FailurePattern[] {
        const errorCounts = new Map<string, {
            count: number;
            traces: string[];
            templates: Set<string>;
            personaTypes: Set<PersonaType>;
            firstSeen: number;
            lastSeen: number;
        }>();

        // Analyze errors from traces
        traces.forEach(trace => {
            trace.result.errors.forEach(error => {
                const key = `${error.type}:${error.field}`;
                const existing = errorCounts.get(key) || {
                    count: 0,
                    traces: [],
                    templates: new Set(),
                    personaTypes: new Set(),
                    firstSeen: Date.now(),
                    lastSeen: 0
                };

                existing.count++;
                existing.traces.push(trace.traceId);
                existing.templates.add(trace.templateId);
                existing.personaTypes.add(trace.personaType);
                existing.firstSeen = Math.min(existing.firstSeen, trace.timestamp);
                existing.lastSeen = Math.max(existing.lastSeen, trace.timestamp);

                errorCounts.set(key, existing);
            });
        });

        const patterns: FailurePattern[] = [];

        errorCounts.forEach((data, errorKey) => {
            if (data.count >= minOccurrences) {
                const [errorType, field] = errorKey.split(':');
                const severity = this.calculateErrorSeverity(data.count, traces.length);

                patterns.push({
                    id: `recurring_error_${errorType}_${field}`,
                    type: 'recurring_error',
                    description: `Recurring ${errorType} error on field '${field}' (${data.count} occurrences)`,
                    frequency: data.count,
                    severity,
                    affectedTemplates: Array.from(data.templates),
                    affectedPersonaTypes: Array.from(data.personaTypes),
                    firstSeen: data.firstSeen,
                    lastSeen: data.lastSeen,
                    examples: data.traces.slice(0, 5),
                    suggestedActions: this.getSuggestedActionsForError(errorType, field),
                    impact: this.calculateErrorImpact(data.count, traces.length)
                });
            }
        });

        return patterns;
    }

    /**
     * Find template-specific issues
     */
    private findTemplateIssues(traces: ValidationTrace[], minOccurrences: number): FailurePattern[] {
        const templateStats = new Map<string, {
            totalValidations: number;
            failures: number;
            averageDuration: number;
            commonErrors: Map<string, number>;
            traces: string[];
        }>();

        traces.forEach(trace => {
            const existing = templateStats.get(trace.templateId) || {
                totalValidations: 0,
                failures: 0,
                averageDuration: 0,
                commonErrors: new Map<string, number>(),
                traces: [] as string[]
            };

            existing.totalValidations++;
            existing.averageDuration = (existing.averageDuration * (existing.totalValidations - 1) + trace.summary.totalDuration) / existing.totalValidations;
            existing.traces.push(trace.traceId);

            if (!trace.result.isValid) {
                existing.failures++;
                trace.result.errors.forEach(error => {
                    const count = existing.commonErrors.get(error.type) || 0;
                    existing.commonErrors.set(error.type, count + 1);
                });
            }

            templateStats.set(trace.templateId, existing);
        });

        const patterns: FailurePattern[] = [];

        templateStats.forEach((stats, templateId) => {
            const failureRate = stats.failures / stats.totalValidations;

            // High failure rate pattern
            if (failureRate > 0.3 && stats.failures >= minOccurrences) {
                patterns.push({
                    id: `template_high_failure_${templateId}`,
                    type: 'template_issue',
                    description: `Template ${templateId} has high failure rate (${(failureRate * 100).toFixed(1)}%)`,
                    frequency: stats.failures,
                    severity: failureRate > 0.7 ? 'critical' : failureRate > 0.5 ? 'high' : 'medium',
                    affectedTemplates: [templateId],
                    affectedPersonaTypes: this.getPersonaTypesForTemplate(traces, templateId),
                    firstSeen: Math.min(...traces.filter(t => t.templateId === templateId).map(t => t.timestamp)),
                    lastSeen: Math.max(...traces.filter(t => t.templateId === templateId).map(t => t.timestamp)),
                    examples: stats.traces.slice(0, 5),
                    suggestedActions: [
                        'Review template rules for accuracy',
                        'Check if template matches expected persona structure',
                        'Consider updating validation rules',
                        'Test template with sample data'
                    ],
                    impact: {
                        successRateImpact: failureRate,
                        performanceImpact: 0,
                        userExperienceImpact: failureRate > 0.5 ? 'severe' : 'significant'
                    }
                });
            }
        });

        return patterns;
    }

    /**
     * Find performance degradation patterns
     */
    private findPerformanceDegradation(traces: ValidationTrace[], minOccurrences: number): FailurePattern[] {
        const patterns: FailurePattern[] = [];

        // Calculate average duration
        const totalDuration = traces.reduce((sum, trace) => sum + trace.summary.totalDuration, 0);
        const averageDuration = totalDuration / traces.length;

        // Find slow validations
        const slowTraces = traces.filter(trace => trace.summary.totalDuration > averageDuration * 2);

        if (slowTraces.length >= minOccurrences) {
            const affectedTemplates = [...new Set(slowTraces.map(t => t.templateId))];
            const affectedPersonaTypes = [...new Set(slowTraces.map(t => t.personaType))];

            patterns.push({
                id: 'performance_degradation_slow_validations',
                type: 'performance_degradation',
                description: `${slowTraces.length} validations taking significantly longer than average (>${(averageDuration * 2).toFixed(0)}ms vs ${averageDuration.toFixed(0)}ms avg)`,
                frequency: slowTraces.length,
                severity: slowTraces.length > traces.length * 0.2 ? 'high' : 'medium',
                affectedTemplates,
                affectedPersonaTypes,
                firstSeen: Math.min(...slowTraces.map(t => t.timestamp)),
                lastSeen: Math.max(...slowTraces.map(t => t.timestamp)),
                examples: slowTraces.slice(0, 5).map(t => t.traceId),
                suggestedActions: [
                    'Profile slow validation rules',
                    'Optimize complex validation logic',
                    'Consider rule parallelization',
                    'Review template complexity'
                ],
                impact: {
                    successRateImpact: 0,
                    performanceImpact: (slowTraces.reduce((sum, t) => sum + t.summary.totalDuration, 0) / slowTraces.length) / averageDuration,
                    userExperienceImpact: 'moderate'
                }
            });
        }

        return patterns;
    }

    /**
     * Find fallback overuse patterns
     */
    private findFallbackOveruse(traces: ValidationTrace[], minOccurrences: number): FailurePattern[] {
        const fallbackTraces = traces.filter(trace => trace.summary.fallbackUsed);

        if (fallbackTraces.length >= minOccurrences) {
            const fallbackRate = fallbackTraces.length / traces.length;
            const affectedTemplates = [...new Set(fallbackTraces.map(t => t.templateId))];
            const affectedPersonaTypes = [...new Set(fallbackTraces.map(t => t.personaType))];

            return [{
                id: 'fallback_overuse',
                type: 'fallback_overuse',
                description: `High fallback usage rate (${(fallbackRate * 100).toFixed(1)}% of validations)`,
                frequency: fallbackTraces.length,
                severity: fallbackRate > 0.3 ? 'high' : fallbackRate > 0.15 ? 'medium' : 'low',
                affectedTemplates,
                affectedPersonaTypes,
                firstSeen: Math.min(...fallbackTraces.map(t => t.timestamp)),
                lastSeen: Math.max(...fallbackTraces.map(t => t.timestamp)),
                examples: fallbackTraces.slice(0, 5).map(t => t.traceId),
                suggestedActions: [
                    'Review primary template rules',
                    'Improve LLM prompt quality',
                    'Adjust validation strictness',
                    'Update fallback triggers'
                ],
                impact: {
                    successRateImpact: 0,
                    performanceImpact: 0.1, // Fallbacks typically add overhead
                    userExperienceImpact: fallbackRate > 0.3 ? 'significant' : 'moderate'
                }
            }];
        }

        return [];
    }

    /**
     * Analyze template health metrics
     */
    private analyzeTemplateHealth(traces: ValidationTrace[], timeRange: { start: number; end: number }) {
        const templateStats = new Map<string, {
            validations: number;
            successes: number;
            totalDuration: number;
            errors: Map<string, number>;
        }>();

        traces.forEach(trace => {
            const existing = templateStats.get(trace.templateId) || {
                validations: 0,
                successes: 0,
                totalDuration: 0,
                errors: new Map()
            };

            existing.validations++;
            existing.totalDuration += trace.summary.totalDuration;

            if (trace.result.isValid) {
                existing.successes++;
            } else {
                trace.result.errors.forEach(error => {
                    const count = existing.errors.get(error.type) || 0;
                    existing.errors.set(error.type, count + 1);
                });
            }

            templateStats.set(trace.templateId, existing);
        });

        return Array.from(templateStats.entries()).map(([templateId, stats]) => {
            const successRate = stats.successes / stats.validations;
            const averageDuration = stats.totalDuration / stats.validations;
            const commonErrors = Array.from(stats.errors.entries())
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([type]) => type);

            // Calculate health score (0-100)
            const healthScore = Math.round(
                (successRate * 60) + // 60% weight for success rate
                (Math.max(0, (5000 - averageDuration) / 5000) * 30) + // 30% weight for performance
                (Math.max(0, (10 - commonErrors.length) / 10) * 10) // 10% weight for error diversity
            );

            return {
                templateId,
                successRate,
                averageDuration,
                commonErrors,
                healthScore
            };
        }).sort((a, b) => b.healthScore - a.healthScore);
    }

    /**
     * Generate summary statistics
     */
    private generateSummary(traces: ValidationTrace[], patterns: FailurePattern[]) {
        const failedTraces = traces.filter(trace => !trace.result.isValid);
        const allErrors = failedTraces.flatMap(trace => trace.result.errors);
        const errorTypes = new Set(allErrors.map(error => error.type));
        const errorCounts = new Map<string, number>();

        allErrors.forEach(error => {
            const count = errorCounts.get(error.type) || 0;
            errorCounts.set(error.type, count + 1);
        });

        const mostCommonError = Array.from(errorCounts.entries())
            .sort(([, a], [, b]) => b - a)[0]?.[0] || 'None';

        return {
            totalFailures: failedTraces.length,
            uniqueErrorTypes: errorTypes.size,
            mostCommonError,
            averageFailureRate: traces.length > 0 ? failedTraces.length / traces.length : 0,
            criticalPatterns: patterns.filter(p => p.severity === 'critical').length
        };
    }

    /**
     * Generate actionable recommendations
     */
    private generateRecommendations(patterns: FailurePattern[]) {
        const immediate: string[] = [];
        const shortTerm: string[] = [];
        const longTerm: string[] = [];

        const criticalPatterns = patterns.filter(p => p.severity === 'critical');
        const highPatterns = patterns.filter(p => p.severity === 'high');

        if (criticalPatterns.length > 0) {
            immediate.push('Address critical validation patterns immediately');
            immediate.push('Review and fix templates with high failure rates');
        }

        if (highPatterns.length > 0) {
            shortTerm.push('Optimize templates with recurring errors');
            shortTerm.push('Improve LLM prompts to reduce validation failures');
        }

        if (patterns.some(p => p.type === 'performance_degradation')) {
            shortTerm.push('Profile and optimize slow validation rules');
        }

        if (patterns.some(p => p.type === 'fallback_overuse')) {
            longTerm.push('Review fallback strategies and thresholds');
            longTerm.push('Implement better error recovery mechanisms');
        }

        longTerm.push('Implement automated pattern detection and alerting');
        longTerm.push('Create validation rule optimization pipeline');

        return { immediate, shortTerm, longTerm };
    }

    /**
     * Helper methods
     */
    private calculateErrorSeverity(count: number, totalValidations: number): FailurePattern['severity'] {
        const rate = count / totalValidations;
        if (rate > 0.5) return 'critical';
        if (rate > 0.2) return 'high';
        if (rate > 0.05) return 'medium';
        return 'low';
    }

    private calculateErrorImpact(errorCount: number, totalValidations: number) {
        const rate = errorCount / totalValidations;
        return {
            successRateImpact: rate,
            performanceImpact: 0,
            userExperienceImpact: rate > 0.3 ? 'severe' as const :
                rate > 0.15 ? 'significant' as const :
                    rate > 0.05 ? 'moderate' as const : 'minimal' as const
        };
    }

    private getSuggestedActionsForError(errorType: string, field: string): string[] {
        const actions = [
            `Review validation rule for field '${field}'`,
            `Check LLM prompt instructions for ${field} generation`,
            `Verify expected data format for ${errorType} errors`
        ];

        switch (errorType) {
            case 'REQUIRED_FIELD_MISSING':
                actions.push('Ensure LLM prompt explicitly requests this field');
                break;
            case 'TYPE_MISMATCH':
                actions.push('Clarify expected data type in validation rules');
                break;
            case 'FORMAT_INVALID':
                actions.push('Provide format examples in LLM prompt');
                break;
            case 'VALUE_OUT_OF_RANGE':
                actions.push('Review acceptable value ranges');
                break;
        }

        return actions;
    }

    private getPersonaTypesForTemplate(traces: ValidationTrace[], templateId: string): PersonaType[] {
        return [...new Set(traces
            .filter(trace => trace.templateId === templateId)
            .map(trace => trace.personaType)
        )];
    }

    private getSeverityLevel(severity: FailurePattern['severity']): number {
        const levels = { low: 1, medium: 2, high: 3, critical: 4 };
        return levels[severity];
    }

    private generateCacheKey(options: AnalysisOptions): string {
        return JSON.stringify(options);
    }
}

// Export factory function to create analyzer with proper dependencies
export function createFailureAnalyzer(
    tracer: ValidationTracer,
    logger: ValidationLogger
): FailureAnalyzer {
    return new FailureAnalyzer(tracer, logger);
}