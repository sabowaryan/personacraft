/**
 * Bundle size analysis and optimization utilities
 * Helps monitor and optimize JavaScript bundle sizes
 */

export interface BundleMetrics {
  totalSize: number;
  gzippedSize: number;
  chunks: ChunkInfo[];
  dependencies: DependencyInfo[];
  recommendations: string[];
}

export interface ChunkInfo {
  name: string;
  size: number;
  gzippedSize: number;
  modules: string[];
  isAsync: boolean;
}

export interface DependencyInfo {
  name: string;
  size: number;
  version: string;
  isDevDependency: boolean;
  unusedExports?: string[];
}

export interface BundleBudget {
  maxTotalSize: number; // 250KB
  maxChunkSize: number; // 100KB
  maxDependencySize: number; // 50KB
  criticalChunkBudget: number; // 150KB
}

export class BundleAnalyzer {
  private static instance: BundleAnalyzer;
  private budget: BundleBudget = {
    maxTotalSize: 250 * 1024, // 250KB
    maxChunkSize: 100 * 1024, // 100KB
    maxDependencySize: 50 * 1024, // 50KB
    criticalChunkBudget: 150 * 1024 // 150KB
  };

  private constructor() {}

  public static getInstance(): BundleAnalyzer {
    if (!BundleAnalyzer.instance) {
      BundleAnalyzer.instance = new BundleAnalyzer();
    }
    return BundleAnalyzer.instance;
  }

  public async analyzeBundleSize(): Promise<BundleMetrics> {
    const metrics: BundleMetrics = {
      totalSize: 0,
      gzippedSize: 0,
      chunks: [],
      dependencies: [],
      recommendations: []
    };

    try {
      // In a real implementation, this would analyze the actual bundle
      // For now, we'll simulate the analysis
      metrics.chunks = await this.analyzeChunks();
      metrics.dependencies = await this.analyzeDependencies();
      metrics.totalSize = metrics.chunks.reduce((sum, chunk) => sum + chunk.size, 0);
      metrics.gzippedSize = metrics.chunks.reduce((sum, chunk) => sum + chunk.gzippedSize, 0);
      metrics.recommendations = this.generateRecommendations(metrics);

    } catch (error) {
      console.error('Bundle analysis failed:', error);
    }

    return metrics;
  }

  private async analyzeChunks(): Promise<ChunkInfo[]> {
    // Simulate chunk analysis
    // In a real implementation, this would parse webpack stats or use bundler APIs
    return [
      {
        name: 'main',
        size: 180 * 1024,
        gzippedSize: 60 * 1024,
        modules: ['app', 'components', 'lib'],
        isAsync: false
      },
      {
        name: 'persona-result',
        size: 45 * 1024,
        gzippedSize: 15 * 1024,
        modules: ['persona-result', 'persona-metrics', 'persona-visualizations'],
        isAsync: true
      },
      {
        name: 'vendor',
        size: 120 * 1024,
        gzippedSize: 40 * 1024,
        modules: ['react', 'next', 'tailwindcss'],
        isAsync: false
      }
    ];
  }

  private async analyzeDependencies(): Promise<DependencyInfo[]> {
    // Simulate dependency analysis
    // In a real implementation, this would analyze package.json and node_modules
    return [
      {
        name: 'react',
        size: 42 * 1024,
        version: '18.2.0',
        isDevDependency: false
      },
      {
        name: 'next',
        size: 78 * 1024,
        version: '15.0.0',
        isDevDependency: false
      },
      {
        name: 'lucide-react',
        size: 25 * 1024,
        version: '0.263.1',
        isDevDependency: false,
        unusedExports: ['Calendar', 'Clock'] // Example unused icons
      },
      {
        name: '@radix-ui/react-tabs',
        size: 15 * 1024,
        version: '1.0.4',
        isDevDependency: false
      }
    ];
  }

  private generateRecommendations(metrics: BundleMetrics): string[] {
    const recommendations: string[] = [];

    // Check total bundle size
    if (metrics.totalSize > this.budget.maxTotalSize) {
      recommendations.push(
        `Total bundle size (${this.formatBytes(metrics.totalSize)}) exceeds budget (${this.formatBytes(this.budget.maxTotalSize)}). Consider code splitting.`
      );
    }

    // Check individual chunks
    metrics.chunks.forEach(chunk => {
      if (chunk.size > this.budget.maxChunkSize) {
        recommendations.push(
          `Chunk "${chunk.name}" (${this.formatBytes(chunk.size)}) exceeds budget (${this.formatBytes(this.budget.maxChunkSize)}). Consider splitting further.`
        );
      }
    });

    // Check dependencies
    metrics.dependencies.forEach(dep => {
      if (dep.size > this.budget.maxDependencySize) {
        recommendations.push(
          `Dependency "${dep.name}" (${this.formatBytes(dep.size)}) is large. Consider alternatives or tree shaking.`
        );
      }

      if (dep.unusedExports && dep.unusedExports.length > 0) {
        recommendations.push(
          `Dependency "${dep.name}" has unused exports: ${dep.unusedExports.join(', ')}. Enable tree shaking.`
        );
      }
    });

    // Persona-specific recommendations
    const personaChunk = metrics.chunks.find(c => c.name.includes('persona'));
    if (personaChunk && personaChunk.size > 30 * 1024) {
      recommendations.push(
        'Consider lazy loading persona visualization components to reduce initial bundle size.'
      );
    }

    // General optimization recommendations
    if (metrics.gzippedSize / metrics.totalSize > 0.4) {
      recommendations.push(
        'Bundle compression ratio is low. Consider enabling better compression or removing duplicate code.'
      );
    }

    return recommendations;
  }

  public checkBudgets(metrics: BundleMetrics): Record<string, { status: 'good' | 'warning' | 'exceeded'; actual: number; budget: number }> {
    return {
      totalSize: {
        status: metrics.totalSize > this.budget.maxTotalSize ? 'exceeded' : 
                metrics.totalSize > this.budget.maxTotalSize * 0.8 ? 'warning' : 'good',
        actual: metrics.totalSize,
        budget: this.budget.maxTotalSize
      },
      largestChunk: {
        status: Math.max(...metrics.chunks.map(c => c.size)) > this.budget.maxChunkSize ? 'exceeded' :
                Math.max(...metrics.chunks.map(c => c.size)) > this.budget.maxChunkSize * 0.8 ? 'warning' : 'good',
        actual: Math.max(...metrics.chunks.map(c => c.size)),
        budget: this.budget.maxChunkSize
      }
    };
  }

  public generateOptimizationPlan(metrics: BundleMetrics): string[] {
    const plan: string[] = [];

    // Code splitting recommendations
    if (metrics.totalSize > this.budget.maxTotalSize) {
      plan.push('Implement dynamic imports for persona detail components');
      plan.push('Split vendor dependencies into separate chunks');
      plan.push('Use React.lazy() for non-critical UI components');
    }

    // Tree shaking recommendations
    const hasUnusedExports = metrics.dependencies.some(dep => dep.unusedExports && dep.unusedExports.length > 0);
    if (hasUnusedExports) {
      plan.push('Enable tree shaking in webpack/bundler configuration');
      plan.push('Use named imports instead of default imports where possible');
      plan.push('Remove unused utility functions and components');
    }

    // Compression recommendations
    if (metrics.gzippedSize / metrics.totalSize > 0.4) {
      plan.push('Enable Brotli compression on the server');
      plan.push('Optimize images and use next/image for automatic optimization');
      plan.push('Minify CSS and remove unused styles');
    }

    // Persona-specific optimizations
    plan.push('Lazy load persona visualization charts');
    plan.push('Implement virtual scrolling for large persona lists');
    plan.push('Cache persona data to reduce re-renders');
    plan.push('Use React.memo for expensive persona components');

    return plan;
  }

  public async generateBundleReport(): Promise<string> {
    const metrics = await this.analyzeBundleSize();
    const budgetStatus = this.checkBudgets(metrics);
    const optimizationPlan = this.generateOptimizationPlan(metrics);

    let report = '# PersonaCraft Bundle Analysis Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;

    // Overview
    report += '## Bundle Overview\n';
    report += `- Total Size: ${this.formatBytes(metrics.totalSize)}\n`;
    report += `- Gzipped Size: ${this.formatBytes(metrics.gzippedSize)}\n`;
    report += `- Compression Ratio: ${((1 - metrics.gzippedSize / metrics.totalSize) * 100).toFixed(1)}%\n`;
    report += `- Number of Chunks: ${metrics.chunks.length}\n\n`;

    // Budget Status
    report += '## Budget Status\n';
    Object.entries(budgetStatus).forEach(([key, status]) => {
      const emoji = status.status === 'good' ? '✅' : status.status === 'warning' ? '⚠️' : '❌';
      report += `${emoji} ${key}: ${this.formatBytes(status.actual)} / ${this.formatBytes(status.budget)} (${status.status})\n`;
    });
    report += '\n';

    // Chunks
    report += '## Chunks Analysis\n';
    metrics.chunks.forEach(chunk => {
      report += `### ${chunk.name}\n`;
      report += `- Size: ${this.formatBytes(chunk.size)}\n`;
      report += `- Gzipped: ${this.formatBytes(chunk.gzippedSize)}\n`;
      report += `- Type: ${chunk.isAsync ? 'Async' : 'Sync'}\n`;
      report += `- Modules: ${chunk.modules.join(', ')}\n\n`;
    });

    // Dependencies
    report += '## Dependencies Analysis\n';
    metrics.dependencies.forEach(dep => {
      report += `### ${dep.name} (${dep.version})\n`;
      report += `- Size: ${this.formatBytes(dep.size)}\n`;
      report += `- Type: ${dep.isDevDependency ? 'Dev' : 'Production'}\n`;
      if (dep.unusedExports && dep.unusedExports.length > 0) {
        report += `- Unused Exports: ${dep.unusedExports.join(', ')}\n`;
      }
      report += '\n';
    });

    // Recommendations
    if (metrics.recommendations.length > 0) {
      report += '## Recommendations\n';
      metrics.recommendations.forEach(rec => {
        report += `- ${rec}\n`;
      });
      report += '\n';
    }

    // Optimization Plan
    if (optimizationPlan.length > 0) {
      report += '## Optimization Plan\n';
      optimizationPlan.forEach((step, index) => {
        report += `${index + 1}. ${step}\n`;
      });
    }

    return report;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
export const bundleAnalyzer = BundleAnalyzer.getInstance();

// React hook for bundle analysis
export function useBundleAnalyzer() {
  const analyzer = BundleAnalyzer.getInstance();
  
  return {
    analyzeBundleSize: analyzer.analyzeBundleSize.bind(analyzer),
    checkBudgets: analyzer.checkBudgets.bind(analyzer),
    generateReport: analyzer.generateBundleReport.bind(analyzer)
  };
}