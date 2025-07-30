# Requirements Document

## Introduction

Cette fonctionnalité vise à inverser le flux logique actuel de génération de personas pour résoudre les problèmes d'incohérence et de pertinence décevante. Au lieu de générer des personas avec Gemini puis les enrichir avec Qloo, nous allons d'abord utiliser les données du formulaire BriefForm (brief, localisation, tranche d'âge, intérêts, valeurs) pour extraire des signaux culturels concrets via l'API Qloo, puis utiliser ces données vérifiées pour contraindre et guider la génération Gemini. Cette approche garantit que les personas générés sont ancrés dans la réalité culturelle et comportementale actuelle, avec une cohérence parfaite entre goûts, lieu, âge, valeurs et marques aimées.

## Requirements

### Requirement 1

**User Story:** En tant qu'utilisateur utilisant le BriefForm, je veux que les données culturelles (musique, marques, restaurants, etc.) des personas générés soient cohérentes avec la localisation, tranche d'âge et intérêts que j'ai spécifiés dans le formulaire, afin d'obtenir des insights marketing pertinents et réalistes.

#### Acceptance Criteria

1. WHEN l'utilisateur soumet le BriefForm avec localisation, ageRange (min/max), et intérêts THEN le système SHALL d'abord extraire les signaux culturels via l'API Qloo avant de générer les personas
2. WHEN les données Qloo sont récupérées THEN le système SHALL utiliser ces données comme contraintes pour le prompt Gemini
3. WHEN un persona est généré THEN ses préférences culturelles SHALL être cohérentes avec la localisation spécifiée dans le formulaire
4. WHEN un persona est généré THEN ses goûts musicaux, marques préférées et restaurants SHALL correspondre à la tranche d'âge (ageRange.min à ageRange.max) du formulaire
5. IF les données Qloo ne sont pas disponibles pour les paramètres spécifiés THEN le système SHALL utiliser un fallback intelligent basé sur des données démographiques réelles

### Requirement 2

**User Story:** En tant que développeur, je veux un nouveau flux de génération qui utilise directement les données structurées du BriefFormData pour alimenter Qloo en premier, afin de garantir la cohérence des données culturelles dès la création du persona.

#### Acceptance Criteria

1. WHEN le processus de génération démarre avec BriefFormData THEN le système SHALL utiliser directement les champs location, ageRange, interests et values pour les appels Qloo
2. WHEN les signaux sont extraits du BriefFormData THEN le système SHALL faire les appels API Qloo pour récupérer les données culturelles correspondantes (musique, marques, restaurants, etc.)
3. WHEN les données Qloo sont récupérées THEN le système SHALL composer un prompt enrichi pour Gemini incluant ces contraintes culturelles spécifiques
4. WHEN Gemini génère le persona THEN il SHALL respecter les contraintes culturelles fournies par Qloo et les intérêts/valeurs du formulaire
5. WHEN le persona est créé THEN il SHALL inclure les données culturelles Qloo directement sans post-traitement d'enrichissement

### Requirement 3

**User Story:** En tant qu'utilisateur, je veux que le système utilise intelligemment les données que j'ai saisies dans le BriefForm (brief, location, ageRange, interests, values) pour créer des personas cohérents, afin de ne pas avoir d'incohérences entre mes spécifications et les résultats.

#### Acceptance Criteria

1. WHEN l'utilisateur spécifie une location dans le BriefForm THEN le système SHALL utiliser cette localisation exacte pour les appels Qloo
2. WHEN l'utilisateur définit une ageRange (min/max) THEN le système SHALL utiliser cette tranche d'âge pour filtrer les données culturelles Qloo appropriées
3. WHEN l'utilisateur sélectionne des interests (prédéfinis ou personnalisés) THEN le système SHALL les intégrer dans le prompt Gemini comme contraintes supplémentaires
4. WHEN l'utilisateur sélectionne des values (prédéfinies ou personnalisées) THEN le système SHALL les utiliser pour guider les préférences culturelles via Qloo
5. WHEN le brief contient des informations démographiques THEN le système SHALL les combiner avec les champs structurés du formulaire

### Requirement 4

**User Story:** En tant qu'utilisateur, je veux que les personas générés reflètent des tendances culturelles actuelles et localisées correspondant exactement aux paramètres de mon BriefForm, afin d'avoir des insights marketing plus précis et actionnables.

#### Acceptance Criteria

1. WHEN des données culturelles sont récupérées via Qloo pour la location spécifiée THEN elles SHALL refléter les tendances actuelles de cette région
2. WHEN un persona est généré pour la tranche d'âge définie (ageRange) THEN ses goûts SHALL correspondre aux tendances générationnelles de cette tranche
3. WHEN plusieurs personas sont générés avec le même BriefFormData THEN ils SHALL présenter une diversité cohérente au sein des contraintes culturelles
4. WHEN les interests (PREDEFINED_INTERESTS ou personnalisés) sont spécifiés THEN ils SHALL être reflétés dans les préférences culturelles des personas
5. WHEN les values (PREDEFINED_VALUES ou personnalisées) sont spécifiées THEN elles SHALL influencer les choix de marques et préférences via Qloo
6. WHEN les données Qloo sont indisponibles pour une région THEN le système SHALL utiliser des données de régions similaires ou des fallbacks pertinents

### Requirement 5

**User Story:** En tant que développeur, je veux maintenir la compatibilité avec l'interface BriefForm existante et l'API generate-personas tout en implémentant le nouveau flux, afin de ne pas casser l'expérience utilisateur actuelle.

#### Acceptance Criteria

1. WHEN le nouveau flux est implémenté THEN l'API `/api/generate-personas` SHALL accepter le même BriefFormData en entrée
2. WHEN le nouveau flux est utilisé THEN les hooks `usePersona` existants SHALL continuer à fonctionner sans modification
3. WHEN une erreur survient dans le nouveau flux THEN le système SHALL fallback vers l'ancien flux comme mécanisme de récupération
4. WHEN le nouveau flux est activé THEN il SHALL être configurable via une feature flag
5. IF le nouveau flux échoue THEN les utilisateurs SHALL recevoir des personas générés via l'ancien flux avec un indicateur de source dans la réponse

### Requirement 6

**User Story:** En tant qu'utilisateur, je veux que le système optimise les appels Qloo en fonction du nombre de personas demandé (personaCount) et de la langue sélectionnée, afin d'obtenir des résultats cohérents et performants.

#### Acceptance Criteria

1. WHEN personaCount est spécifié dans le BriefFormData THEN le système SHALL adapter le nombre d'appels Qloo en conséquence
2. WHEN la langue est définie (fr/en) THEN le système SHALL utiliser cette langue pour les prompts Gemini et les mappings Qloo appropriés
3. WHEN plusieurs personas sont demandés THEN le système SHALL diversifier les données Qloo pour éviter des doublons
4. WHEN les appels Qloo sont effectués THEN ils SHALL être optimisés pour minimiser la latence tout en respectant les rate limits
5. WHEN les données culturelles sont récupérées THEN elles SHALL être mises en cache pour éviter des appels redondants