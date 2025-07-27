const { prisma } = await import('@/lib/prisma');


/**
 * Ensures that a Stack Auth user exists in our Prisma database
 * This prevents foreign key constraint violations when creating related records
 */
export async function ensureUserExists(stackUser: any): Promise<void> {
    try {
        // Get default plan and role first
        const [freePlan, freeUserRole] = await Promise.all([
            prisma.plan.findFirst({
                where: { name: 'Gratuit' },
                select: { id: true }
            }),
            prisma.role.findUnique({
                where: { name: 'free_user' },
                select: { id: true }
            })
        ])

        if (!freePlan || !freeUserRole) {
            throw new Error('Default plan or role not found in database')
        }

        // Use upsert to handle race conditions
        await prisma.$transaction(async (tx: any) => {
            // Upsert user (create if not exists, update if exists)
            await tx.user.upsert({
                where: { id: stackUser.id },
                update: {
                    email: stackUser.primaryEmail || `user-${stackUser.id}@temp.com`,
                    name: stackUser.displayName || 'Utilisateur',
                    updatedAt: new Date()
                },
                create: {
                    id: stackUser.id,
                    email: stackUser.primaryEmail || `user-${stackUser.id}@temp.com`,
                    name: stackUser.displayName || 'Utilisateur',
                    planId: freePlan.id,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            })

            // Check if user role exists, create if not
            const existingUserRole = await tx.userRole.findUnique({
                where: {
                    userId_roleId: {
                        userId: stackUser.id,
                        roleId: freeUserRole.id
                    }
                }
            })

            if (!existingUserRole) {
                await tx.userRole.create({
                    data: {
                        userId: stackUser.id,
                        roleId: freeUserRole.id
                    }
                })
            }
        })

        console.log(`User ${stackUser.id} ensured in database`)
    } catch (error) {
        // Handle specific Prisma errors more gracefully
        if (error instanceof Error && error.message.includes('P2002')) {
            // Unique constraint violation - this is expected in race conditions
            console.log(`User ${stackUser.id} already exists (race condition handled)`)
            return
        }

        console.error('Error ensuring user exists:', error)
        throw error
    }
}

/**
 * Handles foreign key constraint errors gracefully
 */
export function handleForeignKeyError(error: unknown, entityName: string = 'entity') {
    if (error instanceof Error && error.message.includes('_userId_fkey')) {
        return {
            error: `Utilisateur non trouvé. Veuillez vous reconnecter.`,
            status: 400
        }
    }

    console.error(`Error with ${entityName}:`, error)
    return {
        error: 'Erreur interne du serveur',
        status: 500
    }
}