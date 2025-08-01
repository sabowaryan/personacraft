'use client';

import { useUser } from "@stackframe/stack";
import { useEffect, useState } from "react";

/**
 * Hook pour vérifier le statut d'authentification avec support des feature flags
 */
export function useAuthStatus() {
  const [isAuthDisabled, setIsAuthDisabled] = useState(false);
  const stackUser = useUser();

  useEffect(() => {
    // Vérifier si l'auth est désactivée côté client
    const authDisabled = process.env.NEXT_PUBLIC_AUTH_ENABLED === 'false' || 
                         (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEV_DISABLE_AUTH === 'true');
    setIsAuthDisabled(authDisabled);
  }, []);

  return {
    // Si l'auth est désactivée, considérer l'utilisateur comme connecté
    user: isAuthDisabled ? { id: 'dev-user', primaryEmail: 'dev@example.com', primaryEmailVerified: true } : stackUser,
    isAuthenticated: isAuthDisabled || !!stackUser,
    isAuthDisabled,
    isLoading: !isAuthDisabled && stackUser === undefined,
  };
}

/**
 * Hook pour vérifier si une feature d'auth est activée côté client
 */
export function useAuthFeature(feature: 'EMAIL_VERIFICATION' | 'ONBOARDING' | 'ADMIN_PERMISSIONS' | 'PERSONA_LIMITS') {
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    const envMap = {
      'EMAIL_VERIFICATION': 'NEXT_PUBLIC_EMAIL_VERIFICATION_REQUIRED',
      'ONBOARDING': 'NEXT_PUBLIC_ONBOARDING_REQUIRED', 
      'ADMIN_PERMISSIONS': 'NEXT_PUBLIC_ADMIN_PERMISSIONS_ENABLED',
      'PERSONA_LIMITS': 'NEXT_PUBLIC_PERSONA_LIMITS_ENABLED'
    };

    const envVar = envMap[feature];
    setIsEnabled(process.env[envVar] !== 'false');
  }, [feature]);

  return isEnabled;
}