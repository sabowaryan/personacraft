/**
 * QlooPerformanceMonitor Service
 * 
 * Comprehensive performance monitoring and metrics tracking for the Qloo-first persona generation flow.
 * This service provides detailed monitoring, logging, and metrics collection for debugging and optimization.
 * 
 * Requirements: 6.4, 6.5
 */

import { PerformanceMetrics, QlooSignals, CulturalConstraints } from '@/types/qloo-first';

/**
 * Detailed performance metrics with step-by-step timing
 */
export interface DetailedPerformanceMetrics extends PerformanceMetrics {
    // Step-by-step timing
    signalExtractionTime: number;
    culturalDataFetchTime: number;
    promptEnrichmentTime: number;
    geminiRequestTime: number;
    culturalIntegrationTime: number;
    
    // API call details
    qlooApiCallDetails: {
        entityType: string;
        duration: number;
        cacheHit: boolean;
        itemsReturned: number;
    }[];
    
    // Cache performance
    cacheMetrics: {
        totalRequests: number;
        cacheHits: number;
        cacheMisses: number;
        hitRate: number;
        avgCacheResponseTime: number;
        avgApiResponseTime: number;
    };
    
    // Memory and resource usage
    resourceMetrics: {
        peakMemoryUsage: number;
        avgCpuUsage: number;
        concurrentRequests: number;
    };
    
    // Quality metrics
    qualityMetrics: {
        culturalDataCompleteness: number; // 0-1 score
        constraintDiversity: number; // 0-1 score
        dataFreshness: number; // hours since last update
    };
}

/**
 * Performance monitoring configuration
 */
export interface MonitoringConfig {
    enableDetailedLogging: boolean;
    enableResourceMonitoring: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    metricsRetentionHours: number;
    performanceThresholds: {
        maxTotalTime: number;
        maxQlooApiTime: number;
        maxGeminiTime: number;
        minCacheHitRate: number;
    };
}

/**
 * Performance alert types
 */
export enum PerformanceAlert {
    SLOW_QLOO_API = 'SLOW_QLOO_API',
    LOW_CACHE_HIT_RATE = 'LOW_CACHE_HIT_RATE',
    HIGH_MEMORY_USAGE = 'HIGH_MEMORY_USAGE',
    POOR_DATA_QUALITY = 'POOR_DATA_QUALITY',
    EXCESSIVE_API_CALLS = 'EXCESSIVE_API_CALLS'
}

/**
 * Performance alert details
 */
export interface PerformanceAlertDetails {
    type: PerformanceAlert;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    metrics: Partial<DetailedPerformanceMetrics>;
    timestamp: number;
    suggestions: string[];
}

/**
 * Default monitoring configuration
 */
const DEFAULT_MONITORING_CONFIG: MonitoringConfig = {
    enableDetailedLogging: false,
    enableResourceMonitoring: true,
    logLevel: 'info',
    metricsRetentionHours: 24,
    performanceThresholds: {
        maxTotalTime: 30000, // 30 seconds
        maxQlooApiTime: 15000, // 15 seconds
        maxGeminiTime: 10000, // 10 seconds
        minCacheHitRate: 0.3 // 30%
    }
};

/**
 * Comprehensive performance monitoring service for Qloo-first flow
 */
export class QlooPerformanceMonitor {
    private config: MonitoringConfig;
    private currentMetrics: DetailedPerformanceMetrics;
    private metricsHistory: DetailedPerformanceMetrics[] = [];
    private alerts: PerformanceAlertDetails[] = [];
    private startTime: number = 0;
    private stepTimers: Map<string, number> = new Map();

    constructor(config: Partial<MonitoringConfig> = {}) {
        this.config = { ...DEFAULT_MONITORING_CONFIG, ...config };
        this.currentMetrics = this.initializeMetrics();
    }

    /**
     * Start monitoring a new generation flow
     */
    startMonitoring(): void {
        this.startTime = Date.now();
        this.currentMetrics = this.initializeMetrics();
        this.stepTimers.clear();
        
        if (this.config.enableDetailedLogging) {
            this.log('info', '🚀 Performance monitoring started', {
                timestamp: this.startTime,
                config: this.config
            });
        }
    }

    /**
     * Start timing a specific step
     */
    startStep(stepName: string): void {
        this.stepTimers.set(stepName, Date.now());
        
        if (this.config.enableDetailedLogging) {
            this.log('debug', `⏱️ Started step: ${stepName}`, {
                step: stepName,
                timestamp: Date.now()
            });
        }
    }

    /**
     * End timing a specific step and record the duration
     */
    endStep(stepName: string): number {
        const startTime = this.stepTimers.get(stepName);
        if (!startTime) {
            this.log('warn', `⚠️ No start time found for step: ${stepName}`);
            return 0;
        }

        const duration = Date.now() - startTime;
        this.stepTimers.delete(stepName);

        // Record step duration in metrics
        switch (stepName) {
            case 'signalExtraction':
                this.currentMetrics.signalExtractionTime = duration;
                break;
            case 'culturalDataFetch':
                this.currentMetrics.culturalDataFetchTime = duration;
                this.currentMetrics.qlooExtractionTime = duration;
                break;
            case 'promptEnrichment':
                this.currentMetrics.promptEnrichmentTime = duration;
                this.currentMetrics.promptBuildingTime = duration;
                break;
            case 'geminiRequest':
                this.currentMetrics.geminiRequestTime = duration;
                this.currentMetrics.geminiGenerationTime = duration;
                break;
            case 'culturalIntegration':
                this.currentMetrics.culturalIntegrationTime = duration;
                break;
        }

        if (this.config.enableDetailedLogging) {
            this.log('debug', `✅ Completed step: ${stepName}`, {
                step: stepName,
                duration,
                timestamp: Date.now()
            });
        }

        return duration;
    }

    /**
     * Record Qloo API call details
     */
    recordQlooApiCall(entityType: string, duration: number, cacheHit: boolean, itemsReturned: number): void {
        this.currentMetrics.qlooApiCallDetails.push({
            entityType,
            duration,
            cacheHit,
            itemsReturned
        });

        // Update cache metrics
        this.currentMetrics.cacheMetrics.totalRequests++;
        if (cacheHit) {
            this.currentMetrics.cacheMetrics.cacheHits++;
            this.currentMetrics.cacheMetrics.avgCacheResponseTime = 
                (this.currentMetrics.cacheMetrics.avgCacheResponseTime + duration) / 2;
        } else {
            this.currentMetrics.cacheMetrics.cacheMisses++;
            this.currentMetrics.cacheMetrics.avgApiResponseTime = 
                (this.currentMetrics.cacheMetrics.avgApiResponseTime + duration) / 2;
        }

        // Update hit rate
        this.currentMetrics.cacheMetrics.hitRate = 
            this.currentMetrics.cacheMetrics.cacheHits / this.currentMetrics.cacheMetrics.totalRequests;
        this.currentMetrics.cacheHitRate = this.currentMetrics.cacheMetrics.hitRate;

        // Update API calls count
        this.currentMetrics.qlooApiCallsCount = this.currentMetrics.qlooApiCallDetails.length;

        if (this.config.enableDetailedLogging) {
            this.log('debug', `📊 Qloo API call recorded: ${entityType}`, {
                entityType,
                duration,
                cacheHit,
                itemsReturned,
                currentHitRate: this.currentMetrics.cacheHitRate
            });
        }
    }

    /**
     * Log cultural constraint application for debugging
     */
    logCulturalConstraints(signals: QlooSignals, constraints: CulturalConstraints): void {
        const constraintSummary = this.analyzeCulturalConstraints(constraints);
        
        this.log('info', '🎨 Cultural constraints applied', {
            signals: {
                location: signals.demographics.location,
                ageRange: signals.demographics.ageRange,
                interests: signals.interests.length,
                values: signals.values.length,
                personaCount: signals.culturalContext.personaCount
            },
            constraints: constraintSummary,
            qualityScore: this.currentMetrics.qualityMetrics.culturalDataCompleteness
        });

        // Update quality metrics
        this.updateQualityMetrics(constraints);
    }

    /**
     * Record resource usage metrics
     */
    recordResourceUsage(): void {
        if (!this.config.enableResourceMonitoring) return;

        try {
            // Get memory usage (Node.js specific)
            const memUsage = process.memoryUsage();
            this.currentMetrics.resourceMetrics.peakMemoryUsage = Math.max(
                this.currentMetrics.resourceMetrics.peakMemoryUsage,
                memUsage.heapUsed
            );

            // Estimate concurrent requests (simplified)
            this.currentMetrics.resourceMetrics.concurrentRequests = this.stepTimers.size;

            if (this.config.enableDetailedLogging) {
                this.log('debug', '💾 Resource usage recorded', {
                    memoryUsage: {
                        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
                        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB'
                    },
                    concurrentRequests: this.currentMetrics.resourceMetrics.concurrentRequests
                });
            }
        } catch (error) {
            this.log('warn', '⚠️ Failed to record resource usage', { error });
        }
    }

    /**
     * Complete monitoring and finalize metrics
     */
    completeMonitoring(): DetailedPerformanceMetrics {
        this.currentMetrics.totalProcessingTime = Date.now() - this.startTime;
        
        // Record final resource usage
        this.recordResourceUsage();
        
        // Check for performance alerts
        this.checkPerformanceThresholds();
        
        // Add to history
        this.metricsHistory.push({ ...this.currentMetrics });
        
        // Clean up old metrics
        this.cleanupMetricsHistory();
        
        if (this.config.enableDetailedLogging) {
            this.log('info', '✅ Performance monitoring completed', {
                totalTime: this.currentMetrics.totalProcessingTime,
                cacheHitRate: this.currentMetrics.cacheHitRate,
                apiCalls: this.currentMetrics.qlooApiCallsCount,
                qualityScore: this.currentMetrics.qualityMetrics.culturalDataCompleteness
            });
        }

        return { ...this.currentMetrics };
    }

    /**
     * Get current performance metrics
     */
    getCurrentMetrics(): DetailedPerformanceMetrics {
        return { ...this.currentMetrics };
    }

    /**
     * Get metrics history
     */
    getMetricsHistory(): DetailedPerformanceMetrics[] {
        return [...this.metricsHistory];
    }

    /**
     * Get performance alerts
     */
    getAlerts(): PerformanceAlertDetails[] {
        return [...this.alerts];
    }

    /**
     * Get aggregated performance statistics
     */
    getAggregatedStats(): {
        avgTotalTime: number;
        avgCacheHitRate: number;
        avgApiCalls: number;
        avgQualityScore: number;
        totalGenerations: number;
    } {
        if (this.metricsHistory.length === 0) {
            return {
                avgTotalTime: 0,
                avgCacheHitRate: 0,
                avgApiCalls: 0,
                avgQualityScore: 0,
                totalGenerations: 0
            };
        }

        const totals = this.metricsHistory.reduce((acc, metrics) => ({
            totalTime: acc.totalTime + metrics.totalProcessingTime,
            cacheHitRate: acc.cacheHitRate + metrics.cacheHitRate,
            apiCalls: acc.apiCalls + metrics.qlooApiCallsCount,
            qualityScore: acc.qualityScore + metrics.qualityMetrics.culturalDataCompleteness
        }), { totalTime: 0, cacheHitRate: 0, apiCalls: 0, qualityScore: 0 });

        const count = this.metricsHistory.length;

        return {
            avgTotalTime: totals.totalTime / count,
            avgCacheHitRate: totals.cacheHitRate / count,
            avgApiCalls: totals.apiCalls / count,
            avgQualityScore: totals.qualityScore / count,
            totalGenerations: count
        };
    }

    /**
     * Update monitoring configuration
     */
    updateConfig(newConfig: Partial<MonitoringConfig>): void {
        this.config = { ...this.config, ...newConfig };
        
        this.log('info', '⚙️ Monitoring configuration updated', {
            newConfig: newConfig
        });
    }

    /**
     * Initialize metrics structure
     */
    private initializeMetrics(): DetailedPerformanceMetrics {
        return {
            // Basic metrics
            qlooExtractionTime: 0,
            qlooApiCallsCount: 0,
            promptBuildingTime: 0,
            geminiGenerationTime: 0,
            totalProcessingTime: 0,
            cacheHitRate: 0,

            // Detailed step timing
            signalExtractionTime: 0,
            culturalDataFetchTime: 0,
            promptEnrichmentTime: 0,
            geminiRequestTime: 0,
            culturalIntegrationTime: 0,

            // API call details
            qlooApiCallDetails: [],

            // Cache performance
            cacheMetrics: {
                totalRequests: 0,
                cacheHits: 0,
                cacheMisses: 0,
                hitRate: 0,
                avgCacheResponseTime: 0,
                avgApiResponseTime: 0
            },

            // Resource metrics
            resourceMetrics: {
                peakMemoryUsage: 0,
                avgCpuUsage: 0,
                concurrentRequests: 0
            },

            // Quality metrics
            qualityMetrics: {
                culturalDataCompleteness: 0,
                constraintDiversity: 0,
                dataFreshness: 0
            }
        };
    }

    /**
     * Analyze cultural constraints for quality and completeness
     */
    private analyzeCulturalConstraints(constraints: CulturalConstraints): any {
        const categories = Object.keys(constraints);
        const totalItems = Object.values(constraints).reduce((sum, items) => sum + items.length, 0);
        const nonEmptyCategories = Object.values(constraints).filter(items => items.length > 0).length;
        
        const summary = {
            totalCategories: categories.length,
            categoriesWithData: nonEmptyCategories,
            totalItems,
            avgItemsPerCategory: totalItems / categories.length,
            completeness: nonEmptyCategories / categories.length,
            diversity: this.calculateConstraintDiversity(constraints),
            breakdown: Object.fromEntries(
                Object.entries(constraints).map(([key, items]) => [key, items.length])
            )
        };

        return summary;
    }

    /**
     * Calculate constraint diversity score
     */
    private calculateConstraintDiversity(constraints: CulturalConstraints): number {
        const itemCounts = Object.values(constraints).map(items => items.length);
        const maxItems = Math.max(...itemCounts);
        
        if (maxItems === 0) return 0;
        
        // Diversity is higher when items are more evenly distributed
        const variance = itemCounts.reduce((sum, count) => {
            const avg = itemCounts.reduce((s, c) => s + c, 0) / itemCounts.length;
            return sum + Math.pow(count - avg, 2);
        }, 0) / itemCounts.length;
        
        // Normalize to 0-1 scale (lower variance = higher diversity)
        return Math.max(0, 1 - (variance / Math.pow(maxItems, 2)));
    }

    /**
     * Update quality metrics based on cultural constraints
     */
    private updateQualityMetrics(constraints: CulturalConstraints): void {
        const analysis = this.analyzeCulturalConstraints(constraints);
        
        this.currentMetrics.qualityMetrics.culturalDataCompleteness = analysis.completeness;
        this.currentMetrics.qualityMetrics.constraintDiversity = analysis.diversity;
        this.currentMetrics.qualityMetrics.dataFreshness = 0; // Would need timestamp data from Qloo
    }

    /**
     * Check performance thresholds and generate alerts
     */
    private checkPerformanceThresholds(): void {
        const thresholds = this.config.performanceThresholds;

        // Check total processing time
        if (this.currentMetrics.totalProcessingTime > thresholds.maxTotalTime) {
            this.addAlert({
                type: PerformanceAlert.SLOW_QLOO_API,
                severity: 'high',
                message: `Total processing time (${this.currentMetrics.totalProcessingTime}ms) exceeded threshold (${thresholds.maxTotalTime}ms)`,
                metrics: { totalProcessingTime: this.currentMetrics.totalProcessingTime },
                timestamp: Date.now(),
                suggestions: [
                    'Consider optimizing Qloo API calls',
                    'Implement more aggressive caching',
                    'Review prompt complexity'
                ]
            });
        }

        // Check cache hit rate
        if (this.currentMetrics.cacheHitRate < thresholds.minCacheHitRate) {
            this.addAlert({
                type: PerformanceAlert.LOW_CACHE_HIT_RATE,
                severity: 'medium',
                message: `Cache hit rate (${(this.currentMetrics.cacheHitRate * 100).toFixed(1)}%) below threshold (${(thresholds.minCacheHitRate * 100).toFixed(1)}%)`,
                metrics: { cacheHitRate: this.currentMetrics.cacheHitRate },
                timestamp: Date.now(),
                suggestions: [
                    'Review cache key generation strategy',
                    'Increase cache TTL for stable data',
                    'Implement cache warming for common requests'
                ]
            });
        }

        // Check data quality
        if (this.currentMetrics.qualityMetrics.culturalDataCompleteness < 0.5) {
            this.addAlert({
                type: PerformanceAlert.POOR_DATA_QUALITY,
                severity: 'medium',
                message: `Cultural data completeness (${(this.currentMetrics.qualityMetrics.culturalDataCompleteness * 100).toFixed(1)}%) is low`,
                metrics: { qualityMetrics: this.currentMetrics.qualityMetrics },
                timestamp: Date.now(),
                suggestions: [
                    'Review Qloo API response handling',
                    'Implement better fallback strategies',
                    'Check API key permissions and rate limits'
                ]
            });
        }

        // Check excessive API calls
        if (this.currentMetrics.qlooApiCallsCount > 20) {
            this.addAlert({
                type: PerformanceAlert.EXCESSIVE_API_CALLS,
                severity: 'high',
                message: `High number of API calls (${this.currentMetrics.qlooApiCallsCount}) detected`,
                metrics: { qlooApiCallsCount: this.currentMetrics.qlooApiCallsCount },
                timestamp: Date.now(),
                suggestions: [
                    'Implement request batching',
                    'Optimize entity type selection',
                    'Review signal extraction logic'
                ]
            });
        }
    }

    /**
     * Add a performance alert
     */
    private addAlert(alert: PerformanceAlertDetails): void {
        this.alerts.push(alert);
        
        // Log alert based on severity
        const logLevel = alert.severity === 'critical' ? 'error' : 
                        alert.severity === 'high' ? 'warn' : 'info';
        
        this.log(logLevel, `🚨 Performance Alert: ${alert.message}`, {
            type: alert.type,
            severity: alert.severity,
            suggestions: alert.suggestions
        });
    }

    /**
     * Clean up old metrics from history
     */
    private cleanupMetricsHistory(): void {
        const cutoffTime = Date.now() - (this.config.metricsRetentionHours * 60 * 60 * 1000);
        this.metricsHistory = this.metricsHistory.filter(
            () => this.startTime > cutoffTime
        );
    }

    /**
     * Centralized logging with configurable levels
     */
    private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
        const levels = { debug: 0, info: 1, warn: 2, error: 3 };
        const configLevel = levels[this.config.logLevel];
        const messageLevel = levels[level];

        if (messageLevel < configLevel) return;

        const timestamp = new Date().toISOString();

        switch (level) {
            case 'error':
                console.error(`[${timestamp}] ERROR: ${message}`, data || '');
                break;
            case 'warn':
                console.warn(`[${timestamp}] WARN: ${message}`, data || '');
                break;
            case 'info':
                console.log(`[${timestamp}] INFO: ${message}`, data || '');
                break;
            case 'debug':
                console.log(`[${timestamp}] DEBUG: ${message}`, data || '');
                break;
        }
    }
}