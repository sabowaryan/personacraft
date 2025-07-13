'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
  Info
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
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header avec navigation et actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={onBack} 
            className="flex items-center gap-2 hover-lift transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour à la liste</span>
          </Button>
          <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-600" />
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Eye className="h-4 w-4" />
            <span>Vue détaillée</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={copyPersonaId}
            className="flex items-center gap-2 hover-lift"
          >
            {copiedId ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Copié !</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copier ID</span>
              </>
            )}
          </Button>
          <PersonaExport persona={persona} />
        </div>
      </div>

      {/* En-tête du persona avec design moderne */}
      <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <div className="relative">
          {/* Bannière de fond */}
          <div className="h-48 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 to-secondary-600/20" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
          </div>
          
          {/* Contenu de l'en-tête */}
          <CardContent className="relative pt-0">
            <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6 -mt-20">
              {/* Avatar avec design moderne */}
              <div className="relative">
                <Avatar className="w-40 h-40 border-4 border-white dark:border-gray-800 shadow-2xl ring-4 ring-primary-500/20 dark:ring-primary-400/20">
                  <AvatarImage src={persona.avatar} alt={persona.name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white text-3xl font-bold">
                    {getInitials(persona.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              </div>
              
              {/* Informations principales */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {persona.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full backdrop-blur-sm">
                      <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      <span className="font-medium">{persona.age} ans</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full backdrop-blur-sm">
                      <MapPin className="h-4 w-4 text-secondary-600 dark:text-secondary-400" />
                      <span className="font-medium">{persona.location}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full backdrop-blur-sm">
                      <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      <span className="font-medium">
                        {new Date(persona.generatedAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Citation mise en valeur */}
                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/30 dark:to-secondary-900/30 p-6 rounded-xl border border-primary-200/50 dark:border-primary-700/50">
                  <div className="flex items-start gap-3">
                    <Quote className="h-6 w-6 text-primary-600 dark:text-primary-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-lg italic text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                        "{persona.quote}"
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
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

      {/* Métriques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {persona.values.length}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">Valeurs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-lg">
                <Heart className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {Object.values(persona.interests).flat().length}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">Intérêts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-800/50 rounded-lg">
                <MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {persona.communication.preferredChannels.length}
                </p>
                <p className="text-sm text-purple-600 dark:text-purple-400">Canaux</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-800/50 rounded-lg">
                <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {persona.marketing.painPoints.length}
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400">Points clés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets de contenu avec design moderne */}
      <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <TabsList className="grid w-full grid-cols-4 h-16 bg-transparent border-0">
                <TabsTrigger 
                  value="overview" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary-50 dark:data-[state=active]:bg-primary-900/30 data-[state=active]:text-primary-700 dark:data-[state=active]:text-primary-300"
                >
                  <Users className="h-4 w-4" />
                  <span>Vue d'ensemble</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="interests" 
                  className="flex items-center gap-2 data-[state=active]:bg-green-50 dark:data-[state=active]:bg-green-900/30 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-300"
                >
                  <Heart className="h-4 w-4" />
                  <span>Intérêts</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="communication" 
                  className="flex items-center gap-2 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/30 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Communication</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="marketing" 
                  className="flex items-center gap-2 data-[state=active]:bg-purple-50 dark:data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-300"
                >
                  <Target className="h-4 w-4" />
                  <span>Marketing</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              {/* Vue d'ensemble */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2 border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <Sparkles className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        Biographie
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                        {persona.bio}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-primary-700 dark:text-primary-300">
                        <Award className="h-5 w-5" />
                        <span>Valeurs fondamentales</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {persona.values.map((value, index) => (
                          <div key={value} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-primary-800 dark:text-primary-200">
                                {value}
                              </span>
                              <span className="text-xs text-primary-600 dark:text-primary-400">
                                {90 - index * 10}%
                              </span>
                            </div>
                            <Progress 
                              value={90 - index * 10} 
                              className="h-2 bg-primary-200 dark:bg-primary-800"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <Smartphone className="h-5 w-5" />
                        <span>Canaux préférés</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {persona.communication.preferredChannels.map((channel, index) => (
                          <div key={channel} className="flex items-center gap-3 p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                            <span className="text-lg">{getChannelIcon(channel)}</span>
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                              {channel}
                            </span>
                            <div className="ml-auto">
                              <Badge variant="outline" className="text-xs">
                                {90 - index * 10}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                        <MessageCircle className="h-5 w-5" />
                        <span>Style de communication</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm font-medium text-green-800 dark:text-green-200">Ton:</span>
                          <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200">
                            {persona.communication.tone}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-green-800 dark:text-green-200">Fréquence:</span>
                          <Badge variant="outline" className="ml-2 border-green-300 text-green-700 dark:border-green-600 dark:text-green-300">
                            {persona.communication.frequency}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                        <ShoppingBag className="h-5 w-5" />
                        <span>Comportement d'achat</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed">
                        {persona.marketing.buyingBehavior}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Intérêts détaillés */}
              <TabsContent value="interests" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(persona.interests).map(([category, items]) => (
                    <Card key={category} className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover-lift">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300 capitalize">
                          {getCategoryIcon(category)}
                          <span>{category}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {items.map((item: string, index: number) => (
                            <div key={item} className="flex items-center justify-between p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                {item}
                              </span>
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Communication */}
              <TabsContent value="communication" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <BarChart3 className="h-5 w-5" />
                        <span>Préférences de contenu</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {persona.communication.contentTypes.map((type, index) => (
                          <div key={type} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-blue-800 dark:text-blue-200">{type}</span>
                              <span className="text-sm text-blue-600 dark:text-blue-400">{85 - index * 15}%</span>
                            </div>
                            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                              <div 
                                className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${85 - index * 15}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                        <Activity className="h-5 w-5" />
                        <span>Analyse des canaux</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {persona.communication.preferredChannels.map((channel, index) => (
                          <div key={channel} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{getChannelIcon(channel)}</span>
                                <span className="font-medium text-indigo-800 dark:text-indigo-200">{channel}</span>
                              </div>
                              <span className="text-sm text-indigo-600 dark:text-indigo-400">{90 - index * 10}%</span>
                            </div>
                            <div className="w-full bg-indigo-200 dark:bg-indigo-800 rounded-full h-2">
                              <div 
                                className="bg-indigo-600 dark:bg-indigo-400 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${90 - index * 10}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-teal-700 dark:text-teal-300">
                      <Lightbulb className="h-5 w-5" />
                      <span>Recommandations de contenu</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-teal-800 dark:text-teal-200">Formats recommandés</h4>
                        <div className="flex flex-wrap gap-2">
                          {persona.communication.contentTypes.map(type => (
                            <Badge key={type} variant="default" className="bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-200">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-teal-800 dark:text-teal-200">Fréquence optimale</h4>
                        <Badge variant="outline" className="text-sm border-teal-300 text-teal-700 dark:border-teal-600 dark:text-teal-300">
                          {persona.communication.frequency}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Marketing */}
              <TabsContent value="marketing" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                        <AlertCircle className="h-5 w-5" />
                        <span>Points de douleur</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {persona.marketing.painPoints.map((point, index) => (
                          <div key={point} className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border-l-4 border-red-300 dark:border-red-600">
                            <span className="text-red-600 dark:text-red-400 font-bold text-sm bg-red-100 dark:bg-red-800/50 rounded-full w-6 h-6 flex items-center justify-center">
                              {index + 1}
                            </span>
                            <p className="text-sm text-red-800 dark:text-red-200 leading-relaxed">{point}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                        <Zap className="h-5 w-5" />
                        <span>Motivations</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {persona.marketing.motivations.map((motivation, index) => (
                          <div key={motivation} className="flex items-start gap-3 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border-l-4 border-green-300 dark:border-green-600">
                            <span className="text-green-600 dark:text-green-400 font-bold text-sm bg-green-100 dark:bg-green-800/50 rounded-full w-6 h-6 flex items-center justify-center">
                              {index + 1}
                            </span>
                            <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">{motivation}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                      <TrendingUp className="h-5 w-5" />
                      <span>Influences et comportement d'achat</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-purple-800 dark:text-purple-200">Sources d'influence</h4>
                        <div className="space-y-2">
                          {persona.marketing.influences.map((influence, index) => (
                            <div key={influence} className="flex items-center justify-between p-2 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                              <span className="text-sm text-purple-800 dark:text-purple-200">{influence}</span>
                              <div className="w-20 bg-purple-200 dark:bg-purple-800 rounded-full h-2">
                                <div 
                                  className="bg-purple-600 dark:bg-purple-400 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${80 - index * 15}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 text-purple-800 dark:text-purple-200">Comportement d'achat</h4>
                        <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed">
                          {persona.marketing.buyingBehavior}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                      <Shield className="h-5 w-5" />
                      <span>Stratégie marketing recommandée</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                        <Target className="h-8 w-8 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                        <h4 className="font-semibold text-sm text-primary-700 dark:text-primary-300">Ciblage</h4>
                        <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                          Focus sur {persona.values?.[0] || 'valeurs clés'} et {persona.communication.preferredChannels?.[0] || 'canaux préférés'}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                        <MessageCircle className="h-8 w-8 text-secondary-600 dark:text-secondary-400 mx-auto mb-2" />
                        <h4 className="font-semibold text-sm text-secondary-700 dark:text-secondary-300">Message</h4>
                        <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-1">
                          Ton {persona.communication.tone?.toLowerCase() || 'personnalisé'}, contenu {persona.communication.contentTypes?.[0]?.toLowerCase() || 'adapté'}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                        <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
                        <h4 className="font-semibold text-sm text-amber-700 dark:text-amber-300">Timing</h4>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          Communication {persona.communication.frequency?.toLowerCase() || 'optimale'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Métadonnées et informations techniques */}
      <Card className="border-0 shadow-lg bg-gray-50 dark:bg-gray-800/50">
        <CardHeader>
          <CardTitle className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span>Métadonnées de génération</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>ID: {persona.id.slice(0, 8)}...</span>
              <span>Généré le: {persona.generatedAt.toLocaleString('fr-FR')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Sources: {persona.sources.join(', ')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
