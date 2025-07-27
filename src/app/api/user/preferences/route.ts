import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth-utils'

const { prisma } = await import('@/lib/prisma');

import { ensureUserExists, handleForeignKeyError } from '@/lib/user-utils'

export async function POST(request: NextRequest) {
    let requestBody;

    try {
        // Vérifier l'authentification avec retry logic
        const user = await getAuthenticatedUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            )
        }

        // Parse request body with error handling
        try {
            requestBody = await request.json();
        } catch (parseError) {
            console.error('Error parsing request body:', parseError);
            return NextResponse.json(
                { error: 'Corps de requête invalide' },
                { status: 400 }
            );
        }

        // Ensure user exists in database before proceeding
        await ensureUserExists(user)

        const { preferences, action } = requestBody;

        // Gérer l'action d'incrémentation des générations
        if (action === 'increment_generations') {
            const userPreferences = await prisma.userPreferences.upsert({
                where: {
                    userId: user.id
                },
                update: {
                    generationsCount: {
                        increment: 1
                    },
                    updatedAt: new Date()
                },
                create: {
                    userId: user.id,
                    theme: 'light',
                    language: 'fr',
                    autoSave: true,
                    generationsCount: 1
                }
            })

            return NextResponse.json({
                success: true,
                generationsCount: userPreferences.generationsCount
            })
        }

        if (!preferences) {
            return NextResponse.json(
                { error: 'Préférences manquantes' },
                { status: 400 }
            )
        }

        // Sauvegarder les préférences dans la base de données
        const userPreferences = await prisma.userPreferences.upsert({
            where: {
                userId: user.id
            },
            update: {
                theme: preferences.theme || 'light',
                language: preferences.language || 'fr',
                autoSave: preferences.autoSave || true,
                updatedAt: new Date()
            },
            create: {
                userId: user.id,
                theme: preferences.theme || 'light',
                language: preferences.language || 'fr',
                autoSave: preferences.autoSave || true
            }
        })

        return NextResponse.json({
            success: true,
            preferences: userPreferences
        })

    } catch (error) {
        console.error('Error with user preferences:', error);

        // Handle specific error types
        if (error instanceof Error) {
            if (error.message === 'Auth timeout') {
                return NextResponse.json(
                    { error: 'Timeout d\'authentification' },
                    { status: 408 }
                );
            }

            if (error.message.includes('ECONNRESET') || (error as any).code === 'ECONNRESET') {
                return NextResponse.json(
                    { error: 'Connexion interrompue, veuillez réessayer' },
                    { status: 503 }
                );
            }
        }

        const errorResponse = handleForeignKeyError(error, 'user preferences')
        return NextResponse.json(
            { error: errorResponse.error },
            { status: errorResponse.status }
        )
    }
}

export async function GET() {
    try {
        // Vérifier l'authentification avec retry logic
        const user = await getAuthenticatedUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            )
        }

        // Ensure user exists in database before proceeding
        try {
            await ensureUserExists(user)
        } catch (userError) {
            // If user creation fails, log but continue with default preferences
            console.error('Failed to ensure user exists:', userError)
            return NextResponse.json({
                preferences: {
                    theme: 'light',
                    language: 'fr',
                    autoSave: true
                }
            })
        }

        // Récupérer les préférences de l'utilisateur
        const userPreferences = await prisma.userPreferences.findUnique({
            where: {
                userId: user.id
            }
        })

        if (!userPreferences) {
            // Retourner les préférences par défaut
            return NextResponse.json({
                preferences: {
                    theme: 'light',
                    language: 'fr',
                    autoSave: true
                }
            })
        }

        return NextResponse.json({
            preferences: {
                theme: userPreferences.theme,
                language: userPreferences.language,
                autoSave: userPreferences.autoSave
            }
        })

    } catch (error) {
        console.error('Erreur lors de la récupération des préférences:', error)

        // Handle specific error types
        if (error instanceof Error) {
            if (error.message === 'Auth timeout') {
                return NextResponse.json(
                    { error: 'Timeout d\'authentification' },
                    { status: 408 }
                );
            }

            if (error.message.includes('ECONNRESET') || (error as any).code === 'ECONNRESET') {
                return NextResponse.json(
                    { error: 'Connexion interrompue, veuillez réessayer' },
                    { status: 503 }
                );
            }
        }

        return NextResponse.json(
            { error: 'Erreur interne du serveur' },
            { status: 500 }
        )
    }
}