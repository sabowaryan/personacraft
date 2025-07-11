export interface Persona {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  values: string[];
  interests: PersonaInterests;
  communication: CommunicationProfile;
  marketing: MarketingProfile;
  quote: string;
  generatedAt: Date;
  sources: string[];
  avatar?: string;
}

export interface PersonaInterests {
  music: string[];
  brands: string[];
  movies: string[];
  food: string[];
  books: string[];
  lifestyle: string[];
}

export interface CommunicationProfile {
  preferredChannels: string[];
  tone: string;
  contentTypes: string[];
  frequency: string;
}

export interface MarketingProfile {
  painPoints: string[];
  motivations: string[];
  buyingBehavior: string;
  influences: string[];
}

export interface BriefFormData {
  description: string;
  ageRange: string;
  location: string;
  interests: string[];
  values: string[];
  generateMultiple: boolean;
}

export interface GenerationParameters {
  temperature: number;
  maxTokens: number;
  format: 'json' | 'text';
}