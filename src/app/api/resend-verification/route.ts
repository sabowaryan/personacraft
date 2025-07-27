import { NextRequest, NextResponse } from 'next/server';
import { getStackServerApp } from '@/stack';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email requis' },
                { status: 400 }
            );
        }

        // Approche moderne 2025 : Utiliser l'API REST directement
        // au lieu de stackServerApp.getUser qui peut être instable

        // Utiliser l'API Stack Auth REST directement
        const stackApiResponse = await fetch(`${process.env.NEXT_PUBLIC_STACK_API_URL || 'https://api.stack-auth.com'}/api/v1/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-stack-project-id': process.env.NEXT_PUBLIC_STACK_PROJECT_ID!,
                'x-stack-secret-server-key': process.env.STACK_SECRET_SERVER_KEY!,
            },
        });

        if (!stackApiResponse.ok) {
            console.error('Erreur lors de la récupération des utilisateurs:', stackApiResponse.statusText);
            return NextResponse.json(
                { error: 'Erreur lors de la récupération de l\'utilisateur' },
                { status: 500 }
            );
        }

        const users = await stackApiResponse.json();
        const user = users.find((u: any) => u.primaryEmail === email);

        if (!user) {
            return NextResponse.json(
                { error: 'Utilisateur non trouvé' },
                { status: 404 }
            );
        }

        // Envoyer l'email de vérification
        const verificationResponse = await fetch(`${process.env.NEXT_PUBLIC_STACK_API_URL || 'https://api.stack-auth.com'}/api/v1/contact-channels/${user.id}/email/send-verification-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-stack-project-id': process.env.NEXT_PUBLIC_STACK_PROJECT_ID!,
                'x-stack-secret-server-key': process.env.STACK_SECRET_SERVER_KEY!,
            },
            body: JSON.stringify({
                email: email,
            }),
        });

        if (!verificationResponse.ok) {
            const errorData = await verificationResponse.json().catch(() => ({}));
            console.error('Erreur Stack Auth API:', errorData);
            return NextResponse.json(
                { error: 'Erreur lors de l\'envoi de l\'email de vérification' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: 'Email de vérification envoyé avec succès' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Erreur serveur:', error);
        return NextResponse.json(
            { error: 'Erreur interne du serveur' },
            { status: 500 }
        );
    }
}
