import { useEffect, useState } from 'react';
import { useDevAuth } from './use-dev-auth';
import { permissionService } from '../services/permissionService';

export function useAuth() {
  const user = useDevAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      // Charger le plan de l'utilisateur
      const userPlan = await permissionService.getUserPlan(user.id);
      setPlan(userPlan);

      // Ici, vous pourriez charger les permissions de l'utilisateur
      // Pour l'instant, nous utilisons un exemple statique
      setPermissions(['create_persona', 'view_dashboard']);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: string) => {
    return permissions.includes(permission);
  };

  const canCreatePersona = async () => {
    if (!user) return false;
    return await permissionService.checkPersonaLimit(user.id);
  };

  return {
    user,
    plan,
    permissions,
    loading,
    hasPermission,
    canCreatePersona,
    isAuthenticated: !!user,
  };
}

