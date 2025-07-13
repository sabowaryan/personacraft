'use client';

import { useState, useMemo } from 'react';
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
  Activity,
  Zap,
  Award,
  Gauge,
  Lightbulb,
  ArrowRight,
  ExternalLink,
  Copy,
  AlertCircle,
  Info,
  Heart,
  MessageCircle,
  MapPin,
  Calendar
} from 'lucide-react';
import { PersonaCard } from './persona-card';
import { useExport } from '@/hooks/use-export';
import { Persona, EnhancedPersona } from '@/lib/types/persona';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

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
  const [copiedCount, setCopiedCount] = useState(false);
  
  const { exportState, exportPersonas, resetExportState } = useExport();
  const router = useRouter();

  const handleExportAll = async () => {
    if (onExportEnhanced) {
      await onExportEnhanced(exportFormat);
    } else {
      resetExportState();
      await exportPersonas(personas, { format: exportFormat as 'csv' | 'pdf' });
    }
  };

  const copyPersonasCount = async () => {
    try {
      await navigator.clipboard.writeText(`${personas.length} personas générés`);
      setCopiedCount(true);
      setTimeout(() => setCopiedCount(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
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
    <div className="max-w-7xl mx-auto space-y-8">
      {/* En-tête principal avec design moderne */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          <div className="relative">
            {/* Bannière de fond */}
            <div className="h-32 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-secondary-600/20" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
            </div>
            
            {/* Contenu de l'en-tête */}
            <CardContent className="relative pt-0">
              <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6 -mt-16">
                {/* Icône principale */}
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl shadow-2xl ring-4 ring-white dark:ring-gray-800 flex items-center justify-center">
                    <Users className="h-16 w-16 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
                
                {/* Informations principales */}
                <div className="flex-1 space-y-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    Vos Personas
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full backdrop-blur-sm">
                        <Users className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                        <span className="font-medium">{personas.length} généré{personas.length > 1 ? 's' : ''}</span>
                      </div>
                    {hasEnhancedData && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full backdrop-blur-sm">
                          <Sparkles className="h-4 w-4 text-secondary-600 dark:text-secondary-400" />
                          <span className="font-medium">Premium</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full backdrop-blur-sm">
                        <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <span className="font-medium">
                          {new Date().toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/30 dark:to-secondary-900/30 p-4 rounded-xl border border-primary-200/50 dark:border-primary-700/50">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                          Personas générés avec succès • Prêts pour vos campagnes marketing
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Utilisez ces personas pour cibler vos audiences et optimiser vos stratégies
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>

      {/* Métriques rapides - Design moderne et professionnel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Carte Personas */}
        <Card className="group relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-primary-50 via-primary-100 to-secondary-100 dark:from-primary-900/30 dark:via-primary-800/30 dark:to-secondary-800/30 hover-lift transition-all duration-300 hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 dark:from-primary-400/10 dark:to-secondary-400/10" />
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-300/20 to-secondary-300/20 dark:from-primary-600/20 dark:to-secondary-600/20 rounded-bl-full transform translate-x-6 -translate-y-6" />
          
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-800/50 dark:to-primary-700/50 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 bg-primary-100/50 dark:bg-primary-800/30 px-2 py-1 rounded-full">
                <Activity className="h-3 w-3" />
                <span>Actif</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary-700 dark:text-primary-300 group-hover:scale-105 transition-transform duration-300">
                  {personas.length}
                </span>
                <button 
                  onClick={copyPersonasCount}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                >
                  {copiedCount ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400">Personas</span>
                <span className="text-xs text-primary-500 dark:text-primary-500">
                  {personas.length === 1 ? 'Généré' : 'Générés'}
                </span>
              </div>
            </div>
            
            {/* Barre de progression subtile */}
            <div className="mt-4 w-full bg-primary-200/50 dark:bg-primary-700/30 rounded-full h-1">
              <div 
                className="h-1 bg-gradient-to-r from-primary-500 to-secondary-500 dark:from-primary-400 dark:to-secondary-400 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((personas.length / 5) * 100, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Carte Validés */}
        <Card className="group relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-green-50 via-green-100 to-emerald-100 dark:from-green-900/30 dark:via-green-800/30 dark:to-emerald-800/30 hover-lift transition-all duration-300 hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 dark:from-green-400/10 dark:to-emerald-400/10" />
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-300/20 to-emerald-300/20 dark:from-green-600/20 dark:to-emerald-600/20 rounded-bl-full transform translate-x-6 -translate-y-6" />
          
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-800/50 dark:to-green-700/50 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-100/50 dark:bg-green-800/30 px-2 py-1 rounded-full">
                <Shield className="h-3 w-3" />
                <span>Validé</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-green-700 dark:text-green-300 group-hover:scale-105 transition-transform duration-300">
                  {personas.filter(p => 'validation_metrics' in p).length}
                </span>
                <span className="text-xs text-green-500 dark:text-green-500">
                  / {personas.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Validés</span>
                <span className="text-xs text-green-500 dark:text-green-500">
                  {personas.filter(p => 'validation_metrics' in p).length === personas.length ? 'Complet' : 'En cours'}
                </span>
              </div>
            </div>
            
            {/* Barre de progression */}
            <div className="mt-4 w-full bg-green-200/50 dark:bg-green-700/30 rounded-full h-1">
              <div 
                className="h-1 bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400 rounded-full transition-all duration-1000"
                style={{ width: `${(personas.filter(p => 'validation_metrics' in p).length / personas.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Carte Qualité */}
        <Card className="group relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-purple-50 via-purple-100 to-violet-100 dark:from-purple-900/30 dark:via-purple-800/30 dark:to-violet-800/30 hover-lift transition-all duration-300 hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 dark:from-purple-400/10 dark:to-violet-400/10" />
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-300/20 to-violet-300/20 dark:from-purple-600/20 dark:to-violet-600/20 rounded-bl-full transform translate-x-6 -translate-y-6" />
          
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800/50 dark:to-purple-700/50 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 bg-purple-100/50 dark:bg-purple-800/30 px-2 py-1 rounded-full">
                <Award className="h-3 w-3" />
                <span>Premium</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-purple-700 dark:text-purple-300 group-hover:scale-105 transition-transform duration-300">
                  {Math.round((personas.filter(p => 'validation_metrics' in p).length / personas.length) * 100)}%
                </span>
                <span className="text-xs text-purple-500 dark:text-purple-500">score</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Qualité</span>
                <span className="text-xs text-purple-500 dark:text-purple-500">
                  {Math.round((personas.filter(p => 'validation_metrics' in p).length / personas.length) * 100) >= 80 ? 'Excellent' : 
                   Math.round((personas.filter(p => 'validation_metrics' in p).length / personas.length) * 100) >= 60 ? 'Bon' : 'Moyen'}
                </span>
              </div>
            </div>
            
            {/* Barre de progression circulaire */}
            <div className="mt-4 w-full bg-purple-200/50 dark:bg-purple-700/30 rounded-full h-1">
              <div 
                className="h-1 bg-gradient-to-r from-purple-500 to-violet-500 dark:from-purple-400 dark:to-violet-400 rounded-full transition-all duration-1000"
                style={{ width: `${(personas.filter(p => 'validation_metrics' in p).length / personas.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Carte Export */}
        <Card className="group relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-amber-50 via-amber-100 to-orange-100 dark:from-amber-900/30 dark:via-amber-800/30 dark:to-orange-800/30 hover-lift transition-all duration-300 hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-amber-400/10 dark:to-orange-400/10" />
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-300/20 to-orange-300/20 dark:from-amber-600/20 dark:to-orange-600/20 rounded-bl-full transform translate-x-6 -translate-y-6" />
          
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-800/50 dark:to-amber-700/50 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Download className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-800/30 px-2 py-1 rounded-full">
                <Zap className="h-3 w-3" />
                <span>Prêt</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-amber-700 dark:text-amber-300 group-hover:scale-105 transition-transform duration-300">
                  {exportFormat.toUpperCase()}
                </span>
                <button 
                  onClick={handleExportAll}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                  disabled={exportState.isExporting}
                >
                  {exportState.isExporting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <ExternalLink className="h-3 w-3" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Export</span>
                <span className="text-xs text-amber-500 dark:text-amber-500">
                  {exportState.isExporting ? 'En cours...' : 'Disponible'}
                </span>
              </div>
            </div>
            
            {/* Indicateur de format */}
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 bg-amber-200/50 dark:bg-amber-700/30 rounded-full h-1">
                <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400 rounded-full w-full transition-all duration-300" />
              </div>
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                {exportFormat === 'csv' ? 'Excel' : exportFormat === 'pdf' ? 'Document' : 'Données'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
              
      {/* Actions principales */}
      <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
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
                
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <select 
                    value={exportFormat} 
                    onChange={(e) => setExportFormat(e.target.value as any)}
                  className="text-sm bg-transparent border-none outline-none px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300"
                  >
                    <option value="csv">CSV</option>
                    <option value="pdf">PDF</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={copyPersonasCount}
                className="flex items-center gap-2 hover-lift"
              >
                {copiedCount ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copier</span>
                  </>
                )}
              </Button>
                
                <Button 
                  onClick={handleExportAll}
                  disabled={exportState.status === 'generating'}
                className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white hover-lift"
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
                className="hover-lift border-gray-300 dark:border-gray-600"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Nouveau brief
                </Button>
              </div>
            </div>
            
            {/* Indicateurs d'état d'export */}
            {exportState.status === 'success' && (
            <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 dark:bg-green-900/30 p-3 rounded-lg mt-4 animate-in fade-in slide-in-from-top-2">
                <CheckCircle className="h-4 w-4" />
                <span>Export réussi ! Vos personas ont été téléchargés.</span>
              </div>
            )}
            
            {exportState.status === 'error' && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/30 p-3 rounded-lg mt-4 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
                <span>Erreur lors de l'export: {exportState.error}</span>
              </div>
            )}
        </CardContent>
        </Card>

      {/* Statistiques globales - Section supprimée car déplacée dans app/generator/page.tsx */}
      {/* Les métriques détaillées sont maintenant gérées dans la page principale */}

      {/* Contrôles d'affichage */}
      <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardContent className="p-6">
            <Tabs value={viewMode} onValueChange={setViewMode as any} className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <TabsList className="grid w-full sm:w-auto grid-cols-2 bg-gray-100 dark:bg-gray-700">
                <TabsTrigger 
                  value="enhanced" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary-500 data-[state=active]:text-white"
                >
                    <Activity className="h-4 w-4" />
                    Vue détaillée
                  </TabsTrigger>
                <TabsTrigger 
                  value="simple" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary-500 data-[state=active]:text-white"
                >
                    <Eye className="h-4 w-4" />
                    Vue simple
                  </TabsTrigger>
                </TabsList>
                
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Filter className="h-4 w-4" />
                  <span>Affichage : {layoutMode === 'grid' ? 'Grille' : 'Liste'}</span>
                </div>
              </div>

              <TabsContent value="enhanced" className="mt-4">
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-xl border border-primary-200/50 dark:border-primary-700/50">
                <div className="p-2 bg-primary-100 dark:bg-primary-800/50 rounded-lg">
                  <Sparkles className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-sm text-primary-700 dark:text-primary-300 font-medium">
                    Affichage complet avec métriques de qualité
                  </p>
                  <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                    Données de performance et validation pour chaque persona
                  </p>
                </div>
                </div>
              </TabsContent>

              <TabsContent value="simple" className="mt-4">
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200/50 dark:border-gray-600/50">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <Eye className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Vue simplifiée focalisée sur l'essentiel
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Informations clés de vos personas pour un aperçu rapide
                  </p>
                </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

      {/* Liste des personas avec layout responsive */}
      <div className={cn(
        layoutMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
          : 'space-y-6',
        "animate-in fade-in slide-in-from-bottom-6 duration-700"
      )}>
        {personas.map((persona, index) => {
          const isEnhanced = 'validation_metrics' in persona;
          
          return (
            <div 
              key={persona.id} 
              className={cn(
                "hover-lift transition-all duration-300",
                layoutMode === 'grid' ? "animate-in fade-in scale-in" : "animate-in fade-in slide-in-from-left-4"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <PersonaCard 
                persona={persona}
                variant={viewMode === 'enhanced' ? 'detailed' : 'default'}
                onView={() => router.push(`/personas/${persona.id}`)}
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
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-800/20 border border-blue-200 dark:border-blue-700">
            <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-800/50 rounded-xl">
                  <Star className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                  <h3 className="font-bold text-blue-900 dark:text-blue-100 text-lg">Actions Avancées</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                      Outils d'analyse et d'optimisation pour vos personas
                    </p>
                  </div>
                </div>
                
              <div className="flex flex-wrap gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                  className="bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-700/80 border-blue-200 hover:border-blue-300 dark:border-blue-600 dark:hover:border-blue-500 hover-lift"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Valider tous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                  className="bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-700/80 border-blue-200 hover:border-blue-300 dark:border-blue-600 dark:hover:border-blue-500 hover-lift"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Rapport détaillé
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                  className="bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-700/80 border-blue-200 hover:border-blue-300 dark:border-blue-600 dark:hover:border-blue-500 hover-lift"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analyser les tendances
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
      )}
    </div>
  );
}