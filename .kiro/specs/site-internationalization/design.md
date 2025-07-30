# Design Document - Internationalisation du Site

## Overview

Cette conception détaille l'implémentation d'un système d'internationalisation (i18n) complet pour PersonaCraft, utilisant Next.js 15 avec le système de routing intégré et la bibliothèque next-intl pour la gestion des traductions. Le système supportera initialement le français et l'anglais, avec une architecture extensible pour ajouter facilement d'autres langues.

## Architecture

### Structure des Langues et Routing

Le système utilisera le routing basé sur les segments de Next.js 15 avec la structure suivante :

```
src/app/
├── [locale]/                    # Segment dynamique pour la langue
│   ├── layout.tsx              # Layout principal avec contexte i18n
│   ├── page.tsx                # Page d'accueil localisée
│   ├── dashboard/              # Pages dashboard localisées
│   ├── auth/                   # Pages d'authentification localisées
│   └── ...                     # Autres pages
├── api/                        # API routes (non localisées)
├── globals.css                 # Styles globaux
└── middleware.ts               # Middleware pour détection/redirection
```

### Configuration des Locales

Configuration centralisée dans `src/lib/i18n/config.ts` :

```typescript
export const locales = ['en', 'fr'] as const;
export type Locale = typeof locales[number];
export const defaultLocale: Locale = 'en';

export const localeConfig = {
  en: {
    name: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h'
  },
  fr: {
    name: 'Français',
    flag: '🇫🇷',
    direction: 'ltr',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h'
  }
};
```

## Components and Interfaces

### 1. Middleware de Détection de Langue

Le middleware Next.js gérera la détection automatique et les redirections :

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

function getLocale(request: NextRequest): string {
  // Logique de détection basée sur :
  // 1. Cookie de préférence utilisateur
  // 2. Header Accept-Language
  // 3. Langue par défaut
}

export function middleware(request: NextRequest) {
  // Redirection vers la bonne locale si nécessaire
  // Gestion des routes API (pas de redirection)
  // Persistance des préférences utilisateur
}
```

### 2. Composant Sélecteur de Langue

Composant réutilisable pour changer de langue :

```typescript
// src/components/i18n/LanguageSelector.tsx
interface LanguageSelectorProps {
  variant?: 'dropdown' | 'toggle' | 'flags';
  size?: 'sm' | 'md' | 'lg';
  showFlag?: boolean;
  showName?: boolean;
}

export function LanguageSelector({
  variant = 'dropdown',
  size = 'md',
  showFlag = true,
  showName = true
}: LanguageSelectorProps) {
  // Logique de changement de langue avec navigation
  // Persistance de la préférence
  // Animation de transition
}
```

### 3. Hooks d'Internationalisation

Hooks personnalisés pour faciliter l'utilisation :

```typescript
// src/hooks/useTranslation.ts
export function useTranslation(namespace?: string) {
  // Hook principal pour les traductions
  // Support des namespaces
  // Interpolation de variables
  // Pluralisation
}

// src/hooks/useLocale.ts
export function useLocale() {
  // Hook pour obtenir/changer la locale actuelle
  // Navigation avec préservation de la route
}

// src/hooks/useLocalizedFormat.ts
export function useLocalizedFormat() {
  // Hook pour formater dates, nombres, devises
  // Basé sur la locale actuelle
}
```

### 4. Composants de Layout Localisés

Adaptation des composants existants pour l'i18n :

```typescript
// src/components/i18n/LocalizedNavbar.tsx
export function LocalizedNavbar() {
  // Version localisée de la Navbar existante
  // Intégration du sélecteur de langue
  // Liens localisés
}

// src/app/[locale]/layout.tsx
export default function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Layout principal avec contexte i18n
  // Validation de la locale
  // Chargement des traductions
}
```

## Data Models

### Structure des Fichiers de Traduction

Organisation hiérarchique des traductions :

```
src/lib/i18n/messages/
├── en/
│   ├── common.json              # Éléments communs (navigation, boutons)
│   ├── auth.json               # Authentification
│   ├── dashboard.json          # Dashboard
│   ├── personas.json           # Gestion des personas
│   ├── errors.json             # Messages d'erreur
│   └── validation.json         # Messages de validation
├── fr/
│   ├── common.json
│   ├── auth.json
│   ├── dashboard.json
│   ├── personas.json
│   ├── errors.json
│   └── validation.json
└── index.ts                    # Export centralisé
```

### Format des Messages

Structure standardisée pour les traductions :

```json
{
  "navigation": {
    "home": "Accueil",
    "features": "Fonctionnalités",
    "pricing": "Tarifs",
    "dashboard": "Tableau de bord"
  },
  "buttons": {
    "save": "Enregistrer",
    "cancel": "Annuler",
    "delete": "Supprimer",
    "edit": "Modifier"
  },
  "forms": {
    "validation": {
      "required": "Ce champ est requis",
      "email": "Adresse email invalide",
      "minLength": "Minimum {count} caractères"
    }
  },
  "personas": {
    "title": "Mes Personas",
    "create": "Créer un persona",
    "count": {
      "zero": "Aucun persona",
      "one": "1 persona",
      "other": "{count} personas"
    }
  }
}
```

### Modèle de Configuration Utilisateur

Extension du modèle utilisateur pour les préférences linguistiques :

```typescript
// Extension du schéma Prisma
model UserPreferences {
  id        String @id @default(cuid())
  userId    String @unique
  locale    String @default("en")
  timezone  String?
  dateFormat String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("user_preferences")
}
```

## Error Handling

### Gestion des Erreurs de Traduction

Système robuste pour gérer les traductions manquantes :

```typescript
// src/lib/i18n/error-handler.ts
export class TranslationError extends Error {
  constructor(
    public key: string,
    public locale: string,
    public namespace?: string
  ) {
    super(`Missing translation: ${key} for locale ${locale}`);
  }
}

export function handleMissingTranslation(
  key: string,
  locale: string,
  fallback?: string
): string {
  // Log en développement
  // Fallback vers l'anglais
  // Retour de la clé si aucun fallback
  // Notification aux développeurs
}
```

### Pages d'Erreur Localisées

Pages d'erreur adaptées à chaque langue :

```typescript
// src/app/[locale]/not-found.tsx
export default function NotFound() {
  // Page 404 localisée
  // Messages d'erreur traduits
  // Navigation de retour localisée
}

// src/app/[locale]/error.tsx
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Page d'erreur générique localisée
  // Messages d'erreur traduits
  // Actions de récupération localisées
}
```

## Testing Strategy

### Tests de Traduction

Suite de tests pour valider l'intégrité des traductions :

```typescript
// src/lib/i18n/__tests__/translations.test.ts
describe('Translation Integrity', () => {
  test('all locales have same keys', () => {
    // Vérifier que toutes les langues ont les mêmes clés
  });

  test('no missing translations', () => {
    // Détecter les traductions manquantes
  });

  test('interpolation variables match', () => {
    // Vérifier la cohérence des variables d'interpolation
  });
});
```

### Tests de Composants Localisés

Tests pour les composants avec i18n :

```typescript
// src/components/i18n/__tests__/LanguageSelector.test.tsx
describe('LanguageSelector', () => {
  test('renders all available languages', () => {
    // Test d'affichage des langues
  });

  test('changes language on selection', () => {
    // Test de changement de langue
  });

  test('persists language preference', () => {
    // Test de persistance
  });
});
```

### Tests d'Intégration

Tests end-to-end pour les fonctionnalités i18n :

```typescript
// src/__tests__/i18n-integration.test.ts
describe('I18n Integration', () => {
  test('auto-detects browser language', () => {
    // Test de détection automatique
  });

  test('redirects to correct locale', () => {
    // Test de redirection
  });

  test('maintains locale across navigation', () => {
    // Test de persistance lors de la navigation
  });
});
```

## Performance Considerations

### Optimisation du Chargement

Stratégies pour optimiser les performances :

1. **Lazy Loading des Traductions** : Chargement à la demande par namespace
2. **Mise en Cache** : Cache des traductions côté client et serveur
3. **Compression** : Compression des fichiers de traduction
4. **Tree Shaking** : Élimination des traductions non utilisées

### Bundle Splitting

Configuration Webpack pour optimiser les bundles :

```javascript
// next.config.js - Extension
module.exports = {
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups.i18n = {
        test: /[\\/]messages[\\/]/,
        name: 'i18n',
        chunks: 'all',
        priority: 20,
        enforce: true,
      };
    }
    return config;
  },
};
```

## Migration Strategy

### Phase 1 : Infrastructure de Base
- Configuration Next.js et middleware
- Structure des fichiers de traduction
- Composants de base (LanguageSelector)

### Phase 2 : Pages Principales
- Page d'accueil et navigation
- Pages d'authentification
- Dashboard principal

### Phase 3 : Fonctionnalités Avancées
- Gestion des personas
- Formulaires complexes
- Messages d'erreur et validation

### Phase 4 : Optimisation et Tests
- Tests complets
- Optimisations de performance
- Documentation utilisateur

## Security Considerations

### Validation des Locales
- Validation stricte des paramètres de locale
- Protection contre l'injection de code
- Sanitisation des entrées utilisateur

### Gestion des Cookies
- Cookies sécurisés pour les préférences
- Respect du RGPD
- Expiration appropriée des cookies

Cette architecture garantit une internationalisation robuste, performante et maintenable, tout en respectant les meilleures pratiques de Next.js 15 et les standards modernes de développement web.