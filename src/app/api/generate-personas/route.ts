import { NextRequest, NextResponse } from 'next/server';
import { validateAndCleanPersonas } from '@/lib/persona-utils';
import { permissionService } from '@/services/permissionService';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { shouldBypassAuth, isFeatureEnabled } from '@/lib/feature-flags';
import { getGeminiClient } from '@/lib/api/gemini';
import { getQlooClient } from '@/lib/api/qloo';
import { QlooFirstPersonaGenerator } from '@/lib/services/qloo-first-persona-generator';
import { featureFlagService } from '@/lib/services/feature-flag-service';
import { BriefFormData } from '@/components/forms/BriefForm';
import { ValidationTemplateEngine } from '@/lib/validation/validation-template-engine';
import { ValidationErrorHandler } from '@/lib/validation/error-handler';
import { createRegistryWithTemplates } from '@/lib/validation/templates';
import {
  ValidationContext,
  ValidationResult,
  PersonaType,
  ValidationError,
  ValidationErrorType,
  ValidationSeverity
} from '@/types/validation';

// Extended validation result with additional statistics for API responses
type ExtendedValidationResult = ValidationResult & {
  validationStats?: {
    errorsByType: Record<ValidationErrorType, number>;
    personasValidated: number;
    successfulPersonas: number;
  };
};

// Validation configuration
const VALIDATION_CONFIG = {
  enabled: process.env.VALIDATION_ENABLED !== 'false',
  maxRetries: parseInt(process.env.MAX_VALIDATION_RETRIES || '3'),
  timeoutMs: parseInt(process.env.VALIDATION_TIMEOUT_MS || '10000'),
  fallbackEnabled: process.env.FALLBACK_ENABLED !== 'false'
};

// Initialize validation components
const validationRegistry = createRegistryWithTemplates();
const validationEngine = new ValidationTemplateEngine(validationRegistry);
const errorHandler = new ValidationErrorHandler({
  maxRetries: VALIDATION_CONFIG.maxRetries,
  enhancePromptOnRetry: true,
  fallbackAfterMaxRetries: VALIDATION_CONFIG.fallbackEnabled
});

/**
 * Determines persona type based on brief content and form data
 */
function determinePersonaType(briefFormData: BriefFormData): PersonaType {
  const brief = briefFormData.brief.toLowerCase();
  
  // Check for B2B indicators
  if (brief.includes('b2b') || brief.includes('business') || brief.includes('enterprise') || 
      brief.includes('company') || brief.includes('corporate') || brief.includes('professional')) {
    return PersonaType.B2B;
  }
  
  // Check for simple persona indicators (basic demographics only)
  if (briefFormData.interests.length === 0 && briefFormData.values.length === 0) {
    return PersonaType.SIMPLE;
  }
  
  // Default to standard persona
  return PersonaType.STANDARD;
}

/**
 * Creates validation context from brief form data and generation metadata
 */
function createValidationContext(
  briefFormData: BriefFormData,
  personaType: PersonaType,
  generationAttempt: number = 1,
  previousErrors: ValidationError[] = []
): ValidationContext {
  return {
    originalRequest: {
      personaType,
      demographics: {
        ageRange: briefFormData.ageRange,
        location: briefFormData.location
      },
      psychographics: {
        interests: briefFormData.interests,
        values: briefFormData.values
      },
      businessContext: {
        language: briefFormData.language,
        personaCount: briefFormData.personaCount
      }
    },
    templateVariables: {
      location: briefFormData.location,
      ageRange: briefFormData.ageRange,
      interests: briefFormData.interests,
      values: briefFormData.values,
      language: briefFormData.language,
      personaCount: briefFormData.personaCount
    },
    culturalConstraints: {
      music: [],
      brand: [],
      restaurant: [],
      movie: [],
      tv: [],
      book: [],
      travel: [],
      fashion: [],
      beauty: [],
      food: [],
      socialMedia: []
    },
    userSignals: {
      demographics: {
        ageRange: briefFormData.ageRange,
        location: briefFormData.location
      },
      interests: briefFormData.interests,
      values: briefFormData.values,
      culturalContext: {
        language: briefFormData.language,
        personaCount: briefFormData.personaCount
      }
    },
    generationAttempt,
    previousErrors
  };
}

/**
 * Validates generated personas using the validation engine with enhanced error handling
 */
async function validateGeneratedPersonas(
  personas: any[],
  personaType: PersonaType,
  context: ValidationContext
): Promise<ExtendedValidationResult> {
  const startTime = Date.now();
  
  try {
    // Get the appropriate template for the persona type
    const template = validationEngine.getTemplateByPersonaType(personaType);
    if (!template) {
      console.error(`❌ No validation template found for persona type: ${personaType}`);
      return {
        isValid: false,
        errors: [{
          id: 'template-not-found',
          type: ValidationErrorType.TEMPLATE_NOT_FOUND,
          field: 'system',
          message: `No validation template found for persona type: ${personaType}`,
          severity: ValidationSeverity.ERROR
        }],
        warnings: [],
        score: 0,
        metadata: {
          templateId: 'unknown',
          templateVersion: 'unknown',
          validationTime: Date.now() - startTime,
          rulesExecuted: 0,
          rulesSkipped: 0,
          timestamp: Date.now()
        }
      };
    }

    console.log(`🔍 Validating ${personas.length} personas with template: ${template.id}`);

    // Validate each persona with enhanced error handling and timeout protection
    const validationPromises = personas.map(async (persona, index) => {
      try {
        const timeoutPromise = new Promise<ValidationResult>((_, reject) => {
          setTimeout(() => reject(new Error('Validation timeout')), VALIDATION_CONFIG.timeoutMs);
        });

        const validationPromise = validationEngine.validateResponse(persona, template.id, {
          ...context,
          templateVariables: {
            ...context.templateVariables,
            personaIndex: index
          }
        });

        return await Promise.race([validationPromise, timeoutPromise]);
      } catch (error) {
        console.error(`❌ Validation failed for persona ${index}:`, error);
        
        // Enhanced error classification for better user feedback
        let errorType = ValidationErrorType.VALIDATION_TIMEOUT;
        let errorMessage = `Validation failed for persona ${index}`;
        
        if (error instanceof Error) {
          if (error.message.includes('timeout')) {
            errorType = ValidationErrorType.VALIDATION_TIMEOUT;
            errorMessage = `Validation timed out for persona ${index} after ${VALIDATION_CONFIG.timeoutMs}ms`;
          } else if (error.message.includes('structure') || error.message.includes('JSON')) {
            errorType = ValidationErrorType.STRUCTURE_INVALID;
            errorMessage = `Invalid structure detected in persona ${index}: ${error.message}`;
          } else if (error.message.includes('required') || error.message.includes('missing')) {
            errorType = ValidationErrorType.REQUIRED_FIELD_MISSING;
            errorMessage = `Missing required fields in persona ${index}: ${error.message}`;
          } else {
            errorMessage = `${errorMessage}: ${error.message}`;
          }
        }
        
        return {
          isValid: false,
          errors: [{
            id: `persona-${index}-validation-error`,
            type: errorType,
            field: 'persona',
            message: errorMessage,
            severity: ValidationSeverity.ERROR,
            context: {
              personaIndex: index,
              errorDetails: error instanceof Error ? error.message : 'Unknown error',
              timestamp: Date.now()
            }
          }],
          warnings: [],
          score: 0,
          metadata: {
            templateId: template.id,
            templateVersion: template.version,
            validationTime: Date.now() - startTime,
            rulesExecuted: 0,
            rulesSkipped: 0,
            timestamp: Date.now()
          }
        };
      }
    });

    const validationResults = await Promise.all(validationPromises);

    // Aggregate validation results with enhanced metadata
    const allErrors = validationResults.flatMap(result => result.errors);
    const allWarnings = validationResults.flatMap(result => result.warnings);
    const averageScore = validationResults.length > 0 
      ? validationResults.reduce((sum, result) => sum + result.score, 0) / validationResults.length 
      : 0;
    const isValid = validationResults.every(result => result.isValid);

    // Group errors by type for better reporting
    const errorsByType = allErrors.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1;
      return acc;
    }, {} as Record<ValidationErrorType, number>);

    const aggregatedResult = {
      isValid,
      errors: allErrors,
      warnings: allWarnings,
      score: averageScore,
      metadata: {
        templateId: template.id,
        templateVersion: template.version,
        validationTime: Date.now() - startTime,
        rulesExecuted: validationResults.reduce((sum, result) => sum + result.metadata.rulesExecuted, 0),
        rulesSkipped: validationResults.reduce((sum, result) => sum + result.metadata.rulesSkipped, 0),
        timestamp: Date.now()
      }
    };

    // Store additional statistics for response formatting
    const validationStats = {
      errorsByType,
      personasValidated: personas.length,
      successfulPersonas: validationResults.filter(r => r.isValid).length
    };

    if (isValid) {
      console.log(`✅ Validation passed for all ${personas.length} personas (score: ${averageScore.toFixed(2)})`);
    } else {
      console.log(`❌ Validation failed: ${allErrors.length} errors, ${allWarnings.length} warnings (score: ${averageScore.toFixed(2)})`);
      console.log(`📊 Error breakdown:`, validationStats.errorsByType);
    }

    // Return the result with additional stats attached for API response formatting
    return {
      ...aggregatedResult,
      validationStats: validationStats // Include validation statistics directly
    };

  } catch (error) {
    console.error('❌ Validation system error:', error);
    
    // Enhanced system error handling
    let systemErrorType = ValidationErrorType.VALIDATION_TIMEOUT;
    let systemErrorMessage = 'Validation system failed';
    
    if (error instanceof Error) {
      if (error.message.includes('template')) {
        systemErrorType = ValidationErrorType.TEMPLATE_NOT_FOUND;
        systemErrorMessage = `Template system error: ${error.message}`;
      } else if (error.message.includes('timeout')) {
        systemErrorType = ValidationErrorType.VALIDATION_TIMEOUT;
        systemErrorMessage = `Validation system timeout: ${error.message}`;
      } else {
        systemErrorMessage = `Validation system failed: ${error.message}`;
      }
    }
    
    return {
      isValid: false,
      errors: [{
        id: 'validation-system-error',
        type: systemErrorType,
        field: 'system',
        message: systemErrorMessage,
        severity: ValidationSeverity.ERROR,
        context: {
          systemError: true,
          errorDetails: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now(),
          personaCount: personas.length
        }
      }],
      warnings: [],
      score: 0,
      metadata: {
        templateId: 'unknown',
        templateVersion: 'unknown',
        validationTime: Date.now() - startTime,
        rulesExecuted: 0,
        rulesSkipped: 0,
        timestamp: Date.now()
      }
    };
  }
}

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

    // Vérifier la limite de personas seulement si les limites sont activées
    if (user && isFeatureEnabled('PERSONA_LIMITS_ENABLED')) {
      const canGenerate = await permissionService.checkPersonaLimit(user.id);
      if (!canGenerate) {
        return NextResponse.json({ error: 'Limite de personas atteinte pour votre plan.' }, { status: 403 });
      }
    }

    // Check feature flag to determine which flow to use
    const isQlooFirstEnabled = featureFlagService.isQlooFirstEnabled();
    
    let generationResult;
    
    if (isQlooFirstEnabled) {
      // Use the new Qloo-first flow with validation
      console.log('🚀 Using Qloo-first persona generation flow with validation');
      
      const qlooFirstGenerator = new QlooFirstPersonaGenerator({
        enableFallback: featureFlagService.shouldFallbackOnError(),
        debugMode: featureFlagService.isDebugModeEnabled(),
        enableValidation: VALIDATION_CONFIG.enabled
      });
      
      generationResult = await qlooFirstGenerator.generatePersonas(briefFormData);
      
    } else {
      // Use the legacy flow with validation
      console.log('🔄 Using legacy persona generation flow with validation');
      
      generationResult = await executeLegacyFlowWithValidation(briefFormData, user);
    }

    // Validate and clean the personas before returning
    const validatedPersonas = validateAndCleanPersonas(generationResult.personas);

    // Enhanced response with detailed metadata and source tracking
    const response = {
      success: true,
      personas: generationResult.personas,
      timestamp: new Date().toISOString(),
      
      // Generation metadata (format attendu par le frontend)
      generation: {
        source: isQlooFirstEnabled ? 'qloo-first' : 'legacy',
        method: isQlooFirstEnabled ? 'qloo-first' : 'legacy',
        processingTime: generationResult.metadata.processingTime || 0,
        personaCount: generationResult.personas.length,
        requestedCount: briefFormData.personaCount
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
          enabled: VALIDATION_CONFIG.enabled,
        isValid: generationResult.metadata.validationResult?.isValid || false,
        score: generationResult.metadata.validationResult?.score || 0,
        errorCount: generationResult.metadata.validationResult?.errors?.length || 0,
        warningCount: generationResult.metadata.validationResult?.warnings?.length || 0,
        templateId: generationResult.metadata.validationResult?.metadata?.templateId || 'unknown',
        validationTime: generationResult.metadata.validationResult?.metadata?.validationTime || 0,
          retryCount: generationResult.metadata.retryCount || 0,
          // Include validation statistics if available
          ...((generationResult.metadata.validationResult as ExtendedValidationResult)?.validationStats && {
            errorsByType: (generationResult.metadata.validationResult as ExtendedValidationResult).validationStats!.errorsByType,
            personasValidated: (generationResult.metadata.validationResult as ExtendedValidationResult).validationStats!.personasValidated,
            successfulPersonas: (generationResult.metadata.validationResult as ExtendedValidationResult).validationStats!.successfulPersonas
          })
      },
      
      // Performance metrics (when available)
      ...(generationResult.metadata.qlooApiCallsCount && {
        performance: {
          qlooApiCalls: generationResult.metadata.qlooApiCallsCount,
          cacheHitRate: generationResult.metadata.cacheHitRate || 0
        }
      }),
      
      // Error information (when fallback occurred)
      ...(generationResult.metadata.errorEncountered && {
        fallback: {
          reason: generationResult.metadata.errorEncountered,
          originalFlowFailed: true
        }
      }),
      
      // Feature flag status for debugging
      featureFlags: {
        qlooFirstEnabled: isQlooFirstEnabled,
        fallbackEnabled: featureFlagService.shouldFallbackOnError(),
        debugMode: featureFlagService.isDebugModeEnabled(),
        validationEnabled: VALIDATION_CONFIG.enabled
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erreur lors de la génération des personas:', error);
    
    // Enhanced error response with metadata while preserving existing format
    const baseErrorResponse = {
      success: false,
      timestamp: new Date().toISOString(),
      generation: {
        source: 'error',
        method: featureFlagService.isQlooFirstEnabled() ? 'qloo-first' : 'legacy',
        processingTime: 0,
        personaCount: 0,
        requestedCount: briefFormData?.personaCount || 0
      },
      sources: {
        gemini: false,
        qloo: false,
        culturalData: 'none'
      },
      validation: {
        enabled: VALIDATION_CONFIG.enabled,
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
        validationEnabled: VALIDATION_CONFIG.enabled
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
      
      // Handle validation-specific errors with detailed feedback
      if (error.message.includes('Validation failed') || error.message.includes('validation')) {
        console.error('🚨 Validation error in API route:', error.message);
        
        // Extract validation details if available
        let validationDetails = {};
        try {
          // Try to parse validation error details from error message
          if (error.message.includes('errors:')) {
            const errorPart = error.message.split('errors:')[1];
            validationDetails = { rawErrorDetails: errorPart.trim() };
          }
        } catch (parseError) {
          console.warn('Could not parse validation error details:', parseError);
        }
        
        return NextResponse.json(
          { 
            error: 'Erreur de validation des personas',
            details: error.message,
            validationError: true,
            ...baseErrorResponse,
            validation: {
              ...baseErrorResponse.validation,
              errorCount: 1,
              templateId: 'error',
              ...validationDetails
            },
            // Provide user-friendly guidance
            userGuidance: {
              message: 'Les personas générées ne respectent pas les critères de qualité requis.',
              suggestion: 'Veuillez réessayer avec un brief plus détaillé ou contactez le support si le problème persiste.',
              canRetry: true
            }
          },
          { status: 422 }
        );
      }

      // Handle template-related errors
      if (error.message.includes('template') || error.message.includes('Template')) {
        console.error('🚨 Template error in API route:', error.message);
        return NextResponse.json(
          { 
            error: 'Erreur de template de validation',
            details: error.message,
            templateError: true,
            ...baseErrorResponse
          },
          { status: 500 }
        );
      }

      // Handle timeout errors
      if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        console.error('🚨 Timeout error in API route:', error.message);
        return NextResponse.json(
          { 
            error: 'Timeout lors de la génération ou validation',
            details: error.message,
            timeoutError: true,
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
 * Execute the legacy persona generation flow with validation
 * (Gemini first, Qloo enrichment second, then validation)
 * This maintains backward compatibility with the existing flow while adding validation
 */
async function executeLegacyFlowWithValidation(briefFormData: BriefFormData, user: any) {
  const startTime = Date.now();
  let retryCount = 0;
  let validationResult: ExtendedValidationResult | undefined;
  
  // Determine persona type for validation
  const personaType = determinePersonaType(briefFormData);
  
  while (retryCount <= VALIDATION_CONFIG.maxRetries) {
    try {
      // Execute the original legacy flow
      const legacyResult = await executeLegacyFlow(briefFormData, user);
      
      // If validation is disabled, return the legacy result
      if (!VALIDATION_CONFIG.enabled) {
        return {
          ...legacyResult,
          metadata: {
            ...legacyResult.metadata,
            retryCount,
            validationResult: undefined
          }
        };
      }
      
      // Create validation context
      const validationContext = createValidationContext(
        briefFormData,
        personaType,
        retryCount + 1
      );
      
      // Validate the generated personas
      validationResult = await validateGeneratedPersonas(
        legacyResult.personas,
        personaType,
        validationContext
      );
      
      // If validation passes, return the result
      if (validationResult.isValid) {
        console.log(`✅ Legacy flow validation passed on attempt ${retryCount + 1}`);
        return {
          ...legacyResult,
          metadata: {
            ...legacyResult.metadata,
            retryCount,
            validationResult,
            processingTime: Date.now() - startTime
          }
        };
      }
      
      // If validation fails, check if we should retry
      console.log(`❌ Legacy flow validation failed on attempt ${retryCount + 1}`);
      console.log(`🔍 Validation errors: ${validationResult.errors.length}`);
      
      // Log specific validation errors for debugging
      validationResult.errors.forEach((error, index) => {
        console.log(`   Error ${index + 1}: [${error.type}] ${error.field}: ${error.message}`);
      });
      
      // Analyze errors and determine retry strategy
      const retryContext = {
        attempt: retryCount,
        maxRetries: VALIDATION_CONFIG.maxRetries,
        previousErrors: validationResult.errors,
        backoffDelay: 1000 * Math.pow(2, retryCount),
        startTime
      };
      
      const errorRecovery = errorHandler.analyzeErrors(
        validationResult,
        validationContext,
        retryContext
      );
      
      if (!errorRecovery.shouldRetry) {
        console.log(`🚫 No more retries for legacy flow: ${errorRecovery.reason}`);
        
        // If fallback is enabled, try with simpler validation
        if (VALIDATION_CONFIG.fallbackEnabled && personaType !== PersonaType.SIMPLE) {
          console.log('🔄 Attempting fallback with simpler validation template');
          
          const fallbackValidationResult = await validateGeneratedPersonas(
            legacyResult.personas,
            PersonaType.SIMPLE,
            validationContext
          );
          
          if (fallbackValidationResult.isValid) {
            console.log('✅ Fallback validation passed');
            return {
              ...legacyResult,
              metadata: {
                ...legacyResult.metadata,
                retryCount,
                validationResult: fallbackValidationResult,
                processingTime: Date.now() - startTime,
                fallbackUsed: true,
                fallbackReason: 'Original validation template failed, used simpler template'
              }
            };
          }
        }
        
        // If we can't recover, return the result with validation errors but still provide personas
        console.log('⚠️ Returning result with validation errors (transparent to user)');
        return {
          ...legacyResult,
          metadata: {
            ...legacyResult.metadata,
            retryCount,
            validationResult,
            processingTime: Date.now() - startTime,
            errorEncountered: 'Validation failed after all retries',
            transparentFailure: true // Flag to indicate this was handled transparently
          }
        };
      }
      
      // Wait before retry if specified
      if (errorRecovery.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, errorRecovery.delay));
      }
      
      retryCount++;
      
    } catch (error) {
      console.error(`❌ Legacy flow attempt ${retryCount + 1} failed:`, error);
      
      if (retryCount >= VALIDATION_CONFIG.maxRetries) {
        throw error;
      }
      
      retryCount++;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)));
    }
  }
  
  // This should not be reached, but just in case
  throw new Error('Legacy flow with validation exceeded maximum retries');
}

/**
 * Execute the original legacy persona generation flow (Gemini first, Qloo enrichment second)
 * This maintains backward compatibility with the existing flow
 */
async function executeLegacyFlow(briefFormData: BriefFormData, user: any) {
  // Récupérer les données d'onboarding pour personnaliser la génération
  const onboardingData = user.clientReadOnlyMetadata;
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

