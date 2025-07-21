'use client';

import React from 'react';
import { usePersonaPreferences } from '@/hooks/use-persona-preferences';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Palette, 
  Eye, 
  Volume2, 
  Download, 
  Layout,
  Accessibility,
  Monitor,
  Sun,
  Moon,
  Type,
  Zap,
  Grid3X3,
  List,
  LayoutGrid
} from 'lucide-react';

interface PersonaPreferencesPanelProps {
  className?: string;
}

export function PersonaPreferencesPanel({ className }: PersonaPreferencesPanelProps) {
  const {
    preferences,
    systemPreferences,
    isTransitioning,
    setTheme,
    setViewMode,
    setDisplayMode,
    setFontSize,
    toggleAnimations,
    toggleTooltips,
    toggleAutoSave,
    toggleReducedMotion,
    toggleHighContrast,
    toggleSoundEffects,
    toggleCompactHeader,
    updateExportDefaults,
    resetPreferences,
  } = usePersonaPreferences();

  const themeOptions = [
    { value: 'light', label: 'Clair', icon: Sun },
    { value: 'dark', label: 'Sombre', icon: Moon },
    { value: 'auto', label: 'Système', icon: Monitor },
  ];

  const displayModeOptions = [
    { value: 'cards', label: 'Cartes', icon: LayoutGrid },
    { value: 'grid', label: 'Grille', icon: Grid3X3 },
    { value: 'list', label: 'Liste', icon: List },
  ];

  const fontSizeOptions = [
    { value: 'small', label: 'Petit' },
    { value: 'medium', label: 'Moyen' },
    { value: 'large', label: 'Grand' },
  ];

  const exportFormatOptions = [
    { value: 'pdf', label: 'PDF' },
    { value: 'csv', label: 'CSV' },
    { value: 'json', label: 'JSON' },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Préférences Persona</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={resetPreferences}
          className="text-sm"
        >
          Réinitialiser
        </Button>
      </div>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Thème et Apparence
          </CardTitle>
          <CardDescription>
            Personnalisez l'apparence de l'interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Thème</Label>
            <div className="flex gap-2">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.value}
                    variant={preferences.theme === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme(option.value as any)}
                    disabled={isTransitioning}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
            {isTransitioning && (
              <Badge variant="secondary" className="text-xs">
                Transition en cours...
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <Label>Mode d'affichage</Label>
            <div className="flex gap-2">
              {displayModeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.value}
                    variant={preferences.displayMode === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDisplayMode(option.value as any)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Vue par défaut</Label>
            <div className="flex gap-2">
              <Button
                variant={preferences.defaultView === 'detailed' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode('detailed')}
              >
                Détaillée
              </Button>
              <Button
                variant={preferences.defaultView === 'compact' ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode('compact')}
              >
                Compacte
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="h-4 w-4" />
            Accessibilité
          </CardTitle>
          <CardDescription>
            Options pour améliorer l'accessibilité
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="font-size">Taille de police</Label>
            <Select value={preferences.fontSize} onValueChange={setFontSize}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontSizeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mouvement réduit</Label>
              <p className="text-sm text-muted-foreground">
                Désactive les animations pour réduire les mouvements
              </p>
            </div>
            <Switch
              checked={preferences.reducedMotion}
              onCheckedChange={toggleReducedMotion}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Contraste élevé</Label>
              <p className="text-sm text-muted-foreground">
                Améliore le contraste pour une meilleure lisibilité
              </p>
            </div>
            <Switch
              checked={preferences.highContrast}
              onCheckedChange={toggleHighContrast}
            />
          </div>

          {/* System preferences info */}
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">Préférences système détectées :</p>
            <div className="flex flex-wrap gap-2">
              {systemPreferences.reducedMotion && (
                <Badge variant="outline" className="text-xs">Mouvement réduit</Badge>
              )}
              {systemPreferences.highContrast && (
                <Badge variant="outline" className="text-xs">Contraste élevé</Badge>
              )}
              {systemPreferences.darkMode && (
                <Badge variant="outline" className="text-xs">Mode sombre</Badge>
              )}
              {!systemPreferences.reducedMotion && !systemPreferences.highContrast && !systemPreferences.darkMode && (
                <Badge variant="outline" className="text-xs">Aucune préférence spéciale</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interface Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Interface
          </CardTitle>
          <CardDescription>
            Personnalisez le comportement de l'interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Animations</Label>
              <p className="text-sm text-muted-foreground">
                Active les animations et transitions
              </p>
            </div>
            <Switch
              checked={preferences.animations}
              onCheckedChange={toggleAnimations}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Info-bulles</Label>
              <p className="text-sm text-muted-foreground">
                Affiche les info-bulles d'aide
              </p>
            </div>
            <Switch
              checked={preferences.showTooltips}
              onCheckedChange={toggleTooltips}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>En-tête compact</Label>
              <p className="text-sm text-muted-foreground">
                Utilise un en-tête plus compact
              </p>
            </div>
            <Switch
              checked={preferences.compactHeader}
              onCheckedChange={toggleCompactHeader}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Effets sonores</Label>
              <p className="text-sm text-muted-foreground">
                Active les sons pour les interactions
              </p>
            </div>
            <Switch
              checked={preferences.soundEffects}
              onCheckedChange={toggleSoundEffects}
            />
          </div>
        </CardContent>
      </Card>

      {/* Export Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export et Sauvegarde
          </CardTitle>
          <CardDescription>
            Configurez les options d'export par défaut
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sauvegarde automatique</Label>
              <p className="text-sm text-muted-foreground">
                Sauvegarde automatiquement vos préférences
              </p>
            </div>
            <Switch
              checked={preferences.autoSave}
              onCheckedChange={toggleAutoSave}
            />
          </div>

          <div className="space-y-2">
            <Label>Format d'export par défaut</Label>
            <Select 
              value={preferences.exportDefaults.format} 
              onValueChange={(value) => updateExportDefaults({ format: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {exportFormatOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Inclure les images</Label>
              <p className="text-sm text-muted-foreground">
                Inclut les images dans les exports
              </p>
            </div>
            <Switch
              checked={preferences.exportDefaults.includeImages}
              onCheckedChange={(checked) => updateExportDefaults({ includeImages: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Inclure les métriques</Label>
              <p className="text-sm text-muted-foreground">
                Inclut les métriques de qualité dans les exports
              </p>
            </div>
            <Switch
              checked={preferences.exportDefaults.includeMetrics}
              onCheckedChange={(checked) => updateExportDefaults({ includeMetrics: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}