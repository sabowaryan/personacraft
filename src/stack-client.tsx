'use client';

import { shouldBypassAuth } from './lib/feature-flags';

// Type pour l'utilisateur dev auth (compatible avec l'interface Stack)
export type DevUser = {
  id: string;
  primaryEmail: string;
  primaryEmailVerified: boolean;
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
};

// Mock client app pour le développement
const createMockClientApp = () => ({
  getUser: (): DevUser | null => {
    if (shouldBypassAuth()) {
      console.log('🔐 Client: Using dev auth - returning mock user');
      return {
        id: 'dev-user-client',
        primaryEmail: 'dev@example.com',
        primaryEmailVerified: false, // Set to false for client-side to test verification flow
        clientReadOnlyMetadata: {
          onboarded: false,
          company: '',
          role: '',
          industry: '',
          teamSize: '',
          useCase: '',
          goals: [],
          experience: '',
        },
        signOut: async () => {
          console.log('🔐 Client: Mock signOut called');
          // In dev mode, we can redirect to home or signin
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
        }
      };
    }
    return null;
  },

  signOut: async () => {
    console.log('🔐 Client: Mock signOut called');
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  },

  verifyEmail: async (code: string) => {
    console.log('🔐 Client: Mock email verification:', code);
    // Simuler un délai d'API
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  },

  sendVerificationEmail: async (email: string) => {
    console.log('🔐 Client: Mock send verification email:', email);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },

  // URLs de configuration pour la compatibilité
  urls: {
    emailVerification: '/handler/email-verification',
    afterSignUp: '/auth/verify-email',
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  }
});

// Create a singleton instance
export const stackClientApp = createMockClientApp();

// Also export as a function for compatibility
export function getStackClientApp() {
  return stackClientApp;
}