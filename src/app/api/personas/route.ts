import { NextRequest, NextResponse } from 'next/server';
const { prisma } = await import('@/lib/prisma');

import { getAuthenticatedUser } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const personas = await prisma.persona.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(personas)
  } catch (error) {
    console.error('Erreur lors de la récupération des personas:', error)
    
    // Handle specific error types
    if (error instanceof Error && error.message === 'Auth timeout') {
      return NextResponse.json(
        { error: 'Timeout d\'authentification' },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des personas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      age,
      occupation,
      location,
      demographics,
      psychographics,
      culturalData,
      painPoints,
      goals,
      marketingInsights,
      qualityScore
    } = body

    const persona = await prisma.persona.create({
      data: {
        userId: user.id,
        name,
        age,
        occupation,
        location,
        demographics,
        psychographics,
        culturalData,
        painPoints,
        goals,
        marketingInsights,
        qualityScore
      }
    })

    return NextResponse.json(persona, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du persona:', error)
    
    // Handle specific error types
    if (error instanceof Error && error.message === 'Auth timeout') {
      return NextResponse.json(
        { error: 'Timeout d\'authentification' },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur lors de la création du persona' },
      { status: 500 }
    )
  }
}