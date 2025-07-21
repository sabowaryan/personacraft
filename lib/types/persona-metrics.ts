/**
 * TypeScript interfaces for persona quality metrics and performance indicators
 * Supporting the redesigned metrics display system
 */

// Core persona metrics structure
export interface PersonaMetrics {
  qualityScore: number; // Overall quality score (0-100)
  completionScore: number; // Data completion percentage (0-100)
  engagementLevel: 'low' | 'medium' | 'high';
  dataRichness: number; // Amount of cultural data (0-100)
  culturalAccuracy: number; // Cultural data accuracy (0-100)
  marketingRelevance: number; // Marketing utility score (0-100)
  validationMetrics: PersonaValidationMetrics;
  performanceMetrics: PersonaPerformanceMetrics;
  trends: MetricsTrend[];
}

// Detailed validation metrics for quality assessment
export interface PersonaValidationMetrics {
  completeness: MetricDetail;
  consistency: MetricDetail;
  realism: MetricDetail;
  culturalAuthenticity: MetricDetail;
  marketingUtility: MetricDetail;
  dataQuality: MetricDetail;
}

// Individual metric detail structure
export interface MetricDetail {
  score: number; // 0-100
  status: 'excellent' | 'good' | 'average' | 'poor';
  trend: 'up' | 'down' | 'stable';
  details: MetricBreakdown;
  recommendations: string[];
  lastUpdated: string;
}

// Breakdown of metric components
export interface MetricBreakdown {
  components: MetricComponent[];
  weightedScore: number;
  missingElements: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface MetricComponent {
  name: string;
  score: number;
  weight: number;
  description: string;
  status: 'complete' | 'partial' | 'missing';
}

// Performance metrics for system optimization
export interface PersonaPerformanceMetrics {
  generationTime: number; // milliseconds
  dataProcessingTime: number; // milliseconds
  culturalDataFetch: number; // milliseconds
  validationTime: number; // milliseconds
  totalProcessingTime: number; // milliseconds
  apiCalls: ApiCallMetrics;
  cacheHitRate: number; // percentage
  errorRate: number; // percentage
}

export interface ApiCallMetrics {
  gemini: ApiCallDetail;
  qloo: ApiCallDetail;
  total: number;
  failed: number;
  retries: number;
}

export interface ApiCallDetail {
  calls: number;
  averageLatency: number;
  successRate: number;
  errors: string[];
}

// Trend analysis for metrics over time
export interface MetricsTrend {
  metric: string;
  timeframe: 'hour' | 'day' | 'week' | 'month';
  dataPoints: TrendDataPoint[];
  direction: 'improving' | 'declining' | 'stable';
  changePercentage: number;
}

export interface TrendDataPoint {
  timestamp: string;
  value: number;
  context?: string;
}

// Quality score calculation configuration
export interface QualityScoreConfig {
  weights: {
    completeness: number;
    consistency: number;
    realism: number;
    culturalAccuracy: number;
    marketingRelevance: number;
  };
  thresholds: {
    excellent: number;
    good: number;
    average: number;
  };
  penalties: {
    missingData: number;
    inconsistency: number;
    unrealistic: number;
  };
}

// Metric display configuration
export interface MetricDisplayConfig {
  showTrends: boolean;
  showBreakdown: boolean;
  showRecommendations: boolean;
  animateChanges: boolean;
  updateInterval: number; // seconds
  compactMode: boolean;
}

// Metric card configuration for UI
export interface MetricCardConfig {
  type: 'completeness' | 'consistency' | 'realism' | 'performance' | 'cultural' | 'marketing';
  title: string;
  description: string;
  icon: React.ComponentType;
  color: string;
  format: 'percentage' | 'score' | 'time' | 'count';
  showTrend: boolean;
  interactive: boolean;
}

// Comparison metrics for multiple personas
export interface PersonaComparison {
  personas: string[]; // persona IDs
  metrics: ComparisonMetric[];
  summary: ComparisonSummary;
  recommendations: ComparisonRecommendation[];
}

export interface ComparisonMetric {
  name: string;
  values: { [personaId: string]: number };
  best: string; // persona ID with best score
  worst: string; // persona ID with worst score
  average: number;
  variance: number;
}

export interface ComparisonSummary {
  totalPersonas: number;
  averageQuality: number;
  bestPerformer: string;
  mostImproved: string;
  needsAttention: string[];
}

export interface ComparisonRecommendation {
  type: 'improve' | 'maintain' | 'investigate';
  personaId: string;
  metric: string;
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
}

// Benchmark data for industry comparison
export interface IndustryBenchmark {
  industry: string;
  averageScores: {
    [metric: string]: number;
  };
  percentiles: {
    [metric: string]: {
      p25: number;
      p50: number;
      p75: number;
      p90: number;
    };
  };
  lastUpdated: string;
}

// Alert and notification types for metrics
export interface MetricAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  metric: string;
  personaId: string;
  message: string;
  threshold: number;
  currentValue: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  acknowledged: boolean;
  actions: AlertAction[];
}

export interface AlertAction {
  label: string;
  action: () => void;
  type: 'primary' | 'secondary';
}

// Metric calculation utilities
export interface MetricCalculation {
  formula: string;
  inputs: { [key: string]: number };
  result: number;
  confidence: number;
  explanation: string;
}

// Export types for metrics data
export interface MetricsExport {
  personaId: string;
  exportDate: string;
  metrics: PersonaMetrics;
  trends: MetricsTrend[];
  benchmarks?: IndustryBenchmark;
  format: 'json' | 'csv' | 'pdf';
}

// Visualization data for charts and graphs
export interface MetricsVisualization {
  chartType: 'radar' | 'bar' | 'line' | 'donut' | 'gauge';
  data: ChartDataPoint[];
  config: ChartConfig;
  interactive: boolean;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: { [key: string]: any };
}

export interface ChartConfig {
  title: string;
  subtitle?: string;
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  colors: string[];
  animations: boolean;
  responsive: boolean;
}

export interface AxisConfig {
  label: string;
  min?: number;
  max?: number;
  format?: string;
  grid?: boolean;
}