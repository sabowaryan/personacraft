'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Grid3X3, 
  List, 
  Search, 
  SortAsc, 
  SortDesc, 
  Filter,
  Music,
  Film,
  Book,
  ShoppingBag,
  Utensils,
  MapPin,
  Star,
  TrendingUp,
  Calendar,
  Globe,
  X,
  Eye,
  MoreHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  CulturalDataPoint, 
  CulturalDataGridConfig 
} from '@/lib/types/cultural-interests';
import { ModernBadge, CircularScore } from '@/components/ui/modern-elements';

interface CulturalDataGridProps {
  data: CulturalDataPoint[];
  config?: CulturalDataGridConfig;
  onItemClick?: (item: CulturalDataPoint) => void;
  className?: string;
}

interface GridFilterState {
  searchQuery: string;
  selectedTypes: string[];
  selectedCategories: string[];
  scoreRange: [number, number];
  sortBy: 'name' | 'score' | 'category' | 'type';
  sortOrder: 'asc' | 'desc';
}

const TYPE_ICONS: Record<string, React.ComponentType<any>> = {
  music: Music,
  movies: Film,
  books: Book,
  brands: ShoppingBag,
  food: Utensils,
  lifestyle: MapPin
};

const TYPE_COLORS: Record<string, string> = {
  music: 'purple',
  movies: 'blue',
  books: 'amber',
  brands: 'pink',
  food: 'orange',
  lifestyle: 'green'
};

export function CulturalDataGrid({
  data,
  config = {},
  onItemClick,
  className
}: CulturalDataGridProps) {
  const {
    groupBy = 'type',
    sortBy: defaultSortBy = 'score',
    showMetadata = true,
    compactView = false
  } = config;

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<CulturalDataPoint | null>(null);

  const [filterState, setFilterState] = useState<GridFilterState>({
    searchQuery: '',
    selectedTypes: [],
    selectedCategories: [],
    scoreRange: [0, 100],
    sortBy: defaultSortBy,
    sortOrder: 'desc'
  });

  // Get unique types and categories
  const availableTypes = useMemo(() => 
    Array.from(new Set(data.map(item => item.type))), [data]);
  
  const availableCategories = useMemo(() => 
    Array.from(new Set(data.map(item => item.category))), [data]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = data.filter(item => {
      // Search filter
      if (filterState.searchQuery && 
          !item.name.toLowerCase().includes(filterState.searchQuery.toLowerCase()) &&
          !item.category.toLowerCase().includes(filterState.searchQuery.toLowerCase())) {
        return false;
      }

      // Type filter
      if (filterState.selectedTypes.length > 0 && 
          !filterState.selectedTypes.includes(item.type)) {
        return false;
      }

      // Category filter
      if (filterState.selectedCategories.length > 0 && 
          !filterState.selectedCategories.includes(item.category)) {
        return false;
      }

      // Score range filter
      if (item.score < filterState.scoreRange[0] || 
          item.score > filterState.scoreRange[1]) {
        return false;
      }

      return true;
    });

    // Sort data
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
          comparison = a.category.localeCompare(b.category);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      
      return filterState.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [data, filterState]);

  // Group data
  const groupedData = useMemo(() => {
    return filteredData.reduce((groups, item) => {
      const key = groupBy === 'type' ? item.type : 
                  groupBy === 'category' ? item.category :
                  groupBy === 'score' ? getScoreGroup(item.score) : 'Autres';
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    }, {} as Record<string, CulturalDataPoint[]>);
  }, [filteredData, groupBy]);

  const getScoreGroup = (score: number): string => {
    if (score >= 80) return 'Excellent (80-100)';
    if (score >= 60) return 'Bon (60-79)';
    if (score >= 40) return 'Moyen (40-59)';
    return 'Faible (0-39)';
  };

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const handleItemClick = (item: CulturalDataPoint) => {
    setSelectedItem(item);
    onItemClick?.(item);
  };

  const clearFilters = () => {
    setFilterState({
      searchQuery: '',
      selectedTypes: [],
      selectedCategories: [],
      scoreRange: [0, 100],
      sortBy: defaultSortBy,
      sortOrder: 'desc'
    });
  };

  const toggleTypeFilter = (type: string) => {
    setFilterState(prev => ({
      ...prev,
      selectedTypes: prev.selectedTypes.includes(type)
        ? prev.selectedTypes.filter(t => t !== type)
        : [...prev.selectedTypes, type]
    }));
  };

  const toggleCategoryFilter = (category: string) => {
    setFilterState(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(category)
        ? prev.selectedCategories.filter(c => c !== category)
        : [...prev.selectedCategories, category]
    }));
  };

  const renderDataItem = (item: CulturalDataPoint, index: number) => {
    const IconComponent = TYPE_ICONS[item.type] || Star;
    const typeColor = TYPE_COLORS[item.type] || 'gray';
    const isSelected = selectedItem?.id === item.id;

    if (viewMode === 'list') {
      return (
        <div
          key={item.id}
          className={cn(
            "flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md",
            isSelected ? "border-primary-300 bg-primary-50 dark:bg-primary-900/20" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
            "persona-animate-in"
          )}
          style={{ animationDelay: `${index * 0.05}s` }}
          onClick={() => handleItemClick(item)}
        >
          <div className={cn(
            "p-2 rounded-lg",
            `bg-${typeColor}-100 text-${typeColor}-600 dark:bg-${typeColor}-900/20 dark:text-${typeColor}-400`
          )}>
            <IconComponent className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900 dark:text-white truncate">
                {item.name}
              </h4>
              <ModernBadge variant="outline" size="sm">
                {item.category}
              </ModernBadge>
            </div>
            {showMetadata && item.metadata && (
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                {item.metadata.genre && (
                  <span>Genre: {item.metadata.genre}</span>
                )}
                {item.metadata.year && (
                  <span>Année: {item.metadata.year}</span>
                )}
                {item.metadata.region && (
                  <span>Région: {item.metadata.region}</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <CircularScore 
              score={item.score} 
              size="sm" 
              color={item.score >= 80 ? 'success' : item.score >= 60 ? 'warning' : 'danger'}
            />
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    }

    // Grid view
    return (
      <Card
        key={item.id}
        className={cn(
          "cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
          isSelected ? "ring-2 ring-primary-500" : "",
          "persona-animate-in"
        )}
        style={{ animationDelay: `${index * 0.05}s` }}
        onClick={() => handleItemClick(item)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className={cn(
              "p-2 rounded-lg",
              `bg-${typeColor}-100 text-${typeColor}-600 dark:bg-${typeColor}-900/20 dark:text-${typeColor}-400`
            )}>
              <IconComponent className="h-5 w-5" />
            </div>
            <CircularScore 
              score={item.score} 
              size="sm" 
              color={item.score >= 80 ? 'success' : item.score >= 60 ? 'warning' : 'danger'}
            />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2">
              {item.name}
            </CardTitle>
            <ModernBadge variant="outline" size="sm" className="mt-2">
              {item.category}
            </ModernBadge>
          </div>
        </CardHeader>
        
        {showMetadata && item.metadata && !compactView && (
          <CardContent className="pt-0">
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              {item.metadata.genre && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Genre:</span>
                  <span>{item.metadata.genre}</span>
                </div>
              )}
              {item.metadata.year && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>{item.metadata.year}</span>
                </div>
              )}
              {item.metadata.region && (
                <div className="flex items-center gap-2">
                  <Globe className="h-3 w-3" />
                  <span>{item.metadata.region}</span>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <Card className={cn("persona-result-card persona-animate-in", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="h-5 w-5 text-primary-600" />
              Données Culturelles
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredData.length} éléments sur {data.length}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-3"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-3"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Filters Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtres
            </Button>

            {/* Clear Filters */}
            {(filterState.selectedTypes.length > 0 || 
              filterState.selectedCategories.length > 0 || 
              filterState.searchQuery) && (
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
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="space-y-4 pt-4 border-t">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans les données culturelles..."
                value={filterState.searchQuery}
                onChange={(e) => setFilterState(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type Filters */}
              <div>
                <p className="text-sm font-medium mb-2">Types</p>
                <div className="flex flex-wrap gap-2">
                  {availableTypes.map((type) => {
                    const IconComponent = TYPE_ICONS[type] || Star;
                    const isActive = filterState.selectedTypes.includes(type);
                    const typeColor = TYPE_COLORS[type] || 'gray';
                    
                    return (
                      <button
                        key={type}
                        className="cursor-pointer transition-all duration-200 hover:scale-105 border-none bg-transparent p-0"
                        onClick={() => toggleTypeFilter(type)}
                      >
                        <ModernBadge
                          variant={isActive ? 'default' : 'outline'}
                          className={cn(
                            isActive && `bg-${typeColor}-100 text-${typeColor}-800 dark:bg-${typeColor}-900/20 dark:text-${typeColor}-300`
                          )}
                          icon={<IconComponent className="h-3 w-3" />}
                        >
                          {type}
                        </ModernBadge>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category Filters */}
              <div>
                <p className="text-sm font-medium mb-2">Catégories</p>
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map((category) => {
                    const isActive = filterState.selectedCategories.includes(category);
                    
                    return (
                      <button
                        key={category}
                        className="cursor-pointer transition-all duration-200 hover:scale-105 border-none bg-transparent p-0"
                        onClick={() => toggleCategoryFilter(category)}
                      >
                        <ModernBadge
                          variant={isActive ? 'default' : 'outline'}
                        >
                          {category}
                        </ModernBadge>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Trier par:</span>
                <select
                  value={filterState.sortBy}
                  onChange={(e) => setFilterState(prev => ({ 
                    ...prev, 
                    sortBy: e.target.value as GridFilterState['sortBy']
                  }))}
                  className="text-sm border rounded px-2 py-1 bg-background"
                >
                  <option value="score">Score</option>
                  <option value="name">Nom</option>
                  <option value="category">Catégorie</option>
                  <option value="type">Type</option>
                </select>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterState(prev => ({ 
                  ...prev, 
                  sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
                }))}
                className="flex items-center gap-1"
              >
                {filterState.sortOrder === 'asc' ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
                {filterState.sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {filteredData.length === 0 ? (
          <div className="text-center py-8">
            <Grid3X3 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              Aucune donnée culturelle ne correspond aux filtres sélectionnés
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedData).map(([groupKey, items]) => (
              <div key={groupKey} className="space-y-3">
                {/* Group Header */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={() => toggleGroup(groupKey)}
                    className="flex items-center gap-2 p-0 h-auto font-semibold text-gray-900 dark:text-white"
                  >
                    {expandedGroups.has(groupKey) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    {groupKey} ({items.length})
                  </Button>
                </div>

                {/* Group Content */}
                {(expandedGroups.has(groupKey) || expandedGroups.size === 0) && (
                  <div className={cn(
                    viewMode === 'grid' 
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                      : "space-y-2"
                  )}>
                    {items.map((item, index) => renderDataItem(item, index))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}