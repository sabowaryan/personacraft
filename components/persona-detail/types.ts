import { Persona } from '@/lib/types/persona';

/**
 * Interface pour les données d'affichage enrichies du persona
 */
export interface PersonaDisplayData extends Persona {
  // Métriques calculées
  completionScore: number;
  engagementLevel: 'low' | 'medium' | 'high';
  
  // Données enrichies pour l'affichage
  displayMetrics: {
    totalInterests: number;
    primaryValues: string[];
    topChannels: string[];
    keyInsights: string[];
  };
  
  // Configuration d'affichage
  displayConfig: {
    theme: 'light' | 'dark' | 'auto';
    layout: 'compact' | 'detailed';
    animations: boolean;
  };
}

/**
 * Interface pour la configuration du thème visuel
 */
export interface PersonaTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundGradient: string;
  cardStyle: 'elevated' | 'flat' | 'outlined';
}

/**
 * Interface pour les props du composant HeroSection
 */
export interface HeroSectionProps {
  persona: Persona;
  onBack: () => void;
  onExport: () => void;
  onShare: () => void;
}

/**
 * Interface pour les props du composant QuickStats
 */
export interface QuickStatsProps {
  stats: {
    valuesCount: number;
    interestsCount: number;
    channelsCount: number;
    painPointsCount: number;
  };
  completionScore: number;
}

/**
 * Interface pour les props du composant InterestsGrid
 */
export interface InterestsGridProps {
  interests: Record<string, string[]>;
  displayMode: 'grid' | 'list' | 'cloud';
}

/**
 * Interface pour les props du composant CommunicationRadar
 */
export interface CommunicationRadarProps {
  channels: string[];
  preferences: number[];
  tone: string;
}

/**
 * Interface pour les props du composant MarketingInsightsPanel
 */
export interface MarketingInsightsProps {
  painPoints: string[];
  motivations: string[];
  buyingBehavior: string;
  influences: string[];
}

/**
 * Interface pour les états d'erreur
 */
export interface ErrorState {
  type: 'not_found' | 'loading_error' | 'network_error';
  message: string;
  recoveryActions: Array<{
    label: string;
    action: () => void;
  }>;
}