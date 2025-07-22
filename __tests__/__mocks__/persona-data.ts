/**
 * Mock data for persona integration tests
 */

export const mockPersonaData = {
  id: 'test-persona-123',
  name: 'Marie Dubois',
  age: 32,
  location: 'Paris, France',
  occupation: 'Marketing Manager',
  avatar: '/images/avatars/marie-dubois.jpg',
  tagline: 'Passionate about sustainable fashion and digital innovation',
  
  // Quality metrics
  metrics: {
    qualityScore: 87,
    completionScore: 92,
    engagementLevel: 'high' as const,
    dataRichness: 85,
    culturalAccuracy: 90,
    marketingRelevance: 88,
    completeness: 92,
    consistency: 85,
    realism: 89,
    performance: 87
  },
  
  // Profile data
  profile: {
    demographics: {
      age: 32,
      gender: 'Female',
      location: 'Paris, France',
      education: 'Master in Business Administration',
      income: '€65,000 - €80,000',
      familyStatus: 'Single',
      children: 0
    },
    psychographics: {
      personality: ['Creative', 'Analytical', 'Ambitious'],
      values: ['Sustainability', 'Innovation', 'Work-life balance'],
      lifestyle: 'Urban professional',
      attitudes: ['Tech-savvy', 'Environmentally conscious', 'Brand loyal']
    }
  },
  
  // Interests and cultural data
  interests: [
    { id: '1', name: 'Sustainable Fashion', category: 'Fashion', weight: 0.9 },
    { id: '2', name: 'Digital Marketing', category: 'Professional', weight: 0.8 },
    { id: '3', name: 'Yoga', category: 'Wellness', weight: 0.7 },
    { id: '4', name: 'French Cinema', category: 'Entertainment', weight: 0.6 },
    { id: '5', name: 'Organic Food', category: 'Food', weight: 0.8 }
  ],
  
  culturalData: {
    music: [
      { artist: 'Daft Punk', genre: 'Electronic', preference: 0.8 },
      { artist: 'Édith Piaf', genre: 'Chanson', preference: 0.6 },
      { artist: 'Christine and the Queens', genre: 'Pop', preference: 0.7 }
    ],
    movies: [
      { title: 'Amélie', genre: 'Romance', preference: 0.9 },
      { title: 'The Artist', genre: 'Drama', preference: 0.7 },
      { title: 'Blue Is the Warmest Color', genre: 'Drama', preference: 0.6 }
    ],
    brands: [
      { name: 'Patagonia', category: 'Fashion', preference: 0.9 },
      { name: 'Apple', category: 'Technology', preference: 0.8 },
      { name: 'Whole Foods', category: 'Food', preference: 0.7 }
    ]
  },
  
  // Communication preferences
  communication: {
    channels: [
      { channel: 'Email', preference: 0.8, frequency: 'Weekly' },
      { channel: 'Instagram', preference: 0.9, frequency: 'Daily' },
      { channel: 'LinkedIn', preference: 0.7, frequency: 'Weekly' },
      { channel: 'SMS', preference: 0.4, frequency: 'Rarely' }
    ],
    style: 'Professional yet friendly',
    tone: 'Informative and inspiring',
    timing: {
      bestDays: ['Tuesday', 'Wednesday', 'Thursday'],
      bestHours: ['9:00-11:00', '14:00-16:00']
    }
  },
  
  // Marketing insights
  marketing: {
    buyingBehavior: 'Research-driven',
    decisionFactors: ['Quality', 'Sustainability', 'Brand reputation'],
    pricesensitivity: 'Medium',
    loyaltyLevel: 'High',
    influenceFactors: ['Expert reviews', 'Peer recommendations', 'Brand values']
  },
  
  // Metadata
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:30:00Z',
  version: '1.0',
  source: 'PersonaCraft AI'
};

export const mockUserPreferences = {
  displayMode: 'grid' as const,
  defaultView: 'detailed' as const,
  theme: 'light' as const,
  autoSave: true,
  animations: true,
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium' as const
  },
  notifications: {
    showTooltips: true,
    animateTransitions: true,
    soundEffects: false
  },
  exportDefaults: {
    format: 'PDF' as const,
    includeMetrics: true,
    includeCharts: true
  }
};

export const mockPersonaList = [
  mockPersonaData,
  {
    ...mockPersonaData,
    id: 'test-persona-456',
    name: 'Jean Martin',
    age: 28,
    occupation: 'Software Developer',
    metrics: {
      ...mockPersonaData.metrics,
      qualityScore: 92,
      completionScore: 88
    }
  },
  {
    ...mockPersonaData,
    id: 'test-persona-789',
    name: 'Sophie Laurent',
    age: 35,
    occupation: 'UX Designer',
    metrics: {
      ...mockPersonaData.metrics,
      qualityScore: 85,
      completionScore: 90
    }
  }
];

export const mockEmptyPersona = {
  id: 'empty-persona',
  name: '',
  age: 0,
  location: '',
  occupation: '',
  avatar: '',
  tagline: '',
  metrics: {
    qualityScore: 0,
    completionScore: 0,
    engagementLevel: 'low' as const,
    dataRichness: 0,
    culturalAccuracy: 0,
    marketingRelevance: 0,
    completeness: 0,
    consistency: 0,
    realism: 0,
    performance: 0
  },
  profile: {
    demographics: {},
    psychographics: {}
  },
  interests: [],
  culturalData: {
    music: [],
    movies: [],
    brands: []
  },
  communication: {
    channels: [],
    style: '',
    tone: '',
    timing: {
      bestDays: [],
      bestHours: []
    }
  },
  marketing: {
    buyingBehavior: '',
    decisionFactors: [],
    pricesensitivity: '',
    loyaltyLevel: '',
    influenceFactors: []
  },
  createdAt: '',
  updatedAt: '',
  version: '',
  source: ''
};