/**
 * Tests for ValidationAlertSystem
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
    ValidationAlertSystem,
    AlertRule,
    AlertType,
    AlertSeverity,
    AlertCondition,
    NotificationHandler,
    ConsoleNotificationHandler,
    EmailNotificationHandler,
    WebhookNotificationHandler
} from './alert-system';
import { ValidationMetricsCollector } from './metrics-collector';
import {
    ValidationErrorType,
    PersonaType
} from '../../types/validation';

// Mock ValidationMetricsCollector
const mockMetricsCollector = {
    getMetricsSummary: vi.fn(),
    getMetrics: vi.fn(),
    getAggregatedMetrics: vi.fn(),
    collectMetrics: vi.fn(),
    cleanup: vi.fn(),
    setEnabled: vi.fn(),
    isCollectionEnabled: vi.fn(),
    getMetricsByTemplate: vi.fn()
} as unknown as ValidationMetricsCollector;

describe('ValidationAlertSystem', () => {
    let alertSystem: ValidationAlertSystem;

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock default metrics summary
        vi.mocked(mockMetricsCollector.getMetricsSummary).mockResolvedValue({
            totalValidations: 100,
            successRate: 0.9,
            averageScore: 0.85,
            averageValidationTime: 1000,
            errorBreakdown: {
                [ValidationErrorType.STRUCTURE_INVALID]: 5,
                [ValidationErrorType.REQUIRED_FIELD_MISSING]: 3,
                [ValidationErrorType.TYPE_MISMATCH]: 0,
                [ValidationErrorType.VALUE_OUT_OF_RANGE]: 0,
                [ValidationErrorType.FORMAT_INVALID]: 2,
                [ValidationErrorType.CULTURAL_DATA_INCONSISTENT]: 0,
                [ValidationErrorType.BUSINESS_RULE_VIOLATION]: 0,
                [ValidationErrorType.TEMPLATE_NOT_FOUND]: 0,
                [ValidationErrorType.VALIDATION_TIMEOUT]: 0
            },
            fallbackUsageRate: 0.1,
            topFailingRules: []
        });

        alertSystem = new ValidationAlertSystem(mockMetricsCollector, {
            enabled: false, // Disable auto-monitoring for tests
            checkIntervalMinutes: 1,
            maxAlertsPerHour: 5,
            defaultCooldownMinutes: 10,
            autoResolveAfterMinutes: 30
        });
    });

    afterEach(() => {
        alertSystem.stopMonitoring();
    });

    describe('Alert Rule Management', () => {
        it('should add alert rules', () => {
            const rule: AlertRule = {
                id: 'test-rule',
                name: 'Test Rule',
                type: AlertType.ERROR_RATE_THRESHOLD,
                severity: AlertSeverity.HIGH,
                enabled: true,
                conditions: [{
                    metric: 'errorRate',
                    operator: 'gt',
                    threshold: 0.2,
                    period: '1h'
                }],
                cooldownPeriod: 30,
                notificationChannels: [{
                    type: 'console',
                    config: {},
                    enabled: true
                }]
            };

            alertSystem.addAlertRule(rule);
            const rules = alertSystem.getAlertRules();

            expect(rules).toContainEqual(rule);
        });

        it('should update alert rules', () => {
            const rule: AlertRule = {
                id: 'test-rule',
                name: 'Test Rule',
                type: AlertType.ERROR_RATE_THRESHOLD,
                severity: AlertSeverity.HIGH,
                enabled: true,
                conditions: [{
                    metric: 'errorRate',
                    operator: 'gt',
                    threshold: 0.2,
                    period: '1h'
                }],
                cooldownPeriod: 30,
                notificationChannels: []
            };

            alertSystem.addAlertRule(rule);

            const updated = alertSystem.updateAlertRule('test-rule', {
                severity: AlertSeverity.CRITICAL,
                enabled: false
            });

            expect(updated).toBe(true);

            const rules = alertSystem.getAlertRules();
            const updatedRule = rules.find(r => r.id === 'test-rule');

            expect(updatedRule?.severity).toBe(AlertSeverity.CRITICAL);
            expect(updatedRule?.enabled).toBe(false);
        });

        it('should remove alert rules', () => {
            const rule: AlertRule = {
                id: 'test-rule',
                name: 'Test Rule',
                type: AlertType.ERROR_RATE_THRESHOLD,
                severity: AlertSeverity.HIGH,
                enabled: true,
                conditions: [],
                cooldownPeriod: 30,
                notificationChannels: []
            };

            alertSystem.addAlertRule(rule);
            expect(alertSystem.getAlertRules()).toHaveLength(5); // 4 default + 1 added

            const removed = alertSystem.removeAlertRule('test-rule');
            expect(removed).toBe(true);
            expect(alertSystem.getAlertRules()).toHaveLength(4); // Back to 4 default rules
        });

        it('should return false when updating non-existent rule', () => {
            const updated = alertSystem.updateAlertRule('non-existent', { enabled: false });
            expect(updated).toBe(false);
        });

        it('should return false when removing non-existent rule', () => {
            const removed = alertSystem.removeAlertRule('non-existent');
            expect(removed).toBe(false);
        });
    });

    describe('Alert Evaluation', () => {
        it('should trigger alert when error rate exceeds threshold', async () => {
            // Mock high error rate
            vi.mocked(mockMetricsCollector.getMetricsSummary).mockResolvedValue({
                totalValidations: 100,
                successRate: 0.7, // 30% error rate
                averageScore: 0.75,
                averageValidationTime: 1000,
                errorBreakdown: {
                    [ValidationErrorType.STRUCTURE_INVALID]: 15,
                    [ValidationErrorType.REQUIRED_FIELD_MISSING]: 10,
                    [ValidationErrorType.TYPE_MISMATCH]: 3,
                    [ValidationErrorType.VALUE_OUT_OF_RANGE]: 2,
                    [ValidationErrorType.FORMAT_INVALID]: 0,
                    [ValidationErrorType.CULTURAL_DATA_INCONSISTENT]: 0,
                    [ValidationErrorType.BUSINESS_RULE_VIOLATION]: 0,
                    [ValidationErrorType.TEMPLATE_NOT_FOUND]: 0,
                    [ValidationErrorType.VALIDATION_TIMEOUT]: 0
                },
                fallbackUsageRate: 0.1,
                topFailingRules: []
            });

            // Enable the alert system for this test
            alertSystem['config'].enabled = true;

            await alertSystem.checkAlerts();

            const activeAlerts = alertSystem.getActiveAlerts();
            expect(activeAlerts).toHaveLength(1);
            expect(activeAlerts[0].type).toBe(AlertType.ERROR_RATE_THRESHOLD);
            expect(activeAlerts[0].severity).toBe(AlertSeverity.HIGH);
        });

        it('should trigger alert when fallback rate exceeds threshold', async () => {
            // Mock high fallback rate
            vi.mocked(mockMetricsCollector.getMetricsSummary).mockResolvedValue({
                totalValidations: 100,
                successRate: 0.95,
                averageScore: 0.85,
                averageValidationTime: 1000,
                errorBreakdown: {
                    [ValidationErrorType.STRUCTURE_INVALID]: 2,
                    [ValidationErrorType.REQUIRED_FIELD_MISSING]: 1,
                    [ValidationErrorType.TYPE_MISMATCH]: 1,
                    [ValidationErrorType.VALUE_OUT_OF_RANGE]: 1,
                    [ValidationErrorType.FORMAT_INVALID]: 0,
                    [ValidationErrorType.CULTURAL_DATA_INCONSISTENT]: 0,
                    [ValidationErrorType.BUSINESS_RULE_VIOLATION]: 0,
                    [ValidationErrorType.TEMPLATE_NOT_FOUND]: 0,
                    [ValidationErrorType.VALIDATION_TIMEOUT]: 0
                },
                fallbackUsageRate: 0.4, // 40% fallback rate
                topFailingRules: []
            });

            // Enable the alert system for this test
            alertSystem['config'].enabled = true;

            await alertSystem.checkAlerts();

            const activeAlerts = alertSystem.getActiveAlerts();
            expect(activeAlerts).toHaveLength(1);
            expect(activeAlerts[0].type).toBe(AlertType.FALLBACK_RATE_THRESHOLD);
            expect(activeAlerts[0].severity).toBe(AlertSeverity.MEDIUM);
        });

        it('should trigger alert when validation time exceeds threshold', async () => {
            // Mock slow validation
            vi.mocked(mockMetricsCollector.getMetricsSummary).mockResolvedValue({
                totalValidations: 100,
                successRate: 0.95,
                averageScore: 0.85,
                averageValidationTime: 6000, // 6 seconds
                errorBreakdown: {
                    [ValidationErrorType.STRUCTURE_INVALID]: 2,
                    [ValidationErrorType.REQUIRED_FIELD_MISSING]: 1,
                    [ValidationErrorType.TYPE_MISMATCH]: 1,
                    [ValidationErrorType.VALUE_OUT_OF_RANGE]: 1,
                    [ValidationErrorType.FORMAT_INVALID]: 0,
                    [ValidationErrorType.CULTURAL_DATA_INCONSISTENT]: 0,
                    [ValidationErrorType.BUSINESS_RULE_VIOLATION]: 0,
                    [ValidationErrorType.TEMPLATE_NOT_FOUND]: 0,
                    [ValidationErrorType.VALIDATION_TIMEOUT]: 0
                },
                fallbackUsageRate: 0.1,
                topFailingRules: []
            });

            // Enable the alert system for this test
            alertSystem['config'].enabled = true;

            await alertSystem.checkAlerts();

            const activeAlerts = alertSystem.getActiveAlerts();
            expect(activeAlerts).toHaveLength(1);
            expect(activeAlerts[0].type).toBe(AlertType.VALIDATION_TIME_THRESHOLD);
            expect(activeAlerts[0].severity).toBe(AlertSeverity.MEDIUM);
        });

        it('should trigger alert for specific error type spike', async () => {
            // Mock structure error spike
            vi.mocked(mockMetricsCollector.getMetricsSummary).mockResolvedValue({
                totalValidations: 100,
                successRate: 0.85,
                averageScore: 0.8,
                averageValidationTime: 1000,
                errorBreakdown: {
                    [ValidationErrorType.STRUCTURE_INVALID]: 20, // 20% structure errors
                    [ValidationErrorType.REQUIRED_FIELD_MISSING]: 5,
                    [ValidationErrorType.TYPE_MISMATCH]: 3,
                    [ValidationErrorType.VALUE_OUT_OF_RANGE]: 2,
                    [ValidationErrorType.FORMAT_INVALID]: 0,
                    [ValidationErrorType.CULTURAL_DATA_INCONSISTENT]: 0,
                    [ValidationErrorType.BUSINESS_RULE_VIOLATION]: 0,
                    [ValidationErrorType.TEMPLATE_NOT_FOUND]: 0,
                    [ValidationErrorType.VALIDATION_TIMEOUT]: 0
                },
                fallbackUsageRate: 0.1,
                topFailingRules: []
            });

            // Enable the alert system for this test
            alertSystem['config'].enabled = true;

            await alertSystem.checkAlerts();

            const activeAlerts = alertSystem.getActiveAlerts();
            expect(activeAlerts).toHaveLength(1);
            expect(activeAlerts[0].type).toBe(AlertType.SPECIFIC_ERROR_SPIKE);
            expect(activeAlerts[0].severity).toBe(AlertSeverity.HIGH);
        });

        it('should not trigger alert when conditions are not met', async () => {
            // Mock normal metrics (all within thresholds)
            vi.mocked(mockMetricsCollector.getMetricsSummary).mockResolvedValue({
                totalValidations: 100,
                successRate: 0.95, // 5% error rate (below 20% threshold)
                averageScore: 0.9,
                averageValidationTime: 1000, // Below 5000ms threshold
                errorBreakdown: {
                    [ValidationErrorType.STRUCTURE_INVALID]: 2, // 2% structure errors (below 15% threshold)
                    [ValidationErrorType.REQUIRED_FIELD_MISSING]: 1,
                    [ValidationErrorType.TYPE_MISMATCH]: 1,
                    [ValidationErrorType.VALUE_OUT_OF_RANGE]: 1,
                    [ValidationErrorType.FORMAT_INVALID]: 0,
                    [ValidationErrorType.CULTURAL_DATA_INCONSISTENT]: 0,
                    [ValidationErrorType.BUSINESS_RULE_VIOLATION]: 0,
                    [ValidationErrorType.TEMPLATE_NOT_FOUND]: 0,
                    [ValidationErrorType.VALIDATION_TIMEOUT]: 0
                },
                fallbackUsageRate: 0.1, // Below 30% threshold
                topFailingRules: []
            });

            await alertSystem.checkAlerts();

            const activeAlerts = alertSystem.getActiveAlerts();
            expect(activeAlerts).toHaveLength(0);
        });

        it('should respect cooldown period', async () => {
            // Mock high error rate
            vi.mocked(mockMetricsCollector.getMetricsSummary).mockResolvedValue({
                totalValidations: 100,
                successRate: 0.7, // 30% error rate
                averageScore: 0.75,
                averageValidationTime: 1000,
                errorBreakdown: {
                    [ValidationErrorType.STRUCTURE_INVALID]: 15,
                    [ValidationErrorType.REQUIRED_FIELD_MISSING]: 10,
                    [ValidationErrorType.TYPE_MISMATCH]: 3,
                    [ValidationErrorType.VALUE_OUT_OF_RANGE]: 2,
                    [ValidationErrorType.FORMAT_INVALID]: 0,
                    [ValidationErrorType.CULTURAL_DATA_INCONSISTENT]: 0,
                    [ValidationErrorType.BUSINESS_RULE_VIOLATION]: 0,
                    [ValidationErrorType.TEMPLATE_NOT_FOUND]: 0,
                    [ValidationErrorType.VALIDATION_TIMEOUT]: 0
                },
                fallbackUsageRate: 0.1,
                topFailingRules: []
            });

            // Enable the alert system for this test
            alertSystem['config'].enabled = true;

            // First check should trigger alert
            await alertSystem.checkAlerts();
            expect(alertSystem.getActiveAlerts()).toHaveLength(1);

            // Resolve the alert
            const alerts = alertSystem.getActiveAlerts();
            alertSystem.resolveAlert(alerts[0].id);

            // Second check immediately should not trigger due to cooldown
            await alertSystem.checkAlerts();
            expect(alertSystem.getActiveAlerts()).toHaveLength(0);
        });
    });

    describe('Alert Resolution', () => {
        it('should resolve active alerts', async () => {
            // Trigger an alert first
            vi.mocked(mockMetricsCollector.getMetricsSummary).mockResolvedValue({
                totalValidations: 100,
                successRate: 0.7,
                averageScore: 0.75,
                averageValidationTime: 1000,
                errorBreakdown: {
                    [ValidationErrorType.STRUCTURE_INVALID]: 15,
                    [ValidationErrorType.REQUIRED_FIELD_MISSING]: 10,
                    [ValidationErrorType.TYPE_MISMATCH]: 3,
                    [ValidationErrorType.VALUE_OUT_OF_RANGE]: 2,
                    [ValidationErrorType.FORMAT_INVALID]: 0,
                    [ValidationErrorType.CULTURAL_DATA_INCONSISTENT]: 0,
                    [ValidationErrorType.BUSINESS_RULE_VIOLATION]: 0,
                    [ValidationErrorType.TEMPLATE_NOT_FOUND]: 0,
                    [ValidationErrorType.VALIDATION_TIMEOUT]: 0
                },
                fallbackUsageRate: 0.1,
                topFailingRules: []
            });

            // Enable the alert system for this test
            alertSystem['config'].enabled = true;

            await alertSystem.checkAlerts();
            const activeAlerts = alertSystem.getActiveAlerts();
            expect(activeAlerts).toHaveLength(1);

            const alertId = activeAlerts[0].id;
            const resolved = alertSystem.resolveAlert(alertId);

            expect(resolved).toBe(true);
            expect(alertSystem.getActiveAlerts()).toHaveLength(0);
            expect(alertSystem.getAlertHistory()).toHaveLength(1);
            expect(alertSystem.getAlertHistory()[0].isResolved).toBe(true);
            expect(alertSystem.getAlertHistory()[0].resolvedAt).toBeDefined();
        });

        it('should return false when resolving non-existent alert', () => {
            const resolved = alertSystem.resolveAlert('non-existent');
            expect(resolved).toBe(false);
        });
    });

    describe('Monitoring Control', () => {
        it('should start and stop monitoring', () => {
            expect(alertSystem['checkInterval']).toBeUndefined();

            alertSystem.startMonitoring();
            expect(alertSystem['checkInterval']).toBeDefined();

            alertSystem.stopMonitoring();
            expect(alertSystem['checkInterval']).toBeUndefined();
        });

        it('should not start monitoring twice', () => {
            alertSystem.startMonitoring();
            const firstInterval = alertSystem['checkInterval'];

            alertSystem.startMonitoring();
            const secondInterval = alertSystem['checkInterval'];

            expect(firstInterval).toBe(secondInterval);

            alertSystem.stopMonitoring();
        });
    });

    describe('Custom Notification Handlers', () => {
        it('should register custom notification handlers', () => {
            const customHandler: NotificationHandler = {
                send: vi.fn().mockResolvedValue(true)
            };

            alertSystem.registerNotificationHandler('custom', customHandler);

            // Verify handler is registered by checking internal state
            expect(alertSystem['notificationHandlers'].has('custom')).toBe(true);
        });
    });
});

describe('Notification Handlers', () => {
    const mockAlert = {
        id: 'test-alert',
        ruleId: 'test-rule',
        type: AlertType.ERROR_RATE_THRESHOLD,
        severity: AlertSeverity.HIGH,
        title: 'Test Alert',
        message: 'Test alert message',
        timestamp: Date.now(),
        metrics: { errorRate: 0.3 },
        isResolved: false
    };

    describe('ConsoleNotificationHandler', () => {
        it('should send console notifications', async () => {
            const handler = new ConsoleNotificationHandler();
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

            const channel = {
                type: 'console' as const,
                config: {},
                enabled: true
            };

            const result = await handler.send(mockAlert, channel);

            expect(result).toBe(true);
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('EmailNotificationHandler', () => {
        it('should send email notifications', async () => {
            const handler = new EmailNotificationHandler();
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

            const channel = {
                type: 'email' as const,
                config: { recipients: ['admin@example.com'] },
                enabled: true
            };

            const result = await handler.send(mockAlert, channel);

            expect(result).toBe(true);
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('WebhookNotificationHandler', () => {
        it('should send webhook notifications', async () => {
            const handler = new WebhookNotificationHandler();
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

            const channel = {
                type: 'webhook' as const,
                config: { url: 'https://example.com/webhook' },
                enabled: true
            };

            const result = await handler.send(mockAlert, channel);

            expect(result).toBe(true);
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });
});