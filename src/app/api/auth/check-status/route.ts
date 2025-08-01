import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-utils'

export async function GET() {
    try {
        // Utiliser la fonction centralisée d'authentification
        const user = await getAuthenticatedUser();
        
        return NextResponse.json({
            isAuthenticated: !!user,
            user: user ? {
                id: user.id,
                email: user.primaryEmail || user.primaryEmail,
                emailVerified: user.primaryEmailVerified || true
            } : null
        });
    } catch (error) {
        console.error('Error checking auth status:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la vérification du statut' },
            { status: 500 }
        );
    }
}