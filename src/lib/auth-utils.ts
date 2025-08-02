import { shouldBypassAuth } from '@/lib/feature-flags'

export interface AuthenticatedUser {
  id: string;
  [key: string]: any;
}

export async function getAuthenticatedUser(timeoutMs: number = 10000, retries: number = 2): Promise<AuthenticatedUser | null> {
  // Si l'auth est désactivée, retourner un utilisateur fictif
  if (shouldBypassAuth()) {
    console.log('🚫 Auth bypassed - returning dev user from getAuthenticatedUser');
    return {
      id: 'dev-user',
      primaryEmail: 'dev@example.com',
      primaryEmailVerified: true,
      clientReadOnlyMetadata: {
        onboarded: true,
        company: 'Dev Company',
        role: 'developer',
        industry: 'tech',
        teamSize: 'small',
        useCase: 'personal-project',
        goals: ['better-targeting'],
        experience: 'advanced',
        onboardedAt: new Date().toISOString()
      },
      // Méthode mock pour l'onboarding en mode dev
      update: async (data: any) => {
        console.log('🚫 Mock user update - onboarding data:', data);
        return Promise.resolve();
      }
    };
  }

  // Importation dynamique de getStackServerApp pour éviter les problèmes SSR
  const { getStackServerApp } = await import('@/stack-server');

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const stackServerApp = await getStackServerApp();
      if (!stackServerApp) {
        throw new Error('StackServerApp not available on server side or failed to initialize');
      }
      const userPromise = stackServerApp.getUser();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Auth timeout')), timeoutMs)
      );

      const user = await Promise.race([userPromise, timeoutPromise]) as any;
      return user;
    } catch (error) {
      console.warn(`Auth attempt ${attempt + 1} failed:`, error);
      
      if (attempt === retries) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  return null;
}

