import { useState, useEffect } from 'react';
import { getUserPermissions, UserPermissions } from '../lib/permissions';

export function usePermissions(userId: string | null) {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setPermissions(null);
      setLoading(false);
      return;
    }

    const fetchPermissions = async () => {
      try {
        setLoading(true);
        setError(null);
        const userPermissions = await getUserPermissions(userId);
        setPermissions(userPermissions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des permissions');
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [userId]);

  const hasPermission = (permissionName: string): boolean => {
    return permissions?.permissions.includes(permissionName) ?? false;
  };

  const hasRole = (roleName: string): boolean => {
    return permissions?.roles.includes(roleName) ?? false;
  };

  const hasAnyPermission = (permissionNames: string[]): boolean => {
    return permissionNames.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissionNames: string[]): boolean => {
    return permissionNames.every(permission => hasPermission(permission));
  };

  return {
    permissions,
    loading,
    error,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
  };
}