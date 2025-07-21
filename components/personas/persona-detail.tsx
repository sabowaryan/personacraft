'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetricCard } from '@/components/ui/metric-card';
import { ModernStatCard, AnimatedProgress, ModernBadge, CircularScore } from '@/components/ui/modern-elements';

import { 
  ArrowLeft, 
  Download, 
  Share2, 
  MapPin, 
  Calendar, 
  Quote,
  Heart,
  MessageCircle,
  Target,
  ShoppingBag,
  Music,
  Film,
  Book,
  Coffee,
  Smartphone,
  TrendingUp,
  Users,
  Clock,
  Star,
  Sparkles,
  Award,
  Zap,
  Eye,
  BarChart3,
  Activity,
  Gauge,
  Shield,
  Lightbulb,
  ChevronRight,
  ExternalLink,
  Copy,
  CheckCircle,
  AlertCircle,
  Info,
  Brain,
  ArrowRight
} from 'lucide-react';
import { Persona } from '@/lib/types/persona';
import { PersonaExport } from './persona-export';
import { cn } from '@/lib/utils';

interface PersonaDetailProps {
  persona: Persona;
  onBack: () => void;
}

export function PersonaDetail({ persona, onBack }: PersonaDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedId, setCopiedId] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      music: Music,
      movies: Film,
      books: Book,
      food: Coffee,
      brands: Star,
      lifestyle: TrendingUp
    };
    const Icon = icons[category as keyof typeof icons] || Star;
    return <Icon className="h-4 w-4" />;
  };

  const getChannelIcon = (channel: string) => {
    const icons = {
      'Instagram': '📸',
      'TikTok': '🎵',
      'LinkedIn': '💼',
      'YouTube': '📺',
      'Podcasts': '🎧',
      'Email': '📧',
      'Facebook': '👥',
      'Twitter': '🐦'
    };
    return icons[channel as keyof typeof icons] || '📱';
  };

  const copyPersonaId = async () => {
    try {
      await navigator.clipboard.writeText(persona.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Conteneur principal avec padding-top suffisant pour éviter le chevauchement navbar */}
      <div className="w-full pt-20 sm:pt-24 lg:pt-28 pb-12">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8">
        
        {/* Header avec navigation et actions - Amélioré pour responsivité */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={onBack} 
              className="flex items-center gap-2 hover-lift transition-all duration-300 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 text-gray-700 dark:text-gray-200 hover:text-primary-700 dark:hover:text-primary-300"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium">Retour à la liste</span>
            </Button>
            
            <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-600" />
            
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Eye className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <span className="font-medium">Vue détaillée</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button 
              variant="outline" 
              size="sm"
              onClick={copyPersonaId}
              className="flex items-center gap-2 hover-lift transition-all duration-300 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
            >
              {copiedId ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-green-600 dark:text-green-400 font-medium">Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span className="font-medium">Copier ID</span>
                </>
              )}
            </Button>
            <PersonaExport persona={persona} />
          </div>
        </div>

        {/* En-tête du persona avec design moderne et responsive */}
        <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 transition-all duration-300 hover:shadow-3xl">
          <div className="relative">
            {/* Bannière de fond responsive */}
            <div 
              role="banner" 
              aria-label="Bannière de persona" 
              className="h-32 sm:h-40 md:h-48 lg:h-56 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-600 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-secondary-600/20" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
            </div>
            
            {/* Contenu de l'en-tête responsive */}
            <CardContent className="relative pt-0 p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6 lg:gap-8 -mt-16 sm:-mt-20 md:-mt-24 lg:-mt-28">
                
                {/* Avatar avec design moderne responsive */}
                <div className="relative flex-shrink-0">
                  <Avatar className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 border-4 border-white dark:border-gray-800 shadow-2xl ring-4 ring-primary-500/20 dark:ring-primary-400/20 transition-transform duration-300 hover:scale-105">
                    <AvatarImage src={persona.avatar} alt={persona.name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white text-xl sm:text-2xl md:text-3xl font-bold">
                      {getInitials(persona.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center">
                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                </div>
                
                {/* Informations principales responsive */}
                <div className="flex-1 space-y-4 lg:space-y-6 w-full">
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                      {persona.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 rounded-full backdrop-blur-sm border border-white/20 dark:border-gray-700/20">
                        <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                        <span className="font-medium text-sm">{persona.age} ans</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 rounded-full backdrop-blur-sm border border-white/20 dark:border-gray-700/20">
                        <MapPin className="h-4 w-4 text-secondary-600 dark:text-secondary-400" />
                        <span className="font-medium text-sm">{persona.location}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 rounded-full backdrop-blur-sm border border-white/20 dark:border-gray-700/20">
                        <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <span className="font-medium text-sm">
                          {new Date(persona.generatedAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Citation mise en valeur responsive */}
                  <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/30 dark:to-secondary-900/30 p-4 sm:p-6 lg:p-8 rounded-xl border border-primary-200/50 dark:border-primary-700/50 transition-all duration-300 hover:shadow-lg">
                    <div className="flex items-start gap-3 lg:gap-4">
                      <Quote className="h-6 w-6 lg:h-8 lg:w-8 text-primary-600 dark:text-primary-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-base sm:text-lg lg:text-xl italic text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                          "{persona.quote}"
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 font-medium">
                          — Citation personnelle
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Métriques rapides responsive et accessibles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Carte Valeurs */}
          <Card className="group border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg bg-white dark:bg-gray-800 transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      {persona.values.length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Valeurs</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="h-full bg-blue-500 dark:bg-blue-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(Math.min((persona.values.length / 6) * 100, 100), 5)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Carte Intérêts */}
          <Card className="group border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg bg-white dark:bg-gray-800 transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <Heart className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      {Object.values(persona.interests).flat().length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Intérêts</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="h-full bg-green-500 dark:bg-green-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(Math.min((Object.values(persona.interests).flat().length / 25) * 100, 100), 5)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Carte Canaux */}
          <Card className="group border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg bg-white dark:bg-gray-800 transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      {persona.communication.preferredChannels.length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Canaux</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="h-full bg-purple-500 dark:bg-purple-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(Math.min((persona.communication.preferredChannels.length / 6) * 100, 100), 5)}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Carte Points clés */}
          <Card className="group border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg bg-white dark:bg-gray-800 transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                    <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      {persona.marketing.painPoints.length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Points clés</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="h-full bg-amber-500 dark:bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(Math.min((persona.marketing.painPoints.length / 5) * 100, 100), 5)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets de contenu avec design moderne et responsive */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Navigation des onglets - Style Notion */}
            <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <TabsList className="w-full bg-transparent border-0 p-1 gap-0 justify-start">
                <TabsTrigger 
                  value="overview" 
                  className="relative px-6 py-3 text-sm font-medium transition-all duration-200 bg-transparent border-0 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Profil
                </TabsTrigger>
                <TabsTrigger 
                  value="interests" 
                  className="relative px-6 py-3 text-sm font-medium transition-all duration-200 bg-transparent border-0 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Intérêts
                </TabsTrigger>
                <TabsTrigger 
                  value="communication" 
                  className="relative px-6 py-3 text-sm font-medium transition-all duration-200 bg-transparent border-0 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Communication
                </TabsTrigger>
                <TabsTrigger 
                  value="marketing" 
                  className="relative px-6 py-3 text-sm font-medium transition-all duration-200 bg-transparent border-0 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Marketing
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Contenu des onglets */}
            <div className="p-8">
              {/* Onglet Profil - Design épuré */}
              <TabsContent value="overview" className="space-y-8 mt-0">
                {/* Biographie principale */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">À propos</h3>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                      {persona.bio}
                    </p>
                  </div>
                </div>

                {/* Citation mise en valeur */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Quote className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Citation personnelle</h3>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border-l-4 border-purple-400 dark:border-purple-500">
                    <p className="text-gray-800 dark:text-gray-200 italic font-medium text-lg leading-relaxed">
                      "{persona.quote}"
                    </p>
                  </div>
                </div>

                {/* Valeurs fondamentales */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Valeurs fondamentales</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {persona.values.map((value, index) => (
                      <div key={value} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">{value}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            {90 - index * 10}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 dark:bg-green-400 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${90 - index * 10}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Onglet Intérêts - Design en grille moderne */}
              <TabsContent value="interests" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Object.entries(persona.interests).map(([category, items]) => (
                    <div key={category} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-all duration-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                          {getCategoryIcon(category)}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{category}</h3>
                      </div>
                      <div className="space-y-2">
                        {items.map((item: string, index: number) => (
                          <div key={item} className="flex items-center justify-between py-2 px-3 bg-white dark:bg-gray-700 rounded-lg">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item}</span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={cn(
                                    "h-3 w-3",
                                    i < 4 - index ? "text-yellow-500 fill-current" : "text-gray-300 dark:text-gray-600"
                                  )} 
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Onglet Communication - Design unifié */}
              <TabsContent value="communication" className="space-y-8 mt-0">
                {/* Canaux de communication */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Canaux préférés</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {persona.communication.preferredChannels.map((channel, index) => (
                      <div key={channel} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{getChannelIcon(channel)}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{channel}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                            <div 
                              className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${90 - index * 10}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {90 - index * 10}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Style de communication */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Style de communication</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ton de communication</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200">
                          {persona.communication.tone}
                        </Badge>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fréquence</span>
                        <Badge variant="outline" className="border-green-300 text-green-700 dark:border-green-600 dark:text-green-300">
                          {persona.communication.frequency}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Types de contenu */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Préférences de contenu</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {persona.communication.contentTypes.map((type, index) => (
                      <div key={type} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">{type}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            {85 - index * 15}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-purple-500 dark:bg-purple-400 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${85 - index * 15}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Onglet Marketing - Design structuré */}
              <TabsContent value="marketing" className="space-y-8 mt-0">
                {/* Points de douleur */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Points de douleur</h3>
                  </div>
                  <div className="space-y-3">
                    {persona.marketing.painPoints.map((point, index) => (
                      <div key={point} className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border-l-4 border-red-400 dark:border-red-500">
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{point}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Motivations */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Motivations</h3>
                  </div>
                  <div className="space-y-3">
                    {persona.marketing.motivations.map((motivation, index) => (
                      <div key={motivation} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-l-4 border-green-400 dark:border-green-500">
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{motivation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comportement d'achat et influences */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <ShoppingBag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Comportement d'achat</h3>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6">
                      <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                        {persona.marketing.buyingBehavior}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Sources d'influence</h3>
                    </div>
                    <div className="space-y-3">
                      {persona.marketing.influences.map((influence, index) => (
                        <div key={influence} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{influence}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-orange-500 dark:bg-orange-400 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${80 - index * 15}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium w-8">
                                {80 - index * 15}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
        </div>
      </div>
    </div>
  );
}
