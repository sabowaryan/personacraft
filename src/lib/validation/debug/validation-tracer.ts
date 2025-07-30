/**
 * ValidationTracer - Tools for tracing validations in debug mode
 * 
 * This class provides comprehensive tracing capabilities for validation processes,
 * allowing developers to understand exactly what happens during validation.
 */

import {
    ValidationResult,
    ValidationContext,
    ValidationError,
    ValidationRule,
    ValidationTemplate,
    ValidationMetadata,
    PersonaType
} from '../../../types/validation';

export interface ValidationTrace {
    traceId: string;
    timestamp: number;
    templateId: string;
    personaType: PersonaType;
    steps: ValidationStep[];
    summary: TraceSummary;
    context: ValidationContext;
    result: ValidationResult;
}

export interface ValidationStep {
    stepId: string;
    stepType: 'template_selection' | 'rule_execution' | 'error_handling' | 'fallback' | 'metrics';
    timestamp: number;
    duration: number;
    status: 'started' | 'completed' | 'failed' | 'skipped';
    details: Record<string, any>;
    ruleId?: string;
    errors?: ValidationError[];
    warnings?: string[];
}

export interface TraceSummary {
    totalDuration: number;
    rulesExecuted: number;
    rulesSkipped: number;
    rulesFailed: number;
    errorsFound: number;
    warningsFound: number;
    fallbackUsed: boolean;
    finalScore: number;
}

export interface TraceFilter {
    templateId?: string;
    personaType?: PersonaType;
    timeRange?: { start: number; end: number };
    hasErrors?: boolean;
    hasFallback?: boolean;
    minDuration?: number;
    maxDuration?: number;
}

export class ValidationTracer {
    private traces: Map<string, ValidationTrace> = new Map();
    private isEnabled: boolean = false;
    private maxTraces: number = 1000;
    private retentionPeriod: number = 24 * 60 * 60 * 1000; // 24 hours

    constructor(options?: {
        enabled?: boolean;
        maxTraces?: number;
        retentionPeriod?: number;
    }) {
        this.isEnabled = options?.enabled ?? false;
        this.maxTraces = options?.maxTraces ?? 1000;
        this.retentionPeriod = options?.retentionPeriod ?? 24 * 60 * 60 * 1000;
    }

    /**
     * Enable or disable tracing
     */
    setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
        if (enabled) {
            console.log('🔍 Validation tracing enabled');
        }
    }

    /**
     * Start a new validation trace
     */
    startTrace(
        templateId: string,
        personaType: PersonaType,
        context: ValidationContext
    ): string {
        if (!this.isEnabled) {
            return '';
        }

        const traceId = this.generateTraceId();
        const trace: ValidationTrace = {
            traceId,
            timestamp: Date.now(),
            templateId,
            personaType,
            steps: [],
            summary: {
                totalDuration: 0,
                rulesExecuted: 0,
                rulesSkipped: 0,
                rulesFailed: 0,
                errorsFound: 0,
                warningsFound: 0,
                fallbackUsed: false,
                finalScore: 0
            },
            context,
            result: {
                isValid: false,
                errors: [],
                warnings: [],
                score: 0,
                metadata: {} as ValidationMetadata
            }
        };

        this.traces.set(traceId, trace);
        this.cleanupOldTraces();

        console.log(`🔍 [${traceId}] Started validation trace for ${personaType} persona using template ${templateId}`);
        
        return traceId;
    }

    /**
     * Add a step to an existing trace
     */
    addStep(
        traceId: string,
        stepType: ValidationStep['stepType'],
        details: Record<string, any>,
        ruleId?: string
    ): string {
        if (!this.isEnabled || !traceId) {
            return '';
        }

        const trace = this.traces.get(traceId);
        if (!trace) {
            return '';
        }

        const stepId = `${stepType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const step: ValidationStep = {
            stepId,
            stepType,
            timestamp: Date.now(),
            duration: 0,
            status: 'started',
            details,
            ruleId
        };

        trace.steps.push(step);

        console.log(`🔍 [${traceId}] Step ${stepType} started${ruleId ? ` for rule ${ruleId}` : ''}`);
        
        return stepId;
    }

    /**
     * Complete a step in the trace
     */
    completeStep(
        traceId: string,
        stepId: string,
        status: 'completed' | 'failed' | 'skipped',
        additionalDetails?: Record<string, any>,
        errors?: ValidationError[],
        warnings?: string[]
    ): void {
        if (!this.isEnabled || !traceId || !stepId) {
            return;
        }

        const trace = this.traces.get(traceId);
        if (!trace) {
            return;
        }

        const step = trace.steps.find(s => s.stepId === stepId);
        if (!step) {
            return;
        }

        step.status = status;
        step.duration = Date.now() - step.timestamp;
        step.errors = errors;
        step.warnings = warnings;

        if (additionalDetails) {
            step.details = { ...step.details, ...additionalDetails };
        }

        // Update summary
        if (step.stepType === 'rule_execution') {
            if (status === 'completed') {
                trace.summary.rulesExecuted++;
            } else if (status === 'failed') {
                trace.summary.rulesFailed++;
            } else if (status === 'skipped') {
                trace.summary.rulesSkipped++;
            }
        }

        if (errors && errors.length > 0) {
            trace.summary.errorsFound += errors.length;
        }

        if (step.stepType === 'fallback' && status === 'completed') {
            trace.summary.fallbackUsed = true;
        }

        console.log(`🔍 [${traceId}] Step ${step.stepType} ${status} in ${step.duration}ms${step.ruleId ? ` (rule: ${step.ruleId})` : ''}`);
    }

    /**
     * Complete the entire trace
     */
    completeTrace(traceId: string, result: ValidationResult): void {
        if (!this.isEnabled || !traceId) {
            return;
        }

        const trace = this.traces.get(traceId);
        if (!trace) {
            return;
        }

        trace.result = result;
        trace.summary.totalDuration = Date.now() - trace.timestamp;
        trace.summary.errorsFound = result.errors.length;
        trace.summary.warningsFound = result.warnings.length;
        trace.summary.finalScore = result.score;

        console.log(`🔍 [${traceId}] Validation trace completed:`);
        console.log(`   - Duration: ${trace.summary.totalDuration}ms`);
        console.log(`   - Rules executed: ${trace.summary.rulesExecuted}`);
        console.log(`   - Rules failed: ${trace.summary.rulesFailed}`);
        console.log(`   - Errors found: ${trace.summary.errorsFound}`);
        console.log(`   - Final score: ${trace.summary.finalScore}`);
        console.log(`   - Fallback used: ${trace.summary.fallbackUsed}`);
    }

    /**
     * Get a specific trace by ID
     */
    getTrace(traceId: string): ValidationTrace | null {
        return this.traces.get(traceId) || null;
    }

    /**
     * Get all traces with optional filtering
     */
    getTraces(filter?: TraceFilter): ValidationTrace[] {
        let traces = Array.from(this.traces.values());

        if (filter) {
            traces = traces.filter(trace => {
                if (filter.templateId && trace.templateId !== filter.templateId) {
                    return false;
                }
                if (filter.personaType && trace.personaType !== filter.personaType) {
                    return false;
                }
                if (filter.timeRange) {
                    if (trace.timestamp < filter.timeRange.start || trace.timestamp > filter.timeRange.end) {
                        return false;
                    }
                }
                if (filter.hasErrors !== undefined && (trace.summary.errorsFound > 0) !== filter.hasErrors) {
                    return false;
                }
                if (filter.hasFallback !== undefined && trace.summary.fallbackUsed !== filter.hasFallback) {
                    return false;
                }
                if (filter.minDuration && trace.summary.totalDuration < filter.minDuration) {
                    return false;
                }
                if (filter.maxDuration && trace.summary.totalDuration > filter.maxDuration) {
                    return false;
                }
                return true;
            });
        }

        return traces.sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Get trace statistics
     */
    getTraceStatistics(): {
        totalTraces: number;
        averageDuration: number;
        successRate: number;
        fallbackRate: number;
        averageScore: number;
        commonErrors: Array<{ type: string; count: number }>;
    } {
        const traces = Array.from(this.traces.values());
        
        if (traces.length === 0) {
            return {
                totalTraces: 0,
                averageDuration: 0,
                successRate: 0,
                fallbackRate: 0,
                averageScore: 0,
                commonErrors: []
            };
        }

        const totalDuration = traces.reduce((sum, trace) => sum + trace.summary.totalDuration, 0);
        const successfulTraces = traces.filter(trace => trace.result.isValid).length;
        const fallbackTraces = traces.filter(trace => trace.summary.fallbackUsed).length;
        const totalScore = traces.reduce((sum, trace) => sum + trace.summary.finalScore, 0);

        // Count common errors
        const errorCounts = new Map<string, number>();
        traces.forEach(trace => {
            trace.result.errors.forEach(error => {
                const count = errorCounts.get(error.type) || 0;
                errorCounts.set(error.type, count + 1);
            });
        });

        const commonErrors = Array.from(errorCounts.entries())
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return {
            totalTraces: traces.length,
            averageDuration: totalDuration / traces.length,
            successRate: successfulTraces / traces.length,
            fallbackRate: fallbackTraces / traces.length,
            averageScore: totalScore / traces.length,
            commonErrors
        };
    }

    /**
     * Export traces for analysis
     */
    exportTraces(filter?: TraceFilter): string {
        const traces = this.getTraces(filter);
        return JSON.stringify(traces, null, 2);
    }

    /**
     * Clear all traces
     */
    clearTraces(): void {
        this.traces.clear();
        console.log('🔍 All validation traces cleared');
    }

    /**
     * Generate a unique trace ID
     */
    private generateTraceId(): string {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 9);
        return `trace_${timestamp}_${random}`;
    }

    /**
     * Clean up old traces to prevent memory leaks
     */
    private cleanupOldTraces(): void {
        const cutoffTime = Date.now() - this.retentionPeriod;
        const tracesToDelete: string[] = [];

        for (const [traceId, trace] of this.traces.entries()) {
            if (trace.timestamp < cutoffTime) {
                tracesToDelete.push(traceId);
            }
        }

        tracesToDelete.forEach(traceId => {
            this.traces.delete(traceId);
        });

        // Also enforce max traces limit
        if (this.traces.size > this.maxTraces) {
            const sortedTraces = Array.from(this.traces.entries())
                .sort(([, a], [, b]) => a.timestamp - b.timestamp);
            
            const toDelete = sortedTraces.slice(0, this.traces.size - this.maxTraces);
            toDelete.forEach(([traceId]) => {
                this.traces.delete(traceId);
            });
        }

        if (tracesToDelete.length > 0) {
            console.log(`🔍 Cleaned up ${tracesToDelete.length} old validation traces`);
        }
    }
}

// Global tracer instance
export const validationTracer = new ValidationTracer({
    enabled: process.env.NODE_ENV === 'development' || process.env.VALIDATION_DEBUG === 'true'
});