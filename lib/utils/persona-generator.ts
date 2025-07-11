import { Persona, BriefFormData } from '../types/persona';

const sampleNames = [
  'Emma Laurent', 'Lucas Martin', 'Sophia Chen', 'Antoine Dubois', 'Maya Patel',
  'Thomas Rodriguez', 'Léa Müller', 'Noah Johnson', 'Camille Lefebvre', 'Aiden Kim'
];

const sampleLocations = [
  'Paris, France', 'Lyon, France', 'Marseille, France', 'Toronto, Canada', 
  'Londres, UK', 'Berlin, Allemagne', 'Barcelona, Espagne', 'Amsterdam, Pays-Bas'
];

const sampleQuotes = [
  "La vie est trop courte pour ne pas suivre ses passions.",
  "Je crois au pouvoir de la communauté et du partage.",
  "L'innovation naît de la curiosité et de l'audace.",
  "Chaque jour est une opportunité d'apprendre quelque chose de nouveau.",
  "L'authenticité est la clé de relations durables.",
  "Je valorise l'équilibre entre travail et vie personnelle.",
  "Le changement est la seule constante dans la vie.",
  "La créativité s'épanouit dans la diversité."
];

const musicGenres = ['Pop', 'Rock', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical', 'Indie', 'Folk'];
const brands = ['Apple', 'Nike', 'Spotify', 'Netflix', 'Tesla', 'Patagonia', 'Airbnb', 'Whole Foods'];
const movies = ['Inception', 'The Grand Budapest Hotel', 'Parasite', 'La La Land', 'Dune', 'Her', 'Moonlight'];
const foods = ['Sushi', 'Pizza', 'Tacos', 'Pasta', 'Salades', 'Smoothies', 'Café artisanal', 'Cuisine bio'];
const books = ['Atomic Habits', 'Sapiens', 'Becoming', 'The Design of Everyday Things', 'Educated'];
const lifestyle = ['Yoga', 'Randonnée', 'Photographie', 'Voyages', 'Cuisine', 'Jardinage', 'Fitness'];

function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateAge(ageRange: string): number {
  const [min, max] = ageRange.split('-').map(Number);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateBio(interests: string[], values: string[]): string {
  const templates = [
    `Passionné(e) par ${interests[0]} et ${interests[1]}, je valorise ${values[0]} dans tous les aspects de ma vie. J'aime découvrir de nouvelles expériences et partager mes découvertes avec ma communauté.`,
    `Professional créatif avec un fort intérêt pour ${interests[0]}. ${values[0]} et ${values[1]} guident mes choix quotidiens. Je crois en l'importance de l'équilibre et de l'authenticité.`,
    `Entrepreneur dans l'âme, je m'intéresse à ${interests[0]} et ${interests[1]}. ${values[0]} est au cœur de ma philosophie de vie. J'aime explorer de nouvelles tendances et technologies.`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

export function generatePersona(brief: BriefFormData): Persona {
  const age = generateAge(brief.ageRange);
  const name = sampleNames[Math.floor(Math.random() * sampleNames.length)];
  const location = brief.location || sampleLocations[Math.floor(Math.random() * sampleLocations.length)];
  
  const interests = {
    music: getRandomItems(musicGenres, 3),
    brands: getRandomItems(brands, 4),
    movies: getRandomItems(movies, 3),
    food: getRandomItems(foods, 4),
    books: getRandomItems(books, 3),
    lifestyle: getRandomItems(lifestyle, 5)
  };

  const communication = {
    preferredChannels: getRandomItems(['Instagram', 'TikTok', 'LinkedIn', 'YouTube', 'Podcasts', 'Email'], 3),
    tone: ['Décontracté', 'Professionnel', 'Inspirant', 'Authentique'][Math.floor(Math.random() * 4)],
    contentTypes: getRandomItems(['Vidéos', 'Articles', 'Infographies', 'Stories', 'Podcasts'], 3),
    frequency: ['Quotidien', 'Hebdomadaire', 'Bi-hebdomadaire'][Math.floor(Math.random() * 3)]
  };

  const marketing = {
    painPoints: [
      'Manque de temps pour explorer de nouvelles options',
      'Difficultés à trouver des produits authentiques',
      'Besoin de recommandations personnalisées',
      'Recherche de valeur et de qualité'
    ],
    motivations: [
      'Améliorer sa qualité de vie',
      'Découvrir de nouvelles expériences',
      'Soutenir des marques éthiques',
      'Gagner du temps au quotidien'
    ],
    buyingBehavior: 'Recherche approfondie avant achat, influence des avis et recommandations',
    influences: getRandomItems(['Amis', 'Famille', 'Influenceurs', 'Experts', 'Avis en ligne'], 3)
  };

  return {
    id: crypto.randomUUID(),
    name,
    age,
    location,
    bio: generateBio(brief.interests, brief.values),
    values: brief.values,
    interests,
    communication,
    marketing,
    quote: sampleQuotes[Math.floor(Math.random() * sampleQuotes.length)],
    generatedAt: new Date(),
    sources: ['Qloo Taste AI', 'Google Gemini', 'Analyse comportementale'],
    avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=150&h=150&fit=crop&crop=face`
  };
}

export function generateMultiplePersonas(brief: BriefFormData, count: number = 3): Persona[] {
  return Array.from({ length: count }, () => generatePersona(brief));
}