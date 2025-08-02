import { useUser } from '@stackframe/stack'
import { shouldBypassAuth } from '@/lib/feature-flags'

/**
 * Hook sécurisé pour utiliser useUser avec les feature flags
 * Retourne null si l'auth est désactivée pour éviter les erreurs
 */
export function useSafeUser() {
  try {
    // Si l'auth est bypassée, retourner null
    if (shouldBypassAuth()) {
      return null;
    }
    
    // Sinon, utiliser le hook normal
    return useUser();
  } catch (error) {
    // En cas d'erreur (ex: provider manquant), retourner null
    console.warn('useUser hook failed, likely due to missing StackProvider:', error);
    return null;
  }
}