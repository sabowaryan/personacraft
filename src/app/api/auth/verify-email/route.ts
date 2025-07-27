import { NextRequest, NextResponse } from 'next/server';
import { getStackServerApp } from '@/stack-server';

export async function POST(request: NextRequest) {
    try {
        const { code } = await request.json();

        if (!code) {
            return NextResponse.json(
                { error: 'Code de vérification requis' },
                { status: 400 }
            );
        }

        // Stack Auth gère automatiquement la vérification via ses propres handlers
        // Cette API est un fallback pour vérifier le statut après vérification
        const stackServerApp = await getStackServerApp();
        const user = await stackServerApp.getUser();
        
        if (user && user.primaryEmailVerified) {
            return NextResponse.json({
                success: true,
                message: 'Email vérifié avec succès',
                user: {
                    id: user.id,
                    email: user.primaryEmail,
                    emailVerified: user.primaryEmailVerified
                }
            });
        } else {
            return NextResponse.json(
                { error: 'Email non vérifié ou utilisateur non connecté' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Erreur lors de la vérification d\'email:', error);
        return NextResponse.json(
            { error: 'Erreur interne du serveur' },
            { status: 500 }
        );
    }
}