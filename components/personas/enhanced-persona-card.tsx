'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  MapPin, 
  Quote,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Clock,
  Zap,
  Target,
  TrendingUp,
  Activity,
  Shield
} from 'lucide-react';

// Import du type enrichi
interface EnhancedPersona {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  quote: string;
  avatar?: string;
  
  // Métriques de validation
  validation_metrics: {
    completeness_score: number;
    consistency_score: number;
    realism_score: number;
    quality_indicators: string[];
  };
  
  // Métadonnées de génération
  generation_metadata: {
    gemini_response_time: number;
    qloo_response_time: number;
    total_processing_time: number;
    confidence_level: 'low' | 'medium' | 'high';
    data_sources: string[];
  };
}

interface EnhancedPersonaCardProps {
  persona: EnhancedPersona;
  onView: () => void;
  onRegenerate?: () => void;
  onValidate?: () => void;
  showMetrics?: boolean;
  showPerformance?: boolean;
}

export function EnhancedPersonaCard({ 
  persona, 
  onView, 
  onRegenerate,
  onValidate,
  showMetrics = true,
  showPerformance = false 
}: EnhancedPersonaCardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'performance'>('overview');
  
  // Calculer le score global de qualité
  const overallQuality = Math.round(
    (persona.validation_metrics.completeness_score + 
     persona.validation_metrics.consistency_score + 
     persona.validation_metrics.realism_score) / 3 * 100
  );

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
  const performanceScore = Math.max(0, 100 - (persona.generation_metadata.total_processing_time / 100));

  return (
    <Card className="w-full max-w-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={persona.avatar} alt={persona.name} />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            
            <div>
              <CardTitle className="text-lg font-semibold">{persona.name}</CardTitle>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                {persona.age} ans, {persona.location}
              </div>
            </div>
          </div>

          {/* Badge de confiance */}
          <Badge variant={getConfidenceBadgeVariant(persona.generation_metadata.confidence_level)}>
            {persona.generation_metadata.confidence_level === 'high' ? 'Haute' :
             persona.generation_metadata.confidence_level === 'medium' ? 'Moyenne' : 'Faible'} confiance
          </Badge>
        </div>

        {/* Score global de qualité */}
        {showMetrics && (
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

      <CardContent className="pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab as any} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            {showMetrics && <TabsTrigger value="metrics">Métriques</TabsTrigger>}
            {showPerformance && <TabsTrigger value="performance">Performance</TabsTrigger>}
          </TabsList>

          {/* Onglet Aperçu */}
          <TabsContent value="overview" className="space-y-4">
            <div className="text-sm text-gray-700 line-clamp-3">
              {persona.bio}
            </div>
            
            {persona.quote && (
              <div className="border-l-4 border-indigo-200 pl-4 py-2">
                <Quote className="h-4 w-4 text-indigo-400 mb-1" />
                <p className="text-sm italic text-gray-600">"{persona.quote}"</p>
              </div>
            )}

            <div className="flex space-x-2">
              <Button onClick={onView} className="flex-1">
                Voir en détail
              </Button>
              {onRegenerate && (
                <Button variant="outline" onClick={onRegenerate}>
                  <Zap className="h-4 w-4" />
                </Button>
              )}
            </div>
          </TabsContent>

          {/* Onglet Métriques */}
          {showMetrics && (
            <TabsContent value="metrics" className="space-y-4">
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
            </TabsContent>
          )}

          {/* Onglet Performance */}
          {showPerformance && (
            <TabsContent value="performance" className="space-y-4">
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
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
} 