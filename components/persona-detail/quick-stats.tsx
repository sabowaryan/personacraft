'use client';

import { Card, CardContent } from '@/components/ui/card';
import { QuickStatsProps } from './types';
import { Heart, MessageCircle, Target, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Composant QuickStats avec métriques visuelles
 * Cards avec icônes colorées et barres de progression animées
 */
export function QuickStats({ stats, completionScore }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Carte Valeurs */}
      <StatCard 
        icon={<Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
        value={stats.valuesCount}
        label="Valeurs"
        progress={Math.max(Math.min((stats.valuesCount / 6) * 100, 100), 5)}
        bgColor="bg-blue-100 dark:bg-blue-900/30"
        progressColor="bg-blue-500 dark:bg-blue-400"
      />

      {/* Carte Intérêts */}
      <StatCard 
        icon={<Heart className="h-5 w-5 text-green-600 dark:text-green-400" />}
        value={stats.interestsCount}
        label="Intérêts"
        progress={Math.max(Math.min((stats.interestsCount / 25) * 100, 100), 5)}
        bgColor="bg-green-100 dark:bg-green-900/30"
        progressColor="bg-green-500 dark:bg-green-400"
      />

      {/* Carte Canaux */}
      <StatCard 
        icon={<MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
        value={stats.channelsCount}
        label="Canaux"
        progress={Math.max(Math.min((stats.channelsCount / 6) * 100, 100), 5)}
        bgColor="bg-purple-100 dark:bg-purple-900/30"
        progressColor="bg-purple-500 dark:bg-purple-400"
      />

      {/* Carte Points clés */}
      <StatCard 
        icon={<Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
        value={stats.painPointsCount}
        label="Points clés"
        progress={Math.max(Math.min((stats.painPointsCount / 5) * 100, 100), 5)}
        bgColor="bg-amber-100 dark:bg-amber-900/30"
        progressColor="bg-amber-500 dark:bg-amber-400"
      />
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  progress: number;
  bgColor: string;
  progressColor: string;
}

/**
 * Composant de carte de statistique individuelle
 */
function StatCard({ icon, value, label, progress, bgColor, progressColor }: StatCardProps) {
  return (
    <Card className="group border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg bg-white dark:bg-gray-800 transition-all duration-300 hover:scale-[1.02]">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-3 rounded-xl", bgColor)}>
              {icon}
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {value}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{label}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-500 persona-animated-progress progress-bar",
              progressColor
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}