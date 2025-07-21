'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageCircle,
  Clock,
  Volume2,
  Target,
  TrendingUp,
  BarChart3,
  Zap,
  Users,
  Settings
} from 'lucide-react';
import { CommunicationProfile } from '@/lib/types/persona';
import { CommunicationRadar } from './CommunicationRadar';
import { CommunicationFrequency } from './CommunicationFrequency';
import { CommunicationChannels } from './CommunicationChannels';
import { AnimatedProgress, ModernBadge, CircularScore } from '@/components/ui/modern-elements';
import { cn } from '@/lib/utils';

interface CommunicationSectionProps {
  communication: CommunicationProfile;
  personaName: string;
  className?: string;
}

interface CommunicationInsight {
  type: 'strength' | 'opportunity' | 'preference';
  title: string;
  description: string;
  score: number;
  icon: React.ComponentType<{ className?: string }>;
}

export function CommunicationSection({
  communication,
  personaName,
  className
}: CommunicationSectionProps) {
  const [activeView, setActiveView] = useState<'overview' | 'channels' | 'frequency' | 'insights'>('overview');

  // Analyser les insights de communication
  const communicationInsights: CommunicationInsight[] = [
    {
      type: 'strength',
      title: 'Canal principal',
      description: `${personaName} privilégie ${communication.preferredChannels?.[0] || 'la communication directe'}`,
      score: 85,
      icon: Target
    },
    {
      type: 'preference',
      title: 'Style de communication',
      description: `Ton ${communication.tone || 'professionnel'} adapté au contexte`,
      score: getToneScore(communication.tone),
      icon: Volume2
    },
    {
      type: 'opportunity',
      title: 'Fréquence optimale',
      description: `Communication ${communication.frequency || 'régulière'} recommandée`,
      score: getFrequencyScore(communication.frequency),
      icon: Clock
    }
  ];

  // Calculer le score global de communication
  const overallScore = Math.round(
    communicationInsights.reduce((sum, insight) => sum + insight.score, 0) / communicationInsights.length
  );

  function getToneScore(tone: string): number {
    const toneScores: Record<string, number> = {
      'professional': 90,
      'friendly': 85,
      'casual': 80,
      'formal': 85,
      'direct': 75,
      'humorous': 70
    };
    return toneScores[tone?.toLowerCase()] || 75;
  }

  function getFrequencyScore(frequency: string): number {
    const frequencyScores: Record<string, number> = {
      'daily': 95,
      'weekly': 85,
      'monthly': 70,
      'rarely': 50,
      'quotidien': 95,
      'hebdomadaire': 85,
      'mensuel': 70,
      'rarement': 50
    };
    return frequencyScores[frequency?.toLowerCase()] || 75;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* En-tête avec score global */}
      <Card className="persona-result-card persona-animate-in">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Profil de Communication</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Comment {personaName} communique et interagit
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <CircularScore
                score={overallScore}
                label="Score global"
                color="primary"
                size="md"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {communicationInsights.map((insight, index) => (
              <Card
                key={index}
                className={cn(
                  "border-l-4 transition-all hover:shadow-md",
                  insight.type === 'strength' && "border-l-green-500 bg-green-50/50 dark:bg-green-900/10",
                  insight.type === 'preference' && "border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10",
                  insight.type === 'opportunity' && "border-l-amber-500 bg-amber-50/50 dark:bg-amber-900/10"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      insight.type === 'strength' && "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
                      insight.type === 'preference' && "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
                      insight.type === 'opportunity' && "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                    )}>
                      <insight.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {insight.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <AnimatedProgress
                          value={insight.score}
                          size="sm"
                          color={insight.type === 'strength' ? 'success' :
                            insight.type === 'preference' ? 'primary' : 'warning'}
                          showPercentage={false}
                        />
                        <span className="text-xs font-medium">{insight.score}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation des vues */}
      <Card className="persona-result-card">
        <CardContent className="p-0">
          <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
            <div className="border-b">
              <TabsList className="grid w-full grid-cols-4 bg-transparent h-auto p-0">
                <TabsTrigger
                  value="overview"
                  className="flex items-center gap-2 py-4 data-[state=active]:bg-primary/5 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Vue d'ensemble</span>
                </TabsTrigger>
                <TabsTrigger
                  value="channels"
                  className="flex items-center gap-2 py-4 data-[state=active]:bg-primary/5 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Canaux</span>
                </TabsTrigger>
                <TabsTrigger
                  value="frequency"
                  className="flex items-center gap-2 py-4 data-[state=active]:bg-primary/5 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">Fréquence</span>
                </TabsTrigger>
                <TabsTrigger
                  value="insights"
                  className="flex items-center gap-2 py-4 data-[state=active]:bg-primary/5 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Insights</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="overview" className="mt-0">
                <CommunicationRadar
                  communication={communication}
                  interactive={true}
                />
              </TabsContent>

              <TabsContent value="channels" className="mt-0">
                <CommunicationChannels
                  communication={communication}
                  personaName={personaName}
                />
              </TabsContent>

              <TabsContent value="frequency" className="mt-0">
                <CommunicationFrequency
                  communication={communication}
                  personaName={personaName}
                />
              </TabsContent>

              <TabsContent value="insights" className="mt-0">
                <div className="space-y-6">
                  {/* Recommandations personnalisées */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-amber-500" />
                        Recommandations personnalisées
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">Stratégie optimale</h4>
                          <div className="space-y-2">
                            <ModernBadge variant="success" icon={<Target className="h-3 w-3" />}>
                              Canal principal: {communication.preferredChannels?.[0] || 'Email'}
                            </ModernBadge>
                            <ModernBadge variant="default" icon={<Volume2 className="h-3 w-3" />}>
                              Ton: {communication.tone || 'Professionnel'}
                            </ModernBadge>
                            <ModernBadge variant="warning" icon={<Clock className="h-3 w-3" />}>
                              Fréquence: {communication.frequency || 'Hebdomadaire'}
                            </ModernBadge>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">Points d'attention</h4>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <p>• Adapter le message au canal choisi</p>
                            <p>• Respecter la fréquence préférée</p>
                            <p>• Maintenir la cohérence du ton</p>
                            <p>• Personnaliser selon le contexte</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Métriques détaillées */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-500" />
                        Analyse détaillée
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <CircularScore
                            score={communication.preferredChannels?.length ? 85 : 60}
                            label="Diversité des canaux"
                            color="primary"
                            size="lg"
                          />
                        </div>
                        <div className="text-center">
                          <CircularScore
                            score={getToneScore(communication.tone)}
                            label="Adaptabilité du ton"
                            color="success"
                            size="lg"
                          />
                        </div>
                        <div className="text-center">
                          <CircularScore
                            score={getFrequencyScore(communication.frequency)}
                            label="Efficacité fréquence"
                            color="warning"
                            size="lg"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}