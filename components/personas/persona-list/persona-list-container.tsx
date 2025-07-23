/**
 * PersonaListContainer - Main orchestration component for the persona list
 * Manages state, coordinates child components, and handles data flow
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { 
  PersonaListContainerProps,
  ViewPreferences,
  FilterState,
  Persona,
  BulkAction,
  PersonaMetrics
} from './types';

// Placeholder imports - will be implemented in subsequent tasks
// import { PersonaListHeader } from './persona-list-header';
// import { PersonaListContent } from './persona-list-content';
// import { PersonaListActions } from './persona-list-actions';
// import { PersonaListStates } from './persona-list-states';

export function PersonaListContainer({
  personas,
  loading,
  error,
  onPersonaSelect,
  onBulkAction,
  onRefresh,
  className
}: PersonaListContainerProps) {
  // State management for view preferences
  const [viewPreferences, setViewPreferences] = useState<ViewPreferences>({
    mode: 'detailed',
    cardSize: 'medium',
    visibleFields: [],
    sortBy: { field: 'createdAt', direction: 'desc', label: 'Date Created' },
    filtersApplied: {
      search: '',
      ageRange: [18, 65],
      locations: [],
      qualityScoreMin: 0,
      dateRange: null,
      tags: [],
      hasAvatar: null
    },
    showMetrics: true
  });

  // State for selected personas
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filtered and sorted personas based on current preferences
  const processedPersonas = useMemo(() => {
    let filtered = [...personas];
    const { filtersApplied, sortBy } = viewPreferences;

    // Apply search filter
    if (filtersApplied.search) {
      const searchTerm = filtersApplied.search.toLowerCase();
      filtered = filtered.filter(persona => 
        persona.name.toLowerCase().includes(searchTerm) ||
        persona.description.toLowerCase().includes(searchTerm) ||
        persona.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Apply age range filter
    filtered = filtered.filter(persona => 
      persona.age >= filtersApplied.ageRange[0] && 
      persona.age <= filtersApplied.ageRange[1]
    );

    // Apply location filter
    if (filtersApplied.locations.length > 0) {
      filtered = filtered.filter(persona => 
        filtersApplied.locations.includes(persona.location)
      );
    }

    // Apply quality score filter
    filtered = filtered.filter(persona => 
      persona.qualityScore >= filtersApplied.qualityScoreMin
    );

    // Apply tags filter
    if (filtersApplied.tags.length > 0) {
      filtered = filtered.filter(persona => 
        filtersApplied.tags.some(tag => persona.tags.includes(tag))
      );
    }

    // Apply avatar filter
    if (filtersApplied.hasAvatar !== null) {
      filtered = filtered.filter(persona => 
        filtersApplied.hasAvatar ? !!persona.avatar : !persona.avatar
      );
    }

    // Apply date range filter
    if (filtersApplied.dateRange) {
      const [startDate, endDate] = filtersApplied.dateRange;
      filtered = filtered.filter(persona => {
        const personaDate = new Date(persona.createdAt);
        return personaDate >= startDate && personaDate <= endDate;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const { field, direction } = sortBy;
      let aValue: any = a[field as keyof Persona];
      let bValue: any = b[field as keyof Persona];

      // Handle special cases for sorting
      if (field === 'createdAt' || field === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return direction === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [personas, viewPreferences]);

  // Calculate metrics
  const metrics = useMemo<PersonaMetrics>(() => {
    const totalPersonas = processedPersonas.length;
    const averageQualityScore = totalPersonas > 0 
      ? processedPersonas.reduce((sum, p) => sum + p.qualityScore, 0) / totalPersonas 
      : 0;

    // Calculate demographic breakdown
    const locationCounts = processedPersonas.reduce((acc, persona) => {
      acc[persona.location] = (acc[persona.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const locationDistribution = Object.entries(locationCounts).map(([location, count]) => ({
      location,
      count,
      percentage: (count / totalPersonas) * 100
    }));

    // Age distribution
    const ageRanges = ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'];
    const ageDistribution = ageRanges.map(range => {
      const [min, max] = range === '65+' ? [65, 100] : range.split('-').map(Number);
      const count = processedPersonas.filter(p => p.age >= min && (max ? p.age <= max : true)).length;
      return {
        range,
        count,
        percentage: totalPersonas > 0 ? (count / totalPersonas) * 100 : 0
      };
    });

    // Quality score distribution
    const qualityRanges = ['0-2', '2-4', '4-6', '6-8', '8-10'];
    const qualityScoreDistribution = qualityRanges.map(range => {
      const [min, max] = range.split('-').map(Number);
      const inRange = processedPersonas.filter(p => p.qualityScore >= min && p.qualityScore < max);
      const count = inRange.length;
      const averageScore = count > 0 ? inRange.reduce((sum, p) => sum + p.qualityScore, 0) / count : 0;
      
      return {
        range,
        count,
        percentage: totalPersonas > 0 ? (count / totalPersonas) * 100 : 0,
        averageScore
      };
    });

    return {
      totalPersonas,
      averageQualityScore,
      completionRate: 100, // Placeholder
      generationTrends: [], // Placeholder
      demographicBreakdown: {
        ageDistribution,
        locationDistribution,
        qualityScoreDistribution
      },
      performanceMetrics: {
        loadTime: 0,
        renderTime: 0,
        memoryUsage: 0,
        scrollPerformance: 60
      }
    };
  }, [processedPersonas]);

  // Event handlers
  const handleViewPreferencesChange = useCallback((preferences: Partial<ViewPreferences>) => {
    setViewPreferences(prev => ({ ...prev, ...preferences }));
  }, []);

  const handleFiltersChange = useCallback((filters: Partial<FilterState>) => {
    setViewPreferences(prev => ({
      ...prev,
      filtersApplied: { ...prev.filtersApplied, ...filters }
    }));
  }, []);

  const handleSelectionChange = useCallback((ids: Set<string>) => {
    setSelectedIds(ids);
  }, []);

  const handleBulkAction = useCallback((action: BulkAction, targetPersonas: Persona[]) => {
    onBulkAction(action, targetPersonas);
    // Clear selection after bulk action
    setSelectedIds(new Set());
  }, [onBulkAction]);

  // Get selected personas
  const selectedPersonas = useMemo(() => 
    processedPersonas.filter(persona => selectedIds.has(persona.id)),
    [processedPersonas, selectedIds]
  );

  // Render loading state
  if (loading) {
    return (
      <div className={cn('persona-list-container', className)}>
        {/* LoadingSkeletons component will be implemented in task 11 */}
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading personas...</div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={cn('persona-list-container', className)}>
        {/* ErrorState component will be implemented in task 11 */}
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-destructive">Error: {error}</div>
          {onRefresh && (
            <button 
              onClick={onRefresh}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // Render empty state
  if (processedPersonas.length === 0 && personas.length === 0) {
    return (
      <div className={cn('persona-list-container', className)}>
        {/* EmptyState component will be implemented in task 11 */}
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-muted-foreground">No personas found</div>
          <div className="text-sm text-muted-foreground">
            Create your first persona to get started
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('persona-list-container space-y-6', className)}>
      {/* Header with metrics, search, filters, and view controls */}
      {/* PersonaListHeader will be implemented in subsequent tasks */}
      <div className="persona-list-header">
        <div className="text-sm text-muted-foreground mb-4">
          Showing {processedPersonas.length} of {personas.length} personas
          {selectedIds.size > 0 && ` (${selectedIds.size} selected)`}
        </div>
      </div>

      {/* Main content area */}
      {/* PersonaListContent will be implemented in subsequent tasks */}
      <div className="persona-list-content">
        <div className="grid gap-4">
          {processedPersonas.map(persona => (
            <div 
              key={persona.id}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onPersonaSelect(persona)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{persona.name}</h3>
                  <p className="text-sm text-muted-foreground">{persona.description}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span>Age: {persona.age}</span>
                    <span>•</span>
                    <span>{persona.location}</span>
                    <span>•</span>
                    <span>Quality: {persona.qualityScore}/10</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={selectedIds.has(persona.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    const newSelection = new Set(selectedIds);
                    if (e.target.checked) {
                      newSelection.add(persona.id);
                    } else {
                      newSelection.delete(persona.id);
                    }
                    handleSelectionChange(newSelection);
                  }}
                  className="rounded"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selection toolbar and bulk actions */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-background border rounded-lg shadow-lg p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              {selectedIds.size} persona{selectedIds.size !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => handleBulkAction('export', selectedPersonas)}
              className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
            >
              Export
            </button>
            <button
              onClick={() => handleBulkAction('delete', selectedPersonas)}
              className="px-3 py-1 bg-destructive text-destructive-foreground rounded text-sm hover:bg-destructive/90"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm hover:bg-secondary/90"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}