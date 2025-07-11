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
  Star
} from 'lucide-react';
import { Persona } from '@/lib/types/persona';
import { PersonaExport } from './persona-export';

interface PersonaDetailProps {
  persona: Persona;
  onBack: () => void;
}

export function PersonaDetail({ persona, onBack }: PersonaDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header avec navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Retour à la liste</span>
        </Button>
        <PersonaExport persona={persona} />
      </div>

      {/* En-tête du persona */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-teal-500 h-32"></div>
        <CardContent className="relative pt-0">
          <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6 -mt-16">
            <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
              <AvatarImage src={persona.avatar} alt={persona.name} />
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-teal-500 text-white text-2xl">
                {getInitials(persona.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <h1 className="text-3xl font-bold">{persona.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <span className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{persona.age} ans</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{persona.location}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Généré le {persona.generatedAt.toLocaleDateString()}</span>
                </span>
              </div>
              
              <div className="bg-gradient-to-r from-indigo-50 to-teal-50 p-4 rounded-lg border-l-4 border-indigo-500 mt-4">
                <div className="flex items-start space-x-2">
                  <Quote className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <p className="italic text-gray-700 font-medium">"{persona.quote}"</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onglets de contenu */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Vue d'ensemble</span>
          </TabsTrigger>
          <TabsTrigger value="interests" className="flex items-center space-x-2">
            <Heart className="h-4 w-4" />
            <span>Intérêts</span>
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>Communication</span>
          </TabsTrigger>
          <TabsTrigger value="marketing" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Marketing</span>
          </TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Biographie</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{persona.bio}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Valeurs fondamentales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {persona.values.map((value, index) => (
                    <div key={value} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{value}</span>
                      <Progress value={90 - index * 10} className="w-20" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="h-5 w-5 text-purple-600" />
                  <span>Canaux préférés</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {persona.communication.preferredChannels.map(channel => (
                    <div key={channel} className="flex items-center space-x-2">
                      <span className="text-lg">{getChannelIcon(channel)}</span>
                      <span className="text-sm">{channel}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  <span>Style de communication</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium">Ton:</span>
                    <Badge variant="secondary" className="ml-2">{persona.communication.tone}</Badge>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Fréquence:</span>
                    <Badge variant="outline" className="ml-2">{persona.communication.frequency}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingBag className="h-5 w-5 text-green-600" />
                  <span>Comportement d'achat</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{persona.marketing.buyingBehavior}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Intérêts détaillés */}
        <TabsContent value="interests" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(persona.interests).map(([category, items]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 capitalize">
                    {getCategoryIcon(category)}
                    <span>{category}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {items.map((item, index) => (
                      <div key={item} className="flex items-center justify-between">
                        <span className="text-sm">{item}</span>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-3 w-3 ${i < 4 - index ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
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
            <Card>
              <CardHeader>
                <CardTitle>Préférences de contenu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {persona.communication.contentTypes.map((type, index) => (
                    <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{type}</span>
                      <Progress value={85 - index * 15} className="w-24" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Analyse des canaux</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {persona.communication.preferredChannels.map((channel, index) => (
                    <div key={channel} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getChannelIcon(channel)}</span>
                          <span className="font-medium">{channel}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{90 - index * 10}%</span>
                      </div>
                      <Progress value={90 - index * 10} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recommandations de contenu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Formats recommandés</h4>
                  <div className="flex flex-wrap gap-2">
                    {persona.communication.contentTypes.map(type => (
                      <Badge key={type} variant="default">{type}</Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Fréquence optimale</h4>
                  <Badge variant="outline" className="text-sm">{persona.communication.frequency}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Marketing */}
        <TabsContent value="marketing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Points de douleur</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {persona.marketing.painPoints.map((point, index) => (
                    <div key={point} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-200">
                      <span className="text-red-600 font-bold text-sm">{index + 1}</span>
                      <p className="text-sm text-red-800">{point}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Motivations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {persona.marketing.motivations.map((motivation, index) => (
                    <div key={motivation} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-200">
                      <span className="text-green-600 font-bold text-sm">{index + 1}</span>
                      <p className="text-sm text-green-800">{motivation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Influences et comportement d'achat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Sources d'influence</h4>
                  <div className="space-y-2">
                    {persona.marketing.influences.map((influence, index) => (
                      <div key={influence} className="flex items-center justify-between">
                        <span className="text-sm">{influence}</span>
                        <Progress value={80 - index * 15} className="w-20" />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Comportement d'achat</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {persona.marketing.buyingBehavior}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stratégie marketing recommandée</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <Target className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm">Ciblage</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Focus sur {persona.values[0]} et {persona.communication.preferredChannels[0]}
                  </p>
                </div>
                <div className="text-center p-4 bg-teal-50 rounded-lg">
                  <MessageCircle className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm">Message</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ton {persona.communication.tone.toLowerCase()}, contenu {persona.communication.contentTypes[0].toLowerCase()}
                  </p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <Clock className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-sm">Timing</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Communication {persona.communication.frequency.toLowerCase()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sources et métadonnées */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Métadonnées de génération</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>ID: {persona.id.slice(0, 8)}...</span>
              <span>Généré le: {persona.generatedAt.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Sources:</span>
              {persona.sources.map(source => (
                <Badge key={source} variant="outline" className="text-xs">{source}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}