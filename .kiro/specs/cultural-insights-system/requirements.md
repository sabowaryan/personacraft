# Requirements Document - Cultural Insights System

## Introduction

Cette fonctionnalité vise à résoudre l'incohérence actuelle entre `culturalData` (données simples) et `socialMediaInsights` (données analytiques complexes) en créant un système d'insights cohérent pour toutes les catégories culturelles. Au lieu d'avoir des listes simples dans `culturalData` et des insights complexes uniquement pour les réseaux sociaux, nous créerons des insights riches pour toutes les catégories : musique, marques, films, restaurants, etc.

## Requirements

### Requirement 1

**User Story:** En tant qu'utilisateur générant des personas avec Qloo-first, je veux que toutes les données culturelles aient le même niveau de richesse analytique, afin d'avoir une compréhension cohérente et approfondie de chaque persona.

#### Acceptance Criteria

1. WHEN un persona est généré avec Qloo-first THEN toutes les catégories culturelles (music, brand, movie, tv, book, restaurant, travel, fashion, beauty, food, socialMedia) SHALL avoir des insights structurés
2. WHEN l'enrichissement Qloo est appliqué THEN chaque catégorie culturelle SHALL contenir des données analytiques (préférences, scores de pertinence, influences comportementales)
3. WHEN un persona est affiché THEN l'interface utilisateur SHALL présenter les insights de manière cohérente pour toutes les catégories

### Requirement 2

**User Story:** En tant que développeur, je veux une structure de données cohérente pour tous les insights culturels, afin de simplifier le code et éviter les incohérences.

#### Acceptance Criteria

1. WHEN les types TypeScript sont définis THEN ils SHALL suivre une structure commune pour tous les insights culturels
2. WHEN l'enrichissement Qloo génère des insights THEN ils SHALL utiliser la même interface de base pour toutes les catégories
3. WHEN les données sont sauvegardées THEN la structure SHALL être cohérente entre toutes les catégories d'insights

### Requirement 3

**User Story:** En tant qu'utilisateur consultant un persona, je veux voir des insights détaillés pour chaque catégorie culturelle (musique, marques, films, etc.), afin de mieux comprendre les préférences et comportements du persona.

#### Acceptance Criteria

1. WHEN je consulte un persona enrichi THEN je SHALL voir des insights détaillés pour la musique (artistes préférés, genres, influence sur l'humeur)
2. WHEN je consulte un persona enrichi THEN je SHALL voir des insights détaillés pour les marques (loyauté, influence d'achat, perception)
3. WHEN je consulte un persona enrichi THEN je SHALL voir des insights détaillés pour les films/TV (genres préférés, fréquence de visionnage, plateformes)
4. WHEN je consulte un persona enrichi THEN je SHALL voir des insights détaillés pour les restaurants (types de cuisine, fréquence, budget)
5. WHEN je consulte un persona enrichi THEN je SHALL voir des insights détaillés pour les voyages (destinations, style de voyage, budget)
6. WHEN je consulte un persona enrichi THEN je SHALL voir des insights détaillés pour la mode/beauté (marques, style, influence)

### Requirement 4

**User Story:** En tant que système, je veux migrer les données existantes vers la nouvelle structure d'insights, afin de maintenir la compatibilité avec les personas déjà créés.

#### Acceptance Criteria

1. WHEN la migration est exécutée THEN les personas existants avec `culturalData` simple SHALL être convertis vers la nouvelle structure d'insights
2. WHEN la migration est exécutée THEN les `socialMediaInsights` existants SHALL être intégrés dans la nouvelle structure cohérente
3. WHEN la migration est terminée THEN aucune donnée existante ne SHALL être perdue
4. WHEN un persona migré est affiché THEN il SHALL fonctionner correctement avec la nouvelle interface

### Requirement 5

**User Story:** En tant qu'utilisateur, je veux que les templates de génération soient mis à jour pour refléter la nouvelle structure d'insights, afin que les nouveaux personas générés soient cohérents.

#### Acceptance Criteria

1. WHEN un template Qloo-first est utilisé THEN il SHALL générer la structure d'insights pour toutes les catégories culturelles
2. WHEN l'enrichissement Qloo est appliqué THEN il SHALL peupler les insights avec des données réelles de l'API Qloo
3. WHEN un persona est généré sans Qloo THEN il SHALL avoir une structure d'insights de base cohérente
4. WHEN les templates sont mis à jour THEN ils SHALL maintenir la compatibilité avec les validateurs existants

### Requirement 6

**User Story:** En tant qu'utilisateur de l'interface, je veux une présentation visuelle améliorée des insights culturels, afin de mieux comprendre et utiliser les informations du persona.

#### Acceptance Criteria

1. WHEN j'affiche un persona THEN chaque catégorie d'insights SHALL avoir sa propre section visuelle distincte
2. WHEN je consulte les insights THEN ils SHALL être présentés avec des indicateurs visuels (scores, graphiques, badges)
3. WHEN les insights sont affichés THEN ils SHALL être organisés de manière logique et intuitive
4. WHEN aucun insight n'est disponible pour une catégorie THEN l'interface SHALL afficher un état vide approprié