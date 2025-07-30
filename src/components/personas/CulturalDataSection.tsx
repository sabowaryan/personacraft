import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CulturalData } from '@/types';
import { GenerationMetadata, CulturalDataVisualization } from '@/types/enhanced-persona';
import { Eye, EyeOff, ExternalLink } from 'lucide-react';

interface CulturalDataSectionProps {
  culturalData: CulturalData;
  metadata?: GenerationMetadata;
  showSource?: boolean;
  className?: string;
}

interface CulturalCategoryCardProps {
  category: string;
  items: string[];
  source?: string;
  confidence?: number;
  icon: string;
  isEmpty: boolean;
}

const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    music: '🎵',
    movies: '🎬',
    tv: '📺',
    books: '📚',
    brands: '🏷️',
    restaurants: '🍽️',
    travel: '✈️',
    fashion: '👗',
    beauty: '💄',
    food: '🍕',
    socialMedia: '📱',
    podcasts: '🎧',
    videoGames: '🎮',
    influencers: '⭐'
  };
  return icons[category] || '📋';
};

const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    music: 'Music',
    movies: 'Movies',
    tv: 'TV Shows',
    books: 'Books',
    brands: 'Brands',
    restaurants: 'Restaurants',
    travel: 'Travel',
    fashion: 'Fashion',
    beauty: 'Beauty',
    food: 'Food',
    socialMedia: 'Social Media',
    podcasts: 'Podcasts',
    videoGames: 'Video Games',
    influencers: 'Influencers'
  };
  return labels[category] || category.charAt(0).toUpperCase() + category.slice(1);
};

const SourceBadge: React.FC<{ source: string; confidence?: number }> = ({ source, confidence }) => {
  const getSourceConfig = (source: string) => {
    switch (source.toLowerCase()) {
      case 'qloo':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          label: 'Qloo',
          description: 'Data from Qloo API'
        };
      case 'fallback':
        return {
          bg: 'bg-amber-100',
          text: 'text-amber-800',
          label: 'Fallback',
          description: 'Generated using fallback system'
        };
      case 'mixed':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          label: 'Mixed',
          description: 'Combination of Qloo and fallback data'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          label: 'Unknown',
          description: 'Source unknown'
        };
    }
  };

  const config = getSourceConfig(source);

  return (
    <div className="flex items-center gap-2">
      <Badge className={cn('text-xs', config.bg, config.text)}>
        {config.label}
      </Badge>
      {confidence !== undefined && (
        <span className="text-xs text-gray-500">
          {Math.round(confidence * 100)}%
        </span>
      )}
    </div>
  );
};

const ConfidenceMeter: React.FC<{ confidence: number }> = ({ confidence }) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-300', getConfidenceColor(confidence))}
          style={{ width: `${confidence * 100}%` }}
        />
      </div>
      <span className="text-xs text-gray-600">
        {Math.round(confidence * 100)}%
      </span>
    </div>
  );
};

const CulturalCategoryCard: React.FC<CulturalCategoryCardProps> = ({
  category,
  items,
  source = 'unknown',
  confidence = 0,
  icon,
  isEmpty
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayItems = isExpanded ? items : items.slice(0, 6);
  const hasMoreItems = items.length > 6;

  if (isEmpty) {
    return (
      <Card className="bg-gray-50 border-dashed">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl opacity-50" role="img" aria-label={category}>
                {icon}
              </span>
              <h4 className="font-medium text-gray-500">{getCategoryLabel(category)}</h4>
            </div>
          </div>
          <p className="text-sm text-gray-400">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-slate-200 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label={category}>
              {icon}
            </span>
            <h4 className="font-semibold text-slate-900">{getCategoryLabel(category)}</h4>
            <Badge className="text-xs bg-slate-100 text-slate-600">
              {items.length}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <SourceBadge source={source} confidence={confidence} />
          </div>
        </div>

        {confidence > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Confidence</span>
              <span>{Math.round(confidence * 100)}%</span>
            </div>
            <ConfidenceMeter confidence={confidence} />
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          {displayItems.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm hover:bg-slate-200 transition-colors"
            >
              {item}
            </span>
          ))}
        </div>

        {hasMoreItems && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center gap-1 text-slate-600 hover:text-slate-900"
          >
            {isExpanded ? (
              <>
                <EyeOff className="h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Show {items.length - 6} More
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const calculateCulturalRichness = (culturalData: CulturalData): 'low' | 'medium' | 'high' => {
  const totalItems = Object.values(culturalData).flat().length;
  const categoriesWithData = Object.values(culturalData).filter(items => items && items.length > 0).length;
  
  // Calculate richness based on total items and category coverage
  const richnesScore = (totalItems * 0.7) + (categoriesWithData * 5);
  
  if (richnesScore >= 50) return 'high';
  if (richnesScore >= 25) return 'medium';
  return 'low';
};

const RichnessIndicator: React.FC<{ richness: 'low' | 'medium' | 'high'; totalItems: number; categoriesWithData: number }> = ({
  richness,
  totalItems,
  categoriesWithData
}) => {
  const getRichnessConfig = (richness: string) => {
    switch (richness) {
      case 'high':
        return {
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: '🌟',
          label: 'High Richness',
          description: 'Comprehensive cultural data across multiple categories'
        };
      case 'medium':
        return {
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: '⭐',
          label: 'Medium Richness',
          description: 'Good cultural data coverage with room for improvement'
        };
      default:
        return {
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: '📊',
          label: 'Low Richness',
          description: 'Limited cultural data - consider regenerating'
        };
    }
  };

  const config = getRichnessConfig(richness);

  return (
    <div className={cn('rounded-lg p-4 border', config.bg, config.border)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl" role="img" aria-label="richness">
            {config.icon}
          </span>
          <span className={cn('font-semibold', config.color)}>
            {config.label}
          </span>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">
            {totalItems} items • {categoriesWithData} categories
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600">
        {config.description}
      </p>
    </div>
  );
};

export const CulturalDataSection: React.FC<CulturalDataSectionProps> = ({
  culturalData,
  metadata,
  showSource = true,
  className
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Calculate cultural data statistics
  const totalItems = Object.values(culturalData).flat().length;
  const categoriesWithData = Object.values(culturalData).filter(items => items && items.length > 0).length;
  const richness = calculateCulturalRichness(culturalData);
  
  // Determine source indicator
  const sourceIndicator = metadata?.qlooDataUsed ? 'qloo' : 'fallback';

  // Prepare categories for display
  const categories = Object.entries(culturalData).map(([category, items]) => ({
    category,
    items: items || [],
    isEmpty: !items || items.length === 0,
    icon: getCategoryIcon(category)
  }));

  // Sort categories: non-empty first, then by item count
  const sortedCategories = categories.sort((a, b) => {
    if (a.isEmpty && !b.isEmpty) return 1;
    if (!a.isEmpty && b.isEmpty) return -1;
    return b.items.length - a.items.length;
  });

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="cultural data">
              🌍
            </span>
            Cultural Data
          </CardTitle>
          <div className="flex items-center gap-2">
            {showSource && metadata && (
              <SourceBadge 
                source={sourceIndicator} 
                confidence={metadata.cacheHitRate}
              />
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Richness indicator */}
        <RichnessIndicator
          richness={richness}
          totalItems={totalItems}
          categoriesWithData={categoriesWithData}
        />

        {/* Cultural data categories */}
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-4'
        )}>
          {sortedCategories.map(({ category, items, isEmpty, icon }) => (
            <CulturalCategoryCard
              key={category}
              category={category}
              items={items}
              source={sourceIndicator}
              confidence={metadata?.cacheHitRate}
              icon={icon}
              isEmpty={isEmpty}
            />
          ))}
        </div>

        {/* Generation metadata */}
        {metadata && showSource && (
          <div className="bg-slate-50 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-3">Generation Details</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-slate-600">Source</div>
                <div className="font-medium">
                  {metadata.qlooDataUsed ? 'Qloo API' : 'Fallback System'}
                </div>
              </div>
              <div>
                <div className="text-slate-600">Processing Time</div>
                <div className="font-medium">{metadata.processingTime}ms</div>
              </div>
              <div>
                <div className="text-slate-600">Cache Hit Rate</div>
                <div className="font-medium">
                  {metadata.cacheHitRate ? `${Math.round(metadata.cacheHitRate * 100)}%` : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-slate-600">Cultural Constraints</div>
                <div className="font-medium">
                  {metadata.culturalConstraintsUsed.length || 'None'}
                </div>
              </div>
            </div>
            
            {metadata.fallbackReason && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded">
                <div className="text-sm">
                  <span className="font-medium text-amber-800">Fallback Reason:</span>
                  <span className="text-amber-700 ml-1">{metadata.fallbackReason}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {totalItems === 0 && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4" role="img" aria-label="no data">
              📭
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Cultural Data Available
            </h3>
            <p className="text-gray-600 mb-4">
              This persona doesn't have cultural data. Consider regenerating with the enhanced system.
            </p>
            <Button variant="outline" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Regenerate Persona
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CulturalDataSection;