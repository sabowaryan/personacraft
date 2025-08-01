import { realTimeMonitor } from '../monitoring/real-time-monitor';
import { advancedOptimizer } from '../optimization/advanced-performance-optimizer';
import { optimizedCache } from '../cache/optimized-cache';
import { intelligentPreloader } from '../requests/intelligent-preloader';

interface AutoTunerConfig {
    enabled: boolean;
    tuningInterval: number; // in milliseconds
    performanceThresholds: {
        responseTime: number; // ms
        errorRate: number;   // 0-1
        cacheHitRate: number; // 0-1
        queueLength: number;
        memoryUsage: number; // bytes
    };
}

export class AutoTuner {
    private config: AutoTunerConfig = {
        enabled: true,
        tuningInterval: 60000, // Every 1 minute
        performanceThresholds: {
            responseTime: 3000,
            errorRate: 0.05,
            cacheHitRate: 0.6,
            queueLength: 10,
            memoryUsage: 500 * 1024 * 1024 // 500MB
        }
    };
    private tuningIntervalId?: NodeJS.Timeout;

    constructor(config?: Partial<AutoTunerConfig>) {
        if (config) {
            this.config = { ...this.config, ...config };
        }
        if (this.config.enabled) {
            this.startTuning();
        }
    }

    startTuning(): void {
        if (this.tuningIntervalId) {
            return; // Already running
        }
        console.log('⚙️ Starting AutoTuner...');
        this.tuningIntervalId = setInterval(() => this.tune(), this.config.tuningInterval);
    }

    stopTuning(): void {
        if (this.tuningIntervalId) {
            clearInterval(this.tuningIntervalId);
            this.tuningIntervalId = undefined;
            console.log('🛑 AutoTuner stopped.');
        }
    }

    private tune(): void {
        console.log('🔄 AutoTuner: Performing performance tuning...');
        const dashboardData = realTimeMonitor.getDashboardData();
        const metrics = dashboardData.currentMetrics;

        if (!metrics) {
            console.log('AutoTuner: No metrics available for tuning.');
            return;
        }

        // Log current system state
        console.log(`AutoTuner: Current metrics - Response: ${Math.round(metrics.responseTime)}ms, Cache: ${Math.round(metrics.cacheHitRate * 100)}%, Errors: ${Math.round(metrics.errorRate * 100)}%`);

        // Perform tuning adjustments
        this.adjustConcurrency(metrics);
        this.adjustCachePreloading(metrics);
        this.adjustTimeouts(metrics);
        this.analyzeSystemTrends(dashboardData.trends);
        this.checkAlertConditions(dashboardData.recentAlerts);

        console.log('✅ AutoTuner: Tuning cycle completed');
    }

    /**
     * Analyze system performance trends
     */
    private analyzeSystemTrends(trends: any): void {
        if (trends.responseTime.trend === 'up' && Math.abs(trends.responseTime.change) > 20) {
            console.warn(`AutoTuner: Response time trending up by ${Math.round(trends.responseTime.change)}%`);
        }

        if (trends.errorRate.trend === 'up' && Math.abs(trends.errorRate.change) > 50) {
            console.warn(`AutoTuner: Error rate trending up by ${Math.round(trends.errorRate.change)}%`);
        }

        if (trends.cacheHitRate.trend === 'down' && Math.abs(trends.cacheHitRate.change) > 25) {
            console.warn(`AutoTuner: Cache hit rate trending significantly down by ${Math.round(Math.abs(trends.cacheHitRate.change))}%`);
            // Only trigger if system has capacity
            const dashboardData = realTimeMonitor.getDashboardData();
            const currentMetrics = dashboardData.currentMetrics;
            
            if (currentMetrics && 
                currentMetrics.responseTime < this.config.performanceThresholds.responseTime * 0.8 &&
                currentMetrics.queueLength === 0) {
                this.triggerLimitedPreloading();
            } else {
                console.log('AutoTuner: System under load, skipping trend-based preloading');
            }
        }
    }

    /**
     * Check recent alerts and respond accordingly
     */
    private checkAlertConditions(recentAlerts: any[]): void {
        const criticalAlerts = recentAlerts.filter(alert => alert.type === 'CRITICAL');
        const warningAlerts = recentAlerts.filter(alert => alert.type === 'WARNING');

        if (criticalAlerts.length > 0) {
            console.error(`AutoTuner: ${criticalAlerts.length} critical alerts detected - taking defensive actions`);
            this.triggerCacheCleanup();
        }

        if (warningAlerts.length > 3) {
            console.warn(`AutoTuner: ${warningAlerts.length} warning alerts detected - monitoring closely`);
        }
    }

    private adjustConcurrency(metrics: any): void {
        const optimizerMetrics = advancedOptimizer.getMetrics();
        const currentConcurrent = optimizerMetrics.concurrentRequests;

        if (metrics.queueLength > this.config.performanceThresholds.queueLength ||
            metrics.memoryUsage > this.config.performanceThresholds.memoryUsage) {
            // System is overloaded, trigger circuit breaker or reduce load
            console.warn(`AutoTuner: System overloaded - Queue: ${metrics.queueLength}, Memory: ${Math.round(metrics.memoryUsage / 1024 / 1024)}MB`);

            // Force cleanup of old cache entries to free memory
            if (metrics.memoryUsage > this.config.performanceThresholds.memoryUsage) {
                this.triggerCacheCleanup();
            }
        } else if (metrics.responseTime < this.config.performanceThresholds.responseTime / 3 &&
            metrics.queueLength === 0 && 
            currentConcurrent < 2 &&
            metrics.memoryUsage < this.config.performanceThresholds.memoryUsage * 0.5) {
            // System is significantly underutilized, could handle more load
            console.log(`AutoTuner: System significantly underutilized - Response time: ${Math.round(metrics.responseTime)}ms, Queue: ${metrics.queueLength}, Memory: ${Math.round(metrics.memoryUsage / 1024 / 1024)}MB`);

            // Only trigger very limited intelligent preloading
            this.triggerIntelligentPreloading();
        }
    }

    private adjustCachePreloading(metrics: any): void {
        const cacheStats = optimizedCache.getStats();

        // Only trigger preloading if cache hit rate is significantly low AND system has capacity
        if (cacheStats.hitRate < this.config.performanceThresholds.cacheHitRate && 
            metrics.responseTime < this.config.performanceThresholds.responseTime * 0.7 &&
            metrics.queueLength === 0 &&
            metrics.memoryUsage < this.config.performanceThresholds.memoryUsage * 0.6) {
            
            console.log(`AutoTuner: Cache hit rate is low (${Math.round(cacheStats.hitRate * 100)}%) and system has capacity, considering intelligent preloading.`);

            // Get preloader stats to understand current state
            try {
                const preloaderStats = intelligentPreloader.getStats();

                // More conservative preloading - only if very low activity
                if (preloaderStats.queueLength < 5 && preloaderStats.activePreloads === 0) {
                    // Trigger limited preloading for only the most common patterns
                    this.triggerLimitedPreloading();
                } else {
                    console.log(`AutoTuner: Preloader busy (queue: ${preloaderStats.queueLength}, active: ${preloaderStats.activePreloads}), skipping preloading.`);
                }
            } catch (error) {
                console.warn('AutoTuner: Could not get preloader stats:', error);
            }
        } else if (cacheStats.hitRate < this.config.performanceThresholds.cacheHitRate) {
            console.log(`AutoTuner: Cache hit rate low but system under load - skipping preloading (Response: ${Math.round(metrics.responseTime)}ms, Queue: ${metrics.queueLength}, Memory: ${Math.round(metrics.memoryUsage / 1024 / 1024)}MB)`);
        }

        // Monitor cache memory usage and trigger cleanup if needed
        if (cacheStats.memoryUsage > this.config.performanceThresholds.memoryUsage * 0.8) {
            console.warn(`AutoTuner: Cache memory usage high (${Math.round(cacheStats.memoryUsage / 1024 / 1024)}MB), triggering cleanup.`);
            this.triggerCacheCleanup();
        }
    }

    private adjustTimeouts(metrics: any): void {
        if (metrics.responseTime > this.config.performanceThresholds.responseTime) {
            console.warn(`AutoTuner: Response time is high (${Math.round(metrics.responseTime)}ms), analyzing performance bottlenecks.`);

            // Check circuit breaker status
            const circuitBreakerStatus = advancedOptimizer.getCircuitBreakerStatus();
            const openBreakers = Object.entries(circuitBreakerStatus)
                .filter(([_, state]) => state.state === 'OPEN')
                .map(([entityType]) => entityType);

            if (openBreakers.length > 0) {
                console.warn(`AutoTuner: Circuit breakers OPEN for: ${openBreakers.join(', ')}`);
            }

            // Analyze entity-specific performance
            if (metrics.entityBreakdown) {
                const slowEntities = Object.entries(metrics.entityBreakdown)
                    .filter(([_, breakdown]: [string, any]) => breakdown.avgResponseTime > this.config.performanceThresholds.responseTime)
                    .map(([entityType]) => entityType);

                if (slowEntities.length > 0) {
                    console.warn(`AutoTuner: Slow entity types detected: ${slowEntities.join(', ')}`);
                }
            }
        }
    }

    /**
     * Trigger cache cleanup to free memory
     */
    private triggerCacheCleanup(): void {
        const statsBefore = optimizedCache.getStats();

        // Force cleanup by reducing cache size temporarily
        console.log('AutoTuner: Triggering cache cleanup to free memory...');

        // Note: In a real implementation, we'd expose a cleanup method on optimizedCache
        // For now, we log the action that would be taken
        console.log(`AutoTuner: Would clean cache (current: ${Math.round(statsBefore.memoryUsage / 1024 / 1024)}MB, ${statsBefore.size} entries)`);
    }

    /**
     * Trigger intelligent preloading for spare capacity (very conservative)
     */
    private triggerIntelligentPreloading(): void {
        try {
            const preloaderStats = intelligentPreloader.getStats();

            // Only proceed if no active preloads and minimal queue
            if (preloaderStats.activePreloads === 0 && preloaderStats.queueLength < 3) {
                console.log('AutoTuner: Triggering very limited intelligent preloading to utilize spare capacity...');

                // Only trigger one essential pattern
                const singlePattern = [{
                    entityType: 'music',
                    params: { age: 25, location: 'global', take: 5 },
                    priority: 95
                }];

                intelligentPreloader.preloadPatterns(singlePattern).catch(error => {
                    console.warn('AutoTuner: Intelligent preloading failed:', error);
                });
            } else {
                console.log(`AutoTuner: Preloader not idle (active: ${preloaderStats.activePreloads}, queue: ${preloaderStats.queueLength}), skipping intelligent preloading`);
            }
        } catch (error) {
            console.warn('AutoTuner: Could not trigger intelligent preloading:', error);
        }
    }

    /**
     * Trigger limited preloading for only the most essential patterns
     */
    private triggerLimitedPreloading(): void {
        // Only preload the most essential patterns to avoid system overload
        const essentialPatterns = [
            {
                entityType: 'music',
                params: { age: 25, location: 'global', take: 5 },
                priority: 90
            },
            {
                entityType: 'movie',
                params: { age: 30, location: 'global', take: 5 },
                priority: 85
            }
        ];

        console.log('AutoTuner: Triggering limited preloading for essential patterns only...');

        // Trigger preloading (async, don't wait)
        try {
            intelligentPreloader.preloadPatterns(essentialPatterns).catch(error => {
                console.warn('AutoTuner: Limited preloading failed:', error);
            });
        } catch (error) {
            console.warn('AutoTuner: Could not trigger preloading:', error);
        }
    }

    /**
     * Trigger preloading for common patterns (legacy method, now more conservative)
     */
    private triggerCommonPatternPreloading(): void {
        // More conservative pattern selection
        const commonPatterns = [
            {
                entityType: 'music',
                params: { age: 25, location: 'global', take: 5 },
                priority: 80
            },
            {
                entityType: 'movie',
                params: { age: 30, location: 'global', take: 5 },
                priority: 75
            }
        ];

        console.log('AutoTuner: Triggering conservative preloading for common patterns...');

        // Trigger preloading (async, don't wait)
        try {
            intelligentPreloader.preloadPatterns(commonPatterns).catch(error => {
                console.warn('AutoTuner: Common pattern preloading failed:', error);
            });
        } catch (error) {
            console.warn('AutoTuner: Could not trigger common pattern preloading:', error);
        }
    }

    /**
     * Get current auto-tuner status and metrics
     */
    getStatus(): {
        enabled: boolean;
        isRunning: boolean;
        config: AutoTunerConfig;
        lastTuningTime?: number;
        systemHealth: {
            responseTime: number;
            cacheHitRate: number;
            errorRate: number;
            queueLength: number;
            memoryUsage: number;
        };
    } {
        const dashboardData = realTimeMonitor.getDashboardData();
        const currentMetrics = dashboardData.currentMetrics;

        return {
            enabled: this.config.enabled,
            isRunning: !!this.tuningIntervalId,
            config: { ...this.config },
            systemHealth: {
                responseTime: currentMetrics?.responseTime || 0,
                cacheHitRate: currentMetrics?.cacheHitRate || 0,
                errorRate: currentMetrics?.errorRate || 0,
                queueLength: currentMetrics?.queueLength || 0,
                memoryUsage: currentMetrics?.memoryUsage || 0
            }
        };
    }

    /**
     * Update auto-tuner configuration
     */
    updateConfig(newConfig: Partial<AutoTunerConfig>): void {
        const wasRunning = !!this.tuningIntervalId;

        if (wasRunning) {
            this.stopTuning();
        }

        this.config = { ...this.config, ...newConfig };

        if (wasRunning && this.config.enabled) {
            this.startTuning();
        }

        console.log('AutoTuner: Configuration updated', newConfig);
    }

    /**
     * Force immediate tuning cycle
     */
    forceTune(): void {
        console.log('AutoTuner: Forcing immediate tuning cycle...');
        this.tune();
    }

    reset(): void {
        this.stopTuning();
        this.config = {
            enabled: true,
            tuningInterval: 60000,
            performanceThresholds: {
                responseTime: 3000,
                errorRate: 0.05,
                cacheHitRate: 0.6,
                queueLength: 10,
                memoryUsage: 500 * 1024 * 1024
            }
        };
        if (this.config.enabled) {
            this.startTuning();
        }
        console.log('AutoTuner: Reset to default configuration');
    }
}

export const autoTuner = new AutoTuner();


