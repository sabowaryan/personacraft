import { NextRequest, NextResponse } from 'next/server';
import { GeminiClient } from '@/lib/api/gemini';
import { QlooClient } from '@/lib/api/qloo';

// Configuration pour l'export statique
export const dynamic = 'force-dynamic';
import { BriefFormData, Persona } from '@/lib/types/persona';
import { 
  GeminiPersonaRequest, 
  GeminiPersonaResponse,
  GeminiError 
} from '@/lib/types/gemini';
import { 
  QlooRequest, 
  QlooResponse, 
  QlooError 
} from '@/lib/types/qloo';

// Interface pour la réponse API enrichie
interface EnhancedPersonaResponse extends Persona {
  validation_metrics: {
    completeness_score: number;
    consistency_score: number;
    realism_score: number;
    quality_indicators: string[];
  };
  generation_metadata: {
    gemini_response_time: number;
    qloo_response_time: number;
    total_processing_time: number;
    confidence_level: 'low' | 'medium' | 'high';
    data_sources: string[];
  };
}

interface GeneratePersonaAPIResponse {
  personas: EnhancedPersonaResponse[];
  metadata: {
    generated_count: number;
    requested_count: number;
    generation_time: string;
    sources_used: string[];
    api_status: {
      gemini: 'active' | 'inactive' | 'error';
      qloo: 'active' | 'inactive' | 'error';
    };
    performance_metrics: {
      average_generation_time: number;
      success_rate: number;
      total_tokens_used: number;
    };
  };
  warnings?: string[];
  errors?: string[];
}

// Fonction utilitaire pour générer un âge dans la tranche
function generateAgeFromRange(ageRange: string): number {
  const ranges: Record<string, [number, number]> = {
    '18-25': [18, 25],
    '25-35': [25, 35],
    '35-45': [35, 45],
    '45-55': [45, 55],
    '55-65': [55, 65],
    '65+': [65, 80]
  };
  
  const [min, max] = ranges[ageRange] || [25, 35];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Orchestration complète avec types avancés
async function generatePersonaComplete(
  request: BriefFormData
): Promise<{ persona: EnhancedPersonaResponse; metrics: any }> {
  const startTime = Date.now();
  const warnings: string[] = [];
  let qlooResponseTime = 0;
  let geminiResponseTime = 0;

  try {
    // 1. Appel à l'API Qloo pour obtenir des recommandations culturelles
    const qlooStartTime = Date.now();
    const qlooClient = new QlooClient(process.env.QLOO_API_KEY);
    
    const qlooRequest: QlooRequest = {
      interests: request.interests,
      demographics: {
        age: generateAgeFromRange(request.ageRange),
        location: request.location || 'France'
      },
      categories: ['music', 'brands', 'movies', 'food', 'books', 'lifestyle']
    };

    const qlooData: QlooResponse = await qlooClient.getRecommendations(qlooRequest);
    qlooResponseTime = Date.now() - qlooStartTime;

    if (qlooData.status.warnings) {
      warnings.push(...qlooData.status.warnings);
    }

    // 2. Construction du prompt pour Gemini avec types avancés
    const geminiStartTime = Date.now();
    const geminiClient = new GeminiClient(process.env.GEMINI_API_KEY);
    
    const geminiRequest: GeminiPersonaRequest = {
      prompt: '', // Sera construit dans buildPersonaPrompt
      persona_type: 'marketing',
      consistency_check: true,
      context: {
        user_context: {
          description: request.description,
          interests: request.interests,
          values: request.values,
          ageRange: request.ageRange,
          location: request.location
        },
        cultural_data: qlooData
      },
      parameters: {
        temperature: 0.8,
        max_tokens: 2000,
        format: 'json',
        creativity_level: 'medium'
      }
    };

    // 3. Génération du persona avec Gemini
    const geminiResponse: GeminiPersonaResponse = await geminiClient.generatePersona(
      geminiRequest, 
      qlooData
    );
    geminiResponseTime = Date.now() - geminiStartTime;

    // 4. Construction de la réponse enrichie
    const totalProcessingTime = Date.now() - startTime;
    
    const enhancedPersona: EnhancedPersonaResponse = {
      id: crypto.randomUUID(),
      name: geminiResponse.persona_data.name,
      age: geminiResponse.persona_data.age,
      location: geminiResponse.persona_data.location,
      bio: geminiResponse.persona_data.bio,
      values: geminiResponse.persona_data.values,
      quote: geminiResponse.persona_data.quote,
      interests: {
        music: geminiResponse.persona_data.interests.music || [],
        brands: geminiResponse.persona_data.interests.brands || [],
        movies: geminiResponse.persona_data.interests.movies || [],
        food: geminiResponse.persona_data.interests.food || [],
        books: geminiResponse.persona_data.interests.books || [],
        lifestyle: geminiResponse.persona_data.interests.lifestyle || []
      },
      communication: {
        preferredChannels: geminiResponse.persona_data.communication.preferredChannels || [],
        tone: geminiResponse.persona_data.communication.tone || '',
        contentTypes: geminiResponse.persona_data.communication.contentTypes || [],
        frequency: geminiResponse.persona_data.communication.frequency || ''
      },
      marketing: {
        painPoints: geminiResponse.persona_data.marketing.painPoints || [],
        motivations: geminiResponse.persona_data.marketing.motivations || [],
        buyingBehavior: geminiResponse.persona_data.marketing.buyingBehavior || '',
        influences: geminiResponse.persona_data.marketing.influences || []
      },
      generatedAt: new Date(),
      sources: ['Qloo Taste AI', 'Google Gemini', 'Analyse comportementale'],
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=150&h=150&fit=crop&crop=face&auto=format&q=80`,
      
      // Nouvelles métriques de validation
      validation_metrics: {
        completeness_score: geminiResponse.validation_results.completeness_score,
        consistency_score: geminiResponse.validation_results.consistency_score,
        realism_score: geminiResponse.validation_results.realism_score,
        quality_indicators: geminiResponse.validation_results.issues.length === 0 
          ? ['Complete', 'Consistent', 'Realistic'] 
          : geminiResponse.validation_results.issues.map(issue => `Missing: ${issue.field}`)
      },
      
      // Métadonnées de génération enrichies
      generation_metadata: {
        gemini_response_time: geminiResponseTime,
        qloo_response_time: qlooResponseTime,
        total_processing_time: totalProcessingTime,
        confidence_level: geminiResponse.persona_data.confidence_score > 0.8 ? 'high' : 
                         geminiResponse.persona_data.confidence_score > 0.6 ? 'medium' : 'low',
        data_sources: [
          'Qloo Cultural AI',
          'Google Gemini Pro',
          'Behavioral Analysis Engine'
        ]
      }
    };

    return {
      persona: enhancedPersona,
      metrics: {
        qlooResponseTime,
        geminiResponseTime,
        totalProcessingTime,
        warnings,
        tokenUsage: geminiResponse.usage
      }
    };

  } catch (error) {
    console.error('Error in persona generation:', error);
    
    // Gestion d'erreur enrichie
    if (error instanceof Error) {
      throw {
        type: 'generation_error',
        message: error.message,
        metrics: {
          qlooResponseTime,
          geminiResponseTime,
          failedAt: Date.now() - startTime
        }
      };
    }
    
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: BriefFormData = await request.json();
    
    // Validation avancée des données d'entrée
    const validationErrors = validateBriefData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationErrors,
          suggestion: 'Please check your input data'
        },
        { status: 400 }
      );
    }

    // Vérifier la configuration des APIs
    const apiStatus = {
      gemini: process.env.GEMINI_API_KEY ? 'active' : 'inactive',
      qloo: process.env.QLOO_API_KEY ? 'active' : 'inactive'
    } as const;

    if (apiStatus.gemini === 'inactive') {
      return NextResponse.json(
        { error: 'Gemini API not configured. Please add GEMINI_API_KEY to your environment.' },
        { status: 500 }
      );
    }

    if (apiStatus.qloo === 'inactive') {
      return NextResponse.json(
        { error: 'Qloo API not configured. Please add QLOO_API_KEY to your environment. Get your API key at https://docs.qloo.com/' },
        { status: 500 }
      );
    }

    // Génération des personas avec métriques avancées
    const personaCount = body.generateMultiple ? 3 : 1;
    const personas: EnhancedPersonaResponse[] = [];
    const allWarnings: string[] = [];
    const allErrors: string[] = [];
    const performanceMetrics = {
      totalTokens: 0,
      successCount: 0,
      totalTime: 0
    };

    for (let i = 0; i < personaCount; i++) {
      try {
        const result = await generatePersonaComplete(body);
        personas.push(result.persona);
        
        // Accumuler les métriques
        performanceMetrics.successCount++;
        performanceMetrics.totalTime += result.metrics.totalProcessingTime;
        performanceMetrics.totalTokens += result.metrics.tokenUsage?.total_tokens || 0;
        
        if (result.metrics.warnings.length > 0) {
          allWarnings.push(...result.metrics.warnings);
        }
        
        // Délai entre les générations pour éviter la surcharge
        if (i < personaCount - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error: any) {
        console.error(`Error generating persona ${i + 1}:`, error);
        allErrors.push(`Persona ${i + 1}: ${error.message || 'Generation failed'}`);
      }
    }

    if (personas.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to generate any personas',
          details: allErrors,
          api_status: apiStatus
        },
        { status: 500 }
      );
    }

    // Construire la réponse enrichie
    const totalTime = Date.now() - startTime;
    const response: GeneratePersonaAPIResponse = {
      personas,
      metadata: {
        generated_count: personas.length,
        requested_count: personaCount,
        generation_time: `${totalTime}ms`,
        sources_used: ['Qloo Taste AI', 'Google Gemini', 'Behavioral Analysis'],
        api_status: apiStatus,
        performance_metrics: {
          average_generation_time: performanceMetrics.totalTime / performanceMetrics.successCount,
          success_rate: performanceMetrics.successCount / personaCount,
          total_tokens_used: performanceMetrics.totalTokens
        }
      }
    };

    // Ajouter warnings/errors si présents
    if (allWarnings.length > 0) {
      response.warnings = Array.from(new Set(allWarnings)); // Déduplication
    }
    if (allErrors.length > 0) {
      response.errors = allErrors;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Generate Persona API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during persona generation',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        request_duration: `${Date.now() - startTime}ms`
      },
      { status: 500 }
    );
  }
}

// Fonction de validation enrichie
function validateBriefData(data: BriefFormData): string[] {
  const errors: string[] = [];

  if (!data.description || data.description.length < 10) {
    errors.push('Description must be at least 10 characters long');
  }

  if (data.description && data.description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }

  if (!data.interests || data.interests.length === 0) {
    errors.push('At least one interest is required');
  }

  if (data.interests && data.interests.length > 15) {
    errors.push('Maximum 15 interests allowed');
  }

  if (!data.values || data.values.length === 0) {
    errors.push('At least one value is required');
  }

  if (data.values && data.values.length > 10) {
    errors.push('Maximum 10 values allowed');
  }

  if (data.ageRange && !['18-25', '25-35', '35-45', '45-55', '55-65', '65+'].includes(data.ageRange)) {
    errors.push('Invalid age range');
  }

  return errors;
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Enhanced Persona Generation API',
      version: '2.0',
      methods: ['POST'],
      description: 'Generate marketing personas using advanced AI with comprehensive validation and metrics',
      features: [
        'Advanced type safety with TypeScript',
        'Comprehensive validation and error handling',
        'Performance metrics and monitoring',
        'Cultural data enrichment via Qloo',
        'AI-powered generation via Gemini',
        'Quality scoring and consistency checks'
      ],
      required_fields: ['description', 'interests', 'values'],
      optional_fields: ['ageRange', 'location', 'generateMultiple'],
      api_status: {
        gemini: process.env.GEMINI_API_KEY ? 'configured' : 'not configured',
        qloo: process.env.QLOO_API_KEY ? 'configured' : 'not configured - API key required'
      },
      limits: {
        max_personas_per_request: 3,
        max_interests: 15,
        max_values: 10,
        max_description_length: 1000
      }
    },
    { status: 200 }
  );
}