import { useDevAuth } from '@/hooks/use-dev-auth'
import { shouldBypassAuth } from '@/lib/feature-flags'

/**
 * Hook sécurisé pour utiliser l'authentification avec les feature flags
 * Utilise le système dev auth quand l'auth Stack est désactivée
 */
export function useSafeUser() {
  try {
    // Si l'auth est bypassée, utiliser le dev auth
    if (shouldBypassAuth()) {
      return useDevAuth();
    }
    
    // En mode production sans Stack Auth, retourner null
    // (Dans un vrai déploiement, vous pourriez vouloir utiliser un autre système d'auth ici)
    console.warn('Auth enabled but Stack Auth not available - returning null');
    return null;
  } catch (error) {
    // En cas d'erreur, retourner null
    console.warn('Auth hook failed:', error);
    return null;
  }
}