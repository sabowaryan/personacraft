/**
 * API endpoints for validation metrics retrieval
 * Supports querying metrics by template, time range, and other filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { ValidationMetricsCollector } from '@/lib/validation/metrics-collector';
import { PersonaType, ValidationErrorType } from '@/types/validation';

// Initialize metrics collector (in production, this should be a singleton)
const metricsCollector = new ValidationMetricsCollector();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        
        // Parse query parameters
        const templateId = searchParams.get('templateId');
        const personaType = searchParams.get('personaType') as PersonaType;
        const period = searchParams.get('period') || '24h';
        const startTime = searchParams.get('startTime');
        const endTime = searchParams.get('endTime');
        const isValid = searchParams.get('isValid');
        const minScore = searchParams.get('minScore');
        const maxScore = searchParams.get('maxScore');
        const aggregated = searchParams.get('aggregated') === 'true';
        const summary = searchParams.get('summary') === 'true';
        const byTemplate = searchParams.get('byTemplate') === 'true';

        // Build query object
        const query = {
            ...(templateId && { templateId }),
            ...(personaType && { personaType }),
            ...(startTime && { startTime: parseInt(startTime) }),
            ...(endTime && { endTime: parseInt(endTime) }),
            ...(isValid !== null && { isValid: isValid === 'true' }),
            ...(minScore && { minScore: parseFloat(minScore) }),
            ...(maxScore && { maxScore: parseFloat(maxScore) })
        };

        // Handle different response types
        if (summary) {
            const summaryData = await metricsCollector.getMetricsSummary(query);
            return NextResponse.json({
                success: true,
                data: summaryData
            });
        }

        if (byTemplate) {
            const templateMetrics = await metricsCollector.getMetricsByTemplate(period);
            const templateMetricsObj = Object.fromEntries(templateMetrics);
            return NextResponse.json({
                success: true,
                data: templateMetricsObj
            });
        }

        if (aggregated && templateId) {
            const aggregatedData = await metricsCollector.getAggregatedMetrics(templateId, period);
            return NextResponse.json({
                success: true,
                data: aggregatedData
            });
        }

        // Default: return raw metrics
        const metrics = await metricsCollector.getMetrics(query);
        return NextResponse.json({
            success: true,
            data: metrics,
            count: metrics.length
        });

    } catch (error) {
        console.error('Error fetching validation metrics:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch validation metrics',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const olderThanDays = parseInt(searchParams.get('olderThanDays') || '30');

        await metricsCollector.cleanup(olderThanDays);

        return NextResponse.json({
            success: true,
            message: `Cleaned up metrics older than ${olderThanDays} days`
        });

    } catch (error) {
        console.error('Error cleaning up validation metrics:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to cleanup validation metrics',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}