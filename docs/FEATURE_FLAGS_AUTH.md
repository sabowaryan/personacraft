# Feature Flags pour l'Authentification

Ce document explique comment utiliser les feature flags pour contrôler l'authentification dans l'application.

## Variables d'environnement disponibles

### Contrôle général de l'authentification
```env
# Désactive complètement l'authentification
AUTH_ENABLED=false

# Mode développement - bypass toute l'auth (uniquement en dev)
DEV_DISABLE_AUTH=true
```

### Contrôles granulaires
```env
# Désactive la vérification d'email obligatoire
EMAIL_VERIFICATION_REQUIRED=false

# Désactive l'onboarding obligatoire
ONBOARDING_REQUIRED=false

# Désactive les permissions admin
ADMIN_PERMISSIONS_ENABLED=false

# Désactive les limites de création de personas
PERSONA_LIMITS_ENABLED=false
```

### Variables publiques (pour le client)
```env
NEXT_PUBLIC_AUTH_ENABLED=false
NEXT_PUBLIC_DEV_DISABLE_AUTH=true
```

## Utilisation

### 1. Désactiver complètement l'authentification

Dans votre fichier `.env` :
```env
AUTH_ENABLED=false
NEXT_PUBLIC_AUTH_ENABLED=false
```

Ou pour le développement uniquement :
```env
DEV_DISABLE_AUTH=true
NEXT_PUBLIC_DEV_DISABLE_AUTH=true
```

### 2. Désactiver seulement certaines fonctionnalités

```env
# Garder l'auth mais sans vérification email
EMAIL_VERIFICATION_REQUIRED=false

# Garder l'auth mais sans onboarding
ONBOARDING_REQUIRED=false
```

### 3. Utilisation dans le code

#### Côté serveur (middleware, API routes)
```typescript
import { shouldBypassAuth, isFeatureEnabled } from '@/lib/feature-flags';

// Vérifier si l'auth doit être bypassée
if (shouldBypassAuth()) {
  // Permettre l'accès sans authentification
}

// Vérifier une feature spécifique
if (isFeatureEnabled('EMAIL_VERIFICATION_REQUIRED')) {
  // Vérifier l'email
}
```

#### Côté client (composants React)
```typescript
import { useAuthStatus, useAuthFeature } from '@/hooks/use-auth-status';

function MyComponent() {
  const { user, isAuthenticated, isAuthDisabled } = useAuthStatus();
  const emailVerificationEnabled = useAuthFeature('EMAIL_VERIFICATION');
  
  if (isAuthDisabled) {
    // Mode sans authentification
  }
}
```

## Scénarios d'utilisation

### Développement local sans auth
```env
DEV_DISABLE_AUTH=true
NEXT_PUBLIC_DEV_DISABLE_AUTH=true
```

### Demo publique
```env
AUTH_ENABLED=false
NEXT_PUBLIC_AUTH_ENABLED=false
EMAIL_VERIFICATION_REQUIRED=false
ONBOARDING_REQUIRED=false
```

### Test d'intégration
```env
AUTH_ENABLED=true
EMAIL_VERIFICATION_REQUIRED=false
ONBOARDING_REQUIRED=false
ADMIN_PERMISSIONS_ENABLED=false
```

## Sécurité

⚠️ **Important** : Ces feature flags sont destinées au développement et aux tests. En production, assurez-vous que :

1. `AUTH_ENABLED=true` (par défaut)
2. `DEV_DISABLE_AUTH=false` (par défaut)
3. Les autres flags sont configurés selon vos besoins métier

## Redémarrage requis

Après modification des variables d'environnement, redémarrez votre serveur de développement :

```bash
npm run dev
```