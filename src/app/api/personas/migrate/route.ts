import { NextRequest, NextResponse } from 'next/server'
import { getStackServerApp } from '@/stack-server'
const { prisma } = await import('@/lib/prisma');

import { ensureUserExists, handleForeignKeyError } from '@/lib/user-utils'

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const stackServerApp = await getStackServerApp();
    const user = await stackServerApp.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Ensure user exists in database before proceeding
    await ensureUserExists(user)

    const { personas } = await request.json()

    if (!personas || !Array.isArray(personas)) {
      return NextResponse.json(
        { error: 'Données de personas invalides' },
        { status: 400 }
      )
    }

    // Migrer chaque persona vers la base de données
    const migratedPersonas = []
    
    for (const persona of personas) {
      try {
        // Vérifier si la persona existe déjà (par nom et utilisateur)
        const existingPersona = await prisma.persona.findFirst({
          where: {
            userId: user.id,
            name: persona.name
          }
        })

        if (existingPersona) {
          // Mettre à jour la persona existante
          const updatedPersona = await prisma.persona.update({
            where: { id: existingPersona.id },
            data: {
              age: persona.age,
              occupation: persona.occupation,
              location: persona.location,
              demographics: persona.demographics,
              psychographics: persona.psychographics,
              culturalData: persona.culturalData,
              painPoints: persona.painPoints,
              goals: persona.goals,
              marketingInsights: persona.marketingInsights,
              qualityScore: persona.qualityScore,
              updatedAt: new Date()
            }
          })
          migratedPersonas.push(updatedPersona)
        } else {
          // Créer une nouvelle persona
          const newPersona = await prisma.persona.create({
            data: {
              userId: user.id,
              name: persona.name,
              age: persona.age,
              occupation: persona.occupation,
              location: persona.location,
              demographics: persona.demographics,
              psychographics: persona.psychographics,
              culturalData: persona.culturalData,
              painPoints: persona.painPoints,
              goals: persona.goals,
              marketingInsights: persona.marketingInsights,
              qualityScore: persona.qualityScore,
              createdAt: persona.createdAt ? new Date(persona.createdAt) : new Date()
            }
          })
          migratedPersonas.push(newPersona)
        }
      } catch (personaError) {
        console.error(`Erreur lors de la migration de la persona ${persona.name}:`, personaError)
        // Continuer avec les autres personas
      }
    }

    return NextResponse.json({
      success: true,
      migratedCount: migratedPersonas.length,
      totalCount: personas.length,
      personas: migratedPersonas
    })

  } catch (error) {
    const errorResponse = handleForeignKeyError(error, 'personas migration')
    return NextResponse.json(
      { error: errorResponse.error },
      { status: errorResponse.status }
    )
  }
}