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
  Gauge,
  Music,
  Film,
  Book,
  Coffee,
  ShoppingBag,
  Smartphone,
  Info,
  Copy,
  ArrowRight
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
  const [copiedId, setCopiedId] = useState(false);
  
  const isCompact = variant === 'compact';
  const isDetailed = variant === 'detailed';
  const isEnhanced = 'validation_metrics' in persona;

  // 🐛 DEBUG: Logs pour identifier le problème
  console.log('🔍 PersonaCard Debug:', {
    name: persona.name,
    variant,
    isCompact,
    isDetailed,
    hasCommuncation: !!persona.communication,
    communicationData: persona.communication,
    hasMarketing: !!persona.marketing,
    marketingData: persona.marketing,
    hasInterests: !!persona.interests,
    interestsData: persona.interests
  });

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

  // Copier l'ID du persona
  const copyPersonaId = async () => {
    try {
      await navigator.clipboard.writeText(persona.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  // Obtenir l'icône de catégorie
  const getCategoryIcon = (category: string) => {
    const icons = {
      music: Music,
      movies: Film,
      books: Book,
      food: Coffee,
      brands: ShoppingBag,
      lifestyle: TrendingUp
    };
    const Icon = icons[category as keyof typeof icons] || Star;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <Card className={cn(
      "group h-full w-full max-w-md md:max-w-none mx-auto transition-all duration-300 border-0 shadow-lg glass-card relative overflow-hidden",
      "hover:shadow-xl hover:scale-[1.02] hover-lift",
      "bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80",
      "backdrop-blur-sm",
      "p-3 sm:p-4 md:p-6 lg:p-8",
      "persona-fade-in persona-animate-in"
    )}>
      {/* Effet de particules en arrière-plan amélioré */}
      <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-20 h-20 bg-primary-300 dark:bg-primary-600 rounded-full filter blur-xl animate-float-slow transform-gpu"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-secondary-300 dark:bg-secondary-600 rounded-full filter blur-xl animate-float transform-gpu"></div>
      </div>
      {/* Décoration de gradient en haut avec animation */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 persona-gradient-shimmer" />
      
      {/* En-tête redesigné avec animations */}
      <CardHeader className="pb-4 relative persona-animate-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative persona-scale-in">
              <Avatar className={cn(
                "ring-2 ring-white dark:ring-gray-800 shadow-lg transition-all duration-300 group-hover:scale-105",
                "bg-gradient-to-br from-primary-500 to-secondary-500",
                isCompact ? "h-10 w-10 sm:h-12 sm:w-12" : "h-14 w-14 sm:h-16 sm:w-16"
              )}>
              <AvatarImage src={persona.avatar} alt={persona.name} className="object-cover" />
                <AvatarFallback className="text-white font-bold text-base sm:text-lg bg-gradient-to-br from-primary-500 to-secondary-500">
                  {getInitials(persona.name)}
              </AvatarFallback>
            </Avatar>
              {/* Indicateur de statut avec animation */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 shadow-sm flex items-center justify-center animate-pulse">
                <CheckCircle className="h-3 w-3 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0 persona-slide-up persona-delay-1">
              <CardTitle className={cn(
                "text-gray-900 dark:text-white font-bold mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate persona-gradient-title",
                isCompact ? "text-base sm:text-lg" : "text-lg sm:text-xl"
              )}>
                {persona.name}
              </CardTitle>
              
              <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 persona-animate-in persona-delay-2">
                <div className="flex items-center gap-1 px-2 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors duration-300 hover:shadow-md">
                  <Calendar className="h-3 w-3 text-primary-600 dark:text-primary-400 animate-pulse" />
                  <span className="font-medium">{formatAge(persona.age)}</span>
                </div>
                {persona.location && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors duration-300 hover:shadow-md">
                    <MapPin className="h-3 w-3 text-secondary-600 dark:text-secondary-400" />
                    <span className="font-medium truncate max-w-[80px] md:max-w-none">{persona.location}</span>
                  </div>
                )}
                {showMetadata && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors duration-300 hover:shadow-md">
                    <Clock className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium">{formatDate(persona.generatedAt, 'relative')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Actions rapides avec animations */}
          <div className="flex items-center gap-2 mt-4 sm:mt-0 persona-animate-in persona-delay-3">
            <Button
              variant="ghost"
              size="sm"
              className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:scale-110 hover:shadow-md"
              onClick={() => setIsBookmarked(!isBookmarked)}
            >
              <Bookmark className={cn(
                "h-4 w-4 transition-all duration-300",
                isBookmarked ? "fill-current text-yellow-500 animate-bounce" : "text-gray-400 hover:text-yellow-500"
              )} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:scale-110 hover:shadow-md"
              onClick={copyPersonaId}
            >
              {copiedId ? (
                <CheckCircle className="h-4 w-4 text-green-600 animate-pulse" />
              ) : (
                <Copy className="h-4 w-4 text-gray-400 hover:text-primary-600" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:scale-110 hover:shadow-md"
            >
              <Share2 className="h-4 w-4 text-gray-400 hover:text-secondary-600" />
            </Button>
          </div>
        </div>

        {/* Badges de statut */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
            {isEnhanced && (
            <Badge 
              variant={getConfidenceBadgeVariant(persona.generation_metadata.confidence_level)} 
              className="text-xs persona-animate-in persona-delay-1 hover:scale-105 transition-transform duration-300"
            >
              {persona.generation_metadata.confidence_level === 'high' ? '🏆 Haute' :
               persona.generation_metadata.confidence_level === 'medium' ? '👍 Moyenne' : '⚠️ Faible'} confiance
            </Badge>
            )}
            
          <Badge 
            variant="outline" 
            className="text-xs bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-primary-200 dark:border-primary-700 persona-animate-in persona-delay-2 hover:scale-105 transition-transform duration-300"
          >
            <Sparkles className="h-3 w-3 mr-1 text-primary-600 dark:text-primary-400 animate-pulse" />
            IA Premium
          </Badge>
          
          {overallQuality > 0 && (
            <Badge 
              variant="secondary" 
              className="text-xs bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 persona-animate-in persona-delay-3 hover:scale-105 transition-transform duration-300"
            >
              <Star className="h-3 w-3 mr-1 text-green-600 dark:text-green-400" />
              {overallQuality}% qualité
            </Badge>
          )}
        </div>

        {/* Score global de qualité pour les personas enrichis */}
        {isEnhanced && showMetrics && !isCompact && (
          <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
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
                <Badge key={index} variant="outline" className="text-xs border-green-200 dark:border-green-700">
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

      <CardContent className="space-y-6 persona-animate-in persona-delay-4">
        {/* Contenu avec onglets pour les personas enrichis en vue détaillée */}
        {isEnhanced && isDetailed && (showMetrics || showPerformance) ? (
          <Tabs value={activeTab} onValueChange={setActiveTab as any} className="w-full">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm">
              <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-primary-50 dark:data-[state=active]:bg-primary-900/30 data-[state=active]:text-primary-700 dark:data-[state=active]:text-primary-300 transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                <Users className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                <span className="group-hover:translate-x-0.5 transition-transform duration-300">Aperçu</span>
              </TabsTrigger>
              {showMetrics && (
                <TabsTrigger value="metrics" className="flex items-center gap-2 data-[state=active]:bg-green-50 dark:data-[state=active]:bg-green-900/30 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-300 transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700 group">
                  <BarChart3 className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                  <span className="group-hover:translate-x-0.5 transition-transform duration-300">Métriques</span>
                </TabsTrigger>
              )}
              {showPerformance && (
                <TabsTrigger value="performance" className="flex items-center gap-2 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/30 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-700 group">
                  <Activity className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                  <span className="group-hover:translate-x-0.5 transition-transform duration-300">Performance</span>
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview" className="space-y-4 persona-fade-in">
              <PersonaOverview persona={persona} isCompact={isCompact} isDetailed={isDetailed} />
            </TabsContent>

            {showMetrics && (
              <TabsContent value="metrics" className="space-y-4 persona-fade-in">
                <PersonaMetrics persona={persona as EnhancedPersona} onValidate={onValidate} />
              </TabsContent>
            )}

            {showPerformance && (
              <TabsContent value="performance" className="space-y-4 persona-fade-in">
                <PersonaPerformance persona={persona as EnhancedPersona} performanceScore={performanceScore} />
              </TabsContent>
            )}
          </Tabs>
        ) : (
          <PersonaOverview persona={persona} isCompact={isCompact} isDetailed={isDetailed} />
        )}

        {/* Actions principales avec animations avancées */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 gap-2 sm:gap-0 persona-animate-in persona-delay-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {onView && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onView} 
                className="hover-lift bg-gradient-to-r from-white/90 to-white/70 dark:from-gray-800/90 dark:to-gray-800/70 backdrop-blur-sm w-full sm:w-auto persona-animate-in persona-delay-1 group transition-all duration-300 shadow-sm hover:shadow-md border-primary-100 dark:border-primary-800"
              >
                <Eye className="h-4 w-4 mr-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors group-hover:scale-110 transition-transform duration-300" />
                <span className="group-hover:translate-x-0.5 transition-transform duration-300 font-medium">Détails</span>
              </Button>
            )}
            {onExport && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onExport} 
                className="hover-lift bg-gradient-to-r from-white/90 to-white/70 dark:from-gray-800/90 dark:to-gray-800/70 backdrop-blur-sm w-full sm:w-auto persona-animate-in persona-delay-2 group transition-all duration-300 shadow-sm hover:shadow-md border-secondary-100 dark:border-secondary-800"
              >
                <Download className="h-4 w-4 mr-2 group-hover:text-secondary-600 dark:group-hover:text-secondary-400 transition-colors group-hover:scale-110 transition-transform duration-300" />
                <span className="group-hover:translate-x-0.5 transition-transform duration-300 font-medium">Export</span>
              </Button>
            )}
            {onRegenerate && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRegenerate} 
                className="hover-lift bg-gradient-to-r from-white/90 to-white/70 dark:from-gray-800/90 dark:to-gray-800/70 backdrop-blur-sm w-full sm:w-auto persona-animate-in persona-delay-3 group transition-all duration-300 shadow-sm hover:shadow-md border-yellow-100 dark:border-yellow-800"
              >
                <Zap className="h-4 w-4 mr-2 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors group-hover:scale-110 transition-transform duration-300" />
                <span className="group-hover:translate-x-0.5 transition-transform duration-300 font-medium">Régénérer</span>
              </Button>
            )}
          </div>
          
          {showMetadata && (
            <div className="flex flex-col sm:flex-row items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-2 sm:mt-0 break-all persona-animate-in persona-delay-4 bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded-full backdrop-blur-sm">
              <Layers className="h-3 w-3 animate-pulse text-primary-500 dark:text-primary-400" />
              <span className="truncate w-full sm:w-auto font-medium">Sources: {formatList(persona.sources, 2, "+")} APIs</span>
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
  
  
  
  // Obtenir l'icône de catégorie
  const getCategoryIcon = (category: string) => {
    const icons = {
      music: Music,
      movies: Film,
      books: Book,
      food: Coffee,
      brands: ShoppingBag,
      lifestyle: TrendingUp
    };
    const Icon = icons[category as keyof typeof icons] || Star;
    return <Icon className="h-4 w-4" />;
  };
  
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
              className="text-primary-600 dark:text-primary-400 text-sm hover:underline mt-2 flex items-center gap-1 transition-all duration-200"
            >
              {showFullBio ? 'Voir moins' : 'Voir plus'}
              <ChevronRight className={cn(
                "h-3 w-3 transition-transform duration-200",
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
            <Badge key={value} variant="secondary" className="text-xs hover-scale bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 text-red-700 dark:text-red-300" style={{ animationDelay: `${index * 50}ms` }}>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {Object.entries(persona.interests).map(([category, items]) => (
                <div key={category} className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700 flex flex-col items-center justify-center min-h-[56px]">
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(category)}
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-300 capitalize">{category}</span>
                  </div>
                  {items.length === 0 ? (
                    <Badge variant="outline" className="text-xs text-gray-400 border-gray-300 dark:border-gray-600 mx-auto">Aucun</Badge>
                  ) : (
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center">{formatList(items, 2)}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            // Vue simplifiée avec badges
            <div className="flex flex-wrap gap-2">
              {[
                ...persona.interests.music.slice(0, 2),
                ...persona.interests.brands.slice(0, 1),
                ...persona.interests.lifestyle.slice(0, 1)
              ].slice(0, isCompact ? 4 : 6).map((interest, index) => (
                <Badge key={index} variant="outline" className="text-xs hover-scale border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300" style={{ animationDelay: `${index * 50}ms` }}>
                  {interest}
                </Badge>
              ))}
              {Object.values(persona.interests).flat().length === 0 && (
                <Badge variant="outline" className="text-xs text-gray-400 border-gray-300 dark:border-gray-600 mx-auto">Aucun</Badge>
              )}
              {!isCompact && Object.values(persona.interests).flat().length > 6 && (
                <Badge variant="outline" className="text-xs text-gray-500 dark:text-gray-400">+{Object.values(persona.interests).flat().length - 6} autres</Badge>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-700 flex flex-col items-center justify-center min-h-[40px]">
              <span className="text-xs font-medium text-green-700 dark:text-green-300">Canaux préférés</span>
              {persona.communication.preferredChannels.length === 0 ? (
                <Badge variant="outline" className="text-xs text-gray-400 border-gray-300 dark:border-gray-600 mt-1">Aucun</Badge>
              ) : (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">{formatList(persona.communication.preferredChannels, 2)}</p>
              )}
            </div>
            <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-700 flex flex-col items-center justify-center min-h-[40px]">
              <span className="text-xs font-medium text-green-700 dark:text-green-300">Ton de communication</span>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">{persona.communication.tone || <Badge variant='outline' className='text-xs text-gray-400 border-gray-300 dark:border-gray-600'>Aucun</Badge>}</p>
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
        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700">
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
        <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700">
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
        <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-700">
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
      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sources de données</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {persona.generation_metadata.data_sources.map((source, index) => (
            <Badge key={index} variant="outline" className="text-xs border-gray-300 dark:border-gray-600">
              {source}
            </Badge>
          ))}
        </div>
      </div>

      {onValidate && (
        <Button variant="outline" onClick={onValidate} className="w-full hover-lift bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
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
        <div className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl border border-indigo-200 dark:border-indigo-700">
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
        <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700">
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
        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700">
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
      <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-700">
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
