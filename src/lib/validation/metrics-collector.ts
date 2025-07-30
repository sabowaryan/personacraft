/**
 * ValidationMetricsCollector - Collects and stores validation metrics in real-time
 * 
 * This class is responsible for:
 * - Collecting validation metrics in real-time
 * - Storing metrics with timestamps
 * - Aggregating metrics by template and time period
 * - Providing metrics data for monitoring and alerting
 */

import {
    ValidationMetrics,
    ValidationMetricsAggregated,
    ValidationResult,
    ValidationContext,
    ValidationErrorType,
    PersonaType
} from '../../types/validation';

export interface MetricsStorage {
    store(metrics: ValidationMetrics): Promise<void>;
    getMetrics(templateId: string, startTime: number, endTime: number): Promise<ValidationMetrics[]>;
    getAggregatedMetrics(templateId: string, period: string): Promise<ValidationMetricsAggregated | null>;
    cleanup(olderThan: number): Promise<void>;
}

export interface MetricsQuery {
    templateId?: string;
    personaType?: PersonaType;
    startTime?: number;
    endTime?: number;
    isValid?: boolean;
    minScore?: number;
    maxScore?: number;
}

export interface MetricsSummary {
    totalValidations: number;
    successRate: number;
    averageScore: number;
    averageValidationTime: number;
    errorBreakdown: Record<ValidationErrorType, number>;
    fallbackUsageRate: number;
    topFailingRules: Array<{ ruleId: string; failureCount: number }>;
}

/**
 * In-memory storage implementation for metrics
 * In production, this should be replaced with a persistent storage solution
 */
export class InMemoryMetricsStorage implements MetricsStorage {
    private metrics: ValidationMetrics[] = [];
    private aggregatedCache: Map<string, ValidationMetricsAggregated> = new Map();
    private readonly maxMetricsCount = 10000; // Prevent memory overflow

    async store(metrics: ValidationMetrics): Promise<void> {
        this.metrics.push(metrics);
        
        // Cleanup old metrics if we exceed the limit
        if (this.metrics.length > this.maxMetricsCount) {
            const cutoff = this.metrics.length - this.maxMetricsCount;
            this.metrics = this.metrics.slice(cutoff);
        }
        
        // Invalidate aggregated cache for this template
        this.invalidateAggregatedCache(metrics.templateId);
    }

    async getMetrics(templateId: string, startTime: number, endTime: number): Promise<ValidationMetrics[]> {
        return this.metrics.filter(m => 
            m.templateId === templateId &&
            m.timestamp >= startTime &&
            m.timestamp <= endTime
        );
    }

    async getAggregatedMetrics(templateId: string, period: string): Promise<ValidationMetricsAggregated | null> {
        const cacheKey = `${templateId}-${period}`;
        
        if (this.aggregatedCache.has(cacheKey)) {
            return this.aggregatedCache.get(cacheKey)!;
        }

        const { startTime, endTime } = this.parsePeriod(period);
        const metrics = await this.getMetrics(templateId, startTime, endTime);
        
        if (metrics.length === 0) {
            return null;
        }

        const aggregated = this.aggregateMetrics(templateId, period, metrics);
        this.aggregatedCache.set(cacheKey, aggregated);
        
        return aggregated;
    }

    async cleanup(olderThan: number): Promise<void> {
        this.metrics = this.metrics.filter(m => m.timestamp >= olderThan);
        
        // Clear aggregated cache as it might be stale
        this.aggregatedCache.clear();
    }

    private invalidateAggregatedCache(templateId: string): void {
        const keysToDelete = Array.from(this.aggregatedCache.keys())
            .filter(key => key.startsWith(templateId));
        
        keysToDelete.forEach(key => this.aggregatedCache.delete(key));
    }

    private parsePeriod(period: string): { startTime: number; endTime: number } {
        const now = Date.now();
        const endTime = now;
        let startTime: number;

        switch (period) {
            case '1h':
                startTime = now - (60 * 60 * 1000);
                break;
            case '24h':
                startTime = now - (24 * 60 * 60 * 1000);
                break;
            case '7d':
                startTime = now - (7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startTime = now - (30 * 24 * 60 * 60 * 1000);
                break;
            default:
                startTime = now - (24 * 60 * 60 * 1000); // Default to 24h
        }

        return { startTime, endTime };
    }

    private aggregateMetrics(
        templateId: string,
        period: string,
        metrics: ValidationMetrics[]
    ): ValidationMetricsAggregated {
        const totalValidations = metrics.length;
        const successfulValidations = metrics.filter(m => m.isValid).length;
        const successRate = totalValidations > 0 ? successfulValidations / totalValidations : 0;
        
        const averageScore = metrics.reduce((sum, m) => sum + m.score, 0) / totalValidations;
        const averageValidationTime = metrics.reduce((sum, m) => sum + m.validationTime, 0) / totalValidations;
        
        const errorBreakdown: Record<ValidationErrorType, number> = {} as Record<ValidationErrorType, number>;
        const fallbackUsed = metrics.filter(m => m.fallbackUsed).length;
        const fallbackUsageRate = fallbackUsed / totalValidations;

        // Count errors by type
        metrics.forEach(m => {
            m.rulesFailed.forEach(ruleId => {
                // Extract error type from rule ID (assuming rule IDs contain error type)
                const errorType = this.extractErrorTypeFromRuleId(ruleId);
                if (errorType) {
                    errorBreakdown[errorType] = (errorBreakdown[errorType] || 0) + 1;
                }
            });
        });

        return {
            templateId,
            period,
            totalValidations,
            successRate,
            averageScore,
            averageValidationTime,
            errorBreakdown,
            fallbackUsageRate
        };
    }

    private extractErrorTypeFromRuleId(ruleId: string): ValidationErrorType | null {
        // Map rule IDs to error types based on naming conventions
        if (ruleId.includes('required-fields')) return ValidationErrorType.REQUIRED_FIELD_MISSING;
        if (ruleId.includes('structure')) return ValidationErrorType.STRUCTURE_INVALID;
        if (ruleId.includes('type')) return ValidationErrorType.TYPE_MISMATCH;
        if (ruleId.includes('format')) return ValidationErrorType.FORMAT_INVALID;
        if (ruleId.includes('range')) return ValidationErrorType.VALUE_OUT_OF_RANGE;
        if (ruleId.includes('cultural')) return ValidationErrorType.CULTURAL_DATA_INCONSISTENT;
        if (ruleId.includes('business')) return ValidationErrorType.BUSINESS_RULE_VIOLATION;
        
        return null;
    }
}

export class ValidationMetricsCollector {
    private storage: MetricsStorage;
    private isEnabled: boolean = true;

    constructor(storage?: MetricsStorage) {
        this.storage = storage || new InMemoryMetricsStorage();
    }

    /**
     * Collects metrics from a validation result
     */
    async collectMetrics(
        validationResult: ValidationResult,
        context: ValidationContext,
        retryCount: number = 0,
        fallbackUsed: boolean = false
    ): Promise<void> {
        if (!this.isEnabled) {
            return;
        }

        const metrics: ValidationMetrics = {
            templateId: validationResult.metadata.templateId,
            timestamp: validationResult.metadata.timestamp,
            validationTime: validationResult.metadata.validationTime,
            isValid: validationResult.isValid,
            errorCount: validationResult.errors.length,
            warningCount: validationResult.warnings.length,
            score: validationResult.score,
            retryCount,
            fallbackUsed,
            personaType: context.originalRequest.personaType,
            rulesExecuted: this.extractExecutedRules(validationResult),
            rulesFailed: this.extractFailedRules(validationResult)
        };

        try {
            await this.storage.store(metrics);
        } catch (error) {
            console.error('Failed to store validation metrics:', error);
            // Don't throw - metrics collection should not break validation flow
        }
    }

    /**
     * Gets metrics for a specific template and time range
     */
    async getMetrics(query: MetricsQuery): Promise<ValidationMetrics[]> {
        const {
            templateId = '',
            startTime = Date.now() - (24 * 60 * 60 * 1000), // Default to last 24h
            endTime = Date.now()
        } = query;

        const metrics = await this.storage.getMetrics(templateId, startTime, endTime);
        
        return this.filterMetrics(metrics, query);
    }

    /**
     * Gets aggregated metrics for a template and period
     */
    async getAggregatedMetrics(templateId: string, period: string = '24h'): Promise<ValidationMetricsAggregated | null> {
        return await this.storage.getAggregatedMetrics(templateId, period);
    }

    /**
     * Gets a summary of metrics across all templates
     */
    async getMetricsSummary(query: MetricsQuery = {}): Promise<MetricsSummary> {
        const metrics = await this.getMetrics(query);
        
        if (metrics.length === 0) {
            return {
                totalValidations: 0,
                successRate: 0,
                averageScore: 0,
                averageValidationTime: 0,
                errorBreakdown: {} as Record<ValidationErrorType, number>,
                fallbackUsageRate: 0,
                topFailingRules: []
            };
        }

        const totalValidations = metrics.length;
        const successfulValidations = metrics.filter(m => m.isValid).length;
        const successRate = successfulValidations / totalValidations;
        
        const averageScore = metrics.reduce((sum, m) => sum + m.score, 0) / totalValidations;
        const averageValidationTime = metrics.reduce((sum, m) => sum + m.validationTime, 0) / totalValidations;
        
        const fallbackUsed = metrics.filter(m => m.fallbackUsed).length;
        const fallbackUsageRate = fallbackUsed / totalValidations;

        // Calculate error breakdown
        const errorBreakdown: Record<ValidationErrorType, number> = {} as Record<ValidationErrorType, number>;
        const ruleFailureCounts: Map<string, number> = new Map();

        metrics.forEach(m => {
            m.rulesFailed.forEach(ruleId => {
                // Count rule failures
                ruleFailureCounts.set(ruleId, (ruleFailureCounts.get(ruleId) || 0) + 1);
                
                // Count error types
                const errorType = this.extractErrorTypeFromRuleId(ruleId);
                if (errorType) {
                    errorBreakdown[errorType] = (errorBreakdown[errorType] || 0) + 1;
                }
            });
        });

        // Get top failing rules
        const topFailingRules = Array.from(ruleFailureCounts.entries())
            .map(([ruleId, failureCount]) => ({ ruleId, failureCount }))
            .sort((a, b) => b.failureCount - a.failureCount)
            .slice(0, 10); // Top 10 failing rules

        return {
            totalValidations,
            successRate,
            averageScore,
            averageValidationTime,
            errorBreakdown,
            fallbackUsageRate,
            topFailingRules
        };
    }

    /**
     * Gets metrics grouped by template
     */
    async getMetricsByTemplate(period: string = '24h'): Promise<Map<string, ValidationMetricsAggregated>> {
        const { startTime, endTime } = this.parsePeriod(period);
        const allMetrics = await this.storage.getMetrics('', startTime, endTime);
        
        // Group by template
        const metricsByTemplate = new Map<string, ValidationMetrics[]>();
        allMetrics.forEach(m => {
            if (!metricsByTemplate.has(m.templateId)) {
                metricsByTemplate.set(m.templateId, []);
            }
            metricsByTemplate.get(m.templateId)!.push(m);
        });

        // Aggregate each template's metrics
        const result = new Map<string, ValidationMetricsAggregated>();
        for (const [templateId, metrics] of metricsByTemplate.entries()) {
            const aggregated = this.aggregateMetrics(templateId, period, metrics);
            result.set(templateId, aggregated);
        }

        return result;
    }

    /**
     * Cleans up old metrics
     */
    async cleanup(olderThanDays: number = 30): Promise<void> {
        const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
        await this.storage.cleanup(cutoffTime);
    }

    /**
     * Enables or disables metrics collection
     */
    setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
    }

    /**
     * Checks if metrics collection is enabled
     */
    isCollectionEnabled(): boolean {
        return this.isEnabled;
    }

    // Private helper methods

    private extractExecutedRules(validationResult: ValidationResult): string[] {
        // Extract rule IDs from metadata or errors/warnings
        const executedRules: Set<string> = new Set();
        
        // Add rules that generated errors
        validationResult.errors.forEach(error => {
            if (error.id) {
                executedRules.add(error.id);
            }
        });
        
        // Add rules that generated warnings
        validationResult.warnings.forEach(warning => {
            if (warning.id) {
                executedRules.add(warning.id);
            }
        });
        
        // If we have metadata about rules executed, use that
        if (validationResult.metadata.rulesExecuted) {
            return Array.from(executedRules);
        }
        
        return Array.from(executedRules);
    }

    private extractFailedRules(validationResult: ValidationResult): string[] {
        return validationResult.errors
            .map(error => error.id)
            .filter(id => id !== undefined);
    }

    private filterMetrics(metrics: ValidationMetrics[], query: MetricsQuery): ValidationMetrics[] {
        return metrics.filter(m => {
            if (query.personaType && m.personaType !== query.personaType) return false;
            if (query.isValid !== undefined && m.isValid !== query.isValid) return false;
            if (query.minScore !== undefined && m.score < query.minScore) return false;
            if (query.maxScore !== undefined && m.score > query.maxScore) return false;
            
            return true;
        });
    }

    private extractErrorTypeFromRuleId(ruleId: string): ValidationErrorType | null {
        // Map rule IDs to error types based on naming conventions
        if (ruleId.includes('required-fields')) return ValidationErrorType.REQUIRED_FIELD_MISSING;
        if (ruleId.includes('structure')) return ValidationErrorType.STRUCTURE_INVALID;
        if (ruleId.includes('type')) return ValidationErrorType.TYPE_MISMATCH;
        if (ruleId.includes('format')) return ValidationErrorType.FORMAT_INVALID;
        if (ruleId.includes('range')) return ValidationErrorType.VALUE_OUT_OF_RANGE;
        if (ruleId.includes('cultural')) return ValidationErrorType.CULTURAL_DATA_INCONSISTENT;
        if (ruleId.includes('business')) return ValidationErrorType.BUSINESS_RULE_VIOLATION;
        
        return null;
    }

    private parsePeriod(period: string): { startTime: number; endTime: number } {
        const now = Date.now();
        const endTime = now;
        let startTime: number;

        switch (period) {
            case '1h':
                startTime = now - (60 * 60 * 1000);
                break;
            case '24h':
                startTime = now - (24 * 60 * 60 * 1000);
                break;
            case '7d':
                startTime = now - (7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startTime = now - (30 * 24 * 60 * 60 * 1000);
                break;
            default:
                startTime = now - (24 * 60 * 60 * 1000); // Default to 24h
        }

        return { startTime, endTime };
    }

    private aggregateMetrics(
        templateId: string,
        period: string,
        metrics: ValidationMetrics[]
    ): ValidationMetricsAggregated {
        const totalValidations = metrics.length;
        const successfulValidations = metrics.filter(m => m.isValid).length;
        const successRate = totalValidations > 0 ? successfulValidations / totalValidations : 0;
        
        const averageScore = metrics.reduce((sum, m) => sum + m.score, 0) / totalValidations;
        const averageValidationTime = metrics.reduce((sum, m) => sum + m.validationTime, 0) / totalValidations;
        
        const errorBreakdown: Record<ValidationErrorType, number> = {} as Record<ValidationErrorType, number>;
        const fallbackUsed = metrics.filter(m => m.fallbackUsed).length;
        const fallbackUsageRate = fallbackUsed / totalValidations;

        // Count errors by type
        metrics.forEach(m => {
            m.rulesFailed.forEach(ruleId => {
                const errorType = this.extractErrorTypeFromRuleId(ruleId);
                if (errorType) {
                    errorBreakdown[errorType] = (errorBreakdown[errorType] || 0) + 1;
                }
            });
        });

        return {
            templateId,
            period,
            totalValidations,
            successRate,
            averageScore,
            averageValidationTime,
            errorBreakdown,
            fallbackUsageRate
        };
    }
}