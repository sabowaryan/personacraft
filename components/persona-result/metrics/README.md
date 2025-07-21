# Système de Métriques de Qualité des Personas

Ce module implémente un système complet de métriques de qualité pour les personas, incluant des composants visuels, des hooks de calcul et des tooltips explicatifs.

## Composants Principaux

### QualityMetricsGrid
Composant principal qui affiche une grille complète des métriques de qualité avec :
- Score global de qualité
- Métriques détaillées (complétude, cohérence, réalisme)
- Indicateurs de performance
- Tooltips explicatifs avec tendances et benchmarks

```tsx
import { QualityMetricsGrid } from '@/components/persona-result/metrics';

<QualityMetricsGrid
  persona={persona}
  showTrends={true}
  compact={false}
/>
```

### ScoreCard
Carte individuelle pour afficher un score spécifique avec :
- Visualisation circulaire ou linéaire
- Indicateurs de tendance
- Tooltips détaillés
- Animations fluides

```tsx
import { ScoreCard } from '@/components/persona-result/metrics';

<ScoreCard
  title="Complétude"
  score={85}
  variant="success"
  trend={{ value: 5, direction: 'up' }}
  tooltip={<MetricsTooltip ... />}
/>
```

### PerformanceIndicator
Indicateur de performance pour afficher l'évolution des métriques :
- Graphiques de tendance
- Comparaisons temporelles
- Métriques de performance système

```tsx
import { PerformanceIndicator } from '@/components/persona-result/metrics';

<PerformanceIndicator
  title="Évolution Qualité"
  data={[
    { label: 'Complétude', value: 85, trend: { value: 5, direction: 'up' } }
  ]}
  type="percentage"
/>
```

### MetricsTooltip
Tooltip avancé avec informations détaillées :
- Facteurs d'évaluation
- Recommandations d'amélioration
- Comparaisons avec benchmarks
- Tendances temporelles

```tsx
import { MetricsTooltip } from '@/components/persona-result/metrics';

<MetricsTooltip
  title="Score de Complétude"
  description="Mesure la richesse des informations"
  score={85}
  factors={['Bio détaillée', 'Citation authentique', ...]}
  recommendations={['Ajouter plus de détails', ...]}
  trend={{ value: 5, direction: 'up', timeframe: '7 derniers jours' }}
  benchmark={80}
/>
```

## Hooks

### usePersonaMetrics
Hook principal pour calculer les métriques d'un persona :

```tsx
import { usePersonaMetrics } from '@/hooks/use-persona-metrics';

const metrics = usePersonaMetrics(persona);
// Retourne: { qualityScore, completionScore, engagementLevel, ... }
```

### usePersonaComparison
Hook pour comparer plusieurs personas :

```tsx
import { usePersonaComparison } from '@/hooks/use-persona-metrics';

const comparison = usePersonaComparison([persona1, persona2, persona3]);
// Retourne: { metrics, averageQuality, bestPerformer, ... }
```

## Types de Métriques

### Métriques de Base
- **qualityScore**: Score global de qualité (0-100)
- **completionScore**: Pourcentage de complétude des données
- **engagementLevel**: Niveau d'engagement ('low' | 'medium' | 'high')
- **dataRichness**: Richesse des données culturelles
- **culturalAccuracy**: Précision des données culturelles
- **marketingRelevance**: Pertinence marketing

### Métriques de Validation
- **completeness**: Détail de la complétude
- **consistency**: Cohérence interne des données
- **realism**: Réalisme et authenticité
- **culturalAuthenticity**: Authenticité culturelle
- **marketingUtility**: Utilité pour le marketing
- **dataQuality**: Qualité globale des données

### Métriques de Performance
- **generationTime**: Temps de génération
- **apiCalls**: Statistiques des appels API
- **errorRate**: Taux d'erreur
- **cacheHitRate**: Taux de cache hit

## Utilisation avec Personas Standard vs Enrichis

Le système supporte automatiquement les deux types de personas :

```tsx
// Persona standard - calculs de base
const standardPersona: Persona = { ... };
const metrics1 = usePersonaMetrics(standardPersona);

// Persona enrichi - utilise les métriques existantes
const enhancedPersona: EnhancedPersona = {
  ...standardPersona,
  validation_metrics: { ... },
  generation_metadata: { ... }
};
const metrics2 = usePersonaMetrics(enhancedPersona);
```

## Composants Mémorisés

Pour optimiser les performances, utilisez les composants mémorisés :

```tsx
import { MemoizedMetricsGrid, MemoizedQualityScore } from '@/components/persona-result/metrics';

// Grille mémorisée pour éviter les recalculs
<MemoizedMetricsGrid persona={persona} showDetails={true} />

// Score de qualité mémorisé
<MemoizedQualityScore persona={persona} />
```

## Démonstration

Un composant de démonstration est disponible pour tester le système :

```tsx
import { MetricsDemo } from '@/components/persona-result/metrics';

<MetricsDemo />
```

## Personnalisation

### Couleurs et Thèmes
Les composants utilisent le système de design PersonaCraft avec support du mode sombre.

### Animations
Toutes les animations respectent `prefers-reduced-motion` pour l'accessibilité.

### Responsive
Tous les composants sont entièrement responsive avec des breakpoints adaptatifs.

## Accessibilité

- Support complet du clavier
- ARIA labels appropriés
- Contraste respectant WCAG 2.1 AA
- Support des lecteurs d'écran
- Respect des préférences de mouvement réduit

## Performance

- Mémorisation des calculs coûteux
- Lazy loading des tooltips
- Optimisation des re-renders
- Virtual scrolling pour les grandes listes

## Intégration

Le système s'intègre parfaitement avec :
- Le système de design PersonaCraft
- Les hooks de préférences utilisateur
- Le système d'export
- Les composants de navigation

## Exemples d'Usage

### Affichage Compact
```tsx
<QualityMetricsGrid persona={persona} compact={true} showTrends={false} />
```

### Affichage Détaillé avec Tendances
```tsx
<QualityMetricsGrid persona={persona} compact={false} showTrends={true} />
```

### Comparaison de Personas
```tsx
const comparison = usePersonaComparison(personas);
// Utiliser comparison.metrics pour afficher les comparaisons
```