/**
 * API endpoints for validation template management and metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { ValidationTemplateEngine } from '@/lib/validation/validation-template-engine';
import { ValidationMetricsCollector } from '@/lib/validation/metrics-collector';

// Initialize services (in production, these should be singletons)
const templateEngine = new ValidationTemplateEngine();
const metricsCollector = new ValidationMetricsCollector();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const includeMetrics = searchParams.get('includeMetrics') === 'true';
        const period = searchParams.get('period') || '24h';

        // Get all templates
        const templates = templateEngine.getAllTemplates();

        if (!includeMetrics) {
            return NextResponse.json({
                success: true,
                data: templates
            });
        }

        // Include metrics for each template
        const templatesWithMetrics = await Promise.all(
            templates.map(async (template) => {
                const metrics = await metricsCollector.getAggregatedMetrics(template.id, period);
                return {
                    ...template,
                    metrics
                };
            })
        );

        return NextResponse.json({
            success: true,
            data: templatesWithMetrics
        });

    } catch (error) {
        console.error('Error fetching validation templates:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch validation templates',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}