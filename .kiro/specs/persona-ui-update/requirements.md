# Requirements Document

## Introduction

Cette fonctionnalité vise à mettre à jour l'interface utilisateur pour refléter les améliorations apportées par le système Qloo First et les templates de validation. Les personas générés par le nouveau système contiennent des métadonnées enrichies, des données culturelles plus précises et des informations de traçabilité qui ne sont pas actuellement affichées dans l'interface. Il faut également mettre à jour la structure de la base de données pour supporter ces nouvelles données et s'assurer que les pages de détail des personas affichent correctement toutes les informations disponibles.

## Requirements

### Requirement 1

**User Story:** En tant qu'utilisateur, je veux voir les métadonnées de génération (source, méthode utilisée, contraintes appliquées) dans l'interface des personas, afin de comprendre comment chaque persona a été créé et évaluer sa fiabilité.

#### Acceptance Criteria

1. WHEN un persona est affiché dans la liste THEN l'interface SHALL montrer un indicateur de la méthode de génération (qloo-first vs legacy)
2. WHEN un persona généré avec Qloo First est affiché THEN l'interface SHALL afficher les contraintes culturelles qui ont été appliquées
3. WHEN un persona est consulté en détail THEN l'interface SHALL afficher les métadonnées complètes de génération
4. WHEN les données Qloo ont été utilisées THEN l'interface SHALL indiquer clairement la source des données culturelles
5. IF un persona a été généré avec fallback THEN l'interface SHALL l'indiquer avec une explication

### Requirement 2

**User Story:** En tant qu'utilisateur, je veux que la page de détail des personas affiche toutes les nouvelles données culturelles enrichies, afin d'avoir une vue complète et précise de chaque persona.

#### Acceptance Criteria

1. WHEN j'accède à la page de détail d'un persona THEN elle SHALL afficher les données culturelles organisées par catégorie (musique, marques, restaurants, etc.)
2. WHEN les données culturelles sont affichées THEN elles SHALL être présentées de manière visuelle et facilement lisible
3. WHEN un persona contient des données d'insights sociaux THEN elles SHALL être affichées dans une section dédiée
4. WHEN les données de validation sont disponibles THEN elles SHALL être affichées avec les scores de qualité détaillés
5. WHEN les contraintes Qloo ont été appliquées THEN elles SHALL être visibles dans une section métadonnées

### Requirement 3

**User Story:** En tant qu'utilisateur, je veux que la table des personas dans la liste principale affiche les nouveaux indicateurs de qualité et de source, afin de pouvoir rapidement identifier les personas les plus fiables.

#### Acceptance Criteria

1. WHEN la liste des personas est affichée THEN chaque carte SHALL montrer un badge indiquant la méthode de génération
2. WHEN un persona a un score de validation élevé THEN il SHALL être mis en évidence visuellement
3. WHEN les données culturelles sont riches THEN un indicateur SHALL montrer la richesse des données disponibles
4. WHEN je filtre les personas THEN je SHALL pouvoir filtrer par méthode de génération et qualité des données
5. WHEN je trie les personas THEN je SHALL pouvoir trier par score de validation et richesse des données culturelles

### Requirement 4

**User Story:** En tant que développeur, je veux mettre à jour le schéma de base de données pour supporter les nouvelles métadonnées et structures de données, afin de persister correctement toutes les informations générées par le nouveau système.

#### Acceptance Criteria

1. WHEN un persona est sauvegardé THEN la base de données SHALL stocker les métadonnées de génération (source, méthode, temps de traitement)
2. WHEN les contraintes culturelles sont appliquées THEN elles SHALL être persistées dans la base de données
3. WHEN les données de validation sont disponibles THEN elles SHALL être stockées avec les détails de validation
4. WHEN les templates utilisés sont identifiés THEN cette information SHALL être sauvegardée
5. WHEN les données Qloo sont utilisées THEN les informations de cache et de fraîcheur SHALL être persistées

### Requirement 5

**User Story:** En tant qu'utilisateur, je veux que l'interface soit rétrocompatible avec les anciens personas, afin que mes personas existants continuent à s'afficher correctement même s'ils n'ont pas les nouvelles métadonnées.

#### Acceptance Criteria

1. WHEN un ancien persona sans métadonnées est affiché THEN l'interface SHALL fonctionner sans erreur
2. WHEN les nouvelles sections sont affichées pour un ancien persona THEN elles SHALL montrer des valeurs par défaut appropriées
3. WHEN un ancien persona est consulté THEN l'interface SHALL indiquer clairement qu'il s'agit d'un persona legacy
4. WHEN les filtres sont appliqués THEN les anciens personas SHALL être inclus avec des valeurs par défaut
5. IF des données sont manquantes THEN l'interface SHALL proposer une option de re-génération avec le nouveau système

### Requirement 6

**User Story:** En tant qu'utilisateur, je veux pouvoir comparer facilement les personas générés avec différentes méthodes, afin d'évaluer l'amélioration apportée par le nouveau système.

#### Acceptance Criteria

1. WHEN j'ai des personas générés avec différentes méthodes THEN je SHALL pouvoir les comparer côte à côte
2. WHEN je compare des personas THEN l'interface SHALL mettre en évidence les différences de qualité et de richesse des données
3. WHEN les scores de validation sont différents THEN ils SHALL être clairement comparables visuellement
4. WHEN les données culturelles varient THEN les différences SHALL être mises en évidence
5. WHEN je veux migrer un ancien persona THEN l'interface SHALL proposer une option de re-génération avec le nouveau système