/**
 * Système de feature flags pour contrôler les fonctionnalités de l'application
 */

export interface FeatureFlags {
  AUTH_ENABLED: boolean;
  EMAIL_VERIFICATION_REQUIRED: boolean;
  ONBOARDING_REQUIRED: boolean;
  ADMIN_PERMISSIONS_ENABLED: boolean;
  PERSONA_LIMITS_ENABLED: boolean;
}

/**
 * Configuration des feature flags basée sur les variables d'environnement
 */
export const featureFlags: FeatureFlags = {
  // Authentification générale - utilise la variable publique pour éviter les problèmes d'hydration
  AUTH_ENABLED: process.env.NEXT_PUBLIC_AUTH_ENABLED !== 'false',
  
  // Vérification email obligatoire
  EMAIL_VERIFICATION_REQUIRED: process.env.EMAIL_VERIFICATION_REQUIRED !== 'false',
  
  // Onboarding obligatoire
  ONBOARDING_REQUIRED: process.env.ONBOARDING_REQUIRED !== 'false',
  
  // Permissions admin
  ADMIN_PERMISSIONS_ENABLED: process.env.ADMIN_PERMISSIONS_ENABLED !== 'false',
  
  // Limites de création de personas
  PERSONA_LIMITS_ENABLED: process.env.PERSONA_LIMITS_ENABLED !== 'false',
};

/**
 * Utilitaire pour vérifier si une feature est activée
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return featureFlags[feature];
}

/**
 * Mode développement - désactive toutes les protections d'auth
 */
export const isDevelopmentMode = process.env.NODE_ENV === 'development' && 
  process.env.NEXT_PUBLIC_DEV_DISABLE_AUTH === 'true';

/**
 * Vérifie si l'authentification doit être bypassée
 */
export function shouldBypassAuth(): boolean {
  return !isFeatureEnabled('AUTH_ENABLED') || isDevelopmentMode;
}