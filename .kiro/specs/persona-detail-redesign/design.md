# Design Document - Refonte Page Détails Persona

## Overview

Cette conception présente une refonte complète de la page de détails de persona avec un focus sur l'expérience utilisateur moderne, l'accessibilité et la présentation visuelle des données. Le nouveau design s'inspire des meilleures pratiques UX/UI contemporaines tout en conservant l'identité visuelle de PersonaCraft.

## Architecture

### Structure de la Page

```
┌─────────────────────────────────────────┐
│ Header Navigation (fixe)                │
├─────────────────────────────────────────┤
│ Hero Section (Avatar + Infos clés)     │
├─────────────────────────────────────────┤
│ Quick Stats Cards (métriques rapides)  │
├─────────────────────────────────────────┤
│ Tabbed Content (contenu détaillé)      │
│ ├─ Profil                              │
│ ├─ Intérêts & Préférences             │
│ ├─ Communication                       │
│ └─ Insights Marketing                  │
├─────────────────────────────────────────┤
│ Actions Footer (export, partage)       │
└─────────────────────────────────────────┘
```

### Système de Design

#### Palette de Couleurs
- **Primary**: Gradient bleu-violet (#4F46E5 → #7C3AED)
- **Secondary**: Gradient teal-emerald (#0D9488 → #059669)
- **Accent**: Orange vibrant (#F59E0B)
- **Neutral**: Échelle de gris moderne (#F8FAFC → #0F172A)
- **Semantic**: Vert succès, Rouge erreur, Ambre attention

#### Typographie
- **Headings**: Inter Bold (32px, 24px, 20px, 18px)
- **Body**: Inter Regular (16px, 14px)
- **Captions**: Inter Medium (12px, 11px)
- **Code**: JetBrains Mono (14px)

#### Espacements
- **Base unit**: 4px
- **Sections**: 32px, 24px, 16px
- **Components**: 12px, 8px, 4px

## Components and Interfaces

### 1. Hero Section Redesign

**Nouveau Design:**
```typescript
interface HeroSectionProps {
  persona: Persona;
  onBack: () => void;
  onExport: () => void;
  onShare: () => void;
}
```

**Caractéristiques:**
- Avatar large avec overlay de statut
- Informations clés en cards flottantes
- Citation mise en valeur avec design moderne
- Actions principales accessibles
- Background gradient adaptatif

### 2. Quick Stats Dashboard

**Métriques Visuelles:**
```typescript
interface QuickStatsProps {
  stats: {
    valuesCount: number;
    interestsCount: number;
    channelsCount: number;
    painPointsCount: number;
  };
  completionScore: number;
}
```

**Design:**
- Cards avec icônes colorées
- Barres de progression animées
- Hover effects subtils
- Responsive grid layout

### 3. Enhanced Tabbed Interface

**Navigation Améliorée:**
- Style "Notion-like" avec indicateurs visuels
- Transitions fluides entre onglets
- Badges de notification pour contenu riche
- Keyboard navigation support

### 4. Data Visualization Components

#### Interests Grid
```typescript
interface InterestsGridProps {
  interests: PersonaInterests;
  displayMode: 'grid' | 'list' | 'cloud';
}
```

#### Communication Radar
```typescript
interface CommunicationRadarProps {
  channels: string[];
  preferences: number[];
  tone: string;
}
```

#### Marketing Insights Panel
```typescript
interface MarketingInsightsProps {
  painPoints: string[];
  motivations: string[];
  buyingBehavior: string;
  influences: string[];
}
```

## Data Models

### Enhanced Persona Display Model
```typescript
interface PersonaDisplayData extends Persona {
  // Métriques calculées
  completionScore: number;
  engagementLevel: 'low' | 'medium' | 'high';
  
  // Données enrichies pour l'affichage
  displayMetrics: {
    totalInterests: number;
    primaryValues: string[];
    topChannels: string[];
    keyInsights: string[];
  };
  
  // Configuration d'affichage
  displayConfig: {
    theme: 'light' | 'dark' | 'auto';
    layout: 'compact' | 'detailed';
    animations: boolean;
  };
}
```

### Visual Theme Configuration
```typescript
interface PersonaTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundGradient: string;
  cardStyle: 'elevated' | 'flat' | 'outlined';
}
```

## Error Handling

### Loading States
1. **Skeleton Loading**: Placeholders animés pendant le chargement
2. **Progressive Loading**: Chargement par sections prioritaires
3. **Error Boundaries**: Gestion gracieuse des erreurs de composants

### Error States
```typescript
interface ErrorState {
  type: 'not_found' | 'loading_error' | 'network_error';
  message: string;
  recoveryActions: Array<{
    label: string;
    action: () => void;
  }>;
}
```

### Fallback Strategies
- Données en cache localStorage
- Mode dégradé sans enrichissements
- Retry automatique avec backoff

## Testing Strategy

### Visual Testing
1. **Chromatic**: Tests de régression visuelle
2. **Responsive Testing**: Breakpoints multiples
3. **Accessibility Testing**: axe-core integration
4. **Performance Testing**: Lighthouse CI

### Unit Testing
```typescript
// Tests de composants
describe('PersonaDetailRedesign', () => {
  test('renders hero section correctly');
  test('handles tab navigation');
  test('displays metrics accurately');
  test('supports keyboard navigation');
});
```

### Integration Testing
```typescript
// Tests d'intégration
describe('PersonaDetailFlow', () => {
  test('loads persona data correctly');
  test('handles export functionality');
  test('manages responsive breakpoints');
  test('maintains accessibility standards');
});
```

### Performance Testing
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Bundle Size**: Analyse avec webpack-bundle-analyzer
- **Memory Usage**: Profiling des fuites mémoire
- **Animation Performance**: 60fps target

## Accessibility Implementation

### WCAG 2.1 AA Compliance
1. **Keyboard Navigation**: Focus management et skip links
2. **Screen Reader Support**: ARIA labels et live regions
3. **Color Contrast**: Minimum 4.5:1 pour le texte normal
4. **Responsive Text**: Support du zoom jusqu'à 200%

### Semantic HTML Structure
```html
<main role="main" aria-labelledby="persona-title">
  <header aria-label="Persona overview">
    <h1 id="persona-title">Nom du Persona</h1>
  </header>
  
  <section aria-label="Quick statistics">
    <h2>Métriques rapides</h2>
  </section>
  
  <section aria-label="Detailed information">
    <div role="tablist" aria-label="Persona details">
      <button role="tab" aria-selected="true">Profil</button>
    </div>
  </section>
</main>
```

## Performance Optimizations

### Code Splitting
```typescript
// Lazy loading des onglets
const ProfileTab = lazy(() => import('./tabs/ProfileTab'));
const InterestsTab = lazy(() => import('./tabs/InterestsTab'));
const CommunicationTab = lazy(() => import('./tabs/CommunicationTab'));
const MarketingTab = lazy(() => import('./tabs/MarketingTab'));
```

### Image Optimization
- WebP avec fallback JPEG
- Lazy loading pour les images non critiques
- Responsive images avec srcset

### Animation Performance
```typescript
// Utilisation de transform et opacity pour les animations
const animationConfig = {
  initial: { opacity: 0, transform: 'translateY(20px)' },
  animate: { opacity: 1, transform: 'translateY(0px)' },
  transition: { duration: 0.3, ease: 'easeOut' }
};
```

## Mobile-First Responsive Design

### Breakpoints
```scss
$breakpoints: (
  'mobile': 320px,
  'tablet': 768px,
  'desktop': 1024px,
  'wide': 1440px
);
```

### Touch Interactions
- Minimum 44px touch targets
- Swipe gestures pour navigation onglets
- Pull-to-refresh sur mobile
- Haptic feedback où approprié

## Dark Mode Support

### Theme System
```typescript
interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  colors: {
    background: string;
    surface: string;
    primary: string;
    text: string;
  };
}
```

### CSS Variables Implementation
```css
:root {
  --color-background: #ffffff;
  --color-surface: #f8fafc;
  --color-primary: #4f46e5;
  --color-text: #0f172a;
}

[data-theme="dark"] {
  --color-background: #0f172a;
  --color-surface: #1e293b;
  --color-primary: #818cf8;
  --color-text: #f1f5f9;
}
```

## Animation & Micro-interactions

### Transition System
```typescript
const transitions = {
  fast: '150ms ease-out',
  normal: '300ms ease-out',
  slow: '500ms ease-out',
  spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
};
```

### Micro-interactions
1. **Hover States**: Subtle scale et shadow changes
2. **Loading States**: Skeleton animations
3. **Success States**: Checkmark animations
4. **Error States**: Shake animations
5. **Tab Transitions**: Slide et fade effects

## Implementation Phases

### Phase 1: Structure & Layout
- Nouveau layout responsive
- Système de design tokens
- Composants de base

### Phase 2: Data Visualization
- Charts et graphiques
- Métriques visuelles
- Animations de données

### Phase 3: Interactions & Polish
- Micro-interactions
- Animations avancées
- Optimisations performance

### Phase 4: Testing & Accessibility
- Tests complets
- Audit accessibilité
- Optimisations finales