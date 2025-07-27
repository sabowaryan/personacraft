# PersonaCraft - Génération de Personas Marketing IA

Une application Next.js moderne pour générer des personas marketing authentiques en utilisant Google Gemini et Qloo Taste AI™.

## 🚀 Fonctionnalités

- **Génération IA Hybride** : Combinaison de Google Gemini et Qloo Taste AI™
- **Interface Moderne** : Design responsive avec TailwindCSS
- **Persistance Locale** : Sauvegarde automatique avec localStorage et sessions
- **Exports Multiples** : PDF, CSV, JSON
- **Analytics Intégrées** : Scores de qualité et statistiques de session
- **Dashboard Interactif** : Interface utilisateur intuitive

## 🛠️ Technologies Utilisées

- **Next.js 14** - Framework React avec App Router
- **TailwindCSS 3.4** - Framework CSS utilitaire
- **TypeScript** - Typage statique
- **React 18** - Bibliothèque UI
- **Google Gemini API** - Génération de contenu IA
- **Qloo Taste AI™** - Intelligence culturelle

## 📦 Installation

1. **Cloner le repository**
```bash
git clone https://github.com/sabowaryan/personacraft.git
cd personacraft
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
Créer un fichier `.env.local` :
```env
GEMINI_API_KEY=votre_clé_gemini
QLOO_API_KEY=votre_clé_qloo
QLOO_API_URL=https://hackathon.api.qloo.com
```

4. **Démarrer le serveur de développement**
```bash
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

## 🎯 Utilisation

1. **Page d'Accueil** : Présentation des fonctionnalités
2. **Dashboard** : Interface de génération de personas
3. **Génération** : Saisir un brief marketing et générer des personas
4. **Gestion** : Visualiser, exporter et gérer les personas créés
5. **Persistance** : Les données sont automatiquement sauvegardées

## 📁 Structure du Projet

```
personacraft-nextjs/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Page dashboard
│   │   ├── globals.css           # Styles globaux
│   │   ├── layout.tsx            # Layout principal
│   │   └── page.tsx              # Page d'accueil
│   ├── components/               # Composants réutilisables
│   ├── lib/
│   │   └── session.ts            # Gestion des sessions
│   ├── types/
│   │   └── index.ts              # Types TypeScript
│   └── utils/                    # Utilitaires
├── public/                       # Fichiers statiques
├── .env.local                    # Variables d'environnement
├── next.config.js                # Configuration Next.js
├── tailwind.config.js            # Configuration TailwindCSS
├── tsconfig.json                 # Configuration TypeScript
└── package.json                  # Dépendances
```

## 🔧 Scripts Disponibles

- `npm run dev` - Démarrer en mode développement
- `npm run build` - Construire pour la production
- `npm run start` - Démarrer en mode production
- `npm run lint` - Vérifier le code avec ESLint

## 🎨 Fonctionnalités Détaillées

### Génération de Personas
- Interface de saisie de brief marketing
- Génération automatique de 2 personas par défaut
- Données démographiques, psychographiques et culturelles
- Scores de qualité automatiques

### Persistance des Données
- Sauvegarde automatique dans localStorage
- Gestion des sessions utilisateur
- Historique des briefs marketing
- Statistiques de session

### Exports
- **JSON** : Format structuré pour intégrations
- **CSV** : Compatible avec Excel et outils analytics
- **PDF** : Présentation professionnelle (à implémenter)

### Interface Utilisateur
- Design moderne et responsive
- Animations fluides avec TailwindCSS
- Navigation intuitive
- Feedback visuel en temps réel

## 🔑 APIs Utilisées

### Google Gemini
- Génération de contenu textuel
- Analyse de briefs marketing
- Création de personas détaillés

### Qloo Taste AI™
- Données culturelles authentiques
- Préférences musicales et cinématographiques
- Marques et tendances lifestyle

## 🚀 Déploiement

L'application peut être déployée sur :
- **Vercel** (recommandé pour Next.js)
- **Netlify**
- **AWS Amplify**
- **Heroku**

### Déploiement Vercel
```bash
npm install -g vercel
vercel
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Équipe

- **PersonaCraft Team** - Développement initial

## 🙏 Remerciements

- Google Gemini pour l'IA générative
- Qloo pour l'intelligence culturelle
- Next.js et TailwindCSS pour les outils de développement

---

**PersonaCraft** - Révolutionnez votre marketing avec l'IA ! 🚀

