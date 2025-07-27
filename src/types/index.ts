// Types principaux pour l'application PersonaCraft

export interface Demographics {
  income: string
  education: string
  familyStatus: string
}

export interface Psychographics {
  personality: string[]
  values: string[]
  interests: string[]
  lifestyle: string
}

export interface CulturalData {
  music: string[]
  movies: string[]
  tv: string[]
  books: string[]
  brands: string[]
  restaurants: string[]
  travel: string[]
  fashion: string[]
  beauty: string[]
  food: string[]
  socialMedia: string[]
  podcasts?: string[]
  videoGames?: string[]
  influencers?: string[]
}

export interface MarketingInsights {
  preferredChannels: string[]
  messagingTone: string
  buyingBehavior: string
}

export interface SocialMediaInsights {
  audienceMatches: Array<{
    name: string
    relevanceFactors: string[]
    estimatedFollowingOverlap: number
  }>
  brandInfluence: Array<{
    brand: string
    category: string
    platforms: string[]
    relevanceScore: number
  }>
  contentPreferences: string[]
  demographicAlignment: Array<{
    ageGroup: string
    primaryPlatforms: string[]
    engagementStyle: string
  }>
}

export interface Persona {
  id: string
  name: string
  age: number
  occupation: string
  location: string
  bio: string
  quote: string
  demographics: Demographics
  psychographics: Psychographics
  culturalData: CulturalData
  painPoints: string[]
  goals: string[]
  marketingInsights: MarketingInsights
  qualityScore: number
  createdAt: string
  brief?: string
  socialMediaInsights?: {
    insights: SocialMediaInsights
    platforms: string[]
  }
}

export interface SessionData {
  id: string
  createdAt: string
  lastUpdated?: string
  totalPersonas: number
  totalGenerations: number
  preferences: SessionPreferences
}

export interface SessionPreferences {
  theme: 'light' | 'dark'
  language: 'fr' | 'en'
  autoSave: boolean
}

export interface GenerationRequest {
  brief: string
  numberOfPersonas?: number
  targetAudience?: string
  industry?: string
  preferences?: GenerationPreferences
}

export interface GenerationPreferences {
  includeQlooData: boolean
  detailLevel: 'basic' | 'detailed' | 'comprehensive'
  culturalFocus: string[]
}

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface QlooInsight {
  category: string
  items: string[]
  confidence: number
}

export interface GeminiResponse {
  personas: Partial<Persona>[]
  metadata: {
    processingTime: number
    confidence: number
    suggestions: string[]
  }
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf'
  includeMetadata: boolean
  includeAnalytics: boolean
}

export interface AnalyticsData {
  totalGenerations: number
  averageQualityScore: number
  mostCommonIndustries: string[]
  generationTrends: {
    date: string
    count: number
  }[]
}

// Types pour les composants UI
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export interface CardProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

// Types pour les erreurs
export interface AppError {
  code: string
  message: string
  details?: any
}

export interface ValidationError {
  field: string
  message: string
}

// Types pour les filtres et tri
export interface PersonaFilters {
  ageRange?: [number, number]
  occupation?: string[]
  location?: string[]
  qualityScore?: [number, number]
  dateRange?: [string, string]
}

export interface SortOptions {
  field: keyof Persona
  direction: 'asc' | 'desc'
}

// Types pour l'état de l'application
export interface AppState {
  session: SessionData | null
  personas: Persona[]
  isGenerating: boolean
  filters: PersonaFilters
  sortOptions: SortOptions
  selectedPersona: Persona | null
}

// Types pour les actions Redux (si utilisé)
export interface Action<T = any> {
  type: string
  payload?: T
}

export interface PersonaAction extends Action {
  type: 'ADD_PERSONA' | 'UPDATE_PERSONA' | 'DELETE_PERSONA' | 'SET_PERSONAS'
  payload: Persona | Persona[] | string
}

export interface SessionAction extends Action {
  type: 'CREATE_SESSION' | 'UPDATE_SESSION' | 'CLEAR_SESSION'
  payload?: SessionData | Partial<SessionData>
}

