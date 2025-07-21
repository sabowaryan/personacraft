'use client';

import React from 'react';
import { usePreferenceStyles } from '@/hooks/use-preference-styles';
import { usePersonaPreferences } from '@/hooks/use-persona-preferences';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PersonaPreferencesPanel } from './persona-preferences-panel';
import { 
  Palette, 
  Zap, 
  Volume2, 
  Eye,
  Settings,
  Sparkles
} from 'lucide-react';

/**
 * Demo component to showcase preference-aware styling and functionality
 */
export function PersonaPreferencesDemo() {
  const { preferences, originalPreferences } = usePersonaPreferences();
  const { 
    getCardClasses, 
    getButtonClasses, 
    getAnimationClasses, 
    getTextClasses,
    getSpacingClasses,
    playSound,
    getCSSProperties
  } = usePreferenceStyles();

  const handleButtonClick = (soundType: 'click' | 'success' | 'error' = 'click') => {
    playSound(soundType);
  };

  return (
    <div className="space-y-6" style={getCSSProperties()}>
      {/* Demo Header */}
      <div className={getCardClasses()}>
        <CardHeader className={getSpacingClasses()}>
          <CardTitle className={`${getTextClasses('xl')} flex items-center gap-2`}>
            <Settings className="h-6 w-6" />
            Démonstration des Préférences
          </CardTitle>
          <CardDescription className={getTextClasses('sm')}>
            Cette section démontre comment les préférences utilisateur affectent l'interface
          </CardDescription>
        </CardHeader>
      </div>

      {/* Current Preferences Display */}
      <Card className={getCardClasses()}>
        <CardHeader className={getSpacingClasses()}>
          <CardTitle className={`${getTextClasses('lg')} flex items-center gap-2`}>
            <Eye className="h-5 w-5" />
            Préférences Actuelles
          </CardTitle>
        </CardHeader>
        <CardContent className={getSpacingClasses()}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className={`${getTextClasses('sm')} font-medium`}>Thème</p>
              <Badge variant="outline" className={getAnimationClasses('fade')}>
                {originalPreferences.theme === 'auto' ? 'Système' : 
                 originalPreferences.theme === 'dark' ? 'Sombre' : 'Clair'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <p className={`${getTextClasses('sm')} font-medium`}>Affichage</p>
              <Badge variant="outline" className={getAnimationClasses('fade')}>
                {preferences.displayMode === 'cards' ? 'Cartes' :
                 preferences.displayMode === 'grid' ? 'Grille' : 'Liste'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <p className={`${getTextClasses('sm')} font-medium`}>Police</p>
              <Badge variant="outline" className={getAnimationClasses('fade')}>
                {preferences.fontSize === 'small' ? 'Petit' :
                 preferences.fontSize === 'large' ? 'Grand' : 'Moyen'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <p className={`${getTextClasses('sm')} font-medium`}>Animations</p>
              <Badge 
                variant={preferences.animations ? "default" : "secondary"}
                className={getAnimationClasses('fade')}
              >
                {preferences.animations ? 'Activées' : 'Désactivées'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Demo */}
      <Card className={getCardClasses()}>
        <CardHeader className={getSpacingClasses()}>
          <CardTitle className={`${getTextClasses('lg')} flex items-center gap-2`}>
            <Sparkles className="h-5 w-5" />
            Démonstration Interactive
          </CardTitle>
          <CardDescription className={getTextClasses('sm')}>
            Testez les effets sonores et les animations
          </CardDescription>
        </CardHeader>
        <CardContent className={getSpacingClasses()}>
          <div className="flex flex-wrap gap-3">
            <Button
              className={getButtonClasses('default')}
              onClick={() => handleButtonClick('click')}
            >
              <Volume2 className="h-4 w-4 mr-2" />
              Son Clic
            </Button>
            
            <Button
              variant="outline"
              className={getButtonClasses('outline')}
              onClick={() => handleButtonClick('success')}
            >
              <Zap className="h-4 w-4 mr-2" />
              Son Succès
            </Button>
            
            <Button
              variant="destructive"
              className={getButtonClasses('default')}
              onClick={() => handleButtonClick('error')}
            >
              Son Erreur
            </Button>
          </div>
          
          {!preferences.soundEffects && (
            <p className={`${getTextClasses('sm')} text-muted-foreground mt-3`}>
              Les effets sonores sont désactivés dans vos préférences
            </p>
          )}
        </CardContent>
      </Card>

      {/* Accessibility Features Demo */}
      <Card className={getCardClasses()}>
        <CardHeader className={getSpacingClasses()}>
          <CardTitle className={`${getTextClasses('lg')} flex items-center gap-2`}>
            <Eye className="h-5 w-5" />
            Fonctionnalités d'Accessibilité
          </CardTitle>
        </CardHeader>
        <CardContent className={getSpacingClasses()}>
          <div className="space-y-4">
            {preferences.reducedMotion && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className={`${getTextClasses('sm')} text-blue-700 dark:text-blue-300`}>
                  ✓ Mouvement réduit activé - Les animations sont désactivées
                </p>
              </div>
            )}
            
            {preferences.highContrast && (
              <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <p className={`${getTextClasses('sm')} text-purple-700 dark:text-purple-300`}>
                  ✓ Contraste élevé activé - Amélioration de la lisibilité
                </p>
              </div>
            )}
            
            {preferences.fontSize !== 'medium' && (
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <p className={`${getTextClasses('sm')} text-green-700 dark:text-green-300`}>
                  ✓ Taille de police ajustée - {preferences.fontSize === 'large' ? 'Grande' : 'Petite'} police active
                </p>
              </div>
            )}
            
            {!preferences.reducedMotion && !preferences.highContrast && preferences.fontSize === 'medium' && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className={`${getTextClasses('sm')} text-gray-600 dark:text-gray-400`}>
                  Aucune préférence d'accessibilité spéciale activée
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preferences Panel */}
      <PersonaPreferencesPanel />
    </div>
  );
}