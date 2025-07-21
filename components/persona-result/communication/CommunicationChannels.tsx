'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Mail, 
  Phone, 
  MessageCircle, 
  Video, 
  Users, 
  Globe,
  Smartphone,
  Monitor,
  Headphones,
  FileText,
  Camera,
  Mic,
  Share2,
  Star,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { CommunicationProfile } from '@/lib/types/persona';
import { AnimatedProgress, ModernBadge } from '@/components/ui/modern-elements';
import { cn } from '@/lib/utils';

interface CommunicationChannelsProps {
  communication: CommunicationProfile;
  personaName: string;
  className?: string;
}

interface ChannelData {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  preference: number;
  usage: number;
  effectiveness: number;
  color: string;
  category: 'digital' | 'traditional' | 'social' | 'professional';
  description: string;
  bestFor: string[];
  tips: string[];
}

const CHANNEL_DATABASE: ChannelData[] = [
  {
    id: 'email',
    name: 'Email',
    icon: Mail,
    preference: 0,
    usage: 0,
    effectiveness: 0,
    color: '#3B82F6',
    category: 'professional',
    description: 'Communication écrite formelle et traçable',
    bestFor: ['Documents officiels', 'Suivi de projets', 'Communication asynchrone'],
    tips: ['Objet clair et précis', 'Structure avec bullet points', 'Call-to-action visible']
  },
  {
    id: 'phone',
    name: 'Téléphone',
    icon: Phone,
    preference: 0,
    usage: 0,
    effectiveness: 0,
    color: '#10B981',
    category: 'traditional',
    description: 'Communication vocale directe et immédiate',
    bestFor: ['Urgences', 'Négociations', 'Relations personnelles'],
    tips: ['Préparer les points clés', 'Confirmer par écrit après', 'Respecter les horaires']
  },
  {
    id: 'messaging',
    name: 'Messagerie instantanée',
    icon: MessageCircle,
    preference: 0,
    usage: 0,
    effectiveness: 0,
    color: '#F59E0B',
    category: 'digital',
    description: 'Communication rapide et informelle',
    bestFor: ['Questions rapides', 'Coordination équipe', 'Mises à jour'],
    tips: ['Messages courts', 'Emojis appropriés', 'Réponse rapide attendue']
  },
  {
    id: 'video',
    name: 'Visioconférence',
    icon: Video,
    preference: 0,
    usage: 0,
    effectiveness: 0,
    color: '#8B5CF6',
    category: 'digital',
    description: 'Communication visuelle et interactive',
    bestFor: ['Réunions', 'Présentations', 'Formation'],
    tips: ['Tester la technique avant', 'Environnement professionnel', 'Interaction visuelle']
  },
  {
    id: 'social',
    name: 'Réseaux sociaux',
    icon: Users,
    preference: 0,
    usage: 0,
    effectiveness: 0,
    color: '#EF4444',
    category: 'social',
    description: 'Communication publique et sociale',
    bestFor: ['Engagement communauté', 'Partage de contenu', 'Veille'],
    tips: ['Contenu visuel', 'Hashtags pertinents', 'Interaction régulière']
  },
  {
    id: 'web',
    name: 'Site web/Blog',
    icon: Globe,
    preference: 0,
    usage: 0,
    effectiveness: 0,
    color: '#06B6D4',
    category: 'professional',
    description: 'Communication de contenu et information',
    bestFor: ['Expertise', 'SEO', 'Contenu long'],
    tips: ['SEO optimisé', 'Contenu de qualité', 'Mise à jour régulière']
  }
];

export function CommunicationChannels({ 
  communication, 
  personaName,
  className 
}: CommunicationChannelsProps) {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Enrichir les données des canaux avec les préférences du persona
  const enrichedChannels = CHANNEL_DATABASE.map(channel => {
    const isPreferred = communication.preferredChannels?.some(pref => 
      pref.toLowerCase().includes(channel.id) || 
      channel.name.toLowerCase().includes(pref.toLowerCase())
    );
    
    const basePreference = isPreferred ? 85 + Math.random() * 15 : 30 + Math.random() * 40;
    const usage = isPreferred ? 70 + Math.random() * 25 : 20 + Math.random() * 30;
    const effectiveness = calculateEffectiveness(channel.id, communication.tone);
    
    return {
      ...channel,
      preference: Math.round(basePreference),
      usage: Math.round(usage),
      effectiveness: Math.round(effectiveness)
    };
  });

  // Trier par préférence
  const sortedChannels = [...enrichedChannels].sort((a, b) => b.preference - a.preference);

  function calculateEffectiveness(channelId: string, tone: string): number {
    const effectivenessMatrix: Record<string, Record<string, number>> = {
      'email': { 'professional': 95, 'formal': 90, 'friendly': 75, 'casual': 60, 'direct': 85 },
      'phone': { 'professional': 85, 'formal': 80, 'friendly': 95, 'casual': 90, 'direct': 95 },
      'messaging': { 'professional': 60, 'formal': 40, 'friendly': 90, 'casual': 95, 'direct': 80 },
      'video': { 'professional': 90, 'formal': 85, 'friendly': 85, 'casual': 75, 'direct': 90 },
      'social': { 'professional': 50, 'formal': 30, 'friendly': 85, 'casual': 90, 'direct': 70 },
      'web': { 'professional': 90, 'formal': 95, 'friendly': 80, 'casual': 70, 'direct': 85 }
    };
    
    const toneKey = tone?.toLowerCase() || 'professional';
    return effectivenessMatrix[channelId]?.[toneKey] || 70;
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'digital': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'traditional': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'social': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      'professional': 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    };
    return colors[category as keyof typeof colors] || colors.professional;
  };

  const selectedChannelData = selectedChannel ? 
    enrichedChannels.find(c => c.id === selectedChannel) : null;

  return (
    <div className={cn("space-y-6", className)}>
      {/* En-tête avec contrôles */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Canaux de communication préférés</h3>
          <p className="text-sm text-muted-foreground">
            Analyse des préférences de {personaName} par canal
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <FileText className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Vue grille */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedChannels.map((channel, index) => (
            <Card 
              key={channel.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1",
                "persona-animate-in",
                selectedChannel === channel.id && "ring-2 ring-primary"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => setSelectedChannel(
                selectedChannel === channel.id ? null : channel.id
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${channel.color}20`, color: channel.color } as React.CSSProperties}
                    >
                      <channel.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{channel.name}</CardTitle>
                      <Badge className={getCategoryColor(channel.category)} variant="secondary">
                        {channel.category}
                      </Badge>
                    </div>
                  </div>
                  {index < 3 && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {channel.description}
                </p>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Préférence</span>
                      <span className="font-medium">{channel.preference}%</span>
                    </div>
                    <AnimatedProgress 
                      value={channel.preference} 
                      color="primary" 
                      size="sm"
                      showPercentage={false}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Usage</span>
                      <span className="font-medium">{channel.usage}%</span>
                    </div>
                    <AnimatedProgress 
                      value={channel.usage} 
                      color="secondary" 
                      size="sm"
                      showPercentage={false}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Efficacité</span>
                      <span className="font-medium">{channel.effectiveness}%</span>
                    </div>
                    <AnimatedProgress 
                      value={channel.effectiveness} 
                      color="success" 
                      size="sm"
                      showPercentage={false}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <ModernBadge 
                    variant={channel.preference > 70 ? "success" : "secondary"}
                    size="sm"
                  >
                    {channel.preference > 70 ? "Privilégié" : "Modéré"}
                  </ModernBadge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Vue liste */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {sortedChannels.map((channel, index) => (
                <div 
                  key={channel.id}
                  className={cn(
                    "p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                    selectedChannel === channel.id && "bg-primary/5"
                  )}
                  onClick={() => setSelectedChannel(
                    selectedChannel === channel.id ? null : channel.id
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${channel.color}20`, color: channel.color } as React.CSSProperties}
                      >
                        <channel.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{channel.name}</h4>
                          {index < 3 && (
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          )}
                          <Badge className={getCategoryColor(channel.category)} variant="secondary">
                            {channel.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {channel.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-sm font-medium">{channel.preference}%</div>
                        <div className="text-xs text-muted-foreground">Préférence</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{channel.usage}%</div>
                        <div className="text-xs text-muted-foreground">Usage</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{channel.effectiveness}%</div>
                        <div className="text-xs text-muted-foreground">Efficacité</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Panneau de détails du canal sélectionné */}
      {selectedChannelData && (
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${selectedChannelData.color}20`, color: selectedChannelData.color } as React.CSSProperties}
              >
                <selectedChannelData.icon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl">{selectedChannelData.name}</CardTitle>
                <p className="text-muted-foreground">{selectedChannelData.description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Idéal pour</h4>
                <ul className="space-y-2">
                  {selectedChannelData.bestFor.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Conseils d'utilisation</h4>
                <ul className="space-y-2">
                  {selectedChannelData.tips.map((tip, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <ModernBadge 
                    variant={selectedChannelData.preference > 70 ? "success" : "secondary"}
                    icon={<TrendingUp className="h-3 w-3" />}
                  >
                    {selectedChannelData.preference > 70 ? "Canal privilégié" : "Usage modéré"}
                  </ModernBadge>
                  <Badge className={getCategoryColor(selectedChannelData.category)} variant="secondary">
                    {selectedChannelData.category}
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedChannel(null)}
                >
                  Fermer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}