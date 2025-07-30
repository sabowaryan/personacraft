export class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private metrics: Map<string, { count: number; totalTime: number; avgTime: number }> = new Map();

    static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    startTimer(operation: string): () => void {
        const startTime = Date.now();
        
        return () => {
            const duration = Date.now() - startTime;
            this.recordMetric(operation, duration);
        };
    }

    private recordMetric(operation: string, duration: number): void {
        const existing = this.metrics.get(operation) || { count: 0, totalTime: 0, avgTime: 0 };
        existing.count++;
        existing.totalTime += duration;
        existing.avgTime = existing.totalTime / existing.count;
        
        this.metrics.set(operation, existing);
        
        console.log(`⏱️ ${operation}: ${duration}ms (avg: ${existing.avgTime.toFixed(0)}ms)`);
    }

    getMetrics(): Record<string, { count: number; totalTime: number; avgTime: number }> {
        const result: Record<string, { count: number; totalTime: number; avgTime: number }> = {};
        for (const [key, value] of this.metrics.entries()) {
            result[key] = { ...value };
        }
        return result;
    }

    reset(): void {
        this.metrics.clear();
    }
}