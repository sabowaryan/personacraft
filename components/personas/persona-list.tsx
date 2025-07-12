'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  RefreshCw, 
  BarChart3, 
  FileText, 
  Shield, 
  Loader2, 
  CheckCircle, 
  Users,
  TrendingUp,
  Clock,
  Star,
  Sparkles,
  Eye,
  Filter,
  Grid,
  List,
  ChevronDown,
  Trophy,
  Target,
  Activity
} from 'lucide-react';
import { PersonaCard } from './persona-card';
import { useExport } from '@/hooks/use-export';
import { Persona, EnhancedPersona } from '@/lib/types/persona';

interface PersonaListProps {
  personas: (Persona | EnhancedPersona)[];
  onClear: () => void;
  onExportEnhanced?: (format: 'pdf' | 'csv' | 'json') => void;
  onValidatePersona?: (persona: EnhancedPersona) => Promise<any>;
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
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'json'>('csv');
  const [isStatsExpanded, setIsStatsExpanded] = useState(true);
  
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
    <div className="space-y-8">
      {/* En-tête principal avec design moderne */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover-lift">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                    Vos Personas
                    <Badge variant="outline" className="ml-2">
                      {personas.length} généré{personas.length > 1 ? 's' : ''}
                    </Badge>
                    {hasEnhancedData && (
                      <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-gray-600 text-sm mt-1">
                    Personas générés avec succès • Prêts pour vos campagnes
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {/* Sélecteur de mise en page */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <Button 
                    variant={layoutMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setLayoutMode('grid')}
                    className="h-8 px-3"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={layoutMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setLayoutMode('list')}
                    className="h-8 px-3"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Sélecteur de format d'export */}
                <div className="flex items-center bg-gray-100 rounded-lg">
                  <select 
                    value={exportFormat} 
                    onChange={(e) => setExportFormat(e.target.value as any)}
                    className="text-sm bg-transparent border-none outline-none px-3 py-2 rounded-lg"
                  >
                    <option value="csv">CSV</option>
                    <option value="pdf">PDF</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
                
                <Button 
                  onClick={handleExportAll}
                  disabled={exportState.status === 'generating'}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white hover-glow"
                >
                  {exportState.status === 'generating' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Exporter
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={onClear}
                  className="hover:bg-gray-50 border-gray-200"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Nouveau brief
                </Button>
              </div>
            </div>
            
            {/* Indicateurs d'état d'export */}
            {exportState.status === 'success' && (
              <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg mt-4 animate-in fade-in slide-in-from-top-2">
                <CheckCircle className="h-4 w-4" />
                <span>Export réussi ! Vos personas ont été téléchargés.</span>
              </div>
            )}
            
            {exportState.status === 'error' && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg mt-4 animate-in fade-in slide-in-from-top-2">
                <span>Erreur lors de l'export: {exportState.error}</span>
              </div>
            )}
          </CardHeader>
        </Card>
      </div>

      {/* Statistiques globales améliorées */}
      {globalStats && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
            <CardHeader 
              className="bg-gradient-to-r from-green-50 to-emerald-50 cursor-pointer hover:from-green-100 hover:to-emerald-100 transition-all duration-300"
              onClick={() => setIsStatsExpanded(!isStatsExpanded)}
            >
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <span className="text-green-700 text-lg">Métriques de Performance</span>
                    <p className="text-sm text-green-600 font-normal">
                      Analyse qualitative de vos personas
                    </p>
                  </div>
                </div>
                <ChevronDown className={`h-5 w-5 text-green-600 transition-transform duration-300 ${isStatsExpanded ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover-scale transition-transform duration-200">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {Math.round(globalStats.avgCompleteness * 100)}%
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Complétude</p>
                  <p className="text-xs text-gray-500 mt-1">Données complètes</p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover-scale transition-transform duration-200">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-3">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {Math.round(globalStats.avgConsistency * 100)}%
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Cohérence</p>
                  <p className="text-xs text-gray-500 mt-1">Logique interne</p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover-scale transition-transform duration-200">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-3">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {Math.round(globalStats.avgRealism * 100)}%
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Réalisme</p>
                  <p className="text-xs text-gray-500 mt-1">Crédibilité</p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl hover-scale transition-transform duration-200">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-3">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="text-3xl font-bold text-orange-600 mb-1">
                    {Math.round(globalStats.avgProcessingTime)}ms
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Temps moyen</p>
                  <p className="text-xs text-gray-500 mt-1">Génération</p>
                </div>
              </div>

              {isStatsExpanded && (
                <div className="mt-6 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Trophy className="h-5 w-5 text-indigo-600" />
                        <span className="font-medium text-indigo-700">Niveau de Confiance</span>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(globalStats.confidenceLevels).map(([level, count]) => (
                          <div key={level} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 capitalize">{level}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    level === 'high' ? 'bg-green-500' : 
                                    level === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${(count / personas.length) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-700">Qualité Globale</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {Math.round(((globalStats.avgCompleteness + globalStats.avgConsistency + globalStats.avgRealism) / 3) * 100)}%
                      </div>
                      <p className="text-sm text-gray-600">
                        Score de qualité excellent pour vos personas
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contrôles d'affichage */}
      <div className="animate-in fade-in slide-in-from-left-4 duration-500">
        <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
          <CardContent className="p-4">
            <Tabs value={viewMode} onValueChange={setViewMode as any} className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <TabsList className="grid w-full sm:w-auto grid-cols-2 bg-gray-100">
                  <TabsTrigger value="enhanced" className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Vue détaillée
                  </TabsTrigger>
                  <TabsTrigger value="simple" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Vue simple
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Filter className="h-4 w-4" />
                  <span>Affichage : {layoutMode === 'grid' ? 'Grille' : 'Liste'}</span>
                </div>
              </div>

              <TabsContent value="enhanced" className="mt-4">
                <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-lg">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <p className="text-sm text-indigo-700">
                    Affichage complet avec métriques de qualité et données de performance pour chaque persona.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="simple" className="mt-4">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Eye className="h-4 w-4 text-gray-600" />
                  <p className="text-sm text-gray-600">
                    Vue simplifiée focalisée sur les informations essentielles de vos personas.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Liste des personas avec layout responsive */}
      <div className={`
        ${layoutMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
          : 'space-y-6'
        }
        animate-in fade-in slide-in-from-bottom-6 duration-700
      `}>
        {personas.map((persona, index) => {
          const isEnhanced = 'validation_metrics' in persona;
          
          return (
            <div 
              key={persona.id} 
              className={`
                hover-lift transition-all duration-300
                ${layoutMode === 'grid' ? 'animate-in fade-in scale-in' : 'animate-in fade-in slide-in-from-left-4'}
              `}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <PersonaCard 
                persona={persona}
                variant={viewMode === 'enhanced' ? 'detailed' : 'default'}
                onView={() => window.open(`/personas/${persona.id}`, '_blank')}
                onRegenerate={() => console.log('Regenerate:', persona.id)}
                onValidate={() => {
                  if (isEnhanced && 'validation_metrics' in persona && 'generation_metadata' in persona) {
                    onValidatePersona?.(persona as EnhancedPersona);
                  }
                }}
                showMetrics={showMetrics}
                showPerformance={showPerformance}
              />
            </div>
          );
        })}
      </div>

      {/* Actions globales avec design amélioré */}
      {hasEnhancedData && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Star className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 text-lg">Actions Avancées</h3>
                    <p className="text-sm text-blue-700">
                      Outils d'analyse et d'optimisation pour vos personas
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-white/80 hover:bg-white border-blue-200 hover:border-blue-300"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Valider tous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-white/80 hover:bg-white border-blue-200 hover:border-blue-300"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Rapport détaillé
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-white/80 hover:bg-white border-blue-200 hover:border-blue-300"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analyser les tendances
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}