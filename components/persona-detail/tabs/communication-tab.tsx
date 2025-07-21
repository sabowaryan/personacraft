'use client';

import { Badge } from '@/components/ui/badge';
import { CommunicationProfile } from '@/lib/types/persona';
import { BarChart3, MessageCircle, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommunicationTabProps {
  communication: CommunicationProfile;
}

/**
 * Onglet de communication avec préférences et canaux
 */
export function CommunicationTab({ communication }: CommunicationTabProps) {
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
    <div className="space-y-8">
      {/* Canaux de communication */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Canaux préférés</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {communication.preferredChannels.map((channel, index) => (
            <div key={channel} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{getChannelIcon(channel)}</span>
                <span className="font-medium text-gray-900 dark:text-white">{channel}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                  <div 
                    className={cn(
                      "bg-blue-500 dark:bg-blue-400 h-2 rounded-full transition-all duration-500",
                      "persona-animated-progress progress-bar"
                    )}
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
                {communication.tone}
              </Badge>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fréquence</span>
              <Badge variant="outline" className="border-green-300 text-green-700 dark:border-green-600 dark:text-green-300">
                {communication.frequency}
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
          {communication.contentTypes.map((type, index) => (
            <div key={type} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 dark:text-white">{type}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {85 - index * 15}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={cn(
                    "bg-purple-500 dark:bg-purple-400 h-2 rounded-full transition-all duration-500",
                    "persona-animated-progress progress-bar"
                  )}
                  style={{ width: `${85 - index * 15}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}