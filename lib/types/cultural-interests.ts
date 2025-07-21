// Types for cultural interests and data visualization

export interface CulturalInterest {
  id: string;
  name: string;
  category: InterestCategory;
  score: number; // 0-100
  description?: string;
  tags?: string[];
  source?: 'qloo' | 'gemini' | 'user';
  confidence?: number; // 0-1
}

export interface InterestCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
}

export interface CulturalDataPoint {
  id: string;
  type: 'music' | 'movies' | 'books' | 'brands' | 'food' | 'lifestyle';
  name: string;
  category: string;
  score: number;
  metadata?: {
    genre?: string;
    year?: number;
    popularity?: number;
    region?: string;
    [key: string]: any;
  };
}

export interface InterestCloudConfig {
  maxItems?: number;
  minScore?: number;
  showCategories?: boolean;
  interactive?: boolean;
  colorScheme?: 'default' | 'category' | 'score';
}

export interface CulturalDataGridConfig {
  groupBy?: 'category' | 'type' | 'score';
  sortBy?: 'name' | 'score' | 'category';
  showMetadata?: boolean;
  compactView?: boolean;
}

export interface InterestFilterState {
  categories: string[];
  scoreRange: [number, number];
  searchQuery: string;
  sortBy: 'name' | 'score' | 'category';
  sortOrder: 'asc' | 'desc';
}

// Default categories for interests
export const DEFAULT_INTEREST_CATEGORIES: InterestCategory[] = [
  {
    id: 'music',
    name: 'Musique',
    icon: 'Music',
    color: 'purple',
    description: 'Genres musicaux et artistes préférés'
  },
  {
    id: 'movies',
    name: 'Cinéma',
    icon: 'Film',
    color: 'blue',
    description: 'Films et séries appréciés'
  },
  {
    id: 'books',
    name: 'Lecture',
    icon: 'Book',
    color: 'amber',
    description: 'Livres et genres littéraires'
  },
  {
    id: 'games',
    name: 'Jeux',
    icon: 'Gamepad',
    color: 'green',
    description: 'Jeux vidéo et de société'
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: 'ShoppingBag',
    color: 'pink',
    description: 'Marques et habitudes d\'achat'
  },
  {
    id: 'food',
    name: 'Gastronomie',
    icon: 'Utensils',
    color: 'orange',
    description: 'Cuisine et préférences alimentaires'
  },
  {
    id: 'travel',
    name: 'Voyage',
    icon: 'Plane',
    color: 'sky',
    description: 'Destinations et styles de voyage'
  },
  {
    id: 'hobbies',
    name: 'Loisirs',
    icon: 'Heart',
    color: 'red',
    description: 'Activités et passions personnelles'
  },
  {
    id: 'sports',
    name: 'Sport',
    icon: 'Activity',
    color: 'indigo',
    description: 'Sports pratiqués et suivis'
  }
];