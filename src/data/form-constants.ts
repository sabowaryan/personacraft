// Extracted constants to reduce bundle size
export const PREDEFINED_INTERESTS = [
    'Sport et fitness',
    'Technologie',
    'Voyage',
    'Cuisine',
    'Mode',
    'Musique',
    'Lecture',
    'Cinéma',
    'Art',
    'Nature',
    'Gaming',
    'Photographie',
    'Entrepreneuriat',
    'Développement personnel',
    'Famille',
    'Santé et bien-être'
] as const;

export const PREDEFINED_VALUES = [
    'Authenticité',
    'Innovation',
    'Durabilité',
    'Qualité',
    'Efficacité',
    'Créativité',
    'Collaboration',
    'Respect',
    'Transparence',
    'Excellence',
    'Simplicité',
    'Sécurité',
    'Liberté',
    'Équilibre vie-travail',
    'Responsabilité sociale',
    'Tradition'
] as const;

// Filter and sort options for personas page
export const FILTER_OPTIONS = [
  { value: 'all', label: 'Tous les scores' },
  { value: 'high', label: 'Score élevé (90+)' },
  { value: 'medium', label: 'Score moyen (75-89)' },
  { value: 'low', label: 'Score faible (<75)' }
] as const;

export const SORT_OPTIONS = [
  { value: 'score', label: 'Trier par score' },
  { value: 'name', label: 'Trier par nom' },
  { value: 'age', label: 'Trier par âge' }
] as const;

// Default export configuration
export const DEFAULT_EXPORT_CONFIG = {
  includeMetadata: true,
  includeAnalytics: false
} as const;