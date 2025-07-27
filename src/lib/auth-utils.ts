import { getStackServerApp } from '@/stack-server'

export interface AuthenticatedUser {
  id: string;
  [key: string]: any;
}

export async function getAuthenticatedUser(timeoutMs: number = 10000, retries: number = 2): Promise<AuthenticatedUser | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const stackServerApp = await getStackServerApp();
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