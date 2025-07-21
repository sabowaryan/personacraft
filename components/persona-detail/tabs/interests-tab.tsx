'use client';

import { PersonaInterests } from '@/lib/types/persona';
import { Book, Coffee, Film, Music, Star, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Grid3X3, List, Cloud } from 'lucide-react';

interface InterestsTabProps {
  interests: PersonaInterests;
}

/**
 * Onglet d'intérêts avec différents modes d'affichage
 */
export function InterestsTab({ interests }: InterestsTabProps) {
  const [displayMode, setDisplayMode] = useState<'grid' | 'list' | 'cloud'>('grid');
  
  const getCategoryIcon = (category: string) => {
    const icons = {
      music: <Music className="h-4 w-4" />,
      movies: <Film className="h-4 w-4" />,
      books: <Book className="h-4 w-4" />,
      food: <Coffee className="h-4 w-4" />,
      brands: <Star className="h-4 w-4" />,
      lifestyle: <TrendingUp className="h-4 w-4" />
    };
    return icons[category as keyof typeof icons] || <Star className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Contrôles de mode d'affichage */}
      <div className="flex justify-end mb-4">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 inline-flex">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDisplayMode('grid')}
            className={cn(
              "rounded-md",
              displayMode === 'grid' ? "bg-white dark:bg-gray-700 shadow-sm" : "bg-transparent"
            )}
          >
            <Grid3X3 className="h-4 w-4" />
            <span className="sr-only">Affichage en grille</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDisplayMode('list')}
            className={cn(
              "rounded-md",
              displayMode === 'list' ? "bg-white dark:bg-gray-700 shadow-sm" : "bg-transparent"
            )}
          >
            <List className="h-4 w-4" />
            <span className="sr-only">Affichage en liste</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDisplayMode('cloud')}
            className={cn(
              "rounded-md",
              displayMode === 'cloud' ? "bg-white dark:bg-gray-700 shadow-sm" : "bg-transparent"
            )}
          >
            <Cloud className="h-4 w-4" />
            <span className="sr-only">Affichage en nuage</span>
          </Button>
        </div>
      </div>
      
      {/* Affichage en grille */}
      {displayMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(interests).map(([category, items]) => (
            <div key={category} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-all duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                  {getCategoryIcon(category)}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{category}</h3>
              </div>
              <div className="space-y-2">
                {items.map((item: string, index: number) => (
                  <div key={item} className="flex items-center justify-between py-2 px-3 bg-white dark:bg-gray-700 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item}</span>
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
            </div>
          ))}
        </div>
      )}
      
      {/* Affichage en liste */}
      {displayMode === 'list' && (
        <div className="space-y-6">
          {Object.entries(interests).map(([category, items]) => (
            <div key={category} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                  {getCategoryIcon(category)}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{category}</h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.map((item: string, index: number) => (
                  <div key={item} className="flex items-center justify-between py-3">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{item}</span>
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
            </div>
          ))}
        </div>
      )}
      
      {/* Affichage en nuage */}
      {displayMode === 'cloud' && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
          <div className="flex flex-wrap gap-2">
            {Object.entries(interests).flatMap(([category, items]) => 
              items.map((item: string, index: number) => {
                // Calculer une taille basée sur l'index (simuler l'importance)
                const size = 4 - (index % 3);
                const colors = [
                  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
                  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
                  'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
                  'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
                  'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
                  'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
                ];
                const colorIndex = (category.length + index) % colors.length;
                
                return (
                  <div 
                    key={`${category}-${item}`} 
                    className={cn(
                      "rounded-full px-3 py-1 text-sm font-medium",
                      colors[colorIndex],
                      size === 3 && "text-base px-4 py-2",
                      size === 4 && "text-lg px-5 py-2.5",
                      "transition-all duration-300 hover:scale-105 cursor-pointer"
                    )}
                  >
                    {item}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}