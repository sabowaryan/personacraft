'use client';

import { useState, useEffect } from 'react';
import { shouldBypassAuth } from '@/lib/feature-flags';

export interface DevUser {
  id: string;
  displayName?: string;
  primaryEmail: string;
  primaryEmailVerified: boolean;
  profileImageUrl?: string | null;
  clientReadOnlyMetadata?: {
    onboarded?: boolean;
    company?: string;
    role?: string;
    industry?: string;
    teamSize?: string;
    useCase?: string;
    goals?: string[];
    experience?: string;
    onboardedAt?: string;
  };
  signOut: () => Promise<void>;
}

/**
 * Hook de développement pour remplacer useUser de Stack Auth
 * Utilise les feature flags pour déterminer si on doit retourner un utilisateur fictif
 */
export function useDevAuth(): DevUser | null {
  const [user, setUser] = useState<DevUser | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    if (shouldBypassAuth()) {
      // Retourner un utilisateur fictif pour le développement
      setUser({
        id: 'dev-user',
        displayName: 'Dev User',
        primaryEmail: 'dev@example.com',
        primaryEmailVerified: false, // Set to false to test email verification flow
        profileImageUrl: null,
        clientReadOnlyMetadata: {
          onboarded: false, // Par défaut, pas encore onboardé
          company: '',
          role: '',
          industry: '',
          teamSize: '',
          useCase: '',
          goals: [],
          experience: '',
        },
        signOut: async () => {
          console.log('🚫 Mock signOut called in dev mode');
          setUser(null);
          // In dev mode, we can redirect to home or signin
          window.location.href = '/';
        }
      });
    } else {
      // En mode production, on devrait utiliser le vrai système d'auth
      // Pour l'instant, on retourne null pour forcer la redirection
      setUser(null);
    }
  }, []);

  // Pendant l'hydration, retourner null pour éviter les mismatches
  if (!isClient) {
    return null;
  }

  return user;
}