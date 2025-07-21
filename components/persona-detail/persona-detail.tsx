'use client';

import { useState } from 'react';
import { Persona } from '@/lib/types/persona';
import { HeroSection } from './hero-section';
import { QuickStats } from './quick-stats';
import { TabbedContent } from './tabbed-content';
import { PersonaDisplayData } from './types';

interface PersonaDetailProps {
  persona: Persona;
  onBack: () => void;
}

/**
 * Composant principal pour l'affichage détaillé d'un persona
 * Design moderne et responsive avec une hiérarchie visuelle claire
 */
export function PersonaDetail({ persona, onBack }: PersonaDetailProps) {
  const [activeTab, setActiveTab] = useState('profile');
  
  // Calculer les métriques pour QuickStats
  const stats = {
    valuesCount: persona.values.length,
    interestsCount: Object.values(persona.interests).flat().length,
    channelsCount: persona.communication.preferredChannels.length,
    painPointsCount: persona.marketing.painPoints.length
  };
  
  // Calculer un score de complétion basé sur les données disponibles
  const completionScore = calculateCompletionScore(persona);
  
  // Fonctions pour les actions principales
  const handleExport = () => {
    // Logique d'export à implémenter
    console.log('Exporting persona:', persona.id);
  };
  
  const handleShare = () => {
    // Logique de partage à implémenter
    console.log('Sharing persona:', persona.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full pt-20 sm:pt-24 lg:pt-28 pb-12">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8">
          {/* Hero Section avec avatar et informations clés */}
          <HeroSection 
            persona={persona} 
            onBack={onBack} 
            onExport={handleExport} 
            onShare={handleShare} 
          />
          
          {/* Quick Stats Dashboard avec métriques visuelles */}
          <QuickStats 
            stats={stats} 
            completionScore={completionScore} 
          />
          
          {/* Interface à onglets améliorée */}
          <TabbedContent 
            persona={persona} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Calcule un score de complétion basé sur les données du persona
 */
function calculateCompletionScore(persona: Persona): number {
  let score = 0;
  let total = 0;
  
  // Vérifier les champs de base
  if (persona.name) { score += 1; }
  if (persona.age) { score += 1; }
  if (persona.location) { score += 1; }
  if (persona.bio && persona.bio.length > 50) { score += 2; }
  if (persona.quote) { score += 1; }
  if (persona.avatar) { score += 1; }
  total += 7;
  
  // Vérifier les valeurs
  if (persona.values.length > 0) {
    score += Math.min(persona.values.length, 5);
  }
  total += 5;
  
  // Vérifier les intérêts
  const interestsCount = Object.values(persona.interests).flat().length;
  if (interestsCount > 0) {
    score += Math.min(Math.floor(interestsCount / 3), 5);
  }
  total += 5;
  
  // Vérifier la communication
  if (persona.communication.preferredChannels.length > 0) { score += 2; }
  if (persona.communication.tone) { score += 1; }
  if (persona.communication.contentTypes.length > 0) { score += 1; }
  if (persona.communication.frequency) { score += 1; }
  total += 5;
  
  // Vérifier le marketing
  if (persona.marketing.painPoints.length > 0) { score += 2; }
  if (persona.marketing.motivations.length > 0) { score += 2; }
  if (persona.marketing.buyingBehavior) { score += 1; }
  if (persona.marketing.influences.length > 0) { score += 1; }
  total += 6;
  
  // Calculer le pourcentage
  return Math.round((score / total) * 100);
}