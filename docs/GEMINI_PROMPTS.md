# Système de Prompts Gemini

Ce document explique comment utiliser le système de prompts modulaire pour l'API Gemini.

## Vue d'ensemble

Le système de prompts permet de :
- Centraliser tous les prompts dans un seul endroit
- Faciliter la maintenance et les tests A/B
- Utiliser des variables dynamiques dans les prompts
- Valider la structure des prompts
- Changer facilement de stratégie de prompt

## Structure des fichiers

```
src/lib/prompts/
├── gemini-prompts.ts    # Définition des prompts et du PromptManager
src/lib/api/
├── gemini.ts           # Client Gemini mis à jour
src/scripts/
├── test-prompt-system.js      # Tests du système de prompts
├── example-gemini-usage.js    # Exemples d'utilisation
```

## Types de prompts disponibles

### 1. DEFAULT - Prompt principal
- **ID**: `persona-generation-v2`
- **Usage**: Génération standard de personas marketing
- **Personas générés**: 2 par défaut
- **Spécialité**: Personas détaillés avec toutes les sections

### 2. SIMPLE - Prompt simplifié
- **ID**: `persona-generation-simple-v1`
- **Usage**: Génération rapide pour des briefs courts
- **Personas générés**: 2 par défaut
- **Spécialité**: Structure simplifiée, plus rapide

### 3. B2B - Prompt professionnel
- **ID**: `persona-generation-b2b-v1`
- **Usage**: Personas en contexte business B2B
- **Personas générés**: 2 par défaut
- **Spécialité**: Focus sur les aspects professionnels et processus d'achat

## Utilisation du GeminiClient

### Initialisation

```typescript
import { GeminiClient } from '@/lib/api/gemini';

// Avec le prompt par défaut
const client = new GeminiClient();

// Avec un prompt spécifique
const clientB2B = new GeminiClient('B2B');
```

### Génération de personas

```typescript
// Génération simple
const personas = await client.generatePersonas("Brief marketing ici");

// Avec un type de prompt spécifique
const personas = await client.generatePersonas("Brief marketing", {
  promptType: 'B2B'
});

// Avec des variables personnalisées
const personas = await client.generatePersonas("Brief marketing", {
  promptType: 'DEFAULT',
  variables: {
    personaCount: 3,
    minAge: 30,
    maxAge: 50,
    personalityTraitCount: 5
  }
});
```

### Gestion des prompts

```typescript
// Changer le prompt par défaut
client.setDefaultPromptType('B2B');

// Obtenir le prompt actuel
const currentType = client.getDefaultPromptType();

// Lister tous les types disponibles
const availableTypes = client.getAvailablePromptTypes();

// Générer un prompt de test
const testPrompt = client.generateTestPrompt('SIMPLE');
```

## Utilisation du PromptManager

### Construction manuelle de prompts

```typescript
import { PromptManager, PROMPTS } from '@/lib/prompts/gemini-prompts';

// Construction avec variables par défaut
const prompt = PromptManager.buildPrompt(
  PROMPTS.DEFAULT, 
  "Mon brief marketing"
);

// Construction avec variables personnalisées
const prompt = PromptManager.buildPrompt(
  PROMPTS.B2B, 
  "Mon brief B2B",
  {
    personaCount: 4,
    minAge: 35,
    maxAge: 55
  }
);
```

### Validation et utilitaires

```typescript
// Obtenir un prompt par ID
const prompt = PromptManager.getPromptById('persona-generation-v2');

// Lister tous les prompts
const allPrompts = PromptManager.getAllPrompts();

// Valider un prompt
const validation = PromptManager.validatePrompt(PROMPTS.DEFAULT);
if (!validation.valid) {
  console.log('Variables manquantes:', validation.missingVariables);
}

// Générer un prompt de test
const testPrompt = PromptManager.generateTestPrompt('persona-generation-b2b-v1');
```

## Variables disponibles

### Variables par défaut
```typescript
{
  personaCount: 2,           // Nombre de personas à générer
  minAge: 25,               // Age minimum
  maxAge: 45,               // Age maximum
  personalityTraitCount: 3,  // Nombre de traits de personnalité
  valuesCount: 3,           // Nombre de valeurs
  interestsCount: 3,        // Nombre de centres d'intérêt
  painPointsCount: 3,       // Nombre de points de douleur
  goalsCount: 3,            // Nombre d'objectifs
  channelsCount: 2,         // Nombre de canaux marketing
  minQualityScore: 75,      // Score de qualité minimum
  maxQualityScore: 95       // Score de qualité maximum
}
```

### Variables obligatoires
- `brief`: Le brief marketing (injecté automatiquement)

## Tests et développement

### Tester le système de prompts
```bash
node src/scripts/test-prompt-system.js
```

### Tester l'intégration Gemini
```bash
node src/scripts/example-gemini-usage.js
```

## Bonnes pratiques

### 1. Choix du prompt
- **DEFAULT**: Pour la plupart des cas d'usage
- **SIMPLE**: Pour des tests rapides ou des briefs courts
- **B2B**: Pour des contextes professionnels spécifiques

### 2. Variables personnalisées
- Utilisez `personaCount` pour ajuster le nombre de personas
- Ajustez les tranches d'âge selon votre cible
- Modifiez les compteurs de traits pour plus ou moins de détails

### 3. Validation
- Toujours valider les prompts avant utilisation en production
- Tester avec des briefs variés
- Vérifier la cohérence des réponses

### 4. Maintenance
- Versionnez vos prompts (v1, v2, etc.)
- Documentez les changements
- Testez les nouveaux prompts avant déploiement

## Ajout de nouveaux prompts

Pour ajouter un nouveau prompt :

1. Définir le template dans `gemini-prompts.ts`
2. L'ajouter aux exports `PROMPTS`
3. Mettre à jour le type `PromptType`
4. Tester avec le script de test
5. Documenter son usage

Exemple :
```typescript
export const PERSONA_GENERATION_CREATIVE: PromptTemplate = {
  id: 'persona-generation-creative-v1',
  name: 'Génération Créative',
  description: 'Pour des secteurs créatifs et artistiques',
  version: '1.0',
  language: 'fr',
  expectedPersonaCount: 2,
  template: `...`
};

export const PROMPTS = {
  DEFAULT: PERSONA_GENERATION_PROMPT,
  SIMPLE: PERSONA_GENERATION_SIMPLE,
  B2B: PERSONA_GENERATION_B2B,
  CREATIVE: PERSONA_GENERATION_CREATIVE  // Nouveau prompt
} as const;
```