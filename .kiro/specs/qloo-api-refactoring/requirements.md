# Requirements Document - Refactorisation API Qloo

## Introduction

Cette spécification définit la refactorisation complète de l'intégration API Qloo dans PersonaCraft pour se conformer aux recommandations officielles du hackathon Qloo. L'objectif est de remplacer l'implémentation actuelle non-conforme par une intégration qui utilise correctement les endpoints documentés, les paramètres appropriés et le flux de données recommandé.

La refactorisation permettra d'exploiter pleinement les capacités de Qloo Taste AI™ pour enrichir les personas avec des données culturelles authentiques et améliorer significativement la qualité des recommandations.

## Requirements

### Requirement 1 - Conformité API Qloo Hackathon

**User Story:** En tant que développeur PersonaCraft, je veux que l'intégration Qloo respecte les spécifications officielles du hackathon, afin d'obtenir des données culturelles authentiques et fiables.

#### Acceptance Criteria

1. WHEN l'application fait un appel à l'API Qloo THEN elle DOIT utiliser l'URL de base `https://hackathon.api.qloo.com`
2. WHEN l'application demande des insights THEN elle DOIT utiliser l'endpoint `/v2/insights` avec le paramètre obligatoire `filter.type`
3. WHEN l'application spécifie des types d'entités THEN elle DOIT utiliser les URNs documentés (`urn:entity:brand`, `urn:entity:artist`, etc.)
4. WHEN l'application envoie des paramètres THEN elle DOIT utiliser uniquement les paramètres documentés Qloo (signal.*, filter.*)
5. WHEN l'application reçoit une erreur 404 THEN elle DOIT inclure un endpoint valide après l'URL de base

### Requirement 2 - Flux de Données Recommandé

**User Story:** En tant que système PersonaCraft, je veux suivre le flux de données recommandé par Qloo, afin d'obtenir des IDs valides et des recommandations pertinentes.

#### Acceptance Criteria

1. WHEN le système a besoin de recommandations THEN il DOIT d'abord rechercher des IDs d'entités via `/search`
2. WHEN le système recherche des tags THEN il DOIT utiliser l'endpoint `/v2/tags` pour obtenir des IDs de tags valides
3. WHEN le système recherche des audiences THEN il DOIT utiliser l'endpoint `/v2/audiences` pour obtenir des IDs d'audience
4. WHEN le système a des IDs valides THEN il DOIT les passer comme paramètres `signal.*` ou `filter.*` dans `/v2/insights`
5. WHEN le système fait une requête insights THEN il DOIT s'assurer que les paramètres sont valides pour le `filter.type` choisi

### Requirement 3 - Gestion d'Erreurs Robuste

**User Story:** En tant qu'utilisateur de PersonaCraft, je veux que le système gère gracieusement les erreurs Qloo, afin d'avoir une expérience utilisateur fluide même en cas de problème API.

#### Acceptance Criteria

1. WHEN l'API Qloo retourne une erreur 401 THEN le système DOIT afficher un message clair sur la clé API
2. WHEN l'API Qloo retourne une erreur 403 THEN le système DOIT expliquer les permissions insuffisantes
3. WHEN l'API Qloo retourne "at least one valid signal or filter is required" THEN le système DOIT rechercher des IDs valides
4. WHEN l'API Qloo est indisponible THEN le système DOIT utiliser des données fallback intelligentes
5. WHEN une erreur survient THEN le système DOIT logger les détails pour le debugging

### Requirement 4 - Types et Interfaces Conformes

**User Story:** En tant que développeur, je veux des types TypeScript qui reflètent exactement l'API Qloo officielle, afin d'avoir une intégration type-safe et maintenable.

#### Acceptance Criteria

1. WHEN je définis des types d'entités THEN je DOIS utiliser les URNs officiels Qloo
2. WHEN je définis des paramètres de requête THEN je DOIS inclure `filter.type` comme obligatoire
3. WHEN je définis des signaux THEN je DOIS supporter `signal.interests.entities`, `signal.interests.tags`, `signal.demographics.audiences`
4. WHEN je définis des filtres THEN je DOIS supporter `filter.tags`, `filter.entities` selon le type
5. WHEN je définis des réponses THEN je DOIS refléter la structure exacte de l'API Qloo

### Requirement 5 - Intégration PersonaCraft Optimisée

**User Story:** En tant que générateur de personas, je veux que les données Qloo soient parfaitement intégrées dans le processus de génération, afin de créer des personas culturellement riches et authentiques.

#### Acceptance Criteria

1. WHEN PersonaCraft génère un persona THEN il DOIT rechercher des entités Qloo basées sur les intérêts utilisateur
2. WHEN PersonaCraft a des entités Qloo THEN il DOIT les utiliser comme signaux dans la requête insights
3. WHEN PersonaCraft reçoit des insights Qloo THEN il DOIT les structurer pour Gemini
4. WHEN PersonaCraft combine les données THEN il DOIT préserver la traçabilité des sources Qloo
5. WHEN PersonaCraft échoue avec Qloo THEN il DOIT continuer avec des données fallback cohérentes

### Requirement 6 - Performance et Cache

**User Story:** En tant qu'utilisateur, je veux que les appels Qloo soient optimisés et mis en cache, afin d'avoir des temps de réponse rapides et de respecter les limites de taux.

#### Acceptance Criteria

1. WHEN le système fait des appels répétés THEN il DOIT utiliser un cache intelligent avec TTL
2. WHEN le système atteint les limites de taux THEN il DOIT implémenter un backoff exponentiel
3. WHEN le système fait des recherches d'entités THEN il DOIT batching les requêtes similaires
4. WHEN le système utilise le cache THEN il DOIT respecter les headers de cache Qloo
5. WHEN le système monitore les performances THEN il DOIT tracker les métriques d'appels Qloo

### Requirement 7 - Tests et Validation

**User Story:** En tant que développeur, je veux des tests complets pour l'intégration Qloo, afin de garantir la fiabilité et la conformité continue.

#### Acceptance Criteria

1. WHEN je teste l'intégration THEN je DOIS avoir des tests unitaires pour chaque endpoint
2. WHEN je teste les erreurs THEN je DOIS couvrir tous les codes d'erreur Qloo documentés
3. WHEN je teste les types THEN je DOIS valider la conformité avec les spécifications Qloo
4. WHEN je teste l'intégration PersonaCraft THEN je DOIS vérifier le flux complet de données
5. WHEN je teste les fallbacks THEN je DOIS m'assurer qu'ils produisent des données cohérentes

### Requirement 8 - Documentation et Monitoring

**User Story:** En tant que développeur et administrateur, je veux une documentation claire et un monitoring de l'intégration Qloo, afin de maintenir et déboguer efficacement le système.

#### Acceptance Criteria

1. WHEN je consulte la documentation THEN je DOIS avoir des exemples d'utilisation pour chaque endpoint
2. WHEN je monitore l'API THEN je DOIS avoir des métriques sur les taux de succès/échec
3. WHEN je débogue des problèmes THEN je DOIS avoir des logs structurés avec les détails des requêtes
4. WHEN je configure l'environnement THEN je DOIS avoir des instructions claires pour les clés API
5. WHEN je déploie THEN je DOIS avoir des health checks pour vérifier la connectivité Qloo