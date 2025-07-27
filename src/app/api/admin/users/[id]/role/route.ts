import { NextRequest, NextResponse } from 'next/server';
import { getStackServerApp } from '@/stack-server';

const { prisma } = await import('@/lib/prisma');


export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    return NextResponse.json({ error: 'Route temporairement désactivée' }, { status: 503 });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}