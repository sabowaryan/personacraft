# Composants de Résultats Persona

Ce dossier contient les composants pour la page de résultats de persona redessinée. Ces composants offrent une visualisation moderne et interactive des données de persona générées.

## Structure des composants

### Composant principal

- `persona-result.tsx` - Composant principal qui orchestre l'affichage complet du persona

### Composants de métriques

- `persona-score-card.tsx` - Affiche les scores de qualité et de complétude du persona
- `persona-stat-grid.tsx` - Grille de statistiques principales du persona

### Onglets de contenu

- `tabs/persona-profile-tab.tsx` - Onglet affichant le profil et les valeurs du persona
- `tabs/persona-interests-tab.tsx` - Onglet affichant les centres d'intérêt du persona
- `tabs/persona-communication-tab.tsx` - Onglet affichant les préférences de communication
- `tabs/persona-marketing-tab.tsx` - Onglet affichant les informations marketing

## Utilisation

```tsx
import { PersonaResult } from '@/components/persona-result';
import { Persona } from '@/lib/types/persona';

// Dans votre composant
function MyComponent() {
  const persona: Persona = { /* ... */ };
  
  return (
    <PersonaResult 
      persona={persona} 
      onBack={() => { /* ... */ }} 
    />
  );
}
```

## Fonctionnalités

- Affichage moderne et responsive des données de persona
- Visualisations interactives avec animations
- Navigation par onglets pour une meilleure organisation
- Scores et métriques visuels
- Support du mode sombre
- Compatibilité mobile

## Dépendances

Ces composants utilisent:

- Les composants UI de base (`Card`, `Tabs`, etc.)
- Les composants UI modernes (`ModernStatCard`, `CircularScore`, etc.)
- Tailwind CSS pour le styling
- Lucide React pour les icônes

## Personnalisation

Les composants sont conçus pour être facilement personnalisables via:

- Les props des composants
- Les classes Tailwind CSS
- Les thèmes clair/sombre

## Accessibilité

Ces composants sont conçus en tenant compte de l'accessibilité:

- Navigation au clavier
- Attributs ARIA appropriés
- Contrastes de couleur conformes
- Structure sémantique