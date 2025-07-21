'use client';

import { Persona } from '@/lib/types/persona';
import { Award, Quote, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileTabProps {
  persona: Persona;
}

/**
 * Onglet de profil avec biographie et valeurs
 */
export function ProfileTab({ persona }: ProfileTabProps) {
  return (
    <div className="space-y-8">
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
                  className={cn(
                    "bg-green-500 dark:bg-green-400 h-2 rounded-full transition-all duration-500",
                    "persona-animated-progress progress-bar"
                  )}
                  style={{ width: `${90 - index * 10}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}