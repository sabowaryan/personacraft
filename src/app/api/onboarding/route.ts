import { NextRequest, NextResponse } from 'next/server';
import { getStackServerApp } from '@/stack-server'

export async function POST(request: NextRequest) {
  try {
    const stackServerApp = await getStackServerApp();
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { company, role, industry, teamSize, useCase, goals = [], experience } = body;

    // Validation des champs requis
    if (!company || !role || !industry || !teamSize || !useCase || !experience) {
      return NextResponse.json({ 
        error: 'Tous les champs requis doivent être remplis' 
      }, { status: 400 });
    }

    // Validation des valeurs autorisées
    const validRoles = [
      'marketing-manager', 'growth-hacker', 'product-manager', 
      'consultant', 'entrepreneur', 'freelancer', 'designer',
      'developer', 'researcher', 'other'
    ];
    const validIndustries = [
      'tech', 'ecommerce', 'saas', 'fashion', 'health', 
      'finance', 'education', 'consulting', 'media', 'travel',
      'food', 'real-estate', 'automotive', 'other'
    ];
    const validTeamSizes = ['solo', 'small', 'medium', 'large', 'enterprise'];
    const validUseCases = [
      'campaign-planning', 'content-strategy', 'product-development',
      'market-research', 'client-work', 'ux-research', 
      'sales-enablement', 'personal-project'
    ];
    const validGoals = [
      'better-targeting', 'content-personalization', 'product-features',
      'user-experience', 'market-expansion', 'customer-retention',
      'brand-positioning', 'competitive-analysis'
    ];
    const validExperience = ['beginner', 'intermediate', 'advanced', 'expert'];

    // Validation des valeurs
    if (!validRoles.includes(role) || 
        !validIndustries.includes(industry) ||
        !validTeamSizes.includes(teamSize) ||
        !validUseCases.includes(useCase) ||
        !validExperience.includes(experience)) {
      return NextResponse.json({ 
        error: 'Valeurs non valides détectées' 
      }, { status: 400 });
    }

    // Validation des objectifs (optionnels)
    if (goals.length > 0 && !goals.every((goal: string) => validGoals.includes(goal))) {
      return NextResponse.json({ 
        error: 'Objectifs non valides détectés' 
      }, { status: 400 });
    }

    // Mise à jour sécurisée avec clientReadOnlyMetadata
    await user.update({
      clientReadOnlyMetadata: {
        onboarded: true,
        company,
        role,
        industry,
        teamSize,
        useCase,
        goals,
        experience,
        onboardedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Onboarding terminé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de l\'onboarding:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur lors de la sauvegarde' 
    }, { status: 500 });
  }
}