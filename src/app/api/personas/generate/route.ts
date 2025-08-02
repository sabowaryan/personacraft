import { NextRequest, NextResponse } from 'next/server';
import { validateAndCleanPersonas } from '@/lib/persona-utils';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { shouldBypassAuth, isFeatureEnabled } from '@/lib/feature-flags';
import { getGeminiClient } from '@/lib/api/gemini';
import { getQlooClient } from '@/lib/api/qloo';
import { QlooFirstPersonaGenerator } from '@/lib/services/qloo-first-persona-generator';
import { featureFlagService } from '@/lib/services/feature-flag-service';
import { BriefFormData } from '@/components/forms/BriefForm';

const { prisma } = await import('@/lib/prisma');

export async function POST(request: NextRequest) {
    let briefFormData: BriefFormData | undefined;

    try {
        const requestBody = await request.json();

        // Support both old format (brief only) and new format (BriefFormData)
        if (typeof requestBody === 'object' && requestBody.brief && typeof requestBody.brief === 'string') {
            // Check if this is the new BriefFormData format
            if (requestBody.ageRange && requestBody.location !== undefined) {
                briefFormData = requestBody as BriefFormData;
            } else {
                // Convert old format to BriefFormData for backward compatibility
                briefFormData = {
                    brief: requestBody.brief,
                    ageRange: { min: 25, max: 45 },
                    location: '',
                    language: 'fr',
                    personaCount: 2,
                    interests: [],
                    values: []
                };
            }
        } else {
            return NextResponse.json(
                { error: 'Brief marketing requis' },
                { status: 400 }
            );
        }

        if (!briefFormData.brief) {
            return NextResponse.json(
                { error: 'Brief marketing requis' },
                { status: 400 }
            );
        }

        const user = await getAuthenticatedUser();

        // Bypasser l'authentification si les feature flags le permettent
        if (!user && !shouldBypassAuth()) {
            return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
        }

        // Vérifier la limite de personas seulement si les limites sont activées et qu'on a un utilisateur
        if (user && isFeatureEnabled('PERSONA_LIMITS_ENABLED')) {
            const { permissionService } = await import('@/services/permissionService');
            const canGenerate = await permissionService.checkPersonaLimit(user.id);
            if (!canGenerate) {
                return NextResponse.json({ error: 'Limite de personas atteinte pour votre plan.' }, { status: 403 });
            }
        }

        // Check feature flag to determine which flow to use
        const isQlooFirstEnabled = featureFlagService.isQlooFirstEnabled();

        let generationResult;

        if (isQlooFirstEnabled) {
            // Use the new Qloo-first flow
            console.log('🚀 Using Qloo-first persona generation flow');

            const qlooFirstGenerator = new QlooFirstPersonaGenerator({
                enableFallback: featureFlagService.shouldFallbackOnError(),
                debugMode: featureFlagService.isDebugModeEnabled(),
                enableValidation: true
            });

            generationResult = await qlooFirstGenerator.generatePersonas(briefFormData);

        } else {
            // Use the legacy flow
            console.log('🔄 Using legacy persona generation flow');

            generationResult = await executeLegacyFlow(briefFormData, user);
        }

        // Si on a un utilisateur authentifié ou qu'on bypass l'auth, sauvegarder en BDD
        if (user || shouldBypassAuth()) {
            const userId = user?.id || 'anonymous-user';

            // Sauvegarder chaque persona en base de données
            const savedPersonas = await Promise.all(
                generationResult.personas.map(async (persona: any) => {
                    try {
                        const savedPersona = await prisma.persona.create({
                            data: {
                                userId: userId,
                                name: persona.name,
                                age: persona.age,
                                occupation: persona.occupation,
                                location: persona.location,
                                bio: persona.bio,
                                quote: persona.quote,
                                email: persona.email,
                                phone: persona.phone,
                                demographics: persona.demographics,
                                psychographics: persona.psychographics,
                                culturalData: persona.culturalData,
                                painPoints: persona.painPoints,
                                goals: persona.goals,
                                marketingInsights: persona.marketingInsights,
                                // Correction : s'assurer que socialMediaInsights est sauvegardé
                                socialMediaInsights: persona.socialMediaInsights || undefined,
                                qualityScore: persona.qualityScore || 0,
                                // Correction : sauvegarder le champ metadata du persona
                                metadata: persona.metadata || undefined,
                                // Enhanced metadata
                                generationMetadata: {
                                    source: isQlooFirstEnabled ? 'qloo-first' : 'legacy',
                                    generationMethod: isQlooFirstEnabled ? 'qloo-first' : 'legacy',
                                    culturalDataSource: generationResult.metadata.qlooDataUsed ? 'qloo' : 'gemini',
                                    templateUsed: 'standard',
                                    processingTime: generationResult.metadata.processingTime || 0,
                                    qlooConstraintsUsed: generationResult.metadata.culturalConstraintsApplied || [],
                                    validationScore: 'validationResult' in generationResult.metadata ? generationResult.metadata.validationResult?.score || 0 : 0,
                                    validationErrors: 'validationResult' in generationResult.metadata ? generationResult.metadata.validationResult?.errors?.length || 0 : 0,
                                    validationWarnings: 'validationResult' in generationResult.metadata ? generationResult.metadata.validationResult?.warnings?.length || 0 : 0
                                },
                                // Correction : s'assurer que validationMetadata est correctement sauvegardé
                                validationMetadata: 'validationResult' in generationResult.metadata && generationResult.metadata.validationResult ? {
                                    isValid: generationResult.metadata.validationResult.isValid,
                                    validationScore: generationResult.metadata.validationResult.score,
                                    validatedAt: new Date().toISOString(),
                                    validationVersion: '1.0',
                                    templateId: generationResult.metadata.validationResult.metadata?.templateId || 'standard',
                                    validationTime: generationResult.metadata.validationResult.metadata?.validationTime || 0,
                                    errorCount: generationResult.metadata.validationResult.errors?.length || 0,
                                    warningCount: generationResult.metadata.validationResult.warnings?.length || 0,
                                    retryCount: ('retryCount' in generationResult.metadata) ? generationResult.metadata.retryCount || 0 : 0,
                                    issues: generationResult.metadata.validationResult.errors?.map(error => ({
                                        id: error.id,
                                        type: error.type,
                                        message: error.message,
                                        field: error.field,
                                        severity: error.severity
                                    })) || []
                                } : undefined,
                                culturalDataSource: generationResult.metadata.qlooDataUsed ? 'qloo' : 'gemini',
                                templateUsed: 'standard',
                                processingTime: generationResult.metadata.processingTime || 0
                            }
                        });

                        console.log(`✅ Persona "${persona.name}" sauvegardé en BDD avec ID: ${savedPersona.id}`);
                        return savedPersona;
                    } catch (error) {
                        console.error(`❌ Erreur lors de la sauvegarde du persona "${persona.name}":`, error);
                        // Retourner le persona original si la sauvegarde échoue
                        return persona;
                    }
                })
            );

            // Mettre à jour le résultat avec les personas sauvegardés
            generationResult.personas = savedPersonas;
        }

        // Enhanced response with detailed metadata and source tracking
        const response = {
            success: true,
            personas: generationResult.personas,
            timestamp: new Date().toISOString(),

            // Generation metadata
            generation: {
                source: isQlooFirstEnabled ? 'qloo-first' : 'legacy',
                method: isQlooFirstEnabled ? 'qloo-first' : 'legacy',
                processingTime: generationResult.metadata.processingTime || 0,
                personaCount: generationResult.personas.length,
                requestedCount: briefFormData.personaCount,
                savedToDatabase: user || shouldBypassAuth()
            },

            // Sources used
            sources: {
                gemini: true,
                qloo: generationResult.metadata.qlooDataUsed || false,
                culturalData: generationResult.metadata.qlooDataUsed ? 'qloo' : 'none'
            },

            // Cultural constraints applied (for qloo-first flow)
            culturalConstraints: {
                applied: generationResult.metadata.culturalConstraintsApplied || [],
                count: generationResult.metadata.culturalConstraintsApplied?.length || 0
            },

            // Validation metadata (when validation was performed)
            validation: {
                enabled: true,
                isValid: 'validationResult' in generationResult.metadata ? generationResult.metadata.validationResult?.isValid || false : false,
                score: 'validationResult' in generationResult.metadata ? generationResult.metadata.validationResult?.score || 0 : 0,
                errorCount: 'validationResult' in generationResult.metadata ? generationResult.metadata.validationResult?.errors?.length || 0 : 0,
                warningCount: 'validationResult' in generationResult.metadata ? generationResult.metadata.validationResult?.warnings?.length || 0 : 0,
                templateId: 'validationResult' in generationResult.metadata ? generationResult.metadata.validationResult?.metadata?.templateId || 'unknown' : 'unknown',
                validationTime: 'validationResult' in generationResult.metadata ? generationResult.metadata.validationResult?.metadata?.validationTime || 0 : 0,
                retryCount: ('retryCount' in generationResult.metadata) ? generationResult.metadata.retryCount || 0 : 0
            },

            // Feature flag status for debugging
            featureFlags: {
                qlooFirstEnabled: isQlooFirstEnabled,
                fallbackEnabled: featureFlagService.shouldFallbackOnError(),
                debugMode: featureFlagService.isDebugModeEnabled(),
                authBypass: shouldBypassAuth(),
                personaLimitsEnabled: isFeatureEnabled('PERSONA_LIMITS_ENABLED')
            }
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Erreur lors de la génération des personas:', error);

        // Enhanced error response with metadata
        const baseErrorResponse = {
            success: false,
            timestamp: new Date().toISOString(),
            generation: {
                source: 'error',
                method: featureFlagService.isQlooFirstEnabled() ? 'qloo-first' : 'legacy',
                processingTime: 0,
                personaCount: 0,
                requestedCount: briefFormData?.personaCount || 0,
                savedToDatabase: false
            },
            sources: {
                gemini: false,
                qloo: false,
                culturalData: 'none'
            },
            validation: {
                enabled: true,
                isValid: false,
                score: 0,
                errorCount: 0,
                warningCount: 0,
                templateId: 'unknown',
                validationTime: 0,
                retryCount: 0
            },
            featureFlags: {
                qlooFirstEnabled: featureFlagService.isQlooFirstEnabled(),
                fallbackEnabled: featureFlagService.shouldFallbackOnError(),
                debugMode: featureFlagService.isDebugModeEnabled(),
                authBypass: shouldBypassAuth(),
                personaLimitsEnabled: isFeatureEnabled('PERSONA_LIMITS_ENABLED')
            }
        };

        // Handle specific error types
        if (error instanceof Error) {
            if (error.message === 'Auth timeout') {
                return NextResponse.json(
                    {
                        error: 'Timeout d\'authentification',
                        ...baseErrorResponse
                    },
                    { status: 408 }
                );
            }
        }

        return NextResponse.json(
            {
                error: 'Erreur interne du serveur',
                ...baseErrorResponse
            },
            { status: 500 }
        );
    }
}

/**
 * Execute the legacy persona generation flow (Gemini first, Qloo enrichment second)
 */
async function executeLegacyFlow(briefFormData: BriefFormData, user: any) {
    // Récupérer les données d'onboarding pour personnaliser la génération
    const onboardingData = user?.clientReadOnlyMetadata;
    let userContext = '';

    if (onboardingData?.onboarded) {
        const roleContexts = {
            'marketing-manager': 'en tant que directeur marketing expérimenté',
            'growth-hacker': 'avec une approche growth hacking',
            'product-manager': 'du point de vue d\'un chef de produit',
            'consultant': 'avec l\'expertise d\'un consultant marketing',
            'entrepreneur': 'avec la vision d\'un entrepreneur',
            'freelancer': 'avec l\'agilité d\'un freelance',
            'other': 'avec votre expertise unique'
        };

        const industryContexts = {
            'tech': 'dans le secteur technologique',
            'ecommerce': 'dans l\'e-commerce',
            'saas': 'dans l\'univers SaaS',
            'fashion': 'dans l\'industrie de la mode',
            'health': 'dans le domaine de la santé',
            'finance': 'dans le secteur financier',
            'education': 'dans l\'éducation',
            'consulting': 'dans le conseil',
            'other': 'dans votre secteur d\'activité'
        };

        const contexts = [];
        if (onboardingData.role && roleContexts[onboardingData.role as keyof typeof roleContexts]) {
            contexts.push(roleContexts[onboardingData.role as keyof typeof roleContexts]);
        }
        if (onboardingData.industry && industryContexts[onboardingData.industry as keyof typeof industryContexts]) {
            contexts.push(industryContexts[onboardingData.industry as keyof typeof industryContexts]);
        }

        userContext = contexts.join(', ');
    }

    // Étape 1: Générer les personas de base avec Gemini
    const geminiClient = getGeminiClient();
    const personas = await geminiClient.generatePersonas(briefFormData.brief, userContext || undefined);

    // Étape 2: Enrichir avec les données culturelles Qloo
    let enrichedPersonas = personas;
    let qlooSuccess = false;

    try {
        const qlooClient = getQlooClient();
        enrichedPersonas = await qlooClient.enrichPersonas(personas);
        qlooSuccess = true;
        console.log('✅ Enrichissement Qloo réussi');
    } catch (error) {
        console.warn('⚠️ Enrichissement Qloo échoué, utilisation des personas Gemini seuls:', error);
        // On garde les personas Gemini originaux en cas d'échec Qloo
    }

    return {
        personas: enrichedPersonas,
        metadata: {
            source: 'legacy' as const,
            qlooDataUsed: qlooSuccess,
            culturalConstraintsApplied: qlooSuccess ? ['post-hoc-enrichment'] : [],
            processingTime: 0, // Not tracked in legacy flow
            qlooApiCallsCount: qlooSuccess ? 1 : 0, // Estimate for legacy enrichment
            cacheHitRate: 0, // Not tracked in legacy flow
            errorEncountered: undefined // No error in legacy flow
        }
    };
}