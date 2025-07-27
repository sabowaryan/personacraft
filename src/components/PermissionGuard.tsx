import React from 'react';
import { usePermissions } from '../hooks/use-permissions';

interface PermissionGuardProps {
  userId: string | null;
  requiredPermission?: string;
  requiredRole?: string;
  requiredPermissions?: string[];
  requireAll?: boolean; // Si true, toutes les permissions sont requises, sinon au moins une
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGuard({
  userId,
  requiredPermission,
  requiredRole,
  requiredPermissions = [],
  requireAll = false,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { hasPermission, hasRole, hasAnyPermission, hasAllPermissions, loading } = usePermissions(userId);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!userId) {
    return <>{fallback}</>;
  }

  // Vérification du rôle
  if (requiredRole && !hasRole(requiredRole)) {
    return <>{fallback}</>;
  }

  // Vérification d'une permission spécifique
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <>{fallback}</>;
  }

  // Vérification de plusieurs permissions
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasRequiredPermissions) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

// Composant pour afficher du contenu uniquement si l'utilisateur a la permission
export function ShowIfPermission({
  userId,
  permission,
  children,
}: {
  userId: string | null;
  permission: string;
  children: React.ReactNode;
}) {
  return (
    <PermissionGuard userId={userId} requiredPermission={permission}>
      {children}
    </PermissionGuard>
  );
}

// Composant pour afficher du contenu uniquement si l'utilisateur a le rôle
export function ShowIfRole({
  userId,
  role,
  children,
}: {
  userId: string | null;
  role: string;
  children: React.ReactNode;
}) {
  return (
    <PermissionGuard userId={userId} requiredRole={role}>
      {children}
    </PermissionGuard>
  );
}