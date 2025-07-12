# Documentation du Thème Tailwind CSS 4

## Vue d'ensemble

Ce projet a été migré vers Tailwind CSS 4 avec un thème moderne et complet incluant :

- **Palette de couleurs OKLCH** pour des couleurs plus vives et cohérentes
- **Typographie avancée** avec polices modernes et échelle harmonieuse
- **Mode sombre optimisé** avec transitions fluides
- **Animations et transitions** personnalisées
- **Utilitaires personnalisés** pour des effets avancés

## Nouvelles Fonctionnalités

### 🎨 Palette de Couleurs Moderne

#### Couleurs Principales
- **Primary** : Bleu moderne (50 à 950)
- **Secondary** : Violet élégant (50 à 950)
- **Accent** : Vert émeraude (50 à 950)
- **Danger** : Rouge vif (50 à 950)
- **Success** : Vert naturel (50 à 950)
- **Warning** : Ambre chaleureux (50 à 950)

#### Utilisation
```html
<!-- Couleurs primaires -->
<div class="bg-primary-500 text-white">Bouton principal</div>
<div class="bg-secondary-600 text-white">Bouton secondaire</div>

<!-- Couleurs sémantiques -->
<div class="bg-success-500 text-white">Succès</div>
<div class="bg-danger-500 text-white">Erreur</div>
<div class="bg-warning-500 text-white">Avertissement</div>
```

### 🔤 Typographie Avancée

#### Polices Disponibles
- **Sans-serif** : Inter, SF Pro Display (--font-sans)
- **Serif** : Crimson Text (--font-serif)
- **Monospace** : Fira Code, Monaco (--font-mono)
- **Display** : Cal Sans, SF Pro Display (--font-display)

#### Échelle Typographique
- **Tailles** : xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl, 8xl, 9xl
- **Poids** : thin, extralight, light, normal, medium, semibold, bold, extrabold, black
- **Espacement** : tighter, tight, normal, wide, wider, widest
- **Hauteur de ligne** : tight, snug, normal, relaxed, loose

#### Utilisation
```html
<h1 class="font-display text-4xl font-bold">Titre principal</h1>
<p class="font-sans text-base leading-relaxed">Texte de paragraphe</p>
<code class="font-mono text-sm">Code source</code>
```

### 🌙 Mode Sombre Optimisé

Le mode sombre utilise la fonction `light-dark()` pour des transitions automatiques et fluides.

#### Couleurs Sémantiques
- **Background** : Gris très sombre (--color-gray-950)
- **Foreground** : Gris très clair (--color-gray-50)
- **Muted** : Gris foncé (--color-gray-800)
- **Border** : Gris moyen foncé (--color-gray-800)

#### Utilisation
```html
<div class="bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark">
  Contenu avec mode sombre automatique
</div>
```

### ✨ Animations et Transitions

#### Animations Personnalisées
- **fade-in** : Apparition en fondu
- **slide-up** : Glissement vers le haut
- **slide-down** : Glissement vers le bas
- **scale-in** : Zoom d'apparition
- **pulse-subtle** : Pulsation subtile

#### Courbes d'Animation
- **ease-linear** : Linéaire
- **ease-in** : Accélération
- **ease-out** : Décélération
- **ease-in-out** : Accélération/décélération
- **ease-bounce** : Rebond

#### Utilisation
```html
<div class="animate-fade-in">Apparition en fondu</div>
<div class="animate-slide-up">Glissement vers le haut</div>
<div class="animate-scale-in">Zoom d'apparition</div>
```

### 🎯 Utilitaires Personnalisés

#### Effet Verre (Glass Morphism)
```html
<div class="glass">Effet verre clair</div>
<div class="glass-dark">Effet verre sombre</div>
```

#### Texte Dégradé
```html
<h1 class="text-gradient text-4xl font-bold">Titre avec dégradé</h1>
```

## Configuration du Thème

### Espacement Dynamique
L'espacement est basé sur une valeur de base de `0.25rem` (4px) :
```css
--spacing: 0.25rem;
```

### Points de Rupture
- **sm** : 640px
- **md** : 768px
- **lg** : 1024px
- **xl** : 1280px
- **2xl** : 1536px
- **3xl** : 1920px (nouveau)

### Rayons de Bordure
- **sm** : 0.125rem
- **md** : 0.375rem
- **lg** : 0.5rem
- **xl** : 0.75rem
- **2xl** : 1rem
- **3xl** : 1.5rem
- **full** : 9999px

### Ombres Modernes
- **xs** : Ombre très légère
- **sm** : Ombre légère
- **md** : Ombre moyenne
- **lg** : Ombre forte
- **xl** : Ombre très forte
- **2xl** : Ombre dramatique
- **inner** : Ombre intérieure

## Amélioration de l'Accessibilité

### Réduction du Mouvement
Respect automatique de la préférence `prefers-reduced-motion`.

### Focus Visible
Contours personnalisés pour la navigation au clavier.

### Contraste Amélioré
Couleurs optimisées pour un contraste suffisant en mode clair et sombre.

## Variables CSS Disponibles

Toutes les variables de thème sont disponibles comme variables CSS :

```css
/* Couleurs */
var(--color-primary-500)
var(--color-secondary-600)
var(--color-accent-400)

/* Typographie */
var(--font-sans)
var(--text-lg)
var(--font-weight-semibold)

/* Espacement */
var(--spacing)
var(--radius-lg)
var(--shadow-md)
```

## Migration depuis Tailwind CSS 3

### Changements Principaux
1. **@import "tailwindcss"** remplace les directives `@tailwind`
2. **@theme** remplace la configuration JavaScript
3. **Couleurs OKLCH** pour une meilleure qualité
4. **Variables CSS** générées automatiquement
5. **Mode sombre** avec `light-dark()`

### Classes Supprimées
- Les anciennes classes d'opacité (remplacées par les modificateurs `/50`, `/75`, etc.)
- Certaines classes de configuration spécifiques

### Nouvelles Classes
- Toutes les couleurs du thème personnalisé
- Nouvelles animations
- Utilitaires personnalisés (glass, text-gradient)

## Exemples d'Utilisation

### Carte avec Mode Sombre
```html
<div class="bg-card text-card-foreground p-6 rounded-lg shadow-md border">
  <h2 class="text-2xl font-semibold mb-4">Titre de la carte</h2>
  <p class="text-muted-foreground">Description de la carte</p>
</div>
```

### Bouton avec Effet Verre
```html
<button class="glass px-6 py-3 rounded-lg font-medium hover:scale-105 transition-transform">
  Bouton Glassmorphism
</button>
```

### Titre avec Dégradé
```html
<h1 class="text-gradient text-6xl font-bold font-display">
  Titre Spectaculaire
</h1>
```

## Support des Navigateurs

Ce thème utilise des fonctionnalités CSS modernes :
- `oklch()` pour les couleurs
- `light-dark()` pour le mode sombre
- `color-mix()` pour les mélanges de couleurs
- Cascade layers pour l'organisation

Support recommandé : Chrome 111+, Firefox 113+, Safari 16.4+