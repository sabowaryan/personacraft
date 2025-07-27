import { NextRequest, NextResponse } from 'next/server';

import { getStackServerApp } from '@/stack-server'

const { prisma } = await import('@/lib/prisma');


export async function GET(request: NextRequest) {
  try {
    // Temporairement désactivé pour résoudre les problèmes de build
    return NextResponse.json({ error: 'Route temporairement désactivée' }, { status: 503 });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Temporairement désactivé pour résoudre les problèmes de build
    return NextResponse.json({ error: 'Route temporairement désactivée' }, { status: 503 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}