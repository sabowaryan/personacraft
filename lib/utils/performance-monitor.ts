/**
 * Performance monitoring utilities for PersonaCraft
 * Implements Core Web Vitals monitoring and performance budgets
 */

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  
  // Custom metrics
  personaRenderTime?: number;
  componentLoadTime?: number;
  dataFetchTime?: number;
  
  // Navigation timing
  navigationStart?: number;
  domContentLoaded?: number;
  loadComplete?: number;
  
  // Memory usage
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
}

export interface PerformanceBudget {
  lcp: number; // 2.5s
  fid: number; // 100ms
  cls: number; // 0.1
  fcp: number; // 1.8s
  ttfb: number; // 600ms
  personaRenderTime: number; // 1s
  componentLoadTime: number; // 500ms
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics = {};
  private budget: PerformanceBudget = {
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    fcp: 1800,
    ttfb: 600,
    personaRenderTime: 1000,
    componentLoadTime: 500
  };
  
  private observers: PerformanceObserver[] = [];
  private isMonitoring = false;

  private constructor() {
    this.initializeMonitoring();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeMonitoring(): void {
    if (typeof window === 'undefined' || this.isMonitoring) return;

    try {
      // Monitor Core Web Vitals
      this.observeLCP();
      this.observeFID();
      this.observeCLS();
      this.observeFCP();
      this.observeTTFB();
      
      // Monitor navigation timing
      this.observeNavigationTiming();
      
      // Monitor memory usage
      this.observeMemoryUsage();
      
      this.isMonitoring = true;
    } catch (error) {
      console.warn('Performance monitoring initialization failed:', error);
    }
  }

  private observeLCP(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
        
        this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime || 0;
        this.checkBudget('lcp', this.metrics.lcp);
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('LCP observation failed:', error);
    }
  }

  private observeFID(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.fid = entry.processingStart - entry.startTime;
          this.checkBudget('fid', this.metrics.fid);
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('FID observation failed:', error);
    }
  }

  private observeCLS(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        this.metrics.cls = clsValue;
        this.checkBudget('cls', this.metrics.cls);
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('CLS observation failed:', error);
    }
  }

  private observeFCP(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime;
            this.checkBudget('fcp', this.metrics.fcp);
          }
        });
      });
      
      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('FCP observation failed:', error);
    }
  }

  private observeTTFB(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.entryType === 'navigation') {
            this.metrics.ttfb = entry.responseStart - entry.requestStart;
            this.checkBudget('ttfb', this.metrics.ttfb);
          }
        });
      });
      
      observer.observe({ entryTypes: ['navigation'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('TTFB observation failed:', error);
    }
  }

  private observeNavigationTiming(): void {
    if (typeof window === 'undefined' || !window.performance) return;

    window.addEventListener('load', () => {
      const timing = window.performance.timing;
      this.metrics.navigationStart = timing.navigationStart;
      this.metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
      this.metrics.loadComplete = timing.loadEventEnd - timing.navigationStart;
    });
  }

  private observeMemoryUsage(): void {
    if (typeof window === 'undefined' || !('memory' in window.performance)) return;

    const updateMemoryMetrics = () => {
      const memory = (window.performance as any).memory;
      this.metrics.usedJSHeapSize = memory.usedJSHeapSize;
      this.metrics.totalJSHeapSize = memory.totalJSHeapSize;
      this.metrics.jsHeapSizeLimit = memory.jsHeapSizeLimit;
    };

    updateMemoryMetrics();
    setInterval(updateMemoryMetrics, 5000); // Update every 5 seconds
  }

  public measurePersonaRender<T>(fn: () => T, personaId?: string): T {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    
    const renderTime = endTime - startTime;
    this.metrics.personaRenderTime = renderTime;
    
    this.checkBudget('personaRenderTime', renderTime);
    
    // Log performance data for monitoring
    this.logPerformanceData('persona-render', {
      personaId,
      renderTime,
      timestamp: Date.now()
    });
    
    return result;
  }

  public measureComponentLoad<T>(componentName: string, fn: () => T): T {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    
    const loadTime = endTime - startTime;
    this.metrics.componentLoadTime = loadTime;
    
    this.checkBudget('componentLoadTime', loadTime);
    
    // Log component performance
    this.logPerformanceData('component-load', {
      componentName,
      loadTime,
      timestamp: Date.now()
    });
    
    return result;
  }

  public async measureDataFetch<T>(fetchFn: () => Promise<T>, operation?: string): Promise<T> {
    const startTime = performance.now();
    const result = await fetchFn();
    const endTime = performance.now();
    
    const fetchTime = endTime - startTime;
    this.metrics.dataFetchTime = fetchTime;
    
    // Log data fetch performance
    this.logPerformanceData('data-fetch', {
      operation,
      fetchTime,
      timestamp: Date.now()
    });
    
    return result;
  }

  private checkBudget(metric: keyof PerformanceBudget, value: number): void {
    const budgetValue = this.budget[metric];
    if (value > budgetValue) {
      console.warn(`Performance budget exceeded for ${metric}: ${value}ms > ${budgetValue}ms`);
      
      // Send alert to monitoring service in production
      if (process.env.NODE_ENV === 'production') {
        this.sendPerformanceAlert(metric, value, budgetValue);
      }
    }
  }

  private logPerformanceData(type: string, data: any): void {
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${type}:`, data);
    }
    
    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(type, data);
    }
  }

  private sendPerformanceAlert(metric: string, actual: number, budget: number): void {
    // Implementation for sending alerts to monitoring service
    // This could be Sentry, DataDog, or custom monitoring
    console.error(`Performance Alert: ${metric} exceeded budget`, {
      metric,
      actual,
      budget,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });
  }

  private sendToAnalytics(type: string, data: any): void {
    // Implementation for sending performance data to analytics
    // This could be Google Analytics, Mixpanel, or custom analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance_metric', {
        event_category: 'Performance',
        event_label: type,
        value: Math.round(data.renderTime || data.loadTime || data.fetchTime || 0),
        custom_map: data
      });
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getBudgetStatus(): Record<keyof PerformanceBudget, { value: number; budget: number; status: 'good' | 'warning' | 'poor' }> {
    const status: any = {};
    
    Object.keys(this.budget).forEach((key) => {
      const metric = key as keyof PerformanceBudget;
      const value = this.metrics[metric] || 0;
      const budget = this.budget[metric];
      
      let statusValue: 'good' | 'warning' | 'poor' = 'good';
      if (value > budget) {
        statusValue = 'poor';
      } else if (value > budget * 0.8) {
        statusValue = 'warning';
      }
      
      status[metric] = { value, budget, status: statusValue };
    });
    
    return status;
  }

  public generatePerformanceReport(): string {
    const metrics = this.getMetrics();
    const budgetStatus = this.getBudgetStatus();
    
    let report = '# PersonaCraft Performance Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    
    report += '## Core Web Vitals\n';
    report += `- LCP: ${metrics.lcp?.toFixed(2) || 'N/A'}ms (Budget: ${this.budget.lcp}ms)\n`;
    report += `- FID: ${metrics.fid?.toFixed(2) || 'N/A'}ms (Budget: ${this.budget.fid}ms)\n`;
    report += `- CLS: ${metrics.cls?.toFixed(3) || 'N/A'} (Budget: ${this.budget.cls})\n`;
    report += `- FCP: ${metrics.fcp?.toFixed(2) || 'N/A'}ms (Budget: ${this.budget.fcp}ms)\n`;
    report += `- TTFB: ${metrics.ttfb?.toFixed(2) || 'N/A'}ms (Budget: ${this.budget.ttfb}ms)\n\n`;
    
    report += '## Custom Metrics\n';
    report += `- Persona Render Time: ${metrics.personaRenderTime?.toFixed(2) || 'N/A'}ms\n`;
    report += `- Component Load Time: ${metrics.componentLoadTime?.toFixed(2) || 'N/A'}ms\n`;
    report += `- Data Fetch Time: ${metrics.dataFetchTime?.toFixed(2) || 'N/A'}ms\n\n`;
    
    if (metrics.usedJSHeapSize) {
      report += '## Memory Usage\n';
      report += `- Used JS Heap: ${(metrics.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB\n`;
      report += `- Total JS Heap: ${(metrics.totalJSHeapSize! / 1024 / 1024).toFixed(2)} MB\n`;
      report += `- JS Heap Limit: ${(metrics.jsHeapSizeLimit! / 1024 / 1024).toFixed(2)} MB\n\n`;
    }
    
    report += '## Budget Status\n';
    Object.entries(budgetStatus).forEach(([key, status]) => {
      const emoji = status.status === 'good' ? '✅' : status.status === 'warning' ? '⚠️' : '❌';
      report += `${emoji} ${key}: ${status.value.toFixed(2)} / ${status.budget} (${status.status})\n`;
    });
    
    return report;
  }

  public cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.isMonitoring = false;
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const monitor = PerformanceMonitor.getInstance();
  
  return {
    measureRender: monitor.measurePersonaRender.bind(monitor),
    measureComponent: monitor.measureComponentLoad.bind(monitor),
    measureFetch: monitor.measureDataFetch.bind(monitor),
    getMetrics: monitor.getMetrics.bind(monitor),
    getBudgetStatus: monitor.getBudgetStatus.bind(monitor),
    generateReport: monitor.generatePerformanceReport.bind(monitor)
  };
}