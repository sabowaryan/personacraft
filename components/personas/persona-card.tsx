'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Calendar, 
  Quote, 
  Heart,
  MessageCircle,
  Target,
  Download,
  Eye,
  Clock,
  User,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Zap,
  TrendingUp,
  Activity,
  Shield,
  Star,
  Award,
  Sparkles,
  Users,
  Brain,
  Lightbulb,
  ChevronRight,
  ExternalLink,
  Share2,
  Bookmark,
  MoreHorizontal,
  Layers,
  Gauge
} from 'lucide-react';
import { Persona, EnhancedPersona } from '@/lib/types/persona';
import { formatDate, formatAge, formatList, truncateText } from '@/lib/utils/formatting';
import { cn } from '@/lib/utils';

interface PersonaCardProps {
  persona: Persona | EnhancedPersona;
  onView?: () => void;
  onExport?: () => void;
  onRegenerate?: () => void;
  onValidate?: () => void;
  variant?: 'default' | 'compact' | 'detailed';
  showMetadata?: boolean;
  showMetrics?: boolean;
  showPerformance?: boolean;
}

export function PersonaCard({ 
  persona, 
  onView, 
  onExport, 
  onRegenerate,
  onValidate,
  variant = 'default',
  showMetadata = true,
  showMetrics = true,
  showPerformance = false
}: PersonaCardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'performance'>('overview');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const isCompact = variant === 'compact';
  const isDetailed = variant === 'detailed';
  const isEnhanced = 'validation_metrics' in persona;

  // Calculer le score global de qualité pour les personas enrichis
  const overallQuality = isEnhanced 
    ? Math.round(
        (persona.validation_metrics.completeness_score + 
         persona.validation_metrics.consistency_score + 
         persona.validation_metrics.realism_score) / 3 * 100
      )
    : 0;

  // Définir la couleur du badge de confiance
  const getConfidenceBadgeVariant = (level: string) => {
    switch (level) {
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'destructive';
      default: return 'outline';
    }
  };

  // Calculer le score de performance
  const performanceScore = isEnhanced 
    ? Math.max(0, 100 - (persona.generation_metadata.total_processing_time / 100))
    : 0;

  // Obtenir les initiales pour l'avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="group h-full hover-lift transition-all duration-300 border-0 shadow-lg glass-card relative overflow-hidden">
      {/* Décoration de gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500" />
      
      {/* En-tête redesigné */}
      <CardHeader className="pb-4 relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className={cn(
                "ring-2 ring-white shadow-lg transition-all duration-300 group-hover:scale-105",
                isCompact ? "h-12 w-12" : "h-16 w-16"
              )}>
              <AvatarImage src={persona.avatar} alt={persona.name} />
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-lg">
                  {getInitials(persona.name)}
              </AvatarFallback>
            </Avatar>
              {/* Indicateur de statut */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm" />
            </div>
            
            <div className="flex-1">
              <CardTitle className={cn(
                "text-gray-900 dark:text-white font-bold mb-2 group-hover:text-primary-600 transition-colors",
                isCompact ? "text-lg" : "text-xl"
              )}>
                {persona.name}
              </CardTitle>
              
              <div className="flex items-center flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatAge(persona.age)}</span>
                </div>
                {persona.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{persona.location}</span>
                  </div>
                )}
                {showMetadata && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(persona.generatedAt, 'relative')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions rapides */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setIsBookmarked(!isBookmarked)}
            >
              <Bookmark className={cn(
                "h-4 w-4",
                isBookmarked ? "fill-current text-yellow-500" : "text-gray-400"
              )} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Share2 className="h-4 w-4 text-gray-400" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4 text-gray-400" />
            </Button>
          </div>
        </div>

        {/* Badges de statut */}
        <div className="flex items-center gap-2 mt-4">
            {isEnhanced && (
            <Badge variant={getConfidenceBadgeVariant(persona.generation_metadata.confidence_level)} className="text-xs">
              {persona.generation_metadata.confidence_level === 'high' ? '🏆 Haute' :
               persona.generation_metadata.confidence_level === 'medium' ? '👍 Moyenne' : '⚠️ Faible'} confiance
              </Badge>
            )}
            
          <Badge variant="outline" className="text-xs bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
            <Sparkles className="h-3 w-3 mr-1" />
            IA Premium
          </Badge>
          
          {overallQuality > 0 && (
            <Badge variant="secondary" className="text-xs">
              <Star className="h-3 w-3 mr-1" />
              {overallQuality}% qualité
            </Badge>
          )}
        </div>

        {/* Score global de qualité pour les personas enrichis */}
        {isEnhanced && showMetrics && !isCompact && (
          <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-white dark:bg-gray-800 rounded-full">
                  <Gauge className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Score global
                </span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {overallQuality}%
              </span>
            </div>
            <Progress value={overallQuality} className="h-2 mb-3" />
            
            <div className="flex items-center flex-wrap gap-2">
              {persona.validation_metrics.quality_indicators.slice(0, 3).map((indicator, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                  {indicator}
                </Badge>
              ))}
              {persona.validation_metrics.quality_indicators.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{persona.validation_metrics.quality_indicators.length - 3} autres
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Contenu avec onglets pour les personas enrichis en vue détaillée */}
        {isEnhanced && isDetailed && (showMetrics || showPerformance) ? (
          <Tabs value={activeTab} onValueChange={setActiveTab as any} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Aperçu
              </TabsTrigger>
              {showMetrics && (
                <TabsTrigger value="metrics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Métriques
                </TabsTrigger>
              )}
              {showPerformance && (
                <TabsTrigger value="performance" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Performance
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <PersonaOverview persona={persona} isCompact={isCompact} isDetailed={isDetailed} />
            </TabsContent>

            {showMetrics && (
              <TabsContent value="metrics" className="space-y-4">
                <PersonaMetrics persona={persona as EnhancedPersona} onValidate={onValidate} />
              </TabsContent>
            )}

            {showPerformance && (
              <TabsContent value="performance" className="space-y-4">
                <PersonaPerformance persona={persona as EnhancedPersona} performanceScore={performanceScore} />
              </TabsContent>
            )}
          </Tabs>
        ) : (
          <PersonaOverview persona={persona} isCompact={isCompact} isDetailed={isDetailed} />
        )}

        {/* Actions principales */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            {onView && (
              <Button variant="outline" size="sm" onClick={onView} className="hover-lift">
                <Eye className="h-4 w-4 mr-2" />
                Détails
              </Button>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport} className="hover-lift">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
            {onRegenerate && (
              <Button variant="outline" size="sm" onClick={onRegenerate} className="hover-lift">
                <Zap className="h-4 w-4 mr-2" />
                Régénérer
              </Button>
            )}
          </div>
          
          {showMetadata && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Layers className="h-3 w-3" />
              <span>Sources: {formatList(persona.sources, 2, "+")} APIs</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Composant pour l'aperçu du persona
function PersonaOverview({ 
  persona, 
  isCompact, 
  isDetailed 
}: { 
  persona: Persona | EnhancedPersona; 
  isCompact?: boolean; 
  isDetailed?: boolean;
}) {
  const [showFullBio, setShowFullBio] = useState(false);
  
  return (
    <div className="space-y-6">
      {/* Bio */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Profil</span>
        </div>
        <div className="relative">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {isCompact && !showFullBio ? truncateText(persona.bio, 120) : persona.bio}
          </p>
          {isCompact && persona.bio.length > 120 && (
            <button
              onClick={() => setShowFullBio(!showFullBio)}
              className="text-primary-600 dark:text-primary-400 text-sm hover:underline mt-2 flex items-center gap-1"
            >
              {showFullBio ? 'Voir moins' : 'Voir plus'}
              <ChevronRight className={cn(
                "h-3 w-3 transition-transform",
                showFullBio && "rotate-90"
              )} />
            </button>
          )}
        </div>
      </div>

      {/* Citation */}
      {!isCompact && persona.quote && (
        <div className="relative p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl border-l-4 border-primary-400 dark:border-primary-500">
          <Quote className="h-5 w-5 text-primary-600 dark:text-primary-400 mb-2" />
          <p className="text-sm italic text-gray-700 dark:text-gray-300 leading-relaxed">
            "{persona.quote}"
          </p>
        </div>
      )}

      {/* Valeurs */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-red-500" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Valeurs</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {persona.values.slice(0, isCompact ? 4 : undefined).map((value, index) => (
            <Badge key={value} variant="secondary" className="text-xs hover-scale" style={{ animationDelay: `${index * 50}ms` }}>
              {value}
            </Badge>
          ))}
          {isCompact && persona.values.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{persona.values.length - 4} autres
            </Badge>
          )}
        </div>
      </div>

      {/* Centres d'intérêt */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Intérêts principaux</span>
        </div>
        <div className="space-y-3">
          {isDetailed ? (
            // Vue détaillée avec toutes les catégories
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Musique</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {formatList(persona.interests.music, 2)}
                </p>
              </div>
              <div className="p-3 bg-green-50/50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">Marques</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {formatList(persona.interests.brands, 2)}
                </p>
              </div>
              <div className="p-3 bg-purple-50/50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Films</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {formatList(persona.interests.movies, 2)}
                </p>
              </div>
              <div className="p-3 bg-orange-50/50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  <span className="text-xs font-medium text-orange-700 dark:text-orange-300">Cuisine</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {formatList(persona.interests.food, 2)}
                </p>
              </div>
            </div>
          ) : (
            // Vue simplifiée avec badges
            <div className="flex flex-wrap gap-2">
              {[
                ...persona.interests.music.slice(0, 2),
                ...persona.interests.brands.slice(0, 1),
                ...persona.interests.lifestyle.slice(0, 1)
              ].slice(0, isCompact ? 4 : 6).map((interest, index) => (
                <Badge key={index} variant="outline" className="text-xs hover-scale" style={{ animationDelay: `${index * 50}ms` }}>
                  {interest}
                </Badge>
              ))}
              {!isCompact && (
                <Badge variant="outline" className="text-xs text-gray-500 dark:text-gray-400">
                  +{Object.values(persona.interests).flat().length - 6} autres
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Communication */}
      {!isCompact && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Communication</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-green-50/50 dark:bg-green-900/20 rounded-lg">
              <span className="text-xs font-medium text-green-700 dark:text-green-300">Canaux préférés</span>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {formatList(persona.communication.preferredChannels, 2)}
              </p>
            </div>
            <div className="p-3 bg-green-50/50 dark:bg-green-900/20 rounded-lg">
              <span className="text-xs font-medium text-green-700 dark:text-green-300">Ton de communication</span>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {persona.communication.tone}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant pour les métriques (personas enrichis uniquement)
function PersonaMetrics({ 
  persona, 
  onValidate 
}: { 
  persona: EnhancedPersona; 
  onValidate?: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {/* Complétude */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Complétude</span>
          </div>
            <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {Math.round(persona.validation_metrics.completeness_score * 100)}%
            </span>
          </div>
          <Progress 
            value={persona.validation_metrics.completeness_score * 100} 
            className="h-2"
          />
        </div>

        {/* Cohérence */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-semibold text-green-700 dark:text-green-300">Cohérence</span>
          </div>
            <span className="text-lg font-bold text-green-700 dark:text-green-300">
              {Math.round(persona.validation_metrics.consistency_score * 100)}%
            </span>
          </div>
          <Progress 
            value={persona.validation_metrics.consistency_score * 100} 
            className="h-2"
          />
        </div>

        {/* Réalisme */}
        <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Réalisme</span>
          </div>
            <span className="text-lg font-bold text-purple-700 dark:text-purple-300">
              {Math.round(persona.validation_metrics.realism_score * 100)}%
            </span>
          </div>
          <Progress 
            value={persona.validation_metrics.realism_score * 100} 
            className="h-2"
          />
        </div>
      </div>

      {/* Sources de données */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sources de données</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {persona.generation_metadata.data_sources.map((source, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {source}
            </Badge>
          ))}
        </div>
      </div>

      {onValidate && (
        <Button variant="outline" onClick={onValidate} className="w-full hover-lift">
          <BarChart3 className="h-4 w-4 mr-2" />
          Revalider ce persona
        </Button>
      )}
    </div>
  );
}

// Composant pour les métriques de performance (personas enrichis uniquement)
function PersonaPerformance({ 
  persona, 
  performanceScore 
}: { 
  persona: EnhancedPersona; 
  performanceScore: number;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        {/* Temps de génération total */}
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Temps total</span>
          </div>
            <span className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
            {persona.generation_metadata.total_processing_time}ms
          </span>
          </div>
        </div>

        {/* Temps Gemini */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-semibold text-green-700 dark:text-green-300">Gemini API</span>
          </div>
            <span className="text-lg font-bold text-green-700 dark:text-green-300">
            {persona.generation_metadata.gemini_response_time}ms
          </span>
          </div>
        </div>

        {/* Temps Qloo */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Qloo API</span>
          </div>
            <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
            {persona.generation_metadata.qloo_response_time}ms
          </span>
          </div>
        </div>
      </div>

      {/* Score de performance */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Score de performance</span>
          </div>
          <span className="text-lg font-bold text-purple-700 dark:text-purple-300">
            {Math.round(performanceScore)}%
          </span>
        </div>
        <Progress value={performanceScore} className="h-2 mb-3" />
        
        <p className="text-xs text-purple-600 dark:text-purple-400">
          {performanceScore > 80 ? '🚀 Excellente performance de génération' :
           performanceScore > 60 ? '👍 Bonne performance de génération' : 
           '⚠️ Performance de génération à améliorer'}
        </p>
      </div>
    </div>
  );
}
