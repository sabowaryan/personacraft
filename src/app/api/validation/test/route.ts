/**
 * API endpoint for testing validation templates
 */

import { NextRequest, NextResponse } from 'next/server';
import { ValidationTemplateEngine } from '@/lib/validation/validation-template-engine';
import { ValidationTemplateRegistry } from '@/lib/validation/template-registry';
import { ValidationContext, PersonaGenerationRequest } from '@/types/validation';

const templateRegistry = new ValidationTemplateRegistry();
const validationEngine = new ValidationTemplateEngine(templateRegistry);

export async function POST(request: NextRequest) {
    try {
        const { templateId, testData } = await request.json();

        if (!templateId || !testData) {
            return NextResponse.json({
                success: false,
                error: 'Template ID and test data are required'
            }, { status: 400 });
        }

        // Get the template
        const template = templateRegistry.get(templateId);
        if (!template) {
            return NextResponse.json({
                success: false,
                error: `Template with ID '${templateId}' not found`
            }, { status: 404 });
        }

        // Create a mock validation context
        const mockContext: ValidationContext = {
            originalRequest: {
                personaType: template.personaType,
                culturalData: testData.culturalData,
                demographics: testData.demographics,
                psychographics: testData.psychographics,
                businessContext: testData.businessContext,
                customFields: {}
            } as PersonaGenerationRequest,
            templateVariables: {},
            culturalConstraints: {
                music: [],
                brands: [],
                restaurants: [],
                movies: [],
                tv: [],
                books: [],
                travel: [],
                fashion: [],
                beauty: [],
                food: [],
                socialMedia: []
            },
            userSignals: {
                demographics: {
                    ageRange: { min: 25, max: 35 },
                    location: 'North America'
                },
                interests: [],
                values: [],
                culturalContext: {
                    language: 'en',
                    personaCount: 1
                }
            },
            generationAttempt: 1,
            previousErrors: []
        };

        // Validate the test data
        const result = await validationEngine.validateResponse(
            testData,
            templateId,
            mockContext
        );

        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Template validation test error:', error);

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        }, { status: 500 });
    }
}