# PersonaCraft 🧠🎨

**PersonaCraft** is an AI-powered tool that transforms a simple audience brief into a realistic, culture-rich marketing persona — using **Gemini** (LLM) + **Qloo Taste AI™**.

## 🌍 Project Description

PersonaCraft helps marketers, product teams and creators quickly generate insightful personas without using personal data. It combines real cultural preferences from Qloo’s API with AI-generated narrative content to output complete, actionable profiles.

## 🚀 Features

- 🔍 Audience-based persona generation (age, location, interests, values)
- 🤖 Gemini LLM integration to generate narrative, tone, channels, quote
- 🌐 Qloo API to enrich with music, brands, food, books, films, etc.
- 📄 Export persona as PDF, JSON or CSV
- 🔒 Privacy-first: no personal data required

## 💡 Use Cases

- Marketing strategy & targeting
- UX design & user research
- Content personalization
- Client brief presentations

## 🧪 Example Output

```json
{
  "name": "Lina Messaoud",
  "age": 22,
  "location": "Paris",
  "bio": "Militant écolo passionnée de mode alternative, techno et photo argentique...",
  "values": ["écologie", "authenticité", "expression libre"],
  "channels": ["Instagram", "TikTok", "newsletters curatoriales"],
  "tone": "visuel, brut, narratif",
  "preferences": {
    "music": ["Bicep", "Flavien Berger"],
    "brands": ["Veja", "MaisonCléo"],
    "food": ["brunch bio", "cuisine levantine"]
  }
}

```

## Stack technique

- **Framework** : Next.js 13, React 18, TypeScript
- **UI** : Radix UI, Tailwind CSS, Lucide React, Embla Carousel, Recharts
- **Formulaires** : React Hook Form, Zod
- **Exports** : jsPDF, PapaParse
- **Autres** : Google Generative AI, next-themes

## Structure du projet

- `app/` : Pages, routes API, gestion des personas, analytics
- `components/` : Composants UI réutilisables
- `hooks/` : Hooks personnalisés
- `lib/` : Logique métier, types, utilitaires
- `public/` : (à créer si besoin pour les assets statiques)
- Fichiers de configuration : `next.config.js`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`

## 🔧 Corrections récentes

### ✅ Erreurs API corrigées
- **Gemini API** : Migration de `gemini-pro` vers `gemini-1.5-flash` (modèle déprécié)
- **Qloo API** : Amélioration de la gestion d'erreurs 401/403 avec fallback automatique
- **Configuration** : Ajout de guides et fichiers d'exemple pour la configuration

### 📋 Configuration requise

1. **API Google Gemini (OBLIGATOIRE)**
   ```bash
   GEMINI_API_KEY=votre_clé_api_gemini
   ```
   Obtenez votre clé sur [Google AI Studio](https://makersuite.google.com/app/apikey)

2. **API Qloo (OPTIONNEL)**
   ```bash
   QLOO_API_KEY=votre_clé_api_qloo
   ```
   L'app fonctionne en mode simulation sans cette clé

Consultez [docs/api-configuration.md](docs/api-configuration.md) pour plus de détails.

## Installation

```bash
git clone <repo>
cd personacraft
npm install

# Configuration des APIs
cp .env.example .env.local
# Éditez .env.local avec vos clés API
```

## Développement

```bash
npm run dev
```

## Build production

```bash
npm run build
npm start
```

## Lint

```bash
npm run lint
```

## Export statique

L'application est configurée pour l'export statique (`output: 'export'` dans `next.config.js`).

## Contribution

1. Forkez le repo
2. Créez une branche (`git checkout -b feature/ma-feature`)
3. Commitez vos modifications (`git commit -am 'Ajout d'une feature'`)
4. Poussez la branche (`git push origin feature/ma-feature`)
5. Ouvrez une Pull Request

## Licence

MIT

---

Pour plus de détails, consultez le code source et les commentaires dans chaque dossier.
