import React, { useState, useMemo } from 'react';
import { EnrichedPersona, EnhancedPersonaFilters, EnhancedSortOptions } from '@/types/enhanced-persona';
import { PersonaCard } from './PersonaCard';
import { EnhancedPersonaFiltersComponent } from './EnhancedPersonaFilters';
import {
  filterAndSortPersonas,
  getAvailableFilterOptions,
  getFilterStatistics,
  calculateCulturalRichness,
  getValidationScore
} from '@/lib/utils/enhanced-persona-filters';

interface EnhancedPersonaListProps {
  personas: EnrichedPersona[];
  onPersonaSelect: (persona: EnrichedPersona | null) => void;
  onPersonaDelete: (id: string) => void;
  selectedPersona?: EnrichedPersona | null;
  className?: string;
  showFilters?: boolean;
  defaultFilters?: EnhancedPersonaFilters;
  defaultSort?: EnhancedSortOptions;
}

export const EnhancedPersonaList: React.FC<EnhancedPersonaListProps> = ({
  personas,
  onPersonaSelect,
  onPersonaDelete,
  selectedPersona,
  className = '',
  showFilters = true,
  defaultFilters = {},
  defaultSort = { field: 'qualityScore', direction: 'desc' }
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<EnhancedPersonaFilters>(defaultFilters);
  const [sortOptions, setSortOptions] = useState<EnhancedSortOptions>(defaultSort);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter and sort personas
  const filteredAndSortedPersonas = useMemo(() => {
    return filterAndSortPersonas(personas, searchQuery, filters, sortOptions);
  }, [personas, searchQuery, filters, sortOptions]);

  // Get available filter options
  const availableOptions = useMemo(() => {
    return getAvailableFilterOptions(personas);
  }, [personas]);

  // Get filter statistics
  const statistics = useMemo(() => {
    return getFilterStatistics(personas, filteredAndSortedPersonas);
  }, [personas, filteredAndSortedPersonas]);

  const handlePersonaSelect = (persona: EnrichedPersona | null) => {
    if (!persona) {
      onPersonaSelect(null);
      return;
    }
    onPersonaSelect(selectedPersona?.id === persona.id ? null : persona);
  };

  const hasActiveFilters = () => {
    return searchQuery.trim() !== '' ||
      Object.keys(filters).some(key => filters[key as keyof EnhancedPersonaFilters] !== undefined);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with statistics and view controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <h2 className="text-2xl font-bold text-slate-900">
            Personas ({statistics.filtered})
          </h2>
          {statistics.filtered !== statistics.total && (
            <span className="text-sm text-slate-500">
              sur {statistics.total} total
            </span>
          )}

          {/* Mobile stats */}
          <div className="flex sm:hidden items-center space-x-3 text-xs text-slate-600">
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>{statistics.generationSourceStats['qloo-first']}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              <span>{statistics.generationSourceStats['legacy-fallback']}</span>
            </div>
            <span>Qual: {statistics.averageQualityScore}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end space-x-3">
          {/* Enhanced stats for larger screens */}
          <div className="hidden md:flex items-center space-x-4 text-sm text-slate-600">
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Qloo: {statistics.generationSourceStats['qloo-first']}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              <span>Legacy: {statistics.generationSourceStats['legacy-fallback']}</span>
            </div>
            <div className="text-slate-400">|</div>
            <span>Qualité: {statistics.averageQualityScore}%</span>
            <span>Validation: {statistics.averageValidationScore}%</span>
          </div>

          {/* Cultural richness distribution for xl screens */}
          <div className="hidden xl:flex items-center space-x-3 text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
            <span className="font-medium">Richesse:</span>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>{statistics.culturalRichnessStats?.high || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span>{statistics.culturalRichnessStats?.medium || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
              <span>{statistics.culturalRichnessStats?.low || 0}</span>
            </div>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
              title="Vue grille"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
              title="Vue liste"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Filters toggle */}
          {showFilters && (
            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showFiltersPanel || hasActiveFilters()
                ? 'bg-persona-violet text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              <svg className="w-4 h-4 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
              </svg>
              <span className="hidden sm:inline">Filtres</span>
              {hasActiveFilters() && (
                <span className="ml-1 sm:ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs bg-white/20 text-white">
                  {Object.keys(filters).length + (searchQuery ? 1 : 0)}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && showFiltersPanel && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          <EnhancedPersonaFiltersComponent
            filters={filters}
            sortOptions={sortOptions}
            onFiltersChange={setFilters}
            onSortChange={setSortOptions}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>
      )}

      {/* Quick search when filters panel is hidden */}
      {showFilters && !showFiltersPanel && (
        <div className="relative max-w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Recherche rapide..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-persona-violet/20 focus:border-persona-violet bg-white text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-slate-50 rounded-r-lg transition-colors"
              title="Effacer la recherche"
            >
              <svg className="h-4 w-4 text-slate-400 hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Active filters summary */}
      {hasActiveFilters() && (
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-sm font-medium text-slate-700 shrink-0">Filtres actifs:</span>

          <div className="flex flex-wrap items-center gap-2">
            {searchQuery && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-persona-violet text-white">
                <span className="hidden sm:inline">Recherche: </span>"{searchQuery.length > 20 ? searchQuery.substring(0, 20) + '...' : searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-2 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  title="Supprimer ce filtre"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}

            {filters.generationSource?.map(source => (
              <span key={source} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {source === 'qloo-first' ? '🎯 Qloo First' : '⚡ Legacy'}
                <button
                  onClick={() => {
                    const updated = filters.generationSource?.filter(s => s !== source);
                    setFilters({ ...filters, generationSource: updated?.length ? updated : undefined });
                  }}
                  className="ml-2 hover:bg-green-200 rounded-full p-0.5 transition-colors"
                  title="Supprimer ce filtre"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}

            {filters.culturalDataRichness?.map(richness => (
              <span key={richness} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {richness === 'high' ? '🎯 Élevée' : richness === 'medium' ? '📈 Moyenne' : '📊 Faible'}
                <button
                  onClick={() => {
                    const updated = filters.culturalDataRichness?.filter(r => r !== richness);
                    setFilters({ ...filters, culturalDataRichness: updated?.length ? updated : undefined });
                  }}
                  className="ml-2 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  title="Supprimer ce filtre"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}

            {filters.validationScore && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Validation: {filters.validationScore[0]}-{filters.validationScore[1]}%
                <button
                  onClick={() => setFilters({ ...filters, validationScore: undefined })}
                  className="ml-2 hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                  title="Supprimer ce filtre"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}

            {filters.qualityScore && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                Qualité: {filters.qualityScore[0]}-{filters.qualityScore[1]}%
                <button
                  onClick={() => setFilters({ ...filters, qualityScore: undefined })}
                  className="ml-2 hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
                  title="Supprimer ce filtre"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}

            <button
              onClick={() => {
                setFilters({});
                setSearchQuery('');
              }}
              className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors px-2 py-1 hover:bg-slate-200 rounded"
            >
              Effacer tout
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Personas Grid/List with improved layout */}
      {filteredAndSortedPersonas.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">
            {hasActiveFilters() ? 'Aucun persona trouvé' : 'Aucun persona disponible'}
          </h3>
          <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
            {hasActiveFilters()
              ? 'Essayez de modifier vos critères de recherche ou vos filtres.'
              : 'Commencez par créer vos premiers personas pour les voir apparaître ici.'
            }
          </p>
          {hasActiveFilters() && (
            <button
              onClick={() => {
                setFilters({});
                setSearchQuery('');
              }}
              className="mt-4 inline-flex items-center px-4 py-2 bg-persona-violet text-white rounded-lg hover:bg-persona-violet/90 transition-colors"
            >
              Effacer les filtres
            </button>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6'
            : 'space-y-2 sm:space-y-3'
        }>
          {filteredAndSortedPersonas.map((persona) => (
            <div
              key={persona.id}
              className={`group relative transition-all duration-300 ${viewMode === 'list'
                ? 'hover:bg-slate-50/80 rounded-xl p-2 sm:p-3 border border-transparent hover:border-slate-200/60 hover:shadow-sm'
                : 'hover:scale-[1.02] hover:shadow-2xl hover:shadow-slate-200/40 hover:-translate-y-1'
                }`}
            >
              <PersonaCard
                persona={persona}
                onSelect={handlePersonaSelect}
                onDelete={onPersonaDelete}
                isSelected={selectedPersona?.id === persona.id}
                showMetadata={true}
              />
            </div>
          ))}
        </div>
      )}

      {/* Enhanced footer with statistics */}
      {filteredAndSortedPersonas.length > 0 && (
        <div className="pt-6 sm:pt-8 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-slate-500 text-center sm:text-left">
              Affichage de {filteredAndSortedPersonas.length} persona{filteredAndSortedPersonas.length > 1 ? 's' : ''}
              {statistics.filtered !== statistics.total && ` sur ${statistics.total} total`}
            </p>

            {/* Additional stats for larger screens */}
            <div className="hidden sm:flex items-center space-x-4 text-xs text-slate-500">
              {statistics.averageValidationScore > 0 && (
                <span>Validation moyenne: {statistics.averageValidationScore}%</span>
              )}
              <span>Qualité moyenne: {statistics.averageQualityScore}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedPersonaList;