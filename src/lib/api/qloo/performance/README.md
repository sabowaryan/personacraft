# Système de Performance Qloo

Ce dossier contient tous les composants de performance et de cache pour l'API Qloo, organisés de manière modulaire pour une meilleure maintenance et évolutivité.

## Structure du Dossier

```
performance/
├── cache/                    # Composants de cache
│   ├── optimized-cache.ts           # Cache optimisé avec gestion avancée
│   └── cache-error-recovery.ts      # Récupération d'erreurs de cache
├── optimization/             # Optimisations de performance
│   ├── performance-optimizations.ts # Optimiseur de performance principal
│   ├── advanced-performance-optimizer.ts # Optimiseur avancé
│   └── performance-error-handler.ts # Gestion d'erreurs de performance
├── monitoring/               # Surveillance et métriques
│   ├── performance-monitor.ts       # Moniteur de performance
│   └── real-time-monitor.ts        # Surveillance en temps réel
├── requests/                 # Gestion des requêtes
│   ├── request-batcher.ts          # Regroupement et priorisation des requêtes
│   └── intelligent-preloader.ts    # Préchargement intelligent
├── tuning/                   # Auto-optimisation
│   └── auto-tuner.ts              # Système d'auto-tuning
├── integration/              # Intégration système
│   ├── integrated-request-system.ts # Système de requêtes intégré
│   └── qloo-api-adapter.ts         # Adaptateur API Qloo
└── index.ts                  # Point d'entrée principal
```

## Composants Principaux

### Cache (`cache/`)
- **OptimizedCache**: Cache haute performance avec TTL et éviction intelligente
- **CacheErrorRecovery**: Système de récupération d'erreurs avec fallback

### Optimisation (`optimization/`)
- **PerformanceOptimizer**: Optimiseur principal avec stratégies configurables
- **AdvancedPerformanceOptimizer**: Optimisations avancées et métriques détaillées
- **PerformanceErrorHandler**: Gestion centralisée des erreurs de performance

### Surveillance (`monitoring/`)
- **PerformanceMonitor**: Collecte et analyse des métriques de performance
- **RealTimeMonitor**: Surveillance en temps réel avec alertes

### Requêtes (`requests/`)
- **RequestBatcher**: Regroupement et priorisation des requêtes
- **IntelligentPreloader**: Préchargement basé sur les patterns d'usage

### Auto-tuning (`tuning/`)
- **AutoTuner**: Optimisation automatique des paramètres système

### Intégration (`integration/`)
- **IntegratedRequestSystem**: Système unifié combinant tous les composants
- **QlooApiAdapter**: Adaptateur pour compatibilité avec l'API existante

## Utilisation

### Import Principal
```typescript
import { 
  initializePerformanceSystem,
  integratedRequestSystem,
  getPerformanceStats 
} from '@/lib/api/qloo/performance';
```

### Initialisation
```typescript
// Initialisation avec configuration par défaut
initializePerformanceSystem();

// Ou avec configuration personnalisée
initializePerformanceSystem({
  cache: {
    maxSize: 2000,
    defaultTTL: 7200000 // 2 heures
  },
  optimization: {
    maxConcurrentRequests: 12,
    cacheStrategy: 'aggressive'
  }
});
```

### Utilisation du Système Intégré
```typescript
// Requête optimisée
const result = await integratedRequestSystem.makeRequest('brands', {
  age: 25,
  location: 'Paris',
  interests: ['technology', 'fashion']
});

// Statistiques de performance
const stats = getPerformanceStats();
console.log('Cache hit rate:', stats.cache.hitRate);
```

## Configuration

Le système utilise une configuration centralisée définie dans `index.ts`:

```typescript
export interface PerformanceConfig {
  cache: {
    maxSize: number;
    defaultTTL: number;
    enableErrorRecovery: boolean;
  };
  optimization: {
    maxConcurrentRequests: number;
    requestTimeout: number;
    cacheStrategy: 'aggressive' | 'balanced' | 'conservative';
    batchingEnabled: boolean;
    priorityEnabled: boolean;
  };
  monitoring: {
    enableRealTimeAlerts: boolean;
    samplingInterval: number;
    retentionPeriod: number;
  };
  preloading: {
    enableIntelligentPreloading: boolean;
    maxPreloadItems: number;
    preloadThreshold: number;
  };
  autoTuning: {
    enabled: boolean;
    tuningInterval: number;
  };
}
```

## Avantages de cette Organisation

1. **Modularité**: Chaque composant a une responsabilité claire
2. **Maintenabilité**: Structure logique facilitant les modifications
3. **Testabilité**: Composants isolés plus faciles à tester
4. **Évolutivité**: Ajout facile de nouveaux composants
5. **Réutilisabilité**: Composants utilisables indépendamment
6. **Documentation**: Structure auto-documentée

## Migration

Les imports existants ont été automatiquement mis à jour. Si vous rencontrez des erreurs d'import, vérifiez que vous utilisez les nouveaux chemins:

- Ancien: `@/lib/api/qloo/performance-monitor`
- Nouveau: `@/lib/api/qloo/performance/monitoring/performance-monitor`

Ou utilisez l'import depuis l'index principal:
```typescript
import { PerformanceMonitor } from '@/lib/api/qloo/performance';
```