/**
 * ValidationAlertSystem - Monitors validation metrics and triggers alerts
 * 
 * This class is responsible for:
 * - Detecting when error thresholds are exceeded
 * - Creating automatic notifications for administrators
 * - Managing alert escalation based on severity
 * - Preventing alert spam through rate limiting
 */

import {
    ValidationMetrics,
    ValidationMetricsAggregated,
    ValidationErrorType,
    PersonaType
} from '../../types/validation';
import { ValidationMetricsCollector } from './metrics-collector';

export enum AlertSeverity {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

export enum AlertType {
    ERROR_RATE_THRESHOLD = 'error_rate_threshold',
    VALIDATION_TIME_THRESHOLD = 'validation_time_threshold',
    FALLBACK_RATE_THRESHOLD = 'fallback_rate_threshold',
    SPECIFIC_ERROR_SPIKE = 'specific_error_spike',
    TEMPLATE_FAILURE = 'template_failure',
    SYSTEM_HEALTH = 'system_health'
}

export interface AlertRule {
    id: string;
    name: string;
    type: AlertType;
    severity: AlertSeverity;
    enabled: boolean;
    conditions: AlertCondition[];
    cooldownPeriod: number; // Minutes
    escalationRules?: EscalationRule[];
    notificationChannels: NotificationChannel[];
}

export interface AlertCondition {
    metric: string;
    operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq' | 'neq';
    threshold: number;
    period: string; // e.g., '1h', '24h', '7d'
    templateId?: string;
    personaType?: PersonaType;
    errorType?: ValidationErrorType;
}

export interface EscalationRule {
    afterMinutes: number;
    toSeverity: AlertSeverity;
    additionalChannels?: NotificationChannel[];
}

export interface NotificationChannel {
    type: 'email' | 'slack' | 'webhook' | 'console';
    config: Record<string, any>;
    enabled: boolean;
}

export interface Alert {
    id: string;
    ruleId: string;
    type: AlertType;
    severity: AlertSeverity;
    title: string;
    message: string;
    timestamp: number;
    templateId?: string;
    personaType?: PersonaType;
    metrics: Record<string, number>;
    isResolved: boolean;
    resolvedAt?: number;
    escalatedAt?: number;
    escalatedTo?: AlertSeverity;
}

export interface AlertNotification {
    alertId: string;
    channel: NotificationChannel;
    sentAt: number;
    success: boolean;
    error?: string;
}

export interface AlertSystemConfig {
    enabled: boolean;
    checkIntervalMinutes: number;
    maxAlertsPerHour: number;
    defaultCooldownMinutes: number;
    autoResolveAfterMinutes: number;
}

/**
 * Notification handler interface for different channels
 */
export interface NotificationHandler {
    send(alert: Alert, channel: NotificationChannel): Promise<boolean>;
}

/**
 * Console notification handler for development/testing
 */
export class ConsoleNotificationHandler implements NotificationHandler {
    async send(alert: Alert, channel: NotificationChannel): Promise<boolean> {
        const severity = alert.severity.toUpperCase();
        const timestamp = new Date(alert.timestamp).toISOString();
        
        console.log(`\n🚨 [${severity}] VALIDATION ALERT - ${timestamp}`);
        console.log(`Title: ${alert.title}`);
        console.log(`Message: ${alert.message}`);
        console.log(`Template: ${alert.templateId || 'All templates'}`);
        console.log(`Persona Type: ${alert.personaType || 'All types'}`);
        console.log(`Metrics:`, alert.metrics);
        console.log('─'.repeat(60));
        
        return true;
    }
}

/**
 * Email notification handler (mock implementation)
 */
export class EmailNotificationHandler implements NotificationHandler {
    async send(alert: Alert, channel: NotificationChannel): Promise<boolean> {
        // Mock implementation - in production, integrate with email service
        console.log(`📧 Email alert sent to: ${channel.config.recipients}`);
        console.log(`Subject: [${alert.severity.toUpperCase()}] ${alert.title}`);
        console.log(`Body: ${alert.message}`);
        
        return true;
    }
}

/**
 * Webhook notification handler (mock implementation)
 */
export class WebhookNotificationHandler implements NotificationHandler {
    async send(alert: Alert, channel: NotificationChannel): Promise<boolean> {
        // Mock implementation - in production, make HTTP request to webhook URL
        console.log(`🔗 Webhook alert sent to: ${channel.config.url}`);
        console.log(`Payload:`, {
            alert_id: alert.id,
            severity: alert.severity,
            title: alert.title,
            message: alert.message,
            timestamp: alert.timestamp,
            metrics: alert.metrics
        });
        
        return true;
    }
}

export class ValidationAlertSystem {
    private metricsCollector: ValidationMetricsCollector;
    private alertRules: Map<string, AlertRule> = new Map();
    private activeAlerts: Map<string, Alert> = new Map();
    private alertHistory: Alert[] = [];
    private lastAlertTimes: Map<string, number> = new Map();
    private notificationHandlers: Map<string, NotificationHandler> = new Map();
    private config: AlertSystemConfig;
    private checkInterval?: NodeJS.Timeout;

    constructor(
        metricsCollector: ValidationMetricsCollector,
        config: Partial<AlertSystemConfig> = {}
    ) {
        this.metricsCollector = metricsCollector;
        this.config = {
            enabled: true,
            checkIntervalMinutes: 5,
            maxAlertsPerHour: 10,
            defaultCooldownMinutes: 30,
            autoResolveAfterMinutes: 60,
            ...config
        };

        // Register default notification handlers
        this.notificationHandlers.set('console', new ConsoleNotificationHandler());
        this.notificationHandlers.set('email', new EmailNotificationHandler());
        this.notificationHandlers.set('webhook', new WebhookNotificationHandler());

        // Set up default alert rules
        this.setupDefaultAlertRules();

        // Start monitoring if enabled
        if (this.config.enabled) {
            this.startMonitoring();
        }
    }

    /**
     * Adds a new alert rule
     */
    addAlertRule(rule: AlertRule): void {
        this.alertRules.set(rule.id, rule);
    }

    /**
     * Updates an existing alert rule
     */
    updateAlertRule(ruleId: string, updates: Partial<AlertRule>): boolean {
        const rule = this.alertRules.get(ruleId);
        if (!rule) {
            return false;
        }

        const updatedRule = { ...rule, ...updates };
        this.alertRules.set(ruleId, updatedRule);
        return true;
    }

    /**
     * Removes an alert rule
     */
    removeAlertRule(ruleId: string): boolean {
        return this.alertRules.delete(ruleId);
    }

    /**
     * Gets all alert rules
     */
    getAlertRules(): AlertRule[] {
        return Array.from(this.alertRules.values());
    }

    /**
     * Gets active alerts
     */
    getActiveAlerts(): Alert[] {
        return Array.from(this.activeAlerts.values());
    }

    /**
     * Gets alert history
     */
    getAlertHistory(limit: number = 100): Alert[] {
        return this.alertHistory.slice(-limit);
    }

    /**
     * Manually triggers alert evaluation
     */
    async checkAlerts(): Promise<void> {
        if (!this.config.enabled) {
            return;
        }

        const enabledRules = Array.from(this.alertRules.values()).filter(rule => rule.enabled);
        
        for (const rule of enabledRules) {
            try {
                await this.evaluateRule(rule);
            } catch (error) {
                console.error(`Error evaluating alert rule ${rule.id}:`, error);
            }
        }

        // Check for alert escalations
        await this.checkEscalations();

        // Auto-resolve old alerts
        await this.autoResolveAlerts();
    }

    /**
     * Resolves an active alert
     */
    resolveAlert(alertId: string): boolean {
        const alert = this.activeAlerts.get(alertId);
        if (!alert) {
            return false;
        }

        alert.isResolved = true;
        alert.resolvedAt = Date.now();
        
        this.activeAlerts.delete(alertId);
        this.alertHistory.push(alert);

        console.log(`✅ Alert resolved: ${alert.title}`);
        return true;
    }

    /**
     * Starts the monitoring process
     */
    startMonitoring(): void {
        if (this.checkInterval) {
            return; // Already monitoring
        }

        const intervalMs = this.config.checkIntervalMinutes * 60 * 1000;
        this.checkInterval = setInterval(() => {
            this.checkAlerts().catch(error => {
                console.error('Error during alert check:', error);
            });
        }, intervalMs);

        console.log(`🔍 Alert monitoring started (checking every ${this.config.checkIntervalMinutes} minutes)`);
    }

    /**
     * Stops the monitoring process
     */
    stopMonitoring(): void {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = undefined;
            console.log('🛑 Alert monitoring stopped');
        }
    }

    /**
     * Registers a custom notification handler
     */
    registerNotificationHandler(type: string, handler: NotificationHandler): void {
        this.notificationHandlers.set(type, handler);
    }

    // Private methods

    private setupDefaultAlertRules(): void {
        // High error rate alert
        this.addAlertRule({
            id: 'high-error-rate',
            name: 'High Validation Error Rate',
            type: AlertType.ERROR_RATE_THRESHOLD,
            severity: AlertSeverity.HIGH,
            enabled: true,
            conditions: [{
                metric: 'errorRate',
                operator: 'gt',
                threshold: 0.2, // 20% error rate
                period: '1h'
            }],
            cooldownPeriod: 30,
            escalationRules: [{
                afterMinutes: 15,
                toSeverity: AlertSeverity.CRITICAL
            }],
            notificationChannels: [{
                type: 'console',
                config: {},
                enabled: true
            }]
        });

        // High fallback usage alert
        this.addAlertRule({
            id: 'high-fallback-rate',
            name: 'High Fallback Usage Rate',
            type: AlertType.FALLBACK_RATE_THRESHOLD,
            severity: AlertSeverity.MEDIUM,
            enabled: true,
            conditions: [{
                metric: 'fallbackRate',
                operator: 'gt',
                threshold: 0.3, // 30% fallback rate
                period: '1h'
            }],
            cooldownPeriod: 60,
            notificationChannels: [{
                type: 'console',
                config: {},
                enabled: true
            }]
        });

        // Slow validation alert
        this.addAlertRule({
            id: 'slow-validation',
            name: 'Slow Validation Performance',
            type: AlertType.VALIDATION_TIME_THRESHOLD,
            severity: AlertSeverity.MEDIUM,
            enabled: true,
            conditions: [{
                metric: 'averageValidationTime',
                operator: 'gt',
                threshold: 5000, // 5 seconds
                period: '1h'
            }],
            cooldownPeriod: 45,
            notificationChannels: [{
                type: 'console',
                config: {},
                enabled: true
            }]
        });

        // Specific error type spike
        this.addAlertRule({
            id: 'structure-error-spike',
            name: 'Structure Validation Error Spike',
            type: AlertType.SPECIFIC_ERROR_SPIKE,
            severity: AlertSeverity.HIGH,
            enabled: true,
            conditions: [{
                metric: 'specificErrorRate',
                operator: 'gt',
                threshold: 0.15, // 15% of validations failing with structure errors
                period: '30m',
                errorType: ValidationErrorType.STRUCTURE_INVALID
            }],
            cooldownPeriod: 20,
            notificationChannels: [{
                type: 'console',
                config: {},
                enabled: true
            }]
        });
    }

    private async evaluateRule(rule: AlertRule): Promise<void> {
        // Check cooldown period
        const lastAlertTime = this.lastAlertTimes.get(rule.id);
        const cooldownMs = rule.cooldownPeriod * 60 * 1000;
        
        if (lastAlertTime && (Date.now() - lastAlertTime) < cooldownMs) {
            return; // Still in cooldown
        }

        // Check rate limiting
        if (!this.canSendAlert()) {
            return;
        }

        // Evaluate all conditions
        const conditionResults = await Promise.all(
            rule.conditions.map(condition => this.evaluateCondition(condition))
        );

        // All conditions must be true for the rule to trigger
        if (conditionResults.every(result => result.triggered)) {
            await this.triggerAlert(rule, conditionResults);
        }
    }

    private async evaluateCondition(condition: AlertCondition): Promise<{
        triggered: boolean;
        value: number;
        threshold: number;
    }> {
        let value: number;
        
        switch (condition.metric) {
            case 'errorRate':
                value = await this.calculateErrorRate(condition);
                break;
            case 'fallbackRate':
                value = await this.calculateFallbackRate(condition);
                break;
            case 'averageValidationTime':
                value = await this.calculateAverageValidationTime(condition);
                break;
            case 'specificErrorRate':
                value = await this.calculateSpecificErrorRate(condition);
                break;
            default:
                console.warn(`Unknown metric: ${condition.metric}`);
                return { triggered: false, value: 0, threshold: condition.threshold };
        }

        const triggered = this.evaluateOperator(value, condition.operator, condition.threshold);
        
        return { triggered, value, threshold: condition.threshold };
    }

    private async calculateErrorRate(condition: AlertCondition): Promise<number> {
        const summary = await this.metricsCollector.getMetricsSummary({
            templateId: condition.templateId,
            personaType: condition.personaType
        });

        return 1 - summary.successRate; // Error rate = 1 - success rate
    }

    private async calculateFallbackRate(condition: AlertCondition): Promise<number> {
        const summary = await this.metricsCollector.getMetricsSummary({
            templateId: condition.templateId,
            personaType: condition.personaType
        });

        return summary.fallbackUsageRate;
    }

    private async calculateAverageValidationTime(condition: AlertCondition): Promise<number> {
        const summary = await this.metricsCollector.getMetricsSummary({
            templateId: condition.templateId,
            personaType: condition.personaType
        });

        return summary.averageValidationTime;
    }

    private async calculateSpecificErrorRate(condition: AlertCondition): Promise<number> {
        if (!condition.errorType) {
            return 0;
        }

        const summary = await this.metricsCollector.getMetricsSummary({
            templateId: condition.templateId,
            personaType: condition.personaType
        });

        const errorCount = summary.errorBreakdown[condition.errorType] || 0;
        return summary.totalValidations > 0 ? errorCount / summary.totalValidations : 0;
    }

    private evaluateOperator(value: number, operator: string, threshold: number): boolean {
        switch (operator) {
            case 'gt': return value > threshold;
            case 'lt': return value < threshold;
            case 'gte': return value >= threshold;
            case 'lte': return value <= threshold;
            case 'eq': return value === threshold;
            case 'neq': return value !== threshold;
            default: return false;
        }
    }

    private async triggerAlert(
        rule: AlertRule,
        conditionResults: Array<{ triggered: boolean; value: number; threshold: number }>
    ): Promise<void> {
        const alertId = `${rule.id}-${Date.now()}`;
        const now = Date.now();

        // Create alert
        const alert: Alert = {
            id: alertId,
            ruleId: rule.id,
            type: rule.type,
            severity: rule.severity,
            title: rule.name,
            message: this.generateAlertMessage(rule, conditionResults),
            timestamp: now,
            templateId: rule.conditions[0]?.templateId,
            personaType: rule.conditions[0]?.personaType,
            metrics: this.extractMetricsFromConditions(rule.conditions, conditionResults),
            isResolved: false
        };

        // Store alert
        this.activeAlerts.set(alertId, alert);
        this.lastAlertTimes.set(rule.id, now);

        // Send notifications
        await this.sendNotifications(alert, rule.notificationChannels);

        console.log(`🚨 Alert triggered: ${alert.title} (${alert.severity})`);
    }

    private generateAlertMessage(
        rule: AlertRule,
        conditionResults: Array<{ triggered: boolean; value: number; threshold: number }>
    ): string {
        const messages: string[] = [];
        
        rule.conditions.forEach((condition, index) => {
            const result = conditionResults[index];
            if (result.triggered) {
                const metricName = condition.metric.replace(/([A-Z])/g, ' $1').toLowerCase();
                messages.push(
                    `${metricName} is ${result.value.toFixed(3)} (threshold: ${result.threshold})`
                );
            }
        });

        return `Validation alert triggered: ${messages.join(', ')}`;
    }

    private extractMetricsFromConditions(
        conditions: AlertCondition[],
        results: Array<{ triggered: boolean; value: number; threshold: number }>
    ): Record<string, number> {
        const metrics: Record<string, number> = {};
        
        conditions.forEach((condition, index) => {
            metrics[condition.metric] = results[index].value;
            metrics[`${condition.metric}_threshold`] = results[index].threshold;
        });

        return metrics;
    }

    private async sendNotifications(alert: Alert, channels: NotificationChannel[]): Promise<void> {
        const enabledChannels = channels.filter(channel => channel.enabled);
        
        for (const channel of enabledChannels) {
            const handler = this.notificationHandlers.get(channel.type);
            if (!handler) {
                console.warn(`No handler found for notification type: ${channel.type}`);
                continue;
            }

            try {
                const success = await handler.send(alert, channel);
                
                const notification: AlertNotification = {
                    alertId: alert.id,
                    channel,
                    sentAt: Date.now(),
                    success,
                    error: success ? undefined : 'Unknown error'
                };

                // In a real implementation, you might want to store notifications
                console.log(`📤 Notification sent via ${channel.type}: ${success ? 'success' : 'failed'}`);
            } catch (error) {
                console.error(`Failed to send notification via ${channel.type}:`, error);
            }
        }
    }

    private async checkEscalations(): Promise<void> {
        for (const alert of this.activeAlerts.values()) {
            if (alert.escalatedAt) {
                continue; // Already escalated
            }

            const rule = this.alertRules.get(alert.ruleId);
            if (!rule?.escalationRules) {
                continue;
            }

            const alertAge = Date.now() - alert.timestamp;
            
            for (const escalationRule of rule.escalationRules) {
                const escalationTime = escalationRule.afterMinutes * 60 * 1000;
                
                if (alertAge >= escalationTime) {
                    await this.escalateAlert(alert, escalationRule);
                    break; // Only escalate once
                }
            }
        }
    }

    private async escalateAlert(alert: Alert, escalationRule: EscalationRule): Promise<void> {
        alert.severity = escalationRule.toSeverity;
        alert.escalatedAt = Date.now();
        alert.escalatedTo = escalationRule.toSeverity;

        // Send additional notifications if specified
        if (escalationRule.additionalChannels) {
            await this.sendNotifications(alert, escalationRule.additionalChannels);
        }

        console.log(`⬆️ Alert escalated to ${escalationRule.toSeverity}: ${alert.title}`);
    }

    private async autoResolveAlerts(): Promise<void> {
        const autoResolveTime = this.config.autoResolveAfterMinutes * 60 * 1000;
        const now = Date.now();

        for (const [alertId, alert] of this.activeAlerts.entries()) {
            if ((now - alert.timestamp) >= autoResolveTime) {
                this.resolveAlert(alertId);
            }
        }
    }

    private canSendAlert(): boolean {
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        const recentAlerts = this.alertHistory.filter(alert => alert.timestamp > oneHourAgo);
        
        return recentAlerts.length < this.config.maxAlertsPerHour;
    }
}