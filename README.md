# PersonaCraft

PersonaCraft est une application Next.js permettant de générer, visualiser et exporter des personas marketing de manière interactive et moderne.

## Fonctionnalités principales

- Génération automatique de personas via IA (Google Generative AI)
- Visualisation des personas sous forme de cartes et graphiques
- Export des personas en PDF et CSV
- Interface utilisateur moderne basée sur Radix UI et Tailwind CSS
- Formulaires dynamiques avec validation (React Hook Form + Zod)
- Thèmes clairs/sombres

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

## Installation

```bash
git clone <repo>
cd personacraft
npm install
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