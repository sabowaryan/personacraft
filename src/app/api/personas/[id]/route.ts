import { NextRequest, NextResponse } from 'next/server'
const { prisma } = await import('@/lib/prisma');

import { getStackServerApp } from '@/stack-server'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const stackServerApp = await getStackServerApp();
        const user = await stackServerApp.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const resolvedParams = await params;
        const persona = await prisma.persona.findFirst({
            where: {
                id: resolvedParams.id,
                userId: user.id
            }
        })

        if (!persona) {
            return NextResponse.json({ error: 'Persona non trouvé' }, { status: 404 })
        }

        return NextResponse.json(persona)
    } catch (error) {
        console.error('Erreur lors de la récupération du persona:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la récupération du persona' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const stackServerApp = await getStackServerApp();
        const user = await stackServerApp.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const resolvedParams = await params;
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

        const persona = await prisma.persona.updateMany({
            where: {
                id: resolvedParams.id,
                userId: user.id
            },
            data: {
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

        if (persona.count === 0) {
            return NextResponse.json({ error: 'Persona non trouvé' }, { status: 404 })
        }

        const updatedPersona = await prisma.persona.findUnique({
            where: { id: resolvedParams.id }
        })

        return NextResponse.json(updatedPersona)
    } catch (error) {
        console.error('Erreur lors de la mise à jour du persona:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la mise à jour du persona' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const stackServerApp = await getStackServerApp();
        const user = await stackServerApp.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const resolvedParams = await params;
        const persona = await prisma.persona.deleteMany({
            where: {
                id: resolvedParams.id,
                userId: user.id
            }
        })

        if (persona.count === 0) {
            return NextResponse.json({ error: 'Persona non trouvé' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Persona supprimé avec succès' })
    } catch (error) {
        console.error('Erreur lors de la suppression du persona:', error)
        return NextResponse.json(
            { error: 'Erreur lors de la suppression du persona' },
            { status: 500 }
        )
    }
}