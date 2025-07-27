import { NextRequest, NextResponse } from 'next/server';
import { getStackServerApp } from '@/stack-server'

export async function GET(request: NextRequest) {
    try {
        const stackServerApp = await getStackServerApp();
        const user = await stackServerApp.getUser();
        
        return NextResponse.json({
            isAuthenticated: !!user,
            user: user ? {
                id: user.id,
                email: user.primaryEmail,
                emailVerified: user.primaryEmailVerified
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