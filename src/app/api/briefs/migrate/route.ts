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

        const { briefs } = await request.json()

        if (!briefs || !Array.isArray(briefs)) {
            return NextResponse.json(
                { error: 'Données de briefs invalides' },
                { status: 400 }
            )
        }

        // Migrer chaque brief vers la base de données
        const migratedBriefs = []

        for (const briefContent of briefs) {
            try {
                // Vérifier si le brief existe déjà (par contenu et utilisateur)
                const existingBrief = await prisma.savedBrief.findFirst({
                    where: {
                        userId: user.id,
                        content: briefContent
                    }
                })

                if (!existingBrief) {
                    // Créer un nouveau brief seulement s'il n'existe pas déjà
                    const newBrief = await prisma.savedBrief.create({
                        data: {
                            userId: user.id,
                            content: briefContent,
                            title: generateBriefTitle(briefContent)
                        }
                    })
                    migratedBriefs.push(newBrief)
                }
            } catch (briefError) {
                console.error(`Erreur lors de la migration du brief:`, briefError)
                // Continuer avec les autres briefs
            }
        }

        return NextResponse.json({
            success: true,
            migratedCount: migratedBriefs.length,
            totalCount: briefs.length,
            briefs: migratedBriefs
        })

    } catch (error) {
        const errorResponse = handleForeignKeyError(error, 'briefs migration')
        return NextResponse.json(
            { error: errorResponse.error },
            { status: errorResponse.status }
        )
    }
}

// Fonction utilitaire pour générer un titre à partir du contenu du brief
function generateBriefTitle(content: string): string {
    // Prendre les premiers mots du brief comme titre
    const words = content.trim().split(' ')
    const title = words.slice(0, 8).join(' ')
    return title.length > 50 ? title.substring(0, 47) + '...' : title
}