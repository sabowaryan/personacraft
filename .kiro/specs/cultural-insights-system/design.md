# Design Document - Cultural Insights System

## Overview

Le système d'insights culturels unifie la structure des données culturelles en remplaçant l'incohérence actuelle entre `culturalData` (listes simples) et `socialMediaInsights` (données analytiques complexes) par une structure d'insights cohérente et riche pour toutes les catégories culturelles.

**Problème actuel :** Le système présente une incohérence majeure où les données culturelles sont stockées sous deux formats différents :
- `culturalData` : listes simples de chaînes (ex: `music: ["Artist 1", "Artist 2"]`)
- `socialMediaInsights` : structure complexe avec scores, analyses et métadonnées

**Solution proposée :** Créer un système d'insights unifié qui fournit des données analytiques riches pour toutes les catégories culturelles, permettant une compréhension approfondie et cohérente des préférences culturelles des personas.

## Architecture

### Structure des Insights Culturels

Le nouveau système introduit une interface `CulturalInsight` qui standardise la représentation des données culturelles :

```typescript
interface CulturalInsight {
  category: string;
  items: CulturalInsightItem[];
  metadata: InsightMetadata;
  analytics: InsightAnalytics;
}

interface CulturalInsightItem {
  name: string;
  relevanceScore: number; // 0-100
  confidence: number; // 0-1
  source: 'qloo' | 'fallback' | 'user';
  attributes?: Record<string, any>;
  relationships?: string[]; // Relations avec d'autres items
}

interface InsightMetadata {
  generatedAt: string;
  source: 'qloo' | 'fallback' | 'hybrid';
  dataQuality: 'high' | 'medium' | 'low';
  enrichmentLevel: number; // 0-100
}

interface InsightAnalytics {
  preferences: PreferenceAnalysis;
  behavioralInfluence: BehavioralInfluence;
  demographicAlignment: DemographicAlignment;
  trends: TrendAnalysis;
}
```

### Nouvelle Structure de Données

La structure `CulturalData` évolue vers `CulturalInsights` :

```typescript
interface CulturalInsights {
  music: CulturalInsight;
  brand: CulturalInsight;
  movie: CulturalInsight;
  tv: CulturalInsight;
  book: CulturalInsight;
  restaurant: CulturalInsight;
  travel: CulturalInsight;
  fashion: CulturalInsight;
  beauty: CulturalInsight;
  food: CulturalInsight;
  socialMedia: CulturalInsight; // Intégré dans la structure unifiée
}
```

## Components and Interfaces

### 1. Insight Generation Engine

**Responsabilité :** Génération des insights culturels enrichis à partir des données Qloo et des fallbacks.

```typescript
class CulturalInsightEngine {
  async generateInsights(persona: Partial<Persona>): Promise<CulturalInsights>;
  async enrichCategory(category: string, persona: Partial<Persona>): Promise<CulturalInsight>;
  private calculateRelevanceScores(items: string[], persona: Partial<Persona>): number[];
  private analyzeBehavioralInfluence(items: CulturalInsightItem[], persona: Partial<Persona>): BehavioralInfluence;
}
```

**Décision de conception :** Utilisation d'un moteur centralisé pour assurer la cohérence des algorithmes d'enrichissement entre toutes les catégories.

### 2. Data Migration Service

**Responsabilité :** Migration des données existantes vers la nouvelle structure.

```typescript
class CulturalDataMigrationService {
  async migratePersona(persona: Persona): Promise<Persona>;
  private migrateCulturalData(culturalData: CulturalData): Promise<CulturalInsights>;
  private migrateSocialMediaInsights(insights: SocialMediaInsights): Promise<CulturalInsight>;
  private preserveDataIntegrity(original: any, migrated: any): boolean;
}
```

**Décision de conception :** Service de migration séparé pour permettre une migration progressive et réversible des données existantes.

### 3. Insight Renderer

**Responsabilité :** Affichage cohérent des insights dans l'interface utilisateur.

```typescript
class InsightRenderer {
  renderCategoryInsight(insight: CulturalInsight): React.ReactElement;
  renderInsightAnalytics(analytics: InsightAnalytics): React.ReactElement;
  renderTrendIndicators(trends: TrendAnalysis): React.ReactElement;
  private getVisualizationConfig(category: string): VisualizationConfig;
}
```

### 4. Template Engine Updates

**Responsabilité :** Mise à jour des templates de génération pour produire la nouvelle structure.

```typescript
class EnhancedTemplateEngine {
  generateQlooFirstTemplate(): string;
  generateStandardTemplate(): string;
  private buildInsightPrompts(categories: string[]): string;
  private ensureInsightStructure(template: string): string;
}
```

## Data Models

### Modèles d'Analyse

```typescript
interface PreferenceAnalysis {
  primaryPreferences: string[]; // Top 3 préférences
  secondaryPreferences: string[]; // Préférences modérées
  emergingInterests: string[]; // Nouvelles tendances détectées
  preferenceStrength: number; // Force globale des préférences (0-100)
}

interface BehavioralInfluence {
  purchaseInfluence: number; // Impact sur les décisions d'achat (0-100)
  socialInfluence: number; // Impact sur le comportement social (0-100)
  lifestyleAlignment: number; // Alignement avec le style de vie (0-100)
  emotionalConnection: number; // Connexion émotionnelle (0-100)
}

interface DemographicAlignment {
  ageGroupAlignment: number; // Alignement avec le groupe d'âge (0-100)
  locationAlignment: number; // Alignement géographique (0-100)
  occupationAlignment: number; // Alignement professionnel (0-100)
  overallFit: number; // Cohérence démographique globale (0-100)
}

interface TrendAnalysis {
  currentTrends: string[]; // Tendances actuelles identifiées
  emergingTrends: string[]; // Tendances émergentes
  trendAlignment: number; // Alignement avec les tendances (0-100)
  innovatorScore: number; // Score d'adoption précoce (0-100)
}
```

### Modèle de Persona Enrichi

```typescript
interface EnhancedPersona extends Omit<Persona, 'culturalData' | 'socialMediaInsights'> {
  culturalInsights: CulturalInsights;
  insightMetadata: {
    generationTimestamp: string;
    enrichmentLevel: number;
    dataQuality: 'high' | 'medium' | 'low';
    qlooDataUsed: boolean;
    migrationStatus?: 'original' | 'migrated' | 'enhanced';
  };
}
```

## Error Handling

### Stratégie de Gestion d'Erreurs

1. **Fallback Gracieux :** En cas d'échec de l'enrichissement Qloo, utilisation de données de fallback enrichies
2. **Validation Progressive :** Validation des insights à plusieurs niveaux (structure, contenu, cohérence)
3. **Récupération Partielle :** Possibilité de récupérer partiellement les insights même en cas d'erreur sur certaines catégories

```typescript
class InsightErrorHandler {
  handleEnrichmentFailure(category: string, error: Error): CulturalInsight;
  validateInsightStructure(insight: CulturalInsight): ValidationResult;
  recoverPartialInsights(partialData: any): CulturalInsights;
  logInsightErrors(errors: InsightError[]): void;
}

interface InsightError {
  category: string;
  errorType: 'enrichment' | 'validation' | 'migration';
  message: string;
  recoveryAction: string;
}
```

### Mécanismes de Récupération

- **Cache de Secours :** Utilisation de données mises en cache en cas d'indisponibilité de l'API
- **Dégradation Progressive :** Réduction du niveau de détail plutôt qu'échec complet
- **Retry Logic :** Tentatives de récupération avec backoff exponentiel

## Testing Strategy

### Tests Unitaires

1. **Moteur d'Insights :** Tests de génération d'insights pour chaque catégorie
2. **Migration de Données :** Tests de migration avec différents formats de données existantes
3. **Validation :** Tests de validation de structure et de cohérence
4. **Fallbacks :** Tests des mécanismes de fallback

### Tests d'Intégration

1. **Pipeline Complet :** Tests du flux complet de génération à affichage
2. **API Qloo :** Tests d'intégration avec l'API Qloo (avec mocks)
3. **Base de Données :** Tests de persistance et récupération des insights

### Tests de Performance

1. **Temps de Génération :** Mesure du temps de génération des insights
2. **Utilisation Mémoire :** Monitoring de l'utilisation mémoire avec la nouvelle structure
3. **Charge API :** Tests de charge sur les appels API Qloo

### Tests de Migration

```typescript
describe('Cultural Data Migration', () => {
  test('should migrate simple culturalData to insights structure');
  test('should preserve socialMediaInsights in unified structure');
  test('should handle missing data gracefully');
  test('should maintain data integrity during migration');
  test('should be reversible for rollback scenarios');
});
```

### Tests d'Interface Utilisateur

1. **Affichage Cohérent :** Tests de rendu cohérent pour toutes les catégories
2. **États d'Erreur :** Tests d'affichage des états d'erreur et de chargement
3. **Interactivité :** Tests des fonctionnalités interactives des insights

## Implementation Phases

### Phase 1: Infrastructure de Base
- Création des nouvelles interfaces TypeScript
- Implémentation du moteur d'insights de base
- Tests unitaires des composants core

### Phase 2: Migration et Compatibilité
- Service de migration des données existantes
- Maintien de la compatibilité avec l'ancien système
- Tests de migration sur données réelles

### Phase 3: Enrichissement Qloo
- Intégration avec l'API Qloo pour tous les types d'insights
- Implémentation des algorithmes d'analyse
- Optimisation des performances

### Phase 4: Interface Utilisateur
- Mise à jour des composants d'affichage
- Nouvelles visualisations pour les insights
- Tests d'interface utilisateur

### Phase 5: Déploiement et Monitoring
- Déploiement progressif avec feature flags
- Monitoring des performances et de la qualité des données
- Optimisations basées sur les métriques réelles

## Performance Considerations

### Optimisations Prévues

1. **Cache Intelligent :** Cache des insights générés avec invalidation intelligente
2. **Génération Asynchrone :** Génération des insights en arrière-plan pour améliorer la réactivité
3. **Compression des Données :** Compression des structures d'insights pour réduire l'utilisation mémoire
4. **Lazy Loading :** Chargement à la demande des insights détaillés

### Métriques de Performance

- Temps de génération par catégorie d'insight
- Taux de succès des enrichissements Qloo
- Utilisation mémoire par persona enrichie
- Temps de rendu des interfaces utilisateur

## Security and Privacy

### Protection des Données

1. **Anonymisation :** Anonymisation des données personnelles dans les insights
2. **Chiffrement :** Chiffrement des données sensibles en transit et au repos
3. **Audit Trail :** Traçabilité des accès et modifications des insights

### Conformité

- Respect du RGPD pour les données européennes
- Conformité aux standards de l'industrie pour la protection des données
- Politiques de rétention des données d'insights