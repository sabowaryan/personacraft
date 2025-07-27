import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class PermissionService {
  async hasPermission(userId: string, permissionName: string): Promise<boolean> {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    for (const userRole of userRoles) {
      for (const rolePermission of userRole.role.permissions) {
        if (rolePermission.permission.name === permissionName) {
          return true;
        }
      }
    }
    return false;
  }

  async getUserPlan(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { plan: true },
    });
    return user?.plan || null;
  }

  async checkPersonaLimit(userId: string): Promise<boolean> {
    const userPlan = await this.getUserPlan(userId);
    if (!userPlan || userPlan.personasLimit === null) {
      return true; // Unlimited or no specific limit defined
    }

    // Assuming you have a way to count existing personas for the user
    // This is a placeholder, you'll need to implement actual persona counting
    const currentPersonasCount = 0; // Replace with actual count from your database

    return currentPersonasCount < userPlan.personasLimit;
  }

  // Add more limitation checks as needed (e.g., exports, API access)
}

export const permissionService = new PermissionService();


