'use client';

import { MarketingProfile } from '@/lib/types/persona';
import { Brain, Lightbulb, ShoppingBag, Target } from 'lucide-react';

interface MarketingTabProps {
  marketing: MarketingProfile;
}

/**
 * Onglet marketing avec insights et comportements
 */
export function MarketingTab({ marketing }: MarketingTabProps) {
  return (
    <div className="space-y-8">
      {/* Points de douleur */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <Target className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Points de douleur</h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {marketing.painPoints.map((point, index) => (
            <div key={index} className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4 border-l-4 border-red-400 dark:border-red-500">
              <p className="text-gray-800 dark:text-gray-200">{point}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Motivations */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Motivations</h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {marketing.motivations.map((motivation, index) => (
            <div key={index} className="bg-amber-50 dark:bg-amber-900/10 rounded-lg p-4 border-l-4 border-amber-400 dark:border-amber-500">
              <p className="text-gray-800 dark:text-gray-200">{motivation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Comportement d'achat */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <ShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Comportement d'achat</h3>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-6 border-l-4 border-blue-400 dark:border-blue-500">
          <p className="text-gray-800 dark:text-gray-200">{marketing.buyingBehavior}</p>
        </div>
      </div>

      {/* Influences */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Influences</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {marketing.influences.map((influence, index) => (
            <div key={index} className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-4 border-l-4 border-purple-400 dark:border-purple-500">
              <p className="text-gray-800 dark:text-gray-200">{influence}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}