// stack-server.ts
import "server-only";
import "./lib/polyfills"; // Import des polyfills en premier
import { shouldBypassAuth } from "./lib/feature-flags";

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
} | null;

export async function getStackServerApp() {
  // Mock server app pour le développement
  return {
    getUser: async (): Promise<DevUser> => {
      // Si l'auth est désactivée, retourner un utilisateur fictif
      if (shouldBypassAuth()) {
        console.log('🔐 Server: Using dev auth - returning mock user');
        return {
          id: 'dev-user-server',
          primaryEmail: 'dev@example.com',
          primaryEmailVerified: true, // Set to true for server-side to avoid redirect loops
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
        };
      }
      
      // En mode production sans Stack Auth, retourner null
      return null;
    },
    
    signOut: async () => {
      console.log('🔐 Server: Mock signOut called');
      return Promise.resolve();
    },
    
    // Méthodes additionnelles pour la compatibilité
    verifyEmail: async (code: string) => {
      console.log('🔐 Server: Mock email verification:', code);
      return Promise.resolve({ success: true });
    },
    
    sendVerificationEmail: async (email: string) => {
      console.log('🔐 Server: Mock send verification email:', email);
      return Promise.resolve({ success: true });
    }
  };
}


