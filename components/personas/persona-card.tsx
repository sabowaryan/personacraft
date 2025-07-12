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
  Shield
} from 'lucide-react';
import { Persona, EnhancedPersona } from '@/lib/types/persona';
import { formatDate, formatAge, formatList, truncateText } from '@/lib/utils/formatting';

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

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 group">
      <CardHeader className={isCompact ? "pb-3" : "pb-4"}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className={isCompact ? "h-10 w-10" : "h-12 w-12"}>
              <AvatarImage src={persona.avatar} alt={persona.name} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-teal-500 text-white font-semibold">
                {persona.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className={isCompact ? "text-lg" : "text-xl"}>{persona.name}</CardTitle>
              <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatAge(persona.age)}</span>
                </div>
                {persona.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{persona.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Badge de confiance pour les personas enrichis */}
            {isEnhanced && (
              <Badge variant={getConfidenceBadgeVariant(persona.generation_metadata.confidence_level)}>
                {persona.generation_metadata.confidence_level === 'high' ? 'Haute' :
                 persona.generation_metadata.confidence_level === 'medium' ? 'Moyenne' : 'Faible'} confiance
              </Badge>
            )}
            
            {showMetadata && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{formatDate(persona.generatedAt, 'relative')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Score global de qualité pour les personas enrichis */}
        {isEnhanced && showMetrics && !isCompact && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Qualité globale</span>
              <span className="text-sm font-bold text-gray-900">{overallQuality}%</span>
            </div>
            <Progress value={overallQuality} className="h-2" />
            
            <div className="flex items-center mt-2 space-x-2">
              {persona.validation_metrics.quality_indicators.map((indicator, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                  {indicator}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contenu avec onglets pour les personas enrichis en vue détaillée */}
        {isEnhanced && isDetailed && (showMetrics || showPerformance) ? (
          <Tabs value={activeTab} onValueChange={setActiveTab as any} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Aperçu</TabsTrigger>
              {showMetrics && <TabsTrigger value="metrics">Métriques</TabsTrigger>}
              {showPerformance && <TabsTrigger value="performance">Performance</TabsTrigger>}
            </TabsList>

            {/* Onglet Aperçu */}
            <TabsContent value="overview" className="space-y-4">
              <PersonaOverview persona={persona} isCompact={isCompact} />
            </TabsContent>

            {/* Onglet Métriques */}
            {showMetrics && (
              <TabsContent value="metrics" className="space-y-4">
                <PersonaMetrics persona={persona as EnhancedPersona} onValidate={onValidate} />
              </TabsContent>
            )}

            {/* Onglet Performance */}
            {showPerformance && (
              <TabsContent value="performance" className="space-y-4">
                <PersonaPerformance persona={persona as EnhancedPersona} performanceScore={performanceScore} />
              </TabsContent>
            )}
          </Tabs>
        ) : (
          /* Vue simplifiée pour tous les personas */
          <PersonaOverview persona={persona} isCompact={isCompact} isDetailed={isDetailed} />
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            {onView && (
              <Button variant="outline" size="sm" onClick={onView}>
                <Eye className="h-4 w-4 mr-1" />
                Voir
              </Button>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            )}
            {onRegenerate && (
              <Button variant="outline" size="sm" onClick={onRegenerate}>
                <Zap className="h-4 w-4 mr-1" />
                Régénérer
              </Button>
            )}
          </div>
          
          {showMetadata && (
            <div className="text-xs text-gray-500">
              Sources: {formatList(persona.sources, 2, "+")}
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
  return (
    <>
      {/* Bio */}
      <div>
        <p className="text-gray-700 leading-relaxed">
          {isCompact ? truncateText(persona.bio, 120) : persona.bio}
        </p>
      </div>

      {/* Citation */}
      {!isCompact && persona.quote && (
        <div className="bg-gradient-to-r from-indigo-50 to-teal-50 p-3 rounded-lg border-l-3 border-indigo-400">
          <Quote className="h-4 w-4 text-indigo-600 mb-2" />
          <p className="text-sm italic text-gray-700">"{persona.quote}"</p>
        </div>
      )}

      {/* Valeurs */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Heart className="h-4 w-4 text-red-500" />
          <span className="text-sm font-medium text-gray-700">Valeurs</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {persona.values.slice(0, isCompact ? 3 : undefined).map((value) => (
            <Badge key={value} variant="secondary" className="text-xs">
              {value}
            </Badge>
          ))}
          {isCompact && persona.values.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{persona.values.length - 3}
            </Badge>
          )}
        </div>
      </div>

      {/* Centres d'intérêt */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Target className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700">Intérêts principaux</span>
        </div>
        <div className="space-y-1">
          {isDetailed ? (
            // Vue détaillée avec toutes les catégories
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium text-gray-600">Musique:</span>
                <p className="text-gray-700">{formatList(persona.interests.music, 2)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Marques:</span>
                <p className="text-gray-700">{formatList(persona.interests.brands, 2)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Films:</span>
                <p className="text-gray-700">{formatList(persona.interests.movies, 2)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Cuisine:</span>
                <p className="text-gray-700">{formatList(persona.interests.food, 2)}</p>
              </div>
            </div>
          ) : (
            // Vue simplifiée avec badges
            <div className="flex flex-wrap gap-1">
              {[
                ...persona.interests.music.slice(0, 2),
                ...persona.interests.brands.slice(0, 1),
                ...persona.interests.lifestyle.slice(0, 1)
              ].slice(0, isCompact ? 3 : 4).map((interest, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {interest}
                </Badge>
              ))}
              {!isCompact && (
                <Badge variant="outline" className="text-xs text-gray-500">
                  +{Object.values(persona.interests).flat().length - 4} autres
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Communication */}
      {!isCompact && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-gray-700">Communication</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-medium text-gray-600">Canaux:</span>
              <p className="text-gray-700">{formatList(persona.communication.preferredChannels, 2)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Ton:</span>
              <p className="text-gray-700">{persona.communication.tone}</p>
            </div>
          </div>
        </div>
      )}
    </>
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
    <div className="space-y-4">
      <div className="space-y-3">
        {/* Complétude */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Complétude</span>
          </div>
          <div className="flex items-center space-x-2">
            <Progress 
              value={persona.validation_metrics.completeness_score * 100} 
              className="w-16 h-2" 
            />
            <span className="text-sm font-medium">
              {Math.round(persona.validation_metrics.completeness_score * 100)}%
            </span>
          </div>
        </div>

        {/* Cohérence */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-green-500" />
            <span className="text-sm">Cohérence</span>
          </div>
          <div className="flex items-center space-x-2">
            <Progress 
              value={persona.validation_metrics.consistency_score * 100} 
              className="w-16 h-2" 
            />
            <span className="text-sm font-medium">
              {Math.round(persona.validation_metrics.consistency_score * 100)}%
            </span>
          </div>
        </div>

        {/* Réalisme */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-purple-500" />
            <span className="text-sm">Réalisme</span>
          </div>
          <div className="flex items-center space-x-2">
            <Progress 
              value={persona.validation_metrics.realism_score * 100} 
              className="w-16 h-2" 
            />
            <span className="text-sm font-medium">
              {Math.round(persona.validation_metrics.realism_score * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Sources de données */}
      <div className="pt-2 border-t">
        <p className="text-xs text-gray-500 mb-2">Sources de données :</p>
        <div className="flex flex-wrap gap-1">
          {persona.generation_metadata.data_sources.map((source, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {source}
            </Badge>
          ))}
        </div>
      </div>

      {onValidate && (
        <Button variant="outline" onClick={onValidate} className="w-full">
          <BarChart3 className="h-4 w-4 mr-2" />
          Revalider
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
    <div className="space-y-4">
      <div className="space-y-3">
        {/* Temps de génération total */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-indigo-500" />
            <span className="text-sm">Temps total</span>
          </div>
          <span className="text-sm font-medium">
            {persona.generation_metadata.total_processing_time}ms
          </span>
        </div>

        {/* Temps Gemini */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-green-500" />
            <span className="text-sm">Gemini API</span>
          </div>
          <span className="text-sm font-medium">
            {persona.generation_metadata.gemini_response_time}ms
          </span>
        </div>

        {/* Temps Qloo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Qloo API</span>
          </div>
          <span className="text-sm font-medium">
            {persona.generation_metadata.qloo_response_time}ms
          </span>
        </div>
      </div>

      {/* Score de performance */}
      <div className="pt-2 border-t">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Score de performance</span>
          <span className="text-sm font-bold">{Math.round(performanceScore)}%</span>
        </div>
        <Progress value={performanceScore} className="h-2" />
        
        <p className="text-xs text-gray-500 mt-2">
          {performanceScore > 80 ? 'Excellente performance' :
           performanceScore > 60 ? 'Bonne performance' : 
           'Performance à améliorer'}
        </p>
      </div>
    </div>
  );
}
