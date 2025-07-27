import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';

// Validation schema pour les données utilisateur Stack Auth
const StackUserDataSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
  primary_email: z.string().email('Invalid email format').nullable(),
  display_name: z.string().min(1).nullable(),
  created_at_millis: z.number().positive('Invalid creation timestamp'),
  updated_at_millis: z.number().positive('Invalid update timestamp'),
});

const StackWebhookEventSchema = z.object({
  type: z.enum(['user.created', 'user.updated', 'user.deleted']),
  data: StackUserDataSchema,
});

// Types inférés depuis les schemas Zod
type StackUserData = z.infer<typeof StackUserDataSchema>;
type StackWebhookEvent = z.infer<typeof StackWebhookEventSchema>;

const prisma = new PrismaClient();

// Configuration pour les variables d'environnement
const WEBHOOK_SECRET = process.env.STACK_WEBHOOK_SECRET;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Vérification des variables d'environnement requises
if (!WEBHOOK_SECRET) {
  throw new Error('STACK_WEBHOOK_SECRET environment variable is required');
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    //validation des en-têtes Svix
    const svixId = req.headers.get('svix-id');
    const svixTimestamp = req.headers.get('svix-timestamp');
    const svixSignature = req.headers.get('svix-signature');

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error('Missing required Svix headers', {
        svixId: !!svixId,
        svixTimestamp: !!svixTimestamp,
        svixSignature: !!svixSignature,
      });

      return NextResponse.json(
        { error: 'Missing required Svix headers' },
        { status: 400 }
      );
    }

    // Récupération du body brut (essentiel pour la vérification Svix)
    const body = await req.text();

    if (!body) {
      console.error('Empty request body received');
      return NextResponse.json(
        { error: 'Empty request body' },
        { status: 400 }
      );
    }

    // Vérification de la signature webhook avec Svix
    const wh = new Webhook(WEBHOOK_SECRET!);
    let event: StackWebhookEvent;

    try {
      const verifiedEvent = wh.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      });

      // Validation du payload avec Zod
      event = StackWebhookEventSchema.parse(verifiedEvent);

    } catch (err) {
      console.error('Webhook verification or validation failed:', {
        error: err instanceof Error ? err.message : 'Unknown error',
        svixId,
        timestamp: svixTimestamp,
      });

      return NextResponse.json(
        { error: 'Invalid webhook signature or payload' },
        { status: 400 }
      );
    }

    // Logging structuré pour monitoring
    console.log(JSON.stringify({
      event: 'webhook_received',
      type: event.type,
      userId: event.data.id,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
      environment: NODE_ENV,
    }));

    // Traitement des événements selon le type
    try {
      switch (event.type) {
        case 'user.created':
          await handleUserCreated(event.data);
          break;
        case 'user.updated':
          await handleUserUpdated(event.data);
          break;
        case 'user.deleted':
          await handleUserDeleted(event.data);
          break;
        default:
          console.warn(`Unhandled event type: ${event.type}`);
      }
    } catch (processingError) {
      console.error('Error processing webhook event:', {
        error: processingError instanceof Error ? processingError.message : 'Unknown error',
        eventType: event.type,
        userId: event.data.id,
        stack: processingError instanceof Error ? processingError.stack : undefined,
      });

      // Retourner une erreur 500 pour déclencher les retries
      return NextResponse.json(
        { error: 'Internal processing error' },
        { status: 500 }
      );
    }

    // Log de succès avec métriques de performance
    console.log(JSON.stringify({
      event: 'webhook_processed_successfully',
      type: event.type,
      userId: event.data.id,
      processingTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    }));

    return NextResponse.json({
      received: true,
      processed: true,
      eventType: event.type,
      userId: event.data.id,
    });

  } catch (error) {
    console.error('Unexpected webhook error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      processingTime: Date.now() - startTime,
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


async function handleUserCreated(userData: StackUserData) {
  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Vérification d'idempotence - utilisateur déjà existant
      const existingUser = await tx.user.findUnique({
        where: { id: userData.id },
        select: { id: true },
      });

      if (existingUser) {
        console.log(`User ${userData.id} already exists, skipping creation`);
        return;
      }

      // Récupération du plan gratuit avec gestion d'erreur
      const freePlan = await tx.plan.findFirst({
        where: { name: 'Gratuit' },
        select: { id: true },
      });

      if (!freePlan) {
        console.error('Plan "Gratuit" not found in database');
        throw new Error('Default plan "Gratuit" not configured in database');
      }

      // Récupération du rôle utilisateur gratuit
      const freeUserRole = await tx.role.findUnique({
        where: { name: 'free_user' },
        select: { id: true },
      });

      if (!freeUserRole) {
        console.error('Role "free_user" not found in database');
        throw new Error('Default role "free_user" not configured in database');
      }

      // Création de l'utilisateur avec validation des données
      const createData: any = {
        id: userData.id,
        name: userData.display_name || 'Utilisateur',
        planId: freePlan.id,
        createdAt: new Date(userData.created_at_millis),
        updatedAt: new Date(userData.updated_at_millis),
      };

      if (userData.primary_email) {
        createData.email = userData.primary_email;
      }

      const newUser = await tx.user.create({
        data: createData,
        select: { id: true, email: true, name: true },
      });

      // Attribution du rôle par défaut
      await tx.userRole.create({
        data: {
          userId: newUser.id,
          roleId: freeUserRole.id,
        },
      });

      // Création des préférences utilisateur par défaut
      await tx.userPreferences.create({
        data: {
          userId: newUser.id,
          theme: 'light',
          language: 'fr',
          autoSave: true,
          generationsCount: 0,
        },
      });

      console.log(JSON.stringify({
        event: 'user_created',
        userId: userData.id,
        email: userData.primary_email,
        plan: 'Gratuit',
        role: 'free_user',
        preferences: 'created',
        timestamp: new Date().toISOString(),
      }));
    });

  } catch (error) {
    console.error('Error in handleUserCreated:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: userData.id,
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error; // Re-throw pour déclencher les retries
  }
}

async function handleUserUpdated(userData: StackUserData) {
  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Vérification que l'utilisateur existe
      const existingUser = await tx.user.findUnique({
        where: { id: userData.id },
        select: { id: true, updatedAt: true },
      });

      if (!existingUser) {
        console.warn(`User ${userData.id} not found for update, creating instead`);
        // Fallback : créer l'utilisateur s'il n'existe pas
        await handleUserCreated(userData);
        return;
      }

      // Vérification des timestamps pour éviter les mises à jour obsolètes
      const incomingUpdateTime = new Date(userData.updated_at_millis);
      if (existingUser.updatedAt && existingUser.updatedAt >= incomingUpdateTime) {
        console.log(`User ${userData.id} already up to date, skipping update`);
        return;
      }

      // Mise à jour des données utilisateur
      const updatedUser = await tx.user.update({
        where: { id: userData.id },
        data: {
          email: userData.primary_email || undefined,
          name: userData.display_name || undefined,
          updatedAt: incomingUpdateTime,
        },
        select: { id: true, email: true, name: true },
      });

      console.log(JSON.stringify({
        event: 'user_updated',
        userId: userData.id,
        email: userData.primary_email,
        timestamp: new Date().toISOString(),
      }));
    });

  } catch (error) {
    console.error('Error in handleUserUpdated:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: userData.id,
    });
    throw error;
  }
}

async function handleUserDeleted(userData: StackUserData) {
  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Vérification que l'utilisateur existe avant suppression
      const existingUser = await tx.user.findUnique({
        where: { id: userData.id },
        select: { id: true },
      });

      if (!existingUser) {
        console.log(`User ${userData.id} not found for deletion, already removed`);
        return;
      }

      // Suppression en cascade des relations (userRole sera supprimé automatiquement)
      await tx.user.delete({
        where: { id: userData.id },
      });

      console.log(JSON.stringify({
        event: 'user_deleted',
        userId: userData.id,
        timestamp: new Date().toISOString(),
      }));
    });

  } catch (error) {
    console.error('Error in handleUserDeleted:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: userData.id,
    });
    throw error;
  }
}

// Gestion propre des connexions Prisma
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
