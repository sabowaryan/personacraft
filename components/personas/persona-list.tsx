'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, RefreshCw, BarChart3, FileText, Shield, Loader2, CheckCircle } from 'lucide-react';
import { PersonaCard } from './persona-card';
import { EnhancedPersonaCard } from './enhanced-persona-card';
import { useExport } from '@/hooks/use-export';

// Types pour les personas (compatibilité avec les deux formats)
interface BasePersona {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  quote: string;
  avatar?: string;
  generatedAt: Date;
  sources: string[];
  values: string[];
  interests: {
    music: string[];
    brands: string[];
    movies: string[];
    food: string[];
    books: string[];
    lifestyle: string[];
  };
  communication: {
    preferredChannels: string[];
    tone: string;
    contentTypes: string[];
    frequency: string;
  };
  marketing: {
    painPoints: string[];
    motivations: string[];
    buyingBehavior: string;
    influences: string[];
  };
}

interface EnhancedPersona extends BasePersona {
  validation_metrics?: {
    completeness_score: number;
    consistency_score: number;
    realism_score: number;
    quality_indicators: string[];
  };
  generation_metadata?: {
    gemini_response_time: number;
    qloo_response_time: number;
    total_processing_time: number;
    confidence_level: 'low' | 'medium' | 'high';
    data_sources: string[];
  };
}

interface PersonaListProps {
  personas: (BasePersona | EnhancedPersona)[];
  onClear: () => void;
  onExportEnhanced?: (format: 'pdf' | 'csv' | 'json') => void;
  onValidatePersona?: (persona: BasePersona | EnhancedPersona) => void;
  showMetrics?: boolean;
  showPerformance?: boolean;
}

export function PersonaList({ 
  personas, 
  onClear, 
  onExportEnhanced,
  onValidatePersona,
  showMetrics = false,
  showPerformance = false 
}: PersonaListProps) {
  const [viewMode, setViewMode] = useState<'simple' | 'enhanced'>('enhanced');
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'json'>('csv');
  
  const { exportState, exportPersonas, resetExportState } = useExport();

  const handleExportAll = async () => {
    if (onExportEnhanced) {
      await onExportEnhanced(exportFormat);
    } else {
      resetExportState();
      await exportPersonas(personas, { format: exportFormat as 'csv' | 'pdf' });
    }
  };

  // Vérifier si on a des personas enrichis
  const hasEnhancedData = personas.some(p => 'validation_metrics' in p);

  // Calculer les statistiques globales
  const getGlobalStats = () => {
    if (!hasEnhancedData) return null;

    const enhancedPersonas = personas.filter(p => 'validation_metrics' in p) as EnhancedPersona[];
    const totalPersonas = enhancedPersonas.length;

    if (totalPersonas === 0) return null;

    const avgCompleteness = enhancedPersonas.reduce((sum, p) => 
      sum + (p.validation_metrics?.completeness_score || 0), 0) / totalPersonas;
    
    const avgConsistency = enhancedPersonas.reduce((sum, p) => 
      sum + (p.validation_metrics?.consistency_score || 0), 0) / totalPersonas;
    
    const avgRealism = enhancedPersonas.reduce((sum, p) => 
      sum + (p.validation_metrics?.realism_score || 0), 0) / totalPersonas;

    const avgProcessingTime = enhancedPersonas.reduce((sum, p) => 
      sum + (p.generation_metadata?.total_processing_time || 0), 0) / totalPersonas;

    const confidenceLevels = enhancedPersonas.reduce((acc, p) => {
      const level = p.generation_metadata?.confidence_level || 'low';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      avgCompleteness,
      avgConsistency,
      avgRealism,
      avgProcessingTime,
      confidenceLevels
    };
  };

  const globalStats = getGlobalStats();

  if (personas.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <span>Personas générés</span>
              <Badge variant="outline">
                {personas.length} persona{personas.length > 1 ? 's' : ''}
              </Badge>
              {hasEnhancedData && (
                <Badge variant="secondary">
                  ✨ Enhanced
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center space-x-2">
              {/* Sélecteur de format d'export */}
              {onExportEnhanced && (
                <select 
                  value={exportFormat} 
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF</option>
                  <option value="json">JSON</option>
                </select>
              )}
              
              <Button 
                variant="outline" 
                onClick={handleExportAll}
                disabled={exportState.status === 'generating'}
              >
                {exportState.status === 'generating' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Exporter ({exportFormat.toUpperCase()})
              </Button>
              
              <Button variant="outline" onClick={onClear}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Nouveau brief
              </Button>
              
              {/* Indicateurs d'état d'export */}
              {exportState.status === 'success' && (
                <div className="flex items-center space-x-2 text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>Export réussi!</span>
                </div>
              )}
              
              {exportState.status === 'error' && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <span>Erreur: {exportState.error}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={viewMode} onValueChange={setViewMode as any} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="enhanced">Vue détaillée</TabsTrigger>
              <TabsTrigger value="simple">Vue simple</TabsTrigger>
            </TabsList>

            {/* Onglet vue enrichie */}
            <TabsContent value="enhanced" className="space-y-4">
              {globalStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(globalStats.avgCompleteness * 100)}%
                    </div>
                    <p className="text-xs text-gray-600">Complétude</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(globalStats.avgConsistency * 100)}%
                    </div>
                    <p className="text-xs text-gray-600">Cohérence</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(globalStats.avgRealism * 100)}%
                    </div>
                    <p className="text-xs text-gray-600">Réalisme</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round(globalStats.avgProcessingTime)}ms
                    </div>
                    <p className="text-xs text-gray-600">Temps moyen</p>
                  </div>
                </div>
              )}
              
              <p className="text-sm text-muted-foreground">
                Vos personas ont été générés avec succès. Consultez les métriques de qualité 
                et les données de performance pour chaque persona.
              </p>
            </TabsContent>

            {/* Onglet vue simple */}
            <TabsContent value="simple">
              <p className="text-sm text-muted-foreground">
                Vue simplifiée des personas générés. Vous pouvez les examiner individuellement 
                ou les exporter pour une utilisation ultérieure.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Liste des personas */}
      <div className="space-y-6">
        {personas.map((persona, index) => {
          const isEnhanced = 'validation_metrics' in persona;
          
          return (
            <div 
              key={persona.id} 
              className="animate-in fade-in slide-in-from-bottom-4 duration-500" 
              style={{ animationDelay: `${index * 150}ms` }}
            >
                             {viewMode === 'enhanced' && isEnhanced && 
                'validation_metrics' in persona && 
                'generation_metadata' in persona &&
                persona.validation_metrics &&
                persona.generation_metadata ? (
                 <EnhancedPersonaCard
                   persona={persona as any}
                   onView={() => window.open(`/personas/${persona.id}`, '_blank')}
                   onRegenerate={() => console.log('Regenerate:', persona.id)}
                   onValidate={() => onValidatePersona?.(persona)}
                   showMetrics={showMetrics}
                   showPerformance={showPerformance}
                 />
               ) : (
                 <PersonaCard persona={persona} />
               )}
            </div>
          );
        })}
      </div>

      {/* Actions globales */}
      {hasEnhancedData && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Actions avancées</span>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Valider tous
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Rapport détaillé
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-blue-700 mt-2">
              Utilisez les outils avancés pour analyser et améliorer la qualité de vos personas.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}