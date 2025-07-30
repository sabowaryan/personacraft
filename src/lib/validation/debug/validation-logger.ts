/**
 * ValidationLogger - Detailed logging system for troubleshooting validation issues
 * 
 * This class provides comprehensive logging capabilities with different levels
 * and structured output for easy analysis and debugging.
 */

import {
    ValidationResult,
    ValidationContext,
    ValidationError,
    ValidationRule,
    ValidationTemplate,
    PersonaType
} from '../../../types/validation';

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

export interface ValidationLogEntry {
    id: string;
    timestamp: number;
    level: LogLevel;
    category: 'validation' | 'template' | 'rule' | 'error' | 'performance' | 'fallback';
    message: string;
    data?: Record<string, any>;
    traceId?: string;
    templateId?: string;
    ruleId?: string;
    personaType?: PersonaType;
    duration?: number;
    stackTrace?: string;
}

export interface LogFilter {
    level?: LogLevel;
    category?: ValidationLogEntry['category'];
    timeRange?: { start: number; end: number };
    traceId?: string;
    templateId?: string;
    personaType?: PersonaType;
    hasErrors?: boolean;
    searchText?: string;
}

export class ValidationLogger {
    private logs: ValidationLogEntry[] = [];
    private maxLogs: number = 10000;
    private currentLevel: LogLevel = LogLevel.INFO;
    private retentionPeriod: number = 7 * 24 * 60 * 60 * 1000; // 7 days
    private isEnabled: boolean = true;

    constructor(options?: {
        level?: LogLevel;
        maxLogs?: number;
        retentionPeriod?: number;
        enabled?: boolean;
    }) {
        this.currentLevel = options?.level ?? LogLevel.INFO;
        this.maxLogs = options?.maxLogs ?? 10000;
        this.retentionPeriod = options?.retentionPeriod ?? 7 * 24 * 60 * 60 * 1000;
        this.isEnabled = options?.enabled ?? true;
    }

    /**
     * Set the logging level
     */
    setLevel(level: LogLevel): void {
        this.currentLevel = level;
    }

    /**
     * Enable or disable logging
     */
    setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
    }

    /**
     * Log a debug message
     */
    debug(
        category: ValidationLogEntry['category'],
        message: string,
        data?: Record<string, any>,
        context?: {
            traceId?: string;
            templateId?: string;
            ruleId?: string;
            personaType?: PersonaType;
            duration?: number;
        }
    ): void {
        this.log(LogLevel.DEBUG, category, message, data, context);
    }

    /**
     * Log an info message
     */
    info(
        category: ValidationLogEntry['category'],
        message: string,
        data?: Record<string, any>,
        context?: {
            traceId?: string;
            templateId?: string;
            ruleId?: string;
            personaType?: PersonaType;
            duration?: number;
        }
    ): void {
        this.log(LogLevel.INFO, category, message, data, context);
    }

    /**
     * Log a warning message
     */
    warn(
        category: ValidationLogEntry['category'],
        message: string,
        data?: Record<string, any>,
        context?: {
            traceId?: string;
            templateId?: string;
            ruleId?: string;
            personaType?: PersonaType;
            duration?: number;
        }
    ): void {
        this.log(LogLevel.WARN, category, message, data, context);
    }

    /**
     * Log an error message
     */
    error(
        category: ValidationLogEntry['category'],
        message: string,
        error?: Error,
        data?: Record<string, any>,
        context?: {
            traceId?: string;
            templateId?: string;
            ruleId?: string;
            personaType?: PersonaType;
            duration?: number;
        }
    ): void {
        const logData = {
            ...data,
            error: error ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : undefined
        };

        this.log(LogLevel.ERROR, category, message, logData, {
            ...context,
            stackTrace: error?.stack
        });
    }

    /**
     * Log validation start
     */
    logValidationStart(
        traceId: string,
        templateId: string,
        personaType: PersonaType,
        context: ValidationContext
    ): void {
        this.info('validation', `Starting validation for ${personaType} persona`, {
            templateId,
            contextData: {
                originalRequest: context.originalRequest,
                generationAttempt: context.generationAttempt,
                previousErrorsCount: context.previousErrors?.length || 0
            }
        }, { traceId, templateId, personaType });
    }

    /**
     * Log validation completion
     */
    logValidationComplete(
        traceId: string,
        templateId: string,
        personaType: PersonaType,
        result: ValidationResult,
        duration: number
    ): void {
        const level = result.isValid ? LogLevel.INFO : LogLevel.WARN;
        const message = result.isValid
            ? `Validation completed successfully in ${duration}ms`
            : `Validation failed with ${result.errors.length} errors in ${duration}ms`;

        this.log(level, 'validation', message, {
            result: {
                isValid: result.isValid,
                score: result.score,
                errorsCount: result.errors.length,
                warningsCount: result.warnings.length,
                errors: result.errors.map(e => ({ type: e.type, field: e.field, message: e.message }))
            }
        }, { traceId, templateId, personaType, duration });
    }

    /**
     * Log template selection
     */
    logTemplateSelection(
        traceId: string,
        personaType: PersonaType,
        selectedTemplate: ValidationTemplate,
        availableTemplates: string[]
    ): void {
        this.debug('template', `Selected template ${selectedTemplate.id} for ${personaType} persona`, {
            selectedTemplate: {
                id: selectedTemplate.id,
                name: selectedTemplate.name,
                version: selectedTemplate.version,
                rulesCount: selectedTemplate.rules.length
            },
            availableTemplates,
            selectionReason: `Best match for persona type: ${personaType}`
        }, { traceId, templateId: selectedTemplate.id, personaType });
    }

    /**
     * Log rule execution
     */
    logRuleExecution(
        traceId: string,
        templateId: string,
        rule: ValidationRule,
        result: { isValid: boolean; errors: ValidationError[]; duration: number },
        inputValue: any
    ): void {
        const level = result.isValid ? LogLevel.DEBUG : LogLevel.WARN;
        const message = result.isValid
            ? `Rule ${rule.id} passed in ${result.duration}ms`
            : `Rule ${rule.id} failed with ${result.errors.length} errors in ${result.duration}ms`;

        this.log(level, 'rule', message, {
            rule: {
                id: rule.id,
                type: rule.type,
                field: rule.field,
                severity: rule.severity,
                required: rule.required
            },
            execution: {
                inputValue: this.sanitizeValue(inputValue),
                isValid: result.isValid,
                errors: result.errors.map(e => ({ type: e.type, message: e.message })),
                duration: result.duration
            }
        }, { traceId, templateId, ruleId: rule.id, duration: result.duration });
    }

    /**
     * Log fallback usage
     */
    logFallbackUsage(
        traceId: string,
        originalTemplateId: string,
        fallbackTemplateId: string,
        reason: string,
        personaType: PersonaType
    ): void {
        this.warn('fallback', `Fallback activated: ${originalTemplateId} → ${fallbackTemplateId}`, {
            originalTemplate: originalTemplateId,
            fallbackTemplate: fallbackTemplateId,
            reason,
            personaType
        }, { traceId, templateId: fallbackTemplateId, personaType });
    }

    /**
     * Log performance metrics
     */
    logPerformanceMetrics(
        traceId: string,
        templateId: string,
        metrics: {
            totalDuration: number;
            rulesExecuted: number;
            averageRuleDuration: number;
            slowestRule?: { id: string; duration: number };
            fastestRule?: { id: string; duration: number };
        }
    ): void {
        this.info('performance', `Validation performance metrics`, {
            metrics: {
                ...metrics,
                efficiency: metrics.rulesExecuted > 0 ? metrics.totalDuration / metrics.rulesExecuted : 0
            }
        }, { traceId, templateId, duration: metrics.totalDuration });
    }

    /**
     * Get logs with optional filtering
     */
    getLogs(filter?: LogFilter): ValidationLogEntry[] {
        let filteredLogs = [...this.logs];

        if (filter) {
            filteredLogs = filteredLogs.filter(log => {
                if (filter.level !== undefined && log.level < filter.level) {
                    return false;
                }
                if (filter.category && log.category !== filter.category) {
                    return false;
                }
                if (filter.timeRange) {
                    if (log.timestamp < filter.timeRange.start || log.timestamp > filter.timeRange.end) {
                        return false;
                    }
                }
                if (filter.traceId && log.traceId !== filter.traceId) {
                    return false;
                }
                if (filter.templateId && log.templateId !== filter.templateId) {
                    return false;
                }
                if (filter.personaType && log.personaType !== filter.personaType) {
                    return false;
                }
                if (filter.hasErrors !== undefined) {
                    const hasErrors = log.level === LogLevel.ERROR ||
                        (log.data?.errors && Array.isArray(log.data.errors) && log.data.errors.length > 0);
                    if (hasErrors !== filter.hasErrors) {
                        return false;
                    }
                }
                if (filter.searchText) {
                    const searchLower = filter.searchText.toLowerCase();
                    const messageMatch = log.message.toLowerCase().includes(searchLower);
                    const dataMatch = JSON.stringify(log.data || {}).toLowerCase().includes(searchLower);
                    if (!messageMatch && !dataMatch) {
                        return false;
                    }
                }
                return true;
            });
        }

        return filteredLogs.sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Get log statistics
     */
    getLogStatistics(): {
        totalLogs: number;
        logsByLevel: Record<string, number>;
        logsByCategory: Record<string, number>;
        errorRate: number;
        averageValidationDuration: number;
        topErrors: Array<{ message: string; count: number }>;
    } {
        const logs = this.logs;

        if (logs.length === 0) {
            return {
                totalLogs: 0,
                logsByLevel: {},
                logsByCategory: {},
                errorRate: 0,
                averageValidationDuration: 0,
                topErrors: []
            };
        }

        const logsByLevel: Record<string, number> = {};
        const logsByCategory: Record<string, number> = {};
        const errorMessages = new Map<string, number>();
        let totalValidationDuration = 0;
        let validationCount = 0;

        logs.forEach(log => {
            // Count by level
            const levelName = LogLevel[log.level];
            logsByLevel[levelName] = (logsByLevel[levelName] || 0) + 1;

            // Count by category
            logsByCategory[log.category] = (logsByCategory[log.category] || 0) + 1;

            // Track errors
            if (log.level === LogLevel.ERROR) {
                const count = errorMessages.get(log.message) || 0;
                errorMessages.set(log.message, count + 1);
            }

            // Track validation durations
            if (log.category === 'validation' && log.duration) {
                totalValidationDuration += log.duration;
                validationCount++;
            }
        });

        const errorLogs = logs.filter(log => log.level === LogLevel.ERROR).length;
        const topErrors = Array.from(errorMessages.entries())
            .map(([message, count]) => ({ message, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return {
            totalLogs: logs.length,
            logsByLevel,
            logsByCategory,
            errorRate: logs.length > 0 ? errorLogs / logs.length : 0,
            averageValidationDuration: validationCount > 0 ? totalValidationDuration / validationCount : 0,
            topErrors
        };
    }

    /**
     * Export logs as JSON
     */
    exportLogs(filter?: LogFilter): string {
        const logs = this.getLogs(filter);
        return JSON.stringify(logs, null, 2);
    }

    /**
     * Clear all logs
     */
    clearLogs(): void {
        this.logs = [];
        console.log('🗑️ All validation logs cleared');
    }

    /**
     * Private method to log with all parameters
     */
    private log(
        level: LogLevel,
        category: ValidationLogEntry['category'],
        message: string,
        data?: Record<string, any>,
        context?: {
            traceId?: string;
            templateId?: string;
            ruleId?: string;
            personaType?: PersonaType;
            duration?: number;
            stackTrace?: string;
        }
    ): void {
        if (!this.isEnabled || level < this.currentLevel) {
            return;
        }

        const logEntry: ValidationLogEntry = {
            id: this.generateLogId(),
            timestamp: Date.now(),
            level,
            category,
            message,
            data,
            ...context
        };

        this.logs.push(logEntry);
        this.cleanupOldLogs();

        // Console output for development
        if (process.env.NODE_ENV === 'development' || process.env.VALIDATION_DEBUG === 'true') {
            this.outputToConsole(logEntry);
        }
    }

    /**
     * Output log entry to console with formatting
     */
    private outputToConsole(entry: ValidationLogEntry): void {
        const levelEmoji = {
            [LogLevel.DEBUG]: '🔍',
            [LogLevel.INFO]: 'ℹ️',
            [LogLevel.WARN]: '⚠️',
            [LogLevel.ERROR]: '❌'
        };

        const categoryEmoji = {
            validation: '✅',
            template: '📋',
            rule: '📏',
            error: '💥',
            performance: '⚡',
            fallback: '🔄'
        };

        const prefix = `${levelEmoji[entry.level]} ${categoryEmoji[entry.category]}`;
        const traceInfo = entry.traceId ? `[${entry.traceId.slice(-8)}]` : '';
        const duration = entry.duration ? ` (${entry.duration}ms)` : '';

        console.log(`${prefix} ${traceInfo} ${entry.message}${duration}`);

        if (entry.data && Object.keys(entry.data).length > 0) {
            console.log('   Data:', JSON.stringify(entry.data, null, 2));
        }
    }

    /**
     * Sanitize sensitive values for logging
     */
    private sanitizeValue(value: any): any {
        if (typeof value === 'string' && value.length > 1000) {
            return value.substring(0, 1000) + '... [truncated]';
        }

        if (typeof value === 'object' && value !== null) {
            const sanitized: any = {};
            for (const [key, val] of Object.entries(value)) {
                if (key.toLowerCase().includes('password') || key.toLowerCase().includes('secret')) {
                    sanitized[key] = '[REDACTED]';
                } else {
                    sanitized[key] = this.sanitizeValue(val);
                }
            }
            return sanitized;
        }

        return value;
    }

    /**
     * Generate a unique log ID
     */
    private generateLogId(): string {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 9);
        return `log_${timestamp}_${random}`;
    }

    /**
     * Clean up old logs to prevent memory leaks
     */
    private cleanupOldLogs(): void {
        const cutoffTime = Date.now() - this.retentionPeriod;

        // Remove old logs
        this.logs = this.logs.filter(log => log.timestamp >= cutoffTime);

        // Enforce max logs limit
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, this.maxLogs);
        }
    }
}

// Global logger instance
export const validationLogger = new ValidationLogger({
    level: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
    enabled: true
});