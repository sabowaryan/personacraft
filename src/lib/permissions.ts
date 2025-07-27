import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface UserPermissions {
  userId: string;
  permissions: string[];
  roles: string[];
}

/**
 * Récupère toutes les permissions d'un utilisateur
 */
export async function getUserPermissions(userId: string): Promise<UserPermissions> {
  const userWithRoles = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
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
      },
    },
  });

  if (!userWithRoles) {
    return { userId, permissions: [], roles: [] };
  }

  const permissions = new Set<string>();
  const roles: string[] = [];

  userWithRoles.roles.forEach((userRole) => {
    roles.push(userRole.role.name);
    userRole.role.permissions.forEach((rolePermission) => {
      permissions.add(rolePermission.permission.name);
    });
  });

  return {
    userId,
    permissions: Array.from(permissions),
    roles,
  };
}

/**
 * Vérifie si un utilisateur a une permission spécifique
 */
export async function hasPermission(userId: string, permissionName: string): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId);
  return userPermissions.permissions.includes(permissionName);
}

/**
 * Vérifie si un utilisateur a un rôle spécifique
 */
export async function hasRole(userId: string, roleName: string): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId);
  return userPermissions.roles.includes(roleName);
}

/**
 * Vérifie si un utilisateur a au moins une des permissions données
 */
export async function hasAnyPermission(userId: string, permissionNames: string[]): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId);
  return permissionNames.some(permission => userPermissions.permissions.includes(permission));
}

/**
 * Vérifie si un utilisateur a toutes les permissions données
 */
export async function hasAllPermissions(userId: string, permissionNames: string[]): Promise<boolean> {
  const userPermissions = await getUserPermissions(userId);
  return permissionNames.every(permission => userPermissions.permissions.includes(permission));
}

/**
 * Middleware pour vérifier les permissions dans les API routes
 */
export function requirePermission(permissionName: string) {
  return async (userId: string) => {
    const hasRequiredPermission = await hasPermission(userId, permissionName);
    if (!hasRequiredPermission) {
      throw new Error(`Permission requise: ${permissionName}`);
    }
    return true;
  };
}

/**
 * Middleware pour vérifier les rôles dans les API routes
 */
export function requireRole(roleName: string) {
  return async (userId: string) => {
    const hasRequiredRole = await hasRole(userId, roleName);
    if (!hasRequiredRole) {
      throw new Error(`Rôle requis: ${roleName}`);
    }
    return true;
  };
}

// Constantes pour les permissions
export const PERMISSIONS = {
  // Persona permissions
  CREATE_PERSONA: 'create_persona',
  READ_PERSONA: 'read_persona',
  UPDATE_PERSONA: 'update_persona',
  DELETE_PERSONA: 'delete_persona',
  EXPORT_PERSONA: 'export_persona',
  
  // User management
  CREATE_USER: 'create_user',
  READ_USER: 'read_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  
  // Plan management
  CREATE_PLAN: 'create_plan',
  READ_PLAN: 'read_plan',
  UPDATE_PLAN: 'update_plan',
  DELETE_PLAN: 'delete_plan',
  
  // Role management
  CREATE_ROLE: 'create_role',
  READ_ROLE: 'read_role',
  UPDATE_ROLE: 'update_role',
  DELETE_ROLE: 'delete_role',
  ASSIGN_ROLE: 'assign_role',
  
  // Admin access
  ACCESS_ADMIN_PANEL: 'access_admin_panel',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_SETTINGS: 'manage_settings',
  
  // API access
  API_ACCESS: 'api_access',
  API_ADMIN: 'api_admin',
  
  // Features
  ACCESS_CULTURAL_INSIGHTS: 'access_cultural_insights',
  ACCESS_SUPPORT: 'access_support',
  MANAGE_SUPPORT: 'manage_support',
} as const;

// Constantes pour les rôles
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  PREMIUM_USER: 'premium_user',
  PRO_USER: 'pro_user',
  BASIC_USER: 'basic_user',
  FREE_USER: 'free_user',
} as const;