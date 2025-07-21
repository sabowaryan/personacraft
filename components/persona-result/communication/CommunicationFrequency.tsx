'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Calendar, 
  Zap, 
  Pause,
  Play,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Timer,
  Repeat
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { CommunicationProfile } from '@/lib/types/persona';
import { AnimatedProgress, ModernBadge, CircularScore } from '@/components/ui/modern-elements';
import { cn } from '@/lib/utils';

interface CommunicationFrequencyProps {
  communication: CommunicationProfile;
  personaName: string;
  className?: string;
}

interface FrequencyData {
  period: string;
  optimal: number;
  current: number;
  engagement: number;
  satisfaction: number;
}

interface FrequencyInsight {
  type: 'optimal' | 'warning' | 'opportunity';
  title: string;
  description: string;
  recommendation: string;
  impact: number;
}

const FREQUENCY_MAPPING = {
  'daily': { label: 'Quotidien', value: 7, score: 95, color: '#EF4444' },
  'weekly': { label: 'Hebdomadaire', value: 1, score: 85, color: '#F59E0B' },
  'monthly': { label: 'Mensuel', value: 0.25, score: 70, color: '#10B981' },
  'rarely': { label: 'Rarement', value: 0.1, score: 50, color: '#6B7280' },
  'quotidien': { label: 'Quotidien', value: 7, score: 95, color: '#EF4444' },
  'hebdomadaire': { label: 'Hebdomadaire', value: 1, score: 85, color: '#F59E0B' },
  'mensuel': { label: 'Mensuel', value: 0.25, score: 70, color: '#10B981' },
  'rarement': { label: 'Rarement', value: 0.1, score: 50, color: '#6B7280' }
};

export function CommunicationFrequency({ 
  communication, 
  personaName,
  className 
}: CommunicationFrequencyProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('week');
  const [showRecommendations, setShowRecommendations] = useState(false);

  const currentFrequency = communication.frequency?.toLowerCase() || 'weekly';
  const frequencyConfig = FREQUENCY_MAPPING[currentFrequency as keyof typeof FREQUENCY_MAPPING] || 
                         FREQUENCY_MAPPING.weekly;

  // Données pour le graphique de fréquence
  const frequencyData: FrequencyData[] = [
    {
      period: 'Lun',
      optimal: currentFrequency === 'daily' ? 85 : currentFrequency === 'weekly' ? 90 : 30,
      current: currentFrequency === 'daily' ? 80 : currentFrequency === 'weekly' ? 85 : 25,
      engagement: 75,
      satisfaction: 80
    },
    {
      period: 'Mar',
      optimal: currentFrequency === 'daily' ? 90 : currentFrequency === 'weekly' ? 20 : 35,
      current: currentFrequency === 'daily' ? 85 : currentFrequency === 'weekly' ? 15 : 30,
      engagement: 80,
      satisfaction: 85
    },
    {
      period: 'Mer',
      optimal: currentFrequency === 'daily' ? 85 : currentFrequency === 'weekly' ? 95 : 40,
      current: currentFrequency === 'daily' ? 90 : currentFrequency === 'weekly' ? 90 : 35,
      engagement: 85,
      satisfaction: 90
    },
    {
      period: 'Jeu',
      optimal: currentFrequency === 'daily' ? 80 : currentFrequency === 'weekly' ? 25 : 30,
      current: currentFrequency === 'daily' ? 75 : currentFrequency === 'weekly' ? 20 : 25,
      engagement: 70,
      satisfaction: 75
    },
    {
      period: 'Ven',
      optimal: currentFrequency === 'daily' ? 95 : currentFrequency === 'weekly' ? 85 : 45,
      current: currentFrequency === 'daily' ? 90 : currentFrequency === 'weekly' ? 80 : 40,
      engagement: 90,
      satisfaction: 95
    },
    {
      period: 'Sam',
      optimal: currentFrequency === 'daily' ? 60 : currentFrequency === 'weekly' ? 10 : 20,
      current: currentFrequency === 'daily' ? 55 : currentFrequency === 'weekly' ? 5 : 15,
      engagement: 50,
      satisfaction: 60
    },
    {
      period: 'Dim',
      optimal: currentFrequency === 'daily' ? 40 : currentFrequency === 'weekly' ? 5 : 15,
      current: currentFrequency === 'daily' ? 35 : currentFrequency === 'weekly' ? 0 : 10,
      engagement: 40,
      satisfaction: 50
    }
  ];

  // Insights sur la fréquence
  const frequencyInsights: FrequencyInsight[] = [
    {
      type: 'optimal',
      title: 'Fréquence actuelle',
      description: `${personaName} préfère une communication ${frequencyConfig.label.toLowerCase()}`,
      recommendation: 'Maintenir cette cadence pour optimiser l\'engagement',
      impact: frequencyConfig.score
    },
    {
      type: currentFrequency === 'daily' ? 'warning' : 'opportunity',
      title: 'Risque de saturation',
      description: currentFrequency === 'daily' ? 
        'Communication très fréquente, risque de lassitude' : 
        'Opportunité d\'augmenter la fréquence',
      recommendation: currentFrequency === 'daily' ? 
        'Varier les formats et canaux' : 
        'Tester une fréquence légèrement plus élevée',
      impact: currentFrequency === 'daily' ? 60 : 75
    },
    {
      type: 'opportunity',
      title: 'Moments optimaux',
      description: 'Certains créneaux montrent un meilleur engagement',
      recommendation: 'Concentrer les communications en milieu de semaine',
      impact: 85
    }
  ];

  // Calculer le score global de fréquence
  const overallFrequencyScore = Math.round(
    frequencyData.reduce((sum, day) => sum + day.satisfaction, 0) / frequencyData.length
  );

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'optimal': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'opportunity': return TrendingUp;
      default: return CheckCircle;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'optimal': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'warning': return 'text-amber-600 bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400';
      case 'opportunity': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Vue d'ensemble de la fréquence */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="persona-result-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Repeat className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{frequencyConfig.label}</div>
                <div className="text-sm text-muted-foreground">Fréquence préférée</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="persona-result-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{overallFrequencyScore}%</div>
                <div className="text-sm text-muted-foreground">Satisfaction</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="persona-result-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Timer className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {frequencyData.reduce((sum, day) => sum + day.engagement, 0) / frequencyData.length}%
                </div>
                <div className="text-sm text-muted-foreground">Engagement moyen</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="persona-result-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{frequencyConfig.score}%</div>
                <div className="text-sm text-muted-foreground">Score optimal</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphique de fréquence hebdomadaire */}
      <Card className="persona-result-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Répartition hebdomadaire optimale</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={selectedPeriod === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('week')}
              >
                Semaine
              </Button>
              <Button
                variant={selectedPeriod === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('month')}
              >
                Mois
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={frequencyData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="optimal" 
                fill="#3B82F6" 
                name="Fréquence optimale"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="current" 
                fill="#10B981" 
                name="Fréquence actuelle"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights et recommandations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="persona-result-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Insights fréquence
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRecommendations(!showRecommendations)}
              >
                {showRecommendations ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {frequencyInsights.map((insight, index) => {
              const Icon = getInsightIcon(insight.type);
              return (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border"
                >
                  <div className={cn("p-2 rounded-lg", getInsightColor(insight.type))}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {insight.description}
                    </p>
                    {showRecommendations && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-primary">
                          💡 {insight.recommendation}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Impact:</span>
                          <AnimatedProgress 
                            value={insight.impact} 
                            size="sm" 
                            color="primary"
                            showPercentage={false}
                            className="flex-1"
                          />
                          <span className="text-xs font-medium">{insight.impact}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="persona-result-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Analyse temporelle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <CircularScore 
                score={frequencyConfig.score} 
                label="Score de fréquence"
                color="primary"
                size="lg"
              />
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Cohérence temporelle</span>
                  <span className="font-medium">85%</span>
                </div>
                <AnimatedProgress value={85} color="success" size="sm" showPercentage={false} />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Prévisibilité</span>
                  <span className="font-medium">{frequencyConfig.score}%</span>
                </div>
                <AnimatedProgress 
                  value={frequencyConfig.score} 
                  color="primary" 
                  size="sm" 
                  showPercentage={false} 
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Flexibilité</span>
                  <span className="font-medium">
                    {currentFrequency === 'daily' ? 60 : currentFrequency === 'weekly' ? 80 : 90}%
                  </span>
                </div>
                <AnimatedProgress 
                  value={currentFrequency === 'daily' ? 60 : currentFrequency === 'weekly' ? 80 : 90} 
                  color="warning" 
                  size="sm" 
                  showPercentage={false} 
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex flex-wrap gap-2">
                <ModernBadge 
                  variant={frequencyConfig.score > 80 ? "success" : "secondary"}
                  icon={<CheckCircle className="h-3 w-3" />}
                >
                  {frequencyConfig.label}
                </ModernBadge>
                <ModernBadge 
                  variant="default"
                  icon={<Timer className="h-3 w-3" />}
                >
                  Score: {frequencyConfig.score}%
                </ModernBadge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}