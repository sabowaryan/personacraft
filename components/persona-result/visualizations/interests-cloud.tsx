'use client';

import { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Search,
  Filter,
  X,
  Star,
  Music,
  Film,
  Book,
  Gamepad,
  ShoppingBag,
  Utensils,
  Plane,
  Heart,
  Activity,
  Info,
  TrendingUp,
  Zap,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CulturalInterest,
  InterestCategory,
  InterestCloudConfig,
  InterestFilterState,
  DEFAULT_INTEREST_CATEGORIES
} from '@/lib/types/cultural-interests';
import { ModernBadge } from '@/components/ui/modern-elements';
import React from 'react';

interface InterestsCloudProps {
  interests: CulturalInterest[];
  categories?: InterestCategory[];
  config?: InterestCloudConfig;
  onInterestClick?: (interest: CulturalInterest) => void;
  onCategoryFilter?: (categoryId: string) => void;
  className?: string;
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Music,
  Film,
  Book,
  Gamepad,
  ShoppingBag,
  Utensils,
  Plane,
  Heart,
  Activity
};

export function InterestsCloud({
  interests,
  categories = DEFAULT_INTEREST_CATEGORIES,
  config = {},
  onInterestClick,
  onCategoryFilter,
  className
}: InterestsCloudProps) {
  const {
    maxItems = 50,
    minScore = 0,
    showCategories = true,
    interactive = true,
    colorScheme = 'category'
  } = config;

  const [filterState, setFilterState] = useState<InterestFilterState>({
    categories: [],
    scoreRange: [0, 100],
    searchQuery: '',
    sortBy: 'score',
    sortOrder: 'desc'
  });

  const [showFilters, setShowFilters] = useState(false);
  const [hoveredInterest, setHoveredInterest] = useState<CulturalInterest | null>(null);
  const [selectedInterest, setSelectedInterest] = useState<CulturalInterest | null>(null);

  // Filter and sort interests
  const filteredInterests = useMemo(() => {
    let filtered = interests.filter(interest => {
      // Score filter
      if (interest.score < minScore) return false;

      // Category filter
      if (filterState.categories.length > 0 &&
        !filterState.categories.includes(interest.category.id)) {
        return false;
      }

      // Score range filter
      if (interest.score < filterState.scoreRange[0] ||
        interest.score > filterState.scoreRange[1]) {
        return false;
      }

      // Search query filter
      if (filterState.searchQuery &&
        !interest.name.toLowerCase().includes(filterState.searchQuery.toLowerCase()) &&
        !interest.category.name.toLowerCase().includes(filterState.searchQuery.toLowerCase())) {
        return false;
      }

      return true;
    });

    // Sort interests
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filterState.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'score':
          comparison = a.score - b.score;
          break;
        case 'category':
          comparison = a.category.name.localeCompare(b.category.name);
          break;
      }

      return filterState.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered.slice(0, maxItems);
  }, [interests, filterState, minScore, maxItems]);

  // Get category color
  const getCategoryColor = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || 'gray';
  };

  // Get interest size based on score
  const getInterestSize = (score: number): string => {
    if (score >= 80) return 'text-lg px-4 py-2';
    if (score >= 60) return 'text-base px-3 py-2';
    if (score >= 40) return 'text-sm px-3 py-1';
    return 'text-xs px-2 py-1';
  };

  // Get interest opacity based on score
  const getInterestOpacity = (score: number): string => {
    if (score >= 80) return 'opacity-100';
    if (score >= 60) return 'opacity-90';
    if (score >= 40) return 'opacity-80';
    return 'opacity-70';
  };

  // Handle category filter toggle
  const toggleCategoryFilter = (categoryId: string) => {
    setFilterState(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
    onCategoryFilter?.(categoryId);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterState({
      categories: [],
      scoreRange: [0, 100],
      searchQuery: '',
      sortBy: 'score',
      sortOrder: 'desc'
    });
  };

  return (
    <Card className={cn("persona-result-card persona-animate-in", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary-600" />
              Nuage d'Intérêts
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredInterests.length} intérêts sur {interests.length}
            </p>
          </div>
          {interactive && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtres
              </Button>
              {(filterState.categories.length > 0 || filterState.searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Effacer
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && interactive && (
          <div className="space-y-4 pt-4 border-t">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un intérêt..."
                value={filterState.searchQuery}
                onChange={(e) => setFilterState(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="pl-10"
              />
            </div>

            {/* Category Filters */}
            {showCategories && (
              <div>
                <p className="text-sm font-medium mb-2">Catégories</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const IconComponent = ICON_MAP[category.icon];
                    const isActive = filterState.categories.includes(category.id);

                    return (
                      <button
                        key={category.id}
                        className="cursor-pointer transition-all duration-200 hover:scale-105 border-none bg-transparent p-0"
                        onClick={() => toggleCategoryFilter(category.id)}
                      >
                        <ModernBadge
                          variant={isActive ? 'default' : 'outline'}
                          className={cn(
                            isActive && `bg-${category.color}-100 text-${category.color}-800 dark:bg-${category.color}-900/20 dark:text-${category.color}-300`
                          )}
                          icon={IconComponent && <IconComponent className="h-3 w-3" />}
                        >
                          {category.name}
                        </ModernBadge>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {filteredInterests.length === 0 ? (
          <div className="text-center py-8">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              Aucun intérêt ne correspond aux filtres sélectionnés
            </p>
          </div>
        ) : (
          <TooltipProvider>
            <div className="flex flex-wrap gap-2 justify-center">
              {filteredInterests.map((interest, index) => {
                const categoryColor = getCategoryColor(interest.category.id);
                const size = getInterestSize(interest.score);
                const opacity = getInterestOpacity(interest.score);
                const IconComponent = ICON_MAP[interest.category.icon];
                const isSelected = selectedInterest?.id === interest.id;

                return (
                  <Tooltip key={interest.id}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "persona-animate-in transition-all duration-300 hover:scale-110 cursor-pointer relative",
                          opacity,
                          isSelected && "ring-2 ring-primary-500 ring-offset-2"
                        )}
                        style={{ animationDelay: `${index * 0.05}s` }}
                        onClick={() => {
                          setSelectedInterest(interest);
                          onInterestClick?.(interest);
                        }}
                        onMouseEnter={() => setHoveredInterest(interest)}
                        onMouseLeave={() => setHoveredInterest(null)}
                      >
                        <Badge
                          variant="secondary"
                          className={cn(
                            size,
                            "hover:shadow-lg transition-all duration-300 relative overflow-hidden",
                            colorScheme === 'category' && `bg-${categoryColor}-100 text-${categoryColor}-800 dark:bg-${categoryColor}-900/20 dark:text-${categoryColor}-300`,
                            colorScheme === 'score' && interest.score >= 80 && "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
                            colorScheme === 'score' && interest.score >= 60 && interest.score < 80 && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
                            colorScheme === 'score' && interest.score < 60 && "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
                            hoveredInterest?.id === interest.id && "shadow-xl transform scale-105"
                          )}
                        >
                          <span className="flex items-center gap-1.5">
                            {IconComponent && <IconComponent className="h-3 w-3" />}
                            {interest.name}
                            <span className="text-xs opacity-75 flex items-center gap-1">
                              {interest.score}%
                              {interest.confidence && interest.confidence > 0.8 && (
                                <Zap className="h-2 w-2" />
                              )}
                            </span>
                          </span>

                          {/* Hover overlay effect */}
                          {hoveredInterest?.id === interest.id && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                          )}
                        </Badge>

                        {/* Score indicator */}
                        <div
                          className={cn(
                            "absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800",
                            interest.score >= 80 ? "bg-green-500" :
                              interest.score >= 60 ? "bg-yellow-500" :
                                interest.score >= 40 ? "bg-orange-500" : "bg-red-500"
                          )}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {IconComponent && <IconComponent className="h-4 w-4" />}
                          <span className="font-semibold">{interest.name}</span>
                        </div>

                        <div className="text-sm space-y-1">
                          <div className="flex items-center justify-between">
                            <span>Score:</span>
                            <span className="font-medium">{interest.score}%</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span>Catégorie:</span>
                            <span className="font-medium">{interest.category.name}</span>
                          </div>

                          {interest.confidence && (
                            <div className="flex items-center justify-between">
                              <span>Confiance:</span>
                              <span className="font-medium">{Math.round(interest.confidence * 100)}%</span>
                            </div>
                          )}

                          {interest.source && (
                            <div className="flex items-center justify-between">
                              <span>Source:</span>
                              <span className="font-medium capitalize">{interest.source}</span>
                            </div>
                          )}
                        </div>

                        {interest.description && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground">
                              {interest.description}
                            </p>
                          </div>
                        )}

                        {interest.tags && interest.tags.length > 0 && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground mb-1">Tags:</p>
                            <div className="flex flex-wrap gap-1">
                              {interest.tags.slice(0, 3).map((tag, tagIndex) => (
                                <span
                                  key={tagIndex}
                                  className="text-xs px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                              {interest.tags.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{interest.tags.length - 3} plus
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
        )}

        {/* Selected Interest Detail Panel */}
        {selectedInterest && (
          <div className="mt-6 pt-4 border-t">
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {ICON_MAP[selectedInterest.category.icon] && (
                    <div className={cn(
                      "p-2 rounded-lg",
                      `bg-${getCategoryColor(selectedInterest.category.id)}-100 text-${getCategoryColor(selectedInterest.category.id)}-600 dark:bg-${getCategoryColor(selectedInterest.category.id)}-900/20 dark:text-${getCategoryColor(selectedInterest.category.id)}-400`
                    )}>
                      {React.createElement(ICON_MAP[selectedInterest.category.icon], { className: "h-5 w-5" })}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      {selectedInterest.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedInterest.category.name}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedInterest(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {selectedInterest.score}%
                  </div>
                  <div className="text-xs text-gray-500">Score</div>
                </div>

                {selectedInterest.confidence && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {Math.round(selectedInterest.confidence * 100)}%
                    </div>
                    <div className="text-xs text-gray-500">Confiance</div>
                  </div>
                )}

                {selectedInterest.source && (
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {selectedInterest.source}
                    </div>
                    <div className="text-xs text-gray-500">Source</div>
                  </div>
                )}

                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedInterest.score >= 80 ? 'Élevé' :
                      selectedInterest.score >= 60 ? 'Moyen' : 'Faible'}
                  </div>
                  <div className="text-xs text-gray-500">Niveau</div>
                </div>
              </div>

              {selectedInterest.description && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedInterest.description}
                  </p>
                </div>
              )}

              {selectedInterest.tags && selectedInterest.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Tags associés</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedInterest.tags.map((tag, index) => (
                      <ModernBadge key={index} variant="outline" size="sm">
                        {tag}
                      </ModernBadge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Statistics Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {filteredInterests.length}
              </div>
              <div className="text-xs text-gray-500">Intérêts affichés</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {filteredInterests.filter(i => i.score >= 80).length}
              </div>
              <div className="text-xs text-gray-500">Score élevé (80%+)</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                {Math.round(filteredInterests.reduce((sum, i) => sum + i.score, 0) / filteredInterests.length) || 0}%
              </div>
              <div className="text-xs text-gray-500">Score moyen</div>
            </div>

            <div className="text-center">
              <div className="text-lg font-bold text-secondary-600 dark:text-secondary-400">
                {new Set(filteredInterests.map(i => i.category.id)).size}
              </div>
              <div className="text-xs text-gray-500">Catégories</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        {showCategories && filteredInterests.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">Légende des catégories</p>
            <div className="flex flex-wrap gap-2">
              {categories
                .filter(category => filteredInterests.some(interest => interest.category.id === category.id))
                .map((category) => {
                  const IconComponent = ICON_MAP[category.icon];
                  const count = filteredInterests.filter(i => i.category.id === category.id).length;
                  return (
                    <div key={category.id} className="flex items-center gap-1">
                      {IconComponent && <IconComponent className="h-3 w-3" />}
                      <span className="text-xs text-muted-foreground">
                        {category.name} ({count})
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}