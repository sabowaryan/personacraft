import { realTimeMonitor } from './real-time-monitor';
import { advancedOptimizer } from './advanced-performance-optimizer';
import { optimizedCache } from './optimized-cache';
import { intelligentPreloader } from './intelligent-preloader';

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
        const metrics = realTimeMonitor.getDashboardData().currentMetrics;
        if (!metrics) {
            console.log('AutoTuner: No metrics available for tuning.');
            return;
        }

        this.adjustConcurrency(metrics);
        this.adjustCachePreloading(metrics);
        this.adjustTimeouts(metrics);
        // Add more tuning logic here based on other metrics
    }

    private adjustConcurrency(metrics: any): void {
        const currentMaxConcurrent = advancedOptimizer.getMetrics().concurrentRequests;
        let newMaxConcurrent = currentMaxConcurrent;

        if (metrics.queueLength > this.config.performanceThresholds.queueLength ||
            metrics.memoryUsage > this.config.performanceThresholds.memoryUsage) {
            // System is overloaded, reduce concurrency
            newMaxConcurrent = Math.max(1, currentMaxConcurrent - 1);
            console.warn(`AutoTuner: Reducing max concurrent requests to ${newMaxConcurrent} due to high load.`);
        } else if (metrics.responseTime < this.config.performanceThresholds.responseTime / 2 &&
                   metrics.queueLength === 0) {
            // System is underutilized, increase concurrency
            newMaxConcurrent = currentMaxConcurrent + 1;
            console.log(`AutoTuner: Increasing max concurrent requests to ${newMaxConcurrent} due to low utilization.`);
        }
        // Note: advancedOptimizer.config.maxConcurrentRequests is private, so we can't directly set it here.
        // In a real scenario, advancedOptimizer would expose a method to update its config.
        // For now, we'll just log the intended change.
    }

    private adjustCachePreloading(metrics: any): void {
        if (metrics.cacheHitRate < this.config.performanceThresholds.cacheHitRate) {
            console.log('AutoTuner: Cache hit rate is low, triggering cache warm-up.');
            // intelligentPreloader.warmCacheIntelligently() or similar
            // This would require intelligentPreloader to expose a method for manual warm-up or pattern analysis.
        }
    }

    private adjustTimeouts(metrics: any): void {
        if (metrics.responseTime > this.config.performanceThresholds.responseTime) {
            console.warn('AutoTuner: Response time is high, considering timeout adjustments.');
            // advancedOptimizer.adjustAdaptiveTimeout() or similar
            // This would require advancedOptimizer to expose a method to adjust its adaptive timeout parameters.
        }
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
        this.startTuning();
    }
}

export const autoTuner = new AutoTuner();


