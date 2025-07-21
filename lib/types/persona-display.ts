/**
 * TypeScript interfaces and types for the redesigned persona display system
 * Supporting modern UI components, metrics, and user preferences
 */

import type { PersonaValidationMetrics } from './persona-metrics';

// Core persona display configuration
export interface PersonaDisplayConfig {
  theme: 'light' | 'dark' | 'auto';
  layout: 'compact' | 'detailed';
  animations: boolean;
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
}

// Enhanced persona model for display
export interface EnhancedPersona {
  id: string;
  name: string;
  avatar?: string;
  tagline?: string;
  basicInfo: PersonaBasicInfo;
  demographics: PersonaDemographics;
  interests: CulturalInterest[];
  communication: CommunicationPreferences;
  marketing: MarketingInsights;
  metrics: PersonaValidationMetrics;
  metadata: PersonaMetadata;
}

// Basic persona information for hero section
export interface PersonaBasicInfo {
  age: number;
  location: string;
  occupation: string;
  income?: string;
  education?: string;
  familyStatus?: string;
}

// Demographic data structure
export interface PersonaDemographics {
  ageRange: string;
  gender: string;
  location: {
    country: string;
    region?: string;
    city?: string;
  };
  socioeconomic: {
    income: string;
    education: string;
    occupation: string;
  };
  lifestyle: {
    familyStatus: string;
    livingArrangement: string;
    pets?: string[];
  };
}

// Cultural interests with categorization
export interface CulturalInterest {
  id: string;
  name: string;
  category: InterestCategory;
  intensity: 'low' | 'medium' | 'high';
  subcategory?: string;
  description?: string;
  culturalContext?: string;
}

export type InterestCategory = 
  | 'music' 
  | 'movies' 
  | 'books' 
  | 'sports' 
  | 'food' 
  | 'travel' 
  | 'technology' 
  | 'fashion' 
  | 'art' 
  | 'lifestyle';

// Communication preferences and channels
export interface CommunicationPreferences {
  preferredChannels: CommunicationChannel[];
  frequency: CommunicationFrequency;
  style: CommunicationStyle;
  timing: CommunicationTiming;
  contentTypes: ContentTypePreference[];
}

export interface CommunicationChannel {
  type: 'email' | 'sms' | 'social' | 'phone' | 'push' | 'direct_mail';
  platform?: string;
  preference: number; // 1-10 scale
  usage: 'primary' | 'secondary' | 'occasional' | 'never';
}

export interface CommunicationFrequency {
  daily: boolean;
  weekly: boolean;
  monthly: boolean;
  seasonal: boolean;
  eventBased: boolean;
}

export interface CommunicationStyle {
  tone: 'formal' | 'casual' | 'friendly' | 'professional';
  length: 'brief' | 'moderate' | 'detailed';
  personalization: 'high' | 'medium' | 'low';
}

export interface CommunicationTiming {
  preferredDays: string[];
  preferredHours: string[];
  timezone: string;
  avoidTimes?: string[];
}

export interface ContentTypePreference {
  type: 'text' | 'image' | 'video' | 'audio' | 'interactive';
  preference: number; // 1-10 scale
}

// Marketing insights and recommendations
export interface MarketingInsights {
  segments: MarketingSegment[];
  recommendations: MarketingRecommendation[];
  touchpoints: TouchpointStrategy[];
  messaging: MessagingStrategy;
  conversion: ConversionInsights;
}

export interface MarketingSegment {
  name: string;
  fit: number; // 1-10 scale
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
}

export interface MarketingRecommendation {
  category: 'channel' | 'content' | 'timing' | 'messaging' | 'product';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
}

export interface TouchpointStrategy {
  channel: string;
  phase: 'awareness' | 'consideration' | 'decision' | 'retention';
  tactics: string[];
  priority: number;
}

export interface MessagingStrategy {
  primaryMessage: string;
  secondaryMessages: string[];
  tone: string;
  keywords: string[];
  avoidTerms: string[];
}

export interface ConversionInsights {
  likelyTriggers: string[];
  barriers: string[];
  motivations: string[];
  decisionFactors: string[];
}

// Persona metadata
export interface PersonaMetadata {
  createdAt: string;
  updatedAt: string;
  version: string;
  source: 'generated' | 'imported' | 'manual';
  tags: string[];
  status: 'draft' | 'active' | 'archived';
}

// User preferences for persona display
export interface UserPreferences {
  displayMode: 'grid' | 'list' | 'cards';
  defaultView: 'overview' | 'detailed';
  autoSave: boolean;
  notifications: NotificationSettings;
  exportDefaults: ExportSettings;
  accessibility: AccessibilitySettings;
}

export interface NotificationSettings {
  showTooltips: boolean;
  animateTransitions: boolean;
  soundEffects: boolean;
  showSuccessMessages: boolean;
}

export interface ExportSettings {
  defaultFormat: 'pdf' | 'csv' | 'json';
  includeMetrics: boolean;
  includeCharts: boolean;
  paperSize: 'a4' | 'letter' | 'a3';
  orientation: 'portrait' | 'landscape';
}

export interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  screenReader: boolean;
  keyboardNavigation: boolean;
}

// Component-specific interfaces
export interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType;
  badge?: string | number;
  disabled?: boolean;
  content?: React.ComponentType;
}

export interface ActionButton {
  id: string;
  label: string;
  icon?: React.ComponentType;
  variant: 'primary' | 'secondary' | 'ghost' | 'destructive';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

// Layout and navigation types
export interface LayoutState {
  activeTab: string;
  sidebarOpen: boolean;
  preferences: UserPreferences;
  loading: boolean;
  error?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ComponentType;
  active?: boolean;
  children?: NavigationItem[];
}

// Animation and interaction types
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  stagger?: number;
}

export interface InteractionState {
  isHovered: boolean;
  isFocused: boolean;
  isPressed: boolean;
  isLoading: boolean;
}

// Error handling types
export interface ErrorState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  fallbackComponent?: React.ComponentType;
}

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  retry?: () => void;
}

// Export and sharing types
export interface ExportOptions {
  format: 'pdf' | 'csv' | 'json' | 'png';
  sections: string[];
  includeMetrics: boolean;
  includeCharts: boolean;
  customization?: ExportCustomization;
}

export interface ExportCustomization {
  logo?: string;
  branding?: boolean;
  colors?: string[];
  fonts?: string[];
}

export interface ShareOptions {
  type: 'link' | 'email' | 'social';
  permissions: 'view' | 'edit' | 'admin';
  expiration?: string;
  password?: boolean;
}