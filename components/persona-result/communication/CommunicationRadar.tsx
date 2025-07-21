'use client';

import { useState, useMemo } from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  Video, 
  Users, 
  Globe,
  Info,
  RotateCcw
} from 'lucide-react';
import { CommunicationProfile } from '@/lib/types/persona';
import { cn } from '@/lib/utils';

interface CommunicationRadarProps {
  communication: CommunicationProfile;
  interactive?: boolean;
  className?: string;
}

interface RadarDataPoint {
  channel: string;
  preference: number;
  frequency: number;
  effectiveness: number;
  fullMark: number;
}

interface ChannelConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

const CHANNEL_CONFIGS: ChannelConfig[] = [
  {
    id: 'email',
    label: 'Email',
    icon: Mail,
    color: '#3B82F6',
    description: 'Communication écrite formelle et asynchrone'
  },
  {
    id: 'phone',
    label: 'Téléphone',
    icon: Phone,
    color: '#10B981',
    description: 'Communication vocale directe et immédiate'
  },
  {
    id: 'video',
    label: 'Visioconférence',
    icon: Video,
    color: '#8B5CF6',
    description: 'Communication visuelle et interactive'
  },
  {
    id: 'messaging',
    label: 'Messagerie',
    icon: MessageCircle,
    color: '#F59E0B',
    description: 'Communication instantanée et informelle'
  },
  {
    id: 'social',
    label: 'Réseaux sociaux',
    icon: Users,
    color: '#EF4444',
    description: 'Communication publique et sociale'
  },
  {
    id: 'web',
    label: 'Web/Blog',
    icon: Globe,
    color: '#06B6D4',
    description: 'Communication de contenu et information'
  }
];

export function CommunicationRadar({ 
  communication, 
  interactive = true,
  className 
}: CommunicationRadarProps) {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Transformer les données de communication en données radar
  const radarData = useMemo(() => {
    return CHANNEL_CONFIGS.map(config => {
      const isPreferred = communication.preferredChannels?.includes(config.id) || 
                          communication.preferredChannels?.some(channel => 
                            channel.toLowerCase().includes(config.id)
                          );
      
      // Calculer les scores basés sur les préférences et la fréquence
      const basePreference = isPreferred ? 85 : 30 + Math.random() * 40;
      const frequencyScore = getFrequencyScore(communication.frequency);
      const effectivenessScore = getToneEffectiveness(communication.tone, config.id);
      
      return {
        channel: config.label,
        preference: Math.round(basePreference),
        frequency: Math.round(frequencyScore),
        effectiveness: Math.round(effectivenessScore),
        fullMark: 100
      };
    });
  }, [communication]);

  // Calculer le score de fréquence
  function getFrequencyScore(frequency: string): number {
    const frequencyMap: Record<string, number> = {
      'daily': 90,
      'weekly': 70,
      'monthly': 50,
      'rarely': 30,
      'quotidien': 90,
      'hebdomadaire': 70,
      'mensuel': 50,
      'rarement': 30
    };
    
    return frequencyMap[frequency?.toLowerCase()] || 60;
  }

  // Calculer l'efficacité basée sur le ton
  function getToneEffectiveness(tone: string, channelId: string): number {
    const toneChannelMap: Record<string, Record<string, number>> = {
      'formal': { email: 90, phone: 70, video: 80, messaging: 40, social: 30, web: 85 },
      'casual': { email: 60, phone: 85, video: 75, messaging: 90, social: 85, web: 70 },
      'professional': { email: 95, phone: 80, video: 90, messaging: 50, social: 40, web: 90 },
      'friendly': { email: 70, phone: 90, video: 85, messaging: 85, social: 90, web: 75 },
      'direct': { email: 80, phone: 95, video: 85, messaging: 70, social: 60, web: 80 }
    };
    
    const toneKey = tone?.toLowerCase() || 'professional';
    return toneChannelMap[toneKey]?.[channelId] || 70;
  }

  // Gestionnaire de clic sur un point du radar
  const handleRadarClick = (data: any) => {
    if (!interactive) return;
    
    const channelName = data?.payload?.channel;
    if (channelName) {
      const config = CHANNEL_CONFIGS.find(c => c.label === channelName);
      setSelectedChannel(config?.id || null);
      setShowDetails(true);
    }
  };

  // Composant de tooltip personnalisé
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const config = CHANNEL_CONFIGS.find(c => c.label === label);

    return (
      <Card className="border shadow-lg">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            {config && (
              <div style={{ color: config.color }}>
                <config.icon className="h-4 w-4" />
              </div>
            )}
            <span className="font-semibold">{label}</span>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Préférence:</span>
              <span className="font-medium">{data.preference}%</span>
            </div>
            <div className="flex justify-between">
              <span>Fréquence:</span>
              <span className="font-medium">{data.frequency}%</span>
            </div>
            <div className="flex justify-between">
              <span>Efficacité:</span>
              <span className="font-medium">{data.effectiveness}%</span>
            </div>
          </div>
          {config && (
            <p className="text-xs text-muted-foreground mt-2">
              {config.description}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  const selectedConfig = selectedChannel ? 
    CHANNEL_CONFIGS.find(c => c.id === selectedChannel) : null;
  const selectedData = selectedChannel ? 
    radarData.find(d => d.channel === selectedConfig?.label) : null;

  return (
    <div className={cn("space-y-6", className)}>
      <Card className="persona-result-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <CardTitle>Radar de Communication</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Info className="h-4 w-4" />
              </Button>
              {interactive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedChannel(null);
                    setShowDetails(false);
                  }}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Graphique radar */}
            <div className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData} onClick={handleRadarClick}>
                  <PolarGrid 
                    stroke="#e2e8f0" 
                    className="dark:stroke-gray-700"
                  />
                  <PolarAngleAxis 
                    dataKey="channel" 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    className="dark:fill-gray-400"
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    className="dark:fill-gray-500"
                  />
                  
                  <Radar
                    name="Préférence"
                    dataKey="preference"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.1}
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                  
                  <Radar
                    name="Fréquence"
                    dataKey="frequency"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.1}
                    strokeWidth={2}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  />
                  
                  <Radar
                    name="Efficacité"
                    dataKey="effectiveness"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.1}
                    strokeWidth={2}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  />
                  
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Panneau de détails */}
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">Canaux de communication</h4>
                <div className="space-y-2">
                  {CHANNEL_CONFIGS.map(config => {
                    const data = radarData.find(d => d.channel === config.label);
                    const isSelected = selectedChannel === config.id;
                    
                    return (
                      <button
                        key={config.id}
                        onClick={() => {
                          if (interactive) {
                            setSelectedChannel(isSelected ? null : config.id);
                            setShowDetails(true);
                          }
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg border transition-all",
                          "hover:bg-muted/50",
                          isSelected && "bg-muted border-primary",
                          !interactive && "cursor-default"
                        )}
                      >
                        <div style={{ color: config.color }}>
                          <config.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-sm">{config.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {data?.preference}% préférence
                          </div>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className="text-xs"
                        >
                          {data?.effectiveness}%
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Détails du canal sélectionné */}
              {showDetails && selectedConfig && selectedData && (
                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div style={{ color: selectedConfig.color }}>
                        <selectedConfig.icon className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-base">{selectedConfig.label}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {selectedConfig.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Préférence:</span>
                        <span className="font-medium">{selectedData.preference}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Fréquence d'usage:</span>
                        <span className="font-medium">{selectedData.frequency}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Efficacité:</span>
                        <span className="font-medium">{selectedData.effectiveness}%</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <Badge 
                        variant={selectedData.preference > 70 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {selectedData.preference > 70 ? "Canal privilégié" : "Usage modéré"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}