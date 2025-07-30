/**
 * API endpoints for validation dashboard data
 * Provides aggregated data specifically formatted for dashboard visualization
 */

import { NextRequest, NextResponse } from 'next/server';
import { ValidationMetricsCollector } from '@/lib/validation/metrics-collector';
import { PersonaType, ValidationErrorType } from '@/types/validation';

// Initialize metrics collector (in production, this should be a singleton)
const metricsCollector = new ValidationMetricsCollector();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const endpoint = searchParams.get('endpoint');
        const period = searchParams.get('period') || '24h';
        const templateId = searchParams.get('templateId');

        switch (endpoint) {
            case 'overview':
                return await getOverviewData(period);
            
            case 'template-performance':
                return await getTemplatePerformanceData(period);
            
            case 'error-trends':
                return await getErrorTrendsData(period, templateId);
            
            case 'success-rates':
                return await getSuccessRatesData(period);
            
            case 'performance-metrics':
                return await getPerformanceMetricsData(period, templateId);
            
            case 'real-time':
                return await getRealTimeData();
            
            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid endpoint parameter' },
                    { status: 400 }
                );
        }

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch dashboard data',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

async function getOverviewData(period: string) {
    const summary = await metricsCollector.getMetricsSummary({
        startTime: getStartTimeForPeriod(period),
        endTime: Date.now()
    });

    const templateMetrics = await metricsCollector.getMetricsByTemplate(period);
    const templateCount = templateMetrics.size;
    
    // Calculate trends (compare with previous period)
    const previousPeriodSummary = await metricsCollector.getMetricsSummary({
        startTime: getStartTimeForPeriod(period, true), // Previous period
        endTime: getStartTimeForPeriod(period)
    });

    const successRateTrend = summary.successRate - previousPeriodSummary.successRate;
    const validationTimeTrend = summary.averageValidationTime - previousPeriodSummary.averageValidationTime;

    return NextResponse.json({
        success: true,
        data: {
            overview: {
                totalValidations: summary.totalValidations,
                successRate: summary.successRate,
                averageScore: summary.averageScore,
                averageValidationTime: summary.averageValidationTime,
                fallbackUsageRate: summary.fallbackUsageRate,
                activeTemplates: templateCount,
                trends: {
                    successRate: successRateTrend,
                    validationTime: validationTimeTrend
                }
            },
            topFailingRules: summary.topFailingRules.slice(0, 5),
            errorBreakdown: summary.errorBreakdown
        }
    });
}

async function getTemplatePerformanceData(period: string) {
    const templateMetrics = await metricsCollector.getMetricsByTemplate(period);
    
    const performanceData = Array.from(templateMetrics.entries()).map(([templateId, metrics]) => ({
        templateId,
        templateName: getTemplateDisplayName(templateId),
        totalValidations: metrics.totalValidations,
        successRate: metrics.successRate,
        averageScore: metrics.averageScore,
        averageValidationTime: metrics.averageValidationTime,
        fallbackUsageRate: metrics.fallbackUsageRate,
        errorBreakdown: metrics.errorBreakdown
    }));

    // Sort by success rate descending
    performanceData.sort((a, b) => b.successRate - a.successRate);

    return NextResponse.json({
        success: true,
        data: {
            templates: performanceData,
            summary: {
                totalTemplates: performanceData.length,
                averageSuccessRate: performanceData.reduce((sum, t) => sum + t.successRate, 0) / performanceData.length,
                bestPerforming: performanceData[0],
                worstPerforming: performanceData[performanceData.length - 1]
            }
        }
    });
}

async function getErrorTrendsData(period: string, templateId?: string | null) {
    const query = templateId ? { templateId } : {};
    const metrics = await metricsCollector.getMetrics({
        ...query,
        startTime: getStartTimeForPeriod(period),
        endTime: Date.now()
    });

    // Group metrics by time buckets for trend analysis
    const bucketSize = getBucketSizeForPeriod(period);
    const timeBuckets = new Map<number, { total: number; errors: number; errorTypes: Record<ValidationErrorType, number> }>();

    metrics.forEach(metric => {
        const bucketTime = Math.floor(metric.timestamp / bucketSize) * bucketSize;
        
        if (!timeBuckets.has(bucketTime)) {
            timeBuckets.set(bucketTime, {
                total: 0,
                errors: 0,
                errorTypes: {} as Record<ValidationErrorType, number>
            });
        }

        const bucket = timeBuckets.get(bucketTime)!;
        bucket.total++;
        
        if (!metric.isValid) {
            bucket.errors++;
            
            // Count error types from failed rules
            metric.rulesFailed.forEach(ruleId => {
                const errorType = extractErrorTypeFromRuleId(ruleId);
                if (errorType) {
                    bucket.errorTypes[errorType] = (bucket.errorTypes[errorType] || 0) + 1;
                }
            });
        }
    });

    // Convert to array and sort by time
    const trendData = Array.from(timeBuckets.entries())
        .map(([timestamp, data]) => ({
            timestamp,
            totalValidations: data.total,
            errorCount: data.errors,
            errorRate: data.total > 0 ? data.errors / data.total : 0,
            errorTypes: data.errorTypes
        }))
        .sort((a, b) => a.timestamp - b.timestamp);

    return NextResponse.json({
        success: true,
        data: {
            trends: trendData,
            summary: {
                totalDataPoints: trendData.length,
                averageErrorRate: trendData.reduce((sum, d) => sum + d.errorRate, 0) / trendData.length,
                peakErrorRate: Math.max(...trendData.map(d => d.errorRate)),
                templateId: templateId || 'all'
            }
        }
    });
}

async function getSuccessRatesData(period: string) {
    const templateMetrics = await metricsCollector.getMetricsByTemplate(period);
    
    // Success rates by template
    const templateSuccessRates = Array.from(templateMetrics.entries()).map(([templateId, metrics]) => ({
        templateId,
        templateName: getTemplateDisplayName(templateId),
        successRate: metrics.successRate,
        totalValidations: metrics.totalValidations
    }));

    // Success rates by persona type
    const personaTypeMetrics = new Map<PersonaType, { total: number; successful: number }>();
    
    for (const [, metrics] of templateMetrics) {
        const personaType = getPersonaTypeFromTemplateId(metrics.templateId);
        if (!personaTypeMetrics.has(personaType)) {
            personaTypeMetrics.set(personaType, { total: 0, successful: 0 });
        }
        
        const data = personaTypeMetrics.get(personaType)!;
        data.total += metrics.totalValidations;
        data.successful += Math.round(metrics.totalValidations * metrics.successRate);
    }

    const personaSuccessRates = Array.from(personaTypeMetrics.entries()).map(([personaType, data]) => ({
        personaType,
        successRate: data.total > 0 ? data.successful / data.total : 0,
        totalValidations: data.total
    }));

    return NextResponse.json({
        success: true,
        data: {
            byTemplate: templateSuccessRates,
            byPersonaType: personaSuccessRates,
            overall: {
                averageSuccessRate: templateSuccessRates.reduce((sum, t) => sum + t.successRate, 0) / templateSuccessRates.length,
                totalValidations: templateSuccessRates.reduce((sum, t) => sum + t.totalValidations, 0)
            }
        }
    });
}

async function getPerformanceMetricsData(period: string, templateId?: string | null) {
    const query = templateId ? { templateId } : {};
    const metrics = await metricsCollector.getMetrics({
        ...query,
        startTime: getStartTimeForPeriod(period),
        endTime: Date.now()
    });

    // Calculate performance percentiles
    const validationTimes = metrics.map(m => m.validationTime).sort((a, b) => a - b);
    const scores = metrics.map(m => m.score).sort((a, b) => a - b);

    const getPercentile = (arr: number[], percentile: number) => {
        const index = Math.ceil((percentile / 100) * arr.length) - 1;
        return arr[index] || 0;
    };

    const performanceMetrics = {
        validationTime: {
            average: validationTimes.reduce((sum, t) => sum + t, 0) / validationTimes.length,
            median: getPercentile(validationTimes, 50),
            p95: getPercentile(validationTimes, 95),
            p99: getPercentile(validationTimes, 99),
            min: validationTimes[0] || 0,
            max: validationTimes[validationTimes.length - 1] || 0
        },
        scores: {
            average: scores.reduce((sum, s) => sum + s, 0) / scores.length,
            median: getPercentile(scores, 50),
            p95: getPercentile(scores, 95),
            p99: getPercentile(scores, 99),
            min: scores[0] || 0,
            max: scores[scores.length - 1] || 0
        },
        retryAnalysis: {
            averageRetries: metrics.reduce((sum, m) => sum + m.retryCount, 0) / metrics.length,
            maxRetries: Math.max(...metrics.map(m => m.retryCount)),
            retriesDistribution: getRetriesDistribution(metrics)
        }
    };

    return NextResponse.json({
        success: true,
        data: {
            performance: performanceMetrics,
            sampleSize: metrics.length,
            templateId: templateId || 'all'
        }
    });
}

async function getRealTimeData() {
    // Get metrics from the last 5 minutes for real-time monitoring
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    const recentMetrics = await metricsCollector.getMetrics({
        startTime: fiveMinutesAgo,
        endTime: Date.now()
    });

    const currentSuccessRate = recentMetrics.length > 0 
        ? recentMetrics.filter(m => m.isValid).length / recentMetrics.length 
        : 0;

    const currentAverageTime = recentMetrics.length > 0
        ? recentMetrics.reduce((sum, m) => sum + m.validationTime, 0) / recentMetrics.length
        : 0;

    return NextResponse.json({
        success: true,
        data: {
            timestamp: Date.now(),
            recentValidations: recentMetrics.length,
            currentSuccessRate,
            currentAverageTime,
            activeTemplates: new Set(recentMetrics.map(m => m.templateId)).size,
            recentErrors: recentMetrics.filter(m => !m.isValid).length
        }
    });
}

// Helper functions
function getStartTimeForPeriod(period: string, previous: boolean = false): number {
    const now = Date.now();
    let duration: number;

    switch (period) {
        case '1h':
            duration = 60 * 60 * 1000;
            break;
        case '24h':
            duration = 24 * 60 * 60 * 1000;
            break;
        case '7d':
            duration = 7 * 24 * 60 * 60 * 1000;
            break;
        case '30d':
            duration = 30 * 24 * 60 * 60 * 1000;
            break;
        default:
            duration = 24 * 60 * 60 * 1000;
    }

    return previous ? now - (2 * duration) : now - duration;
}

function getBucketSizeForPeriod(period: string): number {
    switch (period) {
        case '1h':
            return 5 * 60 * 1000; // 5 minute buckets
        case '24h':
            return 60 * 60 * 1000; // 1 hour buckets
        case '7d':
            return 6 * 60 * 60 * 1000; // 6 hour buckets
        case '30d':
            return 24 * 60 * 60 * 1000; // 1 day buckets
        default:
            return 60 * 60 * 1000;
    }
}

function getTemplateDisplayName(templateId: string): string {
    const nameMap: Record<string, string> = {
        'standard-persona-v1': 'Standard Persona',
        'b2b-persona-v1': 'B2B Persona',
        'simple-persona-v1': 'Simple Persona'
    };
    
    return nameMap[templateId] || templateId;
}

function getPersonaTypeFromTemplateId(templateId: string): PersonaType {
    if (templateId.includes('b2b')) return PersonaType.B2B;
    if (templateId.includes('simple')) return PersonaType.SIMPLE;
    return PersonaType.STANDARD;
}

function extractErrorTypeFromRuleId(ruleId: string): ValidationErrorType | null {
    if (ruleId.includes('required-fields')) return ValidationErrorType.REQUIRED_FIELD_MISSING;
    if (ruleId.includes('structure')) return ValidationErrorType.STRUCTURE_INVALID;
    if (ruleId.includes('type')) return ValidationErrorType.TYPE_MISMATCH;
    if (ruleId.includes('format')) return ValidationErrorType.FORMAT_INVALID;
    if (ruleId.includes('range')) return ValidationErrorType.VALUE_OUT_OF_RANGE;
    if (ruleId.includes('cultural')) return ValidationErrorType.CULTURAL_DATA_INCONSISTENT;
    if (ruleId.includes('business')) return ValidationErrorType.BUSINESS_RULE_VIOLATION;
    
    return null;
}

function getRetriesDistribution(metrics: any[]): Record<number, number> {
    const distribution: Record<number, number> = {};
    
    metrics.forEach(metric => {
        const retries = metric.retryCount;
        distribution[retries] = (distribution[retries] || 0) + 1;
    });
    
    return distribution;
}